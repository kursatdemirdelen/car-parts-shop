import { describe, expect, it } from "vitest";
import { cascadeDeleteProduct, cascadeDeleteVehicle, companionsFor, kitsForVehicle, planKitAdd, resolveKit } from "@/lib/kits";
import { fitmentFor } from "@/lib/catalog/fitment";
import { seed } from "@/lib/seed";
import type { MaintenanceKit, Product } from "@/lib/types";

const { products, compatibility, kits, vehicles } = seed;
const byId = new Map(products.map((p) => [p.id, p]));

describe("seed kits and companions", () => {
  it("has 10 consistent kits", () => {
    expect(kits.length).toBe(10);
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

  it("covers the six new BMW kit vehicles", () => {
    for (const vid of ["v-bmw-f30-320d", "v-bmw-f10-520d", "v-bmw-f20-118d", "v-bmw-e90-320i", "v-bmw-g20-320d", "v-bmw-f15-xdrive30d"])
      expect(kitsForVehicle(kits, vid).length, vid).toBeGreaterThan(0);
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

describe("resolveKit with a vehicle", () => {
  const kit: MaintenanceKit = {
    id: "k2", slug: "k2", name: "Test", description: "", vehicleIds: ["v-bmw-e46-320d"], status: "published",
    lines: [{ productId: "p-007", quantity: 1 }, { productId: "p-002", quantity: 1 }, { productId: "p-042", quantity: 1 }],
  };

  it("marks lines without confirmed fitment for the vehicle as not addable", () => {
    const r = resolveKit(kit, products, { vehicleId: "v-bmw-e46-320d", records: compatibility });
    expect(r.lines.map((l) => [l.line.productId, l.available, l.reason])).toEqual([
      ["p-007", true, undefined],
      ["p-002", false, "unverified"],
      ["p-042", true, undefined],
    ]);
    expect(r.total).toBe(byId.get("p-007")!.price + byId.get("p-042")!.price);
  });
});

describe("planKitAdd", () => {
  const kit: MaintenanceKit = {
    id: "k3", slug: "k3", name: "Test", description: "", vehicleIds: [], status: "published",
    lines: [{ productId: "p-044", quantity: 2 }, { productId: "p-006", quantity: 1 }, { productId: "p-005", quantity: 1 }],
  };

  it("adds what fits in stock and reports capped and skipped lines", () => {
    // p-044 has stock 4; 3 are already in the cart, so only 1 of the 2 can be added.
    const plan = planKitAdd(kit, products, { items: [{ productId: "p-044", quantity: 3 }] });
    expect(plan.adds).toEqual([
      { productId: "p-044", quantity: 1 },
      { productId: "p-006", quantity: 1 },
    ]);
    expect(plan.capped).toEqual([byId.get("p-044")!.name]);
    expect(plan.skipped).toEqual([byId.get("p-005")!.name]);
  });

  it("skips a line already at stock in the cart", () => {
    const plan = planKitAdd(kit, products, { items: [{ productId: "p-044", quantity: 4 }] });
    expect(plan.adds.map((a) => a.productId)).toEqual(["p-006"]);
    expect(plan.capped).toEqual([byId.get("p-044")!.name]);
  });
});
