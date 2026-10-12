import type { StoreSettings } from "@/lib/types";

/** Demo shipping rule: free at or above the threshold, otherwise a flat fee. */
export function shippingFor(
  subtotal: number,
  s: Pick<StoreSettings, "freeShippingThreshold" | "shippingFee">,
): number {
  if (subtotal <= 0 || subtotal >= s.freeShippingThreshold) return 0;
  return s.shippingFee;
}
