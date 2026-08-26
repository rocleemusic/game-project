/**
 * The Lantern theme.
 *
 * Grounded in the subject, not a generic dark-mode-plus-gold default: this is
 * a festival of lanterns, kept in a hand-written notebook, in a village at
 * the edge of a forest. So panels read as lamp-lit wood and paper rather than
 * flat UI chrome — a warm brown panel (not near-black), a parchment ink
 * color for body text, lantern gold for the one accent that means
 * "interactive," a brighter gold for hover/active warmth, and a dusk plum
 * used sparingly for anything secondary (bonds, calendar accents).
 *
 * Gold is the §14 Visual Style Guide canonical mockup value (`#c9a15a`), not
 * the original bright lantern gold — repainted in place 2026-08-19 so every
 * gold-accented element (HUD, hotspots, notebook, dialogue, menu chrome)
 * reads from one source. Hover is now a brighter gold (`ember`, `#e6c583`),
 * a brightness shift rather than the old yellow→orange hue shift.
 *
 * Every text/background pair below is contrast-checked at 1.0 alpha — see
 * `GAPS.md`-style discipline: verified, not assumed. Ratios (WCAG AA needs
 * 4.5:1 for body text, 3:1 for large/UI text):
 *   panel/ink    14.06:1   panel/muted  6.06:1   night/gold    7.83:1
 *   gold/onAccent 7.70:1   night/ember 11.37:1   night/dusk    6.89:1
 *   night/success 11.39:1  night/danger 6.90:1
 *   night/dim     7.42:1   panel/dim    6.61:1
 *
 * `prefers-reduced-motion` is read once at module load — Phaser scenes are
 * short-lived and this never changes mid-session, so no listener is needed.
 */

import { PlayerSettings } from "../world/PlayerSettings";

