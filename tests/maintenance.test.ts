import { describe, expect, it } from "vitest";
import {
  addMonths,
  fuelTypeOf,
  isIsoDate,
  isOdometerStale,
  itemStatus,
  itemsFor,
  lastEntry,
  type MaintenanceItem,
  type ServiceEntry,
  validateOdometer,
  validateServiceInput,
  vehicleSchedule,
} from "@/lib/maintenance";
import { fitsVehicle } from "@/lib/catalog/fitment";
import { itemCategorySlug, kitsForItem, productsForItem } from "@/lib/maintenance-recommendations";
import { seed } from "@/lib/seed";
import type { Vehicle } from "@/lib/types";

const TODAY = "2026-10-13";
const vehicle = (id: string) => seed.vehicles.find((v) => v.id === id)!;
const fake = (make: string, generation: string, engine: string): Vehicle => ({
  id: "v-x", make, model: "M", generation, yearFrom: 2010, yearTo: null, engine,
});
const OIL: MaintenanceItem = { id: "engine-oil", name: "Motor yağı + yağ filtresi", interval: { km: 15000, months: 12 } };
const BRAKE: MaintenanceItem = { id: "brake-fluid", name: "Fren hidroliği", interval: { km: null, months: 24 } };
const entry = (date: string, km: number | null, itemId: ServiceEntry["itemId"] = "engine-oil", id = "e"): ServiceEntry => ({
  id, itemId, date, km,
});

describe("fuelTypeOf", () => {
  it("detects diesel engines", () => {
    for (const engine of ["320d 2.0 (190 HP)", "xDrive30d 3.0 (258 HP)", "730d 3.0 (265 HP)", "C 220 d 2.1 (170 HP)",
      "C 220 CDI 2.1 (170 HP)", "2.0 TDI (143 HP)", "Cayenne Diesel 3.0 V6 (245 HP)"])
      expect(fuelTypeOf(fake("X", "Y", engine)), engine).toBe("diesel");
  });

  it("treats everything else, hybrids included, as petrol", () => {
    for (const engine of ["M340i 3.0 (374 HP)", "530e 2.0 Plug-in Hybrid (292 HP)", "M3 Competition 3.0 (510 HP)", "sDrive18i 1.5 (136 HP)"])
      expect(fuelTypeOf(fake("X", "Y", engine)), engine).toBe("petrol");
  });

  it("maps every seed vehicle", () => {
    for (const v of seed.vehicles) expect(["petrol", "diesel"]).toContain(fuelTypeOf(v));
  });
});

describe("itemsFor", () => {
  const find = (v: Vehicle, id: string) => itemsFor(v).find((i) => i.id === id);

  it("uses the BMW LongLife table and drops spark plugs for diesel", () => {
    const v = vehicle("v-bmw-e46-320d");
    expect(find(v, "spark-plugs")).toBeUndefined();
    expect(find(v, "engine-oil")!.interval).toEqual({ km: 25000, months: 24 });
  });

  it("keeps the general table for pre-LongLife E30/E36", () => {
    const v = vehicle("v-bmw-e36-318i");
    expect(find(v, "spark-plugs")).toBeDefined();
    expect(find(v, "engine-oil")!.interval).toEqual({ km: 15000, months: 12 });
  });

  it("uses the general table for other makes", () => {
    expect(find(vehicle("v-mercedes-benz-w205-c200"), "engine-oil")!.interval).toEqual({ km: 15000, months: 12 });
  });

  it("uses the longer BMW petrol fuel filter interval", () => {
    expect(find(vehicle("v-bmw-f30-320i-ed"), "fuel-filter")!.interval).toEqual({ km: 100000, months: 72 });
    expect(find(vehicle("v-bmw-f30-320d"), "fuel-filter")!.interval).toEqual({ km: 60000, months: 48 });
  });
});

