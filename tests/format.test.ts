import { describe, expect, it } from "vitest";
import { cn, formatDate, formatPrice, parseAmount, parsePriceFilter } from "@/lib/format";

describe("formatPrice", () => {
  it("formats TRY with the Turkish locale", () => {
    expect(formatPrice(2450)).toBe(
      new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" }).format(2450),
    );
    expect(formatPrice(2450)).toMatch(/2\.450,00/);
    expect(formatPrice(149.9)).toMatch(/149,90/);
  });
});

describe("formatDate", () => {
  it("formats ISO dates in Turkish", () => {
    expect(formatDate("2026-10-12T10:00:00.000Z")).toMatch(/12 Eki 2026/);
  });
});

describe("cn", () => {
  it("joins truthy class names", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });
});

describe("parseAmount", () => {
  it("parses Turkish and plain number formats", () => {
    expect(parseAmount("2.450")).toBe(2450);
    expect(parseAmount("1.250,50")).toBe(1250.5);
    expect(parseAmount("149,9")).toBe(149.9);
    expect(parseAmount("1250.5")).toBe(1250.5);
    expect(parseAmount("12.500.000")).toBe(12500000);
    expect(parseAmount("  ")).toBeNaN();
    expect(parseAmount("abc")).toBeNaN();
  });
});

describe("parsePriceFilter", () => {
  it("reads Turkish thousands separators in the storefront price filter", () => {
    expect(parsePriceFilter("2.000")).toBe(2000);
    expect(parsePriceFilter("1500")).toBe(1500);
    expect(parsePriceFilter("")).toBeUndefined();
    expect(parsePriceFilter("-5")).toBeUndefined();
  });
});
