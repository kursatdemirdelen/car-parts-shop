import { cn } from "@/lib/format";
import type { TagSpec, TagTone } from "@/lib/tags";

export const TAG_TONES: Record<TagTone, string> = {
  neutral: "bg-surface text-ink-soft border-line",
  accent: "bg-accent-soft text-accent border-[#9fd0f2]",
  success: "bg-success-soft text-success border-[#cfe7d9]",
  warn: "bg-warn-soft text-warn border-[#f1e2bd]",
  danger: "bg-danger-soft text-danger border-[#f5d0cc]",
  "cat-oem": "bg-cat-oem-soft text-cat-oem border-[#c4e2f7]",
  "cat-perf": "bg-cat-perf-soft text-cat-perf border-[#f6cfc3]",
  "cat-care": "bg-cat-care-soft text-cat-care border-[#c9e6d6]",
};

/** Status pill: icon + text on a tinted background. The single visual for fitment, stock, order and maintenance states. */
export function Tag({ spec, size = "sm", className }: { spec: TagSpec; size?: "sm" | "md"; className?: string }) {
  const Icon = spec.icon;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border font-medium whitespace-nowrap",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        TAG_TONES[spec.tone],
        className,
      )}
    >
      <Icon className={size === "sm" ? "size-3.5" : "size-4"} aria-hidden="true" />
      {spec.label}
    </span>
  );
}
