"use client";

import Link from "next/link";
import type { FitmentState } from "@/lib/catalog/fitment";
import type { Product } from "@/lib/types";
import { AddToCartButton, FavoriteButton } from "./ProductActions";
import { FitmentBadge, PriceDisplay, ProductImage, StockStatus } from "./ProductBits";

interface ProductCardProps {
  product: Product;
  brandName: string;
  fitment?: FitmentState;
  priority?: boolean;
}

export function ProductCard({ product, brandName, fitment, priority }: ProductCardProps) {
  const href = `/products/${product.slug}`;
  const code = product.oemNumbers[0] ? `OEM ${product.oemNumbers[0]}` : product.sku;

  return (
    <article className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-line bg-white transition-shadow hover:shadow-[var(--shadow-pop)]">
      <div className="relative">
        <ProductImage
          image={product.images[0]}
          sizes="(min-width: 1280px) 300px, (min-width: 768px) 33vw, 50vw"
          priority={priority}
          className="transition-transform duration-300 group-hover:scale-[1.02]"
        />
        <FavoriteButton productId={product.id} productName={product.name} className="absolute top-2 right-2 z-10" />
      </div>

      <div className="flex flex-1 flex-col gap-1.5 p-3 sm:p-4">
        <p lang="en" className="text-[11px] font-semibold tracking-wider text-muted uppercase">
          {brandName}
        </p>
        <h3 className="line-clamp-2 min-h-[2.5rem] text-sm leading-5 font-medium text-ink">
          {/* The whole card is clickable through this link's ::after overlay. */}
          <Link href={href} className="after:absolute after:inset-0 focus-visible:outline-none after:focus-visible:rounded-[var(--radius-card)] after:focus-visible:outline-2 after:focus-visible:outline-ink">
            {product.name}
          </Link>
        </h3>
        <p className="truncate text-xs text-subtle tabular" title={code}>
          {code}
        </p>
        {fitment && <FitmentBadge state={fitment} className="self-start" />}

        <div className="mt-auto flex flex-col gap-2 pt-2">
          <div className="flex items-end justify-between gap-2">
            <PriceDisplay price={product.price} compareAtPrice={product.compareAtPrice} />
            <StockStatus stock={product.stock} />
          </div>
          <div className="relative z-10">
            <AddToCartButton product={product} fullWidth size="sm" />
          </div>
        </div>
      </div>
    </article>
  );
}
