# Tic-Tac-Toe

A two-player Tic-Tac-Toe game built with Next.js (App Router), React 19, Tailwind CSS v4 and shadcn/ui.

## Features

- Two players take turns placing **X** and **O** on a 3×3 board (X goes first).
- The game announces the winner — highlighting the winning line — or a draw.
- **New Game** clears the board.
- A scoreboard counts X wins, O wins and draws. Scores are saved in `localStorage`, so they survive a page refresh; **Reset Scores** sets them back to zero.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | Lint with ESLint |
| `npm test` | Run the Vitest suite once |
| `npm run test:watch` | Run Vitest in watch mode |
| `npm run coverage` | Run tests with a coverage report |

## Project layout

```
src/
  app/                 layout + page
  components/
    game.tsx           client component: board state, status, buttons
    board.tsx          3×3 grid
    square.tsx         a single cell
    scoreboard.tsx     X / Draws / O tallies
    ui/                shadcn/ui components
  lib/
    game.ts            pure game rules (winner, draw, moves, scoring)
    score-store.ts     localStorage-backed score (useSyncExternalStore)
```
