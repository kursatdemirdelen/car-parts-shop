import type { Category, ID, Product } from "@/lib/types";

/** The category itself plus its direct children (the tree is at most two levels deep). */
export function descendantCategoryIds(categories: Category[], id: ID): ID[] {
  return [id, ...categories.filter((c) => c.parentId === id).map((c) => c.id)];
}

export function relatedProducts(product: Product, all: Product[], limit = 4): Product[] {
  const candidates = all.filter((p) => p.id !== product.id && p.status === "published");
  const sameCategory = candidates.filter((p) => p.categoryId === product.categoryId);
  const sameBrand = candidates.filter((p) => p.brandId === product.brandId && p.categoryId !== product.categoryId);
  return [...sameCategory, ...sameBrand].slice(0, limit);
}

/** Number of products (any status) in a category or its children. */
export function categoryUsage(products: Product[], categories: Category[], id: ID): number {
  const ids = new Set(descendantCategoryIds(categories, id));
  return products.filter((p) => ids.has(p.categoryId)).length;
}

export function brandUsage(products: Product[], id: ID): number {
  return products.filter((p) => p.brandId === id).length;
}
