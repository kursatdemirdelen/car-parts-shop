"use client";

import { Heart, ShoppingCart } from "lucide-react";
import { Button, type ButtonSize } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/format";
import type { Product } from "@/lib/types";
import { cartActions, cartStore } from "@/state/cart-store";
import { useFavorites } from "@/state/favorites-store";

export function AddToCartButton({
  product,
  quantity = 1,
  fullWidth,
  size = "md",
  compact,
}: {
  product: Product;
  quantity?: number;
  fullWidth?: boolean;
  size?: ButtonSize;
  compact?: boolean;
}) {
  const toast = useToast();
  const soldOut = product.stock <= 0 || product.status !== "published";

  const add = () => {
    const inCart = cartStore.get().items.find((i) => i.productId === product.id)?.quantity ?? 0;
    if (inCart >= product.stock) {
      toast.show(`Stoktaki ${product.stock} adedin tamamı zaten sepetinde.`, "info", { label: "Sepete git", href: "/cart" });
      return;
    }
    if (cartActions.add(product.id, quantity)) {
      const capped = inCart + quantity > product.stock;
      toast.show(capped ? `Stok sınırı nedeniyle sepetteki adet ${product.stock} oldu.` : "Ürün sepete eklendi.", "success", {
        label: "Sepete git",
        href: "/cart",
      });
    } else {
      toast.show("Bu ürün şu an satın alınamıyor.", "error");
    }
  };

  return (
    <Button
      size={size}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        add();
      }}
      disabled={soldOut}
      className={cn(fullWidth && "w-full")}
      aria-label={compact ? (soldOut ? `${product.name} tükendi` : `${product.name} sepete ekle`) : undefined}
    >
      <ShoppingCart className="size-4" aria-hidden="true" />
      {compact ? (soldOut ? "Tükendi" : "Ekle") : soldOut ? "Tükendi" : "Sepete ekle"}
    </Button>
  );
}

export function FavoriteButton({ productId, productName, className }: { productId: string; productName: string; className?: string }) {
  const { has, toggle } = useFavorites();
  const toast = useToast();
  const active = has(productId);
  return (
    <button
      type="button"
      aria-pressed={active}
      aria-label={active ? `${productName} favorilerden çıkar` : `${productName} favorilere ekle`}
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        const nowFavorite = toggle(productId);
        toast.show(nowFavorite ? "Favorilere eklendi." : "Favorilerden çıkarıldı.", "info", nowFavorite ? { label: "Favoriler", href: "/favorites" } : undefined);
      }}
      className={cn(
        "inline-flex size-9 items-center justify-center rounded-full border border-line bg-white/90 text-ink-soft backdrop-blur-sm transition-colors hover:text-ink",
        active && "text-danger hover:text-danger",
        className,
      )}
    >
      <Heart className={cn("size-4", active && "fill-current")} aria-hidden="true" />
    </button>
  );
}
