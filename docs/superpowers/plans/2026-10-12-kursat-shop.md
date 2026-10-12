# Kursat Shop Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A runnable Next.js prototype of Kursat Shop: a Turkish automotive-parts storefront plus a catalog admin panel, both driven by one typed, browser-persisted mock data layer.

**Architecture:** Pure, unit-tested business logic in `src/lib` (search, filtering, fitment, cart, orders, validation, storage). A single client `CatalogProvider` holds catalog data (seeded identically on server and client, then hydrated from localStorage after mount) and exposes CRUD to the admin. Separate small providers hold cart, favorites, garage and the demo admin session. Storefront and admin are two App Router route groups sharing tokens and `components/ui`.

**Tech Stack:** Next.js (latest stable, App Router, `src/` dir), React, TypeScript strict, Tailwind CSS (v4, CSS-first `@theme`), lucide-react, Vitest (logic tests only). npm. No other runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-10-12-kursat-shop-design.md` (overrides) + `docs/brief.md` (base requirements). Read both before starting any task.

## Global Constraints

- All UI copy in Turkish. Currency via one helper: `Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' })`.
- Category tree max 2 levels: root group › subcategory. Roots: `OEM Parçalar`, `Performans`, `Bakım & Temizlik`.
- Fitment states shown to users: ✓ Doğrulanmış uyum / ? Doğrulanmamış / ✕ Uyumsuz (only with explicit record) / Araca bağlı değil (universal). No record ⇒ never "uyumlu".
- Low stock: `1 ≤ stock ≤ 5`. Out of stock: `stock === 0`.
- Shipping: free at subtotal ≥ 2.500 ₺, otherwise 149,90 ₺; both editable in admin settings. Prices are KDV-inclusive.
- Order reference format: `KS-YYMMDD-XXXX` (XXXX = 4 uppercase alphanumerics).
- Payment options only "Kapıda ödeme (demo)" and "Havale/EFT (demo)". No card fields anywhere.
- localStorage keys prefixed `ks:v1:`. Corrupt/missing data ⇒ fall back to seed, never crash.
- No browser API access during server render or before mount.
- Palette: no accent color; primary actions charcoal; green only for stock/fitment success; red only for errors/incompatible.
- Product images: local SVGs in `public/products/`, square, `object-contain`, fallback image on error, "Temsili görsel" caption on product detail.
- Every visible control works; no new routes beyond the brief's list.
- Before completion: `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` all clean.

## Review Focus

1. **Stale localStorage after seed/schema change or corrupted JSON** — app must load seed, not crash (test in Task 5).
2. **Cart holds a product that the admin later deleted, unpublished, or set to stock 0** — cart shows it as unavailable, excludes it from totals, blocks checkout until removed (test in Task 4).
3. **Cart quantity exceeds stock after admin lowered stock** — line flagged "insufficient", checkout blocked, quantity selector capped at stock (test in Task 4).
4. **Turkish case and formatted codes in search** — `"İNCE"`/`"ince"`, `"FREN"`/`"fren"` match; OEM typed with spaces/dots/dashes (`34 11 6 860 912`, `34.11.6.860.912`) matches `34116860912` (test in Task 3).
5. **Garage/selected vehicle or compatibility record pointing to a vehicle the admin deleted** — vehicle silently dropped from garage, no orphan fitment shown (test in Task 3 and Task 5).

---

## File Structure

```
src/
  app/
    layout.tsx                      root: <html lang="tr">, Inter, Providers
    globals.css                     tokens (@theme), base styles
    not-found.tsx
    (store)/layout.tsx              StoreHeader + StoreFooter
    (store)/page.tsx                home
    (store)/products/page.tsx
    (store)/products/[slug]/page.tsx
    (store)/categories/[slug]/page.tsx
    (store)/search/page.tsx
    (store)/garage/page.tsx
    (store)/cart/page.tsx
    (store)/favorites/page.tsx
    (store)/checkout/page.tsx
    (store)/order-success/page.tsx
    (store)/help/page.tsx
    (store)/shipping-returns/page.tsx
    (store)/legal/page.tsx
    admin/login/page.tsx
    admin/(panel)/layout.tsx        AdminSidebar + AdminHeader + session guard
    admin/(panel)/page.tsx          dashboard
    admin/(panel)/products/page.tsx
    admin/(panel)/products/new/page.tsx
    admin/(panel)/products/[id]/edit/page.tsx
    admin/(panel)/categories/page.tsx
    admin/(panel)/brands/page.tsx
    admin/(panel)/vehicles/page.tsx
    admin/(panel)/compatibility/page.tsx
    admin/(panel)/orders/page.tsx
    admin/(panel)/settings/page.tsx
  lib/
    types.ts
    format.ts
    seed/{categories,brands,vehicles,products,compatibility,orders,settings,index}.ts
    catalog/{search,listing,fitment,vehicles,stock,relations}.ts
    cart.ts  shipping.ts  orders.ts  validation.ts  storage.ts  ids.ts
  state/
    catalog-store.tsx  cart-store.tsx  favorites-store.tsx  garage-store.tsx
    admin-session.tsx  providers.tsx
  components/
    ui/       Button, Input, Select, Textarea, FormField, Dialog, Drawer, ConfirmDialog,
              Toast (provider+hook), Badge, EmptyState, LoadingState, PageHeader, Breadcrumbs
    product/  ProductImage, ProductCard, ProductGrid, PriceDisplay, StockStatus,
              FitmentBadge, QuantitySelector, AddToCartButton, FavoriteButton
    store/    StoreHeader, StoreFooter, SearchInput, CategoryMenu, AccountMenu,
              VehicleSelector, VehicleBar, ProductListing, ProductFilters, SortControl,
              TrustStrip
    admin/    AdminSidebar, AdminHeader, DataTable, SummaryCard, ProductForm,
              CompatibilityEditor
public/products/*.svg                one illustration per subcategory + fallback.svg
tests/*.test.ts                      Vitest, node environment
```

---

### Task 1: Project scaffold, tokens, formatting helpers

**Files:**
- Create: project via `create-next-app`, `src/app/globals.css`, `src/app/layout.tsx`, `src/lib/format.ts`, `vitest.config.ts`, `tests/format.test.ts`
- Modify: `package.json` (scripts `test`, `typecheck`)

