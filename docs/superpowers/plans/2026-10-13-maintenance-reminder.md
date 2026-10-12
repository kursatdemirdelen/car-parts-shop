# BMW Katalog Genişletmesi ve Bakım Hatırlatıcısı Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Expand the BMW catalog (25 vehicles, ~20 parts + 2 antifreeze, 6 kits). Then add a km/date-based maintenance reminder. It appears on the garage page, as a home-page strip and as a header dot, and recommends confirmed-fit parts and kits.

**Architecture:**
- **Pure domain logic:**
  - `src/lib/maintenance.ts`: items, intervals, status.
  - `src/lib/maintenance-recommendations.ts`: item → products/kits.
- **Storage:** A browser-local store `src/state/maintenance-store.ts` built on the existing `createPersistentStore` pattern, plus validation and normalization in `src/lib/storage.ts`.
- **UI:** Client components that read the store only after `useHydrated()`.
- **Catalog data:** Extends the existing seed files only. The data model is unchanged.

**Tech Stack:** Next.js 16.4 (App Router, cacheComponents), React 19.3, TypeScript strict, Tailwind 4, Vitest, Playwright.

**Spec:** [`docs/superpowers/specs/2026-10-12-maintenance-reminder-design.md`](../specs/2026-10-12-maintenance-reminder-design.md). Part A = spec §11. Part B = spec §1–10.

## Global Constraints

- **Branch:** Work on branch `feat/bakim-hatirlatici` off `master`. Never commit to `master` directly. Ask the user before any push.
- **Commit messages:**
  - Turkish title, and, if more than one change, a blank line followed by Turkish `- ` bullets.
  - **No Claude/AI attribution or Co-Authored-By lines** (user rule; this overrides harness defaults).
- **Line endings:** LF in every file. The repo has `.gitattributes` `* text=auto eol=lf`. When writing files from Python, use `newline="\n"`.
- **Next.js 16:** Read `node_modules/next/dist/docs/` before writing route or page code.
  - `params`/`searchParams` are awaited inside `<Suspense>`.
  - No `useSearchParams` in pages.
- **Browser state:** Browser-stored values are shown only after `useHydrated()` is true. The server snapshot is the empty/fallback state.
- **Fitment honesty:** Only recommend a product when `fitsVehicle(product, vehicleId, compatibility)` is true and its `status === "published"`. Unknown, unverified and incompatible products are never shown as fitting.
- **Status honesty:** An item with no log entry is always `unknown` ("Bilinmiyor"), never `ok`.
- **Required on-screen note:** "Örnek aralıklardır; aracınızın bakım kılavuzunu kontrol edin." For vehicles using the BMW table, the note also says "BMW LongLife örnek aralıkları".
- **Seed honesty:** No `compareAtPrice`, discounts or ratings on new products.
  - Every new vehicle-specific product has `confirmed` compatibility rows.
  - Every kit line is `confirmed` or universal for every vehicle the kit lists.
- **Accessibility:** Status badges carry text plus an icon, never color alone. Inputs have labels.
- **Mobile:** No horizontal overflow at 375 px. Use the existing `expectNoMobileOverflow`.
- **Verification commands:**
  - `npm test` (Vitest)
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
  - `npm run e2e` (Playwright, port 3100, needs a build)

## Review Focus

1. **Date arithmetic at month ends and across years.** `2026-01-31` + 1 month must give `2026-02-28`. A leap-year date must not produce an invalid date. Pinned in Task 4.
2. **Stored data that is corrupt, hand-edited or from an older shape.** Examples: km as a string, a date like `2026-13-40`, an unknown `itemId`, more than 50 entries, records for vehicles missing from the catalog. Each must be dropped entry by entry without crashing render. Pinned in Task 6.
3. **A vehicle whose km was never entered but has dated log entries.** Status must come from time alone, and must not crash or show NaN. Pinned in Task 4.
4. **A log entry with a km higher than the current odometer** (user typo). Remaining km must not show a nonsense "-" or overflow label; the status still resolves deterministically. Pinned in Task 4: treated as distance driven 0, so km remaining = full interval.
5. **A product deleted or drafted by the admin after being recommended, or a kit whose lines are all out of stock.** Recommendations recompute from the live catalog and never show drafts. Pinned in Task 5.

---

## Part A — BMW katalog genişletmesi

### Task 1: New BMW vehicles and the `5UX` WMI

**Files:**
- Modify: `src/lib/seed/vehicles.ts` (append to `generations`, BMW block)
- Modify: `src/lib/vin.ts` (`WMI_MAKES`)
- Test: `tests/seed.test.ts`, `tests/vin.test.ts`

