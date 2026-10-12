import type { Metadata } from "next";
import { VehiclesAdmin } from "@/components/admin/VehiclesAdmin";

export const metadata: Metadata = { title: "Araçlar" };

export default function Page() {
  return <VehiclesAdmin />;
}
