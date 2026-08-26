/**
 * Loads the authored gate rulings, refuses the ones that cannot work, and
 * tracks which gates are open.
 *
 * PURE. No Phaser, no DOM, no I/O beyond a static JSON import.
 *
 * ---------------------------------------------------------------------------
 * THE REFUSAL IS THE FEATURE
 * ---------------------------------------------------------------------------
 *
 * A gate rule naming a spell that does not exist, or a receiver that spell does
 * not author, is a gate that will never clear. It compiles, it loads, it
 * evaluates, and it returns `false` for the rest of the game — and the screen
 * behind it is simply unreachable, with nothing anywhere saying why. That is the
 * worst possible failure for this layer, because it is indistinguishable from
 * "the player has not done it yet".
 *
 * So this engine VALIDATES EVERY RULE AGAINST THE AUTHORED CONTENT before
 * accepting it, and a rule that fails is dropped with a `GateRuleDefect` naming
 * the gate, the reason and the offending id. `defects` is a public field, and
 * `assertLoaded()` turns the whole set into a thrown error for callers that
 * would rather not boot at all.
 *
 * WHY IT DOES NOT THROW BY DEFAULT. Two of the six authored rulings are
 * currently unsatisfiable content (see below). Throwing on construction would
 * make Mode 4 unbootable and would take the four WORKING gates down with the two
 * broken ones. Refusing the two, reporting them, and running the other four is
 * both louder in practice — the defect list is right there — and less
 * destructive. `strict: true` is available for the audit tool and for CI.
 *
 * ---------------------------------------------------------------------------
 * WHAT IS BROKEN IN THE CONTENT RIGHT NOW (verified against
 * `content/magic/*.json` on 2026-08-17, not assumed)
 * ---------------------------------------------------------------------------
 *
 *   ignite receivers : stick, dry_hedge, furnace, bread, cat, toby, ilsa
 *   temper receivers : forge_billet, stick, hot_loaf, cat, nell
 *   fetch  receivers : berry_on_high_branch, anvil, latched_shutter, bird, bex
 *
 * `river_stone` is authored as a receiver only on knead, mist, ripen and warm —
 * all four REJECTED — plus waft, which is approved. `stone_wall` is authored
 * only on warm, which is rejected, so it is reachable by no castable spell at
 * all.
 *
 * Therefore `G-F4-still` (ignite x river_stone, then temper) and
 * `G-F8-combine` (…, fetch x stone_wall, …) name pairs that do not exist. Both
 * are REFUSED at load. They are not silently patched, and no content is
 * invented here to make them pass: F4 and F8 stay locked until
 * `content/magic/ignite.json`, `temper.json` and `fetch.json` gain those
 * receivers with authored `physical_outcome` prose. That is a content edit, not
 * an engineering one.
 *
 * ---------------------------------------------------------------------------
 * THE OTHER RULINGS THIS FILE CARRIES
 * ---------------------------------------------------------------------------
 *
 *  - INK OWNS THE CLOCK. `GateWorldFacts` is a read-only mirror. There is no
 *    writer here and none may be added.
 *  - NO `if (spellId === "ignite")`. Every rule is a record in
 *    `data/gateRules.json`. A seventh gate is a seventh object, not a branch.
 *  - MODES 1-3 KEEP `legacy-hedge`. Nothing in modes 1-3 constructs this
 *    engine; `collectGates.ts` stays a local flag that clears no real `G-*` id,
 *    because F7 also needs `G-F5-cascade`, which those modes cannot clear.
 *    Every `gate:cleared` this engine emits therefore carries
 *    `source: "authored"`, and there is no option to say otherwise.
 *  - NO-EFFECT IS AN HONEST RESULT. A refused rule and an unmet rule are
 *    different things and are reported separately; neither is an error state
 *    the player ever sees as red.
 *
 * ---------------------------------------------------------------------------
 * ONCE OPEN, STAYS OPEN — except for time
 * ---------------------------------------------------------------------------
 *
 * Cast, chain and bond rules are monotonic: the log only grows and bonds only
 * rise, so a gate they clear cannot un-clear. A TIME rule is not monotonic —
 * the tavern is open in the evening and shut in the morning — so a time gate is
 * re-evaluated every refresh and can close again. `refresh()` reports both
 * directions, and the caller renders the difference.
 */

