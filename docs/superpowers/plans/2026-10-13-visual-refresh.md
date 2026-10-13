# Görsel Yenileme Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give the store a branded, photographic and lively look. This covers:
- the palette `#1B262C / #0F4C75 / #3282B8 / #BBE1FA`;
- category colors and icons;
- an admin-managed hero slider and campaign bar;
- stock photos;
- light CSS motion;
- spinner loading states;
- complete error screens.

It must keep the search-first home page, honest fitment copy, a11y 100 and performance ≥ 90.

**Architecture:**
- **Tokens:** Design tokens live in `src/lib/theme.ts`, which is the single source the contrast test reads. They are mirrored in `globals.css` `@theme`.
- **Content:** Hero slides and the campaign bar are new `CatalogData` fields. They are migrated, validated and persisted like kits and edited in a new admin screen.
- **Photos:** A static, credited photo library at `public/photos/*.webp`, with a manifest in `src/lib/photos.ts`.
- **Motion:** Only CSS transitions/keyframes, globally disabled under reduced motion.
- **Errors:** Routes use Next file conventions. `SectionBoundary` is a client error boundary.

**Tech Stack:** Next.js 16.4 (App Router, cacheComponents), React 19.3, TypeScript strict, Tailwind 4, lucide-react, sharp (already installed via Next), Vitest, Playwright.

**Spec:** [`docs/superpowers/specs/2026-10-13-visual-refresh-design.md`](../specs/2026-10-13-visual-refresh-design.md)

## Global Constraints

- **Branch:** `feat/gorsel-yenileme` off `master`. Ask the user before any push.
- **Commit messages:**
  - Turkish title, plus Turkish `- ` bullets when there is more than one change.
  - **No Claude/AI attribution or Co-Authored-By lines.**
- **Files:** LF line endings. Write TS/TSX with the Write/Edit tools, never via Python string literals (escape bugs).
- **Next 16:**
  - Read `node_modules/next/dist/docs/` before route-file work: `loading.js`, `error.js`, `global-error.js`, `not-found.js`, `useLinkStatus`.
  - Error components receive `retry` (the repo already uses it).
  - `global-error.tsx` renders its own `<html>` and `<body>`.
- **Palette contrast:** `#3282B8` is never used for normal-size text (4.18:1 on white).
  - Text and button backgrounds use `#0F4C75` (9.09:1 with white).
  - Every token pair used for text must be ≥ 4.5:1 (≥ 3:1 only for text ≥ 24 px or bold ≥ 19 px).
- **Motion:** Durations are 150–250 ms. Only `transform` and `opacity` are animated; the single exception is the `<details>` height. Everything is disabled under `prefers-reduced-motion: reduce`.
- **Spinners:** No artificial delays anywhere. A spinner only shows while something real is pending: hydration, Suspense or a navigation.
- **Photos:**
  - Unsplash License or Pexels License only.
  - No visible brand logos, number plates or identifiable faces.
  - Each photo has a Turkish `alt` text, credit and source URL.
  - Size limits: hero ≤ 200 KB at ≤ 1600 px wide; cards ≤ 90 KB at ≤ 800 px.
  - **The download list is shown to the user and approved before any download.**
- **Copy:** Turkish. The campaign bar seed text is "1.500 TL üzeri siparişlerde ücretsiz kargo (demo)", and its threshold must match `settings.freeShippingThreshold`.
- **Checks:** `npm test`, `npm run lint`, `npm run typecheck`, `npm run build`, `npm run e2e`.

## Review Focus

1. **Corrupted or old browser catalogs.**
   - Inputs: no `heroSlides`, `heroSlides: "x"`, a slide with an unknown `photo`, `announcement: null`.
   - Expected: the store renders, and invalid parts fall back to the seed.
   - Pinned in Task 4.
2. **Zero published slides / disabled bar.**
   - Expected: no empty carousel shell, no layout gap; the search hero renders as before.
   - Pinned in Task 5.
3. **Reduced motion and keyboard users.**
   - Expected: no autoplay; pause/prev/next are reachable by Tab; only the active slide is exposed to assistive tech.
   - Pinned in Task 5 (e2e with `reducedMotion: "reduce"`).
4. **Spinner replacing skeletons.**
   - Expected: no CLS increase; the reserved min-height matches the old skeleton.
   - Checked by the Lighthouse step in Task 8 (CLS ≤ 0.02 on home and product).
5. **An admin link value like `//evil.example` or `https://…`** must be rejected, so the slider and the bar can only link inside the site. Pinned in Task 4.

---

