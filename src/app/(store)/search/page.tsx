import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingFallback, SearchResults } from "@/components/store/ListingPages";
import { toQueryString } from "@/lib/catalog/listing";

export const metadata: Metadata = { title: "Arama" };

async function Content({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  return <SearchResults query={toQueryString(await searchParams)} />;
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <Suspense fallback={<ListingFallback />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
