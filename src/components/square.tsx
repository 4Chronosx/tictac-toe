import { Button } from "@/components/ui/button";
import type { Cell } from "@/lib/game";
import { cn } from "@/lib/utils";

const MARK_COLOR = {
  X: "text-sky-600 dark:text-sky-400",
  O: "text-rose-600 dark:text-rose-400",
} as const;

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

  return (
    <Button
      type="button"
      variant="outline"
      aria-label={`Row ${row}, column ${col}, ${value ?? "empty"}`}
      data-winning={winning || undefined}
      disabled={disabled}
      onClick={() => onSelect(index)}
      className={cn(
        "aspect-square h-auto w-full rounded-xl text-5xl font-bold sm:text-6xl",
        "disabled:opacity-100",
        value && MARK_COLOR[value],
        winning &&
          "border-primary bg-primary/10 ring-3 ring-primary/30 dark:bg-primary/20",
      )}
    >
      {value}
    </Button>
  );
}