**Interfaces:**
- Produces: vehicle ids used by Tasks 2–3. Pattern `v-bmw-<gen lowercased>-<key>`. The complete list:
  - `v-bmw-e87-116i`, `v-bmw-e87-120d`
  - `v-bmw-f40-118i`
  - `v-bmw-f30-320i`, `v-bmw-f30-320d`
  - `v-bmw-f80-m3`
  - `v-bmw-g80-m3-competition`
  - `v-bmw-f32-420d`, `v-bmw-f32-430i`
  - `v-bmw-g22-420i`, `v-bmw-g22-m440i`
  - `v-bmw-f01-730d`
  - `v-bmw-g11-730d`, `v-bmw-g11-740i`
  - `v-bmw-f48-sdrive18i`, `v-bmw-f48-xdrive20d`
  - `v-bmw-f25-xdrive20d`
  - `v-bmw-g01-xdrive20d`, `v-bmw-g01-xdrive30i`
  - `v-bmw-e70-xdrive30d`
  - `v-bmw-f15-xdrive30d`
  - `v-bmw-g05-xdrive30d`
  - `v-bmw-e89-sdrive20i`
  - `v-bmw-g29-sdrive30i`, `v-bmw-g29-m40i`

  That is 25 ids.

- [ ] **Step 1: Create the branch.** Run `git checkout -b feat/bakim-hatirlatici`.
- [ ] **Step 2: Update the seed tests first.** In `tests/seed.test.ts`:
  - Rename `"has 40–45 records across the four makes"` and assert `vehicles.length` is between 68 and 72. The current count is 45; 45 + 25 = 70.
  - Extend the BMW generations list with `"E87","F40","F30","F80","G80","F32","G22","F01","G11","F48","F25","G01","E70","F15","G05","E89","G29"`.
  - Add a test `"orders BMW models logically in the selector"`: `models(vehicles, "BMW")` equals `["1 Serisi","3 Serisi","4 Serisi","5 Serisi","7 Serisi","M3","X1","X3","X5","Z4"]`. Import `models` from `@/lib/catalog/vehicles`.

  In `tests/vin.test.ts`, add `it("knows the US-built BMW SUV prefix 5UX")`: `decodeVin("5UXCR6C05L9B12345", 2026)` yields the make `"BMW"`. Use the field that existing tests assert for the make.
- [ ] **Step 3: Run the tests and confirm they fail.** Run `npx vitest run tests/seed.test.ts tests/vin.test.ts`. Expected: FAIL on the count, the generations and `5UX`.
- [ ] **Step 4: Implement.**
  - Add the 17 generations from spec §11 (exact model, generation, body, years and engine strings). Keys are the lowercase engine prefix: `116i`, `120d`, `118i`, `320i`, `320d`, `m3`, `m3-competition`, `420d`, `430i`, `420i`, `m440i`, `730d`, `740i`, `sdrive18i`, `xdrive20d`, `xdrive30i`, `xdrive30d`, `sdrive20i`, `sdrive30i`, `m40i`.
  - Add `5UX: "BMW"` to `WMI_MAKES`.
- [ ] **Step 5: Run the tests and confirm they pass.** Run `npm test`. Expected: all pass. If an existing test hard-codes 45 vehicles (for example in seo or catalog tests), update it to the new count; that is a counted fact, not a behavior change.
- [ ] **Step 6: Commit.** Run `git commit -am` with the message `BMW araç kataloğu genişletildi` and these bullets:
  - 1, 3, 4, 7 Serisi, M3, X1, X3, X5 ve Z4'ten 25 yeni araç
  - Şasi çözümleyiciye 5UX üretici kodu

### Task 2: BMW parts, antifreeze and compatibility

**Files:**
- Modify: `src/lib/seed/products.ts`, `src/lib/seed/compatibility.ts`, `src/lib/seed/brands.ts` (only if a needed brand is missing)
- Test: `tests/seed.test.ts`

**Interfaces:**
- Consumes: vehicle ids from Task 1.
- Produces:
  - Product ids `p-051` … `p-072` (about 22). Two of them are antifreeze products in `cat-motor-yagi-sivilar`, with names containing "Antifriz":
    - `p-071`: BMW standard (G48-type). Confirmed for every BMW vehicle except E30/E36.
    - `p-072`: Mercedes-Benz / Audi standard. Confirmed for every Mercedes-Benz and Audi vehicle.
  - Names must contain the keywords Task 5 matches on: "Yağ Filtresi", "Hava Filtresi", "Polen Filtresi", "Yakıt Filtresi", "Buji" (never "Kızdırma" for spark plugs), "Motor Yağı", "Fren Hidroliği", "Antifriz".

- [ ] **Step 1: Write the failing coverage test** in `tests/seed.test.ts`, `describe("seed BMW maintenance coverage")`:

```ts
const fold = (s: string) => s.toLocaleLowerCase("tr");
const confirmedFor = (vid: string) => products.filter(
  (p) => p.status === "published" && (p.fitmentType === "universal" ||
    compatibility.some((r) => r.productId === p.id && r.vehicleId === vid && r.status === "confirmed")));
const isDiesel = (engine: string) => /\b\d{2,3}d\b|\bd\b|tdi|cdi|diesel|xdrive\d{2}d|sdrive\d{2}d/i.test(engine);

it("gives every LongLife-era BMW at least 4 confirmed maintenance items", () => {
  for (const v of vehicles.filter((v) => v.make === "BMW" && !["E30", "E36"].includes(v.generation))) {
    const names = confirmedFor(v.id).map((p) => fold(p.name));
    const hit = (kw: string, not?: string) => names.some((n) => n.includes(kw) && !(not && n.includes(not)));
    const covered = [
      hit("yağ filtresi") || hit("motor yağı"),
      hit("hava filtresi"),
      hit("polen"),
      isDiesel(v.engine) ? hit("yakıt filtresi") : hit("buji", "kızdırma"),
    ];
    expect(covered, v.id).toEqual([true, true, true, true]);
  }
});

it("has antifreeze for BMW, Mercedes-Benz and Audi but not Porsche", () => {
  const anti = (vid: string) => confirmedFor(vid).some((p) => fold(p.name).includes("antifriz"));
  expect(anti("v-bmw-f30-320d")).toBe(true);
  expect(anti("v-mercedes-benz-w205-c220d")).toBe(true);
  expect(anti("v-audi-b9-40tdi")).toBe(true);
  expect(anti("v-porsche-991-carrera-s")).toBe(false);
});
```

  Also change the product upper bound in `"cover the required counts and stock states"` to `toBeLessThanOrEqual(75)`.
