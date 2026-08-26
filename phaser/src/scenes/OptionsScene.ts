/**
 * The Options board (mode5 plan Track 2c — the fourth UI-migration screen).
 * Ports `tools/screen-flow/mockups/options.html` to Phaser.
 *
 * MOSTLY a visual shell, not a data port. Satchel/SaveLoad each rendered a
 * real, shipped state model (`Inventory`, `SaveStore`). Options still has NO
 * such model for Sound, Text & Speed, or Saves: no `SettingsStore`, no audio
 * system, no text-speed hook in the game. Roc's decision (2026-08-18): build
 * the SCREEN and wire the open/close button NOW, wire the actual features
 * LATER. So those categories draw a faithful, navigable layout — the rail
 * switches, rows and the help card update — but their CONTROLS (sliders,
 * toggles) are INERT: dimmed "pending" treatment, change nothing, and the
 * parchment help card states that plainly. This is the never-fake-a-working-
 * control rule made visible: a control that looked functional but silently
 * did nothing is the exact trap avoided here — the "pending" state is shown,
 * not hidden.
 *
 * Display and Accessibility are the exception — both are LIVE (see
 * `LIVE_ROWS_BY_CATEGORY`, `LiveRow`), each row backed by a real
 * `PlayerSettings` key. A row only goes live when the setting behind it is
 * real; nothing here is wired ahead of its data.
 *
 * ROLE — IN-GAME PAUSED OVERLAY, the `SatchelScene` lifecycle exactly (NOT
 * boot-only like `SaveLoadScene`). Opened mid-game from a HUD button / the `O`
 * key; `init` takes `{ onClose }`; `create()` adds a dim scrim + a `layer`
 * Container; ESC and the footer "done" button call `close()` -> `scene.stop()`
 * + `onClose()`. Options is NOT descriptor-gated — every mode gets it (it is
 * global settings), so `CollectScene` wires it with no `mode.systems` guard.
 *
 * SEGMENTED CONTROL — first one built here (2026-08-22), for Hint Strength.
 * The GDD (§14 §9) specs it but until now no row needed one: the mockup's
 * `.seg` style was defined but used by no row in the previously-built
 * categories. §14: bordered row of text options, active segment gold-filled
 * with `onAccent` (dark) text, inactive segments plain/`muted`. Drawn LIVE
 * (`drawLiveSegmented`) — outer corners rounded, inner seams flat, matching
 * the mockup's `overflow:hidden` strip rather than three separate pills.
 *
 * DRAW-ORDER DISCIPLINE. `this.layer` (a Container) renders children in ADD
 * ORDER, not by `.setDepth()` — the same bug that bit SatchelScene/SaveLoadScene
 * (a label rendered under its own background). Every `draw*` below adds
 * back-to-front; the gold filigree is added LAST so it sits over the parchment
 * help card, matching the mockup's `z-index:2` corners.
 *
 * COLOUR. §14 canonical tokens only (`COLOR.gold`/`ember`, the parchment
 * `canvas`/`inkOnCanvas` pair for the help card) — never the VFX golds, never
 * raw hex. The toggle "on" green is derived from the `success` token the same
 * way `SaveLoadScene` derives its rust number, not hardcoded.
 */

import Phaser from "phaser";
import { COLOR, FONT, filigreeCorners, sceneFadeIn } from "../ui/theme";
import { HINT_STRENGTH_VALUES, PlayerSettings } from "../world/PlayerSettings";

const W = 1920;
const H = 1080;

/** The numeric form of the `success` (green) token — `COLOR.success` is only
 * published as a hex string, and a Graphics fill needs a number. Derived from
 * the token rather than re-hardcoding the mockup's `--green`, per the §14
 * no-raw-hex rule (same trick as `SaveLoadScene`'s `DANGER_NUM`). */
const SUCCESS_NUM = Phaser.Display.Color.HexStringToColor(COLOR.success).color;

const BOARD_W = 1400;
const BOARD_H = 820;
const BOARD_X = (W - BOARD_W) / 2;
const BOARD_TOP = 130;
const RADIUS = 16;

const RAIL_W = 300;
const HELP_W = 360;
const FOOTER_H = 78;
const CONTENT_H = BOARD_H - FOOTER_H;

