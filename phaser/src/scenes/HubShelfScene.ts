/**
 * The Home Hub's shelf, close up — the same sixteen-cubby unit the room view
 * draws at an isometric angle, drawn here front-on, at a scale where each
 * cubby is actually clickable (~57×19px apiece at room scale, vs. roughly a
 * sixth of this whole 1920×1080 canvas here).
 *
 * Wireframe §8 "Two views of one shelf" (decided, revision 4) — the reason
 * this is a second SCENE and not a zoomed camera on `HubScene`: the room art
 * draws the shelf as a parallelogram (isometric), this backdrop draws it as a
 * rectangle (front-on), and there is no shared math between a point in one
 * projection and the matching point in the other. So this file owns its OWN
 * small rect table for the same sixteen `shelf-r{row}c{col}` ids `Decor.ts`'s
 * room-view `SHELF_CUBBIES` already defines — `SHELF_CUBBY_RECTS` below,
 * hand-authored against the real crop (`home-hub-shelf-closeup.png`,
 * 840×545, checked visually against the art while writing it) — and every
 * placement made here goes through `Decor.placeOnSurface(itemId, cubbyId)`,
 * never a translated x/y. `Decor.placeOnSurface` and `Decor.occupant` are the
 * only surface between this file and the shared placement data; this scene
 * never reads or writes a `Placement.x`/`y` directly.
 *
 * Shares HubScene's live `Decor` instance (passed in at launch, not
 * reconstructed) — a cubby filled here and a cubby filled in the room view
 * are the same fact the moment either happens, never two writers of it.
 *
 * PERSISTENCE is therefore entirely `Decor`'s, and this file adds nothing to
 * it: `placeOnSurface`/`remove` write the storage key, and the same call fires
 * `Decor.onChange`, which `HubScene` wires to `CollectScene`'s save capture.
 * That wire is what fixes Roc's 2026-08-23 "it is not saving what is stored in
 * a shelf location" — the placement always survived within a session, but the
 * save file never heard about it and a resume then deleted it. Nothing here
 * needs to know that; sharing the one instance is the whole contract.
 *
 * Paused overlay, opened by clicking the shelf's merged hint region in the
 * room view (`HubScene.openShelfCloseUp`) — same `scene.pause()` +
 * `scene.launch()`/`scene.stop()` + `onClose()` lifecycle every other mode5
 * overlay uses (Satchel, Calendar, the Hub itself). Diegetic object, not a
 * framed menu page — §14 §5.3's "no filigree, no frame" rule the satchel
 * pouch uses: this is a piece of furniture looked at closer, not a page of
 * chrome.
 *
 * INTERACTION is click-to-arm, click-to-place (SatchelScene's own
 * pick-up-then-target discipline, not drag) — a cubby is a small, precise
 * target, and a click pair is more reliable than a drag gesture for that.
 * Click a palette chip to arm it (or the same chip again to cancel); click
 * an empty cubby to commit; click a filled cubby to select it, which surfaces
 * a "remove · Del" pill (same shape as `HubScene.drawPieceActions`, sized
 * down for a cubby instead of a full room piece).
 */

import Phaser from "phaser";
import { Decor, type Placement, type Surface } from "../world/Decor";
import type { ItemRecord } from "../magic/types";
import { COLOR, FONT, sceneFadeIn } from "../ui/theme";
import { utilityPill } from "../ui/buttons";
import { VN_METRICS } from "../world/view/DialogueLayout";
import {
  GLYPH_FILES,
  GLYPH_TEXTURE_SIZE,
  drawLeafGlyph,
  glyphKindFor,
  glyphTextureKey,
  makeItemIcon,
  type GlyphKind,
} from "./SatchelScene";

const W = 1920;
const H = 1080;
const DANGER_NUM = Phaser.Display.Color.HexStringToColor(COLOR.danger).color;

/** The real crop's own pixel size — `SHELF_CUBBY_RECTS` below is authored as
 * fractions of THIS, not of the 1920×1080 scene canvas; `imageBox()` is what
 * maps one into the other, once, in this file only. */
const IMG_W = 840;
const IMG_H = 545;
const BG_KEY = "bg:home-shelf-closeup";

const PANEL_TOP = 150;
const PANEL_BOTTOM = 900;
const PANEL_MAX_W = 1400;

