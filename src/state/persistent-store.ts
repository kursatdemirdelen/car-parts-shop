"use client";

import { useSyncExternalStore } from "react";
import { browserStorage, readJSON, removeKey, writeJSON } from "@/lib/storage";

/**
 * A tiny localStorage-backed store read through `useSyncExternalStore`.
 * The server snapshot is always the fallback, so server HTML and the first client render match;
 * React then re-renders with the browser value after hydration (no hydration mismatch).
 */
export interface PersistentStore<T> {
  get(): T;
  getServer(): T;
  set(next: T | ((prev: T) => T)): void;
  reset(): void;
  subscribe(listener: () => void): () => void;
}

let onWriteError: (key: string) => void = () => {};

/** Registers a callback for failed localStorage writes (e.g. quota exceeded or storage blocked). */
export function setStorageWriteErrorHandler(fn: (key: string) => void): void {
  onWriteError = fn;
}

export function createPersistentStore<T>(
  key: string,
  fallback: T,
  isValid: (v: unknown) => v is T,
  normalize: (v: T) => T = (v) => v,
  storage: () => Storage | undefined = browserStorage,
): PersistentStore<T> {
  let value: T | undefined;
  const listeners = new Set<() => void>();
  const notify = () => listeners.forEach((l) => l());

  const get = () => {
    if (value === undefined) {
      try {
        value = normalize(readJSON(key, fallback, isValid, storage()));
      } catch {
        value = fallback; // unexpected stored data: never let it break rendering
      }
    }
    return value;
  };

  return {
    get,
    getServer: () => fallback,
    set(next) {
      value = typeof next === "function" ? (next as (prev: T) => T)(get()) : next;
      if (!writeJSON(key, value, storage())) onWriteError(key);
      notify();
    },
    reset() {
      value = fallback;
      removeKey(key, storage());
      notify();
    },
    subscribe(listener) {
      listeners.add(listener);
      // Keep other tabs of the same browser in sync.
      const onStorage = (e: StorageEvent) => {
        // key === null means another tab cleared all storage.
        if (e.key !== key && e.key !== null) return;
        value = undefined;
        listener();
      };
      window.addEventListener("storage", onStorage);
      return () => {
        listeners.delete(listener);
        window.removeEventListener("storage", onStorage);
      };
    },
  };
}

export function useStore<T>(store: PersistentStore<T>): T {
  return useSyncExternalStore(store.subscribe, store.get, store.getServer);
}

const noopSubscribe = () => () => {};

/** false during SSR and hydration, true afterwards. Browser-stored values are only trustworthy once this is true. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
}
