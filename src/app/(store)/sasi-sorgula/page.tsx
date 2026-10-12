import type { Metadata } from "next";
import { VinPage } from "@/components/store/VinPage";

export const metadata: Metadata = {
  title: "Şasi numarası (VIN) nasıl okunur?",
  description: "Şasi numarasının hangi kısmının ne anlama geldiğini görün; üretici ve model yılına göre uyumlu demo araçları bulun.",
};

export default function Page() {
  return <VinPage />;
}
