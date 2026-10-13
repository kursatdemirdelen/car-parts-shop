/**
 * Bundled photo library for the storefront (hero slides, category cards).
 * Admin can only pick from this list: the demo has no upload backend.
 * Every photo is Unsplash-licensed and credited in the README; files are produced by scripts/photos.mjs.
 */

export const PHOTO_KEYS = [
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
  license: "Unsplash License";
}

const hero = (key: PhotoKey, alt: string, credit: string, id: string): Photo => ({
  src: `/photos/${key}.webp`,
  width: 1600,
  height: 900,
  alt,
  credit,
  sourceUrl: `https://unsplash.com/photos/${id}`,
  license: "Unsplash License",
});

const card = (key: PhotoKey, alt: string, credit: string, id: string): Photo => ({
  ...hero(key, alt, credit, id),
  width: 800,
  height: 600,
});

export const PHOTOS: Record<PhotoKey, Photo> = {
  "oil-change": hero("oil-change", "Eldivenli elle yağ filtresinden yağ boşaltılması", "Jimmy Nilsson Masth", "uhuTo7u8VXk"),
  "air-filter": hero("air-filter", "Motor bölmesinde kırmızı performans hava filtresi", "Rahul Bhogal", "9mxviB2BBOE"),
  "spark-plug": hero("spark-plug", "Gri zemin üzerinde metal bujiler", "ObjectType RAW", "xRcR5P-sGBI"),
  "open-road": hero("open-road", "Dağlara doğru uzanan boş asfalt yol", "Paul Fiedler", "_n6NCjU4ALA"),
  "brake-disc": hero("brake-disc", "Fren diski ve kaliper yakın çekim", "The DK Photography", "fwnTOncjeB0"),
  detailing: card("detailing", "Araç boyasını parlatan pasta-cila makinesi", "Neelabh Raj", "cw1914zDHUs"),
  tools: card("tools", "Daire şeklinde dizilmiş anahtar takımı", "Dmitriy Demidov", "iuuJC_pjLU0"),
};

/** Photo shown on each root category card on the home page. */
export const CATEGORY_PHOTOS: Record<"oem-parcalar" | "performans" | "bakim-temizlik", PhotoKey> = {
  "oem-parcalar": "tools",
  performans: "air-filter",
  "bakim-temizlik": "detailing",
};

export function isPhotoKey(v: unknown): v is PhotoKey {
  return typeof v === "string" && (PHOTO_KEYS as readonly string[]).includes(v);
}
