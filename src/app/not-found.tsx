import { NotFoundContent } from "@/components/store/NotFoundContent";
import { Logo } from "@/components/store/StoreHeader";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="border-b border-line">
        <div className="container-page flex h-16 items-center">
          <Logo />
        </div>
      </header>
      <main className="container-page flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-white to-surface py-16">
        <NotFoundContent />
      </main>
    </div>
  );
}
