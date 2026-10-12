import type { Metadata } from "next";
import { CheckoutPage } from "@/components/store/CheckoutPage";

export const metadata: Metadata = { title: "Ödeme (demo)" };

export default function Page() {
  return <CheckoutPage />;
}
