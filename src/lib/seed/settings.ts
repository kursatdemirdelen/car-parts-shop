import type { StoreSettings } from "@/lib/types";

export const settings: StoreSettings = {
  storeName: "Kursat Shop",
  email: "destek@kursatshop.demo",
  phone: "0850 000 00 00",
  address: "Demo adres, Başakşehir / İstanbul",
  workingHours: "Hafta içi 09:00–18:00, Cumartesi 10:00–14:00",
  freeShippingThreshold: 2500,
  shippingFee: 149.9,
  lowStockThreshold: 5,
};

/**
 * Demo-only admin credentials, shown openly on the login screen.
 * This is NOT authentication: anyone can read them, and the session is a browser flag.
 */
export const DEMO_ADMIN = { email: "admin@kursatshop.demo", password: "demo1234" } as const;
