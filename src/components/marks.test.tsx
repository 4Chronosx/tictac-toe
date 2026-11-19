import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { COIN, HEART, PLAYER_META, PixelArt } from "./marks";

describe("pixel art sprites", () => {
  it.each([
    ["heart", HEART],
    ["coin", COIN],
  ])("%s has rectangular rows and only known palette keys", (_, sprite) => {
    const width = sprite.rows[0].length;
    for (const row of sprite.rows) {
      expect(row).toHaveLength(width);
      for (const ch of row) {
        if (ch !== ".") expect(sprite.palette).toHaveProperty(ch);
      }
    }
  });
});

describe("PixelArt", () => {
  it("renders one crisp rect per filled pixel and is hidden from assistive tech", () => {
    const { container } = render(
      <PixelArt sprite={{ rows: ["A.", ".B"], palette: { A: "#111", B: "#222" } }} />,
    );
    const svg = container.querySelector("svg")!;
    expect(svg).toHaveAttribute("aria-hidden", "true");
    expect(svg).toHaveAttribute("shape-rendering", "crispEdges");
    expect(svg).toHaveAttribute("viewBox", "0 0 2 2");

    const rects = svg.querySelectorAll("rect");
    expect(rects).toHaveLength(2);
    expect(rects[0]).toHaveAttribute("fill", "#111");
    expect(rects[1]).toHaveAttribute("x", "1");
    expect(rects[1]).toHaveAttribute("y", "1");
  });
});

describe("PLAYER_META", () => {
  it("maps X to the heart and O to the coin", () => {
    expect(PLAYER_META.X.name).toBe("Heart");
    expect(PLAYER_META.O.name).toBe("Coin");
  });

  it("renders each player's icon", () => {
    const heart = render(<PLAYER_META.X.Icon />).container.querySelectorAll("rect");
    const coin = render(<PLAYER_META.O.Icon />).container.querySelectorAll("rect");
    expect(heart.length).toBeGreaterThan(0);
    expect(coin.length).toBeGreaterThan(0);
  });
});
