/**
 * Wave 2 Track D — spell VFX.
 *
 * Six things are pinned here, in the order they can break the build:
 *
 *  1. THE TABLE IS DATA, AND IT POINTS AT REAL SPELLS. No spell id appears in
 *     any `.ts` file in this folder; the authored table loads with zero defects
 *     against the SHIPPED records in `public/content/magic.json`, not just
 *     against itself; every approved spell has a row; and a brand-new spell
 *     becomes visible by adding a row, proven by playing a cue for a spell that
 *     exists nowhere in the game with no code change at all. The spell list
 *     every test below iterates comes from `magic.json`, so a table validated
 *     against its own contents is not possible here.
 *
 *  2. DISPOSAL. Phaser 4 filters are not auto-released on scene shutdown, so
 *     25 attach/detach cycles must leave the fake backend's live-handle
 *     registry at exactly zero, `detach()` must be safe twice, and a detached
 *     system must ignore every further event. The REAL backend's add/remove
 *     accounting is proven separately in `PhaserVfxBackend.test.ts` against a
 *     counting stub scene — this file proves the system's half.
 *
 *  3. NO-EFFECT IS NEVER SILENT OR SHAMED. Every approved spell has both an
 *     effect row and a no-effect row, and no-effect never resolves to `kind:
 *     "none"`. The loader REFUSES `COLOR.danger` and an error-ish token on any
 *     landed cast, so a no-effect cue can never read as a failure — that half is
 *     enforced, not asserted. What USED to also be required — no-effect
 *     identical to effect in kind/tone/duration/shape, differing only by a
 *     theme-derived colour so `cueWeight` matched within 5% — was relaxed
 *     2026-08-22 (Roc): a spell's VFX firing at all is the signal a cast
 *     happened, and effect no longer has to be shape-mirrored into no-effect to
 *     stay in parity. `cueWeight`/`neutralFor` remain correct, unit-tested pure
 *     functions for any pair still authored that way (`breath`, `fetch`,
 *     `weigh`) — see the synthetic-pair tests below for why they still matter
 *     even though no spell is REQUIRED to use them.
 *
 *  4. COLOUR COMES FROM THE THEME. Every authored `colorKey` resolves through
 *     `ui/theme.ts`, which is contrast-checked, and every `.ts` file in this
 *     folder is grepped for a hex literal — the renderer cannot introduce a
 *     colour the theme has not checked either.
 *
 *  5. NO ROW IS DEAD CONTENT. `findUnreachableRules` only sees shadowing inside
 *     the table. Eight rows were unreachable for a reason it cannot see: their
 *     event type is emitted by nobody, or by a class no VFX-bearing scene
 *     builds. So the emitter graph is walked out of the real source, orphan rows
 *     fail the build, and the ones still waiting on Wave 2 Track B are declared
 *     in a list that fails both when it grows and when it goes stale.
 *
 *  6. THE ARITHMETIC IS PURE. `cueParam`, `channelScaleMatrix`, `colorLuminance`
 *     and `cueWeight` live in `CueTable.ts` and are unit-tested directly, not
 *     through a stub scene.
 */

