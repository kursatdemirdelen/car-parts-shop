import type { FitmentType, Product, PublicationStatus, Spec } from "@/lib/types";

/**
 * Demo product catalog. Names, prices, OEM numbers and specs are sample data for the
 * prototype and must not be treated as verified catalog information.
 */
type Input = {
  id: string;
  slug: string;
  name: string;
  description: string;
  sku: string;
  oem?: string[];
  brand: string;
  category: string;
  price: number;
  compareAtPrice?: number;
  stock: number;
  status?: PublicationStatus;
  fitment?: FitmentType;
  specs?: [string, string][];
  featured?: boolean;
  companions?: string[];
  created: string;
};

const product = (i: Input): Product => ({
  id: i.id,
  slug: i.slug,
  name: i.name,
  description: i.description,
  sku: i.sku,
  oemNumbers: i.oem ?? [],
  brandId: `brand-${i.brand}`,
  categoryId: `cat-${i.category}`,
  price: i.price,
  compareAtPrice: i.compareAtPrice,
  stock: i.stock,
  status: i.status ?? "published",
  fitmentType: i.fitment ?? "vehicle-specific",
  images: [{ src: `/products/${i.category}.svg`, alt: i.name }],
  specs: (i.specs ?? []).map(([label, value]): Spec => ({ label, value })),
  featured: i.featured,
  companionIds: i.companions,
  createdAt: `${i.created}T09:00:00.000Z`,
  updatedAt: `${i.created}T09:00:00.000Z`,
});

