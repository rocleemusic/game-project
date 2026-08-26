/**
 * The VN dialogue layout, as a scene-agnostic system.
 *
 * WHAT IT REPLACES. Choices used to be a bare text column on the right, above
 * the satchel strip, and souls stood on a portrait baseline mid-screen. This is
 * the layout from `C:\Users\rocle\Desktop\8-16-refs` instead: one bottom-centre
 * box, a nameplate straddling its top edge, choices as pills floating above it
 * with the prompting line still readable underneath, and a control bar that
 * comes up with the conversation and goes away with it (Roc, 2026-08-23 — it
 * used to be unconditional, which put five live buttons over the level at all
 * times; see `drawControlBar`).
 *
 * WHAT IT CONSUMES. `GameEventBus`, `ui/theme.ts`, and a `DialogueRenderPort`.
 * Nothing else. It does not know what ink is, what a gate is, or what a satchel
 * is — a scene hands it lines and choices, or the bus does. That is the
 * render/logic split the Wave-2 plan is built on.
 *
 * NO PHASER IN THIS FILE. Deliberate, and the reason it now has tests: this
 * class is mostly a state machine (paging, hover, keyboard selection, hidden
 * UI, auto/skip, backlog open and closed) and every bit of that was unreachable
 * from vitest while it drew straight onto Phaser objects. The engine lives
 * behind `DialogueRenderPort` — `PhaserDialogueRenderPort` for real,
 * `FakeDialogueRenderPort` for tests — exactly as `VfxBackend` does next door.
 * `mountDialogue.ts` is the one file that knows about scenes.
 *
 * NO NEW COLOURS. Every fill and every text colour is a `COLOR` member.
 * `theme.ts` is contrast-checked as a set; a raw hex here would pass review and
 * silently break the audit.
 *
 * TEARDOWN IS THE FEATURE. The system creates no objects at all — it names them
 * and the port pools them — so `npm run walk`'s display-object count cannot
 * climb with the number of lines shown. `destroy()` unsubscribes from the bus
 * and detaches the port, and is safe to call twice.
 *
 * THE GEOMETRY IS NOT HERE. It is in `world/view/DialogueLayout.ts`, which is
 * pure and unit-tested. This file measures through the port (only the engine
 * knows how wide "Eleanor" renders) and issues draw calls. It decides nothing
 * about position.
 */

import { COLOR, FONT } from "../ui/theme";
import type { GameEventBus, DialogueLineKind } from "../world/events/GameEvents";
import {
  VN_METRICS,
  advanceCaretLayout,
  backlogLayout,
  bodyTextLayout,
  boxCornerRadius,
  choiceStackLayout,
  controlBarLayout,
  dialogueBoxRect,
  nameplateLayout,
  paginateLines,
  pillCornerRadius,
  rectCenter,
  soulDisplayName,
  spritePlacement,
  vnFontPx,
  type Rect,
  type ViewSize,
} from "../world/view/DialogueLayout";
import type {
  DialogueRenderPort,
  HitSpec,
  RoundedRectShape,
  ShapeStyle,
} from "./DialogueRenderPort";

/** The five persistent controls, in reference order. */
export type ControlId = "auto" | "skip" | "log" | "hide-ui" | "options";

const CONTROLS: readonly { readonly id: ControlId; readonly label: string }[] = [
  { id: "auto", label: "Auto" },
  { id: "skip", label: "Skip" },
  { id: "log", label: "Log" },
  { id: "hide-ui", label: "Hide UI" },
  { id: "options", label: "Options" },
];

/** One line to show. Mirrors `DialogueLineEvent` minus the bus bookkeeping. */
export interface DialogueLine {
  /** `null` renders narration: left-aligned, no nameplate, no sprite. */
  readonly speaker: string | null;
  readonly text: string;
  readonly kind: DialogueLineKind;
}

export interface DialogueChoice {
  readonly text: string;
  /** A blocked move still SHOWS — dimmed, not hidden. Default true. */
  readonly enabled?: boolean;
}

