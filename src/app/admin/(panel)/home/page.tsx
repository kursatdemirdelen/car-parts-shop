import type { Metadata } from "next";
import { HomeAdmin } from "@/components/admin/HomeAdmin";

export const metadata: Metadata = { title: "Ana sayfa vitrini" };

export default function Page() {
  return <HomeAdmin />;
}