import type { SpellRecord } from "../../magic/types";
import type { GameEventBus } from "../events/GameEvents";
import {
  evaluateRule,
  type GateContext,
  type GateEvaluation,
  type GateWorldFacts,
} from "./GateEvaluator";
import type {
  BondBand,
  ChainStep,
  GateRule,
  GateRuleDefect,
  GateRuleTable,
} from "./GateRule";
import authoredGateRulesJson from "./data/gateRules.json";

// ---------------------------------------------------------------------------
// The authored content a rule is checked against
// ---------------------------------------------------------------------------

/**
 * The vocabulary the validator holds a rule to.
 *
 * Built from the shipped records, never hand-listed here — a hand-list is a
 * second copy of the content that drifts silently.
 */
export interface AuthoredContent {
  /** APPROVED spell ids only. A rejected spell can never be cast. */
  readonly spellIds: ReadonlySet<string>;
  /** spell_id -> the receiver ids that spell actually authors. */
  readonly receiversBySpell: ReadonlyMap<string, ReadonlySet<string>>;
  /** Every receiver with `receiver_class: "soul"`, for `BondGateRule.soulId`. */
  readonly soulIds: ReadonlySet<string>;
  /** item_ids, for `ChainStep.requiresHeld`. Omit to skip that check. */
  readonly itemIds?: ReadonlySet<string>;
  /** ink's time-of-day vocabulary. Omit to skip that check. */
  readonly timeBlocks?: ReadonlySet<string>;
}

export interface AuthoredContentOptions {
  readonly itemIds?: readonly string[];
  readonly timeBlocks?: readonly string[];
}

/**
 * Index the shipped spell records.
 *
 * REJECTED SPELLS ARE DROPPED, matching `MagicDB`'s own constructor. A gate
 * keyed to a rejected spell is unclearable for exactly the same reason a gate
 * keyed to a misspelled one is, and it gets the same refusal.
 */
export function authoredContentFrom(
  spells: readonly SpellRecord[],
  options: AuthoredContentOptions = {},
): AuthoredContent {
  const approved = spells.filter((s) => s.status === "approved");
  const receiversBySpell = new Map<string, ReadonlySet<string>>();
  const soulIds = new Set<string>();
  for (const spell of approved) {
    receiversBySpell.set(spell.spell_id, new Set(spell.receivers.map((r) => r.receiver_id)));
    for (const r of spell.receivers) {
      if (r.receiver_class === "soul") soulIds.add(r.receiver_id);
    }
  }
  return {
    spellIds: new Set(approved.map((s) => s.spell_id)),
    receiversBySpell,
    soulIds,
    itemIds: options.itemIds ? new Set(options.itemIds) : undefined,
    timeBlocks: options.timeBlocks ? new Set(options.timeBlocks) : undefined,
  };
}

// ---------------------------------------------------------------------------
// Parsing the JSON — the file on disk is untyped until it is checked
// ---------------------------------------------------------------------------

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

function isStringArray(v: unknown): v is string[] {
  return Array.isArray(v) && v.every((x) => typeof x === "string");
}

function parseStep(raw: unknown): ChainStep | null {
  if (!isRecord(raw)) return null;
  const spellId = raw.spellId;
  if (typeof spellId !== "string") return null;
  const requiresHeld = raw.requiresHeld;
  if (requiresHeld !== undefined && typeof requiresHeld !== "string") return null;
  if (typeof raw.receiverId === "string") {
    return requiresHeld === undefined
      ? { spellId, receiverId: raw.receiverId }
      : { spellId, receiverId: raw.receiverId, requiresHeld };
  }
  if (typeof raw.onProductOf === "number" && Number.isInteger(raw.onProductOf)) {
    return requiresHeld === undefined
      ? { spellId, onProductOf: raw.onProductOf }
      : { spellId, onProductOf: raw.onProductOf, requiresHeld };
  }
  return null;
}

