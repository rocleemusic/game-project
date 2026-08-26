/**
 * THE GUARD. Receiver state, and the one thing that keeps it honest.
 *
 * Every `clause` in `src/world/receivers/data/receiverStates.json` was copied by
 * hand out of the matching `physical_outcome` in the content records. Nothing
 * derives it, and nothing may: all 18 stateful outcomes share the shape
 * "State-dependent: A; B", so a regex split looks trivial — and several branches
 * carry their own semicolons and em-dashes, and one opens
 * "State-dependent on place and night:" instead. A split by pattern would render
 * the wrong half of the prose to the player, silently, for exactly the subset
 * where the shape is not literal. That is the "inferred, not authored" failure
 * the forage join was called out for (GAPS G13).
 *
 * So the copy is checked instead of the parse: EVERY CLAUSE MUST BE A VERBATIM
 * SUBSTRING of its record. Content drift then fails here rather than reaching a
 * player.
 */

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { MagicDB } from "../src/magic/CastResolver";
import type { ItemRecord, SpellRecord } from "../src/magic/types";
import {
  RECEIVER_STATES,
  ReceiverStateStore,
  everyAuthoredBranch,
  receiverKey,
} from "../src/world/receivers/ReceiverStateStore";
import { castWithReceiverState } from "../src/world/receivers/statefulCast";
import { GameEventBus } from "../src/world/events/GameEvents";
import type { ReceiverStatesFile } from "../src/world/receivers/ReceiverState";
import { CastPipeline, type CastPipelineDeps } from "../src/world/CastPipeline";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const read = <T>(...p: string[]): T =>
  JSON.parse(fs.readFileSync(path.join(root, ...p), "utf8")) as T;

const spells = read<SpellRecord[]>("public", "content", "magic.json");
const items = read<ItemRecord[]>("public", "content", "items.json");
const db = new MagicDB(spells, items);

/** The authored prose for one pair, or undefined if the pair is not authored. */
function outcomeOf(spellId: string, receiverId: string): string | undefined {
  return db.spell(spellId)?.receivers.find((r) => r.receiver_id === receiverId)
    ?.physical_outcome;
}

/** Every pair the CONTENT marks stateful — the set this table has to cover. */
const statefulPairs = db.spells.flatMap((s) =>
  s.receivers
    .filter((r) => r.receiver_class === "stateful")
    .map((r) => ({ spellId: s.spell_id, receiverId: r.receiver_id })),
);

const fresh = () => new ReceiverStateStore();

// ---------------------------------------------------------------------------
// 1. The substring guard
// ---------------------------------------------------------------------------

describe("every authored clause is a verbatim substring of its physical_outcome", () => {
  it("finds no clause that has drifted from the content record", () => {
    const defects = fresh().validateAgainstOutcomes(outcomeOf);
    // Named, not counted: a failure here has to say WHICH clause moved.
    expect(defects.map((d) => `${d.spellId} x ${d.receiverId}: ${d.detail}`)).toEqual([]);
  });

  it("checks something — 39 clauses across 18 pairs", () => {
    // Guards against the guard passing because it looked at nothing.
    const all = everyAuthoredBranch();
    expect(all.length).toBe(39);
    expect(RECEIVER_STATES.branches.length).toBe(18);
    expect(RECEIVER_STATES.receivers.length).toBe(15);
  });

  it("would catch a clause that no longer appears in the record", () => {
    // A test for the test. One character changed is a failure, not a warning.
    const tampered: ReceiverStatesFile = {
      receivers: RECEIVER_STATES.receivers,
      branches: RECEIVER_STATES.branches.map((t) =>
        t.spellId === "temper"
          ? {
              ...t,
              branches: t.branches.map((b) => ({ ...b, clause: `${b.clause}.` })),
            }
          : t,
      ),
    };
    const defects = new ReceiverStateStore(tampered).validateAgainstOutcomes(outcomeOf);
    expect(defects.length).toBe(2);
    expect(defects.every((d) => d.reason === "clause-not-in-outcome")).toBe(true);
  });

  it("carries its provenance in the file that carries the clauses", () => {
    expect(RECEIVER_STATES.provenance).toContain("COPIED BY HAND");
  });
});

// ---------------------------------------------------------------------------
// 2. No parser, now or later
// ---------------------------------------------------------------------------

