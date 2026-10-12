import { describe, expect, it } from "vitest";
import { seed } from "@/lib/seed";
import { allOemNumbers, findVehicleBySlug, partsForVehicle, productsByOem, vehicleSlug } from "@/lib/seo";

const { products, vehicles, categories, compatibility } = seed;
const e46 = vehicles.find((v) => v.id === "v-bmw-e46-320d")!;

describe("vehicle slugs", () => {
  it("builds readable, unique slugs that round-trip", () => {
    expect(vehicleSlug(e46)).toBe("bmw-e46-320d");
    const slugs = vehicles.map(vehicleSlug);
    expect(new Set(slugs).size).toBe(slugs.length);
    for (const v of vehicles) expect(findVehicleBySlug(vehicles, vehicleSlug(v))).toBe(v);
    expect(findVehicleBySlug(vehicles, "yok")).toBeUndefined();
  });
});

describe("OEM lookups", () => {
  it("finds products by OEM number typed with dots or spaces", () => {
    expect(productsByOem(products, "34.11.6.860.912").map((p) => p.id)).toEqual(["p-002"]);
    expect(productsByOem(products, "34 11 6 860 912").map((p) => p.id)).toEqual(["p-002"]);
    expect(productsByOem(products, "123")).toEqual([]);
  });

  it("lists every published OEM number once, normalized", () => {
    const list = allOemNumbers(products);
    expect(list.filter((n) => n === "34116860912")).toHaveLength(1);
    expect(list.every((n) => /^[A-Z0-9]+$/.test(n))).toBe(true);
    expect(list).not.toContain("A2122402117"); // only on a draft product
  });
});

describe("partsForVehicle", () => {
  it("groups confirmed parts by category and keeps unverified ones apart", () => {
    const { confirmed, unverified } = partsForVehicle(products, categories, compatibility, e46.id);
    const confirmedIds = confirmed.flatMap((g) => g.products.map((p) => p.id));
    expect(confirmedIds).toContain("p-036");
    expect(confirmedIds).not.toContain("p-001");
    expect(unverified.map((p) => p.id)).toContain("p-001");
    expect(confirmed.every((g) => g.category.parentId !== null && g.products.length > 0)).toBe(true);
  });
});
