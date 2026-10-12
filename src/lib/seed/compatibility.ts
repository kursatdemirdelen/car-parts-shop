import type { CompatibilityRecord, CompatibilityStatus } from "@/lib/types";

/**
 * Explicit demo fitment statements. Any product/vehicle pair not listed here is "unknown".
 * `incompatible` is only used where an explicit record says so.
 */
const rows: [productId: string, vehicleId: string, status: CompatibilityStatus, note?: string][] = [
  // Brembo disc set E46 330i
  ["p-001", "v-bmw-e46-330i", "confirmed"],
  ["p-001", "v-bmw-e46-320d", "unverified", "Fren sistemi donanıma göre değişebilir."],
  // Brembo pads G20
  ["p-002", "v-bmw-g20-320i", "confirmed"],
  ["p-002", "v-bmw-g20-320d", "confirmed"],
  ["p-002", "v-bmw-g20-m340i", "incompatible", "M Sport fren sistemi farklı balata kullanır."],
  // Bosch rear pads F10
  ["p-003", "v-bmw-f10-520d", "confirmed"],
  ["p-003", "v-bmw-f10-528i", "confirmed"],
  ["p-003", "v-bmw-f10-535i", "unverified"],
  // Zimmermann disc E90 300 mm
  ["p-004", "v-bmw-e90-320i", "confirmed"],
  ["p-004", "v-bmw-e90-320d", "confirmed"],
  ["p-004", "v-bmw-e90-330i", "incompatible", "330i daha büyük çaplı disk kullanır."],
  // Wear sensor
  ["p-005", "v-bmw-e90-320i", "confirmed"],
  ["p-005", "v-bmw-e90-320d", "confirmed"],
  ["p-005", "v-bmw-e92-320d", "confirmed"],
  // Oil filter HU 816 x
  ["p-006", "v-bmw-e90-330i", "confirmed"],
  ["p-006", "v-bmw-e60-530i", "confirmed"],
  ["p-006", "v-bmw-e92-335i", "confirmed"],
  // Air filter E46 320d
  ["p-007", "v-bmw-e46-320d", "confirmed"],
  // Cabin filter E90
  ["p-008", "v-bmw-e90-320i", "confirmed"],
  ["p-008", "v-bmw-e90-320d", "confirmed"],
  ["p-008", "v-bmw-e90-330i", "confirmed"],
  ["p-008", "v-bmw-e92-320d", "confirmed"],
  ["p-008", "v-bmw-e92-335i", "confirmed"],
  // Fuel filter N47
  ["p-009", "v-bmw-e90-320d", "confirmed"],
  ["p-009", "v-bmw-f20-118d", "confirmed"],
  ["p-009", "v-bmw-f10-520d", "confirmed"],
  ["p-009", "v-bmw-e60-520d", "unverified", "Motor koduna göre değişir; şasi numarasıyla kontrol edin."],
  // Oil filter OM651
  ["p-010", "v-mercedes-benz-w204-c220cdi", "confirmed"],
  ["p-010", "v-mercedes-benz-w212-e250cdi", "confirmed"],
  ["p-010", "v-mercedes-benz-w205-c220d", "unverified"],
  // Air filter Audi B8 TDI
  ["p-011", "v-audi-b8-20tdi", "confirmed"],
  // Porsche oil filter
  ["p-012", "v-porsche-997-carrera", "confirmed"],
  ["p-012", "v-porsche-987-cayman", "confirmed"],
  // Control arm E46
  ["p-013", "v-bmw-e46-318i", "confirmed"],
  ["p-013", "v-bmw-e46-320d", "confirmed"],
  ["p-013", "v-bmw-e46-330i", "confirmed"],
  // Stabilizer link F10
  ["p-014", "v-bmw-f10-520d", "confirmed"],
  ["p-014", "v-bmw-f10-528i", "confirmed"],
  ["p-014", "v-bmw-f10-535i", "confirmed"],
  ["p-014", "v-bmw-g30-520d", "unverified"],
  // Strut mount E36
  ["p-015", "v-bmw-e36-316i", "confirmed"],
  ["p-015", "v-bmw-e36-318i", "confirmed"],
  ["p-015", "v-bmw-e36-328i", "confirmed"],
  ["p-015", "v-bmw-e30-318i", "incompatible"],
  // Diff bushing E39
  ["p-016", "v-bmw-e39-520i", "confirmed"],
  ["p-016", "v-bmw-e39-530d", "confirmed"],
  ["p-016", "v-bmw-e39-m5", "unverified"],
  // Tie rod end W204
  ["p-017", "v-mercedes-benz-w204-c180", "confirmed"],
  ["p-017", "v-mercedes-benz-w204-c220cdi", "confirmed"],
  // NGK iridium N52
  ["p-018", "v-bmw-e90-330i", "confirmed"],
  ["p-018", "v-bmw-e60-530i", "confirmed"],
  ["p-018", "v-bmw-e92-335i", "incompatible", "N54 motor farklı buji kullanır."],
  // Ignition coil
  ["p-019", "v-bmw-e90-330i", "confirmed"],
  ["p-019", "v-bmw-e92-335i", "confirmed"],
  ["p-019", "v-bmw-e60-530i", "confirmed"],
  ["p-019", "v-bmw-f10-535i", "confirmed"],
  ["p-019", "v-bmw-e46-330i", "unverified"],
  // Glow plug N47
  ["p-020", "v-bmw-e90-320d", "confirmed"],
  ["p-020", "v-bmw-f10-520d", "confirmed"],
  ["p-020", "v-bmw-f20-118d", "confirmed"],
  // NGK Porsche 991
  ["p-021", "v-porsche-991-carrera-s", "confirmed"],
  // Radiator E46
  ["p-022", "v-bmw-e46-318i", "confirmed"],
  ["p-022", "v-bmw-e46-330i", "confirmed"],
  ["p-022", "v-bmw-e46-320d", "unverified", "Dizel ve otomatik şanzımanlı araçlarda farklı radyatör kullanılabilir."],
  // Thermostat M54
  ["p-023", "v-bmw-e36-328i", "confirmed"],
  ["p-023", "v-bmw-e46-330i", "confirmed"],
  ["p-023", "v-bmw-e39-520i", "confirmed"],
  // Expansion tank E90
  ["p-024", "v-bmw-e90-320i", "confirmed"],
  ["p-024", "v-bmw-e90-320d", "confirmed"],
  ["p-024", "v-bmw-e90-330i", "confirmed"],
  ["p-024", "v-bmw-e92-320d", "confirmed"],
  ["p-024", "v-bmw-e92-335i", "confirmed"],
  // Water pump Audi
  ["p-025", "v-audi-b8-18tfsi", "confirmed"],
  ["p-025", "v-audi-b7-20tfsi", "incompatible", "B7 2.0 TFSI farklı motor ailesindendir."],
  // Valve cover gasket M54
  ["p-026", "v-bmw-e46-330i", "confirmed"],
  ["p-026", "v-bmw-e39-520i", "confirmed"],
  ["p-026", "v-bmw-e36-328i", "unverified"],
  // V-belt E90
  ["p-027", "v-bmw-e90-320i", "unverified"],
  // Engine mount W212 (draft product)
  ["p-028", "v-mercedes-benz-w212-e200", "confirmed"],
  ["p-028", "v-mercedes-benz-w212-e250cdi", "confirmed"],
  // Oil pan gasket E36 (draft product)
  ["p-029", "v-bmw-e36-318i", "unverified"],
  // Akrapovič G20 M340i
  ["p-030", "v-bmw-g20-m340i", "confirmed"],
  ["p-030", "v-bmw-g20-320i", "incompatible"],
  // Eisenmann E92 335i
  ["p-031", "v-bmw-e92-335i", "confirmed"],
  // Remus tips F20
  ["p-032", "v-bmw-f20-116i", "confirmed"],
  ["p-032", "v-bmw-f20-118d", "unverified"],
  // Eventuri G20 M340i
  ["p-033", "v-bmw-g20-m340i", "confirmed"],
  // BMC E46
  ["p-034", "v-bmw-e46-330i", "confirmed"],
  ["p-034", "v-bmw-e46-318i", "unverified"],
  // K&N Porsche 991
  ["p-035", "v-porsche-991-carrera-s", "confirmed"],
  // Bilstein B12 E46
  ["p-036", "v-bmw-e46-318i", "confirmed"],
  ["p-036", "v-bmw-e46-320d", "confirmed"],
  ["p-036", "v-bmw-e46-330i", "confirmed"],
  // KW V1 E90
  ["p-037", "v-bmw-e90-320i", "confirmed"],
  ["p-037", "v-bmw-e90-320d", "confirmed"],
  ["p-037", "v-bmw-e90-330i", "confirmed"],
  ["p-037", "v-bmw-e92-335i", "unverified"],
  // Eibach F10
  ["p-038", "v-bmw-f10-520d", "confirmed"],
  ["p-038", "v-bmw-f10-528i", "confirmed"],
  ["p-038", "v-bmw-f10-535i", "unverified"],
  // Bilstein B6 987
  ["p-039", "v-porsche-987-cayman", "confirmed"],
  // Brembo GT E46 330i
  ["p-040", "v-bmw-e46-330i", "confirmed"],
  // Ferodo F20
  ["p-041", "v-bmw-f20-116i", "confirmed"],
  ["p-041", "v-bmw-f20-118d", "confirmed"],
];

export const compatibility: CompatibilityRecord[] = rows.map(([productId, vehicleId, status, note]) => ({
  id: `c-${productId}-${vehicleId}`,
  productId,
  vehicleId,
  status,
  note,
}));
