import type { Metadata } from "next";
import { Suspense } from "react";
import { AllProductsListing, ListingFallback } from "@/components/store/ListingPages";
import { toQueryString } from "@/lib/catalog/listing";

export const metadata: Metadata = { title: "Tüm ürünler" };

async function Content({ searchParams }: { searchParams: PageProps<"/products">["searchParams"] }) {
  return <AllProductsListing query={toQueryString(await searchParams)} />;
}

export default function ProductsPage({ searchParams }: PageProps<"/products">) {
  return (
    <Suspense fallback={<ListingFallback />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
