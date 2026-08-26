/**
 * Wave 2 Track C — save/load.
 *
 * The Definition of Done item is "save survives a browser reload", so the shape
 * of almost every test here is the same: build a world, save it, throw the world
 * away, build a NEW one from nothing, load, and assert. A reload is exactly
 * that — new objects, same storage — so a round trip that only reuses the same
 * live instances proves nothing.
 *
 * Three things are asserted that are not obvious from the code:
 *
 *  1. INK OWNS THE CLOCK. Proven twice — by grepping this folder for `setVar`,
 *     and by driving the real compiled story through a full save/load cycle and
 *     asserting `LanternPlayer.isForced()` is still false. `setVar` is the only
 *     thing that sets that flag, so a false reading is proof no clock was
 *     written, at any depth, by any code the cycle touched.
 *
 *  2. TWO VOCABULARIES, BOTH DIRECTIONS. Pool names come back as pool names,
 *     item ids come back as item ids, and running the render-time re-join over
 *     the restored satchel adds nothing that was not already there. That last
 *     one is the double-count check.
 *
 *  3. DECOR HAS ONE WRITER. The slice moves `Decor`'s own storage key as an
 *     opaque string, and a test reads `Decor.ts` off disk to confirm the key
 *     it uses is still the one this folder names.
 */

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { LanternPlayer } from "../../tools/lantern/src/lib/play";
import { buildGraphIndex } from "../../tools/lantern/src/lib/playMap";
import type { Day, Graph } from "../../tools/lantern/src/types";

import { GameEventBus } from "../src/world/events/GameEvents";
import { Gates } from "../src/world/Gates";
import { Knowledge } from "../src/world/Knowledge";
import { Inventory } from "../src/world/Inventory";
import { poolsToItemIds, reJoinInto } from "../src/world/SatchelLedger";
import type { ItemRecord } from "../src/magic/types";

import { LanternInkStatePort } from "../src/world/save/LanternInkStatePort";
import { SaveCoordinator } from "../src/world/save/SaveCoordinator";
import {
  MemorySaveStorage,
  SaveStore,
  saveKeyFor,
  webSaveStorage,
  type SaveStorage,
} from "../src/world/save/SaveStore";
import { MemoryInventoryState, MemoryPosition } from "../src/world/save/ports";
import { DecorSlice, DECOR_STORAGE_KEY } from "../src/world/save/slices/DecorSlice";
import { GatesSlice } from "../src/world/save/slices/GatesSlice";
import { KnowledgeSlice } from "../src/world/save/slices/KnowledgeSlice";
import { SAVE_VERSION, type InventorySave, type SaveGame } from "../src/world/save/SaveGame";
import type { InkClock, InkSaveState, InkStatePort } from "../src/world/save/InkStatePort";

const here = path.dirname(fileURLToPath(import.meta.url));
const readText = (p: string) => fs.readFileSync(path.join(here, "..", p), "utf8");
const readJson = (p: string) => JSON.parse(readText(p));

// ---------------------------------------------------------------------------
// Doubles
// ---------------------------------------------------------------------------

/**
 * An ink port with no ink behind it.
 *
 * It holds the opaque blob and hands it back, which is all `SaveCoordinator`
 * asks of it. The real thing is exercised separately, against the compiled
 * story, at the bottom of this file.
 */
class FakeInk implements InkStatePort {
  state: InkSaveState;
  private readonly clockValue: InkClock;
  /** Every clock write attempted. Must stay empty — there is no writer to call. */
  readonly clockWrites: string[] = [];

  constructor(state: Partial<InkSaveState> = {}, clock: Partial<InkClock> = {}) {
    this.state = {
      storyStateJson: '{"story":"opaque"}',
      worldJson: '{"world":"opaque"}',
      dayFile: 1,
      satchelPoolNames: [],
      armsPoolNames: [],
      bankedPoolNames: [],
      pickedSlots: [],
      visitedNodeIds: [],
      ...state,
    };
    this.clockValue = { day: 1, year: 1, timeBlock: "morning", movesLeft: 3, ...clock };
  }

  clock(): InkClock {
    return this.clockValue;
  }

  capture(): InkSaveState {
    return this.state;
  }

  restore(state: InkSaveState): void {
    this.state = state;
  }
}

function buildCoordinator(opts: {
  storage: SaveStorage;
  ink?: InkStatePort;
  inventory?: MemoryInventoryState;
  position?: MemoryPosition;
  slices?: ConstructorParameters<typeof SaveCoordinator>[0]["slices"];
  bus?: GameEventBus;
  modeId?: string;
  slot?: string;
  playerName?: string;
}) {
  const store = new SaveStore(opts.storage);
  return new SaveCoordinator({
    slot: opts.slot ?? "mode4",
    // A real name by default (T13 Phase 3): a helper that defaulted to `""`
    // would let a coordinator that dropped the field on the floor pass every
    // test in this file.
    playerName: opts.playerName ?? "Wren",
    modeId: opts.modeId ?? "mode4",
    store,
    ink: opts.ink ?? new FakeInk(),
    inventory: opts.inventory ?? new MemoryInventoryState(),
    position: opts.position ?? new MemoryPosition(),
    slices: opts.slices,
    bus: opts.bus,
    // Fixed clock so a replayed session writes a byte-identical save.
    now: () => "2026-08-17T12:00:00.000Z",
  });
}

const inventoryOf = (over: Partial<InventorySave>): InventorySave => ({
  heldItemIds: [],
  everHeldItemIds: [],
  worldItemsByScreen: {},
  consumedCounts: {},
  ...over,
});

// ---------------------------------------------------------------------------
// 1. Ink owns the clock
// ---------------------------------------------------------------------------

