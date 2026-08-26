/**
 * Responsibility 2 out of `CollectScene`, extracted verbatim
 * (`plans/2026-08-17-mode5-srp-merge-plan.md`, step 5): `drawHotspots`.
 *
 * Replaces the old labeled forage chips (Roc, 2026-08-13): a hotspot shows
 * only that *something* is here, not what — clicking it is the surprise. One
 * hotspot per slot the day's forage draw offers, placed at a stable seeded
 * position (`world/view/HotspotPlacement.ts`) so it doesn't jump around on
 * every re-render, removed for good once clicked, via ink's own
 * `pickedSlots` bookkeeping.
 *
 * Owns its own `Forage`, built directly on `deps.graph` — `screen-specs.json`
 * authors real `item_id`s in every `forage` array now (Task 1, 2026-08-23
 * reconciliation), so there is nothing left to layer on client-side.
 * `collectExtraForage.ts` and its client-side T4/F7/F8 pool additions are
 * gone (Task 3, T19) — those pools are real, authored entries now. `offer()`
 * needs the graph at construction, so — unlike `BackdropSystem` — this is
 * built FRESH EACH LIFE in `init()`, the same pattern as
 * `Inventory`/`Knowledge`/`NpcTalkSystem`. The guaranteed pool (`["item_sticks"]`
 * for mode5, `["item_berry"]` for daylife) comes from `mode.forage
 * .guaranteedPools` — see `ModeDescriptor.ts` — not a local hardcode.
 *
 * WHAT THIS DOES NOT OWN. Whether the satchel/arms are full — that is
 * responsibility 3 ("satchel"), not yet extracted; `sync()` takes `full` as
 * an argument rather than computing it, so this file never reaches for
 * `Inventory` for THAT. Placement stays inside the `HOTSPOT_SAFE_X/Y` box the
 * scene computes from its own HUD layout, handed in as `safeBox` rather than
 * duplicated here, so the two can never drift apart.
 *
 * THE EXAMINE CARD (mode5 UX wireframe §1, 2026-08-22 fix — see
 * `phaser/tools/screen-flow/mockups/mode5-ux-flow-wireframe.html#pickup`).
 * Hover (or a first tap on touch) no longer fires the pickup directly — it
 * shows a parchment card first. `Inventory.discoveredIds()` decides what the
 * card is allowed to say: an item type never held before shows "???" and a
 * withheld description; one held before (any time, any screen — `everHeld`
 * never shrinks, see `Inventory.ts`) shows its real name and its real
 * `content/items/*.json` description, read through `Inventory.record()`.
 * Committing the pickup — clicking the hotspot itself once its card is
 * already showing — is unchanged from before: `ink.player.pickup()` +
 * `ink.refresh()` + the `item:acquired` bus event, all in `commitPickup()`.
 * The card's own `show`/`hide` never touches ink state — the reveal is
 * read-only, the take is the only mutation. The card itself draws no take
 * control of its own (Roc, 2026-08-23 review notes) — it is purely the
 * examine reveal; the click that takes the item always lands on the dot.
 *
 * EXAMINE REGIONS (Roc, 2026-08-23, review notes 42 + 43). A second kind of
 * hotspot now lives here: the authored examine regions from `regions.json`.
 * They were drawable in edit mode and dead everywhere else — "edit mode sets
 * regions but then the regions are not actually hoverable or clickable. They
 * should react in the same way that items do, and the description will just
 * be in the hover tooltip." So they live in THIS file rather than a new one:
 * they are a hover-tooltip-plus-pan-repositioning hotspot, which is exactly
 * what this class already is, and sharing `reposition()` is what keeps them in
 * lockstep with the forage dots and the backdrop.
 *
 * Three rules from that note, none of them the forage dot's rules:
 *   - HOVER MARKS IT SEEN, after a one-second dwell (`REGION_SEEN_DWELL_MS`).
 *     Passing the pointer across a box on the way somewhere else is not
 *     looking at it.
 *   - CLICK DISMISSES THE TOOLTIP AND NOTHING ELSE. It does not remove the
 *     region, does not consume it, and does not touch ink — "click will not
 *     remove the region." Move the pointer off and back and it reads again.
 *   - THE TOOLTIP FOLLOWS THE CURSOR, unlike the forage examine card which is
 *     pinned to its dot. A region can be the size of a barn door; a card
 *     pinned to its centre would sit nowhere near what the pointer is on.
 *
 * Region geometry is a fraction OF THE PICTURE, not of the canvas — see
 * `PanModel.pictureWidth`. That is note 43, and it is why these boxes take
 * their size from `pan.pictureWidth/pictureHeight` and their position from
 * `pan.place()` every frame.
 */

