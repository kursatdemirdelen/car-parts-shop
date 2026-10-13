"use client";

import { ClipboardList } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { DemoNotice, EmptyState, PageHeader } from "@/components/ui/Display";
import { Drawer } from "@/components/ui/Dialog";
import { Tag } from "@/components/ui/Tag";
import { orderStatusTag } from "@/lib/tags";
import { FormField, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, PAYMENT_METHOD_LABELS, type Order, type OrderStatus } from "@/lib/types";
import { catalogActions, useCatalog } from "@/state/catalog-store";
import { DataTable, type Column } from "./AdminUi";

const statuses = Object.keys(ORDER_STATUS_LABELS) as OrderStatus[];

export function OrdersAdmin({ initialOrderId }: { initialOrderId?: string }) {
  const { orders } = useCatalog();
  const toast = useToast();
  const [filter, setFilter] = useState<OrderStatus | "">("");
  const [openId, setOpenId] = useState<string | null>(initialOrderId ?? null);

  const rows = [...orders].filter((o) => !filter || o.status === filter).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const open = orders.find((o) => o.id === openId) ?? null;

  const columns: Column<Order>[] = [
    {
      key: "reference",
      header: "Sipariş no",
      primary: true,
      cell: (o) => (
        <button type="button" onClick={() => setOpenId(o.id)} className="font-medium text-ink tabular hover:underline underline-offset-2">
          {o.reference}
        </button>
      ),
    },
    { key: "date", header: "Tarih", cell: (o) => <span className="whitespace-nowrap">{formatDate(o.createdAt)}</span> },
    { key: "customer", header: "Müşteri", cell: (o) => o.address.fullName },
    { key: "items", header: "Adet", className: "text-right", cell: (o) => <span className="tabular">{o.items.reduce((s, i) => s + i.quantity, 0)}</span> },
    { key: "total", header: "Toplam", className: "text-right", cell: (o) => <span className="whitespace-nowrap tabular">{formatPrice(o.total)}</span> },
    { key: "status", header: "Durum", cell: (o) => <Tag spec={orderStatusTag(o.status)} /> },
    {
      key: "actions",
      header: "",
      className: "text-right",
      cell: (o) => (
        <Button variant="secondary" size="sm" onClick={() => setOpenId(o.id)}>
          Detay
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader title="Siparişler" description="Mağazadaki demo ödeme akışıyla oluşturulan kayıtlar." />
      <DemoNotice>Bunlar demo siparişlerdir; gerçek ödeme alınmamış, ürün gönderilmemiştir. Durum değişiklikleri yalnızca bu tarayıcıda saklanır.</DemoNotice>
      <div className="flex items-center gap-3">
        <label htmlFor="order-filter" className="text-sm text-muted">
          Durum
        </label>
        <Select id="order-filter" value={filter} onChange={(e) => setFilter(e.target.value as OrderStatus | "")} className="w-52">
          <option value="">Tümü</option>
          {statuses.map((s) => (
            <option key={s} value={s}>
              {ORDER_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>
      <DataTable
        caption="Demo siparişler"
        columns={columns}
        rows={rows}
        rowKey={(o) => o.id}
        empty={<EmptyState icon={ClipboardList} title={filter ? "Bu durumda sipariş yok" : "Henüz demo sipariş yok"} />}
      />

      <Drawer open={open !== null} onClose={() => setOpenId(null)} title={open ? `Sipariş ${open.reference}` : "Sipariş"} className="w-[min(30rem,calc(100%-2.5rem))]">
        {open && (
          <div className="space-y-6 text-sm">
            <div className="flex flex-wrap items-center justify-between gap-2 text-muted">
              <span>{formatDateTime(open.createdAt)}</span>
              <span>{PAYMENT_METHOD_LABELS[open.paymentMethod]}</span>
            </div>

            <FormField label="Sipariş durumu" htmlFor="order-status" hint="Demo durum takibi; müşteriye bildirim gönderilmez.">
              <Select
                id="order-status"
                value={open.status}
                aria-describedby="order-status-hint"
                onChange={(e) => {
                  const status = e.target.value as OrderStatus;
                  catalogActions.updateOrderStatus(open.id, status);
                  toast.show(`Durum “${ORDER_STATUS_LABELS[status]}” olarak güncellendi.`);
                }}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {ORDER_STATUS_LABELS[s]}
                  </option>
                ))}
              </Select>
            </FormField>

            <section>
              <h3 className="mb-2 font-semibold text-ink">Ürünler</h3>
              <ul className="divide-y divide-line rounded-[var(--radius-control)] border border-line">
                {open.items.map((i) => (
                  <li key={i.productId} className="flex justify-between gap-3 px-3 py-2.5">
                    <span className="min-w-0">
                      <span className="block text-ink">{i.name}</span>
                      <span className="text-xs text-muted tabular">
                        {i.sku} · {i.quantity} × {formatPrice(i.unitPrice)}
                      </span>
                    </span>
                    <span className="shrink-0 tabular">{formatPrice(i.unitPrice * i.quantity)}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-1.5 text-xs text-muted">Ürün adı ve fiyatları sipariş anındaki kayıttır; sonraki ürün değişiklikleri etkilemez.</p>
            </section>

            <dl className="space-y-1.5">
              <div className="flex justify-between">
                <dt className="text-muted">Ara toplam</dt>
                <dd className="tabular">{formatPrice(open.subtotal)}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-muted">Kargo</dt>
                <dd className="tabular">{open.shipping === 0 ? "Ücretsiz" : formatPrice(open.shipping)}</dd>
              </div>
              <div className="flex justify-between font-semibold">
                <dt>Toplam</dt>
                <dd className="tabular">{formatPrice(open.total)}</dd>
              </div>
            </dl>

            <section>
              <h3 className="mb-2 font-semibold text-ink">Teslimat</h3>
              <address className="text-ink-soft not-italic">
                {open.address.fullName}
                <br />
                {open.address.line}
                <br />
                {open.address.district} / {open.address.city} {open.address.postalCode}
                <br />
                {open.address.phone} · {open.address.email}
              </address>
              {open.note && <p className="mt-2 rounded-[var(--radius-control)] bg-surface p-2.5 text-ink-soft">Not: {open.note}</p>}
            </section>
          </div>
        )}
      </Drawer>
    </div>
  );
}
