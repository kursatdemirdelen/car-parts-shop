import { formatPrice } from "@/lib/format";
import { OG_SIZE, ogCard } from "@/lib/og";
import { seed } from "@/lib/seed";

export const size = OG_SIZE;
export const contentType = "image/png";
// The OG renderer's built-in font has no ₺ glyph, so prices are written with "TL".
export const alt = "Kursat Shop ürün görseli";

export function generateStaticParams() {
  return seed.products.map((p) => ({ slug: p.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const p = seed.products.find((x) => x.slug === slug);
  const brand = seed.brands.find((b) => b.id === p?.brandId);
  return ogCard({
    eyebrow: brand?.name ?? "Yedek parça",
    title: p?.name ?? "Ürün",
    detail: p ? `${formatPrice(p.price).replace("₺", "").trim()} TL · ${p.oemNumbers[0] ? `OEM ${p.oemNumbers[0]}` : p.sku}` : "",
    image: p?.images[0]?.src,
  });
}
