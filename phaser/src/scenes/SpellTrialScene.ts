/**
 * Cast a spell from the notebook, standalone — no receiver, no world target.
 *
 * Two modes, matching the two states `Knowledge` already tracks:
 *   - CLUE (not yet learned): guess components, test them against the spell's
 *     real, authored `components` list. A match learns the spell.
 *   - KNOWN (already learned): the recipe is known, so there is nothing to
 *     guess — cast whenever you hold everything it needs.
 *
 * "Standalone" (no receiver) was Roc's call, to keep this buildable overnight.
 *
 * CHROME (2026-08-23). This scene used to paint itself straight onto the
 * canvas: full-bleed 0.92-alpha scrim, text pinned at x=140, and three
 * hand-wired `[ bracket ]` text buttons. It now wears the same leather board
 * every other dialog in the mode wears — `ModalFrame.modalFrame()`'s 900-wide
 * panel with gold filigree corners — and the shipped §14 utility pills for its
 * actions. It is a launched Scene, not an inline system inside a host scene, so
 * it constructs its OWN `ModalFrame` in `create()`, the way `CollectScene` does.
 * Only the chrome moved; CLUE/KNOWN logic, the two-pool selection, and the ESC/
 * `onClose()` contract are untouched.
 */

import Phaser from "phaser";
import type { SpellRecord } from "../magic/types";
import type { ItemRecord } from "../magic/types";
import type { Knowledge } from "../world/Knowledge";
import type { Inventory } from "../world/Inventory";
import { ModalFrame } from "../render/ModalFrame";
import { COLOR, FONT, sceneFadeIn } from "../ui/theme";

const W = 1920;
const H = 1080;
const GOLD = COLOR.gold;
const INK = COLOR.ink;
const DIM = COLOR.muted;
const GREEN = COLOR.success;

/**
 * The board's geometry. `ModalFrame.modalFrame()` draws a fixed 900-wide panel,
 * so only the height is ours to pick — and it is not free: `closeButton()` has a
 * hard-coded `(W/2+300, H/2-200)` anchor, so the height decides where the close
 * pill lands relative to the board. 520 puts it level with `modalFrame()`'s own
 * heading, reading as a title bar (heading left, close right), and leaves a
 * board this scene's content actually fills — 660, `HedgeCastPrompt`'s height,
 * left a third of the panel empty on a real satchel.
 */
const PANEL_H = 520;
const PANEL_TOP = H / 2 - PANEL_H / 2;
/** Left text margin — the same inset `modalFrame()` puts its own heading at, so
 * body copy lines up under the title instead of floating. */
const CONTENT_X = W / 2 - 420;
/** Wrap/flow width, stopping 40px short of the board's right edge. */
const CONTENT_W = 800;
/** Clear of the close pill's column, in case the sub-line ever wraps down into
 * its band. */
const SUB_W = 660;
const SUB_Y = PANEL_TOP + 120;
const BODY_Y = PANEL_TOP + 168;
/** The action pill flows under the body, but never past here — below this the
 * result copy needs the room more than the button does. */
const ACTION_MAX_Y = PANEL_TOP + 330;
/** Result copy follows the action pill, but never starts lower than this, so
 * the longest line this scene can print (the just-learned two-paragraph one)
 * still lands inside the board. */
const RESULT_MAX_Y = PANEL_TOP + 380;
const RESULT_GAP = 64;

/** Chip metrics, sized for the 900 board rather than the old full-bleed canvas
 * (the chips themselves stay styled `Text`, §14's chip pattern — they are a
 * selectable component picker, not the utility-pill button family). */
const CHIP_FONT = 18;
const CHIP_PAD = { x: 12, y: 7 };
const CHIP_GAP = 10;
const CHIP_ROW_H = 40;

