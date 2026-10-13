import { Beaker, Car, Circle, CircleDot, Cog, Crosshair, Droplet, Fuel, Hash, Layers, type LucideIcon, Ruler, Shapes, Thermometer, Zap } from "lucide-react";
import { normalizeText } from "@/lib/catalog/search";

/** Small leading icons for the product spec table, keyed by the normalized spec label. Unmapped labels get no icon. */
const SPEC_ICONS: Record<string, LucideIcon> = {
  tip: Shapes,
  pozisyon: Crosshair,
  motor: Cog,
  hacim: Beaker,
  adet: Hash,
  malzeme: Layers,
  kalinlik: Ruler,
  uzunluk: Ruler,
  genislik: Ruler,
  yukseklik: Ruler,
  cap: Circle,
  "dis cap": Circle,
  viskozite: Droplet,
  kasa: Car,
  yakit: Fuel,
  conta: CircleDot,
  "acilma sicakligi": Thermometer,
  voltaj: Zap,
};

export function specIcon(label: string): LucideIcon | null {
  return SPEC_ICONS[normalizeText(label)] ?? null;
}
