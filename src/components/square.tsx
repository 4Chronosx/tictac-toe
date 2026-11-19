import { Button } from "@/components/ui/button";
import type { Cell } from "@/lib/game";
import { PLAYER_META } from "./marks";

type SquareProps = {
  index: number;
  value: Cell;
  winning: boolean;
  disabled: boolean;
  onSelect: (index: number) => void;
};

export function Square({ index, value, winning, disabled, onSelect }: SquareProps) {
  const row = Math.floor(index / 3) + 1;
  const col = (index % 3) + 1;
  const meta = value ? PLAYER_META[value] : null;

  return (
    <Button
      type="button"
      aria-label={`Row ${row}, column ${col}, ${meta?.name ?? "empty"}`}
      data-mark={value ?? undefined}
      data-winning={winning || undefined}
      disabled={disabled}
      onClick={() => onSelect(index)}
      className="bonus-block aspect-square w-full disabled:opacity-100"
    >
      {meta && <meta.Icon className="mark-pop" />}
    </Button>
  );
}
