import type { Board as BoardState, Line } from "@/lib/game";
import { Square } from "./square";

type BoardProps = {
  board: BoardState;
  winningLine: Line | null;
  locked: boolean;
  onSelect: (index: number) => void;
};

export function Board({ board, winningLine, locked, onSelect }: BoardProps) {
  return (
    <div
      role="group"
      aria-label="Tic-Tac-Toe board"
      className="grid w-full max-w-68 grid-cols-3 gap-3 sm:max-w-xs"
    >
      {board.map((value, index) => (
        <Square
          key={index}
          index={index}
          value={value}
          winning={winningLine?.includes(index) ?? false}
          disabled={locked || value !== null}
          onSelect={onSelect}
        />
      ))}
    </div>
  );
}
