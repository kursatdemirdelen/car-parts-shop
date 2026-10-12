import type { Brand } from "@/lib/types";

const brand = (slug: string, name: string, country: string): Brand => ({ id: `brand-${slug}`, slug, name, country });

/** Part manufacturers. Names are real brands used as demo catalog data only. */
export const brands: Brand[] = [
  brand("bosch", "Bosch", "Almanya"),
  brand("brembo", "Brembo", "İtalya"),
  brand("zimmermann", "Zimmermann", "Almanya"),
  brand("mann-filter", "Mann-Filter", "Almanya"),
  brand("mahle", "Mahle", "Almanya"),
  brand("ngk", "NGK", "Japonya"),
  brand("lemforder", "Lemförder", "Almanya"),
  brand("febi-bilstein", "Febi Bilstein", "Almanya"),
  brand("bilstein", "Bilstein", "Almanya"),
  brand("contitech", "ContiTech", "Almanya"),
  brand("elring", "Elring", "Almanya"),
  brand("akrapovic", "Akrapovič", "Slovenya"),
  brand("eisenmann", "Eisenmann", "Almanya"),
  brand("remus", "Remus", "Avusturya"),
  brand("eventuri", "Eventuri", "Birleşik Krallık"),
  brand("bmc", "BMC", "İtalya"),
  brand("kn", "K&N", "ABD"),
  brand("kw", "KW", "Almanya"),
  brand("eibach", "Eibach", "Almanya"),
  brand("ferodo", "Ferodo", "Birleşik Krallık"),
  brand("castrol", "Castrol", "Birleşik Krallık"),
  brand("liqui-moly", "Liqui Moly", "Almanya"),
  brand("ate", "ATE", "Almanya"),
  brand("meguiars", "Meguiar's", "ABD"),
  brand("sonax", "Sonax", "Almanya"),
];
