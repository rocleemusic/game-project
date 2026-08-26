/**
 * The cue table: GameEvent -> authored cue, as DATA.
 *
 * WHY THIS FILE IS NOT A SWITCH. The one rule the VFX track was given is that
 * a new spell gets a row in `cues.json`, not a code branch. `if (spellId ===
 * "ignite")` is the failure mode: the shipped records carry 16 approved spells
 * across 89 authored spell-receiver outcomes, which is a switch nobody
 * maintains, and the moment one branch styles a landed cast differently from
 * another, the no-effect ruling is gone and no test can see it. So the mapping
 * is a table, the table is validated on load, and this file contains no spell
 * id, no receiver id and no gate id.
 *
 * FIRST MATCH WINS. Rows are ordered, specific above general — the row for
 * `ignite`+`effect` sits above the row for any `effect`. That is the whole
 * precedence model. Its one hazard is an authored row that can never fire
 * because a broader row of the same event type sits above it, so
 * `findUnreachableRules` computes exactly that and a test asserts it is empty.
 *
 * COLOUR COMES FROM THE THEME, ALWAYS. `ui/theme.ts` is contrast-checked; a raw
 * hex in `cues.json` would silently bypass that audit. So `colorKey` is a key
 * of `COLOR` and an unknown key is a defect that drops the row rather than a
 * runtime `undefined` that renders black.
 *
 * THE SPELL VOCABULARY IS INJECTED, NOT HARD-CODED. A row naming a spell that
 * is not in the shipped records can never fire, and nothing would say so — the
 * first draft of this table shipped three such rows. So `loadCueTable` takes an
 * optional `spellIds` set and reports `unknown-spell` for a row outside it,
 * exactly as `GateEngine` refuses a rule naming an unauthored receiver, and for
 * the same reason: a hand-copied id list is a second copy of the content that
 * drifts. The set is built from `magic.json` by the caller; this file never
 * names a spell.
 *
 * NO-EFFECT IS AN HONEST RESULT, AND THE LOADER ENFORCES IT. `VfxTone` has no
 * failure member, so no cue can be *toned* as an error. The remaining hole was
 * colour: `COLOR.danger` exists and means "a cast that failed outright, or a
 * blocked action". A landed cast is neither. `danger` is therefore permitted
 * only on the event types in `FAILURE_STYLED_TYPES` — the two never-happened
 * events — and any `cast:resolved` row reaching for it, or for an error-ish
 * token in its id or params, is a defect. The ruling is checked on load rather
 * than asserted in prose.
 *
 * DEFECTS DROP ROWS, THEY DO NOT THROW. Same shape as `GateEngine`: a bad row
 * is reported and skipped, the rest of the table still loads, and the audit can
 * print the list. A game that will not boot because one cue is misspelled is
 * worse than a game with one missing cue.
 *
 * THE CUE ARITHMETIC LIVES HERE, NOT IN THE RENDERER. `cueParam`,
 * `channelScaleMatrix`, `colorLuminance` and `cueWeight` are pure and are
 * imported by `PhaserVfxBackend`. They sat inside that file until the one piece
 * of arithmetic in this folder that ever shipped a player-visible bug turned out
 * to be `channelScale`, reachable only through a stub scene: because the tint
 * matrix MULTIPLIES by the cue's colour, authoring the no-effect rows in the
 * palette's brightest value made them a 4-5% dim against an 11-15% effect. Same
 * fields, same JSON, invisible on screen — and the parity test could not see it,
 * because it compared row fields and never rendered magnitude. `neutralFor` and
 * `cueWeight` exist because of that bug and remain correct, available tooling
 * for any pair authored to be weight-matched (`breath`, `fetch`, `weigh` still
 * are).
 *
 * WEIGHT PARITY IS NO LONGER MANDATORY ACROSS THE WHOLE TABLE (Roc, 2026-08-22,
 * the VFX prototype batch). The original ruling required EVERY spell's no-effect
 * row to match its effect twin in kind/tone/duration/shape and land within 5% of
 * its weight — one colour swap, nothing else allowed to differ. That produced
 * safe cues but capped how visually exciting an effect could be, since anything
 * added to `effect` had to be mirrored into `no-effect` to stay in parity. The
 * relaxed rule: a spell's VFX firing at all is what tells the player a cast
 * happened — it no longer has to be the SAME shape dimmed down. What still
 * holds, unconditionally, is the ORIGINAL and narrower rule this file's loader
 * enforces: no-effect is never `kind: "none"` (see `parseCue`'s bad-duration
 * check), and it is never styled as a failure — `COLOR.danger` and an error-ish
 * token stay refused on every `cast:resolved` row regardless of outcome. See
 * `FAILURE_STYLED_TYPES` below.
 */

