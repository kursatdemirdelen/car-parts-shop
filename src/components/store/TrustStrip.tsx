import { Headset, PackageCheck, RotateCcw, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { IconBadge } from "@/components/ui/IconBadge";

const items = [
  { icon: PackageCheck, title: "Örnek kargo kuralı", text: "Belirli tutarın üzerinde ücretsiz gönderim (demo).", href: "/shipping-returns" },
  { icon: RotateCcw, title: "Örnek iade koşulu", text: "Kullanılmamış ürünlerde 14 gün iade (demo).", href: "/shipping-returns" },
  { icon: Headset, title: "Uyumluluk danışmanlığı", text: "Emin değilsen sipariş öncesi sor (demo).", href: "/help" },
  { icon: ShieldCheck, title: "Şeffaf uyumluluk", text: "Doğrulanmamış uyumu asla “uyumlu” diye göstermeyiz.", href: "/help" },
];

export function TrustStrip() {
  return (
    <section aria-label="Mağaza bilgileri" className="border-t border-line">
      <ul className="container-page grid gap-px py-2 sm:grid-cols-2 lg:grid-cols-4">
        {items.map(({ icon: Icon, title, text, href }) => (
          <li key={title}>
            <Link href={href} className="flex h-full items-start gap-3 rounded-[var(--radius-card)] p-4 hover:bg-surface">
              <IconBadge icon={Icon} tone="accent" />
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
