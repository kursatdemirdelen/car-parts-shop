import { describe, expect, it } from "vitest";
import { seed } from "@/lib/seed";
import { stockState } from "@/lib/catalog/stock";
import { normalizeCode, normalizeText, searchProducts, suggest } from "@/lib/catalog/search";
import { FITMENT_LABELS, fitmentFor } from "@/lib/catalog/fitment";
import { engines, generations, makes, models, vehicleLabel, years } from "@/lib/catalog/vehicles";
import {
  applyListing,
  filtersFromSearchParams,
  filtersToSearchParams,
  toQueryString,
  type ListingFilters,
} from "@/lib/catalog/listing";
import { brandUsage, categoryUsage, descendantCategoryIds, relatedProducts } from "@/lib/catalog/relations";
import type { Product } from "@/lib/types";

const { products, brands, compatibility, vehicles, categories } = seed;
const find = (id: string) => products.find((p) => p.id === id)!;
const ids = (list: Product[]) => list.map((p) => p.id);
const noFilters: ListingFilters = { categoryIds: [], brandIds: [], inStockOnly: false, fitsVehicleId: null };

describe("stockState", () => {
  it("classifies stock levels with a low threshold of 5", () => {
    expect(stockState(0)).toBe("out_of_stock");
    expect(stockState(1)).toBe("low_stock");
    expect(stockState(5)).toBe("low_stock");
    expect(stockState(6)).toBe("in_stock");
  });
});

describe("search", () => {
  it("finds products by name word", () => {
    expect(ids(searchProducts(products, brands, "radyatör"))).toContain("p-022");
  });

  it("finds products by brand name", () => {
    const result = searchProducts(products, brands, "brembo");
    expect(result.length).toBeGreaterThan(0);
    expect(result.every((p) => p.brandId === "brand-brembo")).toBe(true);
  });

  it("finds products by SKU", () => {
    expect(ids(searchProducts(products, brands, "KS-FR-1002"))[0]).toBe("p-002");
  });

  it("finds products by OEM number", () => {
    expect(ids(searchProducts(products, brands, "34116860912"))[0]).toBe("p-002");
  });

  it("matches OEM numbers typed with spaces, dots or dashes", () => {
    expect(ids(searchProducts(products, brands, "34 11 6 860 912"))[0]).toBe("p-002");
    expect(ids(searchProducts(products, brands, "34.11.6.860.912"))[0]).toBe("p-002");
    expect(ids(searchProducts(products, brands, "34-11-6-860-912"))[0]).toBe("p-002");
  });

  it("is case-insensitive for Turkish text", () => {
    expect(ids(searchProducts(products, brands, "FREN"))).toEqual(ids(searchProducts(products, brands, "fren")));
    expect(ids(searchProducts(products, brands, "İRİDYUM"))).toContain("p-018");
    expect(normalizeText("  İridyum   BUJİ ")).toBe("iridyum buji");
    expect(normalizeCode("34.11 6-860/912")).toBe("34116860912");
  });

  it("never returns draft products", () => {
    expect(ids(searchProducts(products, brands, "motor takozu"))).not.toContain("p-028");
  });

  it("returns nothing for an empty query or a non-match", () => {
    expect(searchProducts(products, brands, "   ")).toEqual([]);
    expect(searchProducts(products, brands, "zzzzqqq")).toEqual([]);
  });

  it("limits suggestions", () => {
    expect(suggest(products, brands, "filtre", 3).length).toBeLessThanOrEqual(3);
  });
});

describe("fitmentFor", () => {
  const pads = find("p-002");

  it("reports universal products as universal", () => {
    expect(fitmentFor(find("p-042"), "v-bmw-e46-330i", compatibility)).toBe("universal");
  });

  it("returns the explicit record status", () => {
    expect(fitmentFor(pads, "v-bmw-g20-320i", compatibility)).toBe("confirmed");
    expect(fitmentFor(pads, "v-bmw-g20-m340i", compatibility)).toBe("incompatible");
    expect(fitmentFor(find("p-003"), "v-bmw-f10-535i", compatibility)).toBe("unverified");
  });

  it("returns unknown when no record exists — never confirmed", () => {
    expect(fitmentFor(pads, "v-bmw-e30-318i", compatibility)).toBe("unknown");
  });

  it("returns no-vehicle when nothing is selected", () => {
    expect(fitmentFor(pads, null, compatibility)).toBe("no-vehicle");
  });

  it("ignores records that belong to another vehicle", () => {
    const records = [{ id: "x", productId: "p-002", vehicleId: "deleted-vehicle", status: "confirmed" as const }];
    expect(fitmentFor(pads, "v-bmw-g20-320i", records)).toBe("unknown");
  });

  it("labels unknown and unverified the same way", () => {
    expect(FITMENT_LABELS.unknown).toBe("Doğrulanmamış");
    expect(FITMENT_LABELS.unverified).toBe("Doğrulanmamış");
    expect(FITMENT_LABELS.confirmed).toBe("Doğrulanmış uyum");
    expect(FITMENT_LABELS.incompatible).toBe("Uyumsuz");
    expect(FITMENT_LABELS.universal).toBe("Araca bağlı değil");
  });
});

