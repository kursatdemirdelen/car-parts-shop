"use client";

import { Banknote, LayoutGrid, type LucideIcon, PackageCheck, PackageSearch, ShieldCheck, SlidersHorizontal, Tags, X } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { createElement, useMemo, useState, type ReactNode } from "react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button } from "@/components/ui/Button";
import { Breadcrumbs, EmptyState, ProductGridSkeleton, type Crumb } from "@/components/ui/Display";
import { Drawer } from "@/components/ui/Dialog";
import { Checkbox, Input, Select, Switch } from "@/components/ui/Field";
import { TAG_TONES } from "@/components/ui/Tag";
import { categoryIcon, categoryTone, TONE_CLASSES } from "@/lib/category-style";
import { brandMonogram, type TagTone } from "@/lib/tags";
import {
  applyListing,
  filtersFromSearchParams,
  filtersToSearchParams,
  SORT_OPTIONS,
  type ListingFilters,
  type SortKey,
} from "@/lib/catalog/listing";
import { vehicleLabel } from "@/lib/catalog/vehicles";
import { cn, formatPrice, parsePriceFilter } from "@/lib/format";
import type { Brand, Category, Product } from "@/lib/types";
import { useCatalog } from "@/state/catalog-store";
import { useGarage } from "@/state/garage-store";

interface ProductListingProps {
  /** Current query string (from the page's `searchParams`). */
  query: string;
  title: ReactNode;
  description?: ReactNode;
  breadcrumbs: Crumb[];
  /** Products in scope before filters (e.g. a category's products or search results). */
  baseProducts: Product[];
  /** Keep the incoming order for "Önerilen" (search relevance). */
  keepOrder?: boolean;
  /** Extra query params to preserve (e.g. the search query). */
  preserveParams?: string[];
  header?: ReactNode;
  emptyState?: ReactNode;
}

