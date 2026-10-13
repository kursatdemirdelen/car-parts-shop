import { SpinnerBlock } from "@/components/ui/Spinner";

/** Route-level fallback while a store page segment streams in. */
export default function Loading() {
  return <SpinnerBlock label="Sayfa yükleniyor…" className="container-page min-h-[60dvh]" />;
}
