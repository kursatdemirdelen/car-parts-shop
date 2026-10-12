import type { Metadata } from "next";
import { Suspense } from "react";
import { ProductsAdmin } from "@/components/admin/ProductsAdmin";
import { LoadingState } from "@/components/ui/Display";
import { toQueryString } from "@/lib/catalog/listing";

export const metadata: Metadata = { title: "Ürünler" };

async function Content({ searchParams }: { searchParams: PageProps<"/admin/products">["searchParams"] }) {
  return <ProductsAdmin query={toQueryString(await searchParams)} />;
}

export default function Page({ searchParams }: PageProps<"/admin/products">) {
  return (
    <Suspense fallback={<LoadingState rows={6} />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
