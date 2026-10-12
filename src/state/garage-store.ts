"use client";

import { useMemo } from "react";
import { isGarageState, KEYS, sanitizeGarage, type GarageState } from "@/lib/storage";
import type { ID } from "@/lib/types";
import { useCatalog } from "./catalog-store";
import { createPersistentStore, useStore } from "./persistent-store";

export const garageStore = createPersistentStore<GarageState>(KEYS.garage, { saved: [], selected: null }, isGarageState);

export const garageActions = {
  save(id: ID) {
    garageStore.set((g) => ({ ...g, saved: g.saved.includes(id) ? g.saved : [...g.saved, id] }));
  },
  select(id: ID | null) {
    garageStore.set((g) => ({ ...g, selected: id }));
  },
  /** Saves and selects in one step. */
  choose(id: ID) {
    garageStore.set((g) => ({ saved: g.saved.includes(id) ? g.saved : [...g.saved, id], selected: id }));
  },
  remove(id: ID) {
    garageStore.set((g) => ({ saved: g.saved.filter((x) => x !== id), selected: g.selected === id ? null : g.selected }));
  },
};

/** Garage state with vehicles that no longer exist in the catalog filtered out. */
export function useGarage() {
  const raw = useStore(garageStore);
  const { vehicles } = useCatalog();
  return useMemo(() => {
    const garage = sanitizeGarage(raw, vehicles);
    const byId = new Map(vehicles.map((v) => [v.id, v]));
    return {
      ...garage,
      savedVehicles: garage.saved.map((id) => byId.get(id)!),
      selectedVehicle: garage.selected ? byId.get(garage.selected)! : null,
      ...garageActions,
    };
  }, [raw, vehicles]);
}
