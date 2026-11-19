import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Scenery } from "./scenery";

describe("Scenery", () => {
  it("is purely decorative and does not intercept clicks", () => {
    const { container } = render(<Scenery />);
    const root = container.firstElementChild!;
    expect(root).toHaveAttribute("aria-hidden", "true");
    expect(root).toHaveClass("pointer-events-none");
    expect(root.querySelectorAll("svg").length).toBeGreaterThan(0);
  });
});
