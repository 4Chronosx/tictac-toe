import { useSyncExternalStore } from "react";

type LocalStoreOptions<T> = {
  key: string;
  fallback: T;
  /** Must never throw; return `fallback` for missing or malformed data. */
  parse: (raw: string | null) => T;
  serialize: (value: T) => string;
};

export type LocalStore<T> = {
  key: string;
  read: () => T;
  write: (value: T) => void;
  subscribe: (listener: () => void) => () => void;
  /** Server/hydration render uses `fallback`, then React re-renders with the stored value. */
  useValue: () => [T, (value: T) => void];
};

/** A localStorage-backed value usable with useSyncExternalStore, synced across tabs. */
export function createLocalStore<T>({
  key,
  fallback,
  parse,
  serialize,
}: LocalStoreOptions<T>): LocalStore<T> {
  const listeners = new Set<() => void>();
  // Fallback when localStorage is unavailable (private mode, blocked storage).
  let memoryValue = fallback;
  // useSyncExternalStore requires a referentially stable snapshot.
  let cachedRaw: string | null | undefined;
  let cachedValue = fallback;

  function read(): T {
    let raw: string | null;
    try {
      raw = window.localStorage.getItem(key);
    } catch {
      return memoryValue;
    }
    if (raw !== cachedRaw) {
      cachedRaw = raw;
      cachedValue = parse(raw);
    }
    return cachedValue;
  }

  function write(value: T): void {
    memoryValue = value;
    try {
      window.localStorage.setItem(key, serialize(value));
    } catch {
      // Storage full or blocked: the in-memory value still works for this session.
    }
    listeners.forEach((listener) => listener());
  }

  function subscribe(listener: () => void): () => void {
    const onStorage = (event: StorageEvent) => {
      if (event.key === key || event.key === null) listener();
    };
    listeners.add(listener);
    window.addEventListener("storage", onStorage);
    return () => {
      listeners.delete(listener);
      window.removeEventListener("storage", onStorage);
    };
  }

  const getServerSnapshot = () => fallback;

  function useValue(): [T, (value: T) => void] {
    return [useSyncExternalStore(subscribe, read, getServerSnapshot), write];
  }

  return { key, read, write, subscribe, useValue };
}
