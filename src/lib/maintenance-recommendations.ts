import { fitsVehicle } from "@/lib/catalog/fitment";
import { normalizeText } from "@/lib/catalog/search";
import { kitsForVehicle } from "@/lib/kits";
import type { MaintenanceItemId } from "@/lib/maintenance";
import type { CatalogData, Category, ID, MaintenanceKit, Product } from "@/lib/types";

/**
 * Maps maintenance items to catalog products by subcategory and name keywords, so products added in the
 * admin match automatically. Only published products with a confirmed (or universal) fit are recommended.
 */
export const ITEM_MATCHERS: Record<MaintenanceItemId, { categorySlugs: string[]; keywords: string[]; exclude?: string[] }> = {
  "engine-oil": { categorySlugs: ["filtreler", "motor-yagi-sivilar"], keywords: ["yag filtresi", "motor yagi"] },
  "cabin-filter": { categorySlugs: ["filtreler"], keywords: ["polen"] },
  "air-filter": { categorySlugs: ["filtreler"], keywords: ["hava filtresi"] },
  "spark-plugs": { categorySlugs: ["atesleme"], keywords: ["buji"], exclude: ["kizdirma"] },
  "fuel-filter": { categorySlugs: ["filtreler"], keywords: ["yakit filtresi"] },
  "brake-fluid": { categorySlugs: ["motor-yagi-sivilar"], keywords: ["fren hidroligi"] },
  coolant: { categorySlugs: ["motor-yagi-sivilar", "sogutma"], keywords: ["antifriz"] },
};

export function itemCategorySlug(itemId: MaintenanceItemId): string {
  return ITEM_MATCHERS[itemId].categorySlugs[0];
}

export function productMatchesItem(product: Product, itemId: MaintenanceItemId, categories: Category[]): boolean {
  const { categorySlugs, keywords, exclude = [] } = ITEM_MATCHERS[itemId];
  const slug = categories.find((c) => c.id === product.categoryId)?.slug;
  if (!slug || !categorySlugs.includes(slug)) return false;
  const name = normalizeText(product.name);
  return keywords.some((k) => name.includes(k)) && !exclude.some((k) => name.includes(k));
}

export function productsForItem(
  itemId: MaintenanceItemId,
  vehicleId: ID,
  catalog: Pick<CatalogData, "products" | "categories" | "compatibility">,
  limit = 3,
): Product[] {
  return catalog.products
    .filter(
      (p) =>
        p.status === "published" &&
        productMatchesItem(p, itemId, catalog.categories) &&
        fitsVehicle(p, vehicleId, catalog.compatibility),
    )
    .sort(
      (a, b) =>
        Number(b.stock > 0) - Number(a.stock > 0) ||
        Number(!!b.featured) - Number(!!a.featured) ||
        a.name.localeCompare(b.name, "tr"),
    )
    .slice(0, limit);
}

export function kitsForItem(
  itemId: MaintenanceItemId,
  vehicleId: ID,
  catalog: Pick<CatalogData, "products" | "categories" | "kits">,
): MaintenanceKit[] {
  const byId = new Map(catalog.products.map((p) => [p.id, p]));
  return kitsForVehicle(catalog.kits, vehicleId).filter((kit) =>
    kit.lines.some((line) => {
      const p = byId.get(line.productId);
      return p !== undefined && productMatchesItem(p, itemId, catalog.categories);
    }),
  );
}
