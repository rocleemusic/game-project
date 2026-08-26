/**
 * CHARACTERIZATION — "no effect is an honest result", as it behaves 2026-08-17.
 *
 * `gdd/04-magic-system.md`: physical outcomes only, and "no effect" is an
 * honest result, never a failure. `CastScene`'s own header states the rule it
 * exists to hold: "The moment 'no effect' gets a red flash or a shake, the
 * design reads as a bug."
 *
 * Two things are pinned here.
 *
 * 1. NEUTRALITY. There is NO styling field anywhere on `CastResult` — nothing
 *    named error, red, shake, severity or tone. That is not an omission, it is
 *    the design: the outcome string drives bookkeeping only, and the view is
 *    forbidden from branching on it. So neutrality is asserted two ways —
 *    structurally (an effect and a no-effect result are shape-identical, and
 *    the outcome string is exactly "no-effect" and never an error-ish value),
 *    and at source level (the landed branch of `CastScene.drawResult` contains
 *    no red/shake/flash/error token, and never tests for "no-effect").
 *
 * 2. THE COUNT. 31 of the 89 authored outcomes resolve as "no-effect".
 *    Measured, not taken from the plan — and the plan's figure checks out.
 *
 * It also pinned a LIVE BUG. Wave 2 track A fixed half of it on 2026-08-17 and
 * left the other half honestly unfixed — see the last two describe blocks.
 */

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MagicDB, resolveCast, type CastResult } from "../../src/magic/CastResolver";
import type { ItemRecord, SpellRecord } from "../../src/magic/types";
import { ReceiverStateStore } from "../../src/world/receivers/ReceiverStateStore";
import { castWithReceiverState } from "../../src/world/receivers/statefulCast";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const read = <T>(...p: string[]): T =>
  JSON.parse(fs.readFileSync(path.join(root, ...p), "utf8")) as T;
const source = (...p: string[]) => fs.readFileSync(path.join(root, ...p), "utf8");

const spells = read<SpellRecord[]>("public", "content", "magic.json");
const items = read<ItemRecord[]>("public", "content", "items.json");
const db = new MagicDB(spells, items);

const everyPair = db.spells.flatMap((s) =>
  s.receivers.map((r) => ({
    spellId: s.spell_id,
    receiverId: r.receiver_id,
    receiverClass: r.receiver_class,
    prose: r.physical_outcome,
    result: resolveCast(db, s.phrase, s.components, r.receiver_id),
  })),
);

// ---------------------------------------------------------------------------
// 14. A no-effect result carries neutral styling
// ---------------------------------------------------------------------------

