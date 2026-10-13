"use client";

import { PackageX } from "lucide-react";
import { LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Display";
import { useCatalog } from "@/state/catalog-store";
import { ProductForm } from "./ProductForm";

export function EditProduct({ id }: { id: string }) {
  const { products } = useCatalog();
  const product = products.find((p) => p.id === id);
  if (!product) {
    return (
      <EmptyState
        icon={PackageX}
        title="Ürün bulunamadı"
        description="Bu kayıt bulunamadı veya silinmiş."
        action={<LinkButton href="/admin/products">Ürünlere dön</LinkButton>}
      />
    );
  }
  // Keyed by id so switching between products starts a fresh form.
  return <ProductForm key={product.id} product={product} />;
}