import Phaser from "phaser";
import type { PlayView } from "@lantern/lib/play";
import type { InkBridge } from "../ink/InkBridge";
import type { RegionMap, Run } from "../ink/loadRun";
import type { Inventory } from "../world/Inventory";
import { Forage, type ForageSlot } from "../world/Forage";
import { placeForageHotspot, planRegionHotspots, type SafeBox } from "../world/view/HotspotPlacement";
import type { PanModel } from "../world/view/PanModel";
import { itemForPool } from "../world/foragePoolToItem";
import type { GameEventBus } from "../world/events/GameEvents";
import { COLOR, FONT, pulse } from "../ui/theme";

const W = 1920;
const H = 1080;
const DIM = COLOR.muted;

// Examine card geometry — §14 §5.2 "Parchment card" (12px radius, canvasEdge
// border, soft drop shadow). No on-canvas take button (Roc, 2026-08-23
// review notes: cut it) — taking the item is the same click on the hotspot
// dot itself that showed the card, not a control drawn on the tooltip.
const CARD_W = 360;
const CARD_PAD = 22;
const CARD_RADIUS = 12;
/** Offset from the pointer's current screen position to the card's top-left —
 * just above and slightly right of the cursor, so the card tracks pointer
 * movement rather than staying pinned to the dot (Roc, 2026-08-23 review
 * notes: "item hover doesn't track the cursor well"). Clamped on-screen in
 * `positionExamine`. */
const CARD_OFFSET_X = 20;
const CARD_OFFSET_Y_GAP = 18;
const CARD_MARGIN = 30;
/** Grace window between leaving the dot and losing the card, so a brief slip
 * off the hotspot while the card is being read doesn't instantly drop it —
 * the dot and the card are two separate interactive objects with a gap
 * between them, not one hit area. */
const HIDE_DELAY_MS = 120;

// Examine regions ---------------------------------------------------------
/** How long the pointer must rest on a region before the player has "seen"
 * it (Roc: "hovering over one second will mean that the player has seen
 * it"). Crossing a box on the way elsewhere is not looking at it. */
const REGION_SEEN_DWELL_MS = 1000;
/** Idle fill/stroke for an unseen region box, and the hover lift. Kept low —
 * a region is a place in a painting, not a button. */
const REGION_FILL = 0.1;
const REGION_FILL_HOVER = 0.24;
const REGION_STROKE = 0.55;
/** A region already seen recedes rather than disappearing: it stays
 * examinable (click never removes it), it just stops asking. */
const REGION_FILL_SEEN = 0.04;
const REGION_STROKE_SEEN = 0.28;
/** Tooltip geometry — the same parchment language as the examine card, at a
 * smaller weight, offset just above/right of the cursor it follows. */
const TIP_W = 300;
const TIP_PAD = 16;
const TIP_OFFSET_X = 18;
const TIP_OFFSET_Y = -14;

