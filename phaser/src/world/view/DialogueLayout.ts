/**
 * The pure geometry of the VN dialogue layout. No Phaser, no DOM.
 *
 * WHAT IT MODELS. The layout read off `C:\Users\rocle\Desktop\8-16-refs` —
 * bottom-centre dialogue box, a speaker nameplate straddling the box's top
 * edge, choices stacked as pills ABOVE the box, and a persistent control bar
 * below it. Every number here is a fraction of the view, not a pixel, for the
 * same reason `HotspotPlacement` uses fractions: the canvas is a fixed
 * 1920x1080 today and the arithmetic must survive that stopping being true.
 *
 * WHY IT IS SEPARATE FROM `DialogueSystem`. The system is the only file in this
 * track that touches Phaser. Everything that can be gotten wrong — a nameplate
 * that drifts off a long name, a five-choice stack that climbs off the top of
 * the screen, a line too long for the box — is arithmetic, and arithmetic that
 * needs a canvas to test does not get tested. So the system measures (only the
 * engine can say how wide "Eleanor" renders) and this module decides.
 *
 * WHAT IT DOES NOT DO. It never wraps text and never picks a font. Wrapping is
 * a measurement, and measurement belongs to the engine; `paginateLines` takes
 * the ALREADY-WRAPPED lines and only decides where the page breaks fall.
 *
 * NARRATION IS A LAYOUT, NOT A DEGRADED DIALOGUE. Narration is left-aligned
 * with no nameplate and no sprite (`when-alone-thoughts-and-descriptions.jpg`);
 * dialogue is centred with both. `bodyTextLayout` returns the alignment rather
 * than the caller branching on `kind` at every call site.
 */

import type { DialogueLineKind } from "../events/GameEvents";

export interface ViewSize {
  readonly width: number;
  readonly height: number;
}

/** Top-left anchored, because that is what a rounded-rect draw call takes. */
export interface Rect {
  readonly x: number;
  readonly y: number;
  readonly w: number;
  readonly h: number;
}

export function rectCenter(r: Rect): { x: number; y: number } {
  return { x: r.x + r.w / 2, y: r.y + r.h / 2 };
}

export function rectBottom(r: Rect): number {
  return r.y + r.h;
}

/**
 * Every constant in the layout, in one place, as fractions.
 *
 * Suffix tells you what of: `*OfView` fractions multiply the view's width or
 * height as named; `*OfBox` multiply the dialogue box's own width or height.
 * Values are measured off the four reference images and then rounded — this is
 * a layout copied from a reference, so the provenance matters more than the
 * precision.
 */