const MIDDLE_X = BOARD_X + RAIL_W;
const MIDDLE_W = BOARD_W - RAIL_W - HELP_W;
const HELP_X = BOARD_X + BOARD_W - HELP_W;

interface HelpText {
  title: string;
  body: string;
}

interface SettingRow {
  label: string;
  kind: "slider" | "toggle";
  /** Slider: a fixed representative position, 0-100. INERT — never mutated. */
  value: number;
  /** Toggle: a fixed representative state. INERT — never mutated. */
  on: boolean;
  help: HelpText;
}

interface Category {
  label: string;
  eyebrow: string;
  /** Empty for every category but Sound — the mockup only populates Sound, and
   * fabricating rows for the others is forbidden (see the class header). */
  rows: SettingRow[];
  /** The help card shown for a category with no rows. */
  help: HelpText;
}

const CATEGORIES: readonly Category[] = [
  {
    label: "Sound",
    eyebrow: "Sound",
    help: { title: "Sound", body: "Volumes and cues for music, effects, and ambience." },
    rows: [
      {
        label: "Music",
        kind: "slider",
        value: 70,
        on: false,
        help: {
          title: "Music",
          body: "The score that plays under exploration. It fades on its own during a soul's conversation, so lines are never buried.",
        },
      },
      {
        label: "Sound Effects",
        kind: "slider",
        value: 70,
        on: false,
        help: { title: "Sound Effects", body: "Foley for foraging, moving through a screen, and the small clicks of the interface." },
      },
      {
        label: "Forest & Town Ambience",
        kind: "slider",
        value: 70,
        on: false,
        help: { title: "Ambience", body: "The bed of forest and town sound that sits under each place." },
      },
      {
        label: "Spell Cast Sounds",
        kind: "toggle",
        value: 0,
        on: true,
        help: { title: "Spell Cast Sounds", body: "The chime and rush a cast makes when it lands." },
      },
      {
        label: "Mute when window is hidden",
        kind: "toggle",
        value: 0,
        on: false,
        help: { title: "Mute when hidden", body: "Silences everything when the game tab loses focus." },
      },
    ],
  },
  {
    label: "Text & Speed",
    eyebrow: "Text & Speed",
    rows: [],
    help: { title: "Text & Speed", body: "How quickly dialogue and description print, and how large the type sits." },
  },
  {
    label: "Display",
    eyebrow: "Display",
    // Rendered specially, not through the generic (inert) row loop — see
    // `DISPLAY_LIVE_ROWS` and `drawLiveSlider`, the real, wired controls.
    rows: [],
    help: { title: "Display", body: "Motion and transition timing." },
  },
  {
    label: "Accessibility",
    eyebrow: "Accessibility",
    // Rendered specially, not through the generic (inert) row loop — see
    // `ACCESSIBILITY_LIVE_ROWS` below. `rows`/`help` unused for this category.
    rows: [],
    help: { title: "Accessibility", body: "Reduced motion, higher-contrast text, and other comfort options." },
  },
  {
    label: "Saves",
    eyebrow: "Saves",
    rows: [],
    help: { title: "Saves", body: "Your autosave lives here. Progress saves on its own each time the day or place changes." },
  },
];

const DISPLAY_INDEX = CATEGORIES.findIndex((c) => c.label === "Display");
const ACCESSIBILITY_INDEX = CATEGORIES.findIndex((c) => c.label === "Accessibility");

/**
 * A LIVE row — not a `SettingRow`, since those render through the dimmed/
 * inert `drawSlider`/`drawToggle`. Three kinds, one per real control this
 * screen wires: `slider` (Display's Pan Speed/Transition Fade, both sharing
 * the "right = fast" convention — see `PlayerSettings`'s own header on why
 * Fade is inverted to match), `segmented` (Accessibility's Hint Strength,
 * the first segmented control built — §14 §9), and `toggle` (Accessibility's
 * drop-confirmation). `LIVE_ROWS_BY_CATEGORY` maps a category index to its
 * rows; `drawRows()` dispatches on `kind` so a category needs only its data,
 * not its own copy of the render loop.
 */
