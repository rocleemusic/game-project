/**
 * Casting. Pure — no Phaser, no DOM, no I/O — so it is testable on its own and
 * portable to whatever the Unreal build decides to do.
 *
 * The design is a table lookup, and that is the point. Every outcome in the
 * game is authored prose sitting in `content/magic/*.json`; this module's only
 * job is to find the right row and do the bookkeeping around it. If you ever
 * find yourself writing `if (spellId === "ignite")`, the design has broken —
 * see `produces`/`produced_by` in the item layer, which carries the chains.
 *
 * Rules, all from `gdd/04-magic-system.md`:
 *   - A spell is a phrase PLUS components. `glimmer`, `portion` and `weigh` all
 *     take exactly [item_river_stone], so components alone cannot identify a
 *     spell. The phrase is load-bearing.
 *   - Physical outcomes only. "No effect" is an honest result, never a failure.
 *   - Mana shapes a cast's quality, never whether it is possible.
 */

import type { ItemRecord, SpellRecord } from "./types";

export type CastOutcome =
  /** The spell landed and the receiver has an authored physical outcome. */
  | "effect"
  /** Authored, and what it says is that nothing physically happened. */
  | "no-effect"
  /** The offered components are not this spell's components. */
  | "wrong-components"
  /** No phrase matches. */
  | "unknown-spell"
  /** The spell is real, the receiver is not in its table. A content gap. */
  | "unknown-receiver";

export type ManaBand = "baseline" | "high";

export interface CastResult {
  outcome: CastOutcome;
  spellId: string | null;
  receiverId: string;
  /** Authored prose, verbatim. Empty only when there is nothing authored. */
  narration: string;
  /** Authored, or `null` meaning render nothing at all. */
  reaction: string | null;
  /** Quality flavour appended from `mana_effect`; never changes `outcome`. */
  manaNote: string | null;
  /** item_ids removed from the caster's holdings. */
  consumed: string[];
  /** item_ids minted into the world. */
  produced: string[];
  /** A screen this cast opens, if the spell is a knowledge-key. */
  unlockedScreen: string | null;
  /** Components the caster was missing, when `wrong-components`. */
  missing: string[];
  /** Components offered that this spell does not take. */
  extra: string[];
}

/**
 * The one authored branch of a state-dependent outcome, already chosen.
 *
 * Structural on purpose: `world/receivers/ReceiverStateStore` produces this and
 * `src/magic` stays free of any dependency on the world layer. Both fields are
 * AUTHORED — `clause` is copied verbatim out of `physical_outcome` and
 * `noEffect` is stated in the data, never derived from the text.
 */
export interface AuthoredOutcomeBranch {
  readonly clause: string;
  readonly noEffect: boolean;
}

export interface CastContext {
  mana: ManaBand;
  /** Soul ids present on the screen — lets bystander reactions be gated. */
  present?: string[];
  /**
   * The branch a stateful receiver is currently in.
   *
   * SELECTION RUNS BEFORE RESOLUTION, and that ordering is the whole fix. 18
   * pairs author two alternatives in one string, and the no-effect marker lives
   * INSIDE one of those halves ("...already cold, no_effect — there is no heat
   * to set"). Testing the whole string cannot see it, and loosening the test to
   * find it would drag the other half in with it. So the caller picks the
   * branch first and hands it in; this function then reads the branch and never
   * the combined string. The vocabulary for those alternatives stays in
   * `world/receivers/**` — see `ReceiverStateStore`.
   *
   * Absent for the 71 pairs that are not stateful, which keep the record's own
   * `physical_outcome` unchanged.
   */
  branch?: AuthoredOutcomeBranch | null;
}

/**
 * Phrase -> spell, plus the indices the UI needs. Built once at load.
 */
export class MagicDB {
  readonly spells: SpellRecord[];
  readonly items: Map<string, ItemRecord>;
  private readonly byPhrase = new Map<string, SpellRecord>();
  private readonly bySpellId = new Map<string, SpellRecord>();

  constructor(spells: SpellRecord[], items: ItemRecord[]) {
    // Defensive: the bundler already filters, but a rejected spell reaching
    // the runtime is the one content failure that would be invisible in play.
    this.spells = spells.filter((s) => s.status === "approved");
    this.items = new Map(items.map((i) => [i.item_id, i]));
    for (const s of this.spells) {
      this.byPhrase.set(s.phrase.trim().toLowerCase(), s);
      this.bySpellId.set(s.spell_id, s);
    }
  }

  spell(id: string): SpellRecord | undefined {
    return this.bySpellId.get(id);
  }

  /** The lookup behind phrase entry. Case- and whitespace-insensitive. */
  byPhraseText(phrase: string): SpellRecord | undefined {
    return this.byPhrase.get(phrase.trim().toLowerCase());
  }

  /** Spells whose every component is in `held`. Drives the spellbook UI. */
  castableWith(held: Iterable<string>): SpellRecord[] {
    const have = new Set(held);
    return this.spells.filter((s) => s.components.every((c) => have.has(c)));
  }

  /**
   * Spells sharing an identical component set. The reason the phrase exists:
   * on the shipped content this returns river-stone's {glimmer, portion, weigh}.
   */
  ambiguousComponentSets(): SpellRecord[][] {
    const groups = new Map<string, SpellRecord[]>();
    for (const s of this.spells) {
      const key = [...s.components].sort().join("+");
      const g = groups.get(key) ?? [];
      g.push(s);
      groups.set(key, g);
    }
    return [...groups.values()].filter((g) => g.length > 1);
  }

