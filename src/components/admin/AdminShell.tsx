"use client";

import {
  CarFront,
  ClipboardList,
  ExternalLink,
  FolderTree,
  LayoutDashboard,
  Link2,
  LogOut,
  Menu,
  Package,
  PackageCheck,
  Settings,
  Tags,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { Badge, LoadingState } from "@/components/ui/Display";
import { Drawer } from "@/components/ui/Dialog";
import { cn } from "@/lib/format";
import { useAdminSession } from "@/state/admin-session";

const nav = [
  { href: "/admin", label: "Gösterge paneli", icon: LayoutDashboard, exact: true },
  { href: "/admin/products", label: "Ürünler", icon: Package },
  { href: "/admin/kits", label: "Bakım setleri", icon: PackageCheck },
  { href: "/admin/categories", label: "Kategoriler", icon: FolderTree },
  { href: "/admin/brands", label: "Markalar", icon: Tags },
  { href: "/admin/vehicles", label: "Araçlar", icon: CarFront },
  { href: "/admin/compatibility", label: "Uyumluluk", icon: Link2 },
  { href: "/admin/orders", label: "Siparişler", icon: ClipboardList },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings },
];

/** Reads the current path for the active link; streamed in after prerendering (dynamic admin routes). */
function AdminNav({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <Suspense fallback={<AdminNavLinks pathname="" onNavigate={onNavigate} />}>
      <AdminNavWithPath onNavigate={onNavigate} />
    </Suspense>
  );
}

function AdminNavWithPath({ onNavigate }: { onNavigate?: () => void }) {
  return <AdminNavLinks pathname={usePathname()} onNavigate={onNavigate} />;
}

function AdminNavLinks({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  const router = useRouter();
  const { logout } = useAdminSession();
  return (
    <nav aria-label="Yönetim menüsü" className="flex h-full flex-col">
      <ul className="space-y-0.5">
        {nav.map(({ href, label, icon: Icon, exact }) => {
          const active = exact ? pathname === href : pathname === href || pathname.startsWith(`${href}/`);
          return (
            <li key={href}>
              <Link
                href={href}
                onClick={onNavigate}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm font-medium transition-colors",
                  active ? "bg-ink text-white" : "text-ink-soft hover:bg-surface-strong hover:text-ink",
                )}
              >
                <Icon className="size-4" aria-hidden="true" />
                {label}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-auto space-y-0.5 border-t border-line pt-3">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm text-ink-soft hover:bg-surface-strong hover:text-ink"
        >
          <ExternalLink className="size-4" aria-hidden="true" />
          Mağazayı görüntüle
        </Link>
        <button
          type="button"
          onClick={() => {
            logout();
            router.replace("/admin/login");
          }}
          className="flex w-full items-center gap-3 rounded-[var(--radius-control)] px-3 py-2 text-sm text-ink-soft hover:bg-surface-strong hover:text-ink"
        >
          <LogOut className="size-4" aria-hidden="true" />
          Çıkış yap
        </button>
      </div>
    </nav>
  );
}

function AdminBrand() {
  return (
    <Link href="/admin" className="flex items-center gap-2">
      <span className="flex size-8 items-center justify-center rounded-[7px] bg-ink text-[13px] font-bold text-white">KS</span>
      <span className="text-sm font-semibold text-ink">Yönetim</span>
      <Badge>Demo</Badge>
    </Link>
  );
}

/** Admin frame. The session check is a demo navigation gate, not security. */
export function AdminShell({ children }: { children: ReactNode }) {
  const { loggedIn, hydrated } = useAdminSession();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (hydrated && !loggedIn) router.replace("/admin/login");
  }, [hydrated, loggedIn, router]);

  return (
    <div className="flex min-h-dvh bg-surface/60">
      <aside className="sticky top-0 hidden h-dvh w-60 shrink-0 flex-col border-r border-line bg-surface p-4 lg:flex">
        <div className="mb-6 px-1">
          <AdminBrand />
        </div>
        <AdminNav />
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-line bg-white/95 px-4 backdrop-blur lg:hidden">
          <button
            type="button"
            className="-ml-1 inline-flex size-9 items-center justify-center rounded-[var(--radius-control)] hover:bg-surface"
            onClick={() => setMenuOpen(true)}
            aria-label="Menüyü aç"
          >
            <Menu className="size-5" aria-hidden="true" />
          </button>
          <AdminBrand />
        </header>
        <div className="border-b border-[#f1e2bd] bg-warn-soft px-4 py-2 text-center text-xs text-warn md:px-8">
          Demo yönetim paneli: değişiklikler yalnızca bu tarayıcıda saklanır. Giriş güvenli bir kimlik doğrulama değildir.
        </div>
        <main id="main" className="min-w-0 flex-1 px-4 py-6 md:px-8 md:py-8">
          {/*
            Pages render hidden until the demo session check passes (navigation gate, not security).
            The key remounts them once browser data is available, so forms start from stored values, not the seed.
          */}
          {!(hydrated && loggedIn) && <LoadingState label="Yönetim paneli yükleniyor…" rows={4} />}
          <div key={hydrated && loggedIn ? "ready" : "pending"} hidden={!(hydrated && loggedIn)}>
            {children}
          </div>
        </main>
      </div>

      <Drawer open={menuOpen} onClose={() => setMenuOpen(false)} title="Yönetim" side="left">
        <AdminNav onNavigate={() => setMenuOpen(false)} />
      </Drawer>
    </div>
  );
}
