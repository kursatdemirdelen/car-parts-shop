import type { Metadata } from "next";
import { CompatibilityAdmin } from "@/components/admin/CompatibilityAdmin";

export const metadata: Metadata = { title: "Uyumluluk" };

export default function Page() {
  return <CompatibilityAdmin />;
}
