/**
 * What `SatchelScene` draws one pocket for. Pure — no Phaser, no DOM — same
 * posture as `SatchelLedger.ts`, which this sits beside and reads from.
 *
 * WHY A COUNT CAN BE UNKNOWN. Quantity only exists in ink's own pool-name
 * array (`v.satchel` — `SatchelLedger.ts`'s header has the full accounting).
 * Two real cases hold an item with no pool provenance to count against:
 * `item_captured_sound` (`persistence: "free"`, given directly in
 * `CollectScene.init()`, never picked up through a forage pool) and anything
 * the mode5 DEV unlock granted via `Inventory.grantAllMaterials()`, which
 * also bypasses the pool array entirely. Both read as `count: null` here
 * rather than a fabricated number — the pocket still shows, honestly.
 */

import { itemForPool } from "./foragePoolToItem";
import type { ItemRecord, SpellRecord } from "../magic/types";

export interface CarriedFor {
  readonly phrase: string;
  readonly known: boolean;
}

export interface Pocket {
  readonly id: string;
  readonly label: string;
  readonly description: string;
  readonly kind: string;
  /** A real tally from ink's pool array, or `null` — see the header. */
  readonly count: number | null;
  /** `persistence === "free"` — never spent, no count to show. */
  readonly free: boolean;
  readonly carriedFor: readonly CarriedFor[];
}

/** The per-id fields every pocket shares, regardless of which builder below
 * assembles it (grouped-by-type for Arms, one-per-physical-slot for Satchel —
 * see `buildSatchelSlots`'s header on why the two tabs differ). */
function buildPocket(
  id: string,
  record: (id: string) => ItemRecord | undefined,
  spells: readonly SpellRecord[],
  known: (spellId: string) => boolean,
): Omit<Pocket, "count"> {
  const rec = record(id);
  const carriedFor = spells
    .filter((s) => s.components.includes(id))
    .map((s) => ({ phrase: s.phrase, known: known(s.spell_id) }));
  return {
    id,
    label: id.replace(/^item_/, "").replace(/_/g, " "),
    description: rec?.description ?? id,
    kind: rec?.category ?? "",
    free: rec?.persistence === "free",
    carriedFor,
  };
}

/**
 * `heldIds` is `Inventory.availableOn(null)` — held, castable-with, no world
 * items (satchel is pocketed stuff, not screen features). `poolOccurrences`
 * is `effectiveSatchel(v.satchel)` — one pool name per unit actually carried.
 */
export function buildPockets(
  heldIds: readonly string[],
  poolOccurrences: readonly string[],
  record: (id: string) => ItemRecord | undefined,
  spells: readonly SpellRecord[],
  known: (spellId: string) => boolean,
): Pocket[] {
  const counts = new Map<string, number>();
  for (const pool of poolOccurrences) {
    const id = itemForPool(pool);
    if (id) counts.set(id, (counts.get(id) ?? 0) + 1);
  }

  return heldIds.map((id) => ({
    ...buildPocket(id, record, spells, known),
    count: counts.get(id) ?? null,
  }));
}

/**
 * One pocket per PHYSICAL satchel slot — added for the satchel drop/move
 * track (2026-08-22), and deliberately a different shape from `buildPockets`
 * above. `buildPockets` groups by item TYPE (a Set, so two units of the same
 * pool collapse into one tile with a count badge) because that was the right
 * read for a view-only satchel. Drop/move need the opposite: a stable,
 * addressable POSITION per unit, so "move this to that empty pocket" has
 * something to land on and "drop this" knows which one physical slot to
 * clear. So here, one satchel-array slot = one tile, always; a pool held
 * twice is two separate tiles, not one tile with "2" on it. Flagged as a
 * disclosed behavior change from the pre-drop/move satchel, not a bug.
 *
 * `slotItemIds[i]` is the item occupying physical slot i — already run
 * through `effectiveSatchelSlots` and `itemForPool`, so a consumed-and-hidden
 * or unjoined-pool slot is `null` here, same as a genuinely empty one.
 * `extraHeldIds` are held+usable ids with NO pool-array slot at all (a
 * `free`-persistence item like `item_captured_sound`, or anything the mode5
 * DEV unlock granted directly via `Inventory.grantAllMaterials()`) — they
 * still need to show (SatchelScene's own copy already promises a free item
 * "never takes a pocket," i.e. never competes for a real slot), so they fill
 * whatever slots this array leaves empty, left to right. They get
 * `slotIndex: null` in the result: droppable via `Inventory.drop` alone,
 * but not movable — there is no satchel-array slot to move them out of.
 */
export interface SatchelSlotEntry {
  readonly pocket: Pocket;
  /** Index into `LanternPlayer.satchel`, or `null` for an extra (unslotted)
   * held item filling a leftover gap. See this function's header. */
  readonly slotIndex: number | null;
}

export function buildSatchelSlots(
  slotItemIds: readonly (string | null)[],
  extraHeldIds: readonly string[],
  record: (id: string) => ItemRecord | undefined,
  spells: readonly SpellRecord[],
  known: (spellId: string) => boolean,
): (SatchelSlotEntry | null)[] {
  const extras = [...extraHeldIds];
  return slotItemIds.map((id, index) => {
    if (id) return { pocket: { ...buildPocket(id, record, spells, known), count: null }, slotIndex: index };
    const extraId = extras.shift();
    if (!extraId) return null;
    return { pocket: { ...buildPocket(extraId, record, spells, known), count: null }, slotIndex: null };
  });
}
