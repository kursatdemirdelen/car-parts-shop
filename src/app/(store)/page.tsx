import { CategoryShowcase, FeaturedProducts, HomeHero } from "@/components/store/HomeSections";
import { SectionBoundary } from "@/components/ui/SectionBoundary";
import { MaintenanceStrip } from "@/components/store/MaintenanceStrip";
import { TrustStrip } from "@/components/store/TrustStrip";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <SectionBoundary label="Bakım hatırlatması">
        <MaintenanceStrip />
      </SectionBoundary>
      <SectionBoundary label="Kategoriler">
        <CategoryShowcase />
      </SectionBoundary>
      <SectionBoundary label="Öne çıkan ürünler">
        <FeaturedProducts />
      </SectionBoundary>
      <TrustStrip />
    </>
  );
}
