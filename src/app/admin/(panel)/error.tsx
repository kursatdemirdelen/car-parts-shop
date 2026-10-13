"use client";

import { AlertTriangle } from "lucide-react";
import { useEffect } from "react";
import { Button, LinkButton } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/Display";

/** Errors inside the admin panel keep the sidebar; only the content area shows this card. */
export default function AdminError({ error, retry }: { error: Error & { digest?: string }; retry: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="py-10">
      <EmptyState
        icon={AlertTriangle}
        title="Bu ekran yüklenemedi"
        description="Beklenmeyen bir hata oluştu. Tekrar dene; sorun sürerse Ayarlar'dan demo verilerini sıfırlayabilirsin."
        action={
          <>
            <Button onClick={() => retry()}>Tekrar dene</Button>
            <LinkButton href="/admin" variant="secondary">
              Gösterge paneli
            </LinkButton>
          </>
        }
      />
    </div>
  );
}
