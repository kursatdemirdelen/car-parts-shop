"use client";

import { CircleCheck, CircleHelp, CircleSlash, Minus, Plus, Sparkles } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { FITMENT_LABELS, type FitmentState } from "@/lib/catalog/fitment";
import { stockState } from "@/lib/catalog/stock";
import { cn, formatPrice } from "@/lib/format";
import type { ProductImage as ProductImageType } from "@/lib/types";

const FALLBACK = "/products/fallback.svg";

/** Square product image with a fallback when the file is missing or fails to load. */
export function ProductImage({
  image,
  sizes,
  priority,
  className,
}: {
  image?: ProductImageType;
  sizes: string;
  priority?: boolean;
  className?: string;
}) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const src = !image?.src || failedSrc === image.src ? FALLBACK : image.src;
  return (
    <div className={cn("relative aspect-square overflow-hidden bg-surface", className)}>
      <Image
        src={src}
        alt={image?.alt ?? "Ürün görseli yok"}
        fill
        sizes={sizes}
        priority={priority}
        unoptimized={src.endsWith(".svg")}
        className="object-contain p-[6%]"
        onError={() => setFailedSrc(image?.src ?? null)}
      />
    </div>
  );
}

export function PriceDisplay({
  price,
  compareAtPrice,
  size = "sm",
  className,
}: {
  price: number;
  compareAtPrice?: number;
  size?: "sm" | "lg";
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-baseline gap-x-2 tabular", className)}>
      <span className={cn("font-semibold text-ink", size === "lg" ? "text-[1.75rem] tracking-tight" : "text-base")}>
        {formatPrice(price)}
      </span>
      {compareAtPrice !== undefined && compareAtPrice > price && (
        <span className={cn("text-subtle line-through", size === "lg" ? "text-base" : "text-xs")}>
          <span className="sr-only">Liste fiyatı: </span>
          {formatPrice(compareAtPrice)}
        </span>
      )}
    </div>
  );
}

export function StockStatus({ stock, lowThreshold = 5, className }: { stock: number; lowThreshold?: number; className?: string }) {
  const state = stockState(stock, lowThreshold);
  const label = state === "out_of_stock" ? "Tükendi" : state === "low_stock" ? `Son ${stock} adet` : "Stokta";
  const color = state === "out_of_stock" ? "text-danger" : state === "low_stock" ? "text-warn" : "text-success";
  const dot = state === "out_of_stock" ? "bg-danger" : state === "low_stock" ? "bg-warn" : "bg-success";
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", color, className)}>
      <span className={cn("size-1.5 rounded-full", dot)} aria-hidden="true" />
      {label}
    </span>
  );
}

const fitmentStyle: Record<FitmentState, { icon: typeof CircleCheck; className: string }> = {
  confirmed: { icon: CircleCheck, className: "bg-success-soft text-success border-[#cfe7d9]" },
  unverified: { icon: CircleHelp, className: "bg-surface text-ink-soft border-line" },
  unknown: { icon: CircleHelp, className: "bg-surface text-ink-soft border-line" },
  incompatible: { icon: CircleSlash, className: "bg-danger-soft text-danger border-[#f5d0cc]" },
  universal: { icon: Sparkles, className: "bg-surface text-ink-soft border-line" },
};

/** Fitment label. `unknown` is shown exactly like `unverified` — never as a fit. */
export function FitmentBadge({ state, className }: { state: FitmentState; className?: string }) {
  const { icon: Icon, className: tone } = fitmentStyle[state];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        tone,
        className,
      )}
    >
      <Icon className="size-3.5" aria-hidden="true" />
      {FITMENT_LABELS[state]}
    </span>
  );
}

export function QuantitySelector({
  value,
  min = 1,
  max,
  onChange,
  label,
  size = "md",
}: {
  value: number;
  min?: number;
  max: number;
  onChange: (n: number) => void;
  label: string;
  size?: "sm" | "md";
}) {
  const clamp = (n: number) => Math.max(min, Math.min(max, Math.floor(n)));
  const h = size === "sm" ? "h-8" : "h-10";
  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center rounded-[var(--radius-control)] border border-line-strong bg-white", h)}
    >
      <button
        type="button"
        className="flex h-full w-9 items-center justify-center text-ink hover:bg-surface disabled:text-subtle disabled:hover:bg-transparent"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Adedi azalt"
      >
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={min}
        max={max}
        value={value}
        aria-label="Adet"
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isFinite(n) && e.target.value !== "") onChange(clamp(n));
        }}
        className="h-full w-11 border-x border-line text-center text-sm tabular [appearance:textfield] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink/15 [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        className="flex h-full w-9 items-center justify-center text-ink hover:bg-surface disabled:text-subtle disabled:hover:bg-transparent"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Adedi artır"
      >
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