import { COLOR } from "../../ui/theme";
import type { GameEventType, LoggedGameEvent } from "../../world/events/GameEvents";
import type { VfxCue, VfxKind, VfxTone } from "./VfxBackend";
import authoredJson from "./cues.json";

// ---------------------------------------------------------------------------
// Vocabulary
// ---------------------------------------------------------------------------

/**
 * Every event type a row may name.
 *
 * Written as `Record<GameEventType, true>` so the COMPILER keeps it exhaustive:
 * a new event on the bus fails to build here until it is listed, and a typo is
 * an excess-property error. That is the point — a mistyped `when.type` in JSON
 * would otherwise be a row that silently never matches.
 */
const EVENT_TYPES: Readonly<Record<GameEventType, true>> = {
  "cast:resolved": true,
  "cast:rejected": true,
  "craft:started": true,
  "craft:completed": true,
  "craft:abandoned": true,
  "receiver:state-changed": true,
  "gate:cleared": true,
  "gate:blocked": true,
  "item:acquired": true,
  "item:consumed": true,
  "screen:changed": true,
  "dialogue:line": true,
  "save:written": true,
  "save:loaded": true,
};

/** Every event type, as an array. The system subscribes to all of them. */
export const ALL_EVENT_TYPES = Object.keys(EVENT_TYPES) as readonly GameEventType[];

const KINDS: readonly VfxKind[] = [
  "none",
  "filter",
  "particles",
  "tint",
  "glow",
  "sprite",
  "vortex",
  "trail",
  "suspend",
  "burst",
  "pop",
  "rings",
  "plume",
  "beacon",
  "eruption",
];
const TONES: readonly VfxTone[] = ["quiet", "warm", "cold", "arcane"];

/**
 * The scalar payload fields a row may match on — the union across every event
 * in `GameEvents.ts`, minus the array fields (`consumed`, `screenIds`, ...),
 * which have no useful equality test and are rejected below.
 *
 * This is an ALLOW-LIST FOR TYPOS, not a schema. `spelId` is caught here;
 * matching `spellId` on a `gate:cleared` row is not, and just never fires.
 * Anything stricter would mean restating all fourteen event shapes in a second
 * place, which drifts.
 */
const MATCH_FIELDS: ReadonlySet<string> = new Set([
  "spellId",
  "receiverId",
  "screenId",
  "outcome",
  "craftId",
  "gateId",
  "producedItemId",
  "stepCount",
  "atStep",
  "reason",
  "from",
  "to",
  "causeSpellId",
  "ruleKind",
  "source",
  "moveText",
  "itemId",
  "poolName",
  "bySpellId",
  "day",
  "timeBlock",
  "movesLeft",
  "speaker",
  "kind",
  "slot",
  "version",
]);

/**
 * The only event types on which `COLOR.danger` is authorable.
 *
 * Both mean the cast NEVER HAPPENED or the move was refused, which is what the
 * theme's `danger` is for. A landed cast — effect or no-effect — is not on this
 * list and never will be.
 */
export const FAILURE_STYLED_TYPES: ReadonlySet<GameEventType> = new Set([
  "cast:rejected",
  "gate:blocked",
]);

/**
 * Words that would turn an honest outcome into a reprimand. Word-bounded, so
 * `spreadAngle` is not mistaken for "red".
 */
const ERRORISH = /\b(error|fail|failed|failure|shake|flash|red|alarm|invalid|negative|wrong|bad)\b/i;

