import { createLocalStore } from "./local-store";

export type Sfx = "place" | "win" | "draw" | "start";

/** Original chiptune cues as [frequency Hz, duration s] steps. */
export const SFX: Record<Sfx, readonly (readonly [number, number])[]> = {
  place: [
    [660, 0.05],
    [990, 0.07],
  ],
  start: [
    [392, 0.06],
    [523, 0.06],
    [784, 0.1],
  ],
  win: [
    [523, 0.09],
    [659, 0.09],
    [784, 0.09],
    [1047, 0.09],
    [784, 0.09],
    [1047, 0.3],
  ],
  draw: [
    [494, 0.12],
    [440, 0.12],
    [392, 0.12],
    [330, 0.3],
  ],
};

const VOLUME = 0.06;

/** Builds a player around an AudioContext factory (injectable for tests). */
export function createSfxPlayer(createContext: () => AudioContext | null) {
  let ctx: AudioContext | null | undefined;

  return function play(name: Sfx): void {
    if (ctx === undefined) ctx = createContext();
    if (!ctx) return;
    try {
      // Browsers start contexts suspended until a user gesture; play() runs from clicks.
      if (ctx.state === "suspended") void ctx.resume();
      let t = ctx.currentTime;
      for (const [frequency, duration] of SFX[name]) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "square";
        osc.frequency.setValueAtTime(frequency, t);
        gain.gain.setValueAtTime(VOLUME, t);
        gain.gain.exponentialRampToValueAtTime(0.0001, t + duration);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t);
        osc.stop(t + duration);
        t += duration;
      }
    } catch {
      // Sound is decorative; never let an audio failure break the game.
    }
  };
}

function browserAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor =
    window.AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  try {
    return Ctor ? new Ctor() : null;
  } catch {
    return null;
  }
}

export const playSfx = createSfxPlayer(browserAudioContext);

export const MUTED_KEY = "tic-tac-toe:muted";

export const mutedStore = createLocalStore<boolean>({
  key: MUTED_KEY,
  fallback: false,
  parse: (raw) => raw === "1",
  serialize: (muted) => (muted ? "1" : "0"),
});

export const useMuted = mutedStore.useValue;
