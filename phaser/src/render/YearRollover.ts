/**
 * The year rollover — what the Final Screen offers once the results are read.
 *
 * T13 Phase 5 (`plans/2026-08-24-year-loop-saves-build-plan.md`, and the
 * 2026-08-23 year-loop ruling behind it). A life is five days long and ends at
 * the festival; the ruling makes that an ENDING, not the end. This is the
 * screen that says so: a discovery summary of how much of the world this life
 * has actually seen, and the two things a player can do next.
 *
 * ---------------------------------------------------------------------------
 * IT APPENDS TO THE RESULTS PANEL, IT DOES NOT REPLACE IT
 * ---------------------------------------------------------------------------
 *
 * `render/FestivalResults.ts` still draws the whole "what the week came to"
 * panel at the same moment, and this sits UNDER it on screen — a band across
 * the bottom, top edge flush with the results panel's bottom edge, so the two
 * read as one stacked frame. Nothing here touches that class, its geometry or
 * its trigger; `CollectScene.render()` syncs both from the same condition.
 *
 * THE BAND IS DRAWN ABOVE THE HUD BAR ON PURPOSE. `render/HudBar.ts`'s plate
 * hugs the bottom edge at depth 98, and the week is over: there is no day left
 * to Wait through or End, and the two choices that matter are on this panel.
 * The band is opaque and overlaps the plate's top edge; the nav tiles below it
 * stay reachable, so nothing is hidden-but-clickable.
 *
 * ---------------------------------------------------------------------------
 * DRAW DISCIPLINE — the same rule as `FestivalResults`, and for the same reason
 * ---------------------------------------------------------------------------
 *
 * Owns exactly ONE container, keyed on what is drawn, and destroys it on every
 * `sync` that changes the content. `CollectScene.render()` runs on every ink
 * view, so a panel that appended instead of replacing would stack a dozen
 * copies of itself — and here that would also stack a dozen live click handlers
 * on "Continue", which is worse than a visual smear.
 *
 * ---------------------------------------------------------------------------
 * NO NUMBER IS INVENTED HERE
 * ---------------------------------------------------------------------------
 *
 * Every count and the sentence itself come from `world/DiscoverySummary.ts`,
 * pure and unit-tested; this file formats nothing and counts nothing. See that
 * file's header for why the items denominator is the run's own obtainable set
 * and not the `content/` library, and for why these three numbers are a
 * collection readout rather than the score `gdd/03-core-loop.md` forbids.
 */

import Phaser from "phaser";
import { COLOR, FONT, filigreeCorners } from "../ui/theme";
import { utilityPill, utilityPillWidth } from "../ui/buttons";
import { formatDiscoveryLine, type DiscoverySummary } from "../world/DiscoverySummary";


/** Matches `FestivalResults.PANEL_W`, so the two frames share an edge. */
const PANEL_W = 1420;
const PANEL_H = 124;
/**
 * The results panel bottom, exactly: its own `cy` is `H / 2 - 20` and its
 * height is 700, so it ends at 870 on a 1080-tall frame. Four pixels of
 * breathing room and this band starts.
 */
const PANEL_TOP = 874;
/** `FestivalResults.PAD`, so the sentence's left edge lines up with the panel
 * above it rather than sitting 16px proud of it. */
const PAD = 56;
const BUTTON_GAP = 16;
const LINE_SIZE = "22px";

/** Above the results panel (60), the HUD plate (98) and its tooltip (150). */
const DEPTH = 160;

export const CONTINUE_LABEL = "Continue your exploration in the next year";
export const MAIN_MENU_LABEL = "Return to main menu";

export interface YearRolloverDeps {
  readonly scene: Phaser.Scene;
  readonly viewWidth: number;
  /**
   * The three counters, read fresh whenever the band is (re)drawn.
   *
   * A THUNK, not a value handed to `sync`, so the scene stays a wiring layer:
   * it says which systems to ask, once, at construction, and never assembles
   * the summary itself. `world/DiscoverySummary.ts`'s `summarizeDiscovery` is
   * side-effect-free, so calling it per draw is honest and cheap.
   */
  readonly summary: () => DiscoverySummary;
  /**
   * Divert into `begin_new_year`. The renderer does not know what that means —
   * it knows a button was pressed. See `CollectScene`'s wiring.
   */
  readonly onContinue: () => void;
  /** Leave for the mode picker. Writes nothing. */
  readonly onMainMenu: () => void;
}

export class YearRollover {
  private layer: Phaser.GameObjects.Container | null = null;
  /** What is currently drawn, so an unchanged render is a no-op. */
  private drawnKey: string | null = null;

  constructor(private readonly deps: YearRolloverDeps) {}

  /** `false` clears the band — anywhere but a parked Final Screen. */
  sync(show: boolean): void {
    const key = show ? formatDiscoveryLine(this.deps.summary()) : null;
    if (key === this.drawnKey) return;
    this.clear();
    this.drawnKey = key;
    if (key) this.draw(key);
  }

  clear(): void {
    this.layer?.destroy(true);
    this.layer = null;
    this.drawnKey = null;
  }

  /** `line` IS the key — the whole panel is that sentence plus two fixed buttons. */
  private draw(line: string): void {
    const { scene, viewWidth: W } = this.deps;
    const cx = W / 2;
    const cy = PANEL_TOP + PANEL_H / 2;
    const left = cx - PANEL_W / 2 + PAD;
    const right = cx + PANEL_W / 2 - PAD;

    const layer = scene.add.container(0, 0).setDepth(DEPTH);
    this.layer = layer;

    layer.add(scene.add.rectangle(cx, cy, PANEL_W, PANEL_H, COLOR.panel, 0.97));
    const edge = scene.add.graphics();
    edge.lineStyle(2, COLOR.border, 0.8);
    edge.strokeRect(cx - PANEL_W / 2, PANEL_TOP, PANEL_W, PANEL_H);
    layer.add(edge);
    layer.add(filigreeCorners(scene, cx, cy, PANEL_W, PANEL_H));

    layer.add(
      scene.add.text(left, PANEL_TOP + 20, line, {
        fontFamily: FONT.display,
        fontSize: LINE_SIZE,
        color: COLOR.ink,
        wordWrap: { width: PANEL_W - PAD * 2 },
      }),
    );

    // Right-aligned pair, primary on the left of it — measured before either is
    // placed so the row packs from the panel's right edge inward and a copy
    // change cannot push a button off the panel.
    const buttonY = PANEL_TOP + 60;
    const menuW = utilityPillWidth(scene, MAIN_MENU_LABEL);
    utilityPill(scene, right, buttonY, MAIN_MENU_LABEL, () => this.deps.onMainMenu(), {
      container: layer,
      depth: DEPTH,
      originX: 1,
    });
    utilityPill(
      scene,
      right - menuW - BUTTON_GAP,
      buttonY,
      CONTINUE_LABEL,
      () => this.deps.onContinue(),
      { container: layer, depth: DEPTH, originX: 1 },
    );
  }
}
