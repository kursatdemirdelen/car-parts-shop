import type { Brand, Product } from "@/lib/types";
import { absoluteUrl } from "./site";

/**
 * schema.org Product + Offer for a product page. Deliberately has no rating or review data:
 * the demo has none, and inventing it would be misleading.
 */
export function productJsonLd(p: Product, brand: Brand | undefined, url: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: p.name,
    description: p.description,
    sku: p.sku,
    ...(p.oemNumbers[0] ? { mpn: p.oemNumbers[0] } : {}),
    ...(brand ? { brand: { "@type": "Brand", name: brand.name } } : {}),
    image: p.images.map((i) => absoluteUrl(i.src)),
    offers: {
      "@type": "Offer",
      url,
      priceCurrency: "TRY",
      price: p.price.toFixed(2),
      availability: p.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
    },
  };
}

export function breadcrumbJsonLd(items: { name: string; url: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({ "@type": "ListItem", position: i + 1, name: item.name, item: item.url })),
  };
}
