import { act, renderHook } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { createLocalStore } from "./local-store";

const makeFlagStore = (key: string) =>
  createLocalStore<boolean>({
    key,
    fallback: false,
    parse: (raw) => (raw === null ? false : raw === "1"),
    serialize: (value) => (value ? "1" : "0"),
  });

describe("createLocalStore", () => {
  it("returns the fallback when nothing is stored", () => {
    expect(makeFlagStore("t:a").read()).toBe(false);
  });

  it("writes serialized values and reads them back", () => {
    const store = makeFlagStore("t:b");
    store.write(true);
    expect(window.localStorage.getItem("t:b")).toBe("1");
    expect(store.read()).toBe(true);
  });

  it("keeps separate stores independent", () => {
    const a = makeFlagStore("t:c");
    const b = makeFlagStore("t:d");
    a.write(true);
    expect(b.read()).toBe(false);
  });

  it("only notifies its own subscribers", () => {
    const a = makeFlagStore("t:e");
    const b = makeFlagStore("t:f");
    const listener = vi.fn();
    const unsubscribe = b.subscribe(listener);
    a.write(true);
    expect(listener).not.toHaveBeenCalled();
    unsubscribe();
  });

  it("exposes a hook that reads and writes the value", () => {
    const store = makeFlagStore("t:g");
    const { result } = renderHook(() => store.useValue());
    expect(result.current[0]).toBe(false);
    act(() => result.current[1](true));
    expect(result.current[0]).toBe(true);
  });
});
