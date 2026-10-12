"use client";

import { CarFront, ChevronDown, Heart, LayoutGrid, LifeBuoy, Menu, ShieldCheck, ShoppingCart, User } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Drawer } from "@/components/ui/Dialog";
import { Popover } from "@/components/ui/Popover";
import { vehicleShortLabel } from "@/lib/catalog/vehicles";
import type { Category } from "@/lib/types";
import { useCart } from "@/state/cart-store";
import { useCatalog } from "@/state/catalog-store";
import { useFavorites } from "@/state/favorites-store";
import { useGarage } from "@/state/garage-store";
import { SearchInput } from "./SearchInput";
import { VehicleBar } from "./VehicleBar";

export function Logo() {
  return (
    <Link href="/" className="flex shrink-0 items-center gap-2 rounded-md">
      <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-[7px] bg-ink text-[13px] font-bold tracking-tight text-white">
        KS
      </span>
      <span className="text-[17px] font-semibold tracking-tight text-ink">
        Kursat Shop<span className="sr-only"> ana sayfa</span>
      </span>
    </Link>
  );
}

function useCategoryTree() {
  const { categories } = useCatalog();
  const roots = categories.filter((c) => c.parentId === null);
  return roots.map((root) => ({ root, children: categories.filter((c) => c.parentId === root.id) }));
}