- [ ] **Step 2: Run the tests and confirm they fail.** Run `npx vitest run tests/seed.test.ts`. Expected: FAIL. The failure lists the first uncovered vehicle id, and the antifreeze test also fails.
- [ ] **Step 3: Implement.**
  - **Add products per spec §11.** Engine families:
    - B47/N47 diesel: E87 120d, F20 118d, E90/E92 320d, F30 320d, F32 420d, F10/G30/E60 520d, G20 320d, F48 xDrive20d, F25/G01 xDrive20d
    - N20/B48 petrol: F30 320i, F32 430i, G22 420i, F10 528i, G20 320i, G30 520i, G01 xDrive30i, G29 sDrive30i, E89 sDrive20i, F40 118i, F48 sDrive18i, F20 116i, E87 116i, G30 530e
    - B58/N55 petrol: G20 M340i, G22 M440i, G11 740i, G29 M40i, F10 535i
    - N57/B57 diesel: F01/G11 730d, E70/F15/G05 xDrive30d, E60/E39 530d where relevant
    - S55/S58: F80/G80 M3

    The family table is the builder's demo mapping. Include the engine code in each description.
  - **Brake products:** pads and discs for F30/F32, G20/G22, X5 F15/G05 and X3 G01.
  - **Oil:** LongLife-04 oils are `vehicle-specific`, confirmed for the BMWs that use them.
  - **Stock:** Keep a mix of stock levels. Any new draft is optional.
  - **Prices:** Plausible TRY values and no `compareAtPrice`.
  - **Gap fill:** Existing BMW vehicles (E39, E46, E60, E90, E92, F10, F20, G20, G30) must also pass the coverage test. Add confirmed rows for existing products, or new products, where they are missing.
- [ ] **Step 4: Run the tests and confirm they pass.** Run `npm test`. Expected: all pass, including `seed compatibility`, which checks for no duplicates and no records on universal products.
- [ ] **Step 5: Commit.** Message `BMW parça kataloğu ve antifriz ürünleri eklendi`, with these bullets:
  - B47/N47, N20/B48, B58/N55, N57 ve S55/S58 motorları için filtre, buji ve yağ
  - F30, G20, X3 ve X5 için fren balata ve diskleri
  - BMW ile Mercedes-Benz/Audi için antifriz
  - Tüm ürünler için doğrulanmış uyumluluk kayıtları

### Task 3: Six new BMW maintenance kits

**Files:**
- Modify: `src/lib/seed/kits.ts`
- Test: `tests/kits.test.ts`

**Interfaces:**
- Consumes: product ids from Task 2.
- Produces: kit ids `kit-f30-320d-bakim`, `kit-f10-520d-bakim`, `kit-f20-118d-bakim`, `kit-e90-320i-bakim`, `kit-g20-320d-bakim`, `kit-f15-x5-30d-bakim`. Slugs are url-safe and unique.

- [ ] **Step 1: Write the failing test.** In `tests/kits.test.ts`, change `"has 4–6 consistent kits"` to `"has 10 consistent kits"` with `expect(kits.length).toBe(10)`. Add:

```ts
it("covers the six new BMW kit vehicles", () => {
  for (const vid of ["v-bmw-f30-320d","v-bmw-f10-520d","v-bmw-f20-118d","v-bmw-e90-320i","v-bmw-g20-320d","v-bmw-f15-xdrive30d"])
    expect(kitsForVehicle(kits, vid).length, vid).toBeGreaterThan(0);
});
```

- [ ] **Step 2: Run the tests and confirm they fail.** Run `npx vitest run tests/kits.test.ts`. Expected: FAIL (4 ≠ 10).
- [ ] **Step 3: Implement.**
  - Add the 6 kits. Each has 3–4 lines: oil filter or oil, air filter, cabin filter, plus fuel filter for diesel or spark plugs for petrol.
  - Write descriptions in the existing tone ("Yağ miktarını aracının kılavuzundan kontrol et").
  - Status is `"published"`.
- [ ] **Step 4: Run the tests and confirm they pass.** Run `npm test`. Expected: all pass. The existing consistency loop checks fitment for every line and vehicle.
- [ ] **Step 5: Run the full checks.** Run `npm run lint && npm run typecheck && npm run build`. Expected: success. The build prerenders the new `/arac/*` pages.
- [ ] **Step 6: Commit.** Message `BMW bakım setleri eklendi` with one bullet:
  - F30 320d, F10 520d, F20 118d, E90 320i, G20 320d ve X5 F15 xDrive30d setleri

