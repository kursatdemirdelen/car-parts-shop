import type { CompatibilityRecord, ID, Product } from "@/lib/types";

/**
 * What the store may say about a product for a vehicle.
 * `unknown` means no record exists — it must never be presented as a fit.
 */
export type FitmentState = "confirmed" | "unverified" | "incompatible" | "universal" | "unknown";

export const FITMENT_LABELS: Record<FitmentState, string> = {
  confirmed: "Doğrulanmış uyum",
  unverified: "Doğrulanmamış",
  unknown: "Doğrulanmamış",
  incompatible: "Uyumsuz",
  universal: "Araca bağlı değil",
};

export function fitmentFor(
  product: Product,
  vehicleId: ID | null,
  records: CompatibilityRecord[],
): FitmentState | "no-vehicle" {
  if (product.fitmentType === "universal") return "universal";
  if (!vehicleId) return "no-vehicle";
  const record = records.find((r) => r.productId === product.id && r.vehicleId === vehicleId);
  return record ? record.status : "unknown";
}

/** Products a shopper can treat as fitting: an explicit confirmed record, or not vehicle-dependent. */
export function fitsVehicle(product: Product, vehicleId: ID, records: CompatibilityRecord[]): boolean {
  const state = fitmentFor(product, vehicleId, records);
  return state === "confirmed" || state === "universal";
}