describe("14 — a no-effect result is styled as nothing at all", () => {
  const noEffect = resolveCast(db, "ignite", ["item_sticks"], "ilsa");
  const effect = resolveCast(db, "ignite", ["item_sticks"], "stick");

  it("carries no styling signal, because CastResult has no styling field", () => {
    // THERE IS NO STYLING FIELD. `CastResult` is outcome + authored prose +
    // bookkeeping, full stop. So the assertion is the one the code allows: the
    // outcome string is exactly "no-effect" and is not any error-ish value,
    // and the object carries nothing that a renderer could read as severity.
    expect(noEffect.outcome).toBe("no-effect");
    for (const errorish of ["error", "fail", "failed", "failure", "invalid", "red", "danger"]) {
      expect(noEffect.outcome).not.toBe(errorish);
    }
    const forbidden = ["error", "red", "shake", "severity", "tone", "style", "color", "flash"];
    for (const key of Object.keys(noEffect)) {
      expect(forbidden).not.toContain(key.toLowerCase());
    }
  });

  it("is shape-identical to an effect result, field for field", () => {
    // Anything a view can read off one, it can read off the other. There is
    // no field present on a failure that is absent on a success.
    expect(Object.keys(noEffect).sort()).toEqual(Object.keys(effect).sort());
    const sameType = (k: keyof CastResult) =>
      Array.isArray(noEffect[k]) === Array.isArray(effect[k]);
    for (const k of Object.keys(noEffect) as (keyof CastResult)[]) {
      expect(sameType(k)).toBe(true);
    }
  });

  it("renders the authored prose verbatim, exactly like a landed effect", () => {
    expect(noEffect.narration).toBe(
      db.spell("ignite")!.receivers.find((r) => r.receiver_id === "ilsa")!.physical_outcome,
    );
    expect(noEffect.narration).not.toBe("");
  });

  it("costs the components, because you tried and trying costs", () => {
    // The one thing that separates it from a never-happened state.
    expect(noEffect.consumed).toEqual(["item_sticks"]);
    expect(resolveCast(db, "breath", ["item_grass"], "stick").consumed).toEqual([]);
  });

  it("mints nothing and opens nothing", () => {
    expect(noEffect.produced).toEqual([]);
    expect(noEffect.unlockedScreen).toBeNull();
  });

  it("keeps CastScene's landed branch free of any failure styling", () => {
    // Source-level, because the neutrality lives in the view and the view is
    // Phaser-coupled. `drawResult` early-returns for the three never-happened
    // states; everything after the last of those returns is the landed path,
    // shared by "effect" and "no-effect".
    const src = source("src", "scenes", "CastScene.ts");
    const start = src.indexOf("private drawResult()");
    expect(start).toBeGreaterThan(-1);
    const marker = "// Landed. Authored prose, verbatim, identically for effect and no-effect.";
    const landedAt = src.indexOf(marker, start);
    expect(landedAt).toBeGreaterThan(-1);
    const landed = src.slice(landedAt, src.indexOf("private lastHeight", landedAt));

    for (const token of [
      "COLOR.danger",
      "shake",
      "0xff0000",
      "#ff0000",
      "setTint",
      "flash",
      "error",
    ]) {
      expect(landed.toLowerCase()).not.toContain(token.toLowerCase());
    }
    // And it never branches on the outcome at all — one path, both results.
    expect(landed).not.toContain('"no-effect"');
    expect(landed).not.toContain('"effect"');
  });

  it("uses the danger colour only where a cast never happened", () => {
    // COLOR.danger exists (theme.ts: "a cast that failed outright, or a
    // blocked action"). It must not be reachable from a landed cast.
    const cast = source("src", "scenes", "CastScene.ts");
    expect(cast).not.toContain("COLOR.danger");
    // CollectScene itself no longer draws the move-choice row at all — that
    // moved into `render/TraversalRow.ts` (mode5 plan step 7) — so this
    // checks the file that actually colours a gate-blocked MOVE now, never
    // an outcome.
    const collect = source("src", "scenes", "CollectScene.ts");
    expect(collect).not.toContain("COLOR.danger");
    // T14 (2026-08-24): a gate-blocked MOVE is no longer a pill at all — the
    // HUD relayout turned exits into dashed regions on the painting
    // (`render/MoveRegions.ts`), and the gated paint moved there with them.
    // The RULE is unchanged and is what this case has always been about:
    // DialogueSystem's own line holds — a blocked move is MUTED, never red,
    // because "a move you cannot take yet is a fact about the world, not an
    // error." So the assertion follows the paint to its new file, and
    // `TraversalRow` (which now draws only ungated, non-hub choices) is held
    // to the no-danger half only.
    const traversalRow = source("src", "render", "TraversalRow.ts");
    expect(traversalRow).not.toContain("COLOR.danger");
    const moveRegions = source("src", "render", "MoveRegions.ts");
    expect(moveRegions).not.toContain("COLOR.danger");
    expect(moveRegions).toContain("COLOR.muted");
  });
});

// ---------------------------------------------------------------------------
// 15. Every authored no-effect outcome resolves as outcome "no-effect"
// ---------------------------------------------------------------------------

/** What `CastResolver.readsAsNoEffect` matches today: anchored, space, not `_`. */
const ANCHORED = /^no (physical )?effect\b/i;
/** What an author actually writes, in any of its forms. */
const ANY_MARKER = /no[_ ]effect/i;

