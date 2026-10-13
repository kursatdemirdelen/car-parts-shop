import { SpinnerBlock } from "@/components/ui/Spinner";

/** Route-level fallback inside the admin panel layout. */
export default function Loading() {
  return <SpinnerBlock label="Sayfa yükleniyor…" className="min-h-[50dvh]" />;
}