/**
 * The close-up view's OWN rect table for the sixteen shelf-cubby ids —
 * fractions of `home-hub-shelf-closeup.png` (840×545). Hand-authored against
 * the real crop (checked with the Read tool while writing this): four cubby
 * rows on a roughly even grid, a small gutter between cells for the wood
 * dividers, a drawer band bleeding off the bottom edge below row 3 that
 * nothing here is placeable on (per the crop's own framing — see the
 * wireframe's "the cabinet band under them ... bleeds off the bottom edge
 * here rather than being fit whole into frame").
 *
 * Deliberately NOT derived from `Decor.ts`'s room-view `SHELF_CUBBIES` rects
 * — see this file's header on why the two projections can't share geometry.
 */
const CUBBY_GRID = { left: 0.045, right: 0.965, top: 0.055, bottom: 0.845, gutter: 0.012 };

function buildShelfCubbyRects(): Record<string, { x: number; y: number; w: number; h: number }> {
  const cols = 4;
  const rows = 4;
  const colW = (CUBBY_GRID.right - CUBBY_GRID.left) / cols;
  const rowH = (CUBBY_GRID.bottom - CUBBY_GRID.top) / rows;
  const rects: Record<string, { x: number; y: number; w: number; h: number }> = {};
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const x0 = CUBBY_GRID.left + c * colW;
      const y0 = CUBBY_GRID.top + r * rowH;
      rects[`shelf-r${r}c${c}`] = {
        x: x0 + CUBBY_GRID.gutter / 2,
        y: y0 + CUBBY_GRID.gutter / 2,
        w: colW - CUBBY_GRID.gutter,
        h: rowH - CUBBY_GRID.gutter,
      };
    }
  }
  return rects;
}

export const SHELF_CUBBY_RECTS: Record<string, { x: number; y: number; w: number; h: number }> =
  buildShelfCubbyRects();

export interface HubShelfSceneData {
  decor: Decor;
  items: ItemRecord[];
  /** Same mode-3 gate `HubScene` gets — restricts the palette to what's
   * actually been found, when set. `undefined` keeps everything unlocked. */
  discoveredOnly?: string[];
  onClose: () => void;
}

export class HubShelfScene extends Phaser.Scene {
  private decor!: Decor;
  private items!: ItemRecord[];
  private discoveredOnly?: Set<string>;
  private onClose!: () => void;

  private layer!: Phaser.GameObjects.Container;
  /** Armed palette item id — SatchelScene's own "moving" pattern, scaled
   * down to one field since there's no source pocket to remember here (the
   * palette copies, same as the room-view one). */
  private holding: string | null = null;
  private selectedCubby: string | null = null;

  constructor() {
    super("HubShelfScene");
  }

  init(data: HubShelfSceneData) {
    this.decor = data.decor;
    this.items = data.items;
    this.discoveredOnly = data.discoveredOnly ? new Set(data.discoveredOnly) : undefined;
    this.onClose = data.onClose;
    this.holding = null;
    this.selectedCubby = null;
  }

  /** Same six material SVGs Satchel/HubScene load — §11's "one icon set, not
   * redrawn per screen" — plus the close-up backdrop itself, guarded so a
   * second open in the same session doesn't reload either. */
  preload() {
    for (const kind of Object.keys(GLYPH_FILES) as Exclude<GlyphKind, "leaf">[]) {
      const key = glyphTextureKey(kind);
      if (this.textures.exists(key)) continue;
      this.load.svg(key, `art/ui/satchel/${GLYPH_FILES[kind]}.svg`, {
        width: GLYPH_TEXTURE_SIZE,
        height: GLYPH_TEXTURE_SIZE,
      });
    }
    if (!this.textures.exists(BG_KEY)) {
      // Same `run-images` route the boot preloader serves story
      // backdrops from (`vite.config.ts`) — this file lives in the same
      // `lantern-projects/v01/images` folder, just isn't in the story
      // manifest, so it's loaded directly here (CalendarScene's `bg:calendar`
      // is the same self-managed-load precedent for a non-story backdrop).
      this.load.image(BG_KEY, "run-images/home-hub-shelf-closeup.png");
    }
  }

