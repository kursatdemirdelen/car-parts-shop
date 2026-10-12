import type { Metadata } from "next";
import { Suspense } from "react";
import { AllProductsListing, ListingFallback } from "@/components/store/ListingPages";
import { JsonLd } from "@/components/seo/JsonLd";
import { toQueryString } from "@/lib/catalog/listing";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = { title: "Tüm ürünler" };

async function Content({ searchParams }: { searchParams: PageProps<"/products">["searchParams"] }) {
  return <AllProductsListing query={toQueryString(await searchParams)} />;
}

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana sayfa", url: absoluteUrl("/") },
          { name: "Tüm ürünler", url: absoluteUrl("/products") },
        ])}
      />
      <Suspense fallback={<ListingFallback />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </>
  );
}
