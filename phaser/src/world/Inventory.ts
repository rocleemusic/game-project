/**
 * What the caster can reach right now.
 *
 * Deliberately separate from `LanternPlayer`'s satchel: that models the day's
 * carry — capacity, arms, pack-triage — and is already built and tested. This
 * models *casting reach*, which is a different set:
 *
 *     satchel  ∪  always-available materials  ∪  world items on THIS screen
 *
 * The last term is what makes the GDD's flame rule true mechanically rather
 * than by convention. `item_flame` is `persistence: "world"`, `collectible:
 * false` — it exists on a screen, can be cast on and cast from, and can never
 * be pocketed. Enforcing that in one place (`availableOn`) means no spell ever
 * needs special-casing to respect it.
 *
 * `always_available` (`item_sticks`, gate-bearing for `ignite`) was authored
 * to guarantee the FORAGE OFFER never randomizes the gate-critical item out
 * (`Forage.ts`'s `guaranteed` param; GDD: "the *items* a knowledge-gate ...
 * depends on are exempt — always obtainable, never randomized out"). It does
 * NOT mean "castable without ever picking it up." `ScreenScene` never
 * notices the difference because `grantAllMaterials()` already holds
 * everything; bug found 2026-08-13 (Roc) in Collection & Discovery mode,
 * where foraging IS the mechanic — ignite was castable with an empty
 * satchel because `availableOn`'s `always_available` branch bypassed `held`
 * unconditionally. `includeAlwaysAvailable` (default true, preserving
 * `ScreenScene`'s existing behaviour) lets a mode where possession is meant
 * to matter opt out.
 */

import type { ItemRecord } from "../magic/types";
import type { InventorySave } from "./save/SaveGame";

export class Inventory {
  private readonly items: Map<string, ItemRecord>;
  /** Held, pocketable materials. */
  private held = new Set<string>();
  /** screen_id -> world items currently existing there. */
  private world = new Map<string, Set<string>>();
  /**
   * screen_id -> pocketable items the player deliberately DROPPED there
   * (satchel-cluster track, 2026-08-23 — Roc: "when something is dropped, it
   * should be placed in the world so it can be picked back up"). Separate
   * from `world` on purpose: that map is `persistence: "world"` features
   * (castable-from, never pocketable), this one is ordinary materials lying
   * where the player left them — re-pickupable, and NOT castable-with until
   * picked back up (a discarded thing is out of reach by choice). An array,
   * not a Set — two dropped units of the same item are two things on the
   * ground.
   */
  private dropped = new Map<string, string[]>();
  private readonly includeAlwaysAvailable: boolean;
  /**
   * Total times each item has been genuinely spent (below). This class has
   * no idea a "satchel display" exists — that's `LanternPlayer`'s, driven by
   * ink state this class never touches, and there is no API to remove an
   * entry from it. A consumer that shows that display (`CollectScene`) reads
   * this ledger to know how many of what it's about to render have actually
   * been spent, so a cast doesn't visually leave a consumed item sitting in
   * the satchel forever. See `consumedCountOf`/`clampConsumedCount`.
   */
  private readonly consumedCounts = new Map<string, number>();
  /**
   * Every id ever `give`n or produced — unlike `held`, this never shrinks on
   * consumption. Mode 3's gated Home Hub (Roc, 2026-08-13) reads this: what
   * you found stays decoratable even after you've cast it away.
   */
  private readonly everHeld = new Set<string>();

  constructor(items: ItemRecord[], opts: { includeAlwaysAvailable?: boolean } = {}) {
    this.items = new Map(items.map((i) => [i.item_id, i]));
    this.includeAlwaysAvailable = opts.includeAlwaysAvailable ?? true;
  }

  record(id: string): ItemRecord | undefined {
    return this.items.get(id);
  }

  /**
   * Sandbox mode. Pocketable materials are granted and never spent, so the
   * component tray stays stable across a long casting session.
   *
   * World items are still spent normally even here — a flame that has been
   * leapt from is gone, and that is the mechanic under test, not scarcity.
   */
  private sandbox = false;

