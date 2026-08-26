/**
 * Dropped-item hotspots (satchel-cluster track, 2026-08-23 — Roc: "when
 * something is dropped, it should be placed in the world so it can be picked
 * back up if the player wants to").
 *
 * A sibling of `HotspotSystem`, not a branch inside it: forage dots render
 * what the day's FORAGE DRAW offers (ink-owned, `pickedSlots` bookkeeping,
 * a slot VAR per dot), while these render what `Inventory.droppedOn(screen)`
 * says the player left here (host-owned, no slot behind it). The two kinds
 * share the same visual language — a pulsing dot with a parchment hover
 * card — but none of the state, so a separate small system keeps the
 * contended `HotspotSystem.ts` (T2's region work lands there in parallel)
 * out of this track's blast radius.
 *
 * THE TWO-SIDED RE-PICKUP, same contract as drop (`Inventory.drop`'s
 * header): `commitTakeBack` calls `LanternPlayer.stashPool` (pool-name side
 * — first free satchel pocket, spilling to arms) and
 * `Inventory.pickUpDropped` (item-id side). A pool-less item (a `free`-
 * persistence grant like `item_captured_sound`) has no satchel-array side
 * and takes the host half alone — exactly mirroring how it was carried
 * before the drop (unslotted).
 *
 * A dropped item is always ALREADY DISCOVERED (you held it to drop it), so
 * the hover card never has a "???" variant. No `item:acquired` is emitted on
 * take-back: the gate counters already counted the original acquisition,
 * and re-counting a round trip through the ground would double it.
 */

import Phaser from "phaser";
import type { PlayView } from "@lantern/lib/play";
import type { InkBridge } from "../ink/InkBridge";
import type { Inventory } from "../world/Inventory";
import { poolForItem } from "../world/foragePoolToItem";
import { placeForageHotspot, type SafeBox } from "../world/view/HotspotPlacement";
import type { PanModel } from "../world/view/PanModel";
import { COLOR, FONT, pulse } from "../ui/theme";

const W = 1920;
const H = 1080;

// Same parchment-card geometry family as `HotspotSystem`'s examine card —
// § 14 §5.2 — at the same size, so the two dot kinds read as one system.
const CARD_W = 360;
const CARD_PAD = 22;
const CARD_RADIUS = 12;
const CARD_OFFSET_X = 90;
const CARD_OFFSET_Y = -190;
const CARD_MARGIN = 30;
const HIDE_DELAY_MS = 120;

/** Same "item_x_y" -> "x y" derivation `SatchelPockets.buildPocket` uses. */
function itemLabel(id: string): string {
  return id.replace(/^item_/, "").replace(/^key_/, "").replace(/_/g, " ");
}

export interface DroppedItemDeps {
  readonly scene: Phaser.Scene;
  readonly ink: InkBridge;
  readonly pan: PanModel;
  /** `droppedOn()` to draw, `record()` for the card copy, `pickUpDropped()`
   * as the host half of the take-back — see the class header. */
  readonly inventory: Inventory;
  /** The scene's own HUD-clear placement box — the same one the forage dots
   * use, handed in so the two can never drift apart. */
  readonly safeBox: SafeBox;
}

interface DroppedCard {
  readonly key: string;
  readonly baseX: number;
  readonly baseY: number;
  readonly container: Phaser.GameObjects.Container;
  readonly w: number;
  readonly h: number;
}

export class DroppedItemHotspots {
  private dots: { obj: Phaser.GameObjects.Arc; baseX: number; baseY: number }[] = [];
  private card: DroppedCard | null = null;
  private hideTimer?: Phaser.Time.TimerEvent;

  constructor(private readonly deps: DroppedItemDeps) {}