export const products: Product[] = [
  // ── Fren Sistemi ────────────────────────────────────────────────
  product({
    id: "p-001", slug: "brembo-on-fren-diski-seti-e46-330i", name: "Ön Fren Diski Seti (325 mm, havalı)",
    description: "E46 330i için ön aks havalı fren diski seti. Set iki adet disk içerir; balata ayrıca satılır.",
    sku: "KS-FR-1001", oem: ["34116855000"], brand: "brembo", category: "fren-sistemi",
    price: 4680, stock: 9, created: "2026-06-02",
    specs: [["Pozisyon", "Ön aks"], ["Çap", "325 mm"], ["Kalınlık", "25 mm"], ["Tip", "Havalı"], ["Adet", "2 (set)"]],
  }),
  product({
    id: "p-002", companions: ["p-044"], slug: "brembo-on-fren-balatasi-g20", name: "Ön Fren Balatası Seti",
    description: "G20 3 Serisi standart fren sistemi için ön balata seti. Aşınma sensörü dahil değildir.",
    sku: "KS-FR-1002", oem: ["34116860912", "34106888459"], brand: "brembo", category: "fren-sistemi",
    price: 2450, stock: 14, featured: true, created: "2026-06-04",
    specs: [["Pozisyon", "Ön aks"], ["Genişlik", "155,1 mm"], ["Yükseklik", "68,6 mm"], ["Kalınlık", "20,3 mm"], ["Aşınma sensörü", "Hazırlıklı, sensör hariç"]],
  }),
  product({
    id: "p-003", companions: ["p-044"], slug: "bosch-arka-fren-balatasi-f10", name: "Arka Fren Balatası Seti",
    description: "F10 5 Serisi arka aks için balata seti. Montajda aşınma sensörünün değiştirilmesi önerilir.",
    sku: "KS-FR-1003", oem: ["34216850570"], brand: "bosch", category: "fren-sistemi",
    price: 1980, stock: 11, created: "2026-06-05",
    specs: [["Pozisyon", "Arka aks"], ["Genişlik", "123,2 mm"], ["Kalınlık", "17,6 mm"]],
  }),
  product({
    id: "p-004", companions: ["p-005", "p-044"], slug: "zimmermann-on-fren-diski-e90-300mm", name: "Ön Fren Diski (300 mm)",
    description: "E90 320i / 320d standart fren sistemi için ön disk. Fiyat tek adet içindir.",
    sku: "KS-FR-1004", oem: ["34116854998"], brand: "zimmermann", category: "fren-sistemi",
    price: 1890, stock: 16, created: "2026-06-07",
    specs: [["Pozisyon", "Ön aks"], ["Çap", "300 mm"], ["Kalınlık", "24 mm"], ["Tip", "Havalı"], ["Adet", "1"]],
  }),
  product({
    id: "p-005", companions: ["p-004"], slug: "bosch-fren-balata-asinma-sensoru-e90", name: "Fren Balata Aşınma Sensörü (ön)",
    description: "E90 / E92 ön aks balata aşınma sensörü. Balata değişiminde birlikte değiştirilmesi önerilir.",
    sku: "KS-FR-1005", oem: ["34356789439"], brand: "bosch", category: "fren-sistemi",
    price: 340, stock: 0, created: "2026-06-08",
    specs: [["Pozisyon", "Ön aks"], ["Kablo uzunluğu", "755 mm"]],
  }),

  // ── Filtreler ───────────────────────────────────────────────────
  product({
    id: "p-006", companions: ["p-042", "p-043", "p-018"], slug: "mann-yag-filtresi-hu816x", name: "Yağ Filtresi HU 816 x",
    description: "N52 / N54 benzinli motorlar için kartuş tipi yağ filtresi. Conta seti dahildir.",
    sku: "KS-FL-2001", oem: ["11427566327", "11427541827"], brand: "mann-filter", category: "filtreler",
    price: 420, stock: 48, featured: true, created: "2026-05-20",
    specs: [["Tip", "Kartuş"], ["Yükseklik", "115 mm"], ["Dış çap", "71 mm"], ["Conta", "Dahil"]],
  }),
  product({
    id: "p-007", slug: "mann-hava-filtresi-e46-320d", name: "Hava Filtresi",
    description: "E46 320d için panel tipi motor hava filtresi.",
    sku: "KS-FL-2002", oem: ["13717787161"], brand: "mann-filter", category: "filtreler",
    price: 650, stock: 22, created: "2026-05-21",
    specs: [["Tip", "Panel"], ["Uzunluk", "308 mm"], ["Genişlik", "175 mm"], ["Yükseklik", "58 mm"]],
  }),
  product({
    id: "p-008", slug: "mahle-aktif-karbon-polen-filtresi-e90", name: "Aktif Karbonlu Polen Filtresi Seti",
    description: "E90 / E92 için iki parçalı aktif karbonlu kabin filtresi seti.",
    sku: "KS-FL-2003", oem: ["64319313519"], brand: "mahle", category: "filtreler",
    price: 780, stock: 30, created: "2026-05-22",
    specs: [["Tip", "Aktif karbon"], ["Adet", "2 (set)"]],
  }),
  product({
    id: "p-009", slug: "mann-yakit-filtresi-n47", name: "Yakıt Filtresi WK 5002 x",
    description: "N47 dizel motorlu modeller için hat tipi yakıt filtresi.",
    sku: "KS-FL-2004", oem: ["13327811401"], brand: "mann-filter", category: "filtreler",
    price: 1150, stock: 12, created: "2026-05-23",
    specs: [["Tip", "Hat tipi"], ["Yakıt", "Dizel"], ["Yükseklik", "152 mm"]],
  }),
  product({
    id: "p-010", slug: "bosch-yag-filtresi-om651", name: "Yağ Filtresi (OM651)",
    description: "Mercedes-Benz OM651 dizel motorlar için kartuş tipi yağ filtresi.",
    sku: "KS-FL-2005", oem: ["A6511800109"], brand: "bosch", category: "filtreler",
    price: 460, stock: 25, created: "2026-05-24",
    specs: [["Tip", "Kartuş"], ["Dış çap", "64 mm"], ["Yükseklik", "137 mm"]],
  }),
  product({
    id: "p-011", slug: "mann-hava-filtresi-audi-b8-tdi", name: "Hava Filtresi (2.0 TDI)",
    description: "Audi A4 B8 2.0 TDI için panel tipi hava filtresi.",
    sku: "KS-FL-2006", oem: ["8K0133843D"], brand: "mann-filter", category: "filtreler",
    price: 720, stock: 3, created: "2026-05-25",
    specs: [["Tip", "Panel"], ["Uzunluk", "302 mm"], ["Genişlik", "236 mm"]],
  }),
  product({
    id: "p-012", slug: "mahle-yag-filtresi-porsche-997", name: "Yağ Filtresi (Porsche 997 / 987)",
    description: "Porsche 997 ve 987 serisi için spin-on yağ filtresi.",
    sku: "KS-FL-2007", oem: ["99610722553"], brand: "mahle", category: "filtreler",
    price: 980, stock: 8, created: "2026-05-26",
    specs: [["Tip", "Spin-on"], ["Dış çap", "76 mm"], ["Yükseklik", "123 mm"]],
  }),

  // ── Süspansiyon & Direksiyon ────────────────────────────────────
  product({
    id: "p-013", slug: "lemforder-on-salincak-sol-e46", name: "Ön Alt Salıncak Kolu (sol)",
    description: "E46 3 Serisi sol ön alt salıncak kolu, rotil dahil.",
    sku: "KS-SU-3001", oem: ["31126758519"], brand: "lemforder", category: "suspansiyon-direksiyon",
    price: 3920, stock: 7, featured: true, created: "2026-06-10",
    specs: [["Pozisyon", "Ön aks, sol, alt"], ["Rotil", "Dahil"], ["Burç", "Dahil"]],
  }),
  product({
    id: "p-014", slug: "lemforder-z-rot-f10", name: "Ön Z-Rot (Stabilizatör Bağlantı Çubuğu)",
    description: "F10 5 Serisi ön stabilizatör bağlantı çubuğu. Fiyat tek adet içindir.",
    sku: "KS-SU-3002", oem: ["31306777319"], brand: "lemforder", category: "suspansiyon-direksiyon",
    price: 1240, stock: 18, created: "2026-06-11",
    specs: [["Pozisyon", "Ön aks, sol/sağ"], ["Uzunluk", "290 mm"]],
  }),
  product({
    id: "p-015", slug: "febi-on-amortisor-takozu-e36", name: "Ön Amortisör Üst Takozu",
    description: "E36 3 Serisi ön amortisör üst takozu. Fiyat tek adet içindir.",
    sku: "KS-SU-3003", oem: ["31331139482"], brand: "febi-bilstein", category: "suspansiyon-direksiyon",
    price: 690, stock: 20, created: "2026-06-12",
    specs: [["Pozisyon", "Ön aks, üst"], ["Rulman", "Dahil değil"]],
  }),
  product({
    id: "p-016", slug: "febi-arka-diferansiyel-burcu-e39", name: "Arka Diferansiyel Burcu",
    description: "E39 5 Serisi arka diferansiyel montaj burcu.",
    sku: "KS-SU-3004", oem: ["33171090018"], brand: "febi-bilstein", category: "suspansiyon-direksiyon",
    price: 1460, stock: 0, created: "2026-06-13",
    specs: [["Pozisyon", "Arka diferansiyel"], ["Malzeme", "Kauçuk-metal"]],
  }),
  product({
    id: "p-017", slug: "lemforder-rot-basi-w204", name: "Rot Başı (dış)",
    description: "Mercedes-Benz W204 C-Serisi dış rot başı.",
    sku: "KS-SU-3005", oem: ["A2043300203"], brand: "lemforder", category: "suspansiyon-direksiyon",
    price: 1080, stock: 13, created: "2026-06-14",
    specs: [["Pozisyon", "Ön aks, sol/sağ"], ["Diş", "M14x1,5"]],
  }),

  // ── Ateşleme ────────────────────────────────────────────────────
  product({
    id: "p-018", companions: ["p-019", "p-006"], slug: "ngk-iridyum-buji-n52", name: "İridyum Buji ILZKR7B11",
    description: "N52 altı silindirli benzinli motorlar için iridyum uçlu buji. Fiyat tek adet içindir.",
    sku: "KS-AT-4001", oem: ["12120037244"], brand: "ngk", category: "atesleme",
    price: 520, stock: 60, created: "2026-05-15",
    specs: [["Elektrot", "İridyum"], ["Diş çapı", "12 mm"], ["Anahtar ağzı", "14 mm"], ["Tırnak aralığı", "1,1 mm"]],
  }),
  product({
    id: "p-019", companions: ["p-018"], slug: "bosch-atesleme-bobini-bmw", name: "Ateşleme Bobini",
    description: "N52 / N54 / N55 motorlar için kalem tipi ateşleme bobini.",
    sku: "KS-AT-4002", oem: ["12138616153", "12137594937"], brand: "bosch", category: "atesleme",
    price: 2280, stock: 24, created: "2026-05-16",
    specs: [["Tip", "Kalem bobin"], ["Bağlantı", "4 pin"]],
  }),
  product({
    id: "p-020", slug: "bosch-kizdirma-bujisi-n47", name: "Kızdırma Bujisi Duraterm",
    description: "N47 dizel motorlar için seramik kızdırma bujisi. Fiyat tek adet içindir.",
    sku: "KS-AT-4003", oem: ["12232248142"], brand: "bosch", category: "atesleme",
    price: 610, stock: 35, created: "2026-05-17",
    specs: [["Tip", "Seramik"], ["Voltaj", "4,4 V"], ["Diş", "M10x1"]],
  }),
  product({
    id: "p-021", slug: "ngk-buji-porsche-991", name: "Buji (Porsche 991)",
    description: "Porsche 991 Carrera modelleri için buji. Fiyat tek adet içindir.",
    sku: "KS-AT-4004", oem: ["99917022290"], brand: "ngk", category: "atesleme",
    price: 890, stock: 2, created: "2026-05-18",
    specs: [["Elektrot", "İridyum"], ["Diş çapı", "12 mm"]],
  }),

  // ── Soğutma ─────────────────────────────────────────────────────
  product({
    id: "p-022", companions: ["p-023"], slug: "mahle-radyator-e46", name: "Motor Su Radyatörü",
    description: "E46 3 Serisi benzinli, manuel şanzımanlı araçlar için alüminyum çekirdekli radyatör.",
    sku: "KS-SO-5001", oem: ["17117519209"], brand: "mahle", category: "sogutma",
    price: 8900, stock: 5, created: "2026-06-15",
    specs: [["Çekirdek", "Alüminyum"], ["Uzunluk", "590 mm"], ["Yükseklik", "438 mm"], ["Şanzıman", "Manuel"]],
  }),
  product({
    id: "p-023", companions: ["p-022", "p-024"], slug: "febi-termostat-m54", name: "Termostat (contalı)",
    description: "M52TU / M54 motorlar için gövdeli termostat, conta dahil.",
    sku: "KS-SO-5002", oem: ["11537511083"], brand: "febi-bilstein", category: "sogutma",
    price: 1850, stock: 10, created: "2026-06-16",
    specs: [["Açılma sıcaklığı", "88 °C"], ["Gövde", "Dahil"], ["Conta", "Dahil"]],
  }),
  product({
    id: "p-024", slug: "febi-genlesme-tanki-e90", name: "Radyatör Genleşme Tankı",
    description: "E90 / E92 serisi için genleşme tankı. Kapak ayrıca satılır.",
    sku: "KS-SO-5003", oem: ["17137640514"], brand: "febi-bilstein", category: "sogutma",
    price: 1390, stock: 9, created: "2026-06-17",
    specs: [["Seviye sensörü", "Hazırlıklı"], ["Kapak", "Dahil değil"]],
  }),
  product({
    id: "p-025", slug: "mahle-su-pompasi-audi-18-tfsi", name: "Su Pompası (termostat gövdeli)",
    description: "Audi EA888 1.8 TFSI motorlar için termostat gövdeli su pompası.",
    sku: "KS-SO-5004", oem: ["06H121026"], brand: "mahle", category: "sogutma",
    price: 5400, stock: 4, created: "2026-06-18",
    specs: [["Malzeme", "Plastik gövde"], ["Termostat", "Dahil"]],
  }),

  // ── Motor Parçaları ─────────────────────────────────────────────
  product({
    id: "p-026", slug: "elring-valf-kapagi-contasi-m54", name: "Külbütör Kapağı Conta Seti",
    description: "M52TU / M54 motorlar için külbütör kapağı contası ve bijon contaları.",
    sku: "KS-MP-6001", oem: ["11120030496"], brand: "elring", category: "motor-parcalari",
    price: 1250, stock: 17, created: "2026-05-28",
    specs: [["İçerik", "Kapak contası + bijon contaları"], ["Malzeme", "ACM kauçuk"]],
  }),
  product({
    id: "p-027", slug: "contitech-v-kayisi-e90", name: "Kanallı V Kayışı",
    description: "E90 serisi benzinli motorlar için yardımcı aksam kayışı.",
    sku: "KS-MP-6002", oem: ["11287628650"], brand: "contitech", category: "motor-parcalari",
    price: 890, stock: 21, created: "2026-05-29",
    specs: [["Kanal sayısı", "6"], ["Uzunluk", "1538 mm"]],
  }),
  product({
    id: "p-028", slug: "febi-motor-takozu-w212", name: "Motor Takozu",
    description: "Mercedes-Benz W212 E-Serisi motor takozu.",
    sku: "KS-MP-6003", oem: ["A2122402117"], brand: "febi-bilstein", category: "motor-parcalari",
    price: 3200, stock: 6, status: "draft", created: "2026-05-30",
    specs: [["Pozisyon", "Sol / sağ"], ["Tip", "Hidrolik"]],
  }),
  product({
    id: "p-029", slug: "elring-karter-contasi-e36", name: "Yağ Karteri Contası",
    description: "E36 4 silindirli motorlar için yağ karteri contası.",
    sku: "KS-MP-6004", oem: ["11131736919"], brand: "elring", category: "motor-parcalari",
    price: 760, stock: 12, status: "draft", created: "2026-05-31",
    specs: [["Malzeme", "Kauçuk-metal"]],
  }),

  // ── Egzoz Sistemleri ────────────────────────────────────────────
  product({
    id: "p-030", slug: "akrapovic-slip-on-titanyum-g20-m340i", name: "Slip-On Egzoz Sistemi (Titanyum)",
    description: "G20 M340i için titanyum slip-on egzoz sistemi, karbon uçlar dahil. Montaj ve yasal uygunluk kontrolü müşteriye aittir.",
    sku: "KS-EG-7001", oem: [], brand: "akrapovic", category: "egzoz-sistemleri",
    price: 185000, stock: 2, featured: true, created: "2026-07-01",
    specs: [["Malzeme", "Titanyum"], ["Uç", "Karbon fiber"], ["Ağırlık", "≈ 9,4 kg"], ["Montaj", "Cıvatalı (bolt-on)"]],
  }),
  product({
    id: "p-031", slug: "eisenmann-arka-susturucu-e92-335i", name: "Arka Susturucu Race (4×83 mm)",
    description: "E92 335i için paslanmaz çelik arka susturucu.",
    sku: "KS-EG-7002", oem: [], brand: "eisenmann", category: "egzoz-sistemleri",
    price: 62000, stock: 0, created: "2026-07-02",
    specs: [["Malzeme", "Paslanmaz çelik"], ["Uç", "4 × 83 mm"]],
  }),
  product({
    id: "p-032", slug: "remus-egzoz-ucu-seti-f20", name: "Sport Egzoz Ucu Seti",
    description: "F20 1 Serisi için paslanmaz çelik egzoz ucu seti.",
    sku: "KS-EG-7003", oem: [], brand: "remus", category: "egzoz-sistemleri",
    price: 14500, stock: 6, created: "2026-07-03",
    specs: [["Malzeme", "Paslanmaz çelik"], ["Uç çapı", "2 × 84 mm"]],
  }),

  // ── Hava Emiş ───────────────────────────────────────────────────
  product({
    id: "p-033", slug: "eventuri-karbon-hava-emis-g20-m340i", name: "Karbon Hava Emiş Sistemi",
    description: "G20 M340i için karbon fiber kapalı hava emiş sistemi.",
    sku: "KS-HE-8001", oem: [], brand: "eventuri", category: "hava-emis",
    price: 78000, stock: 3, featured: true, created: "2026-07-05",
    specs: [["Malzeme", "Karbon fiber"], ["Filtre", "Konik, yıkanabilir"]],
  }),
  product({
    id: "p-034", slug: "bmc-performans-hava-filtresi-e46", name: "Performans Panel Hava Filtresi",
    description: "E46 330i için yıkanabilir pamuk performans panel filtresi.",
    sku: "KS-HE-8002", oem: [], brand: "bmc", category: "hava-emis",
    price: 4200, stock: 8, created: "2026-07-06",
    specs: [["Malzeme", "Pamuk, yıkanabilir"], ["Tip", "Panel"]],
  }),
  product({
    id: "p-035", slug: "kn-panel-hava-filtresi-porsche-991", name: "Panel Hava Filtresi (Porsche 991)",
    description: "Porsche 991 Carrera için yıkanabilir panel hava filtresi. Fiyat tek adet içindir; araçta iki adet bulunur.",
    sku: "KS-HE-8003", oem: [], brand: "kn", category: "hava-emis",
    price: 5600, stock: 4, created: "2026-07-07",
    specs: [["Malzeme", "Pamuk, yıkanabilir"], ["Adet", "1"]],
  }),

  // ── Yay & Amortisör ─────────────────────────────────────────────
  product({
    id: "p-036", companions: ["p-013"], slug: "bilstein-b12-pro-kit-e46", name: "B12 Pro-Kit Süspansiyon Seti",
    description: "E46 sedan için B8 amortisör ve basık yay seti. Yaklaşık 30–40 mm basıklık sağlar.",
    sku: "KS-YA-9001", oem: [], brand: "bilstein", category: "yay-amortisor",
    price: 38500, stock: 5, featured: true, created: "2026-07-08",
    specs: [["Basıklık (ön)", "≈ 30–40 mm"], ["Basıklık (arka)", "≈ 30 mm"], ["İçerik", "4 amortisör + 4 yay"]],
  }),
  product({
    id: "p-037", slug: "kw-coilover-v1-e90", name: "Coilover V1 (ayarlı yükseklik)",
    description: "E90 sedan için yükseklik ayarlı coilover süspansiyon sistemi.",
    sku: "KS-YA-9002", oem: [], brand: "kw", category: "yay-amortisor",
    price: 96000, stock: 2, created: "2026-07-09",
    specs: [["Yükseklik ayarı", "Var"], ["Sönümleme ayarı", "Yok (sabit)"], ["Gövde", "Paslanmaz çelik"]],
  }),
  product({
    id: "p-038", slug: "eibach-pro-kit-yay-seti-f10", name: "Pro-Kit Basık Yay Seti",
    description: "F10 5 Serisi için basık yay seti. Orijinal amortisörlerle kullanılmak üzere tasarlanmıştır.",
    sku: "KS-YA-9003", oem: [], brand: "eibach", category: "yay-amortisor",
    price: 14800, stock: 7, created: "2026-07-10",
    specs: [["Basıklık (ön)", "≈ 25 mm"], ["Basıklık (arka)", "≈ 20 mm"], ["Adet", "4"]],
  }),
  product({
    id: "p-039", slug: "bilstein-b6-arka-amortisor-987", name: "B6 Arka Amortisör",
    description: "Porsche 987 Cayman için gazlı arka amortisör. Fiyat tek adet içindir.",
    sku: "KS-YA-9004", oem: [], brand: "bilstein", category: "yay-amortisor",
    price: 11200, stock: 6, created: "2026-07-11",
    specs: [["Pozisyon", "Arka aks"], ["Tip", "Monotüp, gazlı"]],
  }),

  // ── Fren Yükseltme ──────────────────────────────────────────────
  product({
    id: "p-040", slug: "brembo-gt-6-pistonlu-fren-kiti-e46-330i", name: "GT 6 Pistonlu Ön Fren Kiti (355 mm)",
    description: "E46 330i için 6 pistonlu kaliper ve 355 mm iki parçalı disk içeren ön fren kiti. Jant uyumluluğu ayrıca kontrol edilmelidir.",
    sku: "KS-FY-9501", oem: [], brand: "brembo", category: "fren-yukseltme",
    price: 128000, stock: 1, created: "2026-07-12",
    specs: [["Kaliper", "6 piston"], ["Disk", "355 × 32 mm, iki parçalı"], ["Minimum jant", "18 inç"]],
  }),
  product({
    id: "p-041", slug: "ferodo-ds2500-on-balata-f20", name: "DS2500 Performans Ön Balata",
    description: "F20 1 Serisi için yol ve pist kullanımına yönelik performans balata.",
    sku: "KS-FY-9502", oem: [], brand: "ferodo", category: "fren-yukseltme",
    price: 7900, stock: 9, created: "2026-07-13",
    specs: [["Pozisyon", "Ön aks"], ["Kullanım", "Yol / hafif pist"]],
  }),

  // ── Motor Yağı & Sıvılar (araca bağlı değil) ─────────────────────
  product({
    id: "p-042", slug: "castrol-edge-5w-30-ll-5l", name: "EDGE 5W-30 LL Motor Yağı 5 L",
    description: "Tam sentetik motor yağı. Aracınızın üretici onay gereksinimini kullanım kılavuzundan kontrol edin.",
    sku: "KS-YS-1101", brand: "castrol", category: "motor-yagi-sivilar", fitment: "universal",
    price: 2650, stock: 40, featured: true, created: "2026-05-10",
    specs: [["Viskozite", "5W-30"], ["Tip", "Tam sentetik"], ["Hacim", "5 L"]],
  }),
  product({
    id: "p-043", slug: "liqui-moly-top-tec-4200-5w-30-5l", name: "Top Tec 4200 5W-30 Motor Yağı 5 L",
    description: "Uzun değişim aralıklı tam sentetik motor yağı.",
    sku: "KS-YS-1102", brand: "liqui-moly", category: "motor-yagi-sivilar", fitment: "universal",
    price: 3100, stock: 26, created: "2026-05-11",
    specs: [["Viskozite", "5W-30"], ["Tip", "Tam sentetik"], ["Hacim", "5 L"]],
  }),
  product({
    id: "p-044", slug: "ate-fren-hidroligi-dot4-1l", name: "Fren Hidroliği DOT 4 1 L",
    description: "DOT 4 sınıfı fren hidroliği. Aracınız için belirtilen sınıfı kullanım kılavuzundan kontrol edin.",
    sku: "KS-YS-1103", brand: "ate", category: "motor-yagi-sivilar", fitment: "universal",
    price: 420, stock: 4, created: "2026-05-12",
    specs: [["Sınıf", "DOT 4"], ["Hacim", "1 L"]],
  }),

  // ── Dış Temizlik ────────────────────────────────────────────────
  product({
    id: "p-045", slug: "meguiars-gold-class-sampuan-1-89l", name: "Gold Class Oto Şampuanı 1,89 L",
    description: "Boya yüzeyine nazik, köpüklü oto şampuanı.",
    sku: "KS-DT-1201", brand: "meguiars", category: "dis-temizlik", fitment: "universal",
    price: 890, stock: 33, featured: true, created: "2026-05-05",
    specs: [["Hacim", "1,89 L"], ["Kullanım", "Kova yöntemi"]],
  }),
  product({
    id: "p-046", slug: "sonax-jant-temizleyici-500ml", name: "Jant Temizleyici 500 ml",
    description: "Asit içermeyen, renk değiştiren jant temizleyici sprey.",
    sku: "KS-DT-1202", brand: "sonax", category: "dis-temizlik", fitment: "universal",
    price: 520, stock: 0, created: "2026-05-06",
    specs: [["Hacim", "500 ml"], ["Form", "Sprey"]],
  }),

  // ── Cila & Koruma ───────────────────────────────────────────────
  product({
    id: "p-047", slug: "meguiars-ultimate-liquid-wax-473ml", name: "Ultimate Liquid Wax 473 ml",
    description: "Sentetik polimer içerikli sıvı wax.",
    sku: "KS-CK-1301", brand: "meguiars", category: "cila-koruma", fitment: "universal",
    price: 1150, stock: 15, created: "2026-05-07",
    specs: [["Hacim", "473 ml"], ["Uygulama", "Elle veya makineyle"]],
  }),
  product({
    id: "p-048", slug: "sonax-xtreme-hizli-cila-750ml", name: "Xtreme Hızlı Cila Sprey 750 ml",
    description: "Yıkama sonrası hızlı parlaklık ve koruma için sprey cila.",
    sku: "KS-CK-1302", brand: "sonax", category: "cila-koruma", fitment: "universal",
    price: 640, stock: 19, created: "2026-05-08",
    specs: [["Hacim", "750 ml"], ["Form", "Sprey"]],
  }),

  // ── İç Temizlik ─────────────────────────────────────────────────
  product({
    id: "p-049", slug: "meguiars-deri-temizleyici-bakim-400ml", name: "Deri Temizleyici & Bakım 400 ml",
    description: "Deri koltuklar için temizleyici ve bakım losyonu.",
    sku: "KS-IT-1401", brand: "meguiars", category: "ic-temizlik", fitment: "universal",
    price: 760, stock: 14, created: "2026-05-09",
    specs: [["Hacim", "400 ml"], ["Yüzey", "Deri"]],
  }),
  product({
    id: "p-050", slug: "sonax-torpido-temizleyici-300ml", name: "Torpido Temizleyici Mat 300 ml",
    description: "Plastik iç yüzeyler için mat bitişli temizleyici.",
    sku: "KS-IT-1402", brand: "sonax", category: "ic-temizlik", fitment: "universal",
    price: 390, stock: 22, created: "2026-05-09",
    specs: [["Hacim", "300 ml"], ["Bitiş", "Mat"]],
  }),
];
