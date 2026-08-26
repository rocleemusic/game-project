/**
 * The HUD's one docked bar — T14 ("One Bar, Three Tenants",
 * `plans/2026-08-23-hud-relayout-ruling.md`; wireframe
 * `tools/screen-flow/mockups/hud-relayout-wireframe.html`).
 *
 * The ruling's build note: "The tenant swap wants a small owner (a `HudBar`
 * that mounts one of three tenants) rather than three scenes each drawing
 * their own bar." This is that owner. It draws the plate — a centred capsule
 * hugging the bottom edge — and mounts whatever tenant the player's current
 * activity calls for.
 *
 * ONE TENANT IS BUILT TODAY: **explore** (§1 + §1b) — the five nav icons plus
 * the day-action cluster, all of it `render/NavRow.ts`. The other two are
 * deliberately absent rather than stubbed:
 *
 *   - §2 **casting** wants the satchel strip as an interactive picker. On disk
 *     today the world-cast picker is `render/HedgeCastPrompt.ts` — a modal
 *     book page, not a docked strip — and `render/SatchelStrip.ts` is still a
 *     passive text readout. Neither is a bar tenant yet, so there was nothing
 *     to reuse and nothing to extend.
 *   - §3 **dialogue** wants the VN control set. `DialogueSystem` draws its own
 *     control bar today.
 *
 * When either is built, it mounts here: give this class a `setTenant()` and a
 * second/third `build*Tenant()`, and let the plate resize to the mounted
 * tenant's measured width. The swap is an INSTANT show/hide (§4, ruled) — no
 * crossfade — so there is no transition machinery to design.
 *
 * WHAT THIS OWNS THAT `NavRow` DOES NOT. The plate. The bar's position. The
 * hotkeys for the controls on it. And §1b's **confirm before End the Day**
 * ("End the Day should open a one-step confirm before it commits. Wait needs
 * no confirm") — a control that ends the day cannot be one click deep, and
 * the confirm is a property of the ACTION, not of the pill's paint job, so it
 * lives with the wiring rather than inside `NavRow`.
 */

import Phaser from "phaser";
import type { PlayView } from "@lantern/lib/play";
import type { InkBridge } from "../ink/InkBridge";
import type { ModalFrame } from "./ModalFrame";
import { NavRow, NAV_ROW_HEIGHT } from "./NavRow";
import { COLOR, FONT } from "../ui/theme";
import { utilityPill } from "../ui/buttons";

/** Wireframe `.hudbar`: a leather-edged plate hugging the bottom edge, its
 * contents inset by a small pad. `BOTTOM_MARGIN` is the mockup's own 2.6% of
 * frame height, in canvas pixels. */
const PAD_X = 16;
const PAD_Y = 10;
const BOTTOM_MARGIN = 28;
const PLATE_RADIUS = 14;
/** Under the tooltip (150) and the tiles (99/100) — the plate is the surface
 * they sit ON. Above the bottom scrim (19) so the satchel readout cannot
 * paint over it. */
const PLATE_DEPTH = 98;

export interface HudBarDeps {
  readonly scene: Phaser.Scene;
  readonly ink: InkBridge;
  /** For §1b's End-the-Day confirm. */
  readonly modal: ModalFrame;
  readonly viewWidth: number;
  readonly viewHeight: number;
}

/** The explore tenant's panel actions — every one of these opens something.
 * The two day actions are NOT here: they are ink choices, taken off the live
 * view, and this class wires them itself. */
export interface HudBarActions {
  readonly openSatchel: () => void;
  readonly openNotebook: () => void;
  readonly openHome: (() => void) | null;
  readonly openCalendar: () => void;
  readonly openOptions: () => void;
}

export class HudBar {
  private readonly nav: NavRow;
  private plate!: Phaser.GameObjects.Graphics;

  constructor(private readonly deps: HudBarDeps) {
    this.nav = new NavRow({ scene: deps.scene });
  }

