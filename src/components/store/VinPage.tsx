"use client";

import { useRouter } from "next/navigation";
import { Breadcrumbs, PageHeader } from "@/components/ui/Display";
import { useToast } from "@/components/ui/Toast";
import { vehicleLabel } from "@/lib/catalog/vehicles";
import { garageActions } from "@/state/garage-store";
import { VinLookup } from "./VinLookup";

const parts = [
  ["1–3", "Üretici kodu (WMI)", "Üreticiyi ve üretim bölgesini gösterir. Standart bir tablodan çözülür (ör. WBA = BMW)."],
  ["4–9", "Araç tanımı (VDS)", "Model, kasa, motor gibi bilgiler. Üreticiye özeldir; çözmek için üreticinin kendi verisi gerekir."],
  ["10", "Model yılı (tahmini)", "Kuzey Amerika ve Çin'de zorunlu bir yıl kodudur, 30 yılda bir tekrar eder (ör. 5 = 2005 veya 2035). Avrupa araçlarında zorunlu değildir; bazı üreticiler bu haneyi başka amaçla kullanır. Bu yüzden yalnızca tahmin olarak kullanırız."],
  ["11", "Fabrika", "Aracın üretildiği tesis. Üreticiye özeldir."],
  ["12–17", "Seri numarası", "Aracın üretim sıra numarası."],
] as const;

export function VinPage() {
  const router = useRouter();
  const toast = useToast();
  return (
    <div className="container-page max-w-4xl py-6 md:py-8">
      <Breadcrumbs items={[{ label: "Ana sayfa", href: "/" }, { label: "Şasi numarası" }]} />
      <PageHeader
        className="mt-4"
        title="Şasi numarası (VIN) nasıl okunur?"
        description="Şasi numaranı gir; standartta herkese açık olan kısımları çözüp sana uyabilecek demo araçları gösterelim. Neyi çözemediğimizi de açıkça söyleriz."
      />

      <section className="mt-8 rounded-[var(--radius-card)] border border-line p-5" aria-labelledby="vin-try">
        <h2 id="vin-try" className="mb-4 text-base font-semibold text-ink">
          Şasi numaranı çözümle
        </h2>
        <VinLookup
          explain
          onChoose={(v) => {
            garageActions.choose(v.id);
            toast.show(`${vehicleLabel(v)} garajına eklendi ve seçildi.`);
            router.push("/products?fit=1");
          }}
        />
      </section>

      <section className="mt-10" aria-labelledby="vin-parts">
        <h2 id="vin-parts" className="text-lg font-semibold tracking-tight text-ink">
          17 karakterin anlamı
        </h2>
        <dl className="mt-4 divide-y divide-line rounded-[var(--radius-card)] border border-line text-sm">
          {parts.map(([pos, name, text]) => (
            <div key={pos} className="grid gap-1 px-4 py-3 sm:grid-cols-[6rem_12rem_minmax(0,1fr)] sm:gap-4">
              <dt className="font-mono text-muted tabular">{pos}</dt>
              <dd className="font-medium text-ink">{name}</dd>
              <dd className="text-ink-soft">{text}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-4 text-sm leading-relaxed text-muted">
          Yapı ISO 3779 standardıyla tanımlıdır. Tam çözümleme (ör. BMW&apos;de model ve motor kodu) üreticinin parça kataloğu veya ücretli
          veri sağlayıcıları gerektirir; bu demo bu veriyi kullanmaz ve tahmin yürütmez. Bu sayfaya girilen şasi numarası hiçbir yere
          gönderilmez.
        </p>
      </section>
    </div>
  );
}