/** Tone-consistent placeholder lines. Not authored content — probe-local. */
const FAIL_LINES = [
  "Nothing happens. The words feel wrong in your mouth.",
  "The phrase catches on nothing at all.",
  "You feel foolish, holding what you're holding, saying what you just said.",
  "A long pause. Whatever you meant to happen does not.",
  "The components sit there, inert, unimpressed.",
];

export interface SpellTrialData {
  spell: SpellRecord;
  knowledge: Knowledge;
  inventory: Inventory;
  items: ItemRecord[];
  /** Already learned — skip the guessing UI, cast directly when able. */
  known?: boolean;
  /** The second trial-cast pool (revision 4, mode5-ux-flow-wireframe.html §6) —
   * item ids banked at Home (`PlayView.banked`), live in the SAME attempt as
   * the satchel, not behind a toggle. Absent only from callers outside
   * Collection & Discovery mode; treated as empty, not an error. */
  banked?: string[];
  onClose: () => void;
}

export class SpellTrialScene extends Phaser.Scene {
  private spell!: SpellRecord;
  private knowledge!: Knowledge;
  private inventory!: Inventory;
  private items!: ItemRecord[];
  private known = false;
  private banked: string[] = [];
  private onClose!: () => void;
  private selected = new Set<string>();
  private layer!: Phaser.GameObjects.Container;
  private modal!: ModalFrame;
  /** The title the board is currently drawn with, or `null` before the first
   * draw. The board is expensive-looking chrome with a pop-in on it, so it is
   * NOT rebuilt on every chip click — only when the title would change, which
   * happens exactly once, when a successful trial flips CLUE to KNOWN. */
  private frameTitle: string | null = null;
  private resultText!: Phaser.GameObjects.Text;
  private justLearned = false;

  constructor() {
    super("SpellTrialScene");
  }

  init(data: SpellTrialData) {
    this.spell = data.spell;
    this.knowledge = data.knowledge;
    this.inventory = data.inventory;
    this.items = data.items;
    this.known = Boolean(data.known);
    this.banked = data.banked ?? [];
    this.onClose = data.onClose;
    this.selected = new Set();
    this.justLearned = false;
    this.frameTitle = null;
  }

  create() {
    sceneFadeIn(this);
    // Fully opaque, not a partial alpha. This scene is launched over a PAUSED
    // `NotebookScene`, which keeps rendering its own book, tabs and chrome
    // underneath; at the old 0.92 the notebook read straight through the
    // trial. `HubShelfScene` already carries the shipped fix for total parent
    // occlusion — alpha 1 — and this matches it exactly rather than tuning a
    // third alpha value. The leather board below sits on top of this.
    this.add.rectangle(W / 2, H / 2, W, H, COLOR.night, 1).setDepth(0);
    // Above `modalFrame()`'s panel (200), filigree (201) and close pill (202).
    // Everything the two modes draw — including the §14 action pills, which are
    // re-parented in here — lives in this one container, so a redraw is a
    // single `removeAll(true)` and the board underneath is never disturbed.
    this.layer = this.add.container(0, 0).setDepth(205);
    this.modal = new ModalFrame({ scene: this, viewWidth: W, viewHeight: H, inventory: this.inventory });
    this.input.keyboard?.on("keydown-ESC", () => this.close());
    this.redraw();
  }

  private close() {
    this.input.keyboard?.removeAllListeners();
    this.scene.stop();
    this.onClose();
  }

  private label(itemId: string): string {
    const rec = this.items.find((i) => i.item_id === itemId);
    return rec ? rec.description : itemId;
  }

  /** Castable-reach materials in the satchel — the pool this scene has always
   * offered. */
  private held(): string[] {
    return this.inventory.availableOn(null);
  }

  /** Castable-reach materials banked at Home — the second pool (revision 4).
   * Filtered the same way `availableOn()` filters the satchel (only items
   * some spell actually lists as a component), so the tray doesn't bury real
   * components under mementos/gifts/tools that happen to be banked too. */
  private bankedHeld(): string[] {
    const usable = (id: string) => (this.inventory.record(id)?.used_by.length ?? 0) > 0;
    return [...new Set(this.banked.filter(usable))].sort();
  }