### Task 1: Palette tokens, contrast test and motion tokens

**Files:**
- Create: `src/lib/theme.ts`
- Modify: `src/app/globals.css` (`@theme` tokens, keyframes, reduced-motion block)
- Modify: `src/components/ui/Button.tsx` (variants), `src/components/ui/Display.tsx` (Badge `accent` tone)
- Test: `tests/theme.test.ts`

**Interfaces:**
- Produces:

```ts
export const PALETTE = { night: "#1B262C", deep: "#0F4C75", bright: "#3282B8", ice: "#BBE1FA" } as const;
export const TOKENS: Record<string, string>; // name (without --color-) → hex; includes ink, accent, accent-hover, accent-bright, accent-soft, night, cat-oem, cat-oem-soft, cat-perf, cat-perf-soft, cat-care, cat-care-soft, plus existing success/warn/danger pairs
export const TEXT_PAIRS: [fg: string, bg: string, minRatio: number][]; // every pairing used for text
export function contrastRatio(fg: string, bg: string): number;
```

- CSS classes: `bg-accent`, `text-accent`, `bg-accent-soft`, `ring-accent-bright`, `bg-night`, `bg-cat-oem-soft`, `text-cat-perf` and the other `cat-*` utilities, all generated from the `@theme` tokens.
- `Button` variants: `primary` (accent), `dark` (night), `secondary`, `ghost`, `danger`.
- `BadgeTone`: adds `"accent"`.

**Token values:**

| Token | Value |
|---|---|
| ink | `#1B262C` |
| accent | `#0F4C75` |
| accent-hover | `#0B3A5A` |
| accent-bright | `#3282B8` |
| accent-soft | `#BBE1FA` |
| night | `#1B262C` |
| cat-oem / soft | `#0F4C75` / `#E3F2FC` |
| cat-perf / soft | builder picks a red-orange that passes 4.5:1 on white and on its soft bg (start from `#B4361A` / `#FDEDE8`) |
| cat-care / soft | builder picks a green that passes (start from `#1F7A4D` / `#E8F5EE`) |

**Motion tokens:** `--ease-out: cubic-bezier(.2,.8,.2,1)`, `--dur-fast: 150ms`, `--dur-base: 220ms`.

**Keyframes:** `ks-bump` (scale 1 → 1.18 → 1), `ks-spin`, `ks-pulse-soft`, `ks-slide-up`. The existing `ks-fade-in` and `ks-slide-in-*` stay.

**Reduced-motion block:** `*, ::before, ::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; scroll-behavior: auto !important }`.

- [ ] **Step 1: Write the failing test** `tests/theme.test.ts`:
  - `contrastRatio("#0F4C75", "#ffffff")` is about 9.09 (`toBeCloseTo(9.09, 1)`).
  - `contrastRatio("#3282B8", "#ffffff")` is about 4.18.
  - `it("keeps every text pair at or above its minimum")` loops over `TEXT_PAIRS`.
  - `it("never uses accent-bright for text")`: no `TEXT_PAIRS` entry has fg `PALETTE.bright` with min 4.5.
  - `it("mirrors TOKENS in globals.css")`: reads `src/app/globals.css` and asserts every `--color-<name>: <hex>` from `TOKENS` is present, case-insensitive.
- [ ] **Step 2:** `npx vitest run tests/theme.test.ts`. Expected: FAIL (module missing).
- [ ] **Step 3:** Implement `theme.ts`, the `globals.css` tokens/keyframes/reduced-motion block, and the Button/Badge variants.
  - `--color-primary`/`--color-primary-hover` now point at the accent values. Pages that need black use `variant="dark"`; there are none expected.
- [ ] **Step 4:** `npm test && npm run lint && npm run typecheck`. Expected: all pass.
- [ ] **Step 5: Visual check.** Run the `dev` preview and check home, product, cart and admin in the browser: the primary buttons are deep blue and the focus ring is bright blue.
- [ ] **Step 6: Commit** "Marka renk paleti ve hareket değişkenleri eklendi", with these bullets:
  - Palet: #1B262C, #0F4C75, #3282B8, #BBE1FA ve kategori renkleri
  - Kontrast testi
  - Hareket süreleri ve "hareketi azalt" desteği

### Task 2: Spinner and loading states

