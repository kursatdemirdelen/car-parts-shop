"use client";

import { AlertTriangle, CheckCircle2, Clock, HelpCircle, Trash2, type LucideIcon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { KitCard } from "@/components/product/KitCard";
import { Button } from "@/components/ui/Button";
import { Badge, type BadgeTone } from "@/components/ui/Display";
import { fieldDescribedBy, FormField, Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/format";
import {
  daysBetween,
  ITEM_NAMES,
  isOdometerStale,
  type ItemStatus,
  type MaintenanceStatus,
  usesBmwLongLife,
  validateOdometer,
  validateServiceInput,
} from "@/lib/maintenance";
import { itemCategorySlug, kitsForItem, productsForItem } from "@/lib/maintenance-recommendations";
import type { Product } from "@/lib/types";
import { cartActions } from "@/state/cart-store";
import { useCatalog } from "@/state/catalog-store";
import { maintenanceActions, type VehicleScheduleView } from "@/state/maintenance-store";

const STATUS: Record<MaintenanceStatus, { label: string; icon: LucideIcon; tone: BadgeTone }> = {
  overdue: { label: "Gecikti", icon: AlertTriangle, tone: "danger" },
  soon: { label: "Yaklaşıyor", icon: Clock, tone: "warn" },
  unknown: { label: "Bilinmiyor", icon: HelpCircle, tone: "neutral" },
  ok: { label: "Zamanı var", icon: CheckCircle2, tone: "success" },
};

const kmText = (km: number) => `${new Intl.NumberFormat("tr-TR").format(km)} km`;
/** DD.MM.YYYY from a calendar date, without time-zone shifts. */
const dateText = (date: string) => date.split("-").reverse().join(".");

function summaryText({ overdue, soon, record }: VehicleScheduleView): string {
  if (!record?.log.length) return "Bilgi girilmedi";
  const parts = [overdue ? `${overdue} gecikti` : "", soon ? `${soon} yaklaşıyor` : ""].filter(Boolean);
  return parts.length ? parts.join(", ") : "Bakımlar zamanında";
}

export function MaintenancePanel({ view, today }: { view: VehicleScheduleView; today: string }) {
  const { vehicle, record, items } = view;
  const odometer = record?.odometer ?? null;
  const toast = useToast();
  const [kmInput, setKmInput] = useState("");
  const [kmError, setKmError] = useState<string>();
  // Opens by default when something is due; afterwards only the user opens or closes it.
  const [open, setOpen] = useState(() => view.overdue + view.soon > 0);
  const odoId = `odo-${vehicle.id}`;
  // Newest first; among same-day entries the most recently added comes first.
  const log = [...(record?.log ?? [])]
    .reverse()
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const saveKm = () => {
    const { km, error } = validateOdometer(kmInput);
    setKmError(error);
    if (km === undefined) return;
    maintenanceActions.setOdometer(vehicle.id, km, today);
    setKmInput("");
    toast.show("Km kaydedildi.");
  };

  return (
    <details
      open={open}
      onToggle={(e) => setOpen(e.currentTarget.open)}
      className="rounded-[var(--radius-control)] border border-line bg-surface/40"
    >
      <summary className="cursor-pointer px-3 py-2 text-sm font-medium text-ink">
        Bakım takvimi <span className="font-normal text-muted">· {summaryText(view)}</span>
      </summary>
      <div className="space-y-4 border-t border-line p-3">
        <div>
          <form
            className="flex flex-wrap items-end gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              saveKm();
            }}
          >
            <FormField label="Güncel km" htmlFor={odoId} error={kmError} className="min-w-0 flex-1 basis-40">
              <Input
                id={odoId}
                inputMode="numeric"
                placeholder={odometer ? kmText(odometer.km) : "ör. 98.000"}
                value={kmInput}
                onChange={(e) => setKmInput(e.target.value)}
                aria-invalid={kmError ? true : undefined}
                aria-describedby={fieldDescribedBy(odoId, kmError)}
              />
            </FormField>
            <Button type="submit" variant="secondary">
              Kaydet
            </Button>
          </form>
          {odometer && (
            <p className="mt-1 text-xs text-muted">
              Son güncelleme: {dateText(odometer.updatedAt)} · {kmText(odometer.km)}
            </p>
          )}
          {isOdometerStale(odometer, today) && (
            <p className="mt-1 text-xs text-warn">
              Km bilgisi {Math.round(daysBetween(odometer!.updatedAt, today) / 30)} ay önce girildi, güncelle.
            </p>
          )}
        </div>

        <ul className="divide-y divide-line">
          {items.map((s) => (
            <MaintenanceItemRow
              key={s.item.id}
              status={s}
              vehicleId={vehicle.id}
              currentKm={odometer?.km ?? null}
              today={today}
            />
          ))}
        </ul>

        {log.length > 0 && (
          <div>
            <h3 className="text-sm font-semibold text-ink">Son bakımlar</h3>
            <ul className="mt-2 space-y-1 text-sm">
              {log.map((e) => (
                <li key={e.id} className="flex items-center gap-2">
                  <span className="min-w-0 flex-1 text-ink-soft">
                    {dateText(e.date)} · {ITEM_NAMES[e.itemId]}
                    {e.km !== null && ` · ${kmText(e.km)}`}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    aria-label={`${ITEM_NAMES[e.itemId]} kaydını sil`}
                    onClick={() => maintenanceActions.removeEntry(vehicle.id, e.id)}
                  >
                    <Trash2 className="size-4" aria-hidden="true" />
                  </Button>
                </li>
              ))}
            </ul>
          </div>
        )}

        <p className="text-xs text-muted">
          {usesBmwLongLife(vehicle) && "BMW LongLife örnek aralıkları. "}
          Örnek aralıklardır; aracınızın bakım kılavuzunu kontrol edin.
        </p>
      </div>
    </details>
  );
}

