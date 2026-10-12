import type { Address, Order, OrderItem, OrderStatus, PaymentMethod } from "@/lib/types";

/** Demo orders. Item names and prices are snapshots and intentionally independent of current product data. */
const order = (
  reference: string,
  createdAt: string,
  status: OrderStatus,
  items: OrderItem[],
  shipping: number,
  address: Address,
  paymentMethod: PaymentMethod,
): Order => {
  const subtotal = Math.round(items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0) * 100) / 100;
  return {
    id: `o-${reference}`,
    reference,
    createdAt,
    status,
    items,
    subtotal,
    shipping,
    total: Math.round((subtotal + shipping) * 100) / 100,
    address,
    paymentMethod,
  };
};

const item = (productId: string, name: string, sku: string, unitPrice: number, quantity: number): OrderItem => ({
  productId,
  name,
  sku,
  unitPrice,
  quantity,
});

export const orders: Order[] = [
  order(
    "KS-260918-A7K2",
    "2026-09-18T11:24:00.000Z",
    "delivered",
    [
      item("p-006", "Yağ Filtresi HU 816 x", "KS-FL-2001", 395, 1),
      item("p-042", "EDGE 5W-30 LL Motor Yağı 5 L", "KS-YS-1101", 2490, 2),
    ],
    0,
    { fullName: "Demo Müşteri 1", phone: "05000000001", email: "musteri1@ornek.test", city: "İstanbul", district: "Kadıköy", line: "Örnek Mah. Demo Sk. No: 1" },
    "cash-on-delivery",
  ),
  order(
    "KS-260927-M3P9",
    "2026-09-27T16:05:00.000Z",
    "shipped",
    [
      item("p-002", "Ön Fren Balatası Seti", "KS-FR-1002", 2450, 1),
      item("p-005", "Fren Balata Aşınma Sensörü (ön)", "KS-FR-1005", 340, 1),
    ],
    0,
    { fullName: "Demo Müşteri 2", phone: "05000000002", email: "musteri2@ornek.test", city: "Ankara", district: "Çankaya", line: "Örnek Cad. No: 22 D: 4" },
    "bank-transfer",
  ),
  order(
    "KS-261003-Q8TZ",
    "2026-10-03T09:41:00.000Z",
    "preparing",
    [item("p-045", "Gold Class Oto Şampuanı 1,89 L", "KS-DT-1201", 890, 1)],
    149.9,
    { fullName: "Demo Müşteri 3", phone: "05000000003", email: "musteri3@ornek.test", city: "İzmir", district: "Karşıyaka", line: "Demo Bulvarı No: 7" },
    "cash-on-delivery",
  ),
  order(
    "KS-261008-H2WD",
    "2026-10-08T20:12:00.000Z",
    "received",
    [item("p-036", "B12 Pro-Kit Süspansiyon Seti", "KS-YA-9001", 38500, 1)],
    0,
    { fullName: "Demo Müşteri 4", phone: "05000000004", email: "musteri4@ornek.test", city: "Bursa", district: "Nilüfer", line: "Örnek Sitesi B Blok D: 12" },
    "bank-transfer",
  ),
  order(
    "KS-261010-ZX41",
    "2026-10-10T13:30:00.000Z",
    "cancelled",
    [item("p-018", "İridyum Buji ILZKR7B11", "KS-AT-4001", 520, 6)],
    0,
    { fullName: "Demo Müşteri 5", phone: "05000000005", email: "musteri5@ornek.test", city: "Antalya", district: "Muratpaşa", line: "Demo Sk. No: 3" },
    "cash-on-delivery",
  ),
];
