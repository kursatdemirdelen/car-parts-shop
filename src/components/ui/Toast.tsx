"use client";

import { CheckCircle2, Info, X, XCircle } from "lucide-react";
import Link from "next/link";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/format";

type Tone = "success" | "error" | "info";
interface ToastAction {
  label: string;
  href: string;
}
interface ToastItem {
  id: number;
  message: string;
  tone: Tone;
  action?: ToastAction;
}

interface ToastApi {
  show(message: string, tone?: Tone, action?: ToastAction): void;
}

const ToastContext = createContext<ToastApi>({ show: () => {} });

const icons = { success: CheckCircle2, error: XCircle, info: Info };
const iconColor = { success: "text-success", error: "text-danger", info: "text-muted" };

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id: number) => setToasts((list) => list.filter((t) => t.id !== id)), []);

  const show = useCallback(
    (message: string, tone: Tone = "success", action?: ToastAction) => {
      const id = nextId.current++;
      setToasts((list) => [...list.slice(-2), { id, message, tone, action }]);
      window.setTimeout(() => dismiss(id), action ? 5000 : 3500);
    },
    [dismiss],
  );

  const api = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext value={api}>
      {children}
      <div
        aria-live="polite"
        role="status"
        className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex flex-col items-center gap-2 px-4 sm:right-4 sm:left-auto sm:items-end"
      >
        {toasts.map((t) => {
          const Icon = icons[t.tone];
          return (
            <div
              key={t.id}
              className="pointer-events-auto flex w-full max-w-sm animate-[ks-slide-up_var(--dur-base)_var(--ease-out)] items-start gap-3 rounded-[var(--radius-card)] border border-line bg-white px-4 py-3 text-sm shadow-[var(--shadow-pop)]"
            >
              <Icon className={cn("mt-0.5 size-4 shrink-0", iconColor[t.tone])} aria-hidden="true" />
              <p className="flex-1 text-ink">
                {t.message}
                {t.action && (
                  <>
                    {" "}
                    <Link href={t.action.href} className="font-medium underline underline-offset-2" onClick={() => dismiss(t.id)}>
                      {t.action.label}
                    </Link>
                  </>
                )}
              </p>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                className="-m-1 rounded p-1 text-subtle hover:text-ink"
                aria-label="Bildirimi kapat"
              >
                <X className="size-4" aria-hidden="true" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext>
  );
}

export function useToast(): ToastApi {
  return useContext(ToastContext);
}
