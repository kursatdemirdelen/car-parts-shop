import type { PhotoKey } from "./photos";

/**
 * Domain model for the Kursat Shop prototype.
 * Prices are TRY, KDV-inclusive numbers. Dates are ISO strings.
 *
 * There is deliberately no ProductVariant type: the demo catalog has no products
 * with genuinely distinct purchasable variants, so each product is one record.
 */

export type ID = string;

export interface ProductImage {
  src: string;
  alt: string;
}

export interface Spec {
  label: string;
  value: string;
}

export type PublicationStatus = "published" | "draft";

/** `universal` products (oils, cleaning) do not depend on a vehicle and never carry compatibility records. */
export type FitmentType = "vehicle-specific" | "universal";

export interface Product {
  id: ID;
  slug: string;
  name: string;
  description: string;
  /** Kursat Shop's own stock-keeping code. Never an OEM number. */
  sku: string;
  /** Vehicle manufacturer part numbers this product corresponds to. */
  oemNumbers: string[];
  brandId: ID;
  /** Always a subcategory (a category with a parent). */
  categoryId: ID;
  price: number;
  compareAtPrice?: number;
  stock: number;
  status: PublicationStatus;
  fitmentType: FitmentType;
  images: ProductImage[];
  specs: Spec[];
  featured?: boolean;
  /** Parts usually replaced together with this one (e.g. disc ↔ pads ↔ wear sensor). */
  companionIds?: ID[];
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: ID;
  slug: string;
  name: string;
  /** null for the three root groups; otherwise the id of a root group. Max depth is 2. */
  parentId: ID | null;
  description?: string;
  image?: string;
}

/** A part manufacturer (Bosch, Brembo …), not a vehicle make. */
export interface Brand {
  id: ID;
  slug: string;
  name: string;
  country?: string;
}

export interface Vehicle {
  id: ID;
  make: string;
  model: string;
  /** Generation / chassis code, e.g. "E46". */
  generation: string;
  body?: string;
  yearFrom: number;
  /** null while still in production. */
  yearTo: number | null;
  /** Engine / technical variant, e.g. "320d 2.0 (150 HP)". */
  engine: string;
}

export type CompatibilityStatus = "confirmed" | "unverified" | "incompatible";

/** An explicit product ↔ vehicle statement. The absence of a record means "unknown". */
export interface CompatibilityRecord {
  id: ID;
  productId: ID;
  vehicleId: ID;
  status: CompatibilityStatus;
  note?: string;
}

export interface CartItem {
  productId: ID;
  quantity: number;
}

export interface Cart {
  items: CartItem[];
}

export interface Favorite {
  productId: ID;
  addedAt: string;
}

export interface Address {
  fullName: string;
  phone: string;
  email: string;
  city: string;
  district: string;
  line: string;
  postalCode?: string;
}

export type PaymentMethod = "cash-on-delivery" | "bank-transfer";

export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  "cash-on-delivery": "Kapıda ödeme (demo)",
  "bank-transfer": "Havale/EFT (demo)",
};

export type OrderStatus = "received" | "preparing" | "shipped" | "delivered" | "cancelled";

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Alındı",
  preparing: "Hazırlanıyor",
  shipped: "Kargoda",
  delivered: "Teslim edildi",
  cancelled: "İptal edildi",
};

/** Snapshot of a product at order time. Later product edits never change it. */
export interface OrderItem {
  productId: ID;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
}

export interface Order {
  id: ID;
  reference: string;
  createdAt: string;
  status: OrderStatus;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  address: Address;
  paymentMethod: PaymentMethod;
  note?: string;
}

export interface StoreSettings {
  storeName: string;
  email: string;
  phone: string;
  address: string;
  workingHours: string;
  freeShippingThreshold: number;
  shippingFee: number;
  lowStockThreshold: number;
}

export interface KitLine {
  productId: ID;
  quantity: number;
}

/** A curated set of parts for specific vehicles. Its price is always the sum of its lines — never a fake discount. */
export interface MaintenanceKit {
  id: ID;
  slug: string;
  name: string;
  description: string;
  vehicleIds: ID[];
  lines: KitLine[];
  status: PublicationStatus;
}

/** A storefront hero slide. Links are site-internal only; the photo comes from the bundled library. */
export interface HeroSlide {
  id: ID;
  title: string;
  subtitle: string;
  ctaLabel: string;
  ctaHref: string;
  photo: PhotoKey;
  tone: "dark" | "accent" | "light";
  status: PublicationStatus;
}

/** Thin campaign bar above the header. */
export interface Announcement {
  enabled: boolean;
  text: string;
  href: string;
}

export interface CatalogData {
  products: Product[];
  categories: Category[];
  brands: Brand[];
  vehicles: Vehicle[];
  compatibility: CompatibilityRecord[];
  orders: Order[];
  kits: MaintenanceKit[];
  settings: StoreSettings;
  heroSlides: HeroSlide[];
  announcement: Announcement;
}
