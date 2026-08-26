/**
 * The satchel (mode5 plan Track 2a — first of the UI-migration screens).
 * Ports `tools/screen-flow/mockups/satchel.html` to Phaser, same VIEW
 * discipline as `NotebookScene`/`CalendarScene`: a snapshot handed in at
 * launch, never advancing the story on its own.
 *
 * DROP + MOVE (mode5 satchel-act track, 2026-08-22) are the one exception to
 * "never touches the ink bridge": a discretionary drop or a pocket-to-pocket
 * move is a real, player-initiated action, not a story beat, so it does not
 * run through `InkBridge.choose()`/`continueOnce()` — but it does mutate live
 * state, through the `onDrop`/`onMove` callbacks the caller wires (see
 * `CollectScene.openSatchel`). Both return a FRESH `PlayView`, which replaces
 * `this.view` before redrawing — the snapshot taken at launch is stale the
 * instant either fires, same as any other direct mutation this build already
 * re-diffs through `InkBridge.refresh()`. This is why the two-sided warning
 * in the wireframe's §7 mattered: `Inventory.held` and `LanternPlayer.satchel`
 * (the pool-name array) are two different stores, and both callbacks touch
 * both — see `Inventory.drop`'s and `LanternPlayer.dropSatchelSlot`'s own
 * headers for the half each one owns.
 *
 * SLOT MODEL. Only the SATCHEL tab is drop/move-capable. `view.satchelSlots`
 * (added alongside this track) is `LanternPlayer.satchel`'s own physical
 * layout — one entry per pocket, `null` for empty — and `SatchelPockets.
 * buildSatchelSlots` turns it into one Pocket per PHYSICAL slot, not grouped
 * by item type the way the (Arms-only) `buildPockets` still is. See that
 * function's header for why: a move needs an addressable position, and a
 * grouped/counted display has none.
 *
 * ARMS IS ACT-CAPABLE NOW (satchel-cluster track, 2026-08-23 — Roc: "there's
 * currently no way to move items between satchel and arms"). The old
 * view-only scope cut is retired: a satchel pocket offers "To Arms" (when
 * arms has room), an arms pocket offers "To Satchel" (when a pocket is
 * free) and "Drop It". Arms actions speak POOL vocabulary through the item
 * id (`poolForItem` on the caller's side) because the grouped display has no
 * slot index — two arms units of the same pool are interchangeable, so
 * "which one" never matters. The footer's Arms tab also carries a live
 * `n/cap` count whenever arms is non-empty, so a pickup that spilled to
 * arms is visible without switching tabs.
 *
 * A diegetic pouch, not a framed page — deliberately unornamented (no
 * `filigreeCorners`, no `panel`), matching the mockup's own header on why
 * Satchel stays a leather object rather than adopting the gold-filigree
 * page language the other three migrated screens will use.
 *
 * MATERIAL ICONS are the mockup's own hand-drawn SVGs, not the gold icon kit
 * (still un-exported, teal-backed, not a drop-in — see the mockup's own
 * header). Pulled verbatim out of the mockup's inline `ART` object into
 * standalone files (`public/art/ui/satchel/*.svg`) and loaded with Phaser's
 * native SVG loader (`load.svg` rasterizes at load time — it does not parse
 * live path data, so this could not just paste the markup in as-is). `leaf`
 * has no file: it is the fallback for anything outside the six day-one
 * materials the mockup drew, covering the rest of the item catalog with a
 * plain Graphics dot rather than a missing icon.
 *
 * ONE REMAINING CUT FROM THE MOCKUP: the "Notebook" footer tab is gone —
 * `CollectScene`'s own `[ notebook — N ]` button is one keypress after
 * closing this, so a second path in wasn't worth the navigation edge case.
 *
 * COUNT PROVENANCE. `SatchelPockets.buildPockets` can return `count: null`
 * for a held item ink's own pool array has no record of — a `free` item
 * (`item_captured_sound`) or anything the mode5 DEV unlock granted directly.
 * Both draw with no numeric badge rather than a fabricated number.
 */

import Phaser from "phaser";
import type { PlayView } from "@lantern/lib/play";
import type { Inventory } from "../world/Inventory";
import type { Knowledge } from "../world/Knowledge";
import type { SpellRecord } from "../magic/types";
import { effectiveSatchelSlots } from "../world/SatchelLedger";
import { itemForPool } from "../world/foragePoolToItem";
import { buildPockets, buildSatchelSlots, type Pocket, type SatchelSlotEntry } from "../world/SatchelPockets";
import { COLOR, FONT, sceneFadeIn } from "../ui/theme";
import { utilityPill } from "../ui/buttons";
import { PlayerSettings } from "../world/PlayerSettings";

const W = 1920;
const H = 1080;

/** The numeric form of the `danger` token, same derivation SaveLoadScene
 * uses for its own warn button — Graphics fills/strokes need a number, and
 * `COLOR.danger` is only published as a hex string. Per §14 §4.3 this is the
 * shipped warn-family color (save-load.html's "Start over"); reused here
 * verbatim, not a new color. */