**Files:**
- Create: `src/components/ui/Spinner.tsx`, `src/app/(store)/loading.tsx`, `src/app/admin/(panel)/loading.tsx`
- Modify: `src/components/ui/Display.tsx` (`LoadingState`, `ProductGridSkeleton` → spinner with reserved height), `src/components/ui/Button.tsx` (`loading` prop), `src/components/store/CheckoutPage.tsx` (submit shows `loading` while `router.push` transition is pending: `useTransition`), admin forms that `router.push` after save (same pattern), `src/components/store/StoreHeader.tsx` (nav links show a tiny spinner via `useLinkStatus`, only in the desktop category/garage/cart links)
- Test: `tests/ui-loading.test.tsx`. If no DOM test environment exists, skip the file and record a ruling; behavior is then covered by e2e in Task 8.

**Interfaces:**
- Produces:
  - `export function Spinner({ size = "md", label = "Yükleniyor…", className }: { size?: "sm" | "md" | "lg"; label?: string; className?: string })`: `role="status"`, `sr-only` label, SVG ring with `animate-[ks-spin_700ms_linear_infinite]`; under reduced motion it uses `ks-pulse-soft`.
  - `LoadingState({ label?, rows? })` keeps its signature. It renders a centered `Spinner md` inside a `min-h` equal to `rows * 64 + (rows - 1) * 12` px.
  - `ProductGridSkeleton({ count? })` keeps its signature. It renders a centered `Spinner lg` inside a `min-h` equal to the old grid height (rows of 2/4 cards; use the old card height constant).
  - `Button` gains `loading?: boolean`. When true it shows a `Spinner sm` before the children and sets `disabled` and `aria-busy`.

- [ ] **Step 1:** Check whether Vitest has jsdom/happy-dom (`grep environment vitest.config.*`). If not, ledger the ruling "UI covered by e2e" and go to Step 3.
- [ ] **Step 2:** If a DOM environment exists, write tests:
  - `Spinner` renders `role=status` with the label.
  - `Button loading` is disabled with `aria-busy="true"`.
  - Run them and watch them fail.
- [ ] **Step 3:** Implement. Read `node_modules/next/dist/docs/01-app/03-api-reference/04-functions/use-link-status.md` and the `loading.js` file-convention doc first.
- [ ] **Step 4:** `npm test && npm run lint && npm run typecheck && npm run build`. Expected: pass; the build output still marks `/` as static.
- [ ] **Step 5: Browser check** in the `dev` preview: hard-reload `/products` and see the spinner briefly before hydration, then products with no layout jump; checkout submit shows the spinner until the order page.
- [ ] **Step 6: Commit** "Yüklenme durumları spinner'a geçirildi", with these bullets:
  - Spinner bileşeni ve buton yüklenme durumu
  - Sayfa ve rota yüklenmelerinde spinner, yer ayrılarak (kayma yok)

### Task 3: Motion

**Files:**
- Modify: `src/components/ui/Button.tsx` (press `active:scale-[.98]`, transition with the motion tokens), `src/components/product/ProductCard.tsx` and `KitCard.tsx` (hover lift `hover:-translate-y-0.5 hover:shadow-…`), `src/components/store/StoreHeader.tsx` (`CountBadge` bumps when the count increases: `key={count}` + `animate-[ks-bump_220ms_var(--ease-out)]`), `src/components/ui/Toast.tsx` (`ks-slide-up`), `src/components/ui/Popover.tsx` (fade/scale-in), `src/components/store/MaintenancePanel.tsx` (`details` open transition: `::details-content` + `interpolate-size: allow-keywords` in CSS, progressive), hydrated containers (`animate-[ks-fade-in_200ms]` on content that replaces a spinner)

- [ ] **Step 1:** Run `npx -y modern-web-guidance@latest search "animate details element open height interpolate-size" --skill-version 2026_09_04-7de96777` (Windows: `npx.cmd`) and follow the retrieved guide for the `<details>` part, including its fallback rule.
- [ ] **Step 2:** Implement the list above.
- [ ] **Step 3:** `npm run lint && npm run typecheck && npm test`. Expected: pass.
- [ ] **Step 4: Browser check:**
  - Add to cart → the badge bumps.
  - Hovering a card lifts it.
  - The garage maintenance panel opens smoothly.
  - Reduced motion is checked by the e2e in Task 5; here only confirm in DevTools that durations come from the tokens.
- [ ] **Step 5: Commit** "Hafif arayüz animasyonları eklendi", with this bullet:
  - Buton basışı, kart yükselmesi, sepet sayacı, toast ve açılır menü geçişleri

### Task 4: Hero slide and campaign bar data

