/**
 * Responsibility 5 out of `CollectScene`, extracted verbatim
 * (`plans/2026-08-17-mode5-srp-merge-plan.md`, step 6): `modalFrame`,
 * `clearModal`, `closeButton`, `button`, `componentHint`.
 *
 * Satisfies `NpcTalkSystem`'s `ModalHost` interface (`render/NpcTalkSystem.ts`)
 * DIRECTLY — structurally, with no adapter — so `CollectScene` hands this
 * instance straight to `NpcTalkSystem` as `modal:` instead of passing itself.
 *
 * WHAT THIS DOES NOT OWN. `pickerLayer` — the hedge/gated cast prompt's own
 * spell-picker rows (responsibility 6, extracted a later step) — stays on
 * `CollectScene`. Its rows are ALSO pushed into this class's layer (via
 * `pushModal`), so `clearModal()` destroying every object in `layer` already
 * destroys them; `hedgeSpellPicker` resets its own `pickerLayer` array on
 * every call before rebuilding, so a stale reference to an already-destroyed
 * object between clears is harmless — Phaser no-ops a second `.destroy()`.
 */

import Phaser from "phaser";
import type { SpellRecord } from "../magic/types";
import type { Inventory } from "../world/Inventory";
import { COLOR, FONT, popIn, filigreeCorners } from "../ui/theme";
import { utilityPill, utilityPillWidth } from "../ui/buttons";

export interface ModalFrameDeps {
  readonly scene: Phaser.Scene;
  readonly viewWidth: number;
  readonly viewHeight: number;
  readonly inventory: Inventory;
}

export class ModalFrame {
  private layer: Phaser.GameObjects.GameObject[] = [];
  private open = false;

  constructor(private readonly deps: ModalFrameDeps) {}

  /** Whether a modal is currently up — `CollectScene.updatePan`/`update()`'s
   * own freeze, preserved from before this extraction. */
  get isOpen(): boolean {
    return this.open;
  }

  /**
   * A HUD-bar button, rendered as the §14 **Utility pill** (Control-style) —
   * the shipped dialogue control-bar pill recolored to menu gold, NOT the old
   * bracket text. Idle: `night` @ 90% fill, 2px `gold` @ 35% border, `gold`
   * mono label. Hover: `panelHover` fill, `goldBright` (`ember`) border and
   * label. The hotkey renders as a dimmer `muted` suffix inside the pill.
   * Corner radius is `VN_METRICS.controlCornerOfPill` of the pill height, the
   * same math the dialogue bar uses (§14 §4).
   *
   * Anchored top-left at `(x, y)` and grows rightward, exactly as the old text
   * button did, so the callers' hand-tuned x offsets still lay out in a row.
   *
   * `opts.container` re-parents the pill's three objects (fill, label, hotkey)
   * into a caller-owned Container instead of leaving them loose on the scene
   * display list at HUD depth. Needed by any caller drawing a button INSIDE a
   * `modalFrame()` board rather than under one: the pill's own depth (99/100)
   * sits below the board (200), so a loose pill is swallowed by the panel, and
   * only the fill Graphics is returned — the two Text objects are otherwise
   * unreachable, so a redrawing caller could never tear them down. A Container
   * solves both at once (its own depth places the whole pill in the scene, and
   * `removeAll(true)` destroys every part). Omitted, behaviour is byte-identical
   * to before: loose objects at depth 99/100, which is what `CollectScene`'s HUD
   * row and `NavRow` want.
   */
  button(
    x: number,
    y: number,
    label: string,
    onClick: () => void,
    opts?: { readonly container?: Phaser.GameObjects.Container },
  ): Phaser.GameObjects.Graphics {
    // The drawing itself lives in `ui/buttons.ts` since 2026-08-24, so scenes
    // that hold no `ModalFrame` (satchel, shelf, edit-mode, `ScreenScene`'s
    // HUD) draw the SAME pill instead of raw bracket text. Behaviour here is
    // unchanged: loose objects at depth 99/100 unless a container is given.
    return utilityPill(this.deps.scene, x, y, label, onClick, { container: opts?.container }).background;
  }

  /**
   * The width the §14 pill for `label` will render at — the same geometry
   * `button` uses, measured on throwaway text so a row of variable-width pills
   * can be packed before any is placed.
   */
  private pillWidth(label: string): number {
    return utilityPillWidth(this.deps.scene, label);
  }

