"use client";

import { ArrowUp, Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent, type ReactNode } from "react";
import { ProductImage } from "@/components/product/ProductBits";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/Display";
import { ConfirmDialog } from "@/components/ui/Dialog";
import { FormField, Input, Select, Textarea, fieldDescribedBy } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { parseAmount } from "@/lib/format";
import { newId } from "@/lib/ids";
import type { FitmentType, Product, ProductImage as ProductImageType, PublicationStatus, Spec } from "@/lib/types";
import { slugify, validateProduct, type FieldErrors, type ProductDraft } from "@/lib/validation";
import { catalogActions, useCatalog } from "@/state/catalog-store";
import { CompatibilityEditor, type CompatibilityRow } from "./CompatibilityEditor";

interface FormState {
  name: string;
  slug: string;
  slugTouched: boolean;
  description: string;
  sku: string;
  oemNumbers: string[];
  brandId: string;
  categoryId: string;
  price: string;
  compareAtPrice: string;
  stock: string;
  status: PublicationStatus;
  fitmentType: FitmentType;
  featured: boolean;
  images: ProductImageType[];
  specs: Spec[];
  companionIds: string[];
  compatibility: CompatibilityRow[];
}

function initialState(product: Product | undefined, rows: CompatibilityRow[]): FormState {
  return {
    name: product?.name ?? "",
    slug: product?.slug ?? "",
    slugTouched: !!product,
    description: product?.description ?? "",
    sku: product?.sku ?? "",
    oemNumbers: product?.oemNumbers.length ? [...product.oemNumbers] : [""],
    brandId: product?.brandId ?? "",
    categoryId: product?.categoryId ?? "",
    price: product ? String(product.price) : "",
    compareAtPrice: product?.compareAtPrice !== undefined ? String(product.compareAtPrice) : "",
    stock: product ? String(product.stock) : "0",
    status: product?.status ?? "draft",
    fitmentType: product?.fitmentType ?? "vehicle-specific",
    featured: product?.featured ?? false,
    images: product?.images.map((i) => ({ ...i })) ?? [],
    specs: product?.specs.map((s) => ({ ...s })) ?? [],
    companionIds: product?.companionIds ? [...product.companionIds] : [],
    compatibility: rows,
  };
}

