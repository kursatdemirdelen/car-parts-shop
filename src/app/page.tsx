"use client";

import { useState } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { Badge, Breadcrumbs, EmptyState, LoadingState, PageHeader } from "@/components/ui/Display";
import { ConfirmDialog, Dialog, Drawer } from "@/components/ui/Dialog";
import { Checkbox, FormField, Input, Select, Switch } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { ProductGrid } from "@/components/product/ProductGrid";
import { useCatalog } from "@/state/catalog-store";

// TEMPORARY primitives check page (Task 6). Replaced by the home page in Task 9.
export default function Home() {
  const [dialog, setDialog] = useState(false);
  const [drawer, setDrawer] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const toast = useToast();
  const { products } = useCatalog();
  return (
    <main className="container-page space-y-8 py-10">
      <ProductGrid products={products.slice(0, 8)} />
      <Breadcrumbs items={[{ label: "Ana sayfa", href: "/" }, { label: "Test" }]} />
      <PageHeader title="Bileşen kontrolü" description="Geçici sayfa" actions={<Button>Aksiyon</Button>} />
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setDialog(true)}>Dialog</Button>
        <Button variant="secondary" onClick={() => setDrawer(true)}>Drawer</Button>
        <Button variant="danger" onClick={() => setConfirm(true)}>Sil</Button>
        <Button variant="ghost" onClick={() => toast.show("Sepete eklendi", "success", { label: "Sepete git", href: "/cart" })}>Toast</Button>
        <LinkButton href="/" variant="secondary">Link</LinkButton>
      </div>
      <div className="flex gap-2"><Badge>Nötr</Badge><Badge tone="success">Stokta</Badge><Badge tone="warn">Az</Badge><Badge tone="danger">Tükendi</Badge></div>
      <div className="grid max-w-md gap-4">
        <FormField label="Ad" htmlFor="ad" required error="Bu alan zorunludur."><Input id="ad" aria-invalid /></FormField>
        <FormField label="Marka" htmlFor="m" hint="Seçin"><Select id="m"><option>BMW</option></Select></FormField>
        <Checkbox label="Stokta olanlar" />
        <Switch label="Sadece uyumlu" />
      </div>
      <EmptyState title="Boş" description="Açıklama" action={<Button>Aksiyon</Button>} />
      <LoadingState />
      <Dialog open={dialog} onClose={() => setDialog(false)} title="Dialog başlığı" footer={<Button onClick={() => setDialog(false)}>Tamam</Button>}><p>İçerik</p><Input aria-label="x" /></Dialog>
      <Drawer open={drawer} onClose={() => setDrawer(false)} title="Filtreler" side="left"><p>Drawer içeriği</p></Drawer>
      <ConfirmDialog open={confirm} title="Silinsin mi?" message="Bu işlem geri alınamaz." confirmLabel="Sil" tone="danger" onConfirm={() => setConfirm(false)} onCancel={() => setConfirm(false)} />
    </main>
  );
}