function parseRule(raw: unknown): GateRule | null {
  if (!isRecord(raw)) return null;
  switch (raw.kind) {
    case "cast":
      if (typeof raw.spellId !== "string") return null;
      if (raw.receiverId !== undefined && typeof raw.receiverId !== "string") return null;
      if (typeof raw.requireEffect !== "boolean") return null;
      return raw.receiverId === undefined
        ? { kind: "cast", spellId: raw.spellId, requireEffect: raw.requireEffect }
        : {
            kind: "cast",
            spellId: raw.spellId,
            receiverId: raw.receiverId,
            requireEffect: raw.requireEffect,
          };
    case "bond": {
      if (raw.soulId !== undefined && typeof raw.soulId !== "string") return null;
      const band = raw.minBand;
      if (band !== 0 && band !== 1 && band !== 2) return null;
      const minBand: BondBand = band;
      return raw.soulId === undefined
        ? { kind: "bond", minBand }
        : { kind: "bond", soulId: raw.soulId, minBand };
    }
    case "time":
      if (!isStringArray(raw.blocks)) return null;
      return { kind: "time", blocks: raw.blocks };
    case "chain": {
      if (!Array.isArray(raw.steps)) return null;
      const steps: ChainStep[] = [];
      for (const s of raw.steps) {
        const step = parseStep(s);
        if (!step) return null;
        steps.push(step);
      }
      return { kind: "chain", steps };
    }
    default:
      return null;
  }
}

/** Structural parse of a `gateRules.json`. Shape errors become defects. */
export function parseGateRuleTable(raw: unknown): {
  table: GateRuleTable;
  defects: GateRuleDefect[];
} {
  const table: Record<string, GateRule> = {};
  const defects: GateRuleDefect[] = [];
  if (!isRecord(raw)) {
    return {
      table,
      defects: [
        { gateId: "*", reason: "malformed-rule", detail: "gateRules.json is not an object" },
      ],
    };
  }
  for (const [gateId, value] of Object.entries(raw)) {
    const rule = parseRule(value);
    if (!rule) {
      defects.push({
        gateId,
        reason: "malformed-rule",
        detail: `not a recognised rule shape: ${JSON.stringify(value)}`,
      });
      continue;
    }
    table[gateId] = rule;
  }
  return { table, defects };
}

// ---------------------------------------------------------------------------
// Validation — the refusal
// ---------------------------------------------------------------------------

/**
 * Every reason this rule cannot work, not just the first.
 *
 * ALL defects are collected rather than short-circuiting, because the point of
 * the refusal is to hand the narrative crew the whole work-list in one pass.
 * `G-F8-combine` has two independent content gaps; reporting one and stopping
 * would produce two rounds of content work where one would do.
 */
