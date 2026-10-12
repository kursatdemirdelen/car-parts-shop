"use client";

import { fitmentFor } from "@/lib/catalog/fitment";
import { cn } from "@/lib/format";
import type { Product } from "@/lib/types";
import { useCatalog } from "@/state/catalog-store";
import { useGarage } from "@/state/garage-store";
import { ProductCard } from "./ProductCard";

/** Responsive product grid. Shows fitment badges when a vehicle is selected and `showFitment` is on. */
export function ProductGrid({
  products,
  showFitment = true,
  className,
  columns = "default",
}: {
  products: Product[];
  showFitment?: boolean;
  className?: string;
  columns?: "default" | "wide";
}) {
  const { brands, compatibility, settings } = useCatalog();
  const { selectedVehicle } = useGarage();
  const brandNames = new Map(brands.map((b) => [b.id, b.name]));

  return (
    <ul
      className={cn(
        "grid grid-cols-2 gap-3 sm:gap-4",
        columns === "wide" ? "md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5" : "md:grid-cols-3 xl:grid-cols-4",
        className,
      )}
    >
      {products.map((p, i) => {
        const state = showFitment && selectedVehicle ? fitmentFor(p, selectedVehicle.id, compatibility) : undefined;
        return (
          <li key={p.id} className="flex">
            <div className="flex w-full flex-col [&>article]:flex-1">
              <ProductCard
                product={p}
                brandName={brandNames.get(p.brandId) ?? ""}
                fitment={state === "no-vehicle" ? undefined : state}
                priority={i < 4}
                lowStockThreshold={settings.lowStockThreshold}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