**Files:**
- Modify: `src/lib/types.ts` (`HeroSlide`, `Announcement`, `CatalogData.heroSlides`, `CatalogData.announcement`), `src/lib/seed/index.ts`
- Create: `src/lib/seed/home.ts` (3 slides + announcement), `src/lib/photos.ts` (manifest; see Task 6 for its real content — this task creates it with the keys and **placeholder** entries pointing to existing `/products/*.svg` files, so data and tests can land before photos are approved)
- Modify: `src/lib/storage.ts` (`isCatalogData` checks, `migrateCatalog` backfill + per-field fallback), `src/lib/validation.ts` (`validateHeroSlide`, `validateAnnouncement`, `isInternalHref`), `src/state/catalog-store.ts` (`saveHeroSlides(slides: HeroSlide[])`, `saveAnnouncement(a: Announcement)`)
- Test: `tests/storage.test.ts`, `tests/validation.test.ts`, `tests/seed.test.ts`

**Interfaces:**
- Produces:

```ts
export type PhotoKey = "workshop-lift" | "oil-change" | "brake-disc" | "air-filter" | "spark-plug" | "open-road" | "detailing" | "tools"; // final list fixed in Task 6; keep this union in photos.ts
export interface HeroSlide { id: ID; title: string; subtitle: string; ctaLabel: string; ctaHref: string; photo: PhotoKey; tone: "dark" | "accent" | "light"; status: PublicationStatus }
export interface Announcement { enabled: boolean; text: string; href: string }
export const MAX_SLIDES = 6, MAX_PUBLISHED_SLIDES = 4;
export function isInternalHref(href: string): boolean;               // starts with "/" and not "//", no whitespace
export function validateHeroSlide(s: HeroSlide): FieldErrors;         // keys: title, subtitle, ctaLabel, ctaHref, photo
export function validateHeroSlides(list: HeroSlide[]): string | null; // list-level: count limits → Turkish message
export function validateAnnouncement(a: Announcement): FieldErrors;   // keys: text, href
export function isPhotoKey(v: unknown): v is PhotoKey;
```

**Validation messages (exact Turkish):**

| Field | Message |
|---|---|
| title | "Başlık zorunlu." / "Başlık en fazla 60 karakter olabilir." |
| subtitle | "Alt metin en fazla 140 karakter olabilir." |
| ctaLabel | "Buton metni en fazla 24 karakter olabilir." |
| ctaHref | "Buton için bir bağlantı girin." / "Bağlantı site içi olmalı ve / ile başlamalı." |
| photo | "Fotoğraf kütüphanesinden bir görsel seçin." |
| list | "En fazla 6 slayt eklenebilir." / "Aynı anda en fazla 4 slayt yayında olabilir." |
| announcement text | "Şerit açıkken metin zorunlu." / "Metin en fazla 90 karakter olabilir." |
| announcement href | the same href message as ctaHref, when the href is non-empty |

**Seed slides** (photos from Task 6 keys):
1. "Aracına uygun parçayı saniyeler içinde bul" → "/products", `tone: "dark"`.
2. "Bakımını kaçırma: garajına aracını ekle" → "/garage", `tone: "accent"`.
3. "BMW için genişletilmiş katalog" → "/categories/filtreler", `tone: "dark"`.

All are published.

**Migration:**
- Missing `heroSlides` → seed slides.
- `heroSlides` not an array, or any element failing the shape check (`id`/`title`/`subtitle`/`ctaLabel`/`ctaHref` strings, `tone` in the set, `status` string, `isPhotoKey(photo)`) → seed slides (whole list).
- Missing/invalid `announcement` → seed announcement.
- Everything else the user edited is kept, as `migrateCatalog` does today.

- [ ] **Step 1: Write failing tests.**
  - `isInternalHref`: true for `/products`. False for `//evil.example`, `https://x.com`, `javascript:alert(1)`, `/a b`, `""`.
  - `validateHeroSlide` returns each message above.
  - `validateHeroSlides`: 7 slides → the count message; 5 published → the published message.
  - `migrateCatalog`:
    - a catalog without `heroSlides`/`announcement` gains the seed values;
    - `heroSlides: "x"` → seed;
    - a slide with `photo: "nope"` → seed;
    - `announcement: null` → seed;
    - a valid edited slide list is kept as-is.
  - Seed: the announcement text contains `formatPrice`-free "1.500 TL"; `settings.freeShippingThreshold === 1500`; each seed slide passes `validateHeroSlide`.
