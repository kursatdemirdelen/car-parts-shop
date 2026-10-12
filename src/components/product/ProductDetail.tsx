"use client";

import { CarFront, Copy, PackageX, Truck } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { VehicleSelector } from "@/components/store/VehicleSelector";
import { Button, LinkButton } from "@/components/ui/Button";
import { Breadcrumbs, DemoNotice, EmptyState, LoadingState } from "@/components/ui/Display";
import { Dialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { fitmentFor, type FitmentState } from "@/lib/catalog/fitment";
import { relatedProducts } from "@/lib/catalog/relations";
import { vehicleLabel, yearRange } from "@/lib/catalog/vehicles";
import { cn, formatPrice } from "@/lib/format";
import type { CompatibilityStatus, Product, Vehicle } from "@/lib/types";
import { useCatalog } from "@/state/catalog-store";
import { useGarage } from "@/state/garage-store";
import { AddToCartButton, FavoriteButton } from "./ProductActions";
import { FitmentBadge, PriceDisplay, ProductImage, QuantitySelector, StockStatus } from "./ProductBits";
import { ProductGrid } from "./ProductGrid";

const fitmentText: Record<FitmentState, string> = {
  confirmed: "Bu parçanın aracınla uyumu kayıtlarımızda doğrulanmış.",
  unverified: "Bu araç için uyumluluk doğrulanmadı. Sipariş öncesi şasi numaranla kontrol etmeni öneririz.",
  unknown: "Bu araç için uyumluluk kaydı yok; uyumlu olduğu anlamına gelmez. Sipariş öncesi bize danışabilirsin.",
  incompatible: "Bu parça kayıtlarımıza göre seçili aracınla uyumlu değil.",
  universal: "Bu ürün belirli bir araca bağlı değildir. Aracının üretici gereksinimlerini kullanım kılavuzundan kontrol et.",
};

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section aria-labelledby={id} className="border-t border-line py-8">
      <h2 id={id} className="text-lg font-semibold tracking-tight text-ink">
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function Gallery({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const images = product.images;
  const current = images[Math.min(active, Math.max(images.length - 1, 0))];
  return (
    <div>
      <ProductImage image={current} sizes="(min-width: 1024px) 560px, 100vw" priority className="rounded-[var(--radius-card)] border border-line" />
      {images.length > 1 && (
        <div className="mt-3 flex gap-2" role="group" aria-label="Ürün görselleri">
          {images.map((img, i) => (
            <button
              key={`${img.src}-${i}`}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`Görsel ${i + 1}`}
              aria-pressed={i === active}
              className={cn(
                "w-16 overflow-hidden rounded-lg border-2",
                i === active ? "border-ink" : "border-transparent hover:border-line-strong",
              )}
            >
              <ProductImage image={img} sizes="64px" />
            </button>
          ))}
        </div>
      )}
      <p className="mt-2 text-xs text-subtle">Temsili görsel. Gerçek ürün görünümü farklı olabilir.</p>
    </div>
  );
}

const statusOrder: Record<CompatibilityStatus, number> = { confirmed: 0, unverified: 1, incompatible: 2 };

function CompatibilityList({ product }: { product: Product }) {
  const { compatibility, vehicles } = useCatalog();
  const { selected } = useGarage();
  const rows = useMemo(() => {
    const byId = new Map(vehicles.map((v) => [v.id, v]));
    return compatibility
      .filter((r) => r.productId === product.id && byId.has(r.vehicleId))
      .map((r) => ({ record: r, vehicle: byId.get(r.vehicleId)! }))
      .sort((a, b) => statusOrder[a.record.status] - statusOrder[b.record.status] || vehicleLabel(a.vehicle).localeCompare(vehicleLabel(b.vehicle), "tr"));
  }, [compatibility, vehicles, product.id]);

  if (product.fitmentType === "universal") {
    return <p className="text-sm text-ink-soft">Bu ürün araca bağlı değildir.</p>;
  }
  if (rows.length === 0) {
    return (
      <p className="text-sm leading-relaxed text-ink-soft">
        Bu ürün için henüz uyumluluk kaydı yok. Kayıt olmaması uyumlu olduğu anlamına gelmez; sipariş öncesi{" "}
        <Link href="/help" className="font-medium text-ink underline underline-offset-2">
          bizimle iletişime geç
        </Link>
        .
      </p>
    );
  }
  return (
    <div className="overflow-hidden rounded-[var(--radius-card)] border border-line">
      <table className="w-full text-sm">
        <caption className="sr-only">Kayıtlı araç uyumlulukları</caption>
        <thead className="bg-surface text-left text-xs text-muted">
          <tr>
            <th scope="col" className="px-4 py-2.5 font-medium">
              Araç
            </th>
            <th scope="col" className="hidden px-4 py-2.5 font-medium sm:table-cell">
              Yıllar
            </th>
            <th scope="col" className="px-4 py-2.5 text-right font-medium">
              Durum
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-line">
          {rows.map(({ record, vehicle }) => (
            <tr key={record.id} className={cn(vehicle.id === selected && "bg-surface/60")}>
              <td className="px-4 py-3">
                <span className="text-ink">{vehicleLabel(vehicle)}</span>
                {vehicle.id === selected && <span className="ml-2 text-xs text-muted">(seçili aracın)</span>}
                {record.note && <span className="mt-0.5 block text-xs text-muted">{record.note}</span>}
              </td>
              <td className="hidden px-4 py-3 text-muted tabular sm:table-cell">{yearRange(vehicle)}</td>
              <td className="px-4 py-3 text-right">
                <FitmentBadge state={record.status} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="border-t border-line bg-surface/50 px-4 py-2.5 text-xs text-muted">
        Listede olmayan araçlar için uyumluluk bilinmiyor. Uyumluluk kayıtları demo verisidir.
      </p>
    </div>
  );
}

function FitmentRow({ product, vehicle, onChoose }: { product: Product; vehicle: Vehicle | null; onChoose: () => void }) {
  const { compatibility } = useCatalog();
  const state = fitmentFor(product, vehicle?.id ?? null, compatibility);

  if (state === "no-vehicle") {
    return (
      <div className="rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3">
        <p className="text-sm text-ink-soft">Bu parçanın aracına uyup uymadığını görmek için aracını seç.</p>
        <Button variant="secondary" size="sm" className="mt-2" onClick={onChoose}>
          <CarFront className="size-4" aria-hidden="true" />
          Aracını seç
        </Button>
      </div>
    );
  }

  const tone =
    state === "confirmed"
      ? "border-[#cfe7d9] bg-success-soft"
      : state === "incompatible"
        ? "border-[#f5d0cc] bg-danger-soft"
        : "border-line bg-surface";

  return (
    <div className={cn("rounded-[var(--radius-card)] border px-4 py-3", tone)}>
      <div className="flex flex-wrap items-center gap-2">
        <FitmentBadge state={state} className="bg-white" />
        {vehicle && state !== "universal" && <span className="text-sm font-medium text-ink">{vehicleLabel(vehicle)}</span>}
      </div>
      <p className="mt-1.5 text-sm text-ink-soft">{fitmentText[state]}</p>
      {state !== "universal" && (
        <button type="button" onClick={onChoose} className="mt-1 text-xs font-medium text-ink underline underline-offset-2">
          Başka bir araç seç
        </button>
      )}
    </div>
  );
}

export function ProductDetail({ slug }: { slug: string }) {
  const { products, brands, categories, settings, hydrated } = useCatalog();
  const { selectedVehicle } = useGarage();
  const toast = useToast();
  const [qty, setQty] = useState(1);
  const [chooserOpen, setChooserOpen] = useState(false);

  const product = products.find((p) => p.slug === slug && p.status === "published");

  if (!product) {
    if (!hydrated) {
      return (
        <div className="container-page py-10">
          <LoadingState label="Ürün yükleniyor…" rows={4} />
        </div>
      );
    }
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={PackageX}
          title="Ürün bulunamadı"
          description="Bu ürün kaldırılmış ya da şu an satışta değil."
          action={<LinkButton href="/products">Tüm ürünlere göz at</LinkButton>}
        />
      </div>
    );
  }

  const brand = brands.find((b) => b.id === product.brandId);
  const category = categories.find((c) => c.id === product.categoryId);
  const parent = category?.parentId ? categories.find((c) => c.id === category.parentId) : undefined;
  const related = relatedProducts(product, products, 4);
  const maxQty = Math.max(product.stock, 1);
  const quantity = Math.min(qty, maxQty);
  const freeShippingLeft = settings.freeShippingThreshold - product.price * quantity;

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value);
      toast.show(`${value} kopyalandı.`, "info");
    } catch {
      toast.show("Kopyalanamadı. Numarayı elle seçebilirsin.", "error");
    }
  };

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs
        items={[
          { label: "Ana sayfa", href: "/" },
          ...(parent ? [{ label: parent.name, href: `/categories/${parent.slug}` }] : []),
          ...(category ? [{ label: category.name, href: `/categories/${category.slug}` }] : []),
          { label: product.name },
        ]}
      />

      <div className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.05fr)_minmax(0,1fr)] lg:gap-12">
        <Gallery product={product} />

        <div className="flex flex-col gap-5">
          <div>
            {brand && (
              <p lang="en" className="text-xs font-semibold tracking-wider text-muted uppercase">
                {brand.name}
              </p>
            )}
            <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-ink md:text-[1.75rem] md:leading-tight">{product.name}</h1>
            <dl className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-muted">
              <div className="flex gap-1.5">
                <dt>Stok kodu:</dt>
                <dd className="text-ink-soft tabular">{product.sku}</dd>
              </div>
              {product.oemNumbers[0] && (
                <div className="flex gap-1.5">
                  <dt>OEM:</dt>
                  <dd className="text-ink-soft tabular">{product.oemNumbers[0]}</dd>
                </div>
              )}
            </dl>
          </div>

          <div className="flex flex-wrap items-end justify-between gap-3">
            <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} size="lg" />
            <StockStatus stock={product.stock} lowThreshold={settings.lowStockThreshold} className="text-sm" />
          </div>

          <FitmentRow product={product} vehicle={selectedVehicle} onChoose={() => setChooserOpen(true)} />

          <div className="flex flex-wrap items-center gap-3">
            {product.stock > 0 && (
              <QuantitySelector value={quantity} max={product.stock} onChange={setQty} label="Adet" />
            )}
            <div className="min-w-48 flex-1">
              <AddToCartButton product={product} quantity={quantity} fullWidth />
            </div>
            <FavoriteButton productId={product.id} productName={product.name} className="size-10 rounded-[var(--radius-control)]" />
          </div>

          <p className="flex items-start gap-2 text-sm text-muted">
            <Truck className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {freeShippingLeft > 0
              ? `${formatPrice(freeShippingLeft)} daha ekle, kargo ücretsiz olsun.`
              : "Bu siparişte kargo ücretsiz."}{" "}
            <Link href="/shipping-returns" className="underline underline-offset-2 hover:text-ink">
              Kargo ve iade
            </Link>
          </p>
          <DemoNotice>Ürün bilgileri, fiyat ve uyumluluk kayıtları demo verisidir; gerçek bir ürünü temsil etmez.</DemoNotice>
        </div>
      </div>

      <div className="mt-10 max-w-4xl">
        <Section id="specs" title="Teknik özellikler">
          {product.specs.length > 0 ? (
            <dl className="divide-y divide-line overflow-hidden rounded-[var(--radius-card)] border border-line text-sm">
              {product.specs.map((s, i) => (
                <div key={`${s.label}-${i}`} className="grid grid-cols-[minmax(0,2fr)_minmax(0,3fr)] gap-4 px-4 py-2.5 odd:bg-surface/50">
                  <dt className="text-muted">{s.label}</dt>
                  <dd className="text-ink">{s.value}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="text-sm text-muted">Bu ürün için teknik bilgi girilmemiş.</p>
          )}
        </Section>

        <Section id="oem" title="OEM numaraları">
          {product.oemNumbers.length > 0 ? (
            <>
              <ul className="flex flex-wrap gap-2">
                {product.oemNumbers.map((n) => (
                  <li key={n}>
                    <button
                      type="button"
                      onClick={() => copy(n)}
                      className="inline-flex items-center gap-2 rounded-[var(--radius-control)] border border-line px-3 py-1.5 text-sm text-ink tabular hover:border-ink"
                      aria-label={`${n} numarasını kopyala`}
                    >
                      {n}
                      <Copy className="size-3.5 text-muted" aria-hidden="true" />
                    </button>
                  </li>
                ))}
              </ul>
              <p className="mt-3 text-xs text-muted">
                OEM numaraları araç üreticisinin parça numaralarıdır ve Kursat Shop stok kodundan farklıdır.
              </p>
            </>
          ) : (
            <p className="text-sm text-muted">Bu ürün için OEM numarası bulunmuyor (ör. üreticiye özel performans ürünleri).</p>
          )}
        </Section>

        <Section id="compatibility" title="Uyumlu araçlar">
          <CompatibilityList product={product} />
        </Section>

        <Section id="description" title="Açıklama">
          <p className="max-w-2xl text-sm leading-relaxed text-ink-soft whitespace-pre-line">{product.description}</p>
        </Section>
      </div>

      {related.length > 0 && (
        <section aria-labelledby="related" className="mt-4 border-t border-line pt-8">
          <h2 id="related" className="text-lg font-semibold tracking-tight text-ink">
            Benzer ürünler
          </h2>
          <div className="mt-4">
            <ProductGrid products={related} />
          </div>
        </section>
      )}

      <Dialog open={chooserOpen} onClose={() => setChooserOpen(false)} title="Aracını seç">
        <VehicleSelector layout="stacked" mode="stay" submitLabel="Aracı seç" onSelected={() => setChooserOpen(false)} />
      </Dialog>
    </div>
  );
}
