/**
 * The HUD nav row — extracted out of `CollectScene.create()`
 * (`tests/HedgeCastPromptTraversalRow.test.ts` caps the scene under 1120
 * lines; this bought the headroom the same way `TraversalRow`/
 * `HedgeCastPrompt` did for their own responsibilities), building the
 * icon-cluster redesign approved in `tools/screen-flow/mockups/
 * mode5-ux-flow-wireframe.html`'s §4 ("HUD nav row" — `id="nav"`,
 * "✓ approved as shown — build this").
 *
 * WHAT CHANGED FROM THE OLD ROW. Five-to-six equal-weight bracket-text
 * buttons, in construction order, become icon clusters — **gear**
 * (Satchel, Notebook), **world** (Home, Calendar), **system** (Options) —
 * separated by a hairline divider, icon-first with the label+hotkey
 * revealed on hover.
 *
 * ---------------------------------------------------------------------------
 * T14 — THE ROW IS NOW THE HUD BAR'S EXPLORE TENANT (2026-08-24).
 * ---------------------------------------------------------------------------
 *
 * `plans/2026-08-23-hud-relayout-ruling.md`, wireframe
 * `tools/screen-flow/mockups/hud-relayout-wireframe.html` §1/§1b/§4. Four
 * changes, all of them stamped there:
 *
 *   1. **Anchor.** The row no longer right-aligns into the top-right corner.
 *      It draws left-to-right from `opts.leftX`, and `render/HudBar.ts` is
 *      what centres it along the bottom edge (`measure()` below is how the
 *      bar knows how wide to draw its plate before anything is placed).
 *   2. **Tooltips open ABOVE the tile**, not to its left. There is no room
 *      below a bottom-anchored bar, and the left-anchored placement only ever
 *      existed to dodge the dev pill row that used to stack under the old
 *      top-right position — that row now owns the corner outright.
 *   3. **No persistent Decorate caption.** §4 ruled it cut: "Tooltips open
 *      above the bar; no persistent caption. Bottom-center placement carries
 *      the discoverability." `NavIconSpec.caption` went with it.
 *   4. **A fourth cluster — §1b day actions**, past Settings behind its own
 *      divider. `Wait` is an ordinary 44px tile (hotkey `W`). `End the Day`
 *      is a TEXT PILL, not an icon — reading "End day · E", ember-accented,
 *      reusing the cast tenant's `Exit cast · Esc` shape — because a one-way
 *      commitment must not ride on an icon-only affordance with no caption
 *      (WCAG 1.1.1/4.1.2; the wireframe's own §1b reasoning). The confirm step
 *      the ruling requires is the CALLER's (`HudBar` wires it), not this
 *      file's: this row draws controls and reports clicks.
 *
 * The two day-action controls are ALWAYS DRAWN (Option A, ruled 2026-08-24 —
 * "Always-visible fourth cluster. No drawer."). Ink does not always offer
 * them, though: `emitScreen` guards `[Wait]` on `movesLeft > 0 && TimeOfDay !=
 * night`. Rather than rebuild the row (and change the bar's width) whenever
 * the clock moves, `setDayActionsEnabled()` dims them in place. Stable
 * geometry is the point of a docked bar.
 *
 * ACCESSIBILITY: hover is not the only way to reach a tooltip. `Tab` cycles
 * a local focus index across every control in cluster order (wrapping), same
 * shape as `DialogueSystem.moveHighlight` — showing that control's tooltip
 * and lit paint without a pointer; `Enter`/`Space` activates the focused
 * control; `Escape` clears focus. The End-day pill is in that cycle too, which
 * is why it is built through the same item machinery as the tiles rather than
 * bolted on beside them.
 *
 * WHAT THIS DOES NOT OWN. The bar plate behind it (`HudBar`). Dev-only HUD
 * affordances (`[ Edit — E ]`, the mode5 debug-unlock button) — §4: "Dev pills
 * stay top-right, owning the corner the old NavRow vacates (dev builds only)."
 * `CollectScene` keeps building those through `ModalFrame.buttonRow()`.
 */

