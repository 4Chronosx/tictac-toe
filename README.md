# Tic-Tac-Toe

A two-player Tic-Tac-Toe game built with Next.js (App Router), React 19, Tailwind CSS v4 and shadcn/ui.

## Features

- Retro 8-bit platformer look: pixel font, sky with clouds and hills, brick frame and bonus-block squares. A night sky is used when the OS is in dark mode.
- Two players take turns on a 3×3 board: **Heart** (X, goes first) and **Coin** (O), drawn as original pixel art.
- The game announces the winner — the winning blocks bump and flash — or a draw.
- **New Game** clears the board.
- A scoreboard counts Heart wins, Coin wins and draws. Scores are saved in `localStorage`, so they survive a page refresh; **Reset Scores** sets them back to zero.
- Optional chiptune sound effects (generated with the Web Audio API, no audio files). The speaker button mutes them and remembers the choice.
- Animations are disabled when the OS asks for reduced motion.

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
    scoreboard.tsx     Heart / Draws / Coin tallies
    marks.tsx          pixel-art Heart and Coin sprites
    scenery.tsx        decorative sky, hills and ground
    ui/                shadcn/ui components
  lib/
    game.ts            pure game rules (winner, draw, moves, scoring)
    local-store.ts     generic localStorage store (useSyncExternalStore)
    sound.ts           chiptune sound effects + mute setting
    score-store.ts     persisted score
```