---

## Part B — Bakım hatırlatıcısı

### Task 4: Maintenance domain logic

**Files:**
- Create: `src/lib/maintenance.ts`
- Test: `tests/maintenance.test.ts`

**Interfaces:**
- Consumes: `Vehicle`, `ID` from `@/lib/types`.
- Produces (all exported from `src/lib/maintenance.ts`):

```ts
export type MaintenanceItemId = "engine-oil" | "cabin-filter" | "air-filter" | "spark-plugs" | "fuel-filter" | "brake-fluid" | "coolant";
export const MAINTENANCE_ITEM_IDS: readonly MaintenanceItemId[]; // spec §4 order
export type FuelType = "petrol" | "diesel";
export interface MaintenanceInterval { km: number | null; months: number }
export interface MaintenanceItem { id: MaintenanceItemId; name: string; interval: MaintenanceInterval }
export interface OdometerReading { km: number; updatedAt: string }            // YYYY-MM-DD
export interface ServiceEntry { id: string; itemId: MaintenanceItemId; date: string; km: number | null }
export interface VehicleMaintenance { odometer: OdometerReading | null; log: ServiceEntry[] }
export type MaintenanceState = Record<ID, VehicleMaintenance>;
export type MaintenanceStatus = "overdue" | "soon" | "unknown" | "ok";
export interface ItemStatus {
  item: MaintenanceItem; status: MaintenanceStatus; last: ServiceEntry | null;
  remainingKm: number | null; remainingDays: number | null; label: string;
}
export const SOON_KM = 1500, SOON_DAYS = 30, STALE_ODOMETER_DAYS = 90, MAX_LOG_ENTRIES = 50, MAX_KM = 2_000_000;

export function fuelTypeOf(v: Vehicle): FuelType;
export function usesBmwLongLife(v: Vehicle): boolean;       // make === "BMW" && generation not E30/E36
export function itemsFor(v: Vehicle): MaintenanceItem[];   // table per spec §4 / §4.1; drops spark-plugs for diesel
export function isIsoDate(s: string): boolean;             // strict YYYY-MM-DD and a real calendar date
export function addMonths(date: string, months: number): string; // clamps to month end
export function daysBetween(from: string, to: string): number;   // to - from, whole days, UTC
export function lastEntry(log: ServiceEntry[], itemId: MaintenanceItemId): ServiceEntry | null; // newest date; tie → later in array
export function itemStatus(item: MaintenanceItem, last: ServiceEntry | null, currentKm: number | null, today: string): ItemStatus;
export function vehicleSchedule(v: Vehicle, record: VehicleMaintenance | undefined, today: string): ItemStatus[]; // sorted
export function isOdometerStale(o: OdometerReading | null, today: string): boolean; // > 90 days old
export function validateOdometer(input: string): { km?: number; error?: string };
export function validateServiceInput(date: string, km: string, today: string): { date?: string; km?: number | null; errors: { date?: string; km?: string } };
export function todayIso(now?: Date): string;               // local date, YYYY-MM-DD
```

- **Item names (exact):** "Motor yağı + yağ filtresi", "Polen filtresi", "Hava filtresi", "Bujiler", "Yakıt filtresi", "Fren hidroliği", "Antifriz".
- **Intervals:** Use spec §4 and §4.1 exactly. The BMW fuel filter is 60.000/48 for diesel and 100.000/72 for petrol.
- **Diesel detection:** Run on `v.engine`. Diesel when it matches `TDI`, `CDI`, `Diesel`, a standalone `d` token, or a token ending in digits + `d` (`320d`, `xDrive30d`, `730d`). Everything else is petrol; hybrids are petrol.
- **Status algorithm (`itemStatus`):**
  - With no `last` entry, the status is `unknown` and the label is "Son değişim bilinmiyor".
  - Otherwise `dueDate = addMonths(last.date, months)` and `remainingDays = daysBetween(today, dueDate)`.
  - `remainingKm` is computed only if `interval.km` is set and both `currentKm` and `last.km` are non-null: `interval.km - max(0, currentKm - last.km)`.
  - **overdue:** `remainingDays <= 0` or `remainingKm <= 0`.
  - **soon:** otherwise, if `remainingDays <= 30` or `remainingKm <= 1500`.
  - **ok:** everything else.
- **Label:** Choose the dimension with the smaller fraction of its interval (`remainingKm / interval.km` versus `remainingDays / (months * 30.44)`; only time if km is null).
  - km: `"1.200 km kaldı"` / `"1.200 km gecikti"`, with the `tr-TR` thousands separator.
  - days, when `|days| < 60`: `"12 gün kaldı"` / `"12 gün gecikti"`.
  - days otherwise: `Math.round(|days| / 30)` + `" ay kaldı"` / `" ay gecikti"`.
  - `remainingDays === 0`: `"Süresi bugün doldu"`.
- **Sort order:** overdue, soon, unknown, ok. Within a status, sort by smaller fraction first; unknown keeps the §4 order.
- **Validation messages (Turkish, exact):**
  - Odometer: `"Km 0 ile 2.000.000 arasında bir tam sayı olmalı."`
  - Date: `"Geçerli bir tarih gir."` / `"Tarih bugünden ileri olamaz."`
  - Km may be empty, which means `null`.

