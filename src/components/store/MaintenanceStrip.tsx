"use client";

import { Wrench } from "lucide-react";
import Link from "next/link";
import { vehicleShortLabel } from "@/lib/catalog/vehicles";
import { useGarage } from "@/state/garage-store";
import { useGarageSchedules } from "@/state/maintenance-store";

/** Home-page reminder for the selected vehicle. Renders nothing until hydrated or when everything is on time. */
export function MaintenanceStrip() {
  const { selected } = useGarage();
  const { schedules } = useGarageSchedules();
  const view = schedules.find((s) => s.vehicle.id === selected);
  if (!view) return null;

  const label = vehicleShortLabel(view.vehicle);
  let text: string;
  if (!view.record?.log.length) text = `${label}: bakım takvimini başlat`;
  else if (view.overdue + view.soon > 0)
    text = `${label}: ${[view.overdue ? `${view.overdue} bakım gecikti` : "", view.soon ? `${view.soon} bakım yaklaşıyor` : ""]
      .filter(Boolean)
      .join(", ")}`;
  else return null;

  return (
    <div className="container-page mt-4">
      <div
        role="status"
        className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3 text-sm"
      >
        <Wrench className="size-4 text-muted" aria-hidden="true" />
        <span className="min-w-0 flex-1 text-ink">{text}</span>
        <Link href="/garage" className="font-medium text-ink underline underline-offset-2">
          Garajda gör
        </Link>
      </div>
    </div>
  );
}
