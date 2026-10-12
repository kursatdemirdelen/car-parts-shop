# Portfolio Upgrade Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Turn the Kursat Shop prototype into a portfolio-grade project: live demo, CI + e2e tests, case-study README, VIN decoder, SEO pages, maintenance kits and companion parts.

**Architecture:** Keep the existing layering (`src/lib` pure rules + tests, `src/state` localStorage stores, `src/components`, `src/app`). New domain logic (VIN, kits, SEO lookups) lands as pure, tested modules in `src/lib`; new data (`kits`, `companionIds`) extends the single catalog with a migration for previously stored browser data. SEO pages are server-rendered from the seed.

**Tech Stack:** Next.js 16.4 (App Router, Cache Components), React 19, TypeScript strict, Tailwind 4, Vitest, `@playwright/test` (new dev dependency), GitHub Actions, Vercel.

**Spec:** `docs/superpowers/specs/2026-10-12-portfolio-upgrade-design.md` (+ previous `docs/superpowers/specs/2026-10-12-kursat-shop-design.md`, still binding).

## Global Constraints

- UI copy Turkish; README English main text + short Turkish summary at the top.
- No new runtime dependencies. Dev dependency allowed: `@playwright/test`.
- No fake discounts, ratings, reviews or "best seller" claims. Kit price = sum of its lines.
- Unknown compatibility is never shown as a fit; companions/kits only recommend `confirmed` or `universal` products when a vehicle is selected.
- VIN decoder decodes only WMI (chars 1–3) and model year (char 10); it must say model/body/engine cannot be decoded.
- Old browser data must keep working: stored catalogs without `kits` / `companionIds` load with safe defaults, user edits retained.
- Folder structure is not reorganised.
- Every task ends with `npm run lint`, `npm run typecheck`, `npm test` clean; UI tasks are also checked in a browser.
- Commit author email is the GitHub noreply address already configured in this repo.

## Review Focus

1. **Stored catalog from before this upgrade** (no `kits`, products without `companionIds`) — app loads, seed kits appear, user's product edits are kept (test in Task 2).
2. **A product in a kit or a companion list is deleted / unpublished / out of stock** — kit shows the remaining lines and says which are unavailable; "Seti sepete ekle" adds only purchasable lines and reports the rest; companion silently omitted (tests in Task 2).
3. **Messy VIN input** — lowercase, spaces, dashes, `I/O/Q`, wrong length, unknown manufacturer code — clear Turkish message, never a false vehicle match (tests in Task 5).
4. **Model-year code ambiguity** (`A` = 1980/2010, `5` = 2005/2035) — only years ≤ current year are candidates, and only those overlapping demo vehicles narrow the list (tests in Task 5).
5. **OEM URL typed with dots/spaces or unknown OEM** — `/oem/34.11.6.860.912` resolves to the canonical normalized page; unknown OEM shows a helpful not-found with search (tests in Task 7).

---

### Task 1: Deferred polish fixes

**Files:**
- Modify: `src/lib/catalog/search.ts`, `src/lib/cart.ts`, `src/lib/storage.ts`, `src/state/persistent-store.ts`, `src/state/cart-store.ts`, `src/components/product/ProductCard.tsx`, `src/components/product/ProductGrid.tsx`, `src/components/product/ProductBits.tsx`, `src/components/store/StoreHeader.tsx`, `src/components/store/SearchInput.tsx`, `src/components/store/CheckoutPage.tsx`, `src/components/store/TrustStrip.tsx`, `src/components/admin/ProductsAdmin.tsx`, `src/state/providers.tsx`
- Test: `tests/catalog.test.ts`, `tests/commerce.test.ts`, `tests/storage.test.ts`

**Interfaces:**
- Produces: `ResolvedCart.purchasableCount: number` (sum of quantities of `ok` + `insufficient` lines); `normalizeCart(cart: Cart): Cart` in `src/lib/cart.ts` (merges duplicate productIds by summing quantities); `setStorageWriteErrorHandler(fn: (key: string) => void): void` in `src/state/persistent-store.ts`.

- [ ] **Step 1: Failing tests**
  - `searchProducts(products, brands, "brembo 34116860912")[0].id === "p-002"` (OEM codes become searchable tokens in the text haystack).
  - `normalizeCart({items:[{productId:"p-002",quantity:1},{productId:"p-002",quantity:2}]})` → one line, quantity 3; `resolveCart` of a cart with an unavailable line: `purchasableCount` excludes it.
  - Storage: a store created with `createPersistentStore` whose storage `setItem` throws calls the registered write-error handler with its key (inject storage by making `createPersistentStore` accept an optional `storage?: () => Storage | undefined` param, default browser).
