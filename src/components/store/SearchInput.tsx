"use client";

import { ArrowRight, Search } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useId, useMemo, useRef, useState } from "react";
import { suggest } from "@/lib/catalog/search";
import { cn, formatPrice } from "@/lib/format";
import { useCatalog } from "@/state/catalog-store";

interface SearchInputProps {
  size?: "md" | "lg";
  defaultValue?: string;
  className?: string;
  autoFocus?: boolean;
}

/**
 * Product search with local autocomplete (ARIA combobox pattern).
 * Enter submits to /search; choosing a suggestion opens that product.
 */
export function SearchInput({ size = "md", defaultValue = "", className, autoFocus }: SearchInputProps) {
  const router = useRouter();
  const { products, brands } = useCatalog();
  const [query, setQuery] = useState(defaultValue);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const results = useMemo(() => (query.trim().length >= 2 ? suggest(products, brands, query, 6) : []), [products, brands, query]);
  const brandNames = useMemo(() => new Map(brands.map((b) => [b.id, b.name])), [brands]);
  // Options: products, then a final "see all results" row.
  const optionCount = results.length > 0 ? results.length + 1 : 0;
  const expanded = open && query.trim().length >= 2;

  const goSearch = () => {
    const q = query.trim();
    if (!q) return;
    setOpen(false);
    router.push(`/search?q=${encodeURIComponent(q)}`);
  };

  const choose = (index: number) => {
    if (index >= 0 && index < results.length) {
      setOpen(false);
      setQuery("");
      router.push(`/products/${results[index].slug}`);
    } else {
      goSearch();
    }
  };

  return (
    <form
      role="search"
      className={cn("relative w-full", className)}
      onSubmit={(e) => {
        e.preventDefault();
        choose(active);
      }}
    >
      <label htmlFor={`${listId}-input`} className="sr-only">
        Ürün, OEM numarası veya stok kodu ara
      </label>
      <Search
        className={cn("pointer-events-none absolute top-1/2 left-3.5 -translate-y-1/2 text-muted", size === "lg" ? "size-5" : "size-4")}
        aria-hidden="true"
      />
      <input
        ref={inputRef}
        id={`${listId}-input`}
        type="search"
        role="combobox"
        aria-expanded={expanded}
        aria-controls={expanded && results.length > 0 ? listId : undefined}
        aria-autocomplete="list"
        aria-activedescendant={expanded && active >= 0 ? `${listId}-opt-${active}` : undefined}
        autoComplete="off"
        autoFocus={autoFocus}
        enterKeyHint="search"
        placeholder={size === "lg" ? "örn. 34116860912 veya “ön fren balatası”" : "Ürün, OEM no veya stok kodu ara"}
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setOpen(true);
          setActive(-1);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 120)}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown" && optionCount) {
            e.preventDefault();
            setOpen(true);
            setActive((a) => (a + 1) % optionCount);
          } else if (e.key === "ArrowUp" && optionCount) {
            e.preventDefault();
            setActive((a) => (a <= 0 ? optionCount - 1 : a - 1));
          } else if (e.key === "Escape") {
            setOpen(false);
            setActive(-1);
          }
        }}
        className={cn(
          "w-full rounded-[var(--radius-control)] border bg-white text-ink placeholder:text-subtle transition-colors focus-visible:outline-none [&::-webkit-search-cancel-button]:appearance-none",
          size === "lg"
            ? "h-14 border-ink pr-32 pl-11 text-base shadow-sm focus-visible:ring-4 focus-visible:ring-ink/10"
            : "h-10 border-line-strong pr-3 pl-10 text-sm hover:border-subtle focus-visible:border-ink focus-visible:ring-2 focus-visible:ring-ink/15",
        )}
      />
      {size === "lg" && (
        <button
          type="submit"
          className="absolute top-1.5 right-1.5 bottom-1.5 inline-flex items-center gap-2 rounded-[6px] bg-primary px-4 text-sm font-medium text-white hover:bg-primary-hover"
        >
          Ara
        </button>
      )}

      {expanded && (
        <div className="absolute inset-x-0 top-[calc(100%+6px)] z-50 overflow-hidden rounded-[var(--radius-card)] border border-line bg-white shadow-[var(--shadow-pop)]">
          {results.length === 0 ? (
            <p role="status" className="px-4 py-3 text-sm text-muted">
              Eşleşen ürün yok. OEM numarasını boşluksuz yazmayı deneyin.
            </p>
          ) : (
            <ul id={listId} role="listbox" aria-label="Arama önerileri" className="max-h-[60dvh] overflow-y-auto py-1">
              {results.map((p, i) => (
                <li
                  key={p.id}
                  id={`${listId}-opt-${i}`}
                  role="option"
                  aria-selected={active === i}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => choose(i)}
                  onMouseEnter={() => setActive(i)}
                  className={cn("flex cursor-pointer items-center gap-3 px-3 py-2", active === i && "bg-surface")}
                >
                  <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-surface">
                    <Image src={p.images[0]?.src ?? "/products/fallback.svg"} alt="" fill sizes="40px" unoptimized className="object-contain p-1" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-ink">{p.name}</span>
                    <span className="block truncate text-xs text-muted tabular">
                      {brandNames.get(p.brandId)} · {p.sku}
                      {p.oemNumbers[0] ? ` · OEM ${p.oemNumbers[0]}` : ""}
                    </span>
                  </span>
                  <span className="shrink-0 text-sm font-medium text-ink tabular">{formatPrice(p.price)}</span>
                </li>
              ))}
              <li
                id={`${listId}-opt-${results.length}`}
                role="option"
                aria-selected={active === results.length}
                onMouseDown={(e) => e.preventDefault()}
                onClick={goSearch}
                onMouseEnter={() => setActive(results.length)}
                className={cn(
                  "flex cursor-pointer items-center justify-between border-t border-line px-3 py-2.5 text-sm font-medium text-ink",
                  active === results.length && "bg-surface",
                )}
              >
                “{query.trim()}” için tüm sonuçları gör
                <ArrowRight className="size-4" aria-hidden="true" />
              </li>
            </ul>
          )}
        </div>
      )}
    </form>
  );
}
