const priceFormatter = new Intl.NumberFormat("tr-TR", { style: "currency", currency: "TRY" });
const dateFormatter = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric" });
const dateTimeFormatter = new Intl.DateTimeFormat("tr-TR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

/** Formats a TRY amount, e.g. "₺2.450,00". The single currency formatter for the app. */
export function formatPrice(amount: number): string {
  return priceFormatter.format(amount);
}

export function formatDate(iso: string): string {
  return dateFormatter.format(new Date(iso));
}

export function formatDateTime(iso: string): string {
  return dateTimeFormatter.format(new Date(iso));
}

export function cn(...classes: (string | false | null | undefined)[]): string {
  return classes.filter(Boolean).join(" ");
}

/** Parses a Turkish or plain number ("1.250,50" or "1250.5"). Empty → NaN. */
export function parseAmount(v: string): number {
  const s = v.trim();
  if (!s) return Number.NaN;
  if (s.includes(",")) return Number(s.replace(/\./g, "").replace(",", "."));
  // "2.450" or "12.500.000" use dots as thousands separators.
  if (/^\d{1,3}(\.\d{3})+$/.test(s)) return Number(s.replace(/\./g, ""));
  return Number(s);
}

/** Storefront price filter input: Turkish-aware number, or undefined when empty/invalid/negative. */
export function parsePriceFilter(v: string): number | undefined {
  const n = parseAmount(v);
  return Number.isFinite(n) && n >= 0 ? n : undefined;
}
