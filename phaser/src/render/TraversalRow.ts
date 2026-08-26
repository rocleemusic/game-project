/**
 * Responsibility 10 out of `CollectScene`, extracted verbatim
 * (`plans/2026-08-17-mode5-srp-merge-plan.md`, step 7): the choice-row half of
 * `render()`.
 *
 * Dialogue/action choices as a row directly above the bottom bar (Roc,
 * 2026-08-13). Draws nothing while a VN conversation is up — the box takes
 * over the exact same spoken/deed choices, and drawing both would offer the
 * same pick twice through two different UIs. Any "Talk to X" choice
 * `NpcTalkSystem` already wired to a portrait click is skipped here too, for
 * the same reason (`draw()`'s `talkChoiceIndexes` argument).
 *
 * ---------------------------------------------------------------------------
 * WHAT THIS NO LONGER DRAWS — T14, 2026-08-24.
 * ---------------------------------------------------------------------------
 *
 * The HUD relayout (`plans/2026-08-23-hud-relayout-ruling.md`, wireframe
 * `tools/screen-flow/mockups/hud-relayout-wireframe.html`) retired the three
 * SCREEN-HUB VERBS from this row — the ones `emitScreen`/`emitMain` generate
 * on every explorable screen, now flagged as `PlayChoice.hubAction`:
 *
 *   - `exit`   ("Go to X" / "Begin at X") → a dashed clickable region drawn on
 *     the painting itself (§1). `render/MoveRegions.ts` owns it, and the whole
 *     gate apparatus — `moveTarget`, `blockingGatesFor`, `hintFor`, the locked
 *     label, the "?" pin, the refused-gate crash fix — went with it, WHOLE, so
 *     the two surfaces cannot drift.
 *   - `wait`   → a 44px bar tile (§1b).
 *   - `endday` → the bar's ember "End day · E" pill, behind a confirm (§1b).
 *     Both live in `render/HudBar.ts`.
 *
 * The filter is `hubAction`, not `kind`: `kind === "move"` deliberately still
 * covers day-end as well as the exits (it means "hub choice, not conversation",
 * and `CollectScene`'s VN scope seam depends on that) — see
 * `PlayChoice.hubAction`'s own note in `tools/lantern/src/lib/play.ts`.
 *
 * What is left is everything a screen offers that is NOT one of those three:
 * "[Look at X]", scene entries, "[Begin the festival vignette]", the Home Hub's
 * own choices, and `continue`. Those have no geography and no gate, so this
 * file no longer knows what a gate is.
 */

import Phaser from "phaser";
import type { PlayView } from "@lantern/lib/play";
import type { InkBridge } from "../ink/InkBridge";
import { COLOR, FONT } from "../ui/theme";
import { pillCornerRadius } from "../world/view/DialogueLayout";

// §14 Choice-pill constants, matched to `DialogueSystem.drawChoices`. Those are
// module-private in DialogueSystem (not exported), so the exact values are
// replicated here rather than invented — a choice pill must read identically
// to a dialogue-choice pill.
const PILL_FILL_ALPHA = 0.94; // DialogueSystem PILL_FILL_ALPHA
const BORDER_ALPHA = 0.55; // DialogueSystem BORDER_ALPHA (enabled)
const CHOICE_CORNER_OF_PILL = 0.18; // VN_METRICS.choiceCornerOfPill — radius / pill height
const PILL_PAD_X = 16;
const PILL_PAD_Y = 9;
const PILL_WRAP_WIDTH = 520;
const PILL_FONT_PX = "22px";

export interface TraversalRowDeps {
  readonly scene: Phaser.Scene;
  readonly ink: InkBridge;
  readonly viewWidth: number;
  readonly bottomBarTop: number;
  readonly choicesRowTop: number;
}

export class TraversalRow {
  private choiceTexts: Phaser.GameObjects.GameObject[] = [];

  constructor(private readonly deps: TraversalRowDeps) {}

