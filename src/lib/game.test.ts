import { describe, expect, it } from "vitest";
import {
  type Board,
  type Cell,
  EMPTY_BOARD,
  EMPTY_SCORE,
  WINNING_LINES,
  applyResult,
  getOutcome,
  nextPlayer,
  playMove,
} from "./game";

const board = (cells: string): Board =>
  cells.split("").map((c) => (c === "X" || c === "O" ? c : null));

describe("nextPlayer", () => {
  it("starts with X", () => {
    expect(nextPlayer(EMPTY_BOARD)).toBe("X");
  });

  it("alternates based on move count", () => {
    expect(nextPlayer(board("X........"))).toBe("O");
    expect(nextPlayer(board("XO......."))).toBe("X");
  });
});

describe("getOutcome", () => {
  it("is null for an empty board", () => {
    expect(getOutcome(EMPTY_BOARD)).toBeNull();
  });

  it("is null mid-game", () => {
    expect(getOutcome(board("XO.X.O..."))).toBeNull();
  });

  it.each(WINNING_LINES.map((line) => [line]))(
    "detects a win on line %j",
    (line) => {
      const cells: Cell[] = [...EMPTY_BOARD];
      for (const i of line) cells[i] = "O";
      expect(getOutcome(cells)).toEqual({ type: "win", winner: "O", line });
    },
  );

  it("detects a draw on a full board with no winner", () => {
    expect(getOutcome(board("XOXXOOOXX"))).toEqual({ type: "draw" });
  });

  it("prefers a win over a draw when the last move fills the board", () => {
    expect(getOutcome(board("XOXOXOOXX"))).toMatchObject({
      type: "win",
      winner: "X",
    });
  });
});

describe("playMove", () => {
  it("places the current player's mark without mutating input", () => {
    const before = [...EMPTY_BOARD];
    const after = playMove(before, 4);
    expect(after[4]).toBe("X");
    expect(before[4]).toBeNull();
  });

  it("ignores a move on an occupied cell", () => {
    const b = board("X........");
    expect(playMove(b, 0)).toBe(b);
  });

  it("ignores a move after the game is over", () => {
    const b = board("XXXOO....");
    expect(playMove(b, 8)).toBe(b);
  });

  it("ignores out-of-range indices", () => {
    expect(playMove(EMPTY_BOARD, 9)).toBe(EMPTY_BOARD);
    expect(playMove(EMPTY_BOARD, -1)).toBe(EMPTY_BOARD);
  });
});

describe("applyResult", () => {
  it("increments the winner", () => {
    const line = [0, 1, 2] as const;
    expect(applyResult(EMPTY_SCORE, { type: "win", winner: "X", line })).toEqual(
      { X: 1, O: 0, draws: 0 },
    );
  });

  it("increments draws without mutating input", () => {
    const score = { X: 2, O: 1, draws: 0 };
    expect(applyResult(score, { type: "draw" })).toEqual({
      X: 2,
      O: 1,
      draws: 1,
    });
    expect(score.draws).toBe(0);
  });
});
