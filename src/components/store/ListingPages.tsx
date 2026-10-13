"use client";

import { FolderSearch, SearchX } from "lucide-react";
import Link from "next/link";
import { useMemo } from "react";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, ProductGridSkeleton } from "@/components/ui/Display";
import { descendantCategoryIds } from "@/lib/catalog/relations";
import { searchProducts } from "@/lib/catalog/search";
import { cn } from "@/lib/format";
import { useCatalog } from "@/state/catalog-store";
import { ProductListing } from "./ProductListing";
import { SearchInput } from "./SearchInput";

export function ListingFallback() {
  return (
    <div className="container-page min-h-dvh py-8">
      <div className="ks-shimmer h-4 w-40 rounded" />
      <div className="ks-shimmer mt-4 h-8 w-64 rounded" />
      <div className="mt-8">
        <ProductGridSkeleton />
      </div>
    </div>
  );
}

export function AllProductsListing({ query }: { query: string }) {
  const { products } = useCatalog();
  return (
    <ProductListing
      query={query}
      title="Tüm ürünler"
      description="OEM parçalar, performans ürünleri ve bakım malzemeleri."
      breadcrumbs={[{ label: "Ana sayfa", href: "/" }, { label: "Tüm ürünler" }]}
      baseProducts={products}
    />
  );
}

export function CategoryListing({ slug, query }: { slug: string; query: string }) {
  const { categories, products, hydrated } = useCatalog();
  const category = categories.find((c) => c.slug === slug);
  const base = useMemo(() => {
    if (!category) return [];
    const ids = new Set(descendantCategoryIds(categories, category.id));
    return products.filter((p) => ids.has(p.categoryId));
  }, [category, categories, products]);

  if (!category) {
    if (!hydrated) return <ListingFallback />;
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={FolderSearch}
          title="Kategori bulunamadı"
          description="Aradığın kategori kaldırılmış veya adı değişmiş olabilir."
          action={<LinkButton href="/products">Tüm ürünlere göz at</LinkButton>}
        />
      </div>
    );
  }

  const parent = category.parentId ? categories.find((c) => c.id === category.parentId) : null;
  const siblings = categories.filter((c) => c.parentId === (parent ? parent.id : category.id));

  return (
    <ProductListing
      query={query}
      title={category.name}
      description={category.description}
      breadcrumbs={[
        { label: "Ana sayfa", href: "/" },
        ...(parent ? [{ label: parent.name, href: `/categories/${parent.slug}` }] : []),
        { label: category.name },
      ]}
      baseProducts={base}
      header={
        siblings.length > 0 && (
          <nav aria-label="Alt kategoriler" className="mt-5 -mx-4 overflow-x-auto px-4 md:mx-0 md:px-0">
            <ul className="flex gap-2 md:flex-wrap">
              {parent && (
                <li>
                  <Link
                    href={`/categories/${parent.slug}`}
                    className="inline-block rounded-full border border-line px-3 py-1.5 text-sm whitespace-nowrap text-ink-soft hover:border-ink hover:text-ink"
                  >
                    Tümü
                  </Link>
                </li>
              )}
              {siblings.map((c) => (
                <li key={c.id}>
                  <Link
                    href={`/categories/${c.slug}`}
                    aria-current={c.id === category.id ? "page" : undefined}
                    className={cn(
                      "inline-block rounded-full border px-3 py-1.5 text-sm whitespace-nowrap",
                      c.id === category.id
                        ? "border-ink bg-ink text-white"
                        : "border-line text-ink-soft hover:border-ink hover:text-ink",
                    )}
                  >
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        )
      }
    />
  );
}

export function SearchResults({ query }: { query: string }) {
  const q = new URLSearchParams(query).get("q")?.trim() ?? "";
  const { products, brands } = useCatalog();
  const results = useMemo(() => searchProducts(products, brands, q), [products, brands, q]);

  return (
    <ProductListing
      key={q}
      query={query}
      title={q ? `“${q}” için sonuçlar` : "Ürün ara"}
      description={q ? undefined : "Ürün adı, marka, stok kodu veya OEM numarası ile arama yapabilirsin."}
      breadcrumbs={[{ label: "Ana sayfa", href: "/" }, { label: "Arama" }]}
      baseProducts={results}
      keepOrder
      preserveParams={["q"]}
      header={
        <div className="mt-4 max-w-xl">
          <SearchInput key={q} defaultValue={q} />
        </div>
      }
      emptyState={
        <EmptyState
          icon={SearchX}
          title={q ? "Sonuç bulunamadı" : "Aramaya başla"}
          description={
            q
              ? "Yazımı kontrol et veya daha genel bir terim dene. OEM numaralarını boşluk ve nokta olmadan da yazabilirsin (örn. 34116860912)."
              : "Yukarıdaki kutuya bir ürün adı veya parça numarası yaz."
          }
          action={<LinkButton href="/products" variant="secondary">Tüm ürünlere göz at</LinkButton>}
        />
      }
    />
  );
}