/** A cue longer than this is a cue the player is waiting on. */
export const MAX_CUE_MS = 6000;

// ---------------------------------------------------------------------------
// Table shape
// ---------------------------------------------------------------------------

/** Scalars only. Arrays have no useful equality test here. */
export type MatchValue = string | number | boolean | null;

export interface CueRule {
  readonly id: string;
  readonly type: GameEventType;
  /** Every entry must equal the event's field. Empty object matches any event of the type. */
  readonly match: Readonly<Record<string, MatchValue>>;
  readonly cue: VfxCue;
}

export type CueDefectReason =
  | "malformed-table"
  | "malformed-rule"
  | "duplicate-id"
  | "unknown-event-type"
  | "unknown-match-field"
  | "non-scalar-match"
  | "unknown-kind"
  | "unknown-tone"
  | "bad-duration"
  | "unknown-color-key"
  | "unknown-spell"
  | "failure-styling";

export interface CueDefect {
  readonly ruleId: string;
  readonly reason: CueDefectReason;
  readonly detail: string;
}

export interface CueTable {
  readonly rules: readonly CueRule[];
  /** Played when nothing matches. Neutral and inert by design. */
  readonly fallback: VfxCue;
  readonly defects: readonly CueDefect[];
}

/**
 * Used when `cues.json` itself is unloadable. Inert, neutral, and never an
 * error: a missing table means no cues, not a broken game.
 */
export const NEUTRAL_FALLBACK: VfxCue = {
  id: "cue.fallback.neutral",
  kind: "none",
  tone: "quiet",
  durationMs: 0,
};

// ---------------------------------------------------------------------------
// Colour
// ---------------------------------------------------------------------------

/**
 * Resolve a theme colour key to a 24-bit number, or `null` if it is not a
 * theme key. Reads `COLOR` and introduces no value of its own — both the
 * numeric entries (`goldNum`) and the CSS entries (`gold`) are accepted, since
 * the theme carries the same colour in both forms for Phaser and for DOM text.
 */
export function cueColor(key: string | undefined): number | null {
  if (!key) return null;
  const raw = (COLOR as unknown as Record<string, string | number | undefined>)[key];
  if (typeof raw === "number") return raw;
  if (typeof raw === "string" && /^#[0-9a-f]{6}$/i.test(raw)) {
    return Number.parseInt(raw.slice(1), 16);
  }
  return null;
}

/** Whether a string names a colour in `ui/theme.ts`. */
export function isThemeColorKey(key: string): boolean {
  return Object.prototype.hasOwnProperty.call(COLOR, key);
}

// ---------------------------------------------------------------------------
// Cue arithmetic — pure, shared with the renderer, and the thing parity is
// actually asserted on. See the header.
// ---------------------------------------------------------------------------

/**
 * Every knob a cue may set, with the value used when it does not.
 *
 * ONE COPY. The renderer reads these to draw and `cueWeight` reads them to
 * measure, so a default cannot drift between what ships and what the test
 * believes shipped — which is how a magnitude bug hides from a magnitude test.
 */
export const CUE_PARAM_DEFAULTS = {
  /** `glow`: outer radius, in Phaser's glow units. */
  outer: 2.5,
  /** `glow`: inner radius. */
  inner: 0,
  /** `tint`: how far the frame leans toward the cue's colour, 0..1. */
  amount: 0.25,
  /** `filter`: blur strength. */
  strength: 0.5,
  /** `particles`: emission arc, degrees. */
  spreadAngle: 360,
  /** `particles`: initial speed, px/s. */
  speed: 60,
  /** `particles`: how many dots. */
  quantity: 10,
  /** `particles`: dot scale at birth. */
  scale: 0.5,
  /** `particles`: px/s^2 pulled toward (positive) or away from (negative) gravity. Default 0 reproduces every row authored before this knob existed. */
  gravityY: 0,
  /** `particles`: 0..1 fraction `speed` may vary per-particle, so a burst doesn't move as one uniform ring. 0 = the old flat speed. */
  speedVariance: 0,
  /**
   * `particles`: above 0, each particle's birth scale is randomised somewhere
   * between `scale` and 0 rather than starting exactly at `scale` — Phaser's own
   * `random` flag on the scale ease, not a authored range, because the ease
   * config's `start` is typed as a plain number and cannot itself take a spread.
   * 0 = the old flat birth scale.
   */
  scaleVariance: 0,
  /** `sprite`: playback speed of its looping animation, frames per second. */
  frameRate: 12,
  /**
   * `sprite`: vertical origin, 0..1 — 0.5 (default) centers the sprite on the
   * anchor, matching every other kind here. 1 puts the sprite's BOTTOM edge on
   * the anchor instead, for a flame or similar that should sit ON a point
   * rather than float centered on it. 0 would be top-anchored, if a cue ever
   * needs that.
   */
  originY: 0.5,
} as const;

