import type { Metadata } from "next";
import { LegalContent } from "@/components/store/InfoPages";

export const metadata: Metadata = { title: "Gizlilik ve yasal bilgiler" };

export default function Page() {
  return <LegalContent />;
}
