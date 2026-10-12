"use client";

import { useMemo } from "react";
import { newId } from "@/lib/ids";
import {
  type ItemStatus,
  type MaintenanceItemId,
  type MaintenanceState,
  todayIso,
  type VehicleMaintenance,
  vehicleSchedule,
} from "@/lib/maintenance";
import { isMaintenanceState, KEYS, normalizeMaintenance, trimLog } from "@/lib/storage";
import type { ID, Vehicle } from "@/lib/types";
import { useGarage } from "./garage-store";
import { createPersistentStore, useHydrated, useStore } from "./persistent-store";

export const maintenanceStore = createPersistentStore<MaintenanceState>(KEYS.maintenance, {}, isMaintenanceState, {
  normalize: normalizeMaintenance,
});

const EMPTY: VehicleMaintenance = { odometer: null, log: [] };

const update = (vehicleId: ID, fn: (r: VehicleMaintenance) => VehicleMaintenance) =>
  maintenanceStore.set((s) => ({ ...s, [vehicleId]: fn(s[vehicleId] ?? EMPTY) }));

export const maintenanceActions = {
  setOdometer(vehicleId: ID, km: number, today: string) {
    update(vehicleId, (r) => ({ ...r, odometer: { km, updatedAt: today } }));
  },
  logService(vehicleId: ID, itemId: MaintenanceItemId, date: string, km: number | null) {
    update(vehicleId, (r) => ({ ...r, log: trimLog([...r.log, { id: newId("svc"), itemId, date, km }]) }));
  },
  removeEntry(vehicleId: ID, entryId: string) {
    update(vehicleId, (r) => ({ ...r, log: r.log.filter((e) => e.id !== entryId) }));
  },
};

export function useMaintenance() {
  const state = useStore(maintenanceStore);
  const hydrated = useHydrated();
  return { state, hydrated, ...maintenanceActions };
}

export interface VehicleScheduleView {
  vehicle: Vehicle;
  record: VehicleMaintenance | undefined;
  items: ItemStatus[];
  overdue: number;
  soon: number;
}

/** Schedules for the saved garage vehicles, in garage order. Empty until hydrated (dates are client-side). */
export function useGarageSchedules(): { hydrated: boolean; today: string; schedules: VehicleScheduleView[] } {
  const { state, hydrated } = useMaintenance();
  const { savedVehicles } = useGarage();
  return useMemo(() => {
    if (!hydrated) return { hydrated, today: "", schedules: [] };
    const today = todayIso();
    const schedules = savedVehicles.map((vehicle) => {
      const record = state[vehicle.id];
      const items = vehicleSchedule(vehicle, record, today);
      return {
        vehicle,
        record,
        items,
        overdue: items.filter((i) => i.status === "overdue").length,
        soon: items.filter((i) => i.status === "soon").length,
      };
    });
    return { hydrated, today, schedules };
  }, [hydrated, state, savedVehicles]);
}

export function useHasOverdueMaintenance(): boolean {
  return useGarageSchedules().schedules.some((s) => s.overdue > 0);
}