export interface DialogueSystemOptions {
  /** Defaults to the port's view size. Injectable so tests can pick one. */
  readonly view?: ViewSize;
  /**
   * Texture key for a speaker's sprite, or nothing for no sprite.
   *
   * A function, not a lookup table, because the cast index lives in the
   * scene's half of the build and this system may not reach for it.
   */
  readonly spriteKeyFor?: (speaker: string) => string | null | undefined;
  /**
   * The name to put on the plate for a soul id.
   *
   * `DialogueLineEvent.speaker` is a soul_id — `mara`, `toby` — and a plate
   * reading `mara` is not the reference. Same injection shape as
   * `spriteKeyFor` and for the same reason: the cast index is not ours.
   * Defaults to title-case.
   */
  readonly displayNameFor?: (soulId: string) => string;
  /** Fired for every control press, including the ones handled internally. */
  readonly onControl?: (id: ControlId) => void;
  /** Fired when the box is advanced and there is no further page to show. */
  readonly onAdvance?: () => void;
  /** Subscribe to `dialogue:line` on the bus. Default true. */
  readonly listen?: boolean;
  /** Bind Space/Enter/arrows/number keys through the port. Default true. */
  readonly keyboard?: boolean;
  /** Auto-advance dwell, ms per page. */
  readonly autoIntervalMs?: number;
  /** Skip dwell, ms per page. */
  readonly skipIntervalMs?: number;
}

const BOX_FILL_ALPHA = 0.86;
const BORDER_ALPHA = 0.55;
const PILL_FILL_ALPHA = 0.94;
const DISABLED_BORDER_ALPHA = 0.25;
const DEFAULT_AUTO_MS = 2600;
const DEFAULT_SKIP_MS = 110;
/** How much of a pill's height the label may be. */
const LABEL_OF_PILL = 0.5;

/** Layer and element names. One place, so a typo is a compile error nearby. */
const LAYER = {
  box: "box",
  nameplate: "nameplate",
  choices: "choices",
  controls: "controls",
  backlog: "backlog",
} as const;

const TEXT = {
  body: "body",
  name: "name",
  caret: "caret",
  backlog: "backlog",
} as const;

const HITS = {
  box: "box",
  choices: "choices",
  controls: "controls",
} as const;

const TIMER = { auto: "auto", skip: "skip" } as const;

function stroke(color: number, alpha: number, width = 2): Pick<
  ShapeStyle,
  "strokeColor" | "strokeAlpha" | "strokeWidth"
> {
  return { strokeColor: color, strokeAlpha: alpha, strokeWidth: width };
}

export class DialogueSystem {
  private readonly bus: GameEventBus;
  private readonly port: DialogueRenderPort;
  private readonly opts: DialogueSystemOptions;

  private view: ViewSize;
  private box: Rect;

  /** The line on screen, or `null` when the box is empty. */
  private line: DialogueLine | null = null;
  /** The current line, split into box-sized pages. */
  private pages: string[][] = [];
  private pageIndex = 0;
  /**
   * Lines that have arrived but not been read yet.
   *
   * Ink is driven with `runToChoice()`, which hands over EVERY line between one
   * choice and the next in a single burst. A box that just took the newest one
   * would silently eat the rest — the old transcript showed the last eight at
   * once, which is why nobody noticed. So arrivals queue and the player walks
   * them.
   */
  private queue: DialogueLine[] = [];

  /** Choices as given. They only reach `choices` once the queue is drained. */
  private pendingChoices: readonly DialogueChoice[] = [];
  private choices: readonly DialogueChoice[] = [];
  private choicePills: readonly Rect[] = [];
  private choiceRadius = 0;
  private choiceFontPx = 0;
  /** High-water mark of choice labels ever drawn, so stale ids get hidden. */
  private choiceLabelsDrawn = 0;
  private highlightIndex = -1;
  private onPick: ((index: number) => void) | null = null;

  private controlButtons: readonly Rect[] = [];
  private controlRadius = 0;
  private controlFontPx = 0;
  private controlHover = -1;
  /** What the bar was last painted as, so `syncControlBar` can repaint only
   * on the flip rather than on every body/choice redraw. */
  private controlBarShown = false;

  private uiHidden = false;
  private backlogOpen = false;
  private autoOn = false;
  private skipOn = false;
  private destroyed = false;
  private readonly unsubscribe: (() => void) | null;

  constructor(
    port: DialogueRenderPort,
    bus: GameEventBus,
    options: DialogueSystemOptions = {},
  ) {
    this.port = port;
    this.bus = bus;
    this.opts = options;
    this.view = options.view ?? port.viewSize();
    this.box = dialogueBoxRect(this.view);

    this.measureControlBar();
    this.drawChrome();
    this.drawBody();

    if (options.keyboard !== false) this.bindKeys();

    this.unsubscribe =
      options.listen === false
        ? null
        : this.bus.on("dialogue:line", (e) => {
            // The player's own picked choice, echoed into ink's transcript —
            // not authored prose. It still reaches the bus (and so the
            // backlog, which reads the log directly), but showing it back as
            // the CURRENT line reads as a bug, not a conversation.
            if (e.playerEcho) return;
            this.enqueueLine({ speaker: e.speaker, text: e.text, kind: e.kind });
          });
  }