export interface HotspotDeps {
  readonly scene: Phaser.Scene;
  readonly ink: InkBridge;
  readonly bus: GameEventBus;
  readonly pan: PanModel;
  readonly graph: Run["graph"];
  /** Read-only here — `discoveredIds()` for the mystery/known split,
   * `record()` for the real name/description once known. Never mutated by
   * this file; the only mutation is `commitPickup`'s `ink.player.pickup`. */
  readonly inventory: Inventory;
  /** Screen-absolute box a hotspot is allowed to land in — the scene's own
   * HUD layout, so the fallback pill row and the top bar stay clear. */
  readonly safeBox: SafeBox;
  /** `run.regions` — the authored examine geometry, read-only. Declared ids
   * come off `graph` (already a dependency here), so the scene hands over one
   * more field rather than a second pre-resolved list that could drift from
   * the one edit mode draws. */
  readonly regions: RegionMap;
  /**
   * Fired after a COMMITTED forage pickup of an item TYPE never held before
   * (satchel-cluster track, 2026-08-23 — Roc: "on pickup of an item that the
   * player has not seen before, it should pop open the satchel so we can see
   * its description"). `CollectScene` wires it to open `SatchelScene`
   * focused on the new item. Known-item and refused (both-full) pickups
   * never fire it.
   */
  readonly onFirstPickup?: (itemId: string) => void;
  /** `mode.forage.guaranteedPools` — the item ids the day's draw always
   * includes, per `ModeDescriptor.ts`. No default here; the mode is the only
   * source of truth for what "guaranteed" means in a given mode. */
  readonly guaranteedPools: readonly string[];
}

interface RegionSpot {
  readonly id: string;
  readonly label: string;
  readonly box: Phaser.GameObjects.Rectangle;
  readonly baseX: number;
  readonly baseY: number;
  /** Cleared on pointerout — a click hides the tooltip for as long as the
   * pointer stays on the box, and only that long. */
  dismissed: boolean;
}

interface ExamineCard {
  readonly slotId: string;
  readonly container: Phaser.GameObjects.Container;
  readonly w: number;
  readonly h: number;
}

/** Same "item_x_y" -> "x y" derivation `SatchelPockets.buildPocket` uses for
 * its own pocket label. Kept local rather than imported — it's a one-line
 * string transform, not shared state, and importing it would couple a
 * hotspot's examine card to the satchel module for that alone. */
function itemLabel(id: string): string {
  return id.replace(/^item_/, "").replace(/_/g, " ");
}

export class HotspotSystem {
  private readonly forage: Forage;
  private hotspots: { obj: Phaser.GameObjects.Arc; baseX: number; baseY: number }[] = [];
  private status?: Phaser.GameObjects.Text;
  private examine: ExamineCard | null = null;
  private hideTimer?: Phaser.Time.TimerEvent;
  private regionSpots: RegionSpot[] = [];
  private regionTip?: Phaser.GameObjects.Container;
  private dwellTimer?: Phaser.Time.TimerEvent;
  /** `screen:regionId` the player has actually rested on. Host-side and
   * per-life, exactly like `Knowledge`'s own seen/learned split — nothing in
   * ink models "looked at this rock." */
  private readonly seenRegions = new Set<string>();

  constructor(private readonly deps: HotspotDeps) {
    this.forage = new Forage(deps.graph, deps.guaranteedPools);
  }

  /** Slots still offered and not yet picked — shared by `sync()` and the
   * walker probe, which used to duplicate this same filter inline. */
  offeredSlots(
    screen: string,
    day: number,
    timeBlock: string,
    pickedSlots: readonly string[],
  ): ForageSlot[] {
    return this.forage
      .offer(screen, day, timeBlock)
      .filter((slot) => !pickedSlots.includes(slot.slotId));
  }

