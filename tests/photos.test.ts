import { existsSync, readFileSync, statSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { CATEGORY_PHOTOS, PHOTO_KEYS, PHOTOS } from "@/lib/photos";
import { seed } from "@/lib/seed";

const file = (src: string) => path.join("public", src);

describe("photo library", () => {
  it("has a licensed, credited, existing file for every key", () => {
    for (const key of PHOTO_KEYS) {
      const p = PHOTOS[key];
      expect(existsSync(file(p.src)), key).toBe(true);
      expect(p.alt.trim(), key).not.toBe("");
      expect(p.credit.trim(), key).not.toBe("");
      expect(p.license, key).toBe("Unsplash License");
      expect(p.sourceUrl, key).toMatch(/^https:\/\/unsplash\.com\/photos\//);
    }
  });

  it("keeps files within the size budget", () => {
    // Full-width (hero) photos ≤ 200 KB, card photos ≤ 90 KB.
    for (const key of PHOTO_KEYS)
      expect(statSync(file(PHOTOS[key].src)).size, key).toBeLessThanOrEqual(PHOTOS[key].width >= 1600 ? 200_000 : 90_000);
  });

  it("maps every root category to a photo", () => {
    for (const root of seed.categories.filter((c) => c.parentId === null))
      expect(PHOTO_KEYS).toContain(CATEGORY_PHOTOS[root.slug as keyof typeof CATEGORY_PHOTOS]);
  });

  it("credits every photo in the README", () => {
    const readme = readFileSync("README.md", "utf8");
    for (const key of PHOTO_KEYS) {
      expect(readme, key).toContain(PHOTOS[key].sourceUrl);
      expect(readme, key).toContain(PHOTOS[key].credit);
    }
  });
});
