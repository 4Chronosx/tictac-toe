"use client";

import { Volume2, VolumeX } from "lucide-react";
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
import { type Sfx, playSfx, useMuted } from "@/lib/sound";
import { Board } from "./board";
import { PLAYER_META } from "./marks";
import { Scoreboard } from "./scoreboard";

export function Game() {
  const [board, setBoard] = useState(EMPTY_BOARD);
  const [score, setScore] = useScore();
  const [muted, setMuted] = useMuted();

  const outcome = getOutcome(board);
  const turn = outcome ? null : nextPlayer(board);

  const sfx = (name: Sfx) => {
    if (!muted) playSfx(name);
  };

  // The score is updated in the click handler (not an effect) so each game is
  // counted exactly once, even under Strict Mode's double-invoked effects.
  function handleSelect(index: number) {
    const next = playMove(board, index);
    if (next === board) return;
    setBoard(next);
    const result = getOutcome(next);
    if (result) {
      setScore(applyResult(score, result));
      sfx(result.type);
    } else {
      sfx("place");
    }
  }

  function handleNewGame() {
    setBoard(EMPTY_BOARD);
    sfx("start");
  }

  const featured = turn ?? (outcome?.type === "win" ? outcome.winner : null);
  const FeaturedIcon = featured ? PLAYER_META[featured].Icon : null;
  const message = turn
    ? `${PLAYER_META[turn].name}'s turn`
    : outcome?.type === "win"
      ? `${PLAYER_META[outcome.winner].name} wins!`
      : "It's a draw";

  return (
    <div className="flex w-full flex-col items-center gap-5">
      <Scoreboard score={score} turn={turn} />

      <p
        role="status"
        aria-live="polite"
        className="status-banner flex min-h-11 items-center gap-3 px-4 py-2"
      >
        {FeaturedIcon && <FeaturedIcon className="size-5 shrink-0" />}
        <span>{message}</span>
      </p>

      <Board
        board={board}
        winningLine={outcome?.type === "win" ? outcome.line : null}
        locked={outcome !== null}
        onSelect={handleSelect}
      />

      <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
        <Button className="pixel-btn pixel-btn-go" onClick={handleNewGame}>
          New Game
        </Button>
        <Button
          className="pixel-btn pixel-btn-stop"
          onClick={() => setScore(EMPTY_SCORE)}
        >
          Reset Scores
        </Button>
        <Button
          aria-label="Sound"
          aria-pressed={!muted}
          title={muted ? "Sound off" : "Sound on"}
          className="pixel-btn pixel-btn-neutral"
          onClick={() => setMuted(!muted)}
        >
          {muted ? <VolumeX className="size-4" /> : <Volume2 className="size-4" />}
        </Button>
      </div>
    </div>
  );
}