- [ ] **Step 2:** `npx vitest run tests/storage.test.ts tests/validation.test.ts tests/seed.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `npm test && npm run typecheck`. Expected: pass.
- [ ] **Step 5: Commit** "Hero slaytları ve kampanya şeridi verisi eklendi", with these bullets:
  - Veri modeli, örnek içerik ve eski tarayıcı verisi için migrasyon
  - Site içi bağlantı ve uzunluk doğrulamaları

### Task 5: Storefront hero slider and campaign bar

**Files:**
- Create: `src/components/store/HeroSlider.tsx`, `src/components/store/AnnouncementBar.tsx`
- Modify: `src/components/store/HomeSections.tsx` (`HomeHero` renders `<HeroSlider />` above the existing search card; the search/selector card keeps its content and overlaps the slider bottom by about 32 px on md+), `src/app/(store)/layout.tsx` (render `<AnnouncementBar />` above `StoreHeader`)
- Test: `e2e/home.spec.ts` (new)

**Interfaces:**
- Consumes: `useCatalog().heroSlides`, `.announcement`; `PHOTOS` (Task 4/6); `useHydrated`.
- Produces: `HeroSlider()` and `AnnouncementBar()` client components.

**HeroSlider behavior (exact):**

*Rendering*
- Uses published slides in array order.
- With 0 slides it returns `null`.
- With 1 slide there are no controls and no autoplay.

*Autoplay*
- Advances every 6000 ms.
- Pauses on pointer hover, on focus-within, when `document.hidden`, and when the Pause button is pressed.
- The Pause/Play button is labeled "Slaytları durdur" / "Slaytları oynat".
- Under `matchMedia("(prefers-reduced-motion: reduce)")`, autoplay starts paused.

*Controls*
- Buttons "Önceki slayt" and "Sonraki slayt".
- Dots are buttons named "Slayt N"; the active dot has `aria-current="true"`.

*Accessibility*
- `<section aria-roledescription="carousel" aria-label="Öne çıkanlar">`.
- Each slide is `role="group" aria-roledescription="slide" aria-label="N / total"`.
- Inactive slides get `inert` and `aria-hidden="true"`.

*Transition*
- All slides are stacked; the active one has `opacity-100` and the others `opacity-0`, with a `transition-opacity duration-[var(--dur-base)]` crossfade.

*Image*
- `next/image` with `fill`, `sizes="100vw"`, `priority` on index 0 only, and `alt` from `PHOTOS`.
- Overlay by tone:
  - dark: `bg-gradient-to-r from-night/85 to-night/30` with white text;
  - accent: `from-accent/90 to-accent/40` with white text;
  - light: `from-white/90 to-white/40` with ink text.

*Sizing and timing*
- Height: `h-56 md:h-80`.
- Before hydration it renders the **seed** first slide statically (same markup, no controls), so the LCP image is in the server HTML. After hydration it swaps to the stored slides.

**AnnouncementBar behavior:**
- Hidden when `!enabled` or the text is empty.
- `bg-night text-white`, `text-sm`, centered.
- The text is a link when `href` is set.
- A close button "Duyuruyu kapat" writes `sessionStorage["ks:v1:announcement-dismissed"] = text`. The bar stays hidden while the stored value equals the current text. A changed text shows again.
- **Rendering:** Render the seed bar on the server (same markup), so there is no layout shift. After hydration, show the stored announcement, or hide the bar when it is dismissed or disabled. The page can jump once only when the admin turns the bar off or the user dismisses it. Task 10 checks CLS ≤ 0.02.

- [ ] **Step 1: Write the e2e test** `e2e/home.spec.ts`:
  - `test("hero slider can be paused and navigated")`:
    - Go to `/`.
    - Expect `getByRole("region", { name: "Öne çıkanlar" })` or the carousel section, plus the first slide title.
    - Click "Sonraki slayt" → slide 2's title is visible.
    - Click "Slaytları durdur" → the button now reads "Slaytları oynat".
    - Wait 6.5 s → slide 2 is still active.
    - `expectNoMobileOverflow`.
  - `test.use({ reducedMotion: "reduce" })` block, `test("does not autoplay with reduced motion")`: wait 6.5 s → slide 1 is still active.
  - `test("campaign bar can be dismissed")`: the bar text is visible; click "Duyuruyu kapat" → hidden; reload → still hidden.
- [ ] **Step 2:** `npm run build && npx playwright test e2e/home.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** `npm run build && npx playwright test e2e/home.spec.ts`, then `npm run e2e`. Expected: all pass (the existing 9 included).
- [ ] **Step 5:** Run `npx lighthouse http://localhost:3001/ --only-categories=performance,accessibility --quiet --chrome-flags="--headless"` against the `prod` preview. Expected: performance ≥ 90, a11y 100. If it falls short, fix before committing (likely causes: image `sizes` or priority).
- [ ] **Step 6: Commit** "Ana sayfaya hero slider ve kampanya şeridi eklendi", with these bullets:
  - Durdurulabilir, klavyeyle kullanılabilir slider
  - Kapatılabilir kampanya şeridi

