import {
  Armchair,
  CircleGauge,
  Cog,
  Disc3,
  Droplet,
  Droplets,
  Fan,
  Filter,
  Flame,
  Gauge,
  type LucideIcon,
  Package,
  Sparkles,
  SprayCan,
  Thermometer,
  Waypoints,
  Wind,
  Wrench,
  Zap,
} from "lucide-react";
import type { Category } from "@/lib/types";

/** Color family of a category, derived from its root group (no data-model field). */
export type CategoryTone = "oem" | "perf" | "care";

const ROOT_TONES: Record<string, CategoryTone> = {
  "oem-parcalar": "oem",
  performans: "perf",
  "bakim-temizlik": "care",
};

export function categoryTone(category: Category, categories: Category[]): CategoryTone {
  const root = category.parentId ? categories.find((c) => c.id === category.parentId) : category;
  return ROOT_TONES[root?.slug ?? ""] ?? "oem";
}

export const FALLBACK_CATEGORY_ICON: LucideIcon = Package;

const ICONS: Record<string, LucideIcon> = {
  "oem-parcalar": Wrench,
  performans: Flame,
  "bakim-temizlik": Droplet,
  "fren-sistemi": Disc3,
  filtreler: Filter,
  "suspansiyon-direksiyon": Waypoints,
  atesleme: Zap,
  sogutma: Thermometer,
  "motor-parcalari": Cog,
  "egzoz-sistemleri": Wind,
  "hava-emis": Fan,
  "yay-amortisor": Gauge,
  "fren-yukseltme": CircleGauge,
  "motor-yagi-sivilar": Droplets,
  "dis-temizlik": SprayCan,
  "cila-koruma": Sparkles,
  "ic-temizlik": Armchair,
};

export function categoryIcon(slug: string): LucideIcon {
  return ICONS[slug] ?? FALLBACK_CATEGORY_ICON;
}

/** Tailwind classes per tone: `text` for icons/labels, `bg` soft badge background, `ring` subtle outline. */
export const TONE_CLASSES: Record<CategoryTone, { text: string; bg: string; ring: string; solid: string }> = {
  oem: { text: "text-cat-oem", bg: "bg-cat-oem-soft", ring: "ring-cat-oem/20", solid: "bg-cat-oem" },
  perf: { text: "text-cat-perf", bg: "bg-cat-perf-soft", ring: "ring-cat-perf/20", solid: "bg-cat-perf" },
  care: { text: "text-cat-care", bg: "bg-cat-care-soft", ring: "ring-cat-care/20", solid: "bg-cat-care" },
};