- [ ] **Step 2:** `npx vitest run` → the new tests FAIL.
- [ ] **Step 3: Implement**
  - Search: add normalized OEM codes and SKU as tokens to the haystack.
  - Cart store normalizes on read (`createPersistentStore(KEYS.cart, …, isCart, normalizeCart)`).
  - Persistent store: on `writeJSON` false call the handler; `storage` event with `key === null` invalidates and notifies; `Providers` registers a handler that toasts `Tarayıcı depolama alanına yazılamadı; değişiklik bu sayfayı yenileyince kaybolabilir.` (error tone).
  - `ProductCard`/`ProductGrid` pass `settings.lowStockThreshold` to `StockStatus`.
  - `QuantitySelector`: local string state; commit on blur/Enter; empty → revert.
  - Header cart badge uses `purchasableCount`.
  - `SearchInput`: `aria-controls` only when the listbox is rendered; the no-match text gets `role="status"`.
  - Checkout: navigate to `/order-success?ref=` first, clear the cart after navigation (e.g. clear in the success page when `ref` matches an order created this session via a `sessionStorage` flag `ks:v1:just-ordered`), so the empty-cart state never flashes.
  - TrustStrip copy: `Örnek kargo kuralı`, `Örnek iade koşulu`, `Uyumluluk danışmanlığı (demo)`, `Şeffaf uyumluluk` — each text ends with "(demo)" where it describes a service.
  - Admin products description: `Stok bu listede görünür, ürün formundan düzenlenir.`
- [ ] **Step 4:** tests PASS; lint + typecheck clean; browser: cart badge, quantity typing, checkout → success without empty-cart flash.
- [ ] **Step 5:** Commit `fix: deferred polish from final review`.

---

### Task 2: Kits and companions — data, migration, rules

**Files:**
- Modify: `src/lib/types.ts`, `src/lib/seed/index.ts`, `src/lib/seed/products.ts`, `src/lib/storage.ts`, `src/lib/validation.ts`, `src/state/catalog-store.ts`
- Create: `src/lib/seed/kits.ts`, `src/lib/kits.ts`
- Test: `tests/kits.test.ts`, `tests/seed.test.ts`, `tests/storage.test.ts`, `tests/validation.test.ts`

**Interfaces:**
- Produces (types.ts):
```ts
export interface KitLine { productId: ID; quantity: number }
export interface MaintenanceKit {
  id: ID; slug: string; name: string; description: string;
  vehicleIds: ID[]; lines: KitLine[]; status: PublicationStatus;
}
// Product gains: companionIds?: ID[]
// CatalogData gains: kits: MaintenanceKit[]
```
- Produces (`src/lib/kits.ts`):
```ts
interface ResolvedKitLine { line: KitLine; product: Product | null; available: boolean }
resolveKit(kit: MaintenanceKit, products: Product[]): { lines: ResolvedKitLine[]; total: number; availableCount: number };
kitsForVehicle(kits: MaintenanceKit[], vehicleId: ID): MaintenanceKit[]; // published only
companionsFor(product: Product, products: Product[], vehicleId: ID | null, records: CompatibilityRecord[], limit = 4): Product[];
```
  `total` = Σ price×qty of available lines. `companionsFor`: published, in `product.companionIds` order; with a vehicle only `confirmed`/`universal`; without a vehicle all published companions.
- Produces (storage): `migrateCatalog(raw: unknown): unknown` — fills `kits` from seed when missing and `companionIds` absent stays optional; `isCatalogData` accepts optional `companionIds` (string array if present) and requires `kits` element shape.
- Produces (validation): `validateKit(k: Omit<MaintenanceKit,"id">, ctx: { kits: MaintenanceKit[]; products: Product[]; editingId?: ID }): FieldErrors` — messages: name `Bu alan zorunludur.`, slug pattern/uniqueness as categories, `lines` `En az bir ürün ekleyin.`, `lines.<i>` `Adet en az 1 olmalıdır.` / `Bu ürün sette zaten var.`
- Produces (catalog actions): `saveKit(k)`, `deleteKit(id)`; `deleteProduct` also removes lines with that product from kits and the id from other products' `companionIds`; `deleteVehicle` removes it from `kit.vehicleIds`.

