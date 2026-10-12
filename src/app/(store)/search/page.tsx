import type { Metadata } from "next";
import { Suspense } from "react";
import { ListingFallback, SearchResults } from "@/components/store/ListingPages";
import { JsonLd } from "@/components/seo/JsonLd";
import { toQueryString } from "@/lib/catalog/listing";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/structured-data";

export const metadata: Metadata = { title: "Arama", robots: { index: false, follow: true } };

async function Content({ searchParams }: { searchParams: PageProps<"/search">["searchParams"] }) {
  return <SearchResults query={toQueryString(await searchParams)} />;
}

export default function SearchPage({ searchParams }: PageProps<"/search">) {
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana sayfa", url: absoluteUrl("/") },
          { name: "Arama", url: absoluteUrl("/search") },
        ])}
      />
      <Suspense fallback={<ListingFallback />}>
        <Content searchParams={searchParams} />
      </Suspense>
    </>
  );
}