const DANGER_NUM = Phaser.Display.Color.HexStringToColor(COLOR.danger).color;

const PANEL_W = 1400;
const PANEL_X = (W - PANEL_W) / 2;
const PANEL_TOP = 170;
const PANEL_H = 720;
const POUCH_W = Math.round(PANEL_W * 0.58);
const INSPECT_X = PANEL_X + POUCH_W;
const INSPECT_W = PANEL_W - POUCH_W;
const FLAP_H = 22;

const POCKET = 210;
const POCKET_GAP = 22;
const POCKET_COLS = 3;
const POUCH_PAD = 28;

type Tab = "satchel" | "arms";
export type GlyphKind = "stone" | "sound" | "wax" | "feather" | "wool" | "sticks" | "leaf";

/** Exported so other screens sharing this icon set (Home Hub palette) classify
 * an item id the same way, rather than re-deriving the mapping — §11 of the
 * style guide's "one icon set, not redrawn per screen" rule. */
export function glyphKindFor(id: string): GlyphKind {
  if (id.includes("stone")) return "stone";
  if (id.includes("sound")) return "sound";
  if (id.includes("wax")) return "wax";
  if (id.includes("feather")) return "feather";
  if (id.includes("wool")) return "wool";
  if (id.includes("stick")) return "sticks";
  return "leaf";
}

/** Rasterized once at this size (px) — big enough to stay crisp scaled down
 * to a pocket tile or up to the larger inspect-card placement. */
export const GLYPH_TEXTURE_SIZE = 160;
/** kind -> the SVG's filename under `public/art/ui/satchel/`. */
export const GLYPH_FILES: Record<Exclude<GlyphKind, "leaf">, string> = {
  stone: "stone",
  sound: "sound",
  wax: "wax",
  feather: "feather",
  wool: "wool",
  sticks: "sticks",
};
export const glyphTextureKey = (kind: Exclude<GlyphKind, "leaf">) => `satchel-glyph-${kind}`;

/** The only glyph still drawn in code — everything else is a loaded SVG
 * texture (see the class header). Covers whatever's outside the six day-one
 * materials the mockup drew a real icon for. */
export function drawLeafGlyph(g: Phaser.GameObjects.Graphics, cx: number, cy: number, r: number): void {
  g.fillStyle(COLOR.duskNum, 0.55);
  g.fillCircle(cx, cy, r * 0.7);
  g.lineStyle(2, COLOR.goldNum, 0.6);
  g.strokeCircle(cx, cy, r * 0.7);
}

/** The item-art texture key `PreloadScene` loads a per-item photo under. */
export const itemArtKey = (id: string) => `art:item:${id}`;

/**
 * The one place item art is chosen — used by every glyph render site
 * (satchel pockets + inspect card, Home Hub chips, Hub shelf chips) so
 * "photo wins if loaded, glyph otherwise" is a single rule, not four copies.
 *
 * Returns ONE game object centred at `(cx, cy)`, fit inside a `box`-sized
 * square: the real `art:item:${id}` photo when `PreloadScene` loaded it
 * (aspect preserved, never stretched — these are photos, not square glyphs),
 * else the category SVG glyph, else the drawn `leaf` fallback for the 7
 * art-less ids and anything outside the six day-one materials. The caller adds
 * it to its own container and may reposition/alpha it (all three kinds are a
 * single object, so drag/greyed handling stays uniform).
 */
export function makeItemIcon(
  scene: Phaser.Scene,
  id: string,
  cx: number,
  cy: number,
  box: number,
): Phaser.GameObjects.Image | Phaser.GameObjects.Graphics {
  const artKey = itemArtKey(id);
  if (scene.textures.exists(artKey)) {
    const src = scene.textures.get(artKey).getSourceImage() as { width: number; height: number };
    const scale = Math.min(box / src.width, box / src.height);
    return scene.add.image(cx, cy, artKey).setDisplaySize(src.width * scale, src.height * scale);
  }
  const kind = glyphKindFor(id);
  if (kind === "leaf") {
    const g = scene.add.graphics();
    drawLeafGlyph(g, 0, 0, box / 2);
    g.setPosition(cx, cy);
    return g;
  }
  return scene.add.image(cx, cy, glyphTextureKey(kind)).setDisplaySize(box, box);
}

