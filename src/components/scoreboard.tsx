import type { ReactNode } from "react";
import type { Player, Score } from "@/lib/game";
import { PLAYER_META } from "./marks";

type ScoreboardProps = {
  score: Score;
  /** Player whose turn it is, or null when the game is over. */
  turn: Player | null;
};

export function Scoreboard({ score, turn }: ScoreboardProps) {
  const tile = (player: Player) => {
    const { name, Icon } = PLAYER_META[player];
    return {
      label: `${name} wins`,
      icon: <Icon className="size-7" />,
      value: score[player],
      active: turn === player,
    };
  };

  const tiles: { label: string; icon: ReactNode; value: number; active: boolean }[] = [
    tile("X"),
    {
      label: "Draws",
      icon: <span className="font-pixel text-[0.6rem] leading-7">DRAW</span>,
      value: score.draws,
      active: false,
    },
    tile("O"),
  ];

  return (
    <div className="grid w-full max-w-68 grid-cols-3 gap-3 sm:max-w-xs">
      {tiles.map((t) => (
        <div
          key={t.label}
          role="group"
          aria-label={t.label}
          data-active={t.active || undefined}
          className="hud-tile flex flex-col items-center gap-1.5 px-2 py-2"
        >
          <span className="flex h-7 items-center">{t.icon}</span>
          <span data-testid="count" className="font-pixel text-base tabular-nums">
            {t.value}
          </span>
        </div>
      ))}
    </div>
  );
}
