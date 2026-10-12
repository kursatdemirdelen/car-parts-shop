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

function browserStorage(): Storage | undefined {
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
): T {
  if (!store) return fallback;
  try {
    const raw = store.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
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

export function isCatalogData(v: unknown): v is CatalogData {
  if (!isObject(v)) return false;
  const lists = ["products", "categories", "brands", "vehicles", "compatibility", "orders"] as const;
  return lists.every((k) => Array.isArray(v[k])) && isObject(v.settings);
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