  /**
   * Draw the plate and mount the explore tenant. Called ONCE per scene life
   * from `create()`, like the row it replaces — the bar's geometry is fixed
   * for the life on purpose (see `NavRow.setDayActionsEnabled`).
   *
   * `dayActions` false drops the fourth cluster entirely, for a mode whose ink
   * has no `[Wait]`/`[End the day]` to offer at all.
   */
  build(actions: HudBarActions, opts: { dayActions: boolean }): void {
    const { scene, viewWidth: W, viewHeight: H } = this.deps;
    const navActions = {
      ...actions,
      wait: opts.dayActions ? () => this.takeHubAction("wait") : null,
      endDay: opts.dayActions ? () => this.confirmEndDay() : null,
    };

    const { width } = this.nav.measure(navActions);
    const plateW = width + PAD_X * 2;
    const plateH = NAV_ROW_HEIGHT + PAD_Y * 2;
    const plateX = (W - plateW) / 2;
    const plateY = H - BOTTOM_MARGIN - plateH;

    // A HUD sitting directly on photographic art has no guaranteed contrast;
    // the plate is what makes the tiles legible on any backdrop. Fill and
    // border BEFORE the strokes (graphics skill gotcha #2).
    this.plate = scene.add.graphics().setDepth(PLATE_DEPTH);
    this.plate.fillStyle(COLOR.night, 0.94);
    this.plate.fillRoundedRect(plateX, plateY, plateW, plateH, PLATE_RADIUS);
    this.plate.lineStyle(2, COLOR.leatherDarkNum, 1);
    this.plate.strokeRoundedRect(plateX, plateY, plateW, plateH, PLATE_RADIUS);

    this.nav.build(navActions, { leftX: plateX + PAD_X, y: plateY + PAD_Y, viewWidth: W });

    // Every hotkey for a control ON this bar is bound here, so the letters and
    // the tooltips that advertise them can never drift apart. `O` has no
    // in-tile letter (the mockup's Options tooltip carries no key suffix) but
    // keeps its binding — it is also the VN control bar's own Options key.
    scene.input.keyboard?.on("keydown-S", actions.openSatchel);
    scene.input.keyboard?.on("keydown-N", actions.openNotebook);
    scene.input.keyboard?.on("keydown-L", actions.openCalendar);
    scene.input.keyboard?.on("keydown-O", actions.openOptions);
    if (actions.openHome) scene.input.keyboard?.on("keydown-H", actions.openHome);

    if (opts.dayActions) {
      // §1b's hotkeys, matching the in-tile letter and the pill's own label.
      //
      // `E` USED TO BE EDIT MODE. mode5 bound bare `E` to the authoring
      // overlay's toggle; the wireframe stamps `End day · E` as a
      // player-facing control with a visible caption, so the player key wins
      // and `CollectScene` moved the authoring toggle to `Shift+E` (its dev
      // pill relabelled to match). Hence the `shiftKey` guard here: the two
      // now share the physical key and split on the modifier, rather than
      // both firing off one press.
      scene.input.keyboard?.on("keydown-W", () => this.takeHubAction("wait"));
      scene.input.keyboard?.on("keydown-E", (e: KeyboardEvent) => {
        if (!e.shiftKey) this.confirmEndDay();
      });
    }
  }

  /**
   * Per-render sync: dim whichever day action ink is not offering right now.
   * Cheap and idempotent — `NavRow` repaints only on an actual state change.
   */
  sync(v: PlayView): void {
    this.nav.setDayActionsEnabled(
      v.choices.some((c) => c.hubAction === "wait"),
      v.choices.some((c) => c.hubAction === "endday"),
    );
  }

  /** Take the live ink choice behind a bar day action, if it is offered. */
  private takeHubAction(action: "wait" | "endday"): boolean {
    const { ink } = this.deps;
    const choice = ink.view().choices.find((c) => c.hubAction === action);
    if (!choice) return false;
    ink.choose(choice.index);
    ink.runToChoice();
    return true;
  }

  /**
   * §1b's one-step confirm. Ending the day is the only control on this bar
   * that cannot be undone by clicking again, so it asks first — and it asks
   * through the same leather board every other dialog in the mode wears
   * (`ModalFrame.modalFrame`), not a bespoke panel.
   */
  private confirmEndDay(): void {
    const { scene, modal, viewWidth: W, viewHeight: H } = this.deps;
    if (modal.isOpen) return;
    if (!this.deps.ink.view().choices.some((c) => c.hubAction === "endday")) return;

    modal.modalFrame("End the day?", 300);
    const body = scene.add
      .text(W / 2, H / 2 - 20, "Whatever is still undone stays undone.", {
        fontFamily: FONT.display,
        fontSize: "24px",
        color: COLOR.ink,
      })
      .setOrigin(0.5)
      .setDepth(201);
    modal.pushModal(body);

    const yes = utilityPill(scene, W / 2 - 20, H / 2 + 50, "end the day", () => {
      modal.clearModal();
      this.takeHubAction("endday");
    }, { depth: 201, originX: 1 });
    const no = utilityPill(scene, W / 2 + 20, H / 2 + 50, "not yet", () => modal.clearModal(), {
      depth: 201,
    });
    for (const o of [...yes.objects, ...no.objects]) modal.pushModal(o);
  }
}