  /** Draw the leather board + close pill, but only if the title changed —
   * see `frameTitle`. Wording follows the wireframe's own header plaque
   * (§6 step 4: `Notebook · trial cast · "portion"`). */
  private ensureFrame() {
    const title = this.known
      ? `cast · "${this.spell.phrase}"`
      : `trial cast · "${this.spell.phrase}"`;
    if (this.frameTitle === title) return;
    this.frameTitle = title;
    this.modal.clearModal();
    this.modal.modalFrame(title, PANEL_H);
    this.modal.closeButton(() => this.close());
  }

  private redraw() {
    this.ensureFrame();
    this.layer.removeAll(true);

    this.text(
      CONTENT_X,
      SUB_Y,
      this.known
        ? "known — cast it whenever you hold what it needs"
        : "seen but not confirmed — try a few components and see what happens",
      DIM,
      18,
    ).setWordWrapWidth(SUB_W);

    if (this.known) this.redrawKnown();
    else this.redrawClue();
  }

  /** Recipe is already known — show it with what you have, cast on demand. */
  private redrawKnown() {
    const heldSet = new Set(this.held());
    this.text(CONTENT_X, BODY_Y, "RECIPE", GOLD, 13, FONT.mono);
    let cy = BODY_Y + 30;
    for (const id of this.spell.components) {
      const have = heldSet.has(id);
      this.text(CONTENT_X, cy, `${have ? "✓" : "✗"} ${this.label(id)}`, have ? GREEN : DIM, 20, FONT.mono);
      cy += 30;
    }

    const canCast = this.spell.components.every((c) => heldSet.has(c));
    const actionY = Math.min(cy + 14, ACTION_MAX_Y);
    if (canCast) {
      this.modal.button(CONTENT_X, actionY, "cast", () => this.castKnown(), { container: this.layer });
    } else {
      // No disabled state exists in the §14 pill family, and a live-looking
      // pill that refuses to fire is worse than none — so the blocked case
      // reads as a flat, dim, non-interactive slug in `COLOR.dim` (§14's own
      // "disabled label" token) on `night`, recessed into the board instead of
      // raised off it. The ✗ rows above already say what is missing.
      const blocked = this.text(CONTENT_X, actionY, "cast — missing components", COLOR.dim, 18, FONT.mono);
      blocked.setPadding(20, 11, 20, 11);
      blocked.setBackgroundColor(COLOR.nightHex);
    }

    this.resultText = this.text(CONTENT_X, this.resultY(actionY), "", GREEN, 20, FONT.display);
    this.resultText.setWordWrapWidth(CONTENT_W);
  }

  private castKnown() {
    const consumable = this.spell.components.filter(
      (id) => this.inventory.record(id)?.consumable !== false,
    );
    this.inventory.applyCast(null, consumable, []);
    const demo =
      this.spell.receivers.find((r) => r.receiver_class === "inert") ?? this.spell.receivers[0];
    const text = demo?.physical_outcome ?? "It works.";
    this.redraw();
    this.resultText.setColor(GREEN);
    this.resultText.setText(text);
  }

  /** Not yet learned — guess components, test the guess. Two pools, both live
   * at once (revision 4): satchel and banked-at-home feed the same selection
   * set, so a trial can mix a satchel item and a banked one in one attempt. */
  private redrawClue() {
    const held = this.held();
    const banked = this.bankedHeld();
    let yy = this.drawChipGroup("SATCHEL", held, CONTENT_X, BODY_Y);
    yy = this.drawChipGroup("BANKED AT HOME", banked, CONTENT_X, yy + 8);

    const actionY = Math.min(yy + 8, ACTION_MAX_Y);
    if (!this.justLearned) {
      this.modal.button(CONTENT_X, actionY, "try it", () => this.trial(), { container: this.layer });
    }

    this.resultText = this.text(CONTENT_X, this.resultY(actionY), "", INK, 20, FONT.display);
    this.resultText.setWordWrapWidth(CONTENT_W);
  }

