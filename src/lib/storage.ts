import { seed } from "@/lib/seed";
import {
  isIsoDate,
  MAINTENANCE_ITEM_IDS,
  MAX_KM,
  MAX_LOG_ENTRIES,
  type MaintenanceState,
  type OdometerReading,
  type ServiceEntry,
  type VehicleMaintenance,
} from "@/lib/maintenance";
import { isPhotoKey } from "@/lib/photos";
import type { Announcement, CatalogData, HeroSlide, ID, Vehicle } from "@/lib/types";

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
  maintenance: "ks:v1:maintenance",
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

const HERO_TONES = new Set(["dark", "accent", "light"]);

function isHeroSlideList(v: unknown): v is HeroSlide[] {
  return (
    listOf(v, [
      ["id", isStr], ["title", isStr], ["subtitle", isStr], ["ctaLabel", isStr], ["ctaHref", isStr], ["status", isStr],
      ["tone", (x) => typeof x === "string" && HERO_TONES.has(x)], ["photo", isPhotoKey],
    ])
  );
}

function isAnnouncement(v: unknown): v is Announcement {
  return has(v, [["enabled", (x) => typeof x === "boolean"], ["text", isStr], ["href", isStr]]);
}

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
    isHeroSlideList(v.heroSlides) &&
    isAnnouncement(v.announcement) &&
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
  // Storefront showcase (added later): missing or malformed content falls back to the seed as a whole.
  if (!isHeroSlideList(data.heroSlides)) data = { ...data, heroSlides: seed.heroSlides };
  if (!isAnnouncement(data.announcement)) data = { ...data, announcement: seed.announcement };
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

// ── Maintenance ───────────────────────────────────────────────────────

/** Lenient top-level check; `normalizeMaintenance` cleans the records entry by entry. */
export function isMaintenanceState(v: unknown): v is MaintenanceState {
  return isObject(v) && !Array.isArray(v);
}

const isKm = (v: unknown): v is number => Number.isInteger(v) && (v as number) >= 0 && (v as number) <= MAX_KM;
const isDate = (v: unknown): v is string => typeof v === "string" && isIsoDate(v);

function normalizeOdometer(v: unknown): OdometerReading | null {
  return isObject(v) && isKm(v.km) && isDate(v.updatedAt) ? { km: v.km, updatedAt: v.updatedAt } : null;
}

function normalizeEntry(v: unknown): ServiceEntry | null {
  if (!isObject(v) || typeof v.id !== "string" || !isDate(v.date)) return null;
  if (!MAINTENANCE_ITEM_IDS.includes(v.itemId as ServiceEntry["itemId"])) return null;
  if (v.km !== null && !isKm(v.km)) return null;
  return { id: v.id, itemId: v.itemId as ServiceEntry["itemId"], date: v.date, km: v.km };
}

/** Keeps the newest entries (by date) when a log grows past the limit, preserving order otherwise. */
export function trimLog(log: ServiceEntry[]): ServiceEntry[] {
  if (log.length <= MAX_LOG_ENTRIES) return log;
  const keep = new Set([...log].sort((a, b) => b.date.localeCompare(a.date)).slice(0, MAX_LOG_ENTRIES));
  return log.filter((e) => keep.has(e));
}

export function normalizeMaintenance(state: MaintenanceState): MaintenanceState {
  const result: MaintenanceState = {};
  for (const [vehicleId, record] of Object.entries(state as Record<string, unknown>)) {
    const r: VehicleMaintenance = isObject(record)
      ? {
          odometer: normalizeOdometer(record.odometer),
          log: trimLog((Array.isArray(record.log) ? record.log : []).map(normalizeEntry).filter((e) => e !== null)),
        }
      : { odometer: null, log: [] };
    result[vehicleId] = r;
  }
  return result;
}
