import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { seed } from "@/lib/seed";

const { products, categories, brands, vehicles, compatibility, orders } = seed;
const byId = <T extends { id: string }>(list: T[]) => new Map(list.map((x) => [x.id, x]));
const categoryById = byId(categories);
const unique = (values: string[]) => new Set(values).size === values.length;

describe("seed categories", () => {
  it("has exactly the three root groups", () => {
    const roots = categories.filter((c) => c.parentId === null).map((c) => c.name);
    expect(roots.sort()).toEqual(["Bakım & Temizlik", "OEM Parçalar", "Performans"].sort());
  });

  it("is at most two levels deep", () => {
    for (const c of categories.filter((c) => c.parentId !== null)) {
      const parent = categoryById.get(c.parentId!);
      expect(parent, c.slug).toBeDefined();
      expect(parent!.parentId, c.slug).toBeNull();
    }
  });
});

describe("seed products", () => {
  it("reference existing subcategories and brands", () => {
    const brandIds = new Set(brands.map((b) => b.id));
    for (const p of products) {
      const cat = categoryById.get(p.categoryId);
      expect(cat?.parentId, p.slug).not.toBeNull();
      expect(cat, p.slug).toBeDefined();
      expect(brandIds.has(p.brandId), p.slug).toBe(true);
    }
  });

  it("have unique ids, slugs and SKUs and url-safe slugs", () => {
    expect(unique(products.map((p) => p.id))).toBe(true);
    expect(unique(products.map((p) => p.slug))).toBe(true);
    expect(unique(products.map((p) => p.sku))).toBe(true);
    for (const p of products) expect(p.slug).toMatch(/^[a-z0-9-]+$/);
  });

  it("cover the required counts and stock states", () => {
    expect(products.length).toBeGreaterThanOrEqual(40);
    expect(products.length).toBeLessThanOrEqual(50);
    expect(brands.length).toBeGreaterThanOrEqual(8);
    expect(products.filter((p) => p.stock === 0).length).toBeGreaterThanOrEqual(3);
    expect(products.filter((p) => p.stock >= 1 && p.stock <= 5).length).toBeGreaterThanOrEqual(3);
    expect(products.filter((p) => p.status === "draft").length).toBeGreaterThanOrEqual(2);
    expect(products.filter((p) => p.featured && p.status === "published").length).toBeGreaterThanOrEqual(6);
  });

  it("point to image files that exist", () => {
    const srcs = new Set([
      ...products.flatMap((p) => p.images.map((i) => i.src)),
      ...categories.flatMap((c) => (c.image ? [c.image] : [])),
      "/products/fallback.svg",
    ]);
    for (const src of srcs) expect(existsSync(path.join("public", src)), src).toBe(true);
  });

  it("only use comparison prices above the selling price", () => {
    for (const p of products) {
      if (p.compareAtPrice !== undefined) expect(p.compareAtPrice, p.slug).toBeGreaterThan(p.price);
    }
  });
});

describe("seed vehicles", () => {
  it("has 40–45 records across the four makes", () => {
    expect(vehicles.length).toBeGreaterThanOrEqual(40);
    expect(vehicles.length).toBeLessThanOrEqual(45);
    expect([...new Set(vehicles.map((v) => v.make))].sort()).toEqual(
      ["Audi", "BMW", "Mercedes-Benz", "Porsche"].sort(),
    );
  });

  it("includes every BMW generation the owner asked for", () => {
    const gens = new Set(vehicles.filter((v) => v.make === "BMW").map((v) => v.generation));
    for (const g of ["E30", "E36", "E46", "E90", "E92", "G20", "E39", "E60", "F10", "G30", "F20"]) {
      expect(gens.has(g), g).toBe(true);
    }
  });

  it("has valid year ranges and unique ids", () => {
    expect(unique(vehicles.map((v) => v.id))).toBe(true);
    for (const v of vehicles) if (v.yearTo !== null) expect(v.yearTo, v.id).toBeGreaterThanOrEqual(v.yearFrom);
  });
});

describe("seed compatibility", () => {
  const productById = byId(products);
  const vehicleIds = new Set(vehicles.map((v) => v.id));

  it("references existing products and vehicles, without duplicates", () => {
    for (const r of compatibility) {
      expect(productById.has(r.productId), r.id).toBe(true);
      expect(vehicleIds.has(r.vehicleId), r.id).toBe(true);
    }
    expect(unique(compatibility.map((r) => `${r.productId}|${r.vehicleId}`))).toBe(true);
    expect(unique(compatibility.map((r) => r.id))).toBe(true);
  });

  it("never attaches records to universal products", () => {
    for (const r of compatibility) expect(productById.get(r.productId)!.fitmentType, r.id).toBe("vehicle-specific");
  });

  it("contains every compatibility status", () => {
    const statuses = new Set(compatibility.map((r) => r.status));
    expect(statuses).toEqual(new Set(["confirmed", "unverified", "incompatible"]));
  });
});

describe("seed orders", () => {
  it("has 4–6 internally consistent orders with mixed statuses", () => {
    expect(orders.length).toBeGreaterThanOrEqual(4);
    expect(orders.length).toBeLessThanOrEqual(6);
    expect(new Set(orders.map((o) => o.status)).size).toBeGreaterThanOrEqual(3);
    for (const o of orders) {
      const subtotal = o.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
      expect(o.subtotal, o.reference).toBeCloseTo(subtotal, 2);
      expect(o.total, o.reference).toBeCloseTo(o.subtotal + o.shipping, 2);
      expect(o.reference).toMatch(/^KS-\d{6}-[A-Z0-9]{4}$/);
    }
  });
});

describe("seed honesty", () => {
  it("contains no invented comparison prices", () => {
    expect(products.filter((p) => p.compareAtPrice !== undefined).map((p) => p.id)).toEqual([]);
  });
});