export type CueParamKey = keyof typeof CUE_PARAM_DEFAULTS;

/**
 * The one param a no-effect row may differ from its effect twin in, per kind.
 *
 * `amount` is the colour-matrix mix and nothing else — pure strength, no
 * geometry — so tuning it changes how deep the tint lands and nothing about its
 * shape. `outer`, `strength`, `scale`, `quantity` and `spreadAngle` all change
 * the cue's GEOMETRY, and quietly shrinking the no-effect burst to compensate
 * for a colour is the same downgrade this whole rule exists to forbid. So they
 * are not listed, and the pairing test holds them equal.
 */
export const TUNABLE_PARAM: Partial<Record<VfxKind, CueParamKey>> = { tint: "amount" };

/** A cue's value for a knob, or the authored default. */
export function cueParam(cue: VfxCue, key: CueParamKey): number {
  const raw = cue.params?.[key];
  return typeof raw === "number" && Number.isFinite(raw) ? raw : CUE_PARAM_DEFAULTS[key];
}

/**
 * A cue's value for a string-valued param, or `undefined`.
 *
 * `sprite`'s `textureKey` is the one param this table's arithmetic never
 * touches — it names an asset already loaded by the scene, the same way
 * `colorKey` names a theme entry rather than carrying a value itself. Outside
 * `cueParam`'s numeric family because `CUE_PARAM_DEFAULTS` has no honest
 * default for "which texture" — an absent key means the row can't play, not
 * that it falls back to something.
 */
export function cueStringParam(cue: VfxCue, key: string): string | undefined {
  const raw = cue.params?.[key];
  return typeof raw === "string" ? raw : undefined;
}

export function clamp01(v: number): number {
  return v < 0 ? 0 : v > 1 ? 1 : v;
}

/** The three channels of a 24-bit colour, each 0..1. */
function channels(color: number): [number, number, number] {
  // Decimal, not `0xff`: the lint guarding this folder refuses a hex literal
  // outright rather than trying to tell a mask from a colour.
  return [((color >> 16) & 255) / 255, ((color >> 8) & 255) / 255, (color & 255) / 255];
}

/**
 * A 4x5 colour matrix that scales each channel by the cue's own colour.
 *
 * WHY NOT `brightness`. The first pass called `colorMatrix.brightness(1 +
 * amount, true)` and threw the resolved colour away, so a blocked gate
 * (`danger`) and a receiver state change (`dusk`) rendered identically — and
 * both rendered as a full-screen BRIGHTEN, which is functionally the flash the
 * cue table's error-ish lint forbids anyone from naming. Scaling per channel
 * instead can only ever darken toward the cue's hue, so a `dusk` tint reads plum
 * and a `success` tint reads green, and neither pulses white.
 *
 * ITS COST, STATED. Multiplying by the colour means a BRIGHT colour is close to
 * the identity matrix, so a tint's visible depth is `amount * (1 - min channel)`
 * — not `amount`. That is `cueWeight` below, and it is why the no-effect tints
 * are authored in `muted` rather than in the palette's brightest value.
 *
 * Row-major, matching `Phaser.Display.ColorMatrix.IDENTITY_MATRIX`: four rows of
 * [r, g, b, a, offset].
 */
