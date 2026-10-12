import type { Metadata } from "next";
import { ShippingReturnsContent } from "@/components/store/InfoPages";

export const metadata: Metadata = { title: "Kargo ve iade" };

export default function Page() {
  return <ShippingReturnsContent />;
}
