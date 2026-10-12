import type { Cart, CartItem, ID, Product } from "@/lib/types";

/**
 * `unavailable`: product deleted, unpublished or out of stock — excluded from totals.
 * `insufficient`: requested quantity exceeds current stock.
 */
export type LineState = "ok" | "insufficient" | "unavailable";

export interface CartLine {
  item: CartItem;
  product: Product | null;
  state: LineState;
  lineTotal: number;
}

export interface ResolvedCart {
  lines: CartLine[];
  subtotal: number;
  itemCount: number;
  /** Quantities of lines that can be bought (excludes unavailable lines). */
  purchasableCount: number;
  canCheckout: boolean;
}

const roundMoney = (n: number) => Math.round(n * 100) / 100;

/** Merges duplicate product lines (e.g. from hand-edited storage) by summing quantities. */
export function normalizeCart(cart: Cart): Cart {
  const merged = new Map<ID, number>();
  for (const i of cart.items) merged.set(i.productId, (merged.get(i.productId) ?? 0) + i.quantity);
  return { items: [...merged].map(([productId, quantity]) => ({ productId, quantity })) };
}

export function addItem(cart: Cart, productId: ID, qty: number, stock: number): Cart {
  if (stock <= 0 || qty <= 0) return cart;
  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) {
    return {
      items: cart.items.map((i) =>
        i.productId === productId ? { ...i, quantity: Math.min(i.quantity + qty, stock) } : i,
      ),
    };
  }
  return { items: [...cart.items, { productId, quantity: Math.min(qty, stock) }] };
}

export function setQuantity(cart: Cart, productId: ID, qty: number): Cart {
  if (qty <= 0) return removeItem(cart, productId);
  return { items: cart.items.map((i) => (i.productId === productId ? { ...i, quantity: Math.floor(qty) } : i)) };
}

export function removeItem(cart: Cart, productId: ID): Cart {
  return { items: cart.items.filter((i) => i.productId !== productId) };
}

export function resolveCart(cart: Cart, products: Product[]): ResolvedCart {
  const byId = new Map(products.map((p) => [p.id, p]));
  const lines: CartLine[] = cart.items.map((item) => {
    const product = byId.get(item.productId) ?? null;
    if (!product || product.status !== "published" || product.stock <= 0) {
      return { item, product, state: "unavailable", lineTotal: 0 };
    }
    const state: LineState = item.quantity > product.stock ? "insufficient" : "ok";
    return { item, product, state, lineTotal: roundMoney(product.price * item.quantity) };
  });

  const counted = lines.filter((l) => l.state !== "unavailable");
  return {
    lines,
    subtotal: roundMoney(counted.reduce((sum, l) => sum + l.lineTotal, 0)),
    itemCount: cart.items.reduce((sum, i) => sum + i.quantity, 0),
    purchasableCount: counted.reduce((sum, l) => sum + l.item.quantity, 0),
    canCheckout: lines.length > 0 && lines.every((l) => l.state === "ok"),
  };
}