export function validateRule(
  gateId: string,
  rule: GateRule,
  content: AuthoredContent,
  knownGateIds?: ReadonlySet<string>,
): GateRuleDefect[] {
  const out: GateRuleDefect[] = [];
  const defect = (reason: GateRuleDefect["reason"], detail: string) =>
    out.push({ gateId, reason, detail });

  if (knownGateIds && !knownGateIds.has(gateId)) {
    defect("unknown-gate", `no screen in the graph is locked(${gateId})`);
  }

  const checkPair = (spellId: string, receiverId: string | undefined, where: string) => {
    const receivers = content.receiversBySpell.get(spellId);
    if (!content.spellIds.has(spellId) || !receivers) {
      defect("unknown-spell", `${where}: "${spellId}" is not an approved spell`);
      return;
    }
    if (receiverId !== undefined && !receivers.has(receiverId)) {
      defect(
        "unknown-receiver",
        `${where}: "${spellId}" authors no receiver "${receiverId}" ` +
          `(it authors: ${[...receivers].join(", ")})`,
      );
    }
  };

  const checkHeld = (itemId: string | undefined, where: string) => {
    if (itemId === undefined || !content.itemIds) return;
    if (!content.itemIds.has(itemId)) {
      defect("unknown-item", `${where}: requiresHeld "${itemId}" is not an authored item`);
    }
  };

  switch (rule.kind) {
    case "cast":
      checkPair(rule.spellId, rule.receiverId, "cast rule");
      break;

    case "bond":
      if (rule.soulId !== undefined && !content.soulIds.has(rule.soulId)) {
        defect("unknown-receiver", `bond rule: "${rule.soulId}" is not an authored soul`);
      }
      break;

    case "time":
      if (rule.blocks.length === 0) {
        defect("malformed-rule", "time rule: `blocks` is empty, so it can never be satisfied");
      }
      if (content.timeBlocks) {
        for (const b of rule.blocks) {
          if (!content.timeBlocks.has(b)) {
            defect("malformed-rule", `time rule: "${b}" is not a time block ink declares`);
          }
        }
      }
      break;

    case "chain": {
      if (rule.steps.length === 0) {
        defect("malformed-rule", "chain rule: `steps` is empty, so it can never be satisfied");
      }
      rule.steps.forEach((step, i) => {
        const where = `chain step ${i}`;
        if ("receiverId" in step) {
          checkPair(step.spellId, step.receiverId, where);
        } else {
          checkPair(step.spellId, undefined, where);
          if (step.onProductOf < 0 || step.onProductOf >= i) {
            defect(
              "bad-step-reference",
              `${where}: onProductOf ${step.onProductOf} must name an EARLIER step (0..${i - 1})`,
            );
          }
        }
        checkHeld(step.requiresHeld, where);
      });
      break;
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// The engine
// ---------------------------------------------------------------------------

export interface GateEngineOptions {
  /** Defaults to the authored `data/gateRules.json`. */
  readonly rules?: GateRuleTable;
  readonly content: AuthoredContent;
  /**
   * Gate ids the graph actually declares, e.g. from `Gates.requirements`. Omit
   * to skip the cross-check; supply it and a typo'd gate id is refused too.
   */
  readonly knownGateIds?: ReadonlySet<string>;
  /** gate_id -> the screens it guards. Carried on `gate:cleared`. */
  readonly screensByGate?: ReadonlyMap<string, readonly string[]>;
  /** Optional, so the engine is testable with no bus at all. */
  readonly bus?: GameEventBus;
  /** `true` makes construction throw on any defect. Default `false` — see head. */
  readonly strict?: boolean;
}

/**
 * A screen's gate requirement, structurally typed so `Gates.requirements`
 * satisfies it without this file importing `Gates`.
 */
export interface ScreenGateRequirement {
  readonly screenId: string;
  readonly gateIds: readonly string[];
}

/** Invert screen->gates into gate->screens. `G-F5-cascade` guards three. */
export function screensByGateFrom(
  requirements: Iterable<ScreenGateRequirement>,
): ReadonlyMap<string, readonly string[]> {
  const out = new Map<string, string[]>();
  for (const req of requirements) {
    for (const gateId of req.gateIds) {
      const list = out.get(gateId) ?? [];
      list.push(req.screenId);
      out.set(gateId, list);
    }
  }
  return out;
}

/** What one `refresh()` changed. Both directions — time gates can shut again. */
export interface GateRefresh {
  readonly cleared: readonly string[];
  readonly closed: readonly string[];
}

export class GateEngine {
  /** Rules that passed validation. The refused ones are simply not here. */
  readonly rules: ReadonlyMap<string, GateRule>;
  /** Every refusal, with the reason. Public on purpose — read it. */
  readonly defects: readonly GateRuleDefect[];

  private readonly cleared = new Set<string>();
  private readonly screensByGate: ReadonlyMap<string, readonly string[]>;
  private readonly bus?: GameEventBus;

  constructor(options: GateEngineOptions) {
    const source = options.rules ?? AUTHORED_GATE_RULES;
    const rules = new Map<string, GateRule>();
    const defects: GateRuleDefect[] = [...AUTHORED_GATE_RULE_DEFECTS];
    // Only the parse defects of the DEFAULT table are pre-seeded; a caller
    // supplying its own table has already parsed it.
    if (options.rules) defects.length = 0;

    for (const [gateId, rule] of Object.entries(source)) {
      const bad = validateRule(gateId, rule, options.content, options.knownGateIds);
      if (bad.length > 0) {
        defects.push(...bad);
        continue;
      }
      rules.set(gateId, rule);
    }

    this.rules = rules;
    this.defects = defects;
    this.screensByGate = options.screensByGate ?? new Map();
    this.bus = options.bus;

    if (options.strict) this.assertLoaded();
  }

  /** Throw if anything was refused. For CI and the content audit. */
  assertLoaded(): void {
    if (this.defects.length === 0) return;
    throw new Error(`GateEngine refused ${this.defects.length} rule(s):\n${this.describeDefects()}`);
  }

  /** One line per refusal, ready to print. */
  describeDefects(): string {
    return this.defects.map((d) => `  ${d.gateId} [${d.reason}] ${d.detail}`).join("\n");
  }

  /** Gate ids that loaded and can therefore ever clear. */
  loadedGateIds(): string[] {
    return [...this.rules.keys()].sort();
  }

  /** Gate ids that were refused. These will NEVER clear — that is the point. */
  refusedGateIds(): string[] {
    return [...new Set(this.defects.map((d) => d.gateId))].sort();
  }

  isCleared(gateId: string): boolean {
    return this.cleared.has(gateId);
  }

  clearedGates(): string[] {
    return [...this.cleared].sort();
  }

  /**
   * Re-seed from a save. No events — a restore is not a clearing, and firing
   * `gate:cleared` on load would replay every VFX cue the player already saw.
   */
  restoreCleared(gateIds: Iterable<string>): void {
    this.cleared.clear();
    for (const id of gateIds) if (this.rules.has(id)) this.cleared.add(id);
  }

  /**
   * DEV-only: force gates open for playtesting, INCLUDING refused or
   * unsatisfiable ones that `restoreCleared` skips. Bypasses the `rules` filter
   * on purpose — a debug unlock is meant to reach screens no authored cast can
   * yet open (e.g. `G-F5-cascade`, which has no clearing spell). No events, so
   * it replays no VFX. Never called outside a DEV build.
   */
  debugForceCleared(gateIds: Iterable<string>): void {
    for (const id of gateIds) this.cleared.add(id);
  }

  /** Evaluate one loaded rule. `null` if the gate was refused or unknown. */
  evaluate(gateId: string, ctx: GateContext): GateEvaluation | null {
    const rule = this.rules.get(gateId);
    return rule ? evaluateRule(gateId, rule, ctx) : null;
  }

  /**
   * Re-evaluate every loaded rule and emit `gate:cleared` for each newly open
   * gate. Returns the DELTA in both directions, never the running total.
   *
   * Emission is one-way: nothing on the bus feeds back into this method.
   */
  refresh(ctx: GateContext): GateRefresh {
    const cleared: string[] = [];
    const closed: string[] = [];

    for (const [gateId, rule] of this.rules) {
      const evaluation = evaluateRule(gateId, rule, ctx);
      const was = this.cleared.has(gateId);
      if (evaluation.satisfied && !was) {
        this.cleared.add(gateId);
        cleared.push(gateId);
        this.bus?.emit({
          type: "gate:cleared",
          gateId,
          screenIds: this.screensByGate.get(gateId) ?? [],
          ruleKind: rule.kind,
          // Modes 1-3 never reach this code; the legacy hedge flag is local to
          // `collectGates.ts` and clears no real `G-*` id.
          source: "authored",
        });
      } else if (!evaluation.satisfied && was) {
        // Only a time rule can get here. The tavern shuts in the morning.
        this.cleared.delete(gateId);
        closed.push(gateId);
      }
    }

    return { cleared, closed };
  }

  /**
   * Gates still standing between the player and this screen, in authored order.
   *
   * A REFUSED gate is still blocking — it must be, or a content gap would
   * silently open a locked screen. `refusedGateIds()` is how you tell the two
   * apart.
   */
  blocking(gateIds: readonly string[]): string[] {
    return gateIds.filter((g) => !this.cleared.has(g));
  }

  /** Emit `gate:blocked` for a move the player was refused. */
  reportBlocked(screenId: string, gateIds: readonly string[], moveText: string | null): void {
    this.bus?.emit({
      type: "gate:blocked",
      screenId,
      gateIds: this.blocking(gateIds),
      moveText,
    });
  }

  /**
   * Refresh on every event that can change an answer.
   *
   * `cast:resolved` grows the log; `screen:changed` carries ink's clock, so it
   * is the moment a time gate can flip. Returns an unsubscribe thunk.
   */
  attach(bus: GameEventBus, facts: () => GateWorldFacts): () => void {
    const run = () => {
      this.refresh({ log: bus.log(), facts: facts() });
    };
    const offCast = bus.on("cast:resolved", run);
    const offScreen = bus.on("screen:changed", run);
    return () => {
      offCast();
      offScreen();
    };
  }
}

// ---------------------------------------------------------------------------
// The authored table, parsed once
// ---------------------------------------------------------------------------

const parsedAuthored = parseGateRuleTable(authoredGateRulesJson as unknown);

/** The six rulings of 2026-08-17, as they sit in `data/gateRules.json`. */
export const AUTHORED_GATE_RULES: GateRuleTable = parsedAuthored.table;

/** Shape defects in the shipped file. Should always be empty; asserted in tests. */
export const AUTHORED_GATE_RULE_DEFECTS: readonly GateRuleDefect[] = parsedAuthored.defects;
