"use client";

import { Info, ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { ProductImage } from "@/components/product/ProductBits";
import { Button, LinkButton } from "@/components/ui/Button";
import { Breadcrumbs, EmptyState, LoadingState, PageHeader } from "@/components/ui/Display";
import { FormField, Input, Textarea, fieldDescribedBy } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { formatPrice } from "@/lib/format";
import { createOrder } from "@/lib/orders";
import { PAYMENT_METHOD_LABELS, type Address, type PaymentMethod } from "@/lib/types";
import { validateAddress, type FieldErrors } from "@/lib/validation";
import { cartActions, useCart } from "@/state/cart-store";
import { catalogActions, catalogStore, useCatalog } from "@/state/catalog-store";
import { OrderSummary } from "./CartPage";

const emptyAddress: Address = { fullName: "", phone: "", email: "", city: "", district: "", line: "", postalCode: "" };

const fieldOrder: (keyof Address)[] = ["fullName", "email", "phone", "city", "district", "line"];

export function CheckoutPage() {
  const router = useRouter();
  const toast = useToast();
  const { hydrated, settings } = useCatalog();
  const { cart, resolved } = useCart();
  const [address, setAddress] = useState<Address>(emptyAddress);
  const [payment, setPayment] = useState<PaymentMethod>("cash-on-delivery");
  const [note, setNote] = useState("");
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);

  const set = (key: keyof Address) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress((a) => ({ ...a, [key]: e.target.value }));
    if (errors[key]) setErrors((x) => ({ ...x, [key]: undefined }));
  };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const found = validateAddress(address);
    setErrors(found);
    const firstInvalid = fieldOrder.find((k) => found[k]);
    if (firstInvalid) {
      document.getElementById(`checkout-${firstInvalid}`)?.focus();
      return;
    }
    setSubmitting(true);
    const data = catalogStore.get();
    const result = createOrder({
      cart,
      products: data.products,
      settings: data.settings,
      address: { ...address, postalCode: address.postalCode?.trim() || undefined },
      paymentMethod: payment,
      note,
      now: new Date(),
    });
    if ("error" in result) {
      setSubmitting(false);
      toast.show(result.error, "error", { label: "Sepete dön", href: "/cart" });
      return;
    }
    catalogActions.placeOrder(result.order, result.updatedProducts);
    cartActions.clear();
    setAddress(emptyAddress);
    setNote("");
    setSubmitting(false);
    router.push(`/order-success?ref=${encodeURIComponent(result.order.reference)}`);
  };

  const field = (key: keyof Address, label: string, props: React.ComponentProps<typeof Input> = {}, required = true) => (
    <FormField label={label} htmlFor={`checkout-${key}`} error={errors[key]} required={required}>
      <Input
        id={`checkout-${key}`}
        name={key}
        value={address[key] ?? ""}
        onChange={set(key)}
        aria-invalid={!!errors[key]}
        aria-describedby={fieldDescribedBy(`checkout-${key}`, errors[key])}
        {...props}
      />
    </FormField>
  );

  return (
    <div className="container-page py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", href: "/" }, { label: "Sepet", href: "/cart" }, { label: "Ödeme" }]} />
      <PageHeader className="mt-4" title="Ödeme" />
      <div className="mt-4 flex items-start gap-2.5 rounded-[var(--radius-card)] border border-line bg-surface px-4 py-3 text-sm text-ink-soft">
        <Info className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
        <p>
          Bu bir <strong className="font-semibold text-ink">demo ödeme sayfasıdır</strong>. Gerçek ödeme alınmaz, kart bilgisi istenmez ve
          sipariş gönderilmez. Girdiğin bilgiler yalnızca bu tarayıcıda saklanır.
        </p>
      </div>

      <div className="mt-6">
        {!hydrated ? (
          <LoadingState rows={4} />
        ) : !resolved.canCheckout ? (
          <EmptyState
            icon={ShoppingCart}
            title={resolved.lines.length === 0 ? "Sepetin boş" : "Sepetinde düzeltilmesi gereken ürünler var"}
            description={
              resolved.lines.length === 0
                ? "Ödemeye geçmek için önce sepetine ürün ekle."
                : "Satışta olmayan veya stoğu yetersiz ürünleri sepetinde düzelttikten sonra devam edebilirsin."
            }
            action={<LinkButton href={resolved.lines.length === 0 ? "/products" : "/cart"}>{resolved.lines.length === 0 ? "Ürünlere göz at" : "Sepete dön"}</LinkButton>}
          />
        ) : (
          <form noValidate onSubmit={submit} className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
            <div className="space-y-6">
              <fieldset className="rounded-[var(--radius-card)] border border-line p-5">
                <legend className="px-1 text-base font-semibold text-ink">1. İletişim bilgileri</legend>
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  {field("fullName", "Ad soyad", { autoComplete: "name" })}
                  {field("email", "E-posta", { type: "email", autoComplete: "email", inputMode: "email" })}
                  {field("phone", "Telefon", { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "05xx xxx xx xx" })}
                </div>
              </fieldset>

              <fieldset className="rounded-[var(--radius-card)] border border-line p-5">
                <legend className="px-1 text-base font-semibold text-ink">2. Teslimat adresi</legend>
                <div className="mt-2 grid gap-4 sm:grid-cols-2">
                  {field("city", "İl", { autoComplete: "address-level1" })}
                  {field("district", "İlçe", { autoComplete: "address-level2" })}
                  <div className="sm:col-span-2">{field("line", "Adres", { autoComplete: "street-address", placeholder: "Mahalle, sokak, bina ve daire no" })}</div>
                  {field("postalCode", "Posta kodu", { autoComplete: "postal-code", inputMode: "numeric" }, false)}
                </div>
              </fieldset>

              <fieldset className="rounded-[var(--radius-card)] border border-line p-5">
                <legend className="px-1 text-base font-semibold text-ink">3. Ödeme yöntemi</legend>
                <div className="mt-2 grid gap-3 sm:grid-cols-2">
                  {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethod[]).map((m) => (
                    <label
                      key={m}
                      className="flex cursor-pointer items-start gap-3 rounded-[var(--radius-control)] border border-line p-3 has-[:checked]:border-ink has-[:checked]:bg-surface"
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={m}
                        checked={payment === m}
                        onChange={() => setPayment(m)}
                        className="mt-0.5 accent-[var(--color-ink)]"
                      />
                      <span>
                        <span className="block text-sm font-medium text-ink">{PAYMENT_METHOD_LABELS[m]}</span>
                        <span className="block text-xs text-muted">
                          {m === "cash-on-delivery" ? "Teslimatta ödeme simülasyonu." : "Havale talimatı simülasyonu."} Gerçek ödeme alınmaz.
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
                <div className="mt-4">
                  <FormField label="Sipariş notu" htmlFor="checkout-note" hint="İsteğe bağlı. Örn. şasi numarası veya teslimat notu.">
                    <Textarea id="checkout-note" value={note} onChange={(e) => setNote(e.target.value)} rows={3} aria-describedby="checkout-note-hint" />
                  </FormField>
                </div>
              </fieldset>
            </div>

            <div className="lg:sticky lg:top-32 lg:self-start">
              <OrderSummary resolved={resolved} settings={settings}>
                <ul className="mb-4 max-h-64 space-y-3 overflow-y-auto border-b border-line pb-4">
                  {resolved.lines.map(({ item, product, lineTotal }) => (
                    <li key={item.productId} className="flex items-center gap-3 text-sm">
                      <span className="w-12 shrink-0 overflow-hidden rounded-md border border-line">
                        <ProductImage image={product?.images[0]} sizes="48px" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="line-clamp-2 text-ink">{product?.name}</span>
                        <span className="text-xs text-muted tabular">{item.quantity} adet</span>
                      </span>
                      <span className="shrink-0 text-ink tabular">{formatPrice(lineTotal)}</span>
                    </li>
                  ))}
                </ul>
                <Button type="submit" size="lg" className="w-full" disabled={submitting}>
                  Siparişi tamamla (demo)
                </Button>
                <p className="text-center text-xs text-muted">Siparişi tamamlayarak bir demo kaydı oluşturursun; ücret alınmaz.</p>
              </OrderSummary>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
