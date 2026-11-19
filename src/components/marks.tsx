import type { ComponentType } from "react";
import type { Player } from "@/lib/game";
import { cn } from "@/lib/utils";

/** A sprite is a grid of palette keys; "." is a transparent pixel. */
export type Sprite = {
  rows: readonly string[];
  palette: Readonly<Record<string, string>>;
};

export const HEART: Sprite = {
  rows: [
    ".KK...KK.",
    "KRRK.KRRK",
    "KRWRKRRrK",
    "KRRRRRRrK",
    "KRRRRRrrK",
    ".KRRRrrK.",
    "..KRrrK..",
    "...KrK...",
    "....K....",
  ],
  palette: { K: "#1b1b1b", R: "#e83b3b", r: "#a51d24", W: "#ffffff" },
};

export const COIN: Sprite = {
  rows: [
    "...KKK...",
    "..KYYYK..",
    ".KYWYYoK.",
    ".KWYKYoK.",
    ".KYYKYoK.",
    ".KYYKYoK.",
    ".KYYYYoK.",
    "..KoooK..",
    "...KKK...",
  ],
  palette: { K: "#1b1b1b", Y: "#ffc928", o: "#c77700", W: "#fff6c4" },
};

export function PixelArt({ sprite, className }: { sprite: Sprite; className?: string }) {
  const width = sprite.rows[0]?.length ?? 0;
  return (
    <svg
      aria-hidden="true"
      viewBox={`0 0 ${width} ${sprite.rows.length}`}
      shapeRendering="crispEdges"
      className={cn("size-full", className)}
    >
      {sprite.rows.flatMap((row, y) =>
        [...row].map((key, x) =>
          key === "." ? null : (
            <rect
              key={`${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={sprite.palette[key]}
            />
          ),
        ),
      )}
    </svg>
  );
}

type IconProps = { className?: string };

export const PixelHeart = ({ className }: IconProps) => (
  <PixelArt sprite={HEART} className={className} />
);

export const PixelCoin = ({ className }: IconProps) => (
  <PixelArt sprite={COIN} className={className} />
);

export const PLAYER_META: Record<
  Player,
  { name: string; Icon: ComponentType<IconProps> }
> = {
  X: { name: "Heart", Icon: PixelHeart },
  O: { name: "Coin", Icon: PixelCoin },
};