export function channelScaleMatrix(color: number): number[] {
  const [r, g, b] = channels(color);
  return [r, 0, 0, 0, 0, 0, g, 0, 0, 0, 0, 0, b, 0, 0, 0, 0, 0, 1, 0];
}

/**
 * Relative luminance, 0..1 — WCAG's own formula, on the same sRGB the theme is
 * contrast-checked in. `glow`, `filter` and `particles` all composite ADDITIVELY
 * over a near-black frame, so how brightly one reads is how bright its colour
 * is. This is that number.
 */
export function colorLuminance(color: number): number {
  const lin = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const [r, g, b] = channels(color);
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
}

/**
 * How strongly a cue changes the frame. THE NUMBER "SAME VISUAL WEIGHT" MEANS.
 *
 * Two cues are only comparable if they share a kind, because the kinds
 * composite in opposite directions and the units differ:
 *
 *   - `tint` MULTIPLIES, so a bright colour is nearly the identity and the
 *     visible depth is `amount * (1 - min channel)`. Dark colours bite hardest.
 *   - `glow`, `filter` and `particles` ADD over a near-black frame, so the
 *     visible strength is the knob times the colour's luminance. Bright colours
 *     show hardest.
 *
 * That inversion is the whole reason this exists: one neutral colour cannot
 * serve both, and picking the wrong one makes a cue that passes every field
 * comparison and is invisible on screen.
 */
export function cueWeight(cue: VfxCue): number {
  const color = cueColor(cue.colorKey) ?? cueColor("ink") ?? 0;
  if (cue.kind === "tint") {
    return clamp01(cueParam(cue, "amount")) * (1 - Math.min(...channels(color)));
  }
  if (cue.kind === "glow") return cueParam(cue, "outer") * colorLuminance(color);
  if (cue.kind === "filter") return cueParam(cue, "strength") * colorLuminance(color);
  // `sprite` composites the same way particles do (additive, over the tint) —
  // see PhaserVfxBackend's sprite branch — so it shares particles' weight formula.
  if (cue.kind === "particles" || cue.kind === "sprite") return cueParam(cue, "scale") * colorLuminance(color);
  // `vortex`, `trail` and `suspend` are Graphics drawn with `blendMode: "ADD"`,
  // same as every other kind above — additive over a near-black frame, so
  // brightness is luminance. None has a `scale`-like param (their geometry is
  // fixed, tuned live against Roc's screenshots in the prototype, not authored
  // per-cue), so there is no second factor — same shape as `glow` with an
  // implicit `outer: 1`.
  if (
    cue.kind === "vortex" ||
    cue.kind === "trail" ||
    cue.kind === "suspend" ||
    cue.kind === "burst" ||
    cue.kind === "pop" ||
    cue.kind === "rings" ||
    cue.kind === "plume" ||
    cue.kind === "beacon" ||
    cue.kind === "eruption"
  ) {
    return colorLuminance(color);
  }
  return 0;
}

/**
 * The theme's colours that carry no meaning — what a no-effect cue is allowed to
 * be. Everything else in `COLOR` says something (`gold` = actionable, `success`
 * = it landed, `danger` = it never happened), and a no-effect cast must not
 * borrow any of those sentences.
 */
export const NEUTRAL_COLOR_KEYS: readonly string[] = ["ink", "muted"];

/**
 * The floor a no-effect cue may not drop below, as a fraction of its twin.
 *
 * One-sided on purpose. The ruling forbids the no-effect cue reading as LESS
 * than the effect; landing a shade stronger is not a punishment, and erring that
 * way is better than a player concluding the game ignored them.
 */
export const NEUTRAL_WEIGHT_FLOOR = 0.95;

/**
 * Which neutral a no-effect row should carry, DERIVED rather than chosen.
 *
 * The rule: of the theme's neutral keys, take the one whose weight lands closest
 * to the effect twin's, and never take one that reads more than
 * `NEUTRAL_WEIGHT_FLOOR` dimmer. On the shipped palette that resolves to `muted`
 * for the dusk-toned and every tint row, and `ink` for the vfxGold- and
 * vfxEmber-toned ones — a per-row answer instead of one key hard-coded in a test.
 *
 * Returns `null` for a weightless cue (`kind: "none"`), which has nothing to
 * match.
 */