  create() {
    sceneFadeIn(this);
    // This overlay sits atop ANOTHER ui overlay (HubScene, paused but still
    // rendering its own chrome row and title) rather than the game world —
    // the 0.6 scrim SatchelScene/NotebookScene use to dim a backdrop bleeds
    // HubScene's own top-right "Close" pill through at nearly the exact
    // screen position this scene draws its own close button, interleaving
    // the two into unreadable text (verified against a real playtest
    // screenshot). Even 0.92 (SpellTrialScene's overlay-over-overlay value)
    // still left it legible. SaveLoadScene already establishes full opacity
    // as the shipped fix for total parent occlusion; matching that exactly
    // rather than tuning a third alpha value.
    this.add.rectangle(W / 2, H / 2, W, H, COLOR.night, 1).setDepth(0);
    this.layer = this.add.container(0, 0).setDepth(1);
    // Same click-vs-drag slop the room view uses — every palette chip here
    // is both clickable and draggable, and at Phaser's default threshold of
    // 0 a one-pixel wobble turns a click into a drag that lands nowhere.
    this.input.dragDistanceThreshold = 6;
    this.input.keyboard?.on("keydown-ESC", () => this.close());
    this.input.keyboard?.on("keydown-DELETE", () => this.removeSelected());
    this.redraw();
  }

  private close(): void {
    this.input.keyboard?.removeAllListeners();
    this.scene.stop();
    this.onClose();
  }

  private removeSelected(): void {
    if (!this.selectedCubby) return;
    const occ = this.decor.occupant(this.selectedCubby);
    if (occ) this.decor.remove(occ.uid);
    this.selectedCubby = null;
    this.redraw();
  }

  /** Every gridded surface `Decor` was built with — the sixteen shelf
   * cubbies, read generically off `Surface.gridded` rather than an id
   * prefix, same as `HubScene.drawShelfHint`. */
  private cubbySurfaces(): Surface[] {
    return this.decor.surfaces().filter((s) => s.gridded);
  }

  /**
   * Same three-gate policy `HubScene.palette()` documents — and it reads the
   * gate off the SHARED `Decor` instance, not off its own copy of the data.
   * That is what stops the close-up from being a back door around the room
   * view's banked draw-down: both views spend one stock.
   */
  private eligibleItems(): ItemRecord[] {
    return this.items
      .filter((i) => i.collectible && i.persistence !== "world")
      .filter((i) =>
        this.decor.stockLimited
          ? // `remaining`, not `bankedTotal`: a fully-placed item leaves the
            // row here for the same reason it leaves the room view's
            // (Roc, 2026-08-23). The two rows read one shared stock, so
            // showing a spent "×0" chip in only one of them would have made
            // the close-up look like a back door around the draw-down.
            this.decor.remaining(i.item_id) > 0
          : !this.discoveredOnly || this.discoveredOnly.has(i.item_id),
      )
      .sort((a, b) => a.description.localeCompare(b.description));
  }

  private redraw(): void {
    this.layer.removeAll(true);
    this.drawHeader();
    this.drawPanel();
    this.drawPalette();
  }

  private drawHeader(): void {
    const gridded = this.cubbySurfaces();
    const filled = gridded.filter((s) => this.decor.occupant(s.id)).length;
    this.layer.add(
      this.add.text(60, 40, "Home Hub · Shelf", { fontFamily: FONT.display, fontSize: "34px", color: COLOR.gold }),
    );
    this.layer.add(
      this.add.text(60, 88, `${filled}/${gridded.length} cubbies filled · click a cubby to place or remove`, {
        fontFamily: FONT.mono,
        fontSize: "18px",
        color: COLOR.muted,
      }),
    );
    // The §14 Utility pill (`ui/buttons.ts`), not the old `[ bracket ]` text —
    // one button chrome across every screen. `originX: 1` keeps it flush right,
    // where the text control used to end.
    utilityPill(this, W - 60, 40, "[ Close — Esc ]", () => this.close(), {
      container: this.layer,
      fontSize: "18px",
      originX: 1,
    });
  }

  /** Where the backdrop image sits on the 1920×1080 canvas — contain-fit
   * within a `PANEL_MAX_W`×(`PANEL_BOTTOM`-`PANEL_TOP`) box, centered. Every
   * cubby rect (fractions of the 840×545 source) is mapped through THIS,
   * once, to land in screen space — the one and only place this file's own
   * image-to-screen math lives. */
  private imageBox(): { x: number; y: number; w: number; h: number } {
    const scale = Math.min(PANEL_MAX_W / IMG_W, (PANEL_BOTTOM - PANEL_TOP) / IMG_H);
    const w = IMG_W * scale;
    const h = IMG_H * scale;
    const x = (W - w) / 2;
    const y = PANEL_TOP + (PANEL_BOTTOM - PANEL_TOP - h) / 2;
    return { x, y, w, h };
  }

