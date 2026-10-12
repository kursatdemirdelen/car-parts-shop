import { describe, expect, it } from "vitest";
import { isMaintenanceState, KEYS, normalizeMaintenance } from "@/lib/storage";
import { createPersistentStore, setStorageWriteErrorHandler } from "@/state/persistent-store";

const isNumber = (v: unknown): v is number => typeof v === "number";

describe("persistent store write failures", () => {
  it("reports a failed write to the registered handler", () => {
    const failing = {
      getItem: () => null,
      setItem: () => {
        throw new DOMException("quota", "QuotaExceededError");
      },
      removeItem: () => {},
    } as unknown as Storage;
    const failedKeys: string[] = [];
    setStorageWriteErrorHandler((key) => failedKeys.push(key));
    const store = createPersistentStore("ks:test", 0, isNumber, { storage: () => failing });
    store.set(5);
    expect(store.get()).toBe(5);
    expect(failedKeys).toEqual(["ks:test"]);
  });
});

describe("maintenance store reads", () => {
  it("cleans stored maintenance data on read", () => {
    const raw = '{"v-x":{"odometer":null,"log":[{"id":"a","itemId":"coolant","date":"bad","km":null}]}}';
    const storage = { getItem: () => raw, setItem: () => {}, removeItem: () => {} } as unknown as Storage;
    const store = createPersistentStore(KEYS.maintenance, {}, isMaintenanceState, {
      normalize: normalizeMaintenance,
      storage: () => storage,
    });
    expect(store.get()).toEqual({ "v-x": { odometer: null, log: [] } });
  });
});