### Task 6: Stock photo library

**Files:**
- Create: `scripts/photos.mjs` (download + convert with sharp from a list in the script), `public/photos/*.webp`
- Modify: `src/lib/photos.ts` (real entries), `src/components/store/HomeSections.tsx` (`CategoryShowcase` cards get a photo header for the 3 roots), `README.md` ("Fotoğraf kaynakları" / "Photo credits" section)
- Test: `tests/photos.test.ts`

**Interfaces:**
- Produces:

```ts
export const PHOTOS: Record<PhotoKey, { src: string; width: number; height: number; alt: string; credit: string; sourceUrl: string; license: "Unsplash License" | "Pexels License" }>;
export const CATEGORY_PHOTOS: Record<"oem-parcalar" | "performans" | "bakim-temizlik", PhotoKey>;
```

- [ ] **Step 1: STOP POINT — find and propose photos.**
  - Search Unsplash/Pexels (WebSearch/WebFetch on unsplash.com and pexels.com) for 8 photos matching the `PhotoKey` themes and the spec §5 rules.
  - Present the list to the user (key, photographer, source URL, license, approximate download size) and **wait for approval**.
  - Adjust the `PhotoKey` union to the approved list.
- [ ] **Step 2: Write the failing test** `tests/photos.test.ts`:
  - Every `PHOTOS` entry has its file under `public/` (`existsSync`).
  - `alt`, `credit` and `sourceUrl` are non-empty; `sourceUrl` matches `/^https:\/\/(unsplash\.com|www\.pexels\.com)\//`.
  - Hero keys used by seed slides are ≤ 200 KB and category photos ≤ 90 KB (`statSync().size`).
  - The README contains every `sourceUrl`.
- [ ] **Step 3:** `npx vitest run tests/photos.test.ts`. Expected: FAIL (placeholder entries).
- [ ] **Step 4:**
  - Write `scripts/photos.mjs`. It takes the approved list in the file, downloads each image once into the scratchpad, and converts with sharp to WebP: hero at 1600 w, q≈70; card at 800 w, q≈70. Outputs go to `public/photos/<key>.webp`. It prints the sizes.
  - Run it.
  - Fill in `photos.ts` and the README credits.
  - Switch `CategoryShowcase` to photo headers (`next/image`, `sizes="(min-width:768px) 33vw, 100vw"`), with the category color overlay strip and icon badge (from Task 7 if done; otherwise the plain icon).
- [ ] **Step 5:** `npm test && npm run build`. Expected: pass.
- [ ] **Step 6: Browser check** at 375 px and desktop: the photos are sharp, text over the hero is readable, and there are no brand logos.
- [ ] **Step 7: Commit** "Lisanslı stok fotoğraf kütüphanesi eklendi", with these bullets:
  - Hero ve kategori kartları için WebP fotoğraflar
  - README'de fotoğraf kaynakları

### Task 7: Category colors and icons

**Files:**
- Create: `src/lib/category-style.ts`
- Modify: `src/components/store/HomeSections.tsx` (`CategoryShowcase`), the mega menu in `StoreHeader.tsx`, `src/components/store/TrustStrip.tsx`, `src/components/ui/Display.tsx` (`EmptyState` icon badge uses accent-soft), `src/components/admin/Dashboard.tsx` (stat cards get colored icon badges), `src/components/product/ProductCard.tsx` (small category label with tone), `src/components/store/GaragePage.tsx` + `MaintenancePanel.tsx` (section heading icons)
- Test: `tests/catalog.test.ts` (new describe)

**Interfaces:**
- Produces:

```ts
export type CategoryTone = "oem" | "perf" | "care";
export function categoryTone(category: Category, categories: Category[]): CategoryTone; // root slug: oem-parcalar→oem, performans→perf, bakim-temizlik→care; unknown root → "oem"
export function categoryIcon(slug: string): LucideIcon; // mapping for every seed subcategory and root; fallback Package
export const TONE_CLASSES: Record<CategoryTone, { text: string; bg: string; ring: string }>; // Tailwind classes using cat-* tokens
```

**Suggested icons** (the builder may swap for nearer lucide matches):

