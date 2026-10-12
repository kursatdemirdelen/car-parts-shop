import { describe, expect, it } from "vitest";
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
