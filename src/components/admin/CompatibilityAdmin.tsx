"use client";

import { Link2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { FitmentBadge } from "@/components/product/ProductBits";
import { EmptyState, PageHeader } from "@/components/ui/Display";
import { Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { vehicleLabel } from "@/lib/catalog/vehicles";
import { cn } from "@/lib/format";
import type { CompatibilityStatus } from "@/lib/types";
import { catalogActions, useCatalog } from "@/state/catalog-store";
import { Panel } from "./AdminUi";
import { COMPATIBILITY_STATUS_OPTIONS, CompatibilityEditor, VehicleSelect } from "./CompatibilityEditor";

export function CompatibilityAdmin() {
  const { products, vehicles, compatibility } = useCatalog();
  const toast = useToast();
  const [view, setView] = useState<"product" | "vehicle">("product");
  const [productId, setProductId] = useState("");
  const [vehicleId, setVehicleId] = useState("");

  const specific = products.filter((p) => p.fitmentType === "vehicle-specific").sort((a, b) => a.name.localeCompare(b.name, "tr"));
  const product = products.find((p) => p.id === productId);
  const rows = compatibility.filter((r) => r.productId === productId).map((r) => ({ vehicleId: r.vehicleId, status: r.status }));

  const setStatus = (pid: string, vid: string, status: CompatibilityStatus | null) => {
    catalogActions.setCompatibility(pid, vid, status);
    toast.show(status ? "Uyumluluk kaydı kaydedildi." : "Kayıt kaldırıldı; uyumluluk artık bilinmiyor.", status ? "success" : "info");
  };

  const vehicle = vehicles.find((v) => v.id === vehicleId);
  const vehicleRecords = compatibility.filter((r) => r.vehicleId === vehicleId);

  return (
    <div className="space-y-5">
      <PageHeader title="Uyumluluk" description="Ürün ile araç arasındaki açık kayıtları yönet. Kayıt yoksa uyumluluk bilinmiyor kabul edilir." />

      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
        <FitmentBadge state="confirmed" /> açık kayıtla doğrulanmış
        <FitmentBadge state="unverified" /> kayıt var ama doğrulanmamış (veya kayıt yok)
        <FitmentBadge state="incompatible" /> açık kayıtla uyumsuz
      </div>

      <div role="group" aria-label="Görünüm" className="inline-flex rounded-[var(--radius-control)] border border-line bg-white p-1">
        {(
          [
            ["product", "Ürüne göre"],
            ["vehicle", "Araca göre"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            aria-pressed={view === value}
            onClick={() => setView(value)}
            className={cn("rounded-md px-3 py-1.5 text-sm font-medium", view === value ? "bg-ink text-white" : "text-ink-soft hover:text-ink")}
          >
            {label}
          </button>
        ))}
      </div>

      {view === "product" ? (
        <Panel title="Ürüne göre kayıtlar" description="Yalnızca “araca özel” ürünler listelenir.">
          <label htmlFor="compat-product" className="mb-1.5 block text-sm font-medium text-ink">
            Ürün
          </label>
          <Select id="compat-product" value={productId} onChange={(e) => setProductId(e.target.value)} className="max-w-xl">
            <option value="">Ürün seç</option>
            {specific.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {p.sku}
                {p.status === "draft" ? " (taslak)" : ""}
              </option>
            ))}
          </Select>
          <div className="mt-5">
            {product ? (
              <CompatibilityEditor
                vehicles={vehicles}
                value={rows}
                onChange={(next) => {
                  const before = new Map(rows.map((r) => [r.vehicleId, r.status]));
                  const after = new Map(next.map((r) => [r.vehicleId, r.status]));
                  for (const [vid] of before) if (!after.has(vid)) setStatus(product.id, vid, null);
                  for (const [vid, status] of after) if (before.get(vid) !== status) setStatus(product.id, vid, status);
                }}
              />
            ) : (
              <EmptyState icon={Link2} title="Bir ürün seç" description="Seçtiğin ürünün araç kayıtlarını burada ekleyip düzenleyebilirsin." />
            )}
          </div>
        </Panel>
      ) : (
        <Panel title="Araca göre kayıtlar">
          <label htmlFor="compat-vehicle" className="mb-1.5 block text-sm font-medium text-ink">
            Araç
          </label>
          <div className="max-w-xl">
            <VehicleSelect id="compat-vehicle" vehicles={vehicles} value={vehicleId} onChange={setVehicleId} />
          </div>
          <div className="mt-5">
            {!vehicle ? (
              <EmptyState icon={Link2} title="Bir araç seç" description="Seçtiğin araç için kayıtlı tüm ürünleri görürsün." />
            ) : vehicleRecords.length === 0 ? (
              <p className="text-sm text-muted">{vehicleLabel(vehicle)} için kayıt yok. Kayıt eklemek için “Ürüne göre” görünümünü kullan.</p>
            ) : (
              <ul className="divide-y divide-line rounded-[var(--radius-control)] border border-line">
                {vehicleRecords.map((r) => {
                  const p = products.find((x) => x.id === r.productId);
                  if (!p) return null;
                  return (
                    <li key={r.id} className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center">
                      <span className="min-w-0 flex-1 text-sm">
                        <Link href={`/admin/products/${p.id}/edit`} className="text-ink hover:underline underline-offset-2">
                          {p.name}
                        </Link>
                        <span className="block text-xs text-muted tabular">{p.sku}</span>
                      </span>
                      <Select
                        aria-label={`${p.name} uyumluluk durumu`}
                        value={r.status}
                        onChange={(e) => setStatus(p.id, vehicle.id, e.target.value as CompatibilityStatus)}
                        className="h-9 sm:w-48"
                      >
                        {COMPATIBILITY_STATUS_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                      <button
                        type="button"
                        onClick={() => setStatus(p.id, vehicle.id, null)}
                        className="text-xs font-medium text-muted underline underline-offset-2 hover:text-danger"
                      >
                        Kaydı kaldır
                      </button>
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </Panel>
      )}
    </div>
  );
}
