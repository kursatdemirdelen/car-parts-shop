"use client";

import { DEMO_ADMIN } from "@/lib/seed";
import { KEYS } from "@/lib/storage";
import { createPersistentStore, useHydrated, useStore } from "./persistent-store";

/**
 * DEMO ONLY. A browser flag that gates admin navigation for presentation purposes.
 * It is not authentication or authorization and provides no security whatsoever.
 */
const sessionStore = createPersistentStore<boolean>(
  KEYS.adminSession,
  false,
  (v): v is boolean => typeof v === "boolean",
);

export function useAdminSession() {
  const loggedIn = useStore(sessionStore);
  const hydrated = useHydrated();
  return {
    loggedIn,
    hydrated,
    login(email: string, password: string): boolean {
      const ok = email.trim().toLowerCase() === DEMO_ADMIN.email && password === DEMO_ADMIN.password;
      if (ok) sessionStore.set(true);
      return ok;
    },
    logout() {
      sessionStore.reset();
    },
  };
}
