/**
 * Traversal, as geography instead of buttons — T14 §1
 * (`plans/2026-08-23-hud-relayout-ruling.md`; wireframe
 * `tools/screen-flow/mockups/hud-relayout-wireframe.html#explore`, ruled by
 * Roc 2026-08-23): "Movement = clickable screen regions, not buttons."
 *
 * WHAT MOVED HERE, AND WHY IT MOVED WHOLE. This is the move half of
 * `TraversalRow` — `moveTarget`, `blockingGatesFor`, `hintFor`,
 * `describeGateRule` and the gated-click behaviour came across verbatim rather
 * than being reimplemented, because a move region has to make exactly the same
 * three decisions a move pill made: is this exit gated, what does its locked
 * label say, and what happens when you click it anyway. Splitting those
 * decisions across two files is how the two surfaces would drift. `TraversalRow`
 * keeps every choice that is NOT a screen-hub verb (looks, scene entries, the
 * festival vignette, `continue`) and no longer knows what a move is.
 *
 * The refused-gate crash `TraversalRow`'s own header documents came with it:
 * `hintFor()` FILTERS to describable rule ids instead of asserting one exists.
 * `G-F4-still` / `G-F8-combine` are refused at load (`GateEngine.ts`'s header
 * has the accounting) — they block correctly but have no entry in
 * `gateEngine.rules`, and reading one with a non-null assertion crashed
 * `render()` one hop from the start screen. Do not reintroduce the `!`.
 *
 * WHAT THIS DOES NOT OWN. Geometry — `world/view/MoveRegionPlacement.ts` is
 * the pure arithmetic, including the load-bearing fallback for the (currently
 * every) screen with no authored move rect. It also owns the exit-key
 * derivation (`exitMoveInputs`, which absorbed the `moveTarget` parse that used
 * to be a private method here) as of 2026-08-24, when `render/EditModeSystem.ts`
 * became a second reader of it: the editor authors `moves[screen][destId]`, so
 * "which key does this exit file under" has to be one function, not two copies.
 * Examine regions — those are
 * `HotspotSystem`'s gold boxes, a different verb, a different authored list,
 * and deliberately a different colour (`dusk` here, per the wireframe's
 * `.move-region`). Wait and End-the-day — those are hub verbs too, but neither
 * names a place on the screen, so §1b puts them on the HUD bar
 * (`render/HudBar.ts`), not here.
 */

import Phaser from "phaser";
import type { PlayView, PlayChoice } from "@lantern/lib/play";
import type { InkBridge } from "../ink/InkBridge";
import type { RegionMap } from "../ink/loadRun";
import type { Gates } from "../world/Gates";
import type { GateEngine } from "../world/gates/GateEngine";
import type { GateRule } from "../world/gates/GateRule";
import type { PanModel } from "../world/view/PanModel";
import { HEDGE_SCREEN_ID } from "../world/collectGates";
import { COLOR, FONT } from "../ui/theme";
import { exitMoveInputs, moveRegionLabel, planMoveRegions } from "../world/view/MoveRegionPlacement";

/** Wireframe `.move-region`: 2px dashed dusk border over a 10%-dusk wash. A
 * region is a place you can walk to, not a button — the wash stays faint. */
const DASH_LEN = 14;
const DASH_GAP = 9;
const BORDER_WIDTH = 2;
const FILL_ALPHA = 0.1;
const FILL_ALPHA_HOVER = 0.22;
const BORDER_ALPHA = 0.7;
const BORDER_ALPHA_HOVER = 0.95;
/** A gated exit is a fact about the world, not an error (`NoEffectHonesty`'s
 * rule, carried over from `TraversalRow`) — it dims, it never turns red. Dimmer
 * than an open exit, but NOT invisible: the first T14 playtest screenshot had
 * the gated box at 0.30 gold over a cream-plastered wall, which read as nothing
 * at all. A locked way still has to look like a way. */
const GATED_FILL_ALPHA = 0.08;
const GATED_BORDER_ALPHA = 0.45;
/**
 * A dark underlay stroked one pixel wider beneath every dash.
 *
 * Same reasoning `CollectScene` gives for its HUD scrims — "a HUD sitting
 * directly on photographic art has no guaranteed contrast; the backdrop varies
 * screen to screen." A 2px dusk line is invisible on the cream half-timbering
 * of T1 and obvious on F5's dark canopy. The underlay makes it read on both
 * without darkening the painting the way a full scrim would.
 */