  sync(v: PlayView, full: boolean): void {
    this.dots.forEach((d) => d.obj.destroy());
    this.dots = [];
    this.destroyCard();
    const screen = v.pos.currentScreen;
    if (!screen) return;

    const { scene, pan, safeBox } = this.deps;
    const dropped = this.deps.inventory.droppedOn(screen);
    for (const [i, itemId] of dropped.entries()) {
      // The seed feeds the same deterministic placement the forage dots use;
      // the index keeps two dropped units of the same item from stacking on
      // one point. Prefixed so a dropped dot can never land exactly on the
      // forage slot that produced the item.
      const key = `dropped:${itemId}:${i}`;
      const { baseX, baseY } = placeForageHotspot(key, safeBox, { width: W, height: H });
      const at = pan.place(baseX, baseY);
      // Dusk-toned, not gold — a thing you already know lying where you left
      // it, visually distinct from the gold "something new is here" offer.
      const dot = scene.add
        .circle(at.x, at.y, 18, COLOR.duskNum, full ? 0.25 : 0.55)
        .setStrokeStyle(3, COLOR.duskNum, full ? 0.4 : 0.9)
        .setDepth(10)
        .setInteractive({ useHandCursor: !full });
      dot.setData("droppedItemId", itemId);
      pulse(scene, dot);
      if (!full) {
        dot.on("pointerover", () => {
          this.cancelHide();
          if (this.card?.key !== key) this.showCard(key, itemId, baseX, baseY, screen);
        });
        dot.on("pointerout", () => this.scheduleHide());
        dot.on("pointerdown", () => {
          // Same first-tap rule as the forage dots: card first, then take.
          if (this.card?.key === key) {
            this.commitTakeBack(itemId, screen);
          } else {
            this.cancelHide();
            this.showCard(key, itemId, baseX, baseY, screen);
          }
        });
      }
      this.dots.push({ obj: dot, baseX, baseY });
    }
  }

  /** Pans in lockstep with the backdrop — called from the scene's `update()`,
   * same as `HotspotSystem.reposition`. */
  reposition(): void {
    for (const d of this.dots) {
      const p = this.deps.pan.place(d.baseX, d.baseY);
      d.obj.setPosition(p.x, p.y);
    }
    if (this.card) {
      const p = this.deps.pan.place(this.card.baseX, this.card.baseY);
      this.positionCard(p.x, p.y);
    }
  }

  // ------------------------------------------------------------------ card

  private cancelHide(): void {
    this.hideTimer?.remove(false);
    this.hideTimer = undefined;
  }

  private scheduleHide(): void {
    this.hideTimer?.remove(false);
    this.hideTimer = this.deps.scene.time.delayedCall(HIDE_DELAY_MS, () => this.destroyCard());
  }

  private destroyCard(): void {
    this.hideTimer?.remove(false);
    this.hideTimer = undefined;
    this.card?.container.destroy();
    this.card = null;
  }

  private positionCard(dotX: number, dotY: number): void {
    if (!this.card) return;
    const { w, h } = this.card;
    const x = Phaser.Math.Clamp(dotX + CARD_OFFSET_X, CARD_MARGIN, W - w - CARD_MARGIN);
    const y = Phaser.Math.Clamp(dotY + CARD_OFFSET_Y, CARD_MARGIN, H - h - CARD_MARGIN);
    this.card.container.setPosition(x, y);
  }

  /** The known-item parchment card — always the known variant (see the class
   * header), with "take back" where the forage card says "take". */
  private showCard(key: string, itemId: string, baseX: number, baseY: number, screen: string): void {
    this.destroyCard();
    const { scene, inventory } = this.deps;
    const record = inventory.record(itemId);
    const name = itemLabel(itemId);
    const desc = `${record?.description ?? "no further detail known."}\n(you dropped this here)`;

    const w = CARD_W;
    const contentW = w - CARD_PAD * 2;
    const container = scene.add.container(0, 0).setDepth(15);

    // Content first, background slotted UNDER it afterwards — container
    // children render in ADD ORDER (the 2026-08-19 lesson), so `.setDepth()`
    // inside the container would do nothing.
    const nm = scene.add.text(CARD_PAD, CARD_PAD, name, {
      fontFamily: FONT.display,
      fontSize: "20px",
      color: COLOR.inkOnCanvas,
      fontStyle: "bold",
      wordWrap: { width: contentW },
    });
    container.add(nm);

    const dsY = CARD_PAD + nm.height + 10;
    const ds = scene.add.text(CARD_PAD, dsY, desc, {
      fontFamily: FONT.display,
      fontSize: "13px",
      color: COLOR.inkSoftOnCanvas,
      fontStyle: "italic",
      wordWrap: { width: contentW },
    });
    container.add(ds);

    const btnW = 168;
    const btnH = 32;
    const btnY = dsY + ds.height + 14;
    this.addTakeButton(container, CARD_PAD, btnY, btnW, btnH, itemId, screen);

    const h = btnY + btnH + CARD_PAD;

    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.35);
    shadow.fillRoundedRect(-4, 6, w + 8, h + 8, CARD_RADIUS + 2);
    container.addAt(shadow, 0);

