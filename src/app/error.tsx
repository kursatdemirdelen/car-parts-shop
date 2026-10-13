"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
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
      <span className="relative mb-5 flex size-24 items-center justify-center" aria-hidden="true">
        <span className="absolute inset-0 rounded-full bg-danger-soft" />
        <span className="absolute inset-3 rounded-full bg-[#f8dcd8]" />
        <span className="relative flex size-12 items-center justify-center rounded-full bg-danger text-white">
          <AlertTriangle className="size-6" />
        </span>
      </span>
      <h1 className="text-2xl font-semibold tracking-tight text-ink">Bir şeyler ters gitti</h1>
      <p className="mt-2 max-w-md text-sm text-muted">
        Sayfa yüklenirken beklenmeyen bir hata oluştu. Tarayıcıda kayıtlı demo verileri bozulmuş olabilir; önce tekrar dene, düzelmezse demo
        verilerini sıfırla.
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
        <LinkButton href="/" variant="ghost">
          Ana sayfa
        </LinkButton>
      </div>
      {error.digest && <p className="mt-6 text-xs text-subtle">Hata kodu: {error.digest}</p>}
    </main>
  );
}