const SHADOW_WIDTH = 4;
const SHADOW_ALPHA = 0.45;

/** Wireframe `.rlbl` — the destination's name on a night plate under the box. */
const LABEL_FONT_PX = "20px";
const LABEL_PAD_X = 12;
const LABEL_PAD_Y = 5;
const LABEL_GAP = 10;
const LABEL_RADIUS = 9;

/** The §5 tap-to-reveal "?" for a locked exit's raw gate rule, carried over
 * from `TraversalRow.buildPill` — hover shows the line, clicking "?" pins it. */
const QM_DIAMETER = 16;
const QM_GAP = 8;
const HINT_FONT_PX = 16;
const HINT_PAD_X = 12;
const HINT_PAD_Y = 8;
const HINT_GAP = 8;
const HINT_WRAP_WIDTH = 460;
const HINT_MARGIN = 20;

/** Above the boxes (10/11) so a plate never hides behind a neighbouring
 * region, and below the HUD scrims (19) so it never covers the bar. */
const BOX_DEPTH = 10;
const LABEL_DEPTH = 11;
const HINT_DEPTH = 12;

/**
 * PLACEHOLDER, carried verbatim from `TraversalRow` — authored gates have no
 * real in-fiction hint yet, so a locked exit would otherwise just say "blocked"
 * with no way to guess what clears it. Flip to `false` once real clues exist.
 */
const DEBUG_GATE_HINTS = true;

/** One plain-English line for a gate rule — debug only, not authored copy. */
function describeGateRule(rule: GateRule): string {
  switch (rule.kind) {
    case "cast":
      return `cast ${rule.spellId}${rule.requireEffect ? " with effect" : ""}${
        rule.receiverId ? ` on ${rule.receiverId}` : ""
      }`;
    case "bond": {
      const band = ["low", "medium", "high"][rule.minBand] ?? String(rule.minBand);
      return `reach ${band} bond${rule.soulId ? ` with ${rule.soulId}` : ""}`;
    }
    case "time":
      return `be ${rule.blocks.join(" or ")}`;
    case "chain":
      return `cast ${rule.steps.map((s) => s.spellId).join(", then ")} in order`;
  }
}

/**
 * A dashed rounded-corner-free rectangle outline, walked edge by edge.
 *
 * Phaser's `Graphics` has no dash support of its own (no `setLineDash`), so
 * the dashes are real line segments — `lineStyle` BEFORE the strokes, per the
 * graphics skill's gotcha #2, and `lineBetween` rather than a path so a
 * partial final dash simply stops short instead of wrapping a corner.
 */
function strokeDashedRect(
  g: Phaser.GameObjects.Graphics,
  x: number,
  y: number,
  w: number,
  h: number,
): void {
  const step = DASH_LEN + DASH_GAP;
  const edge = (x0: number, y0: number, x1: number, y1: number) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    if (len <= 0) return;
    const ux = (x1 - x0) / len;
    const uy = (y1 - y0) / len;
    for (let d = 0; d < len; d += step) {
      const d2 = Math.min(d + DASH_LEN, len);
      g.lineBetween(x0 + ux * d, y0 + uy * d, x0 + ux * d2, y0 + uy * d2);
    }
  };
  edge(x, y, x + w, y);
  edge(x + w, y, x + w, y + h);
  edge(x + w, y + h, x, y + h);
  edge(x, y + h, x, y);
}

export interface MoveRegionsDeps {
  readonly scene: Phaser.Scene;
  readonly ink: InkBridge;
  readonly gates: Gates;
  /** Live — `startGates()` may construct it after this class does. */
  readonly gateEngine: () => GateEngine | null;
  /** `mode.gates.source === "authored"` — constant for the scene's life. */
  readonly authoredGates: boolean;
  /** Legacy-hedge's own local flag, read live (modes 2-3 only). */
  readonly hedgeCleared: () => boolean;
  /** The authored move geometry, `{ screenId: { destScreenId: rect } }` —
   * `regions.json`'s `moves` map, EMPTY today. See `MoveRegionPlacement`'s
   * header before touching the fallback that covers for it. */
  readonly moveRects: RegionMap;
  /** The screen the player is standing on — which authored map to read. */
  readonly currentScreenId: () => string | null;
  /** Shared with the backdrop and the examine regions, so an authored box
   * stays pinned to the painting it was drawn on. */
  readonly pan: PanModel;
  readonly viewWidth: number;
  readonly viewHeight: number;
  readonly openGatedCastPrompt: (message: string, obstacleNoun: string) => void;
  readonly openHedgePrompt: () => void;
}