  sync(v: PlayView, full: boolean): void {
    this.hotspots.forEach((h) => h.obj.destroy());
    this.hotspots = [];
    this.status?.destroy();
    this.status = undefined;
    this.destroyExamine();
    const screen = v.pos.currentScreen;
    // Regions come FIRST and are not gated on the forage draw — an examinable
    // is a fact about the painting, not about what happens to be growing here
    // today. They used to be drawn only by edit mode, which is the bug.
    this.syncRegions(screen);
    if (!screen) return;

    const offered = this.offeredSlots(screen, v.day, v.timeBlock, v.pickedSlots);
    if (!offered.length) return;

    const { scene, pan, safeBox } = this.deps;
    this.status = scene.add
      .text(
        40,
        H - 222,
        full ? "something's out there (satchel and arms full)" : "something's out there",
        // A sentence the world says, not a HUD readout — display (§14 §2).
        { fontFamily: FONT.display, fontSize: "20px", color: DIM },
      )
      .setDepth(20);

    for (const slot of offered) {
      const { baseX, baseY } = placeForageHotspot(slot.slotId, safeBox, { width: W, height: H });

      const at = pan.place(baseX, baseY);
      const dot = scene.add
        .circle(at.x, at.y, 22, COLOR.goldNum, full ? 0.25 : 0.55)
        .setStrokeStyle(3, COLOR.goldNum, full ? 0.4 : 0.9)
        .setDepth(10)
        .setInteractive({ useHandCursor: !full });
      // Tagged for headless/probe correlation (`window.__collect.forage()`
      // reports the same `slotId`) — a dot carries no other way to identify
      // which offered slot it renders.
      dot.setData("slotId", slot.slotId);
      pulse(scene, dot);
      if (!full) {
        // Read position off `scene.input.activePointer` rather than the
        // event's own pointer argument — a synthetic `dot.emit("pointerover")`
        // (headless probes, `pickup-examine.mjs`) carries no pointer arg, and
        // this stays correct for real pointer events too since Phaser keeps
        // `activePointer` current on every move.
        dot.on("pointerover", () => {
          this.cancelHide();
          const p = scene.input.activePointer;
          if (this.examine?.slotId !== slot.slotId) this.showExamine(slot, p.x, p.y);
        });
        // Keeps the card tracking the cursor while the pointer is still over
        // the dot itself — `positionExamine` re-clamps on every move.
        dot.on("pointermove", () => {
          if (this.examine?.slotId === slot.slotId) {
            const p = scene.input.activePointer;
            this.positionExamine(p.x, p.y);
          }
        });
        dot.on("pointerout", () => this.scheduleHide());
        dot.on("pointerdown", () => {
          // Card already showing for THIS slot -> the click is the take —
          // the same click/interact path as before, unchanged by the hover
          // card no longer drawing its own take button.
          // Otherwise this is the "first tap" (touch has no hover) -> show
          // the card and stop; the click no longer bypasses it.
          if (this.examine?.slotId === slot.slotId) {
            this.commitPickup(slot, screen);
          } else {
            this.cancelHide();
            this.showExamine(slot, at.x, at.y);
          }
        });
      }
      this.hotspots.push({ obj: dot, baseX, baseY });
    }
  }

  /** Called from the scene's `update()` to keep hotspots panning in
   * lockstep with the backdrop. */
  reposition(): void {
    for (const h of this.hotspots) {
      const p = this.deps.pan.place(h.baseX, h.baseY);
      h.obj.setPosition(p.x, p.y);
    }
    // Regions ride the SAME offset as the backdrop, which is the whole point:
    // a region is a place in the picture, so it must travel with the picture.
    for (const r of this.regionSpots) {
      const p = this.deps.pan.place(r.baseX, r.baseY);
      r.box.setPosition(p.x, p.y);
    }
    // The examine card is NOT repositioned here — it tracks the pointer
    // (`pointermove` above), not the backdrop pan. Panning while a card is
    // open is not the interaction Roc's note was about.
  }

  // ---------------------------------------------------------------- regions

  /** Which regions the player has rested on this life, `screen:regionId` —
   * read by tests and the walker probe; nothing writes it but the dwell. */
  seenRegionKeys(): string[] {
    return [...this.seenRegions].sort();
  }