import Phaser from "phaser";
import { COLOR, FONT } from "../ui/theme";
import { pillCornerRadius, VN_METRICS } from "../world/view/DialogueLayout";

/** The nav concepts this row draws. Was raw Unicode emoji (🎒📓🏠🗓⚙) —
 * matching the mockup literally, but emoji carry their own embedded color
 * and ignore every `.setColor()`/token repaint this file does for the rest
 * of the icon (§14: gold is the one accent that means "interactive"; an
 * emoji glyph never reads as part of it). None of these concepts has a
 * bespoke SVG the way the six satchel materials do (`public/art/ui/satchel/
 * *.svg`), so per §11's own fallback rule — "anything without a bespoke icon
 * falls back to a plain dusk-and-gold Graphics [glyph] rather than a
 * missing-art hole" (`drawLeafGlyph` in `SatchelScene.ts` is the shipped
 * example) — these are drawn as single-color Graphics glyphs instead,
 * via `drawNavGlyph()` below, so they take `COLOR.gold`/`ember` exactly like
 * the tile they sit in. `hourglass` joined them for §1b's Wait tile. */
export type NavGlyphKind = "satchel" | "notebook" | "home" | "calendar" | "gear" | "hourglass";

/** One icon in a cluster. `key` is the hotkey shown in the tooltip after
 * "· " — `null` when the control has no dedicated letter key of its own
 * (Options: opens via the VN control bar's own button and `O`, but the
 * mockup's tooltip for it reads plain "Options", no key suffix). */
export interface NavIconSpec {
  readonly icon: NavGlyphKind;
  readonly label: string;
  readonly key: string | null;
  readonly onClick: () => void;
}

/** §1b's End-the-Day control: a text pill, not a tile. Same cluster, same
 * focus cycle, different shape — see this file's header on why. */
export interface NavPillSpec {
  readonly text: string;
  readonly label: string;
  readonly key: string | null;
  readonly onClick: () => void;
}

/**
 * Draw one nav glyph, stroked in `color` (pass `COLOR.goldNum`/`emberNum` to
 * match the tile's idle/lit state) — the fallback vocabulary §11 establishes
 * for a concept without a bespoke SVG. Simple line-art, no fills, so it reads
 * at the 44px tile size without muddying against the tile's own fill/border.
 */
