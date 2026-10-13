"use client";

import { CheckCircle2, ClipboardList, Clock, FolderTree, Package, XCircle } from "lucide-react";
import Link from "next/link";
import { StockStatus } from "@/components/product/ProductBits";
import { Badge, PageHeader, type BadgeTone } from "@/components/ui/Display";
import { stockState } from "@/lib/catalog/stock";
import { formatDate, formatPrice } from "@/lib/format";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";
import { useCatalog } from "@/state/catalog-store";
import { Panel, SummaryCard } from "./AdminUi";

export const ORDER_STATUS_TONES: Record<OrderStatus, BadgeTone> = {
  received: "neutral",
  preparing: "warn",
  shipped: "neutral",
  delivered: "success",
  cancelled: "danger",
};

export function Dashboard() {
  const { products, categories, brands, orders, settings } = useCatalog();
  const low = settings.lowStockThreshold;
  const lowStock = products.filter((p) => stockState(p.stock, low) === "low_stock");
  const outOfStock = products.filter((p) => p.stock <= 0);
  const recentOrders = [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 5);
  const attention = [...outOfStock, ...lowStock].slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader title="Gösterge paneli" description="Gösterilen değerler bu tarayıcıdaki demo verilerinden hesaplanır; gerçek işletme verisi değildir." />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        <SummaryCard label="Toplam ürün" value={products.length} href="/admin/products" icon={Package} />
        <SummaryCard label="Yayında" value={products.filter((p) => p.status === "published").length} href="/admin/products?status=published" icon={CheckCircle2} tone="success" />
        <SummaryCard label="Az stoklu" value={lowStock.length} hint={`1–${low} adet`} href="/admin/products?stock=low" icon={Clock} tone="warn" />
        <SummaryCard label="Tükenen" value={outOfStock.length} href="/admin/products?stock=out" icon={XCircle} tone="danger" />
        <SummaryCard label="Kategori / Marka" value={`${categories.length} / ${brands.length}`} href="/admin/categories" icon={FolderTree} tone="oem" />
        <SummaryCard label="Demo sipariş" value={orders.length} href="/admin/orders" icon={ClipboardList} tone="perf" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="Son demo siparişler" actions={<Link href="/admin/orders" className="text-sm font-medium text-ink hover:underline underline-offset-2">Tümü</Link>}>
          {recentOrders.length === 0 ? (
            <p className="text-sm text-muted">Henüz demo sipariş yok.</p>
          ) : (
            <ul className="-my-2 divide-y divide-line">
              {recentOrders.map((o) => (
                <li key={o.id} className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-sm">
                  <span className="min-w-0">
                    <Link href={`/admin/orders?order=${o.id}`} className="font-medium text-ink tabular hover:underline underline-offset-2">
                      {o.reference}
                    </Link>
                    <span className="block text-xs text-muted">
                      {formatDate(o.createdAt)} · {o.address.fullName}
                    </span>
                  </span>
                  <span className="flex items-center gap-3">
                    <span className="tabular">{formatPrice(o.total)}</span>
                    <Badge tone={ORDER_STATUS_TONES[o.status]}>{ORDER_STATUS_LABELS[o.status]}</Badge>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <Panel title="Stok takibi gereken ürünler" actions={<Link href="/admin/products?stock=low" className="text-sm font-medium text-ink hover:underline underline-offset-2">Tümü</Link>}>
          {attention.length === 0 ? (
            <p className="text-sm text-muted">Tüm ürünlerin stoğu yeterli.</p>
          ) : (
            <ul className="-my-2 divide-y divide-line">
              {attention.map((p) => (
                <li key={p.id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                  <span className="min-w-0">
                    <Link href={`/admin/products/${p.id}/edit`} className="block truncate font-medium text-ink hover:underline underline-offset-2">
                      {p.name}
                    </Link>
                    <span className="text-xs text-muted tabular">{p.sku}</span>
                  </span>
                  <StockStatus stock={p.stock} lowThreshold={low} />
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}