export const VN_METRICS = {
  /** Box: bottom-centre, ~65% width, ~1/5 the height, floated off the bottom. */
  boxWidthOfView: 0.64,
  boxHeightOfView: 0.195,
  /** Gap under the box, where the control bar lives. */
  boxBottomGapOfView: 0.058,
  boxCornerOfBox: 0.08,
  boxPadXOfView: 0.028,
  boxPadYOfView: 0.026,

  /** Nameplate: a pill straddling the box's top edge, centred. */
  nameHeightOfView: 0.05,
  nameMinWidthOfView: 0.09,
  /** Never wider than this share of the box — a long name must not out-span it. */
  nameMaxWidthOfBox: 0.7,
  namePadXOfView: 0.016,
  /**
   * Share of the plate's height sitting BELOW the box's top edge.
   *
   * Measured, not guessed: on `talking to npc.jpg` the plate's borders scan at
   * y=504 and y=541 (h=37) and the box's top border at y=524, so 17 of 37 —
   * 0.46 — is inside the box. The plate is BISECTED by the edge. A quarter dip
   * still straddles, but it reads as a tab perched on top of the panel rather
   * than a plate set into it.
   */
  nameOverlap: 0.46,

  /** Choices: full-width pills stacked bottom-up above the box. */
  choiceWidthOfBox: 0.87,
  choiceHeightOfView: 0.062,
  /**
   * Height a SECOND (and each further) wrapped label line adds to a pill.
   *
   * Authored move text runs to `[Go to the long forest road and look for the
   * bird]`, which wraps to two lines inside a pill sized for one. A fixed pill
   * height turns that into a label spilling out through the rounded top and
   * bottom, so the pill grows with its own label instead.
   */
  choiceLineHeightOfView: 0.036,
  choiceCornerOfPill: 0.18,
  /**
   * Gap between two pills.
   *
   * Nearly nothing, because the reference stack is nearly flush: on
   * `choices.jpg` the "Go right" pill's bottom border scans at y=353 and the
   * "Go left" pill's top border at y=355. The stack reads as one segmented
   * control, not as two separate buttons — a visible gap is what made the
   * earlier 0.008 look like a floating button pair.
   */
  choiceGapOfView: 0.002,
  /**
   * Gap between the lowest pill and the box's top edge.
   *
   * The pills FLOAT clear of the panel. Measured on `choices.jpg`: the lowest
   * pill's bottom border is at y=405 and the box's top border at y=522 on a
   * 716px-high capture — 117px, 0.163 of the view. At the earlier 0.05 the two
   * elements nearly touched and read as one stacked slab.
   */
  choiceStackGapOfView: 0.16,
  /** The stack may not climb above this — it compresses instead. */
  choiceTopMarginOfView: 0.05,

  /** Control bar: a centred row of pills under the box, always present. */
  controlHeightOfView: 0.042,
  controlGapOfView: 0.013,
  controlPadXOfView: 0.016,
  controlCornerOfPill: 0.3,
  /**
   * Centre line of the control row.
   *
   * The reference sits it at 0.978, which puts the pill's bottom edge half a
   * pixel PAST the canvas at 1080 — invisible in a screenshot, clipped in the
   * engine. Lifted until the whole row is on screen with room to spare.
   */
  controlCenterOfView: 0.975,

  /** Type sizes, so the layout scales with the canvas rather than the DPI. */
  bodyFontOfView: 0.033,
  nameFontOfView: 0.032,
  choiceFontOfView: 0.03,
  controlFontOfView: 0.021,
  /** Extra leading between wrapped body lines. */
  lineGapOfView: 0.008,
  /**
   * Where the CENTRE of the whole text block sits, as a share of box height.
   *
   * The block is anchored, not top-stacked. Measured twice: on `talking to
   * npc.jpg` the single line's glyph box runs y=565..594 (centre 579.5) in a box
   * spanning 524..671, and on `when-alone-thoughts-and-descriptions.jpg` it runs
   * 572..596 (centre 584) in a box spanning 528..675. Both land at 0.38 of box
   * height — a shade above the middle, nowhere near the top.
   *
   * This matters more than it sounds: `maxLines` is 3 and almost every authored
   * line wraps to 1 at this wrap width, so top-anchoring left the panel reading
   * two-thirds empty on nearly every screen in the build.
   */
  bodyBlockCenterOfBox: 0.38,
  /**
   * A rendered line's box height as a multiple of its font size.
   *
   * Type does not occupy `fontSize` pixels — a 26px Georgia line draws about
   * 30px tall — so a line budget computed as `fontSize + gap` overestimates how
   * many lines fit and the last one or two render past the bottom of the panel.
   * Measured off Georgia and monospace at the sizes this layout uses, rounded
   * up: over-reserving costs a line, under-reserving spills.
   */
  lineBoxOfFont: 1.18,

  /** The "there is another page" caret, tucked into the box's bottom-right. */
  caretSizeOfView: 0.016,
  caretInsetXOfView: 0.014,
  caretInsetYOfView: 0.02,

  /**
   * The backlog overlay `Log` opens. A panel, not a new scene — the control bar
   * has to stay reachable so the same button closes it.
   */
  backlogWidthOfView: 0.72,
  backlogTopOfView: 0.06,
  backlogBottomOfView: 0.12,
  backlogPadOfView: 0.024,
  backlogFontOfView: 0.024,
  backlogLineGapOfView: 0.006,

  /**
   * The widest a speaker sprite may be drawn, as a share of the view.
   *
   * Height-fitting alone is fine for a portrait, but the source art in this
   * project runs to 2000x1333 — landscape. Scaled to 1080 tall that is ~1620
   * wide and creeps under the whole box. Whichever scale is smaller wins.
   */
  spriteMaxWidthOfView: 0.62,

  /**
   * Headroom above a full-height speaker sprite, as a share of the view
   * (Roc, 2026-08-17). Fitting strictly to view height put the figure's head
   * flush against the very top edge, under the HUD bar. The sprite still
   * stands on the bottom edge (`spritePlacement`'s origin is unchanged) —
   * this only caps how TALL it may scale, leaving the top `spriteTopPadOfView`
   * share of the view clear above it.
   */
  spriteTopPadOfView: 0.2,
} as const;

