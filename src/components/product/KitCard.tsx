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
export function KitCard({ kit, vehicleId, className }: { kit: MaintenanceKit; vehicleId?: string; className?: string }) {
  const { products, vehicles, compatibility } = useCatalog();
  const toast = useToast();
  const { lines, total, availableCount } = resolveKit(kit, products, vehicleId ? { vehicleId, records: compatibility } : undefined);
  const kitVehicles = vehicles.filter((v) => kit.vehicleIds.includes(v.id));

  const addAll = () => {
    const { added, capped, skipped } = cartActions.addKit(kit, vehicleId);
    if (added === 0) {
      toast.show(
        capped.length ? "Setteki ürünler stok sınırına ulaştı; sepete yeni adet eklenemedi." : "Bu setteki ürünlerin hiçbiri şu an satın alınamıyor.",
        "error",
        { label: "Sepete git", href: "/cart" },
      );
      return;
    }
    const notes = [
      capped.length ? `Stok sınırı nedeniyle eksik eklenen: ${capped.join(", ")}.` : "",
      skipped.length ? `Şu an eklenemeyenler: ${skipped.join(", ")}.` : "",
    ].filter(Boolean);
    toast.show([`${added} ürün sepete eklendi.`, ...notes].join(" "), notes.length ? "info" : "success", {
      label: "Sepete git",
      href: "/cart",
    });
  };

  return (
    <article
      className={cn(
        "flex flex-col rounded-[var(--radius-card)] border border-line bg-white transition-[box-shadow,border-color] duration-[var(--dur-base)] ease-[var(--ease-out)] hover:border-line-strong hover:shadow-[var(--shadow-lift)]",
        className,
      )}
    >
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
        {lines.map(({ line, product, available, reason }) => (
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
              {available ? (
                formatPrice(product!.price * line.quantity)
              ) : (
                <span className="text-xs text-danger">{reason === "unverified" ? "Bu araç için doğrulanmamış" : "Şu an satışta değil"}</span>
              )}
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
