import type { Metadata } from "next";
import { BrandsAdmin } from "@/components/admin/BrandsAdmin";

export const metadata: Metadata = { title: "Markalar" };

export default function Page() {
  return <BrandsAdmin />;
}
