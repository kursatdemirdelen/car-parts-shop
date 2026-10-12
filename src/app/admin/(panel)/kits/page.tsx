import type { Metadata } from "next";
import { KitsAdmin } from "@/components/admin/KitsAdmin";

export const metadata: Metadata = { title: "Bakım setleri" };

export default function Page() {
  return <KitsAdmin />;
}
