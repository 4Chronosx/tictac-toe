import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { STORAGE_KEY } from "@/lib/score-store";
import { MUTED_KEY, playSfx } from "@/lib/sound";
import { Game } from "./game";

vi.mock("@/lib/sound", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/sound")>()),
  playSfx: vi.fn(),
}));

const squares = () => screen.getAllByRole("button", { name: /^row \d/i });
const status = () => screen.getByRole("status");
const tally = (name: string) =>
  within(screen.getByRole("group", { name })).getByTestId("count");
const soundToggle = () => screen.getByRole("button", { name: "Sound" });

async function play(user: ReturnType<typeof userEvent.setup>, moves: number[]) {
  for (const i of moves) await user.click(squares()[i]);
}

// Heart (X): 0,1,2 — Coin (O): 3,4
const HEART_WINS_TOP_ROW = [0, 3, 1, 4, 2];
// X O X / X O O / O X X
const DRAW = [0, 1, 2, 4, 3, 5, 7, 6, 8];

beforeEach(() => {
  vi.mocked(playSfx).mockClear();
});

describe("Game", () => {
  it("renders an empty 3x3 board with Heart to move", () => {
    render(<Game />);
    expect(squares()).toHaveLength(9);
    squares().forEach((sq) => expect(sq).toHaveAccessibleName(/empty$/));
    expect(status()).toHaveTextContent("Heart's turn");
  });

  it("alternates turns and locks filled squares", async () => {
    const user = userEvent.setup();
    render(<Game />);
    await play(user, [4]);
    expect(squares()[4]).toHaveAccessibleName("Row 2, column 2, Heart");
    expect(squares()[4]).toHaveAttribute("data-mark", "X");
    expect(squares()[4]).toBeDisabled();
    expect(status()).toHaveTextContent("Coin's turn");

    await play(user, [0]);
    expect(squares()[0]).toHaveAccessibleName("Row 1, column 1, Coin");
    expect(status()).toHaveTextContent("Heart's turn");
  });

  it("announces the winner, highlights the line, and ends the game", async () => {
    const user = userEvent.setup();
    render(<Game />);
    await play(user, HEART_WINS_TOP_ROW);

    expect(status()).toHaveTextContent("Heart wins!");
    [0, 1, 2].forEach((i) =>
      expect(squares()[i]).toHaveAttribute("data-winning", "true"),
    );
    expect(squares()[3]).not.toHaveAttribute("data-winning");
    squares().forEach((sq) => expect(sq).toBeDisabled());
    expect(tally("Heart wins")).toHaveTextContent("1");
    expect(tally("Coin wins")).toHaveTextContent("0");
  });

  it("announces a draw and counts it", async () => {
    const user = userEvent.setup();
    render(<Game />);
    await play(user, DRAW);
    expect(status()).toHaveTextContent("It's a draw");
    expect(tally("Draws")).toHaveTextContent("1");
  });

  it("New Game clears the board but keeps the score", async () => {
    const user = userEvent.setup();
    render(<Game />);
    await play(user, HEART_WINS_TOP_ROW);
    await user.click(screen.getByRole("button", { name: "New Game" }));

    squares().forEach((sq) => {
      expect(sq).toHaveAccessibleName(/empty$/);
      expect(sq).toBeEnabled();
    });
    expect(status()).toHaveTextContent("Heart's turn");
    expect(tally("Heart wins")).toHaveTextContent("1");
  });

  it("counts results across several games", async () => {
    const user = userEvent.setup();
    render(<Game />);
    await play(user, HEART_WINS_TOP_ROW);
    await user.click(screen.getByRole("button", { name: "New Game" }));
    await play(user, DRAW);
    await user.click(screen.getByRole("button", { name: "New Game" }));
    // Coin wins the left column: X 1,2,4 — O 0,3,6
    await play(user, [1, 0, 2, 3, 4, 6]);

    expect(tally("Heart wins")).toHaveTextContent("1");
    expect(tally("Coin wins")).toHaveTextContent("1");
    expect(tally("Draws")).toHaveTextContent("1");
  });

  it("Reset Scores sets every tally back to zero", async () => {
    const user = userEvent.setup();
    render(<Game />);
    await play(user, HEART_WINS_TOP_ROW);
    await user.click(screen.getByRole("button", { name: "Reset Scores" }));
    expect(tally("Heart wins")).toHaveTextContent("0");
    expect(tally("Coin wins")).toHaveTextContent("0");
    expect(tally("Draws")).toHaveTextContent("0");
  });

  it("persists the score across a reload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Game />);
    await play(user, HEART_WINS_TOP_ROW);
    unmount();

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual({
      X: 1,
      O: 0,
      draws: 0,
    });

    render(<Game />);
    expect(tally("Heart wins")).toHaveTextContent("1");
    expect(status()).toHaveTextContent("Heart's turn");
  });
});

describe("Game sound", () => {
  it("plays a cue for moves, wins and new games", async () => {
    const user = userEvent.setup();
    render(<Game />);
    await play(user, [0, 3, 1, 4]);
    expect(vi.mocked(playSfx).mock.calls).toEqual([
      ["place"],
      ["place"],
      ["place"],
      ["place"],
    ]);

    await play(user, [2]);
    expect(playSfx).toHaveBeenLastCalledWith("win");

    await user.click(screen.getByRole("button", { name: "New Game" }));
    expect(playSfx).toHaveBeenLastCalledWith("start");
  });

  it("plays the draw cue on a draw", async () => {
    const user = userEvent.setup();
    render(<Game />);
    await play(user, DRAW);
    expect(playSfx).toHaveBeenLastCalledWith("draw");
  });

  it("does not play a cue for an ignored click", async () => {
    const user = userEvent.setup();
    render(<Game />);
    await play(user, HEART_WINS_TOP_ROW);
    vi.mocked(playSfx).mockClear();
    // Board is locked after the win; clicking an empty square does nothing.
    await user.click(squares()[8]);
    expect(playSfx).not.toHaveBeenCalled();
  });

  it("the toggle mutes all cues and remembers the choice", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Game />);
    expect(soundToggle()).toHaveAttribute("aria-pressed", "true");

    await user.click(soundToggle());
    expect(soundToggle()).toHaveAttribute("aria-pressed", "false");
    expect(window.localStorage.getItem(MUTED_KEY)).toBe("1");

    await play(user, HEART_WINS_TOP_ROW);
    await user.click(screen.getByRole("button", { name: "New Game" }));
    expect(playSfx).not.toHaveBeenCalled();

    unmount();
    render(<Game />);
    expect(soundToggle()).toHaveAttribute("aria-pressed", "false");
  });
});
