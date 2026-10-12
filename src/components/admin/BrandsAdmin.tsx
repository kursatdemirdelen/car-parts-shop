"use client";

import { Pencil, Plus, Tags, Trash2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageHeader } from "@/components/ui/Display";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { FormField, Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { brandUsage } from "@/lib/catalog/relations";
import { newId } from "@/lib/ids";
import type { Brand } from "@/lib/types";
import { slugify, validateBrand, type FieldErrors } from "@/lib/validation";
import { catalogActions, useCatalog } from "@/state/catalog-store";
import { DataTable, type Column } from "./AdminUi";

interface Draft {
  id?: string;
  name: string;
  slug: string;
  country: string;
}

export function BrandsAdmin() {
  const { brands, products } = useCatalog();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pendingDelete, setPendingDelete] = useState<Brand | null>(null);

  const rows = [...brands].sort((a, b) => a.name.localeCompare(b.name, "tr"));

  const open = (b?: Brand) => {
    setErrors({});
    setDraft(b ? { id: b.id, name: b.name, slug: b.slug, country: b.country ?? "" } : { name: "", slug: "", country: "" });
  };

  const save = () => {
    if (!draft) return;
    const candidate = { name: draft.name.trim(), slug: draft.slug.trim() };
    const found = validateBrand(candidate, { brands, editingId: draft.id });
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    catalogActions.saveBrand({ id: draft.id ?? newId("brand"), ...candidate, country: draft.country.trim() || undefined });
    toast.show(draft.id ? "Marka güncellendi." : "Marka oluşturuldu.");
    setDraft(null);
  };

  const columns: Column<Brand>[] = [
    { key: "name", header: "Marka", primary: true, cell: (b) => <span className="font-medium text-ink">{b.name}</span> },
    { key: "slug", header: "Bağlantı adı", cell: (b) => <span className="text-muted tabular">{b.slug}</span> },
    { key: "country", header: "Ülke", cell: (b) => b.country ?? "—" },
    {
      key: "count",
      header: "Ürün",
      className: "text-right",
      cell: (b) => (
        <Link href={`/admin/products?brand=${b.id}`} className="tabular underline-offset-2 hover:underline">
          {brandUsage(products, b.id)}
        </Link>
      ),
    },
    {
      key: "actions",
      header: "İşlemler",
      className: "text-right",
      cell: (b) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => open(b)} aria-label={`${b.name} düzenle`}>
            <Pencil className="size-4" aria-hidden="true" />
            <span className="md:sr-only">Düzenle</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPendingDelete(b)} aria-label={`${b.name} sil`} className="text-danger hover:bg-danger-soft">
            <Trash2 className="size-4" aria-hidden="true" />
            <span className="md:sr-only">Sil</span>
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <PageHeader
        title="Markalar"
        description="Parça üreticileri. Ürünü olan bir marka silinemez."
        actions={
          <Button onClick={() => open()}>
            <Plus className="size-4" aria-hidden="true" /> Yeni marka
          </Button>
        }
      />
      <DataTable
        caption="Markalar"
        columns={columns}
        rows={rows}
        rowKey={(b) => b.id}
        empty={<EmptyState icon={Tags} title="Marka yok" action={<Button onClick={() => open()}>Marka ekle</Button>} />}
      />

      <Dialog
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Markayı düzenle" : "Yeni marka"}
        footer={
          <>
            <Button variant="secondary" onClick={() => setDraft(null)}>
              Vazgeç
            </Button>
            <Button onClick={save}>Kaydet</Button>
          </>
        }
      >
        {draft && (
          <form
            className="space-y-4"
            noValidate
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <FormField label="Ad" htmlFor="brand-name" required error={errors.name}>
              <Input
                id="brand-name"
                value={draft.name}
                aria-invalid={!!errors.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.id ? draft.slug : slugify(e.target.value) })}
              />
            </FormField>
            <FormField label="Bağlantı adı" htmlFor="brand-slug" required error={errors.slug}>
              <Input id="brand-slug" value={draft.slug} aria-invalid={!!errors.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
            </FormField>
            <FormField label="Ülke" htmlFor="brand-country">
              <Input id="brand-country" value={draft.country} onChange={(e) => setDraft({ ...draft, country: e.target.value })} />
            </FormField>
            <button type="submit" hidden />
          </form>
        )}
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Marka silinsin mi?"
        message={pendingDelete && <>“{pendingDelete.name}” markası silinecek. Bu işlem geri alınamaz.</>}
        confirmLabel="Sil"
        tone="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            const result = catalogActions.deleteBrand(pendingDelete.id);
            if (result.ok) toast.show("Marka silindi.");
            else toast.show(result.reason, "error");
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
