import type { Address, Brand, Category, ID, Product, StoreSettings, Vehicle } from "@/lib/types";

export type FieldErrors = Partial<Record<string, string>>;
export type ProductDraft = Omit<Product, "id" | "createdAt" | "updatedAt">;

const REQUIRED = "Bu alan zorunludur.";
const SLUG_TAKEN = "Bu bağlantı adı kullanılıyor.";
const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const blank = (s: string | undefined) => !s || !s.trim();
const isNonNegativeNumber = (n: number) => Number.isFinite(n) && n >= 0;

const TR_MAP: Record<string, string> = { ç: "c", ğ: "g", ı: "i", i̇: "i", ö: "o", ş: "s", ü: "u" };

/** URL-safe slug with Turkish transliteration: "Ön Fren Şeti" → "on-fren-seti". */
export function slugify(s: string): string {
  return s
    .toLocaleLowerCase("tr-TR")
    .replace(/i̇|[çğıöşü]/g, (ch) => TR_MAP[ch] ?? ch)
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function validateProduct(
  p: ProductDraft,
  ctx: { products: Product[]; categories: Category[]; brands: Brand[]; editingId?: ID },
): FieldErrors {
  const errors: FieldErrors = {};
  const others = ctx.products.filter((x) => x.id !== ctx.editingId);

  if (blank(p.name)) errors.name = "Ürün adı zorunludur.";

  if (!SLUG_PATTERN.test(p.slug)) errors.slug = "Geçerli bir bağlantı adı girin (küçük harf, rakam, tire).";
  else if (others.some((x) => x.slug === p.slug)) errors.slug = "Bu bağlantı adı başka bir üründe kullanılıyor.";

  if (blank(p.sku)) errors.sku = "Stok kodu zorunludur.";
  else if (others.some((x) => x.sku.trim().toUpperCase() === p.sku.trim().toUpperCase()))
    errors.sku = "Bu stok kodu başka bir üründe kullanılıyor.";

  if (!(Number.isFinite(p.price) && p.price > 0)) errors.price = "Fiyat 0'dan büyük olmalıdır.";
  if (p.compareAtPrice !== undefined && !(Number.isFinite(p.compareAtPrice) && p.compareAtPrice > p.price))
    errors.compareAtPrice = "Liste fiyatı satış fiyatından yüksek olmalıdır.";
  if (!(Number.isInteger(p.stock) && p.stock >= 0)) errors.stock = "Stok 0 veya pozitif bir tam sayı olmalıdır.";

  const category = ctx.categories.find((c) => c.id === p.categoryId);
  if (!category || category.parentId === null) errors.categoryId = "Bir alt kategori seçin.";
  if (!ctx.brands.some((b) => b.id === p.brandId)) errors.brandId = "Bir marka seçin.";

  p.images.forEach((img, i) => {
    if (blank(img.src)) errors[`images.${i}.src`] = "Bir görsel seçin.";
  });
  p.specs.forEach((s, i) => {
    if (blank(s.label) || blank(s.value)) errors[`specs.${i}`] = "Özellik adı ve değeri birlikte girilmelidir.";
  });
  return errors;
}

export function validateAddress(a: Address): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of ["fullName", "city", "district", "line"] as const) if (blank(a[key])) errors[key] = REQUIRED;
  const digits = a.phone.replace(/\D/g, "");
  if (digits.length < 10 || digits.length > 11) errors.phone = "Geçerli bir telefon numarası girin.";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(a.email.trim())) errors.email = "Geçerli bir e-posta adresi girin.";
  return errors;
}

export function validateCategory(
  c: Pick<Category, "slug" | "name" | "parentId">,
  ctx: { categories: Category[]; editingId?: ID },
): FieldErrors {
  const errors: FieldErrors = {};
  if (blank(c.name)) errors.name = REQUIRED;
  if (!SLUG_PATTERN.test(c.slug)) errors.slug = "Geçerli bir bağlantı adı girin (küçük harf, rakam, tire).";
  else if (ctx.categories.some((x) => x.id !== ctx.editingId && x.slug === c.slug)) errors.slug = SLUG_TAKEN;
  if (c.parentId !== null) {
    const parent = ctx.categories.find((x) => x.id === c.parentId);
    if (!parent || parent.parentId !== null) errors.parentId = "Üst kategori yalnızca bir ana grup olabilir.";
  }
  if (c.parentId !== null && ctx.editingId && ctx.categories.some((x) => x.parentId === ctx.editingId))
    errors.parentId = "Alt kategorileri olan bir ana grup başka bir grubun altına taşınamaz.";
  return errors;
}

export function validateBrand(b: Pick<Brand, "slug" | "name">, ctx: { brands: Brand[]; editingId?: ID }): FieldErrors {
  const errors: FieldErrors = {};
  if (blank(b.name)) errors.name = REQUIRED;
  if (!SLUG_PATTERN.test(b.slug)) errors.slug = "Geçerli bir bağlantı adı girin (küçük harf, rakam, tire).";
  else if (ctx.brands.some((x) => x.id !== ctx.editingId && x.slug === b.slug)) errors.slug = SLUG_TAKEN;
  return errors;
}

export function validateVehicle(
  v: Pick<Vehicle, "make" | "model" | "generation" | "engine" | "yearFrom" | "yearTo">,
  currentYear: number,
): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of ["make", "model", "generation", "engine"] as const) if (blank(v[key])) errors[key] = REQUIRED;
  const yearMessage = `1950 ile ${currentYear} arasında bir yıl girin.`;
  const validYear = (y: number) => Number.isInteger(y) && y >= 1950 && y <= currentYear;
  if (!validYear(v.yearFrom)) errors.yearFrom = yearMessage;
  if (v.yearTo !== null) {
    if (!validYear(v.yearTo)) errors.yearTo = yearMessage;
    else if (v.yearTo < v.yearFrom) errors.yearTo = "Bitiş yılı başlangıç yılından küçük olamaz.";
  }
  return errors;
}

export function validateSettings(s: StoreSettings): FieldErrors {
  const errors: FieldErrors = {};
  for (const key of ["storeName", "email", "phone", "address", "workingHours"] as const)
    if (blank(s[key])) errors[key] = REQUIRED;
  for (const key of ["freeShippingThreshold", "shippingFee", "lowStockThreshold"] as const)
    if (!isNonNegativeNumber(s[key])) errors[key] = "0 veya pozitif bir sayı girin.";
  return errors;
}
