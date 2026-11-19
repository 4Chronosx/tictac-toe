import { act, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { EMPTY_SCORE } from "./game";
import {
  STORAGE_KEY,
  parseScore,
  readScore,
  subscribe,
  useScore,
  writeScore,
} from "./score-store";

afterEach(() => {
  vi.restoreAllMocks();
});

describe("parseScore", () => {
  it("returns an empty score for missing data", () => {
    expect(parseScore(null)).toEqual(EMPTY_SCORE);
  });

  it("parses a valid score", () => {
    expect(parseScore('{"X":3,"O":1,"draws":2}')).toEqual({
      X: 3,
      O: 1,
      draws: 2,
    });
  });

  it.each([
    "not json",
    "null",
    "[]",
    '{"X":1,"O":1}',
    '{"X":-1,"O":0,"draws":0}',
    '{"X":1.5,"O":0,"draws":0}',
    '{"X":"1","O":0,"draws":0}',
  ])("falls back to an empty score for %s", (raw) => {
    expect(parseScore(raw)).toEqual(EMPTY_SCORE);
  });

  it("drops unknown keys", () => {
    expect(parseScore('{"X":1,"O":2,"draws":3,"evil":true}')).toEqual({
      X: 1,
      O: 2,
      draws: 3,
    });
  });
});

describe("readScore / writeScore", () => {
  it("round-trips through localStorage", () => {
    writeScore({ X: 1, O: 0, draws: 4 });
    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(
      '{"X":1,"O":0,"draws":4}',
    );
    expect(readScore()).toEqual({ X: 1, O: 0, draws: 4 });
  });

  it("returns a stable snapshot while storage is unchanged", () => {
    writeScore({ X: 2, O: 2, draws: 2 });
    expect(readScore()).toBe(readScore());
  });

  it("notifies subscribers on write and stops after unsubscribe", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    writeScore({ X: 1, O: 0, draws: 0 });
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
    writeScore({ X: 2, O: 0, draws: 0 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it("notifies subscribers when another tab changes the score", () => {
    const listener = vi.fn();
    const unsubscribe = subscribe(listener);
    window.dispatchEvent(new StorageEvent("storage", { key: STORAGE_KEY }));
    window.dispatchEvent(new StorageEvent("storage", { key: "other" }));
    expect(listener).toHaveBeenCalledTimes(1);
    unsubscribe();
  });

  it("survives storage that throws", () => {
    vi.spyOn(Storage.prototype, "getItem").mockImplementation(() => {
      throw new Error("blocked");
    });
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(() => writeScore({ X: 9, O: 0, draws: 0 })).not.toThrow();
    expect(readScore()).toEqual({ X: 9, O: 0, draws: 0 });
  });
});

describe("useScore", () => {
  it("reads the persisted score and updates it", () => {
    writeScore({ X: 0, O: 5, draws: 1 });
    const { result } = renderHook(() => useScore());
    expect(result.current[0]).toEqual({ X: 0, O: 5, draws: 1 });

    act(() => result.current[1]({ X: 1, O: 5, draws: 1 }));
    expect(result.current[0]).toEqual({ X: 1, O: 5, draws: 1 });
    expect(parseScore(window.localStorage.getItem(STORAGE_KEY))).toEqual({
      X: 1,
      O: 5,
      draws: 1,
    });
  });
});