/** Font sizes in px for this view. The system stringifies them. */
export function vnFontPx(view: ViewSize): {
  body: number;
  name: number;
  choice: number;
  control: number;
} {
  const h = view.height;
  return {
    body: Math.round(h * VN_METRICS.bodyFontOfView),
    name: Math.round(h * VN_METRICS.nameFontOfView),
    choice: Math.round(h * VN_METRICS.choiceFontOfView),
    control: Math.round(h * VN_METRICS.controlFontOfView),
  };
}

// ---------------------------------------------------------------------------
// The box
// ---------------------------------------------------------------------------

/** The dialogue panel itself. Everything else is positioned off this rect. */
export function dialogueBoxRect(view: ViewSize): Rect {
  const w = view.width * VN_METRICS.boxWidthOfView;
  const h = view.height * VN_METRICS.boxHeightOfView;
  return {
    x: (view.width - w) / 2,
    y: view.height * (1 - VN_METRICS.boxBottomGapOfView) - h,
    w,
    h,
  };
}

export function boxCornerRadius(box: Rect): number {
  return box.h * VN_METRICS.boxCornerOfBox;
}

// ---------------------------------------------------------------------------
// The nameplate
// ---------------------------------------------------------------------------

export interface NameplateLayout {
  readonly rect: Rect;
  /** Width the name itself may occupy inside the pill. */
  readonly textMaxWidth: number;
  /**
   * `<= 1`. The engine can measure but not ellipsize, so an over-long name is
   * scaled down rather than clipped or silently overflowing the pill.
   */
  readonly textScale: number;
  /** True when the name did not fit at its natural size. */
  readonly clamped: boolean;
}

/**
 * The pill that straddles the box's top edge.
 *
 * `measuredTextWidth` comes from the engine. The pill grows to fit the name up
 * to `nameMaxWidthOfBox`, then stops growing and shrinks the name instead —
 * because a nameplate wider than its own box reads as a bug, and this layout
 * has to survive `narrator_of_the_long_forest_road` as well as `Eleanor`.
 */
export function nameplateLayout(
  view: ViewSize,
  box: Rect,
  measuredTextWidth: number,
): NameplateLayout {
  const h = view.height * VN_METRICS.nameHeightOfView;
  const padX = view.width * VN_METRICS.namePadXOfView;
  const min = view.width * VN_METRICS.nameMinWidthOfView;
  const max = box.w * VN_METRICS.nameMaxWidthOfBox;
  const natural = Math.max(0, measuredTextWidth) + padX * 2;
  const w = Math.min(Math.max(natural, min), max);
  const textMaxWidth = Math.max(0, w - padX * 2);
  const clamped = measuredTextWidth > textMaxWidth;
  return {
    rect: {
      x: box.x + (box.w - w) / 2,
      // The pill sits mostly above the edge, dipping `nameOverlap` into the box.
      y: box.y - h * (1 - VN_METRICS.nameOverlap),
      w,
      h,
    },
    textMaxWidth,
    textScale: clamped && measuredTextWidth > 0 ? textMaxWidth / measuredTextWidth : 1,
    clamped,
  };
}

