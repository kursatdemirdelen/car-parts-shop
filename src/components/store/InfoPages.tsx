"use client";

import { Clock, Mail, MapPin, Phone } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";
import { Breadcrumbs, DemoNotice, PageHeader } from "@/components/ui/Display";
import { formatPrice } from "@/lib/format";
import { useCatalog } from "@/state/catalog-store";

function InfoLayout({ title, description, crumb, children }: { title: string; description: string; crumb: string; children: ReactNode }) {
  return (
    <div className="container-page max-w-3xl py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", href: "/" }, { label: crumb }]} />
      <PageHeader className="mt-4" title={title} description={description} />
      <div className="mt-8 space-y-10 text-sm leading-relaxed text-ink-soft [&_h2]:mb-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-ink [&_li]:ml-5 [&_li]:list-disc [&_p+p]:mt-3 [&_ul]:space-y-1.5">
        {children}
      </div>
    </div>
  );
}

const faqs = [
  {
    q: "OEM numarasını nereden bulurum?",
    a: "OEM numarası, aracın üreticisinin parçaya verdiği numaradır. Genellikle eski parçanın üzerinde, servis faturalarında veya yetkili servisin parça kataloğunda yer alır. Arama kutusuna boşluk veya nokta ile de yazabilirsin; örneğin “34 11 6 860 912” ve “34116860912” aynı sonucu verir.",
  },
  {
    q: "“Doğrulanmış uyum” ile “Doğrulanmamış” arasındaki fark nedir?",
    a: "“Doğrulanmış uyum”, ürünün seçtiğin araçla uyumlu olduğuna dair açık bir kaydımız olduğu anlamına gelir. “Doğrulanmamış” ise ya kaydın henüz kontrol edilmediğini ya da hiç kaydımız olmadığını gösterir; bu durum ürünün uyumlu olduğu anlamına gelmez. Emin değilsen sipariş öncesi şasi numaranla bize yaz.",
  },
  {
    q: "Şasi numaramla parça bulabilir miyim?",
    a: "Şasi numaranın üretici ve model yılı kısımlarını çözüp demo araçları buna göre daraltabiliyoruz. Model, kasa ve motor bilgisi üreticiye özel olduğu için son seçimi sen yaparsın. Ayrıntılar için “Şasi numarası nasıl okunur?” sayfasına (/sasi-sorgula) göz at.",
  },
  {
    q: "Stok kodu ile OEM numarası aynı şey mi?",
    a: "Hayır. Stok kodu (ör. KS-FR-1002) Kursat Shop’un kendi ürün kodudur. OEM numarası ise araç üreticisinin parça numarasıdır. Aramada ikisini de kullanabilirsin.",
  },
  {
    q: "Bu sitede gerçekten sipariş verebilir miyim?",
    a: "Hayır. Bu site bir demo prototiptir. Ödeme adımı simülasyondur; kart bilgisi istenmez, ödeme alınmaz ve sipariş gönderilmez.",
  },
];