describe("vehicle cascade", () => {
  it("lists makes and dependent models", () => {
    expect(makes(vehicles)).toEqual(["Audi", "BMW", "Mercedes-Benz", "Porsche"]);
    expect(models(vehicles, "BMW")).toContain("3 Serisi");
    expect(models(vehicles, "BMW")).not.toContain("C-Serisi");
  });

  it("lists generations for a model only", () => {
    const gens = generations(vehicles, "BMW", "3 Serisi");
    expect(gens).toContain("E30");
    expect(gens).not.toContain("F10");
  });

  it("derives years from the production range, newest first", () => {
    const ys = years(vehicles, "BMW", "3 Serisi", "E46", 2026);
    expect(ys[0]).toBe(2006);
    expect(ys[ys.length - 1]).toBe(1998);
    expect(years(vehicles, "BMW", "3 Serisi", "G20", 2026)[0]).toBe(2026);
  });

  it("returns only engines whose range contains the year", () => {
    const list = engines(vehicles, "BMW", "3 Serisi", "E46", 2003);
    expect(list.map((v) => v.id).sort()).toEqual(["v-bmw-e46-318i", "v-bmw-e46-320d", "v-bmw-e46-330i"]);
    expect(engines(vehicles, "BMW", "3 Serisi", "E46", 2010)).toEqual([]);
  });

  it("labels a vehicle", () => {
    const v = vehicles.find((x) => x.id === "v-bmw-e46-320d")!;
    expect(vehicleLabel(v)).toBe("BMW 3 Serisi E46 · 320d 2.0 (150 HP)");
  });
});

describe("applyListing", () => {
  it("excludes drafts", () => {
    expect(ids(applyListing(products, noFilters, "recommended", compatibility))).not.toContain("p-028");
  });

  it("filters by brand", () => {
    const list = applyListing(products, { ...noFilters, brandIds: ["brand-bosch"] }, "recommended", compatibility);
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.brandId === "brand-bosch")).toBe(true);
  });

  it("filters by category", () => {
    const list = applyListing(products, { ...noFilters, categoryIds: ["cat-filtreler"] }, "recommended", compatibility);
    expect(list.every((p) => p.categoryId === "cat-filtreler")).toBe(true);
  });

  it("filters by price range", () => {
    const list = applyListing(products, { ...noFilters, minPrice: 1000, maxPrice: 5000 }, "recommended", compatibility);
    expect(list.length).toBeGreaterThan(0);
    expect(list.every((p) => p.price >= 1000 && p.price <= 5000)).toBe(true);
  });

  it("filters to in-stock products", () => {
    const list = applyListing(products, { ...noFilters, inStockOnly: true }, "recommended", compatibility);
    expect(list.every((p) => p.stock > 0)).toBe(true);
  });

  it("sorts by price ascending and descending", () => {
    const asc = applyListing(products, noFilters, "price-asc", compatibility).map((p) => p.price);
    const desc = applyListing(products, noFilters, "price-desc", compatibility).map((p) => p.price);
    expect(asc).toEqual([...asc].sort((a, b) => a - b));
    expect(desc).toEqual([...desc].sort((a, b) => b - a));
  });

  it("keeps only confirmed or universal products when filtering by vehicle", () => {
    const list = applyListing(products, { ...noFilters, fitsVehicleId: "v-bmw-g20-m340i" }, "recommended", compatibility);
    const result = ids(list);
    expect(result).toContain("p-030"); // confirmed
    expect(result).toContain("p-042"); // universal
    expect(result).not.toContain("p-002"); // incompatible
    expect(result).not.toContain("p-006"); // unknown
  });

  it("round-trips filters through URL search params", () => {
    const filters: ListingFilters = {
      categoryIds: ["cat-filtreler", "cat-atesleme"],
      brandIds: ["brand-bosch"],
      minPrice: 100,
      maxPrice: 900,
      inStockOnly: true,
      fitsVehicleId: null,
    };
    const params = filtersToSearchParams(filters, "price-desc");
    const back = filtersFromSearchParams(params);
    expect(back.filters).toEqual(filters);
    expect(back.sort).toBe("price-desc");
  });

  it("serializes a Next.js searchParams object", () => {
    expect(toQueryString({ q: "fren balata", brand: ["a", "b"], x: undefined })).toBe("q=fren+balata&brand=a&brand=b");
  });

  it("falls back to defaults for bad params", () => {
    const back = filtersFromSearchParams(new URLSearchParams("sort=nope&min=abc"));
    expect(back.sort).toBe("recommended");
    expect(back.filters.minPrice).toBeUndefined();
  });
});

describe("relations", () => {
  it("returns a category and its children", () => {
    const list = descendantCategoryIds(categories, "cat-oem");
    expect(list).toContain("cat-oem");
    expect(list).toContain("cat-fren-sistemi");
    expect(list).not.toContain("cat-hava-emis");
  });

  it("counts products per category and brand", () => {
    expect(categoryUsage(products, categories, "cat-fren-sistemi")).toBe(8);
    expect(categoryUsage(products, categories, "cat-oem")).toBeGreaterThan(5);
    expect(brandUsage(products, "brand-brembo")).toBe(4);
  });

  it("finds related published products, excluding the product itself", () => {
    const related = relatedProducts(find("p-002"), products, 4);
    expect(related.length).toBeGreaterThan(0);
    expect(related.length).toBeLessThanOrEqual(4);
    expect(ids(related)).not.toContain("p-002");
    expect(related.every((p) => p.status === "published")).toBe(true);
    expect(related[0].categoryId).toBe("cat-fren-sistemi");
  });
});

describe("search without Turkish characters", () => {
  it("matches text typed without diacritics", () => {
    expect(normalizeText("Ön Fren Balatası Şeti Çğü")).toBe("on fren balatasi seti cgu");
    expect(ids(searchProducts(products, brands, "on fren balatasi"))).toContain("p-002");
    expect(ids(searchProducts(products, brands, "sogutma"))).toEqual(ids(searchProducts(products, brands, "soğutma")));
  });
});

describe("combined text and code queries", () => {
  it("matches a brand word together with an OEM number", () => {
    expect(ids(searchProducts(products, brands, "brembo 34116860912"))[0]).toBe("p-002");
  });
});