  // -------------------------------------------------------------------------
  // Imperative API
  // -------------------------------------------------------------------------

  /**
   * Show one line, replacing whatever was there.
   *
   * Text longer than the box is PAGED, never truncated — authored prose renders
   * verbatim or not at all. Advancing walks the pages, then calls `onAdvance`.
   */
  showLine(line: DialogueLine): void {
    if (this.destroyed) return;
    this.line = line;
    this.repaginate();
    this.pageIndex = 0;
    this.drawBody();
    this.drawNameplate();
    this.drawSprite();
    this.syncChoices();
  }

  /**
   * Add a line to the back of the read queue, showing it if the box is free.
   *
   * This, not `showLine`, is what the bus subscription calls: a burst of lines
   * from one `runToChoice()` has to be readable one at a time.
   */
  enqueueLine(line: DialogueLine): void {
    if (this.destroyed) return;
    if (!this.line) {
      this.showLine(line);
      return;
    }
    this.queue.push(line);
    // A queued line means the prompting line is not the last one yet, so any
    // choices that were already offered have to go back to pending.
    this.syncChoices();
    this.drawCaret();
  }

  /** How many lines have arrived and not been read. */
  get queuedLines(): number {
    return this.queue.length;
  }

  /**
   * Float choices above the box. The box stays visible underneath, still
   * showing the prompting line — that is the point of the layout.
   *
   * They are HELD until the queue is drained. Ink offers its choices at the
   * same moment it hands over the lines leading up to them, and pills that
   * appear over line one of five let the player answer a question they have not
   * read.
   */
  showChoices(choices: readonly DialogueChoice[], onPick: (index: number) => void): void {
    if (this.destroyed) return;
    this.pendingChoices = choices.map((c) => ({
      text: c.text,
      enabled: c.enabled !== false,
    }));
    this.onPick = onPick;
    this.highlightIndex = -1;
    this.syncChoices();
  }

  /** Drop the line, the queue, the nameplate, the sprite and the choices. */
  clear(): void {
    if (this.destroyed) return;
    this.clearChoices();
    this.line = null;
    this.queue = [];
    this.pages = [];
    this.pageIndex = 0;
    this.drawBody();
    this.drawNameplate();
    this.drawSprite();
  }

  /** Remove just the choice pills, keeping the line underneath them. */
  clearChoices(): void {
    if (this.destroyed) return;
    this.pendingChoices = [];
    this.choices = [];
    this.choicePills = [];
    this.highlightIndex = -1;
    this.onPick = null;
    this.drawChoices();
  }

  /** Show the pending choices exactly when there is nothing left to read. */
  private syncChoices(): void {
    this.choices = this.hasMore ? [] : this.pendingChoices;
    if (this.choices.length === 0) this.highlightIndex = -1;
    this.layoutChoices();
    this.drawChoices();
  }

  /**
   * Advance one page, or report that there is nothing left to page through.
   *
   * A PENDING CHOICE BLOCKS THIS. The whole point of the layout is that the box
   * stays visible under the pills so the prompting line still reads — which
   * makes it a live click target sitting right where the player is looking. Any
   * advance while choices are up walks ink straight past the choice.
   *
   * Returns true when a page was consumed, so a caller driving ink knows
   * whether the click was already spent.
   */
  advance(): boolean {
    if (this.destroyed) return false;
    if (this.backlogOpen) return false;
    if (this.choices.length > 0) return false;
    if (this.pageIndex < this.pages.length - 1) {
      this.pageIndex++;
      this.drawBody();
      this.syncChoices();
      return true;
    }
    const next = this.queue.shift();
    if (next) {
      this.showLine(next);
      return true;
    }
    this.opts.onAdvance?.();
    return false;
  }

  /** True while the CURRENT line has more pages waiting. */
  get hasMorePages(): boolean {
    return this.pageIndex < this.pages.length - 1;
  }

  /** True while anything at all is left to read — pages or queued lines. */
  get hasMore(): boolean {
    return this.hasMorePages || this.queue.length > 0;
  }

  /** Take a choice by index, as a click or a number key would. */
  pick(index: number): boolean {
    if (this.destroyed) return false;
    const choice = this.choices[index];
    if (!choice || choice.enabled === false) return false;
    const handler = this.onPick;
    // Cleared BEFORE the callback: the handler usually drives ink, which pushes
    // a new line and a new choice set straight back through this system.
    this.clearChoices();
    handler?.(index);
    return true;
  }

