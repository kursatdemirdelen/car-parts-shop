import type { Announcement, HeroSlide } from "@/lib/types";

/** Demo storefront showcase. Editable in the admin "Ana sayfa" screen. */
export const heroSlides: HeroSlide[] = [
  {
    id: "slide-arama",
    title: "Doğru parça, ilk seferde",
    subtitle: "OEM numarasıyla ara ya da aracını seç; uyumu doğrulanmış parçaları ayrıca işaretleyelim.",
    ctaLabel: "Parçalara göz at",
    ctaHref: "/products",
    photo: "workshop-lift",
    tone: "dark",
    status: "published",
  },
  {
    id: "slide-bakim",
    title: "Bakımını kaçırma",
    subtitle: "Garajına aracını ekle, km'ni gir; sıradaki bakımı ve uygun parçaları gösterelim.",
    ctaLabel: "Garajıma git",
    ctaHref: "/garage",
    photo: "oil-change",
    tone: "accent",
    status: "published",
  },
  {
    id: "slide-bmw",
    title: "BMW için genişletilmiş katalog",
    subtitle: "E30'dan G-serisine filtre, buji ve fren parçaları; motor ailesine göre doğrulanmış uyum.",
    ctaLabel: "Filtreleri gör",
    ctaHref: "/categories/filtreler",
    photo: "air-filter",
    tone: "dark",
    status: "published",
  },
];

/** Must stay consistent with settings.freeShippingThreshold (a test checks it). */
export const announcement: Announcement = {
  enabled: true,
  text: "2.500 TL üzeri siparişlerde ücretsiz kargo (demo)",
  href: "/shipping-returns",
};