describe("ink owns the clock", () => {
  it("no file under src/world/save/** so much as mentions setVar", () => {
    // `setVar` is public on LanternPlayer, would appear to work, and is the
    // trap: it puts a second writer on a fact ink already owns. Grepped rather
    // than trusted, because the failure is silent and only shows up as a header
    // that disagrees with the story a few moves later.
    const dir = path.join(here, "..", "src", "world", "save");
    const files: string[] = [];
    const walk = (d: string) => {
      for (const entry of fs.readdirSync(d, { withFileTypes: true })) {
        const full = path.join(d, entry.name);
        if (entry.isDirectory()) walk(full);
        else if (/\.tsx?$/.test(entry.name)) files.push(full);
      }
    };
    walk(dir);
    expect(files.length).toBeGreaterThan(5);

    const offenders = files.filter((f) => {
      const source = fs.readFileSync(f, "utf8");
      // Strip block comments: the rule is explained at length in these files,
      // and explaining it is part of keeping it.
      return /\bsetVar\s*\(/.test(source.replace(/\/\*[\s\S]*?\*\//g, ""));
    });
    expect(offenders.map((f) => path.basename(f))).toEqual([]);
  });

  it("InkSaveState carries no time block and no move count", () => {
    // A restorer cannot assign a clock it was never given. This asserts the
    // schema itself, not a code path, because the schema is what makes the code
    // path impossible to write by accident.
    const port = new LanternInkStatePort({
      saveSnapshot: () => ({
        label: "l",
        stateJson: "{}",
        visited: [],
        lineCount: 0,
        satchel: [],
        pickedSlots: [],
        arms: [],
        banked: [],
        timeBlock: "evening",
        day: 3,
        world: "{}",
      }),
      loadSnapshot: () => undefined,
      view: () => ({ day: 3, year: 1, timeBlock: "evening", movesLeft: 2 }),
    });
    const keys = Object.keys(port.capture()).sort();
    expect(keys).toEqual([
      "armsPoolNames",
      "bankedPoolNames",
      "dayFile",
      "pickedSlots",
      "satchelPoolNames",
      "storyStateJson",
      "visitedNodeIds",
      "worldJson",
    ]);
    // `year` is banned here for the same reason as the rest (T13, 2026-08-24):
    // it rides inside `storyStateJson` and nowhere else, so a restorer has no
    // year to assign even if it wanted one. `dayFile` is the only clock-shaped
    // thing in the list above, and it is a FILE SELECTOR, not a clock write.
    for (const banned of ["timeBlock", "movesLeft", "day", "year", "TimeOfDay"]) {
      expect(keys).not.toContain(banned);
    }
  });

  it("the port ignores the block on the way in — the load re-reads it from ink", () => {
    let seen: string | null = null;
    const port = new LanternInkStatePort({
      saveSnapshot: () => {
        throw new Error("not used here");
      },
      loadSnapshot: (snap) => {
        seen = snap.timeBlock;
      },
      view: () => ({ day: 1, year: 1, timeBlock: "morning", movesLeft: 3 }),
    });
    port.restore(new FakeInk().capture());
    // Empty, not "morning": passing a plausible block would be a clock value
    // travelling inside a save file, which is the thing being prevented.
    expect(seen).toBe("");
  });

  it("clockDisplay is written for the slot list and never read by restore", () => {
    const storage = new MemorySaveStorage();
    // Year 2 on purpose: T13's year is a display field on exactly the same
    // terms as `day`, so it has to be captured, listed, and — below —
    // provably ignored by the restore path.
    const ink = new FakeInk({}, { day: 4, year: 2, timeBlock: "evening", movesLeft: 1 });
    const c = buildCoordinator({ storage, ink });
    const save = c.save();
    expect(save.clockDisplay).toEqual({ day: 4, year: 2, timeBlock: "evening" });
    expect(new SaveStore(storage).list()[0]).toMatchObject({
      day: 4,
      year: 2,
      timeBlock: "evening",
    });

    // A save whose display clock has been tampered with restores identically:
    // nothing reads it.
    const tampered: SaveGame = {
      ...save,
      clockDisplay: { day: 99, year: 99, timeBlock: "nonsense" },
    };
    const fresh = new FakeInk();
    buildCoordinator({ storage: new MemorySaveStorage(), ink: fresh }).restore(tampered);
    expect(fresh.capture()).toEqual(save.ink);
  });
});

// ---------------------------------------------------------------------------
// 2. Two vocabularies
// ---------------------------------------------------------------------------

describe("two vocabularies stay apart and re-join on load", () => {
  const POOLS = ["item_river_stone", "item_river_stone", "item_river_stone", "item_sticks"];

  it("pool names go back to ink and item ids go back to the inventory", () => {
    const storage = new MemorySaveStorage();
    const ink = new FakeInk({ satchelPoolNames: POOLS });
    const inventory = new MemoryInventoryState();
    inventory.set(
      inventoryOf({
        heldItemIds: ["item_river_stone", "item_sticks"],
        everHeldItemIds: ["item_river_stone", "item_sticks", "item_flame"],
        consumedCounts: { item_sticks: 1 },
      }),
    );
    buildCoordinator({ storage, ink, inventory }).save();

    // The reload: new everything, same storage.
    const inkAfter = new FakeInk();
    const inventoryAfter = new MemoryInventoryState();
    const report = buildCoordinator({
      storage,
      ink: inkAfter,
      inventory: inventoryAfter,
    }).load();

    expect(report.loaded).toBe(true);
    // Pool-name vocabulary, in order, with the duplicate count intact.
    expect(inkAfter.capture().satchelPoolNames).toEqual(POOLS);
    // Item-id vocabulary, untouched by the join.
    expect(inventoryAfter.captureInventory().heldItemIds).toEqual([
      "item_river_stone",
      "item_sticks",
    ]);
    expect(inventoryAfter.captureInventory().consumedCounts).toEqual({ item_sticks: 1 });
    // everHeld never shrinks, and is genuinely different from held.
    expect(inventoryAfter.captureInventory().everHeldItemIds).toContain("item_flame");
  });

  it("the save file keeps them in separate FIELDS, even though the strings now overlap (T19)", () => {
    // Pre-reconciliation, the two fields were textually distinguishable —
    // `satchelPoolNames` never started with "item_", `heldItemIds` always did.
    // Post-reconciliation both hold `item_id`s, so that textual test is gone.
    // What must still hold, and is the actual reason the fields stay separate
    // (`SaveCoordinator.ts`'s header): each field round-trips to the SAME
    // system that owns it, untouched by the other, regardless of whether the
    // strings happen to look alike this pass.
    const storage = new MemorySaveStorage();
    const inventory = new MemoryInventoryState();
    inventory.set(inventoryOf({ heldItemIds: ["item_flame"] }));
    const save = buildCoordinator({
      storage,
      ink: new FakeInk({ satchelPoolNames: POOLS }),
      inventory,
    }).save();

    expect(save.ink.satchelPoolNames).toEqual(POOLS);
    expect(save.inventory.heldItemIds).toEqual(["item_flame"]);
    // The satchel field is not merged into, or overwritten by, the inventory
    // field or vice versa — proven by each holding exactly what it was given,
    // including the id ("item_flame") that ONLY the inventory side carries.
    expect(save.ink.satchelPoolNames).not.toContain("item_flame");
    expect(save.inventory.heldItemIds).not.toContain("item_river_stone");
  });

  it("re-joining the restored satchel double-counts nothing and drops nothing", () => {
    // `SatchelLedger.reJoinInto` runs on every render. After a restore it must
    // behave exactly as it would have had the page never reloaded: the pool
    // names join to item ids the inventory already holds, and `give` is a Set
    // add, so nothing is minted a second time.
    const items = readJson("public/content/items.json") as ItemRecord[];
    const inv = new Inventory(items, { includeAlwaysAvailable: false });

    const restoredHeld = poolsToItemIds(POOLS);
    for (const id of restoredHeld) inv.give(id);
    const afterRestore = inv.discoveredIds().sort();

    reJoinInto(inv, POOLS);
    expect(inv.discoveredIds().sort()).toEqual(afterRestore);

    // And the join really did produce something — a test that passed because
    // both sides were empty would prove nothing.
    expect(restoredHeld.length).toBeGreaterThan(0);
    expect(afterRestore).toContain("item_river_stone");
  });

  it("an id nobody has spent against is still carried by the save (identity join, T19)", () => {
    // The two-vocabularies hazard is closed (Roc, 2026-08-23, Task 1): `itemForPool`
    // is now an identity function, so a "pool name" cannot fail to join any more
    // — the join is `f(x) = x`. What this test used to prove (an unjoined pool
    // name is still the player's stuff and must not be dropped on save) still
    // matters for a different reason: the save layer must not depend on the
    // pool-name field's content being a RECOGNISED item id, because a save
    // written before this reconciliation (`SAVE_VERSION = 1`) is refused
    // wholesale rather than coerced — see `SaveGame.ts`'s header — and the
    // still-live case is simply "carry whatever string ink hands over."
    const anyId = "item_nobody_has_spent_against";
    expect(poolsToItemIds([anyId])).toEqual([anyId]);

    const storage = new MemorySaveStorage();
    const ink = new FakeInk({ satchelPoolNames: [anyId, "item_river_stone"] });
    buildCoordinator({ storage, ink }).save();
    const after = new FakeInk();
    buildCoordinator({ storage, ink: after }).load();
    expect(after.capture().satchelPoolNames).toEqual([anyId, "item_river_stone"]);
  });
});

// ---------------------------------------------------------------------------
// 3. The store
// ---------------------------------------------------------------------------

describe("SaveStore", () => {
  it("round-trips a save through a fresh store over the same storage", () => {
    const storage = new MemorySaveStorage();
    const save = buildCoordinator({ storage }).capture();
    new SaveStore(storage).write(save);

    const reloaded = new SaveStore(storage).read("mode4");
    expect(reloaded.ok).toBe(true);
    if (reloaded.ok) expect(reloaded.save).toEqual(save);
  });

  it("reports a missing slot rather than inventing an empty save", () => {
    const result = new SaveStore(new MemorySaveStorage()).read("mode4");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.defect.reason).toBe("missing");
  });

  it("reports a version mismatch rather than coercing it", () => {
    const storage = new MemorySaveStorage();
    const save = buildCoordinator({ storage }).capture();
    storage.setItem(saveKeyFor("mode4"), JSON.stringify({ ...save, version: SAVE_VERSION + 1 }));
    const result = new SaveStore(storage).read("mode4");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.defect.reason).toBe("version-mismatch");
      expect(result.defect.detail).toContain(String(SAVE_VERSION));
    }
  });

  it("refuses a real pre-reconciliation (version 1) mode5 save, not just a bare version mismatch (T19, 2026-08-24)", () => {
    // The concrete case the verification step asks for: an actual save shaped
    // like one a player captured BEFORE Task 1's reconciliation landed —
    // `version: 1`, `satchelPoolNames` holding old pool-name strings that join
    // to nothing post-reconciliation (`"river stones"`, not `"item_river_stone"`).
    const storage = new MemorySaveStorage();
    // Cast WHOLESALE rather than field by field, because the point of the
    // fixture is the fields it does NOT have: no `playerName`, no
    // `clockDisplay.year` (both arrived with `SAVE_VERSION = 3`, T13 Phase 3),
    // and a `version` today's type will not accept.
    const oldShapedSave = {
      version: 1, // real version-1 saves are exactly this shape
      savedAt: "2026-08-18T12:00:00.000Z",
      slot: "mode5",
      modeId: "mode5",
      ink: {
        storyStateJson: "{}",
        worldJson: "{}",
        dayFile: 1,
        satchelPoolNames: ["river stones", "river stones", "sticks"],
        armsPoolNames: [],
        bankedPoolNames: [],
        pickedSlots: [],
        visitedNodeIds: [],
      },
      inventory: {
        heldItemIds: ["item_river_stone", "item_river_stone", "item_sticks"],
        everHeldItemIds: ["item_river_stone", "item_sticks"],
        worldItemsByScreen: {},
        consumedCounts: {},
      },
      position: { screenId: "F1" },
      clockDisplay: { day: 1, timeBlock: "morning" },
      slices: {},
    } as unknown as SaveGame;
    storage.setItem(saveKeyFor("mode5"), JSON.stringify(oldShapedSave));

    const result = new SaveStore(storage).read("mode5");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.defect.reason).toBe("version-mismatch");

    // The higher-level restore path refuses it too, and — the whole point —
    // never partially restores the dead pool-name strings into anything live.
    const inventory = new MemoryInventoryState();
    const ink = new FakeInk();
    const report = buildCoordinator({ storage, ink, inventory, slot: "mode5" }).load();
    expect(report.loaded).toBe(false);
    expect(report.defect?.reason).toBe("version-mismatch");
    expect(ink.capture().satchelPoolNames).toEqual([]);
    expect(inventory.captureInventory().heldItemIds).toEqual([]);
  });

  it("refuses a real single-slot (version 2) mode5 save and leaves its bytes where they are (T13 Phase 3, 2026-08-24)", () => {
    // The mirror of the version-1 test above, for the 2 -> 3 bump: a save
    // shaped exactly like one a player captured while `SAVE_VERSION = 2` — a
    // single `"mode5"` slot key, no `playerName`, no `clockDisplay.year`.
    // Same posture as the previous bump: refusal, never migration.
    const storage = new MemorySaveStorage();
    const singleSlotSave = {
      version: 2, // real version-2 saves are exactly this shape
      savedAt: "2026-08-23T12:00:00.000Z",
      slot: "mode5", // the ONE key that existed before `save.slots`
      modeId: "mode5",
      ink: {
        storyStateJson: "{}",
        worldJson: "{}",
        dayFile: 3,
        // Post-reconciliation vocabulary — version 2 got this part right. The
        // refusal is not about the satchel this time; it is about the slot set
        // and the two fields that arrived with version 3.
        satchelPoolNames: ["item_river_stone", "item_sticks"],
        armsPoolNames: [],
        bankedPoolNames: [],
        pickedSlots: [],
        visitedNodeIds: [],
      },
      inventory: {
        heldItemIds: ["item_river_stone", "item_sticks"],
        everHeldItemIds: ["item_river_stone", "item_sticks"],
        worldItemsByScreen: {},
        consumedCounts: {},
      },
      position: { screenId: "F5" },
      // No `year`. No `playerName` above. Left missing, not back-filled.
      clockDisplay: { day: 3, timeBlock: "evening" },
      slices: { knowledge: { learned: ["ignite"], seen: [] } },
    } as unknown as SaveGame;
    const bytes = JSON.stringify(singleSlotSave);
    storage.setItem(saveKeyFor("mode5"), bytes);

    // 1. Refused with the RIGHT reason. `looksLikeSave` runs first and would
    //    report `unreadable` if the missing `playerName` had been added to its
    //    field list — the reason is what a slot picker shows the player.
    const result = new SaveStore(storage).read("mode5");
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.defect.reason).toBe("version-mismatch");
      expect(result.defect.detail).toContain("version 2");
    }

    // 2. Nothing is partially restored, and nothing is silently upgraded.
    const inventory = new MemoryInventoryState();
    const ink = new FakeInk();
    const report = buildCoordinator({ storage, ink, inventory, slot: "mode5", modeId: "mode5" }).load();
    expect(report.loaded).toBe(false);
    expect(report.defect?.reason).toBe("version-mismatch");
    expect(ink.capture().satchelPoolNames).toEqual([]);
    expect(inventory.captureInventory().heldItemIds).toEqual([]);

    // 3. THE OLD BYTES ARE STILL THERE, unchanged. `SaveStore`'s own header
    //    promises a schema change leaves old saves sitting where they are;
    //    refusing a save and then quietly deleting it is the same data loss
    //    with a better excuse.
    expect(storage.getItem(saveKeyFor("mode5"))).toBe(bytes);

    // 4. And the new slots do not land on the old key, so writing a new life
    //    cannot overwrite it either. `SAVE_KEY_PREFIX` itself is unchanged.
    expect(saveKeyFor("mode5-1")).not.toBe(saveKeyFor("mode5"));
    expect(saveKeyFor("mode5-1").startsWith("phaser-probe/save/v1/")).toBe(true);
  });

  it("reports unreadable bytes rather than throwing", () => {
    const storage = new MemorySaveStorage();
    storage.setItem(saveKeyFor("mode4"), "{ not json");
    const result = new SaveStore(storage).read("mode4");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.defect.reason).toBe("unreadable");
  });

  it("lists only its own keys, newest first, and skips a bad one", () => {
    const storage = new MemorySaveStorage();
    storage.setItem("phaser-probe/decor/v1", "not a save");
    const a = buildCoordinator({ storage, slot: "a" }).capture();
    const b = buildCoordinator({ storage, slot: "b" }).capture();
    const store = new SaveStore(storage);
    store.write({ ...a, savedAt: "2026-08-16T09:00:00.000Z" });
    store.write({ ...b, savedAt: "2026-08-17T09:00:00.000Z" });
    storage.setItem(saveKeyFor("broken"), "{ not json");

    expect(store.list().map((s) => s.slot)).toEqual(["b", "a"]);
  });

  it("wraps a browser storage without reaching for a global", () => {
    // `src/world/**` may not touch the DOM, so localStorage arrives as an
    // argument. A Map behind the same shape proves the wrapper, and proves the
    // game and the tests run the same code path.
    const map = new Map<string, string>();
    const storage = webSaveStorage({
      getItem: (k) => map.get(k) ?? null,
      setItem: (k, v) => void map.set(k, v),
      removeItem: (k) => void map.delete(k),
      key: (i) => [...map.keys()][i] ?? null,
      get length() {
        return map.size;
      },
    });
    const save = buildCoordinator({ storage }).save();
    expect(map.has(saveKeyFor("mode4"))).toBe(true);
    expect(new SaveStore(storage).read("mode4")).toEqual({ ok: true, save });
  });

  it("swallows a storage that refuses to write, and says so by not having it", () => {
    const storage = webSaveStorage({
      getItem: () => null,
      setItem: () => {
        throw new Error("QuotaExceededError");
      },
      removeItem: () => undefined,
      key: () => null,
      length: 0,
    });
    expect(() => buildCoordinator({ storage }).save()).not.toThrow();
    expect(new SaveStore(storage).has("mode4")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// 4. The coordinator and its slices
// ---------------------------------------------------------------------------

describe("SaveCoordinator", () => {
  it("survives the reload: new systems, new coordinator, same storage", () => {
    const storage = new MemorySaveStorage();

    const knowledge = new Knowledge();
    knowledge.learn("ignite");
    knowledge.see("glimmer");
    const graph = readJson("public/story/graph.json") as Graph;
    const gates = new Gates(graph);
    gates.clear("G-F5-cascade");
    const position = new MemoryPosition("F5");
    const inventory = new MemoryInventoryState();
    inventory.set(inventoryOf({ heldItemIds: ["item_sticks"] }));

    buildCoordinator({
      storage,
      ink: new FakeInk({ satchelPoolNames: ["item_sticks"] }),
      inventory,
      position,
      slices: [new KnowledgeSlice(knowledge), new GatesSlice(gates), new DecorSlice(storage)],
    }).save();

    // --- reload ---
    const knowledgeAfter = new Knowledge();
    const gatesAfter = new Gates(graph);
    const positionAfter = new MemoryPosition();
    const inventoryAfter = new MemoryInventoryState();
    const report = buildCoordinator({
      storage,
      ink: new FakeInk(),
      inventory: inventoryAfter,
      position: positionAfter,
      slices: [
        new KnowledgeSlice(knowledgeAfter),
        new GatesSlice(gatesAfter),
        new DecorSlice(storage),
      ],
    }).load();

    expect(report).toEqual({ loaded: true, defect: null, sliceDefects: [] });
    expect(knowledgeAfter.spellbook()).toEqual(["ignite"]);
    expect(knowledgeAfter.clues()).toEqual(["glimmer"]);
    expect(knowledgeAfter.knows("glimmer")).toBe(false);
    expect(gatesAfter.isCleared("G-F5-cascade")).toBe(true);
    expect(gatesAfter.clearedGates()).toEqual(["G-F5-cascade"]);
    expect(positionAfter.currentScreenId()).toBe("F5");
    expect(inventoryAfter.captureInventory().heldItemIds).toEqual(["item_sticks"]);
  });

  it("stamps the player name onto the save and into the slot list (T13 Phase 3)", () => {
    const storage = new MemorySaveStorage();
    const save = buildCoordinator({ storage, slot: "mode5-2", playerName: "Marn" }).save();
    expect(save.playerName).toBe("Marn");
    expect(new SaveStore(storage).list()[0]).toMatchObject({ slot: "mode5-2", playerName: "Marn" });
  });

  it("carries an unnamed life as an empty string rather than inventing a name", () => {
    // `""` means "written before name entry existed" (Phase 4 builds the
    // field). A placeholder here would be a fabricated fact on disk.
    const storage = new MemorySaveStorage();
    expect(buildCoordinator({ storage, playerName: "" }).save().playerName).toBe("");
    expect(new SaveStore(storage).list()[0].playerName).toBe("");
  });

  it("keeps three slots as three independent lives over one storage", () => {
    // What `save.slots` buys, tested at the layer that has to honour it: a
    // coordinator owns ONE slot, so three of them over the same storage write
    // three keys and read back three different worlds. Nothing about the
    // coordinator changed shape for this — that is the point.
    const storage = new MemorySaveStorage();
    for (const [slot, name, screen] of [
      ["mode5-1", "Wren", "F1"],
      ["mode5-2", "Marn", "F5"],
      ["mode5-3", "Ilsa", "T4"],
    ] as const) {
      buildCoordinator({ storage, slot, playerName: name, position: new MemoryPosition(screen) }).save();
    }

    const store = new SaveStore(storage);
    expect(store.list().map((s) => [s.slot, s.playerName])).toEqual(
      expect.arrayContaining([
        ["mode5-1", "Wren"],
        ["mode5-2", "Marn"],
        ["mode5-3", "Ilsa"],
      ]),
    );

    // Loading slot 2 restores slot 2's world and not slot 1's or slot 3's.
    const position = new MemoryPosition();
    const report = buildCoordinator({ storage, slot: "mode5-2", position }).load();
    expect(report.loaded).toBe(true);
    expect(position.currentScreenId()).toBe("F5");
  });

  it("refuses a save written by another mode rather than loading it", () => {
    const storage = new MemorySaveStorage();
    buildCoordinator({ storage, modeId: "daylife" }).save();
    const report = buildCoordinator({ storage, modeId: "mode4" }).load();
    expect(report.loaded).toBe(false);
    expect(report.defect?.reason).toBe("mode-mismatch");
    expect(report.defect?.detail).toContain("daylife");
  });

  it("skips a slice that refuses its payload and restores the rest", () => {
    const storage = new MemorySaveStorage();
    const knowledge = new Knowledge();
    knowledge.learn("ignite");
    const save = buildCoordinator({
      storage,
      slices: [new KnowledgeSlice(knowledge), new DecorSlice(storage)],
    }).capture();

    const damaged: SaveGame = {
      ...save,
      slices: { ...save.slices, decor: { raw: 42 } },
    };

    const knowledgeAfter = new Knowledge();
    const decorStorage = new MemorySaveStorage();
    const report = buildCoordinator({
      storage,
      slices: [new KnowledgeSlice(knowledgeAfter), new DecorSlice(decorStorage)],
    }).restore(damaged);

    expect(report.loaded).toBe(true);
    expect(report.sliceDefects.map((d) => d.sliceId)).toEqual(["decor"]);
    // A bad decor blob must not cost the player their spellbook.
    expect(knowledgeAfter.spellbook()).toEqual(["ignite"]);
  });

  it("reports a slice with no payload in the save instead of guessing one", () => {
    const storage = new MemorySaveStorage();
    const save = buildCoordinator({ storage }).capture();
    const report = buildCoordinator({
      storage,
      slices: [new KnowledgeSlice(new Knowledge())],
    }).restore(save);
    expect(report.sliceDefects).toEqual([
      { sliceId: "knowledge", reason: "missing", detail: 'no payload for "knowledge" in this save' },
    ]);
  });

  it("announces a write and a load on the bus", () => {
    const bus = new GameEventBus({ now: () => 0 });
    const storage = new MemorySaveStorage();
    const c = buildCoordinator({ storage, bus, slices: [new KnowledgeSlice(new Knowledge())] });
    c.save();
    c.load();
    expect(bus.log().map((e) => e.type)).toEqual(["save:written", "save:loaded"]);
    expect(bus.logOf("save:written")[0].sliceIds).toEqual(["knowledge"]);
  });
});

describe("autosave", () => {
  it("fires on the events the mode names and on no others", () => {
    const bus = new GameEventBus({ now: () => 0 });
    const storage = new MemorySaveStorage();
    const c = buildCoordinator({ storage });
    // Mode 4's list: a screen change, a gate clearing, a pickup. Deliberately
    // NOT `cast:resolved` — a cast sweep would write 89 saves.
    const off = c.bindAutosave(bus, ["screen:changed", "gate:cleared", "item:acquired"]);

    bus.emit({
      type: "cast:resolved",
      spellId: "ignite",
      receiverId: "river_stone",
      screenId: "F2",
      outcome: "effect",
      consumed: [],
      produced: [],
      narration: "",
    });
    expect(storage.getItem(saveKeyFor("mode4"))).toBeNull();

    bus.emit({ type: "screen:changed", from: null, to: "F2", day: 1, timeBlock: "morning", movesLeft: 3 });
    expect(storage.getItem(saveKeyFor("mode4"))).not.toBeNull();

    off();
    storage.removeItem(saveKeyFor("mode4"));
    bus.emit({ type: "screen:changed", from: "F2", to: "F4", day: 1, timeBlock: "morning", movesLeft: 2 });
    expect(storage.getItem(saveKeyFor("mode4"))).toBeNull();
  });

  it("does not autosave over the save it is in the middle of loading", () => {
    // A restore replays the very events autosave listens for. Without the
    // guard, loading would immediately overwrite the file being loaded with a
    // half-restored world.
    const bus = new GameEventBus({ now: () => 0 });
    const storage = new MemorySaveStorage();
    const noisyInk: InkStatePort = {
      clock: () => ({ day: 1, year: 1, timeBlock: "morning", movesLeft: 3 }),
      capture: () => new FakeInk().capture(),
      restore: () => {
        bus.emit({
          type: "screen:changed",
          from: null,
          to: "F2",
          day: 1,
          timeBlock: "morning",
          movesLeft: 3,
        });
      },
    };
    const c = buildCoordinator({ storage, bus, ink: noisyInk });
    c.save();
    c.bindAutosave(bus, ["screen:changed"]);
    c.load();
    // One write from `save()`, none from inside the restore.
    expect(bus.logOf("save:written")).toHaveLength(1);
  });
});

// ---------------------------------------------------------------------------
// 5. Decor — one key, one writer
// ---------------------------------------------------------------------------

describe("DecorSlice takes ownership of Decor's key", () => {
  it("names the key Decor.ts actually uses", () => {
    // Decor keeps the key private, so this is checked against the source. A
    // drift is then a failing test rather than a save that persists nothing.
    expect(readText("src/world/Decor.ts")).toContain(`"${DECOR_STORAGE_KEY}"`);
  });

  it("moves the key's contents as an opaque string, and parses nothing", () => {
    const storage = new MemorySaveStorage();
    const authored = JSON.stringify({ placements: [{ uid: "p1", itemId: "item_feather" }], seq: 1 });
    storage.setItem(DECOR_STORAGE_KEY, authored);

    const slice = new DecorSlice(storage);
    const captured = slice.capture();
    expect(captured).toEqual({ raw: authored });

    // The reload: the key is gone, the save puts it back byte for byte, and the
    // next `new Decor()` reads it in its constructor exactly as on any launch.
    storage.removeItem(DECOR_STORAGE_KEY);
    new DecorSlice(storage).restore(captured);
    expect(storage.getItem(DECOR_STORAGE_KEY)).toBe(authored);
  });

  it("restores 'no decor at all' by removing the key, not by writing an empty one", () => {
    const storage = new MemorySaveStorage();
    const empty = new DecorSlice(storage).capture();
    expect(empty).toEqual({ raw: null });
    storage.setItem(DECOR_STORAGE_KEY, "stale");
    new DecorSlice(storage).restore(empty);
    // An empty string here would be a value `Decor.load` then fails to parse.
    expect(storage.getItem(DECOR_STORAGE_KEY)).toBeNull();
  });

  it("leaves the key untouched when the payload is malformed", () => {
    const storage = new MemorySaveStorage();
    storage.setItem(DECOR_STORAGE_KEY, "live decor");
    const slice = new DecorSlice(storage);
    expect(slice.check({ raw: 5 })?.reason).toBe("malformed");
    expect(storage.getItem(DECOR_STORAGE_KEY)).toBe("live decor");
  });
});

// ---------------------------------------------------------------------------
// 6. The real thing — the compiled story, saved and reloaded
// ---------------------------------------------------------------------------

describe("save/load against the real ink story", () => {
  const storyDir = path.resolve(here, "..", "public", "story");
  const readStory = (f: string) => fs.readFileSync(path.join(storyDir, f), "utf8");
  const storyJson = readStory("story.json");
  const graph = JSON.parse(readStory("graph.json")) as Graph;
  const days: Day[] = [1, 2, 3, 4, 5].map((d) => JSON.parse(readStory(`day-${d}.json`)) as Day);
  const newPlayer = () =>
    new LanternPlayer(storyJson, buildGraphIndex(graph), days[0], undefined, days);

  /** Run to the next choice point, the way every caller does. */
  const settle = (p: LanternPlayer) => {
    let n = 0;
    while (p.view().canContinue && n++ < 400) p.continueOnce();
  };

  /** Walk a few moves in, so the saved state is not the opening state. */
  function playIn(p: LanternPlayer): void {
    settle(p);
    const begin = p.view().choices.find((c) => c.display.includes("Begin at"));
    if (begin) {
      p.choose(begin.index);
      settle(p);
    }
    for (let i = 0; i < 3; i++) {
      const move = p.view().choices.find((c) => c.kind === "move" && c.text !== "End the day");
      if (!move) break;
      p.choose(move.index);
      settle(p);
    }
  }

  it("restores a played-in session into a brand new player", () => {
    const played = newPlayer();
    playIn(played);
    const before = played.view();
    expect(before.errors).toEqual([]);

    const save = new LanternInkStatePort(played).capture();

    // The reload. A player constructed from nothing, sitting at day 1 morning.
    const reloaded = newPlayer();
    settle(reloaded);
    new LanternInkStatePort(reloaded).restore(save);

    const after = reloaded.view();
    expect(after.errors).toEqual([]);
    // The clock came back through ink's own state, not through an assignment.
    expect(after.day).toBe(before.day);
    expect(after.timeBlock).toBe(before.timeBlock);
    expect(after.movesLeft).toBe(before.movesLeft);
    // Pool-name vocabulary, verbatim.
    expect(after.satchel).toEqual(before.satchel);
    expect(after.banked).toEqual(before.banked);
    expect(after.pickedSlots.sort()).toEqual([...before.pickedSlots].sort());
    // What has been seen survives the reload.
    expect([...after.pos.visited].sort()).toEqual([...before.pos.visited].sort());
    // Bond and thread state ride `WorldState.snapshot()`.
    expect(after.bondBands).toEqual(before.bondBands);
    expect(after.threadMoves).toEqual(before.threadMoves);
  });

  it("never writes the clock — the player is not forced after a full cycle", () => {
    // `isForced()` flips only inside `setVar`, and nothing else in LanternPlayer
    // sets it. A false reading after a save AND a load is proof that no code the
    // cycle touched wrote movesLeft, TimeOfDay or day, at any depth.
    const played = newPlayer();
    playIn(played);
    expect(played.isForced()).toBe(false);

    const save = new LanternInkStatePort(played).capture();
    expect(played.isForced()).toBe(false);

    const reloaded = newPlayer();
    settle(reloaded);
    new LanternInkStatePort(reloaded).restore(save);
    expect(reloaded.isForced()).toBe(false);
  });

  it("capture is a pure read — the session it saved is unchanged", () => {
    const played = newPlayer();
    playIn(played);
    const before = played.view();
    const port = new LanternInkStatePort(played);
    port.capture();
    port.capture();
    const after = played.view();
    expect(after.day).toBe(before.day);
    expect(after.timeBlock).toBe(before.timeBlock);
    expect(after.satchel).toEqual(before.satchel);
    expect(after.lines.length).toBe(before.lines.length);
    expect(after.errors).toEqual([]);
  });

  it("survives a full round trip through storage, which is the reload", () => {
    const storage = new MemorySaveStorage();
    const played = newPlayer();
    playIn(played);
    const knowledge = new Knowledge();
    knowledge.learn("ignite");

    buildCoordinator({
      storage,
      ink: new LanternInkStatePort(played),
      position: new MemoryPosition(played.view().pos.currentScreen),
      slices: [new KnowledgeSlice(knowledge)],
    }).save();

    const before = played.view();

    // --- everything is thrown away and rebuilt from the bytes on disk ---
    const reloaded = newPlayer();
    settle(reloaded);
    const knowledgeAfter = new Knowledge();
    const positionAfter = new MemoryPosition();
    const report = buildCoordinator({
      storage,
      ink: new LanternInkStatePort(reloaded),
      position: positionAfter,
      slices: [new KnowledgeSlice(knowledgeAfter)],
    }).load();

    expect(report).toEqual({ loaded: true, defect: null, sliceDefects: [] });
    expect(reloaded.view().day).toBe(before.day);
    expect(reloaded.view().timeBlock).toBe(before.timeBlock);
    expect(reloaded.view().satchel).toEqual(before.satchel);
    expect(reloaded.view().errors).toEqual([]);
    expect(reloaded.isForced()).toBe(false);
    expect(knowledgeAfter.spellbook()).toEqual(["ignite"]);
    expect(positionAfter.currentScreenId()).toBe(before.pos.currentScreen);
  });

  it("brings the YEAR back with ink's own state, with no restore-path code at all (T13)", () => {
    // The claim Phase 2 rests on: because `year` is an ink VAR, it lives
    // inside `ink.storyStateJson` and a reload restores it for free. That is a
    // reasonable-sounding argument, which is exactly why it is tested rather
    // than trusted — and why NO restore code was written for it.
    const storage = new MemorySaveStorage();
    const played = newPlayer();
    playIn(played);
    expect(played.view().year).toBe(1);

    // Roll the year the only way anything is allowed to: divert into ink's own
    // `begin_new_year` knot and let the story increment its own variable.
    expect(played.jumpToAddress("begin_new_year")).toBe(true);
    settle(played);
    expect(played.view().year).toBe(2);
    expect(played.view().errors).toEqual([]);

    const save = buildCoordinator({
      storage,
      ink: new LanternInkStatePort(played),
      position: new MemoryPosition(played.view().pos.currentScreen),
    }).save();
    // Captured for the slot list — display only, and proven so below.
    expect(save.clockDisplay).toEqual({ day: 1, year: 2, timeBlock: "morning" });

    // --- the reload: a player built from nothing, sitting in year 1 ---
    const reloaded = newPlayer();
    settle(reloaded);
    expect(reloaded.view().year).toBe(1);

    const report = buildCoordinator({
      storage,
      ink: new LanternInkStatePort(reloaded),
      position: new MemoryPosition(),
    }).load();

    expect(report.loaded).toBe(true);
    expect(reloaded.view().year).toBe(2);
    expect(reloaded.view().errors).toEqual([]);
    // `isForced()` flips only inside `setVar`. False here means the year came
    // back inside ink's serialised state and not from an assignment.
    expect(reloaded.isForced()).toBe(false);
  });

  it("restores the year from ink even when clockDisplay.year is nonsense", () => {
    // The display field is written at capture and read by nothing on the way
    // back in. Tampering with it is the cleanest way to prove which of the two
    // copies is load-bearing.
    const played = newPlayer();
    playIn(played);
    expect(played.jumpToAddress("begin_new_year")).toBe(true);
    settle(played);

    const save = buildCoordinator({
      storage: new MemorySaveStorage(),
      ink: new LanternInkStatePort(played),
    }).capture();
    const tampered: SaveGame = { ...save, clockDisplay: { day: 99, year: 99, timeBlock: "nope" } };

    const reloaded = newPlayer();
    settle(reloaded);
    buildCoordinator({
      storage: new MemorySaveStorage(),
      ink: new LanternInkStatePort(reloaded),
    }).restore(tampered);

    expect(reloaded.view().year).toBe(2);
    expect(reloaded.view().day).toBe(1);
    expect(reloaded.isForced()).toBe(false);
  });

  it("puts the player back on a screen ink's own restore does not remember", () => {
    // `LanternPlayer.restore` derives `currentScreen` from a `#screen:` tag as
    // play moves, and a restored state has not printed one yet — which is why
    // `SaveGame.position` is an explicit field rather than something read back
    // out of ink.
    const played = newPlayer();
    playIn(played);
    const screen = played.view().pos.currentScreen;
    expect(screen).toBeTruthy();

    const reloaded = newPlayer();
    settle(reloaded);
    new LanternInkStatePort(reloaded).restore(new LanternInkStatePort(played).capture());
    expect(reloaded.view().pos.currentScreen).not.toBe(screen);

    const position = new MemoryPosition();
    position.applyScreenId(screen);
    expect(position.currentScreenId()).toBe(screen);
  });
});

// ---------------------------------------------------------------------------
// 7. Mounted, not shelved
// ---------------------------------------------------------------------------

/**
 * Everything above proves the save layer is CORRECT. It says nothing about
 * whether anything REACHES it — `SaveCoordinator`, `SaveStore` and the slices
 * were built and tested for a full session (Wave 2 Track C) and constructed in
 * no scene at all, which is the exact failure the mode5 merge plan opens with.
 * Asserted from the source text, the same technique `VfxSystem.test.ts` and
 * `DialogueSystem.test.ts` use, and for the same reason: a Phaser scene cannot
 * be imported into vitest.
 */
describe("the save layer is mounted, not shelved", () => {
  const collectScene = readText("src/scenes/CollectScene.ts");
  const modesSource = readText("src/mode/modes.ts");

  it("CollectScene constructs and binds a SaveCoordinator", () => {
    expect(collectScene).toContain("new SaveCoordinator(");
    expect(collectScene).toContain("new LanternInkStatePort(");
    expect(collectScene).toContain(".bindAutosave(");
  });

  it("mode5 is the only descriptor with save mounted", () => {
    // Not a precise parse — same "read the source text" posture as the rest of
    // this describe block — but exact enough to catch the two failure modes
    // that matter: `save` landing back on `null`, or `"save"` never making it
    // into `systems` (a descriptor field nothing reads is exactly Mode 4's
    // original defect).
    const mode5Block = /export const MODE5[\s\S]*?\n};/.exec(modesSource)?.[0] ?? "";
    expect(mode5Block).toContain('"save"');
    // The slot SET, as data in the descriptor (T13 Phase 3, 2026-08-24) — not
    // derived from `id` at read time, which would put a naming rule in code.
    expect(mode5Block).toMatch(/save:\s*{\s*\n\s*slots:\s*\[/);
    expect(mode5Block).toContain('"mode5-1", "mode5-2", "mode5-3"');
  });

  it("CollectScene takes its slot from scene data and guesses nothing (T13 Phase 4)", () => {
    // The descriptor holds three slots and cannot say which one this session
    // owns; the board's answer rides scene data, on BOTH routes in.
    expect(collectScene).toMatch(/data\.saveSlot\s*\?\?\s*null/);
    // The Phase-3 stub is GONE. It was harmless while one slot existed and the
    // board could not offer a choice; with three lives on disk, falling back to
    // `slots[0]` means a session that arrived without a slot autosaves over
    // life 1. No slot now means no coordinator, and a warning.
    expect(collectScene).not.toMatch(/save\?\.slots\[0\]/);
    // `.slot` with no `s` — the retired single-slot field.
    expect(collectScene).not.toMatch(/mode\.save\.slot(?![s\w])/);
  });

  it("DecorSlice takes over Decor's key rather than adding a second writer", () => {
    expect(collectScene).toContain("new DecorSlice(");
  });
});

/**
 * The board is a Phaser scene, so it is verified for real by
 * `playtest/t13-slot-board.mjs` (three named lives, resumed, screenshotted).
 * These are the three claims that would rot silently between playtests — each
 * one is a rule the phase turned on, stated as source text, in the same posture
 * as the block above.
 */
describe("the slot board is a real picker (T13 Phase 4)", () => {
  const board = readText("src/scenes/SaveLoadScene.ts");

  it("binds a column per slot instead of reading slots[0]", () => {
    expect(board).toMatch(/this\.slots\(\)\.map\(/);
    // The Phase-3 single-slot reads are gone with the placeholders.
    expect(board).not.toMatch(/slots\[0\]/);
    expect(board).not.toMatch(/primarySlot\(/);
  });

  it("no longer passes through when a slot-set mode has nothing saved", () => {
    // The ONLY pass-through left is "this mode has no slots at all". A gate on
    // `store.read(...).ok` would mean a first boot never sees the board — which
    // is where the slot is picked and the name is typed.
    expect(board).toMatch(/if \(this\.slots\(\)\.length === 0\)/);
    expect(board).not.toMatch(/!this\.store\.read\([^)]*\)\.ok/);
  });

  it("captures a typed name in-scene and passes it on without inventing one", () => {
    expect(board).toMatch(/keyboard\?\.on\("keydown"/);
    expect(board).toMatch(/e\.key === "Backspace"/);
    // Committed verbatim (trimmed), never defaulted to a stand-in.
    expect(board).toMatch(/goNewLife\(naming\.slot, name\)/);
    expect(board).not.toMatch(/"Unnamed"|"Player"/);
  });
});