    const bg = scene.add.graphics();
    bg.fillGradientStyle(COLOR.canvas2Num, COLOR.canvas2Num, COLOR.canvas, COLOR.canvas, 1);
    bg.fillRoundedRect(0, 0, w, h, CARD_RADIUS);
    bg.lineStyle(2, COLOR.canvasEdgeNum, 1);
    bg.strokeRoundedRect(0, 0, w, h, CARD_RADIUS);
    container.addAt(bg, 1);

    const hoverArea = scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.0001);
    hoverArea.setInteractive();
    hoverArea.on("pointerover", () => this.cancelHide());
    hoverArea.on("pointerout", () => this.scheduleHide());
    container.add(hoverArea);

    this.card = { key, baseX, baseY, container, w, h };
    const p = this.deps.pan.place(baseX, baseY);
    this.positionCard(p.x, p.y);
  }

  /** §14 §4.3 on-canvas button, "neutral" kind — the exact shape
   * `SatchelScene.canvasButton` / `HotspotSystem.addTakeButton` ship. */
  private addTakeButton(
    container: Phaser.GameObjects.Container,
    x: number,
    y: number,
    w: number,
    h: number,
    itemId: string,
    screen: string,
  ): void {
    const { scene } = this.deps;
    const cx = x + w / 2;
    const cy = y + h / 2;
    const bg = scene.add.rectangle(cx, cy, w, h, 0x000000, 0.0001).setStrokeStyle(1, COLOR.stitchNum, 0.9);
    container.add(bg);
    const label = scene.add
      .text(cx, cy, "take back — click", { fontFamily: FONT.mono, fontSize: "13px", color: COLOR.inkOnCanvas })
      .setOrigin(0.5);
    container.add(label);

    const enter = () => {
      this.cancelHide();
      bg.setFillStyle(COLOR.goldNum, 0.18);
      bg.setStrokeStyle(1, COLOR.goldNum, 1);
      label.setColor(COLOR.gold);
    };
    const leave = () => {
      this.scheduleHide();
      bg.setFillStyle(0x000000, 0.0001);
      bg.setStrokeStyle(1, COLOR.stitchNum, 0.9);
      label.setColor(COLOR.inkOnCanvas);
    };
    const take = () => this.commitTakeBack(itemId, screen);
    bg.setInteractive({ useHandCursor: true }).on("pointerover", enter).on("pointerout", leave).on("pointerdown", take);
    label.setInteractive({ useHandCursor: true }).on("pointerover", enter).on("pointerout", leave).on("pointerdown", take);
  }

  /**
   * The two-sided take-back — see the class header. Order matters: the
   * satchel side can REFUSE (satchel and arms both full), and on a refusal
   * the item must stay on the ground, so the host half only runs once the
   * pool half has landed (or the item has no pool half at all).
   */
  private commitTakeBack(itemId: string, screen: string): void {
    const { ink, inventory } = this.deps;
    this.destroyCard();
    const pool = poolForItem(itemId);
    if (pool) {
      const stashed = ink.player.stashPool(pool);
      if (!stashed) {
        ink.refresh(); // surface the "both full" transcript line
        return;
      }
    }
    inventory.pickUpDropped(screen, itemId);
    ink.refresh();
  }
}
