import type { Category, CompatibilityRecord, ID, Product, Vehicle } from "@/lib/types";
import { normalizeCode } from "./catalog/search";

/** Readable URL slug for a vehicle landing page, e.g. "bmw-e46-320d". Derived from the (unique) vehicle id. */
export function vehicleSlug(v: Vehicle): string {
  return v.id.replace(/^v-/, "");
}

export function findVehicleBySlug(vehicles: Vehicle[], slug: string): Vehicle | undefined {
  return vehicles.find((v) => vehicleSlug(v) === slug);
}

/** Normalized OEM numbers of published products, each once. */
export function allOemNumbers(products: Product[]): string[] {
  const set = new Set<string>();
  for (const p of products) if (p.status === "published") for (const n of p.oemNumbers) set.add(normalizeCode(n));
  return [...set];
}

/** Published products that carry this OEM number (any formatting). Several products = cross-reference. */
export function productsByOem(products: Product[], oem: string): Product[] {
  const code = normalizeCode(oem);
  if (!code) return [];
  return products.filter((p) => p.status === "published" && p.oemNumbers.some((n) => normalizeCode(n) === code));
}

/**
 * Parts with an explicit record for the vehicle: confirmed ones grouped by subcategory, unverified ones apart.
 * Universal products are left out (they fit any vehicle and would bury the specific parts).
 */
export function partsForVehicle(
  products: Product[],
  categories: Category[],
  records: CompatibilityRecord[],
  vehicleId: ID,
): { confirmed: { category: Category; products: Product[] }[]; unverified: Product[] } {
  const published = new Map(products.filter((p) => p.status === "published").map((p) => [p.id, p]));
  const forVehicle = records.filter((r) => r.vehicleId === vehicleId && published.has(r.productId));
  const confirmedProducts = forVehicle.filter((r) => r.status === "confirmed").map((r) => published.get(r.productId)!);
  const unverified = forVehicle.filter((r) => r.status === "unverified").map((r) => published.get(r.productId)!);
  const confirmed = categories
    .filter((c) => c.parentId !== null)
    .map((category) => ({ category, products: confirmedProducts.filter((p) => p.categoryId === category.id) }))
    .filter((g) => g.products.length > 0);
  return { confirmed, unverified };
}