- [ ] **Step 1: Failing tests**
  - seed: 4–6 kits; every kit line/vehicle references existing records; each kit's products are `confirmed` or `universal` for every vehicle in `vehicleIds`; ≥ 6 products have `companionIds` referencing existing products (never itself).
  - kits: `resolveKit` total equals Σ of available lines; a deleted/draft/stock-0 product is `available:false` and excluded from total (**Review Focus 2**).
  - `companionsFor(p-002, …, "v-bmw-g20-320i")` contains only confirmed/universal; deleted companion ids are skipped.
  - storage (**Review Focus 1**): `isCatalogData(migrateCatalog({...seedWithoutKits}))` is true and products keep their edited `price`; element-malformed kit → false.
  - validation: each `validateKit` message.
  - catalog cascade: test pure helper `cascadeDeleteProduct(data: CatalogData, id: ID): CatalogData` and `cascadeDeleteVehicle` exported from `src/lib/kits.ts` (actions call them).
- [ ] **Step 2:** FAIL. **Step 3:** Implement (catalog store uses `normalize = (d) => sanitizeCatalog(d)` and `readJSON` path goes through `migrateCatalog` before validation). **Step 4:** PASS + lint/typecheck. **Step 5:** Commit `feat: maintenance kits and companion parts data`.

---

### Task 3: Kits and companions — storefront UI

**Files:**
- Create: `src/components/product/KitCard.tsx`, `src/components/product/Companions.tsx`
- Modify: `src/components/product/ProductDetail.tsx`, `src/components/store/CartPage.tsx`, `src/state/cart-store.ts`

**Interfaces:**
- Consumes: Task 2 `resolveKit`, `kitsForVehicle`, `companionsFor`.
- Produces: `KitCard({ kit })` (name, vehicles, line list with availability, total, "Seti sepete ekle"); `cartActions.addKit(kit: MaintenanceKit): { added: number; skipped: string[] }` (skipped = names of unavailable products); `Companions({ product })`.

- [ ] **Step 1:** Implement. Product detail: "Bununla birlikte genellikle değiştirilenler" section (hidden when empty) before "Benzer ürünler"; when no vehicle is selected each card shows its fitment badge state via `ProductGrid`. Cart: when a vehicle is selected, "Aracın için bakım setleri" below the lines (max 2 kits). Toast after add-kit: `N ürün sepete eklendi.` + `Stokta olmadığı için eklenmedi: …` when skipped.
- [ ] **Step 2:** Browser: E46 320d selected → kit on cart page, add kit, quantities correct; product page companions only confirmed/universal. lint + typecheck + tests. Commit `feat: kits and companion parts in storefront`.

---

### Task 4: Kits and companions — admin

**Files:**
- Create: `src/components/admin/KitsAdmin.tsx`, `src/app/admin/(panel)/kits/page.tsx`
- Modify: `src/components/admin/AdminShell.tsx` (nav item `Bakım setleri`, icon `PackageCheck`), `src/components/admin/ProductForm.tsx`

**Interfaces:**
- Consumes: Task 2 `validateKit`, `saveKit`, `deleteKit`; existing `DataTable`, `Dialog`, `ConfirmDialog`, `VehicleSelect`.

- [ ] **Step 1:** `KitsAdmin`: table (name, vehicles count, lines count, total via `resolveKit`, status badge, actions); create/edit in `Dialog` with fields from spec §5.3 (vehicle multi-add via `VehicleSelect` + removable chips; lines = product select + quantity input + remove); delete via `ConfirmDialog`; toasts `Bakım seti kaydedildi.` / `Bakım seti silindi.`
- [ ] **Step 2:** ProductForm: section "Birlikte önerilen ürünler" (product select excluding itself and already chosen; removable list); saved as `companionIds`.
- [ ] **Step 3:** Browser: create kit with empty lines → error; valid kit → appears on cart page for its vehicle; add companion in product form → shows on product page. Commit `feat: admin kits and companion editing`.

---

### Task 5: VIN decoding (pure)

**Files:**
- Create: `src/lib/vin.ts`
- Test: `tests/vin.test.ts`

