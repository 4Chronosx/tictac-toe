import { Game } from "@/components/game";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function Home() {
  return (
    <main className="flex flex-1 items-center justify-center bg-muted/40 px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-3xl font-bold tracking-tight">
            <h1>Tic-Tac-Toe</h1>
          </CardTitle>
          <CardDescription>Two players, one board. X goes first.</CardDescription>
        </CardHeader>
        <CardContent>
          <Game />
        </CardContent>
      </Card>
    </main>
  );
}
