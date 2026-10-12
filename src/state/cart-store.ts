"use client";

import { useMemo } from "react";
import { addItem, normalizeCart, removeItem, resolveCart, setQuantity } from "@/lib/cart";
import { isCart, KEYS } from "@/lib/storage";
import { planKitAdd } from "@/lib/kits";
import type { Cart, ID, MaintenanceKit } from "@/lib/types";
import { catalogStore, useCatalog } from "./catalog-store";
import { createPersistentStore, useStore } from "./persistent-store";

export const cartStore = createPersistentStore<Cart>(KEYS.cart, { items: [] }, isCart, { normalize: normalizeCart });

export const cartActions = {
  /** Adds up to the product's current stock. Returns false when nothing could be added. */
  add(productId: ID, qty = 1): boolean {
    const product = catalogStore.get().products.find((p) => p.id === productId);
    if (!product || product.status !== "published" || product.stock <= 0) return false;
    cartStore.set((c) => addItem(c, productId, qty, product.stock));
    return true;
  },
  setQty(productId: ID, qty: number) {
    cartStore.set((c) => setQuantity(c, productId, qty));
  },
  remove(productId: ID) {
    cartStore.set((c) => removeItem(c, productId));
  },
  /** Adds every addable kit line, capped at stock. Reports added lines, stock-capped lines and skipped lines. */
  addKit(kit: MaintenanceKit, vehicleId?: ID): { added: number; capped: string[]; skipped: string[] } {
    const data = catalogStore.get();
    const plan = planKitAdd(kit, data.products, cartStore.get(), vehicleId ? { vehicleId, records: data.compatibility } : undefined);
    const stockOf = new Map(data.products.map((p) => [p.id, p.stock]));
    cartStore.set((c) => plan.adds.reduce((acc, a) => addItem(acc, a.productId, a.quantity, stockOf.get(a.productId) ?? 0), c));
    return { added: plan.adds.length, capped: plan.capped, skipped: plan.skipped };
  },
  clear() {
    cartStore.set({ items: [] });
  },
};

export function useCart() {
  const cart = useStore(cartStore);
  const { products } = useCatalog();
  const resolved = useMemo(() => resolveCart(cart, products), [cart, products]);
  return { cart, resolved, ...cartActions };
}
