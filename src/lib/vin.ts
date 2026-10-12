import type { Vehicle } from "@/lib/types";

/**
 * Vehicle Identification Number decoding, limited to what the ISO 3779 standard makes public:
 * the World Manufacturer Identifier (chars 1–3) and the model-year code (char 10).
 * Model, body and engine live in the manufacturer-specific part (chars 4–9) and are NOT decoded here.
 */

export type VinError = "empty" | "length" | "chars";

export interface VinSegment {
  key: "wmi" | "vds" | "year" | "plant" | "serial";
  /** 1-based inclusive character positions. */
  from: number;
  to: number;
  value: string;
  label: string;
  /** Human-readable decoded meaning, or null when this demo cannot decode it. */
  decoded: string | null;
}

export interface VinResult {
  input: string;
  normalized: string;
  valid: boolean;
  error?: VinError;
  message?: string;
  make: string | null;
  wmi: string;
  /** Candidate model years, newest first, never later than the current year. */
  modelYears: number[];
  segments: VinSegment[];
}

/** Common WMI codes for the makes in the demo catalog. Not exhaustive. */
export const WMI_MAKES: Record<string, string> = {
  WBA: "BMW",
  WBS: "BMW",
  WBY: "BMW",
  WBX: "BMW",
  WDB: "Mercedes-Benz",
  WDC: "Mercedes-Benz",
  WDD: "Mercedes-Benz",
  WDF: "Mercedes-Benz",
  W1K: "Mercedes-Benz",
  W1N: "Mercedes-Benz",
  W1V: "Mercedes-Benz",
  WP0: "Porsche",
  WP1: "Porsche",
  WAU: "Audi",
  WUA: "Audi",
  WA1: "Audi",
};

/** Model-year codes in order; the cycle starts at 1980 and repeats every 30 years. */
const YEAR_CODES = "ABCDEFGHJKLMNPRSTVWXY123456789";

export function normalizeVin(input: string): string {
  return input.toUpperCase().replace(/[\s-]/g, "");
}

function modelYearsFor(code: string, currentYear: number): number[] {
  const index = YEAR_CODES.indexOf(code);
  if (index < 0) return [];
  const years: number[] = [];
  for (let y = 1980 + index; y <= currentYear; y += 30) years.push(y);
  return years.reverse();
}

export function decodeVin(input: string, currentYear: number): VinResult {
  const normalized = normalizeVin(input);
  const base: VinResult = { input, normalized, valid: false, make: null, wmi: normalized.slice(0, 3), modelYears: [], segments: [] };

  if (!normalized) return { ...base, error: "empty", message: "Şasi numarasını girin." };
  if (normalized.length !== 17)
    return { ...base, error: "length", message: `Şasi numarası 17 karakter olmalıdır (şu an ${normalized.length}).` };
  if (/[IOQ]/.test(normalized) || !/^[A-Z0-9]{17}$/.test(normalized))
    return { ...base, error: "chars", message: "Şasi numarasında I, O ve Q harfleri bulunmaz; lütfen kontrol edin." };

  const make = WMI_MAKES[base.wmi] ?? null;
  const modelYears = modelYearsFor(normalized[9], currentYear);
  const segment = (key: VinSegment["key"], from: number, to: number, label: string, decoded: string | null): VinSegment => ({
    key,
    from,
    to,
    value: normalized.slice(from - 1, to),
    label,
    decoded,
  });

  return {
    ...base,
    valid: true,
    make,
    modelYears,
    message: make ? undefined : "Bu üretici kodu demo kapsamında değil (yalnızca BMW, Mercedes-Benz, Porsche, Audi).",
    segments: [
      segment("wmi", 1, 3, "Üretici kodu (WMI)", make),
      segment("vds", 4, 9, "Araç tanımı (VDS)", null),
      segment("year", 10, 10, "Model yılı", modelYears.length ? modelYears.join(" veya ") : null),
      segment("plant", 11, 11, "Fabrika", null),
      segment("serial", 12, 17, "Seri numarası", null),
    ],
  };
}

/** Demo vehicles whose make matches and whose production range contains one of the candidate model years. */
export function vehiclesForVin(result: VinResult, vehicles: Vehicle[], currentYear: number): Vehicle[] {
  if (!result.valid || !result.make) return [];
  return vehicles.filter(
    (v) => v.make === result.make && result.modelYears.some((y) => y >= v.yearFrom && y <= (v.yearTo ?? currentYear)),
  );
}
