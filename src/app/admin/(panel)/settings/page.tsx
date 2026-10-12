import type { Metadata } from "next";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";

export const metadata: Metadata = { title: "Ayarlar" };

export default function Page() {
  return <SettingsAdmin />;
}
