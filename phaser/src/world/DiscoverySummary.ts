/**
 * "You found X of N spells, collected X of N items, and reached X of N
 * endings." — the arithmetic and the sentence behind the year-rollover screen
 * (T13 Phase 5, `plans/2026-08-24-year-loop-saves-build-plan.md`).
 *
 * PURE. No Phaser, no DOM, no I/O — `src/world/**` may never import the engine
 * (`tests/ArchitectureBoundary.test.ts`), and the whole point of this file is
 * that both the DENOMINATORS and the string a player reads are pinned by a unit
 * test rather than by a screenshot. `render/YearRollover.ts` only draws what
 * this returns. Same split, and the same reason, as
 * `world/FestivalScore.ts` / `render/FestivalResults.ts` and
 * `world/SaveSlotView.ts` / `scenes/SaveLoadScene.ts`.
 *
 * ---------------------------------------------------------------------------
 * THIS IS NOT A SCORE
 * ---------------------------------------------------------------------------
 *
 * `gdd/03-core-loop.md`'s "never a score shown" governs how the WEEK is judged —
 * the festival's own look, who came, what the town finished
 * (`render/FestivalResults.ts`). These three numbers are a different fact: how
 * much of the CONTENT this life has seen, which is a collection readout, not a
 * grade. Nothing here ranks a life, compares two lives, or produces a
 * percentage, and the sentence ends by saying there is more — the opposite of a
 * final mark. The tier WORDS are still never printed; endings are counted, not
 * named.
 *
 * ---------------------------------------------------------------------------
 * THE ITEMS DENOMINATOR — the one number that had to be traced, not guessed
 * ---------------------------------------------------------------------------
 *
 * N is THE RUN'S OWN OBTAINABLE SET, not `content/items/*.json`'s library
 * (Roc's adopted answer to open question 4 of the build plan: "a denominator
 * the player can actually finish"). `items.json` ships records that this run
 * cannot hand over at all, and counting them would put a ceiling on the card
 * that no amount of play can reach.
 *
 * `obtainableItemIds` below is a RE-STATEMENT OF ONE PREDICATE THAT ALREADY
 * EXISTS: `src/world/audit/rules.ts`'s `obtainable()`, the thing that decides
 * whether an authored item earns the `item-unobtainable` defect. Its four
 * sources are copied deliberately, so "what the audit says a player can get"
 * and "what the rollover says a player can get" cannot drift into two answers:
 *
 *   1. a FORAGE POOL on some screen  — `graph.screens[*].forage`, which since
 *      the 2026-08-23 pool/item reconciliation authors `item_id` strings
 *      directly (`foragePoolToItem.ts` is an identity shim now)
 *   2. an APPROVED SPELL'S OUTPUT    — `spell.produces`, plus the per-receiver
 *      override `receiver.produces` (Roc, 2026-08-19: `ignite × river_stone`
 *      mints `item_heated_stone` where `ignite × everything-else` mints
 *      `item_flame`)
 *   3. `always_available`            — the never-randomised-out guarantee
 *   4. an NPC HAND-OFF               — `world/npcItems.ts`'s `NPC_GIFT_ITEM`.
 *      Leaving this out is what would have made the number wrong: `item_salt`
 *      forages from nowhere and no spell makes it, and it is obtainable anyway,
 *      from the Baker, by Roc's 2026-08-13 ruling.
 *
 * TWO NARROWINGS the audit does not need and this does:
 *
 *   - `item.produced_by` IS NOT A SOURCE HERE, though the audit accepts it. It
 *     is the BACK-reference, and it can name a spell that was rejected — an
 *     item whose only maker is rejected content is not obtainable by playing.
 *     The forward `produces` on the APPROVED spell list is the authoritative
 *     half of the same join. (Identical result on today's content: all 16
 *     spells are approved.)
 *   - `persistence: "world"` items are EXCLUDED. `item_flame`,
 *     `item_heated_stone` and `item_tempered_stone` exist on a screen and can
 *     never be pocketed — `Inventory.give` refuses them outright and
 *     `applyCast` routes them to the screen instead of `everHeld`. They can
 *     therefore never appear in the numerator, and a denominator carrying three
 *     ids the numerator structurally cannot reach is an unfinishable count.
 *
 * Today that resolves to 14: twelve forageable materials, `key_raw_ore` (a key
 * item, on a screen's forage list), and `item_salt` from the Baker.
 */

import type { Graph } from "@lantern/types";
import type { ItemRecord, SpellRecord } from "../magic/types";
import { FESTIVAL_TIERS } from "./FestivalScore";

/** What the run has on disk, in the shape the denominator is derived from. */
export interface ObtainableItemsInput {
  /** `run.graph` — read for `screens[*].forage` and nothing else. */
  readonly graph: Graph;
  /** `run.items` ∪ `run.keyItems`, i.e. every record the game knows about. */
  readonly itemRecords: readonly ItemRecord[];
  /**
   * APPROVED spells only — `MagicDB.spells`, which has already filtered
   * `status === "rejected"` out. Handing the raw `content/magic.json` list in
   * would count rejected content's outputs as obtainable.
   */
  readonly approvedSpells: readonly SpellRecord[];
  /** `Object.values(NPC_GIFT_ITEM)` — source 4 above. */
  readonly npcGiftItemIds: readonly string[];
}

/**
 * Every item id THIS RUN can actually put in a player's hands, sorted.
 *
 * See the file header for the four sources and the two narrowings. Returns ids,
 * not records, because every caller only ever counts or intersects them.
 */
