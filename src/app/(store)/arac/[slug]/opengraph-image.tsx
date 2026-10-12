import { yearRange } from "@/lib/catalog/vehicles";
import { OG_SIZE, ogCard } from "@/lib/og";
import { seed } from "@/lib/seed";
import { findVehicleBySlug, partsForVehicle, vehicleSlug } from "@/lib/seo";

export const size = OG_SIZE;
export const contentType = "image/png";
export const alt = "Kursat Shop araç sayfası";

export function generateStaticParams() {
  return seed.vehicles.map((v) => ({ slug: vehicleSlug(v) }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const v = findVehicleBySlug(seed.vehicles, slug);
  const count = v ? partsForVehicle(seed.products, seed.categories, seed.compatibility, v.id).confirmed.reduce((n, g) => n + g.products.length, 0) : 0;
  return ogCard({
    eyebrow: v ? `${v.make} · ${yearRange(v)}` : "Araç",
    title: v ? `${v.model} ${v.generation} · ${v.engine}` : "Araç",
    detail: `${count} doğrulanmış uyumlu parça`,
    image: "/products/yay-amortisor.svg",
  });
}
