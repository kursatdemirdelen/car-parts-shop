"use client";

import { useCallback } from "react";
import { isIdList, KEYS } from "@/lib/storage";
import type { ID } from "@/lib/types";
import { createPersistentStore, useStore } from "./persistent-store";

export const favoritesStore = createPersistentStore<ID[]>(KEYS.favorites, [], isIdList);

/** Toggles a favorite and returns whether it is now a favorite. */
export function toggleFavorite(id: ID): boolean {
  const isFavorite = favoritesStore.get().includes(id);
  favoritesStore.set((ids) => (isFavorite ? ids.filter((x) => x !== id) : [...ids, id]));
  return !isFavorite;
}

export function useFavorites() {
  const ids = useStore(favoritesStore);
  const has = useCallback((id: ID) => ids.includes(id), [ids]);
  return { ids, has, toggle: toggleFavorite };
}
