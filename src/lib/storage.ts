import { seed } from "@/lib/seed";
import type { CatalogData, ID, Vehicle } from "@/lib/types";

/**
 * Browser-local persistence for the prototype. Data lives only in this browser:
 * it is not shared between users or devices and is not a substitute for a database.
 * Every read falls back to a safe default when data is missing, corrupt or of the wrong shape.
 */

export const KEYS = {
  catalog: "ks:v1:catalog",
  cart: "ks:v1:cart",
  favorites: "ks:v1:favorites",
  garage: "ks:v1:garage",
  adminSession: "ks:v1:admin",
} as const;

export interface GarageState {
  saved: ID[];
  selected: ID | null;
}

export function browserStorage(): Storage | undefined {
  try {
    return typeof window !== "undefined" ? window.localStorage : undefined;
  } catch {
    return undefined; // access can throw when storage is blocked
  }
}

export function readJSON<T>(
  key: string,
  fallback: T,
  isValid: (v: unknown) => v is T,
  store: Storage | undefined = browserStorage(),
  migrate: (raw: unknown) => unknown = (raw) => raw,
): T {
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = migrate(JSON.parse(raw));
    return isValid(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

export function writeJSON(key: string, value: unknown, store: Storage | undefined = browserStorage()): boolean {
  if (!store) return false;
  try {
    store.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string, store: Storage | undefined = browserStorage()): void {
  try {
    store?.removeItem(key);
  } catch {
    // ignore
  }
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === "object" && v !== null;
const isStringArray = (v: unknown): v is string[] => Array.isArray(v) && v.every((x) => typeof x === "string");

const isStr = (v: unknown) => typeof v === "string";
const isNum = (v: unknown) => typeof v === "number" && Number.isFinite(v);
const has = (o: unknown, keys: [string, (v: unknown) => boolean][]) => isObject(o) && keys.every(([k, check]) => check(o[k]));
const listOf = (v: unknown, keys: [string, (v: unknown) => boolean][]) => Array.isArray(v) && v.every((x) => has(x, keys));

/**
 * Element-level shape check, so catalogs saved by an older version of the prototype (or edited by hand)
 * fall back to the seed instead of crashing during render.
 */
export function isCatalogData(v: unknown): v is CatalogData {
  if (!isObject(v)) return false;
  return (
    listOf(v.products, [
      ["id", isStr], ["slug", isStr], ["name", isStr], ["description", isStr], ["sku", isStr],
      ["oemNumbers", isStringArray], ["companionIds", (x) => x === undefined || isStringArray(x)], ["brandId", isStr], ["categoryId", isStr], ["price", isNum], ["stock", isNum],
      ["status", isStr], ["fitmentType", isStr], ["images", Array.isArray], ["specs", Array.isArray],
      ["createdAt", isStr], ["updatedAt", isStr],
    ]) &&
    listOf(v.categories, [["id", isStr], ["slug", isStr], ["name", isStr], ["parentId", (x) => x === null || isStr(x)]]) &&
    listOf(v.brands, [["id", isStr], ["slug", isStr], ["name", isStr]]) &&
    listOf(v.vehicles, [
      ["id", isStr], ["make", isStr], ["model", isStr], ["generation", isStr], ["engine", isStr],
      ["yearFrom", isNum], ["yearTo", (x) => x === null || isNum(x)],
    ]) &&
    listOf(v.compatibility, [["id", isStr], ["productId", isStr], ["vehicleId", isStr], ["status", isStr]]) &&
    listOf(v.kits, [
      ["id", isStr], ["slug", isStr], ["name", isStr], ["description", isStr], ["status", isStr],
      ["vehicleIds", isStringArray], ["lines", (x) => listOf(x, [["productId", isStr], ["quantity", isNum]])],
    ]) &&
    listOf(v.orders, [
      ["id", isStr], ["reference", isStr], ["createdAt", isStr], ["status", isStr], ["items", Array.isArray],
      ["subtotal", isNum], ["shipping", isNum], ["total", isNum], ["address", isObject], ["paymentMethod", isStr],
    ]) &&
    has(v.settings, [
      ["storeName", isStr], ["email", isStr], ["phone", isStr], ["address", isStr], ["workingHours", isStr],
      ["freeShippingThreshold", isNum], ["shippingFee", isNum], ["lowStockThreshold", isNum],
    ])
  );
}

/**
 * Upgrades catalogs saved by earlier versions before validation. Data saved before maintenance kits
 * existed gets the seed kits; everything the user edited is kept.
 */
export function migrateCatalog(raw: unknown): unknown {
  if (!isObject(raw)) return raw;
  let data: Record<string, unknown> = raw;
  if (data.kits === undefined) data = { ...data, kits: seed.kits };
  // Products saved before companions existed get the seed companions (only those that still exist).
  if (Array.isArray(data.products)) {
    const ids = new Set(data.products.filter(isObject).map((p) => p.id));
    const seedCompanions = new Map(seed.products.map((p) => [p.id, p.companionIds]));
    data = {
      ...data,
      products: data.products.map((p) => {
        if (!isObject(p) || p.companionIds !== undefined || typeof p.id !== "string") return p;
        const companions = seedCompanions.get(p.id)?.filter((id) => ids.has(id));
        return companions?.length ? { ...p, companionIds: companions } : p;
      }),
    };
  }
  return data;
}

export function isGarageState(v: unknown): v is GarageState {
  return isObject(v) && isStringArray(v.saved) && (v.selected === null || typeof v.selected === "string");
}

export const isIdList = isStringArray;

export function isCart(v: unknown): v is { items: { productId: string; quantity: number }[] } {
  return (
    isObject(v) &&
    Array.isArray(v.items) &&
    v.items.every((i) => isObject(i) && typeof i.productId === "string" && typeof i.quantity === "number" && i.quantity > 0)
  );
}

/** Removes compatibility records that point to deleted products or vehicles. */
export function sanitizeCatalog(data: CatalogData): CatalogData {
  const productIds = new Set(data.products.map((p) => p.id));
  const vehicleIds = new Set(data.vehicles.map((v) => v.id));
  return {
    ...data,
    compatibility: data.compatibility.filter((r) => productIds.has(r.productId) && vehicleIds.has(r.vehicleId)),
  };
}

/** Removes saved vehicles that no longer exist in the catalog. */
export function sanitizeGarage(g: GarageState, vehicles: Vehicle[]): GarageState {
  const ids = new Set(vehicles.map((v) => v.id));
  const saved = g.saved.filter((id) => ids.has(id));
  return { saved, selected: g.selected && ids.has(g.selected) ? g.selected : null };
}
