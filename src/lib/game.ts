export type Player = "X" | "O";
export type Cell = Player | null;
export type Board = readonly Cell[];
export type Line = readonly [number, number, number];

export type Outcome =
  | { type: "win"; winner: Player; line: Line }
  | { type: "draw" };

export type Score = { readonly X: number; readonly O: number; readonly draws: number };

export const BOARD_SIZE = 9;
export const EMPTY_BOARD: Board = Array<Cell>(BOARD_SIZE).fill(null);
export const EMPTY_SCORE: Score = { X: 0, O: 0, draws: 0 };

export const WINNING_LINES: readonly Line[] = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

/** X always opens, so the turn is derived from how many marks are on the board. */
export function nextPlayer(board: Board): Player {
  const filled = board.filter((cell) => cell !== null).length;
  return filled % 2 === 0 ? "X" : "O";
}

export function getOutcome(board: Board): Outcome | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    const mark = board[a];
    if (mark && mark === board[b] && mark === board[c]) {
      return { type: "win", winner: mark, line };
    }
  }
  return board.every((cell) => cell !== null) ? { type: "draw" } : null;
}

/** Returns a new board with the move applied, or the same board if the move is illegal. */
export function playMove(board: Board, index: number): Board {
  const inRange = Number.isInteger(index) && index >= 0 && index < BOARD_SIZE;
  if (!inRange || board[index] !== null || getOutcome(board) !== null) {
    return board;
  }
  const next = [...board];
  next[index] = nextPlayer(board);
  return next;
}

export function applyResult(score: Score, outcome: Outcome): Score {
  return outcome.type === "draw"
    ? { ...score, draws: score.draws + 1 }
    : { ...score, [outcome.winner]: score[outcome.winner] + 1 };
}
