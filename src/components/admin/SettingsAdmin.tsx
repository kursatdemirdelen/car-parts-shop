"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/Display";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { FormField, Input } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { parseAmount } from "@/lib/format";
import type { StoreSettings } from "@/lib/types";
import { validateSettings, type FieldErrors } from "@/lib/validation";
import { catalogActions, catalogStore, useCatalog } from "@/state/catalog-store";
import { Panel } from "./AdminUi";

type Draft = Record<keyof StoreSettings, string>;

const toDraft = (s: StoreSettings): Draft => ({
  storeName: s.storeName,
  email: s.email,
  phone: s.phone,
  address: s.address,
  workingHours: s.workingHours,
  freeShippingThreshold: String(s.freeShippingThreshold),
  shippingFee: String(s.shippingFee).replace(".", ","),
  lowStockThreshold: String(s.lowStockThreshold),
});

export function SettingsAdmin() {
  const { settings } = useCatalog();
  const toast = useToast();
  const [draft, setDraft] = useState<Draft>(() => toDraft(settings));
  const [errors, setErrors] = useState<FieldErrors>({});
  const [confirmReset, setConfirmReset] = useState(false);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const next: StoreSettings = {
      storeName: draft.storeName.trim(),
      email: draft.email.trim(),
      phone: draft.phone.trim(),
      address: draft.address.trim(),
      workingHours: draft.workingHours.trim(),
      freeShippingThreshold: parseAmount(draft.freeShippingThreshold),
      shippingFee: parseAmount(draft.shippingFee),
      lowStockThreshold: parseAmount(draft.lowStockThreshold),
    };
    const found = validateSettings(next);
    setErrors(found);
    if (Object.values(found).some(Boolean)) {
      toast.show("Bazı alanlar hatalı.", "error");
      return;
    }
    catalogActions.saveSettings(next);
    toast.show("Ayarlar kaydedildi.");
  };

  const field = (key: keyof StoreSettings, label: string, hint?: string, props: React.ComponentProps<typeof Input> = {}) => (
    <FormField label={label} htmlFor={`set-${key}`} error={errors[key]} hint={hint} required>
      <Input id={`set-${key}`} value={draft[key]} aria-invalid={!!errors[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} {...props} />
    </FormField>
  );

  return (
    <div className="max-w-3xl space-y-5">
      <PageHeader title="Ayarlar" description="Prototip için temel mağaza ayarları." />
      <form onSubmit={submit} noValidate className="space-y-5">
        <Panel title="Mağaza ve iletişim" description="Footer ve yardım sayfasında gösterilir.">
          <div className="grid gap-4 sm:grid-cols-2">
            {field("storeName", "Mağaza adı")}
            {field("email", "E-posta", undefined, { type: "email" })}
            {field("phone", "Telefon", undefined, { type: "tel" })}
            {field("workingHours", "Çalışma saatleri")}
            <div className="sm:col-span-2">{field("address", "Adres")}</div>
          </div>
        </Panel>
        <Panel title="Kargo ve stok" description="Sepet, ödeme ve stok uyarılarında kullanılır.">
          <div className="grid gap-4 sm:grid-cols-3">
            {field("freeShippingThreshold", "Ücretsiz kargo eşiği (₺)", undefined, { inputMode: "decimal" })}
            {field("shippingFee", "Kargo ücreti (₺)", undefined, { inputMode: "decimal" })}
            {field("lowStockThreshold", "Az stok eşiği (adet)", undefined, { inputMode: "numeric" })}
          </div>
        </Panel>
        <div className="flex justify-end">
          <Button type="submit">Ayarları kaydet</Button>
        </div>
      </form>

      <Panel title="Demo verileri">
        <p className="text-sm text-ink-soft">
          Bu prototipte tüm katalog değişiklikleri (ürünler, kategoriler, markalar, araçlar, uyumluluk, siparişler ve ayarlar) yalnızca bu
          tarayıcının yerel depolama alanında tutulur. Başka kullanıcılarla veya cihazlarla paylaşılmaz ve bir veritabanının yerini tutmaz.
        </p>
        <div className="mt-4 rounded-[var(--radius-control)] border border-[#f5d0cc] bg-danger-soft/60 p-4">
          <p className="text-sm font-medium text-ink">Demo verilerini sıfırla</p>
          <p className="mt-1 text-sm text-ink-soft">Katalog ilk haline döner. Sepet, favoriler ve garaj etkilenmez.</p>
          <Button variant="danger" size="sm" className="mt-3" onClick={() => setConfirmReset(true)}>
            Demo verilerini sıfırla
          </Button>
        </div>
      </Panel>

      <ConfirmDialog
        open={confirmReset}
        title="Demo verileri sıfırlansın mı?"
        message="Bu tarayıcıda yaptığın tüm katalog değişiklikleri ve oluşturulan demo siparişler silinip başlangıç verilerine dönülecek. Bu işlem geri alınamaz."
        confirmLabel="Sıfırla"
        tone="danger"
        onCancel={() => setConfirmReset(false)}
        onConfirm={() => {
          catalogActions.resetDemoData();
          // The store now holds the seed again; show the restored values in the form.
          setDraft(toDraft(catalogStore.get().settings));
          setConfirmReset(false);
          toast.show("Demo verileri sıfırlandı.");
        }}
      />
    </div>
  );
}