  /**
   * Draw every AUTHORED region on this screen as a hoverable box.
   *
   * Shaped only. The unshaped fallback pill row that keeps 19 of 20 screens
   * playable (`HotspotPlacement`'s header) belongs to `ScreenScene` and stays
   * there — mode5's bottom band is already carrying the forage status line,
   * the satchel strip and the choices row, and 19 gold pills across it would
   * bury all three. Authoring the missing geometry is the actual fix, and
   * that is the job this editor bug was blocking.
   */
  private syncRegions(screen: string | null): void {
    this.destroyRegionTip();
    this.regionSpots.forEach((r) => r.box.destroy());
    this.regionSpots = [];
    if (!screen) return;

    const { scene, pan, graph, regions } = this.deps;
    const spec = graph.screens?.find((s) => s.screen_id === screen);
    const declared = (spec?.regions ?? []).map((r) => r.region_id);
    // The examinable is what the region MEANS; the region id is only where it
    // is. `stageExaminables` in lantern joins them the same way.
    const labelFor = new Map(
      (spec?.examinables ?? []).map((ex) => [ex.region, ex.id.replace(/_/g, " ")]),
    );
    const picture = { width: pan.pictureWidth, height: pan.pictureHeight };
    const plan = planRegionHotspots(regions[screen] ?? {}, declared, { width: W, height: H }, picture);

    for (const p of plan) {
      if (!p.shaped) continue;
      const at = pan.place(p.baseX, p.baseY);
      const seen = this.seenRegions.has(`${screen}:${p.id}`);
      const box = scene.add
        .rectangle(at.x, at.y, p.width, p.height, COLOR.goldNum, seen ? REGION_FILL_SEEN : REGION_FILL)
        .setStrokeStyle(2, COLOR.goldNum, seen ? REGION_STROKE_SEEN : REGION_STROKE)
        .setDepth(9)
        .setInteractive({ useHandCursor: true });
      box.setData("regionId", p.id);
      const spot: RegionSpot = {
        id: p.id,
        label: labelFor.get(p.id) ?? p.id.replace(/^r_/, "").replace(/_/g, " "),
        box,
        baseX: p.baseX,
        baseY: p.baseY,
        dismissed: false,
      };
      box.on("pointerover", (pointer: Phaser.Input.Pointer) => this.enterRegion(spot, screen, pointer));
      box.on("pointermove", (pointer: Phaser.Input.Pointer) => {
        if (this.regionTip) this.positionRegionTip(pointer.x, pointer.y);
      });
      box.on("pointerout", () => this.leaveRegion(spot, screen));
      // THE CLICK. Hides the tooltip and stops — no pickup, no ink, and the
      // box itself survives (Roc: "click will not remove the region").
      box.on("pointerdown", () => {
        spot.dismissed = true;
        this.destroyRegionTip();
      });
      this.regionSpots.push(spot);
    }
  }

  private enterRegion(spot: RegionSpot, screen: string, pointer: Phaser.Input.Pointer): void {
    const key = `${screen}:${spot.id}`;
    spot.box.setFillStyle(COLOR.goldNum, REGION_FILL_HOVER);
    spot.box.setStrokeStyle(2, COLOR.goldNum, 1);
    if (!spot.dismissed) this.showRegionTip(spot, this.seenRegions.has(key), pointer);
    this.dwellTimer?.remove(false);
    if (this.seenRegions.has(key)) return;
    // The dwell, not the entry, is what counts as having looked.
    this.dwellTimer = this.deps.scene.time.delayedCall(REGION_SEEN_DWELL_MS, () => {
      this.seenRegions.add(key);
      this.dwellTimer = undefined;
      if (!spot.box.active) return;
      if (this.regionTip && !spot.dismissed) this.showRegionTip(spot, true, pointer);
    });
  }

  private leaveRegion(spot: RegionSpot, screen: string): void {
    this.dwellTimer?.remove(false);
    this.dwellTimer = undefined;
    // A dismissal only lasts while the pointer stays put — step off and the
    // region reads again next time, because nothing was consumed.
    spot.dismissed = false;
    const seen = this.seenRegions.has(`${screen}:${spot.id}`);
    spot.box.setFillStyle(COLOR.goldNum, seen ? REGION_FILL_SEEN : REGION_FILL);
    spot.box.setStrokeStyle(2, COLOR.goldNum, seen ? REGION_STROKE_SEEN : REGION_STROKE);
    this.destroyRegionTip();
  }

