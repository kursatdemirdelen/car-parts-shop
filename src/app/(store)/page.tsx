import { CategoryShowcase, FeaturedProducts, HomeHero } from "@/components/store/HomeSections";
import { MaintenanceStrip } from "@/components/store/MaintenanceStrip";
import { TrustStrip } from "@/components/store/TrustStrip";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <MaintenanceStrip />
      <CategoryShowcase />
      <FeaturedProducts />
      <TrustStrip />
    </>
  );
}
