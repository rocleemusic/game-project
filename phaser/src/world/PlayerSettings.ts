/**
 * The REAL, persisted player settings this build has: how fast the backdrop
 * pan eases toward the mouse, how long a scene/modal takes to fade in
 * (Roc, 2026-08-21), and — added 2026-08-22 as foundation for the cast-picker
 * and satchel-drop tracks — hint strength and drop-confirmation, and — added
 * 2026-08-24 — how dark the backdrop scrim is. Everything
 * in `OptionsScene`'s other categories (Sound, Text & Speed, Saves) is still
 * a deliberately INERT preview (see that file's header — no `SettingsStore`
 * exists yet; wiring real rows ahead of the rest is the pattern now, not the
 * exception, but it only happens where a control has a real setting to back
 * it).
 *
 * `localStorage`, not a save slot — these are device preferences, not game
 * state; they must survive "New Life" and outlive any single save.
 */

import { PAN_SMOOTH_TAU } from "./view/PanModel";

function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

function loadNumber(key: string, min: number, max: number, fallback: number): number {
  try {
    const raw = localStorage.getItem(key);
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? clamp(parsed, min, max) : fallback;
  } catch {
    return fallback;
  }
}

function saveNumber(key: string, value: number): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // A private-browsing quota block loses the preference, not the game.
  }
}

function loadBool(key: string, fallback: boolean): boolean {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : raw === "true";
  } catch {
    return fallback;
  }
}

function saveBool(key: string, value: boolean): void {
  try {
    localStorage.setItem(key, String(value));
  } catch {
    // A private-browsing quota block loses the preference, not the game.
  }
}

/** Enum-style persistence — a fixed set of string values, same shape as
 * `loadNumber`'s clamp: an unrecognized or missing stored value falls back
 * rather than trusting raw `localStorage` content. */