  /**
   * Grant every pocketable material. The probe exercises the 89 authored cast
   * outcomes; re-proving foraging would be waste, since `LanternPlayer` already
   * models the day's carry and is tested.
   */
  grantAllMaterials(): void {
    this.sandbox = true;
    for (const item of this.items.values()) {
      if (item.persistence !== "world" && item.collectible) this.held.add(item.item_id);
    }
  }

  give(id: string): void {
    const item = this.items.get(id);
    // A world item is never pocketed, whatever asks.
    if (!item || item.persistence === "world") return;
    this.held.add(id);
    this.everHeld.add(id);
  }

  /** Ids ever held — `give`n, gifted, or produced by a cast. Never shrinks. */
  discoveredIds(): string[] {
    return [...this.everHeld];
  }

  /**
   * The other half of `give` — a voluntary, player-initiated removal (mode5
   * satchel-drop track, 2026-08-22). Distinct from what `applyCast` does to
   * `held`: that is a cast SPENDING a consumable, tracked in `consumedCounts`
   * for the satchel-ledger reconciliation (see this class's `consumedCounts`
   * field comment). A drop is a deliberate discard, not a spend — it never
   * touches `consumedCounts`, and `everHeld`/`discoveredIds()` still
   * remembers the item was found (the Home Hub decoration reads `everHeld`,
   * never `held`, so dropping something does not un-decorate it).
   *
   * The caller is also responsible for the OTHER side of this — removing the
   * matching pool-name occurrence from `LanternPlayer` (`dropSatchelSlot`
   * for a slotted entry, `removeCarriedPool` for an arms/banked-derived one)
   * — or the item reappears the next time `SatchelLedger.reJoinInto` resyncs
   * from `view.satchel`/`arms`/`banked`. See `CollectScene.openSatchel`'s
   * `onDrop` wiring, which does both.
   *
   * `screen` (satchel-cluster track, 2026-08-23): where the dropped thing
   * LANDS. When given and the item was genuinely held, the item joins that
   * screen's `dropped` list and renders as a re-pickupable hotspot
   * (`HotspotSystem`). Omitted/null = discard into nowhere (the pre-track
   * behaviour, kept for callers with no screen in hand).
   *
   * Returns whether anything was actually held to drop.
   */
  drop(id: string, screen?: string | null): boolean {
    const wasHeld = this.held.delete(id);
    if (wasHeld && screen) {
      const list = this.dropped.get(screen) ?? [];
      list.push(id);
      this.dropped.set(screen, list);
    }
    return wasHeld;
  }

  /** Items dropped on `screen`, in drop order. Read by `HotspotSystem`. */
  droppedOn(screen: string): readonly string[] {
    return this.dropped.get(screen) ?? [];
  }

  /**
   * Take one dropped item back off the ground — the host half of the
   * re-pickup. The satchel half (`LanternPlayer.stashPool`) is the caller's,
   * same two-sided contract as `drop`. Returns false when nothing of that id
   * lies dropped on that screen (a stale UI click racing a resync).
   */
  pickUpDropped(screen: string, id: string): boolean {
    const list = this.dropped.get(screen);
    if (!list) return false;
    const idx = list.indexOf(id);
    if (idx === -1) return false;
    list.splice(idx, 1);
    if (list.length === 0) this.dropped.delete(screen);
    this.held.add(id);
    this.everHeld.add(id);
    return true;
  }

  /** Put a produced item into the world, on the screen it was cast on. */
  spawnOn(screen: string, id: string): void {
    const set = this.world.get(screen) ?? new Set<string>();
    set.add(id);
    this.world.set(screen, set);
  }

  worldItemsOn(screen: string): string[] {
    return [...(this.world.get(screen) ?? [])];
  }

  isWorldItem(id: string): boolean {
    return this.items.get(id)?.persistence === "world";
  }

  /**
   * Everything castable-with on this screen.
   *
   * Restricted to things some spell actually takes. Mementos, gifts and tools
   * are collectible and go on a shelf, but no spell lists one as a component,
   * so putting them in the casting tray only buries the twelve that matter
   * under eleven that never will be.
   */
  availableOn(screen: string | null): string[] {
    const usable = (id: string) => (this.items.get(id)?.used_by.length ?? 0) > 0;
    const out = new Set([...this.held].filter(usable));
    if (!this.includeAlwaysAvailable) return this.withWorld(out, screen);
    for (const item of this.items.values()) {
      if (item.always_available && item.persistence !== "world" && usable(item.item_id)) {
        out.add(item.item_id);
      }
    }
    return this.withWorld(out, screen);
  }