  private destroyRegionTip(): void {
    this.regionTip?.destroy();
    this.regionTip = undefined;
  }

  /**
   * The hover tooltip — the parchment language of the examine card, smaller,
   * and following the cursor rather than pinned to the box.
   *
   * There is no authored prose for an examinable anywhere in the run data
   * (`graph.json` carries an id, a clue tier and a region, and nothing that
   * reads as a sentence), so this says what is actually known and no more.
   * When examine prose exists it drops into `desc` and nothing else moves.
   */
  private showRegionTip(spot: RegionSpot, seen: boolean, pointer: Phaser.Input.Pointer): void {
    this.destroyRegionTip();
    const { scene } = this.deps;
    const desc = seen ? "you have had a good look at this." : "worth a closer look.";
    const container = scene.add.container(0, 0).setDepth(16);

    const nm = scene.add.text(TIP_PAD, TIP_PAD, spot.label, {
      fontFamily: FONT.display,
      fontSize: "19px",
      color: COLOR.inkOnCanvas,
      fontStyle: "bold",
      wordWrap: { width: TIP_W - TIP_PAD * 2 },
    });
    container.add(nm);
    const ds = scene.add.text(TIP_PAD, TIP_PAD + nm.height + 8, desc, {
      fontFamily: FONT.display,
      fontSize: "13px",
      color: COLOR.inkSoftOnCanvas,
      fontStyle: "italic",
      wordWrap: { width: TIP_W - TIP_PAD * 2 },
    });
    container.add(ds);

    const h = TIP_PAD + nm.height + 8 + ds.height + TIP_PAD;
    const bg = scene.add.graphics();
    bg.fillStyle(0x000000, 0.35);
    bg.fillRoundedRect(-3, 5, TIP_W + 6, h + 6, CARD_RADIUS);
    bg.fillGradientStyle(COLOR.canvas2Num, COLOR.canvas2Num, COLOR.canvas, COLOR.canvas, 1);
    bg.fillRoundedRect(0, 0, TIP_W, h, CARD_RADIUS);
    bg.lineStyle(2, COLOR.canvasEdgeNum, 1);
    bg.strokeRoundedRect(0, 0, TIP_W, h, CARD_RADIUS);
    // Children render in ADD ORDER inside a container, so the background has
    // to be slotted UNDER the text rather than depth-sorted behind it — the
    // same 2026-08-19 lesson the examine card's own header records.
    container.addAt(bg, 0);
    container.setSize(TIP_W, h);

    this.regionTip = container;
    this.positionRegionTip(pointer.x, pointer.y);
  }

  /** Just above and right of the cursor, clamped on-screen. */
  private positionRegionTip(pointerX: number, pointerY: number): void {
    if (!this.regionTip) return;
    const h = this.regionTip.height;
    const x = Phaser.Math.Clamp(pointerX + TIP_OFFSET_X, CARD_MARGIN, W - TIP_W - CARD_MARGIN);
    const y = Phaser.Math.Clamp(pointerY + TIP_OFFSET_Y - h, CARD_MARGIN, H - h - CARD_MARGIN);
    this.regionTip.setPosition(x, y);
  }

  // ---------------------------------------------------------------- examine

  private cancelHide(): void {
    this.hideTimer?.remove(false);
    this.hideTimer = undefined;
  }

  private scheduleHide(): void {
    this.hideTimer?.remove(false);
    this.hideTimer = this.deps.scene.time.delayedCall(HIDE_DELAY_MS, () => this.destroyExamine());
  }

  private destroyExamine(): void {
    this.hideTimer?.remove(false);
    this.hideTimer = undefined;
    this.examine?.container.destroy();
    this.examine = null;
  }

