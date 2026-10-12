import type { Metadata } from "next";
import { Suspense } from "react";
import { EditProduct } from "@/components/admin/EditProduct";
import { LoadingState } from "@/components/ui/Display";

export const metadata: Metadata = { title: "Ürünü düzenle" };

async function Content({ params }: { params: PageProps<"/admin/products/[id]/edit">["params"] }) {
  const { id } = await params;
  return <EditProduct id={id} />;
}

export default function Page({ params }: PageProps<"/admin/products/[id]/edit">) {
  return (
    <Suspense fallback={<LoadingState rows={6} />}>
      <Content params={params} />
    </Suspense>
  );
}
