"use client";

import { useMemo } from "react";
import { categoryUsage, brandUsage } from "@/lib/catalog/relations";
import { seed } from "@/lib/seed";
import { isCatalogData, KEYS, sanitizeCatalog } from "@/lib/storage";
import type {
  Brand,
  CatalogData,
  Category,
  CompatibilityStatus,
  ID,
  Order,
  OrderStatus,
  Product,
  StoreSettings,
  Vehicle,
} from "@/lib/types";
import { createPersistentStore, useHydrated, useStore } from "./persistent-store";

/**
 * The single catalog data set shared by the storefront and the admin panel.
 * It starts from the seed and, once edited in the admin, is persisted in this browser.
 */
export const catalogStore = createPersistentStore<CatalogData>(KEYS.catalog, seed, isCatalogData, sanitizeCatalog);

type Result = { ok: true } | { ok: false; reason: string };

const upsert = <T extends { id: ID }>(list: T[], item: T) =>
  list.some((x) => x.id === item.id) ? list.map((x) => (x.id === item.id ? item : x)) : [...list, item];

const update = (fn: (d: CatalogData) => CatalogData) => catalogStore.set(fn);

export const catalogActions = {
  saveProduct(p: Product) {
    update((d) => ({ ...d, products: upsert(d.products, p) }));
  },
  deleteProduct(id: ID) {
    update((d) => ({
      ...d,
      products: d.products.filter((p) => p.id !== id),
      compatibility: d.compatibility.filter((r) => r.productId !== id),
    }));
  },
  saveCategory(c: Category) {
    update((d) => ({ ...d, categories: upsert(d.categories, c) }));
  },
  deleteCategory(id: ID): Result {
    const d = catalogStore.get();
    const children = d.categories.filter((c) => c.parentId === id).length;
    if (children > 0) return { ok: false, reason: `Bu grubun ${children} alt kategorisi var. Önce alt kategorileri silin veya taşıyın.` };
    const used = categoryUsage(d.products, d.categories, id);
    if (used > 0) return { ok: false, reason: `Bu kategoride ${used} ürün var. Önce ürünleri başka kategoriye taşıyın.` };
    update((x) => ({ ...x, categories: x.categories.filter((c) => c.id !== id) }));
    return { ok: true };
  },
  saveBrand(b: Brand) {
    update((d) => ({ ...d, brands: upsert(d.brands, b) }));
  },
  deleteBrand(id: ID): Result {
    const used = brandUsage(catalogStore.get().products, id);
    if (used > 0) return { ok: false, reason: `Bu markaya bağlı ${used} ürün var. Önce ürünlerin markasını değiştirin.` };
    update((d) => ({ ...d, brands: d.brands.filter((b) => b.id !== id) }));
    return { ok: true };
  },
  saveVehicle(v: Vehicle) {
    update((d) => ({ ...d, vehicles: upsert(d.vehicles, v) }));
  },
  deleteVehicle(id: ID) {
    update((d) => ({
      ...d,
      vehicles: d.vehicles.filter((v) => v.id !== id),
      compatibility: d.compatibility.filter((r) => r.vehicleId !== id),
    }));
  },
  /** Sets one explicit record; `null` removes it (back to "unknown"). */
  setCompatibility(productId: ID, vehicleId: ID, status: CompatibilityStatus | null) {
    update((d) => {
      const rest = d.compatibility.filter((r) => !(r.productId === productId && r.vehicleId === vehicleId));
      if (status === null) return { ...d, compatibility: rest };
      const previous = d.compatibility.find((r) => r.productId === productId && r.vehicleId === vehicleId);
      return {
        ...d,
        compatibility: [
          ...rest,
          { id: previous?.id ?? `c-${productId}-${vehicleId}`, productId, vehicleId, status, note: previous?.note },
        ],
      };
    });
  },
  /** Replaces every record of a product (used by the product form). */
  replaceCompatibility(productId: ID, rows: { vehicleId: ID; status: CompatibilityStatus }[]) {
    update((d) => ({
      ...d,
      compatibility: [
        ...d.compatibility.filter((r) => r.productId !== productId),
        ...rows.map((r) => ({ id: `c-${productId}-${r.vehicleId}`, productId, vehicleId: r.vehicleId, status: r.status })),
      ],
    }));
  },
  updateOrderStatus(id: ID, status: OrderStatus) {
    update((d) => ({ ...d, orders: d.orders.map((o) => (o.id === id ? { ...o, status } : o)) }));
  },
  placeOrder(order: Order, updatedProducts: Product[]) {
    update((d) => ({ ...d, products: updatedProducts, orders: [order, ...d.orders] }));
  },
  saveSettings(settings: StoreSettings) {
    update((d) => ({ ...d, settings }));
  },
  /** Restores the demo catalog. Cart, favorites and garage are kept. */
  resetDemoData() {
    catalogStore.reset();
  },
};

export function useCatalog() {
  const data = useStore(catalogStore);
  const hydrated = useHydrated();
  return useMemo(() => ({ ...data, hydrated }), [data, hydrated]);
}

export function useCatalogLookups() {
  const { products, categories, brands, vehicles } = useCatalog();
  return useMemo(
    () => ({
      productById: new Map(products.map((p) => [p.id, p])),
      categoryById: new Map(categories.map((c) => [c.id, c])),
      brandById: new Map(brands.map((b) => [b.id, b])),
      vehicleById: new Map(vehicles.map((v) => [v.id, v])),
    }),
    [products, categories, brands, vehicles],
  );
}
