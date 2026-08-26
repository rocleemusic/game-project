/**
 * Cast-on-a-thing markers (mode5 plan Track 1 — "Option B"): sibling to
 * `HotspotSystem`, same lifecycle, but for RECEIVERS, not forage. Without
 * this, mode 5 can only cast on the hardcoded `dry_hedge` — no authored gate
 * can be cleared in play (F8's heated-stone chain, the Cave's glimmer
 * target). This draws one clickable marker per castable target; clicking
 * opens the spell picker pre-targeted at it.
 *
 * Castable targets = static `screen.receivers` (authored, e.g. F8's
 * river_stone/heated_stone/stone_wall) UNION whatever
 * `Inventory.worldItemsOn` has there right now — a spell that mints a world
 * item becomes castable the moment it lands, with no extra authoring per
 * product.
 *
 * THE APPROACH (Roc, playtest 2026-08-18): a screen's own gate is what locks
 * IT, so the player can never actually stand on F8 to see F8's receivers —
 * `G-F8-combine` blocks entry to F8 itself. The chain has to be castable
 * from F5, the one screen with the still-locked "[Go to Heart of the Wood]"
 * choice, which is exactly what the graph's own note says ("the approach
 * hosts the three cast receivers"). So this also unions in the receivers of
 * any screen the CURRENT view offers a still-locked move choice toward.
 * Each target remembers which screen it's actually scoped to (`screenId`)
 * so a cast made from the approach still books its world-item production
 * against the target screen, not the screen the player is physically on —
 * that is what lets `heated_stone` show up for `temper` after `ignite`.
 *
 * Marker style is DELIBERATELY not `HotspotSystem`'s gold dot (Roc: "pick
 * up" and "cast on" must not look alike) — a bordered dusk diamond instead
 * of a filled gold circle.
 */

import Phaser from "phaser";
import type { PlayView } from "@lantern/lib/play";
import type { Run } from "../ink/loadRun";
import type { Inventory } from "../world/Inventory";
import type { Gates } from "../world/Gates";
import type { GateEngine } from "../world/gates/GateEngine";
import { placeForageHotspot, type SafeBox } from "../world/view/HotspotPlacement";
import type { PanModel } from "../world/view/PanModel";
import { COLOR, pulse } from "../ui/theme";

const W = 1920;
const H = 1080;

export interface ReceiverHotspotDeps {
  readonly scene: Phaser.Scene;
  readonly inventory: Inventory;
  readonly pan: PanModel;
  readonly graph: Run["graph"];
  readonly safeBox: SafeBox;
  readonly gates: Gates;
  /** Live — `startGates()` may construct it after this class does. */
  readonly gateEngine: () => GateEngine | null;
  /** Marker clicked — opens the picker pre-targeted at this receiver id,
   * scoped to the screen it actually belongs to (see `CastTarget.screenId`). */
  readonly onCastOn: (receiverId: string, label: string, screenId: string) => void;
}

export interface CastTarget {
  readonly id: string;
  /** The screen this target's world-item bookkeeping is scoped to — may
   * differ from the screen the player is standing on. See "THE APPROACH". */
  readonly screenId: string;
}

/** `[Go to <name>]` / `[Begin at <name>]` -> `<name>` — same parse as
 * `TraversalRow`'s own `moveTarget` (kept local: two tiny regexes duplicated
 * is cheaper than a coupling neither class otherwise needs). */
function moveTargetName(display: string): string {
  const m = /(?:Go to|Begin at)\s+(.+?)\]?$/.exec(display.replace(/^\[|\]$/g, ""));
  return m ? m[1].trim() : "";
}

/**
 * Screen ids the current view offers a move choice toward that are STILL
 * locked — "the approach". Pure given the resolved facts, so it's testable
 * without ink, `Gates`, or `GateEngine`.
 */
export function approachScreens(
  moveChoiceDisplays: readonly string[],
  screenIdForName: (name: string) => string | undefined,
  blocking: (screenId: string) => readonly string[],
): string[] {
  const ids: string[] = [];
  for (const display of moveChoiceDisplays) {
    const id = screenIdForName(moveTargetName(display));
    if (id && blocking(id).length > 0) ids.push(id);
  }
  return ids;
}

/**
 * Pure — the union rule, testable with no Phaser. `screenIds` is the current
 * screen plus whatever `approachScreens` found; `worldItemsOn` is
 * `Inventory.worldItemsOn` (handed in rather than the whole `Inventory`).
 */
export function castTargetsFor(
  screens: readonly { screen_id: string; receivers?: string[] }[],
  screenIds: readonly string[],
  worldItemsOn: (screen: string) => readonly string[],
): CastTarget[] {
  const out: CastTarget[] = [];
  const seen = new Set<string>();
  for (const screenId of screenIds) {
    const spec = screens.find((s) => s.screen_id === screenId);
    for (const id of [...(spec?.receivers ?? []), ...worldItemsOn(screenId)]) {
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ id, screenId });
    }
  }
  return out;
}

/** "river_stone" -> "river stone" — the only label authoring gives us. */
function labelFor(receiverId: string): string {
  return receiverId.replace(/_/g, " ");
}

export class ReceiverHotspots {
  private markers: { obj: Phaser.GameObjects.Rectangle; baseX: number; baseY: number }[] = [];

  constructor(private readonly deps: ReceiverHotspotDeps) {}

  sync(v: PlayView): void {
    this.markers.forEach((m) => m.obj.destroy());
    this.markers = [];
    const screen = v.pos.currentScreen;
    if (!screen) return;

    const { scene, pan, inventory, graph, safeBox, gates, gateEngine, onCastOn } = this.deps;
    const moveDisplays = v.choices.filter((c) => c.kind === "move").map((c) => c.display);
    const approach = approachScreens(
      moveDisplays,
      (name) => gates.screenIdForName(name),
      (screenId) => gateEngine()?.blocking(gates.requirements.get(screenId)?.gateIds ?? []) ?? [],
    );
    const targets = castTargetsFor(graph.screens ?? [], [screen, ...approach], (s) => inventory.worldItemsOn(s));

    for (const t of targets) {
      const { baseX, baseY } = placeForageHotspot(`receiver:${t.id}`, safeBox, { width: W, height: H });
      const at = pan.place(baseX, baseY);
      const marker = scene.add
        .rectangle(at.x, at.y, 30, 30, COLOR.duskNum, 0.22)
        .setStrokeStyle(3, COLOR.duskNum, 0.9)
        .setAngle(45)
        .setDepth(10)
        .setInteractive({ useHandCursor: true });
      pulse(scene, marker);
      marker.on("pointerover", () => marker.setScale(1.2));
      marker.on("pointerout", () => marker.setScale(1));
      marker.on("pointerdown", () => onCastOn(t.id, labelFor(t.id), t.screenId));
      this.markers.push({ obj: marker, baseX, baseY });
    }
  }

  /** Called from the scene's `update()` to keep markers panning in lockstep
   * with the backdrop — same as `HotspotSystem.reposition`. */
  reposition(): void {
    for (const m of this.markers) {
      const p = this.deps.pan.place(m.baseX, m.baseY);
      m.obj.setPosition(p.x, p.y);
    }
  }
}