- [ ] **Step 1: Write the failing tests** in `tests/maintenance.test.ts` (one `it` each, today = `"2026-10-13"` unless stated):
  - `fuelTypeOf`: diesel for `320d`, `xDrive30d`, `730d`, `C 220 d`, `C 220 CDI`, `2.0 TDI`, `Cayenne Diesel`. Petrol for `M340i`, `530e … Plug-in Hybrid`, `M3 Competition`, `sDrive18i`. Also every seed vehicle maps without throwing.
  - `itemsFor`:
    - E46 320d has no `spark-plugs`, and its oil is 25.000/24 (BMW).
    - E36 318i has spark plugs and oil at 15.000/12 (general table).
    - C 200 uses the general table.
    - F30 320i has a BMW petrol fuel filter at 100.000/72.
  - `addMonths("2026-01-31", 1) === "2026-02-28"`, `addMonths("2024-02-29", 12) === "2025-02-28"`, `addMonths("2025-11-15", 3) === "2026-02-15"`.
  - `isIsoDate`: false for `"2026-13-40"`, `"2026-02-30"`, `"13.10.2026"` and `""`.
  - `itemStatus` cases on the general oil item (15.000 / 12):
    - no last → `unknown`
    - last 2025-09-01, km null → `overdue`
    - brake fluid (24 months), last 2024-10-25, today 2026-10-13 → `soon` with label `"12 gün kaldı"`
    - last 2026-01-01 km 100000, current 113600 → `soon` with label `"1.400 km kaldı"`
    - current 115000 → `overdue`
    - current null with recent date → `ok`, `remainingKm === null`
    - last.km 120000 > current 110000 → `remainingKm === 15000`, no NaN in label
    - due date equal to today → `overdue` with label `"Süresi bugün doldu"`
  - `vehicleSchedule` puts overdue before soon, soon before unknown, and unknown before ok.
  - `lastEntry` picks the newest date, not the array order.
  - `isOdometerStale`: 91 days → true, 90 → false, null → false.
  - `validateOdometer`: `"abc"`, `"-5"`, `"1.5"` and `"2000001"` give the error; `"98000"` and `"98.000"` give 98000. Accepted input is `/^\d+$/` or `/^\d{1,3}(\.\d{3})+$/` after trimming; anything else is the error.
  - `validateServiceInput`:
    - Future date gives `"Tarih bugünden ileri olamaz."`.
    - Empty km gives `km: null`.
    - Bad date gives `"Geçerli bir tarih gir."`.
- [ ] **Step 2: Run the tests and confirm they fail.** Run `npx vitest run tests/maintenance.test.ts`. Expected: FAIL, the module is not found.
- [ ] **Step 3: Implement `src/lib/maintenance.ts`** per the Interfaces block. Use UTC date math on `YYYY-MM-DD` strings, never local `Date` parsing of bare strings.
- [ ] **Step 4: Run the tests and confirm they pass.** Run `npx vitest run tests/maintenance.test.ts`, then `npm test`. Expected: PASS for all.
- [ ] **Step 5: Commit.** Message `Bakım takvimi hesaplama mantığı eklendi` with these bullets:
  - Genel ve BMW LongLife örnek aralıkları
  - Gecikti / yaklaşıyor / bilinmiyor / zamanı var durumları
  - Tarih ve km doğrulama

### Task 5: Recommendations (item → products and kits)

**Files:**
- Create: `src/lib/maintenance-recommendations.ts`
- Test: `tests/maintenance.test.ts` (new `describe`)

**Interfaces:**
- Consumes: `MaintenanceItemId` (Task 4); `fitsVehicle` (`@/lib/catalog/fitment`); `normalizeText` (`@/lib/catalog/search`); `kitsForVehicle` (`@/lib/kits`); `CatalogData`.
- Produces:

```ts
export const ITEM_MATCHERS: Record<MaintenanceItemId, { categorySlugs: string[]; keywords: string[]; exclude?: string[] }>;
export function productMatchesItem(product: Product, itemId: MaintenanceItemId, categories: Category[]): boolean;
export function productsForItem(itemId: MaintenanceItemId, vehicleId: ID,
  catalog: Pick<CatalogData, "products" | "categories" | "compatibility">, limit?: number /* 3 */): Product[];
export function kitsForItem(itemId: MaintenanceItemId, vehicleId: ID,
  catalog: Pick<CatalogData, "products" | "categories" | "kits">): MaintenanceKit[];
export function itemCategorySlug(itemId: MaintenanceItemId): string; // first categorySlug, for the "kategoriye göz at" link
```

- **Matchers:** Use spec §7. Keywords are compared after `normalizeText` on both sides.
  - `engine-oil`: `["yag filtresi","motor yagi"]`
  - `spark-plugs`: `["buji"]` with exclude `["kizdirma"]`
  - `coolant`: categories `motor-yagi-sivilar` and `sogutma`
- **Filtering:** Only `status === "published"` products that `fitsVehicle`.
- **Ordering:** in stock (`stock > 0`) first, then `featured`, then name (`tr` locale).
- **Kits:** `kitsForItem` returns published kits from `kitsForVehicle(kits, vehicleId)` that have at least one line whose product matches the item.