export function drawNavGlyph(
  g: Phaser.GameObjects.Graphics,
  kind: NavGlyphKind,
  cx: number,
  cy: number,
  size: number,
  color: number,
): void {
  const r = size / 2;
  g.lineStyle(2, color, 1);
  switch (kind) {
    case "satchel": {
      // Pouch body + a peaked flap line — same silhouette language as the
      // satchel material tiles, simplified to a two-stroke glyph.
      const w = size * 0.8;
      const h = size * 0.6;
      const x0 = cx - w / 2;
      const y0 = cy - h / 2 + size * 0.12;
      g.strokeRoundedRect(x0, y0, w, h, 3);
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(cx, y0 - size * 0.22);
      g.lineTo(x0 + w, y0);
      g.strokePath();
      break;
    }
    case "notebook": {
      // Cover rect + spine line + three page rules.
      const w = size * 0.6;
      const h = size * 0.8;
      const x0 = cx - w / 2;
      const y0 = cy - h / 2;
      g.strokeRoundedRect(x0, y0, w, h, 2);
      g.beginPath();
      g.moveTo(x0 + w * 0.3, y0);
      g.lineTo(x0 + w * 0.3, y0 + h);
      g.strokePath();
      for (const t of [0.3, 0.52, 0.74]) {
        g.beginPath();
        g.moveTo(x0 + w * 0.46, y0 + h * t);
        g.lineTo(x0 + w * 0.86, y0 + h * t);
        g.strokePath();
      }
      break;
    }
    case "home": {
      // Roof peak + walls — the classic minimal-house pictogram.
      const w = size * 0.78;
      const h = size * 0.58;
      const x0 = cx - w / 2;
      const yEave = cy - h * 0.05;
      const yRoof = cy - h * 0.65;
      const yBase = cy + h * 0.52;
      g.beginPath();
      g.moveTo(x0, yEave);
      g.lineTo(cx, yRoof);
      g.lineTo(x0 + w, yEave);
      g.strokePath();
      g.strokeRect(x0 + w * 0.14, yEave, w * 0.72, yBase - yEave);
      break;
    }
    case "calendar": {
      // Framed grid + two hanger tabs.
      const w = size * 0.78;
      const h = size * 0.68;
      const x0 = cx - w / 2;
      const y0 = cy - h / 2 + size * 0.06;
      g.strokeRoundedRect(x0, y0, w, h, 3);
      g.beginPath();
      g.moveTo(x0, y0 + h * 0.3);
      g.lineTo(x0 + w, y0 + h * 0.3);
      g.strokePath();
      for (const t of [0.28, 0.72]) {
        g.beginPath();
        g.moveTo(x0 + w * t, y0 - size * 0.08);
        g.lineTo(x0 + w * t, y0 + size * 0.06);
        g.strokePath();
      }
      break;
    }
    case "gear": {
      // Ring + eight radial teeth — the standard settings pictogram.
      g.strokeCircle(cx, cy, r * 0.42);
      const teeth = 8;
      for (let i = 0; i < teeth; i++) {
        const a = (i / teeth) * Math.PI * 2;
        g.beginPath();
        g.moveTo(cx + Math.cos(a) * r * 0.52, cy + Math.sin(a) * r * 0.52);
        g.lineTo(cx + Math.cos(a) * r * 0.88, cy + Math.sin(a) * r * 0.88);
        g.strokePath();
      }
      break;
    }
    case "hourglass": {
      // §1b's Wait tile (the wireframe's ⏳). Two caps and a pinched waist —
      // the one glyph in this set that reads as "time passes" rather than
      // "a panel opens", which is the whole reason Wait sits in its own
      // cluster instead of among the four panel tiles.
      const w = size * 0.56;
      const h = size * 0.76;
      const x0 = cx - w / 2;
      const y0 = cy - h / 2;
      g.beginPath();
      g.moveTo(x0, y0);
      g.lineTo(x0 + w, y0);
      g.lineTo(x0 + w * 0.08, y0 + h);
      g.lineTo(x0 + w * 0.92, y0 + h);
      g.lineTo(x0, y0);
      g.strokePath();
      g.beginPath();
      g.moveTo(x0 + w * 0.08, y0 + h);
      g.lineTo(x0 + w * 0.92, y0 + h);
      g.strokePath();
      break;
    }
  }
}

export interface NavRowDeps {
  readonly scene: Phaser.Scene;
}

/** The fixed nav actions (wireframe §4's three clusters, plus §1b's fourth) —
 * `openHome` is `null` when the mode has no hub (`hubEnabled` false), dropping
 * the Home icon from the world cluster the same way the old row dropped its
 * button. `wait`/`endDay` are `null` together for a tenant with no day actions
 * at all; when present they are ALWAYS DRAWN and dimmed by
 * `setDayActionsEnabled()` rather than added and removed. */
export interface NavRowActions {
  readonly openSatchel: () => void;
  readonly openNotebook: () => void;
  readonly openHome: (() => void) | null;
  readonly openCalendar: () => void;
  readonly openOptions: () => void;
  readonly wait: (() => void) | null;
  readonly endDay: (() => void) | null;
}

/** Square icon tile, matched to the §14 Utility pill's shape language
 * (control-family fill/border/hover, `controlCornerOfPill` radius) rather
 * than a flat mockup-CSS radius — same reasoning §14 gives for every other
 * HUD control. */
