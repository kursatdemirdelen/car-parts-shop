import type { Metadata } from "next";
import { Suspense } from "react";
import { OrderSuccessPage } from "@/components/store/OrderSuccessPage";
import { LoadingState } from "@/components/ui/Display";

export const metadata: Metadata = { title: "Demo sipariş oluşturuldu" };

async function Content({ searchParams }: { searchParams: PageProps<"/order-success">["searchParams"] }) {
  const { ref } = await searchParams;
  return <OrderSuccessPage reference={typeof ref === "string" ? ref : ""} />;
}

export default function Page({ searchParams }: PageProps<"/order-success">) {
  return (
    <Suspense
      fallback={
        <div className="container-page py-10">
          <LoadingState rows={3} />
        </div>
      }
    >
      <Content searchParams={searchParams} />
    </Suspense>
  );
}
