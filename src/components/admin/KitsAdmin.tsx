"use client";

import { PackageCheck, Pencil, Plus, Trash2, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Badge, EmptyState, PageHeader } from "@/components/ui/Display";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { FormField, Input, Select, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { vehicleLabel } from "@/lib/catalog/vehicles";
import { formatPrice } from "@/lib/format";
import { newId } from "@/lib/ids";
import { resolveKit } from "@/lib/kits";
import type { KitLine, MaintenanceKit, PublicationStatus } from "@/lib/types";
import { slugify, validateKit, type FieldErrors } from "@/lib/validation";
import { catalogActions, useCatalog } from "@/state/catalog-store";
import { DataTable, type Column } from "./AdminUi";
import { VehicleSelect } from "./CompatibilityEditor";

interface Draft {
  id?: string;
  name: string;
  slug: string;
  description: string;
  vehicleIds: string[];
  lines: { productId: string; quantity: string }[];
  status: PublicationStatus;
}

const emptyDraft: Draft = { name: "", slug: "", description: "", vehicleIds: [], lines: [], status: "published" };

export function KitsAdmin() {
  const { kits, products, vehicles } = useCatalog();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pendingDelete, setPendingDelete] = useState<MaintenanceKit | null>(null);
  const [vehicleToAdd, setVehicleToAdd] = useState("");

  const open = (k?: MaintenanceKit) => {
    setErrors({});
    setVehicleToAdd("");
    setDraft(
      k
        ? {
            id: k.id,
            name: k.name,
            slug: k.slug,
            description: k.description,
            vehicleIds: [...k.vehicleIds],
            lines: k.lines.map((l) => ({ productId: l.productId, quantity: String(l.quantity) })),
            status: k.status,
          }
        : emptyDraft,
    );
  };

  const save = () => {
    if (!draft) return;
    const lines: KitLine[] = draft.lines.map((l) => ({ productId: l.productId, quantity: Number(l.quantity) }));
    const candidate = {
      name: draft.name.trim(),
      slug: draft.slug.trim(),
      description: draft.description.trim(),
      vehicleIds: draft.vehicleIds,
      lines,
      status: draft.status,
    };
    const found = validateKit(candidate, { kits, products, editingId: draft.id });
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    catalogActions.saveKit({ id: draft.id ?? newId("kit"), ...candidate });
    toast.show("Bakım seti kaydedildi.");
    setDraft(null);
  };

  const columns: Column<MaintenanceKit>[] = [
    { key: "name", header: "Set", primary: true, cell: (k) => <span className="font-medium text-ink">{k.name}</span> },
    { key: "vehicles", header: "Araç", className: "text-right", cell: (k) => <span className="tabular">{k.vehicleIds.length}</span> },
    { key: "lines", header: "Ürün", className: "text-right", cell: (k) => <span className="tabular">{k.lines.length}</span> },
    {
      key: "total",
      header: "Toplam",
      className: "text-right whitespace-nowrap",
      cell: (k) => <span className="tabular">{formatPrice(resolveKit(k, products).total)}</span>,
    },
    {
      key: "status",
      header: "Durum",
      cell: (k) => <Badge tone={k.status === "published" ? "success" : "neutral"}>{k.status === "published" ? "Yayında" : "Taslak"}</Badge>,
    },
    {
      key: "actions",
      header: "İşlemler",
      className: "text-right",
      cell: (k) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => open(k)} aria-label={`${k.name} düzenle`}>
            <Pencil className="size-4" aria-hidden="true" />
            <span className="md:sr-only">Düzenle</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPendingDelete(k)} aria-label={`${k.name} sil`} className="text-danger hover:bg-danger-soft">
            <Trash2 className="size-4" aria-hidden="true" />
            <span className="md:sr-only">Sil</span>
          </Button>
        </div>
      ),
    },
  ];

  const sortedProducts = [...products].sort((a, b) => a.name.localeCompare(b.name, "tr"));

  return (
    <div className="space-y-5">
      <PageHeader
        title="Bakım setleri"
        description="Belirli araçlar için hazır parça listeleri. Set fiyatı her zaman parçaların toplamıdır; indirim uygulanmaz."
        actions={
          <Button onClick={() => open()}>
            <Plus className="size-4" aria-hidden="true" /> Yeni set
          </Button>
        }
      />
      <DataTable
        caption="Bakım setleri"
        columns={columns}
        rows={kits}
        rowKey={(k) => k.id}
        empty={<EmptyState icon={PackageCheck} title="Bakım seti yok" action={<Button onClick={() => open()}>Set oluştur</Button>} />}
      />

      <Dialog
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Bakım setini düzenle" : "Yeni bakım seti"}
        className="max-w-2xl"
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
            noValidate
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField label="Ad" htmlFor="kit-name" required error={errors.name}>
                <Input
                  id="kit-name"
                  value={draft.name}
                  aria-invalid={!!errors.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value, slug: draft.id ? draft.slug : slugify(e.target.value) })}
                />
              </FormField>
              <FormField label="Bağlantı adı" htmlFor="kit-slug" required error={errors.slug}>
                <Input id="kit-slug" value={draft.slug} aria-invalid={!!errors.slug} onChange={(e) => setDraft({ ...draft, slug: e.target.value })} />
              </FormField>
            </div>
            <FormField label="Açıklama" htmlFor="kit-description">
              <Textarea id="kit-description" rows={2} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
            </FormField>
            <FormField label="Durum" htmlFor="kit-status">
              <Select id="kit-status" value={draft.status} onChange={(e) => setDraft({ ...draft, status: e.target.value as PublicationStatus })}>
                <option value="published">Yayında</option>
                <option value="draft">Taslak (mağazada görünmez)</option>
              </Select>
            </FormField>

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-ink">Uygun araçlar</legend>
              {draft.vehicleIds.length > 0 && (
                <ul className="mb-2 flex flex-wrap gap-1.5">
                  {draft.vehicleIds.map((id) => {
                    const v = vehicles.find((x) => x.id === id);
                    return (
                      <li key={id}>
                        <span className="inline-flex items-center gap-1 rounded-full border border-line-strong py-0.5 pr-1 pl-2.5 text-xs">
                          {v ? vehicleLabel(v) : "Silinmiş araç"}
                          <button
                            type="button"
                            onClick={() => setDraft({ ...draft, vehicleIds: draft.vehicleIds.filter((x) => x !== id) })}
                            className="rounded-full p-0.5 text-muted hover:text-ink"
                            aria-label={`${v ? vehicleLabel(v) : "Araç"} kaldır`}
                          >
                            <X className="size-3.5" aria-hidden="true" />
                          </button>
                        </span>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="flex gap-2">
                <div className="min-w-0 flex-1">
                  <VehicleSelect vehicles={vehicles} value={vehicleToAdd} onChange={setVehicleToAdd} exclude={draft.vehicleIds} placeholder="Araç ekle" />
                </div>
                <Button
                  variant="secondary"
                  disabled={!vehicleToAdd}
                  onClick={() => {
                    setDraft({ ...draft, vehicleIds: [...draft.vehicleIds, vehicleToAdd] });
                    setVehicleToAdd("");
                  }}
                >
                  Ekle
                </Button>
              </div>
              <p className="mt-1 text-xs text-muted">Setteki parçaların bu araçlar için uyumluluğunun doğrulanmış olmasına dikkat et.</p>
            </fieldset>

            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-ink">
                Ürünler <span className="text-danger" aria-hidden="true">*</span>
              </legend>
              {errors.lines && <p className="mb-2 text-sm text-danger">{errors.lines}</p>}
              <ul className="space-y-2">
                {draft.lines.map((line, i) => (
                  <li key={i}>
                    <div className="flex gap-2">
                      <Select
                        aria-label={`Ürün ${i + 1}`}
                        value={line.productId}
                        aria-invalid={!!errors[`lines.${i}`]}
                        onChange={(e) => setDraft({ ...draft, lines: draft.lines.map((x, j) => (j === i ? { ...x, productId: e.target.value } : x)) })}
                        className="min-w-0 flex-1"
                      >
                        <option value="">Ürün seç</option>
                        {sortedProducts.map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name} · {p.sku}
                          </option>
                        ))}
                      </Select>
                      <Input
                        aria-label={`Ürün ${i + 1} adedi`}
                        inputMode="numeric"
                        value={line.quantity}
                        onChange={(e) => setDraft({ ...draft, lines: draft.lines.map((x, j) => (j === i ? { ...x, quantity: e.target.value } : x)) })}
                        className="w-20 tabular"
                      />
                      <Button
                        variant="ghost"
                        aria-label={`Ürün ${i + 1} kaldır`}
                        onClick={() => setDraft({ ...draft, lines: draft.lines.filter((_, j) => j !== i) })}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </Button>
                    </div>
                    {errors[`lines.${i}`] && <p className="mt-1 text-sm text-danger">{errors[`lines.${i}`]}</p>}
                  </li>
                ))}
              </ul>
              <Button variant="secondary" size="sm" className="mt-2" onClick={() => setDraft({ ...draft, lines: [...draft.lines, { productId: "", quantity: "1" }] })}>
                <Plus className="size-4" aria-hidden="true" /> Ürün ekle
              </Button>
            </fieldset>
            <button type="submit" hidden />
          </form>
        )}
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Bakım seti silinsin mi?"
        message={pendingDelete && <>“{pendingDelete.name}” silinecek. Ürünler etkilenmez. Bu işlem geri alınamaz.</>}
        confirmLabel="Sil"
        tone="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            catalogActions.deleteKit(pendingDelete.id);
            toast.show("Bakım seti silindi.");
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