**Interfaces:**
- Produces:
```ts
type VinError = "length" | "chars" | "empty";
interface VinSegment { key: "wmi" | "vds" | "year" | "plant" | "serial"; from: number; to: number; value: string; label: string; decoded: string | null }
interface VinResult {
  input: string; normalized: string; valid: boolean; error?: VinError; message?: string;
  make: string | null; wmi: string; modelYears: number[]; segments: VinSegment[];
}
normalizeVin(input: string): string;                 // uppercase, strip spaces and dashes
decodeVin(input: string, currentYear: number): VinResult;
vehiclesForVin(result: VinResult, vehicles: Vehicle[], currentYear: number): Vehicle[]; // make match + production range contains a candidate year
WMI_MAKES: Record<string, string>; // e.g. WBA/WBS/WBY/WBX→BMW, WDB/WDD/WDC/WDF/W1K/W1N/W1V→Mercedes-Benz, WP0/WP1→Porsche, WAU/WUA/WA1→Audi
```
  Model-year code sequence (30-year cycle starting 1980): `ABCDEFGHJKLMNPRSTVWXY123456789`; candidates = base + 30k for k ≥ 0 while ≤ `currentYear`.
  Messages: empty `Şasi numarasını girin.`; length `Şasi numarası 17 karakter olmalıdır (şu an N).`; chars `Şasi numarasında I, O ve Q harfleri bulunmaz; lütfen kontrol edin.`; unknown WMI → valid but `make: null`, message `Bu üretici kodu demo kapsamında değil (yalnızca BMW, Mercedes-Benz, Porsche, Audi).`

- [ ] **Step 1: Failing tests** (**Review Focus 3 & 4**)
  - `normalizeVin(" wba-ev3 3435kr12345 ")` → `"WBAEV33435KR12345"`.
  - `decodeVin("WBAEV33435KR12345", 2026)`: valid, make `BMW`, `modelYears` `[2005]` (2035 excluded), 5 segments with `vds.decoded === null`.
  - Year code `A` with currentYear 2026 → `[1980, 2010]`.
  - Length 16 → `error:"length"`; contains `O` → `error:"chars"`; unknown WMI `ZFA…` → valid, `make:null`.
  - `vehiclesForVin(decode("WBAEV33435KR12345"), seed.vehicles, 2026)` includes `v-bmw-e46-320d` and `v-bmw-e90-320d`, excludes any non-BMW and `v-bmw-g20-*`.
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. **Step 5:** Commit `feat: VIN decoding for manufacturer and model year`.

---

### Task 6: VIN UI — selector mode and `/sasi-sorgula`

**Files:**
- Create: `src/components/store/VinLookup.tsx`, `src/components/store/VinExplainer.tsx`, `src/app/(store)/sasi-sorgula/page.tsx`
- Modify: `src/components/store/VehicleSelector.tsx`, `src/components/store/StoreFooter.tsx`, `src/components/store/InfoPages.tsx` (help FAQ link)

**Interfaces:**
- Consumes: Task 5 `decodeVin`, `vehiclesForVin`, `normalizeVin`.
- Produces: `VinLookup({ onChoose: (v: Vehicle) => void, compact?: boolean })`; `VehicleSelector` gains a mode toggle (`aria-pressed` buttons) `Adım adım` / `Şasi numarası ile`, default `Adım adım`; in VIN mode it renders `VinLookup` and choosing a vehicle runs the same submit path (garage choose + toast + optional navigate).

- [ ] **Step 1:** `VinLookup`: input (17-char counter, `autoComplete="off"`, `spellCheck={false}`), decode on submit, result card: `Üretici: BMW`, `Model yılı: 2005` (or `2010 veya 1980`), honest note `Model, kasa ve motor şasi numarasının üreticiye özel kısmındadır; bu demoda çözülmez. Aşağıdan aracını seç.`, then list of matching demo vehicles as buttons (max 12) or empty state linking to step-by-step mode.
- [ ] **Step 2:** `/sasi-sorgula`: PageHeader `Şasi numarası (VIN) nasıl okunur?`; input prefilled with demo example `WBAEV33435KR12345` (button `Örnek ile dene`); `VinExplainer` renders the 17 characters as monospace boxes grouped by segment with label, value and `Çözüldü` / `Üreticiye özel – çözülemedi` badges; explanatory text about ISO 3779 and why full decoding needs manufacturer data; below it `VinLookup`. Footer "Yardım" column and help FAQ link to it.
- [ ] **Step 3:** Browser at 375/1280: invalid VIN messages, valid VIN → choose E46 320d → garage selected; no overflow (17 boxes wrap on mobile). Commit `feat: VIN lookup in vehicle selector and explainer page`.

---

### Task 7: SEO pages — vehicle and OEM