export const COLOR = {
  /** The canvas behind everything — night sky / unlit interior. */
  night: 0x14110c,
  nightHex: "#14110c",
  /** Panel fill — warm lamp-lit wood, not flat black. */
  panel: 0x241c14,
  panelHex: "#241c14",
  /** Panel fill, hovered/lifted. */
  panelHover: 0x2f2519,
  panelHoverHex: "#2f2519",
  /** Hairline borders and dividers. */
  border: 0xc9a15a,
  /** Body text — parchment. */
  ink: "#f4ead6",
  /** Secondary/caption text — still verified against `panel`, not guessed. */
  muted: "#a89a7c",
  /**
   * §14 canonical "secondary text on dark surfaces, disabled labels"
   * (`design-system.html`'s `--dim`). Added 2026-08-22 to close a real AA
   * failure carried across four verifier passes: `HubScene` kept its own
   * local `DIM = "#8d8371"` constant, never read from `COLOR`, that measured
   * as low as ~1.8:1 against its own dark chip backgrounds — well under the
   * 4.5:1 floor. Verified here: night/dim 7.42:1, panel/dim 6.61:1, both
   * clear AA with margin. Kept distinct from `muted` above (a close but
   * separately-tracked value from an earlier pass) rather than merged, so
   * this fix doesn't quietly reinterpret an existing token's calibration.
   */
  dim: "#b0a184",
  /** The one accent that always means "you can act on this." §14 canonical. */
  gold: "#c9a15a",
  goldNum: 0xc9a15a,
  /** Hover/active warmth — the §14 `goldBright`, a brighter gold. Kept the name
   * `ember` to avoid churning every call site; the rename to `goldBright` is
   * deferred debt, tracked in the 08-19 handoff. */
  ember: "#e6c583",
  emberNum: 0xe6c583,
  /**
   * Spell-VFX gold — deliberately NOT `gold`. §14 recolored the menu-chrome gold
   * to `#c9a15a` (2026-08-19). Spell VFX tints the game frame, which sits on the
   * painted-world side of §14's scope, not menu chrome. It also carries a Roc
   * ruling: a no-effect cast must land within 5% of its effect twin's weight
   * (`cueWeight`/`neutralFor` in `render/vfx/CueTable.ts`). The darker menu gold
   * broke that parity — no neutral could match a darker gold tint. So VFX keeps
   * the pre-repaint lantern gold here, referenced by cue rows as `colorKey:
   * "vfxGold"`, and the menu repaint leaves spell rendering untouched. */
  vfxGold: "#ffd479",
  /** Spell-VFX ember — the pre-repaint orange, same decoupling as `vfxGold`.
   * §14 recolored `ember` to a brighter gold for menu hover states, but five
   * spell cues tint `ember` as a spell tone, not a hover. Kept orange here so
   * the menu repaint leaves spell VFX untouched. Cue rows: `colorKey: "vfxEmber"`. */
  vfxEmber: "#ff9d5c",
  /** Spell-VFX blue — this theme otherwise carries no blue at all. Added
   * 2026-08-22 (Roc) for `rings`' note-glyph and star-cloud layers
   * (`tools/vfx-prototypes/echo-demo.html`'s literal `0x5fc9ff`), so those two
   * layers can use the prototype's own hue instead of a substitute — the
   * theme grows to fit the VFX, not the other way round, same reasoning as
   * `vfxGold`/`vfxEmber`. Referenced by `render/vfx/PhaserVfxBackend.ts`'s
   * `WISP` constant, never authored directly in `cues.json`. */
  vfxWisp: "#5fc9ff",
  /** Spell-VFX pale gold — the "just-fired" highlight on a ring's brightest
   * moment, distinct from `vfxGold`'s fuller saturation. Added 2026-08-23
   * (Roc) for `plume`'s two ground rings (`tools/vfx-prototypes/waft-demo.html`'s
   * literal `0xfff0c9`) — same "the theme grows to fit the VFX" reasoning as
   * `vfxWisp`, not a substitute for an existing token. Referenced by
   * `render/vfx/PhaserVfxBackend.ts`'s `GOLD_PALE` constant, never authored
   * directly in `cues.json`. */
  vfxGoldPale: "#fff0c9",
  /** Spell-VFX pale ember — a warm cream core, distinct from `vfxEmber`'s
   * full orange. Added 2026-08-23 (Roc) for `beacon`'s glow core and ring
   * highlight (`tools/vfx-prototypes/steep-demo.html`'s literal `0xffd9b3`),
   * same reasoning as `vfxGoldPale`. Referenced by `PhaserVfxBackend.ts`'s
   * `EMBER_CORE` constant, never authored directly in `cues.json`. */
  vfxEmberPale: "#ffd9b3",
  /** Secondary accent — bond dots, calendar highlights. Used sparingly. */
  dusk: "#a893c9",
  duskNum: 0xa893c9,
  /**
   * §14 canonical "confirmed / known / toggle-on" — the chip `.known` state
   * (item components carried for a known spell, Satchel's own carried-for
   * chips) and, new with the cast-picker redesign, the Generous-hint-strength
   * "worth trying" group in `HedgeCastPrompt`'s book page. Distinct from
   * `success` below (a different hex, a different meaning — "known", not
   * "landed").
   */
  green: "#7f9a5a",
  greenNum: 0x7f9a5a,
  /** Confirmed / effect landed. */
  success: "#9fd7a0",
  /** A cast that failed outright, or a blocked action. */
  danger: "#e2836b",
  /** Text sitting on a gold/ember-filled button. */
  onAccent: "#1a1208",
  onAccentNum: 0x1a1208,

  /**
   * Parchment surfaces — the LIGHT counterpart to `panel`, for detail content
   * that reads as paper laid on the lamp-lit wood: an item inspect card, an
   * options help panel, a save slot. Dark ink sits on these, inverted from the
   * rest of the UI. Contrast verified at 1.0 alpha:
   *   canvas/inkOnCanvas 10.9:1   canvas/inkSoftOnCanvas 4.9:1
   * Introduced with the 2026-08-18 screen mockups (satchel / save-load / options).
   */
  canvas: 0xe7daba,
  canvasHex: "#e7daba",
  canvas2Num: 0xdbcaa2,
  canvasEdgeNum: 0xc3b083,
  inkOnCanvas: "#2f2413",
  inkSoftOnCanvas: "#6b5836",
  /** Stitched-cloth accent (§14 §1) — chip borders, and the on-canvas
   * button's idle border (§14 §4.3): transparent fill, 1px stitch border,
   * ink text, gold on hover. Added for the satchel drop/move controls
   * (2026-08-22), the first on-canvas buttons SatchelScene needed. */
  stitch: "#b79a63",
  stitchNum: 0xb79a63,

  /**
   * Leather + cloth — the satchel's own pouch, ported verbatim from the
   * approved mockup (`tools/screen-flow/mockups/satchel.html`). Satchel is
   * a diegetic object, not a framed page, so it does not use `panel`/`canvas`
   * — see that mockup's header on why it stays unornamented.
   */
  leatherLightNum: 0x6f5030,
  leatherNum: 0x4a3520,
  leatherDarkNum: 0x2c1f12,
  leatherDarkHex: "#2c1f12",
  pocketNum: 0xc9b78d,
  /** CSS-string sibling of `pocketNum`, for Phaser Text `backgroundColor`
   * fields (which take a string, not a numeric fill) — same Num/Hex pairing
   * `night`/`nightHex` already establishes, added for the Hub's palette chip
   * background (2026-08-22 hex-literal sweep). */
  pocketHex: "#c9b78d",
  pocketEmptyNum: 0x5f4f32,
  /** Empty-pocket placeholder label ("Empty") — ported verbatim from the
   * mockup's `.pocket.empty .nm`. Distinct from `muted`, which is
   * contrast-calibrated against `panel`, not the leather pouch. */
  mutedOnLeather: "#9c8a63",
  /** Satchel inspect-card "carried for" chip backgrounds — added with the
   * satchel drop/move controls (2026-08-22). Pastel, canvas-lightness tints
   * (paired with `inkOnCanvas` text) so the known/unknown carried-for state
   * reads without competing with the parchment inspect panel. */
  chipKnownBg: "#cfe0c2",
  chipUnknownBg: "#e9dcb8",
} as const;

