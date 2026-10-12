"use client";

import { useMemo } from "react";
import { addItem, removeItem, resolveCart, setQuantity } from "@/lib/cart";
import { isCart, KEYS } from "@/lib/storage";
import type { Cart, ID } from "@/lib/types";
import { catalogStore, useCatalog } from "./catalog-store";
import { createPersistentStore, useStore } from "./persistent-store";

export const cartStore = createPersistentStore<Cart>(KEYS.cart, { items: [] }, isCart);

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