  /** `Hide UI` — everything but the control bar, which is how you get it back. */
  setUiHidden(hidden: boolean): void {
    if (this.destroyed || hidden === this.uiHidden) return;
    this.uiHidden = hidden;
    if (hidden && this.backlogOpen) this.setBacklogOpen(false);
    // Everything is redrawn FROM STATE rather than un-hidden, so un-hiding
    // cannot restore something that was never on screen — the old code had to
    // remember separately that narration had no nameplate.
    this.redrawAll();
  }

  get uiIsHidden(): boolean {
    return this.uiHidden;
  }

  /**
   * Whether the story layer is off screen.
   *
   * The backlog is a MODAL panel, not an overlay: it covers the box, and if the
   * box kept drawing underneath, the current line rendered straight through the
   * panel on top of the transcript. Hiding the layer is also what keeps the
   * control bar the only thing still clickable, so `Log` can close what `Log`
   * opened.
   */
  private get contentHidden(): boolean {
    return this.uiHidden || this.backlogOpen;
  }

  /** The backlog panel `Log` opens. */
  setBacklogOpen(open: boolean): void {
    if (this.destroyed || open === this.backlogOpen) return;
    this.backlogOpen = open;
    this.redrawAll();
  }

  get backlogIsOpen(): boolean {
    return this.backlogOpen;
  }

  get autoIsOn(): boolean {
    return this.autoOn;
  }

  get skipIsOn(): boolean {
    return this.skipOn;
  }

  /** Which choice the keyboard (or the pointer) is currently on. -1 for none. */
  get highlightedChoice(): number {
    return this.highlightIndex;
  }

  /**
   * Recompute every rect for a new view size and redraw.
   *
   * The canvas is a fixed 1920x1080 with `Scale.FIT` today, which is exactly
   * why this exists: `DialogueLayout` is written in fractions on the stated
   * assumption that that stops being true, and a system that computed its box
   * once in the constructor would throw that away.
   */
  relayout(view: ViewSize): void {
    if (this.destroyed) return;
    this.view = view;
    this.box = dialogueBoxRect(view);
    this.measureControlBar();
    this.repaginate();
    this.pageIndex = Math.min(this.pageIndex, Math.max(0, this.pages.length - 1));
    this.layoutChoices();
    this.redrawAll();
  }

  /**
   * Release the bus subscription and the port.
   *
   * Safe to call twice, and safe to call after the scene already shut down.
   */
  destroy(): void {
    if (this.destroyed) return;
    this.destroyed = true;
    this.stopTimers();
    this.unsubscribe?.();
    this.port.detach();
  }

  // -------------------------------------------------------------------------
  // Layout
  // -------------------------------------------------------------------------

  private repaginate(): void {
    if (!this.line) {
      this.pages = [];
      return;
    }
    const layout = bodyTextLayout(this.view, this.box, this.line.kind);
    const font = vnFontPx(this.view);
    const wrapped = this.port.wrapText(
      this.line.text,
      font.body,
      FONT.display,
      layout.wrapWidth,
    );
    this.pages = paginateLines(wrapped, layout.maxLines);
  }

  /**
   * Size the choice pills to the labels that go in them.
   *
   * TWO PASSES, ON PURPOSE. The label's type size comes from the pill height,
   * and the pill height comes from how many lines the label wrapped to, so the
   * first pass measures at the natural size and the second re-measures if the
   * stack had to compress and shrink the type. One extra pass converges because
   * compression only ever makes the type smaller, never larger.
   */
  private layoutChoices(): void {
    if (this.choices.length === 0) {
      this.choicePills = [];
      return;
    }
    const width = this.box.w * VN_METRICS.choiceWidthOfBox;
    const natural = vnFontPx(this.view).choice;

    let px = natural;
    let stack = choiceStackLayout(this.view, this.box, this.labelLines(px, width));
    const fitted = Math.min(natural, Math.round(stack.pillHeight * LABEL_OF_PILL));
    if (fitted !== px && fitted > 0) {
      px = fitted;
      stack = choiceStackLayout(this.view, this.box, this.labelLines(px, width));
    }

    this.choiceFontPx = px;
    this.choicePills = stack.pills;
    this.choiceRadius = stack.cornerRadius;
  }

  /** How many lines each label wraps to inside a pill, at this type size. */
  private labelLines(px: number, pillWidth: number): number[] {
    return this.choices.map(
      (c) => this.port.wrapText(c.text, px, FONT.display, pillWidth - px * 2).length,
    );
  }

  private measureControlBar(): void {
    const px = vnFontPx(this.view).control;
    const bar = controlBarLayout(
      this.view,
      CONTROLS.map((c) => this.port.measureTextWidth(c.label, px, FONT.mono)),
    );
    this.controlFontPx = px;
    this.controlButtons = bar.buttons;
    this.controlRadius = bar.cornerRadius;
  }