export interface SatchelSceneData {
  view: PlayView;
  inventory: Inventory;
  spells: readonly SpellRecord[];
  knowledge: Knowledge;
  onClose: () => void;
  /**
   * Drop the selected pocket. `slotIndex` is the physical satchel slot to
   * clear (`SatchelSlotEntry.slotIndex`), or `null` for an extra/unslotted
   * held item (a free item, a DEV-unlock grant) that has no pool-array slot
   * to clear. Must perform BOTH halves — `Inventory.drop` and, when
   * `slotIndex` is not null, `LanternPlayer.dropSatchelSlot` — then return a
   * fresh `view()` so the scene can redraw against real state.
   */
  onDrop: (itemId: string, slotIndex: number | null) => PlayView;
  /** Move a held item from one physical satchel slot to another (must be
   * empty). Returns a fresh `view()`, same contract as `onDrop`. */
  onMove: (fromSlot: number, toSlot: number) => PlayView;
  /** Satchel pocket -> arms-carry (host-owned:
   * `LanternPlayer.moveSatchelSlotToArms`). Same fresh-view contract. */
  onMoveToArms: (fromSlot: number) => PlayView;
  /** Arms -> first free satchel pocket, by ITEM ID — the caller joins it back
   * to pool vocabulary (`poolForItem` ->
   * `LanternPlayer.moveArmsPoolToSatchel`). Same fresh-view contract. */
  onMoveArmsToSatchel: (itemId: string) => PlayView;
  /**
   * Open focused on this item — the pickup-pops-satchel wire (Roc,
   * 2026-08-23: a never-seen pickup opens the satchel to its description).
   * The scene finds the item's pocket (satchel tab first, then arms, for a
   * pickup that spilled) and selects it so the inspect card shows it.
   */
  focusItemId?: string;
}

/** Scene-local "holding" state for an in-progress move — never committed to
 * `LanternPlayer` until a legal empty pocket is actually clicked (see
 * `completeMove`), so closing the satchel or clicking cancel mid-move leaves
 * no partial state on either side of the two-sided drop/move data model. */
interface MoveHold {
  readonly fromSlot: number;
  readonly itemId: string;
  readonly label: string;
}

