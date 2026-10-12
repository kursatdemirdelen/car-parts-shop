import { Compass } from "lucide-react";
import Link from "next/link";
import { LinkButton } from "@/components/ui/Button";
import { SearchInput } from "@/components/store/SearchInput";
import { Logo } from "@/components/store/StoreHeader";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="container-page flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <main className="container-page flex flex-1 flex-col items-center justify-center py-16 text-center">
        <span className="flex size-14 items-center justify-center rounded-full bg-surface text-muted ring-1 ring-line">
          <Compass className="size-6" aria-hidden="true" />
        </span>
        <p className="mt-6 text-sm font-medium text-muted">404</p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-ink md:text-3xl">Sayfa bulunamadı</h1>
        <p className="mt-2 max-w-md text-sm text-muted">Aradığın sayfa taşınmış veya hiç var olmamış olabilir. Parçayı aramayı dene:</p>
        <div className="mt-6 w-full max-w-md text-left">
          <SearchInput />
        </div>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <LinkButton href="/">Ana sayfa</LinkButton>
          <LinkButton href="/products" variant="secondary">
            Tüm ürünler
          </LinkButton>
        </div>
        <Link href="/help" className="mt-6 text-sm text-muted underline underline-offset-2 hover:text-ink">
          Yardım ve iletişim
        </Link>
      </main>
    </div>
  );
}
