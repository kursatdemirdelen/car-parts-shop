import { describe, expect, it } from "vitest";
import { cn, formatDate, formatPrice } from "@/lib/format";

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