describe("dates", () => {
  it("adds months and clamps to the month end", () => {
    expect(addMonths("2026-01-31", 1)).toBe("2026-02-28");
    expect(addMonths("2024-02-29", 12)).toBe("2025-02-28");
    expect(addMonths("2025-11-15", 3)).toBe("2026-02-15");
  });

  it("rejects malformed or impossible dates", () => {
    for (const d of ["2026-13-40", "2026-02-30", "13.10.2026", ""]) expect(isIsoDate(d), d).toBe(false);
    expect(isIsoDate("2024-02-29")).toBe(true);
  });
});

describe("itemStatus", () => {
  it("is unknown without a log entry", () => {
    const s = itemStatus(OIL, null, 100000, TODAY);
    expect(s.status).toBe("unknown");
    expect(s.label).toBe("Son değişim bilinmiyor");
  });

  it("is overdue when the time limit has passed, even without km", () => {
    expect(itemStatus(OIL, entry("2025-09-01", null), null, TODAY).status).toBe("overdue");
  });

  it("is soon within 30 days of a time-only interval", () => {
    const s = itemStatus(BRAKE, entry("2024-10-25", null, "brake-fluid"), null, TODAY);
    expect(s.status).toBe("soon");
    expect(s.label).toBe("12 gün kaldı");
  });

  it("is soon within 1.500 km", () => {
    const s = itemStatus(OIL, entry("2026-01-01", 100000), 113600, TODAY);
    expect(s.status).toBe("soon");
    expect(s.label).toBe("1.400 km kaldı");
  });

  it("is overdue once the km limit is reached", () => {
    expect(itemStatus(OIL, entry("2026-01-01", 100000), 115000, TODAY).status).toBe("overdue");
  });

  it("uses time alone when the current km is unknown", () => {
    const s = itemStatus(OIL, entry("2026-09-01", 100000), null, TODAY);
    expect(s.status).toBe("ok");
    expect(s.remainingKm).toBeNull();
  });

  it("ignores km when the logged km is above the current km (typo)", () => {
    const s = itemStatus(OIL, entry("2026-09-01", 120000), 110000, TODAY);
    expect(s.remainingKm).toBeNull();
    expect(s.status).toBe("ok");
    expect(s.label).not.toMatch(/NaN|-/);
  });

  it("is overdue on the due date itself", () => {
    const s = itemStatus(OIL, entry("2025-10-13", null), null, TODAY);
    expect(s.status).toBe("overdue");
    expect(s.label).toBe("Süresi bugün doldu");
  });

  it("labels long delays in months", () => {
    expect(itemStatus(OIL, entry("2025-06-13", null), null, TODAY).label).toBe("4 ay gecikti");
  });
});

describe("vehicleSchedule", () => {
  it("orders overdue, soon, unknown, then ok", () => {
    const v = vehicle("v-bmw-f30-320d");
    const log = [
      entry("2024-01-01", null, "brake-fluid", "a"), // overdue
      entry("2026-10-01", 120000, "engine-oil", "b"), // ok
      entry("2024-10-25", null, "coolant", "c"), // 48 months → ok
      entry("2022-11-01", null, "coolant", "d"), // older coolant entry, ignored
      entry("2024-11-05", null, "air-filter", "e"), // 48 months → ok
    ];
    const statuses = vehicleSchedule(v, { odometer: { km: 121000, updatedAt: TODAY }, log }, TODAY).map((s) => s.status);
    const rank = { overdue: 0, soon: 1, unknown: 2, ok: 3 };
    expect(statuses[0]).toBe("overdue");
    expect(statuses.map((s) => rank[s])).toEqual([...statuses.map((s) => rank[s])].sort((a, b) => a - b));
  });
});

describe("lastEntry", () => {
  it("picks the newest date regardless of array order", () => {
    const log = [entry("2026-05-01", null, "engine-oil", "new"), entry("2025-01-01", null, "engine-oil", "old")];
    expect(lastEntry(log, "engine-oil")!.id).toBe("new");
    expect(lastEntry(log, "coolant")).toBeNull();
  });
});

