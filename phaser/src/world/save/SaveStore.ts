/**
 * Where a save physically lives, and nothing else.
 *
 * One job: bytes in, bytes out, keyed by slot. It does not know what a slice
 * is, what ink is, or what the two vocabularies are — `SaveCoordinator` owns
 * all of that. Splitting them is what lets the whole save path be tested with no
 * browser: `MemorySaveStorage` and `localStorage` are the same interface, and
 * the round-trip test is the reload.
 *
 * PURE. `src/world/**` may never import Phaser and may not reach for a DOM
 * global, so the browser's `localStorage` is passed IN as a `WebStorageLike`
 * rather than read off `globalThis`. There is no `typeof window` check anywhere
 * in this folder, on purpose — a module that can find its own storage is a
 * module that behaves differently under test than in the game.
 *
 * A DEFECT IS REPORTED, NEVER COERCED. A save from a different schema version,
 * or one that will not parse, comes back as a `SaveLoadDefect` and the caller
 * decides. Restoring a partially-understood save anyway is exactly how a reload
 * quietly loses a week, which is the failure this whole track exists to prevent.
 */

import {
  SAVE_VERSION,
  type SaveGame,
  type SaveLoadDefect,
  type SaveSlotInfo,
} from "./SaveGame";

/**
 * The `localStorage` shape, restated structurally.
 *
 * Not `Storage` from lib.dom: naming the DOM type here would make this folder
 * depend on a DOM lib being configured, and the point of the interface is that
 * a `Map` satisfies it just as well as a browser does.
 */
export interface WebStorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  key(index: number): string | null;
  readonly length: number;
}

/** What the save layer needs of a store. `keys()` is what makes a slot list possible. */
export interface SaveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
  keys(): string[];
}

/**
 * The key namespace.
 *
 * Versioned in the key as well as in the payload so that a future schema change
 * can leave old saves sitting where they are instead of overwriting them — the
 * same reason `Decor.ts` keys `phaser-probe/decor/v1`.
 */
export const SAVE_KEY_PREFIX = "phaser-probe/save/v1/";

export function saveKeyFor(slot: string): string {
  return `${SAVE_KEY_PREFIX}${slot}`;
}

/** In-memory storage. The test double, and the fallback when writes throw. */
export class MemorySaveStorage implements SaveStorage {
  private readonly map = new Map<string, string>();

  getItem(key: string): string | null {
    return this.map.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.map.set(key, value);
  }

  removeItem(key: string): void {
    this.map.delete(key);
  }

  keys(): string[] {
    return [...this.map.keys()];
  }
}

/**
 * Wrap a browser `localStorage`.
 *
 * Writes that throw (private mode, quota) are swallowed HERE and nowhere else,
 * matching `Decor.ts`'s existing behaviour: a browser that refuses to persist is
 * not a reason to fail the running game.
 *
 * A read that throws returns null, and the store then reports `missing`. That is
 * accurate rather than convenient: a browser that will not let the page read
 * storage at all has no save to offer, and the reason it has none is not
 * something this layer can distinguish.
 */
export function webSaveStorage(storage: WebStorageLike): SaveStorage {
  return {
    getItem(key) {
      try {
        return storage.getItem(key);
      } catch {
        return null;
      }
    },
    setItem(key, value) {
      try {
        storage.setItem(key, value);
      } catch {
        /* private-mode or quota — see the header */
      }
    },
    removeItem(key) {
      try {
        storage.removeItem(key);
      } catch {
        /* as above */
      }
    },
    keys() {
      const out: string[] = [];
      try {
        for (let i = 0; i < storage.length; i++) {
          const k = storage.key(i);
          if (k !== null) out.push(k);
        }
      } catch {
        return out;
      }
      return out;
    },
  };
}

/** A read either produced a save or produced a reason it could not. */
export type SaveReadResult =
  | { readonly ok: true; readonly save: SaveGame }
  | { readonly ok: false; readonly defect: SaveLoadDefect };

/**
 * Shape check for something that came off disk.
 *
 * Structural and shallow on purpose. It confirms the fields the coordinator is
 * about to read exist and are the right kind of thing; it does not validate
 * slice payloads, because a slice owns its own payload and says so through
 * `CheckedSaveSlice.check`.
 *
 * FIELDS ADDED BY A VERSION BUMP ARE DELIBERATELY NOT CHECKED HERE. `read()`
 * runs this gate BEFORE the version gate, so requiring `playerName` (new in
 * `SAVE_VERSION = 3`) would make every version-2 save come back as
 * `unreadable` instead of `version-mismatch` — the same bytes, refused with the
 * wrong reason, and the reason is what a slot picker shows the player. This
 * list stays at the fields every version has carried; the version number is
 * what draws the line between schemas.
 */
function looksLikeSave(value: unknown): value is SaveGame {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.version === "number" &&
    typeof v.slot === "string" &&
    typeof v.modeId === "string" &&
    typeof v.savedAt === "string" &&
    typeof v.ink === "object" &&
    v.ink !== null &&
    typeof v.inventory === "object" &&
    v.inventory !== null &&
    typeof v.position === "object" &&
    v.position !== null &&
    typeof v.clockDisplay === "object" &&
    v.clockDisplay !== null &&
    typeof v.slices === "object" &&
    v.slices !== null
  );
}

export class SaveStore {
  constructor(private readonly storage: SaveStorage) {}

  write(save: SaveGame): void {
    this.storage.setItem(saveKeyFor(save.slot), JSON.stringify(save));
  }

  has(slot: string): boolean {
    return this.storage.getItem(saveKeyFor(slot)) !== null;
  }

  remove(slot: string): void {
    this.storage.removeItem(saveKeyFor(slot));
  }

  read(slot: string): SaveReadResult {
    const raw = this.storage.getItem(saveKeyFor(slot));
    if (raw === null) {
      return {
        ok: false,
        defect: { slot, reason: "missing", detail: `no save at ${saveKeyFor(slot)}` },
      };
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      return {
        ok: false,
        defect: { slot, reason: "unreadable", detail: `not JSON: ${String(err)}` },
      };
    }
    if (!looksLikeSave(parsed)) {
      return {
        ok: false,
        defect: { slot, reason: "unreadable", detail: "missing required top-level fields" },
      };
    }
    if (parsed.version !== SAVE_VERSION) {
      return {
        ok: false,
        defect: {
          slot,
          reason: "version-mismatch",
          detail: `save is version ${parsed.version}, this build reads ${SAVE_VERSION}`,
        },
      };
    }
    return { ok: true, save: parsed };
  }

  /**
   * Every readable save, newest first.
   *
   * Unreadable entries are skipped rather than thrown on — a slot list that
   * cannot render because one save went bad is worse than a slot list missing
   * one row. `read()` is where a specific slot's defect is reported.
   */
  list(): SaveSlotInfo[] {
    const out: SaveSlotInfo[] = [];
    for (const key of this.storage.keys()) {
      if (!key.startsWith(SAVE_KEY_PREFIX)) continue;
      const result = this.read(key.slice(SAVE_KEY_PREFIX.length));
      if (!result.ok) continue;
      const save = result.save;
      out.push({
        slot: save.slot,
        version: save.version,
        savedAt: save.savedAt,
        // Host-owned, written at capture. `""` for an unnamed life — the slot
        // board decides how that reads; this layer does not invent a name.
        playerName: save.playerName,
        modeId: save.modeId,
        // Straight off the frozen display read. Never assigned back into ink.
        day: save.clockDisplay.day,
        year: save.clockDisplay.year,
        timeBlock: save.clockDisplay.timeBlock,
      });
    }
    return out.sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  }
}
