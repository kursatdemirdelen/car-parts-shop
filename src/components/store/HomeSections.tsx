"use client";

import { SectionBoundary } from "@/components/ui/SectionBoundary";
import { ArrowRight, CarFront } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Display";
import { IconBadge } from "@/components/ui/IconBadge";
import { categoryIcon, categoryTone, TONE_CLASSES } from "@/lib/category-style";
import { CATEGORY_PHOTOS, PHOTOS } from "@/lib/photos";
import { categoryUsage } from "@/lib/catalog/relations";
import { vehicleShortLabel } from "@/lib/catalog/vehicles";
import { cn } from "@/lib/format";
import { REPO_URL } from "@/lib/site";
import { useCatalog } from "@/state/catalog-store";
import { useGarage } from "@/state/garage-store";
import { HeroSlider } from "./HeroSlider";
import { SearchInput } from "./SearchInput";
import { VehicleSelector } from "./VehicleSelector";

export function HomeHero() {
  const { savedVehicles, selected, select } = useGarage();
  const { heroSlides } = useCatalog();
  const hasSlides = heroSlides.some((s) => s.status === "published");
  const router = useRouter();

  return (
    <section className="border-b border-line bg-gradient-to-b from-surface to-white">
      <SectionBoundary label="Vitrin">
        <HeroSlider />
      </SectionBoundary>
      <div className="container-page pb-10 md:pb-16">
        <div
          className={cn(
            "relative z-10 max-w-3xl rounded-[var(--radius-card)] border border-line bg-white p-5 shadow-[var(--shadow-pop)] md:p-7",
            hasSlides ? "-mt-6 md:-mt-10" : "mt-8 md:mt-12",
          )}
        >
          <p className="text-sm font-medium text-muted">BMW · Mercedes-Benz · Porsche · Audi</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-[2.5rem] md:leading-[1.15]">
            Aracına uygun parçayı bul
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
            OEM numarası, stok kodu veya ürün adıyla ara. Ne aradığını bilmiyorsan aracını seç; uyumluluğu doğrulanmış parçaları ayrıca işaretleyelim.
          </p>
          <SearchInput size="lg" className="mt-6" />
          <p className="mt-3 text-xs text-muted">
            Bu bir demo projedir ·{" "}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
              Kaynak kod GitHub&apos;da
            </a>
          </p>
        </div>

        <div className="mt-8 rounded-[var(--radius-card)] border border-line bg-white p-4 shadow-sm md:p-5">
          <div className="mb-3 flex items-center gap-2">
            <CarFront className="size-4 text-muted" aria-hidden="true" />
            <h2 className="text-sm font-semibold text-ink">veya aracını seç</h2>
          </div>
          <VehicleSelector layout="inline" />
          {savedVehicles.length > 0 && (
            <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-4">
              <span className="text-xs font-medium text-muted">Garajım:</span>
              {savedVehicles.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  onClick={() => {
                    select(v.id);
                    router.push("/products?fit=1");
                  }}
                  aria-pressed={selected === v.id}
                  className={cn(
                    "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                    selected === v.id ? "border-ink bg-ink text-white" : "border-line-strong bg-white text-ink hover:border-ink",
                  )}
                >
                  {vehicleShortLabel(v)}
                </button>
              ))}
              <Link href="/garage" className="ml-1 text-xs font-medium text-muted underline-offset-2 hover:text-ink hover:underline">
                Garajı yönet
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export function CategoryShowcase() {
  const { categories, products } = useCatalog();
  const roots = categories.filter((c) => c.parentId === null);

  return (
    <section className="container-page py-12 md:py-16" aria-labelledby="home-categories">
      <div className="flex items-end justify-between gap-4">
        <h2 id="home-categories" className="text-xl font-semibold tracking-tight text-ink md:text-2xl">
          Kategoriler
        </h2>
        <Link href="/products" className="inline-flex items-center gap-1 text-sm font-medium text-ink hover:underline underline-offset-2">
          Tüm ürünler <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {roots.map((root) => {
          const children = categories.filter((c) => c.parentId === root.id);
          const tone = categoryTone(root, categories);
          return (
            <article
              key={root.id}
              className="group/card flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition-[box-shadow,transform] duration-[var(--dur-base)] ease-[var(--ease-out)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              {CATEGORY_PHOTOS[root.slug as keyof typeof CATEGORY_PHOTOS] && (
                <div className="relative aspect-[16/7] overflow-hidden bg-surface">
                  <Image
                    src={PHOTOS[CATEGORY_PHOTOS[root.slug as keyof typeof CATEGORY_PHOTOS]].src}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    className="object-cover transition-transform duration-500 ease-[var(--ease-out)] group-hover/card:scale-[1.03]"
                  />
                  <span className="absolute inset-0 bg-gradient-to-t from-night/45 to-transparent" aria-hidden="true" />
                </div>
              )}
              <span className={cn("h-1", TONE_CLASSES[tone].solid)} aria-hidden="true" />
              <Link href={`/categories/${root.slug}`} className="group flex items-center gap-4 border-b border-line p-4 hover:bg-surface/60">
                <IconBadge icon={categoryIcon(root.slug)} tone={tone} size="lg" />
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-ink group-hover:underline underline-offset-2">{root.name}</span>
                  <span className="mt-0.5 block text-sm text-muted">{categoryUsage(products.filter((p) => p.status === "published"), categories, root.id)} ürün</span>
                </span>
                <ArrowRight className="ml-auto size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <ul className="flex flex-wrap gap-1.5 p-4">
                {children.map((c) => {
                  const Icon = categoryIcon(c.slug);
                  return (
                    <li key={c.id}>
                      <Link
                        href={`/categories/${c.slug}`}
                        className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1 text-xs text-ink-soft transition-colors duration-[var(--dur-fast)] hover:border-line-strong hover:bg-surface hover:text-ink"
                      >
                        <Icon className={cn("size-3.5", TONE_CLASSES[tone].text)} aria-hidden="true" />
                        {c.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </article>
          );
        })}
      </div>
    </section>
  );
}

export function FeaturedProducts() {
  const { products, hydrated } = useCatalog();
  const featured = products.filter((p) => p.featured && p.status === "published").slice(0, 8);
  if (hydrated && featured.length === 0) return null;

  return (
    <section className="border-t border-line bg-surface/50" aria-labelledby="home-featured">
      <div className="container-page py-12 md:py-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 id="home-featured" className="text-xl font-semibold tracking-tight text-ink md:text-2xl">
              Öne çıkan ürünler
            </h2>
            <p className="mt-1 text-sm text-muted">Bakım ve yükseltme için sık tercih edilen parçalar.</p>
          </div>
        </div>
        <div className="mt-6">{hydrated ? <ProductGrid products={featured} /> : <ProductGridSkeleton count={4} />}</div>
      </div>
    </section>
  );
}
