import { describe, expect, it } from "vitest";
import { FITMENT_LABELS, type FitmentState } from "@/lib/catalog/fitment";
import type { MaintenanceStatus } from "@/lib/maintenance";
import { specIcon } from "@/lib/spec-icons";
import { brandMonogram, fitmentTag, maintenanceTag, orderStatusTag, stockTag } from "@/lib/tags";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/lib/types";

const FITMENT: FitmentState[] = ["confirmed", "unverified", "unknown", "incompatible", "universal"];
const ORDER: OrderStatus[] = ["received", "preparing", "shipped", "delivered", "cancelled"];
const MAINT: MaintenanceStatus[] = ["overdue", "soon", "unknown", "ok"];

describe("tag specs", () => {
  it("covers every fitment, order and maintenance state with a label and an icon", () => {
    for (const s of FITMENT) {
      expect(fitmentTag(s).label, s).toBe(FITMENT_LABELS[s]);
      expect(fitmentTag(s).icon, s).toBeTruthy();
    }
    for (const s of ORDER) {
      expect(orderStatusTag(s).label, s).toBe(ORDER_STATUS_LABELS[s]);
      expect(orderStatusTag(s).icon, s).toBeTruthy();
    }
    expect(MAINT.map((s) => maintenanceTag(s).label)).toEqual(["Gecikti", "Yaklaşıyor", "Bilinmiyor", "Zamanı var"]);
  });

  it("shows unknown fitment exactly like unverified", () => {
    expect(fitmentTag("unknown")).toEqual(fitmentTag("unverified"));
  });

  it("colors fitment and order states by meaning", () => {
    expect(fitmentTag("confirmed").tone).toBe("success");
    expect(fitmentTag("unverified").tone).toBe("warn");
    expect(fitmentTag("incompatible").tone).toBe("danger");
    expect(orderStatusTag("delivered").tone).toBe("success");
    expect(orderStatusTag("cancelled").tone).toBe("danger");
  });

  it("keeps the stock copy and maps stock levels to tones", () => {
    expect(stockTag(0, 5)).toMatchObject({ label: "Tükendi", tone: "danger" });
    expect(stockTag(3, 5)).toMatchObject({ label: "Son 3 adet", tone: "warn" });
    expect(stockTag(20, 5)).toMatchObject({ label: "Stokta", tone: "success" });
  });
});

describe("brandMonogram", () => {
  it("builds short initials", () => {
    expect(brandMonogram("NGK")).toBe("NGK");
    expect(brandMonogram("K&N")).toBe("KN");
    expect(brandMonogram("Febi Bilstein")).toBe("FB");
    expect(brandMonogram("Mann-Filter")).toBe("MF");
    expect(brandMonogram("Meguiar's")).toBe("ME");
    expect(brandMonogram("Brembo")).toBe("BR");
  });
});

describe("specIcon", () => {
  it("maps the common spec labels and ignores unknown ones", () => {
    for (const label of ["Tip", "Pozisyon", "Motor", "Hacim", "Adet", "Malzeme", "Kalınlık", "Çap", "Dış çap", "Viskozite", "Kasa", "Yakıt", "Uzunluk"])
      expect(specIcon(label), label).not.toBeNull();
    expect(specIcon("Bilinmeyen")).toBeNull();
    expect(specIcon("pozisyon")).toBe(specIcon("Pozisyon"));
  });
});
