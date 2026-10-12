import type { Metadata } from "next";
import { Suspense } from "react";
import { CategoryListing, ListingFallback } from "@/components/store/ListingPages";
import { toQueryString } from "@/lib/catalog/listing";
import { JsonLd } from "@/components/seo/JsonLd";
import { seed } from "@/lib/seed";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/structured-data";

/** Seed categories are prerendered; categories created in the admin resolve in the browser. */
export function generateStaticParams() {
  return seed.categories.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps<"/categories/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const category = seed.categories.find((c) => c.slug === slug);
  return { title: category?.name ?? "Kategori", description: category?.description };
}

async function CategoryContent({ params, searchParams }: PageProps<"/categories/[slug]">) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const category = seed.categories.find((c) => c.slug === slug);
  const parent = category?.parentId ? seed.categories.find((c) => c.id === category.parentId) : undefined;
  return (
    <>
      {category && (
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Ana sayfa", url: absoluteUrl("/") },
            ...(parent ? [{ name: parent.name, url: absoluteUrl(`/categories/${parent.slug}`) }] : []),
            { name: category.name, url: absoluteUrl(`/categories/${category.slug}`) },
          ])}
        />
      )}
      <CategoryListing slug={slug} query={toQueryString(sp)} />
    </>
  );
}

export default function CategoryPage(props: PageProps<"/categories/[slug]">) {
  return (
    <Suspense fallback={<ListingFallback />}>
      <CategoryContent {...props} />
    </Suspense>
  );
}