type LiveRow =
  | { kind: "slider"; label: string; help: HelpText; getPercent: () => number; setPercent: (percent: number) => void }
  | {
      kind: "segmented";
      label: string;
      help: HelpText;
      options: readonly string[];
      getIndex: () => number;
      setIndex: (index: number) => void;
    }
  | { kind: "toggle"; label: string; help: HelpText; getOn: () => boolean; setOn: (on: boolean) => void };

const DISPLAY_LIVE_ROWS: readonly LiveRow[] = [
  {
    kind: "slider",
    label: "Pan Speed",
    help: {
      title: "Pan Speed",
      body: "How quickly the backdrop eases toward the mouse when you look around a scene. Left = slow and languid, right = snappy.",
    },
    getPercent: () => PlayerSettings.panSpeedPercent,
    setPercent: (p) => PlayerSettings.setPanSpeedPercent(p),
  },
  {
    kind: "slider",
    label: "Transition Fade",
    help: {
      title: "Transition Fade",
      body: "How long a scene or modal takes to fade in when it opens. Left = a slow 2s fade, right = a quick 0.2s one.",
    },
    getPercent: () => PlayerSettings.fadeSpeedPercent,
    setPercent: (p) => PlayerSettings.setFadeSpeedPercent(p),
  },
  {
    kind: "slider",
    label: "Scene Dimming",
    help: {
      title: "Scene Dimming",
      body: "How far the wash over a screen's artwork is turned up. Left = off, so you see the level exactly as painted; right = the darkest setting, for backdrops bright enough to fight the text on top of them.",
    },
    getPercent: () => PlayerSettings.scrimStrengthPercent,
    setPercent: (p) => PlayerSettings.setScrimStrengthPercent(p),
  },
];

/** wireframe §3/§7 — hint strength and drop-confirmation, the two settings
 * those sections rule as "a setting, not a fixed rule," both scoped to
 * Options · Accessibility. */
const ACCESSIBILITY_LIVE_ROWS: readonly LiveRow[] = [
  {
    kind: "segmented",
    label: "Hint Strength",
    help: {
      title: "Hint Strength",
      body: "Off: no proactive hints anywhere — the traversal “?” tooltip still works, since that's a reveal you asked for. Subtle (default): only the post-cast next-step pill, and only when a cast turned up something new. Generous: plausible components are grouped in the cast picker itself, before you guess.",
    },
    options: ["Off", "Subtle", "Generous"],
    getIndex: () => HINT_STRENGTH_VALUES.indexOf(PlayerSettings.hintStrength),
    setIndex: (i) => PlayerSettings.setHintStrength(HINT_STRENGTH_VALUES[i]),
  },
  {
    kind: "toggle",
    label: "Always Warn Before Dropping",
    help: {
      title: "Always Warn Before Dropping",
      body: "Off (default): dropping a satchel item only warns when a known spell still needs it. On: every drop asks first, no matter what it's for.",
    },
    getOn: () => PlayerSettings.dropConfirmAlways,
    setOn: (on) => PlayerSettings.setDropConfirmAlways(on),
  },
];

const LIVE_ROWS_BY_CATEGORY = new Map<number, readonly LiveRow[]>([
  [DISPLAY_INDEX, DISPLAY_LIVE_ROWS],
  [ACCESSIBILITY_INDEX, ACCESSIBILITY_LIVE_ROWS],
]);

/** The honest note on every help card — settings are not connected yet. */
const PENDING_NOTE = "Not wired up yet. This screen is a preview — moving a control changes nothing until settings are connected.";

export interface OptionsSceneData {
  onClose: () => void;
}

export class OptionsScene extends Phaser.Scene {
  private onClose!: () => void;
  private category = 0;
  /** The selected row WITHIN the active category — honest navigation (it drives
   * the help card), not a control mutation. Reset to 0 on category change. */
  private selectedRow = 0;
  /** Stacking is ADD ORDER, not `.setDepth()` — see the class header. */
  private layer!: Phaser.GameObjects.Container;
  /**
   * The live-slider drag in progress, if any — kept scene-level (not
   * per-redraw) so the `pointermove`/`pointerup` listeners are registered
   * exactly once, in `create()`, and survive `redraw()` recreating the
   * track underneath them. `onDragPercent` is whichever live row's own
   * setter (Pan Speed's or the Transition Fade's).
   */
  private liveDrag: { trackX: number; trackW: number; onDragPercent: (percent: number) => void } | null = null;

