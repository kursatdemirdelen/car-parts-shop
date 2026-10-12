import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { Suspense } from "react";
import { OemPage } from "@/components/store/OemPage";
import { LoadingState } from "@/components/ui/Display";
import { normalizeCode } from "@/lib/catalog/search";
import { JsonLd } from "@/components/seo/JsonLd";
import { seed } from "@/lib/seed";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { allOemNumbers, productsByOem } from "@/lib/seo";

const decode = (raw: string) => {
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
};

export function generateStaticParams() {
  return allOemNumbers(seed.products).map((number) => ({ number }));
}

export async function generateMetadata({ params }: PageProps<"/oem/[number]">): Promise<Metadata> {
  const oem = normalizeCode(decode((await params).number));
  return {
    title: `OEM ${oem} — uyumlu parçalar`,
    description: `${oem} OEM numarasına karşılık gelen yedek parçalar ve muadilleri.`,
    alternates: { canonical: `/oem/${oem}` },
    // Codes with no demo product are thin pages: keep them out of search indexes.
    ...(productsByOem(seed.products, oem).length ? {} : { robots: { index: false, follow: true } }),
  };
}

async function Content({ params }: { params: PageProps<"/oem/[number]">["params"] }) {
  const raw = decode((await params).number);
  const oem = normalizeCode(raw);
  // One canonical URL per OEM number: "34.11.6.860.912" → "34116860912".
  // The proxy already redirects non-canonical codes; this is a fallback.
  if (!oem) permanentRedirect("/search");
  if (raw !== oem) permanentRedirect(`/oem/${oem}`);
  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Ana sayfa", url: absoluteUrl("/") },
          { name: `OEM ${oem}`, url: absoluteUrl(`/oem/${oem}`) },
        ])}
      />
      <OemPage oem={oem} />
    </>
  );
}

export default function Page({ params }: PageProps<"/oem/[number]">) {
  return (
    <Suspense
      fallback={
        <div className="container-page py-10">
          <LoadingState rows={3} />
        </div>
      }
    >
      <Content params={params} />
    </Suspense>
  );
}
