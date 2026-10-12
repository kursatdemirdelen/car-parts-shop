export type StockState = "in_stock" | "low_stock" | "out_of_stock";

export function stockState(stock: number, lowThreshold = 5): StockState {
  if (stock <= 0) return "out_of_stock";
  if (stock <= lowThreshold) return "low_stock";
  return "in_stock";
}
