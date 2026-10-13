import { describe, expect, it } from "vitest";
import { isPhotoKey, PHOTOS } from "@/lib/photos";
import { seed } from "@/lib/seed";
import { isCatalogData, migrateCatalog } from "@/lib/storage";
import type { HeroSlide } from "@/lib/types";
import { isInternalHref, validateAnnouncement, validateHeroSlide, validateHeroSlides } from "@/lib/validation";

const slide = (over: Partial<HeroSlide> = {}): HeroSlide => ({
  id: "s",
  title: "Başlık",
  subtitle: "",
  ctaLabel: "Git",
  ctaHref: "/products",
  photo: seed.heroSlides[0].photo,
  tone: "dark",
  status: "published",
  ...over,
});

describe("isInternalHref", () => {
  it("accepts site paths only", () => {
    expect(isInternalHref("/products")).toBe(true);
    expect(isInternalHref("/categories/filtreler?fit=1")).toBe(true);
    for (const bad of ["//evil.example", "https://x.com", "javascript:alert(1)", "/a b", "", "products"])
      expect(isInternalHref(bad), bad).toBe(false);
  });
});

describe("validateHeroSlide", () => {
  it("accepts a valid slide", () => {
    expect(validateHeroSlide(slide())).toEqual({});
  });

  it("reports each field rule", () => {
    expect(validateHeroSlide(slide({ title: " " })).title).toBe("Başlık zorunlu.");
    expect(validateHeroSlide(slide({ title: "x".repeat(61) })).title).toBe("Başlık en fazla 60 karakter olabilir.");
    expect(validateHeroSlide(slide({ subtitle: "x".repeat(141) })).subtitle).toBe("Alt metin en fazla 140 karakter olabilir.");
    expect(validateHeroSlide(slide({ ctaLabel: "x".repeat(25) })).ctaLabel).toBe("Buton metni en fazla 24 karakter olabilir.");
    expect(validateHeroSlide(slide({ ctaHref: "" })).ctaHref).toBe("Buton için bir bağlantı girin.");
    expect(validateHeroSlide(slide({ ctaHref: "//evil.example" })).ctaHref).toBe("Bağlantı site içi olmalı ve / ile başlamalı.");
    expect(validateHeroSlide(slide({ photo: "nope" as HeroSlide["photo"] })).photo).toBe("Fotoğraf kütüphanesinden bir görsel seçin.");
  });

  it("allows a slide without a button", () => {
    expect(validateHeroSlide(slide({ ctaLabel: "", ctaHref: "" }))).toEqual({});
  });
});

describe("validateHeroSlides", () => {
  it("limits the total and the published count", () => {
    const many = (n: number, status: HeroSlide["status"]) => Array.from({ length: n }, (_, i) => slide({ id: `s${i}`, status }));
    expect(validateHeroSlides(many(7, "draft"))).toBe("En fazla 6 slayt eklenebilir.");
    expect(validateHeroSlides(many(5, "published"))).toBe("Aynı anda en fazla 4 slayt yayında olabilir.");
    expect(validateHeroSlides(many(4, "published"))).toBeNull();
  });
});

describe("validateAnnouncement", () => {
  it("requires text only while enabled and keeps links internal", () => {
    expect(validateAnnouncement({ enabled: true, text: "", href: "" }).text).toBe("Şerit açıkken metin zorunlu.");
    expect(validateAnnouncement({ enabled: false, text: "", href: "" })).toEqual({});
    expect(validateAnnouncement({ enabled: true, text: "x".repeat(91), href: "" }).text).toBe("Metin en fazla 90 karakter olabilir.");
    expect(validateAnnouncement({ enabled: true, text: "a", href: "https://x.com" }).href).toBe("Bağlantı site içi olmalı ve / ile başlamalı.");
  });
});

describe("home seed", () => {
  it("ships valid published slides and a truthful campaign bar", () => {
    expect(seed.heroSlides.length).toBe(3);
    for (const s of seed.heroSlides) {
      expect(validateHeroSlide(s), s.id).toEqual({});
      expect(isPhotoKey(s.photo)).toBe(true);
    }
    expect(validateHeroSlides(seed.heroSlides)).toBeNull();
    const threshold = new Intl.NumberFormat("tr-TR").format(seed.settings.freeShippingThreshold);
    expect(seed.announcement.text).toContain(`${threshold} TL`);
    expect(seed.announcement.text).toContain("(demo)");
  });

  it("has a photo entry for every key", () => {
    for (const key of Object.keys(PHOTOS)) expect(isPhotoKey(key)).toBe(true);
  });
});

describe("home migration", () => {
  const { heroSlides: _h, announcement: _a, ...withoutHome } = seed;

  it("adds missing home content to older catalogs", () => {
    const migrated = migrateCatalog(structuredClone(withoutHome)) as typeof seed;
    expect(migrated.heroSlides).toEqual(seed.heroSlides);
    expect(migrated.announcement).toEqual(seed.announcement);
    expect(isCatalogData(migrated)).toBe(true);
  });

  it("falls back to the seed for broken home content", () => {
    for (const broken of [
      { heroSlides: "x" },
      { heroSlides: [{ ...seed.heroSlides[0], photo: "nope" }] },
      { heroSlides: [{ ...seed.heroSlides[0], tone: "neon" }] },
      { announcement: null },
      { announcement: { enabled: "yes", text: "a", href: "" } },
    ]) {
      const migrated = migrateCatalog({ ...structuredClone(seed), ...broken }) as typeof seed;
      expect(migrated.heroSlides, JSON.stringify(broken)).toEqual(seed.heroSlides);
      expect(migrated.announcement).toEqual(seed.announcement);
      expect(isCatalogData(migrated)).toBe(true);
    }
  });

  it("keeps a valid edited slide list", () => {
    const edited = [{ ...seed.heroSlides[1], title: "Kış bakımı" }];
    const migrated = migrateCatalog({ ...structuredClone(seed), heroSlides: edited }) as typeof seed;
    expect(migrated.heroSlides).toEqual(edited);
  });
});
