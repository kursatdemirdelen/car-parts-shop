import type { ID, Vehicle } from "@/lib/types";

/**
 * Maintenance schedule logic. Intervals are demo examples, not manufacturer rules:
 * the UI always tells the user to check the owner's manual.
 */

export type MaintenanceItemId = "engine-oil" | "cabin-filter" | "air-filter" | "spark-plugs" | "fuel-filter" | "brake-fluid" | "coolant";
export const MAINTENANCE_ITEM_IDS: readonly MaintenanceItemId[] = [
  "engine-oil", "cabin-filter", "air-filter", "spark-plugs", "fuel-filter", "brake-fluid", "coolant",
];

export type FuelType = "petrol" | "diesel";
export interface MaintenanceInterval { km: number | null; months: number }
export interface MaintenanceItem { id: MaintenanceItemId; name: string; interval: MaintenanceInterval }
/** Dates are local calendar dates, YYYY-MM-DD. */
export interface OdometerReading { km: number; updatedAt: string }
export interface ServiceEntry { id: string; itemId: MaintenanceItemId; date: string; km: number | null }
export interface VehicleMaintenance { odometer: OdometerReading | null; log: ServiceEntry[] }
export type MaintenanceState = Record<ID, VehicleMaintenance>;
export type MaintenanceStatus = "overdue" | "soon" | "unknown" | "ok";
export interface ItemStatus {
  item: MaintenanceItem;
  status: MaintenanceStatus;
  last: ServiceEntry | null;
  remainingKm: number | null;
  remainingDays: number | null;
  label: string;
}

export const SOON_KM = 1500;
export const SOON_DAYS = 30;
export const STALE_ODOMETER_DAYS = 90;
export const MAX_LOG_ENTRIES = 50;
export const MAX_KM = 2_000_000;

export const ITEM_NAMES: Record<MaintenanceItemId, string> = {
  "engine-oil": "Motor yağı + yağ filtresi",
  "cabin-filter": "Polen filtresi",
  "air-filter": "Hava filtresi",
  "spark-plugs": "Bujiler",
  "fuel-filter": "Yakıt filtresi",
  "brake-fluid": "Fren hidroliği",
  coolant: "Antifriz",
};

type Table = Record<MaintenanceItemId, MaintenanceInterval>;

const GENERAL: Table = {
  "engine-oil": { km: 15000, months: 12 },
  "cabin-filter": { km: 15000, months: 12 },
  "air-filter": { km: 30000, months: 24 },
  "spark-plugs": { km: 60000, months: 48 },
  "fuel-filter": { km: 60000, months: 48 },
  "brake-fluid": { km: null, months: 24 },
  coolant: { km: null, months: 48 },
};

const BMW_LONGLIFE = (fuel: FuelType): Table => ({
  "engine-oil": { km: 25000, months: 24 },
  "cabin-filter": { km: 30000, months: 24 },
  "air-filter": { km: 60000, months: 48 },
  "spark-plugs": { km: 100000, months: 72 },
  "fuel-filter": fuel === "diesel" ? { km: 60000, months: 48 } : { km: 100000, months: 72 },
  "brake-fluid": { km: null, months: 24 },
  coolant: { km: null, months: 48 },
});

/** Derived from the engine text, since the catalog has no fuel field. Hybrids count as petrol. */
export function fuelTypeOf(v: Vehicle): FuelType {
  return /\b(tdi|cdi|diesel|d)\b|\d+d\b/i.test(v.engine) ? "diesel" : "petrol";
}

export function usesBmwLongLife(v: Vehicle): boolean {
  return v.make === "BMW" && !["E30", "E36"].includes(v.generation);
}

export function itemsFor(v: Vehicle): MaintenanceItem[] {
  const fuel = fuelTypeOf(v);
  const table = usesBmwLongLife(v) ? BMW_LONGLIFE(fuel) : GENERAL;
  return MAINTENANCE_ITEM_IDS.filter((id) => !(id === "spark-plugs" && fuel === "diesel")).map((id) => ({
    id,
    name: ITEM_NAMES[id],
    interval: table[id],
  }));
}

// ── Dates (UTC arithmetic on calendar dates) ──────────────────────────

const toUtc = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return Date.UTC(y, m - 1, d);
};
const fromUtc = (ms: number) => new Date(ms).toISOString().slice(0, 10);

export function isIsoDate(s: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  return fromUtc(toUtc(s)) === s;
}

export function addMonths(date: string, months: number): string {
  const [y, m, d] = date.split("-").map(Number);
  const total = m - 1 + months;
  const year = y + Math.floor(total / 12);
  const month = ((total % 12) + 12) % 12;
  const lastDay = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return fromUtc(Date.UTC(year, month, Math.min(d, lastDay)));
}