**Interfaces:**
- Produces: `formatPrice(amount: number): string`, `formatDate(iso: string): string` (tr-TR, `12 Eki 2026`), `cn(...classes: (string | false | null | undefined)[]): string` in `src/lib/format.ts`. Tailwind token classes: `bg-surface`, `text-ink`, `text-muted`, `border-line`, `bg-primary`, `text-success`, `bg-success-soft`, `text-danger`, `bg-danger-soft`, `text-warn`, `rounded-card`.

- [ ] **Step 1: Scaffold.** In the repo root (already contains `docs/`, `.gitignore`), run `npx create-next-app@latest . --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-npm --no-turbopack` (accept overwriting nothing in `docs/`). Then `npm i lucide-react` and `npm i -D vitest`. Expected: `npm run dev` serves the default page.
- [ ] **Step 2: Tokens.** Replace `globals.css` with Tailwind import plus `@theme` tokens: `--color-bg #ffffff`, `--color-surface #f6f7f8`, `--color-ink #1d2125`, `--color-muted #5f6670`, `--color-line #e4e6e9`, `--color-primary #1d2125`, `--color-primary-hover #33393f`, `--color-success #1f7a4d`, `--color-success-soft #eef7f1`, `--color-danger #b42318`, `--color-danger-soft #fdf1f0`, `--color-warn #8a5a00`, `--color-warn-soft #fdf6e7`, `--radius-card 10px`, `--font-sans` = Inter variable. Base: body `bg-bg text-ink antialiased`, `:focus-visible` 2px ink outline with 2px offset, `.tabular` = `font-variant-numeric: tabular-nums`. Container utility: `max-w-[1280px] mx-auto px-4 md:px-6`.
- [ ] **Step 3: Root layout.** `<html lang="tr">`, Inter via `next/font/google` (subsets `latin`, `latin-ext`), metadata title template `%s · Kursat Shop`.
- [ ] **Step 4: Write failing test** `tests/format.test.ts`:
```ts
expect(formatPrice(2450)).toBe(new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(2450));
expect(formatPrice(2450)).toMatch(/2\.450,00/);
expect(formatPrice(149.9)).toMatch(/149,90/);
expect(cn('a', false, 'b')).toBe('a b');
```
- [ ] **Step 5:** `npx vitest run` → FAIL (module missing). Implement `format.ts`. Re-run → PASS.
- [ ] **Step 6:** `npm run lint && npx tsc --noEmit` clean. Commit `chore: scaffold Next.js app with design tokens`.

---

### Task 2: Types and seed data

**Files:**
- Create: `src/lib/types.ts`, `src/lib/seed/*.ts`, `tests/seed.test.ts`

**Interfaces:**
- Produces (exact, in `types.ts`):
```ts
export type ID = string;
export interface ProductImage { src: string; alt: string }
export interface Spec { label: string; value: string }
export type PublicationStatus = 'published' | 'draft';
export type FitmentType = 'vehicle-specific' | 'universal';
export interface Product {
  id: ID; slug: string; name: string; description: string;
  sku: string; oemNumbers: string[]; brandId: ID; categoryId: ID; // categoryId is always a subcategory
  price: number; compareAtPrice?: number; stock: number;
  status: PublicationStatus; fitmentType: FitmentType;
  images: ProductImage[]; specs: Spec[]; featured?: boolean;
  createdAt: string; updatedAt: string;
}
export interface Category { id: ID; slug: string; name: string; parentId: ID | null; description?: string; image?: string }
export interface Brand { id: ID; slug: string; name: string; country?: string }
export interface Vehicle {
  id: ID; make: string; model: string; generation: string; // e.g. 'E46'
  body?: string; yearFrom: number; yearTo: number | null; engine: string; // e.g. '320d 2.0 (150 HP)'
}
export type CompatibilityStatus = 'confirmed' | 'unverified' | 'incompatible';
export interface CompatibilityRecord { id: ID; productId: ID; vehicleId: ID; status: CompatibilityStatus; note?: string }
export interface CartItem { productId: ID; quantity: number }
export interface Cart { items: CartItem[] }
export interface Favorite { productId: ID; addedAt: string }
export interface Address { fullName: string; phone: string; email: string; city: string; district: string; line: string; postalCode?: string }
export type PaymentMethod = 'cash-on-delivery' | 'bank-transfer';
export type OrderStatus = 'received' | 'preparing' | 'shipped' | 'delivered' | 'cancelled';
export interface OrderItem { productId: ID; name: string; sku: string; unitPrice: number; quantity: number }
export interface Order {
  id: ID; reference: string; createdAt: string; status: OrderStatus;
  items: OrderItem[]; subtotal: number; shipping: number; total: number;
  address: Address; paymentMethod: PaymentMethod; note?: string;
}
export interface StoreSettings {
  storeName: string; email: string; phone: string; address: string; workingHours: string;
  freeShippingThreshold: number; shippingFee: number; lowStockThreshold: number; // 5
}
export interface CatalogData {
  products: Product[]; categories: Category[]; brands: Brand[]; vehicles: Vehicle[];
  compatibility: CompatibilityRecord[]; orders: Order[]; settings: StoreSettings;
}
```
- Produces: `seed: CatalogData` exported from `src/lib/seed/index.ts`. Also `ORDER_STATUS_LABELS: Record<OrderStatus,string>` in `types.ts` (`Alındı, Hazırlanıyor, Kargoda, Teslim edildi, İptal edildi`).

No `ProductVariant`: spec has no genuinely distinct purchasable variants; README notes this.

