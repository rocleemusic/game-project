/**
 * What a landed cast writes, per mode. DATA, not branches.
 *
 * `CastScene.cast()` and `CollectScene.hedgeSpellPicker()` disagreed about this,
 * and the disagreement is CORRECT — it is two rulings, not a bug. Wave 1
 * extracted the shared machinery into `world/CastPipeline.ts` and left the
 * disagreement here, where a mode can state it without anyone writing an `if`.
 *
 * Pure. No Phaser, no DOM.
 */

import type { CastPolicy } from "../world/CastPipeline";

/**
 * The full loop: an effect confirms a spell, a no-effect leaves a clue, and an
 * effect may open a path.
 *
 * `gdd/04-magic-system.md`: "you learn them by successfully casting them once",
 * and a cast that lands and does nothing "is a clue, not a confirmation" — two
 * knowledge states, not one.
 *
 * Gate clearing is EFFECT-ONLY. That is not a judgement about no-effect being a
 * failure; it is not one, and must never render as one. It is that a gate asks
 * whether something physically changed, and an authored "nothing happened" is
 * the answer "no". Otherwise the forest would unlock itself by casting at a cat.
 */
export const TEACHING_CAST: CastPolicy = {
  teachOn: ["effect"],
  hintOn: ["no-effect"],
  clearsTableGatesOn: ["effect"],
  clearsLocalGateOn: [],
};

/**
 * Modes 2 and 3's hedge. Writes the inventory and a LOCAL flag, and nothing
 * else.
 *
 * RULING (Roc, 2026-08-17) — collect-mode casting does NOT teach a spell. If a
 * spell is not already known it is not offered; learning happens in `CastScene`
 * or as a clue from an NPC. So `teachOn` and `hintOn` are both empty, and the
 * picker offering exactly `knowledge.spellbook()` is what makes that coherent.
 *
 * RULING (Roc, 2026-08-17) — the hedge gate stays LOCAL. `clearsTableGatesOn` is
 * empty because clearing a real `G-*` id here would leave F7 permanently stuck:
 * F7 also requires `G-F5-cascade`, which nothing in these modes can clear.
 *
 * RECORDED QUIRK, preserved deliberately: the local flag is set on ANY landed
 * cast, not only on an effect — `hedgeSpellPicker` guarded on `wrong-components`
 * and `unknown-receiver` only. Unreachable on the real hedge, since ignite's
 * `dry_hedge` branch is an effect, but it is what the code did and Wave 1 was
 * behaviour-preserving. Narrowing it to `["effect"]` is a one-word change here,
 * and wants a ruling plus an update to characterization test 5.
 */
export const HEDGE_CAST: CastPolicy = {
  teachOn: [],
  hintOn: [],
  clearsTableGatesOn: [],
  clearsLocalGateOn: ["effect", "no-effect"],
};
