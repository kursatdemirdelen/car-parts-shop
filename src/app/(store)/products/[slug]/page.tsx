import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductDetail } from "@/components/product/ProductDetail";
import { LoadingState } from "@/components/ui/Display";
import { seed } from "@/lib/seed";

/** Seed products are prerendered; products created in the admin resolve in the browser. */
export function generateStaticParams() {
  return seed.products.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps<"/products/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const product = seed.products.find((p) => p.slug === slug);
  return { title: product?.name ?? "Ürün", description: product?.description };
}

async function Content({ params }: { params: PageProps<"/products/[slug]">["params"] }) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense
      fallback={
        <div className="container-page py-10">
          <LoadingState label="Ürün yükleniyor…" rows={4} />
        </div>
      }
    >
      <Content params={params} />
    </Suspense>
  );
}
