/**
 * What is out on a screen right now.
 *
 * `gdd/05-collectibles.md`: "Availability is randomized per screen. What you
 * can forage or find on a screen is drawn from that location's pool, so no two
 * visits offer the same spread."
 *
 * With the guardrail that matters more than the randomness: "the *items* a
 * knowledge-gate or a soul's arc depends on are exempt — always obtainable,
 * never randomized out ... Randomness sets the day's *path*, not whether the
 * goal is reachable."
 *
 * The draw is seeded on screen + day + time block rather than being truly
 * random, so a visit is stable while you stand there, a later visit differs,
 * and the walker can reproduce a run. Real randomness would make every
 * headless check flaky for no design benefit.
 */

import type { Graph } from "@lantern/types";

/** FNV-1a. Small, stable, and good enough to shuffle a pool of three. */
function hash(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

export interface ForageSlot {
  /** Stable id, so LanternPlayer can mark it picked and not re-offer it. */
  slotId: string;
  /** The coarse pool name as authored on the screen spec, e.g. "herbs". */
  item: string;
  /** Exempt from the draw because something depends on it. */
  guaranteed: boolean;
}

export class Forage {
  /** screen_id -> the pool authored on its spec. */
  private readonly pools = new Map<string, string[]>();

  /**
   * Pool entries that must never be randomized out. Authored `forage` names
   * are coarse ("herbs", "lantern-oil"), while `content/items/*.json` keys on
   * `item_id` ("item_berry") — different vocabularies, so this cannot be
   * derived by joining them. See GAPS.md G2/G13.
   */
  private readonly guaranteed: ReadonlySet<string>;

  constructor(graph: Graph, guaranteed: Iterable<string> = []) {
    for (const s of graph.screens ?? []) {
      if (s.forage?.length) this.pools.set(s.screen_id, [...s.forage]);
    }
    this.guaranteed = new Set(guaranteed);
  }

  poolFor(screenId: string): string[] {
    return this.pools.get(screenId) ?? [];
  }

  /**
   * The spread on offer for this visit.
   *
   * Guaranteed entries always appear. The rest are drawn by seeded order, at
   * least one whenever the pool has any — a screen that offers nothing at all
   * would read as broken rather than as a lean day.
   */
  offer(screenId: string, day: number, timeBlock: string): ForageSlot[] {
    const pool = this.poolFor(screenId);
    if (!pool.length) return [];

    const seed = hash(`${screenId}|${day}|${timeBlock}`);
    const always = pool.filter((p) => this.guaranteed.has(p));
    const drawable = pool.filter((p) => !this.guaranteed.has(p));

    // Rotate the drawable pool by the seed, then take a seeded count of it.
    const rotated = drawable.map((_, i) => drawable[(i + seed) % drawable.length]);
    const wanted = drawable.length ? 1 + (seed % drawable.length) : 0;
    const drawn = [...new Set(rotated.slice(0, wanted))];

    return [...always, ...drawn].map((item) => ({
      // Scoped to the day+block so a later visit is a genuinely new offer,
      // while a re-render within one visit re-offers the same slot.
      slotId: `${screenId}_${day}_${timeBlock}_${item}`,
      item,
      guaranteed: this.guaranteed.has(item),
    }));
  }
}