| Category | Icon |
|---|---|
| fren-sistemi | `Disc3` |
| filtreler | `Filter` |
| suspansiyon-direksiyon | `Waypoints` |
| atesleme | `Zap` |
| sogutma | `Thermometer` |
| motor-parcalari | `Cog` |
| egzoz-sistemleri | `Wind` |
| hava-emis | `Fan` |
| yay-amortisor | `Gauge` |
| fren-yukseltme | `CircleGauge` |
| motor-yagi-sivilar | `Droplets` |
| dis-temizlik | `SprayCan` |
| cila-koruma | `Sparkles` |
| ic-temizlik | `Armchair` |
| oem-parcalar root | `Wrench` |
| performans root | `Flame` |
| bakim-temizlik root | `Droplet` |

- [ ] **Step 1: Failing tests:**
  - Every seed category has a tone, and roots map as listed.
  - Every seed category slug has a non-fallback icon.
  - An unknown slug returns the fallback.
- [ ] **Step 2:** `npx vitest run tests/catalog.test.ts`. Expected: FAIL.
- [ ] **Step 3:** Implement the helpers and apply them in the listed components.
- [ ] **Step 4:** `npm test && npm run lint && npm run typecheck`. Expected: pass.
- [ ] **Step 5: Browser check:** the home categories, the mega menu, the trust strip, the admin dashboard and a product card show colored icon badges, and the text stays readable.
- [ ] **Step 6: Commit** "Kategori renkleri ve ikon zenginleştirmesi eklendi".

### Task 8: Admin home screen

**Files:**
- Create: `src/app/admin/(panel)/home/page.tsx`, `src/components/admin/HomeAdmin.tsx`
- Modify: `src/components/admin/AdminShell.tsx` (nav item `{ href: "/admin/home", label: "Ana sayfa", icon: GalleryHorizontal }` after the dashboard)
- Test: `e2e/admin.spec.ts` (new test)

**Interfaces:**
- Consumes: `catalogActions.saveHeroSlides`, `catalogActions.saveAnnouncement`, `validateHeroSlide`, `validateHeroSlides`, `validateAnnouncement` (Task 4); `PHOTOS` (Task 6); the `Panel`/`DataTable` primitives in `AdminUi.tsx`; `ConfirmDialog`.

**UI contract:**

*Slides panel ("Slaytlar")*
- A row per slide: thumbnail, title, a status badge ("Yayında"/"Taslak"), and buttons:
  - "Yukarı taşı" / "Aşağı taşı" (disabled at the ends);
  - "Düzenle";
  - "Sil" (confirm: "Slayt silinsin mi?").
- A "Yeni slayt" button.

*Slide form*
- Fields have ids `slide-title`, `slide-subtitle`, `slide-ctaLabel`, `slide-ctaHref`, `slide-tone` (select with "Koyu", "Mavi", "Açık") and `slide-status` (switch "Yayında").
- The photo picker is a radio group of thumbnails, each with the alt text as its label.
- A live preview reuses the slide markup from `HeroSlider` (export a `HeroSlideView` component from Task 5).
- "Kaydet" validates with the messages from Task 4 (focus the first error) and the list-level check. On success it toasts "Slayt kaydedildi.".

*Campaign panel ("Kampanya şeridi")*
- A switch "Şeridi göster", inputs `announcement-text` and `announcement-href`, a preview, and "Kaydet" with the toast "Kampanya şeridi kaydedildi.".

- [ ] **Step 1: Write the e2e test** in `e2e/admin.spec.ts`: `test("admin edits a hero slide and the campaign bar")`:
  - Log in with the demo credentials, as the existing admin test does.
  - Open `/admin/home` → click "Düzenle" on the first slide → fill `#slide-title` with "Kış bakımı başladı" → "Kaydet".
  - Fill `#slide-ctaHref` with `//evil.example` → "Kaydet" → expect "Bağlantı site içi olmalı ve / ile başlamalı." → fix it to `/garage` → "Kaydet".
  - Set `#announcement-text` to "Demo kampanya metni" → "Kaydet".
  - `goto("/")` → expect "Kış bakımı başladı" and "Demo kampanya metni".
  - `expectNoMobileOverflow` on `/admin/home`.
- [ ] **Step 2:** `npm run build && npx playwright test e2e/admin.spec.ts`. Expected: the new test FAILS.
- [ ] **Step 3:** Implement.
- [ ] **Step 4:** Rebuild and rerun, then `npm run e2e`. Expected: all pass.
- [ ] **Step 5: Commit** "Admin'e ana sayfa vitrini yönetimi eklendi", with these bullets:
  - Slayt ekleme, düzenleme, sıralama, yayınlama ve silme
  - Kampanya şeridi düzenleme ve önizleme

### Task 9: Error screens

