import type { Metadata } from "next";
import { HelpContent } from "@/components/store/InfoPages";

export const metadata: Metadata = { title: "Yardım ve iletişim" };

export default function Page() {
  return <HelpContent />;
}
