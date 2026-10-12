import { describe, expect, it } from "vitest";
import { isCatalogData, isGarageState, migrateCatalog, readJSON, sanitizeCatalog, sanitizeGarage, writeJSON } from "@/lib/storage";
import { seed } from "@/lib/seed";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  constructor(private failOnWrite = false) {}
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    if (this.failOnWrite) throw new DOMException("quota", "QuotaExceededError");
    this.data.set(key, value);
  }
}

const isNumberArray = (v: unknown): v is number[] => Array.isArray(v) && v.every((x) => typeof x === "number");

describe("readJSON / writeJSON", () => {
  it("returns the fallback for a missing key", () => {
    expect(readJSON("k", [1], isNumberArray, new MemoryStorage())).toEqual([1]);
  });

  it("returns the fallback for corrupted JSON", () => {
    const store = new MemoryStorage();
    store.setItem("k", "{bad json");
    expect(readJSON("k", [1], isNumberArray, store)).toEqual([1]);
  });

  it("returns the fallback for JSON of the wrong shape", () => {
    const store = new MemoryStorage();
    store.setItem("k", JSON.stringify({ not: "an array" }));
    expect(readJSON("k", [1], isNumberArray, store)).toEqual([1]);
  });

  it("round-trips valid data", () => {
    const store = new MemoryStorage();
    expect(writeJSON("k", [4, 5], store)).toBe(true);
    expect(readJSON("k", [], isNumberArray, store)).toEqual([4, 5]);
  });

  it("reports write failures instead of throwing", () => {
    expect(writeJSON("k", [1], new MemoryStorage(true))).toBe(false);
  });

  it("returns the fallback when no storage is available", () => {
    expect(readJSON("k", [1], isNumberArray, undefined)).toEqual([1]);
    expect(writeJSON("k", [1], undefined)).toBe(false);
  });
});

describe("shape guards", () => {
  it("accepts the seed and rejects partial catalogs", () => {
    expect(isCatalogData(seed)).toBe(true);
    expect(isCatalogData({ products: [] })).toBe(false);
    expect(isCatalogData(null)).toBe(false);
  });

  it("validates garage state", () => {
    expect(isGarageState({ saved: ["a"], selected: null })).toBe(true);
    expect(isGarageState({ saved: "a", selected: null })).toBe(false);
  });
});

describe("sanitizeCatalog", () => {
  it("drops compatibility records whose product or vehicle no longer exists", () => {
    const data = {
      ...seed,
      vehicles: seed.vehicles.filter((v) => v.id !== "v-bmw-g20-320i"),
      products: seed.products.filter((p) => p.id !== "p-001"),
    };
    const clean = sanitizeCatalog(data);
    expect(clean.compatibility.some((r) => r.vehicleId === "v-bmw-g20-320i")).toBe(false);
    expect(clean.compatibility.some((r) => r.productId === "p-001")).toBe(false);
    expect(clean.compatibility.length).toBeGreaterThan(0);
  });
});

describe("sanitizeGarage", () => {
  it("drops vehicles that no longer exist and clears a dangling selection", () => {
    const vehicles = seed.vehicles;
    const v1 = vehicles[0].id;
    expect(sanitizeGarage({ saved: [v1, "gone"], selected: "gone" }, vehicles)).toEqual({ saved: [v1], selected: null });
    expect(sanitizeGarage({ saved: [v1], selected: v1 }, vehicles)).toEqual({ saved: [v1], selected: v1 });
  });
});

describe("isCatalogData element checks (old-format data)", () => {
  it("rejects catalogs whose elements are malformed", () => {
    expect(isCatalogData({ ...seed, products: [null] })).toBe(false);
    const { oemNumbers: _o, ...noOem } = seed.products[0];
    expect(isCatalogData({ ...seed, products: [noOem, ...seed.products.slice(1)] })).toBe(false);
    const { freeShippingThreshold: _f, ...oldSettings } = seed.settings;
    expect(isCatalogData({ ...seed, settings: oldSettings })).toBe(false);
    expect(isCatalogData({ ...seed, vehicles: [{ id: "x" }] })).toBe(false);
    expect(isCatalogData({ ...seed, compatibility: [{ id: "x", productId: "p" }] })).toBe(false);
  });
});

describe("migrateCatalog (data saved before kits existed)", () => {
  it("adds seed kits and keeps the user's edits", () => {
    const { kits: _k, ...old } = seed;
    const edited = { ...old, products: old.products.map((p) => (p.id === "p-002" ? { ...p, price: 1234, companionIds: undefined } : p)) };
    const migrated = migrateCatalog(JSON.parse(JSON.stringify(edited)));
    expect(isCatalogData(migrated)).toBe(true);
    const data = migrated as typeof seed;
    expect(data.kits.length).toBe(seed.kits.length);
    expect(data.products.find((p) => p.id === "p-002")!.price).toBe(1234);
  });

  it("rejects malformed kits", () => {
    expect(isCatalogData({ ...seed, kits: [{ id: "k", lines: "x" }] })).toBe(false);
    expect(isCatalogData({ ...seed, products: [{ ...seed.products[0], companionIds: [1] }] })).toBe(false);
  });
});

describe("migrateCatalog companion backfill", () => {
  it("restores seed companions for products saved before companions existed", () => {
    const old = { ...seed, products: seed.products.map(({ companionIds: _c, ...p }) => p) };
    const migrated = migrateCatalog(JSON.parse(JSON.stringify(old))) as typeof seed;
    expect(migrated.products.find((p) => p.id === "p-004")!.companionIds).toEqual(seed.products.find((p) => p.id === "p-004")!.companionIds);
  });

  it("keeps an explicit empty list and drops companions that no longer exist", () => {
    const data = {
      ...seed,
      products: seed.products
        .filter((p) => p.id !== "p-005")
        .map((p) => {
          if (p.id === "p-006") return { ...p, companionIds: [] };
          if (p.id === "p-004") {
            const { companionIds: _c, ...rest } = p;
            return rest;
          }
          return p;
        }),
    };
    const migrated = migrateCatalog(JSON.parse(JSON.stringify(data))) as typeof seed;
    expect(migrated.products.find((p) => p.id === "p-006")!.companionIds).toEqual([]);
    expect(migrated.products.find((p) => p.id === "p-004")!.companionIds).toEqual(["p-044"]);
  });
});