describe("nothing in world/receivers splits authored prose", () => {
  it("has no string split anywhere in the folder", () => {
    const dir = path.join(root, "src", "world", "receivers");
    const offenders: string[] = [];
    for (const name of fs.readdirSync(dir)) {
      if (!name.endsWith(".ts")) continue;
      const src = fs.readFileSync(path.join(dir, name), "utf8");
      if (src.includes(".split(")) offenders.push(name);
      // A regex over the prose would be the same failure wearing a hat.
      if (/\.(match|exec|test)\(/.test(src)) offenders.push(`${name} (pattern match)`);
    }
    expect(offenders).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// 3. Coverage — the table covers exactly what the content marks stateful
// ---------------------------------------------------------------------------

describe("coverage against the content records", () => {
  it("covers all 18 stateful pairs and invents none", () => {
    expect(statefulPairs.length).toBe(18);
    const authored = new Set(
      RECEIVER_STATES.branches.map((t) => `${t.spellId} x ${t.receiverId}`),
    );
    const content = new Set(statefulPairs.map((p) => `${p.spellId} x ${p.receiverId}`));
    expect([...authored].sort()).toEqual([...content].sort());
  });

  it("loads with no structural defect", () => {
    // Every state has exactly one branch, every `initial` is a real state, and
    // every `becomes` names a state the same receiver already authors.
    expect(fresh().defects()).toEqual([]);
  });

  it("reports a missing branch rather than silently dropping a state", () => {
    const gutted: ReceiverStatesFile = {
      receivers: RECEIVER_STATES.receivers,
      branches: RECEIVER_STATES.branches.map((t) =>
        t.spellId === "temper" ? { ...t, branches: [t.branches[0]] } : t,
      ),
    };
    const defects = new ReceiverStateStore(gutted).defects();
    expect(defects).toEqual([
      {
        receiverId: "forge_billet",
        spellId: "temper",
        reason: "missing-branch",
        detail: 'state "cold" has no authored branch',
      },
    ]);
  });

  it("refuses a transition into a state nothing authors", () => {
    const invented: ReceiverStatesFile = {
      receivers: RECEIVER_STATES.receivers,
      branches: RECEIVER_STATES.branches.map((t) =>
        t.spellId === "seal"
          ? { ...t, branches: t.branches.map((b) => ({ ...b, becomes: "sealed" })) }
          : t,
      ),
    };
    const defects = new ReceiverStateStore(invented).defects();
    expect(defects.length).toBe(2);
    expect(defects.every((d) => d.reason === "unknown-state")).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// 4. no-effect is authored, and it is an honest result
// ---------------------------------------------------------------------------

describe("the no-effect branches are authored, listed and neutral", () => {
  const noEffectBranches = everyAuthoredBranch()
    .filter((b) => b.branch.noEffect)
    .map((b) => `${b.spellId} x ${b.receiverId} @ ${b.branch.whenState}`)
    .sort();

  it("marks exactly the six branches that state a nothing, by name", () => {
    // Written out rather than counted, because which ones is a content
    // judgement and belongs in review. Every clause below either carries the
    // authors' `no_effect` marker or says plainly that nothing happened.
    expect(noEffectBranches).toEqual([
      "ignite x furnace @ lit_by_hand",
      "ignite x furnace @ magic_lit",
      "scratch x scabbed_graze @ healed",
      "steep x kettle_of_water @ plain",
      "temper x forge_billet @ cold",
      "waft x chimney @ drawing_fine",
    ]);
  });

  it("never leaves an explicit no_effect marker marked as an effect", () => {
    // One-way check: the marker is proof, its absence is not. Clauses that
    // describe a diminished physical result ("only a dull knock escapes") stay
    // effects, which is how the resolver has always read them.
    const missed = everyAuthoredBranch().filter(
      (b) => /no_effect/i.test(b.branch.clause) && !b.branch.noEffect,
    );
    expect(missed).toEqual([]);
  });

  it("gives a no-effect branch no styling signal of any kind", () => {
    // No-effect is an honest result, never a failure. There is no field here a
    // renderer could read as severity — not red, not a shake, not an error.
    const forbidden = ["error", "red", "shake", "severity", "tone", "style", "color", "flash"];
    for (const { branch } of everyAuthoredBranch()) {
      for (const key of Object.keys(branch)) {
        expect(forbidden).not.toContain(key.toLowerCase());
      }
    }
  });
});

// ---------------------------------------------------------------------------
// 5. Selection and state
// ---------------------------------------------------------------------------

describe("state, selection and transitions", () => {
  it("starts every receiver in its authored initial", () => {
    const store = fresh();
    for (const record of RECEIVER_STATES.receivers) {
      expect(store.stateOf(record.receiverId)).toBe(record.initial);
    }
  });

  it("keys state per screen, so one furnace is not every furnace", () => {
    const store = fresh();
    store.setState("furnace", "T4", "magic_lit", "ignite");
    expect(store.stateOf("furnace", "T4")).toBe("magic_lit");
    expect(store.stateOf("furnace", "T2")).toBe("cold");
    expect(receiverKey("T4", "furnace")).toBe("T4/furnace");
    expect(receiverKey(null, "furnace")).toBe("*/furnace");
  });

  it("selects nothing for a pair that is not stateful", () => {
    expect(fresh().select("ignite", "stick")).toBeNull();
    expect(fresh().kindOf("ignite", "stick")).toBe("plain");
    expect(fresh().kindOf("temper", "forge_billet")).toBe("stateful");
  });

  it("refuses a state the receiver does not author", () => {
    const store = fresh();
    expect(store.setState("forge_billet", null, "molten")).toBe(false);
    expect(store.stateOf("forge_billet")).toBe("hot");
  });

  it("emits receiver:state-changed with the cause, and only on a real move", () => {
    const bus = new GameEventBus({ now: () => 0 });
    const store = new ReceiverStateStore(RECEIVER_STATES, { bus });
    expect(store.setState("chimney", "T2", "drawing_fine", "waft")).toBe(true);
    expect(store.setState("chimney", "T2", "drawing_fine", "waft")).toBe(false);
    const log = bus.logOf("receiver:state-changed");
    expect(log.length).toBe(1);
    expect(log[0].from).toBe("smoky");
    expect(log[0].to).toBe("drawing_fine");
    expect(log[0].causeSpellId).toBe("waft");
  });
});

// ---------------------------------------------------------------------------
// 6. The mechanic, end to end — the acceptance line from the plan
// ---------------------------------------------------------------------------

describe("temper on a hot billet sets it; on a cold one it does nothing", () => {
  const temper = db.spell("temper")!;

  it("resolves the hot branch as an effect and renders only that clause", () => {
    const store = fresh();
    const { result, selection, movedTo } = castWithReceiverState(db, store, {
      phrase: temper.phrase,
      offered: temper.components,
      receiverId: "forge_billet",
      screenId: "T4",
    });
    expect(selection?.state).toBe("hot");
    expect(result.outcome).toBe("effect");
    expect(result.narration).toBe("glowing hot, it hardens evenly with a hiss and holds its shape");
    // Verbatim: the rendered clause is a substring of the authored record, and
    // the OTHER branch is not shown.
    expect(outcomeOf("temper", "forge_billet")).toContain(result.narration);
    expect(result.narration).not.toContain("no_effect");
    // Setting the metal takes the heat out of it.
    expect(movedTo).toBe("cold");
    expect(store.stateOf("forge_billet", "T4")).toBe("cold");
  });

  it("resolves the SAME cast as no-effect once the billet is cold", () => {
    const store = fresh();
    const request = {
      phrase: temper.phrase,
      offered: temper.components,
      receiverId: "forge_billet",
      screenId: "T4",
    };
    castWithReceiverState(db, store, request);
    const second = castWithReceiverState(db, store, request);

    expect(second.selection?.state).toBe("cold");
    expect(second.result.outcome).toBe("no-effect"); // <-- was "effect". The bug.
    expect(second.result.narration).toBe("already cold, no_effect — there is no heat to set");
    expect(second.result.produced).toEqual([]);
    expect(second.result.unlockedScreen).toBeNull();
    expect(second.movedTo).toBeNull();
    // Still costs you the components: you tried, and trying costs.
    expect(second.result.consumed).toEqual(first(temper.components));
  });

  it("moves nothing when the cast never took", () => {
    const store = fresh();
    const { result, movedTo } = castWithReceiverState(db, store, {
      phrase: temper.phrase,
      offered: ["item_sticks"],
      receiverId: "forge_billet",
      screenId: "T4",
    });
    expect(result.outcome).toBe("wrong-components");
    expect(movedTo).toBeNull();
    expect(store.stateOf("forge_billet", "T4")).toBe("hot");
  });
});

/** The components a landed cast actually spends — the consumable ones. */
function first(components: string[]): string[] {
  return components.filter((id) => db.items.get(id)?.consumable !== false);
}

describe("ignite lights a furnace into the state glimmer can read", () => {
  const ignite = db.spell("ignite")!;
  const glimmer = db.spell("glimmer")!;

  it("chains: a cold furnace glimmers nothing, a magic-lit one dances", () => {
    const store = fresh();

    const before = castWithReceiverState(db, store, {
      phrase: glimmer.phrase,
      offered: glimmer.components,
      receiverId: "furnace",
      screenId: "T4",
    });
    expect(before.selection?.state).toBe("cold");
    expect(before.result.narration).toBe("lit by hand or long cold, none rise");

    const lit = castWithReceiverState(db, store, {
      phrase: ignite.phrase,
      offered: ignite.components,
      receiverId: "furnace",
      screenId: "T4",
    });
    expect(lit.result.outcome).toBe("effect");
    expect(lit.movedTo).toBe("magic_lit");

    const after = castWithReceiverState(db, store, {
      phrase: glimmer.phrase,
      offered: glimmer.components,
      receiverId: "furnace",
      screenId: "T4",
    });
    expect(after.selection?.state).toBe("magic_lit");
    expect(after.result.narration).toBe(
      "recently magic-lit, a few lights dance at the firebox mouth",
    );
  });

  it("re-igniting an already-lit furnace is an authored nothing", () => {
    const store = fresh();
    const request = {
      phrase: ignite.phrase,
      offered: ignite.components,
      receiverId: "furnace",
      screenId: "T4",
    };
    castWithReceiverState(db, store, request);
    const again = castWithReceiverState(db, store, request);
    expect(again.result.outcome).toBe("no-effect");
    expect(again.result.narration).toBe("already lit, nothing changes");
    // The whole point of the fix: nothing is minted off a cast that did nothing.
    expect(again.result.produced).toEqual([]);
    expect(ignite.produces.length).toBeGreaterThan(0);
  });
});

describe("a non-stateful pair is untouched by any of this", () => {
  it("resolves identically with the store in the path", () => {
    const ignite = db.spell("ignite")!;
    const { result, selection, movedTo } = castWithReceiverState(db, fresh(), {
      phrase: ignite.phrase,
      offered: ignite.components,
      receiverId: "stick",
    });
    expect(selection).toBeNull();
    expect(movedTo).toBeNull();
    expect(result.narration).toBe(outcomeOf("ignite", "stick"));
    expect(result.outcome).toBe("effect");
  });
});

// ---------------------------------------------------------------------------
// 7. Save
// ---------------------------------------------------------------------------

describe("snapshot and restore", () => {
  it("writes down only what has moved off its initial", () => {
    const store = fresh();
    expect(store.snapshot()).toEqual({});
    store.setState("forge_billet", "T4", "cold", "temper");
    expect(store.snapshot()).toEqual({ "T4/forge_billet": "cold" });
  });

  it("round-trips through a fresh store", () => {
    const a = fresh();
    a.setState("furnace", "T4", "magic_lit", "ignite");
    a.setState("chimney", null, "drawing_fine", "waft");
    const b = fresh();
    expect(b.restore(a.snapshot())).toEqual([]);
    expect(b.stateOf("furnace", "T4")).toBe("magic_lit");
    expect(b.stateOf("chimney")).toBe("drawing_fine");
  });

  it("drops and reports a saved state this build no longer authors", () => {
    const store = fresh();
    const defects = store.restore({
      "T4/forge_billet": "molten",
      "T4/weathervane": "spinning",
      "T4/furnace": "magic_lit",
    });
    expect(defects.map((d) => d.reason).sort()).toEqual(["unknown-receiver", "unknown-state"]);
    expect(store.stateOf("forge_billet", "T4")).toBe("hot");
    expect(store.stateOf("furnace", "T4")).toBe("magic_lit");
  });

  it("resets to the authored initials", () => {
    const store = fresh();
    store.setState("furnace", "T4", "magic_lit", "ignite");
    store.reset();
    expect(store.snapshot()).toEqual({});
    expect(store.stateOf("furnace", "T4")).toBe("cold");
  });
});

// ---------------------------------------------------------------------------
// 8. Mount — CastPipeline, not just the free function
// ---------------------------------------------------------------------------

/**
 * `statefulCast.ts`'s header says the mount is "to pass `ctx.branch`" into
 * `CastPipeline`, with itself as the reference. This proves the pipeline
 * actually does that — the mode5 plan's acceptance bar is that something
 * CONSTRUCTS and USES the store, not that the free function it was modelled
 * on still works in isolation.
 */
describe("CastPipeline threads receiver state through the one cast path", () => {
  function pipelineWithStore(store: ReceiverStateStore): CastPipeline {
    const deps: CastPipelineDeps = {
      magic: db,
      inventory: { applyCast: () => {} },
      knowledge: { learn: () => false, see: () => {} },
      gates: { isCleared: () => false, clear: () => {} },
      gateTable: {},
      policy: { teachOn: [], hintOn: [], clearsTableGatesOn: [], clearsLocalGateOn: [] },
      receiverStateStore: store,
    };
    return new CastPipeline(deps);
  }

  it("resolves the hot branch as an effect and moves the billet to cold", () => {
    const store = fresh();
    const temper = db.spell("temper")!;
    const report = pipelineWithStore(store).run({
      phrase: temper.phrase,
      offered: temper.components,
      receiverId: "forge_billet",
      screenId: "T4",
    });
    expect(report.result.outcome).toBe("effect");
    expect(report.result.narration).toBe(
      "glowing hot, it hardens evenly with a hiss and holds its shape",
    );
    expect(report.movedTo).toBe("cold");
    expect(store.stateOf("forge_billet", "T4")).toBe("cold");
  });

  it("resolves the SAME cast as no-effect once the billet is cold — through the pipeline", () => {
    const store = fresh();
    const temper = db.spell("temper")!;
    const request = {
      phrase: temper.phrase,
      offered: temper.components,
      receiverId: "forge_billet",
      screenId: "T4",
    };
    const pipeline = pipelineWithStore(store);
    pipeline.run(request);
    const second = pipeline.run(request);
    expect(second.result.outcome).toBe("no-effect"); // <-- was "effect" pre-mount.
    expect(second.result.narration).toBe("already cold, no_effect — there is no heat to set");
    expect(second.result.produced).toEqual([]);
    expect(second.movedTo).toBeNull();
  });

  it("with no store, behaves exactly as before — no branch, no movedTo", () => {
    const temper = db.spell("temper")!;
    const deps: CastPipelineDeps = {
      magic: db,
      inventory: { applyCast: () => {} },
      knowledge: { learn: () => false, see: () => {} },
      gates: { isCleared: () => false, clear: () => {} },
      gateTable: {},
      policy: { teachOn: [], hintOn: [], clearsTableGatesOn: [], clearsLocalGateOn: [] },
    };
    const report = new CastPipeline(deps).run({
      phrase: temper.phrase,
      offered: temper.components,
      receiverId: "forge_billet",
      screenId: "T4",
    });
    expect(report.result.outcome).toBe("effect");
    expect(report.movedTo).toBeNull();
  });
});

describe("the receiver-state layer is mounted, not shelved", () => {
  const readText = (p: string) => fs.readFileSync(path.join(root, p), "utf8");
  const collectScene = readText("src/scenes/CollectScene.ts");
  const castPipelineSrc = readText("src/world/CastPipeline.ts");
  const modesSource = readText("src/mode/modes.ts");

  it("CollectScene constructs a ReceiverStateStore and hands it to CastPipeline", () => {
    expect(collectScene).toContain("new ReceiverStateStore(");
    expect(collectScene).toContain("receiverStateStore:");
  });

  it("CollectScene registers ReceiverStatesSlice so state round-trips through save", () => {
    expect(collectScene).toContain("new ReceiverStatesSlice(");
  });

  it("CastPipeline selects the branch before resolving, not after", () => {
    // The header's own rule, checked in the file that must honour it: the
    // branch selection call has to appear before the resolveCast call it
    // feeds, not merely exist somewhere in the file.
    const selectAt = castPipelineSrc.indexOf(".select(");
    const resolveAt = castPipelineSrc.indexOf("resolveCast(");
    expect(selectAt).toBeGreaterThan(-1);
    expect(selectAt).toBeLessThan(resolveAt);
  });

  it("mode5 is the only descriptor with receiverStates true", () => {
    const mode5Block = /export const MODE5[\s\S]*?\n};/.exec(modesSource)?.[0] ?? "";
    expect(mode5Block).toMatch(/receiverStates:\s*true/);

    for (const id of ["DAYLIFE", "COLLECT", "DISCOVER_HOME"]) {
      const block = new RegExp(`export const ${id}[\\s\\S]*?\\n};`).exec(modesSource)?.[0] ?? "";
      expect(block).not.toMatch(/receiverStates:\s*true/);
    }
  });
});