- [ ] **Step 1: Write the failing tests:**
  - `productsForItem("spark-plugs", "v-bmw-e90-320d", seed)` contains no product whose name includes "Kızdırma".
  - For `"v-bmw-e46-320d"` and `"air-filter"`, the result includes `p-007` and every result passes `fitsVehicle`.
  - No product with `unverified` status for the vehicle is returned. Use `p-009` for `v-bmw-e60-520d`, which is seed `unverified`, against `fuel-filter`.
  - Drafts are excluded. Take a cloned catalog with `p-007` set to `status: "draft"`; then `p-007` is not returned.
  - `limit` defaults to 3.
  - `kitsForItem("engine-oil", "v-bmw-e46-320d", seed)` returns `kit-e46-320d-bakim`, and `kitsForItem("coolant", …)` returns `[]`.
  - `productsForItem("coolant", "v-porsche-991-carrera-s", seed)` returns `[]`, and `itemCategorySlug("coolant") === "motor-yagi-sivilar"`.
- [ ] **Step 2: Run the tests and confirm they fail.** Run `npx vitest run tests/maintenance.test.ts`. Expected: FAIL, the module is not found.
- [ ] **Step 3: Implement** per the Interfaces block.
- [ ] **Step 4: Run the tests and confirm they pass.** Run `npm test`. Expected: PASS for all.
- [ ] **Step 5: Commit.** Message `Bakım kalemleri için ürün ve set önerileri eklendi`.

### Task 6: Maintenance store and storage validation

**Files:**
- Modify: `src/lib/storage.ts` (add `KEYS.maintenance`, `isMaintenanceState`, `normalizeMaintenance`)
- Create: `src/state/maintenance-store.ts`
- Test: `tests/storage.test.ts`, `tests/persistent-store.test.ts` (pattern for injected storage)

**Interfaces:**
- Consumes: the types and constants from Task 4, and `newId` from `@/lib/ids`.
- Produces:

```ts
// storage.ts
KEYS.maintenance === "ks:v1:maintenance";
export function isMaintenanceState(v: unknown): v is MaintenanceState; // plain non-array object only (lenient; normalize cleans)
export function normalizeMaintenance(s: MaintenanceState): MaintenanceState;
// maintenance-store.ts
export const maintenanceStore: PersistentStore<MaintenanceState>;     // fallback {}
export const maintenanceActions: {
  setOdometer(vehicleId: ID, km: number, today: string): void;
  logService(vehicleId: ID, itemId: MaintenanceItemId, date: string, km: number | null): void; // appends, then trims to 50 newest by date
  removeEntry(vehicleId: ID, entryId: string): void;
};
export function useMaintenance(): { state: MaintenanceState; hydrated: boolean } & typeof maintenanceActions;
export function useGarageSchedules(): { hydrated: boolean; today: string;
  schedules: { vehicle: Vehicle; record: VehicleMaintenance | undefined; items: ItemStatus[]; overdue: number; soon: number }[] };
// saved garage vehicles only, in garage order; today = todayIso() computed client-side once hydrated
```

`normalizeMaintenance` cleans the stored state as follows:
- **Records:** A record whose value is not an object becomes `{ odometer: null, log: [] }`.
- **Odometer:** An invalid odometer becomes `null`. Valid means `km` is an integer between 0 and `MAX_KM` and `updatedAt` is an ISO date.
- **Log entries:** Each must be an object with a string `id`, an `itemId` from `MAINTENANCE_ITEM_IDS`, an ISO `date`, and a `km` that is null or an integer between 0 and `MAX_KM`. Invalid entries are dropped.
- **Log size:** The log is trimmed to the 50 newest entries.
- **Vehicle ids:** Records for vehicles missing from the catalog are ignored at read time in `useGarageSchedules`, because it only iterates garage vehicles. `useGarage` already drops vehicles missing from the catalog. They are not deleted.

- [ ] **Step 1: Write the failing tests** in `tests/storage.test.ts`:
  - `normalizeMaintenance` keeps a valid record unchanged.
  - It drops entries with `km: "100"`, `date: "2026-13-40"`, `itemId: "wipers"`, or a missing id.
  - It nulls an odometer with `km: -1`.
  - It trims 60 entries to the 50 newest.
  - It turns a non-object record into the empty record.
  - `isMaintenanceState([])` and `isMaintenanceState(null)` are false.

  In `tests/persistent-store.test.ts`, following the existing injected-storage pattern: a store created with `KEYS.maintenance`, `isMaintenanceState` and `normalizeMaintenance`, reading `'{"v-x":{"odometer":null,"log":[{"id":"a","itemId":"coolant","date":"bad","km":null}]}}'`, yields `{ "v-x": { odometer: null, log: [] } }`.
