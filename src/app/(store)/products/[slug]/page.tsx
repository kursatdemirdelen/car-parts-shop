import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductDetail } from "@/components/product/ProductDetail";
import { LoadingState } from "@/components/ui/Display";
import { JsonLd } from "@/components/seo/JsonLd";
import { seed } from "@/lib/seed";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbJsonLd, productJsonLd } from "@/lib/structured-data";

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
  const p = seed.products.find((x) => x.slug === slug && x.status === "published");
  const category = p && seed.categories.find((c) => c.id === p.categoryId);
  const parent = category?.parentId ? seed.categories.find((c) => c.id === category.parentId) : undefined;
  return (
    <>
      {p && (
        <JsonLd
          data={[
            productJsonLd(p, seed.brands.find((b) => b.id === p.brandId), absoluteUrl(`/products/${p.slug}`)),
            breadcrumbJsonLd([
              { name: "Ana sayfa", url: absoluteUrl("/") },
              ...(parent ? [{ name: parent.name, url: absoluteUrl(`/categories/${parent.slug}`) }] : []),
              ...(category ? [{ name: category.name, url: absoluteUrl(`/categories/${category.slug}`) }] : []),
              { name: p.name, url: absoluteUrl(`/products/${p.slug}`) },
            ]),
          ]}
        />
      )}
      <ProductDetail slug={slug} />
    </>
  );
}

export default function ProductPage({ params }: PageProps<"/products/[slug]">) {
  return (
    <Suspense
      fallback={
        // At least a viewport tall so the footer is not painted in view and then pushed down when content streams in.
        <div className="container-page min-h-dvh py-10">
          <LoadingState label="Ürün yükleniyor…" rows={4} />
        </div>
      }
    >
      <Content params={params} />
    </Suspense>
  );
}