  // -------------------------------------------------------------------------
  // Drawing
  // -------------------------------------------------------------------------

  private redrawAll(): void {
    this.drawChrome();
    this.drawBody();
    this.drawNameplate();
    this.drawChoices();
    this.drawSprite();
    this.drawBacklog();
  }

  /** The box and the control bar. The bar is drawn even when the UI is hidden. */
  private drawChrome(): void {
    this.drawBox();
    this.drawControlBar();
  }

  /**
   * The panel.
   *
   * IT STAYS UP UNDER THE PILLS. The whole point of the layout is that the
   * prompting line reads while the choices float above it, so the box is drawn
   * whenever there is a line OR a choice — pills over an empty backdrop, with
   * nothing beneath them, is the one arrangement the reference never shows.
   */
  private drawBox(): void {
    // The bar rides the same gate, and this is the one method every body,
    // choice and chrome repaint funnels through — so putting the check here
    // means no future draw path can forget it.
    this.syncControlBar();
    const visible =
      !this.contentHidden && (this.pages.length > 0 || this.choices.length > 0);
    if (!visible) {
      this.port.drawShapes(LAYER.box, []);
      this.port.setHits(HITS.box, []);
      return;
    }
    this.port.drawShapes(LAYER.box, [
      {
        rect: this.box,
        radius: boxCornerRadius(this.box),
        style: {
          fillColor: COLOR.panel,
          fillAlpha: BOX_FILL_ALPHA,
          ...stroke(COLOR.border, BORDER_ALPHA),
        },
      },
    ]);
    this.port.setHits(HITS.box, [
      { rect: this.box, cursor: true, onDown: () => this.advance() },
    ]);
  }

  private drawBody(): void {
    this.drawBox();
    if (this.contentHidden || !this.line || this.pages.length === 0) {
      this.port.drawText(TEXT.body, null);
      this.port.drawText(TEXT.caret, null);
      return;
    }
    const page = this.pages[this.pageIndex] ?? [];
    // Sized to THIS page, not to the box: a one-line page is centred on the
    // panel's anchor, a three-line page fills it. A fixed top anchor left the
    // common case — one line, which is nearly every authored line — sitting in
    // the top third of an empty box.
    const layout = bodyTextLayout(this.view, this.box, this.line.kind, page.length);
    const font = vnFontPx(this.view);
    this.port.drawText(TEXT.body, {
      text: page.join("\n"),
      x: layout.x,
      y: layout.y,
      originX: layout.originX,
      originY: 0,
      fontPx: font.body,
      fontFamily: FONT.display,
      color: COLOR.ink,
      align: layout.align,
      wrapWidth: layout.wrapWidth,
      lineSpacing: layout.lineGap,
    });
    this.drawCaret();
  }

  /**
   * The "there is more to read" caret.
   *
   * Without it a paged line looks like a line that simply stops. Gold, because
   * gold is the one colour in the theme that means "you can act on this".
   */
  private drawCaret(): void {
    if (this.contentHidden || !this.hasMore || this.choices.length > 0) {
      this.port.drawText(TEXT.caret, null);
      return;
    }
    const caret = advanceCaretLayout(this.view, this.box);
    this.port.drawText(TEXT.caret, {
      text: "\u25be",
      x: caret.x,
      y: caret.y,
      originX: 0.5,
      originY: 0.5,
      fontPx: Math.round(caret.size),
      fontFamily: FONT.display,
      color: COLOR.gold,
      align: "center",
    });
  }

  /** Narration has no plate at all — that is a layout, not a missing name. */
  private drawNameplate(): void {
    const speaker =
      this.line && this.line.kind === "dialogue" ? this.line.speaker : null;
    if (this.contentHidden || !speaker) {
      this.port.drawShapes(LAYER.nameplate, []);
      this.port.drawText(TEXT.name, null);
      return;
    }
    const name = (this.opts.displayNameFor ?? soulDisplayName)(speaker);
    const font = vnFontPx(this.view);
    const measured = this.port.measureTextWidth(name, font.name, FONT.display);
    const plate = nameplateLayout(this.view, this.box, measured);
    const c = rectCenter(plate.rect);

    this.port.drawShapes(LAYER.nameplate, [
      {
        rect: plate.rect,
        radius: plate.rect.h / 2,
        style: {
          // Darker than the box on purpose: the plate has to read as a separate
          // object sitting ON the edge, not as a lighter patch of the panel.
          fillColor: COLOR.night,
          fillAlpha: 0.95,
          ...stroke(COLOR.border, 0.9),
        },
      },
    ]);
    this.port.drawText(TEXT.name, {
      text: name,
      x: c.x,
      y: c.y,
      originX: 0.5,
      originY: 0.5,
      fontPx: font.name,
      fontFamily: FONT.display,
      color: COLOR.gold,
      align: "center",
      scale: plate.textScale,
    });
  }