  draw(v: PlayView, inConversation: boolean, talkChoiceIndexes: ReadonlySet<number>): void {
    const {
      ink,
      viewWidth: W,
      bottomBarTop: BOTTOM_BAR_TOP,
      choicesRowTop: CHOICES_ROW_TOP,
    } = this.deps;

    this.choiceTexts.forEach((t) => t.destroy());
    this.choiceTexts = [];

    let x = 60;
    let y = BOTTOM_BAR_TOP - 60;
    const rowRight = W - 60;
    if (!inConversation) {
      for (const c of v.choices) {
        if (talkChoiceIndexes.has(c.index)) continue;
        // The three screen-hub verbs left this row in T14 — see the header.
        if (c.hubAction) continue;
        // Strip the literal ink `[ ]` (play.ts sets a deed's `display` to
        // `[${text}]`). Dialogue conversation pills never carry brackets — a
        // spoken choice's `display` is quoted, not bracketed — so the pill label
        // must match by dropping the brackets here too.
        const label = c.display.replace(/^\[|\]$/g, "");
        const size = this.measurePill(label);
        if (x + size.w > rowRight && x > 60) {
          x = 60;
          y = Math.max(CHOICES_ROW_TOP + 20, y - (size.h + 12));
        }
        this.buildPill(x, y, size, label, () => {
          ink.choose(c.index);
          ink.runToChoice();
        });
        x += size.w + 24;
      }
    }

    if (!inConversation && v.canContinue && v.choices.length === 0) {
      const size = this.measurePill("continue");
      this.buildPill(x, y, size, "continue", () => ink.advance());
    }
  }

  /**
   * The natural pill size for a label: the wrapped text bounds plus padding.
   * Measured with a throwaway text so wrap and font match the rendered pill.
   */
  private measurePill(label: string): { w: number; h: number } {
    const t = this.deps.scene.add
      .text(0, 0, label, {
        fontFamily: FONT.display,
        fontSize: PILL_FONT_PX,
        wordWrap: { width: PILL_WRAP_WIDTH },
      })
      .setVisible(false);
    const w = t.width + PILL_PAD_X * 2;
    const h = t.height + PILL_PAD_Y * 2;
    t.destroy();
    return { w, h };
  }

  /**
   * One §14 Choice pill, drawn straight to the scene (TraversalRow has no
   * DialogueRenderPort). A `Graphics` rounded rect — `fillRoundedRect` +
   * `strokeRoundedRect`, never `Graphics.setMask` — carries the fill/border and
   * the hit area; the label sits on top. Colors, alphas and the corner-radius
   * math mirror `DialogueSystem.drawChoices`: `COLOR.panel`/`panelHover` fill at
   * `PILL_FILL_ALPHA`, `COLOR.border`/`emberNum` border at `BORDER_ALPHA`,
   * `COLOR.ink` label. Hover lights fill, border and text like a dialogue
   * pill's lit state.
   */
  private buildPill(
    x: number,
    y: number,
    size: { w: number; h: number },
    label: string,
    onDown: () => void,
  ): void {
    const { scene } = this.deps;
    const { w, h } = size;
    const radius = pillCornerRadius({ x: 0, y: 0, w, h }, h * CHOICE_CORNER_OF_PILL);

    const g = scene.add.graphics().setDepth(99).setPosition(x, y);
    const paint = (hover: boolean): void => {
      g.clear();
      g.fillStyle(hover ? COLOR.panelHover : COLOR.panel, PILL_FILL_ALPHA);
      g.fillRoundedRect(0, 0, w, h, radius);
      g.lineStyle(2, hover ? COLOR.emberNum : COLOR.border, BORDER_ALPHA);
      g.strokeRoundedRect(0, 0, w, h, radius);
    };
    paint(false);
    g.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, w, h),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    const t = scene.add
      .text(x + w / 2, y + h / 2, label, {
        fontFamily: FONT.display,
        fontSize: PILL_FONT_PX,
        color: COLOR.ink,
        align: "center",
        wordWrap: { width: w - PILL_PAD_X * 2 },
      })
      .setOrigin(0.5)
      .setDepth(100);

    // Graphics under text: added first so the pill renders behind its label.
    this.choiceTexts.push(g, t);

    g.on("pointerover", () => {
      paint(true);
      t.setColor(COLOR.ember);
    });
    g.on("pointerout", () => {
      paint(false);
      t.setColor(COLOR.ink);
    });
    g.on("pointerdown", onDown);
  }
}
