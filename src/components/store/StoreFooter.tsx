"use client";

import Link from "next/link";
import { REPO_URL } from "@/lib/site";
import { useCatalog } from "@/state/catalog-store";

const columns = [
  {
    title: "Alışveriş",
    links: [
      { href: "/products", label: "Tüm ürünler" },
      { href: "/categories/oem-parcalar", label: "OEM Parçalar" },
      { href: "/categories/performans", label: "Performans" },
      { href: "/categories/bakim-temizlik", label: "Bakım & Temizlik" },
    ],
  },
  {
    title: "Yardım",
    links: [
      { href: "/help", label: "Yardım ve iletişim" },
      { href: "/shipping-returns", label: "Kargo ve iade" },
      { href: "/sasi-sorgula", label: "Şasi numarası nasıl okunur?" },
      { href: "/garage", label: "Garajım" },
      { href: "/cart", label: "Sepetim" },
    ],
  },
  {
    title: "Kurumsal",
    links: [
      { href: "/legal", label: "Gizlilik ve yasal bilgiler" },
      { href: "/admin", label: "Yönetim paneli (demo)" },
    ],
  },
];

export function StoreFooter() {
  const { settings } = useCatalog();
  return (
    <footer className="mt-auto border-t border-line bg-surface">
      <div className="container-page grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
        {columns.map((col) => (
          <div key={col.title}>
            <h2 className="text-sm font-semibold text-ink">{col.title}</h2>
            <ul className="mt-3 space-y-2">
              {col.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-muted hover:text-ink">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
        <div>
          <h2 className="text-sm font-semibold text-ink">İletişim</h2>
          <address className="mt-3 space-y-2 text-sm text-muted not-italic">
            <p>{settings.phone}</p>
            <p>{settings.email}</p>
            <p>{settings.workingHours}</p>
            <p>{settings.address}</p>
          </address>
        </div>
      </div>
      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-1 py-5 text-xs text-muted sm:flex-row sm:justify-between">
          <p>
            © {settings.storeName}. Örnek şablon proje ·{" "}
            <a href={REPO_URL} target="_blank" rel="noreferrer" className="underline underline-offset-2 hover:text-ink">
              GitHub&apos;da kaynak kod
            </a>
          </p>
          <p>Bu site bir demo prototiptir. Ürün, fiyat ve uyumluluk verileri gerçek değildir.</p>
        </div>
      </div>
    </footer>
  );
}
