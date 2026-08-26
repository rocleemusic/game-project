/**
 * Responsibility 3 out of `CollectScene`, extracted verbatim
 * (`plans/2026-08-17-mode5-srp-merge-plan.md`, step 6): `drawSatchel`,
 * `effectiveSatchel`, `syncInventory`.
 *
 * `effectiveSatchel`/`syncInventory` are read by more than the strip itself —
 * `CollectScene.render()`'s header text and `HotspotSystem.sync()`'s "full"
 * check both need the same number — so both stay PUBLIC methods here rather
 * than folding into `draw()`, exactly as they were public-in-effect (private
 * but scene-internally called from several places) before this extraction.
 *
 * Built fresh each life in `init()`, same as `HotspotSystem`/`NpcTalkSystem`
 * — it holds a reference to `Inventory`, which is rebuilt every life too.
 */

import Phaser from "phaser";
import type { PlayView } from "@lantern/lib/play";
import type { InkBridge } from "../ink/InkBridge";
import type { Inventory } from "../world/Inventory";
import { effectiveSatchel, reJoinInto } from "../world/SatchelLedger";
import { COLOR, FONT } from "../ui/theme";

export interface SatchelStripDeps {
  readonly scene: Phaser.Scene;
  readonly ink: InkBridge;
  readonly inventory: Inventory;
  readonly viewHeight: number;
}

export class SatchelStrip {
  private strip: Phaser.GameObjects.GameObject[] = [];

  constructor(private readonly deps: SatchelStripDeps) {}

  /**
   * Ink's satchel minus what the host has genuinely spent — the arithmetic
   * itself lives in `world/SatchelLedger.ts` (Wave 1 extraction), which is
   * where the reasoning and the invariant are written down.
   */
  effectiveSatchel(rawSatchel: string[]): string[] {
    return effectiveSatchel(this.deps.inventory, rawSatchel);
  }

  /**
   * Every CARRIED item — satchel + arms — real-satchel-first. Recomputed
   * each render; idempotent.
   *
   * `v.banked` is deliberately excluded (Roc's ruling, 2026-08-24): banked
   * items live at Home, not on the player. Joining them into `held` here
   * used to leak them into the satchel UI as phantom "extras"
   * (`SatchelScene.ts`'s `extraHeldIds`, built from `Inventory.availableOn`)
   * and made them falsely castable-with from `availableOn()` on ANY screen,
   * not just at home. Home's own banked-item UI (`HubScene`/`Decor`) reads
   * `v.banked` directly and does not go through `Inventory`.
   */
  syncInventory(v: PlayView): void {
    reJoinInto(this.deps.inventory, [...this.effectiveSatchel(v.satchel), ...v.arms]);
  }

  draw(v: PlayView): void {
    this.strip.forEach((o) => o.destroy());
    this.strip = [];

    const { scene, ink, viewHeight: H } = this.deps;
    const satchel = this.effectiveSatchel(v.satchel);
    const parts = [`Satchel ${satchel.length}/${v.satchelCapacity}`];
    if (satchel.length) parts.push(satchel.join(", "));
    if (v.arms.length) parts.push(`Arms ${v.arms.length}/${v.armsCapacity}: ${v.arms.join(", ")}`);
    if (v.banked.length) parts.push(`Banked ${v.banked.length}`);

    this.strip.push(
      scene.add
        .text(40, H - 70, parts.join("  ·  "), {
          fontFamily: FONT.mono,
          fontSize: "21px",
          color: v.arms.length ? COLOR.gold : COLOR.ink,
        })
        .setDepth(20),
    );

    if (v.arms.length) {
      const btn = scene.add
        .text(40, H - 34, "[ pack-triage: go home now and keep what is in your arms ]", {
          fontFamily: FONT.mono,
          fontSize: "20px",
          color: COLOR.onAccent,
          backgroundColor: COLOR.gold,
          padding: { x: 10, y: 6 },
        })
        .setDepth(20)
        .setInteractive({ useHandCursor: true });
      btn.on("pointerdown", () => {
        ink.player.packTriage();
        ink.runToChoice();
      });
      this.strip.push(btn);
    }
  }
}