export function HelpContent() {
  const { settings } = useCatalog();
  const contact = [
    { icon: Phone, label: "Telefon", value: settings.phone },
    { icon: Mail, label: "E-posta", value: settings.email },
    { icon: Clock, label: "Çalışma saatleri", value: settings.workingHours },
    { icon: MapPin, label: "Adres", value: settings.address },
  ];
  return (
    <InfoLayout crumb="Yardım" title="Yardım ve iletişim" description="Doğru parçayı bulmak için sık sorulan sorular ve bize ulaşma yolları.">
      <section aria-labelledby="contact">
        <h2 id="contact">İletişim</h2>
        <ul className="grid gap-3 sm:grid-cols-2 [&>li]:ml-0 [&>li]:list-none">
          {contact.map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex items-start gap-3 rounded-[var(--radius-card)] border border-line p-4">
              <Icon className="mt-0.5 size-4 shrink-0 text-muted" aria-hidden="true" />
              <span>
                <span className="block text-xs text-muted">{label}</span>
                <span className="block text-ink">{value}</span>
              </span>
            </li>
          ))}
        </ul>
        <DemoNotice className="mt-3">İletişim bilgileri demo amaçlıdır; bu kanallardan yanıt verilmez.</DemoNotice>
      </section>

      <section aria-labelledby="faq">
        <h2 id="faq">Sık sorulan sorular</h2>
        <div className="divide-y divide-line rounded-[var(--radius-card)] border border-line">
          {faqs.map((f) => (
            <details key={f.q} className="group px-4 py-3">
              <summary className="cursor-pointer list-none font-medium text-ink marker:hidden [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-4">
                  {f.q}
                  <span aria-hidden="true" className="text-muted transition-transform group-open:rotate-45">
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-2 text-ink-soft">{f.a}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="more">
        <h2 id="more">Diğer bilgiler</h2>
        <p>
          Kargo ve iade koşulları için{" "}
          <Link href="/shipping-returns" className="font-medium text-ink underline underline-offset-2">
            Kargo ve iade
          </Link>
          , verilerinin nasıl saklandığı için{" "}
          <Link href="/legal" className="font-medium text-ink underline underline-offset-2">
            Gizlilik ve yasal bilgiler
          </Link>{" "}
          sayfasına göz at.
        </p>
      </section>
    </InfoLayout>
  );
}

export function ShippingReturnsContent() {
  const { settings } = useCatalog();
  return (
    <InfoLayout crumb="Kargo ve iade" title="Kargo ve iade" description="Demo mağazanın gönderim ve iade kuralları.">
      <DemoNotice>Bu sayfadaki koşullar örnek metindir. Demo sitede gerçek gönderim veya iade yapılmaz.</DemoNotice>
      <section aria-labelledby="shipping">
        <h2 id="shipping">Kargo</h2>
        <ul>
          <li>{formatPrice(settings.freeShippingThreshold)} ve üzeri siparişlerde kargo ücretsizdir.</li>
          <li>Bu tutarın altındaki siparişlerde kargo ücreti {formatPrice(settings.shippingFee)}’dir.</li>
          <li>Stokta olan ürünler örnek senaryoda 1–2 iş günü içinde kargoya verilir. Gerçek zamanlı teslimat tahmini sunulmaz.</li>
          <li>Fiyatlara KDV dahildir.</li>
        </ul>
      </section>
      <section aria-labelledby="returns">
        <h2 id="returns">İade</h2>
        <p>Kullanılmamış ve ambalajı açılmamış ürünler, teslimden itibaren 14 gün içinde iade edilebilir (örnek koşul).</p>
        <ul>
          <li>Montajı yapılmış veya kullanılmış parçalar iade kapsamı dışındadır.</li>
          <li>Sipariş öncesi uyumluluğu doğrulanmamış ürünlerde, iade sürecini kolaylaştırmak için şasi numaranla bize danışmanı öneririz.</li>
          <li>Hatalı veya hasarlı gelen ürünlerde kargo ücreti mağaza tarafından karşılanır.</li>
        </ul>
      </section>
    </InfoLayout>
  );
}

export function LegalContent() {
  return (
    <InfoLayout crumb="Gizlilik ve yasal" title="Gizlilik ve yasal bilgiler" description="Bu demo sitenin verileri nasıl işlediği ve sınırları.">
      <DemoNotice>Örnek metindir. Bu metin hukuki tavsiye değildir; gerçek bir mağaza için KVKK uyumlu metinler bir uzmanla hazırlanmalıdır.</DemoNotice>
      <section aria-labelledby="storage">
        <h2 id="storage">Verilerin nerede saklanır?</h2>
        <p>
          Bu prototipin bir sunucusu veya veritabanı yoktur. Sepet, favoriler, garaj, demo siparişler ve yönetim panelinde yapılan
          değişiklikler yalnızca tarayıcının yerel depolama alanında (localStorage) tutulur.
        </p>
        <ul>
          <li>Bu veriler başka kullanıcılarla veya cihazlarla paylaşılmaz.</li>
          <li>Tarayıcı verilerini temizlediğinde bu bilgiler silinir.</li>
          <li>Yerel depolama güvenli veya kalıcı bir veri saklama yöntemi değildir; gerçek bir veritabanının yerini tutmaz.</li>
        </ul>
      </section>
      <section aria-labelledby="personal">
        <h2 id="personal">Kişisel veriler</h2>
        <p>
          Ödeme sayfasında girdiğin ad, iletişim ve adres bilgileri yalnızca demo siparişi göstermek için bu tarayıcıda saklanır ve hiçbir
          yere gönderilmez. Kart bilgisi istenmez. Gerçek kişisel bilgilerini girmemeni öneririz.
        </p>
      </section>
      <section aria-labelledby="admin">
        <h2 id="admin">Yönetim paneli</h2>
        <p>
          Yönetim panelindeki giriş yalnızca gezinme ve sunum amaçlıdır. Tarayıcıda tutulan bir işarete dayanır ve gerçek bir kimlik
          doğrulama veya yetkilendirme sağlamaz. Canlı kullanımdan önce sunucu taraflı güvenli kimlik doğrulama eklenmelidir.
        </p>
      </section>
      <section aria-labelledby="content">
        <h2 id="content">İçerik</h2>
        <p>
          Ürün adları, fiyatlar, OEM numaraları, teknik özellikler ve uyumluluk kayıtları demo verisidir. Marka adları yalnızca örnek katalog
          içeriği olarak kullanılmıştır ve ilgili markalarla bir ilişki ifade etmez.
        </p>
      </section>
    </InfoLayout>
  );
}
