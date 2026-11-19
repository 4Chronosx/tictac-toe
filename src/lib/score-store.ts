import { useSyncExternalStore } from "react";
import { EMPTY_SCORE, type Score } from "./game";

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

const listeners = new Set<() => void>();

// Fallback when localStorage is unavailable (private mode, blocked storage).
let memoryScore: Score = EMPTY_SCORE;
// useSyncExternalStore requires a referentially stable snapshot.
let cachedRaw: string | null | undefined;
let cachedScore: Score = EMPTY_SCORE;

export function readScore(): Score {
  let raw: string | null;
  try {
    raw = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    return memoryScore;
  }
  if (raw !== cachedRaw) {
    cachedRaw = raw;
    cachedScore = parseScore(raw);
  }
  return cachedScore;
}

export function writeScore(score: Score): void {
  memoryScore = score;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(score));
  } catch {
    // Storage full or blocked: the in-memory score still works for this session.
  }
  listeners.forEach((listener) => listener());
}

export function subscribe(listener: () => void): () => void {
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY || event.key === null) listener();
  };
  listeners.add(listener);
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

const getServerSnapshot = () => EMPTY_SCORE;

/**
 * Persisted scoreboard. The server (and the hydration pass) render zeros, then
 * React re-renders with the stored value — no hydration mismatch.
 */
export function useScore(): [Score, (score: Score) => void] {
  const score = useSyncExternalStore(subscribe, readScore, getServerSnapshot);
  return [score, writeScore];
}
