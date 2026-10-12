"use client";

import { ArrowRight, CarFront } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ProductGrid } from "@/components/product/ProductGrid";
import { ProductGridSkeleton } from "@/components/ui/Display";
import { categoryUsage } from "@/lib/catalog/relations";
import { vehicleShortLabel } from "@/lib/catalog/vehicles";
import { cn } from "@/lib/format";
import { useCatalog } from "@/state/catalog-store";
import { useGarage } from "@/state/garage-store";
import { SearchInput } from "./SearchInput";
import { VehicleSelector } from "./VehicleSelector";

export function HomeHero() {
  const { savedVehicles, selected, select } = useGarage();
  const router = useRouter();

  return (
    <section className="border-b border-line bg-gradient-to-b from-surface to-white">
      <div className="container-page py-10 md:py-16">
        <div className="max-w-3xl">
          <p className="text-sm font-medium text-muted">BMW · Mercedes-Benz · Porsche · Audi</p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-ink md:text-[2.5rem] md:leading-[1.15]">
            Aracına uygun parçayı bul
          </h1>
          <p className="mt-3 max-w-xl text-base leading-relaxed text-muted">
            OEM numarası, stok kodu veya ürün adıyla ara. Ne aradığını bilmiyorsan aracını seç; uyumluluğu doğrulanmış parçaları ayrıca işaretleyelim.
          </p>
          <SearchInput size="lg" className="mt-6" />
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
          const cover = children[0]?.image;
          return (
            <article key={root.id} className="flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white">
              <Link href={`/categories/${root.slug}`} className="group flex items-center gap-4 border-b border-line p-4 hover:bg-surface/60">
                {cover && (
                  <span className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-surface">
                    <Image src={cover} alt="" fill sizes="64px" unoptimized className="object-contain p-1" />
                  </span>
                )}
                <span className="min-w-0">
                  <span className="block text-base font-semibold text-ink group-hover:underline underline-offset-2">{root.name}</span>
                  <span className="mt-0.5 block text-sm text-muted">{categoryUsage(products.filter((p) => p.status === "published"), categories, root.id)} ürün</span>
                </span>
                <ArrowRight className="ml-auto size-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
              </Link>
              <ul className="flex flex-wrap gap-1.5 p-4">
                {children.map((c) => (
                  <li key={c.id}>
                    <Link
                      href={`/categories/${c.slug}`}
                      className="inline-block rounded-full border border-line px-3 py-1 text-xs text-ink-soft transition-colors hover:border-ink hover:text-ink"
                    >
                      {c.name}
                    </Link>
                  </li>
                ))}
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