  private drawChoices(): void {
    const n = this.choices.length;
    // The box's visibility depends on the choice count, so the two are repainted
    // together. Without this, `showChoices` on an empty box floats pills over
    // the backdrop with nothing under them until the next unrelated redraw.
    this.drawBox();
    if (this.contentHidden || n === 0) {
      this.port.drawShapes(LAYER.choices, []);
      this.port.setHits(HITS.choices, []);
      this.hideChoiceLabelsFrom(0);
      this.drawCaret();
      return;
    }

    const shapes: RoundedRectShape[] = [];
    const hits: HitSpec[] = [];
    this.choices.forEach((choice, i) => {
      const pill = this.choicePills[i];
      if (!pill) return;
      const enabled = choice.enabled !== false;
      const lit = enabled && this.highlightIndex === i;
      shapes.push({
        rect: pill,
        radius: pillCornerRadius(pill, this.choiceRadius),
        style: {
          fillColor: lit ? COLOR.panelHover : COLOR.panel,
          fillAlpha: PILL_FILL_ALPHA,
          ...stroke(
            lit ? COLOR.emberNum : COLOR.border,
            enabled ? BORDER_ALPHA : DISABLED_BORDER_ALPHA,
          ),
        },
      });
      const c = rectCenter(pill);
      this.port.drawText(`choice:${i}`, {
        text: choice.text,
        x: c.x,
        y: c.y,
        originX: 0.5,
        originY: 0.5,
        fontPx: this.choiceFontPx,
        fontFamily: FONT.display,
        // A blocked move is MUTED, never red. A move you cannot take yet is a
        // fact about the world, not an error the player made.
        color: enabled ? COLOR.ink : COLOR.muted,
        align: "center",
        wrapWidth: pill.w - this.choiceFontPx * 2,
      });
      hits.push({
        rect: pill,
        cursor: enabled,
        onDown: enabled ? () => this.pick(i) : undefined,
        onOver: enabled
          ? () => {
              this.highlightIndex = i;
              this.drawChoices();
            }
          : undefined,
        onOut: enabled
          ? () => {
              if (this.highlightIndex === i) this.highlightIndex = -1;
              this.drawChoices();
            }
          : undefined,
      });
    });
    this.choiceLabelsDrawn = Math.max(this.choiceLabelsDrawn, n);
    this.hideChoiceLabelsFrom(n);

    this.port.drawShapes(LAYER.choices, shapes);
    this.port.setHits(HITS.choices, hits);
    this.drawCaret();
  }

  /** Hide every choice label from `from` up to the high-water mark. */
  private hideChoiceLabelsFrom(from: number): void {
    for (let i = from; i < this.choiceLabelsDrawn; i++) {
      this.port.drawText(`choice:${i}`, null);
    }
  }

  /**
   * Whether there is a conversation on screen at all.
   *
   * Deliberately the SAME test `drawBox` uses, so the bar and the panel it
   * belongs to can never disagree about whether a conversation is happening.
   * Read off `pages`/`choices` and not off `contentHidden`: `Hide UI` is a
   * conversation that the player asked to look past, and the bar is how they
   * ask for it back, so it stays up.
   */
  private get dialogueActive(): boolean {
    return this.pages.length > 0 || this.choices.length > 0;
  }

  /**
   * Repaint the bar only when its visibility gate actually flipped.
   *
   * `drawBox` runs on every page, every hover and every choice repaint, and
   * five pills plus five labels per pointer move is exactly the churn the
   * render port's header is written against.
   */
  private syncControlBar(): void {
    if (this.dialogueActive !== this.controlBarShown) this.drawControlBar();
  }