describe("15 — the authored no-effect count, measured off disk", () => {
  it("authors 92 outcomes across 16 approved spells", () => {
    expect(db.spells.length).toBe(16);
    // 92 = 89 + the three F8 heated-stone receivers (2026-08-19).
    expect(everyPair.length).toBe(92);
  });

  it("resolves exactly 31 of the 89 as outcome no-effect", () => {
    // MEASURED 2026-08-17. The plan said "31 of 89" and that is correct.
    const resolved = everyPair.filter((p) => p.result.outcome === "no-effect");
    expect(resolved.length).toBe(31);
  });

  it("resolves every anchored 'No effect...' outcome as no-effect, and no other", () => {
    const anchored = everyPair.filter((p) => ANCHORED.test(p.prose.trim()));
    expect(anchored.length).toBe(31);
    for (const p of anchored) {
      expect(`${p.spellId} x ${p.receiverId} -> ${p.result.outcome}`).toBe(
        `${p.spellId} x ${p.receiverId} -> no-effect`,
      );
      expect(p.result.produced).toEqual([]);
      expect(p.result.unlockedScreen).toBeNull();
    }
  });

  it("never resolves anything else in the 89 as anything but effect", () => {
    // Every authored pair lands. There are no wrong-components, unknown-spell
    // or unknown-receiver results inside the authored set — the cast sweep
    // asserts the same thing through the real UI.
    const outcomes = new Set(everyPair.map((p) => p.result.outcome));
    expect([...outcomes].sort()).toEqual(["effect", "no-effect"]);
  });

  it("keeps 31 no-effect outcomes across the reaction spectrum", () => {
    // Not all silence is the same silence — `reaction_kind: null` means render
    // nothing, and it must never be filled in with a stand-in line.
    const ne = everyPair.filter((p) => p.result.outcome === "no-effect");
    expect(ne.some((p) => p.result.reaction === null)).toBe(true);
    expect(ne.some((p) => p.result.reaction !== null)).toBe(true);
    for (const p of ne) {
      const authored = db
        .spell(p.spellId)!
        .receivers.find((r) => r.receiver_id === p.receiverId)!.reaction_kind;
      expect(p.result.reaction).toBe(authored);
    }
  });
});

// ---------------------------------------------------------------------------
// THE MID-STRING BUG — FIXED 2026-08-17 by Wave 2 track A (receiver state)
// ---------------------------------------------------------------------------

describe("FIXED — branch selection runs before the no-effect test", () => {
  /**
   * WHAT WAS WRONG. `readsAsNoEffect` is anchored:
   *
   *     return /^no (physical )?effect\b/i.test(physicalOutcome.trim());
   *
   * A stateful outcome puts the marker MID-STRING — "State-dependent: glowing
   * hot, ... ; already cold, no_effect — there is no heat to set" — so the
   * pattern could never see it, and `temper x forge_billet` resolved as an
   * EFFECT whatever state the billet was in: teaching the spell, standing
   * eligible to clear a gate, and minting `produces` off a cast the content
   * says did nothing.
   *
   * HOW IT IS FIXED, and why not by loosening the regex. Loosening it would
   * drag the HOT half of the same string into no-effect alongside the cold
   * half — one string, two answers, and a pattern cannot tell which applies.
   * So the fix is ORDERING: `ReceiverStateStore` selects the authored branch
   * first, `CastContext.branch` carries it in, and the branch's AUTHORED
   * `noEffect` decides. `statefulCast.ts` is that composition.
   *
   * THE CONTRACT THAT REPLACES THE BUG: for a stateful receiver, the caller
   * MUST select the branch. `resolveCast` called bare still reads the combined
   * string, which is the pre-fix answer — pinned below so the obligation is
   * visible rather than assumed.
   */

  const temper = db.spell("temper")!;
  const store = () => new ReceiverStateStore();

  it("resolves temper x forge_billet by STATE now — hot sets, cold does nothing", () => {
    const s = store();
    const req = {
      phrase: temper.phrase,
      offered: temper.components,
      receiverId: "forge_billet",
      screenId: "T4",
    };

    const hot = castWithReceiverState(db, s, req);
    expect(hot.selection?.state).toBe("hot");
    expect(hot.result.outcome).toBe("effect");
    expect(hot.result.narration).not.toContain("no_effect");

    const cold = castWithReceiverState(db, s, req);
    expect(cold.selection?.state).toBe("cold");
    expect(cold.result.outcome).toBe("no-effect"); // <-- was "effect". The fix.
    expect(cold.result.narration).toBe("already cold, no_effect — there is no heat to set");
    expect(cold.result.produced).toEqual([]);
    expect(cold.result.unlockedScreen).toBeNull();

    // Same cast, same components, different state, different answer.
    expect(hot.result.consumed).toEqual(cold.result.consumed);
  });

  it("renders only the branch that applies, and it is verbatim content", () => {
    const authored = temper.receivers.find((r) => r.receiver_id === "forge_billet")!
      .physical_outcome;
    const s = store();
    const hot = castWithReceiverState(db, s, {
      phrase: temper.phrase,
      offered: temper.components,
      receiverId: "forge_billet",
    });
    // A substring of the record — copied, never parsed out of it at runtime.
    expect(authored).toContain(hot.result.narration);
    expect(hot.result.narration).not.toBe(authored);
    expect(hot.result.narration).not.toContain("State-dependent");
  });

  it("still reads the combined string when no branch is selected", () => {
    // The pre-fix answer, kept visible on purpose. This is the caller's
    // obligation, not a fallback anyone should rely on: a stateful receiver
    // resolved without a branch gets the old, wrong reading.
    const bare = resolveCast(db, temper.phrase, temper.components, "forge_billet");
    expect(bare.narration).toContain("no_effect");
    expect(bare.outcome).toBe("effect");
  });

  it("gives every one of the 18 stateful pairs a branch table", () => {
    const stateful = everyPair.filter((p) => p.receiverClass === "stateful");
    expect(stateful.length).toBe(18);
    const s = store();
    for (const p of stateful) {
      expect(`${p.spellId} x ${p.receiverId}: ${s.kindOf(p.spellId, p.receiverId)}`).toBe(
        `${p.spellId} x ${p.receiverId}: stateful`,
      );
      expect(s.select(p.spellId, p.receiverId)).not.toBeNull();
    }
    // And the store's own guard confirms every clause is still verbatim.
    expect(
      s.validateAgainstOutcomes(
        (spellId, receiverId) =>
          db.spell(spellId)?.receivers.find((r) => r.receiver_id === receiverId)
            ?.physical_outcome,
      ),
    ).toEqual([]);
  });

  it("leaves the anchored regex in place as the non-stateful path", () => {
    const resolver = source("src", "magic", "CastResolver.ts");
    // No parser, and no content vocabulary, entered `src/magic`.
    expect(resolver).not.toContain("State-dependent");
    expect(resolver).not.toContain(".split(");
    // The regex still decides the 71 pairs that are not state-dependent.
    expect(resolver).toContain("/^no (physical )?effect\\b/i.test(physicalOutcome.trim())");
    // And the branch, when supplied, is what answers instead.
    expect(resolver).toContain("branch ? branch.noEffect : readsAsNoEffect");
  });
});

