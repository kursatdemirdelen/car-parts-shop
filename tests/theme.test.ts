import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { contrastRatio, PALETTE, TEXT_PAIRS, TOKENS } from "@/lib/theme";

describe("theme", () => {
  it("computes WCAG contrast ratios", () => {
    expect(contrastRatio("#0F4C75", "#ffffff")).toBeCloseTo(9.09, 1);
    expect(contrastRatio("#3282B8", "#ffffff")).toBeCloseTo(4.18, 1);
    expect(contrastRatio("#ffffff", "#0F4C75")).toBeCloseTo(9.09, 1);
  });

  it("keeps every text pair at or above its minimum", () => {
    for (const [fg, bg, min] of TEXT_PAIRS) expect(contrastRatio(fg, bg), `${fg} on ${bg}`).toBeGreaterThanOrEqual(min);
  });

  it("never uses accent-bright for normal-size text", () => {
    expect(TEXT_PAIRS.filter(([fg, , min]) => fg.toLowerCase() === PALETTE.bright.toLowerCase() && min >= 4.5)).toEqual([]);
  });

  it("mirrors TOKENS in globals.css", () => {
    const css = readFileSync("src/app/globals.css", "utf8").toLowerCase();
    for (const [name, hex] of Object.entries(TOKENS)) expect(css, name).toContain(`--color-${name}: ${hex.toLowerCase()};`);
  });
});
