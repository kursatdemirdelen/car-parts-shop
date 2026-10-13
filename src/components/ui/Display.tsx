import { ChevronRight } from "lucide-react";
import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import { cn } from "@/lib/format";

export type BadgeTone = "neutral" | "accent" | "success" | "warn" | "danger";

const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-surface text-ink-soft border-line",
  accent: "bg-accent-soft text-accent border-[#9fd0f2]",
  success: "bg-success-soft text-success border-[#cfe7d9]",
  warn: "bg-warn-soft text-warn border-[#f1e2bd]",
  danger: "bg-danger-soft text-danger border-[#f5d0cc]",
};

export function Badge({ tone = "neutral", className, children }: { tone?: BadgeTone; className?: string; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium whitespace-nowrap",
        badgeTones[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}

interface EmptyStateProps {
  icon?: ComponentType<{ className?: string; "aria-hidden"?: boolean }>;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}

export function EmptyState({ icon: Icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface/50 px-6 py-12 text-center",
        className,
      )}
    >
      {Icon && (
        <span className="mb-4 flex size-12 items-center justify-center rounded-full bg-accent-soft text-accent">
          <Icon className="size-5" aria-hidden />
        </span>
      )}
      <h2 className="text-base font-semibold text-ink">{title}</h2>
      {description && <p className="mt-1.5 max-w-md text-sm leading-relaxed text-muted">{description}</p>}
      {action && <div className="mt-5 flex flex-wrap justify-center gap-2">{action}</div>}
    </div>
  );
}

/** Skeleton placeholder shown until browser-stored data is available. */
export function LoadingState({ label = "Yükleniyor…", rows = 3 }: { label?: string; rows?: number }) {
  return (
    <div role="status" aria-live="polite" className="space-y-3">
      <span className="sr-only">{label}</span>
      {Array.from({ length: rows }, (_, i) => (
        <div key={i} className="ks-shimmer h-16 rounded-[var(--radius-card)]" />
      ))}
    </div>
  );
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
  return (
    <div role="status" aria-live="polite" className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
      <span className="sr-only">Ürünler yükleniyor…</span>
      {Array.from({ length: count }, (_, i) => (
        <div key={i} className="overflow-hidden rounded-[var(--radius-card)] border border-line">
          <div className="ks-shimmer aspect-square" />
          <div className="space-y-2 p-3">
            <div className="ks-shimmer h-3 w-1/3 rounded" />
            <div className="ks-shimmer h-4 w-4/5 rounded" />
            <div className="ks-shimmer h-5 w-1/2 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PageHeader({
  title,
  description,
  actions,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="min-w-0">
        <h1 className="text-2xl font-semibold tracking-tight text-ink md:text-[1.75rem]">{title}</h1>
        {description && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={cn("text-sm text-muted", className)}>
      <ol className="flex flex-wrap items-center gap-1">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex min-w-0 items-center gap-1">
              {item.href && !last ? (
                <Link href={item.href} className="truncate hover:text-ink hover:underline underline-offset-2">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn("truncate", last && "text-ink")}>
                  {item.label}
                </span>
              )}
              {!last && <ChevronRight className="size-3.5 shrink-0 text-subtle" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** Small "demo" notice used wherever demo data could be mistaken for real information. */
export function DemoNotice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <p className={cn("rounded-[var(--radius-control)] border border-line bg-surface px-3 py-2 text-xs leading-relaxed text-muted", className)}>
      {children}
    </p>
  );
}