/**
 * Two families, two jobs. §14 §2 names them but the call sites had drifted
 * (mono-vs-serif chosen per screen), so the rule is written here once and every
 * `fontFamily:` in `src/` is expected to follow it. Decide in this order:
 *
 * 1. **Is it a control the player clicks to act?** → `mono`. Every button and
 *    pill: §14 §4.2 utility pills (`ui/buttons.ts`), §4.3 on-canvas parchment
 *    buttons, tabs, chips, badges, remove/flip pills, key hints ("Esc to
 *    close"). The one exception is §4.1's *primary/choice* pill — a dialogue
 *    answer or a traversal move, which is narrative text you happen to pick,
 *    not chrome — and that stays `display` (`DialogueSystem`, `TraversalRow`).
 * 2. **Otherwise, go by what the text IS.**
 *    - `display` — names and titles (screen titles, item names, spell phrases,
 *      NPC nameplates) and any full sentence the game says to you (dialogue,
 *      descriptions, tooltips, gate reasons, empty states, hints, subtitles).
 *      §14 §2: "Titles, item names, dialogue/choice text, descriptions."
 *    - `mono` — data and short chrome labels: counts, ratios, timestamps,
 *      capacity readouts, uppercase eyebrows/kickers ("CARRIED FOR"), surface
 *      labels, dev/debug overlays. §14 §2: "Buttons, labels, counts, eyebrows,
 *      HUD text."
 *
 * These are the bare, engine-safe subsets of §14's fuller stacks (which both
 * degrade to exactly these) — adopting the richer stacks is a separate,
 * deliberate change, not something to do by accident during a sweep.
 */
export const FONT = {
  /** Prose voice — names, titles, sentences, dialogue and choice text. */
  display: "Georgia, serif",
  /** Interface voice — buttons, chips, labels, counts, eyebrows, HUD data. */
  mono: "monospace",
} as const;

/**
 * Gold corner brackets around a panel — the framed-menu language from the UI
 * asset kit (`assets/ui-icons`), at Phaser fidelity. Restrained on purpose: a
 * right-angle bracket plus a stud at each corner, not full scrollwork, so it
 * frames a modal without shouting over the content. Returns one Graphics object
 * so the caller can push it onto a modal's destroy layer.
 */
export function filigreeCorners(
  scene: Phaser.Scene,
  cx: number,
  cy: number,
  w: number,
  h: number,
  depth = 0,
): Phaser.GameObjects.Graphics {
  const g = scene.add.graphics().setDepth(depth);
  const L = 20;
  const inset = 12;
  const x0 = cx - w / 2 + inset;
  const x1 = cx + w / 2 - inset;
  const y0 = cy - h / 2 + inset;
  const y1 = cy + h / 2 - inset;
  const corners: ReadonlyArray<readonly [number, number, number, number]> = [
    [x0, y0, 1, 1],
    [x1, y0, -1, 1],
    [x0, y1, 1, -1],
    [x1, y1, -1, -1],
  ];
  for (const [x, y, sx, sy] of corners) {
    g.lineStyle(2, COLOR.goldNum, 0.85);
    g.beginPath();
    g.moveTo(x + sx * L, y);
    g.lineTo(x, y);
    g.lineTo(x, y + sy * L);
    g.strokePath();
    g.fillStyle(COLOR.goldNum, 0.9);
    g.fillCircle(x, y, 2.4);
  }
  return g;
}

