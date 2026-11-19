import { PixelArt, type Sprite } from "./marks";

const CLOUD: Sprite = {
  rows: [
    ".....KKKK.......",
    "...KKCCCCKKK....",
    "..KCCCCCCCCCKK..",
    ".KCCCCCCCCCCCCK.",
    "KCCCCCCCCCCCCCCK",
    "KCCCCCCCCCCCCCCK",
    ".KKKKKKKKKKKKKK.",
  ],
  palette: { K: "#1b1b1b", C: "currentColor" },
};

const HILL: Sprite = {
  rows: [
    "......KKKK......",
    "....KKHHHHKK....",
    "...KHHHHHHHHK...",
    "..KHHdHHHHdHHK..",
    ".KHHHHHHHHHHHHK.",
    ".KHHHdHHHHHHdHK.",
    "KHHHHHHHHHHHHHHK",
    "KHHHHHHHHHHHHHHK",
  ],
  palette: { K: "#1b1b1b", H: "currentColor", d: "#1f6e2a" },
};

/** Decorative backdrop: pixel clouds, hills and a brick ground strip. */
export function Scenery() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <PixelArt sprite={CLOUD} className="absolute top-[8%] left-[6%] size-auto w-28 text-[var(--cloud)] sm:w-40" />
      <PixelArt sprite={CLOUD} className="absolute top-[18%] right-[8%] size-auto w-20 text-[var(--cloud)] sm:w-32" />
      <PixelArt sprite={CLOUD} className="absolute top-[42%] left-[78%] hidden size-auto w-24 text-[var(--cloud)] md:block" />
      <PixelArt sprite={HILL} className="absolute bottom-12 -left-6 size-auto w-48 text-[var(--hill)] sm:w-64" />
      <PixelArt sprite={HILL} className="absolute right-4 bottom-12 size-auto w-28 text-[var(--hill)] sm:w-40" />
      <div className="ground absolute inset-x-0 bottom-0" />
    </div>
  );
}
