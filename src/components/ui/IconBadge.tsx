import type { LucideIcon } from "lucide-react";
import { TONE_CLASSES, type CategoryTone } from "@/lib/category-style";
import { cn } from "@/lib/format";

export type IconTone = CategoryTone | "accent" | "success" | "warn" | "danger" | "neutral";

const tones: Record<IconTone, string> = {
  oem: `${TONE_CLASSES.oem.bg} ${TONE_CLASSES.oem.text}`,
  perf: `${TONE_CLASSES.perf.bg} ${TONE_CLASSES.perf.text}`,
  care: `${TONE_CLASSES.care.bg} ${TONE_CLASSES.care.text}`,
  accent: "bg-accent-soft text-accent",
  success: "bg-success-soft text-success",
  warn: "bg-warn-soft text-warn",
  danger: "bg-danger-soft text-danger",
  neutral: "bg-surface text-ink-soft",
};

const sizes = {
  sm: { box: "size-7 rounded-md", icon: "size-3.5" },
  md: { box: "size-10 rounded-lg", icon: "size-5" },
  lg: { box: "size-14 rounded-xl", icon: "size-7" },
} as const;

/** Decorative icon on a soft tinted square. The surrounding text carries the meaning. */
export function IconBadge({
  icon: Icon,
  tone = "accent",
  size = "md",
  className,
}: {
  icon: LucideIcon;
  tone?: IconTone;
  size?: keyof typeof sizes;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex shrink-0 items-center justify-center", sizes[size].box, tones[tone], className)} aria-hidden="true">
      <Icon className={sizes[size].icon} />
    </span>
  );
}