function MaintenanceItemRow({
  status: s,
  vehicleId,
  currentKm,
  today,
}: {
  status: ItemStatus;
  vehicleId: string;
  currentKm: number | null;
  today: string;
}) {
  const toast = useToast();
  const [editing, setEditing] = useState(false);
  const [date, setDate] = useState("");
  const [km, setKm] = useState("");
  const [errors, setErrors] = useState<{ date?: string; km?: string }>({});
  const meta = STATUS[s.status];
  const Icon = meta.icon;
  const dateId = `svc-date-${vehicleId}-${s.item.id}`;
  const kmId = `svc-km-${vehicleId}-${s.item.id}`;

  const save = () => {
    const result = validateServiceInput(date, km, today);
    setErrors(result.errors);
    if (result.date === undefined) return;
    maintenanceActions.logService(vehicleId, s.item.id, result.date, result.km ?? null);
    setEditing(false);
    setDate("");
    setKm("");
    toast.show("Kaydedildi.");
  };

  return (
    <li data-item={s.item.id} className="py-3 first:pt-0 last:pb-0">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-sm font-medium text-ink">{s.item.name}</p>
        <Badge tone={meta.tone}>
          <Icon className="size-3" aria-hidden="true" /> {meta.label}
        </Badge>
        <span className="text-sm text-ink-soft">{s.label}</span>
      </div>
      {s.last && (
        <p className="mt-0.5 text-xs text-muted">
          Son değişim: {dateText(s.last.date)}
          {s.last.km !== null && ` · ${kmText(s.last.km)}`}
        </p>
      )}
      <div className="mt-2 flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="secondary"
          aria-label={`${s.item.name}: bugün yaptım`}
          onClick={() => {
            maintenanceActions.logService(vehicleId, s.item.id, today, currentKm);
            toast.show("Kaydedildi.");
          }}
        >
          Bugün yaptım
        </Button>
        <Button size="sm" variant="ghost" aria-expanded={editing} onClick={() => setEditing((v) => !v)}>
          Son değişimi gir
        </Button>
      </div>

      {editing && (
        <form
          className="mt-2 flex flex-wrap items-start gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
        >
          <FormField label="Tarih" htmlFor={dateId} error={errors.date} className="min-w-0 flex-1 basis-36">
            <Input
              id={dateId}
              type="date"
              max={today}
              value={date}
              onChange={(e) => setDate(e.target.value)}
              aria-invalid={errors.date ? true : undefined}
              aria-describedby={fieldDescribedBy(dateId, errors.date)}
            />
          </FormField>
          <FormField label="Km (isteğe bağlı)" htmlFor={kmId} error={errors.km} className="min-w-0 flex-1 basis-36">
            <Input
              id={kmId}
              inputMode="numeric"
              value={km}
              onChange={(e) => setKm(e.target.value)}
              aria-invalid={errors.km ? true : undefined}
              aria-describedby={fieldDescribedBy(kmId, errors.km)}
            />
          </FormField>
          <Button type="submit" size="sm" className="mt-7">
            Kaydet
          </Button>
        </form>
      )}

      {(s.status === "overdue" || s.status === "soon") && <Recommendations itemStatus={s} vehicleId={vehicleId} />}
    </li>
  );
}

function Recommendations({ itemStatus: s, vehicleId }: { itemStatus: ItemStatus; vehicleId: string }) {
  const catalog = useCatalog();
  const products = productsForItem(s.item.id, vehicleId, catalog);
  const kits = kitsForItem(s.item.id, vehicleId, catalog);

  if (!products.length && !kits.length) {
    return (
      <Link
        href={`/categories/${itemCategorySlug(s.item.id)}`}
        className="mt-2 inline-block text-sm text-ink underline underline-offset-2"
      >
        Aracına doğrulanmış ürün yok — kategoriye göz at
      </Link>
    );
  }

  return (
    <div className="mt-3 space-y-2">
      {products.length > 0 && (
        <ul className="space-y-2">
          {products.map((p) => (
            <RecommendedProduct key={p.id} product={p} />
          ))}
        </ul>
      )}
      {kits.length > 0 && (
        <div>
          <p className="text-xs font-medium text-muted">Bu bakım için set</p>
          <div className="mt-1 space-y-2">
            {kits.map((k) => (
              <KitCard key={k.id} kit={k} vehicleId={vehicleId} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendedProduct({ product }: { product: Product }) {
  const toast = useToast();
  const inStock = product.stock > 0;
  return (
    <li className="flex flex-wrap items-center gap-2 rounded-[var(--radius-control)] border border-line bg-white p-2">
      <Link href={`/products/${product.slug}`} className="min-w-0 flex-1 basis-48 text-sm text-ink hover:underline">
        {product.name}
      </Link>
      <span className="text-sm font-medium text-ink">{formatPrice(product.price)}</span>
      <Button
        size="sm"
        disabled={!inStock}
        onClick={() => {
          if (cartActions.add(product.id, 1))
            toast.show("Ürün sepete eklendi.", "success", {
              label: "Sepete git",
              href: "/cart",
            });
          else toast.show("Bu ürün şu an sepete eklenemiyor.", "error");
        }}
      >
        {inStock ? "Sepete ekle" : "Stokta yok"}
      </Button>
    </li>
  );
}