  /** Just above and slightly right of the pointer, clamped on-screen — the
   * same "follows the cursor" language `positionRegionTip` already uses for
   * region tooltips. */
  private positionExamine(pointerX: number, pointerY: number): void {
    if (!this.examine) return;
    const { w, h } = this.examine;
    const x = Phaser.Math.Clamp(pointerX + CARD_OFFSET_X, CARD_MARGIN, W - w - CARD_MARGIN);
    const y = Phaser.Math.Clamp(pointerY - h - CARD_OFFSET_Y_GAP, CARD_MARGIN, H - h - CARD_MARGIN);
    this.examine.container.setPosition(x, y);
  }

  /**
   * Builds the parchment examine card for one hotspot. `known` is read off
   * `Inventory.discoveredIds()` at SHOW time, per item TYPE — the same "ever
   * held" set the Home Hub decoration palette already reads (per-item-type,
   * permanent, not per-hotspot, per-screen). `itemForPool` can return `null`
   * for an unjoined pool name (GAPS.md G13) — that case reads the same as
   * "never discovered," which is honest: nothing IS known about it yet.
   *
   * NO TAKE BUTTON HERE (Roc, 2026-08-23 review notes: cut the take-click
   * button drawn inside the hover card). Taking the item goes through the
   * existing click/interact path unchanged — clicking the hotspot dot while
   * its card is already showing, handled in `sync()`'s `pointerdown` — not a
   * button drawn on the tooltip itself.
   */
  private showExamine(slot: ForageSlot, pointerX: number, pointerY: number): void {
    this.destroyExamine();
    const { scene, inventory } = this.deps;
    const itemId = itemForPool(slot.item);
    const known = !!itemId && inventory.discoveredIds().includes(itemId);
    const record = itemId ? inventory.record(itemId) : undefined;
    const name = known && itemId ? itemLabel(itemId) : "???";
    const desc = known
      ? record?.description ?? "no further detail known."
      : "not sure what this is — pick it up to find out";

    const w = CARD_W;
    const contentW = w - CARD_PAD * 2;
    const container = scene.add.container(0, 0).setDepth(15);

    // Content is built first — the card's height depends on the wrapped
    // description's actual rendered height, so the background can't be sized
    // until after. `container.addAt(..., i)` below then slots the background
    // and shadow BEHIND this already-added content — children render in ADD
    // ORDER (2026-08-19 lesson), so `.setDepth()` inside the container would
    // do nothing here.
    const nm = scene.add.text(known ? CARD_PAD : w / 2, CARD_PAD, name, {
      fontFamily: FONT.display,
      fontSize: known ? "20px" : "24px",
      color: known ? COLOR.inkOnCanvas : COLOR.inkSoftOnCanvas,
      fontStyle: "bold",
      align: known ? "left" : "center",
      letterSpacing: known ? 0 : 3,
      wordWrap: { width: contentW },
    });
    nm.setOrigin(known ? 0 : 0.5, 0);
    container.add(nm);

    const dsY = CARD_PAD + nm.height + 10;
    const ds = scene.add.text(known ? CARD_PAD : w / 2, dsY, desc, {
      fontFamily: FONT.display,
      fontSize: "13px",
      color: COLOR.inkSoftOnCanvas,
      fontStyle: known ? "italic" : "normal",
      align: known ? "left" : "center",
      wordWrap: { width: contentW },
    });
    ds.setOrigin(known ? 0 : 0.5, 0);
    container.add(ds);

    const h = dsY + ds.height + CARD_PAD;

    const shadow = scene.add.graphics();
    shadow.fillStyle(0x000000, 0.35);
    shadow.fillRoundedRect(-4, 6, w + 8, h + 8, CARD_RADIUS + 2);
    container.addAt(shadow, 0);

    const bg = scene.add.graphics();
    bg.fillGradientStyle(COLOR.canvas2Num, COLOR.canvas2Num, COLOR.canvas, COLOR.canvas, 1);
    bg.fillRoundedRect(0, 0, w, h, CARD_RADIUS);
    if (known) {
      bg.lineStyle(2, COLOR.canvasEdgeNum, 1);
      bg.strokeRoundedRect(0, 0, w, h, CARD_RADIUS);
    } else {
      // The mockup's mystery variant is a dashed border (`border-style:
      // dashed`) — Phaser Graphics has no native dashed stroke, so this walks
      // the rect's four straight edges in fixed segments. Corners are left to
      // the solid fill's own rounding rather than hand-rolling dashed arcs.
      this.strokeDashedRect(bg, 1, 1, w - 2, h - 2, COLOR.canvasEdgeNum, 1, 2);
    }
    container.addAt(bg, 1);

    // A card-wide (near-invisible) hover target, so moving the pointer
    // anywhere over the card body keeps it open rather than closing the
    // instant the pointer leaves the dot underneath it.
    const hoverArea = scene.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.0001);
    hoverArea.setInteractive();
    hoverArea.on("pointerover", () => this.cancelHide());
    hoverArea.on("pointerout", () => this.scheduleHide());
    container.add(hoverArea);