// ---------------------------------------------------------------------------
// STILL BROKEN — 16 outcomes that begin `no_effect —` with an UNDERSCORE
// ---------------------------------------------------------------------------

describe("KNOWN BUG — a leading no_effect marker still resolves as an EFFECT", () => {
  /**
   * The half of the original entry that track A did NOT fix, left honest.
   *
   * 16 non-stateful outcomes literally BEGIN `no_effect — ...`. The anchored
   * pattern wants a space, gets an underscore, and misses all of them. They are
   * not state-dependent, so branch selection does not reach them.
   *
   * WHY IT IS NOT FIXED HERE. Flipping 16 authored pairs from effect to
   * no-effect changes what mints, what teaches a spell and what may clear a
   * gate, across content nobody re-read this session. That is a content ruling
   * for Roc, not a regex tweak — and taking it silently inside a receiver-state
   * track is exactly the kind of scope drift the wave split exists to prevent.
   */

  it("still mis-resolves the 16 leading-underscore outcomes", () => {
    const mis = everyPair.filter(
      (p) => ANY_MARKER.test(p.prose) && !ANCHORED.test(p.prose.trim()),
    );
    // MEASURED 2026-08-17. Was 18: the two mid-string stateful pairs are now
    // handled by branch selection and only the 16 leading ones are left. The
    // count here is of the RAW resolve, with no branch supplied.
    expect(mis.length).toBe(18);
    for (const p of mis) expect(p.result.outcome).toBe("effect");

    const leading = mis.filter((p) => /^no_effect/i.test(p.prose.trim()));
    expect(leading.length).toBe(16);
    for (const p of leading) expect(p.receiverClass).not.toBe("stateful");

    const midString = mis.filter((p) => !/^no_effect/i.test(p.prose.trim()));
    expect(midString.map((p) => `${p.spellId} x ${p.receiverId}`).sort()).toEqual([
      "steep x kettle_of_water",
      "temper x forge_billet",
    ]);
    for (const p of midString) expect(p.receiverClass).toBe("stateful");
  });
});