/** One drawn region, kept so `reposition()` can move it under the pan. */
interface BuiltRegion {
  readonly box: Phaser.GameObjects.Rectangle;
  readonly parts: Phaser.GameObjects.GameObject[];
  readonly pinned: boolean;
  readonly baseX: number;
  readonly baseY: number;
  /** Re-lays the dashed outline and the label under a moved box. */
  readonly follow: () => void;
}

export class MoveRegions {
  private built: BuiltRegion[] = [];

  constructor(private readonly deps: MoveRegionsDeps) {}

  /**
   * Draw one dashed region per exit the hub currently offers.
   *
   * `hubAction === "exit"` is the filter, NOT `kind === "move"` — `kind`
   * groups day-end in with the exits (see `PlayChoice.hubAction`'s own note),
   * and "End the day" is not a place on the screen to draw a box around. It
   * lives on the HUD bar instead (§1b).
   *
   * Draws nothing during a VN conversation, same rule `TraversalRow` follows:
   * the dialogue box owns the screen while it is up.
   */
  draw(v: PlayView, inConversation: boolean): void {
    this.clear();
    if (inConversation) return;
    const exits = v.choices.filter((c) => c.hubAction === "exit");
    if (exits.length === 0) return;

    const { pan, viewWidth: W, viewHeight: H, moveRects, currentScreenId } = this.deps;
    const screen = currentScreenId();
    const rects = (screen && moveRects[screen]) || {};
    // The SAME derivation `EditModeSystem`'s move palette runs, called rather
    // than re-implemented — see `exitMoveInputs`'s header on why the editor and
    // this renderer must never disagree about a screen's exit keys.
    const inputs = exitMoveInputs(v.choices, (name) => this.deps.gates.screenIdForName(name));
    const plans = planMoveRegions(
      inputs,
      rects,
      { width: W, height: H },
      { width: pan.pictureWidth, height: pan.pictureHeight },
    );

    plans.forEach((plan, i) => this.buildRegion(plan, exits[i]));
  }

  /** Move every unpinned region under the current pan — called from
   * `CollectScene.update()` alongside the hotspots, so the boxes read as
   * fixed points in the painting rather than floating HUD. */
  reposition(): void {
    for (const r of this.built) {
      if (r.pinned) continue;
      const at = this.deps.pan.place(r.baseX, r.baseY);
      // Skip a no-op frame. `follow()` replays a full dashed outline (four
      // edges of ~20 segments each) plus two plate fills, and Phaser rebuilds
      // that command buffer every frame it changes — the graphics skill's own
      // "Graphics is expensive" note. The pan eases to rest, so most frames
      // move nothing.
      if (at.x === r.box.x && at.y === r.box.y) continue;
      r.box.setPosition(at.x, at.y);
      r.follow();
    }
  }

  clear(): void {
    for (const r of this.built) {
      r.box.destroy();
      r.parts.forEach((o) => o.destroy());
    }
    this.built = [];
  }

