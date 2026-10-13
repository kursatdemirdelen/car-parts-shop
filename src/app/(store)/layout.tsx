import { AnnouncementBar } from "@/components/store/AnnouncementBar";
import { StoreFooter } from "@/components/store/StoreFooter";
import { StoreHeader } from "@/components/store/StoreHeader";

export default function StoreLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <AnnouncementBar />
      <StoreHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <StoreFooter />
    </>
  );
}
