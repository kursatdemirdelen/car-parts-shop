import { describe, expect, it } from "vitest";
import { seed } from "@/lib/seed";
import { decodeVin, normalizeVin, vehiclesForVin } from "@/lib/vin";

const EXAMPLE = "WBAEV33435KR12345";

describe("normalizeVin", () => {
  it("upper-cases and strips spaces and dashes", () => {
    expect(normalizeVin(" wba-ev3 3435kr12345 ")).toBe(EXAMPLE);
  });
});

describe("decodeVin", () => {
  it("decodes manufacturer and model year from a valid BMW VIN", () => {
    const r = decodeVin(EXAMPLE, 2026);
    expect(r.valid).toBe(true);
    expect(r.make).toBe("BMW");
    expect(r.wmi).toBe("WBA");
    expect(r.modelYears).toEqual([2005]);
    expect(r.segments.map((s) => s.key)).toEqual(["wmi", "vds", "year", "plant", "serial"]);
    expect(r.segments.find((s) => s.key === "vds")!.decoded).toBeNull();
    expect(r.segments.find((s) => s.key === "wmi")!.decoded).toBe("BMW");
  });

  it("returns every past year for an ambiguous year code", () => {
    expect(decodeVin("WBAEV3343AKR12345", 2026).modelYears).toEqual([2010, 1980]);
  });

  it("rejects empty input, wrong length and I/O/Q", () => {
    expect(decodeVin("   ", 2026)).toMatchObject({ valid: false, error: "empty", message: "Şasi numarasını girin." });
    expect(decodeVin("WBAEV33435KR1234", 2026)).toMatchObject({
      valid: false,
      error: "length",
      message: "Şasi numarası 17 karakter olmalıdır (şu an 16).",
    });
    expect(decodeVin("WBAEV33O35KR12345", 2026)).toMatchObject({
      valid: false,
      error: "chars",
      message: "Şasi numarasında I, O ve Q harfleri bulunmaz; lütfen kontrol edin.",
    });
  });

  it("accepts an unknown manufacturer code without guessing a make", () => {
    const r = decodeVin("ZFA31200000123456", 2026);
    expect(r.valid).toBe(true);
    expect(r.make).toBeNull();
    expect(r.message).toBe("Bu üretici kodu demo kapsamında değil (yalnızca BMW, Mercedes-Benz, Porsche, Audi).");
  });
});

describe("vehiclesForVin", () => {
  it("puts vehicles matching the estimated model year first and keeps the rest of the make", () => {
    const { likely, others } = vehiclesForVin(decodeVin(EXAMPLE, 2026), seed.vehicles, 2026);
    const likelyIds = likely.map((v) => v.id);
    expect(likelyIds).toContain("v-bmw-e46-320d");
    expect(likelyIds).toContain("v-bmw-e90-320d");
    expect(likelyIds.some((id) => id.startsWith("v-bmw-g20-"))).toBe(false);
    expect(others.map((v) => v.id)).toContain("v-bmw-g20-320i");
    expect([...likely, ...others].every((v) => v.make === "BMW")).toBe(true);
  });

  it("falls back to all vehicles of the make when the estimated year matches none", () => {
    const { likely, others } = vehiclesForVin(decodeVin("WDD2040021A123456", 2026), seed.vehicles, 2026);
    expect(likely).toEqual([]);
    expect(others.length).toBeGreaterThan(0);
    expect(others.every((v) => v.make === "Mercedes-Benz")).toBe(true);
  });

  it("matches nothing for invalid or unknown VINs", () => {
    expect(vehiclesForVin(decodeVin("ZFA31200000123456", 2026), seed.vehicles, 2026)).toEqual({ likely: [], others: [] });
    expect(vehiclesForVin(decodeVin("WBA", 2026), seed.vehicles, 2026)).toEqual({ likely: [], others: [] });
  });
});

describe("model year is an estimate", () => {
  it("labels the year segment as an estimate", () => {
    const year = decodeVin(EXAMPLE, 2026).segments.find((s) => s.key === "year")!;
    expect(year.label).toBe("Model yılı (tahmini)");
    expect(year.decoded).toBe("2005 (tahmini)");
  });
});
