"use client";

import { CarFront, X } from "lucide-react";
import Link from "next/link";
import { vehicleLabel } from "@/lib/catalog/vehicles";
import { useGarage } from "@/state/garage-store";

/** Slim strip under the header showing the vehicle the catalog is being filtered/labelled for. */
export function VehicleBar() {
  const { selectedVehicle, select } = useGarage();
  return (
    <div className="border-b border-line bg-surface">
      <div className="container-page flex h-10 items-center gap-2 text-sm">
        <CarFront className="size-4 shrink-0 text-muted" aria-hidden="true" />
        {selectedVehicle ? (
          <>
            <span className="hidden text-muted sm:inline">Aracın:</span>
            <span className="min-w-0 truncate font-medium text-ink">{vehicleLabel(selectedVehicle)}</span>
            <Link href="/garage" className="ml-auto shrink-0 font-medium text-ink underline-offset-2 hover:underline">
              Değiştir
            </Link>
            <button
              type="button"
              onClick={() => select(null)}
              className="-mr-1 shrink-0 rounded p-1 text-muted hover:bg-surface-strong hover:text-ink"
              aria-label="Araç seçimini kaldır"
            >
              <X className="size-4" aria-hidden="true" />
            </button>
          </>
        ) : (
          <>
            <span className="truncate text-muted">Aracını seç, uyumlu parçaları gösterelim.</span>
            <Link href="/garage" className="ml-auto shrink-0 font-medium text-ink underline-offset-2 hover:underline">
              Aracını seç
            </Link>
          </>
        )}
      </div>
    </div>
  );
}