  /**
   * The control row. Repainted on hover and on state change, so a control
   * pill and a choice pill hover in the same visual language — they used to
   * disagree, one recolouring its fill and the other only its label.
   *
   * IT IS NOT PERSISTENT ANY MORE (Roc, 2026-08-23: "the visual novel buttons
   * should not be visible all the time"). Auto / Skip / Log / Hide UI /
   * Options are controls for a conversation, and a conversation is what
   * `dialogueActive` reports. Outside one they are five live click targets
   * over the level for a layer that has nothing to show.
   */
  private drawControlBar(): void {
    this.controlBarShown = this.dialogueActive;
    if (!this.controlBarShown) {
      this.port.drawShapes(LAYER.controls, []);
      this.port.setHits(HITS.controls, []);
      CONTROLS.forEach((_, i) => this.port.drawText(`control:${i}`, null));
      // A pill that vanished under the pointer never gets its `onOut`, and a
      // stale hover would light the wrong pill when the bar comes back.
      this.controlHover = -1;
      return;
    }
    const shapes: RoundedRectShape[] = [];
    const hits: HitSpec[] = [];
    this.controlButtons.forEach((btn, i) => {
      const control = CONTROLS[i];
      const active = this.isControlActive(control.id);
      const lit = this.controlHover === i;
      shapes.push({
        rect: btn,
        radius: pillCornerRadius(btn, this.controlRadius),
        style: {
          fillColor: lit || active ? COLOR.panelHover : COLOR.night,
          fillAlpha: 0.9,
          ...stroke(lit || active ? COLOR.emberNum : COLOR.border, active ? 0.9 : 0.35),
        },
      });
      const c = rectCenter(btn);
      this.port.drawText(`control:${i}`, {
        text: control.label,
        x: c.x,
        y: c.y,
        originX: 0.5,
        originY: 0.5,
        fontPx: this.controlFontPx,
        fontFamily: FONT.mono,
        color: lit || active ? COLOR.ember : COLOR.gold,
        align: "center",
      });
      hits.push({
        rect: btn,
        cursor: true,
        onDown: () => this.pressControl(control.id),
        onOver: () => {
          this.controlHover = i;
          this.drawControlBar();
        },
        onOut: () => {
          if (this.controlHover === i) this.controlHover = -1;
          this.drawControlBar();
        },
      });
    });
    this.port.drawShapes(LAYER.controls, shapes);
    this.port.setHits(HITS.controls, hits);
  }

  private isControlActive(id: ControlId): boolean {
    if (id === "auto") return this.autoOn;
    if (id === "skip") return this.skipOn;
    if (id === "log") return this.backlogOpen;
    if (id === "hide-ui") return this.uiHidden;
    return false;
  }

  /**
   * The speaking soul, or nothing.
   *
   * A missing texture is NOT an error and NOT a placeholder box — it is a
   * screen with no sprite, which is exactly what narration looks like. 102 of
   * 121 placements have no authored art; drawing a broken-image frame for each
   * would be louder than the content.
   */
  private drawSprite(): void {
    const speaker =
      this.line && this.line.kind === "dialogue" ? this.line.speaker : null;
    const key =
      speaker && !this.contentHidden ? this.opts.spriteKeyFor?.(speaker) ?? null : null;
    const size = key ? this.port.imageSize(key) : null;
    if (!key || !size) {
      this.port.setImage(null, null);
      return;
    }
    this.port.setImage(key, spritePlacement(this.view, size.height, size.width));
  }

  /**
   * The backlog. `GameEventBus` already keeps an ordered log of every
   * `dialogue:line`, so this is a read, not a second transcript to maintain.
   *
   * READ BACKWARDS, AND STOP. The log is append-only and uncapped, so a walk
   * that has been going for an hour holds thousands of lines — and only the last
   * `maxLines` of them can be on screen. Wrapping the whole transcript to show
   * twenty lines made every `Log` press, every `Hide UI` toggle and every
   * relayout cost a pass over the entire session. Newest first, stop as soon as
   * the panel is full.
   */
  private drawBacklog(): void {
    if (!this.backlogOpen || this.uiHidden) {
      this.port.drawShapes(LAYER.backlog, []);
      this.port.drawText(TEXT.backlog, null);
      return;
    }
    const layout = backlogLayout(this.view);
    const naming = this.opts.displayNameFor ?? soulDisplayName;
    const log = this.bus.logOf("dialogue:line");
    const lines: string[] = [];
    for (let i = log.length - 1; i >= 0 && lines.length < layout.maxLines; i--) {
      const entry = log[i];
      const prefix =
        entry.kind === "dialogue" && entry.speaker ? `${naming(entry.speaker)}: ` : "";
      lines.unshift(
        ...this.port.wrapText(
          prefix + entry.text,
          layout.fontPx,
          FONT.display,
          layout.wrapWidth,
        ),
      );
    }
    // The newest lines are the ones worth showing; the panel is a backlog, not
    // a scrollable archive, so the top is what falls off. The final slice also
    // trims the oldest entry read, which may have overshot the budget.
    const shown = lines.slice(Math.max(0, lines.length - layout.maxLines));

    this.port.drawShapes(LAYER.backlog, [
      {
        rect: layout.panel,
        radius: layout.cornerRadius,
        style: {
          fillColor: COLOR.night,
          fillAlpha: 0.96,
          ...stroke(COLOR.border, BORDER_ALPHA),
        },
      },
    ]);
    this.port.drawText(TEXT.backlog, {
      text: shown.length ? shown.join("\n") : "Nothing has been said yet.",
      x: layout.textX,
      y: layout.textY,
      originX: 0,
      originY: 0,
      fontPx: layout.fontPx,
      fontFamily: FONT.display,
      color: shown.length ? COLOR.ink : COLOR.muted,
      align: "left",
      wrapWidth: layout.wrapWidth,
      lineSpacing: layout.lineGap,
    });
  }

