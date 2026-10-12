"use client";

import { Heart, X } from "lucide-react";
import { ProductGrid } from "@/components/product/ProductGrid";
import { LinkButton } from "@/components/ui/Button";
import { Breadcrumbs, EmptyState, PageHeader, ProductGridSkeleton } from "@/components/ui/Display";
import { useCatalog } from "@/state/catalog-store";
import { useFavorites } from "@/state/favorites-store";

export function FavoritesPage() {
  const { products, hydrated } = useCatalog();
  const { ids, toggle } = useFavorites();
  const byId = new Map(products.map((p) => [p.id, p]));
  const available = ids.map((id) => byId.get(id)).filter((p) => p && p.status === "published") as typeof products;
  const unavailable = ids.filter((id) => !byId.get(id) || byId.get(id)!.status !== "published");

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", href: "/" }, { label: "Favoriler" }]} />
      <PageHeader className="mt-4" title="Favoriler" description="Daha sonra bakmak için kaydettiğin ürünler. Bu liste yalnızca bu tarayıcıda saklanır." />

      <div className="mt-8">
        {!hydrated ? (
          <ProductGridSkeleton count={4} />
        ) : ids.length === 0 ? (
          <EmptyState
            icon={Heart}
            title="Henüz favori ürünün yok"
            description="Ürün kartlarındaki kalp simgesiyle ürünleri buraya ekleyebilirsin."
            action={<LinkButton href="/products">Ürünlere göz at</LinkButton>}
          />
        ) : (
          <>
            {available.length > 0 && <ProductGrid products={available} />}
            {unavailable.length > 0 && (
              <div className="mt-8 rounded-[var(--radius-card)] border border-line p-4">
                <h2 className="text-sm font-semibold text-ink">Artık satışta olmayan ürünler</h2>
                <ul className="mt-3 space-y-2">
                  {unavailable.map((id) => (
                    <li key={id} className="flex items-center justify-between gap-3 text-sm text-muted">
                      <span>{byId.get(id)?.name ?? "Kaldırılmış ürün"}</span>
                      <button
                        type="button"
                        onClick={() => toggle(id)}
                        className="inline-flex items-center gap-1 text-xs font-medium text-ink underline underline-offset-2"
                      >
                        <X className="size-3.5" aria-hidden="true" /> Listeden çıkar
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
