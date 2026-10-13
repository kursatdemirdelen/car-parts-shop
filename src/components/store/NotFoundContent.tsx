"use client";

import { ArrowRight, Compass } from "lucide-react";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { EmptyIllustration } from "@/components/ui/EmptyIllustration";
import { IconBadge } from "@/components/ui/IconBadge";
import { vehicleShortLabel } from "@/lib/catalog/vehicles";
import { categoryIcon, categoryTone } from "@/lib/category-style";
import { useCatalog } from "@/state/catalog-store";
import { useGarage } from "@/state/garage-store";
import { useHydrated } from "@/state/persistent-store";
import { SearchInput } from "./SearchInput";

/** Shared 404 body: search, the three root categories and (after hydration) a link for the selected vehicle. */
export function NotFoundContent({
  title = "Sayfa bulunamadı",
  description = "Aradığın sayfa taşınmış veya hiç var olmamış olabilir. Parçayı aramayı ya da bir kategoriden başlamayı dene.",
}: {
  title?: string;
  description?: string;
}) {
  const { categories } = useCatalog();
  const { selectedVehicle } = useGarage();
  const hydrated = useHydrated();
  const roots = categories.filter((c) => c.parentId === null);

  return (
    <div className="flex flex-col items-center text-center">
      <EmptyIllustration icon={Compass} />
      <p className="text-sm font-semibold tracking-widest text-accent">404</p>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink md:text-3xl">{title}</h1>
      <p className="mt-2 max-w-md text-sm text-muted">{description}</p>

      <div className="mt-6 w-full max-w-md text-left">
        <SearchInput />
      </div>

      <ul className="mt-8 grid w-full max-w-2xl gap-3 sm:grid-cols-3">
        {roots.map((root) => (
          <li key={root.id}>
            <Link
              href={`/categories/${root.slug}`}
              className="flex items-center gap-3 rounded-[var(--radius-card)] border border-line bg-white p-3 text-left text-sm font-medium text-ink transition-[box-shadow,transform] duration-[var(--dur-base)] hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <IconBadge icon={categoryIcon(root.slug)} tone={categoryTone(root, categories)} />
              {root.name}
            </Link>
          </li>
        ))}
      </ul>

      {hydrated && selectedVehicle && (
        <Link href="/products?fit=1" className="mt-5 inline-flex items-center gap-1 text-sm font-medium text-accent underline-offset-2 hover:underline">
          {vehicleShortLabel(selectedVehicle)} için parçalar <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      )}

      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <LinkButton href="/">Ana sayfa</LinkButton>
        <LinkButton href="/help" variant="secondary">
          Yardım ve iletişim
        </LinkButton>
      </div>
    </div>
  );
}