const ICON_SIZE = 44;
const ICON_RADIUS = pillCornerRadius({ x: 0, y: 0, w: ICON_SIZE, h: ICON_SIZE }, ICON_SIZE * VN_METRICS.controlCornerOfPill);
const ITEM_GAP = 10;
const DIVIDER_GAP = 16;
const DIVIDER_WIDTH = 2;
const TOOLTIP_GAP = 8;
/** Keeps a tooltip inside the viewport when the bar sits near an edge. */
const TOOLTIP_MARGIN = 16;
/**
 * The in-tile hotkey letter — the wireframe's `.hk`, bottom-right corner of
 * the tile in `dim`. NOT decoration and NOT a duplicate of the tooltip: §1's
 * own note is why it exists — "Hotkey letters sit in-tile (small, corner) so
 * the tooltip is confirmation, not the only teacher." A bottom-docked
 * icon-only bar has to teach its keys without being hovered first.
 */
const HK_FONT_PX = "13px";
const HK_INSET = 4;

/** §1b's End-day pill — the wireframe's `.exit` shape (a capsule with a 1px
 * border and a mono label), sized to sit level with the 44px tiles beside it
 * without matching their height exactly, exactly as the mockup draws it. */
const PILL_HEIGHT = 38;
const PILL_PAD_X = 16;
const PILL_FONT_PX = "17px";

/** One built control — a tile or a pill. `paint(lit)` is the item's own
 * idle/lit repaint, so hover, Tab focus and `setDayActionsEnabled` all go
 * through one function per item instead of three copies of the fill math. */
interface BuiltItem {
  readonly label: string;
  readonly key: string | null;
  readonly onClick: () => void;
  readonly hit: Phaser.GameObjects.Graphics;
  /** Top-centre of the control — where a tooltip hangs from. */
  readonly anchorX: number;
  readonly top: number;
  readonly paint: (lit: boolean) => void;
  /** Only the two §1b day actions carry one; `undefined` elsewhere. */
  readonly dayAction?: "wait" | "endday";
  enabled: boolean;
}

export class NavRow {
  private items: BuiltItem[] = [];
  private focusIndex = -1;
  private tooltipBg!: Phaser.GameObjects.Graphics;
  private tooltipText!: Phaser.GameObjects.Text;
  private viewWidth = 1920;

  constructor(private readonly deps: NavRowDeps) {}

  /** The clusters this action set produces, in draw order. One source for
   * both `measure()` and `build()`, so the width the bar plate is sized from
   * can never disagree with what actually gets drawn. */
  private clusters(actions: NavRowActions): (NavIconSpec | NavPillSpec)[][] {
    const gear: NavIconSpec[] = [
      { icon: "satchel", label: "Satchel", key: "S", onClick: actions.openSatchel },
      { icon: "notebook", label: "Notebook", key: "N", onClick: actions.openNotebook },
    ];
    const world: NavIconSpec[] = [];
    if (actions.openHome) {
      world.push({ icon: "home", label: "Decorate Home", key: "H", onClick: actions.openHome });
    }
    world.push({ icon: "calendar", label: "Calendar", key: "L", onClick: actions.openCalendar });
    // key: null on Options — no "· O" suffix, matches the mockup's own tooltip text.
    const system: NavIconSpec[] = [{ icon: "gear", label: "Options", key: null, onClick: actions.openOptions }];
    const day: (NavIconSpec | NavPillSpec)[] = [];
    if (actions.wait) {
      day.push({ icon: "hourglass", label: "Wait", key: "W", onClick: actions.wait });
    }
    if (actions.endDay) {
      day.push({ text: "End day · E", label: "End the day", key: "E", onClick: actions.endDay });
    }
    return [gear, world, system, day].filter((c) => c.length > 0);
  }

  private isPill(spec: NavIconSpec | NavPillSpec): spec is NavPillSpec {
    return "text" in spec;
  }

  private itemWidth(spec: NavIconSpec | NavPillSpec): number {
    if (!this.isPill(spec)) return ICON_SIZE;
    const t = this.deps.scene.add
      .text(0, 0, spec.text, { fontFamily: FONT.mono, fontSize: PILL_FONT_PX })
      .setVisible(false);
    const w = t.width + PILL_PAD_X * 2;
    t.destroy();
    return w;
  }

