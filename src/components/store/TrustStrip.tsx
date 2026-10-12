import { Headset, PackageCheck, RotateCcw, ShieldCheck } from "lucide-react";
import Link from "next/link";

const items = [
  { icon: PackageCheck, title: "Hızlı kargo", text: "Belirli tutarın üzerinde ücretsiz gönderim.", href: "/shipping-returns" },
  { icon: RotateCcw, title: "14 gün iade", text: "Kullanılmamış ürünlerde kolay iade.", href: "/shipping-returns" },
  { icon: Headset, title: "Parça danışmanlığı", text: "Uyumluluktan emin değilsen bize sor.", href: "/help" },
  { icon: ShieldCheck, title: "Şeffaf uyumluluk", text: "Doğrulanmamış uyumu asla “uyumlu” diye göstermeyiz.", href: "/help" },
];

export function TrustStrip() {
  return (
    <section aria-label="Mağaza bilgileri" className="border-t border-line">
      <ul className="container-page grid gap-px py-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text, href }) => (
          <li key={title}>
            <Link href={href} className="flex h-full items-start gap-3 rounded-[var(--radius-card)] p-4 hover:bg-surface">
              <Icon className="mt-0.5 size-5 shrink-0 text-ink" aria-hidden="true" />
              <span>
                <span className="block text-sm font-semibold text-ink">{title}</span>
                <span className="mt-0.5 block text-sm text-muted">{text}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