- [ ] **Step 2: Run the tests and confirm they fail.** Run `npx vitest run tests/storage.test.ts tests/persistent-store.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** the storage functions, then `maintenance-store.ts`, following `garage-store.ts` (`createPersistentStore(KEYS.maintenance, {}, isMaintenanceState, { normalize: normalizeMaintenance })`). In `logService`, `id = newId("svc")`.
- [ ] **Step 4: Run the tests and confirm they pass.** Run `npm test`. Expected: PASS for all.
- [ ] **Step 5: Commit.** Message `Bakım verisi için tarayıcı deposu eklendi` with these bullets:
  - Bozuk veya eski kayıtların tek tek temizlenmesi
  - Araç başına en fazla 50 kayıt

### Task 7: Garage page maintenance panel

**Files:**
- Create: `src/components/store/MaintenancePanel.tsx`
- Modify: `src/components/store/GaragePage.tsx` (render `<MaintenancePanel vehicle={v} />` inside each saved-vehicle `<li>`, below the existing row; the `<li>` becomes a column wrapper)
- Test: covered by the e2e in Task 9. No component unit tests; the logic lives in Tasks 4–6.

**Interfaces:**
- Consumes: `useGarageSchedules`, `maintenanceActions`, `useMaintenance` (Task 6); `productsForItem`, `kitsForItem`, `itemCategorySlug` (Task 5); `validateOdometer`, `validateServiceInput`, `isOdometerStale`, `usesBmwLongLife` (Task 4); `KitCard` with its `vehicleId` prop; `cartActions.add` (match the existing ProductCard add-to-cart call and toast); `Badge`, `Button`, `Field` from `components/ui`.
- Produces: `export function MaintenancePanel({ vehicle }: { vehicle: Vehicle }): JSX.Element`. Exact copy follows.

**UI contract.** These strings are matched by the e2e test.

**Disclosure**
- A native `<details>` with `<summary>` showing "Bakım takvimi" followed by a count: "· 2 gecikti, 1 yaklaşıyor", or "· Bilgi girilmedi" when the log is empty.
- It starts `open` when `overdue + soon > 0`.

**Km row**
- Label "Güncel km". The input has id `odo-<vehicleId>`, `inputMode="numeric"`, and a "Kaydet" button.
- Below it: "Son güncelleme: 13.10.2026" using `formatDate`.
- When stale, a warning line: "Km bilgisi N ay önce girildi, güncelle."

**Item rows** (one `<li>` per item, `data-item={item.id}`)
- Name, then the badge. Badges by status:

  | Status | Label | Icon | Badge tone |
  |---|---|---|---|
  | overdue | Gecikti | `AlertTriangle` | danger |
  | soon | Yaklaşıyor | `Clock` | warning |
  | unknown | Bilinmiyor | `HelpCircle` | neutral |
  | ok | Zamanı var | `CheckCircle2` | success |

  Use the existing `Badge` tones; pick the nearest available tone if one is missing.
- Then the label, then "Son değişim: 12.03.2026 · 98.000 km" (or without km).
- Buttons:
  - "Bugün yaptım" → `logService(v.id, item.id, today, odometer?.km ?? null)` + toast "Kaydedildi."
  - "Son değişimi gir" → toggles an inline form with a date input (`max=today`) and a km input. Its ids are `svc-date-<vehicleId>-<itemId>` and `svc-km-<vehicleId>-<itemId>`, with a "Kaydet" button. Validation errors show under the fields.
- Accessible names include the item name, via `aria-label`: "Motor yağı + yağ filtresi: bugün yaptım".

**Recommendations** (only for overdue or soon)
- Up to 3 compact product rows: name, `formatPrice`, and "Sepete ekle" (disabled with "Stokta yok" when `stock === 0`).
- Then kits as `KitCard` with `vehicleId`, under the heading "Bu bakım için set".
- With neither products nor kits: the link "Aracına doğrulanmış ürün yok — kategoriye göz at" → `/categories/<itemCategorySlug>`.

**History**
- Heading "Son bakımlar", showing the 5 newest entries: date, item name, km, and an icon button "Kaydı sil" (`aria-label` "<item> kaydını sil").
- Hidden when the log is empty.

**Note**
- A footer note per the Global Constraints. Prefix "BMW LongLife örnek aralıkları. " when `usesBmwLongLife`.

**Before hydration**
- Render nothing inside the details, or `LoadingState` with 1 row. The page already gates on `hydrated`.

- [ ] **Step 1: Read the Next 16 docs** relevant to client components (`node_modules/next/dist/docs/`), then implement `MaintenancePanel` and wire it into `GaragePage`.
- [ ] **Step 2: Verify in the browser.**
  1. Start the `dev` server from `.claude/launch.json`.
  2. Open `/garage` and add BMW F30 320d.
  3. Enter km 120000, then set the oil date to 13 months ago.
  4. Expect "Gecikti", 1–3 recommended products and a set card, and no console errors.
  5. Check 375 px width for overflow.
- [ ] **Step 3: Run the checks.** Run `npm run lint && npm run typecheck && npm test`. Expected: all pass.
- [ ] **Step 4: Commit.** Message `Garaj sayfasına bakım takvimi eklendi` with these bullets:
  - Km girişi ve eskiyen km uyarısı
  - Kalem başına durum, "Bugün yaptım" ve son değişim formu
  - Gecikmiş ve yaklaşan bakımlar için uygun parça ve set önerileri
  - Son 5 bakım kaydı

### Task 8: Home-page strip and header dot

**Files:**
- Create: `src/components/store/MaintenanceStrip.tsx`
- Modify: `src/app/(store)/page.tsx` or the home composition file that renders `HomeHero` (place the strip directly under the hero); `src/components/store/StoreHeader.tsx` (Garajım links at lines ~132, ~146, ~182)

**Interfaces:**
- Consumes: `useGarageSchedules` (Task 6) and `useGarage().selectedVehicle`.
- Produces:
  - `export function MaintenanceStrip(): JSX.Element | null`
  - `export function useHasOverdueMaintenance(): boolean`, in `maintenance-store.ts`. It is `false` before hydration.

**Strip**
- Hidden before hydration and when there is no selected vehicle.
- **Selected vehicle has no log entries at all:** the text "<vehicleShortLabel>: bakım takvimini başlat" links to `/garage`.
- **Has overdue or soon items:** the text "<vehicleShortLabel>: 2 bakım gecikti, 1 yaklaşıyor" plus the link "Garajda gör". Omit a zero part, so the text reads "1 bakım yaklaşıyor".
- **Otherwise:** `null`.
- Use `role="status"` and no animation.

**Header**
- When `useHasOverdueMaintenance()` is true, the desktop Garajım link and the mobile menu entries get a `size-2 rounded-full` dot in the danger color, plus a visually hidden " (gecikmiş bakım var)" inside the link text.

**Home page rendering**
- The home page uses Suspense and cache components. The strip is a client component, so render it inside the existing client boundary pattern used by `HomeHero`, or wrap it in `<Suspense fallback={null}>`.
- It must not break the static prerender. Verify with `npm run build`.

- [ ] **Step 1: Implement** the strip, the hook and the header change.
- [ ] **Step 2: Verify in the browser.**
  1. With F30 320d selected and oil overdue (from Task 7), open `/`.
  2. The strip shows "gecikti". The header Garajım link has the dot, and the accessibility tree shows "(gecikmiş bakım var)".
  3. Press "Bugün yaptım" for oil on `/garage`, then return: the dot is gone.
- [ ] **Step 3: Run the checks.** Run `npm run lint && npm run typecheck && npm test && npm run build`. Expected: all pass, and the build still lists `/` as prerendered (static/partial).
- [ ] **Step 4: Commit.** Message `Ana sayfa bakım şeridi ve header uyarısı eklendi`.

### Task 9: E2E, README and screenshots

**Files:**
- Create: `e2e/maintenance.spec.ts`
- Modify: `README.md` (feature section in the case study, Turkish summary bullet, catalog counts, test counts); `scripts/screenshots.mjs` (add a garage maintenance shot), `docs/media/*.png`

**Interfaces:**
- Consumes: the UI contract strings from Tasks 7–8.

- [ ] **Step 1: Write the e2e test.** `test("maintenance reminder flags overdue oil and recommends fitting parts")`:
  1. `goto("/garage")`.
  2. Choose BMW › 3 Serisi › F30 › 2016 › `v-bmw-f30-320d` in the stacked selector and press "Garaja ekle ve seç".
  3. Fill `#odo-v-bmw-f30-320d` with `120000` and press "Kaydet".
  4. Press "Son değişimi gir" for engine-oil (scoped by `li[data-item="engine-oil"]`). Fill `#svc-date-v-bmw-f30-320d-engine-oil` with a date 13 months before today (computed in the test) and `#svc-km-…` with `100000`, then press "Kaydet".
  5. Expect "Gecikti" in that row.
  6. Press the first "Sepete ekle" in that row and expect the header cart link to match `/Sepet \(1 ürün\)/`.
  7. `goto("/")` and expect the text "1 bakım gecikti". Expect the Garajım link's accessible name to contain "gecikmiş bakım var" (desktop viewport).
  8. Back on `/garage`, press "Motor yağı + yağ filtresi: bugün yaptım". Expect "Zamanı var" in the row, and "Son bakımlar" to list 2 entries.
  9. Call `expectNoMobileOverflow(page)`.
- [ ] **Step 2: Run it.** Run `npm run build && npx playwright test e2e/maintenance.spec.ts`. Expected: PASS. If it fails, fix the code, not the contract, unless the contract string is unreachable as specified. If so, record a ruling.
- [ ] **Step 3: Run the full e2e suite.** Run `npm run e2e`. Expected: 9 passed. If `fitment.spec.ts` selectors break because the years or engine lists grew, adjust only the selection values.
- [ ] **Step 4: Update the README.**
  - Feature paragraph: what the maintenance reminder does, honesty rules, BMW LongLife table.
  - Turkish summary bullet.
  - Product, vehicle and kit counts.
  - Test counts from the real `npm test` and `npm run e2e` output.
- [ ] **Step 5: Regenerate screenshots.** Add the garage shot to `scripts/screenshots.mjs`, then run it against the production server (port 3001 config). Reference the new image in the README.
- [ ] **Step 6: Run the final checks.** Run `npm run lint && npm run typecheck && npm test && npm run build && npm run e2e`. Expected: all green.
- [ ] **Step 7: Commit.** Message `Bakım hatırlatıcısı için uçtan uca test ve README güncellemesi` with these bullets:
  - Gecikmiş bakım, öneri ve "Bugün yaptım" akışı testi
  - README'de özellik açıklaması, güncel sayılar ve ekran görüntüsü