  /**
   * Every (spell, receiver) pair the content does NOT author. The probe's most
   * useful export: it tells the narrative crew exactly what they still owe,
   * rather than hiding the gap behind a plausible fallback line.
   */
  receiverCoverageGaps(receiverIds: string[]): { spell: string; missing: string[] }[] {
    return this.spells
      .map((s) => {
        const known = new Set(s.receivers.map((r) => r.receiver_id));
        return { spell: s.spell_id, missing: receiverIds.filter((r) => !known.has(r)) };
      })
      .filter((g) => g.missing.length > 0);
  }
}

/** Set equality — a spell takes its components exactly, not as a subset. */
function diff(offered: string[], required: string[]) {
  const off = new Set(offered);
  const req = new Set(required);
  return {
    missing: [...req].filter((c) => !off.has(c)),
    extra: [...off].filter((c) => !req.has(c)),
  };
}

/**
 * Does this authored outcome describe nothing physically happening?
 *
 * The content states it plainly and consistently — "No physical effect" for
 * Ilsa, "No physical effect — the spell's light washes over the fur and fades
 * without catching" for the cat. This drives BOOKKEEPING ONLY (whether
 * `produces` fires); it must never reach the view, or "no effect" starts
 * looking like a failure state, which is exactly what the GDD forbids.
 *
 * THE FALLBACK, NOT THE RULE. When `CastContext.branch` is supplied the answer
 * is authored and this is not consulted at all. It still decides the 71 pairs
 * that are not state-dependent.
 *
 * KNOWN AND UNFIXED: 16 non-stateful outcomes begin `no_effect —` with an
 * UNDERSCORE, which this pattern does not match, so they still resolve as
 * effects. Reclassifying 16 authored pairs changes what mints, what teaches and
 * what clears a gate; it is a content ruling, not a regex tweak, and it is not
 * this track's to make. Pinned in `tests/characterization/NoEffectHonesty.test.ts`.
 */
function readsAsNoEffect(physicalOutcome: string): boolean {
  return /^no (physical )?effect\b/i.test(physicalOutcome.trim());
}

function emptyResult(receiverId: string): CastResult {
  return {
    outcome: "unknown-spell",
    spellId: null,
    receiverId,
    narration: "",
    reaction: null,
    manaNote: null,
    consumed: [],
    produced: [],
    unlockedScreen: null,
    missing: [],
    extra: [],
  };
}

/**
 * Resolve one cast.
 *
 * `offered` are the item_ids the player put into the cast, `receiverId` is what
 * they aimed at. Neither the caller nor this function decides what happens —
 * the content record does.
 */
export function resolveCast(
  db: MagicDB,
  phrase: string,
  offered: string[],
  receiverId: string,
  ctx: CastContext = { mana: "baseline" },
): CastResult {
  const spell = db.byPhraseText(phrase);
  if (!spell) return emptyResult(receiverId);

  const base = { ...emptyResult(receiverId), spellId: spell.spell_id };

  const { missing, extra } = diff(offered, spell.components);
  if (missing.length > 0 || extra.length > 0) {
    // The phrase simply doesn't take. Nothing is spent — distinct from a cast
    // that lands and does nothing, which does cost you your components.
    return { ...base, outcome: "wrong-components", missing, extra };
  }

  const receiver = spell.receivers.find((r) => r.receiver_id === receiverId);
  if (!receiver) {
    // A real gap in authored content. Surfaced loudly rather than papered over.
    return { ...base, outcome: "unknown-receiver" };
  }

  // Consumed on any landed cast, including one that does nothing: you tried,
  // and trying costs. `world` items (a flame) are never in the caster's
  // holdings to begin with, so consumption is scoped to what is consumable.
  const consumed = spell.components.filter(
    (id) => db.items.get(id)?.consumable !== false,
  );

  // BRANCH SELECTION FIRST, then the no-effect test — run on the selected
  // branch, never on the combined two-alternative string. A supplied branch is
  // the authored answer and overrides the pattern entirely; without one,
  // nothing about the 71 non-stateful pairs changes.
  const branch = ctx.branch ?? null;
  const noEffect = branch ? branch.noEffect : readsAsNoEffect(receiver.physical_outcome);

  return {
    ...base,
    outcome: noEffect ? "no-effect" : "effect",
    // Verbatim either way: the clause is a copied substring of the record, so
    // the player reads authored prose and only ever the half that applies.
    narration: branch ? branch.clause : receiver.physical_outcome,
    reaction: receiver.reaction_kind,
    manaNote: ctx.mana === "high" ? spell.mana_effect : null,
    consumed,
    // A cast that does nothing mints nothing. On a landed cast the RECEIVER'S
    // own `produces` wins over the spell-level default (option A, Roc
    // 2026-08-19): `ignite × river_stone` mints `item_heated_stone`, while
    // `ignite × stick` falls back to the spell's `item_flame`. This is the
    // list that flows — unedited, by reference — into `applyCast`, the
    // `cast:resolved` event, and thence into the gate chain's product binding.
    produced: noEffect ? [] : receiver.produces ?? spell.produces,
    unlockedScreen: noEffect ? null : spell.unlocks?.screen ?? null,
    missing: [],
    extra: [],
  };
}