export const REDUCED_MOTION =
  typeof window !== "undefined" &&
  typeof window.matchMedia === "function" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * The whole-screen version of `popIn`, below — a scene's own camera fading
 * in from `COLOR.night` at `create()`, for a screen (not one object) arriving
 * (Roc, 2026-08-21: the spell-clue modal's pop-in should be how every modal
 * and every scene change arrives, not just that one). Safe to call on a
 * paused-overlay scene stacked over another (its camera only covers its own
 * viewport) as well as a full scene change.
 */
export function sceneFadeIn(scene: Phaser.Scene, ms?: number): void {
  if (REDUCED_MOTION) return;
  scene.cameras.main.fadeIn(ms ?? PlayerSettings.fadeDurationMs, 0x14, 0x11, 0x0c);
}

/**
 * `sceneFadeIn`'s missing other half — fades the *current* scene's camera to
 * night before it hands off, so a scene change crossfades instead of hard-
 * cutting into the next scene's own `sceneFadeIn`. `onComplete` fires once
 * the fade finishes (or immediately under reduced motion, which never
 * fades). Callers use this in place of a bare `this.scene.start(...)` at a
 * transition point — see `sceneTransition` below for the common case.
 */
export function sceneFadeOut(scene: Phaser.Scene, onComplete: () => void, ms?: number): void {
  if (REDUCED_MOTION) {
    onComplete();
    return;
  }
  const duration = ms ?? PlayerSettings.fadeDurationMs;
  scene.cameras.main.fadeOut(duration, 0x14, 0x11, 0x0c, (_cam: unknown, progress: number) => {
    if (progress >= 1) onComplete();
  });
}

/**
 * Crossfade into another scene: fade the current scene's camera out, then
 * `scene.start(key, data)` on completion. The target scene's own `create()`
 * calling `sceneFadeIn` supplies the other half, so the handoff reads as one
 * continuous fade through night rather than a cut followed by a fade-in.
 */
export function sceneTransition(scene: Phaser.Scene, key: string, data?: object, ms?: number): void {
  sceneFadeOut(scene, () => scene.scene.start(key, data), ms);
}

/**
 * A single object's fade — no scale-pop, unlike `popIn` below, so a full-bleed
 * backdrop image doesn't visibly zoom. For a backdrop swapping WITHIN a scene
 * (F1 -> F2, a `BackdropSystem.sync()` within `CollectScene`), which never
 * runs through `create()` and so never sees `sceneFadeIn` (Roc, 2026-08-22:
 * "going from F1 to F2 ... doesn't seem to fade" — right, it can't, that's a
 * same-scene screen change, not a scene change).
 */
export function imageFadeIn(scene: Phaser.Scene, obj: { setAlpha: (a: number) => unknown }, ms?: number): void {
  if (REDUCED_MOTION) return;
  obj.setAlpha(0);
  scene.tweens.add({ targets: obj, alpha: 1, duration: ms ?? PlayerSettings.fadeDurationMs, ease: "Quad.Out" });
}

/** Fade+lift a just-created object in, unless the OS asked for stillness. */
export function popIn(scene: Phaser.Scene, obj: { setAlpha: (a: number) => unknown; setScale: (s: number) => unknown }) {
  if (REDUCED_MOTION) return;
  obj.setAlpha(0);
  obj.setScale(0.96);
  scene.tweens.add({
    targets: obj,
    alpha: 1,
    scale: 1,
    duration: 180,
    ease: "Quad.Out",
  });
}

/**
 * A slow, looping breathe — "there's something here," not "click me now."
 * Used for forage hotspots. Skips the loop under reduced-motion, but still
 * leaves the object visible at a mid alpha so it reads without motion.
 */
export function pulse(scene: Phaser.Scene, obj: { setAlpha: (a: number) => unknown }) {
  if (REDUCED_MOTION) {
    obj.setAlpha(0.85);
    return;
  }
  scene.tweens.add({
    targets: obj,
    alpha: { from: 0.55, to: 1 },
    duration: 900,
    yoyo: true,
    repeat: -1,
    ease: "Sine.InOut",
  });
}