  /**
   * Lay a set of HUD buttons out as ONE right-aligned row with even gaps, so the
   * variable-width §14 pills pack tidily instead of colliding at hand-tuned x
   * anchors. Placed left-to-right so the row ends flush at `rightX`; only the
   * entries passed are drawn, so an absent optional button leaves no hole.
   */
  buttonRow(
    buttons: ReadonlyArray<{ readonly label: string; readonly onClick: () => void }>,
    opts: {
      readonly rightX: number;
      readonly y: number;
      readonly gap?: number;
      /** Forwarded verbatim to `button()` — see its `opts.container` note. */
      readonly container?: Phaser.GameObjects.Container;
    },
  ): Phaser.GameObjects.Graphics[] {
    const gap = opts.gap ?? 14;
    const widths = buttons.map((b) => this.pillWidth(b.label));
    const total = widths.reduce((sum, w) => sum + w, 0) + gap * Math.max(0, buttons.length - 1);
    let x = opts.rightX - total;
    return buttons.map((b, i) => {
      const g = this.button(x, opts.y, b.label, b.onClick, { container: opts.container });
      x += widths[i] + gap;
      return g;
    });
  }

  /** A modal's frame — panel, header, and the popIn motion, shared so every
   * dialog in this mode reads as the same object rather than one-offs. */
  modalFrame(title: string, height: number): { top: number; bottom: number } {
    this.open = true;
    const { scene, viewWidth: W, viewHeight: H } = this.deps;
    const panel = scene.add
      .rectangle(W / 2, H / 2, 900, height, COLOR.panel, 0.97)
      .setStrokeStyle(2, COLOR.goldNum)
      .setDepth(200);
    this.layer.push(panel);
    popIn(scene, panel);
    // Gold corner filigree — the framed-menu language from the UI asset kit,
    // applied here so every modal in the mode gains it from one place.
    this.layer.push(filigreeCorners(scene, W / 2, H / 2, 900, height, 201));
    const heading = scene.add
      .text(W / 2 - 420, H / 2 - height / 2 + 30, title, {
        fontFamily: FONT.display,
        fontSize: "30px",
        color: COLOR.gold,
      })
      .setDepth(201);
    this.layer.push(heading);
    popIn(scene, heading);
    return { top: H / 2 - height / 2, bottom: H / 2 + height / 2 };
  }

  /** `item_id`s -> what a player would call them, joined for a component
   * hint (Roc, 2026-08-13: a clue should say what it needs, not just name
   * the spell). Falls back to the raw id if a record is somehow missing —
   * should never happen for an approved spell's own components. */
  componentHint(spell: SpellRecord): string {
    return spell.components.map((id) => this.deps.inventory.record(id)?.description ?? id).join(" + ");
  }

  /**
   * The modal's close control, rendered as the §14 **Utility pill**
   * (Control-style, §4) — the same gold-on-night control family `button()`
   * draws, not the old bracket text. `night` @ 90% fill, 2px `gold` @ 35%
   * border, `gold` mono label; hover lifts to `panelHover`/`emberNum`/`ember`.
   * Corner radius is `VN_METRICS.controlCornerOfPill` of the height. Anchored
   * top-right at the same `(W/2+300, H/2-200)` as before, and every object is
   * pushed into `this.layer` so `clearModal()` tears the whole pill down —
   * unlike `button()`, whose label is meant to persist as HUD chrome. Shared by
   * every modal (hedge cast, NPC talk), so the family stays consistent.
   */
  closeButton(onClose: () => void): void {
    const { scene, viewWidth: W, viewHeight: H } = this.deps;
    // Same shared pill as `button()`, drawn at modal depth (201/202) and
    // pushed onto `this.layer` so `clearModal()` tears the whole control down.
    const pill = utilityPill(scene, W / 2 + 300, H / 2 - 200, "close", onClose, { depth: 201, fontSize: "20px" });
    this.layer.push(...pill.objects);
  }

  /**
   * Marks the modal state OPEN without drawing `modalFrame()`'s leather board
   * and heading — for a caller building its own panel shape (the cast-on-a-
   * thing book page, §14 "parchment card" case, not a framed board) that
   * still needs `isOpen`/`clearModal()` to behave identically to a framed
   * modal for pan-freeze and click-through gating (`CollectScene`'s own
   * `modalSys.isOpen` checks). Panel content pushed via `pushModal()` as
   * usual; `clearModal()` tears it down and flips `isOpen` back off exactly
   * as it does for a `modalFrame()`-drawn modal.
   */
  markOpen(): void {
    this.open = true;
  }

  clearModal(): void {
    this.layer.forEach((o) => o.destroy());
    this.layer = [];
    this.open = false;
  }

  /** `NpcTalkSystem`'s way into this one modal layer — see `ModalHost` in
   * `render/NpcTalkSystem.ts`. */
  pushModal(obj: Phaser.GameObjects.GameObject): void {
    this.layer.push(obj);
  }
}