  constructor() {
    super("OptionsScene");
  }

  init(data: OptionsSceneData) {
    this.onClose = data.onClose;
    this.category = 0;
    this.selectedRow = 0;
  }

  create() {
    sceneFadeIn(this);
    this.add.rectangle(W / 2, H / 2, W, H, COLOR.night, 0.6).setDepth(0);
    this.layer = this.add.container(0, 0).setDepth(1);
    this.input.keyboard?.on("keydown-ESC", () => this.close());
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => {
      if (!this.liveDrag) return;
      const { trackX, trackW, onDragPercent } = this.liveDrag;
      onDragPercent(Phaser.Math.Clamp(((p.x - trackX) / trackW) * 100, 0, 100));
      this.redraw();
    });
    this.input.on("pointerup", () => (this.liveDrag = null));
    this.redraw();
  }

  private close(): void {
    this.input.keyboard?.removeAllListeners();
    this.scene.stop();
    this.onClose();
  }

  private redraw(): void {
    this.layer.removeAll(true);
    this.drawBoard();
    this.drawRail();
    this.drawRows();
    this.drawHelp();
    this.drawFooter();
    // Corners LAST so they sit over the parchment help card (mockup `z-index:2`).
    this.layer.add(filigreeCorners(this, BOARD_X + BOARD_W / 2, BOARD_TOP + BOARD_H / 2, BOARD_W, BOARD_H));
  }

  private drawBoard(): void {
    // Drop shadow (mockup: `box-shadow: 0 24px 60px rgba(0,0,0,.55)`).
    const shadow = this.add.graphics();
    shadow.fillStyle(COLOR.night, 0.55);
    shadow.fillRoundedRect(BOARD_X - 6, BOARD_TOP + 18, BOARD_W + 12, BOARD_H + 12, 20);
    this.layer.add(shadow);

    // Framed board — §5.1 dark leather gradient, leatherDark border.
    const g = this.add.graphics();
    g.fillGradientStyle(COLOR.leatherNum, COLOR.leatherNum, COLOR.leatherDarkNum, COLOR.leatherDarkNum, 1);
    g.fillRoundedRect(BOARD_X, BOARD_TOP, BOARD_W, BOARD_H, RADIUS);
    g.lineStyle(2, COLOR.leatherDarkNum, 1);
    g.strokeRoundedRect(BOARD_X, BOARD_TOP, BOARD_W, BOARD_H, RADIUS);
    // Rail/middle divider + footer top rule (mockup's `border-right`/`border-top`).
    g.lineStyle(1, COLOR.goldNum, 0.16);
    g.lineBetween(MIDDLE_X, BOARD_TOP + 8, MIDDLE_X, BOARD_TOP + CONTENT_H - 8);
    g.lineBetween(BOARD_X + 8, BOARD_TOP + CONTENT_H, BOARD_X + BOARD_W - 8, BOARD_TOP + CONTENT_H);
    this.layer.add(g);
  }

  private drawRail(): void {
    // Title — display, gold-bright (`ember`).
    this.text(BOARD_X + 26, BOARD_TOP + 26, "Options", COLOR.ember, 30, FONT.display).setFontStyle("bold");

    CATEGORIES.forEach((cat, i) => {
      const active = i === this.category;
      const cy = BOARD_TOP + 96 + i * 52;
      if (active) {
        // Gold-tinted fill + a 2px gold-bright left border — the §7 rail-tab
        // variant (vertical). ADD ORDER: fill + border first, text last.
        const fill = this.add.rectangle(BOARD_X + RAIL_W / 2 + 6, cy, RAIL_W - 24, 42, COLOR.goldNum, 0.12);
        this.layer.add(fill);
        const bar = this.add.rectangle(BOARD_X + 13, cy, 2, 42, COLOR.emberNum, 1);
        this.layer.add(bar);
      }
      const label = this.text(BOARD_X + 30, cy, cat.label, active ? COLOR.ember : COLOR.muted, 17, FONT.display).setOrigin(
        0,
        0.5,
      );
      const hit = this.add.rectangle(BOARD_X + RAIL_W / 2 + 6, cy, RAIL_W - 24, 42, 0x000000, 0.0001);
      this.layer.add(hit);
      hit.setInteractive({ useHandCursor: true });
      if (!active) {
        hit.on("pointerover", () => label.setColor(COLOR.ink));
        hit.on("pointerout", () => label.setColor(COLOR.muted));
      }
      hit.on("pointerdown", () => {
        this.category = i;
        this.selectedRow = 0;
        this.redraw();
      });
    });
  }

  private drawRows(): void {
    const cat = CATEGORIES[this.category];
    const x = MIDDLE_X + 30;
    // Eyebrow — mono uppercase, gold.
    this.text(x, BOARD_TOP + 34, cat.eyebrow.toUpperCase(), COLOR.gold, 12, FONT.mono);

    const liveRows = LIVE_ROWS_BY_CATEGORY.get(this.category);
    if (liveRows) {
      this.text(x, BOARD_TOP + 58, "LIVE — SAVED AUTOMATICALLY", COLOR.gold, 11, FONT.mono);
      if (this.selectedRow >= liveRows.length) this.selectedRow = 0;
      const rowH = 66;
      let ry = BOARD_TOP + 100;
      liveRows.forEach((row, i) => {
        const cy = ry + rowH / 2;
        if (i === this.selectedRow) {
          const fill = this.add.rectangle(MIDDLE_X + MIDDLE_W / 2, cy, MIDDLE_W - 20, rowH - 6, COLOR.goldNum, 0.1);
          this.layer.add(fill);
        }
        this.text(x, cy, row.label, COLOR.ink, 17, FONT.display).setOrigin(0, 0.5);
        if (row.kind === "slider") this.drawLiveSlider(cy, row.getPercent(), row.setPercent);
        else if (row.kind === "segmented") this.drawLiveSegmented(cy, row.options, row.getIndex(), row.setIndex);
        else this.drawLiveToggle(cy, row.getOn(), row.setOn);

        const rule = this.add.graphics();
        rule.lineStyle(1, COLOR.goldNum, 0.14);
        rule.lineBetween(x, ry + rowH, MIDDLE_X + MIDDLE_W - 30, ry + rowH);
        this.layer.add(rule);

        // Row-select hit — the label area only, so it doesn't fight the
        // control's own hit rect further right on the same row.
        const hit = this.add.rectangle(x + 90, cy, 180, rowH, 0x000000, 0.0001);
        this.layer.add(hit);
        hit.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
          this.selectedRow = i;
          this.redraw();
        });
        ry += rowH;
      });
      return;
    }
    // Pending banner — makes the inert state visible where the controls are.
    this.text(x, BOARD_TOP + 58, "PREVIEW · CONTROLS NOT YET WIRED", COLOR.muted, 11, FONT.mono);

    if (cat.rows.length === 0) {
      const note = this.text(x, BOARD_TOP + 120, "Nothing to adjust here yet.", COLOR.muted, 17, FONT.display);
      note.setFontStyle("italic");
      return;
    }

    if (this.selectedRow >= cat.rows.length) this.selectedRow = 0;
    const rowH = 66;
    let ry = BOARD_TOP + 100;
    cat.rows.forEach((row, i) => {
      const cy = ry + rowH / 2;
      const selected = i === this.selectedRow;
      if (selected) {
        const fill = this.add.rectangle(MIDDLE_X + MIDDLE_W / 2, cy, MIDDLE_W - 20, rowH - 6, COLOR.goldNum, 0.1);
        this.layer.add(fill);
      }
      this.text(x, cy, row.label, COLOR.ink, 17, FONT.display).setOrigin(0, 0.5);
      if (row.kind === "slider") this.drawSlider(cy, row.value);
      else this.drawToggle(cy, row.on);

      // Bottom divider (mockup: `border-bottom` on `.row`).
      const rule = this.add.graphics();
      rule.lineStyle(1, COLOR.goldNum, 0.14);
      rule.lineBetween(x, ry + rowH, MIDDLE_X + MIDDLE_W - 30, ry + rowH);
      this.layer.add(rule);

      // Honest navigation: selecting a row updates the help card. Not a control.
      const hit = this.add.rectangle(MIDDLE_X + MIDDLE_W / 2, cy, MIDDLE_W - 20, rowH, 0x000000, 0.0001);
      this.layer.add(hit);
      hit.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        this.selectedRow = i;
        this.redraw();
      });
      ry += rowH;
    });
  }

  /**
   * A slider VISUAL — track, gold fill to a fixed representative position, and
   * a thumb — drawn dimmed to read as PENDING (see the class header). No drag
   * is wired: the position never moves.
   */
  private drawSlider(cy: number, value: number): void {
    const valueX = MIDDLE_X + MIDDLE_W - 30;
    const trackW = 200;
    const trackRight = valueX - 58;
    const trackX = trackRight - trackW;
    const filled = trackW * (value / 100);

    const g = this.add.graphics();
    g.setAlpha(0.5);
    g.fillStyle(COLOR.leatherDarkNum, 1);
    g.fillRoundedRect(trackX, cy - 4, trackW, 8, 4);
    g.fillStyle(COLOR.goldNum, 1);
    g.fillRoundedRect(trackX, cy - 4, filled, 8, 4);
    g.fillStyle(COLOR.emberNum, 1);
    g.fillCircle(trackX + filled, cy, 9);
    g.lineStyle(2, COLOR.leatherDarkNum, 1);
    g.strokeCircle(trackX + filled, cy, 9);
    this.layer.add(g);

    this.text(valueX, cy, String(value), COLOR.ember, 15, FONT.mono).setOrigin(1, 0.5).setAlpha(0.7);
  }

  /**
   * A REAL, wired slider — full-brightness (no PENDING dim), unlike every
   * other slider on this screen. `setPercent` is whichever `DISPLAY_LIVE_ROWS`
   * entry owns this row; `redraw()` on every drag move so the number and fill
   * track the drag in real time.
   */
  private drawLiveSlider(cy: number, percent: number, setPercent: (p: number) => void): void {
    const valueX = MIDDLE_X + MIDDLE_W - 30;
    const trackW = 200;
    const trackRight = valueX - 58;
    const trackX = trackRight - trackW;
    const filled = trackW * (percent / 100);

    const g = this.add.graphics();
    g.fillStyle(COLOR.leatherDarkNum, 1);
    g.fillRoundedRect(trackX, cy - 4, trackW, 8, 4);
    g.fillStyle(COLOR.goldNum, 1);
    g.fillRoundedRect(trackX, cy - 4, filled, 8, 4);
    g.fillStyle(COLOR.emberNum, 1);
    g.fillCircle(trackX + filled, cy, 9);
    g.lineStyle(2, COLOR.leatherDarkNum, 1);
    g.strokeCircle(trackX + filled, cy, 9);
    this.layer.add(g);
    this.text(valueX, cy, String(percent), COLOR.ember, 15, FONT.mono).setOrigin(1, 0.5);

    const hit = this.add.rectangle(trackX + trackW / 2, cy, trackW + 24, 34, 0x000000, 0.0001);
    this.layer.add(hit);
    hit.setInteractive({ useHandCursor: true }).on("pointerdown", (p: Phaser.Input.Pointer) => {
      this.liveDrag = { trackX, trackW, onDragPercent: setPercent };
      setPercent(Phaser.Math.Clamp(((p.x - trackX) / trackW) * 100, 0, 100));
      this.redraw();
    });
  }

  /**
   * The segmented control — §14 §9: bordered row of text options, active
   * segment gold-filled with `onAccent` (dark) text, inactive plain/`muted`.
   * Right-aligned like the sliders (own right edge at `valueX`). Segments
   * are sized to their own label width (measured off the just-created Text
   * object, same pattern `pillWidth` uses), and only the OUTER corners round
   * — inner seams stay flat — matching the mockup's `overflow:hidden` strip
   * rather than three separate pills. ADD ORDER: border frame, then each
   * segment's fill (only the active one), then its label on top, then its
   * own hit rect last.
   */
  private drawLiveSegmented(cy: number, options: readonly string[], activeIndex: number, onSelect: (index: number) => void): void {
    const valueX = MIDDLE_X + MIDDLE_W - 30;
    const segH = 30;
    const padX = 14;
    const corner = 6;

    // Measure first, via plain `this.add.text` — NOT the `this.text()` helper,
    // which adds to `this.layer` immediately. Adding labels before the fills
    // exist would draw them BEHIND the active gold fill (the exact
    // container add-order bug the class header warns about); building them
    // unattached here and adding each one only once its fill is down keeps
    // every segment back-to-front.
    const labels = options.map((label) => this.add.text(0, cy, label, { fontFamily: FONT.mono, fontSize: "12.5px" }).setOrigin(0.5));
    const widths = labels.map((t) => t.width + padX * 2);
    const totalW = widths.reduce((a, b) => a + b, 0);
    const segX = valueX - totalW;

    const frame = this.add.graphics();
    frame.lineStyle(1, COLOR.leatherLightNum, 1);
    frame.strokeRoundedRect(segX, cy - segH / 2, totalW, segH, corner);
    this.layer.add(frame);

    let curX = segX;
    labels.forEach((t, i) => {
      const w = widths[i];
      const active = i === activeIndex;
      if (active) {
        // Only the outer corners round — inner seams stay flat, matching the
        // mockup's `overflow:hidden` strip rather than three separate pills.
        const fill = this.add.graphics();
        fill.fillStyle(COLOR.goldNum, 1);
        const radius = {
          tl: i === 0 ? corner : 0,
          bl: i === 0 ? corner : 0,
          tr: i === options.length - 1 ? corner : 0,
          br: i === options.length - 1 ? corner : 0,
        };
        fill.fillRoundedRect(curX, cy - segH / 2, w, segH, radius);
        this.layer.add(fill);
      }
      t.setPosition(curX + w / 2, cy);
      t.setColor(active ? COLOR.onAccent : COLOR.muted);
      if (active) t.setFontStyle("bold");
      this.layer.add(t);

      const hit = this.add.rectangle(curX + w / 2, cy, w, segH, 0x000000, 0.0001);
      this.layer.add(hit);
      hit.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
        onSelect(i);
        this.redraw();
      });
      curX += w;
    });
  }

  /**
   * A REAL, wired toggle — full-brightness (no PENDING dim), unlike
   * `drawToggle`. Same pill-switch shape and `success`-token green, but
   * clickable: a pointerdown flips the value and redraws.
   */
  private drawLiveToggle(cy: number, on: boolean, onToggle: (on: boolean) => void): void {
    const w = 52;
    const h = 28;
    const right = MIDDLE_X + MIDDLE_W - 30;
    const x = right - w;
    const g = this.add.graphics();
    g.fillStyle(on ? SUCCESS_NUM : COLOR.leatherDarkNum, 1);
    g.fillRoundedRect(x, cy - h / 2, w, h, h / 2);
    const knobX = on ? x + w - h / 2 : x + h / 2;
    g.fillStyle(COLOR.canvas, 1);
    g.fillCircle(knobX, cy, h / 2 - 3);
    this.layer.add(g);

    const hit = this.add.rectangle(x + w / 2, cy, w + 20, h + 12, 0x000000, 0.0001);
    this.layer.add(hit);
    hit.setInteractive({ useHandCursor: true }).on("pointerdown", () => {
      onToggle(!on);
      this.redraw();
    });
  }

  /**
   * A pill toggle VISUAL — dimmed to read as PENDING. No click is wired: the
   * state never flips. "On" uses the token-derived `success` green; "off" the
   * dark leather, matching the mockup.
   */
  private drawToggle(cy: number, on: boolean): void {
    const w = 52;
    const h = 28;
    const right = MIDDLE_X + MIDDLE_W - 30;
    const x = right - w;
    const g = this.add.graphics();
    g.setAlpha(0.5);
    g.fillStyle(on ? SUCCESS_NUM : COLOR.leatherDarkNum, 1);
    g.fillRoundedRect(x, cy - h / 2, w, h, h / 2);
    const knobX = on ? x + w - h / 2 : x + h / 2;
    g.fillStyle(COLOR.canvas, 1);
    g.fillCircle(knobX, cy, h / 2 - 3);
    this.layer.add(g);
  }

  private drawHelp(): void {
    const cat = CATEGORIES[this.category];
    const liveRows = LIVE_ROWS_BY_CATEGORY.get(this.category);
    const help = liveRows
      ? liveRows[Math.min(this.selectedRow, liveRows.length - 1)].help
      : cat.rows.length
        ? cat.rows[Math.min(this.selectedRow, cat.rows.length - 1)].help
        : cat.help;

    // Parchment card — §5.2 canvas gradient, dark ink (inverted from the rest).
    const g = this.add.graphics();
    g.fillGradientStyle(COLOR.canvas, COLOR.canvas, COLOR.canvas2Num, COLOR.canvas2Num, 1);
    g.fillRoundedRect(HELP_X, BOARD_TOP, HELP_W, CONTENT_H, { tl: 0, tr: RADIUS, bl: 0, br: 0 });
    this.layer.add(g);

    const x = HELP_X + 26;
    let y = BOARD_TOP + 30;
    this.text(x, y, cat.eyebrow.toUpperCase(), COLOR.inkSoftOnCanvas, 11, FONT.mono);
    y += 24;
    this.text(x, y, help.title, COLOR.inkOnCanvas, 24, FONT.display).setFontStyle("bold");
    y += 44;
    const body = this.text(x, y, help.body, COLOR.inkSoftOnCanvas, 15, FONT.display);
    body.setWordWrapWidth(HELP_W - 52, true);
    body.setLineSpacing(4);

    // Divider + the honest pending note, pinned near the card bottom.
    const noteTop = BOARD_TOP + CONTENT_H - 130;
    const rule = this.add.graphics();
    rule.lineStyle(1, COLOR.canvasEdgeNum, 1);
    rule.lineBetween(x, noteTop, HELP_X + HELP_W - 26, noteTop);
    this.layer.add(rule);
    const noteBody = LIVE_ROWS_BY_CATEGORY.has(this.category)
      ? "Saved to this device — carries over New Life and any save."
      : PENDING_NOTE;
    const note = this.text(x, noteTop + 14, noteBody, COLOR.inkSoftOnCanvas, 13, FONT.display);
    note.setWordWrapWidth(HELP_W - 52, true);
    note.setLineSpacing(4);
    note.setFontStyle("italic");
  }

  private drawFooter(): void {
    const fy = BOARD_TOP + CONTENT_H + FOOTER_H / 2;
    // Bracket-free labels (Roc's Group 2 note) — the pill IS the button now,
    // so the old `[ ... ]` typography is redundant chrome on top of chrome.
    // "Reset Category" — inert, present for layout (muted, non-interactive).
    this.pill(BOARD_X + 30, fy, "Reset Category", false);
    // "Done · Esc" — the real close.
    const label = "Done · Esc";
    const w = this.pillWidth(label);
    this.pill(BOARD_X + BOARD_W - 30 - w, fy, label, true, () => this.close());
  }

  private pillWidth(label: string): number {
    return label.length * 9 + 32;
  }

  private pill(x: number, cy: number, label: string, enabled: boolean, onClick?: () => void): void {
    const w = this.pillWidth(label);
    const h = 34;
    const cx = x + w / 2;
    const rect = this.add
      .rectangle(cx, cy, w, h)
      .setStrokeStyle(1, COLOR.leatherLightNum, enabled ? 0.9 : 0.5)
      .setFillStyle();
    this.layer.add(rect);
    const t = this.text(cx, cy, label, enabled ? COLOR.ember : COLOR.muted, 15, FONT.mono).setOrigin(0.5);
    if (enabled && onClick) {
      rect.setInteractive({ useHandCursor: true });
      rect.on("pointerover", () => {
        rect.setStrokeStyle(1, COLOR.emberNum, 1);
        t.setColor(COLOR.ember);
      });
      rect.on("pointerout", () => rect.setStrokeStyle(1, COLOR.leatherLightNum, 0.9));
      rect.on("pointerdown", onClick);
      t.setInteractive({ useHandCursor: true }).on("pointerdown", onClick);
    }
  }

  private text(x: number, y: number, value: string, color: string, size: number, font: string = FONT.display): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, value, { fontFamily: font, fontSize: `${size}px`, color });
    this.layer.add(t);
    return t;
  }
}
