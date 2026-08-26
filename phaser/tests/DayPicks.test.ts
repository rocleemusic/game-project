/**
 * DayPicks — the calendar's per-day start-location memory, and its save slice.
 *
 * Two halves, tested the way their siblings are:
 *  - the STORE (`DayPicks`) mirrors `Decor.test.ts` — a localStorage stub, and a
 *    "survives a reload" assertion that a fresh instance reads what the last one
 *    wrote.
 *  - the SLICE (`DayPicksSlice`) mirrors the `DecorSlice` block in
 *    `SaveLoad.test.ts` — it moves the key's bytes opaquely, restores "no picks"
 *    by removing the key, and refuses a malformed payload without touching live
 *    data.
 */

import { beforeEach, describe, expect, it } from "vitest";
import { DayPicks, DAY_PICKS_STORAGE_KEY } from "../src/world/DayPicks";
import { DayPicksSlice } from "../src/world/save/slices/DayPicksSlice";
import { MemorySaveStorage } from "../src/world/save/SaveStore";

// DayPicks persists through localStorage; vitest runs in node, so stub it —
// same shim Decor.test.ts uses.
const store = new Map<string, string>();
(globalThis as unknown as { localStorage: Storage }).localStorage = {
  getItem: (k: string) => store.get(k) ?? null,
  setItem: (k: string, v: string) => void store.set(k, v),
  removeItem: (k: string) => void store.delete(k),
  clear: () => store.clear(),
  key: () => null,
  length: 0,
} as Storage;

beforeEach(() => store.clear());

describe("the store records a day's start and reads it back", () => {
  it("returns undefined for a day with no pick yet", () => {
    const d = new DayPicks();
    expect(d.pickFor(1)).toBeUndefined();
    expect(d.all()).toEqual({});
  });

  it("records a pick per day, keyed by day number", () => {
    const d = new DayPicks();
    d.record(1, "T1");
    d.record(2, "F1");
    expect(d.pickFor(1)).toBe("T1");
    expect(d.pickFor(2)).toBe("F1");
    expect(d.pickFor(3)).toBeUndefined();
  });

  it("lets the last pick on a day win — a day has one start", () => {
    const d = new DayPicks();
    d.record(1, "T1");
    d.record(1, "F1");
    expect(d.pickFor(1)).toBe("F1");
    expect(Object.keys(d.all())).toHaveLength(1);
  });

  it("survives a reload — a fresh instance reads the last one's writes", () => {
    const d = new DayPicks();
    d.record(3, "F1");
    expect(new DayPicks().pickFor(3)).toBe("F1");
  });

  it("drops malformed entries rather than handing a non-string to a lookup", () => {
    // A hand-edited or older blob: a non-string value and a non-numeric key are
    // both ignored, and unparseable JSON reads as empty.
    localStorage.setItem(DAY_PICKS_STORAGE_KEY, JSON.stringify({ 1: "T1", 2: 42, x: "F1" }));
    const d = new DayPicks();
    expect(d.pickFor(1)).toBe("T1");
    expect(d.pickFor(2)).toBeUndefined();
    expect(d.all()).toEqual({ 1: "T1" });

    localStorage.setItem(DAY_PICKS_STORAGE_KEY, "{ not json");
    expect(new DayPicks().all()).toEqual({});
  });
});

describe("DayPicksSlice moves the store's key through save/load", () => {
  it("shares the exact key the store writes, so the two cannot drift", () => {
    expect(new DayPicksSlice(new MemorySaveStorage()).capture()).toEqual({ raw: null });
    expect(DAY_PICKS_STORAGE_KEY).toBe("phaser-probe/day-picks/v1");
  });

  it("moves the key's contents as an opaque string, and parses nothing", () => {
    const storage = new MemorySaveStorage();
    const authored = JSON.stringify({ 1: "T1", 2: "F1" });
    storage.setItem(DAY_PICKS_STORAGE_KEY, authored);

    const captured = new DayPicksSlice(storage).capture();
    expect(captured).toEqual({ raw: authored });

    // The reload: key gone, the save puts it back byte for byte.
    storage.removeItem(DAY_PICKS_STORAGE_KEY);
    new DayPicksSlice(storage).restore(captured);
    expect(storage.getItem(DAY_PICKS_STORAGE_KEY)).toBe(authored);
  });

  it("restores 'no picks at all' by removing the key, not by writing an empty one", () => {
    const storage = new MemorySaveStorage();
    const empty = new DayPicksSlice(storage).capture();
    expect(empty).toEqual({ raw: null });
    storage.setItem(DAY_PICKS_STORAGE_KEY, "stale");
    new DayPicksSlice(storage).restore(empty);
    expect(storage.getItem(DAY_PICKS_STORAGE_KEY)).toBeNull();
  });

  it("leaves the key untouched when the payload is malformed", () => {
    const storage = new MemorySaveStorage();
    storage.setItem(DAY_PICKS_STORAGE_KEY, "live picks");
    const slice = new DayPicksSlice(storage);
    expect(slice.check({ raw: 5 })?.reason).toBe("malformed");
    expect(slice.check("not an object")?.reason).toBe("malformed");
    expect(slice.check({ raw: null })).toBeNull();
    expect(storage.getItem(DAY_PICKS_STORAGE_KEY)).toBe("live picks");
  });
});
