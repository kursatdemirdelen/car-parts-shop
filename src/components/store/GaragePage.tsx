"use client";

import { CarFront, Check, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge, Breadcrumbs, EmptyState, LoadingState, PageHeader } from "@/components/ui/Display";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { useToast } from "@/components/ui/Toast";
import { vehicleLabel, yearRange } from "@/lib/catalog/vehicles";
import { cn } from "@/lib/format";
import type { Vehicle } from "@/lib/types";
import { useCatalog } from "@/state/catalog-store";
import { useGarage } from "@/state/garage-store";
import { VehicleSelector } from "./VehicleSelector";

export function GaragePage() {
  const { hydrated, compatibility } = useCatalog();
  const { savedVehicles, selected, select, remove } = useGarage();
  const toast = useToast();
  const [pendingRemove, setPendingRemove] = useState<Vehicle | null>(null);

  const confirmedCount = (id: string) => compatibility.filter((r) => r.vehicleId === id && r.status === "confirmed").length;

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", href: "/" }, { label: "Garajım" }]} />
      <PageHeader
        className="mt-4"
        title="Garajım"
        description="Araçlarını kaydet, birini seç; katalogda bu araç için uyumluluk bilgisi gösterilir."
      />

      <div className="mt-8 grid gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
        <section aria-labelledby="add-vehicle" className="h-fit rounded-[var(--radius-card)] border border-line p-5">
          <h2 id="add-vehicle" className="text-base font-semibold text-ink">
            Araç ekle
          </h2>
          <p className="mt-1 mb-4 text-sm text-muted">Adımları sırayla seç. Seçenekler bir önceki adıma göre daralır.</p>
          <VehicleSelector layout="stacked" mode="stay" submitLabel="Garaja ekle ve seç" />
        </section>

        <section aria-labelledby="saved-vehicles">
          <h2 id="saved-vehicles" className="text-base font-semibold text-ink">
            Kayıtlı araçlar
          </h2>
          <div className="mt-4">
            {!hydrated ? (
              <LoadingState rows={2} />
            ) : savedVehicles.length === 0 ? (
              <EmptyState
                icon={CarFront}
                title="Garajında araç yok"
                description="Soldaki adımlarla aracını ekle. Kaydettiğin araç, ürün sayfalarında uyumluluğu görmeni sağlar."
              />
            ) : (
              <ul className="space-y-3">
                {savedVehicles.map((v) => {
                  const isSelected = v.id === selected;
                  return (
                    <li
                      key={v.id}
                      className={cn(
                        "flex flex-col gap-3 rounded-[var(--radius-card)] border p-4 sm:flex-row sm:items-center",
                        isSelected ? "border-ink" : "border-line",
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="font-medium text-ink">{vehicleLabel(v)}</p>
                          {isSelected && (
                            <Badge tone="success">
                              <Check className="size-3" aria-hidden="true" /> Seçili
                            </Badge>
                          )}
                        </div>
                        <p className="mt-0.5 text-sm text-muted">
                          {v.body ? `${v.body} · ` : ""}
                          {yearRange(v)} · {confirmedCount(v.id)} doğrulanmış uyumlu parça
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {!isSelected && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => {
                              select(v.id);
                              toast.show(`${vehicleLabel(v)} seçildi.`);
                            }}
                          >
                            Seç
                          </Button>
                        )}
                        <LinkButton
                          href="/products?fit=1"
                          size="sm"
                          variant={isSelected ? "primary" : "secondary"}
                          onClick={() => select(v.id)}
                        >
                          Parçaları gör
                        </LinkButton>
                        <Button variant="ghost" size="sm" onClick={() => setPendingRemove(v)} aria-label={`${vehicleLabel(v)} aracını kaldır`}>
                          <Trash2 className="size-4" aria-hidden="true" />
                        </Button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
          <p className="mt-4 text-xs text-muted">
            Kayıtlı araçlar yalnızca bu tarayıcıda saklanır; başka cihazlarla paylaşılmaz.{" "}
            <Link href="/legal" className="underline underline-offset-2">
              Ayrıntılar
            </Link>
          </p>
        </section>
      </div>

      <ConfirmDialog
        open={pendingRemove !== null}
        title="Araç garajdan kaldırılsın mı?"
        message={pendingRemove ? `${vehicleLabel(pendingRemove)} garajından kaldırılacak.` : ""}
        confirmLabel="Kaldır"
        tone="danger"
        onCancel={() => setPendingRemove(null)}
        onConfirm={() => {
          if (pendingRemove) {
            remove(pendingRemove.id);
            toast.show("Araç garajdan kaldırıldı.", "info");
          }
          setPendingRemove(null);
        }}
      />
    </div>
  );
}