export class SatchelScene extends Phaser.Scene {
  private view!: PlayView;
  private inventory!: Inventory;
  private spells!: readonly SpellRecord[];
  private knowledge!: Knowledge;
  private onClose!: () => void;
  private onDrop!: (itemId: string, slotIndex: number | null) => PlayView;
  private onMove!: (fromSlot: number, toSlot: number) => PlayView;
  private onMoveToArms!: (fromSlot: number) => PlayView;
  private onMoveArmsToSatchel!: (itemId: string) => PlayView;
  /** One-shot — consumed by `applyFocus()` in `create()`. */
  private focusItemId: string | null = null;
  private tab: Tab = "satchel";
  private selected = 0;
  /** Set only while a move is armed (satchel tab, "Move" clicked, no target
   * picked yet). See `MoveHold`'s own comment. */
  private moving: MoveHold | null = null;
  /** Two-step guard for the destructive Drop, same shape as SaveLoadScene's
   * `confirmingClear` — armed by a first click when a warning applies (see
   * `warnLineFor`), consumed by the second. */
  private confirmingDrop = false;
  /** Stacking is ADD ORDER, not `.setDepth()` — confirmed by a real bug (an
   * "empty" pocket's label rendered under its own background). Every
   * `draw*` method below adds back-to-front for that reason; none of them
   * call `.setDepth()` on a `layer` child. */
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super("SatchelScene");
  }

  init(data: SatchelSceneData) {
    this.view = data.view;
    this.inventory = data.inventory;
    this.spells = data.spells;
    this.knowledge = data.knowledge;
    this.onClose = data.onClose;
    this.onDrop = data.onDrop;
    this.onMove = data.onMove;
    this.onMoveToArms = data.onMoveToArms;
    this.onMoveArmsToSatchel = data.onMoveArmsToSatchel;
    this.focusItemId = data.focusItemId ?? null;
    this.tab = "satchel";
    this.selected = 0;
    this.moving = null;
    this.confirmingDrop = false;
  }

  preload() {
    for (const kind of Object.keys(GLYPH_FILES) as Exclude<GlyphKind, "leaf">[]) {
      const key = glyphTextureKey(kind);
      if (this.textures.exists(key)) continue;
      this.load.svg(key, `art/ui/satchel/${GLYPH_FILES[kind]}.svg`, {
        width: GLYPH_TEXTURE_SIZE,
        height: GLYPH_TEXTURE_SIZE,
      });
    }
  }

  create() {
    sceneFadeIn(this);
    this.ensureHatchTexture();
    this.add.rectangle(W / 2, H / 2, W, H, COLOR.night, 0.6).setDepth(0);
    this.layer = this.add.container(0, 0).setDepth(1);
    this.input.keyboard?.on("keydown-ESC", () => this.close());
    this.input.keyboard?.on("keydown-S", () => this.close());
    this.applyFocus();
    this.redraw();
  }

  /** The pickup-pops-satchel landing (see `SatchelSceneData.focusItemId`):
   * find the item's pocket — satchel tab first, then arms for a pickup that
   * spilled — and select it so the first draw shows its description. Falls
   * back to the default satchel view when the item is nowhere (a race with a
   * resync). One-shot. */
  private applyFocus(): void {
    const wanted = this.focusItemId;
    this.focusItemId = null;
    if (!wanted) return;
    for (const tab of ["satchel", "arms"] as Tab[]) {
      this.tab = tab;
      const index = this.pockets().list.findIndex((entry) => entry?.pocket.id === wanted);
      if (index !== -1) {
        this.selected = index;
        return;
      }
    }
    this.tab = "satchel";
    this.selected = 0;
  }

  /** A small diagonal-stripe tile, generated once (Phaser 4's WebGL renderer
   * doesn't support the classic `setMask` — see git history — so an empty
   * pocket's hatch is a real repeating `TileSprite` texture instead of a
   * mask-clipped Graphics pattern). Mirrors the mockup's
   * `repeating-linear-gradient(45deg, ...)` on `.pocket.empty`. */
  private ensureHatchTexture(): void {
    const key = "satchel-hatch";
    if (this.textures.exists(key)) return;
    const size = 20;
    const g = this.add.graphics();
    g.fillStyle(0x6b5a3a, 1);
    g.fillRect(0, 0, size, size);
    g.lineStyle(9, 0x5f4f32, 1);
    // One diagonal plus its two corner-completions — standard seamless-tile
    // trick: `generateTexture` crops to `size x size`, and the two extra
    // lines supply the corner triangles a repeating tile needs to connect.
    g.lineBetween(0, size, size, 0);
    g.lineBetween(size, size, size * 2, 0);
    g.lineBetween(-size, size, 0, 0);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  private close(): void {
    this.input.keyboard?.removeAllListeners();
    this.scene.stop();
    this.onClose();
  }

  /** Pockets for the active tab. Arms is grouped-by-type, straight off
   * `view.arms` (unchanged from before this track — no drop/move there, see
   * the class header). Satchel is now one entry per PHYSICAL slot: hide
   * consumed-but-not-cleared slots via `effectiveSatchelSlots` (the
   * positional twin of `effectiveSatchel`, preserving gaps in place), join
   * each surviving slot's pool name to an item id, then let
   * `buildSatchelSlots` fill any leftover empty slots with held items that
   * have no pool-array slot at all (free/DEV-granted — see that function's
   * header). Every entry that survives is wrapped as `{ pocket, slotIndex }`
   * uniformly, so `drawPouch`/`drawInspect` don't need to know which tab
   * they're drawing. */
  private pockets(): { list: (SatchelSlotEntry | null)[]; capacity: number } {
    if (this.tab === "arms") {
      const heldIds = [...new Set(this.view.arms.map((p) => itemForPool(p)).filter((id): id is string => !!id))];
      const grouped = buildPockets(heldIds, this.view.arms, (id) => this.inventory.record(id), this.spells, (id) =>
        this.knowledge.knows(id),
      );
      return {
        list: grouped.map((pocket): SatchelSlotEntry => ({ pocket, slotIndex: null })),
        capacity: this.view.armsCapacity,
      };
    }
    const shownSlots = effectiveSatchelSlots(this.inventory, this.view.satchelSlots);
    const slotItemIds = shownSlots.map((pool) => (pool ? itemForPool(pool) : null));
    const slotted = new Set(slotItemIds.filter((id): id is string => !!id));
    const extraHeldIds = this.inventory.availableOn(null).filter((id) => !slotted.has(id));
    const list = buildSatchelSlots(slotItemIds, extraHeldIds, (id) => this.inventory.record(id), this.spells, (id) =>
      this.knowledge.knows(id),
    );
    return { list, capacity: this.view.satchelCapacity };
  }

  private redraw(): void {
    this.layer.removeAll(true);
    const { list, capacity } = this.pockets();
    if (this.selected >= list.length) this.selected = Math.max(0, list.length - 1);

    // Title + meta share one baseline row, meta pushed to the panel's right
    // edge — the mockup's `.head` is a flex row (`margin-left: auto` on
    // `.meta`), not two stacked lines.
    this.text(PANEL_X, 90, "Satchel", COLOR.gold, 40, FONT.display);
    const shown = list.filter((entry) => entry !== null).length;
    this.text(
      PANEL_X + PANEL_W,
      108,
      `Day ${this.view.day} · ${this.view.timeBlock} · ${shown} / ${capacity} carried`,
      COLOR.muted,
      18,
      FONT.mono,
    ).setOrigin(1, 0);

    this.drawPouch(list, capacity);
    this.drawInspect(list[this.selected] ?? null);
    this.drawFooter();
  }

  private drawPouch(list: (SatchelSlotEntry | null)[], capacity: number): void {
    const panelY = PANEL_TOP;
    // The whole card's drop shadow (mockup: `box-shadow: 0 24px 60px
    // rgba(0,0,0,.55)`) — one soft dark rect behind both panels, not per-panel.
    const shadow = this.add.graphics();
    shadow.fillStyle(0x000000, 0.4);
    shadow.fillRoundedRect(PANEL_X - 6, panelY + 14, PANEL_W + 12, PANEL_H + 12, 18);
    this.layer.add(shadow);

    const g = this.add.graphics();
    g.fillGradientStyle(COLOR.leatherLightNum, COLOR.leatherLightNum, COLOR.leatherDarkNum, COLOR.leatherDarkNum, 1);
    g.fillRoundedRect(PANEL_X, panelY, POUCH_W, PANEL_H, { tl: 16, tr: 0, bl: 16, br: 0 });
    g.fillStyle(COLOR.leatherDarkNum, 1);
    g.fillRect(PANEL_X, panelY, POUCH_W, FLAP_H);
    // The flap's clasp — a small dark tab hanging off its bottom edge.
    g.fillRoundedRect(PANEL_X + POUCH_W / 2 - 17, panelY + FLAP_H - 2, 34, 18, { tl: 0, tr: 0, bl: 16, br: 16 });
    this.layer.add(g);

    // "holding: X — pick an empty pocket" — the wireframe §7 step-1 pill.
    // Informational only (dark-surface utility-pill styling, matching
    // `drawFooter`'s tab pills — this sits on the leather pouch, not the
    // parchment inspect card, so it is NOT the on-canvas button family).
    // The actual cancel control lives on the inspect card's action row
    // (`drawInspect`), reusing the drop button's own position/gesture per
    // the wireframe's "the same drop control cancels the move."
    if (this.tab === "satchel" && this.moving) {
      this.text(PANEL_X + 20, panelY + 8, `Holding: ${this.moving.label} — pick an empty pocket`, COLOR.onAccent, 13, FONT.mono)
        .setPadding(10, 6, 10, 6)
        .setBackgroundColor(COLOR.gold);
    }

    const gridW = POCKET_COLS * POCKET + (POCKET_COLS - 1) * POCKET_GAP;
    const gx0 = PANEL_X + (POUCH_W - gridW) / 2;
    const gy0 = panelY + FLAP_H + POUCH_PAD;

    for (let i = 0; i < capacity; i++) {
      const col = i % POCKET_COLS;
      const row = Math.floor(i / POCKET_COLS);
      const px = gx0 + col * (POCKET + POCKET_GAP);
      const py = gy0 + row * (POCKET + POCKET_GAP);
      const entry = list[i] ?? null;
      this.drawPocketTile(entry, i, px, py);
    }
  }

  private drawPocketTile(entry: SatchelSlotEntry | null, index: number, x: number, y: number): void {
    const cx = x + POCKET / 2;
    const cy = y + POCKET / 2;
    // A legal move target: satchel tab, a move is armed, this pocket is
    // genuinely empty, and it is not the pocket the item is being held FROM
    // (the wireframe's own rule — that one open target is excluded, everyone
    // else empty is fair game).
    const isMoveTarget = this.tab === "satchel" && this.moving !== null && this.moving.fromSlot !== index;

    if (!entry) {
      // Diagonal hatch, not a flat fill — the mockup's `.pocket.empty`
      // (`repeating-linear-gradient(45deg, ...)`). A repeating `TileSprite`,
      // not a masked Graphics pattern — Phaser 4's WebGL renderer doesn't
      // support the classic `setMask` (see `ensureHatchTexture`'s header).
      //
      // NOTE ON ORDER: `this.layer` (a Container) renders children in ADD
      // ORDER, not by `.setDepth()` — confirmed the hard way (an "empty"
      // label added before its background rendered UNDER it). So hatch and
      // border are added FIRST, and only then is the label text created —
      // `text()` adds to the layer itself, on call, so creation order here
      // IS stacking order.
      const hatch = this.add.tileSprite(cx, cy, POCKET, POCKET, "satchel-hatch");
      const border = this.add
        .rectangle(cx, cy, POCKET, POCKET)
        .setStrokeStyle(isMoveTarget ? 2 : 1, isMoveTarget ? COLOR.goldNum : COLOR.leatherDarkNum, 0.9)
        .setFillStyle();
      this.layer.add([hatch, border]);
      const empty = this.text(
        cx,
        cy,
        isMoveTarget ? "Place here" : "Empty",
        isMoveTarget ? COLOR.gold : COLOR.mutedOnLeather,
        15,
        FONT.display,
      ).setOrigin(0.5);
      empty.setFontStyle("italic");
      if (isMoveTarget) {
        hatch.setInteractive({ useHandCursor: true });
        hatch.on("pointerover", () => hatch.setScale(1.04));
        hatch.on("pointerout", () => hatch.setScale(1));
        hatch.on("pointerdown", () => this.completeMove(index));
      }
      return;
    }

    const pocket = entry.pocket;
    const selected = index === this.selected;
    // "Armed" — the pocket a move is currently holding FROM. Dimmed and
    // non-interactive (the drop control on the inspect card cancels; the
    // wireframe's own rule is this pocket can't be re-targeted, only every
    // OTHER empty one can).
    const armed = this.tab === "satchel" && this.moving?.fromSlot === index;
    const highlighted = selected || armed;
    const tile = this.add
      .rectangle(cx, cy, POCKET, POCKET, COLOR.pocketNum, armed ? 0.5 : 1)
      .setStrokeStyle(highlighted ? 3 : 1, highlighted ? COLOR.goldNum : COLOR.leatherDarkNum, highlighted ? 1 : 0.7);
    this.layer.add(tile);

    if (!armed) {
      tile.setInteractive({ useHandCursor: true });
      tile.on("pointerover", () => tile.setScale(1.03));
      tile.on("pointerout", () => tile.setScale(1));
      tile.on("pointerdown", () => {
        if (this.moving) return; // only an empty pocket (or cancel) acts mid-move
        this.selected = index;
        this.confirmingDrop = false;
        this.redraw();
      });
    }

    this.drawItemIcon(pocket.id, cx, cy - 20, POCKET * 0.38);

    const label = this.text(cx, cy + POCKET * 0.32, pocket.label, COLOR.inkOnCanvas, 14, FONT.display).setOrigin(
      0.5,
    );
    label.setWordWrapWidth(POCKET - 20, true);

    if (armed) {
      this.text(cx, y + 10, "ARMED", COLOR.gold, 11, FONT.mono).setOrigin(0.5, 0);
    }

    const badgeText = pocket.free ? "free" : pocket.count !== null ? String(pocket.count) : "";
    if (badgeText) {
      const badge = this.text(x + POCKET - 16, y + POCKET - 16, badgeText, COLOR.gold, 13, FONT.mono)
        .setOrigin(1, 1)
        .setPadding(6, 3, 6, 3)
        .setBackgroundColor(COLOR.leatherDarkHex);
      this.layer.add(badge);
    }
  }

  private drawInspect(entry: SatchelSlotEntry | null): void {
    const panelY = PANEL_TOP;
    const g = this.add.graphics();
    g.fillGradientStyle(COLOR.canvas2Num, COLOR.canvas2Num, COLOR.canvas, COLOR.canvas, 1);
    g.fillRoundedRect(INSPECT_X, panelY, INSPECT_W, PANEL_H, { tl: 0, tr: 16, bl: 0, br: 16 });
    this.layer.add(g);

    const x = INSPECT_X + 34;
    let y = panelY + 34;
    const pocket = entry?.pocket ?? null;
    if (!pocket) {
      this.text(x, panelY + PANEL_H / 2 - 10, "An empty pocket.", COLOR.inkSoftOnCanvas, 20, FONT.display);
      return;
    }

    this.text(x, y, pocket.kind.toUpperCase(), COLOR.inkSoftOnCanvas, 13, FONT.mono);
    y += 26;
    this.text(x, y, pocket.label, COLOR.inkOnCanvas, 32, FONT.display);
    y += 44;
    const desc = this.text(x, y, pocket.description, COLOR.inkSoftOnCanvas, 17, FONT.display);
    desc.setFontStyle("italic");
    y += 40;

    this.drawItemIcon(pocket.id, x + INSPECT_W / 2 - 34, y + 60, 92);
    y += 150;

    this.text(x, y, "CARRIED FOR", COLOR.inkSoftOnCanvas, 12, FONT.mono);
    y += 26;
    if (!pocket.carriedFor.length) {
      this.text(x, y, "no known spell needs this yet", COLOR.inkSoftOnCanvas, 16, FONT.display);
      y += 34;
    } else {
      let cx = x;
      for (const c of pocket.carriedFor) {
        const chip = this.text(cx, y, c.phrase + (c.known ? " · known" : ""), COLOR.inkOnCanvas, 14, FONT.mono)
          .setPadding(9, 5, 9, 5)
          .setBackgroundColor(c.known ? COLOR.chipKnownBg : COLOR.chipUnknownBg);
        this.layer.add(chip);
        cx += chip.width + 10;
        if (cx > INSPECT_X + INSPECT_W - 120) {
          cx = x;
          y += 38;
        }
      }
      y += 44;
    }

    if (pocket.free) {
      this.text(
        x,
        y,
        "Free to carry — never spent, and never takes a pocket.",
        COLOR.inkSoftOnCanvas,
        15,
        FONT.display,
      );
    }

    // Act row — §7's addition, extended by the satchel-cluster track
    // (2026-08-23): BOTH tabs act now (see the class header on Arms). §14
    // §4.3 on-canvas button family: the moves are the neutral variant, Drop
    // the warn variant (same one save-load.html ships for "Start over" —
    // `canvasButton`, below, is the same shape). Buttons split the row
    // evenly, however many of them apply.
    if (entry) {
      const armed = this.moving !== null; // click-guards keep `selected` pinned to the origin while armed
      const btnY = panelY + PANEL_H - 34 - 40;
      const rowW = INSPECT_W - 2 * 34;
      if (armed) {
        this.text(x, btnY - 24, "Holding it — pick an empty pocket, or cancel.", COLOR.inkSoftOnCanvas, 13);
        this.canvasButton(x, btnY, rowW, 40, "Cancel Move", "neutral", () => this.cancelMove());
      } else {
        const buttons: { label: string; kind: "neutral" | "warn"; onClick: () => void }[] = [];
        if (this.tab === "satchel") {
          if (entry.slotIndex !== null) {
            buttons.push({ label: "Move", kind: "neutral", onClick: () => this.startMove(entry) });
            if (this.view.arms.length < this.view.armsCapacity) {
              buttons.push({ label: "To Arms", kind: "neutral", onClick: () => this.moveToArms(entry) });
            }
          }
        } else if (this.view.satchelSlots.includes(null)) {
          // Arms tab: RAW `satchelSlots` decides room, not the effective
          // (consumed-hidden) view — `moveArmsPoolToSatchel` lands in a raw
          // free pocket, and a consumed-but-uncleared slot is not one.
          buttons.push({ label: "To Satchel", kind: "neutral", onClick: () => this.moveArmsEntryToSatchel(entry) });
        }
        const warn = this.confirmingDrop ? this.warnLineFor(pocket) : null;
        if (warn) {
          this.text(x, btnY - 24, warn, COLOR.danger, 13).setWordWrapWidth(INSPECT_W - 68, true);
        }
        buttons.push({
          label: this.confirmingDrop ? "Confirm Drop" : "Drop It",
          kind: "warn",
          onClick: () => this.dropSelected(entry),
        });
        const btnW = (rowW - 10 * (buttons.length - 1)) / buttons.length;
        buttons.forEach((b, i) => this.canvasButton(x + i * (btnW + 10), btnY, btnW, 40, b.label, b.kind, b.onClick));
      }
    }
  }

  /**
   * An on-canvas button — §14 §4.3, the parchment-context variant. `neutral`
   * (Move / Cancel Move): transparent fill, `stitch` border, `ink` text,
   * gold on hover. `warn` (Drop It): same shape, `danger` text/border — the
   * shipped warn color `SaveLoadScene.canvasButton`'s "warn" kind already
   * uses for "Start over" (reused verbatim here, not a new color).
   */
  private canvasButton(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    kind: "neutral" | "warn",
    onClick: () => void,
  ): void {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const borderIdle = kind === "warn" ? DANGER_NUM : COLOR.stitchNum;
    const textIdle = kind === "warn" ? COLOR.danger : COLOR.inkOnCanvas;
    const bg = this.add.rectangle(cx, cy, w, h, 0x000000, 0.0001).setStrokeStyle(1, borderIdle, 0.9);
    this.layer.add(bg);
    const t = this.text(cx, cy, label, textIdle, 14, FONT.mono).setOrigin(0.5);

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerover", () => {
      bg.setFillStyle(kind === "warn" ? DANGER_NUM : COLOR.goldNum, 0.14);
      bg.setStrokeStyle(1, kind === "warn" ? DANGER_NUM : COLOR.goldNum, 1);
      t.setColor(kind === "warn" ? COLOR.danger : COLOR.gold);
    });
    bg.on("pointerout", () => {
      bg.setFillStyle(0x000000, 0.0001);
      bg.setStrokeStyle(1, borderIdle, 0.9);
      t.setColor(textIdle);
    });
    bg.on("pointerdown", onClick);
    t.setInteractive({ useHandCursor: true }).on("pointerdown", onClick);
  }

  /** Selecting Move lifts the item into your hand — nothing is committed to
   * `LanternPlayer` yet (see `MoveHold`'s header). Only a real satchel-slot
   * item can be moved; the inspect action row already hides the button for
   * an unslotted extra, so `entry.slotIndex` is non-null here by contract,
   * but the check stays for anyone calling this from elsewhere later. */
  private startMove(entry: SatchelSlotEntry): void {
    if (entry.slotIndex === null) return;
    this.moving = { fromSlot: entry.slotIndex, itemId: entry.pocket.id, label: entry.pocket.label };
    this.confirmingDrop = false;
    this.redraw();
  }

  /** Hands back to the original pocket — no target required, per the
   * wireframe's own rule. No data mutation: nothing was committed yet. */
  private cancelMove(): void {
    this.moving = null;
    this.redraw();
  }

  /** One-click satchel pocket -> arms (no target to pick — arms is a dense
   * buffer, not addressable pockets). Commits through `onMoveToArms`
   * (host-owned: `LanternPlayer.moveSatchelSlotToArms`), then redraws
   * against the fresh view. */
  private moveToArms(entry: SatchelSlotEntry): void {
    if (entry.slotIndex === null) return;
    this.view = this.onMoveToArms(entry.slotIndex);
    this.confirmingDrop = false;
    this.redraw();
  }

  /** One-click arms -> first free satchel pocket. By item id — see
   * `SatchelSceneData.onMoveArmsToSatchel` on the pool join. */
  private moveArmsEntryToSatchel(entry: SatchelSlotEntry): void {
    this.view = this.onMoveArmsToSatchel(entry.pocket.id);
    this.confirmingDrop = false;
    this.redraw();
  }

  /** Clicking a legal empty pocket while a move is armed. Commits for real
   * through `onMove` (host-owned: `LanternPlayer.moveSatchelSlot`), then
   * redraws against the fresh view it returns and follows the item to its
   * new slot so the inspect card keeps showing it. */
  private completeMove(toSlot: number): void {
    if (!this.moving) return;
    const view = this.onMove(this.moving.fromSlot, toSlot);
    this.moving = null;
    this.view = view;
    this.selected = toSlot;
    this.redraw();
  }

  /**
   * Drop-confirmation is a setting (wireframe §7, "Decided — revision 4"),
   * not a fixed rule: `PlayerSettings.dropConfirmAlways` — default only warns
   * when a known spell still needs the item (`carriedFor` non-empty), the
   * alt always warns. When a warning applies, the FIRST click arms
   * `confirmingDrop` (relabels the button, shows the line) and the SECOND
   * commits; when it doesn't apply, the first click commits immediately —
   * there is nothing to confirm. Commits through `onDrop` (host-owned: both
   * `Inventory.drop` and, when slotted, `LanternPlayer.dropSatchelSlot`).
   */
  private dropSelected(entry: SatchelSlotEntry): void {
    const needsWarn = PlayerSettings.dropConfirmAlways || entry.pocket.carriedFor.length > 0;
    if (needsWarn && !this.confirmingDrop) {
      this.confirmingDrop = true;
      this.redraw();
      return;
    }
    const view = this.onDrop(entry.pocket.id, entry.slotIndex);
    this.confirmingDrop = false;
    this.view = view;
    this.redraw();
  }

  /** The warning line shown once `confirmingDrop` is armed — reuses
   * `pocket.carriedFor`, the same data the inspect card already computes for
   * its own "carried for" chips, so a spell-needs-this warning is never a
   * second, independently-maintained fact. `null` means "don't show a line
   * at all," distinct from an empty string. */
  private warnLineFor(pocket: Pocket): string | null {
    if (!pocket.carriedFor.length) {
      return PlayerSettings.dropConfirmAlways ? "Nothing needs this yet, but dropping it can't be undone." : null;
    }
    const names = pocket.carriedFor.map((c) => c.phrase);
    const list = names.length === 1 ? names[0] : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
    return `${list} still need${names.length === 1 ? "s" : ""} this`;
  }

  /** Tabs left, Close pinned right — the mockup's `.foot` row (tabs, a flex
   * spacer, then `[ close — Esc ]` as the last element), not a HUD button. */
  private drawFooter(): void {
    const y = PANEL_TOP + PANEL_H + 34;
    let x = PANEL_X;
    for (const t of ["satchel", "arms"] as Tab[]) {
      const hot = t === this.tab;
      // The Arms tab carries a live count whenever arms is non-empty — the
      // "you can't see it in your arm" half of Roc's 2026-08-23 note: a
      // pickup that spilled to arms is visible without switching tabs.
      const label =
        t === "arms" && this.view.arms.length > 0
          ? `Arms · ${this.view.arms.length}/${this.view.armsCapacity}`
          : t[0].toUpperCase() + t.slice(1);
      const btn = this.text(x, y, label, hot ? COLOR.onAccent : COLOR.gold, 18, FONT.mono)
        .setPadding(12, 8, 12, 8)
        .setBackgroundColor(hot ? COLOR.gold : COLOR.panelHex);
      btn.setInteractive({ useHandCursor: true });
      btn.on("pointerdown", () => {
        this.tab = t;
        this.selected = 0;
        this.moving = null; // Arms has no slot API — never carry an armed move across tabs
        this.confirmingDrop = false;
        this.redraw();
      });
      x += btn.width + 12;
    }

    // The §14 Utility pill (`ui/buttons.ts`), not the old `[ bracket ]` text —
    // the same control `ModalFrame.button` draws everywhere else. `originX: 1`
    // keeps it flush to the panel's right edge, where the text used to sit.
    utilityPill(this, PANEL_X + PANEL_W, y, "[ Close — Esc ]", () => this.close(), {
      container: this.layer,
      fontSize: "16px",
      originX: 1,
    });
  }

  private text(x: number, y: number, value: string, color: string, size: number, font: string = FONT.display): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, value, { fontFamily: font, fontSize: `${size}px`, color });
    this.layer.add(t);
    return t;
  }

  /** The item icon for a pocket tile or the inspect card — the real per-item
   * photo when loaded, else the category glyph / leaf fallback (see
   * `makeItemIcon`, the one shared render rule). Adds the object to `this.layer`
   * — creation order is stacking order here (see `drawPocketTile`'s note). */
  private drawItemIcon(id: string, cx: number, cy: number, box: number): void {
    this.layer.add(makeItemIcon(this, id, cx, cy, box));
  }
}
