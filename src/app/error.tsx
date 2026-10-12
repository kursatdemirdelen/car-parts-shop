"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/Button";
import { catalogActions } from "@/state/catalog-store";

/**
 * Last-resort error screen. Most likely cause in this prototype is unexpected browser-stored data,
 * so it offers to restore the demo catalog (cart, favorites and garage are kept).
 */
export default function Error({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="container-page flex min-h-[60dvh] flex-col items-center justify-center py-16 text-center">
      <span className="flex size-14 items-center justify-center rounded-full bg-danger-soft text-danger">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <h1 className="mt-5 text-2xl font-semibold tracking-tight text-ink">Bir şeyler ters gitti</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Sayfa yüklenirken beklenmeyen bir hata oluştu. Tarayıcıda kayıtlı demo verileri bozulmuş olabilir.
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-2">
        <Button onClick={() => retry()}>Tekrar dene</Button>
        <Button
          variant="secondary"
          onClick={() => {
            catalogActions.resetDemoData();
            retry();
          }}
        >
          Demo verilerini sıfırla
        </Button>
      </div>
    </main>
  );
}
