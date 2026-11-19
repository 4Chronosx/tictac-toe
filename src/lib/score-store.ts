import { EMPTY_SCORE, type Score } from "./game";
import { createLocalStore } from "./local-store";

export const STORAGE_KEY = "tic-tac-toe:score";

const isCount = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0;

/** Parses persisted data defensively; anything malformed resets to zero. */
export function parseScore(raw: string | null): Score {
  if (raw === null) return EMPTY_SCORE;
  try {
    const data: unknown = JSON.parse(raw);
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return EMPTY_SCORE;
    }
    const { X, O, draws } = data as Record<string, unknown>;
    return isCount(X) && isCount(O) && isCount(draws)
      ? { X, O, draws }
      : EMPTY_SCORE;
  } catch {
    return EMPTY_SCORE;
  }
}

const scoreStore = createLocalStore<Score>({
  key: STORAGE_KEY,
  fallback: EMPTY_SCORE,
  parse: parseScore,
  serialize: (score) => JSON.stringify(score),
});

export const { read: readScore, write: writeScore, subscribe } = scoreStore;

/** Persisted scoreboard; renders zeros on the server, then the stored value. */
export const useScore = scoreStore.useValue;