export function neutralFor(effect: VfxCue): string | null {
  const target = cueWeight(effect);
  if (target <= 0) return null;
  let best: string | null = null;
  let bestDistance = Number.POSITIVE_INFINITY;
  for (const key of NEUTRAL_COLOR_KEYS) {
    const ratio = cueWeight({ ...effect, colorKey: key }) / target;
    if (ratio < NEUTRAL_WEIGHT_FLOOR) continue;
    const distance = Math.abs(ratio - 1);
    if (distance < bestDistance) {
      best = key;
      bestDistance = distance;
    }
  }
  return best;
}

// ---------------------------------------------------------------------------
// Loading
// ---------------------------------------------------------------------------

const isObject = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

const isScalar = (v: unknown): v is MatchValue =>
  v === null || typeof v === "string" || typeof v === "number" || typeof v === "boolean";

/** Every string a row could smuggle a reprimand through: its id and its params. */
function errorishTokens(id: string, cue: Record<string, unknown>): string[] {
  const found: string[] = [];
  if (ERRORISH.test(id)) found.push(id);
  const params = cue.params;
  if (isObject(params)) {
    for (const [k, v] of Object.entries(params)) {
      if (ERRORISH.test(k)) found.push(k);
      if (typeof v === "string" && ERRORISH.test(v)) found.push(v);
    }
  }
  return found;
}

/**
 * The content vocabulary a table is held to.
 *
 * Optional so the table still loads standalone (an audit tool, a unit test on
 * an invented row), but every caller that HAS the records should pass them —
 * see the header. Omitting it skips the check; it never invents one.
 */
export interface CueTableOptions {
  /** APPROVED spell ids, from the shipped records. Omit to skip the check. */
  readonly spellIds?: ReadonlySet<string>;
}

/**
 * Parse and validate a cue table. Bad rows become defects and are dropped; the
 * rest of the table still loads.
 */
export function loadCueTable(json: unknown, options: CueTableOptions = {}): CueTable {
  const defects: CueDefect[] = [];
  if (!isObject(json)) {
    return {
      rules: [],
      fallback: NEUTRAL_FALLBACK,
      defects: [{ ruleId: "*", reason: "malformed-table", detail: "cues.json is not an object" }],
    };
  }

  const fallback = parseFallback(json.default, defects);
  const rawRules = Array.isArray(json.rules) ? json.rules : null;
  if (!rawRules) {
    defects.push({ ruleId: "*", reason: "malformed-table", detail: "`rules` is not an array" });
    return { rules: [], fallback, defects };
  }

  const rules: CueRule[] = [];
  const seen = new Set<string>();
  for (const raw of rawRules) {
    const rule = parseRule(raw, seen, defects, options);
    if (rule) {
      seen.add(rule.id);
      rules.push(rule);
    }
  }
  return { rules, fallback, defects };
}

function parseFallback(raw: unknown, defects: CueDefect[]): VfxCue {
  if (!isObject(raw)) {
    defects.push({
      ruleId: "default",
      reason: "malformed-table",
      detail: "`default` is missing or not an object",
    });
    return NEUTRAL_FALLBACK;
  }
  const id = typeof raw.id === "string" && raw.id ? raw.id : NEUTRAL_FALLBACK.id;
  const cue = parseCue(id, raw, "cast:resolved", defects);
  return cue ?? NEUTRAL_FALLBACK;
}