export function ProductListing({
  query,
  title,
  description,
  breadcrumbs,
  baseProducts,
  keepOrder,
  preserveParams = [],
  header,
  emptyState,
}: ProductListingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useMemo(() => new URLSearchParams(query), [query]);
  const { categories, brands, compatibility, hydrated } = useCatalog();
  const { selectedVehicle } = useGarage();
  const [drawerOpen, setDrawerOpen] = useState(false);

  const { filters, sort, fitOnly } = useMemo(() => filtersFromSearchParams(searchParams), [searchParams]);
  const fitActive = fitOnly && !!selectedVehicle;

  const update = (next: ListingFilters, nextSort: SortKey = sort, nextFit: boolean = fitOnly) => {
    const params = filtersToSearchParams(next, nextSort, nextFit);
    for (const key of preserveParams) {
      const value = searchParams.get(key);
      if (value !== null) params.set(key, value);
    }
    const qs = params.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const results = useMemo(() => {
    const list = applyListing(baseProducts, { ...filters, fitsVehicleId: fitActive ? selectedVehicle!.id : null }, sort, compatibility);
    if (keepOrder && sort === "recommended") {
      const index = new Map(baseProducts.map((p, i) => [p.id, i]));
      list.sort((a, b) => index.get(a.id)! - index.get(b.id)!);
    }
    return list;
  }, [baseProducts, filters, fitActive, selectedVehicle, sort, compatibility, keepOrder]);

  const published = baseProducts.filter((p) => p.status === "published");
  const categoryOptions = categories.filter((c) => c.parentId !== null && published.some((p) => p.categoryId === c.id));
  const brandOptions = brands
    .map((b) => ({ brand: b, count: published.filter((p) => p.brandId === b.id).length }))
    .filter((x) => x.count > 0)
    .sort((a, b) => a.brand.name.localeCompare(b.brand.name, "tr"));

  const chips: { label: string; remove: () => void; icon?: LucideIcon; monogram?: string; tone: TagTone }[] = [
    ...filters.categoryIds.map((id) => {
      const category = categories.find((c) => c.id === id);
      return {
        label: category?.name ?? id,
        icon: category ? categoryIcon(category.slug) : undefined,
        tone: (category ? `cat-${categoryTone(category, categories)}` : "neutral") as TagTone,
        remove: () => update({ ...filters, categoryIds: filters.categoryIds.filter((x) => x !== id) }),
      };
    }),
    ...filters.brandIds.map((id) => {
      const name = brands.find((b) => b.id === id)?.name ?? id;
      return {
        label: name,
        monogram: brandMonogram(name),
        tone: "neutral" as TagTone,
        remove: () => update({ ...filters, brandIds: filters.brandIds.filter((x) => x !== id) }),
      };
    }),
    ...(filters.minPrice !== undefined || filters.maxPrice !== undefined
      ? [
          {
            label: `${filters.minPrice !== undefined ? formatPrice(filters.minPrice) : "0"} – ${filters.maxPrice !== undefined ? formatPrice(filters.maxPrice) : "∞"}`,
            icon: Banknote,
            tone: "accent" as TagTone,
            remove: () => update({ ...filters, minPrice: undefined, maxPrice: undefined }),
          },
        ]
      : []),
    ...(filters.inStockOnly
      ? [{ label: "Stokta olanlar", icon: PackageCheck, tone: "success" as TagTone, remove: () => update({ ...filters, inStockOnly: false }) }]
      : []),
    ...(fitActive ? [{ label: "Aracıma uygun", icon: ShieldCheck, tone: "success" as TagTone, remove: () => update(filters, sort, false) }] : []),
  ];

  const clearAll = () =>
    update({ categoryIds: [], brandIds: [], minPrice: undefined, maxPrice: undefined, inStockOnly: false }, sort, false);

  const filterPanel = (
    <ProductFilters
      filters={filters}
      onChange={(f) => update(f)}
      categoryOptions={categoryOptions}
      categoriesAll={categories}
      brandOptions={brandOptions}
    />
  );

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={breadcrumbs} />
      <div className="mt-4 flex flex-col gap-1">
        <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-[1.75rem]">{title}</h1>
        {description && <p className="max-w-2xl text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {header}

      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_minmax(0,1fr)]">
        <aside className="hidden lg:block" aria-label="Filtreler">
          {filterPanel}
        </aside>

        <div className="min-w-0">
          {selectedVehicle && (
            <div className="mb-4 flex flex-col gap-2 rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm text-ink-soft">
                <span className="text-muted">Uyumluluk gösterilen araç: </span>
                <span className="font-medium text-ink">{vehicleLabel(selectedVehicle)}</span>
              </p>
              <Switch
                label="Sadece aracıma uygun olanlar"
                checked={fitOnly}
                onChange={(e) => update(filters, sort, e.target.checked)}
              />
            </div>
          )}

          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted" aria-live="polite">
              <span className="font-semibold text-ink tabular">{hydrated ? results.length : "–"}</span> ürün
            </p>
            <div className="ml-auto flex items-center gap-2">
              <Button variant="secondary" size="sm" className="h-10 lg:hidden" onClick={() => setDrawerOpen(true)}>
                <SlidersHorizontal className="size-4" aria-hidden="true" />
                Filtrele{chips.length > 0 && ` (${chips.length})`}
              </Button>
              <label htmlFor="sort" className="sr-only">
                Sıralama
              </label>
              <Select
                id="sort"
                value={sort}
                onChange={(e) => update(filters, e.target.value as SortKey)}
                className="w-auto min-w-44"
              >
                {SORT_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>
                    {keepOrder && o.value === "recommended" ? "En alakalı" : o.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          {chips.length > 0 && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {chips.map((chip) => (
                <button
                  key={chip.label}
                  type="button"
                  onClick={chip.remove}
                  className={cn(
                    "inline-flex items-center gap-1.5 rounded-full border py-1 pr-2 pl-2 text-xs font-medium transition-[filter] duration-[var(--dur-fast)] hover:brightness-95",
                    TAG_TONES[chip.tone],
                  )}
                  aria-label={`${chip.label} filtresini kaldır`}
                >
                  {chip.icon && <chip.icon className="size-3.5" aria-hidden="true" />}
                  {chip.monogram && (
                    <span className="flex size-4 items-center justify-center rounded-full bg-night text-[8px] font-bold text-white" aria-hidden="true">
                      {chip.monogram}
                    </span>
                  )}
                  {chip.label}
                  <X className="size-3.5 opacity-70" aria-hidden="true" />
                </button>
              ))}
              <button type="button" onClick={clearAll} className="text-xs font-medium text-muted underline underline-offset-2 hover:text-ink">
                Filtreleri temizle
              </button>
            </div>
          )}

          <div className="mt-5">
            {!hydrated ? (
              <ProductGridSkeleton />
            ) : results.length > 0 ? (
              <ProductGrid products={results} />
            ) : chips.length > 0 ? (
              <EmptyState
                icon={PackageSearch}
                title="Bu filtrelere uyan ürün yok"
                description={
                  fitActive
                    ? "Seçili aracın için doğrulanmış uyumlu ürün bulunamadı. Uyumluluğu doğrulanmamış ürünleri görmek için “Sadece aracıma uygun olanlar” seçeneğini kapatabilirsin."
                    : "Filtreleri azaltmayı veya kaldırmayı dene."
                }
                action={<Button onClick={clearAll}>Filtreleri temizle</Button>}
              />
            ) : (
              (emptyState ?? <EmptyState icon={PackageSearch} title="Bu bölümde henüz ürün yok" />)
            )}
          </div>
        </div>
      </div>

      <Drawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        title="Filtrele"
        side="left"
        footer={
          <>
            {chips.length > 0 && (
              <Button variant="secondary" onClick={clearAll}>
                Temizle
              </Button>
            )}
            <Button className="flex-1" onClick={() => setDrawerOpen(false)}>
              {results.length} ürünü göster
            </Button>
          </>
        }
      >
        {filterPanel}
      </Drawer>
    </div>
  );
}

const filterRow =
  "-mx-2 rounded-md px-2 py-1 transition-colors duration-[var(--dur-fast)] hover:bg-surface has-[:checked]:bg-accent-soft has-[:checked]:text-accent";

function FilterSection({ title, icon: Icon, children }: { title: string; icon: LucideIcon; children: ReactNode }) {
  return (
    <fieldset className="border-b border-line pb-5 last:border-b-0">
      <legend className="mb-3 flex items-center gap-2 text-sm font-semibold text-ink">
        <Icon className="size-4 text-accent-bright" aria-hidden="true" />
        {title}
      </legend>
      {children}
    </fieldset>
  );
}

function ProductFilters({
  filters,
  onChange,
  categoryOptions,
  categoriesAll,
  brandOptions,
}: {
  filters: ListingFilters;
  onChange: (f: ListingFilters) => void;
  categoryOptions: Category[];
  categoriesAll: Category[];
  brandOptions: { brand: Brand; count: number }[];
}) {
  const toggle = (list: string[], id: string) => (list.includes(id) ? list.filter((x) => x !== id) : [...list, id]);
  const roots = categoriesAll.filter((c) => c.parentId === null && categoryOptions.some((o) => o.parentId === c.id));

  return (
    <div className="space-y-5">
      {categoryOptions.length > 1 && (
        <FilterSection title="Kategori" icon={LayoutGrid}>
          <div className="space-y-4">
            {roots.map((root) => (
              <div key={root.id}>
                {roots.length > 1 && <p className="mb-2 text-xs font-medium text-muted">{root.name}</p>}
                <div className="space-y-2">
                  {categoryOptions
                    .filter((c) => c.parentId === root.id)
                    .map((c) => (
                      <Checkbox
                        key={c.id}
                        className={filterRow}
                        label={<CategoryLabel category={c} categories={categoriesAll} />}
                        checked={filters.categoryIds.includes(c.id)}
                        onChange={() => onChange({ ...filters, categoryIds: toggle(filters.categoryIds, c.id) })}
                      />
                    ))}
                </div>
              </div>
            ))}
          </div>
        </FilterSection>
      )}

      {brandOptions.length > 0 && (
        <FilterSection title="Marka" icon={Tags}>
          <div className="max-h-64 space-y-2 overflow-y-auto pr-1">
            {brandOptions.map(({ brand, count }) => (
              <Checkbox
                key={brand.id}
                label={
                  <span className="flex items-center gap-2">
                    <span
                      className="flex size-6 shrink-0 items-center justify-center rounded-full bg-night text-[9px] font-bold tracking-tight text-white"
                      aria-hidden="true"
                    >
                      {brandMonogram(brand.name)}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{brand.name}</span>
                      <span className="block text-[11px] leading-tight text-muted">{brand.country}</span>
                    </span>
                    <span className="rounded-full bg-surface px-1.5 text-xs text-muted tabular">{count}</span>
                  </span>
                }
                className={cn(filterRow, "[&>span]:flex-1")}
                checked={filters.brandIds.includes(brand.id)}
                onChange={() => onChange({ ...filters, brandIds: toggle(filters.brandIds, brand.id) })}
              />
            ))}
          </div>
        </FilterSection>
      )}

      <FilterSection title="Fiyat (₺)" icon={Banknote}>
        <PriceRange
          key={`${filters.minPrice ?? ""}-${filters.maxPrice ?? ""}`}
          min={filters.minPrice}
          max={filters.maxPrice}
          onApply={(minPrice, maxPrice) => onChange({ ...filters, minPrice, maxPrice })}
        />
      </FilterSection>

      <FilterSection title="Stok durumu" icon={PackageCheck}>
        <Checkbox
          className={filterRow}
          label={
            <span className="flex items-center gap-2">
              <PackageCheck className="size-4 shrink-0 text-success" aria-hidden="true" />
              Sadece stokta olanlar
            </span>
          }
          checked={filters.inStockOnly}
          onChange={(e) => onChange({ ...filters, inStockOnly: e.target.checked })}
        />
      </FilterSection>
    </div>
  );
}

function CategoryLabel({ category, categories }: { category: Category; categories: Category[] }) {
  return (
    <span className="flex items-center gap-2">
      {createElement(categoryIcon(category.slug), {
        className: cn("size-4 shrink-0", TONE_CLASSES[categoryTone(category, categories)].text),
        "aria-hidden": true,
      })}
      {category.name}
    </span>
  );
}

function PriceRange({
  min,
  max,
  onApply,
}: {
  min?: number;
  max?: number;
  onApply: (min?: number, max?: number) => void;
}) {
  const [low, setLow] = useState(min?.toString() ?? "");
  const [high, setHigh] = useState(max?.toString() ?? "");

  return (
    <form
      className="flex items-end gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        let lo = parsePriceFilter(low);
        let hi = parsePriceFilter(high);
        if (lo !== undefined && hi !== undefined && lo > hi) [lo, hi] = [hi, lo];
        onApply(lo, hi);
      }}
    >
      <label className="min-w-0 flex-1">
        <span className="sr-only">En düşük fiyat</span>
        <Input inputMode="numeric" placeholder="En az" value={low} onChange={(e) => setLow(e.target.value)} className="h-9" />
      </label>
      <span className="pb-2 text-subtle" aria-hidden="true">
        –
      </span>
      <label className="min-w-0 flex-1">
        <span className="sr-only">En yüksek fiyat</span>
        <Input inputMode="numeric" placeholder="En çok" value={high} onChange={(e) => setHigh(e.target.value)} className="h-9" />
      </label>
      <Button type="submit" variant="secondary" size="sm" className="h-9">
        Uygula
      </Button>
    </form>
  );
}