// ---------------------------------------------------------------------------
// The body text
// ---------------------------------------------------------------------------

export interface BodyTextLayout {
  /** Anchor for the text object, already accounting for `originX`. */
  readonly x: number;
  /** TOP of the text block. `originY` is 0, so this is the draw position. */
  readonly y: number;
  readonly originX: 0 | 0.5;
  readonly align: "left" | "center";
  readonly wrapWidth: number;
  /** Baseline-to-baseline distance: the line box plus the gap. */
  readonly lineHeight: number;
  /** The gap alone — what an engine's `lineSpacing` actually adds. */
  readonly lineGap: number;
  /** How many wrapped lines fit inside the box. Always at least 1. */
  readonly maxLines: number;
  /** Height of the block this `y` was computed for. */
  readonly blockHeight: number;
}

/**
 * Height of a block of `pageLines` rendered lines.
 *
 * The trailing gap does not exist: `n` lines are `n` line boxes and `n-1` gaps
 * between them. Budgeting `n * lineHeight` overstates the block by one gap and
 * pushes a full page a few pixels high.
 */
function blockHeightOf(pageLines: number, lineHeight: number, lineGap: number): number {
  const n = Math.max(1, Math.floor(pageLines));
  return n * lineHeight - lineGap;
}

/**
 * Where the line's text sits, and how much of it fits.
 *
 * Dialogue is centred, narration is left-aligned — the one structural
 * difference between the two variants that is not just "no nameplate".
 *
 * VERTICALLY THE BLOCK IS ANCHORED, NOT STACKED FROM THE TOP. `pageLines` is how
 * many lines the caller is about to draw, and the block is placed so its centre
 * lands on `bodyBlockCenterOfBox` — which is what the reference does and what
 * top-anchoring got wrong, leaving a one-line dialogue floating in the top third
 * of an otherwise empty panel. The result is then clamped inside the padded box,
 * so a full page still starts below the top padding rather than riding up out of
 * the panel.
 */
export function bodyTextLayout(
  view: ViewSize,
  box: Rect,
  kind: DialogueLineKind,
  pageLines = 1,
): BodyTextLayout {
  const padX = view.width * VN_METRICS.boxPadXOfView;
  const padY = view.height * VN_METRICS.boxPadYOfView;
  const font = vnFontPx(view);
  const lineGap = view.height * VN_METRICS.lineGapOfView;
  const lineHeight = font.body * VN_METRICS.lineBoxOfFont + lineGap;
  const inner = Math.max(0, box.h - padY * 2);
  const centred = kind === "dialogue";

  const blockHeight = blockHeightOf(pageLines, lineHeight, lineGap);
  const anchor = box.y + box.h * VN_METRICS.bodyBlockCenterOfBox;
  const top = box.y + padY;
  const bottom = box.y + box.h - padY - blockHeight;
  // A block taller than the padded box has nowhere to be centred; start it at
  // the top padding rather than letting the clamp invert and push it upward.
  const y =
    bottom < top ? top : Math.min(Math.max(anchor - blockHeight / 2, top), bottom);

  return {
    x: centred ? box.x + box.w / 2 : box.x + padX,
    y,
    originX: centred ? 0.5 : 0,
    align: centred ? "center" : "left",
    wrapWidth: Math.max(1, box.w - padX * 2),
    lineHeight,
    lineGap,
    maxLines: Math.max(1, Math.floor(inner / lineHeight)),
    blockHeight,
  };
}

/**
 * Split already-wrapped lines into pages that fit the box.
 *
 * Nothing is ever dropped: the concatenation of the pages is the input. A line
 * that overflows is a paging problem, not a truncation problem — authored prose
 * is rendered verbatim or not at all.
 */
