import type { Metadata } from "next";
import { ProductForm } from "@/components/admin/ProductForm";

export const metadata: Metadata = { title: "Yeni ürün" };

export default function Page() {
  return <ProductForm />;
}