describe("isOdometerStale", () => {
  it("flags readings older than 90 days", () => {
    expect(isOdometerStale({ km: 1, updatedAt: "2026-07-14" }, TODAY)).toBe(true); // 91 days
    expect(isOdometerStale({ km: 1, updatedAt: "2026-07-15" }, TODAY)).toBe(false); // 90 days
    expect(isOdometerStale(null, TODAY)).toBe(false);
  });
});

describe("validation", () => {
  it("validates the odometer", () => {
    for (const bad of ["abc", "-5", "1.5", "2000001", ""])
      expect(validateOdometer(bad).error, bad).toBe("Km 0 ile 2.000.000 arasında bir tam sayı olmalı.");
    expect(validateOdometer("98000").km).toBe(98000);
    expect(validateOdometer(" 98.000 ").km).toBe(98000);
  });

  it("validates a service entry", () => {
    expect(validateServiceInput("2026-10-14", "", TODAY).errors.date).toBe("Tarih bugünden ileri olamaz.");
    expect(validateServiceInput("2026-02-30", "", TODAY).errors.date).toBe("Geçerli bir tarih gir.");
    const ok = validateServiceInput("2026-01-01", "", TODAY);
    expect(ok.errors).toEqual({});
    expect(ok.km).toBeNull();
    expect(validateServiceInput("2026-01-01", "98.000", TODAY).km).toBe(98000);
    expect(validateServiceInput("2026-01-01", "x", TODAY).errors.km).toBe("Km 0 ile 2.000.000 arasında bir tam sayı olmalı.");
  });
});

describe("recommendations", () => {
  const catalog = seed;

  it("never recommends glow plugs as spark plugs", () => {
    const names = productsForItem("spark-plugs", "v-bmw-e90-320i", catalog, 10).map((p) => p.name);
    expect(names.length).toBeGreaterThan(0);
    expect(names.some((n) => n.includes("Kızdırma"))).toBe(false);
    expect(productsForItem("spark-plugs", "v-bmw-e90-320d", catalog, 10).some((p) => p.name.includes("Kızdırma"))).toBe(false);
  });

  it("only returns products that fit the vehicle", () => {
    const result = productsForItem("air-filter", "v-bmw-e46-320d", catalog);
    expect(result.map((p) => p.id)).toContain("p-007");
    for (const p of result) expect(fitsVehicle(p, "v-bmw-e46-320d", catalog.compatibility), p.id).toBe(true);
  });

  it("skips unverified fitment", () => {
    expect(productsForItem("fuel-filter", "v-bmw-e60-520d", catalog, 10).map((p) => p.id)).not.toContain("p-009");
  });

  it("skips drafts", () => {
    const drafted = { ...catalog, products: catalog.products.map((p) => (p.id === "p-007" ? { ...p, status: "draft" as const } : p)) };
    expect(productsForItem("air-filter", "v-bmw-e46-320d", drafted).map((p) => p.id)).not.toContain("p-007");
  });

  it("returns at most 3 products by default", () => {
    expect(productsForItem("engine-oil", "v-bmw-f30-320d", catalog).length).toBeLessThanOrEqual(3);
    expect(productsForItem("engine-oil", "v-bmw-f30-320d", catalog, 10).length).toBeGreaterThan(3);
  });

  it("prefers vehicle-specific parts over universal ones", () => {
    const [first] = productsForItem("engine-oil", "v-bmw-f30-320d", catalog);
    expect(first.fitmentType).toBe("vehicle-specific");
  });

  it("finds kits that cover the item", () => {
    expect(kitsForItem("engine-oil", "v-bmw-e46-320d", catalog).map((k) => k.id)).toEqual(["kit-e46-320d-bakim"]);
    expect(kitsForItem("coolant", "v-bmw-e46-320d", catalog)).toEqual([]);
  });

  it("has nothing for Porsche coolant and links to the fluids category", () => {
    expect(productsForItem("coolant", "v-porsche-991-carrera-s", catalog)).toEqual([]);
    expect(itemCategorySlug("coolant")).toBe("motor-yagi-sivilar");
  });
});
