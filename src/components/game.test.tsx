import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { STORAGE_KEY } from "@/lib/score-store";
import { Game } from "./game";

const squares = () => screen.getAllByRole("button", { name: /^row \d/i });
const status = () => screen.getByRole("status");
const tally = (name: string) =>
  within(screen.getByRole("group", { name })).getByTestId("count");

async function play(user: ReturnType<typeof userEvent.setup>, moves: number[]) {
  for (const i of moves) await user.click(squares()[i]);
}

// X: 0,1,2 — O: 3,4
const X_WINS_TOP_ROW = [0, 3, 1, 4, 2];
// X O X / X O O / O X X
const DRAW = [0, 1, 2, 4, 3, 5, 7, 6, 8];

describe("Game", () => {
  it("renders an empty 3x3 board with X to move", () => {
    render(<Game />);
    expect(squares()).toHaveLength(9);
    squares().forEach((sq) => expect(sq).toHaveAccessibleName(/empty$/));
    expect(status()).toHaveTextContent("X's turn");
  });

  it("alternates turns and locks filled squares", async () => {
    const user = userEvent.setup();
    render(<Game />);
    await play(user, [4]);
    expect(squares()[4]).toHaveTextContent("X");
    expect(squares()[4]).toBeDisabled();
    expect(status()).toHaveTextContent("O's turn");

    await play(user, [0]);
    expect(squares()[0]).toHaveTextContent("O");
    expect(status()).toHaveTextContent("X's turn");
  });

  it("announces the winner, highlights the line, and ends the game", async () => {
    const user = userEvent.setup();
    render(<Game />);
    await play(user, X_WINS_TOP_ROW);

    expect(status()).toHaveTextContent("X wins!");
    [0, 1, 2].forEach((i) =>
      expect(squares()[i]).toHaveAttribute("data-winning", "true"),
    );
    expect(squares()[3]).not.toHaveAttribute("data-winning");
    squares().forEach((sq) => expect(sq).toBeDisabled());
    expect(tally("X wins")).toHaveTextContent("1");
    expect(tally("O wins")).toHaveTextContent("0");
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
    await play(user, X_WINS_TOP_ROW);
    await user.click(screen.getByRole("button", { name: "New Game" }));

    squares().forEach((sq) => {
      expect(sq).toHaveAccessibleName(/empty$/);
      expect(sq).toBeEnabled();
    });
    expect(status()).toHaveTextContent("X's turn");
    expect(tally("X wins")).toHaveTextContent("1");
  });

  it("counts results across several games", async () => {
    const user = userEvent.setup();
    render(<Game />);
    await play(user, X_WINS_TOP_ROW);
    await user.click(screen.getByRole("button", { name: "New Game" }));
    await play(user, DRAW);
    await user.click(screen.getByRole("button", { name: "New Game" }));
    // O wins the left column: X 1,2,4 — O 0,3,6
    await play(user, [1, 0, 2, 3, 4, 6]);

    expect(tally("X wins")).toHaveTextContent("1");
    expect(tally("O wins")).toHaveTextContent("1");
    expect(tally("Draws")).toHaveTextContent("1");
  });

  it("Reset Scores sets every tally back to zero", async () => {
    const user = userEvent.setup();
    render(<Game />);
    await play(user, X_WINS_TOP_ROW);
    await user.click(screen.getByRole("button", { name: "Reset Scores" }));
    expect(tally("X wins")).toHaveTextContent("0");
    expect(tally("O wins")).toHaveTextContent("0");
    expect(tally("Draws")).toHaveTextContent("0");
  });

  it("persists the score across a reload", async () => {
    const user = userEvent.setup();
    const { unmount } = render(<Game />);
    await play(user, X_WINS_TOP_ROW);
    unmount();

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!)).toEqual({
      X: 1,
      O: 0,
      draws: 0,
    });

    render(<Game />);
    expect(tally("X wins")).toHaveTextContent("1");
    expect(status()).toHaveTextContent("X's turn");
  });
});
