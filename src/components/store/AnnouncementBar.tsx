"use client";

import { Megaphone, X } from "lucide-react";
import Link from "next/link";
import { useSyncExternalStore } from "react";
import { useCatalog } from "@/state/catalog-store";

const KEY = "ks:v1:announcement-dismissed";
const listeners = new Set<() => void>();

function readDismissed(): string | null {
  try {
    return window.sessionStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function dismiss(text: string) {
  try {
    window.sessionStorage.setItem(KEY, text);
  } catch {
    // storage blocked: the bar just hides for this page view
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/**
 * Admin-managed campaign bar above the header. Server HTML renders the stored (seed) text so nothing
 * shifts on load; dismissing hides it for the browser session until the text changes.
 */
export function AnnouncementBar() {
  const { announcement } = useCatalog();
  const dismissedText = useSyncExternalStore(subscribe, readDismissed, () => null);
  const text = announcement.text.trim();
  if (!announcement.enabled || !text || dismissedText === text) return null;

  return (
    <div className="bg-night text-white">
      <div className="container-page flex min-h-9 items-center gap-2 py-1.5 text-sm">
        <Megaphone className="size-4 shrink-0 text-accent-bright" aria-hidden="true" />
        <p className="min-w-0 flex-1 text-center">
          {announcement.href ? (
            <Link href={announcement.href} className="underline-offset-2 hover:underline">
              {text}
            </Link>
          ) : (
            text
          )}
        </p>
        <button
          type="button"
          aria-label="Duyuruyu kapat"
          onClick={() => dismiss(text)}
          className="-mr-1 flex size-7 shrink-0 items-center justify-center rounded-md text-accent-soft transition-colors hover:bg-white/10 hover:text-white"
        >
          <X className="size-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
