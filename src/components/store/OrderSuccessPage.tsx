"use client";

import { CheckCircle2, FileQuestion } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState, LoadingState } from "@/components/ui/Display";
import { formatDateTime, formatPrice } from "@/lib/format";
import { PAYMENT_METHOD_LABELS } from "@/lib/types";
import { useCatalog } from "@/state/catalog-store";

export function OrderSuccessPage({ reference }: { reference: string }) {
  const { orders, hydrated } = useCatalog();
  const order = orders.find((o) => o.reference === reference);

  if (!order) {
    if (!hydrated) {
      return (
        <div className="container-page py-10">
          <LoadingState rows={3} />
        </div>
      );
    }
    return (
      <div className="container-page py-16">
        <EmptyState
          icon={FileQuestion}
          title="Sipariş bulunamadı"
          description="Bu sipariş numarasıyla bu tarayıcıda kayıtlı bir demo sipariş yok."
          action={<LinkButton href="/">Ana sayfaya dön</LinkButton>}
        />
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-10 md:py-14">
      <div className="text-center">
        <CheckCircle2 className="mx-auto size-12 text-success" aria-hidden="true" />
        <h1 className="mt-4 text-2xl font-semibold tracking-tight text-ink md:text-3xl">Demo siparişin oluşturuldu</h1>
        <p className="mt-2 text-sm text-muted">
          Bu sipariş yalnızca bu tarayıcıda kayıtlıdır; gerçek bir sipariş işlenmemiş ve ödeme alınmamıştır.
        </p>
        <div className="mx-auto mt-6 inline-flex flex-col rounded-[var(--radius-card)] border border-line bg-surface px-6 py-4">
          <span className="text-xs text-muted">Demo sipariş numarası</span>
          <span className="mt-1 text-xl font-semibold tracking-wide text-ink tabular">{order.reference}</span>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-[minmax(0,1fr)_260px]">
        <section aria-labelledby="order-items" className="rounded-[var(--radius-card)] border border-line">
          <h2 id="order-items" className="border-b border-line px-5 py-3 text-sm font-semibold text-ink">
            Ürünler
          </h2>
          <ul className="divide-y divide-line">
            {order.items.map((i) => (
              <li key={i.productId} className="flex justify-between gap-4 px-5 py-3 text-sm">
                <span className="min-w-0">
                  <span className="block text-ink">{i.name}</span>
                  <span className="text-xs text-muted tabular">
                    {i.sku} · {i.quantity} × {formatPrice(i.unitPrice)}
                  </span>
                </span>
                <span className="shrink-0 text-ink tabular">{formatPrice(i.unitPrice * i.quantity)}</span>
              </li>
            ))}
          </ul>
          <dl className="space-y-1.5 border-t border-line px-5 py-4 text-sm">
            <div className="flex justify-between">
              <dt className="text-muted">Ara toplam</dt>
              <dd className="tabular">{formatPrice(order.subtotal)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-muted">Kargo</dt>
              <dd className="tabular">{order.shipping === 0 ? "Ücretsiz" : formatPrice(order.shipping)}</dd>
            </div>
            <div className="flex justify-between pt-1 text-base font-semibold">
              <dt>Toplam</dt>
              <dd className="tabular">{formatPrice(order.total)}</dd>
            </div>
          </dl>
        </section>

        <aside className="space-y-4 text-sm">
          <div className="rounded-[var(--radius-card)] border border-line p-4">
            <h2 className="font-semibold text-ink">Teslimat</h2>
            <address className="mt-2 text-muted not-italic">
              {order.address.fullName}
              <br />
              {order.address.line}
              <br />
              {order.address.district} / {order.address.city} {order.address.postalCode}
              <br />
              {order.address.phone}
            </address>
          </div>
          <div className="rounded-[var(--radius-card)] border border-line p-4">
            <h2 className="font-semibold text-ink">Ödeme</h2>
            <p className="mt-2 text-muted">{PAYMENT_METHOD_LABELS[order.paymentMethod]}</p>
            <p className="mt-1 text-xs text-subtle">{formatDateTime(order.createdAt)}</p>
          </div>
        </aside>
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        <LinkButton href="/products">Alışverişe devam et</LinkButton>
        <LinkButton href="/" variant="secondary">
          Ana sayfa
        </LinkButton>
      </div>
    </div>
  );
}
