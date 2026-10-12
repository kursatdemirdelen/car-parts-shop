import type { MaintenanceKit } from "@/lib/types";

/** Demo maintenance kits. Every line is confirmed (or vehicle-independent) for every listed vehicle. */
export const kits: MaintenanceKit[] = [
  {
    id: "kit-e46-320d-bakim",
    slug: "e46-320d-periyodik-bakim",
    name: "E46 320d periyodik bakım seti",
    description: "Hava filtresi, motor yağı ve fren hidroliği. Yağ miktarını aracının kılavuzundan kontrol et.",
    vehicleIds: ["v-bmw-e46-320d"],
    lines: [
      { productId: "p-007", quantity: 1 },
      { productId: "p-042", quantity: 1 },
      { productId: "p-044", quantity: 1 },
    ],
    status: "published",
  },
  {
    id: "kit-e90-320d-bakim",
    slug: "e90-320d-bakim-ve-kizdirma",
    name: "E90 320d bakım ve kızdırma seti",
    description: "Polen filtresi, yakıt filtresi, 4 adet kızdırma bujisi ve motor yağı.",
    vehicleIds: ["v-bmw-e90-320d"],
    lines: [
      { productId: "p-008", quantity: 1 },
      { productId: "p-009", quantity: 1 },
      { productId: "p-020", quantity: 4 },
      { productId: "p-042", quantity: 1 },
    ],
    status: "published",
  },
  {
    id: "kit-n52-atesleme",
    slug: "n52-atesleme-ve-yag-seti",
    name: "N52 ateşleme ve yağ bakım seti",
    description: "6 adet iridyum buji, yağ filtresi ve motor yağı. E90 330i ve E60 530i için.",
    vehicleIds: ["v-bmw-e90-330i", "v-bmw-e60-530i"],
    lines: [
      { productId: "p-018", quantity: 6 },
      { productId: "p-006", quantity: 1 },
      { productId: "p-043", quantity: 1 },
    ],
    status: "published",
  },
  {
    id: "kit-g20-on-fren",
    slug: "g20-on-balata-ve-hidrolik",
    name: "G20 ön balata ve hidrolik seti",
    description: "Standart fren sistemli G20 için ön balata seti ve fren hidroliği.",
    vehicleIds: ["v-bmw-g20-320i", "v-bmw-g20-320d"],
    lines: [
      { productId: "p-002", quantity: 1 },
      { productId: "p-044", quantity: 1 },
    ],
    status: "published",
  },
];