  private drawPanel(): void {
    const box = this.imageBox();

    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillRoundedRect(box.x - 8, box.y + 10, box.w + 16, box.h + 16, 14);
    this.layer.add(shadow);

    if (this.textures.exists(BG_KEY)) {
      const img = this.add.image(box.x + box.w / 2, box.y + box.h / 2, BG_KEY).setDisplaySize(box.w, box.h);
      this.layer.add(img);
    } else {
      // Missing backdrop must not take the scene down — same discipline
      // `PreloadScene`'s own `loaderror` handler follows for story
      // backdrops. A plain leather-toned fill stands in.
      const fallback = this.add.rectangle(box.x + box.w / 2, box.y + box.h / 2, box.w, box.h, COLOR.leatherNum);
      this.layer.add(fallback);
    }
    const border = this.add
      .rectangle(box.x + box.w / 2, box.y + box.h / 2, box.w, box.h)
      .setStrokeStyle(2, COLOR.leatherDarkNum, 1);
    this.layer.add(border);

    if (this.holding) {
      const label = this.items.find((i) => i.item_id === this.holding)?.description ?? this.holding;
      this.layer.add(
        this.add
          .text(box.x, box.y - 34, `Holding: ${label} — click an empty cubby`, {
            fontFamily: FONT.mono,
            fontSize: "16px",
            color: COLOR.onAccent,
            backgroundColor: COLOR.gold,
          })
          .setPadding(10, 6, 10, 6),
      );
    }

    // Cubbies drawn AFTER the backdrop and its border (container add order
    // is draw order, not `.setDepth()`) so occupant chips and hit outlines
    // sit on top of the photo, never under it.
    for (const surface of this.cubbySurfaces()) {
      const rect = SHELF_CUBBY_RECTS[surface.id];
      if (!rect) continue; // defensive — every authored cubby id has a rect here
      this.drawCubby(surface, rect, box);
    }
  }

  private drawCubby(
    surface: Surface,
    rect: { x: number; y: number; w: number; h: number },
    box: { x: number; y: number; w: number; h: number },
  ): void {
    const sx = box.x + rect.x * box.w;
    const sy = box.y + rect.y * box.h;
    const sw = rect.w * box.w;
    const sh = rect.h * box.h;
    const cx = sx + sw / 2;
    const cy = sy + sh / 2;

    const occ = this.decor.occupant(surface.id);
    const isSelected = this.selectedCubby === surface.id;
    const idleStroke = isSelected ? COLOR.emberNum : occ ? COLOR.goldNum : COLOR.leatherDarkNum;
    const idleAlpha = isSelected ? 1 : occ ? 0.75 : 0.5;

    const hit = this.add
      .rectangle(cx, cy, sw, sh, occ ? COLOR.goldNum : 0x000000, occ ? 0.12 : 0.001)
      .setStrokeStyle(isSelected ? 3 : 1.5, idleStroke, idleAlpha)
      .setInteractive({ useHandCursor: true });
    hit.on("pointerover", () => hit.setStrokeStyle(2, COLOR.emberNum, 0.9));
    hit.on("pointerout", () => hit.setStrokeStyle(isSelected ? 3 : 1.5, idleStroke, idleAlpha));
    hit.on("pointerdown", () => this.onCubbyClick(surface.id, occ));
    this.layer.add(hit);

    if (occ) {
      const item = this.items.find((i) => i.item_id === occ.itemId);
      const label = item?.description ?? occ.itemId;
      const kind = glyphKindFor(occ.itemId);
      this.drawIcon(kind, cx, cy - sh * 0.14, Math.min(sw, sh) * 0.4);
      const t = this.add
        .text(cx, cy + sh * 0.26, label, {
          // An item's own description — the same name `HubScene.drawPieces`
          // puts on a room piece, so it reads in the same family (§14 §2).
          fontFamily: FONT.display,
          fontSize: "12px",
          color: COLOR.onAccent,
          backgroundColor: COLOR.canvasHex,
          padding: { x: 5, y: 2 },
        })
        .setOrigin(0.5);
      t.setWordWrapWidth(sw - 4, true);
      this.layer.add(t);
    }

    if (isSelected) {
      this.drawRemovePill(cx, sy - 6, () => {
        const p = this.decor.occupant(surface.id);
        if (p) this.decor.remove(p.uid);
        this.selectedCubby = null;
        this.redraw();
      });
    }
  }

