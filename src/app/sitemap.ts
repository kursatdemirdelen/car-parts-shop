import type { MetadataRoute } from "next";
import { seed } from "@/lib/seed";
import { allOemNumbers, vehicleSlug } from "@/lib/seo";
import { absoluteUrl } from "@/lib/site";

/** Storefront URLs built from the demo catalog. Admin routes are excluded. */
export default function sitemap(): MetadataRoute.Sitemap {
  const staticPaths = ["/", "/products", "/garage", "/sasi-sorgula", "/help", "/shipping-returns", "/legal"];
  return [
    ...staticPaths.map((p) => ({ url: absoluteUrl(p), changeFrequency: "weekly" as const, priority: p === "/" ? 1 : 0.5 })),
    ...seed.categories.map((c) => ({ url: absoluteUrl(`/categories/${c.slug}`), changeFrequency: "weekly" as const, priority: 0.7 })),
    ...seed.products
      .filter((p) => p.status === "published")
      .map((p) => ({ url: absoluteUrl(`/products/${p.slug}`), lastModified: p.updatedAt, priority: 0.8 })),
    ...seed.vehicles.map((v) => ({ url: absoluteUrl(`/arac/${vehicleSlug(v)}`), priority: 0.6 })),
    ...allOemNumbers(seed.products).map((n) => ({ url: absoluteUrl(`/oem/${n}`), priority: 0.6 })),
  ];
}
