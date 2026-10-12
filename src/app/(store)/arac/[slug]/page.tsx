import type { Metadata } from "next";
import { Suspense } from "react";
import { VehiclePage } from "@/components/store/VehiclePage";
import { LoadingState } from "@/components/ui/Display";
import { vehicleLabel } from "@/lib/catalog/vehicles";
import { JsonLd } from "@/components/seo/JsonLd";
import { seed } from "@/lib/seed";
import { absoluteUrl } from "@/lib/site";
import { breadcrumbJsonLd } from "@/lib/structured-data";
import { findVehicleBySlug, vehicleSlug } from "@/lib/seo";

/** Seed vehicles are prerendered; vehicles added in the admin resolve in the browser. */
export function generateStaticParams() {
  return seed.vehicles.map((v) => ({ slug: vehicleSlug(v) }));
}

export async function generateMetadata({ params }: PageProps<"/arac/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const v = findVehicleBySlug(seed.vehicles, slug);
  if (!v) return { title: "Araç" };
  return {
    title: `${vehicleLabel(v)} yedek parçaları`,
    description: `${vehicleLabel(v)} için uyumluluğu doğrulanmış yedek parçalar ve bakım setleri.`,
    alternates: { canonical: `/arac/${slug}` },
  };
}

async function Content({ params }: { params: PageProps<"/arac/[slug]">["params"] }) {
  const { slug } = await params;
  const v = findVehicleBySlug(seed.vehicles, slug);
  return (
    <>
      {v && (
        <JsonLd
          data={breadcrumbJsonLd([
            { name: "Ana sayfa", url: absoluteUrl("/") },
            { name: vehicleLabel(v), url: absoluteUrl(`/arac/${slug}`) },
          ])}
        />
      )}
      <VehiclePage slug={slug} />
    </>
  );
}

export default function Page({ params }: PageProps<"/arac/[slug]">) {
  return (
    <Suspense
      fallback={
        <div className="container-page py-10">
          <LoadingState rows={4} />
        </div>
      }
    >
      <Content params={params} />
    </Suspense>
  );
}