export function paginateLines(
  lines: readonly string[],
  maxLines: number,
): string[][] {
  const per = Math.max(1, Math.floor(maxLines));
  if (lines.length === 0) return [[]];
  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += per) pages.push(lines.slice(i, i + per));
  return pages;
}

// ---------------------------------------------------------------------------
// The choice stack
// ---------------------------------------------------------------------------

export interface ChoiceStackLayout {
  /** Top to bottom, matching the order the choices were given in. */
  readonly pills: readonly Rect[];
  /** The height of a ONE-LINE pill after any compression. Sets the type size. */
  readonly pillHeight: number;
  readonly gap: number;
  /** Radius for a one-line pill. Clamp per pill with `pillCornerRadius`. */
  readonly cornerRadius: number;
  /** True when the stack had to shrink to stay on screen. */
  readonly compressed: boolean;
  /** Height one further wrapped label line adds, after compression. */
  readonly extraLineHeight: number;
}

/**
 * How many wrapped lines each choice label takes, or just how many choices.
 *
 * A bare `number` means "n choices, one line each" — kept because most callers
 * and every geometry test only care about the stack, not the labels.
 */
export type ChoiceLabelLines = number | readonly number[];

function labelLineCounts(choices: ChoiceLabelLines): number[] {
  if (typeof choices === "number") {
    return Array.from({ length: Math.max(0, Math.floor(choices)) }, () => 1);
  }
  return choices.map((n) => Math.max(1, Math.floor(n)));
}

/** A radius that can never exceed the pill it is rounding. */
export function pillCornerRadius(pill: Rect, cornerRadius: number): number {
  return Math.max(0, Math.min(cornerRadius, pill.h / 2, pill.w / 2));
}

/**
 * Choice pills, stacked upward from just above the box.
 *
 * The stack grows AWAY from the box, so with five choices it would run off the
 * top of a 1080-high canvas at the reference's spacing. Rather than let it,
 * the pill heights and the gap are scaled together until the stack fits under
 * `choiceTopMarginOfView`. Order is preserved and pills never overlap.
 *
 * A PILL IS AS TALL AS ITS OWN LABEL. The engine measures how many lines the
 * label wrapped to and passes the counts in; a two-line label gets a pill that
 * is `choiceLineHeightOfView` taller. Sizing every pill off the view alone is
 * how a long authored move ends up with its second line outside its own pill.
 */
export function choiceStackLayout(
  view: ViewSize,
  box: Rect,
  choices: ChoiceLabelLines,
): ChoiceStackLayout {
  const lines = labelLineCounts(choices);
  const n = lines.length;
  const w = box.w * VN_METRICS.choiceWidthOfBox;
  const x = box.x + (box.w - w) / 2;
  const anchorBottom = box.y - view.height * VN_METRICS.choiceStackGapOfView;
  const topMargin = view.height * VN_METRICS.choiceTopMarginOfView;

  let pillHeight = view.height * VN_METRICS.choiceHeightOfView;
  let gap = view.height * VN_METRICS.choiceGapOfView;
  let extraLineHeight = view.height * VN_METRICS.choiceLineHeightOfView;

  if (n === 0) {
    return {
      pills: [],
      pillHeight,
      gap,
      cornerRadius: pillHeight * VN_METRICS.choiceCornerOfPill,
      compressed: false,
      extraLineHeight,
    };
  }

  const naturalHeights = lines.map((l) => pillHeight + (l - 1) * extraLineHeight);
  const total = naturalHeights.reduce((a, b) => a + b, 0) + (n - 1) * gap;
  const room = anchorBottom - topMargin;
  const compressed = total > room && room > 0;
  const scale = compressed ? room / total : 1;
  if (compressed) {
    pillHeight *= scale;
    gap *= scale;
    extraLineHeight *= scale;
  }

  const heights = naturalHeights.map((h) => h * scale);
  const stackHeight = heights.reduce((a, b) => a + b, 0) + (n - 1) * gap;
  let y = anchorBottom - stackHeight;
  const pills: Rect[] = [];
  for (const h of heights) {
    pills.push({ x, y, w, h });
    y += h + gap;
  }
  return {
    pills,
    pillHeight,
    gap,
    cornerRadius: pillHeight * VN_METRICS.choiceCornerOfPill,
    compressed,
    extraLineHeight,
  };
}

