import type { Brand, Product } from "@/lib/types";

const FOLD: Record<string, string> = { ı: "i", ç: "c", ğ: "g", ö: "o", ş: "s", ü: "u" };

/**
 * Lower-cases with Turkish rules and folds Turkish letters to ASCII, so "Ön Fren", "on fren" and "ÖN FREN"
 * all match (shoppers often type without Turkish characters). Collapses whitespace.
 */
export function normalizeText(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/[ıçğöşü]/g, (ch) => FOLD[ch])
    .replace(/\s+/g, " ")
    .trim();
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
  const codeTokens = codes.map((c) => c.toLowerCase());
  // A token matches the text, or (for part numbers mixed into a text query) an exact SKU/OEM code.
  const matches = (t: string) => haystack.includes(t) || (t.length >= 4 && codeTokens.includes(normalizeCode(t).toLowerCase()));
  if (!tokens.every(matches)) return 0;
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
