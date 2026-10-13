import { cn } from "@/lib/format";

const sizes = { sm: "size-4", md: "size-6", lg: "size-9" } as const;

/**
 * Loading indicator for real waits only (navigation, hydration, pending submits).
 * Pass `decorative` when the surrounding element already announces the busy state (e.g. a button with aria-busy).
 */
export function Spinner({
  size = "md",
  label = "Yükleniyor…",
  decorative = false,
  className,
}: {
  size?: keyof typeof sizes;
  label?: string;
  decorative?: boolean;
  className?: string;
}) {
  const ring = (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className={cn(sizes[size], "animate-[ks-spin_700ms_linear_infinite]", className)}>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
  if (decorative) return ring;
  return (
    <span role="status" className="inline-flex items-center text-accent-bright">
      {ring}
      <span className="sr-only">{label}</span>
    </span>
  );
}

/** Centered spinner that reserves space, for route-level and section-level waits. */
export function SpinnerBlock({ label = "Yükleniyor…", className }: { label?: string; className?: string }) {
  return (
    <div className={cn("flex min-h-40 items-center justify-center", className)}>
      <Spinner size="lg" label={label} />
    </div>
  );
}
