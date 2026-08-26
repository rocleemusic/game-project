/**
 * The small stable hash the project seeds everything reproducible from.
 *
 * `Forage.ts` uses it for its pool draw, `CollectScene` used a second private
 * copy of it for hotspot placement and for which spell an NPC deals you. Two
 * copies of one function is one copy too many the moment a third caller needs
 * it, so it lives here.
 *
 * SEEDED, NEVER RANDOM, and that is a requirement rather than a convenience:
 * `npm run walk` reproduces a whole week headlessly and samples canvas pixels.
 * Real randomness would make the only pixel-level evidence in the project flaky
 * for no design benefit.
 */

/** FNV-1a. Small, stable, and good enough to shuffle a pool of three. */
export function fnv1a(s: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** A stable [0, 1) fraction from a seed string. */
export function seededFrac(seed: string): number {
  return fnv1a(seed) / 0xffffffff;
}

/**
 * Which of a role's `count` spells a soul offers on a given `day`. Rotates by
 * day (Roc, 2026-08-18): the soul's hash sets a stable starting offset and
 * `day` advances the pick each morning, so a role held by a single soul still
 * teaches its whole set across the week instead of fixing on one spell. Because
 * `day` steps by one, consecutive days give consecutive indices — so every
 * spell is offered at least once within any `count` consecutive days (the week
 * is 5 days; the largest role owns 3 spells).
 */
export function rotatingClueIndex(soul: string, day: number, count: number): number {
  if (count <= 1) return 0;
  return ((fnv1a(soul) + day) % count + count) % count;
}