**Files:**
- Create: `src/lib/seo.ts`, `src/app/(store)/arac/[slug]/page.tsx`, `src/app/(store)/oem/[number]/page.tsx`, `src/components/store/VehiclePage.tsx`, `src/components/store/OemPage.tsx`
- Modify: `src/components/product/ProductDetail.tsx` (vehicle rows link to `/arac/…`, OEM chips get a "Bu OEM'in tüm parçaları" link)
- Test: `tests/seo.test.ts`

**Interfaces:**
- Produces (`src/lib/seo.ts`):
```ts
vehicleSlug(v: Vehicle): string;                       // slugify(`${make} ${generation} ${engine-first-token}`), unique per seed vehicle; fallback appends id suffix on collision
findVehicleBySlug(vehicles: Vehicle[], slug: string): Vehicle | undefined;
allOemNumbers(products: Product[]): string[];          // normalized (normalizeCode), unique, published products only
productsByOem(products: Product[], oem: string): Product[]; // published, matches normalizeCode
partsForVehicle(products: Product[], categories: Category[], records: CompatibilityRecord[], vehicleId: ID): { confirmed: { category: Category; products: Product[] }[]; unverified: Product[] };
```
- [ ] **Step 1: Failing tests:** `vehicleSlug(e46 320d) === "bmw-e46-320d"`; all seed vehicle slugs unique; `findVehicleBySlug` round-trips; `productsByOem(products, "34.11.6.860.912")` returns p-002 (**Review Focus 5**); `allOemNumbers` contains `34116860912` once; `partsForVehicle(…, "v-bmw-e46-320d").confirmed` contains p-036 and never an `unverified` product; unverified list contains p-001.
- [ ] **Step 2:** FAIL → implement → PASS.
- [ ] **Step 3: Pages.** Both pages server components rendering from `seed` (crawlable), wrapping params access in Suspense like existing dynamic routes; `generateStaticParams` from seed; `generateMetadata` with title/description/canonical (`alternates.canonical`).
  - `/arac/[slug]`: h1 `{make} {model} {generation} · {engine}` + years; "Bu aracı seç" (client button → garage choose); sections per category of confirmed parts (`ProductGrid`, `showFitment`); "Doğrulanmamış kayıtlar" collapsible with explanation; kits for the vehicle (`KitCard`); unknown slug → `notFound()`.
  - `/oem/[number]`: if `params.number !== normalizeCode(number)` → `permanentRedirect` to normalized; h1 `OEM {number}`; short explainer "OEM numarası nedir"; product grid; none found → empty state with `SearchInput` and link to `/search?q=`.
- [ ] **Step 4:** Browser: `/arac/bmw-e46-320d`, `/oem/34.11.6.860.912` → redirect, `/oem/123` empty state, `/arac/yok` 404. Commit `feat: vehicle and OEM landing pages`.

---

### Task 8: Structured data, sitemap, robots, OG images, metadataBase

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`, `src/components/seo/JsonLd.tsx`, `src/app/(store)/products/[slug]/opengraph-image.tsx`, `src/app/(store)/arac/[slug]/opengraph-image.tsx`, `src/lib/site.ts`
- Modify: `src/app/layout.tsx`, `src/app/(store)/products/[slug]/page.tsx`, listing/vehicle/OEM pages (breadcrumb JSON-LD)
- Test: `tests/seo.test.ts`

**Interfaces:**
- Produces: `SITE_URL` in `src/lib/site.ts` = `process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"`; `productJsonLd(p: Product, brand: Brand | undefined, url: string): object` (schema.org `Product` with `sku`, `mpn` = first OEM, `brand`, `image`, `offers: { @type: Offer, priceCurrency: "TRY", price, availability: InStock|OutOfStock, url }`; **no** `aggregateRating`/`review`); `breadcrumbJsonLd(items: { name: string; url: string }[]): object`; `JsonLd({ data })` renders `<script type="application/ld+json">`.
- [ ] **Step 1: Failing tests:** `productJsonLd(p-005)` has `offers.availability === "https://schema.org/OutOfStock"`, no `aggregateRating`; `breadcrumbJsonLd` positions start at 1.
- [ ] **Step 2:** FAIL → implement → PASS.
- [ ] **Step 3:** `metadataBase: new URL(SITE_URL)` in root layout; sitemap includes `/`, info pages, all categories, published products, vehicles, OEM pages, `/sasi-sorgula`; robots disallows `/admin`. OG images: 1200×630, white background, wordmark, product name, price or vehicle label, product SVG illustration.
- [ ] **Step 4:** `npm run build` clean; `/sitemap.xml`, `/robots.txt`, `/products/<slug>/opengraph-image` respond 200 in `npm start`. Commit `feat: structured data, sitemap, robots and OG images`.

