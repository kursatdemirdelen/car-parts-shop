import type { CatalogData, CompatibilityRecord, ID, KitLine, MaintenanceKit, Product } from "@/lib/types";
import { fitsVehicle } from "./catalog/fitment";

export interface ResolvedKitLine {
  line: KitLine;
  product: Product | null;
  /** false when the line cannot be added to the cart; see `reason`. */
  available: boolean;
  /** "unavailable": deleted, unpublished or out of stock. "unverified": no confirmed fit for the given vehicle. */
  reason?: "unavailable" | "unverified";
}

/** Kit price is the sum of its available lines — there is no kit discount. */
export function resolveKit(
  kit: MaintenanceKit,
  products: Product[],
  /** When given, lines that are not confirmed (or vehicle-independent) for this vehicle are not addable. */
  fit?: { vehicleId: ID; records: CompatibilityRecord[] },
): { lines: ResolvedKitLine[]; total: number; availableCount: number } {
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines = kit.lines.map((line): ResolvedKitLine => {
    const product = byId.get(line.productId) ?? null;
    if (!product || product.status !== "published" || product.stock <= 0) return { line, product, available: false, reason: "unavailable" };
    if (fit && !fitsVehicle(product, fit.vehicleId, fit.records)) return { line, product, available: false, reason: "unverified" };
    return { line, product, available: true };
  });
  const total = lines.reduce((sum, l) => (l.available ? sum + l.product!.price * l.line.quantity : sum), 0);
  return { lines, total: Math.round(total * 100) / 100, availableCount: lines.filter((l) => l.available).length };
}

export function kitsForVehicle(kits: MaintenanceKit[], vehicleId: ID): MaintenanceKit[] {
  return kits.filter((k) => k.status === "published" && k.vehicleIds.includes(vehicleId));
}

/**
 * Parts usually replaced together with `product`. With a selected vehicle only parts that are confirmed
 * (or vehicle-independent) for it are suggested; without one, all published companions are returned.
 */
export function companionsFor(
  product: Product,
  products: Product[],
  vehicleId: ID | null,
  records: CompatibilityRecord[],
  limit = 4,
): Product[] {
  const byId = new Map(products.map((p) => [p.id, p]));
  return (product.companionIds ?? [])
    .map((id) => byId.get(id))
    .filter((p): p is Product => !!p && p.status === "published" && p.id !== product.id)
    .filter((p) => !vehicleId || fitsVehicle(p, vehicleId, records))
    .slice(0, limit);
}

/** Removes a product and every reference to it (compatibility, kit lines, companion lists). */
export function cascadeDeleteProduct(data: CatalogData, id: ID): CatalogData {
  return {
    ...data,
    products: data.products
      .filter((p) => p.id !== id)
      .map((p) => (p.companionIds?.includes(id) ? { ...p, companionIds: p.companionIds.filter((c) => c !== id) } : p)),
    compatibility: data.compatibility.filter((r) => r.productId !== id),
    kits: data.kits.map((k) => ({ ...k, lines: k.lines.filter((l) => l.productId !== id) })),
  };
}

/** Removes a vehicle and every reference to it (compatibility, kit vehicle lists). */
export function cascadeDeleteVehicle(data: CatalogData, id: ID): CatalogData {
  return {
    ...data,
    vehicles: data.vehicles.filter((v) => v.id !== id),
    compatibility: data.compatibility.filter((r) => r.vehicleId !== id),
    kits: data.kits.map((k) => ({ ...k, vehicleIds: k.vehicleIds.filter((v) => v !== id) })),
  };
}
