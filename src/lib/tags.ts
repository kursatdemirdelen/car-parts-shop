import {
  AlertTriangle,
  Ban,
  CheckCircle2,
  Clock,
  Globe,
  HelpCircle,
  Inbox,
  type LucideIcon,
  PackageCheck,
  PackageOpen,
  ShieldCheck,
  ShieldQuestion,
  ShieldX,
  Truck,
  XCircle,
} from "lucide-react";
import { FITMENT_LABELS, type FitmentState } from "@/lib/catalog/fitment";
import { stockState } from "@/lib/catalog/stock";
import type { MaintenanceStatus } from "@/lib/maintenance";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

/**
 * One visual language for every status label: an icon, a tone and the text.
 * Color never carries meaning alone — the label and icon always come with it.
 */
export type TagTone = "neutral" | "accent" | "success" | "warn" | "danger" | "cat-oem" | "cat-perf" | "cat-care";

export interface TagSpec {
  label: string;
  tone: TagTone;
  icon: LucideIcon;
}

const FITMENT_TAGS: Record<FitmentState, Omit<TagSpec, "label">> = {
  confirmed: { tone: "success", icon: ShieldCheck },
  unverified: { tone: "warn", icon: ShieldQuestion },
  // Unknown is shown exactly like unverified: never as a fit.
  unknown: { tone: "warn", icon: ShieldQuestion },
  incompatible: { tone: "danger", icon: ShieldX },
  universal: { tone: "neutral", icon: Globe },
};

export function fitmentTag(state: FitmentState): TagSpec {
  return { label: FITMENT_LABELS[state], ...FITMENT_TAGS[state] };
}

export function stockTag(stock: number, lowThreshold: number): TagSpec {
  const state = stockState(stock, lowThreshold);
  if (state === "out_of_stock") return { label: "Tükendi", tone: "danger", icon: XCircle };
  if (state === "low_stock") return { label: `Son ${stock} adet`, tone: "warn", icon: Clock };
  return { label: "Stokta", tone: "success", icon: CheckCircle2 };
}

const ORDER_TAGS: Record<OrderStatus, Omit<TagSpec, "label">> = {
  received: { tone: "cat-oem", icon: Inbox },
  preparing: { tone: "warn", icon: PackageOpen },
  shipped: { tone: "accent", icon: Truck },
  delivered: { tone: "success", icon: PackageCheck },
  cancelled: { tone: "danger", icon: Ban },
};

export function orderStatusTag(status: OrderStatus): TagSpec {
  return { label: ORDER_STATUS_LABELS[status], ...ORDER_TAGS[status] };
}

const MAINTENANCE_TAGS: Record<MaintenanceStatus, TagSpec> = {
  overdue: { label: "Gecikti", tone: "danger", icon: AlertTriangle },
  soon: { label: "Yaklaşıyor", tone: "warn", icon: Clock },
  unknown: { label: "Bilinmiyor", tone: "neutral", icon: HelpCircle },
  ok: { label: "Zamanı var", tone: "success", icon: CheckCircle2 },
};

export function maintenanceTag(status: MaintenanceStatus): TagSpec {
  return MAINTENANCE_TAGS[status];
}

/** Letter monogram used instead of real brand logos (trademarks): "Febi Bilstein" → "FB", "NGK" → "NGK". */
export function brandMonogram(name: string): string {
  const cleaned = name.replace(/[^\p{L}\s-]/gu, "").trim();
  const words = cleaned.split(/[\s-]+/).filter(Boolean);
  if (words.length === 1 && words[0].length <= 3 && words[0] === words[0].toLocaleUpperCase("tr-TR")) return words[0];
  if (words.length >= 2) return (words[0][0] + words[1][0]).toLocaleUpperCase("tr-TR");
  return cleaned.slice(0, 2).toLocaleUpperCase("tr-TR");
}