  private onCubbyClick(surfaceId: string, occ: Placement | undefined): void {
    if (occ) {
      this.selectedCubby = this.selectedCubby === surfaceId ? null : surfaceId;
      this.redraw();
      return;
    }
    if (!this.holding) return; // nothing armed — an empty cubby has no action to take
    // Re-checked at commit, not only at arm time: the room view underneath
    // is paused, not dead, and a hold can outlive the copy it was armed on.
    if (this.decor.remaining(this.holding) <= 0) {
      this.holding = null;
      this.redraw();
      return;
    }
    const placed = this.decor.placeOnSurface(this.holding, surfaceId);
    if (placed) {
      this.holding = null;
      this.selectedCubby = null;
    }
    this.redraw();
  }

  /** Small utility pill, `HubScene.pieceActionPill`'s geometry sized down
   * for a cubby instead of a room piece — same shipped warn family
   * (`danger`), anchored ABOVE the cubby's top edge so it never covers the
   * item it belongs to. */
  private drawRemovePill(cx: number, bottomY: number, on: () => void): void {
    const label = "remove · Del";
    const padX = 10;
    const padY = 6;
    const size = "14px";
    const measure = this.add.text(0, 0, label, { fontFamily: FONT.mono, fontSize: size });
    const w = measure.width + padX * 2;
    const h = measure.height + padY * 2;
    measure.destroy();
    const x = cx - w / 2;
    const y = bottomY - h;
    const r = h * VN_METRICS.controlCornerOfPill;

    const bg = this.add.graphics({ x, y });
    const paint = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(hover ? COLOR.panelHover : COLOR.night, 0.92);
      bg.lineStyle(2, DANGER_NUM, hover ? 0.9 : 0.5);
      bg.fillRoundedRect(0, 0, w, h, r);
      bg.strokeRoundedRect(0, 0, w, h, r);
    };
    paint(false);
    bg.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, w, h),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    bg.on("pointerover", () => paint(true));
    bg.on("pointerout", () => paint(false));
    bg.on("pointerdown", on);
    // Container children render in ADD ORDER — background first, then label.
    this.layer.add(bg);
    this.layer.add(this.add.text(x + padX, y + padY, label, { fontFamily: FONT.mono, fontSize: size, color: COLOR.danger }));
  }

  private drawIcon(kind: GlyphKind, cx: number, cy: number, size: number): void {
    if (kind === "leaf") {
      const g = this.add.graphics();
      drawLeafGlyph(g, cx, cy, size / 2);
      this.layer.add(g);
      return;
    }
    const img = this.add.image(cx, cy, glyphTextureKey(kind)).setDisplaySize(size, size);
    this.layer.add(img);
  }

  /**
   * Which cubby a screen point falls in, or `undefined`. The drag path's
   * hit test — it reads the SAME `SHELF_CUBBY_RECTS` × `imageBox()`
   * projection `drawCubby` draws with, so a drop can never disagree with
   * the outline the player aimed at. Padded outward a little, because a
   * cubby is a small target and a drop that lands a few pixels into the
   * wooden divider plainly meant the cubby beside it.
   */
  private cubbyAt(x: number, y: number): Surface | undefined {
    const box = this.imageBox();
    const PAD = 6;
    return this.cubbySurfaces().find((s) => {
      const rect = SHELF_CUBBY_RECTS[s.id];
      if (!rect) return false;
      const sx = box.x + rect.x * box.w;
      const sy = box.y + rect.y * box.h;
      return (
        x >= sx - PAD && x <= sx + rect.w * box.w + PAD && y >= sy - PAD && y <= sy + rect.h * box.h + PAD
      );
    });
  }

  /**
   * Compact palette row below the panel. Two gestures, same destination
   * (Roc, 2026-08-23: "in shelf view we should be able to click and drag to
   * place as well"): click a chip to arm it and click a cubby, or drag the
   * chip straight onto one. The room view's palette works exactly this way,
   * and having the close-up accept only half of it was the thing that made
   * the two views feel like different programs.
   *
   * Same eligibility policy as `HubScene.palette()` (collectible, not
   * world-persisted, `discoveredOnly`-gated when set) and the same shared
   * `Decor` stock, so a copy spent here is spent in the room too.
   */
  private drawPalette(): void {
    const y0 = PANEL_BOTTOM + 28;
    this.layer.add(this.add.rectangle(W / 2, y0 + 66, W, 148, COLOR.night, 0.92).setStrokeStyle(1, COLOR.leatherDarkNum));

    const hint = this.holding
      ? "holding — click an empty cubby to place it, or click it again to cancel"
      : "drag something below onto an empty cubby, or click it then click a cubby";
    this.layer.add(this.add.text(40, y0, hint, { fontFamily: FONT.display, fontSize: "16px", color: COLOR.muted }));

    const ICON = 20;
    const ICON_GAP = 6;
    const PAD = 10;
    let x = 40;
    let y = y0 + 32;
    const stocked = this.decor.stockLimited;
    for (const item of this.eligibleItems()) {
      const armed = this.holding === item.item_id;
      // Banked draw-down, same rule and same spent look as the room view's
      // palette — the count comes off the shared `Decor`, so placing here
      // and placing there subtract from one number.
      const left = this.decor.remaining(item.item_id);
      const live = !stocked || left > 0;
      const chip = this.add
        .text(x, y, stocked ? `${item.description} ×${left}` : item.description, {
          fontFamily: FONT.display,
          fontSize: "17px",
          color: live ? COLOR.onAccent : COLOR.dim,
          backgroundColor: live ? (armed ? COLOR.ember : COLOR.canvasHex) : COLOR.leatherDarkHex,
          padding: { left: PAD + ICON + ICON_GAP, right: PAD, top: 6, bottom: 6 },
        })
        .setInteractive({ useHandCursor: live, draggable: live });

      const iconAt = (cx: number) => cx + PAD + ICON / 2;
      const iconCy = (cy: number) => cy + chip.height / 2;
      // Real per-item photo when loaded, else the category glyph / leaf — the
      // one shared render rule (`makeItemIcon`), fit within the chip's icon box.
      const icon = makeItemIcon(this, item.item_id, iconAt(x), iconCy(y), ICON);

      if (!live) icon.setAlpha(0.45);

      if (live) {
        // Arming commits on `pointerup`, not `pointerdown` — `redraw()`
        // destroys this chip, and Phaser queues the drag BEFORE it emits the
        // down event, so arming on down handed the drag plugin a dead object
        // and dragging did nothing. Same fix and same reason as
        // `HubScene.drawPalette`; see the `dragged` note there.
        let dragged = false;
        // Grab offset, captured on POINTERDOWN — `dragstart` only fires
        // after `dragDistanceThreshold` is crossed, so measuring there bakes
        // that first jump into the offset and the chip leaps out from under
        // the cursor.
        let grabX = 0;
        let grabY = 0;
        chip.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
          dragged = false;
          grabX = chip.x - pointer.x;
          grabY = chip.y - pointer.y;
        });
        chip.on("pointerup", () => {
          if (dragged) return;
          this.holding = armed ? null : item.item_id;
          this.selectedCubby = null;
          this.redraw();
        });
        // Positioned from `pointer` plus the grab offset, NOT from Phaser's
        // `dragX`/`dragY` — those are not the parent-local point they read
        // as, and a chip placed at them drifts well away from the cursor
        // (measured: 260px out on a single drag). Same fix as
        // `HubScene.drawPalette`, which documents the measurement.
        chip.on("dragstart", () => {
          dragged = true;
          this.holding = null; // a real drag pre-empts any click-armed hold
          chip.setAlpha(0.5);
          icon.setAlpha(0.5);
        });
        chip.on("drag", (pointer: Phaser.Input.Pointer) => {
          const nx = pointer.x + grabX;
          const ny = pointer.y + grabY;
          chip.setPosition(nx, ny);
          icon.setPosition(iconAt(nx), iconCy(ny));
        });
        chip.on("dragend", () => {
          // Aim from the chip's own centre rather than its top-left corner:
          // the pill is wider than a cubby, and dropping "on" a cubby means
          // the middle of the thing being dropped is over it.
          const target = this.cubbyAt(chip.x + chip.width / 2, chip.y + chip.height / 2);
          // Re-checked at the drop, not at drag start — the same
          // outrun-the-stock guard `onCubbyClick` applies to the click path.
          if (target && !this.decor.occupant(target.id) && this.decor.remaining(item.item_id) > 0) {
            this.decor.placeOnSurface(item.item_id, target.id);
            this.selectedCubby = null;
          }
          this.redraw();
        });
      }

      // Container add order is draw order: chip background+text first, icon
      // on top of the pill it belongs to.
      this.layer.add(chip);
      this.layer.add(icon);
      x += chip.width + 10;
      if (x > W - 260) {
        x = 40;
        y += 32;
      }
    }
  }
}