  /**
   * How wide the row will draw, measured before anything is placed — what
   * `HudBar` centres its plate on. Measures the End-day pill's real rendered
   * text, so a copy change can never leave the plate the wrong size.
   */
  measure(actions: NavRowActions): { width: number; height: number } {
    const clusters = this.clusters(actions);
    let total = 0;
    clusters.forEach((cluster, i) => {
      total += cluster.reduce((sum, s) => sum + this.itemWidth(s), 0) + (cluster.length - 1) * ITEM_GAP;
      if (i < clusters.length - 1) total += DIVIDER_GAP * 2 + DIVIDER_WIDTH;
    });
    return { width: total, height: ICON_SIZE };
  }

  /**
   * Draw the clusters left-to-right from `opts.leftX`, top edge `opts.y`.
   * Built once per scene life, same as the row it replaces
   * (`CollectScene.create()` calls this once, not per-render) —
   * `bindFocusKeys()` runs from here, not the constructor, so it fires
   * alongside every other `scene.input.keyboard` binding in `create()`
   * rather than in `init()`, before input is wired up for the life.
   */
  build(actions: NavRowActions, opts: { leftX: number; y: number; viewWidth: number }): void {
    const { scene } = this.deps;
    this.viewWidth = opts.viewWidth;
    this.bindFocusKeys();
    const clusters = this.clusters(actions);

    // Tooltip pill — one shared instance, repositioned/relabeled per
    // hovered/focused control rather than one per control (only ever one shown
    // at a time). Built before the items so their depth sits under it.
    this.tooltipBg = scene.add.graphics().setDepth(150).setVisible(false);
    this.tooltipText = scene.add
      .text(0, 0, "", { fontFamily: FONT.mono, fontSize: "15px", color: COLOR.ember })
      .setDepth(151)
      .setVisible(false);

    let x = opts.leftX;
    const y = opts.y;
    this.items = [];
    clusters.forEach((cluster, ci) => {
      cluster.forEach((spec, ii) => {
        const w = this.itemWidth(spec);
        this.items.push(
          this.isPill(spec) ? this.buildPill(x, y, w, spec) : this.buildIcon(x, y, spec),
        );
        x += w;
        if (ii < cluster.length - 1) x += ITEM_GAP;
      });
      if (ci < clusters.length - 1) {
        x += DIVIDER_GAP;
        this.drawDivider(x, y);
        x += DIVIDER_WIDTH + DIVIDER_GAP;
      }
    });
  }

  /**
   * Dim the §1b day actions ink is not currently offering, in place.
   *
   * `emitScreen` guards `[Wait]` on `movesLeft > 0 && TimeOfDay != night`, and
   * `[End the day]` disappears once the day-end flow is already running — so
   * either can vanish from `v.choices` mid-day. Option A ruled these ALWAYS
   * VISIBLE, so they dim rather than disappear: a bar whose width changes when
   * the clock rolls is a moving target for the hand it is supposed to serve.
   * A disabled control ignores clicks and keyboard activation both.
   */
  setDayActionsEnabled(wait: boolean, endDay: boolean): void {
    for (const item of this.items) {
      if (!item.dayAction) continue;
      const next = item.dayAction === "wait" ? wait : endDay;
      if (item.enabled === next) continue;
      item.enabled = next;
      item.paint(this.items[this.focusIndex] === item);
    }
  }

