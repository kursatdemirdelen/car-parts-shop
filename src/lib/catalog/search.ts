import type { Brand, Product } from "@/lib/types";

/** Lower-cases with Turkish rules, folds ı→i so "BUJİ", "buji" and "BUJI" compare equal, and collapses whitespace. */
export function normalizeText(s: string): string {
  return s.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/\s+/g, " ").trim();
}

/** Canonical form for part numbers: upper-case, without spaces, dots, dashes or slashes. */
export function normalizeCode(s: string): string {
  return s.toUpperCase().replace(/[\s.\-/]/g, "");
}

function score(product: Product, brandName: string, text: string, code: string): number {
  const codes = [product.sku, ...product.oemNumbers].map(normalizeCode);
  if (code.length >= 3) {
    if (codes.includes(code)) return 100;
    if (code.length >= 4 && codes.some((c) => c.includes(code))) return 60;
  }

  const tokens = text.split(" ").filter(Boolean);
  if (tokens.length === 0) return 0;
  const name = normalizeText(product.name);
  const haystack = `${name} ${normalizeText(brandName)} ${normalizeText(product.sku)}`;
  if (!tokens.every((t) => haystack.includes(t))) return 0;
  return 10 + tokens.filter((t) => name.includes(t)).length;
}

/**
 * Searches published products by name, brand, SKU and OEM numbers.
 * Exact code matches rank first, then partial code matches, then text matches.
 */
export function searchProducts(products: Product[], brands: Brand[], query: string): Product[] {
  const text = normalizeText(query);
  if (!text) return [];
  const code = normalizeCode(query);
  const brandNames = new Map(brands.map((b) => [b.id, b.name]));

  return products
    .filter((p) => p.status === "published")
    .map((p) => ({ p, s: score(p, brandNames.get(p.brandId) ?? "", text, code) }))
    .filter((x) => x.s > 0)
    .sort((a, b) => b.s - a.s || a.p.name.localeCompare(b.p.name, "tr"))
    .map((x) => x.p);
}

export function suggest(products: Product[], brands: Brand[], query: string, limit = 6): Product[] {
  return searchProducts(products, brands, query).slice(0, limit);
}