  // -------------------------------------------------------------------------
  // Controls
  // -------------------------------------------------------------------------

  private pressControl(id: ControlId): void {
    switch (id) {
      case "auto":
        this.setAuto(!this.autoOn);
        break;
      case "skip":
        this.setSkip(!this.skipOn);
        break;
      case "log":
        this.setBacklogOpen(!this.backlogOpen);
        break;
      case "hide-ui":
        this.setUiHidden(!this.uiHidden);
        break;
      case "options":
        // The only control with no meaning inside this layer: an options screen
        // is a scene, and this system does not know what scenes are.
        break;
    }
    this.opts.onControl?.(id);
  }

  /** Auto-advance. Turning one of auto/skip on turns the other off. */
  setAuto(on: boolean): void {
    if (this.destroyed) return;
    this.autoOn = on;
    if (on) {
      this.skipOn = false;
      this.port.stopTimer(TIMER.skip);
      this.port.startTimer(
        TIMER.auto,
        this.opts.autoIntervalMs ?? DEFAULT_AUTO_MS,
        () => this.advance(),
      );
    } else {
      this.port.stopTimer(TIMER.auto);
    }
    this.drawControlBar();
  }

  setSkip(on: boolean): void {
    if (this.destroyed) return;
    this.skipOn = on;
    if (on) {
      this.autoOn = false;
      this.port.stopTimer(TIMER.auto);
      this.port.startTimer(
        TIMER.skip,
        this.opts.skipIntervalMs ?? DEFAULT_SKIP_MS,
        () => this.advance(),
      );
    } else {
      this.port.stopTimer(TIMER.skip);
    }
    this.drawControlBar();
  }

  private stopTimers(): void {
    this.autoOn = false;
    this.skipOn = false;
    this.port.stopTimer(TIMER.auto);
    this.port.stopTimer(TIMER.skip);
  }

  // -------------------------------------------------------------------------
  // Keyboard
  // -------------------------------------------------------------------------

  /**
   * A VN that is mouse-only is a fidelity gap against any reference with a
   * persistent control bar, and an accessibility one against everything.
   */
  private bindKeys(): void {
    this.port.onKey("SPACE", () => this.confirm());
    this.port.onKey("ENTER", () => this.confirm());
    this.port.onKey("UP", () => this.moveHighlight(-1));
    this.port.onKey("DOWN", () => this.moveHighlight(1));
    this.port.onKey("ESC", () => this.escape());
    const DIGITS = ["ONE", "TWO", "THREE", "FOUR", "FIVE", "SIX", "SEVEN", "EIGHT", "NINE"];
    DIGITS.forEach((name, i) => this.port.onKey(name, () => this.pick(i)));
  }

  /** Space/Enter: close the backlog, take the highlighted choice, or advance. */
  confirm(): void {
    if (this.destroyed) return;
    if (this.backlogOpen) {
      this.setBacklogOpen(false);
      return;
    }
    if (this.choices.length > 0) {
      const index = this.highlightIndex >= 0 ? this.highlightIndex : this.firstEnabled();
      if (index >= 0) this.pick(index);
      return;
    }
    this.advance();
  }

  /** Up/Down through the enabled choices, wrapping at both ends. */
  moveHighlight(delta: number): void {
    if (this.destroyed || this.choices.length === 0) return;
    const n = this.choices.length;
    let index = this.highlightIndex;
    for (let step = 0; step < n; step++) {
      index = index < 0 ? (delta > 0 ? 0 : n - 1) : (index + delta + n) % n;
      if (this.choices[index].enabled !== false) {
        this.highlightIndex = index;
        this.drawChoices();
        return;
      }
    }
  }

  private firstEnabled(): number {
    return this.choices.findIndex((c) => c.enabled !== false);
  }

  /** Esc closes the backlog, then brings a hidden UI back. */
  private escape(): void {
    if (this.backlogOpen) this.setBacklogOpen(false);
    else if (this.uiHidden) this.setUiHidden(false);
  }
}
