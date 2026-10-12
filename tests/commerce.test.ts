import { describe, expect, it } from "vitest";
import { seed } from "@/lib/seed";
import { addItem, removeItem, resolveCart, setQuantity } from "@/lib/cart";
import { shippingFor } from "@/lib/shipping";
import { createOrder } from "@/lib/orders";
import { orderReference } from "@/lib/ids";
import type { Address, Cart, Product } from "@/lib/types";

const products = seed.products;
const pads = products.find((p) => p.id === "p-002")!; // 2450, stock 14
const filter = products.find((p) => p.id === "p-006")!; // 420, stock 48
const empty: Cart = { items: [] };
const address: Address = {
  fullName: "Test Kişi",
  phone: "05001112233",
  email: "test@ornek.test",
  city: "İstanbul",
  district: "Kadıköy",
  line: "Test Sk. No: 1",
};

describe("cart operations", () => {
  it("adds items and sums quantities for the same product", () => {
    const cart = addItem(addItem(empty, "p-002", 1, 14), "p-002", 2, 14);
    expect(cart.items).toEqual([{ productId: "p-002", quantity: 3 }]);
  });

  it("caps quantity at available stock", () => {
    expect(addItem(empty, "p-002", 50, 14).items[0].quantity).toBe(14);
  });

  it("does not add out-of-stock products", () => {
    expect(addItem(empty, "p-005", 1, 0).items).toEqual([]);
  });

  it("sets quantity and removes on zero", () => {
    const cart = addItem(empty, "p-002", 1, 14);
    expect(setQuantity(cart, "p-002", 4).items[0].quantity).toBe(4);
    expect(setQuantity(cart, "p-002", 0).items).toEqual([]);
    expect(removeItem(cart, "p-002").items).toEqual([]);
  });
});

describe("resolveCart", () => {
  it("computes subtotal and item count", () => {
    const cart: Cart = { items: [{ productId: "p-002", quantity: 2 }, { productId: "p-006", quantity: 1 }] };
    const r = resolveCart(cart, products);
    expect(r.subtotal).toBe(2450 * 2 + 420);
    expect(r.itemCount).toBe(3);
    expect(r.canCheckout).toBe(true);
    expect(r.lines.map((l) => l.state)).toEqual(["ok", "ok"]);
  });

  it("marks deleted products unavailable and excludes them from totals", () => {
    const cart: Cart = { items: [{ productId: "p-002", quantity: 1 }, { productId: "deleted", quantity: 1 }] };
    const r = resolveCart(cart, products);
    expect(r.lines[1].state).toBe("unavailable");
    expect(r.lines[1].product).toBeNull();
    expect(r.subtotal).toBe(2450);
    expect(r.canCheckout).toBe(false);
  });

  it("marks draft products unavailable", () => {
    const drafted: Product[] = products.map((p) => (p.id === "p-002" ? { ...p, status: "draft" } : p));
    const r = resolveCart({ items: [{ productId: "p-002", quantity: 1 }] }, drafted);
    expect(r.lines[0].state).toBe("unavailable");
    expect(r.subtotal).toBe(0);
    expect(r.canCheckout).toBe(false);
  });

  it("marks out-of-stock products unavailable", () => {
    const r = resolveCart({ items: [{ productId: "p-005", quantity: 1 }] }, products);
    expect(r.lines[0].state).toBe("unavailable");
    expect(r.canCheckout).toBe(false);
  });

  it("flags quantities above stock as insufficient", () => {
    const lowered: Product[] = products.map((p) => (p.id === "p-002" ? { ...p, stock: 2 } : p));
    const r = resolveCart({ items: [{ productId: "p-002", quantity: 4 }] }, lowered);
    expect(r.lines[0].state).toBe("insufficient");
    expect(r.canCheckout).toBe(false);
  });

  it("cannot check out an empty cart", () => {
    expect(resolveCart(empty, products).canCheckout).toBe(false);
  });
});

describe("shippingFor", () => {
  const s = { freeShippingThreshold: 2500, shippingFee: 149.9 };
  it("charges the fee below the threshold and nothing at or above it", () => {
    expect(shippingFor(2499.99, s)).toBe(149.9);
    expect(shippingFor(2500, s)).toBe(0);
  });
  it("charges nothing for an empty cart", () => {
    expect(shippingFor(0, s)).toBe(0);
  });
});

describe("orderReference", () => {
  it("uses the KS-YYMMDD-XXXX format", () => {
    expect(orderReference(new Date("2026-10-12T10:00:00Z"))).toMatch(/^KS-261012-[A-Z0-9]{4}$/);
  });
});

describe("createOrder", () => {
  const cart: Cart = { items: [{ productId: "p-002", quantity: 2 }, { productId: "p-006", quantity: 1 }] };
  const now = new Date("2026-10-12T10:00:00Z");

  it("snapshots items and decrements stock", () => {
    const result = createOrder({ cart, products, settings: seed.settings, address, paymentMethod: "cash-on-delivery", now });
    if ("error" in result) throw new Error(result.error);
    const { order, updatedProducts } = result;
    expect(order.reference).toMatch(/^KS-\d{6}-[A-Z0-9]{4}$/);
    expect(order.items[0]).toEqual({ productId: "p-002", name: pads.name, sku: pads.sku, unitPrice: 2450, quantity: 2 });
    expect(order.subtotal).toBe(5320);
    expect(order.shipping).toBe(0);
    expect(order.total).toBe(5320);
    expect(order.status).toBe("received");
    expect(updatedProducts.find((p) => p.id === "p-002")!.stock).toBe(pads.stock - 2);
    expect(updatedProducts.find((p) => p.id === "p-006")!.stock).toBe(filter.stock - 1);
  });

  it("keeps historical totals when a product price changes later", () => {
    const result = createOrder({ cart, products, settings: seed.settings, address, paymentMethod: "bank-transfer", now });
    if ("error" in result) throw new Error(result.error);
    const repriced = result.updatedProducts.map((p) => (p.id === "p-002" ? { ...p, price: 9999 } : p));
    expect(repriced.find((p) => p.id === "p-002")!.price).toBe(9999);
    expect(result.order.total).toBe(5320);
    expect(result.order.items[0].unitPrice).toBe(2450);
  });

  it("refuses a cart that cannot be checked out", () => {
    const result = createOrder({
      cart: { items: [{ productId: "p-005", quantity: 1 }] },
      products,
      settings: seed.settings,
      address,
      paymentMethod: "cash-on-delivery",
      now,
    });
    expect("error" in result).toBe(true);
  });
});
