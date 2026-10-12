import { CategoryShowcase, FeaturedProducts, HomeHero } from "@/components/store/HomeSections";
import { TrustStrip } from "@/components/store/TrustStrip";

export default function HomePage() {
  return (
    <>
      <HomeHero />
      <CategoryShowcase />
      <FeaturedProducts />
      <TrustStrip />
    </>
  );
}
