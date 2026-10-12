"use client";

import { useEffect, useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/format";

/**
 * Small click-to-open panel (menus). Closes on outside click, Esc and when the route is hidden by <Activity>.
 * `children` receives a `close` function for links inside the panel.
 */
export function Popover({
  trigger,
  label,
  children,
  align = "end",
  panelClassName,
}: {
  trigger: ReactNode;
  label: string;
  children: (close: () => void) => ReactNode;
  align?: "start" | "end";
  panelClassName?: string;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        button.current?.focus();
      }
    };
    document.addEventListener("pointerdown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  useLayoutEffect(() => () => setOpen(false), []);

  return (
    <div ref={root} className="relative">
      <button
        ref={button}
        type="button"
        aria-expanded={open}
        aria-label={label}
        onClick={() => setOpen((o) => !o)}
        className="inline-flex h-10 items-center gap-2 rounded-[var(--radius-control)] px-2.5 text-sm font-medium text-ink hover:bg-surface aria-expanded:bg-surface"
      >
        {trigger}
      </button>
      {open && (
        <div
          className={cn(
            "absolute top-[calc(100%+6px)] z-40 animate-[ks-fade-in_120ms_ease-out] rounded-[var(--radius-card)] border border-line bg-white p-1.5 shadow-[var(--shadow-pop)]",
            align === "end" ? "right-0" : "left-0",
            panelClassName,
          )}
        >
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  );
}
