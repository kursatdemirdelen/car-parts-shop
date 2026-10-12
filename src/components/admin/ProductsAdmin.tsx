"use client";

import { Eye, PackageSearch, Pencil, Plus, Search, Trash2 } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ProductImage, StockStatus } from "@/components/product/ProductBits";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge, EmptyState, PageHeader } from "@/components/ui/Display";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { Input, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { normalizeCode, normalizeText } from "@/lib/catalog/search";
import { stockState } from "@/lib/catalog/stock";
import { formatDate, formatPrice } from "@/lib/format";
import type { Product } from "@/lib/types";
import { catalogActions, useCatalog } from "@/state/catalog-store";
import { DataTable, type Column, type SortState } from "./AdminUi";

const SORT_KEYS = ["name", "price", "stock", "updatedAt"] as const;

export function ProductsAdmin({ query }: { query: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const toast = useToast();
  const { products, categories, brands, settings, compatibility } = useCatalog();
  const params = useMemo(() => new URLSearchParams(query), [query]);
  const [pendingDelete, setPendingDelete] = useState<Product | null>(null);
  const [search, setSearch] = useState(params.get("q") ?? "");

  const filters = {
    q: params.get("q") ?? "",
    category: params.get("category") ?? "",
    brand: params.get("brand") ?? "",
    status: params.get("status") ?? "",
    stock: params.get("stock") ?? "",
  };
  const sortKey = SORT_KEYS.includes(params.get("sort") as (typeof SORT_KEYS)[number]) ? params.get("sort")! : "updatedAt";
  const dirParam = params.get("dir");
  const sort: SortState = {
    key: sortKey,
    dir: dirParam === "asc" || dirParam === "desc" ? dirParam : sortKey === "updatedAt" ? "desc" : "asc",
  };

  const setParams = (patch: Record<string, string>) => {
    const next = new URLSearchParams(params);
    for (const [k, v] of Object.entries(patch)) {
      if (v) next.set(k, v);
      else next.delete(k);
    }
    const qs = next.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  };

  const brandName = useMemo(() => new Map(brands.map((b) => [b.id, b.name])), [brands]);
  const categoryName = useMemo(() => new Map(categories.map((c) => [c.id, c.name])), [categories]);
  const subcategories = categories.filter((c) => c.parentId !== null);

  const rows = useMemo(() => {
    const text = normalizeText(filters.q);
    const code = normalizeCode(filters.q);
    const list = products.filter((p) => {
      if (text) {
        const nameHit = normalizeText(p.name).includes(text);
        const codeHit = code.length >= 2 && [p.sku, ...p.oemNumbers].some((c) => normalizeCode(c).includes(code));
        if (!nameHit && !codeHit) return false;
      }
      if (filters.category) {
        const ids = new Set([filters.category, ...categories.filter((c) => c.parentId === filters.category).map((c) => c.id)]);
        if (!ids.has(p.categoryId)) return false;
      }
      if (filters.brand && p.brandId !== filters.brand) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.stock) {
        const s = stockState(p.stock, settings.lowStockThreshold);
        if (filters.stock === "low" && s !== "low_stock") return false;
        if (filters.stock === "out" && s !== "out_of_stock") return false;
        if (filters.stock === "in" && s !== "in_stock") return false;
      }
      return true;
    });
    const dir = sort.dir === "asc" ? 1 : -1;
    return list.sort((a, b) => {
      switch (sort.key) {
        case "price":
          return (a.price - b.price) * dir;
        case "stock":
          return (a.stock - b.stock) * dir;
        case "name":
          return a.name.localeCompare(b.name, "tr") * dir;
        default:
          return a.updatedAt.localeCompare(b.updatedAt) * dir;
      }
    });
  }, [products, categories, filters.q, filters.category, filters.brand, filters.status, filters.stock, settings.lowStockThreshold, sort.key, sort.dir]);

  const activeFilters = Object.values(filters).some(Boolean);

  const columns: Column<Product>[] = [
    {
      key: "name",
      header: "Ürün",
      sortable: true,
      primary: true,
      cell: (p) => (
        <div className="flex min-w-0 items-center gap-3">
          <span className="w-10 shrink-0 overflow-hidden rounded-md border border-line">
            <ProductImage image={p.images[0]} sizes="40px" />
          </span>
          <span className="min-w-0">
            <Link href={`/admin/products/${p.id}/edit`} className="block font-medium text-ink hover:underline underline-offset-2 md:max-w-64 md:truncate" title={p.name}>
              {p.name}
            </Link>
            <span className="block text-xs text-muted tabular">
              {p.sku}
              {p.oemNumbers[0] ? ` · OEM ${p.oemNumbers[0]}` : ""}
            </span>
          </span>
        </div>
      ),
    },
    { key: "brand", header: "Marka", cell: (p) => brandName.get(p.brandId) ?? "—" },
    { key: "category", header: "Kategori", className: "hidden 2xl:table-cell", cell: (p) => categoryName.get(p.categoryId) ?? "—", hideOnMobile: true },
    { key: "price", header: "Fiyat", sortable: true, className: "text-right whitespace-nowrap", cell: (p) => <span className="tabular">{formatPrice(p.price)}</span> },
    {
      key: "stock",
      header: "Stok",
      sortable: true,
      cell: (p) => (
        <span className="flex flex-col">
          <span className="tabular">{p.stock}</span>
          <StockStatus stock={p.stock} lowThreshold={settings.lowStockThreshold} />
        </span>
      ),
    },
    {
      key: "status",
      header: "Durum",
      cell: (p) => <Badge tone={p.status === "published" ? "success" : "neutral"}>{p.status === "published" ? "Yayında" : "Taslak"}</Badge>,
    },
    { key: "updatedAt", header: "Güncelleme", sortable: true, hideOnMobile: true, className: "hidden 2xl:table-cell", cell: (p) => <span className="whitespace-nowrap text-muted">{formatDate(p.updatedAt)}</span> },
    {
      key: "actions",
      header: "İşlemler",
      className: "text-right",
      cell: (p) => (
        <div className="flex justify-end gap-1">
          <LinkButton href={`/admin/products/${p.id}/edit`} variant="ghost" size="sm" aria-label={`${p.name} düzenle`}>
            <Pencil className="size-4" aria-hidden="true" />
            <span className="md:sr-only">Düzenle</span>
          </LinkButton>
          {p.status === "published" && (
            <LinkButton href={`/products/${p.slug}`} variant="ghost" size="sm" aria-label={`${p.name} mağazada görüntüle`} target="_blank">
              <Eye className="size-4" aria-hidden="true" />
              <span className="md:sr-only">Görüntüle</span>
            </LinkButton>
          )}
          <Button variant="ghost" size="sm" onClick={() => setPendingDelete(p)} aria-label={`${p.name} sil`} className="text-danger hover:bg-danger-soft">
            <Trash2 className="size-4" aria-hidden="true" />
            <span className="md:sr-only">Sil</span>
          </Button>
        </div>
      ),
    },
  ];

  const pendingCompat = pendingDelete ? compatibility.filter((r) => r.productId === pendingDelete.id).length : 0;

  return (
    <div className="space-y-5">
      <PageHeader
        title="Ürünler"
        description={`${products.length} ürün. Stok bu listeden ve ürün formundan yönetilir.`}
        actions={
          <LinkButton href="/admin/products/new">
            <Plus className="size-4" aria-hidden="true" />
            Yeni ürün
          </LinkButton>
        }
      />

      <div className="grid gap-2 rounded-[var(--radius-card)] border border-line bg-white p-3 sm:grid-cols-2 lg:grid-cols-[minmax(0,2fr)_repeat(4,minmax(0,1fr))]">
        <form
          role="search"
          className="relative"
          onSubmit={(e) => {
            e.preventDefault();
            setParams({ q: search.trim() });
          }}
        >
          <label htmlFor="admin-product-search" className="sr-only">
            Ürün adı, stok kodu veya OEM ara
          </label>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <Input
            id="admin-product-search"
            type="search"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              if (e.target.value === "") setParams({ q: "" });
            }}
            onBlur={() => setParams({ q: search.trim() })}
            placeholder="Ad, stok kodu veya OEM ara"
            className="pl-9"
          />
        </form>
        <Select aria-label="Kategori" value={filters.category} onChange={(e) => setParams({ category: e.target.value })}>
          <option value="">Tüm kategoriler</option>
          {categories
            .filter((c) => c.parentId === null)
            .map((root) => (
              <optgroup key={root.id} label={root.name}>
                <option value={root.id}>{root.name} (tümü)</option>
                {subcategories
                  .filter((c) => c.parentId === root.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </optgroup>
            ))}
        </Select>
        <Select aria-label="Marka" value={filters.brand} onChange={(e) => setParams({ brand: e.target.value })}>
          <option value="">Tüm markalar</option>
          {[...brands]
            .sort((a, b) => a.name.localeCompare(b.name, "tr"))
            .map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
        </Select>
        <Select aria-label="Yayın durumu" value={filters.status} onChange={(e) => setParams({ status: e.target.value })}>
          <option value="">Tüm durumlar</option>
          <option value="published">Yayında</option>
          <option value="draft">Taslak</option>
        </Select>
        <Select aria-label="Stok durumu" value={filters.stock} onChange={(e) => setParams({ stock: e.target.value })}>
          <option value="">Tüm stok durumları</option>
          <option value="in">Stokta</option>
          <option value="low">Az stoklu (1–{settings.lowStockThreshold})</option>
          <option value="out">Tükendi</option>
        </Select>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <p className="text-muted" aria-live="polite">
          <span className="font-semibold text-ink tabular">{rows.length}</span> sonuç
        </p>
        {activeFilters && (
          <button
            type="button"
            onClick={() => {
              setSearch("");
              setParams({ q: "", category: "", brand: "", status: "", stock: "" });
            }}
            className="text-sm font-medium text-muted underline underline-offset-2 hover:text-ink"
          >
            Filtreleri temizle
          </button>
        )}
      </div>

      <DataTable
        caption="Ürün listesi"
        columns={columns}
        rows={rows}
        rowKey={(p) => p.id}
        sort={sort}
        onSortChange={(s) => setParams({ sort: s.key, dir: s.dir })}
        empty={
          <EmptyState
            icon={PackageSearch}
            title={activeFilters ? "Bu filtrelere uyan ürün yok" : "Henüz ürün yok"}
            description={activeFilters ? "Aramayı veya filtreleri değiştirmeyi dene." : "İlk ürününü ekleyerek kataloğu oluşturmaya başla."}
            action={<LinkButton href="/admin/products/new">Yeni ürün ekle</LinkButton>}
          />
        }
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Ürün silinsin mi?"
        message={
          pendingDelete && (
            <>
              <strong className="font-semibold text-ink">“{pendingDelete.name}”</strong> ürününü silmek istediğine emin misin? Bu işlem geri
              alınamaz.
              {pendingCompat > 0 && ` Ürüne ait ${pendingCompat} uyumluluk kaydı da silinecek.`} Geçmiş demo siparişler etkilenmez.
            </>
          )
        }
        confirmLabel="Ürünü sil"
        tone="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            catalogActions.deleteProduct(pendingDelete.id);
            toast.show(`“${pendingDelete.name}” silindi.`);
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
