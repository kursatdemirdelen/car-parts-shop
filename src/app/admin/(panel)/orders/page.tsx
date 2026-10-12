import type { Metadata } from "next";
import { Suspense } from "react";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";
import { LoadingState } from "@/components/ui/Display";

export const metadata: Metadata = { title: "Siparişler" };

async function Content({ searchParams }: { searchParams: PageProps<"/admin/orders">["searchParams"] }) {
  const { order } = await searchParams;
  return <OrdersAdmin initialOrderId={typeof order === "string" ? order : undefined} />;
}

export default function Page({ searchParams }: PageProps<"/admin/orders">) {
  return (
    <Suspense fallback={<LoadingState rows={5} />}>
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
