import type { Player, Score } from "@/lib/game";
import { cn } from "@/lib/utils";

type ScoreboardProps = {
  score: Score;
  /** Player whose turn it is, or null when the game is over. */
  turn: Player | null;
};

export function Scoreboard({ score, turn }: ScoreboardProps) {
  const tiles = [
    { label: "X wins", mark: "X", value: score.X, active: turn === "X", tone: "text-sky-600 dark:text-sky-400" },
    { label: "Draws", mark: "Draws", value: score.draws, active: false, tone: "text-muted-foreground" },
    { label: "O wins", mark: "O", value: score.O, active: turn === "O", tone: "text-rose-600 dark:text-rose-400" },
  ];

  return (
    <div className="grid w-full max-w-xs grid-cols-3 gap-2 sm:max-w-sm sm:gap-3">
      {tiles.map((tile) => (
        <div
          key={tile.label}
          role="group"
          aria-label={tile.label}
          data-active={tile.active || undefined}
          className={cn(
            "flex flex-col items-center rounded-xl border bg-card px-2 py-3 transition-colors",
            tile.active && "border-primary ring-3 ring-primary/20",
          )}
        >
          <span className={cn("text-sm font-semibold", tile.tone)}>{tile.mark}</span>
          <span data-testid="count" className="text-2xl font-bold tabular-nums">
            {tile.value}
          </span>
        </div>
      ))}
    </div>
  );
}