import { describe, expect, it, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { COLOR } from "../../ui/theme";
import { GameEventBus, type GameEvent } from "../../world/events/GameEvents";
import {
  ALL_EVENT_TYPES,
  AUTHORED_CUES,
  CUE_PARAM_DEFAULTS,
  FAILURE_STYLED_TYPES,
  MAX_CUE_MS,
  NEUTRAL_COLOR_KEYS,
  NEUTRAL_WEIGHT_FLOOR,
  channelScaleMatrix,
  clamp01,
  colorLuminance,
  cueColor,
  cueFor,
  cueParam,
  cueWeight,
  findUnreachableRules,
  isThemeColorKey,
  loadAuthoredCues,
  loadCueTable,
  neutralFor,
  type CueRule,
} from "./CueTable";
import { FakeVfxBackend, fakeVfxLiveHandles, resetFakeVfxRegistry } from "./FakeVfxBackend";
import { VfxSystem, type VfxDiagnostic, type VfxSystemOptions } from "./VfxSystem";
import { isAnchoredKind, type VfxCue } from "./VfxBackend";

const here = path.dirname(fileURLToPath(import.meta.url));
const source = (file: string) => fs.readFileSync(path.join(here, file), "utf8");
/** Every non-test `.ts` in this folder — what the greps below hold to account. */
const shippedFiles = () =>
  fs.readdirSync(here).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"));

/**
 * The spell vocabulary, READ FROM THE SHIPPED RECORDS.
 *
 * Not derived from `cues.json`. The first draft of this test took its spell
 * list from the table, so the table was validated against itself and three rows
 * naming spells that do not exist (`still`, `cool`, `mist` — `still` is the
 * codebase's standing example of a REJECTED spell) passed every assertion. The
 * list has to come from the content or it proves nothing.
 */
const MAGIC_JSON = path.resolve(here, "../../../public/content/magic.json");
const APPROVED_SPELL_IDS: ReadonlySet<string> = new Set(
  (JSON.parse(fs.readFileSync(MAGIC_JSON, "utf8")) as { spell_id: string; status: string }[])
    .filter((s) => s.status === "approved")
    .map((s) => s.spell_id),
);
const APPROVED = [...APPROVED_SPELL_IDS].sort();

// ---------------------------------------------------------------------------
// Event builders — the payloads the bus actually carries
// ---------------------------------------------------------------------------

const cast = (spellId: string, outcome: "effect" | "no-effect"): GameEvent => ({
  type: "cast:resolved",
  spellId,
  receiverId: "river_stone",
  screenId: "F2",
  outcome,
  consumed: [],
  produced: [],
  narration: "authored prose",
});

const rejected = (): GameEvent => ({
  type: "cast:rejected",
  spellId: "ignite",
  receiverId: "river_stone",
  screenId: "F2",
  outcome: "wrong-components",
  missing: ["item_sticks"],
  extra: [],
});

const screenChange = (to: string): GameEvent => ({
  type: "screen:changed",
  from: "F2",
  to,
  day: 1,
  timeBlock: "morning",
  movesLeft: 5,
});

const saveWritten = (): GameEvent => ({
  type: "save:written",
  slot: "auto",
  version: 1,
  sliceIds: ["gates"],
});

/** A bus + system + fake backend, wired and attached. */
function rig(options: Partial<VfxSystemOptions> = {}) {
  const bus = new GameEventBus({ now: () => 0 });
  const backend = new FakeVfxBackend();
  const diagnostics: VfxDiagnostic[] = [];
  const system = new VfxSystem({
    ...options,
    bus,
    backend,
    onDiagnostic: (d) => diagnostics.push(d),
  }).attach();
  return { bus, backend, system, diagnostics };
}

beforeEach(() => resetFakeVfxRegistry());

// ---------------------------------------------------------------------------
// 1. The cue table is data
// ---------------------------------------------------------------------------

describe("the cue table is data, not branches", () => {
  const spellIds = APPROVED;

  it("loads cues.json with no defects", () => {
    expect(AUTHORED_CUES.defects).toEqual([]);
    expect(AUTHORED_CUES.rules.length).toBeGreaterThan(0);
  });

  it("loads cues.json with no defects against the SHIPPED spell records", () => {
    // The strict load. A row naming a spell that is not in magic.json is an
    // `unknown-spell` defect, so a cut or renamed spell fails the build instead
    // of leaving a cue that can never fire.
    const strict = loadAuthoredCues(APPROVED_SPELL_IDS);
    expect(strict.defects).toEqual([]);
    expect(strict.rules.length).toBe(AUTHORED_CUES.rules.length);
  });

  it("refuses a row naming a spell the game does not ship", () => {
    const table = loadCueTable(
      {
        default: AUTHORED_CUES.fallback,
        rules: [
          {
            id: "cue.cast.effect.ghost",
            when: { type: "cast:resolved", match: { spellId: "not_a_spell", outcome: "effect" } },
            cue: { kind: "glow", tone: "quiet", durationMs: 300, colorKey: "gold" },
          },
        ],
      },
      { spellIds: APPROVED_SPELL_IDS },
    );
    expect(table.rules).toEqual([]);
    expect(table.defects[0]?.reason).toBe("unknown-spell");
  });

  it("gives every approved spell its own cast:resolved rows", () => {
    // Coverage as a failing test, not as something a reviewer finds by diffing
    // two files. Twelve of sixteen spells once fell through to one generic glow.
    const rowsFor = (outcome: string) =>
      new Set(
        AUTHORED_CUES.rules
          .filter((r) => r.type === "cast:resolved" && r.match.outcome === outcome)
          .map((r) => r.match.spellId)
          .filter((v): v is string => typeof v === "string"),
      );
    expect([...rowsFor("effect")].sort()).toEqual(APPROVED);
    expect([...rowsFor("no-effect")].sort()).toEqual(APPROVED);
  });

  it("names spells in the table and nowhere else", () => {
    // The rule: a new spell is a row in cues.json, never a code branch. Checked
    // by grep, because that is the only thing that survives parallel sessions.
    // Comments are stripped first — the headers discuss the anti-pattern they
    // exist to forbid, and quoting it must stay legal.
    expect(spellIds.length).toBeGreaterThan(3);
    const strip = (src: string) =>
      src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
    const files = shippedFiles();
    expect(files.length).toBeGreaterThan(2);
    const offenders: string[] = [];
    for (const file of files) {
      const code = strip(source(file));
      for (const id of spellIds) {
        if (code.includes(`"${id}"`) || code.includes(`'${id}'`)) offenders.push(`${file}: ${id}`);
      }
      // The banned shape is `if (spellId === "ignite")` — a spell id compared
      // to a LITERAL. Testing a spell id against an injected vocabulary set is
      // not that, and is how the loader refuses a row naming a cut spell; the
      // quoted-id grep above is what stops a literal sneaking in either way.
      if (/\bspellId\s*===\s*["'`]/.test(code)) offenders.push(`${file}: branches on a spell id`);
      if (/\bswitch\s*\(\s*[a-zA-Z.]*spellId/.test(code)) offenders.push(`${file}: switch on spellId`);
    }
    expect(offenders).toEqual([]);
  });

  it("has no row that can never fire", () => {
    // First match wins, so a general row above a specific one silently kills it.
    expect(findUnreachableRules(AUTHORED_CUES)).toEqual([]);
  });

  it("gives a new spell a cue with no code change", () => {
    // The whole claim, executed: a spell that exists nowhere in the game gets a
    // working cue purely by adding a row.
    const table = loadCueTable({
      default: AUTHORED_CUES.fallback,
      rules: [
        {
          id: "cue.cast.effect.invented",
          when: { type: "cast:resolved", match: { spellId: "kindle_moss", outcome: "effect" } },
          cue: { kind: "glow", tone: "arcane", durationMs: 700, colorKey: "gold" },
        },
      ],
    });
    expect(table.defects).toEqual([]);
    const { bus, backend, system } = rig({ table });
    bus.emit(cast("kindle_moss", "effect"));
    expect(backend.plays.at(-1)?.cue.id).toBe("cue.cast.effect.invented");
    system.detach();
  });

  it("routes each approved spell to its own row, never to the generic one", () => {
    const { bus, backend, system } = rig();
    for (const id of spellIds) bus.emit(cast(id, "effect"));
    const ids = backend.plays.map((p) => p.cue.id);
    expect(ids).toHaveLength(spellIds.length);
    expect(new Set(ids).size).toBe(spellIds.length);
    expect(ids).not.toContain("cue.cast.effect.any");
    system.detach();
  });
});

// ---------------------------------------------------------------------------
// 2. Colour comes from the theme
// ---------------------------------------------------------------------------

describe("colour comes from ui/theme.ts, never from a literal", () => {
  const withColor = AUTHORED_CUES.rules.filter((r) => r.cue.colorKey !== undefined);

  it("resolves every authored colour key through the theme", () => {
    expect(withColor.length).toBeGreaterThan(0);
    for (const rule of withColor) {
      expect(isThemeColorKey(rule.cue.colorKey!)).toBe(true);
      const resolved = cueColor(rule.cue.colorKey);
      expect(typeof resolved).toBe("number");
      expect(resolved).toBeGreaterThanOrEqual(0);
    }
  });

  it("contains no hex colour literal in any shipped file in this folder", () => {
    // THE ONE THIS FILE USED TO MISS. The colour test only ever inspected
    // cues.json's colorKeys, so `graphics.fillStyle(0xffffff, 1)` sat in the
    // renderer — a colour the theme does not carry — under a header claiming
    // there was not one hex literal in the file. Prose is not a check; this is.
    // Written to catch `0x...` outright, so nobody has to argue about whether a
    // given mask is really a colour: use decimal for masks.
    const strip = (src: string) =>
      src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
    const offenders: string[] = [];
    for (const file of shippedFiles()) {
      const code = strip(source(file));
      for (const match of code.match(/0x[0-9a-fA-F]+/g) ?? []) offenders.push(`${file}: ${match}`);
      for (const match of code.match(/#[0-9a-fA-F]{3,8}\b/g) ?? []) offenders.push(`${file}: ${match}`);
    }
    expect(offenders).toEqual([]);
  });

  it("resolves both the numeric and the CSS form of a theme colour", () => {
    expect(cueColor("goldNum")).toBe(COLOR.goldNum);
    expect(cueColor("gold")).toBe(COLOR.goldNum);
    expect(cueColor("nope")).toBeNull();
    expect(cueColor(undefined)).toBeNull();
  });

  it("refuses a row that names a colour the theme does not carry", () => {
    const table = loadCueTable({
      default: AUTHORED_CUES.fallback,
      rules: [
        {
          id: "cue.literal",
          when: { type: "item:acquired", match: {} },
          cue: { kind: "glow", tone: "quiet", durationMs: 300, colorKey: "#ff0000" },
        },
      ],
    });
    expect(table.rules).toEqual([]);
    expect(table.defects[0]?.reason).toBe("unknown-color-key");
  });

  it("refuses a cue that outlives the moment, or a visible one with no end", () => {
    const bad = loadCueTable({
      default: AUTHORED_CUES.fallback,
      rules: [
        {
          id: "cue.forever",
          when: { type: "item:acquired", match: {} },
          cue: { kind: "glow", tone: "quiet", durationMs: MAX_CUE_MS + 1 },
        },
        {
          id: "cue.endless",
          when: { type: "item:consumed", match: {} },
          cue: { kind: "glow", tone: "quiet", durationMs: 0 },
        },
      ],
    });
    expect(bad.rules).toEqual([]);
    expect(bad.defects.map((d) => d.reason)).toEqual(["bad-duration", "bad-duration"]);
  });

  it("refuses a row matching a field no event carries", () => {
    const table = loadCueTable({
      default: AUTHORED_CUES.fallback,
      rules: [
        {
          id: "cue.typo",
          when: { type: "cast:resolved", match: { spelId: "ignite" } },
          cue: { kind: "glow", tone: "quiet", durationMs: 300 },
        },
      ],
    });
    expect(table.defects[0]?.reason).toBe("unknown-match-field");
  });
});

// ---------------------------------------------------------------------------
// 3. No-effect is an honest result
// ---------------------------------------------------------------------------

describe("a no-effect cast is never silent and never shamed", () => {
  const spellIds = APPROVED;
  const bus = new GameEventBus({ now: () => 0 });
  const resolve = (spellId: string, outcome: "effect" | "no-effect"): VfxCue =>
    cueFor(AUTHORED_CUES, bus.emit(cast(spellId, outcome)));

  it("plays something — never nothing at all", () => {
    for (const id of [...spellIds, "a_spell_with_no_row"]) {
      const cue = resolve(id, "no-effect");
      expect(cue.kind).not.toBe("none");
      expect(cue.durationMs).toBeGreaterThan(0);
    }
  });

  it("never shames a landed cast, effect or no-effect — no danger colour, no error-ish token in either", () => {
    // Kept unconditional even though shape/weight parity is no longer required
    // (2026-08-22, see the file header): a spell being visually different from
    // its own no-effect twin is fine, a no-effect cue reading as a FAILURE is
    // not — that is what `FAILURE_STYLED_TYPES` and the loader's errorish check
    // still refuse, for every row, regardless of outcome.
    for (const id of [...spellIds, "a_spell_with_no_row"]) {
      for (const outcome of ["effect", "no-effect"] as const) {
        const cue = resolve(id, outcome);
        expect(cue.colorKey).not.toBe("danger");
      }
    }
  });

  it("every authored colorKey — effect or no-effect — is still a real theme key", () => {
    // The rule that was relaxed is SHAPE/WEIGHT parity between the twins, not
    // "colour comes from the theme" — that constraint is unconditional and the
    // loader refuses a raw hex regardless of which outcome authored it.
    for (const id of spellIds) {
      for (const outcome of ["effect", "no-effect"] as const) {
        const cue = resolve(id, outcome);
        if (cue.colorKey) expect(isThemeColorKey(cue.colorKey)).toBe(true);
      }
    }
  });

  it("a pair CAN still be weight-matched when authored that way (breath, fetch, weigh)", () => {
    // Not a blanket requirement any more — see the file header — but where a
    // pair uses `neutralFor`'s derived colour, the arithmetic that makes that
    // choice correct is still real and still worth proving against real rows.
    let checked = 0;
    for (const id of ["breath", "fetch", "weigh"]) {
      if (!spellIds.includes(id)) continue;
      const effect = resolve(id, "effect");
      const none = resolve(id, "no-effect");
      if (none.colorKey !== neutralFor(effect)) continue;
      checked++;
      expect(NEUTRAL_COLOR_KEYS).toContain(none.colorKey);
      const ratio = cueWeight(none) / cueWeight(effect);
      expect(ratio).toBeGreaterThanOrEqual(NEUTRAL_WEIGHT_FLOOR);
    }
    expect(checked).toBeGreaterThan(0);
  });

  /**
   * `weigh` was the last authored spell on a `TUNABLE_PARAM` kind (`tint`) —
   * moved to `suspend` 2026-08-22 (the VFX prototype batch), so nothing in the
   * shipped table exercises the `amount`-compensation regression below anymore.
   * The two tests that used to prove it against real content now prove it
   * against a synthetic pair carrying weigh's own former numbers instead —
   * the regression is about `tint`'s arithmetic, not about which spell happens
   * to author it, and `tint` is still a real, playable kind.
   */
  const SYNTHETIC_TINT_EFFECT: VfxCue = {
    id: "cue.synthetic.tint.effect",
    kind: "tint",
    tone: "cold",
    durationMs: 900,
    colorKey: "dusk",
    params: { amount: 0.25 },
  };
  const SYNTHETIC_TINT_NONE: VfxCue = { ...SYNTHETIC_TINT_EFFECT, colorKey: "muted", params: { amount: 0.2061 } };

  it("a tint pair still lands with exact weight parity, even though no shipped spell authors one", () => {
    const ratio = cueWeight(SYNTHETIC_TINT_NONE) / cueWeight(SYNTHETIC_TINT_EFFECT);
    expect(ratio).toBeGreaterThanOrEqual(NEUTRAL_WEIGHT_FLOOR);
    expect(ratio).toBeCloseTo(1, 2);
  });

  it("would fail if the no-effect tints went back to the brightest neutral", () => {
    // The regression, stated as the number it was. Without this, reverting
    // `muted` to `ink` passes every other assertion in this file.
    const asItWas: VfxCue = { ...SYNTHETIC_TINT_EFFECT, colorKey: "ink" };
    expect(cueWeight(asItWas) / cueWeight(SYNTHETIC_TINT_EFFECT)).toBeLessThan(0.5);
    expect(cueWeight(SYNTHETIC_TINT_NONE) / cueWeight(SYNTHETIC_TINT_EFFECT)).toBeGreaterThan(0.99);
  });

  it("anchors a no-effect cue exactly where the effect cue would have played", () => {
    // Proven through the backend, not just off the table: same anchor, same
    // started-or-not. The player cannot tell from WHERE the cue is whether the
    // world changed. `kind` is NOT asserted equal here any more (2026-08-22) —
    // a pair is now free to use different kinds (`scratch`'s effect is `burst`,
    // its no-effect stays the simpler `particles`); see the file header.
    for (const id of spellIds) {
      const at = { x: 321, y: 123 };
      const { bus: b, backend, system } = rig({ anchorFor: () => at });
      b.emit(cast(id, "effect"));
      b.emit(cast(id, "no-effect"));
      const [a, c] = backend.plays.slice(-2);
      expect(c.anchor).toEqual(a.anchor);
      expect(c.started).toBe(a.started);
      system.detach();
    }
  });

  it("stays in the neutral palette and carries no error-ish token", () => {
    const errorish = /\b(error|fail|failed|failure|shake|flash|red|alarm|invalid|negative|wrong|bad)\b/i;
    for (const id of [...spellIds, "a_spell_with_no_row"]) {
      const cue = resolve(id, "no-effect");
      expect(cue.colorKey).not.toBe("danger");
      expect(errorish.test(JSON.stringify(cue))).toBe(false);
    }
  });

  it("has no failure tone available to reach for in the first place", () => {
    // VfxTone has no error member by design, so the loader rejects one.
    const table = loadCueTable({
      default: AUTHORED_CUES.fallback,
      rules: [
        {
          id: "cue.tone",
          when: { type: "cast:resolved", match: { outcome: "no-effect" } },
          cue: { kind: "tint", tone: "failure", durationMs: 300 },
        },
      ],
    });
    expect(table.defects[0]?.reason).toBe("unknown-tone");
  });

  it("refuses a landed cast styled with COLOR.danger", () => {
    const table = loadCueTable({
      default: AUTHORED_CUES.fallback,
      rules: [
        {
          id: "cue.scold",
          when: { type: "cast:resolved", match: { outcome: "no-effect" } },
          cue: { kind: "tint", tone: "cold", durationMs: 300, colorKey: "danger" },
        },
      ],
    });
    expect(table.rules).toEqual([]);
    expect(table.defects[0]?.reason).toBe("failure-styling");
  });

  it("refuses a landed cast whose id or params say it went wrong", () => {
    const table = loadCueTable({
      default: AUTHORED_CUES.fallback,
      rules: [
        {
          id: "cue.cast.effect.any",
          when: { type: "cast:resolved", match: { outcome: "effect" } },
          cue: { kind: "tint", tone: "cold", durationMs: 300, params: { shake: 4 } },
        },
      ],
    });
    expect(table.rules).toEqual([]);
    expect(table.defects[0]?.reason).toBe("failure-styling");
  });

  it("keeps the danger colour for the two never-happened events only", () => {
    expect([...FAILURE_STYLED_TYPES].sort()).toEqual(["cast:rejected", "gate:blocked"]);
    const dangerRows = AUTHORED_CUES.rules.filter((r) => r.cue.colorKey === "danger");
    for (const row of dangerRows) expect(FAILURE_STYLED_TYPES.has(row.type)).toBe(true);
  });

  it("gives a rejected cast a quiet nudge, not a reprimand", () => {
    // The player is not charged for a typo, and is not told off for one either.
    const { bus, backend, system } = rig();
    bus.emit(rejected());
    const cue = backend.plays.at(-1)!.cue;
    expect(cue.colorKey).toBe("muted");
    expect(cue.tone).toBe("quiet");
    system.detach();
  });
});

// ---------------------------------------------------------------------------
// 4. Disposal
// ---------------------------------------------------------------------------

describe("disposal — Phaser 4 will not release a filter for us", () => {
  it("leaves zero retained handles after 25 attach/detach cycles", () => {
    // The leak this whole track is guarding against: one unreleased filter per
    // cast, invisible until a long walk composites dozens. The registry is
    // module-level so accumulation ACROSS cycles is visible, not just within.
    let totalStarted = 0;
    for (let cycle = 0; cycle < 25; cycle++) {
      const bus = new GameEventBus({ now: () => 0 });
      const backend = new FakeVfxBackend();
      const system = new VfxSystem({ bus, backend }).attach();
      for (let i = 0; i < 5; i++) {
        bus.emit(cast("ignite", "effect"));
        bus.emit(cast("glimmer", "no-effect"));
        bus.emit(rejected());
      }
      expect(fakeVfxLiveHandles()).toBeGreaterThan(0);
      totalStarted += backend.plays.filter((p) => p.started).length;
      system.detach();
      expect(fakeVfxLiveHandles()).toBe(0);
      expect(backend.liveCount).toBe(0);
      expect(system.activeCount).toBe(0);
    }
    expect(totalStarted).toBe(25 * 15);
    expect(fakeVfxLiveHandles()).toBe(0);
  });

  it("detaches the backend exactly once and survives a second detach", () => {
    const { backend, system } = rig();
    system.detach();
    system.detach();
    expect(backend.detachCalls).toBe(1);
    expect(backend.attached).toBe(false);
  });

  it("releases through the backend once, not twice", () => {
    // `detach()` used to call `stopAllCues()` — which calls `backend.stopAll()`
    // — and then `backend.detach()`, which calls it again. Harmless in both
    // backends shipped here, and exactly the shape that hides a double-free in
    // one whose `stopAll` is not idempotent. `detachCalls` was pinned; this
    // was not, so nothing would have noticed.
    const { bus, backend, system } = rig();
    bus.emit(cast("ignite", "effect"));
    expect(backend.stopAllCalls).toBe(0);
    system.detach();
    expect(backend.stopAllCalls).toBe(1); // the one inside `backend.detach()`
    expect(backend.liveCount).toBe(0);
    expect(fakeVfxLiveHandles()).toBe(0);
  });

  it("still releases through stopAllCues when nothing is detaching", () => {
    const { bus, backend, system } = rig();
    bus.emit(cast("ignite", "effect"));
    system.stopAllCues();
    expect(backend.stopAllCalls).toBe(1);
    expect(system.activeCount).toBe(0);
    expect(backend.attached).toBe(true);
    system.detach();
  });

  it("ignores every event after detach", () => {
    const { bus, backend, system } = rig();
    bus.emit(cast("ignite", "effect"));
    const before = backend.plays.length;
    system.detach();
    for (let i = 0; i < 10; i++) bus.emit(cast("ignite", "effect"));
    expect(backend.plays.length).toBe(before);
    expect(fakeVfxLiveHandles()).toBe(0);
  });

  it("cannot be brought back to life by re-attaching", () => {
    const { bus, backend, system } = rig();
    system.detach();
    system.attach();
    bus.emit(cast("ignite", "effect"));
    expect(backend.plays).toEqual([]);
    expect(system.attached).toBe(false);
  });

  it("returns an inert handle from a detached backend, never null", () => {
    const backend = new FakeVfxBackend();
    backend.detach();
    const handle = backend.play(
      { id: "cue.x", kind: "glow", tone: "quiet", durationMs: 500 },
      { x: 0, y: 0 },
    );
    expect(handle.active).toBe(false);
    handle.stop();
    handle.stop();
    expect(fakeVfxLiveHandles()).toBe(0);
  });

  it("releases a cue when its own duration runs out", () => {
    const { bus, backend, system } = rig();
    bus.emit(cast("ignite", "effect"));
    expect(system.activeCount).toBe(1);
    backend.advance(1300); // ignite's authored durationMs is 1200 (a sprite loop)
    expect(system.activeCount).toBe(0);
    expect(fakeVfxLiveHandles()).toBe(0);
    system.detach();
  });

  it("stops everything playing when the screen changes", () => {
    // A cue is anchored to a receiver on a screen. When the screen goes the
    // anchor is meaningless — and this is the cheapest guard against a long
    // walk accumulating cues it never releases.
    const { bus, backend, system } = rig();
    bus.emit(cast("ignite", "effect"));
    bus.emit(cast("glimmer", "effect"));
    expect(system.activeCount).toBe(2);
    bus.emit(screenChange("F4"));
    expect(system.activeCount).toBe(0);
    expect(backend.liveCount).toBe(0);
    system.detach();
  });

  it("keeps cues across a screen change when told to", () => {
    const { bus, system } = rig({ stopOnScreenChange: false });
    bus.emit(cast("ignite", "effect"));
    bus.emit(screenChange("F4"));
    expect(system.activeCount).toBe(1);
    system.detach();
  });
});

// ---------------------------------------------------------------------------
// 5. Fallback, anchors and diagnostics
// ---------------------------------------------------------------------------

describe("an event with no row falls back quietly", () => {
  it("plays the neutral fallback and counts it, alarming nobody", () => {
    const { bus, backend, system, diagnostics } = rig();
    bus.emit(saveWritten());
    expect(backend.plays.at(-1)?.cue).toBe(AUTHORED_CUES.fallback);
    expect(backend.plays.at(-1)?.started).toBe(false);
    expect(system.stats.unmatched).toBe(1);
    // NOT also counted inert. The fallback is `kind: "none"`, so the handle is
    // inactive and the old code incremented both — one event, two counters,
    // disagreeing with the single label the diagnostic picked.
    expect(system.stats.inert).toBe(0);
    expect(diagnostics.map((d) => d.kind)).toEqual(["unmatched"]);
    system.detach();
  });

  it("counts each event under exactly one label, matching its diagnostic", () => {
    const inertTable = loadCueTable({
      default: AUTHORED_CUES.fallback,
      rules: [
        {
          id: "cue.authored.as.nothing",
          when: { type: "save:written", match: {} },
          cue: { kind: "none", tone: "quiet", durationMs: 0 },
        },
      ],
    });
    const { bus, system, diagnostics } = rig({ table: inertTable });
    bus.emit(cast("ignite", "effect")); // no row in this table -> unmatched
    bus.emit(saveWritten()); // matched, and authored as nothing -> inert
    bus.emit(saveWritten());

    const { played, inert, unmatched } = system.stats;
    expect(played + inert + unmatched).toBe(diagnostics.length);
    expect({ played, inert, unmatched }).toEqual({ played: 0, inert: 2, unmatched: 1 });
    expect(diagnostics.filter((d) => d.kind === "inert")).toHaveLength(inert);
    expect(diagnostics.filter((d) => d.kind === "unmatched")).toHaveLength(unmatched);
    system.detach();
  });

  it("sums its counters to the number of events it saw, on the real table", () => {
    const { bus, system, diagnostics } = rig();
    bus.emit(cast("ignite", "effect"));
    bus.emit(cast("ignite", "no-effect"));
    bus.emit(rejected());
    bus.emit(saveWritten());
    const { played, inert, unmatched } = system.stats;
    expect(played + inert + unmatched).toBe(4);
    expect(diagnostics).toHaveLength(4);
    system.detach();
  });

  it("has a fallback that is neutral, inert and cheap", () => {
    expect(AUTHORED_CUES.fallback.kind).toBe("none");
    expect(AUTHORED_CUES.fallback.tone).toBe("quiet");
    expect(AUTHORED_CUES.fallback.durationMs).toBe(0);
  });

  it("never uses an alarming word in its diagnostics", () => {
    const { bus, diagnostics, system } = rig();
    bus.emit(cast("ignite", "effect"));
    bus.emit(saveWritten());
    for (const d of diagnostics) {
      expect(["played", "inert", "unmatched"]).toContain(d.kind);
    }
    system.detach();
  });

  it("writes nothing to the console", () => {
    // A missing cue is an authoring gap, not a fault. A red console line here
    // teaches everyone to ignore red console lines.
    const strip = (src: string) =>
      src.replace(/\/\*[\s\S]*?\*\//g, "").replace(/(^|[^:])\/\/.*$/gm, "$1");
    for (const file of fs.readdirSync(here).filter((f) => f.endsWith(".ts") && !f.endsWith(".test.ts"))) {
      expect(strip(source(file))).not.toContain("console.");
    }
  });
});

describe("anchors", () => {
  it("plays at the resolved anchor, and at the default when there is none", () => {
    const { bus, backend, system } = rig({
      anchorFor: (e) => (e.type === "cast:resolved" ? { x: 120, y: 80, radius: 24 } : null),
      defaultAnchor: { x: 640, y: 360 },
    });
    bus.emit(cast("ignite", "effect"));
    expect(backend.plays.at(-1)?.anchor).toEqual({ x: 120, y: 80, radius: 24 });
    bus.emit(rejected());
    expect(backend.plays.at(-1)?.anchor).toEqual({ x: 640, y: 360 });
    system.detach();
  });

  it("moves a particle cue mid-play, and by contract not a camera-filter one", () => {
    // `isAnchoredKind` is the contract, and it is asserted on the HANDLE rather
    // than through a `VfxSystem.reanchor()` wrapper. That wrapper existed
    // because backdrops pan under a running cue, but the panning scenes mount no
    // VfxSystem and the modal that does mount one does not pan, so nothing in
    // the game ever called it and two tests covered a method the player could
    // not reach. The contract survives; the dead wrapper does not.
    const bus = new GameEventBus({ now: () => 0 });
    const backend = new FakeVfxBackend();
    const kindOf = (id: string) => cueFor(AUTHORED_CUES, bus.emit(cast(id, "effect")));
    // Chosen from the table by kind rather than by name — no spell id here.
    const anchored = APPROVED.find((id) => isAnchoredKind(kindOf(id).kind))!;
    expect(anchored).toBeDefined();
    // No approved SPELL authors a screen-wide kind any more (`weigh` moved
    // `tint` -> `suspend` in the 2026-08-22 VFX prototype batch) — every spell
    // is anchored now. A screen-wide cue is still real and shipped, just on a
    // non-spell row (`gate:blocked`), so the contract is proven against that.
    const screenWideRule = AUTHORED_CUES.rules.find((r) => !isAnchoredKind(r.cue.kind));
    expect(screenWideRule).toBeDefined();
    const screenWideCue = screenWideRule!.cue;

    const particles = backend.play(kindOf(anchored), { x: 100, y: 50 });
    particles.moveTo({ x: 140, y: 50 });
    const camera = backend.play(screenWideCue, { x: 100, y: 50 });
    camera.moveTo({ x: 140, y: 50 });

    expect(backend.startedHandles.at(-2)).toMatchObject({
      anchored: true,
      moves: 1,
      anchor: { x: 140, y: 50 },
    });
    // The fake used to accept every move, which hid the fact that the real
    // backend re-anchors particles only.
    expect(backend.startedHandles.at(-1)).toMatchObject({
      anchored: false,
      moves: 0,
      anchor: { x: 100, y: 50 },
    });
    backend.detach();
  });
});

// ---------------------------------------------------------------------------
// 6. It is actually mounted in the running game
// ---------------------------------------------------------------------------

describe("the VFX layer is mounted, not shelved", () => {
  // The whole dimension was invisible in the running game once: the backend and
  // the system referenced only each other and their own test, no scene ever
  // built one, and nothing called the `detach()` that every paragraph in this
  // folder exists to justify. A player casting saw no particles at all. So the
  // wiring is grepped, the same way `DialogueSystem.test.ts` greps for its own.
  const root = path.resolve(here, "../../..");
  const scene = fs.readFileSync(path.join(root, "src", "scenes", "CastScene.ts"), "utf8");

  it("CastScene builds a real backend and attaches the system to its bus", () => {
    expect(scene).toContain("new PhaserVfxBackend(");
    expect(scene).toContain("new VfxSystem(");
    expect(scene).toContain("bus: this.bus");
    expect(scene).toMatch(/\.attach\(\)/);
  });

  it("CastScene releases it on scene shutdown", () => {
    // MANDATORY, not hygiene: Phaser 4 will not reclaim a filter controller
    // when the scene stops. Pinned to `shutdown` specifically — hanging it off
    // the scene's own close path would miss every other way a scene can end.
    expect(scene).toMatch(/events\.once\(\s*["']shutdown["']/);
    expect(scene).toMatch(/vfx\??\.detach\(\)/);
  });

  it("CastScene loads the table against the spells it actually ships", () => {
    expect(scene).toContain("loadAuthoredCues(");
  });
});

// ---------------------------------------------------------------------------
// 6b. ...and every row it carries can actually reach a screen
// ---------------------------------------------------------------------------

describe("no authored row is dead content", () => {
  // WHAT THIS CATCHES THAT `findUnreachableRules` CANNOT. That function only
  // sees shadowing INSIDE the table: a general row sitting above a specific one.
  // It has nothing to say about a row whose event type nothing emits, or whose
  // emitter lives in a scene that mounts no VfxSystem. Eight of forty-one rows
  // were in exactly that state — validated, defect-free, and unable to play —
  // and the mounting test above could not see it either, because it only greps
  // CastScene for the wiring and never asks what CastScene's bus carries.
  //
  // So this walks the real source: which classes put a GameEvent on a bus, which
  // scenes mount a VfxSystem, and which of those emitters those scenes build.
  const root = path.resolve(here, "../../..");

  const walk = (dir: string): string[] =>
    fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) return walk(full);
      return entry.isFile() && entry.name.endsWith(".ts") && !entry.name.endsWith(".test.ts")
        ? [full]
        : [];
    });

  const files = walk(path.join(root, "src"));
  const read = (file: string) => fs.readFileSync(file, "utf8");

  /**
   * Emitter class -> the GameEvent types it puts on a bus.
   *
   * A file qualifies by calling `.emit(` and exporting a class of its own name;
   * the types are the GameEvent literals in it. `GameEvents.ts` declares all
   * fourteen and emits none, so it is excluded by the `.emit(` test and the
   * declarations never count as emissions.
   */
  const emitters = new Map<string, ReadonlySet<string>>();
  for (const file of files) {
    const code = read(file);
    const className = path.basename(file, ".ts");
    if (!code.includes(".emit(")) continue;
    if (!new RegExp(`export class ${className}\\b`).test(code)) continue;
    const types = new Set<string>();
    for (const match of code.matchAll(/type:\s*"([a-z]+:[a-z-]+)"/g)) {
      if ((ALL_EVENT_TYPES as readonly string[]).includes(match[1])) types.add(match[1]);
    }
    if (types.size > 0) emitters.set(className, types);
  }

  /** Scenes that build a VfxSystem. Anything they do not emit, nobody sees. */
  const vfxScenes = files.filter((file) => read(file).includes("new VfxSystem("));

  /** Event types that actually reach a mounted VfxSystem today. */
  const delivered = new Set<string>();
  for (const file of vfxScenes) {
    const code = read(file);
    for (const [className, types] of emitters) {
      if (new RegExp(`new ${className}\\s*\\(`).test(code)) for (const type of types) delivered.add(type);
    }
  }

  const authoredTypes = [...new Set(AUTHORED_CUES.rules.map((r) => r.type))].sort();
  const emittedTypes = new Set([...emitters.values()].flatMap((types) => [...types]));

  /**
   * Authored rows that cannot play yet, and the class that will make them play.
   *
   * `gate:cleared`/`gate:blocked` left this list on 2026-08-17 when mode5 plan
   * step 3 mounted `GateEngine` onto `CollectScene` (`startGates()`) — the same
   * scene `startVfx()` already mounts a `VfxSystem` on, so both rows now reach
   * a screen. `receiver:state-changed` left it the same day when step 4 mounted
   * `ReceiverStateStore` there too (`startReceiverStates()`). Empty rather than
   * deleted: the next row that cannot yet reach a screen belongs here, and the
   * test below is a ratchet in both directions — a new unplayable row fails,
   * and so does leaving an entry here once it starts playing.
   */
  const AWAITING_WIRING: Readonly<Record<string, string>> = {};

  it("reads a real emitter graph, not an empty one", () => {
    expect(emitters.size).toBeGreaterThanOrEqual(3);
    expect(vfxScenes.length).toBeGreaterThan(0);
    expect(delivered.size).toBeGreaterThan(0);
    expect(authoredTypes.length).toBeGreaterThan(0);
  });

  it("every scene that builds a CastPipeline also mounts a VfxSystem", () => {
    // THE MIRROR QUESTION, and the one this file could not previously ask.
    //
    // The test above asks "does every authored cue row reach SOME mounted
    // VfxSystem". That direction is satisfied the moment ONE scene mounts one.
    // It is blind to a second scene that emits into a bus nobody listens to.
    //
    // CollectScene did exactly that: it builds its own GameEventBus and its own
    // CastPipeline (which emits cast:resolved / cast:rejected) and mounted no
    // VfxSystem. Modes 2 and 3 both route through it, so every cast in them was
    // silent — no particles, no tint, and no answer at all on a no-effect cast,
    // which is the outcome that most needs a visible one.
    //
    // Coverage questions have two directions. Asking only one reads as "covered".
    const unmounted = files
      .filter((file) => /new CastPipeline\s*\(/.test(read(file)))
      .filter((file) => !read(file).includes("new VfxSystem("));
    expect(unmounted).toEqual([]);
  });

  it("mode5's descriptor actually turns vfx on — construction existing is not the same as a mode asking for it", () => {
    // A THIRD direction, past the two above: CollectScene mounts a
    // `VfxSystem` unconditionally in source, but `startVfx()` gates it on
    // `mode.systems.includes("vfx")` — and `MODE5`'s own `blurb` has always
    // promised "spell VFX" while its `systems` array never listed it. MODE5
    // was built from `DISCOVER_HOME`, not the deleted `MODE4` (which did
    // list it), so the entry was simply never carried over. Found and fixed
    // 2026-08-17, mid-session, the same day step 8 landed — see `modes.ts`'s
    // own header on `MODE5` for the full account.
    const modesSource = read(path.join(root, "src/mode/modes.ts"));
    const mode5Block = /export const MODE5[\s\S]*?\n};/.exec(modesSource)?.[0] ?? "";
    expect(mode5Block).toMatch(/systems:\s*\[[^\]]*"vfx"[^\]]*\]/);
  });

  it("names only event types something in the game actually emits", () => {
    // `craft:completed` and `item:acquired` had rows and no emitter anywhere in
    // src/ — a forage cue and a crafting cue that were never going to fire, in a
    // table whose whole premise is that a row is enough. The rows are gone; if
    // one comes back before its emitter does, this fails.
    const orphans = authoredTypes.filter((type) => !emittedTypes.has(type));
    expect(orphans).toEqual([]);
  });

  it("declares exactly the rows that cannot reach a screen yet", () => {
    const unreachable = authoredTypes.filter((type) => !delivered.has(type));
    expect(unreachable).toEqual(Object.keys(AWAITING_WIRING).sort());
  });

  it("declares nothing stale — each waiting row has a live emitter and no mount", () => {
    for (const [type, className] of Object.entries(AWAITING_WIRING)) {
      expect(emitters.get(className)?.has(type)).toBe(true);
      // The gap is the MOUNT, not the emitter: no VFX-bearing scene builds one.
      const built = vfxScenes.some((file) => new RegExp(`new ${className}\\s*\\(`).test(read(file)));
      expect(built).toBe(false);
    }
  });

  /**
   * Reaches a mounted VfxSystem, but no cue row answers it.
   *
   * `dialogue:line` joined `delivered` on 2026-08-17 when `PlayScene` mounted
   * `DialogueFeed` and `VfxSystem` on ONE bus, dropped out the same day when
   * `PlayScene`/`MODE4` were deleted (mode5 plan step 0), and rejoined the
   * same day again when step 2 mounted the VN layer onto `CollectScene`
   * (`startDialogue()`) — the same scene `startVfx()` already mounts a
   * `VfxSystem` on. Held here rather than closed by authoring a row: a cue on
   * every line of dialogue is a design decision about how loud the game is.
   *
   * `save:written` / `save:loaded` joined the same way when step 1 mounted
   * `SaveCoordinator` on `CollectScene`'s bus.
   *
   * `item:acquired` joined when step 2's `NpcTalkSystem` (also constructed on
   * `CollectScene`, also on that bus) started emitting it for the NPC-gift
   * pickup — the mirror of the forage pickup's own `item:acquired`, which
   * `CollectScene` emits directly rather than through a named, `new`-able
   * class, so this scan's textual `new ClassName(` check does not see it.
   */
  const DELIVERED_WITHOUT_CUE: readonly string[] = [
    "save:written",
    "save:loaded",
    "dialogue:line",
    "item:acquired",
  ];

  it("delivers the cast rows today, so the table is not entirely aspirational", () => {
    expect([...delivered].sort()).toEqual([
      "cast:rejected",
      "cast:resolved",
      "dialogue:line",
      "gate:blocked",
      "gate:cleared",
      "item:acquired",
      "receiver:state-changed",
      "save:loaded",
      "save:written",
    ]);
    for (const type of delivered) {
      if (DELIVERED_WITHOUT_CUE.includes(type)) continue;
      expect(authoredTypes).toContain(type);
    }
  });

  it("nothing declared unanswered has quietly gained a cue row", () => {
    for (const type of DELIVERED_WITHOUT_CUE) {
      expect(delivered.has(type)).toBe(true);
      expect(authoredTypes).not.toContain(type);
    }
  });
});

// ---------------------------------------------------------------------------
// 7. The table's own shape
// ---------------------------------------------------------------------------

describe("the authored table", () => {
  const byType = (type: CueRule["type"]) => AUTHORED_CUES.rules.filter((r) => r.type === type);

  it("covers the events a cast actually produces", () => {
    // `item:acquired` was on this list and had two rows; nothing in src/ emits
    // it, so the coverage was of an event that does not happen. The reachability
    // block above owns that claim now, against the real emitter graph.
    for (const type of ["cast:resolved", "cast:rejected", "gate:cleared"] as const) {
      expect(byType(type).length).toBeGreaterThan(0);
    }
  });

  it("survives a table that is missing or malformed", () => {
    const empty = loadCueTable(null);
    expect(empty.rules).toEqual([]);
    expect(empty.fallback.kind).toBe("none");
    expect(empty.defects[0]?.reason).toBe("malformed-table");

    const bus = new GameEventBus({ now: () => 0 });
    const backend = new FakeVfxBackend();
    const system = new VfxSystem({ bus, backend, table: empty }).attach();
    bus.emit(cast("ignite", "effect"));
    expect(backend.plays.at(-1)?.started).toBe(false);
    system.detach();
    expect(fakeVfxLiveHandles()).toBe(0);
  });

  it("drops a duplicate id rather than letting two rows claim one cue", () => {
    const table = loadCueTable({
      default: AUTHORED_CUES.fallback,
      rules: [
        {
          id: "cue.dup",
          when: { type: "item:acquired", match: { source: "forage" } },
          cue: { kind: "glow", tone: "quiet", durationMs: 300 },
        },
        {
          id: "cue.dup",
          when: { type: "item:acquired", match: { source: "cast" } },
          cue: { kind: "glow", tone: "quiet", durationMs: 300 },
        },
      ],
    });
    expect(table.rules.length).toBe(1);
    expect(table.defects[0]?.reason).toBe("duplicate-id");
  });

  it("reports a row that can never fire because an earlier one covers it", () => {
    const shadowed = loadCueTable({
      default: AUTHORED_CUES.fallback,
      rules: [
        {
          id: "cue.general",
          when: { type: "cast:resolved", match: { outcome: "effect" } },
          cue: { kind: "glow", tone: "quiet", durationMs: 300 },
        },
        {
          id: "cue.specific",
          when: { type: "cast:resolved", match: { outcome: "effect", spellId: "ignite" } },
          cue: { kind: "glow", tone: "warm", durationMs: 300 },
        },
      ],
    });
    expect(findUnreachableRules(shadowed)).toEqual(["cue.specific"]);
  });
});

// ---------------------------------------------------------------------------
// 8. The cue arithmetic, unit-tested where it now lives
// ---------------------------------------------------------------------------

describe("the cue arithmetic is pure and testable on its own", () => {
  // These four functions sat inside `PhaserVfxBackend`, reachable only through a
  // stub scene. One of them — the tint matrix — is the only piece of maths in
  // this folder that ever shipped a bug a player could see, so it gets direct
  // coverage rather than coverage-by-renderer.

  it("scales each channel by the colour and leaves alpha alone", () => {
    const gold = cueColor("gold")!;
    const matrix = channelScaleMatrix(gold);
    expect(matrix).toHaveLength(20);
    expect(matrix[0]).toBeCloseTo(((gold >> 16) & 255) / 255, 6);
    expect(matrix[6]).toBeCloseTo(((gold >> 8) & 255) / 255, 6);
    expect(matrix[12]).toBeCloseTo((gold & 255) / 255, 6);
    expect(matrix[18]).toBe(1);
    // Every off-diagonal and every offset is zero: it cannot ADD light, only
    // scale it down toward the cue's hue. That is what stops it being a flash.
    const diagonal = new Set([0, 6, 12, 18]);
    for (let i = 0; i < matrix.length; i++) if (!diagonal.has(i)) expect(matrix[i]).toBe(0);
  });

  it("reads a param, or the one shared default", () => {
    const bare: VfxCue = { id: "cue.u.bare", kind: "glow", tone: "quiet", durationMs: 300 };
    expect(cueParam(bare, "outer")).toBe(CUE_PARAM_DEFAULTS.outer);
    expect(cueParam({ ...bare, params: { outer: 9 } }, "outer")).toBe(9);
    // A non-number, or an infinity, falls back rather than reaching the renderer.
    expect(cueParam({ ...bare, params: { outer: "big" } }, "outer")).toBe(CUE_PARAM_DEFAULTS.outer);
    expect(clamp01(-2)).toBe(0);
    expect(clamp01(2)).toBe(1);
    expect(clamp01(0.4)).toBe(0.4);
  });

  it("ranks the palette by luminance the way the eye does", () => {
    const l = (key: string) => colorLuminance(cueColor(key)!);
    // The gold/ember VFX cues tint `vfxGold`/`vfxEmber` (pre-repaint values),
    // decoupled from the §14 menu gold — so the cue palette's luminance order
    // is measured on those, not the recolored menu `gold`/`ember`.
    expect(l("ink")).toBeGreaterThan(l("vfxGold"));
    expect(l("vfxGold")).toBeGreaterThan(l("success"));
    expect(l("success")).toBeGreaterThan(l("vfxEmber"));
    expect(l("vfxEmber")).toBeGreaterThan(l("muted"));
    for (const key of ["ink", "vfxGold", "muted", "dusk"]) {
      expect(l(key)).toBeGreaterThan(0);
      expect(l(key)).toBeLessThanOrEqual(1);
    }
  });

  it("measures tint as depth and the additive kinds as brightness", () => {
    // The inversion the whole neutral rule turns on, asserted as an inequality:
    // under a multiply the BRIGHT colour is the weak one; under an add it is the
    // strong one. Anyone reaching for a single neutral trips over this.
    const tint = (key: string): VfxCue => ({
      id: "cue.u.tint",
      kind: "tint",
      tone: "quiet",
      durationMs: 300,
      colorKey: key,
      params: { amount: 0.3 },
    });
    const glow = (key: string): VfxCue => ({ ...tint(key), kind: "glow", id: "cue.u.glow" });
    expect(cueWeight(tint("ink"))).toBeLessThan(cueWeight(tint("muted")));
    expect(cueWeight(glow("ink"))).toBeGreaterThan(cueWeight(glow("muted")));
    expect(cueWeight({ ...tint("ink"), kind: "none" })).toBe(0);
  });

  it("derives the neutral, and refuses one that would read dimmer", () => {
    const glow = (key: string): VfxCue => ({
      id: "cue.u.g",
      kind: "glow",
      tone: "quiet",
      durationMs: 300,
      colorKey: key,
      params: { outer: 3 },
    });
    // dusk sits almost exactly on `muted`; gold and ember are far enough above
    // it that `muted` would read dimmer, so the rule takes `ink` instead.
    expect(neutralFor(glow("dusk"))).toBe("muted");
    expect(neutralFor(glow("gold"))).toBe("ink");
    expect(neutralFor(glow("ember"))).toBe("ink");
    for (const key of ["dusk", "gold", "ember", "success"]) {
      const effect = glow(key);
      const chosen = neutralFor(effect)!;
      expect(NEUTRAL_COLOR_KEYS).toContain(chosen);
      expect(cueWeight({ ...effect, colorKey: chosen }) / cueWeight(effect)).toBeGreaterThanOrEqual(
        NEUTRAL_WEIGHT_FLOOR,
      );
    }
    // Nothing to match against.
    expect(neutralFor({ id: "cue.u.n", kind: "none", tone: "quiet", durationMs: 0 })).toBeNull();
  });
});
