import { Game } from "@/components/game";
import { Scenery } from "@/components/scenery";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="relative flex flex-1 items-center justify-center px-4 pt-6 pb-16">
      <Scenery />
      <div className="brick-frame relative w-full max-w-md">
        <Card className="pixel-panel gap-4 py-5">
          <CardHeader className="text-center">
            <CardTitle>
              <h1 className="pixel-title font-pixel text-2xl sm:text-3xl">
                Tic-Tac-Toe
              </h1>
            </CardTitle>
            <CardDescription className="text-[var(--panel-fg)]/75">
              Heart vs Coin. Heart goes first.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Game />
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
