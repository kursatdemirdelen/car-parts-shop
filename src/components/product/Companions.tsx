"use client";

import { companionsFor } from "@/lib/kits";
import type { Product } from "@/lib/types";
import { useCatalog } from "@/state/catalog-store";
import { useGarage } from "@/state/garage-store";
import { ProductGrid } from "./ProductGrid";

/** "Usually replaced together" suggestions; with a vehicle selected only confirmed or universal parts. */
export function Companions({ product }: { product: Product }) {
  const { products, compatibility } = useCatalog();
  const { selectedVehicle } = useGarage();
  const list = companionsFor(product, products, selectedVehicle?.id ?? null, compatibility);
  if (list.length === 0) return null;
  return (
    <section aria-labelledby="companions" className="mt-4 border-t border-line pt-8">
      <h2 id="companions" className="text-lg font-semibold tracking-tight text-ink">
        Bununla birlikte genellikle değiştirilenler
      </h2>
      <p className="mt-1 text-sm text-muted">
        {selectedVehicle
          ? "Yalnızca seçili aracın için uyumluluğu doğrulanmış veya araca bağlı olmayan parçalar."
          : "Aracını seçersen yalnızca uyumluluğu doğrulanmış parçaları gösteririz."}
      </p>
      <div className="mt-4">
        <ProductGrid products={list} />
      </div>
    </section>
  );
}
