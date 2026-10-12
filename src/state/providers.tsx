"use client";

import { useEffect, type ReactNode } from "react";
import { ToastProvider, useToast } from "@/components/ui/Toast";
import { setStorageWriteErrorHandler } from "./persistent-store";

/** Tells the user when a change could not be written to browser storage (e.g. quota or blocked storage). */
function StorageWriteErrors() {
  const toast = useToast();
  useEffect(() => {
    setStorageWriteErrorHandler(() =>
      toast.show("Tarayıcı depolama alanına yazılamadı; değişiklik bu sayfayı yenileyince kaybolabilir.", "error"),
    );
    return () => setStorageWriteErrorHandler(() => {});
  }, [toast]);
  return null;
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <StorageWriteErrors />
      {children}
    </ToastProvider>
  );
}
