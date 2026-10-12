"use client";

import { X } from "lucide-react";
import { useEffect, useId, useLayoutEffect, useRef, type ReactNode } from "react";
import { cn } from "@/lib/format";
import { Button } from "./Button";

interface ModalBaseProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Native <dialog> opened with showModal(): top layer, focus containment and Esc for free.
 * Light dismiss uses `closedby="any"` with a click-outside fallback for browsers without it.
 */
function useModalDialog(open: boolean, onClose: () => void) {
  const ref = useRef<HTMLDialogElement>(null);
  const onCloseRef = useRef(onClose);
  // Set when we close the dialog ourselves during cleanup, so that close is not reported as a user dismissal.
  const silentClose = useRef(false);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    const handleClose = () => {
      if (silentClose.current) {
        silentClose.current = false;
        return;
      }
      onCloseRef.current();
    };
    const handleClick = (event: MouseEvent) => {
      if ("closedBy" in HTMLDialogElement.prototype || event.target !== dialog) return;
      const rect = dialog.getBoundingClientRect();
      const inside =
        rect.top <= event.clientY &&
        event.clientY <= rect.bottom &&
        rect.left <= event.clientX &&
        event.clientX <= rect.right;
      if (!inside) dialog.close();
    };
    dialog.addEventListener("close", handleClose);
    dialog.addEventListener("click", handleClick);
    return () => {
      dialog.removeEventListener("close", handleClose);
      dialog.removeEventListener("click", handleClick);
    };
  }, []);

  // When the route is hidden by <Activity> (or effects re-run in development), take the modal out of the
  // top layer without reporting a dismissal; the open effect shows it again if it is still meant to be open.
  useLayoutEffect(() => {
    const dialog = ref.current;
    return () => {
      if (dialog?.open) {
        silentClose.current = true;
        dialog.close();
      }
    };
  }, []);

  return ref;
}

export function Dialog({ open, onClose, title, children, footer, className }: ModalBaseProps) {
  const ref = useModalDialog(open, onClose);
  const titleId = useId();
  return (
    <dialog
      ref={ref}
      closedby="any"
      aria-labelledby={titleId}
      className={cn(
        "m-auto w-[calc(100%-2rem)] max-w-lg rounded-[var(--radius-card)] bg-white p-0 text-ink shadow-[var(--shadow-pop)] open:animate-[ks-fade-in_160ms_ease-out]",
        className,
      )}
    >
      <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
        <h2 id={titleId} className="text-base font-semibold">
          {title}
        </h2>
        <button
          type="button"
          onClick={onClose}
          className="-m-1 rounded-md p-1 text-muted hover:bg-surface hover:text-ink"
          aria-label="Kapat"
        >
          <X className="size-5" aria-hidden="true" />
        </button>
      </div>
      <div className="max-h-[70dvh] overflow-y-auto px-5 py-4">{children}</div>
      {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-3">{footer}</div>}
    </dialog>
  );
}

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  side = "right",
  className,
}: ModalBaseProps & { side?: "left" | "right" }) {
  const ref = useModalDialog(open, onClose);
  const titleId = useId();
  return (
    <dialog
      ref={ref}
      closedby="any"
      aria-labelledby={titleId}
      className={cn(
        "fixed inset-y-0 m-0 h-dvh max-h-none w-[min(24rem,calc(100%-2.5rem))] max-w-none bg-white p-0 text-ink shadow-[var(--shadow-pop)]",
        side === "left"
          ? "left-0 right-auto open:animate-[ks-slide-in-left_200ms_ease-out]"
          : "right-0 left-auto open:animate-[ks-slide-in-right_200ms_ease-out]",
        className,
      )}
    >
      <div className="flex h-full flex-col">
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 id={titleId} className="text-base font-semibold">
            {title}
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="-m-1 rounded-md p-1 text-muted hover:bg-surface hover:text-ink"
            aria-label="Kapat"
          >
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="flex gap-2 border-t border-line px-5 py-3">{footer}</div>}
      </div>
    </dialog>
  );
}

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel: string;
  cancelLabel?: string;
  tone?: "danger" | "default";
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel,
  cancelLabel = "Vazgeç",
  tone = "default",
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      title={title}
      className="max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} autoFocus>
            {cancelLabel}
          </Button>
          <Button variant={tone === "danger" ? "danger" : "primary"} onClick={onConfirm}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="text-sm leading-relaxed text-ink-soft">{message}</div>
    </Dialog>
  );
}