function loadEnum<T extends string>(key: string, values: readonly T[], fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw !== null && (values as readonly string[]).includes(raw) ? (raw as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveEnum(key: string, value: string): void {
  try {
    localStorage.setItem(key, value);
  } catch {
    // A private-browsing quota block loses the preference, not the game.
  }
}

// --- Pan Speed ---------------------------------------------------------

const PAN_TAU_KEY = "lantern:settings:panTauMs";

/** Slider range. Lower tau = snappier/faster follow; higher = slower and
 * more languid — see `PanModel`'s own header on what tau means. */
export const PAN_TAU_MIN = 40;
export const PAN_TAU_MAX = 700; // Roc, 2026-08-21: the slow end wasn't slow enough

let panTauMs = loadNumber(PAN_TAU_KEY, PAN_TAU_MIN, PAN_TAU_MAX, PAN_SMOOTH_TAU);

// --- Transition Fade duration -------------------------------------------

const FADE_MS_KEY = "lantern:settings:fadeMs";

/** Slider range, in ms — the `sceneFadeIn` default (`theme.ts`) before this
 * setting existed was a fixed 220. */
export const FADE_MS_MIN = 200;
export const FADE_MS_MAX = 5000; // Roc, 2026-08-22
const FADE_MS_DEFAULT = 220;

let fadeDurationMs = loadNumber(FADE_MS_KEY, FADE_MS_MIN, FADE_MS_MAX, FADE_MS_DEFAULT);

// --- Hint strength --------------------------------------------------------

const HINT_STRENGTH_KEY = "lantern:settings:hintStrength";

/** wireframe §3 — Off: no proactive hints anywhere. Subtle (default): only
 * the post-cast "worth trying" pill, and only when a cast produced something
 * new. Generous: the plausibility grouping shows inside the cast picker
 * itself, before the guess. */
export const HINT_STRENGTH_VALUES = ["off", "subtle", "generous"] as const;
export type HintStrength = (typeof HINT_STRENGTH_VALUES)[number];

let hintStrength: HintStrength = loadEnum(HINT_STRENGTH_KEY, HINT_STRENGTH_VALUES, "subtle");

// --- Drop confirmation ------------------------------------------------------

const DROP_CONFIRM_ALWAYS_KEY = "lantern:settings:dropConfirmAlways";

/** wireframe §7, "Decided (revision 4)" — default `false`: only warn on drop
 * when a known spell still needs the item (`pocket.carriedFor` non-empty).
 * `true` asks every time regardless. */
let dropConfirmAlways = loadBool(DROP_CONFIRM_ALWAYS_KEY, false);

// --- Hub hints --------------------------------------------------------------

const SHOW_HINTS_KEY = "lantern:settings:showHints";

/** Roc, 2026-08-23 review note: "a toggle to be able to hide the hints" — the
 * Home Hub's own instructional copy (the "drag a piece to move it · click to
 * select · ..." control line, and the palette's "drag one into the room, or
 * click it then click a spot" line). Default `true`: a first-time player still
 * gets the how-to text; the toggle is for someone who already knows the
 * controls and wants the room to read as a room, not a tutorial. Distinct
 * from `hintStrength` above, which is the cast-picker's spell-guessing aid —
 * this is decoration-UI copy, not magic feedback. */
let showHints = loadBool(SHOW_HINTS_KEY, true);

// --- Scene dimming (the backdrop scrim) -------------------------------------

const SCRIM_ALPHA_KEY = "lantern:settings:scrimAlpha";

/**
 * How dark the ONE full-bleed scrim over a screen's backdrop art is.
 *
 * Roc, 2026-08-23: "make the overlay scrim closable, or remove it, so we see
 * more of the level." A fixed 0.45 wash hid the art it was painted over. So it
 * became a setting with 0 as a real, reachable value (Options · Display →
 * Scene Dimming, left = off) and a much lighter default.
 *
 * `SCRIM_ALPHA_MAX` is deliberately well short of 1. This is a PREFERENCE
 * feeding a single pooled rectangle, never a stack — the scrim that compounded
 * to black got there by accumulating rectangles, and a cap that cannot reach
 * opaque means even a bug that re-reads this value cannot black the screen out
 * in one object.
 */
export const SCRIM_ALPHA_MIN = 0;
export const SCRIM_ALPHA_MAX = 0.6;
const SCRIM_ALPHA_DEFAULT = 0.2;

let scrimAlpha = loadNumber(
  SCRIM_ALPHA_KEY,
  SCRIM_ALPHA_MIN,
  SCRIM_ALPHA_MAX,
  SCRIM_ALPHA_DEFAULT,
);

export const PlayerSettings = {
  get panTauMs(): number {
    return panTauMs;
  },
  setPanTauMs(value: number): void {
    panTauMs = clamp(value, PAN_TAU_MIN, PAN_TAU_MAX);
    saveNumber(PAN_TAU_KEY, panTauMs);
  },
  /** 0-100, for a slider — the inverse of the tau mapping (100 = fastest). */
  get panSpeedPercent(): number {
    return Math.round(((PAN_TAU_MAX - panTauMs) / (PAN_TAU_MAX - PAN_TAU_MIN)) * 100);
  },
  setPanSpeedPercent(percent: number): void {
    const p = clamp(percent, 0, 100);
    this.setPanTauMs(PAN_TAU_MAX - (p / 100) * (PAN_TAU_MAX - PAN_TAU_MIN));
  },

  get fadeDurationMs(): number {
    return fadeDurationMs;
  },
  setFadeDurationMs(value: number): void {
    fadeDurationMs = clamp(value, FADE_MS_MIN, FADE_MS_MAX);
    saveNumber(FADE_MS_KEY, fadeDurationMs);
  },
  /** 0-100, for a slider — inverted like Pan Speed's, so both sliders share
   * one convention (right = fast/snappy, left = slow). 100 = the shortest
   * fade (`FADE_MS_MIN`). */
  get fadeSpeedPercent(): number {
    return Math.round(((FADE_MS_MAX - fadeDurationMs) / (FADE_MS_MAX - FADE_MS_MIN)) * 100);
  },
  setFadeSpeedPercent(percent: number): void {
    const p = clamp(percent, 0, 100);
    this.setFadeDurationMs(FADE_MS_MAX - (p / 100) * (FADE_MS_MAX - FADE_MS_MIN));
  },

  get hintStrength(): HintStrength {
    return hintStrength;
  },
  setHintStrength(value: HintStrength): void {
    hintStrength = HINT_STRENGTH_VALUES.includes(value) ? value : hintStrength;
    saveEnum(HINT_STRENGTH_KEY, hintStrength);
  },

  get dropConfirmAlways(): boolean {
    return dropConfirmAlways;
  },
  setDropConfirmAlways(value: boolean): void {
    dropConfirmAlways = value;
    saveBool(DROP_CONFIRM_ALWAYS_KEY, dropConfirmAlways);
  },

  get showHints(): boolean {
    return showHints;
  },
  setShowHints(value: boolean): void {
    showHints = value;
    saveBool(SHOW_HINTS_KEY, showHints);
  },

  get scrimAlpha(): number {
    return scrimAlpha;
  },
  setScrimAlpha(value: number): void {
    scrimAlpha = clamp(value, SCRIM_ALPHA_MIN, SCRIM_ALPHA_MAX);
    saveNumber(SCRIM_ALPHA_KEY, scrimAlpha);
  },
  /** 0-100, for a slider. NOT inverted: left = clear, right = darkest, which
   * is the plain reading of a "dimming" control. Pan Speed and Transition
   * Fade share the other convention because both measure a speed. */
  get scrimStrengthPercent(): number {
    return Math.round(
      ((scrimAlpha - SCRIM_ALPHA_MIN) / (SCRIM_ALPHA_MAX - SCRIM_ALPHA_MIN)) * 100,
    );
  },
  setScrimStrengthPercent(percent: number): void {
    const p = clamp(percent, 0, 100);
    this.setScrimAlpha(SCRIM_ALPHA_MIN + (p / 100) * (SCRIM_ALPHA_MAX - SCRIM_ALPHA_MIN));
  },
};
