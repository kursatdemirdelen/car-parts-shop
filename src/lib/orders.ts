import type { Address, Cart, Order, PaymentMethod, Product, StoreSettings } from "@/lib/types";
import { resolveCart } from "./cart";
import { newId, orderReference } from "./ids";
import { shippingFor } from "./shipping";

interface CreateOrderInput {
  cart: Cart;
  products: Product[];
  settings: StoreSettings;
  address: Address;
  paymentMethod: PaymentMethod;
  note?: string;
  now: Date;
}

/**
 * Builds a demo order from the cart. Item names, SKUs and prices are copied so later
 * catalog edits never change the order. Returns the products with stock decremented.
 */
export function createOrder(input: CreateOrderInput): { order: Order; updatedProducts: Product[] } | { error: string } {
  const resolved = resolveCart(input.cart, input.products);
  if (!resolved.canCheckout) {
    return { error: "Sepetteki bazı ürünler şu an satın alınamıyor. Lütfen sepetini kontrol et." };
  }

  const items = resolved.lines.map(({ item, product }) => ({
    productId: product!.id,
    name: product!.name,
    sku: product!.sku,
    unitPrice: product!.price,
    quantity: item.quantity,
  }));
  const shipping = shippingFor(resolved.subtotal, input.settings);
  const order: Order = {
    id: newId("o"),
    reference: orderReference(input.now),
    createdAt: input.now.toISOString(),
    status: "received",
    items,
    subtotal: resolved.subtotal,
    shipping,
    total: Math.round((resolved.subtotal + shipping) * 100) / 100,
    address: input.address,
    paymentMethod: input.paymentMethod,
    note: input.note?.trim() || undefined,
  };

  const quantities = new Map(items.map((i) => [i.productId, i.quantity]));
  const updatedProducts = input.products.map((p) =>
    quantities.has(p.id) ? { ...p, stock: p.stock - quantities.get(p.id)!, updatedAt: order.createdAt } : p,
  );
  return { order, updatedProducts };
}
