"use client";

import { FolderTree, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge, EmptyState, PageHeader } from "@/components/ui/Display";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { FormField, Input, Select, Textarea, fieldDescribedBy } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { categoryUsage } from "@/lib/catalog/relations";
import { newId } from "@/lib/ids";
import type { Category } from "@/lib/types";
import { slugify, validateCategory, type FieldErrors } from "@/lib/validation";
import { catalogActions, useCatalog } from "@/state/catalog-store";
import { DataTable, type Column } from "./AdminUi";

interface Draft {
  id?: string;
  name: string;
  slug: string;
  parentId: string;
  description: string;
  image?: string;
}

const emptyDraft: Draft = { name: "", slug: "", parentId: "", description: "" };

export function CategoriesAdmin() {
  const { categories, products } = useCatalog();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pendingDelete, setPendingDelete] = useState<Category | null>(null);

  const roots = categories.filter((c) => c.parentId === null);
  // Tree order: each root followed by its children.
  const rows = roots.flatMap((r) => [r, ...categories.filter((c) => c.parentId === r.id)]);

  const open = (c?: Category) => {
    setErrors({});
    setDraft(c ? { id: c.id, name: c.name, slug: c.slug, parentId: c.parentId ?? "", description: c.description ?? "", image: c.image } : emptyDraft);
  };

  const save = () => {
    if (!draft) return;
    const candidate = { name: draft.name.trim(), slug: draft.slug.trim(), parentId: draft.parentId || null };
    const found = validateCategory(candidate, { categories, editingId: draft.id });
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    catalogActions.saveCategory({
      id: draft.id ?? newId("cat"),
      ...candidate,
      description: draft.description.trim() || undefined,
      image: draft.image,
    });
    toast.show(draft.id ? "Kategori güncellendi." : "Kategori oluşturuldu.");
    setDraft(null);
  };

  const columns: Column<Category>[] = [
    {
      key: "name",
      header: "Kategori",
      primary: true,
      cell: (c) => (
        <span className={c.parentId ? "pl-5 text-ink-soft" : "font-semibold text-ink"}>
          {c.parentId && <span className="mr-1.5 text-subtle" aria-hidden="true">└</span>}
          {c.name}
        </span>
      ),
    },
    { key: "slug", header: "Bağlantı adı", cell: (c) => <span className="text-muted tabular">/{c.slug}</span> },
    { key: "level", header: "Seviye", cell: (c) => <Badge>{c.parentId ? "Alt kategori" : "Ana grup"}</Badge> },
    { key: "count", header: "Ürün", className: "text-right", cell: (c) => <span className="tabular">{categoryUsage(products, categories, c.id)}</span> },
    {
      key: "actions",
      header: "İşlemler",
      className: "text-right",
      cell: (c) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => open(c)} aria-label={`${c.name} düzenle`}>
            <Pencil className="size-4" aria-hidden="true" />
            <span className="md:sr-only">Düzenle</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPendingDelete(c)} aria-label={`${c.name} sil`} className="text-danger hover:bg-danger-soft">
            <Trash2 className="size-4" aria-hidden="true" />
            <span className="md:sr-only">Sil</span>
          </Button>
        </div>
      ),
    },
  ];

  const isRootWithChildren = !!draft?.id && categories.some((c) => c.parentId === draft.id);

  return (
    <div className="space-y-5">
      <PageHeader
        title="Kategoriler"
        description="Kategori ağacı en fazla iki seviyelidir: ana grup › alt kategori. Ürünler yalnızca alt kategorilere atanır."
        actions={
          <Button onClick={() => open()}>
            <Plus className="size-4" aria-hidden="true" /> Yeni kategori
          </Button>
        }
      />
      <DataTable
        caption="Kategoriler"
        columns={columns}
        rows={rows}
        rowKey={(c) => c.id}
        empty={<EmptyState icon={FolderTree} title="Kategori yok" action={<Button onClick={() => open()}>Kategori ekle</Button>} />}
      />

      <Dialog
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Kategoriyi düzenle" : "Yeni kategori"}
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
            <FormField label="Ad" htmlFor="cat-name" required error={errors.name}>
              <Input
                id="cat-name"
                value={draft.name}
                aria-invalid={!!errors.name}
                aria-describedby={fieldDescribedBy("cat-name", errors.name)}
                onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.id ? draft.slug : slugify(e.target.value) })}
              />
            </FormField>
            <FormField label="Bağlantı adı" htmlFor="cat-slug" required error={errors.slug}>
              <Input id="cat-slug" value={draft.slug} aria-invalid={!!errors.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
            </FormField>
            <FormField
              label="Üst kategori"
              htmlFor="cat-parent"
              error={errors.parentId}
              hint={isRootWithChildren ? "Alt kategorileri olan bir ana grup başka bir grubun altına taşınamaz." : "Boş bırakırsan ana grup olur."}
            >
              <Select
                id="cat-parent"
                value={draft.parentId}
                disabled={isRootWithChildren}
                aria-invalid={!!errors.parentId}
                onChange={(e) => setDraft({ ...draft, parentId: e.target.value })}
              >
                <option value="">Ana grup (üst kategori yok)</option>
                {roots
                  .filter((r) => r.id !== draft.id)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                    </option>
                  ))}
              </Select>
            </FormField>
            <FormField label="Açıklama" htmlFor="cat-description">
              <Textarea id="cat-description" rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </FormField>
            <button type="submit" hidden />
          </form>
        )}
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Kategori silinsin mi?"
        message={pendingDelete && <>“{pendingDelete.name}” kategorisi silinecek. Bu işlem geri alınamaz.</>}
        confirmLabel="Sil"
        tone="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            const result = catalogActions.deleteCategory(pendingDelete.id);
            if (result.ok) toast.show("Kategori silindi.");
            else toast.show(result.reason, "error");
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
