import type { Metadata } from "next";
import { LoginPage } from "@/components/admin/LoginPage";

export const metadata: Metadata = { title: "Yönetim girişi (demo)", robots: { index: false } };

export default function Page() {
  return <LoginPage />;
}
