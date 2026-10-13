"use client";

import { SectionBoundary } from "@/components/ui/SectionBoundary";
import { AlertTriangle, ArrowLeft, ShoppingCart, Trash2 } from "lucide-react";
import Link from "next/link";
import { KitCard } from "@/components/product/KitCard";
import { ProductImage, QuantitySelector } from "@/components/product/ProductBits";
import { Button, LinkButton } from "@/components/ui/Button";
import { Breadcrumbs, EmptyState, LoadingState, PageHeader } from "@/components/ui/Display";
import { useToast } from "@/components/ui/Toast";
import type { CartLine, ResolvedCart } from "@/lib/cart";
import { vehicleShortLabel } from "@/lib/catalog/vehicles";
import { formatPrice } from "@/lib/format";
import { kitsForVehicle } from "@/lib/kits";
import { shippingFor } from "@/lib/shipping";
import type { StoreSettings } from "@/lib/types";
import { useCart } from "@/state/cart-store";
import { useCatalog } from "@/state/catalog-store";
import { useGarage } from "@/state/garage-store";

export function OrderSummary({
  resolved,
  settings,
  children,
}: {
  resolved: ResolvedCart;
  settings: StoreSettings;
  children?: React.ReactNode;
}) {
  const shipping = shippingFor(resolved.subtotal, settings);
  const remaining = settings.freeShippingThreshold - resolved.subtotal;
  return (
    <div className="rounded-[var(--radius-card)] border border-line bg-surface/50 p-5">
      <h2 className="text-base font-semibold text-ink">Sipariş özeti</h2>
      <dl className="mt-4 space-y-2.5 text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Ara toplam</dt>
          <dd className="text-ink tabular">{formatPrice(resolved.subtotal)}</dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-muted">Kargo</dt>
          <dd className="text-ink tabular">{shipping === 0 ? "Ücretsiz" : formatPrice(shipping)}</dd>
        </div>
        {remaining > 0 && resolved.subtotal > 0 && (
          <p className="text-xs text-muted">{formatPrice(remaining)} daha ekle, kargo ücretsiz olsun.</p>
        )}
        <div className="flex justify-between gap-4 border-t border-line pt-3 text-base font-semibold">
          <dt className="text-ink">Toplam</dt>
          <dd className="text-ink tabular">{formatPrice(resolved.subtotal + shipping)}</dd>
        </div>
        <p className="text-xs text-muted">Fiyatlara KDV dahildir.</p>
      </dl>
      {children && <div className="mt-5 space-y-2">{children}</div>}
    </div>
  );
}

function CartLineRow({ line }: { line: CartLine }) {
  const { setQty, remove } = useCart();
  const toast = useToast();
  const { item, product, state, lineTotal } = line;

  const onRemove = () => {
    remove(item.productId);
    toast.show("Ürün sepetten çıkarıldı.", "info");
  };

  return (
    <li className="flex gap-4 py-5">
      <div className="w-20 shrink-0 overflow-hidden rounded-lg border border-line sm:w-24">
        <ProductImage image={product?.images[0]} sizes="96px" />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            {product ? (
              <Link href={`/products/${product.slug}`} className="font-medium text-ink hover:underline underline-offset-2">
                {product.name}
              </Link>
            ) : (
              <p className="font-medium text-muted">Kaldırılmış ürün</p>
            )}
            {product && <p className="mt-0.5 text-xs text-muted tabular">Stok kodu: {product.sku}</p>}
          </div>
          <p className="shrink-0 text-right font-semibold text-ink tabular">{state === "unavailable" ? "—" : formatPrice(lineTotal)}</p>
        </div>

        {state === "unavailable" ? (
          <p className="flex items-center gap-1.5 text-sm text-danger">
            <AlertTriangle className="size-4" aria-hidden="true" />
            Bu ürün şu an satışta değil. Devam etmek için sepetten çıkar.
          </p>
        ) : (
          <div className="flex flex-wrap items-center gap-3">
            <QuantitySelector
              value={item.quantity}
              max={product!.stock}
              onChange={(n) => setQty(item.productId, n)}
              label={`${product!.name} adedi`}
              size="sm"
            />
            <span className="text-xs text-muted tabular">Birim: {formatPrice(product!.price)}</span>
          </div>
        )}

        {state === "insufficient" && product && (
          <div className="flex flex-wrap items-center gap-2 text-sm text-warn">
            <AlertTriangle className="size-4" aria-hidden="true" />
            Stokta yalnızca {product.stock} adet var (sepetinde {item.quantity}).
            <Button variant="secondary" size="sm" onClick={() => setQty(item.productId, product.stock)}>
              Stoka göre düzelt
            </Button>
          </div>
        )}

        <div>
          <button
            type="button"
            onClick={onRemove}
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted hover:text-danger"
          >
            <Trash2 className="size-3.5" aria-hidden="true" />
            Sepetten çıkar
          </button>
        </div>
      </div>
    </li>
  );
}

/** Kits for the selected vehicle, shown under the cart. */
function VehicleKits() {
  const { kits } = useCatalog();
  const { selectedVehicle } = useGarage();
  if (!selectedVehicle) return null;
  const list = kitsForVehicle(kits, selectedVehicle.id).slice(0, 2);
  if (list.length === 0) return null;
  return (
    <section aria-labelledby="cart-kits" className="mt-10">
      <h2 id="cart-kits" className="text-lg font-semibold tracking-tight text-ink">
        {vehicleShortLabel(selectedVehicle)} için bakım setleri
      </h2>
      <div className="mt-4 grid gap-4 md:grid-cols-2">
        {list.map((k) => (
          <KitCard key={k.id} kit={k} vehicleId={selectedVehicle.id} />
        ))}
      </div>
    </section>
  );
}

export function CartPage() {
  const { hydrated, settings } = useCatalog();
  const { resolved } = useCart();

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", href: "/" }, { label: "Sepet" }]} />
      <PageHeader className="mt-4" title="Sepet" />

      <div className="mt-6">
        {!hydrated ? (
          <LoadingState rows={3} />
        ) : resolved.lines.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="Sepetin boş"
            description="Aradığın parçayı ürün adı, OEM numarası veya aracınla bulabilirsin."
            action={
              <>
                <LinkButton href="/products">Ürünlere göz at</LinkButton>
                <LinkButton href="/garage" variant="secondary">
                  Aracını seç
                </LinkButton>
              </>
            }
          />
        ) : (
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <div>
              <ul className="divide-y divide-line border-y border-line">
                {resolved.lines.map((line) => (
                  <CartLineRow key={line.item.productId} line={line} />
                ))}
              </ul>
              <Link href="/products" className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-ink hover:underline underline-offset-2">
                <ArrowLeft className="size-4" aria-hidden="true" />
                Alışverişe devam et
              </Link>
            </div>
            <div className="lg:sticky lg:top-32 lg:self-start">
              <OrderSummary resolved={resolved} settings={settings}>
                {resolved.canCheckout ? (
                  <LinkButton href="/checkout" size="lg" className="w-full">
                    Ödemeye geç
                  </LinkButton>
                ) : (
                  <>
                    <Button size="lg" className="w-full" disabled>
                      Ödemeye geç
                    </Button>
                    <p className="text-xs text-danger">Devam etmek için uyarı içeren ürünleri düzelt veya sepetten çıkar.</p>
                  </>
                )}
              </OrderSummary>
            </div>
          </div>
        )}
      </div>
      {hydrated && <SectionBoundary label="Bakım setleri">
          <VehicleKits />
        </SectionBoundary>}
    </div>
  );
}
