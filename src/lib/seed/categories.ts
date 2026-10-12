import type { Category } from "@/lib/types";

const root = (id: string, slug: string, name: string, description: string): Category => ({
  id,
  slug,
  name,
  parentId: null,
  description,
});

const sub = (parentId: string, slug: string, name: string, description: string): Category => ({
  id: `cat-${slug}`,
  slug,
  name,
  parentId,
  description,
  image: `/products/${slug}.svg`,
});

export const categories: Category[] = [
  root("cat-oem", "oem-parcalar", "OEM Parçalar", "Orijinal ve eşdeğer kalitede bakım ve onarım parçaları."),
  root("cat-performans", "performans", "Performans", "Egzoz, hava emiş, süspansiyon ve fren yükseltmeleri."),
  root("cat-bakim", "bakim-temizlik", "Bakım & Temizlik", "Motor yağları, sıvılar ve araç bakım ürünleri."),

  sub("cat-oem", "fren-sistemi", "Fren Sistemi", "Fren diskleri, balatalar ve sensörler."),
  sub("cat-oem", "filtreler", "Filtreler", "Yağ, hava, polen ve yakıt filtreleri."),
  sub("cat-oem", "suspansiyon-direksiyon", "Süspansiyon & Direksiyon", "Salıncaklar, rotiller, takozlar ve burçlar."),
  sub("cat-oem", "atesleme", "Ateşleme", "Bujiler, ateşleme bobinleri ve kızdırma bujileri."),
  sub("cat-oem", "sogutma", "Soğutma", "Radyatörler, termostatlar, su pompaları ve genleşme tankları."),
  sub("cat-oem", "motor-parcalari", "Motor Parçaları", "Contalar, kayışlar ve motor takozları."),

  sub("cat-performans", "egzoz-sistemleri", "Egzoz Sistemleri", "Arka susturucular, slip-on sistemler ve egzoz uçları."),
  sub("cat-performans", "hava-emis", "Hava Emiş", "Performans hava filtreleri ve kapalı emiş sistemleri."),
  sub("cat-performans", "yay-amortisor", "Yay & Amortisör", "Basık yay setleri, amortisörler ve coilover sistemleri."),
  sub("cat-performans", "fren-yukseltme", "Fren Yükseltme", "Büyük fren kitleri ve performans balatalar."),

  sub("cat-bakim", "motor-yagi-sivilar", "Motor Yağı & Sıvılar", "Motor yağları, fren hidroliği ve diğer sıvılar."),
  sub("cat-bakim", "dis-temizlik", "Dış Temizlik", "Şampuanlar ve jant temizleyiciler."),
  sub("cat-bakim", "cila-koruma", "Cila & Koruma", "Cilalar, wax ürünleri ve boya koruma."),
  sub("cat-bakim", "ic-temizlik", "İç Temizlik", "Deri, plastik ve kumaş yüzeyler için bakım ürünleri."),
];