    this.examine = { slotId: slot.slotId, container, w, h };
    this.positionExamine(pointerX, pointerY);
  }

  /** Straight-edge dashed rectangle stroke — see `showExamine`'s header on
   * why (no native dashed stroke in Phaser 4's Graphics). */
  private strokeDashedRect(
    g: Phaser.GameObjects.Graphics,
    x: number,
    y: number,
    w: number,
    h: number,
    color: number,
    alpha: number,
    lineWidth: number,
    dash = 6,
    gap = 5,
  ): void {
    g.lineStyle(lineWidth, color, alpha);
    const edges: [number, number, number, number][] = [
      [x, y, x + w, y],
      [x + w, y, x + w, y + h],
      [x + w, y + h, x, y + h],
      [x, y + h, x, y],
    ];
    for (const [x1, y1, x2, y2] of edges) {
      const len = Math.hypot(x2 - x1, y2 - y1);
      const ux = (x2 - x1) / len;
      const uy = (y2 - y1) / len;
      const steps = Math.max(1, Math.ceil(len / (dash + gap)));
      for (let i = 0; i < steps; i++) {
        const s = i * (dash + gap);
        if (s >= len) break;
        const e = Math.min(s + dash, len);
        g.lineBetween(x1 + ux * s, y1 + uy * s, x1 + ux * e, y1 + uy * e);
      }
    }
  }

  /** The one mutation this file performs: the actual pickup, unchanged from
   * before the examine card existed — `ink.player.pickup` + `ink.refresh()`
   * + the `item:acquired` bus event. `ink.refresh()` drives `CollectScene`'s
   * own re-render, which calls `sync()` again with the now-picked slot
   * filtered out — that later `sync()` is what actually clears this hotspot
   * and card, so this just proactively closes the card for instant feedback. */
  private commitPickup(slot: ForageSlot, screen: string): void {
    const { ink, bus, inventory } = this.deps;
    this.destroyExamine();
    // POOL NAME (`slot.item`) vs ITEM ID: `itemForPool` is the same
    // provisional join `SatchelLedger.reJoinInto` uses at render time
    // (GAPS.md G13). A pool that joins to nothing still went in the
    // satchel — see `CollectScene.effectiveSatchel`'s header — it just
    // has no `item:acquired` row, honestly, rather than a guessed one.
    //
    // First-ness is read BEFORE the pickup: `ink.refresh()` below re-renders,
    // and that render's `reJoinInto` is what adds the id to `discoveredIds`,
    // so reading after would call every pickup "seen before."
    const itemId = itemForPool(slot.item);
    const seenBefore = !!itemId && inventory.discoveredIds().includes(itemId);
    // `pickup` can REFUSE (satchel and arms both full — the item stays on the
    // ground). Emitting `item:acquired` for a refused pickup was a lie the
    // gate counters and the autosave both believed; gated now (satchel-
    // cluster track, 2026-08-23).
    const ok = ink.player.pickup(slot.slotId, slot.item);
    ink.refresh();
    if (!ok || !itemId) return;
    bus.emit({
      type: "item:acquired",
      itemId,
      source: "forage",
      screenId: screen,
      poolName: slot.item,
    });
    if (!seenBefore) this.deps.onFirstPickup?.(itemId);
  }
}