export function obtainableItemIds(input: ObtainableItemsInput): string[] {
  const records = new Map(input.itemRecords.map((i) => [i.item_id, i]));
  const sources = new Set<string>();

  for (const screen of input.graph.screens ?? []) {
    for (const itemId of screen.forage ?? []) sources.add(itemId);
  }
  for (const spell of input.approvedSpells) {
    for (const itemId of spell.produces ?? []) sources.add(itemId);
    for (const receiver of spell.receivers ?? []) {
      for (const itemId of receiver.produces ?? []) sources.add(itemId);
    }
  }
  for (const record of input.itemRecords) {
    if (record.always_available) sources.add(record.item_id);
  }
  for (const itemId of input.npcGiftItemIds) sources.add(itemId);

  return [...sources]
    // An id no record backs is a broken join, not a collectible — the audit
    // reports it as `forage-pool-unjoined`, and counting it here would make the
    // denominator unreachable for a reason the player can never see.
    .filter((id) => {
      const record = records.get(id);
      return record !== undefined && record.persistence !== "world";
    })
    .sort();
}

/** The three counts, already reduced to numbers. Display-ready, order fixed. */
export interface DiscoverySummary {
  readonly spellsLearned: number;
  readonly spellsTotal: number;
  readonly itemsCollected: number;
  readonly itemsTotal: number;
  readonly endingsReached: number;
  readonly endingsTotal: number;
}

/**
 * Everything the summary needs, in one bag: the run's content (for the two
 * denominators it derives) plus the three things this life has actually done.
 *
 * ONE ARGUMENT SO THE SCENE CARRIES NO DERIVATION. `CollectScene` is under a
 * documented line-count gate precisely so it stays orchestration, and
 * "denominator = forage ∪ produces ∪ always_available ∪ gifts, minus world
 * items" is emphatically not orchestration. It hands over what it already
 * holds; every rule about what those numbers MEAN lives in this file.
 */
export interface DiscoveryInput extends ObtainableItemsInput {
  /** `Knowledge.spellbook()` — confirmed, not merely seen. */
  readonly spellIdsLearned: readonly string[];
  /** `Inventory.discoveredIds()` — ever held, including spent. */
  readonly itemIdsEverHeld: readonly string[];
  /** `DiscoverySlice.tiersReached()` — cumulative across the life's years. */
  readonly tiersReached: readonly string[];
}

/**
 * The whole read, in the shape a running game has the parts in — the same
 * "one call, no assembly at the call site" shape `scoreFestivalForRun` gives
 * festival scoring.
 *
 * Side-effect-free and cheap (twenty screens, sixteen spells), so it is honest
 * to call on every render of the final screen and there is deliberately no
 * cached denominator to go stale against a regenerated run.
 */
export function summarizeDiscovery(input: DiscoveryInput): DiscoverySummary {
  return buildDiscoverySummary({
    spellIdsLearned: input.spellIdsLearned,
    spellIdsTotal: input.approvedSpells.map((s) => s.spell_id),
    itemIdsEverHeld: input.itemIdsEverHeld,
    itemIdsObtainable: obtainableItemIds(input),
    tiersReached: input.tiersReached,
  });
}

/** The raw sets, as the running game holds them. */
export interface DiscoveryCounts {
  /** `Knowledge.spellbook()` — confirmed, not merely seen. */
  readonly spellIdsLearned: readonly string[];
  /** `MagicDB.spells` ids — approved spells, the whole spellbook to fill. */
  readonly spellIdsTotal: readonly string[];
  /** `InventorySave.everHeldItemIds` — ever held, including spent. */
  readonly itemIdsEverHeld: readonly string[];
  /** `obtainableItemIds(...)`. */
  readonly itemIdsObtainable: readonly string[];
  /** `DiscoverySlice.tiersReached()` — cumulative across the lives' years. */
  readonly tiersReached: readonly string[];
}

/**
 * Reduce the sets to the six numbers the sentence needs.
 *
 * EVERY NUMERATOR IS AN INTERSECTION, never a raw `.length`. A restored save,
 * a regenerated run or a retired spell can leave the player holding an id that
 * is no longer part of what this run offers, and "collected 15 of 14 items" is
 * the kind of arithmetic a player screenshots. Counting only what is in BOTH
 * sets makes the numerator unable to exceed the denominator by construction —
 * no clamp, no `Math.min`, nothing to forget.
 */
export function buildDiscoverySummary(counts: DiscoveryCounts): DiscoverySummary {
  const spellsTotal = new Set(counts.spellIdsTotal);
  const itemsTotal = new Set(counts.itemIdsObtainable);
  const endingsTotal = new Set<string>(FESTIVAL_TIERS);
  const shared = (have: readonly string[], all: ReadonlySet<string>): number =>
    new Set([...have].filter((id) => all.has(id))).size;

  return {
    spellsLearned: shared(counts.spellIdsLearned, spellsTotal),
    spellsTotal: spellsTotal.size,
    itemsCollected: shared(counts.itemIdsEverHeld, itemsTotal),
    itemsTotal: itemsTotal.size,
    endingsReached: shared(counts.tiersReached, endingsTotal),
    endingsTotal: endingsTotal.size,
  };
}

/**
 * The one line the rollover leads with, composed here rather than in the
 * renderer so the string a player reads is pinned by a unit test.
 *
 * The wording is the build plan's, verbatim, including the closing "There is
 * still more to discover!" — which is the whole point of the screen and is why
 * this reads as an invitation rather than a result.
 */
export function formatDiscoveryLine(summary: DiscoverySummary): string {
  return (
    `You found ${summary.spellsLearned} of ${summary.spellsTotal} spells, ` +
    `collected ${summary.itemsCollected} of ${summary.itemsTotal} items, ` +
    `and reached ${summary.endingsReached} of ${summary.endingsTotal} endings. ` +
    `There is still more to discover!`
  );
}
