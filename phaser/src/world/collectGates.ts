/**
 * The one hedge-gate this mode models, host-side only.
 *
 * THIS IS PROBE-LOCAL AND PROVISIONAL, same posture as `spellGates.ts` and
 * `foragePoolToItem.ts`. No screen in `graph.json` is actually tagged with a
 * hedge obstacle — `dry_hedge` exists only as a receiver on `ignite.json` and
 * in that spell's `unlocks.obstacle` prose ("The dry hedge blocking the
 * path"), which points at a screen id ("Forest Unlock 1") that was never
 * minted (GAPS.md G1). `spellGates.ts` already treats `ignite`/`glimmer` as
 * clearing `G-F7-light`, but `F7` also needs `G-F5-cascade`, which no approved
 * spell can clear (`UNSATISFIABLE_NOTES`) — so reusing the real gate graph
 * would make this permanently stuck.
 *
 * Instead this mode tracks its OWN gate flag, independent of `Gates.ts`'s real
 * `G-*` ids and independent of `?locks=1`. `F7` "The Cave" is the target
 * screen — a guess, picked because it's the one screen `spellGates.ts`
 * already associates with `ignite` as the way through. Confirm or redirect.
 */

export const HEDGE_SCREEN_ID = "F7";
export const HEDGE_RECEIVER_ID = "dry_hedge";
/** The spell this mode expects to clear the hedge. Any spell with this
 * receiver authored would work; `ignite` is the only one that has it. */
export const HEDGE_CLEARING_SPELL = "ignite";
