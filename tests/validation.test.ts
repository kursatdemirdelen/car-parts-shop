import { describe, expect, it } from "vitest";
import { seed } from "@/lib/seed";
import {
  slugify,
  validateAddress,
  validateBrand,
  validateCategory,
  validateProduct,
  validateSettings,
  validateVehicle,
  type ProductDraft,
} from "@/lib/validation";
import type { Address } from "@/lib/types";

const ctx = { products: seed.products, categories: seed.categories, brands: seed.brands };
const existing = seed.products.find((p) => p.id === "p-002")!;

const valid: ProductDraft = {
  slug: "yeni-urun",
  name: "Yeni Ürün",
  description: "Açıklama",
  sku: "KS-NEW-0001",
  oemNumbers: [],
  brandId: "brand-bosch",
  categoryId: "cat-filtreler",
  price: 100,
  stock: 3,
  status: "published",
  fitmentType: "vehicle-specific",
  images: [],
  specs: [],
};

describe("validateProduct", () => {
  it("accepts a valid product", () => {
    expect(validateProduct(valid, ctx)).toEqual({});
  });

  it("requires a name", () => {
    expect(validateProduct({ ...valid, name: "  " }, ctx).name).toBe("Ürün adı zorunludur.");
  });

  it("validates slug format and uniqueness", () => {
    expect(validateProduct({ ...valid, slug: "Kötü Slug" }, ctx).slug).toBe(
      "Geçerli bir bağlantı adı girin (küçük harf, rakam, tire).",
    );
    expect(validateProduct({ ...valid, slug: existing.slug }, ctx).slug).toBe(
      "Bu bağlantı adı başka bir üründe kullanılıyor.",
    );
  });

  it("validates SKU presence and uniqueness", () => {
    expect(validateProduct({ ...valid, sku: "" }, ctx).sku).toBe("Stok kodu zorunludur.");
    expect(validateProduct({ ...valid, sku: existing.sku }, ctx).sku).toBe("Bu stok kodu başka bir üründe kullanılıyor.");
  });

  it("allows a product to keep its own slug and SKU when editing", () => {
    const { id: _id, createdAt: _c, updatedAt: _u, ...draft } = existing;
    expect(validateProduct(draft, { ...ctx, editingId: existing.id })).toEqual({});
  });

  it("validates price, comparison price and stock", () => {
    expect(validateProduct({ ...valid, price: 0 }, ctx).price).toBe("Fiyat 0'dan büyük olmalıdır.");
    expect(validateProduct({ ...valid, price: Number.NaN }, ctx).price).toBe("Fiyat 0'dan büyük olmalıdır.");
    expect(validateProduct({ ...valid, compareAtPrice: 50 }, ctx).compareAtPrice).toBe(
      "Liste fiyatı satış fiyatından yüksek olmalıdır.",
    );
    expect(validateProduct({ ...valid, stock: -1 }, ctx).stock).toBe("Stok 0 veya pozitif bir tam sayı olmalıdır.");
    expect(validateProduct({ ...valid, stock: 1.5 }, ctx).stock).toBe("Stok 0 veya pozitif bir tam sayı olmalıdır.");
  });

  it("requires a subcategory and an existing brand", () => {
    expect(validateProduct({ ...valid, categoryId: "cat-oem" }, ctx).categoryId).toBe("Bir alt kategori seçin.");
    expect(validateProduct({ ...valid, categoryId: "" }, ctx).categoryId).toBe("Bir alt kategori seçin.");
    expect(validateProduct({ ...valid, brandId: "" }, ctx).brandId).toBe("Bir marka seçin.");
  });
});

describe("validateAddress", () => {
  const ok: Address = {
    fullName: "Ad Soyad",
    phone: "0500 111 22 33",
    email: "a@b.co",
    city: "İzmir",
    district: "Bornova",
    line: "Sk. 1",
  };
  it("accepts a valid address", () => {
    expect(validateAddress(ok)).toEqual({});
  });
  it("reports invalid phone, email and missing fields", () => {
    const errors = validateAddress({ ...ok, phone: "123", email: "x@", city: "" });
    expect(errors.phone).toBe("Geçerli bir telefon numarası girin.");
    expect(errors.email).toBe("Geçerli bir e-posta adresi girin.");
    expect(errors.city).toBe("Bu alan zorunludur.");
  });
});

describe("other validators", () => {
  it("validates categories with a two-level limit", () => {
    const c = { slug: "yeni", name: "Yeni", parentId: "cat-fren-sistemi" };
    expect(validateCategory(c, { categories: seed.categories }).parentId).toBe("Üst kategori yalnızca bir ana grup olabilir.");
    expect(validateCategory({ ...c, parentId: "cat-oem" }, { categories: seed.categories })).toEqual({});
    expect(validateCategory({ ...c, slug: "filtreler", parentId: "cat-oem" }, { categories: seed.categories }).slug).toBe(
      "Bu bağlantı adı kullanılıyor.",
    );
  });

  it("validates brands", () => {
    expect(validateBrand({ slug: "", name: "" }, { brands: seed.brands }).name).toBe("Bu alan zorunludur.");
    expect(validateBrand({ slug: "bosch", name: "Bosch 2" }, { brands: seed.brands }).slug).toBe("Bu bağlantı adı kullanılıyor.");
  });

  it("validates vehicle year ranges", () => {
    const v = { make: "BMW", model: "3 Serisi", generation: "E46", engine: "320d", yearFrom: 1998, yearTo: 2006 as number | null };
    expect(validateVehicle(v, 2026)).toEqual({});
    expect(validateVehicle({ ...v, yearTo: 1990 }, 2026).yearTo).toBe("Bitiş yılı başlangıç yılından küçük olamaz.");
    expect(validateVehicle({ ...v, yearFrom: 1900 }, 2026).yearFrom).toBe("1950 ile 2026 arasında bir yıl girin.");
    expect(validateVehicle({ ...v, yearTo: null }, 2026)).toEqual({});
  });

  it("validates settings numbers", () => {
    expect(validateSettings(seed.settings)).toEqual({});
    expect(validateSettings({ ...seed.settings, shippingFee: -1 }).shippingFee).toBe("0 veya pozitif bir sayı girin.");
  });
});

describe("slugify", () => {
  it("transliterates Turkish characters", () => {
    expect(slugify("Ön Fren Balatası Şeti")).toBe("on-fren-balatasi-seti");
    expect(slugify("  İç & Dış Temizlik  ")).toBe("ic-dis-temizlik");
  });
});