**Files:**
- Modify: `src/app/not-found.tsx`, `src/app/error.tsx`
- Create: `src/app/global-error.tsx`, `src/components/ui/SectionBoundary.tsx`, `src/app/admin/(panel)/not-found.tsx`, `src/app/admin/(panel)/error.tsx`, `src/components/store/NotFoundContent.tsx` (shared by root 404 and unknown `/arac`/`/oem`)
- Modify (wrap with `SectionBoundary`):
  - `HomeSections` (slider, showcase, featured), `MaintenanceStrip`;
  - `ProductDetail` (companions, related);
  - `GaragePage` (each `MaintenancePanel`);
  - `CartPage` (kits).
- Modify: the admin product edit page calls `notFound()` for an unknown id, if it doesn't already.
- Test: `e2e/errors.spec.ts`

**Interfaces:**
- Produces: `export class SectionBoundary extends Component<{ children: ReactNode; label?: string }, { error: Error | null }>`.
  - Fallback: `<div role="alert">`, "Bu bölüm yüklenemedi." plus a "Tekrar dene" button that resets state.
  - `componentDidCatch` logs with `console.error`.

**404 content:**
- `PHOTOS` image (`open-road` or the approved equivalent).
- "404 · Sayfa bulunamadı" heading.
- Search input.
- 3 root category shortcuts with tone badges.
- After hydration, if a vehicle is selected: the link "<vehicleShortLabel> için parçalar" → `/products?fit=1`.
- Buttons "Ana sayfa" and "Yardım ve iletişim".

**`error.tsx`:**
- Keeps the retry + restore-demo-catalog logic and gets the new visuals.
- Shows `error.digest` in small muted text when present.

**`global-error.tsx`:**
- Own `<html lang="tr"><body>`, minimal inline-styled version of the same screen (no app providers), with a "Tekrar dene" button calling `retry`.

**Admin 404/error:**
- Rendered inside the panel layout.
- 404 message "Bu kayıt bulunamadı veya silinmiş." with a link "Ürünlere dön" → `/admin/products`.
- Error screen with "Tekrar dene".

- [ ] **Step 1: Write the e2e test** `e2e/errors.spec.ts`:
  - `goto("/bu-sayfa-yok")` → expect a 404 response status, the heading "Sayfa bulunamadı", a combobox (search) and links "OEM Parçalar", "Performans" and "Bakım & Temizlik".
  - Log in as admin → `goto("/admin/products/yok/edit")` → expect "Bu kayıt bulunamadı veya silinmiş." and the admin nav still visible.
  - `expectNoMobileOverflow` on the 404.
- [ ] **Step 2:** `npm run build && npx playwright test e2e/errors.spec.ts`. Expected: FAIL.
- [ ] **Step 3:** Read the `error.js`/`global-error`/`not-found` file-convention docs in `node_modules/next/dist/docs/`, then implement.
- [ ] **Step 4:** Rebuild, then `npx playwright test e2e/errors.spec.ts` and `npm run e2e`. Expected: all pass.
- [ ] **Step 5: Manual SectionBoundary check** in the `dev` preview. Temporarily throw inside the companions section, check that only that card shows the fallback, then remove the throw. Don't commit the throw.
- [ ] **Step 6: Commit** "Hata ekranları yenilendi", with these bullets:
  - Kategori kısayollu ve araca özel bağlantılı 404
  - Genel ve kök hata ekranları
  - Bölüm içi hata kartları
  - Admin içinde 404 ve hata ekranı

### Task 10: Quality pass, README and screenshots

**Files:**
- Modify: `README.md` (Product decisions row "Admin-managed storefront", Quality table counts, Lighthouse numbers, Photo credits already from Task 6), `scripts/screenshots.mjs` (home now shows the slider; add `admin-home`), `docs/media/*.png`

- [ ] **Step 1:** `npm run lint && npm run typecheck && npm test && npm run build && npm run e2e`. Expected: all green; record the counts.
- [ ] **Step 2: Lighthouse.** Restart the `prod` preview with the fresh build and run Lighthouse (mobile default) on `/` and `/products/brembo-on-fren-balatasi-g20`. Expected: performance ≥ 90, a11y 100, best practices 100, SEO 100, CLS ≤ 0.02. Fix regressions before continuing.
- [ ] **Step 3:** Regenerate the screenshots against `http://localhost:3001`, then `Read` `home.png` and `admin-home.png` to check them.
- [ ] **Step 4:** Update the README numbers and rows.
- [ ] **Step 5: Commit** "README, ekran görüntüleri ve kalite ölçümleri güncellendi".
