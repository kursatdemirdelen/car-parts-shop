import { describe, expect, it } from "vitest";
import { cascadeDeleteProduct, cascadeDeleteVehicle, companionsFor, kitsForVehicle, resolveKit } from "@/lib/kits";
import { fitmentFor } from "@/lib/catalog/fitment";
import { seed } from "@/lib/seed";
import type { MaintenanceKit, Product } from "@/lib/types";

const { products, compatibility, kits, vehicles } = seed;
const byId = new Map(products.map((p) => [p.id, p]));

describe("seed kits and companions", () => {
  it("has 4–6 consistent kits", () => {
    expect(kits.length).toBeGreaterThanOrEqual(4);
    expect(kits.length).toBeLessThanOrEqual(6);
    const vehicleIds = new Set(vehicles.map((v) => v.id));
    for (const kit of kits) {
      expect(kit.lines.length, kit.slug).toBeGreaterThan(0);
      for (const vid of kit.vehicleIds) {
        expect(vehicleIds.has(vid), kit.slug).toBe(true);
        for (const line of kit.lines) {
          const p = byId.get(line.productId);
          expect(p, `${kit.slug} ${line.productId}`).toBeDefined();
          expect(["confirmed", "universal"], `${kit.slug} ${p!.id} ${vid}`).toContain(fitmentFor(p!, vid, compatibility));
        }
      }
    }
  });

  it("links companions to existing products, never to themselves", () => {
    const withCompanions = products.filter((p) => p.companionIds?.length);
    expect(withCompanions.length).toBeGreaterThanOrEqual(6);
    for (const p of withCompanions) {
      for (const id of p.companionIds!) {
        expect(byId.has(id), `${p.id}→${id}`).toBe(true);
        expect(id).not.toBe(p.id);
      }
    }
  });
});

describe("resolveKit", () => {
  const kit: MaintenanceKit = {
    id: "k", slug: "k", name: "Test", description: "", vehicleIds: [], status: "published",
    lines: [{ productId: "p-006", quantity: 2 }, { productId: "p-005", quantity: 1 }, { productId: "deleted", quantity: 1 }],
  };

  it("totals only available lines and marks the rest unavailable", () => {
    const r = resolveKit(kit, products);
    expect(r.total).toBe(byId.get("p-006")!.price * 2);
    expect(r.availableCount).toBe(1);
    expect(r.lines.map((l) => l.available)).toEqual([true, false, false]);
    expect(r.lines[2].product).toBeNull();
  });

  it("treats draft products as unavailable", () => {
    const drafted: Product[] = products.map((p) => (p.id === "p-006" ? { ...p, status: "draft" } : p));
    expect(resolveKit(kit, drafted).availableCount).toBe(0);
  });
});

describe("kitsForVehicle", () => {
  it("returns published kits for the vehicle only", () => {
    const list = kitsForVehicle(kits, "v-bmw-e46-320d");
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((k) => k.vehicleIds.includes("v-bmw-e46-320d") && k.status === "published")).toBe(true);
    expect(kitsForVehicle([{ ...list[0], status: "draft" }], "v-bmw-e46-320d")).toEqual([]);
  });
});

describe("companionsFor", () => {
  const disc = byId.get("p-004")!;

  it("keeps only confirmed or universal companions when a vehicle is selected", () => {
    const list = companionsFor(disc, products, "v-bmw-e90-320d", compatibility);
    expect(list.length).toBeGreaterThan(0);
    for (const p of list) expect(["confirmed", "universal"]).toContain(fitmentFor(p, "v-bmw-e90-320d", compatibility));
    expect(companionsFor(disc, products, "v-bmw-g20-320i", compatibility).map((p) => p.id)).not.toContain("p-005");
  });

  it("skips deleted and unpublished companions", () => {
    const withGhost = { ...disc, companionIds: ["deleted", "p-028", ...(disc.companionIds ?? [])] };
    const ids = companionsFor(withGhost, products, null, compatibility).map((p) => p.id);
    expect(ids).not.toContain("deleted");
    expect(ids).not.toContain("p-028");
  });
});

describe("cascade deletes", () => {
  it("removes a deleted product from kits and companion lists", () => {
    const next = cascadeDeleteProduct(seed, "p-042");
    expect(next.products.some((p) => p.id === "p-042")).toBe(false);
    expect(next.kits.some((k) => k.lines.some((l) => l.productId === "p-042"))).toBe(false);
    expect(next.products.some((p) => p.companionIds?.includes("p-042"))).toBe(false);
    expect(next.compatibility.some((r) => r.productId === "p-042")).toBe(false);
  });

  it("removes a deleted vehicle from kits and compatibility", () => {
    const next = cascadeDeleteVehicle(seed, "v-bmw-e46-320d");
    expect(next.kits.some((k) => k.vehicleIds.includes("v-bmw-e46-320d"))).toBe(false);
    expect(next.compatibility.some((r) => r.vehicleId === "v-bmw-e46-320d")).toBe(false);
  });
});