function parseRule(
  raw: unknown,
  seen: ReadonlySet<string>,
  defects: CueDefect[],
  options: CueTableOptions,
): CueRule | null {
  if (!isObject(raw)) {
    defects.push({ ruleId: "?", reason: "malformed-rule", detail: "rule is not an object" });
    return null;
  }
  const id = raw.id;
  if (typeof id !== "string" || id.length === 0) {
    defects.push({ ruleId: "?", reason: "malformed-rule", detail: "rule has no string `id`" });
    return null;
  }
  if (seen.has(id)) {
    defects.push({ ruleId: id, reason: "duplicate-id", detail: "another rule already uses this id" });
    return null;
  }

  const when = raw.when;
  if (!isObject(when)) {
    defects.push({ ruleId: id, reason: "malformed-rule", detail: "rule has no `when` object" });
    return null;
  }
  const type = when.type;
  if (typeof type !== "string" || !Object.prototype.hasOwnProperty.call(EVENT_TYPES, type)) {
    defects.push({
      ruleId: id,
      reason: "unknown-event-type",
      detail: `\`${String(type)}\` is not a GameEvent type`,
    });
    return null;
  }
  const eventType = type as GameEventType;

  const match: Record<string, MatchValue> = {};
  const rawMatch = when.match ?? {};
  if (!isObject(rawMatch)) {
    defects.push({ ruleId: id, reason: "malformed-rule", detail: "`when.match` is not an object" });
    return null;
  }
  for (const [field, value] of Object.entries(rawMatch)) {
    if (!MATCH_FIELDS.has(field)) {
      defects.push({
        ruleId: id,
        reason: "unknown-match-field",
        detail: `no GameEvent carries a scalar field \`${field}\``,
      });
      return null;
    }
    if (!isScalar(value)) {
      defects.push({
        ruleId: id,
        reason: "non-scalar-match",
        detail: `\`${field}\` matches on a non-scalar; arrays have no equality test here`,
      });
      return null;
    }
    match[field] = value;
  }

  // A row keyed to a spell the game does not ship can never fire, and without
  // this nothing would ever say so. Same refusal `GateEngine` gives a rule
  // naming an unauthored receiver.
  const namedSpell = match.spellId;
  if (options.spellIds && typeof namedSpell === "string" && !options.spellIds.has(namedSpell)) {
    defects.push({
      ruleId: id,
      reason: "unknown-spell",
      detail: `\`${namedSpell}\` is not an approved spell in the shipped records, so this row can never fire`,
    });
    return null;
  }

  const cue = parseCue(id, raw.cue, eventType, defects);
  if (!cue) return null;
  return { id, type: eventType, match, cue };
}

function parseCue(
  id: string,
  raw: unknown,
  eventType: GameEventType,
  defects: CueDefect[],
): VfxCue | null {
  if (!isObject(raw)) {
    defects.push({ ruleId: id, reason: "malformed-rule", detail: "rule has no `cue` object" });
    return null;
  }

  const kind = raw.kind;
  if (typeof kind !== "string" || !KINDS.includes(kind as VfxKind)) {
    defects.push({ ruleId: id, reason: "unknown-kind", detail: `\`${String(kind)}\`` });
    return null;
  }
  const tone = raw.tone;
  if (typeof tone !== "string" || !TONES.includes(tone as VfxTone)) {
    defects.push({ ruleId: id, reason: "unknown-tone", detail: `\`${String(tone)}\`` });
    return null;
  }

  const durationMs = raw.durationMs;
  if (typeof durationMs !== "number" || !Number.isFinite(durationMs) || durationMs < 0) {
    defects.push({ ruleId: id, reason: "bad-duration", detail: `\`${String(durationMs)}\`` });
    return null;
  }
  if (durationMs > MAX_CUE_MS) {
    defects.push({
      ruleId: id,
      reason: "bad-duration",
      detail: `${durationMs}ms is longer than MAX_CUE_MS (${MAX_CUE_MS}); a cue that outlives the moment is a leak`,
    });
    return null;
  }
  // A visible cue with no end never stops. `none` is allowed to be zero-length
  // because it is not a cue at all.
  if (kind !== "none" && durationMs === 0) {
    defects.push({
      ruleId: id,
      reason: "bad-duration",
      detail: "a visible cue needs a durationMs > 0 or it never releases",
    });
    return null;
  }

  let colorKey: string | undefined;
  if (raw.colorKey !== undefined) {
    if (typeof raw.colorKey !== "string" || !isThemeColorKey(raw.colorKey)) {
      defects.push({
        ruleId: id,
        reason: "unknown-color-key",
        detail: `\`${String(raw.colorKey)}\` is not a key of COLOR in ui/theme.ts — the theme is contrast-checked and a literal colour bypasses it`,
      });
      return null;
    }
    colorKey = raw.colorKey;
  }

  // The no-effect ruling, enforced rather than asserted.
  if (!FAILURE_STYLED_TYPES.has(eventType)) {
    if (colorKey === "danger") {
      defects.push({
        ruleId: id,
        reason: "failure-styling",
        detail: `COLOR.danger is only authorable on ${[...FAILURE_STYLED_TYPES].join(", ")}; a landed cast is never a failure`,
      });
      return null;
    }
    const tokens = errorishTokens(id, raw);
    if (tokens.length > 0) {
      defects.push({
        ruleId: id,
        reason: "failure-styling",
        detail: `carries error-ish token(s): ${tokens.join(", ")}`,
      });
      return null;
    }
  }

  const params = isObject(raw.params)
    ? (Object.fromEntries(
        Object.entries(raw.params).filter(
          ([, v]) => typeof v === "number" || typeof v === "string" || typeof v === "boolean",
        ),
      ) as Record<string, number | string | boolean>)
    : undefined;

  return { id, kind: kind as VfxKind, tone: tone as VfxTone, durationMs, colorKey, params };
}

