"use client";

import { PackageCheck } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { vehicleShortLabel } from "@/lib/catalog/vehicles";
import { cn, formatPrice } from "@/lib/format";
import { resolveKit } from "@/lib/kits";
import type { MaintenanceKit } from "@/lib/types";
import { cartActions } from "@/state/cart-store";
import { useCatalog } from "@/state/catalog-store";

/** A maintenance kit with its lines, live availability and the summed price (no kit discount). */
export function KitCard({ kit, className }: { kit: MaintenanceKit; className?: string }) {
  const { products, vehicles } = useCatalog();
  const toast = useToast();
  const { lines, total, availableCount } = resolveKit(kit, products);
  const kitVehicles = vehicles.filter((v) => kit.vehicleIds.includes(v.id));

  const addAll = () => {
    const { added, skipped } = cartActions.addKit(kit);
    if (added === 0) {
      toast.show("Bu setteki ürünlerin hiçbiri şu an satın alınamıyor.", "error");
      return;
    }
    toast.show(
      skipped.length
        ? `${added} ürün sepete eklendi. Stokta olmadığı için eklenmedi: ${skipped.join(", ")}.`
        : `${added} ürün sepete eklendi.`,
      skipped.length ? "info" : "success",
      { label: "Sepete git", href: "/cart" },
    );
  };

  return (
    <article className={cn("flex flex-col rounded-[var(--radius-card)] border border-line bg-white", className)}>
      <div className="flex items-start gap-3 border-b border-line p-4">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface text-ink">
          <PackageCheck className="size-5" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <h3 className="font-semibold text-ink">{kit.name}</h3>
          {kitVehicles.length > 0 && <p className="mt-0.5 text-xs text-muted">{kitVehicles.map(vehicleShortLabel).join(" · ")}</p>}
          {kit.description && <p className="mt-1.5 text-sm text-ink-soft">{kit.description}</p>}
        </div>
      </div>
      <ul className="flex-1 divide-y divide-line px-4 text-sm">
        {lines.map(({ line, product, available }) => (
          <li key={line.productId} className="flex items-center justify-between gap-3 py-2">
            <span className={cn("min-w-0", !available && "text-subtle line-through")}>
              {product ? (
                <Link href={`/products/${product.slug}`} className="underline-offset-2 hover:underline">
                  {product.name}
                </Link>
              ) : (
                "Kaldırılmış ürün"
              )}
              <span className="text-muted"> · {line.quantity} adet</span>
            </span>
            <span className="shrink-0 tabular">
              {available ? formatPrice(product!.price * line.quantity) : <span className="text-xs text-danger">Stokta yok</span>}
            </span>
          </li>
        ))}
      </ul>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line p-4">
        <div>
          <p className="text-xs text-muted">Set toplamı (parçaların toplamı)</p>
          <p className="text-lg font-semibold text-ink tabular">{formatPrice(total)}</p>
        </div>
        <Button onClick={addAll} disabled={availableCount === 0}>
          Seti sepete ekle
        </Button>
      </div>
    </article>
  );
}