  /** World items are on the screen and castable from, whatever else they are. */
  private withWorld(out: Set<string>, screen: string | null): string[] {
    if (screen) for (const id of this.worldItemsOn(screen)) out.add(id);
    return [...out].sort();
  }

  /**
   * Apply a resolved cast's bookkeeping.
   *
   * Consumption is scoped to what the caster actually owns: a world item is
   * spent from the screen, a held material from the pack.
   */
  applyCast(screen: string | null, consumed: string[], produced: string[]): void {
    for (const id of consumed) {
      const item = this.items.get(id);
      if (!item?.consumable) continue;
      if (item.persistence === "world") {
        // Always spent, sandbox or not: a flame that has been leapt from is
        // gone. That is the mechanic under test.
        if (screen) this.world.get(screen)?.delete(id);
      } else if (!this.sandbox && !(this.includeAlwaysAvailable && item.always_available)) {
        // The always_available shortcut only means "infinite fount" when this
        // Inventory is also treating it as always available for casting
        // (`includeAlwaysAvailable`) — otherwise it was genuinely foraged and
        // spends like anything else.
        this.held.delete(id);
        this.consumedCounts.set(id, (this.consumedCounts.get(id) ?? 0) + 1);
      }
    }
    for (const id of produced) {
      if (this.isWorldItem(id)) {
        if (screen) this.spawnOn(screen, id);
      } else {
        this.held.add(id);
        this.everHeld.add(id);
      }
    }
  }

  /** How many units of `id` have been genuinely spent via `applyCast`. */
  consumedCountOf(id: string): number {
    return this.consumedCounts.get(id) ?? 0;
  }

  /**
   * A consumer tracking its own display of held units (`CollectScene`'s
   * satchel strip) calls this once it has observed the underlying source has
   * fewer of `id` than the ledger claims — e.g. a new day wiped the satchel.
   * Never raises the count, only lowers it toward what's actually still
   * there.
   */
  clampConsumedCount(id: string, max: number): void {
    const cur = this.consumedCounts.get(id) ?? 0;
    if (cur <= max) return;
    if (max <= 0) this.consumedCounts.delete(id);
    else this.consumedCounts.set(id, max);
  }

  /** Pure read, for `InventoryStatePort`. See `world/save/ports.ts`'s header. */
  captureState(): InventorySave {
    return {
      heldItemIds: [...this.held],
      everHeldItemIds: [...this.everHeld],
      worldItemsByScreen: Object.fromEntries(
        [...this.world].map(([screen, ids]) => [screen, [...ids]]),
      ),
      droppedItemsByScreen: Object.fromEntries(
        [...this.dropped].map(([screen, ids]) => [screen, [...ids]]),
      ),
      consumedCounts: Object.fromEntries(this.consumedCounts),
    };
  }

  /**
   * Replace this inventory's state WHOLESALE — never merged with whatever a
   * fresh session already granted, or a restore double-counts a starting kit.
   * `everHeld`/`consumedCounts` are `readonly` fields, so cleared and refilled
   * in place rather than reassigned.
   */
  restoreState(state: InventorySave): void {
    this.held = new Set(state.heldItemIds);
    this.everHeld.clear();
    for (const id of state.everHeldItemIds) this.everHeld.add(id);
    this.world = new Map(
      Object.entries(state.worldItemsByScreen).map(([screen, ids]) => [screen, new Set(ids)]),
    );
    // Optional field — saves written before the satchel-cluster track
    // (2026-08-23) have no dropped items, honestly, rather than failing.
    this.dropped = new Map(
      Object.entries(state.droppedItemsByScreen ?? {}).map(([screen, ids]) => [screen, [...ids]]),
    );
    this.consumedCounts.clear();
    for (const [id, n] of Object.entries(state.consumedCounts)) this.consumedCounts.set(id, n);
  }
}
