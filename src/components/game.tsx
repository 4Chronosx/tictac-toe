"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  EMPTY_BOARD,
  EMPTY_SCORE,
  applyResult,
  getOutcome,
  nextPlayer,
  playMove,
} from "@/lib/game";
import { useScore } from "@/lib/score-store";
import { Board } from "./board";
import { Scoreboard } from "./scoreboard";

export function Game() {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [score, setScore] = useScore();

  const outcome = getOutcome(board);
  const turn = outcome ? null : nextPlayer(board);

  // The score is updated in the click handler (not an effect) so each game is
  // counted exactly once, even under Strict Mode's double-invoked effects.
  function handleSelect(index: number) {
    const next = playMove(board, index);
    if (next === board) return;
    setBoard(next);
    const result = getOutcome(next);
    if (result) setScore(applyResult(score, result));
  }

  const message = !outcome
    ? `${turn}'s turn`
    : outcome.type === "win"
      ? `${outcome.winner} wins!`
      : "It's a draw";

  return (
    <div className="flex w-full flex-col items-center gap-6">
      <Scoreboard score={score} turn={turn} />

      <p
        role="status"
        aria-live="polite"
        className="text-xl font-semibold tracking-tight"
      >
        {message}
      </p>

      <Board
        board={board}
        winningLine={outcome?.type === "win" ? outcome.line : null}
        locked={outcome !== null}
        onSelect={handleSelect}
      />

      <div className="flex gap-3">
        <Button size="lg" onClick={() => setBoard(EMPTY_BOARD)}>
          New Game
        </Button>
        <Button size="lg" variant="outline" onClick={() => setScore(EMPTY_SCORE)}>
          Reset Scores
        </Button>
      </div>
    </div>
  );
}
