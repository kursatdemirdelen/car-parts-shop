/**
 * Bundled photo library for the storefront (hero slides, category cards, 404).
 * Admin can only pick from this list: the demo has no upload backend.
 * Every photo must be Unsplash/Pexels licensed and credited in the README.
 */

export const PHOTO_KEYS = [
  "workshop-lift",
  "oil-change",
  "brake-disc",
  "air-filter",
  "spark-plug",
  "open-road",
  "detailing",
  "tools",
] as const;

export type PhotoKey = (typeof PHOTO_KEYS)[number];

export interface Photo {
  src: string;
  width: number;
  height: number;
  /** Turkish alt text. */
  alt: string;
  credit: string;
  sourceUrl: string;
  license: "Unsplash License" | "Pexels License" | "placeholder";
}

// Placeholders until the licensed photos are approved and added (see the visual refresh plan, Task 6).
const placeholder = (src: string, alt: string): Photo => ({ src, width: 400, height: 400, alt, credit: "", sourceUrl: "", license: "placeholder" });

export const PHOTOS: Record<PhotoKey, Photo> = {
  "workshop-lift": placeholder("/products/suspansiyon-direksiyon.svg", "Lifte kaldırılmış bir otomobilin alt takımı"),
  "oil-change": placeholder("/products/motor-yagi-sivilar.svg", "Motor yağı değişimi"),
  "brake-disc": placeholder("/products/fren-sistemi.svg", "Fren diski ve kaliper"),
  "air-filter": placeholder("/products/filtreler.svg", "Hava filtresi"),
  "spark-plug": placeholder("/products/atesleme.svg", "Buji yakın çekim"),
  "open-road": placeholder("/products/egzoz-sistemleri.svg", "Açık yolda ilerleyen bir otomobil"),
  detailing: placeholder("/products/cila-koruma.svg", "Parlatılmış araç boyası"),
  tools: placeholder("/products/motor-parcalari.svg", "Atölye takımları"),
};

export function isPhotoKey(v: unknown): v is PhotoKey {
  return typeof v === "string" && (PHOTO_KEYS as readonly string[]).includes(v);
}
