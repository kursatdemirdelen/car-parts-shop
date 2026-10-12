"use client";

import { Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { FitmentBadge } from "@/components/product/ProductBits";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Field";
import { vehicleLabel } from "@/lib/catalog/vehicles";
import type { CompatibilityStatus, ID, Vehicle } from "@/lib/types";

export interface CompatibilityRow {
  vehicleId: ID;
  status: CompatibilityStatus;
}

export const COMPATIBILITY_STATUS_OPTIONS: { value: CompatibilityStatus; label: string }[] = [
  { value: "confirmed", label: "Doğrulanmış uyum" },
  { value: "unverified", label: "Doğrulanmamış" },
  { value: "incompatible", label: "Uyumsuz" },
];

/** Vehicle <select> grouped by make; vehicles in `exclude` are left out. */
export function VehicleSelect({
  vehicles,
  value,
  onChange,
  exclude = [],
  id,
  placeholder = "Araç seç",
}: {
  vehicles: Vehicle[];
  value: string;
  onChange: (id: string) => void;
  exclude?: string[];
  id?: string;
  placeholder?: string;
}) {
  const makes = [...new Set(vehicles.map((v) => v.make))].sort((a, b) => a.localeCompare(b, "tr"));
  return (
    <Select id={id} value={value} onChange={(e) => onChange(e.target.value)} aria-label={id ? undefined : "Araç"}>
      <option value="">{placeholder}</option>
      {makes.map((make) => (
        <optgroup key={make} label={make}>
          {vehicles
            .filter((v) => v.make === make && !exclude.includes(v.id))
            .map((v) => (
              <option key={v.id} value={v.id}>
                {vehicleLabel(v).replace(`${make} `, "")} ({v.yearFrom}–{v.yearTo ?? ""})
              </option>
            ))}
        </optgroup>
      ))}
    </Select>
  );
}

/**
 * Edits explicit product ↔ vehicle records. A vehicle without a row is "unknown" — never a fit.
 */
export function CompatibilityEditor({
  vehicles,
  value,
  onChange,
  disabled,
}: {
  vehicles: Vehicle[];
  value: CompatibilityRow[];
  onChange: (rows: CompatibilityRow[]) => void;
  disabled?: boolean;
}) {
  const [newVehicle, setNewVehicle] = useState("");
  const [newStatus, setNewStatus] = useState<CompatibilityStatus>("confirmed");
  const byId = new Map(vehicles.map((v) => [v.id, v]));

  if (disabled) {
    return (
      <p className="rounded-[var(--radius-control)] border border-line bg-surface px-3 py-2.5 text-sm text-muted">
        “Araca bağlı değil” olarak işaretlenen ürünler uyumluluk kaydı taşımaz. Mağazada “Araca bağlı değil” olarak gösterilir.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {value.length === 0 ? (
        <p className="text-sm text-muted">Kayıt yok. Bu durumda ürün tüm araçlar için “Doğrulanmamış” görünür.</p>
      ) : (
        <ul className="divide-y divide-line rounded-[var(--radius-control)] border border-line">
          {value.map((row) => {
            const v = byId.get(row.vehicleId);
            return (
              <li key={row.vehicleId} className="flex flex-col gap-2 px-3 py-2.5 sm:flex-row sm:items-center">
                <span className="min-w-0 flex-1 text-sm text-ink">{v ? vehicleLabel(v) : "Silinmiş araç"}</span>
                <div className="flex items-center gap-2">
                  <Select
                    aria-label={`${v ? vehicleLabel(v) : "Araç"} uyumluluk durumu`}
                    value={row.status}
                    onChange={(e) =>
                      onChange(value.map((r) => (r.vehicleId === row.vehicleId ? { ...r, status: e.target.value as CompatibilityStatus } : r)))
                    }
                    className="h-9 w-48"
                  >
                    {COMPATIBILITY_STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onChange(value.filter((r) => r.vehicleId !== row.vehicleId))}
                    aria-label={`${v ? vehicleLabel(v) : "Araç"} kaydını kaldır`}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <div className="flex flex-col gap-2 rounded-[var(--radius-control)] bg-surface p-3 sm:flex-row sm:items-center">
        <div className="min-w-0 flex-1">
          <VehicleSelect vehicles={vehicles} value={newVehicle} onChange={setNewVehicle} exclude={value.map((r) => r.vehicleId)} placeholder="Kayıt eklenecek aracı seç" />
        </div>
        <Select aria-label="Yeni kaydın durumu" value={newStatus} onChange={(e) => setNewStatus(e.target.value as CompatibilityStatus)} className="sm:w-48">
          {COMPATIBILITY_STATUS_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </Select>
        <Button
          variant="secondary"
          disabled={!newVehicle}
          onClick={() => {
            onChange([...value, { vehicleId: newVehicle, status: newStatus }]);
            setNewVehicle("");
          }}
        >
          <Plus className="size-4" aria-hidden="true" />
          Ekle
        </Button>
      </div>
      <p className="flex flex-wrap items-center gap-1.5 text-xs text-muted">
        Durumlar mağazada şöyle görünür: <FitmentBadge state="confirmed" /> <FitmentBadge state="unverified" /> <FitmentBadge state="incompatible" />
      </p>
    </div>
  );
}