// ---------------------------------------------------------------------------
// The control bar
// ---------------------------------------------------------------------------

export interface ControlBarLayout {
  readonly buttons: readonly Rect[];
  readonly centerY: number;
  readonly height: number;
  readonly cornerRadius: number;
  /** The one width every button got. Handy for a caller sizing its own label. */
  readonly buttonWidth: number;
}

/**
 * The persistent row under the box: `[Auto] [Skip] [Log] [Hide UI] [Options]`.
 *
 * EVERY BUTTON IS THE SAME WIDTH. This is the reference, not a simplification:
 * a pixel scan of the control row gives 106px for all five pills on all four
 * captures — `Log` (3 characters) and `Options` (7) get identical pills, and the
 * gaps between them are a uniform 22px. Sizing each pill to its own label, as an
 * earlier pass did, produced a visibly ragged row where `Log` was two-thirds the
 * width of `Hide UI`.
 *
 * So the engine still measures the labels, but only the WIDEST one sets the
 * width. Padding is added once, to that maximum.
 */
export function controlBarLayout(
  view: ViewSize,
  measuredLabelWidths: readonly number[],
): ControlBarLayout {
  const h = view.height * VN_METRICS.controlHeightOfView;
  const padX = view.width * VN_METRICS.controlPadXOfView;
  const gap = view.width * VN_METRICS.controlGapOfView;
  const centerY = view.height * VN_METRICS.controlCenterOfView;
  const widest = measuredLabelWidths.reduce((a, b) => Math.max(a, Math.max(0, b)), 0);
  const buttonWidth = widest + padX * 2;
  const n = measuredLabelWidths.length;
  const total = n * buttonWidth + Math.max(0, n - 1) * gap;
  let x = (view.width - total) / 2;
  const buttons: Rect[] = [];
  for (let i = 0; i < n; i++) {
    buttons.push({ x, y: centerY - h / 2, w: buttonWidth, h });
    x += buttonWidth + gap;
  }
  return {
    buttons,
    centerY,
    height: h,
    cornerRadius: h * VN_METRICS.controlCornerOfPill,
    buttonWidth,
  };
}

// ---------------------------------------------------------------------------
// The sprite
// ---------------------------------------------------------------------------

export interface SpritePlacement {
  readonly x: number;
  readonly y: number;
  /** Origin is bottom-centre, so the figure stands on the bottom edge. */
  readonly originX: 0.5;
  readonly originY: 1;
  readonly scale: number;
}

/**
 * The speaking soul: centred, standing on the bottom edge, capped short of
 * full view height so the backdrop reads above it.
 *
 * FIT BY HEIGHT, THEN CLAMP BY WIDTH. Cover-fitting would crop a portrait's
 * head, so height leads — the references are full-height figures over the
 * backdrop, not cutouts. But the art in this project runs to 2000x1333, and
 * height-fitting that gives a ~1620-wide figure that reaches under the whole
 * box. So the width cap is the second half of the same rule, not an override:
 * whichever scale is smaller wins, and a portrait never notices it.
 *
 * `spriteTopPadOfView` (Roc, 2026-08-17) trims the height target itself,
 * rather than adding a gap after fitting — flush-to-the-top under the HUD bar
 * read as the backdrop being gone, not a design choice.
 *
 * `sourceWidth` is optional because a caller that genuinely has no width (a
 * fake, a test) should get the old behaviour rather than a guess.
 */