  /** Where the result line starts: under the action pill, unless the body ran
   * long, in which case it is pinned so its own copy still fits the board. */
  private resultY(actionY: number): number {
    return Math.min(actionY + RESULT_GAP, RESULT_MAX_Y);
  }

  /** One labeled, wrapping chip row for a component pool. Selection lands in
   * the shared `this.selected` set no matter which pool the chip came from —
   * that's what makes the two pools live at once instead of a toggle. Returns
   * the y just below the row so the caller can stack the next element. */
  private drawChipGroup(label: string, ids: string[], x: number, y: number): number {
    this.text(x, y, label, GOLD, 13, FONT.mono);
    y += 26;
    if (!ids.length) {
      this.text(x, y, "— nothing usable here —", DIM, 16);
      return y + CHIP_ROW_H;
    }
    const maxX = x + CONTENT_W;
    let cx = x;
    let cy = y;
    for (const id of ids) {
      const on = this.selected.has(id);
      const chip = this.text(cx, cy, this.label(id), on ? COLOR.onAccent : GOLD, CHIP_FONT, FONT.mono);
      chip.setPadding(CHIP_PAD.x, CHIP_PAD.y, CHIP_PAD.x, CHIP_PAD.y);
      // Idle fill is `night`, not `panel`: an unselected chip used to sit on
      // the night canvas, where `panel` read as a raised chip. On the leather
      // board it IS the board colour and the chip vanished — so it recesses
      // into the panel instead, and hover lifts it back out to `panelHover`.
      chip.setBackgroundColor(on ? GOLD : COLOR.nightHex);
      // Wrap BEFORE placing, not after. The old check ran post-placement
      // against a full-bleed bound, which lets the chip that trips it hang
      // past the edge — unnoticeable across 1920px, an overflow off a 900px
      // board. Same flowing-row behaviour, just measured against the panel.
      if (cx > x && cx + chip.width > maxX) {
        cx = x;
        cy += CHIP_ROW_H;
        chip.setPosition(cx, cy);
      }
      chip.setInteractive({ useHandCursor: true });
      chip.on("pointerover", () => {
        if (!this.selected.has(id)) chip.setBackgroundColor(COLOR.panelHoverHex);
      });
      chip.on("pointerout", () => {
        if (!this.selected.has(id)) chip.setBackgroundColor(COLOR.nightHex);
      });
      chip.on("pointerdown", () => {
        if (on) this.selected.delete(id);
        else this.selected.add(id);
        this.redraw();
      });
      cx += chip.width + CHIP_GAP;
    }
    return cy + CHIP_ROW_H;
  }

  private trial() {
    const required = new Set(this.spell.components);
    const offered = this.selected;
    const matches = required.size === offered.size && [...required].every((c) => offered.has(c));

    if (!matches) {
      const line = FAIL_LINES[Math.floor(Math.random() * FAIL_LINES.length)];
      this.resultText.setColor(COLOR.danger);
      this.resultText.setText(line);
      return;
    }

    this.knowledge.learn(this.spell.spell_id);
    this.justLearned = true;
    this.known = true;
    const demo =
      this.spell.receivers.find((r) => r.receiver_class === "inert") ?? this.spell.receivers[0];
    const text = `It works. ${demo?.physical_outcome ?? "Something happens."}\n\n"${this.spell.phrase}" is now in your spellbook, with its recipe known.`;
    this.redraw();
    this.resultText.setColor(GREEN);
    this.resultText.setText(text);
  }

  private text(
    x: number,
    y: number,
    value: string,
    color: string,
    size: number,
    font = "monospace",
  ): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, value, { fontFamily: font, fontSize: `${size}px`, color });
    this.layer.add(t);
    return t;
  }
}