---

### Task 9: CI and Playwright e2e

**Files:**
- Create: `playwright.config.ts`, `e2e/*.spec.ts`, `.github/workflows/ci.yml`
- Modify: `package.json` (scripts `e2e`, `e2e:install`), `vitest.config.ts` (exclude `e2e/`), `.gitignore` (`test-results/`, `playwright-report/`), `eslint.config.mjs` if needed

**Interfaces:**
- Produces: `npm run e2e` runs Playwright against `next start` on port 3100 (webServer: `npm run build && npm start -- -p 3100` locally reused if running; in CI build happens in a previous step).

- [ ] **Step 1:** Specs (Chromium only), each starting from cleared storage and asserting no `pageerror`:
  1. `search.spec`: type `34 11 6 860 912` in header search → suggestion → product page h1 `Ön Fren Balatası Seti`.
  2. `fitment.spec`: select BMW › 3 Serisi › E46 › 2003 › 320d → `/products?fit=1` → B12 card shows `Doğrulanmış uyum`; G20 pads absent.
  3. `checkout.spec`: add product, change qty, checkout with invalid email (error visible) → valid → success page shows `KS-` reference; cart badge gone.
  4. `admin.spec`: demo login → create product → visible on `/products/<slug>` → delete with confirmation → gone.
  5. `vin.spec`: `/sasi-sorgula` → `Örnek ile dene` → choose `320d` E46 → vehicle bar shows it.
  - Every spec also runs a `375×812` overflow check helper on the pages it visits (`scrollWidth <= clientWidth`).
- [ ] **Step 2:** `npm run e2e` → all pass locally.
- [ ] **Step 3:** `ci.yml` on push/PR to `master`: Node 22, `npm ci`, lint, typecheck, test, build, `npx playwright install --with-deps chromium`, e2e; upload Playwright report on failure.
- [ ] **Step 4:** Push branch; GitHub Actions run green (check with `gh run watch`). Commit `ci: lint, typecheck, unit and e2e tests`.

---

### Task 10: Vercel deployment

**Files:**
- Modify: `src/components/store/StoreFooter.tsx` (link `GitHub'da kaynak kod` → repo URL), `src/components/store/HomeSections.tsx` (small line under the hero: `Bu bir demo projedir · Kaynak kod GitHub'da`), `README.md` (deploy section)

- [ ] **Step 1:** Create the Vercel project linked to `kursatdemirdelen/car-parts-shop` (production branch `master`), env `NEXT_PUBLIC_SITE_URL` = production URL. If the Vercel tooling needs the owner's action (login/consent), stop and give the exact steps.
- [ ] **Step 2:** Production deployment READY; smoke check `/`, `/products/brembo-on-fren-balatasi-g20`, `/arac/bmw-e46-320d`, `/sasi-sorgula`, `/admin/login`, `/sitemap.xml` return 200 on the live URL.
- [ ] **Step 3:** Commit `chore: deploy configuration and source link`.

---

### Task 11: Quality evidence and case-study README

**Files:**
- Create: `scripts/screenshots.mjs` (Playwright script), `docs/media/*.png`
- Modify: `README.md`

- [ ] **Step 1:** Lighthouse (mobile) on live home and product page via `npx lighthouse` (dev-time only, not a dependency) → meet spec targets (Perf ≥ 90, A11y ≥ 95, BP ≥ 95, SEO 100); fix what blocks them; record scores.
- [ ] **Step 2:** `scripts/screenshots.mjs` captures desktop home, product detail with fitment, vehicle page, VIN explainer, admin products, mobile listing → `docs/media/`.
- [ ] **Step 3:** README (English + Turkish summary at top) per spec §4.2: badges (CI, live demo), screenshots, Problem (market findings with sources), Product decisions, Architecture (mermaid diagram: seed → stores → storefront/admin; lib rules), Quality (tests count, e2e list, Lighthouse scores), "If this went to production" (backend, auth, payments, KVKK, business models A/B/C), Getting started, Limitations.
- [ ] **Step 4:** Commit `docs: case-study README with screenshots and quality evidence`.