  private buildRegion(
    plan: ReturnType<typeof planMoveRegions>[number],
    choice: PlayChoice,
  ): void {
    const { scene, ink, gates, authoredGates, hedgeCleared, viewWidth: W } = this.deps;
    const destId = gates.screenIdForName(plan.label);
    const blockingGateIds = authoredGates && destId ? this.blockingGatesFor(destId) : [];
    const gated = authoredGates
      ? blockingGateIds.length > 0
      : destId === HEDGE_SCREEN_ID && !hedgeCleared();
    const hintBody = DEBUG_GATE_HINTS && authoredGates ? this.hintFor(blockingGateIds) : "";

    const at = plan.pinned
      ? { x: W / 2 + plan.baseX, y: this.deps.viewHeight / 2 + plan.baseY }
      : this.deps.pan.place(plan.baseX, plan.baseY);

    // An invisible Rectangle carries the hit area (Graphics has no bounds of
    // its own — graphics skill gotcha #3) and is what `reposition()` moves;
    // the dashes are redrawn against wherever it lands.
    const box = scene.add
      .rectangle(at.x, at.y, plan.width, plan.height, COLOR.duskNum, 0)
      .setDepth(BOX_DEPTH)
      .setInteractive({ useHandCursor: true });

    const outline = scene.add.graphics().setDepth(BOX_DEPTH);
    const parts: Phaser.GameObjects.GameObject[] = [outline];

    // Fiction-first label (wireframe §5, approved as shown): "<target> — the
    // way is blocked", never the raw rule text, which rides the "?" instead.
    const label = gated ? `${plan.label} — the way is blocked` : moveRegionLabel(plan);
    const text = scene.add
      .text(0, 0, label, {
        // A destination is a name, and a locked line is a sentence about the
        // world — `display` either way (§14 §2 / theme.ts's FONT rule).
        fontFamily: FONT.display,
        fontSize: LABEL_FONT_PX,
        color: gated ? COLOR.muted : COLOR.dusk,
      })
      .setDepth(LABEL_DEPTH);
    const plate = scene.add.graphics().setDepth(LABEL_DEPTH - 0.5);
    parts.push(plate, text);

    const qm = hintBody ? scene.add.graphics().setDepth(LABEL_DEPTH) : null;
    const qmLabel = hintBody
      ? scene.add
          .text(0, 0, "?", { fontFamily: FONT.mono, fontSize: "12px", color: COLOR.muted })
          .setOrigin(0.5)
          .setDepth(LABEL_DEPTH + 0.5)
      : null;
    const hintText = hintBody
      ? scene.add
          .text(0, 0, hintBody, {
            fontFamily: FONT.display,
            fontSize: `${HINT_FONT_PX}px`,
            color: COLOR.dim,
            wordWrap: { width: HINT_WRAP_WIDTH },
          })
          .setDepth(HINT_DEPTH + 0.5)
          .setVisible(false)
      : null;
    const hintPlate = hintBody ? scene.add.graphics().setDepth(HINT_DEPTH).setVisible(false) : null;
    if (qm && qmLabel) parts.push(qm, qmLabel);
    if (hintText && hintPlate) parts.push(hintText, hintPlate);

    let hovering = false;
    let pinnedHint = false;

    /** Repaint the dashed box + reposition the label stack under it. Runs on
     * hover AND on every pan step, so one function owns the geometry. */
    const follow = (): void => {
      const x = box.x - plan.width / 2;
      const y = box.y - plan.height / 2;
      outline.clear();
      outline.fillStyle(
        COLOR.duskNum,
        gated ? GATED_FILL_ALPHA : hovering ? FILL_ALPHA_HOVER : FILL_ALPHA,
      );
      outline.fillRect(x, y, plan.width, plan.height);
      // lineStyle BEFORE the strokes — graphics skill gotcha #2. Twice: the
      // dark underlay first, the coloured dash over it.
      outline.lineStyle(SHADOW_WIDTH, COLOR.night, SHADOW_ALPHA);
      strokeDashedRect(outline, x, y, plan.width, plan.height);
      outline.lineStyle(
        BORDER_WIDTH,
        gated ? COLOR.border : COLOR.duskNum,
        gated ? GATED_BORDER_ALPHA : hovering ? BORDER_ALPHA_HOVER : BORDER_ALPHA,
      );
      strokeDashedRect(outline, x, y, plan.width, plan.height);

      const qmReserve = qm ? QM_GAP + QM_DIAMETER : 0;
      const plateW = text.width + LABEL_PAD_X * 2 + qmReserve;
      const plateH = text.height + LABEL_PAD_Y * 2;
      const plateX = Math.min(Math.max(HINT_MARGIN, box.x - plateW / 2), W - HINT_MARGIN - plateW);
      const plateY = y + plan.height + LABEL_GAP;
      plate.clear();
      plate.fillStyle(COLOR.night, 0.85);
      plate.fillRoundedRect(plateX, plateY, plateW, plateH, LABEL_RADIUS);
      text.setPosition(plateX + LABEL_PAD_X, plateY + LABEL_PAD_Y);

      if (qm && qmLabel) {
        const qx = plateX + plateW - LABEL_PAD_X - QM_DIAMETER / 2;
        const qy = plateY + plateH / 2;
        qm.clear();
        qm.setPosition(qx, qy);
        qm.lineStyle(1, pinnedHint ? COLOR.emberNum : COLOR.border, pinnedHint ? 0.9 : 0.55);
        qm.strokeCircle(0, 0, QM_DIAMETER / 2);
        qmLabel.setPosition(qx, qy);
      }
      if (hintText && hintPlate) {
        const tipW = hintText.width + HINT_PAD_X * 2;
        const tipH = hintText.height + HINT_PAD_Y * 2;
        const tipX = Math.min(Math.max(HINT_MARGIN, plateX), W - HINT_MARGIN - tipW);
        const tipY = plateY - tipH - HINT_GAP;
        hintText.setPosition(tipX + HINT_PAD_X, tipY + HINT_PAD_Y);
        hintPlate.clear();
        hintPlate.fillStyle(COLOR.night, 0.92);
        hintPlate.fillRoundedRect(tipX, tipY, tipW, tipH, 6);
        hintPlate.lineStyle(1, COLOR.goldNum, 0.45);
        hintPlate.strokeRoundedRect(tipX, tipY, tipW, tipH, 6);
      }
    };

    const syncHint = (): void => {
      const show = pinnedHint || hovering;
      hintText?.setVisible(show);
      hintPlate?.setVisible(show);
      qmLabel?.setColor(pinnedHint ? COLOR.ember : COLOR.muted);
      follow();
    };

    box.on("pointerover", () => {
      hovering = true;
      if (!gated) text.setColor(COLOR.ember);
      syncHint();
    });
    box.on("pointerout", () => {
      hovering = false;
      if (!gated) text.setColor(COLOR.dusk);
      syncHint();
    });
    box.on("pointerdown", () => {
      if (gated) {
        if (authoredGates && destId) {
          this.deps.gateEngine()?.reportBlocked(destId, blockingGateIds, choice.display);
          const hb = DEBUG_GATE_HINTS ? this.hintFor(blockingGateIds) : "";
          this.deps.openGatedCastPrompt(`Something blocks the way.${hb ? ` ${hb}` : ""}`, "it");
        } else {
          this.deps.openHedgePrompt();
        }
        return;
      }
      ink.choose(choice.index);
      ink.runToChoice();
    });

    if (qm && qmLabel) {
      qm.setInteractive({
        hitArea: new Phaser.Geom.Circle(0, 0, QM_DIAMETER / 2),
        hitAreaCallback: Phaser.Geom.Circle.Contains,
        useHandCursor: true,
      });
      qm.on("pointerover", () => {
        hovering = true;
        syncHint();
      });
      qm.on("pointerout", () => {
        hovering = false;
        syncHint();
      });
      // `stopPropagation` keeps a pin-tap from also walking the player through
      // the region it sits on — the two hit areas overlap near the box's foot.
      qm.on(
        "pointerdown",
        (
          _p: Phaser.Input.Pointer,
          _lx: number,
          _ly: number,
          event: Phaser.Types.Input.EventData,
        ) => {
          event.stopPropagation();
          pinnedHint = !pinnedHint;
          syncHint();
        },
      );
    }

    follow();
    this.built.push({ box, parts, pinned: plan.pinned, baseX: plan.baseX, baseY: plan.baseY, follow });
  }

  /**
   * The `[needs: ...]` debug hint for a set of blocking gate ids — `""` if
   * none of them describe. FILTERS rather than asserting: a REFUSED gate
   * blocks but has no parsed rule, and reading one with `!` crashed
   * `render()`. See this file's header.
   */
  private hintFor(blockingGateIds: string[]): string {
    const engine = this.deps.gateEngine();
    if (!engine) return "";
    const described = blockingGateIds
      .map((id) => engine.rules.get(id))
      .filter((rule): rule is GateRule => rule !== undefined)
      .map((rule) => describeGateRule(rule));
    return described.length ? `[needs: ${described.join("; ")}]` : "";
  }

  /** Real `G-*` gate ids still standing between the player and `screenId`. */
  private blockingGatesFor(screenId: string): string[] {
    const engine = this.deps.gateEngine();
    if (!engine) return [];
    const req = this.deps.gates.requirements.get(screenId);
    if (!req) return [];
    return engine.blocking(req.gateIds);
  }
}
