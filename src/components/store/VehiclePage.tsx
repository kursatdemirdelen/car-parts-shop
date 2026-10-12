"use client";

import { CarFront, ChevronDown, SearchX } from "lucide-react";
import Link from "next/link";
import { KitCard } from "@/components/product/KitCard";
import { ProductGrid } from "@/components/product/ProductGrid";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge, Breadcrumbs, EmptyState, LoadingState } from "@/components/ui/Display";
import { useToast } from "@/components/ui/Toast";
import { vehicleLabel, yearRange } from "@/lib/catalog/vehicles";
import { kitsForVehicle } from "@/lib/kits";
import { findVehicleBySlug, partsForVehicle } from "@/lib/seo";
import { useCatalog } from "@/state/catalog-store";
import { useGarage } from "@/state/garage-store";

export function VehiclePage({ slug }: { slug: string }) {
  const { vehicles, products, categories, compatibility, kits, hydrated } = useCatalog();
  const { selected, choose } = useGarage();
  const toast = useToast();
  const vehicle = findVehicleBySlug(vehicles, slug);

  if (!vehicle) {
    if (!hydrated) {
      return (
        <div className="container-page py-10">
          <LoadingState rows={4} />
        </div>
      );
    }
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={SearchX}
          title="Araç bulunamadı"
          description="Bu araç demo veri setinde yok."
          action={<LinkButton href="/garage">Aracını seç</LinkButton>}
        />
      </div>
    );
  }

  const { confirmed, unverified } = partsForVehicle(products, categories, compatibility, vehicle.id);
  const vehicleKits = kitsForVehicle(kits, vehicle.id);
  const isSelected = selected === vehicle.id;
  const confirmedCount = confirmed.reduce((n, g) => n + g.products.length, 0);

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", href: "/" }, { label: "Araçlar", href: "/garage" }, { label: vehicleLabel(vehicle) }]} />

      <header className="mt-4 flex flex-col gap-4 border-b border-line pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-muted">
            {vehicle.make} · {vehicle.body ?? "—"} · <span className="tabular">{yearRange(vehicle)}</span>
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink md:text-[1.75rem]">
            {vehicle.make} {vehicle.model} {vehicle.generation}
            <span className="block text-lg font-medium text-ink-soft md:inline md:text-[1.75rem] md:font-semibold md:text-ink">
              {" "}
              · {vehicle.engine}
            </span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            {confirmedCount} doğrulanmış uyumlu parça · {vehicleKits.length} bakım seti
          </p>
        </div>
        {isSelected ? (
          <Badge tone="success" className="self-start sm:self-auto">
            <CarFront className="size-3.5" aria-hidden="true" /> Seçili aracın
          </Badge>
        ) : (
          <Button
            onClick={() => {
              choose(vehicle.id);
              toast.show(`${vehicleLabel(vehicle)} garajına eklendi ve seçildi.`);
            }}
          >
            <CarFront className="size-4" aria-hidden="true" />
            Bu aracı seç
          </Button>
        )}
      </header>

      {vehicleKits.length > 0 && (
        <section className="mt-8" aria-labelledby="vehicle-kits">
          <h2 id="vehicle-kits" className="text-lg font-semibold tracking-tight text-ink">
            Bakım setleri
          </h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            {vehicleKits.map((k) => (
              <KitCard key={k.id} kit={k} vehicleId={vehicle.id} />
            ))}
          </div>
        </section>
      )}

      <section className="mt-10" aria-labelledby="vehicle-parts">
        <h2 id="vehicle-parts" className="text-lg font-semibold tracking-tight text-ink">
          Uyumluluğu doğrulanmış parçalar
        </h2>
        {confirmed.length === 0 ? (
          <p className="mt-3 text-sm text-muted">Bu araç için henüz doğrulanmış parça kaydı yok.</p>
        ) : (
          <div className="mt-4 space-y-8">
            {confirmed.map(({ category, products: list }) => (
              <div key={category.id}>
                <h3 className="mb-3 text-sm font-semibold text-ink">
                  <Link href={`/categories/${category.slug}`} className="underline-offset-2 hover:underline">
                    {category.name}
                  </Link>
                </h3>
                <ProductGrid products={list} showFitment={isSelected} />
              </div>
            ))}
          </div>
        )}
      </section>

      {unverified.length > 0 && (
        <details className="group mt-10 rounded-[var(--radius-card)] border border-line">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3 [&::-webkit-details-marker]:hidden">
            <span>
              <span className="font-medium text-ink">Doğrulanmamış kayıtlar ({unverified.length})</span>
              <span className="block text-sm text-muted">Bu parçalar uyabilir ama doğrulanmadı; sipariş öncesi kontrol edilmeli.</span>
            </span>
            <ChevronDown className="size-4 shrink-0 text-muted transition-transform group-open:rotate-180" aria-hidden="true" />
          </summary>
          <div className="border-t border-line p-4">
            <ProductGrid products={unverified} showFitment={false} />
          </div>
        </details>
      )}

      <p className="mt-10 text-xs text-muted">
        Listede olmayan parçalar için uyumluluk bilinmiyor. Uyumluluk kayıtları demo verisidir.
      </p>
    </div>
  );
}