export function daysBetween(from: string, to: string): number {
  return Math.round((toUtc(to) - toUtc(from)) / 86_400_000);
}

export function todayIso(now: Date = new Date()): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

// ── Status ────────────────────────────────────────────────────────────

export function lastEntry(log: ServiceEntry[], itemId: MaintenanceItemId): ServiceEntry | null {
  let best: ServiceEntry | null = null;
  for (const e of log) if (e.itemId === itemId && (!best || e.date >= best.date)) best = e;
  return best;
}

const formatKm = (km: number) => new Intl.NumberFormat("tr-TR").format(km);

function remainingLabel(km: number | null, days: number, item: MaintenanceItem): string {
  const dayFraction = days / (item.interval.months * 30.44);
  const useKm = km !== null && item.interval.km !== null && km / item.interval.km < dayFraction;
  if (useKm) return km! > 0 ? `${formatKm(km!)} km kaldı` : `${formatKm(Math.abs(km!))} km gecikti`;
  if (days === 0) return "Süresi bugün doldu";
  const suffix = days > 0 ? "kaldı" : "gecikti";
  const abs = Math.abs(days);
  return abs < 60 ? `${abs} gün ${suffix}` : `${Math.round(abs / 30)} ay ${suffix}`;
}

export function itemStatus(item: MaintenanceItem, last: ServiceEntry | null, currentKm: number | null, today: string): ItemStatus {
  if (!last) return { item, status: "unknown", last, remainingKm: null, remainingDays: null, label: "Son değişim bilinmiyor" };
  const remainingDays = daysBetween(today, addMonths(last.date, item.interval.months));
  // A logged km above the current reading is a typo: fall back to the date alone.
  const remainingKm =
    item.interval.km !== null && currentKm !== null && last.km !== null && last.km <= currentKm
      ? item.interval.km - (currentKm - last.km)
      : null;
  const status: MaintenanceStatus =
    remainingDays <= 0 || (remainingKm !== null && remainingKm <= 0)
      ? "overdue"
      : remainingDays <= SOON_DAYS || (remainingKm !== null && remainingKm <= SOON_KM)
        ? "soon"
        : "ok";
  return { item, status, last, remainingKm, remainingDays, label: remainingLabel(remainingKm, remainingDays, item) };
}

const RANK: Record<MaintenanceStatus, number> = { overdue: 0, soon: 1, unknown: 2, ok: 3 };

/** Smallest share of the interval left; used to order items within a status. */
function urgency(s: ItemStatus): number {
  if (s.remainingDays === null) return 0;
  const byDays = s.remainingDays / (s.item.interval.months * 30.44);
  const byKm = s.remainingKm !== null && s.item.interval.km ? s.remainingKm / s.item.interval.km : Infinity;
  return Math.min(byDays, byKm);
}

export function vehicleSchedule(v: Vehicle, record: VehicleMaintenance | undefined, today: string): ItemStatus[] {
  const log = record?.log ?? [];
  const km = record?.odometer?.km ?? null;
  return itemsFor(v)
    .map((item) => itemStatus(item, lastEntry(log, item.id), km, today))
    .sort((a, b) => RANK[a.status] - RANK[b.status] || urgency(a) - urgency(b));
}

export function isOdometerStale(o: OdometerReading | null, today: string): boolean {
  return o !== null && daysBetween(o.updatedAt, today) > STALE_ODOMETER_DAYS;
}

// ── Input validation ──────────────────────────────────────────────────

const KM_ERROR = "Km 0 ile 2.000.000 arasında bir tam sayı olmalı.";

function parseKm(input: string): number | null {
  const s = input.trim();
  if (!/^\d+$/.test(s) && !/^\d{1,3}(\.\d{3})+$/.test(s)) return null;
  const km = Number(s.replace(/\./g, ""));
  return km <= MAX_KM ? km : null;
}

export function validateOdometer(input: string): { km?: number; error?: string } {
  const km = parseKm(input);
  return km === null ? { error: KM_ERROR } : { km };
}

export function validateServiceInput(
  date: string,
  km: string,
  today: string,
): { date?: string; km?: number | null; errors: { date?: string; km?: string } } {
  const errors: { date?: string; km?: string } = {};
  if (!isIsoDate(date)) errors.date = "Geçerli bir tarih gir.";
  else if (date > today) errors.date = "Tarih bugünden ileri olamaz.";
  let parsedKm: number | null = null;
  if (km.trim() !== "") {
    parsedKm = parseKm(km);
    if (parsedKm === null) errors.km = KM_ERROR;
  }
  return Object.keys(errors).length ? { errors } : { date, km: parsedKm, errors };
}
