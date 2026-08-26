/**
 * Responsibility 1 out of `CollectScene`, extracted verbatim
 * (`plans/2026-08-17-mode5-srp-merge-plan.md`, step 5): `syncBackdrop`,
 * `updatePan`.
 *
 * "Backdrop + pan" is one responsibility, not two: the backdrop is the only
 * thing `PanModel.fit()` ever sizes against, and `pan` is exposed here so
 * every other panning object (hotspots, NPC portraits) places itself with the
 * SAME offset — which is what makes them read as fixed points in the scene
 * rather than floating HUD, same as `NpcTalkSystem` already takes `pan` as an
 * injected dependency.
 *
 * WHAT THIS DOES NOT OWN. Which screen the player is actually ON —
 * `CollectScene.currentScreen` stays scene-level orchestration state, read by
 * far more than the backdrop (save, the hedge/gated cast prompt, the walker
 * probe, `NpcTalkSystem`). `sync()` takes the screen as an argument and
 * tracks its own copy purely to skip a redundant destroy/recreate when the
 * screen has not changed — an implementation detail, not a second source of
 * truth for "where is the player."
 *
 * Constructed ONCE as a persistent field, same as `CollectScene`'s own `pan`
 * field was before this extraction (not rebuilt in `init()` the way
 * `Inventory`/`Knowledge`/`NpcTalkSystem` are). That means it outlives the
 * display list it drew on, so it drops its own drawn state on the scene's
 * `shutdown` — see the constructor for the black-frame bug that proved
 * `sync()`'s guard alone was not enough.
 */

import Phaser from "phaser";
import { PanModel } from "../world/view/PanModel";
import { COLOR, imageFadeIn } from "../ui/theme";
import { PlayerSettings } from "../world/PlayerSettings";

export interface BackdropDeps {
  readonly scene: Phaser.Scene;
  readonly viewWidth: number;
  readonly viewHeight: number;
  /** The vertical band the pointer must be inside for the pan to take aim —
   * see `PanModel`'s own header. */
  readonly pointerBand: readonly [number, number];
  /** The horizontal band, same rule — see `PanModel`'s own header. */
  readonly pointerXBand?: readonly [number, number];
  /** Flip the band to a dead zone — see `PanModel`'s own header. */
  readonly deadZone?: boolean;
}

export class BackdropSystem {
  readonly pan: PanModel;
  private backdrop?: Phaser.GameObjects.Image;
  private scrim?: Phaser.GameObjects.Rectangle;
  private drawnScreen: string | null = null;
  /** See `bindShutdown` — the listener cannot be attached at construction. */
  private shutdownBound = false;

  constructor(private readonly deps: BackdropDeps) {
    this.pan = new PanModel({
      viewWidth: deps.viewWidth,
      viewHeight: deps.viewHeight,
      pointerBand: deps.pointerBand,
      pointerXBand: deps.pointerXBand,
      deadZone: deps.deadZone,
    });
  }

  /**
   * Drop the drawn state when the scene shuts down.
   *
   * THIS OBJECT OUTLIVES THE DISPLAY LIST IT DREW ON. It is a field
   * initializer on a Phaser scene (see the header above), and Phaser reuses the
   * scene instance — so a shutdown wipes `backdrop` and `scrim` off the display
   * list while the references, and `drawnScreen`, survive. The next life then
   * asks for the screen the LAST life ended on, `sync()`'s skip-if-unchanged
   * guard says "already drawn", and nothing is drawn at all.
   *
   * Found T13 Phase 5 (2026-08-24) by the year-rollover playtest, the first
   * flow that could hit it: leave play from the Final Screen, come back through
   * the boot board, and RESUME A SAVE PARKED ON THAT SAME SCREEN. The results
   * panel and the rollover band came back onto a black frame. The header's
   * claim that the guard "already handles a fresh life" was true for every
   * screen except the one the previous life ended on.
   *
   * BOUND LAZILY, FROM `sync()`, AND NOT IN THE CONSTRUCTOR. `Scene.events`
   * does not exist yet while a scene's field initializers run — Phaser assigns
   * it in `Systems.init()`, which is later — so touching it there throws
   * "Cannot read properties of undefined (reading 'on')" and takes the whole
   * boot down. `on`, not `once`: one listener serves every subsequent life, and
   * it dies with the scene, so there is nothing to unbind.
   */
  private bindShutdown(): void {
    if (this.shutdownBound) return;
    this.shutdownBound = true;
    this.deps.scene.events.on("shutdown", () => {
      this.backdrop = undefined;
      this.scrim = undefined;
      this.drawnScreen = null;
    });
  }

  /** Whether a backdrop is currently drawn — `CollectScene.update()`'s own
   * gate on repositioning anything at all, preserved from before this
   * extraction rather than inferred from "no screen." */
  get hasBackdrop(): boolean {
    return Boolean(this.backdrop);
  }

  /** Draw (or clear, for `null`) the backdrop for `screen`. A no-op if this
   * is already the screen last drawn. */
  sync(screen: string | null): void {
    this.bindShutdown();
    if (screen === this.drawnScreen) return;
    this.drawnScreen = screen;

    this.backdrop?.destroy();
    this.backdrop = undefined;
    this.pan.reset();
    if (!screen) {
      this.refreshScrim();
      return;
    }

    const { scene, viewWidth, viewHeight } = this.deps;
    const key = `bg:${screen}`;
    if (scene.textures.exists(key)) {
      this.backdrop = scene.add.image(viewWidth / 2, viewHeight / 2, key).setDepth(0);
      // Blown up past a plain cover-fit so there's room to pan — the scale
      // and the resulting limits are `PanModel.fit`'s job.
      this.backdrop.setScale(this.pan.fit(this.backdrop.width, this.backdrop.height));
      imageFadeIn(scene, this.backdrop);
    }
    this.scrim ??= scene.add
      .rectangle(viewWidth / 2, viewHeight / 2, viewWidth, viewHeight, COLOR.night, 0)
      .setDepth(1);
    this.refreshScrim();
  }

  /**
   * Re-read `PlayerSettings.scrimAlpha` onto the ONE pooled scrim.
   *
   * Called on every screen change and again whenever Options closes, so the
   * Scene Dimming slider lands live instead of on the next screen.
   *
   * `setFillStyle` on the SAME rectangle, never a second `scene.add` — this is
   * the exact code path where a scrim once compounded to black by stacking a
   * new semi-transparent rectangle per screen. One object, one alpha, assigned
   * rather than accumulated: repeat calls are idempotent by construction.
   */
  refreshScrim(): void {
    const alpha = PlayerSettings.scrimAlpha;
    this.scrim?.setFillStyle(COLOR.night, alpha);
    // Hidden outright at zero, so "off" is genuinely no object in the way and
    // not a transparent rectangle still sitting over the art.
    this.scrim?.setVisible(Boolean(this.backdrop) && alpha > 0);
  }

  /** Only ever sets the pan TARGET — `step()` is what actually moves
   * anything. A no-op while there is no backdrop to pan. */
  updatePan(pointerX: number, pointerY: number): void {
    if (!this.backdrop) return;
    this.pan.aimAt(pointerX, pointerY);
  }

  /** Eases the pan offset one frame and repositions the backdrop. A no-op
   * while there is no backdrop. */
  step(deltaMs: number, instant: boolean): void {
    if (!this.backdrop) return;
    this.pan.step(deltaMs, instant);
    const centre = this.pan.place(0, 0);
    this.backdrop.setPosition(centre.x, centre.y);
  }
}
