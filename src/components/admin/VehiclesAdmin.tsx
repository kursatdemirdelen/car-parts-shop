"use client";

import { CarFront, Pencil, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { EmptyState, PageHeader } from "@/components/ui/Display";
import { ConfirmDialog, Dialog } from "@/components/ui/Dialog";
import { FormField, Input, Select } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { vehicleLabel, yearRange } from "@/lib/catalog/vehicles";
import { newId } from "@/lib/ids";
import type { Vehicle } from "@/lib/types";
import { slugify, validateVehicle, type FieldErrors } from "@/lib/validation";
import { catalogActions, useCatalog } from "@/state/catalog-store";
import { DataTable, type Column } from "./AdminUi";

interface Draft {
  id?: string;
  make: string;
  model: string;
  generation: string;
  body: string;
  yearFrom: string;
  yearTo: string;
  engine: string;
}

const empty: Draft = { make: "", model: "", generation: "", body: "", yearFrom: "", yearTo: "", engine: "" };

export function VehiclesAdmin() {
  const { vehicles, compatibility } = useCatalog();
  const toast = useToast();
  const [make, setMake] = useState("");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [pendingDelete, setPendingDelete] = useState<Vehicle | null>(null);

  const makes = [...new Set(vehicles.map((v) => v.make))].sort((a, b) => a.localeCompare(b, "tr"));
  const rows = vehicles.filter((v) => !make || v.make === make);
  const recordCount = (id: string) => compatibility.filter((r) => r.vehicleId === id).length;

  const open = (v?: Vehicle) => {
    setErrors({});
    setDraft(
      v
        ? { id: v.id, make: v.make, model: v.model, generation: v.generation, body: v.body ?? "", yearFrom: String(v.yearFrom), yearTo: v.yearTo ? String(v.yearTo) : "", engine: v.engine }
        : { ...empty, make },
    );
  };

  const save = () => {
    if (!draft) return;
    const candidate = {
      make: draft.make.trim(),
      model: draft.model.trim(),
      generation: draft.generation.trim(),
      engine: draft.engine.trim(),
      yearFrom: draft.yearFrom.trim() ? Number(draft.yearFrom) : Number.NaN,
      yearTo: draft.yearTo.trim() ? Number(draft.yearTo) : null,
    };
    const found = validateVehicle(candidate, new Date().getFullYear());
    setErrors(found);
    if (Object.values(found).some(Boolean)) return;
    const id = draft.id ?? `v-${slugify(candidate.make)}-${slugify(candidate.generation)}-${newId("x").slice(2)}`;
    catalogActions.saveVehicle({ id, ...candidate, body: draft.body.trim() || undefined });
    toast.show(draft.id ? "Araç güncellendi." : "Araç eklendi.");
    setDraft(null);
  };

  const columns: Column<Vehicle>[] = [
    { key: "vehicle", header: "Araç", primary: true, cell: (v) => <span className="font-medium text-ink">{`${v.make} ${v.model} ${v.generation}`}</span> },
    { key: "engine", header: "Motor", cell: (v) => v.engine },
    { key: "body", header: "Kasa", cell: (v) => v.body ?? "—", hideOnMobile: true },
    { key: "years", header: "Yıllar", cell: (v) => <span className="whitespace-nowrap tabular">{yearRange(v)}</span> },
    { key: "records", header: "Uyumluluk kaydı", className: "text-right", cell: (v) => <span className="tabular">{recordCount(v.id)}</span> },
    {
      key: "actions",
      header: "İşlemler",
      className: "text-right",
      cell: (v) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="sm" onClick={() => open(v)} aria-label={`${vehicleLabel(v)} düzenle`}>
            <Pencil className="size-4" aria-hidden="true" />
            <span className="md:sr-only">Düzenle</span>
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setPendingDelete(v)} aria-label={`${vehicleLabel(v)} sil`} className="text-danger hover:bg-danger-soft">
            <Trash2 className="size-4" aria-hidden="true" />
            <span className="md:sr-only">Sil</span>
          </Button>
        </div>
      ),
    },
  ];

  const field = (key: keyof Draft, label: string, required = true, props: React.ComponentProps<typeof Input> = {}) => (
    <FormField label={label} htmlFor={`veh-${key}`} required={required} error={errors[key]}>
      <Input id={`veh-${key}`} value={draft?.[key] ?? ""} aria-invalid={!!errors[key]} onChange={(e) => draft && setDraft({ ...draft, [key]: e.target.value })} {...props} />
    </FormField>
  );

  return (
    <div className="space-y-5">
      <PageHeader
        title="Araçlar"
        description={`${vehicles.length} demo araç kaydı. Mağazadaki araç seçici yalnızca bu kayıtları listeler.`}
        actions={
          <Button onClick={() => open()}>
            <Plus className="size-4" aria-hidden="true" /> Yeni araç
          </Button>
        }
      />
      <div className="flex items-center gap-3">
        <label htmlFor="veh-make-filter" className="text-sm text-muted">
          Marka
        </label>
        <Select id="veh-make-filter" value={make} onChange={(e) => setMake(e.target.value)} className="w-56">
          <option value="">Tümü</option>
          {makes.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </Select>
      </div>
      <DataTable
        caption="Araçlar"
        columns={columns}
        rows={rows}
        rowKey={(v) => v.id}
        empty={<EmptyState icon={CarFront} title="Araç kaydı yok" action={<Button onClick={() => open()}>Araç ekle</Button>} />}
      />

      <Dialog
        open={draft !== null}
        onClose={() => setDraft(null)}
        title={draft?.id ? "Aracı düzenle" : "Yeni araç"}
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
            className="grid gap-4 sm:grid-cols-2"
            onSubmit={(e) => {
              e.preventDefault();
              save();
            }}
          >
            {field("make", "Marka", true, { placeholder: "örn. BMW", list: "veh-makes" })}
            <datalist id="veh-makes">
              {makes.map((m) => (
                <option key={m} value={m} />
              ))}
            </datalist>
            {field("model", "Model", true, { placeholder: "örn. 3 Serisi" })}
            {field("generation", "Kasa / nesil", true, { placeholder: "örn. E46" })}
            {field("body", "Gövde tipi", false, { placeholder: "örn. Sedan" })}
            {field("yearFrom", "Başlangıç yılı", true, { inputMode: "numeric" })}
            {field("yearTo", "Bitiş yılı", false, { inputMode: "numeric", placeholder: "Üretimde ise boş bırak" })}
            <div className="sm:col-span-2">{field("engine", "Motor / teknik varyant", true, { placeholder: "örn. 320d 2.0 (150 HP)" })}</div>
            <button type="submit" hidden />
          </form>
        )}
      </Dialog>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Araç silinsin mi?"
        message={
          pendingDelete && (
            <>
              “{vehicleLabel(pendingDelete)}” silinecek
              {recordCount(pendingDelete.id) > 0 && ` ve bu araca ait ${recordCount(pendingDelete.id)} uyumluluk kaydı da kaldırılacak`}. Bu işlem
              geri alınamaz.
            </>
          )
        }
        confirmLabel="Sil"
        tone="danger"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (pendingDelete) {
            catalogActions.deleteVehicle(pendingDelete.id);
            toast.show("Araç silindi.");
          }
          setPendingDelete(null);
        }}
      />
    </div>
  );
}