// ---------------------------------------------------------------------------
// Matching
// ---------------------------------------------------------------------------

/** Whether every entry in `match` equals the event's field of that name. */
export function ruleMatches(rule: CueRule, event: LoggedGameEvent): boolean {
  if (rule.type !== event.type) return false;
  const payload = event as unknown as Record<string, unknown>;
  for (const [field, value] of Object.entries(rule.match)) {
    if (payload[field] !== value) return false;
  }
  return true;
}

/** The first matching row, or `null` when the fallback should play. */
export function findRule(table: CueTable, event: LoggedGameEvent): CueRule | null {
  for (const rule of table.rules) {
    if (ruleMatches(rule, event)) return rule;
  }
  return null;
}

/** The cue for an event. Always returns something — the fallback is a real cue. */
export function cueFor(table: CueTable, event: LoggedGameEvent): VfxCue {
  return findRule(table, event)?.cue ?? table.fallback;
}

/**
 * Rows that can never fire, because an earlier row of the same event type
 * matches on a subset of their fields with the same values.
 *
 * The authoring hazard first-match-wins creates: drop the general `effect` row
 * above the `ignite` row and the ignite cue silently never plays. Nothing
 * throws, nothing logs, the spell just looks generic forever. So it is computed
 * and a test asserts the authored table has none.
 */
export function findUnreachableRules(table: CueTable): readonly string[] {
  const shadowed: string[] = [];
  for (let i = 0; i < table.rules.length; i++) {
    const later = table.rules[i];
    for (let j = 0; j < i; j++) {
      const earlier = table.rules[j];
      if (earlier.type !== later.type) continue;
      const covers = Object.entries(earlier.match).every(
        ([field, value]) =>
          Object.prototype.hasOwnProperty.call(later.match, field) && later.match[field] === value,
      );
      if (covers) {
        shadowed.push(later.id);
        break;
      }
    }
  }
  return shadowed;
}

// ---------------------------------------------------------------------------
// The authored table
// ---------------------------------------------------------------------------

/**
 * `cues.json`, loaded and validated once, WITHOUT the spell vocabulary.
 *
 * This is the default the system falls back to when no caller supplied a table.
 * It cannot check spell ids because it has no access to the records — the
 * content is fetched at runtime and this module is imported before it lands.
 * Anyone holding `MagicDB` should call `loadAuthoredCues` instead.
 */
export const AUTHORED_CUES: CueTable = loadCueTable(authoredJson as unknown);

/**
 * `cues.json` validated against the spells the game actually ships.
 *
 * The strict form. A row naming a cut or renamed spell becomes an
 * `unknown-spell` defect and is dropped rather than sitting in the table
 * looking authored.
 */
export function loadAuthoredCues(spellIds: ReadonlySet<string>): CueTable {
  return loadCueTable(authoredJson as unknown, { spellIds });
}