  /** One icon tile — Utility-pill fill/border math (§14 §4), square
   * instead of a text-width pill, glyph centered in place of a mono label. */
  private buildIcon(x: number, y: number, spec: NavIconSpec): BuiltItem {
    const { scene } = this.deps;

    const bg = scene.add.graphics().setDepth(99).setPosition(x, y);
    const glyph = scene.add.graphics().setDepth(100);
    // The `.hk` corner letter (wireframe §1). Options carries none — its
    // tooltip has no key suffix either, which is the mockup's own call.
    const hk = spec.key
      ? scene.add
          .text(x + ICON_SIZE - HK_INSET, y + ICON_SIZE - HK_INSET, spec.key, {
            fontFamily: FONT.mono,
            fontSize: HK_FONT_PX,
            color: COLOR.dim,
          })
          .setOrigin(1, 1)
          .setDepth(100)
      : null;
    const built: BuiltItem = {
      label: spec.label,
      key: spec.key,
      onClick: spec.onClick,
      hit: bg,
      anchorX: x + ICON_SIZE / 2,
      top: y,
      enabled: true,
      dayAction: spec.icon === "hourglass" ? "wait" : undefined,
      paint: (lit: boolean) => {
        const on = lit && built.enabled;
        const tint = !built.enabled ? COLOR.goldNum : on ? COLOR.emberNum : COLOR.goldNum;
        const alpha = built.enabled ? (on ? 0.9 : 0.35) : 0.16;
        bg.clear();
        bg.fillStyle(on ? COLOR.panelHover : COLOR.night, 0.9);
        bg.lineStyle(2, tint, alpha);
        bg.fillRoundedRect(0, 0, ICON_SIZE, ICON_SIZE, ICON_RADIUS);
        bg.strokeRoundedRect(0, 0, ICON_SIZE, ICON_SIZE, ICON_RADIUS);
        glyph.clear();
        glyph.setAlpha(built.enabled ? 1 : 0.3);
        drawNavGlyph(glyph, spec.icon, x + ICON_SIZE / 2, y + ICON_SIZE / 2, ICON_SIZE * 0.5, tint);
        hk?.setColor(on ? COLOR.ember : COLOR.dim).setAlpha(built.enabled ? 1 : 0.3);
      },
    };
    built.paint(false);
    bg.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, ICON_SIZE, ICON_SIZE),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    this.wireItem(built);
    return built;
  }

  /** §1b's End-day control — the wireframe's `.exit` capsule, ember-accented
   * because it is the one control on the bar that ends the day. */
  private buildPill(x: number, y: number, w: number, spec: NavPillSpec): BuiltItem {
    const { scene } = this.deps;
    const top = y + (ICON_SIZE - PILL_HEIGHT) / 2;

    const bg = scene.add.graphics().setDepth(99).setPosition(x, top);
    const text = scene.add
      .text(x + w / 2, top + PILL_HEIGHT / 2, spec.text, {
        fontFamily: FONT.mono,
        fontSize: PILL_FONT_PX,
        color: COLOR.ember,
      })
      .setOrigin(0.5)
      .setDepth(100);

    const built: BuiltItem = {
      label: spec.label,
      key: spec.key,
      onClick: spec.onClick,
      hit: bg,
      anchorX: x + w / 2,
      top,
      enabled: true,
      dayAction: "endday",
      paint: (lit: boolean) => {
        const on = lit && built.enabled;
        bg.clear();
        bg.fillStyle(on ? COLOR.panelHover : COLOR.night, 0.9);
        bg.lineStyle(2, COLOR.emberNum, built.enabled ? (on ? 0.95 : 0.6) : 0.22);
        bg.fillRoundedRect(0, 0, w, PILL_HEIGHT, PILL_HEIGHT / 2);
        bg.strokeRoundedRect(0, 0, w, PILL_HEIGHT, PILL_HEIGHT / 2);
        text.setColor(COLOR.ember).setAlpha(built.enabled ? 1 : 0.35);
      },
    };
    built.paint(false);
    bg.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, w, PILL_HEIGHT),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    this.wireItem(built);
    return built;
  }

  /** Hover/click, identical for a tile and a pill. */
  private wireItem(built: BuiltItem): void {
    built.hit.on("pointerover", () => {
      built.paint(true);
      this.showTooltip(built);
    });
    built.hit.on("pointerout", () => {
      // A keyboard-focused control keeps its lit state and tooltip after the
      // pointer leaves — only an UNFOCUSED one unlights on pointerout.
      if (this.items[this.focusIndex] !== built) {
        built.paint(false);
        this.hideTooltip();
      }
    });
    built.hit.on("pointerdown", () => {
      if (built.enabled) built.onClick();
    });
  }

  private drawDivider(x: number, y: number): void {
    const { scene } = this.deps;
    scene.add
      .rectangle(x, y + ICON_SIZE / 2, DIVIDER_WIDTH, ICON_SIZE, COLOR.goldNum, 0.2)
      .setOrigin(0.5)
      .setDepth(99);
  }

  /**
   * The tooltip, ABOVE the control (T14 §1 — "Tooltips flip to open above the
   * tile (there is no room below anymore)"). Clamped to the viewport so the
   * leftmost and rightmost controls on a wide bar still read fully.
   */
  private showTooltip(item: BuiltItem): void {
    const label = item.key ? `${item.label} · ${item.key}` : item.label;
    this.tooltipText.setText(label).setVisible(true);
    const padX = 10;
    const padY = 6;
    const w = this.tooltipText.width + padX * 2;
    const h = this.tooltipText.height + padY * 2;
    const tx = Math.min(
      Math.max(TOOLTIP_MARGIN, item.anchorX - w / 2),
      this.viewWidth - TOOLTIP_MARGIN - w,
    );
    const ty = item.top - TOOLTIP_GAP - h;
    this.tooltipBg.clear();
    this.tooltipBg.fillStyle(COLOR.night, 0.96);
    this.tooltipBg.lineStyle(1, COLOR.goldNum, 0.4);
    this.tooltipBg.fillRoundedRect(tx, ty, w, h, 5);
    this.tooltipBg.strokeRoundedRect(tx, ty, w, h, 5);
    this.tooltipBg.setVisible(true);
    this.tooltipText.setPosition(tx + padX, ty + padY);
  }

  private hideTooltip(): void {
    this.tooltipBg.setVisible(false);
    this.tooltipText.setVisible(false);
  }

  /**
   * `Tab`/`Shift+Tab` cycle a local focus index across every built control,
   * in cluster order — the keyboard-reachable equivalent to hover
   * (accessibility requirement, this row's spec). `Enter`/`Space` fires the
   * focused control's `onClick`; `Escape` clears focus.
   */
  private bindFocusKeys(): void {
    const { scene } = this.deps;
    const move = (delta: number) => {
      if (this.items.length === 0) return;
      const prev = this.items[this.focusIndex];
      if (prev) prev.paint(false);
      this.focusIndex = (this.focusIndex + delta + this.items.length) % this.items.length;
      const next = this.items[this.focusIndex];
      next.paint(true);
      this.showTooltip(next);
    };
    scene.input.keyboard?.on("keydown-TAB", (e: KeyboardEvent) => {
      if (this.items.length === 0) return;
      e.preventDefault();
      move(e.shiftKey ? -1 : 1);
    });
    scene.input.keyboard?.on("keydown-ENTER", () => this.activateFocused());
    scene.input.keyboard?.on("keydown-SPACE", () => this.activateFocused());
    scene.input.keyboard?.on("keydown-ESC", () => this.clearFocus());
  }

  private activateFocused(): void {
    const item = this.items[this.focusIndex];
    if (item?.enabled) item.onClick();
  }

  private clearFocus(): void {
    const item = this.items[this.focusIndex];
    if (!item) return;
    item.paint(false);
    this.focusIndex = -1;
    this.hideTooltip();
  }
}

/** Full vertical footprint of the row — what `HudBar` sizes its plate from.
 * Equal to the tile since T14 cut the persistent Decorate caption (§4), but
 * kept as its own name rather than folded into a raw 44: the cast and dialogue
 * tenants mount in the same plate and need not be tile-height.
 *
 * `NAV_ICON_SIZE` used to sit beside this, exported so `CollectScene` could
 * stack its dev pill row under the old top-right nav row. That row moved to the
 * bottom bar and the dev pills took the corner outright (§4), so nothing
 * stacked under anything and the export had no readers left. */
export const NAV_ROW_HEIGHT = ICON_SIZE;