- [ ] **Step 1: Write failing test** `tests/seed.test.ts` asserting seed integrity:
  - every `product.categoryId` refers to a category with non-null `parentId`; every `brandId` exists
  - category depth ≤ 2 (a child's parent has `parentId === null`); exactly 3 roots with the names in Global Constraints
  - ids, product slugs and SKUs unique; slugs match `/^[a-z0-9-]+$/`
  - every compatibility record references existing product+vehicle; no duplicate (productId, vehicleId); no record on a `universal` product
  - counts: products 40–50, vehicles 40–45, brands ≥ 8; each of `confirmed`/`unverified`/`incompatible` present; ≥ 3 products with stock 0, ≥ 3 with stock 1–5, ≥ 2 `draft`; ≥ 6 `featured` published
  - vehicle makes are exactly `BMW`, `Mercedes-Benz`, `Porsche`, `Audi`; BMW generations ⊇ `E30 E36 E46 E90 E92 G20 E39 E60 F10 G30 F20`
  - every order item's `unitPrice*quantity` sums to `subtotal`, `subtotal+shipping === total`; 4–6 orders with mixed statuses
- [ ] **Step 2:** Run → FAIL.
- [ ] **Step 3: Write seed files.** Vehicle list per spec §4 (BMW 2–3 engines per generation, others 1–2). Subcategories (5–6 under OEM, 4 under Performans, 4 under Bakım & Temizlik), e.g. OEM: Fren Sistemi, Filtreler, Süspansiyon & Direksiyon, Ateşleme, Soğutma, Motor Parçaları; Performans: Egzoz Sistemleri, Hava Emiş, Yay & Amortisör, Fren Yükseltme; Bakım: Motor Yağı & Sıvılar, Dış Temizlik, Cila & Koruma, İç Temizlik. Part brands: Bosch, Brembo, Mann-Filter, Mahle, NGK, Bilstein, Lemförder, Febi Bilstein, Castrol, Liqui Moly, Meguiar's, Eisenmann/Akrapovič-style performance brands as needed. Specs only plausible measurable fields (position, dimensions, viscosity, volume); no certifications, warranties or ratings. Image paths point to Task 7's SVG names (`/products/<subcategory-slug>.svg`); alt text = product name. Prices in TRY realistic for 2026. Orders reference seed products with snapshotted names/prices.
- [ ] **Step 4:** Run → PASS. Commit `feat: add domain types and demo seed data`.

---

### Task 3: Catalog logic — search, listing, fitment, vehicle cascade

**Files:**
- Create: `src/lib/catalog/{stock,search,listing,fitment,vehicles,relations}.ts`, `tests/catalog.test.ts`

**Interfaces:**
- Consumes: Task 2 types/seed.
- Produces:
```ts
// stock.ts
type StockState = 'in_stock' | 'low_stock' | 'out_of_stock';
stockState(stock: number, lowThreshold = 5): StockState;
// search.ts
normalizeText(s: string): string;   // toLocaleLowerCase('tr-TR'), then map ı→i, collapse whitespace
normalizeCode(s: string): string;   // uppercase, remove spaces . - /
searchProducts(products: Product[], brands: Brand[], query: string): Product[]; // published only, ranked
suggest(products: Product[], brands: Brand[], query: string, limit = 6): Product[];
// fitment.ts
type FitmentState = 'confirmed' | 'unverified' | 'incompatible' | 'universal' | 'unknown';
fitmentFor(product: Product, vehicleId: ID | null, records: CompatibilityRecord[]): FitmentState | 'no-vehicle';
FITMENT_LABELS: Record<FitmentState, string>; // unknown and unverified both → 'Doğrulanmamış'
// vehicles.ts
makes(v: Vehicle[]): string[];
models(v: Vehicle[], make: string): string[];
generations(v: Vehicle[], make: string, model: string): string[];
years(v: Vehicle[], make: string, model: string, generation: string, currentYear: number): number[]; // desc
engines(v: Vehicle[], make: string, model: string, generation: string, year: number): Vehicle[];
vehicleLabel(v: Vehicle): string; // 'BMW 3 Serisi E46 · 320d 2.0 (150 HP)'
// listing.ts
type SortKey = 'recommended' | 'price-asc' | 'price-desc' | 'name-asc' | 'newest';
interface ListingFilters { categoryIds: ID[]; brandIds: ID[]; minPrice?: number; maxPrice?: number; inStockOnly: boolean; fitsVehicleId?: ID | null }
applyListing(products: Product[], f: ListingFilters, sort: SortKey, records: CompatibilityRecord[]): Product[]; // published only
filtersFromSearchParams(sp: URLSearchParams): { filters: ListingFilters; sort: SortKey };
filtersToSearchParams(f: ListingFilters, sort: SortKey): URLSearchParams; // keys: cat, brand, min, max, stock=1, fit=1, sort
// relations.ts
descendantCategoryIds(categories: Category[], id: ID): ID[]; // self + children
relatedProducts(p: Product, all: Product[], limit = 4): Product[]; // same category then same brand, published, excludes p
categoryUsage(products: Product[], categories: Category[], id: ID): number; // products in self+children
brandUsage(products: Product[], id: ID): number;
```
`fitsVehicleId` filter keeps only `confirmed` and `universal`. `recommended` = featured first, then in-stock, then name.

- [ ] **Step 1: Write failing tests** (use seed data):
  - `stockState(0)==='out_of_stock'`, `stockState(5)==='low_stock'`, `stockState(6)==='in_stock'`
  - search by exact product name word, by brand name, by SKU, by OEM; draft products never returned
  - **Review Focus 4:** `searchProducts(..., '34 11 6 860 912')` and `'34.11.6.860.912'` return the product with OEM `34116860912` first; `'FREN'` and `'fren'` return same ids; a query with `İ` matches lowercase `i` text
  - `fitmentFor(universalProduct, anyVehicle)==='universal'`; vehicle-specific with no record ⇒ `'unknown'`; with record ⇒ its status; `vehicleId null` ⇒ `'no-vehicle'`
  - **Review Focus 5:** record pointing at a vehicle id not in the list is ignored by `fitmentFor` with a valid other vehicle (returns 'unknown' for that one, not 'confirmed')
  - cascade: `models(v,'BMW')` includes `'3 Serisi'`; `generations(v,'BMW','3 Serisi')` includes `E30` and not `F10`; `years` for E46 starts 2006 and ends 1998; `engines` returns only records whose range contains the year
  - listing: brand filter, price range, inStockOnly, `price-asc` order is non-decreasing, `fitsVehicleId` excludes unknown/unverified/incompatible; round-trip `filtersFromSearchParams(filtersToSearchParams(f,s))` deep-equals input
- [ ] **Step 2:** Run → FAIL. **Step 3:** Implement. **Step 4:** Run → PASS. Commit `feat: catalog search, listing, fitment and vehicle logic`.

---

### Task 4: Cart, shipping, orders, validation

**Files:**
- Create: `src/lib/{cart,shipping,orders,validation,ids}.ts`, `tests/commerce.test.ts`, `tests/validation.test.ts`

**Interfaces:**
- Produces:
```ts
// ids.ts
newId(prefix: string): string;                       // crypto.randomUUID-based
orderReference(date: Date, rand?: () => number): string; // KS-YYMMDD-XXXX
// cart.ts
type LineState = 'ok' | 'insufficient' | 'unavailable';
interface CartLine { item: CartItem; product: Product | null; state: LineState; lineTotal: number }
addItem(cart: Cart, productId: ID, qty: number, stock: number): Cart;   // caps at stock
setQuantity(cart: Cart, productId: ID, qty: number): Cart;              // qty<=0 removes
removeItem(cart: Cart, productId: ID): Cart;
resolveCart(cart: Cart, products: Product[]): { lines: CartLine[]; subtotal: number; itemCount: number; canCheckout: boolean };
// shipping.ts
shippingFor(subtotal: number, s: Pick<StoreSettings,'freeShippingThreshold'|'shippingFee'>): number;
// orders.ts
createOrder(input: { cart: Cart; products: Product[]; settings: StoreSettings; address: Address; paymentMethod: PaymentMethod; note?: string; now: Date }):
  { order: Order; updatedProducts: Product[] } | { error: string };
// validation.ts
type FieldErrors<T> = Partial<Record<keyof T | string, string>>;
validateProduct(p: Omit<Product,'id'|'createdAt'|'updatedAt'>, ctx: { products: Product[]; categories: Category[]; brands: Brand[]; editingId?: ID }): FieldErrors<Product>;
validateAddress(a: Address): FieldErrors<Address>;
validateCategory / validateBrand / validateVehicle(..., ctx): FieldErrors<...>;
slugify(s: string): string; // Turkish-aware: ç→c ğ→g ı→i İ→i ö→o ş→s ü→u
```
Line state: product missing, `draft`, or stock 0 ⇒ `unavailable` (lineTotal 0); quantity > stock ⇒ `insufficient`. `canCheckout` = ≥1 line and every line `ok`. `createOrder` re-resolves the cart, fails with Turkish message if not `canCheckout`, snapshots name/sku/unitPrice, decrements stock.

Validation messages (exact): name `Ürün adı zorunludur.`; slug `Geçerli bir bağlantı adı girin (küçük harf, rakam, tire).` / `Bu bağlantı adı başka bir üründe kullanılıyor.`; sku `Stok kodu zorunludur.` / `Bu stok kodu başka bir üründe kullanılıyor.`; price `Fiyat 0'dan büyük olmalıdır.`; compareAtPrice `Liste fiyatı satış fiyatından yüksek olmalıdır.`; stock `Stok 0 veya pozitif bir tam sayı olmalıdır.`; categoryId `Bir alt kategori seçin.`; brandId `Bir marka seçin.`; address phone `Geçerli bir telefon numarası girin.` (10–11 digits after stripping), email `Geçerli bir e-posta adresi girin.`, other required `Bu alan zorunludur.`

- [ ] **Step 1: Write failing tests:**
  - `addItem` twice sums quantities and caps at stock; `setQuantity(…,0)` removes
  - `resolveCart` subtotal = Σ price×qty of ok lines; `itemCount` sums quantities
  - **Review Focus 2:** product deleted / set `draft` / stock 0 ⇒ line `unavailable`, excluded from subtotal, `canCheckout false`
  - **Review Focus 3:** qty 4 with stock 2 ⇒ `insufficient`, `canCheckout false`
  - `shippingFor(2499.99)===149.9`, `shippingFor(2500)===0`
  - `createOrder` snapshots: after mutating product price in `products`, `order.total` unchanged; stock decremented in `updatedProducts`; reference matches `/^KS-\d{6}-[A-Z0-9]{4}$/`
  - `validateProduct` returns each message above for its bad input; empty object for a valid product; duplicate sku allowed when `editingId` is that product
  - `slugify('Ön Fren Balatası Şeti')==='on-fren-balatasi-seti'`
- [ ] **Step 2:** FAIL. **Step 3:** Implement. **Step 4:** PASS. Commit `feat: cart, shipping, order and validation rules`.

---

### Task 5: Storage adapter and client state providers

**Files:**
- Create: `src/lib/storage.ts`, `src/state/{catalog-store,cart-store,favorites-store,garage-store,admin-session,providers}.tsx`, `tests/storage.test.ts`
- Modify: `src/app/layout.tsx` (wrap children in `<Providers>`)

**Interfaces:**
- Produces:
```ts
// storage.ts (pure; storage injected for tests)
readJSON<T>(key: string, fallback: T, isValid: (v: unknown) => v is T, store?: Storage): T;
writeJSON(key: string, value: unknown, store?: Storage): boolean; // false on quota/security error
KEYS = { catalog:'ks:v1:catalog', cart:'ks:v1:cart', favorites:'ks:v1:favorites', garage:'ks:v1:garage', adminSession:'ks:v1:admin' };
sanitizeCatalog(data: CatalogData): CatalogData; // drops compat records whose product or vehicle is missing
sanitizeGarage(g: GarageState, vehicles: Vehicle[]): GarageState;
interface GarageState { saved: ID[]; selected: ID | null }
// catalog-store.tsx
useCatalog(): CatalogData & { hydrated: boolean;
  saveProduct(p: Product): void; deleteProduct(id: ID): void;   // delete also removes its compat records
  saveCategory(c: Category): void; deleteCategory(id: ID): { ok: boolean; reason?: string };
  saveBrand(b: Brand): void; deleteBrand(id: ID): { ok: boolean; reason?: string };
  saveVehicle(v: Vehicle): void; deleteVehicle(id: ID): void;   // also removes its compat records
  setCompatibility(productId: ID, vehicleId: ID, status: CompatibilityStatus | null): void; // null removes
  updateOrderStatus(id: ID, s: OrderStatus): void;
  placeOrder(o: Order, updatedProducts: Product[]): void;
  saveSettings(s: StoreSettings): void; resetDemoData(): void; };
useCart(): { cart: Cart; add(id: ID, qty?: number): void; setQty(id: ID, qty: number): void; remove(id: ID): void; clear(): void; resolved: ReturnType<typeof resolveCart> };
useFavorites(): { ids: ID[]; has(id: ID): boolean; toggle(id: ID): void };
useGarage(): GarageState & { selectedVehicle: Vehicle | null; save(id: ID): void; select(id: ID | null): void; remove(id: ID): void };
useAdminSession(): { loggedIn: boolean; hydrated: boolean; login(email: string, password: string): boolean; logout(): void };
```
Initial state of every provider = seed/empty (identical server and client). A `useEffect` after mount reads storage, sanitizes, sets `hydrated = true`; subsequent changes write through. `deleteCategory`/`deleteBrand` refuse when `categoryUsage`/`brandUsage` > 0 or category has children (reason e.g. `Bu kategoride 4 ürün var. Önce ürünleri başka kategoriye taşıyın.`). Demo admin credentials live in `src/lib/seed/settings.ts` as `DEMO_ADMIN = { email: 'admin@kursatshop.demo', password: 'demo1234' }` and are displayed on the login page.

- [ ] **Step 1: Write failing tests** with an in-memory `Storage` stub:
  - **Review Focus 1:** `readJSON` returns fallback for missing key, for `'{bad json'`, and for JSON failing `isValid`; `writeJSON` returns false when `setItem` throws
  - `sanitizeCatalog` removes compat records referencing missing vehicles/products
  - **Review Focus 5:** `sanitizeGarage({saved:['v1','gone'],selected:'gone'}, vehicles)` ⇒ `{saved:['v1'],selected:null}`
- [ ] **Step 2:** FAIL. **Step 3:** Implement storage + providers. **Step 4:** PASS; `npx tsc --noEmit` clean. Commit `feat: browser persistence adapter and state providers`.

---

### Task 6: UI primitives

**Files:**
- Create: `src/components/ui/*` (list in File Structure)

**Interfaces:**
- Produces: `Button({variant:'primary'|'secondary'|'ghost'|'danger', size:'sm'|'md'|'lg', asChild?: never, ...button props})`, `LinkButton` (same styles on `next/link`), `Input`, `Select`, `Textarea` (forward refs, `aria-invalid` when error), `FormField({label, htmlFor, error?, hint?, required?, children})` (error rendered with `id` used by `aria-describedby`), `Dialog({open, onClose, title, children, footer})` and `Drawer({open, onClose, title, side:'left'|'right', children})` built on native `<dialog>` with `showModal()`, Esc/backdrop close, focus return; `ConfirmDialog({open, title, message, confirmLabel, onConfirm, onCancel, tone:'danger'|'default'})`; `ToastProvider` + `useToast(): { show(message: string, tone?: 'success'|'error'|'info'): void }` (aria-live polite, auto-dismiss 3.5s); `Badge({tone:'neutral'|'success'|'warn'|'danger'})`; `EmptyState({icon, title, description, action?})`; `LoadingState({label?})` skeleton; `PageHeader({title, description?, actions?})`; `Breadcrumbs({items: {label: string; href?: string}[]})` (`nav aria-label="Breadcrumb"`, last item `aria-current="page"`).

- [ ] **Step 1:** Implement. Mount `ToastProvider` inside `Providers`.
- [ ] **Step 2:** Temporarily render every primitive on the home page, check in browser (desktop + 375px): focus rings visible, dialog traps focus and Esc closes, no overflow. Remove the temporary render.
- [ ] **Step 3:** lint + tsc clean. Commit `feat: shared UI primitives`.

---

### Task 7: Product illustrations and product display atoms

**Files:**
- Create: `public/products/<subcategory-slug>.svg` (one per seed subcategory, plus `fallback.svg`), `src/components/product/{ProductImage,PriceDisplay,StockStatus,FitmentBadge,QuantitySelector,AddToCartButton,FavoriteButton,ProductCard,ProductGrid}.tsx`

**Interfaces:**
- Consumes: Tasks 3, 5, 6.
- Produces: `ProductImage({image?: ProductImage, sizes, priority?, className})` (square, `object-contain`, `onError` → `/products/fallback.svg`); `PriceDisplay({price, compareAtPrice?, size:'sm'|'lg'})`; `StockStatus({stock})` (dot + `Stokta` / `Son 3 adet` / `Tükendi`); `FitmentBadge({state, compact?})` with the four labels; `QuantitySelector({value, min=1, max, onChange, label})`; `AddToCartButton({product, quantity=1, fullWidth?})` disabled with `Tükendi` when stock 0, toasts `Sepete eklendi` with link to `/cart`; `FavoriteButton({productId})` (`aria-pressed`, toast); `ProductCard({product, brandName, fitment?: FitmentState})` (whole card links to `/products/[slug]`, buttons stop propagation); `ProductGrid({products, ...})` responsive 2 / 3 / 4 cols.

SVG style: 400×400 viewBox, `#f6f7f8` background rect, single 2.5px `#1d2125` stroke line art with at most one `#c9cdd2` fill, no text. Subjects: brake disc+pad, filter cartridge, coil spring/strut, spark plug, radiator, piston/belt, exhaust tip, intake cone filter, coilover, big brake caliper, oil bottle, spray bottle, polish tin + pad, interior brush/cloth; fallback = generic box with gear.

- [ ] **Step 1:** Draw SVGs; confirm every seed `images[].src` file exists (add a check to `tests/seed.test.ts` using `fs.existsSync('public'+src)`), run tests → PASS.
- [ ] **Step 2:** Implement components. Card content order: image, brand (muted uppercase xs), name (2-line clamp), `SKU · OEM first` (tabular, xs), fitment badge if provided, price, stock, add-to-cart.
- [ ] **Step 3:** lint + tsc. Commit `feat: product illustrations and product display components`.

---

### Task 8: Store shell — header, search, menus, footer

**Files:**
- Create: `src/app/(store)/layout.tsx`, `src/components/store/{StoreHeader,SearchInput,CategoryMenu,AccountMenu,VehicleBar,StoreFooter}.tsx`

**Interfaces:**
- Produces: `SearchInput({size:'md'|'lg', autoFocus?})` — combobox (`role="combobox"`, `aria-expanded`, listbox of `suggest()` results with ↑/↓/Enter/Esc); Enter without selection → `/search?q=`; suggestion → `/products/[slug]`; last row "Tüm sonuçları gör". `VehicleBar` — shows selected vehicle label with "Değiştir" (→ `/garage`) and "Kaldır", or "Aracını seç" link.

Header desktop: logo `Kursat Shop` (wordmark, link `/`), `Kategoriler` button opening a panel with 3 columns (root → subcategory links), SearchInput, `Garajım` (car icon, shows short selected vehicle), Favoriler (count), Hesap (AccountMenu: Garajım, Favoriler, Yardım, Yönetim paneli (demo)), Sepet (count badge from `useCart().resolved.itemCount`). Below lg: row 1 menu button (opens Drawer with categories + links), logo, favorites, cart; row 2 full-width SearchInput; row 3 VehicleBar. Footer: 4 columns (Alışveriş, Yardım, Kurumsal, İletişim from settings) + bottom line `Bu site bir demo prototiptir. Ürün, fiyat ve uyumluluk verileri gerçek değildir.`

- [ ] **Step 1:** Implement. **Step 2:** Browser check at 375 / 768 / 1280: no horizontal overflow (`document.documentElement.scrollWidth === innerWidth`), keyboard can reach and operate every header control, autocomplete works for `brembo` and an OEM number. **Step 3:** lint + tsc. Commit `feat: storefront header, search and footer`.

---

### Task 9: Vehicle selector and home page

**Files:**
- Create: `src/components/store/{VehicleSelector,TrustStrip}.tsx`, `src/app/(store)/page.tsx`

**Interfaces:**
- Consumes: `vehicles.ts` cascade, `useGarage`.
- Produces: `VehicleSelector({layout:'inline'|'stacked', onSelected?: (v: Vehicle) => void})` — five labelled `<select>`s (Marka, Model, Kasa/Nesil, Yıl, Motor); each disabled until the previous is set; changing an earlier step clears later ones; submit button `Parçaları göster` enabled when engine chosen → `garage.save`, `garage.select`, toast, navigate to `/products?fit=1`. Caption under selector: `Demo veri setindeki araçlar listelenir.`

Home per spec §3.2: hero (h1 `Aracına uygun parçayı bul`, sub `OEM numarası, stok kodu veya ürün adıyla ara.`), `SearchInput size="lg"`, `veya aracını seç` + `VehicleSelector layout="inline"`, garage chips (select on click), 3 root category cards with subcategory links, featured products (`featured && published`, max 8), TrustStrip (Hızlı kargo / 14 gün iade / Uzman destek / Güvenli alışveriş (demo) — each linking to shipping-returns or help), footer.

- [ ] **Step 1:** Implement. **Step 2:** Browser: select BMW › 3 Serisi › E46 › 2003 › an engine → lands on `/products?fit=1` with the vehicle bar showing it; mobile layout stacks selects. **Step 3:** lint + tsc. Commit `feat: home page and vehicle selector`.

---

### Task 10: Product listing, categories, search pages

**Files:**
- Create: `src/components/store/{ProductListing,ProductFilters,SortControl}.tsx`, `src/app/(store)/{products,search}/page.tsx`, `src/app/(store)/categories/[slug]/page.tsx`

**Interfaces:**
- Produces: `ProductListing({title, description?, breadcrumbs, baseProducts: Product[], categoryScope?: Category})` — reads/writes filters through URL search params (`filtersFromSearchParams`/`filtersToSearchParams`, `router.replace`, no scroll); renders count `N ürün`, active filter chips each removable, `Filtreleri temizle`, SortControl, sidebar filters ≥ lg and a `Filtrele` button opening `Drawer` below lg, vehicle strip with `Sadece aracıma uygun olanlar` switch (only when a vehicle is selected), cards with `FitmentBadge` when a vehicle is selected, `LoadingState` until catalog `hydrated`, `EmptyState` with clear-filters action.

Pages wrap `ProductListing` in `<Suspense>` (search params). `/categories/[slug]`: root shows its subcategories as chips/links and products of all descendants; subcategory shows breadcrumb `Ana sayfa › Root › Sub`; unknown slug → `notFound()` (categories are seed-stable enough; for admin-created categories resolve client-side like products — show not-found UI after hydration if still missing). `/search?q=`: title `"q" için sonuçlar`, uses `searchProducts`, empty state suggests checking OEM format and links to `/products`. Category filter on `/products` lists subcategories grouped by root.

- [ ] **Step 1:** Implement. **Step 2:** Browser: on `/categories/fren-sistemi` brand filter + `price-desc` change results and the URL; refresh preserves them; mobile drawer opens/closes with Esc and shows the same filters; `/search?q=34116860912` finds the product; `/search?q=zzzz` shows empty state. **Step 3:** lint + tsc. Commit `feat: product listing, category and search pages`.

---

### Task 11: Product detail page

**Files:**
- Create: `src/app/(store)/products/[slug]/page.tsx`, `src/components/product/ProductDetail.tsx`

**Interfaces:**
- Consumes: `useCatalog`, `useGarage`, `fitmentFor`, `relatedProducts`.

Server page: `generateStaticParams` not required; `generateMetadata` uses seed lookup (fallback title `Ürün`). Renders `<ProductDetail slug>` (client). Client: until `hydrated` and product missing → `LoadingState`; after hydration missing or `draft` → in-page not-found block (`Ürün bulunamadı` + link to `/products`). Layout per spec §3.3 (taslak B): breadcrumbs; gallery (main image + thumbnails as buttons, `Temsili görsel` caption); right column brand, h1, `Stok kodu`, `PriceDisplay lg`, `StockStatus`, fitment row (`FitmentBadge` + vehicle label; `no-vehicle` → `Uyumluluğu görmek için aracını seç` button opening `Dialog` with `VehicleSelector layout="stacked"` that selects without navigating), `QuantitySelector` (max = stock), `AddToCartButton`, `FavoriteButton`. Sections below, in order, each `h2`: Teknik özellikler (definition table; if empty `Bu ürün için teknik bilgi girilmemiş.`), OEM numaraları (chips with copy button + toast), Uyumlu araçlar (records for this product grouped by make: label + status badge; universal → `Bu ürün araca bağlı değildir.`; none → `Bu ürün için henüz uyumluluk kaydı yok. Sipariş öncesi bizimle iletişime geçin.` linking `/help`), Açıklama, Benzer ürünler (`relatedProducts`).

- [ ] **Step 1:** Implement. **Step 2:** Browser: product with confirmed record for selected vehicle shows ✓; same product with another vehicle with no record shows `Doğrulanmamış`; out-of-stock product has disabled add; quantity can't exceed stock; unknown slug shows not-found block. **Step 3:** lint + tsc. Commit `feat: product detail page`.

---

### Task 12: Garage, favorites, cart pages

**Files:**
- Create: `src/app/(store)/{garage,favorites,cart}/page.tsx`

- [ ] **Step 1: Garage.** `VehicleSelector layout="stacked"` (on submit: save + select, stay on page, toast) + saved vehicles list (label, `Seçili` badge, `Seç`, `Kaldır` with ConfirmDialog, `Parçaları gör` → `/products?fit=1`). Empty state: `Garajında araç yok`. Note: `Kayıtlı araçlar sadece bu tarayıcıda saklanır.`
- [ ] **Step 2: Favorites.** Grid of favorited published products; unpublished/deleted ones listed as `Artık satışta değil` with remove. Empty state → `/products`.
- [ ] **Step 3: Cart.** Lines from `resolveCart`: image, name link, SKU, unit price, `QuantitySelector` (max stock), line total, remove (toast `Ürün sepetten çıkarıldı`). `insufficient` lines show `Stokta yalnızca N adet var` + `Stoka göre düzelt` button; `unavailable` lines show `Bu ürün şu an satışta değil` + remove. Summary card: Ara toplam, Kargo (`shippingFor`, or `Ücretsiz`; hint `X ₺ daha ekle, kargo bedava`), Toplam, `Ödemeye geç` (disabled with reason when `!canCheckout`), `Alışverişe devam et`. Empty state → `/products`.
- [ ] **Step 4:** Browser: add 2 products, change quantities, totals update, refresh → still there; remove one. lint + tsc. Commit `feat: garage, favorites and cart pages`.

---

### Task 13: Checkout and order success

**Files:**
- Create: `src/app/(store)/checkout/page.tsx`, `src/app/(store)/order-success/page.tsx`

- [ ] **Step 1: Checkout.** Banner: `Bu bir demo ödeme sayfasıdır. Gerçek ödeme alınmaz, kart bilgisi istenmez.` Single page, sections: 1 İletişim (Ad soyad, E-posta, Telefon), 2 Teslimat adresi (İl, İlçe, Adres, Posta kodu opsiyonel), 3 Ödeme yöntemi (radio: two demo methods), Sipariş notu (optional). Sticky summary (lines, subtotal, shipping, total). Submit `Siparişi tamamla (demo)`: `validateAddress` → field errors + focus first invalid; else `createOrder` → on error toast; on success `placeOrder`, `cart.clear()`, `router.push('/order-success?ref=' + reference)`. If cart empty or `!canCheckout` → message + link to `/cart` instead of form.
- [ ] **Step 2: Order success.** Reads `ref`, finds order in catalog after hydration: shows `Demo siparişin oluşturuldu`, reference (large, tabular), items, totals, address, payment method label, notice `Bu sipariş yalnızca bu tarayıcıda kayıtlıdır; gerçek bir sipariş işlenmemiştir.`, links home / products. Unknown ref → empty state.
- [ ] **Step 3:** Browser: full journey home → search → add → cart → checkout with invalid email (error shown) → valid → success page; product stock decreased on detail page; order visible later in admin. lint + tsc. Commit `feat: simulated checkout and order confirmation`.

---

### Task 14: Info pages and not-found

**Files:**
- Create: `src/app/(store)/{help,shipping-returns,legal}/page.tsx`, `src/app/not-found.tsx`

- [ ] **Step 1:** Short realistic Turkish content, each page `PageHeader` + sections; help shows contact info from settings (client component reading `useCatalog().settings`) and an FAQ using `<details>` (how to find OEM number, what "Doğrulanmamış" means, demo nature). Shipping-returns states the demo shipping rule from settings and a generic 14-day return policy marked as sample text. Legal: KVKK/privacy sample text marked `Örnek metindir`, plus a section explaining browser-local storage. `not-found.tsx` with store header/footer feel: `Sayfa bulunamadı` + SearchInput + links.
- [ ] **Step 2:** lint + tsc. Commit `feat: help, shipping-returns, legal and not-found pages`.

---

### Task 15: Admin shell, login, dashboard

**Files:**
- Create: `src/app/admin/login/page.tsx`, `src/app/admin/(panel)/{layout,page}.tsx`, `src/components/admin/{AdminSidebar,AdminHeader,SummaryCard,DataTable}.tsx`

**Interfaces:**
- Produces: `DataTable<T>({columns: {key: string; header: string; cell: (row: T) => ReactNode; sortable?: boolean; className?: string}[], rows: T[], sort?, onSortChange?, empty: ReactNode})` — `<table>` in `overflow-x-auto` wrapper on md+, card list below md; `SummaryCard({label, value, hint?, href?})`.

Login: card with email/password, demo credentials shown, warning `Bu giriş yalnızca demo amaçlıdır; gerçek kimlik doğrulama değildir.`, wrong credentials → inline error. Panel layout: if `hydrated && !loggedIn` → `router.replace('/admin/login')`; until hydrated → LoadingState. Sidebar links (lucide icons): Gösterge paneli, Ürünler, Kategoriler, Markalar, Araçlar, Uyumluluk, Siparişler, Ayarlar; bottom `Mağazayı görüntüle`, `Çıkış yap`. Mobile: sidebar in Drawer. AdminHeader: page title slot + `Demo` badge. Dashboard: SummaryCards for total, published, low-stock, out-of-stock (each linking to filtered product list via query params), categories+brands, demo orders; two compact tables: last 5 orders, low/out-of-stock products. Caption `Gösterilen değerler demo verilerinden hesaplanır.`

- [ ] **Step 1:** Implement. **Step 2:** Browser: `/admin` redirects to login when logged out; login works; refresh keeps session; logout returns to login. lint + tsc. Commit `feat: admin shell, demo login and dashboard`.

---

### Task 16: Admin product management

**Files:**
- Create: `src/app/admin/(panel)/products/{page,new/page,[id]/edit/page}.tsx`, `src/components/admin/{ProductForm,CompatibilityEditor}.tsx`

**Interfaces:**
- Produces: `CompatibilityEditor({productId: ID | null, value: {vehicleId: ID; status: CompatibilityStatus}[], onChange})` — add row (vehicle select grouped by make, status select), remove row; disabled with note when product is `universal`. Reused by Task 17.

List: search (name/SKU/OEM via `normalizeCode` + `normalizeText`), filters (category, brand, status, stock state) synced to URL (`?stock=low` etc. — dashboard links rely on this), sortable columns (name, price, stock, updatedAt), columns: image thumb, name+SKU, brand, category, price, stock with `StockStatus`, status badge, actions (Düzenle link, Görüntüle → storefront if published, Sil → ConfirmDialog `"X" ürününü silmek istediğine emin misin? Bu işlem geri alınamaz.` → toast). `Yeni ürün` button. Empty state.

ProductForm sections (cards): Temel bilgiler (name, slug auto from `slugify` until manually edited, description), Kodlar (SKU, OEM list add/remove), Sınıflandırma (brand, subcategory select grouped by root, fitmentType radio), Fiyat ve stok (price, compareAtPrice, stock, status), Görseller (rows of src select from available `/products/*.svg` + alt text; add/remove/reorder up), Teknik özellikler (label/value rows), Uyumluluk (`CompatibilityEditor`). Submit → `validateProduct`; errors shown per field + summary at top `N alan düzeltilmeli`; success → `saveProduct` + replace compat records for product via `setCompatibility`, toast `Ürün kaydedildi`, navigate to list. Cancel with unsaved changes → ConfirmDialog. Edit page with unknown id → empty state.

- [ ] **Step 1:** Implement. **Step 2:** Browser: create product with empty fields → errors; valid → appears in list and on `/products` and its detail page (refresh keeps it); edit price → storefront shows new price, existing order totals unchanged in admin orders; delete with confirmation → disappears from storefront. lint + tsc. Commit `feat: admin product management`.

---

### Task 17: Admin categories, brands, vehicles, compatibility

**Files:**
- Create: `src/app/admin/(panel)/{categories,brands,vehicles,compatibility}/page.tsx`

- [ ] **Step 1: Categories.** Tree table (roots with indented children), product count per row (`categoryUsage`). Create/edit in `Dialog` (name, slug, parent: `Ana grup` or one of the roots — only roots can be parents, enforcing 2 levels, description). Delete → `deleteCategory`; refusal reason shown in toast/error; success after ConfirmDialog.
- [ ] **Step 2: Brands.** Table (name, slug, country, product count); dialog create/edit; delete guarded by `deleteBrand`.
- [ ] **Step 3: Vehicles.** Filter by make; table (make, model, generation, years `1998–2006` / `2019–`, engine, compat record count); dialog create/edit (`validateVehicle`: required fields, `yearFrom` 1950..current year, `yearTo` null or ≥ yearFrom); delete with ConfirmDialog stating how many compatibility records are removed.
- [ ] **Step 4: Compatibility.** Product picker (searchable select of vehicle-specific products) → `CompatibilityEditor` bound directly to `setCompatibility` with toast per change. Legend explaining the three states and `Kayıt yoksa uyumluluk bilinmiyor kabul edilir.`. Secondary view toggle: by vehicle (select vehicle → table of products with records + status select).
- [ ] **Step 5:** Browser: delete category with products → refused with reason; create vehicle, add confirmed record for a product → storefront detail shows ✓ for that vehicle. lint + tsc. Commit `feat: admin categories, brands, vehicles and compatibility`.

---

### Task 18: Admin orders and settings

**Files:**
- Create: `src/app/admin/(panel)/{orders,settings}/page.tsx`

- [ ] **Step 1: Orders.** Notice `Demo siparişlerdir; gerçek ödeme veya gönderim yapılmamıştır.` Table (reference, date, customer, item count, total, status badge), filter by status; row click opens Drawer with snapshot items, totals, address, payment method, status select → `updateOrderStatus` + toast.
- [ ] **Step 2: Settings.** Form: storeName, email, phone, address, workingHours, freeShippingThreshold, shippingFee, lowStockThreshold (validated non-negative numbers, required text) → `saveSettings` + toast. Danger zone: `Demo verilerini sıfırla` → ConfirmDialog → `resetDemoData` (catalog only; cart/favorites/garage untouched) + toast. Info box: data lives in this browser only, not shared, not a database.
- [ ] **Step 3:** Browser: change shipping fee → cart summary reflects it; reset restores seed. lint + tsc. Commit `feat: admin orders and settings`.

---

### Task 19: README and full QA pass

**Files:**
- Create/Modify: `README.md`

- [ ] **Step 1: README** (Turkish): what it is, requirements (Node ≥ 20), `npm install`, `npm run dev`, `npm test`, `npm run lint`, `npm run typecheck`, `npm run build && npm start`; demo admin login; project structure; how to replace illustrations with real photos (`images[].src`); implemented features list; known limitations (browser-local data, not multi-user, insecure demo login, no real payments/shipping, demo product/fitment data, no ProductVariant by design, no customer accounts); path to production (backend, auth, payments).
- [ ] **Step 2:** `npm run lint`, `npx tsc --noEmit`, `npm test`, `npm run build` → all clean; fix anything that isn't.
- [ ] **Step 3:** `npm start`, then in the browser visit every route in brief §4 at 375, 768 and 1280 widths: no console errors, no hydration warnings, no horizontal overflow, every header/footer link resolves (no 404 except deliberate unknown slugs). Run through brief §13 criteria 1–30 and note each as pass.
- [ ] **Step 4:** Commit `docs: README and QA fixes`.
