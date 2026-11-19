import { describe, expect, it, vi } from "vitest";
import { MUTED_KEY, SFX, createSfxPlayer, mutedStore, playSfx } from "./sound";

function fakeAudio(state: AudioContextState = "running") {
  const oscillators: { freq: number; start: number; stop: number }[] = [];
  const ctx = {
    state,
    currentTime: 1,
    destination: {},
    resume: vi.fn(() => Promise.resolve()),
    createGain: () => ({
      gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() },
      connect: vi.fn((node) => node),
    }),
    createOscillator: () => {
      const record = { freq: 0, start: 0, stop: 0 };
      oscillators.push(record);
      return {
        type: "sine",
        frequency: { setValueAtTime: (f: number) => (record.freq = f) },
        connect: vi.fn((node) => node),
        start: (t: number) => (record.start = t),
        stop: (t: number) => (record.stop = t),
      };
    },
  };
  return { ctx: ctx as unknown as AudioContext, oscillators };
}

describe("createSfxPlayer", () => {
  it("schedules one square-wave note per step, back to back", () => {
    const { ctx, oscillators } = fakeAudio();
    const play = createSfxPlayer(() => ctx);
    play("win");

    expect(oscillators.map((o) => o.freq)).toEqual(SFX.win.map(([f]) => f));
    let t = 1;
    for (const [i, [, duration]] of SFX.win.entries()) {
      expect(oscillators[i].start).toBeCloseTo(t);
      expect(oscillators[i].stop).toBeCloseTo(t + duration);
      t += duration;
    }
  });

  it("creates the audio context lazily, once", () => {
    const factory = vi.fn(() => fakeAudio().ctx);
    const play = createSfxPlayer(factory);
    expect(factory).not.toHaveBeenCalled();
    play("place");
    play("draw");
    expect(factory).toHaveBeenCalledTimes(1);
  });

  it("resumes a suspended context (browser autoplay policy)", () => {
    const { ctx } = fakeAudio("suspended");
    createSfxPlayer(() => ctx)("start");
    expect(ctx.resume).toHaveBeenCalled();
  });

  it("does nothing when audio is unsupported", () => {
    expect(() => createSfxPlayer(() => null)("place")).not.toThrow();
  });

  it("never throws if the audio API fails", () => {
    const broken = {
      state: "running",
      createOscillator: () => {
        throw new Error("boom");
      },
    } as unknown as AudioContext;
    expect(() => createSfxPlayer(() => broken)("place")).not.toThrow();
  });

  it("the default player is safe without Web Audio (jsdom)", () => {
    expect(() => playSfx("place")).not.toThrow();
  });
});

describe("mutedStore", () => {
  it("defaults to sound on and persists the mute flag", () => {
    expect(mutedStore.read()).toBe(false);
    mutedStore.write(true);
    expect(window.localStorage.getItem(MUTED_KEY)).toBe("1");
    expect(mutedStore.read()).toBe(true);
  });
});
