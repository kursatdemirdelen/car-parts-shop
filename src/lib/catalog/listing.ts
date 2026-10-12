import type { CompatibilityRecord, ID, Product } from "@/lib/types";
import { fitsVehicle } from "./fitment";

export type SortKey = "recommended" | "price-asc" | "price-desc" | "name-asc" | "newest";

export const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "recommended", label: "Önerilen" },
  { value: "price-asc", label: "Fiyat: düşükten yükseğe" },
  { value: "price-desc", label: "Fiyat: yüksekten düşüğe" },
  { value: "name-asc", label: "Ürün adı (A–Z)" },
  { value: "newest", label: "En yeni" },
];

export interface ListingFilters {
  categoryIds: ID[];
  brandIds: ID[];
  minPrice?: number;
  maxPrice?: number;
  inStockOnly: boolean;
  fitsVehicleId?: ID | null;
}

const compare: Record<SortKey, (a: Product, b: Product) => number> = {
  recommended: (a, b) =>
    Number(!!b.featured) - Number(!!a.featured) ||
    Number(b.stock > 0) - Number(a.stock > 0) ||
    a.name.localeCompare(b.name, "tr"),
  "price-asc": (a, b) => a.price - b.price,
  "price-desc": (a, b) => b.price - a.price,
  "name-asc": (a, b) => a.name.localeCompare(b.name, "tr"),
  newest: (a, b) => b.createdAt.localeCompare(a.createdAt),
};

/** Filters and sorts published products. Operates on real data; drafts never appear. */
export function applyListing(
  products: Product[],
  f: ListingFilters,
  sort: SortKey,
  records: CompatibilityRecord[],
): Product[] {
  return products
    .filter((p) => {
      if (p.status !== "published") return false;
      if (f.categoryIds.length && !f.categoryIds.includes(p.categoryId)) return false;
      if (f.brandIds.length && !f.brandIds.includes(p.brandId)) return false;
      if (f.minPrice !== undefined && p.price < f.minPrice) return false;
      if (f.maxPrice !== undefined && p.price > f.maxPrice) return false;
      if (f.inStockOnly && p.stock <= 0) return false;
      if (f.fitsVehicleId && !fitsVehicle(p, f.fitsVehicleId, records)) return false;
      return true;
    })
    .sort(compare[sort]);
}

const list = (v: string | null) => (v ? v.split(",").filter(Boolean) : []);
const num = (v: string | null) => {
  if (v === null || v.trim() === "") return undefined;
  const n = Number(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
};

/**
 * Reads listing state from the URL. `fit=1` means "only products that fit the selected vehicle";
 * the vehicle id itself lives in the garage, so `filters.fitsVehicleId` is left null here.
 */
export function filtersFromSearchParams(sp: URLSearchParams): {
  filters: ListingFilters;
  sort: SortKey;
  fitOnly: boolean;
} {
  const sortParam = sp.get("sort") as SortKey | null;
  return {
    filters: {
      categoryIds: list(sp.get("cat")),
      brandIds: list(sp.get("brand")),
      minPrice: num(sp.get("min")),
      maxPrice: num(sp.get("max")),
      inStockOnly: sp.get("stock") === "1",
      fitsVehicleId: null,
    },
    sort: sortParam && sortParam in compare ? sortParam : "recommended",
    fitOnly: sp.get("fit") === "1",
  };
}

export function filtersToSearchParams(f: ListingFilters, sort: SortKey, fitOnly = false): URLSearchParams {
  const sp = new URLSearchParams();
  if (f.categoryIds.length) sp.set("cat", f.categoryIds.join(","));
  if (f.brandIds.length) sp.set("brand", f.brandIds.join(","));
  if (f.minPrice !== undefined) sp.set("min", String(f.minPrice));
  if (f.maxPrice !== undefined) sp.set("max", String(f.maxPrice));
  if (f.inStockOnly) sp.set("stock", "1");
  if (fitOnly) sp.set("fit", "1");
  if (sort !== "recommended") sp.set("sort", sort);
  return sp;
}

/** Serializes a Next.js `searchParams` object into a query string. */
export function toQueryString(sp: Record<string, string | string[] | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(sp)) {
    if (Array.isArray(value)) value.forEach((v) => params.append(key, v));
    else if (value !== undefined) params.set(key, value);
  }
  return params.toString();
}