function CategoryColumns({ tree, onNavigate }: { tree: { root: Category; children: Category[] }[]; onNavigate: () => void }) {
  return (
    <div className="grid gap-6 p-3 sm:grid-cols-3">
      {tree.map(({ root, children }) => (
        <div key={root.id} className="min-w-0">
          <Link
            href={`/categories/${root.slug}`}
            onClick={onNavigate}
            className="text-sm font-semibold text-ink underline-offset-2 hover:underline"
          >
            {root.name}
          </Link>
          <ul className="mt-2 space-y-0.5">
            {children.map((c) => (
              <li key={c.id}>
                <Link
                  href={`/categories/${c.slug}`}
                  onClick={onNavigate}
                  className="block rounded-md px-2 py-1.5 -mx-2 text-sm text-ink-soft hover:bg-surface hover:text-ink"
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

function CountBadge({ count }: { count: number }) {
  if (count <= 0) return null;
  return (
    <span className="absolute -top-0.5 -right-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-ink px-1 text-[11px] font-semibold text-white tabular">
      {count > 99 ? "99+" : count}
    </span>
  );
}

const iconBase =
  "relative h-10 items-center gap-2 rounded-[var(--radius-control)] px-2.5 text-sm font-medium text-ink hover:bg-surface";
const iconLink = `${iconBase} inline-flex`;

export function StoreHeader() {
  const tree = useCategoryTree();
  const { resolved } = useCart();
  const { ids: favoriteIds } = useFavorites();
  const { selectedVehicle } = useGarage();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/85">
      <div className="border-b border-line">
        <div className="container-page flex h-16 items-center gap-2 lg:gap-4">
          <button
            type="button"
            className="-ml-2 inline-flex size-10 items-center justify-center rounded-[var(--radius-control)] hover:bg-surface lg:hidden"
            onClick={() => setMenuOpen(true)}
            aria-label="Menüyü aç"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <Logo />

          <div className="ml-2 hidden lg:block">
            <Popover
              label="Kategoriler"
              align="start"
              panelClassName="w-[640px]"
              trigger={
                <>
                  <LayoutGrid className="size-4" aria-hidden="true" />
                  Kategoriler
                  <ChevronDown className="size-4 text-muted" aria-hidden="true" />
                </>
              }
            >
              {(close) => (
                <>
                  <CategoryColumns tree={tree} onNavigate={close} />
                  <div className="mt-1 border-t border-line px-3 py-2.5">
                    <Link href="/products" onClick={close} className="text-sm font-medium text-ink hover:underline underline-offset-2">
                      Tüm ürünleri gör
                    </Link>
                  </div>
                </>
              )}
            </Popover>
          </div>

          <div className="mx-2 hidden max-w-xl flex-1 md:block">
            <SearchInput />
          </div>

          <nav aria-label="Hesap ve alışveriş" className="ml-auto flex items-center gap-0.5">
            <Link href="/garage" className={`${iconBase} hidden lg:inline-flex`}>
              <CarFront className="size-5" aria-hidden="true" />
              <span className="max-w-40 truncate">{selectedVehicle ? vehicleShortLabel(selectedVehicle) : "Garajım"}</span>
            </Link>
            <Link href="/favorites" className={iconLink} aria-label={`Favoriler (${favoriteIds.length})`}>
              <Heart className="size-5" aria-hidden="true" />
              <CountBadge count={favoriteIds.length} />
            </Link>
            <div className="hidden sm:block">
              <Popover label="Hesap menüsü" trigger={<User className="size-5" aria-hidden="true" />} panelClassName="w-60">
                {(close) => (
                  <div className="flex flex-col">
                    <p className="px-2.5 pt-1.5 pb-2 text-xs text-muted">Müşteri hesabı bu demoda yer almıyor.</p>
                    {[
                      { href: "/garage", label: "Garajım", icon: CarFront },
                      { href: "/favorites", label: "Favoriler", icon: Heart },
                      { href: "/help", label: "Yardım ve iletişim", icon: LifeBuoy },
                      { href: "/admin", label: "Yönetim paneli (demo)", icon: ShieldCheck },
                    ].map(({ href, label, icon: Icon }) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={close}
                        className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-sm text-ink hover:bg-surface"
                      >
                        <Icon className="size-4 text-muted" aria-hidden="true" />
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </Popover>
            </div>
            <Link href="/cart" className={iconLink} aria-label={`Sepet (${resolved.purchasableCount} ürün)`}>
              <ShoppingCart className="size-5" aria-hidden="true" />
              <span className="hidden lg:inline">Sepet</span>
              <CountBadge count={resolved.purchasableCount} />
            </Link>
          </nav>
        </div>
        <div className="container-page pb-3 md:hidden">
          <SearchInput />
        </div>
      </div>
      <VehicleBar />

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Menü" side="left">
        <nav aria-label="Mobil menü" className="space-y-6">
          <ul className="space-y-1">
            {[
              { href: "/garage", label: "Garajım", icon: CarFront },
              { href: "/favorites", label: "Favoriler", icon: Heart },
              { href: "/cart", label: "Sepet", icon: ShoppingCart },
              { href: "/help", label: "Yardım ve iletişim", icon: LifeBuoy },
            ].map(({ href, label, icon: Icon }) => (
              <li key={href}>
                <Link
                  href={href}
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm font-medium text-ink hover:bg-surface"
                >
                  <Icon className="size-4 text-muted" aria-hidden="true" />
                  {label}
                </Link>
              </li>
            ))}
          </ul>
          <div className="border-t border-line pt-4">
            <p className="mb-2 text-xs font-semibold tracking-wider text-muted uppercase">Kategoriler</p>
            <div className="[&>div]:grid-cols-1 [&>div]:p-0">
              <CategoryColumns tree={tree} onNavigate={() => setMenuOpen(false)} />
            </div>
            <Link
              href="/products"
              onClick={() => setMenuOpen(false)}
              className="mt-4 block text-sm font-medium text-ink underline underline-offset-2"
            >
              Tüm ürünleri gör
            </Link>
          </div>
          <div className="border-t border-line pt-4">
            <Link
              href="/admin"
              onClick={() => setMenuOpen(false)}
              className="flex items-center gap-3 rounded-md px-2 py-2.5 text-sm text-muted hover:bg-surface"
            >
              <ShieldCheck className="size-4" aria-hidden="true" />
              Yönetim paneli (demo)
            </Link>
          </div>
        </nav>
      </Drawer>
    </header>
  );
}
