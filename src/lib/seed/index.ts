import type { CatalogData } from "@/lib/types";
import { brands } from "./brands";
import { categories } from "./categories";
import { compatibility } from "./compatibility";
import { orders } from "./orders";
import { products } from "./products";
import { settings } from "./settings";
import { vehicles } from "./vehicles";

export { DEMO_ADMIN } from "./settings";

/** The single source of demo data. Storefront and admin both start from this object. */
export const seed: CatalogData = {
  products,
  categories,
  brands,
  vehicles,
  compatibility,
  orders,
  settings,
};