export function spritePlacement(
  view: ViewSize,
  sourceHeight: number,
  sourceWidth?: number,
): SpritePlacement {
  const targetHeight = view.height * (1 - VN_METRICS.spriteTopPadOfView);
  const byHeight = sourceHeight > 0 ? targetHeight / sourceHeight : 1;
  const byWidth =
    sourceWidth && sourceWidth > 0
      ? (view.width * VN_METRICS.spriteMaxWidthOfView) / sourceWidth
      : Number.POSITIVE_INFINITY;
  return {
    x: view.width / 2,
    y: view.height,
    originX: 0.5,
    originY: 1,
    scale: Math.min(byHeight, byWidth),
  };
}

// ---------------------------------------------------------------------------
// The "more to read" caret
// ---------------------------------------------------------------------------

export interface CaretLayout {
  /** Centre of the caret glyph. */
  readonly x: number;
  readonly y: number;
  readonly size: number;
}

/**
 * The caret that says a further page exists.
 *
 * Without it a paged line reads as a line that just stops, and the player has
 * no cue that clicking does anything. Bottom-right inside the box, clear of
 * left-aligned narration and of centred dialogue alike.
 */
export function advanceCaretLayout(view: ViewSize, box: Rect): CaretLayout {
  const size = view.height * VN_METRICS.caretSizeOfView;
  return {
    x: box.x + box.w - view.width * VN_METRICS.caretInsetXOfView - size / 2,
    y: box.y + box.h - view.height * VN_METRICS.caretInsetYOfView - size / 2,
    size,
  };
}

// ---------------------------------------------------------------------------
// The backlog overlay
// ---------------------------------------------------------------------------

export interface BacklogLayout {
  readonly panel: Rect;
  readonly cornerRadius: number;
  /** Where the first line of text starts. */
  readonly textX: number;
  readonly textY: number;
  readonly wrapWidth: number;
  readonly fontPx: number;
  readonly lineHeight: number;
  readonly lineGap: number;
  /** How many lines of backlog fit. Always at least 1. */
  readonly maxLines: number;
}

/**
 * The panel `Log` opens over the scene.
 *
 * It stops short of the control bar on purpose: the same button closes it, so
 * covering the bar would trap the player in the backlog.
 */
export function backlogLayout(view: ViewSize): BacklogLayout {
  const w = view.width * VN_METRICS.backlogWidthOfView;
  const top = view.height * VN_METRICS.backlogTopOfView;
  const h = view.height * (1 - VN_METRICS.backlogBottomOfView) - top;
  const pad = view.width * VN_METRICS.backlogPadOfView;
  const fontPx = Math.round(view.height * VN_METRICS.backlogFontOfView);
  const lineGap = view.height * VN_METRICS.backlogLineGapOfView;
  const lineHeight = fontPx * VN_METRICS.lineBoxOfFont + lineGap;
  const panel: Rect = { x: (view.width - w) / 2, y: top, w, h };
  return {
    panel,
    cornerRadius: Math.min(w, h) * VN_METRICS.boxCornerOfBox,
    textX: panel.x + pad,
    textY: panel.y + pad,
    wrapWidth: Math.max(1, w - pad * 2),
    fontPx,
    lineHeight,
    lineGap,
    maxLines: Math.max(1, Math.floor(Math.max(0, h - pad * 2) / lineHeight)),
  };
}

// ---------------------------------------------------------------------------
// The speaker's name
// ---------------------------------------------------------------------------

/**
 * A soul id rendered as a name.
 *
 * `DialogueLineEvent.speaker` carries a soul_id — `mara`, `toby`, `old_wren` —
 * and the nameplate in the reference reads as a proper name. Without this the
 * plate says `mara`. It is a DEFAULT, not the answer: a scene that owns a real
 * cast index passes `displayNameFor` and this is never called.
 */
export function soulDisplayName(soulId: string): string {
  const words = soulId.trim().split(/[\s_-]+/).filter(Boolean);
  if (words.length === 0) return soulId;
  // Only the first letter is touched — `McRae` and `Eleanor` come back intact.
  return words.map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
}