function Section({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section className="rounded-[var(--radius-card)] border border-line bg-white">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-base font-semibold text-ink">{title}</h2>
        {description && <p className="mt-0.5 text-sm text-muted">{description}</p>}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

export function ProductForm({ product }: { product?: Product }) {
  const router = useRouter();
  const toast = useToast();
  const { products, categories, brands, vehicles, compatibility } = useCatalog();
  // Compatibility records are copied once at load time; edits live in form state until saved.
  const [form, setForm] = useState<FormState>(() =>
    initialState(
      product,
      product ? compatibility.filter((r) => r.productId === product.id).map((r) => ({ vehicleId: r.vehicleId, status: r.status })) : [],
    ),
  );
  const [errors, setErrors] = useState<FieldErrors>({});
  const [dirty, setDirty] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);

  const update = <K extends keyof FormState>(key: K, value: FormState[K]) => {
    setForm((f) => ({ ...f, [key]: value }));
    setDirty(true);
    if (errors[key as string]) setErrors((e) => ({ ...e, [key as string]: undefined }));
  };

  const imageOptions = useMemo(() => {
    const fromCategories = categories.filter((c) => c.image).map((c) => ({ src: c.image!, label: `${c.name} çizimi` }));
    return [...fromCategories, { src: "/products/fallback.svg", label: "Genel (görsel yok)" }];
  }, [categories]);

  const buildDraft = (): ProductDraft => ({
    name: form.name.trim(),
    slug: form.slug.trim(),
    description: form.description.trim(),
    sku: form.sku.trim(),
    oemNumbers: form.oemNumbers.map((o) => o.trim()).filter(Boolean),
    brandId: form.brandId,
    categoryId: form.categoryId,
    price: parseAmount(form.price),
    compareAtPrice: form.compareAtPrice.trim() ? parseAmount(form.compareAtPrice) : undefined,
    stock: form.stock.trim() === "" ? Number.NaN : Number(form.stock),
    status: form.status,
    fitmentType: form.fitmentType,
    featured: form.featured || undefined,
    images: form.images.map((i) => ({ src: i.src, alt: i.alt.trim() || form.name.trim() })),
    specs: form.specs.map((s) => ({ label: s.label.trim(), value: s.value.trim() })).filter((s) => s.label || s.value),
    companionIds: form.companionIds.length ? form.companionIds : undefined,
  });

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const draft = buildDraft();
    const found = validateProduct(draft, { products, categories, brands, editingId: product?.id });
    setErrors(found);
    const keys = Object.keys(found).filter((k) => found[k]);
    if (keys.length > 0) {
      toast.show(`${keys.length} alan düzeltilmeli.`, "error");
      const order = ["name", "slug", "sku", "price", "compareAtPrice", "stock", "brandId", "categoryId"];
      const first = order.find((k) => found[k]);
      if (first) document.getElementById(`pf-${first}`)?.focus();
      return;
    }
    const now = new Date().toISOString();
    const saved: Product = {
      ...draft,
      id: product?.id ?? newId("p"),
      createdAt: product?.createdAt ?? now,
      updatedAt: now,
    };
    catalogActions.saveProduct(saved);
    catalogActions.replaceCompatibility(saved.id, saved.fitmentType === "universal" ? [] : form.compatibility);
    toast.show(product ? "Ürün güncellendi." : "Ürün oluşturuldu.", "success", { label: "Mağazada gör", href: `/products/${saved.slug}` });
    setDirty(false);
    if (!product) setForm(initialState(undefined, []));
    router.push("/admin/products");
  };

  const errorCount = Object.values(errors).filter(Boolean).length;
  const subcategories = categories.filter((c) => c.parentId !== null);
  const roots = categories.filter((c) => c.parentId === null);
  const err = (key: string) => errors[key];
  const invalid = (key: string) => ({ "aria-invalid": !!errors[key], "aria-describedby": fieldDescribedBy(`pf-${key}`, errors[key]) });

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <PageHeader
        title={product ? "Ürünü düzenle" : "Yeni ürün"}
        description={product ? product.name : "Zorunlu alanlar * ile işaretlidir."}
        actions={
          <>
            <Button variant="secondary" onClick={() => (dirty ? setConfirmLeave(true) : router.push("/admin/products"))}>
              Vazgeç
            </Button>
            <Button type="submit">{product ? "Değişiklikleri kaydet" : "Ürünü oluştur"}</Button>
          </>
        }
      />

      {errorCount > 0 && (
        <div role="alert" className="rounded-[var(--radius-card)] border border-[#f5d0cc] bg-danger-soft px-4 py-3 text-sm text-danger">
          {errorCount} alan düzeltilmeli. Hatalı alanlar aşağıda işaretlendi.
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="space-y-5">
          <Section title="Temel bilgiler">
            <FormField label="Ürün adı" htmlFor="pf-name" required error={err("name")}>
              <Input
                id="pf-name"
                value={form.name}
                {...invalid("name")}
                onChange={(e) => {
                  const name = e.target.value;
                  setForm((f) => ({ ...f, name, slug: f.slugTouched ? f.slug : slugify(name) }));
                  setDirty(true);
                }}
              />
            </FormField>
            <FormField label="Bağlantı adı (slug)" htmlFor="pf-slug" required error={err("slug")} hint="Ürün adından otomatik oluşturulur; değiştirebilirsin.">
              <Input
                id="pf-slug"
                value={form.slug}
                {...invalid("slug")}
                aria-describedby={fieldDescribedBy("pf-slug", errors.slug, "x")}
                onChange={(e) => {
                  setForm((f) => ({ ...f, slug: e.target.value, slugTouched: true }));
                  setDirty(true);
                }}
              />
            </FormField>
            <FormField label="Açıklama" htmlFor="pf-description">
              <Textarea id="pf-description" rows={4} value={form.description} onChange={(e) => update("description", e.target.value)} />
            </FormField>
          </Section>

          <Section title="Kodlar" description="Stok kodu mağazanın kendi kodudur; OEM numaraları araç üreticisinin parça numaralarıdır.">
            <FormField label="Stok kodu (SKU)" htmlFor="pf-sku" required error={err("sku")}>
              <Input id="pf-sku" value={form.sku} {...invalid("sku")} onChange={(e) => update("sku", e.target.value)} className="tabular" />
            </FormField>
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-ink">OEM numaraları</legend>
              <div className="space-y-2">
                {form.oemNumbers.map((o, i) => (
                  <div key={i} className="flex gap-2">
                    <Input
                      aria-label={`OEM numarası ${i + 1}`}
                      value={o}
                      onChange={(e) => update("oemNumbers", form.oemNumbers.map((x, j) => (j === i ? e.target.value : x)))}
                      className="tabular"
                      placeholder="örn. 34116860912"
                    />
                    <Button
                      variant="ghost"
                      onClick={() => update("oemNumbers", form.oemNumbers.length > 1 ? form.oemNumbers.filter((_, j) => j !== i) : [""])}
                      aria-label={`OEM numarası ${i + 1} kaldır`}
                    >
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button variant="secondary" size="sm" className="mt-2" onClick={() => update("oemNumbers", [...form.oemNumbers, ""])}>
                <Plus className="size-4" aria-hidden="true" /> OEM numarası ekle
              </Button>
            </fieldset>
          </Section>

          <Section title="Görseller" description="Şimdilik yerel çizimlerden seçilir. Gerçek fotoğraflar için görsel yolu değiştirilebilir.">
            {form.images.length === 0 && <p className="text-sm text-muted">Görsel yok. Mağazada genel bir yer tutucu gösterilir.</p>}
            <ul className="space-y-3">
              {form.images.map((img, i) => (
                <li key={i} className="flex flex-col gap-3 rounded-[var(--radius-control)] border border-line p-3 sm:flex-row sm:items-start">
                  <span className="w-16 shrink-0 overflow-hidden rounded-md border border-line">
                    <ProductImage image={img.src ? img : undefined} sizes="64px" />
                  </span>
                  <div className="grid flex-1 gap-2 sm:grid-cols-2">
                    <div>
                      <Select
                        aria-label={`Görsel ${i + 1}`}
                        value={img.src}
                        aria-invalid={!!errors[`images.${i}.src`]}
                        onChange={(e) => update("images", form.images.map((x, j) => (j === i ? { ...x, src: e.target.value } : x)))}
                      >
                        <option value="">Görsel seç</option>
                        {imageOptions.map((o) => (
                          <option key={o.src} value={o.src}>
                            {o.label}
                          </option>
                        ))}
                      </Select>
                      {errors[`images.${i}.src`] && <p className="mt-1 text-sm text-danger">{errors[`images.${i}.src`]}</p>}
                    </div>
                    <Input
                      aria-label={`Görsel ${i + 1} alternatif metni`}
                      placeholder="Alternatif metin (boşsa ürün adı)"
                      value={img.alt}
                      onChange={(e) => update("images", form.images.map((x, j) => (j === i ? { ...x, alt: e.target.value } : x)))}
                    />
                  </div>
                  <div className="flex gap-1">
                    {i > 0 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        aria-label={`Görsel ${i + 1} yukarı taşı`}
                        onClick={() => {
                          const next = [...form.images];
                          [next[i - 1], next[i]] = [next[i], next[i - 1]];
                          update("images", next);
                        }}
                      >
                        <ArrowUp className="size-4" aria-hidden="true" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" aria-label={`Görsel ${i + 1} kaldır`} onClick={() => update("images", form.images.filter((_, j) => j !== i))}>
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
            <Button variant="secondary" size="sm" onClick={() => update("images", [...form.images, { src: "", alt: "" }])}>
              <Plus className="size-4" aria-hidden="true" /> Görsel ekle
            </Button>
          </Section>

          <Section title="Teknik özellikler" description="Yalnızca doğrulanabilir ölçü ve özellikleri gir; sertifika veya garanti iddiası ekleme.">
            {form.specs.length === 0 && <p className="text-sm text-muted">Henüz özellik yok.</p>}
            <ul className="space-y-2">
              {form.specs.map((s, i) => (
                <li key={i}>
                  <div className="flex gap-2">
                    <Input
                      aria-label={`Özellik ${i + 1} adı`}
                      placeholder="Özellik (örn. Çap)"
                      value={s.label}
                      aria-invalid={!!errors[`specs.${i}`]}
                      onChange={(e) => update("specs", form.specs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                    />
                    <Input
                      aria-label={`Özellik ${i + 1} değeri`}
                      placeholder="Değer (örn. 300 mm)"
                      value={s.value}
                      aria-invalid={!!errors[`specs.${i}`]}
                      onChange={(e) => update("specs", form.specs.map((x, j) => (j === i ? { ...x, value: e.target.value } : x)))}
                    />
                    <Button variant="ghost" aria-label={`Özellik ${i + 1} kaldır`} onClick={() => update("specs", form.specs.filter((_, j) => j !== i))}>
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </div>
                  {errors[`specs.${i}`] && <p className="mt-1 text-sm text-danger">{errors[`specs.${i}`]}</p>}
                </li>
              ))}
            </ul>
            <Button variant="secondary" size="sm" onClick={() => update("specs", [...form.specs, { label: "", value: "" }])}>
              <Plus className="size-4" aria-hidden="true" /> Özellik ekle
            </Button>
          </Section>

          <Section title="Birlikte önerilen ürünler" description="Ürün sayfasında 'Bununla birlikte genellikle değiştirilenler' olarak gösterilir (ör. disk ↔ balata ↔ sensör).">
            {form.companionIds.length === 0 && <p className="text-sm text-muted">Henüz önerilen ürün yok.</p>}
            <ul className="space-y-2">
              {form.companionIds.map((id) => {
                const p = products.find((x) => x.id === id);
                return (
                  <li key={id} className="flex items-center justify-between gap-3 rounded-[var(--radius-control)] border border-line px-3 py-2 text-sm">
                    <span className="min-w-0 truncate">{p ? `${p.name} · ${p.sku}` : "Silinmiş ürün"}</span>
                    <Button variant="ghost" size="sm" aria-label={`${p?.name ?? "Ürün"} önerilerden kaldır`} onClick={() => update("companionIds", form.companionIds.filter((x) => x !== id))}>
                      <Trash2 className="size-4" aria-hidden="true" />
                    </Button>
                  </li>
                );
              })}
            </ul>
            <Select
              aria-label="Önerilecek ürün ekle"
              value=""
              onChange={(e) => e.target.value && update("companionIds", [...form.companionIds, e.target.value])}
            >
              <option value="">Önerilecek ürün ekle…</option>
              {products
                .filter((p) => p.id !== product?.id && !form.companionIds.includes(p.id))
                .sort((a, b) => a.name.localeCompare(b.name, "tr"))
                .map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} · {p.sku}
                  </option>
                ))}
            </Select>
          </Section>

          <Section title="Araç uyumluluğu" description="Yalnızca açıkça bilinen kayıtları gir. Benzer motor veya model yılından uyum çıkarma.">
            <CompatibilityEditor
              vehicles={vehicles}
              value={form.compatibility}
              onChange={(rows) => update("compatibility", rows)}
              disabled={form.fitmentType === "universal"}
            />
          </Section>
        </div>

        <div className="space-y-5">
          <Section title="Yayın">
            <FormField label="Durum" htmlFor="pf-status">
              <Select id="pf-status" value={form.status} onChange={(e) => update("status", e.target.value as PublicationStatus)}>
                <option value="draft">Taslak (mağazada görünmez)</option>
                <option value="published">Yayında</option>
              </Select>
            </FormField>
            <label className="flex items-center gap-2.5 text-sm text-ink">
              <input type="checkbox" checked={form.featured} onChange={(e) => update("featured", e.target.checked)} className="size-4 accent-[var(--color-ink)]" />
              Ana sayfada öne çıkar
            </label>
          </Section>

          <Section title="Sınıflandırma">
            <FormField label="Marka" htmlFor="pf-brandId" required error={err("brandId")}>
              <Select id="pf-brandId" value={form.brandId} {...invalid("brandId")} onChange={(e) => update("brandId", e.target.value)}>
                <option value="">Marka seç</option>
                {[...brands]
                  .sort((a, b) => a.name.localeCompare(b.name, "tr"))
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
              </Select>
            </FormField>
            <FormField label="Kategori" htmlFor="pf-categoryId" required error={err("categoryId")}>
              <Select id="pf-categoryId" value={form.categoryId} {...invalid("categoryId")} onChange={(e) => update("categoryId", e.target.value)}>
                <option value="">Alt kategori seç</option>
                {roots.map((root) => (
                  <optgroup key={root.id} label={root.name}>
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
            </FormField>
            <fieldset>
              <legend className="mb-1.5 text-sm font-medium text-ink">Araç bağımlılığı</legend>
              <div className="space-y-2 text-sm">
                {(
                  [
                    ["vehicle-specific", "Araca özel parça", "Uyumluluk kayıtlarıyla eşleşir."],
                    ["universal", "Araca bağlı değil", "Yağ, temizlik ürünü gibi genel ürünler."],
                  ] as const
                ).map(([value, label, hint]) => (
                  <label key={value} className="flex cursor-pointer items-start gap-2.5">
                    <input
                      type="radio"
                      name="fitmentType"
                      checked={form.fitmentType === value}
                      onChange={() => update("fitmentType", value)}
                      className="mt-1 accent-[var(--color-ink)]"
                    />
                    <span>
                      <span className="block text-ink">{label}</span>
                      <span className="block text-xs text-muted">{hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          </Section>

          <Section title="Fiyat ve stok" description="Fiyatlar TL, KDV dahil.">
            <FormField label="Satış fiyatı (₺)" htmlFor="pf-price" required error={err("price")}>
              <Input id="pf-price" inputMode="decimal" value={form.price} {...invalid("price")} onChange={(e) => update("price", e.target.value)} className="tabular" />
            </FormField>
            <FormField label="Liste fiyatı (₺)" htmlFor="pf-compareAtPrice" error={err("compareAtPrice")} hint="İsteğe bağlı; satış fiyatından yüksek olmalı.">
              <Input
                id="pf-compareAtPrice"
                inputMode="decimal"
                value={form.compareAtPrice}
                aria-invalid={!!errors.compareAtPrice}
                aria-describedby={fieldDescribedBy("pf-compareAtPrice", errors.compareAtPrice, "x")}
                onChange={(e) => update("compareAtPrice", e.target.value)}
                className="tabular"
              />
            </FormField>
            <FormField label="Stok adedi" htmlFor="pf-stock" required error={err("stock")}>
              <Input id="pf-stock" inputMode="numeric" value={form.stock} {...invalid("stock")} onChange={(e) => update("stock", e.target.value)} className="tabular" />
            </FormField>
          </Section>
        </div>
      </div>

      <div className="flex justify-end gap-2 border-t border-line pt-5">
        <Button variant="secondary" onClick={() => (dirty ? setConfirmLeave(true) : router.push("/admin/products"))}>
          Vazgeç
        </Button>
        <Button type="submit">{product ? "Değişiklikleri kaydet" : "Ürünü oluştur"}</Button>
      </div>

      <ConfirmDialog
        open={confirmLeave}
        title="Kaydedilmemiş değişiklikler"
        message="Yaptığın değişiklikler kaydedilmedi. Çıkmak istediğine emin misin?"
        confirmLabel="Kaydetmeden çık"
        tone="danger"
        onCancel={() => setConfirmLeave(false)}
        onConfirm={() => {
          setConfirmLeave(false);
          setDirty(false);
          if (!product) setForm(initialState(undefined, []));
          router.push("/admin/products");
        }}
      />
    </form>
  );
}
