"use client";

import { SearchX } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Breadcrumbs, EmptyState, ProductGridSkeleton } from "@/components/ui/Display";
import { productsByOem } from "@/lib/seo";
import { useCatalog } from "@/state/catalog-store";
import { SearchInput } from "./SearchInput";

export function OemPage({ oem }: { oem: string }) {
  const { products, hydrated } = useCatalog();
  const list = productsByOem(products, oem);

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", href: "/" }, { label: "OEM numarası" }, { label: oem }]} />
      <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink md:text-[1.75rem]">
        OEM <span className="tabular">{oem}</span>
      </h1>
      <p className="mt-2 max-w-2xl text-sm leading-relaxed text-muted">
        OEM numarası, araç üreticisinin bir parçaya verdiği numaradır. Aynı OEM numarasına karşılık gelen farklı markaların parçaları
        birbirinin muadilidir; aşağıda bu numaraya bağlı ürünleri görebilirsin. Kursat Shop stok kodu bundan farklıdır.
      </p>

      <div className="mt-6">
        {list.length > 0 ? (
          <>
            <p className="mb-4 text-sm text-muted">
              <span className="font-semibold text-ink tabular">{list.length}</span> ürün bu OEM numarasına karşılık geliyor.
            </p>
            <ProductGrid products={list} />
          </>
        ) : !hydrated ? (
          <ProductGridSkeleton count={4} />
        ) : (
          <EmptyState
            icon={SearchX}
            title="Bu OEM numarasıyla eşleşen ürün yok"
            description="Numarayı kontrol et veya ürün adıyla aramayı dene."
            action={
              <div className="w-full max-w-md text-left">
                <SearchInput defaultValue={oem} />
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}
