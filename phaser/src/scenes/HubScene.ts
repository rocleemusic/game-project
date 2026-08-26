/**
 * Home Hub decoration sandbox.
 *
 * Everything is unlocked: every collectible item and key item is granted as an
 * infinite palette, so arranging can be exercised without playing a week. The
 * palette COPIES on drag rather than moving — it is a source, not an inventory.
 *
 * The design question this exists to answer: free placement or snap slots?
 * Free-drag alone tends to read as sloppy; slots alone read as a checklist. So
 * this is free drag on a soft 16px grid, with depth sorted by y so lower pieces
 * draw in front — which fakes depth on a flat backdrop for nothing.
 *
 * Toggle `home` / `meta` to compare the two spaces the GDD describes. Meta-hub
 * pieces are display-only and refuse to move, which is the rule under test.
 */

import Phaser from "phaser";
import { Decor, type Placement, type RegionRect, type Surface } from "../world/Decor";
import type { ItemRecord } from "../magic/types";
import { COLOR, FONT, sceneFadeIn } from "../ui/theme";
import { PlayerSettings } from "../world/PlayerSettings";
import { VN_METRICS } from "../world/view/DialogueLayout";
import {
  RoomZoomModel,
  ROOM_ZOOM_DEFAULT,
  ROOM_ZOOM_DEFAULT_OFFSET_Y,
  ROOM_ZOOM_STEP,
} from "../world/view/RoomZoomModel";
import {
  GLYPH_FILES,
  GLYPH_TEXTURE_SIZE,
  glyphTextureKey,
  makeItemIcon,
  type GlyphKind,
} from "./SatchelScene";

const W = 1920;
const H = 1080;
/**
 * The HOME backdrop, with the diorama's cream paper ground repainted to
 * `COLOR.night` — Roc, 2026-08-23: "we want to get the white background to
 * be black." Generated once by `tools/key-diorama-ground.mjs` (a sibling of
 * the existing `tools/key-black.mjs`) and living beside the shelf close-up
 * crop in the run's image folder, which is the precedent `HubShelfScene`'s
 * own `BG_KEY` already sets for a non-manifest image a scene loads itself.
 *
 * Why the art and not a crop: `ROOM_ZOOM_DEFAULT` clears the cream at the
 * frame edges, but the room's footprint is a diamond, so a 16:9 window onto
 * it always clips a cream corner somewhere — panning just moves which one.
 *
 * Keyed off the HOME backdrop specifically, and used only when the texture
 * actually loaded, so any other backdrop (or a missing file) falls straight
 * back to `backdropKey` and the screen still draws.
 */
const HOME_BACKDROP_KEY = "bg:HOME";
const HOME_DARK_KEY = "bg:HOME:dark";
const HOME_DARK_FILE = "run-images/home-hub-diorama-dark.png";
const GOLD = COLOR.gold;
const INK = COLOR.ink;
/** The numeric form of the `danger` token — same derivation SatchelScene's
 * `canvasButton` and SaveLoadScene's warn button use, since `COLOR.danger`
 * is only published as a hex string and Graphics fills/strokes need a
 * number. Reused here for the session cluster's "New Life" pill — the
 * shipped warn family, not a new destructive color. */
const DANGER_NUM = Phaser.Display.Color.HexStringToColor(COLOR.danger).color;

/**
 * Click-to-place/click-to-move hold — the non-drag alternative to the
 * palette-drag and piece-drag paths (WCAG 2.5.7, dragging movements need a
 * single-pointer equivalent). Mirrors `SatchelScene`'s `MoveHold`: nothing
 * commits to `Decor` until a legal destination is actually clicked, so
 * closing the Hub or hitting Esc mid-hold leaves no partial state. Two
 * flavors share one field because the completion gesture (click a spot in
 * the room) is identical either way — only which `Decor` call fires differs.
 *
 * The "move" flavor lost its own on-screen button in T7 (Roc, 2026-08-23:
 * "we should just be able to click and drag specific items, don't need a
 * move button"). It is still armed two ways, so the non-drag path survives
 * the button: `M` with a piece selected, and — for a pointer-only player —
 * `remove` then place the returned copy again from the banked row, which is
 * click-only end to end. See `drawPieceActions`.
 */
interface ClickHold {
  kind: "place" | "move";
  itemId: string;
  label: string;
  /** Set only for "move" — the placement being relocated. */
  uid?: string;
}

export interface HubSceneData {
  items: ItemRecord[];
  backdropKey: string;
  onClose: () => void;
  /**
   * Mode 3 (Roc, 2026-08-13): if set, the palette is restricted to these
   * ids — what the player has actually found, not every collectible item in
   * the game. `undefined` keeps the sandbox behaviour `ScreenScene` relies
   * on (everything unlocked); an empty array is a real "found nothing yet,"
   * not the same as "ungated."
   */
  discoveredOnly?: string[];
  /**
   * `run.decorSurfaces.HOME` — the authored surface rects
   * (`lantern-projects/v01/decor-surfaces.json`, closed GAPS.md G14). A
   * separate file from `regions.json` on purpose — see that file's header
   * and `Decor.ts`'s. `Decor` falls back to its old guessed geometry when
   * this is absent, so omitting it degrades rather than breaks.
   */
  homeRegions?: Record<string, RegionRect>;
  /**
   * `PlayView.banked` — the item ids actually banked at home, one entry per
   * copy. When set, the palette stops being an infinite source and draws
   * DOWN from this stock: three river stones banked is three placements,
   * and a fourth is not on offer (Roc, 2026-08-23 — "no multiples, draw down
   * from banked"). Removing a placed piece hands its copy straight back.
   *
   * Omitting it keeps the old sandbox palette, which is what the `__hub`
   * debug handle and the standalone scene still run on.
   */
  banked?: string[];
  /**
   * Called after every change to the room's placements — from this scene AND
   * from the shelf close-up, which shares this scene's live `Decor` instance
   * (`openShelfCloseUp`), so one wire covers both views.
   *
   * `CollectScene` passes "capture the save now". Decorating fires none of the
   * three events the autosave is bound to (`screen:changed`, `item:acquired`,
   * `gate:cleared`), so without this the save file never learned a thing was
   * placed and the next resume wiped the shelf — Roc's 2026-08-23 note. See
   * `Decor.onChange` for the full accounting. Optional: a caller with no save
   * layer omits it.
   */
  onDecorChanged?: () => void;
  /**
   * The scene that opened this one, if it wants to stop RENDERING while the
   * Hub is up. `scene.pause()` (what every caller already does) freezes
   * update but keeps the paused scene drawing underneath, so the day loop's
   * go-to pills, nav row and satchel strip are still being painted behind
   * the Hub's own backdrop every frame — Roc, 2026-08-23: "in Home Hub we
   * want to hide the go-to buttons ... home hub should just be the home hub
   * screen." Restored on `close()`. Optional: a caller that has nothing
   * behind it (the standalone `__hub` debug path) omits it.
   */
  launcherKey?: string;
}

export class HubScene extends Phaser.Scene {
  private decor!: Decor;
  private items!: ItemRecord[];
  private backdropKey!: string;
  private onClose!: () => void;
  private discoveredOnly?: Set<string>;

  private pieceLayer!: Phaser.GameObjects.Container;
  private uiLayer!: Phaser.GameObjects.Container;
  private selected: string | null = null;
  /**
   * Room zoom/pan (wireframe §8, "Zoom and pan the room," decided revision
   * 4 — a scale on the current view, not a second camera). `pieceLayer`
   * doubles as the room-content container this drives: everything already
   * added to it (pieces, surface hints) inherits `roomLayerTransform`
   * unchanged, no per-child repositioning needed. `backdropObj` gets
   * `RoomZoomModel.scale`/`place()` directly, same call shape
   * `BackdropSystem` already uses for the ambient pan. See
   * `RoomZoomModel`'s own header for why this is a separate class from the
   * ambient `PanModel`.
   */
  private roomZoom!: RoomZoomModel;
  private backdropObj?: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle;
  /** The "165% · scroll to zoom" readout + "Fit — Esc" pill — a container
   * separate from `uiLayer` so a bare zoom/pan change (`applyRoomZoom()`,
   * firing every wheel tick and drag frame) can refresh it without paying
   * for a full decor `redraw()` (which rebuilds the whole palette/chrome). */
  private zoomLayer!: Phaser.GameObjects.Container;
  private zoomReadout!: Phaser.GameObjects.Text;
  /**
   * Clips `pieceLayer` (the zoomed room-content layer) to the room band —
   * below the header chrome, above the palette bar — so a zoomed hotspot
   * label can never paint over the fixed header. Phaser 4 WebGL silently
   * no-ops `Graphics.setMask()` (rendering-lessons checklist, 2026-08-19
   * handoff), so this uses the same real clip primitive `NotebookScene`'s
   * VFX preview already relies on: a second camera with its own viewport,
   * scrolled so it renders the identical world region at the identical
   * screen position, just bounded to a smaller rectangle. `cameras.main`
   * ignores `pieceLayer` and this camera ignores everything else, so the
   * two together draw the full scene exactly once each frame.
   */
  private roomCamera!: Phaser.Cameras.Scene2D.Camera;
  /** True between a pointerdown on empty backdrop and the matching
   * pointerup — the drag-to-pan gesture. Only ever started while zoomed in
   * (`roomZoom.pannable`); "nothing moves on its own." */
  private draggingRoom = false;
  private dragAnchor = { x: 0, y: 0, offsetX: 0, offsetY: 0 };
  /** The palette bar's own top edge (`drawPalette()`'s rectangle,
   * `H - 96` centre / 192 tall) — wheel/drag over that opaque panel must
   * not also zoom or pan the room underneath it, the same "protect the HUD
   * from the pan" rule `BackdropSystem`'s `pointerBand` enforces for the
   * ambient case, reapplied here for the one real panel this screen has. */
  private static readonly ROOM_AREA_BOTTOM = H - 192;
  /** The header chrome's own bottom edge — title, subtitle, the space/
   * session button row, the "165% · scroll to zoom" readout, and the
   * "Fit — Esc" pill all finish by y≈152 (see `drawChrome()` and the
   * `zoomLayer` block in `create()`). Mirrors `ROOM_AREA_BOTTOM`'s role for
   * the palette bar: the top bound of `roomCamera`'s clip viewport below. */
  private static readonly ROOM_AREA_TOP = 160;
  /** Set only while a click-to-place/click-to-move is armed — see `ClickHold`. */
  private clickHold: ClickHold | null = null;
  /**
   * Whether the authored surface rects draw as visible outlines. OFF by
   * default (Roc, 2026-08-23: "the blocks or regions right now should just
   * be viewable if I toggle on debug mode, they want to normally be
   * hidden") — the room is a room, not an editor canvas. `D` toggles it, and
   * `?debug=1` opens with it on so a scenario or a level-authoring session
   * doesn't have to press a key first.
   *
   * The shelf region is the one thing that stays live with this off: it is
   * the ONLY door into `HubShelfScene`, so hiding it outright would strand
   * the sixteen cubbies. It reveals its outline and label on hover instead —
   * the standard point-and-click hotspot idiom, and the same reveal-on-hover
   * language `HotspotSystem` already uses in the world screens.
   */
  private debugRegions = false;
  /** See `HubSceneData.launcherKey`. */
  private launcherKey?: string;
  /** The "Reset view — Esc" pill's own container, so `applyRoomZoom()` can
   * hide it while the view is exactly where it opened (a control with
   * nothing to do is the `ui-builder.md` "Options trap") without rebuilding
   * the zoom chrome. */
  private resetPill!: Phaser.GameObjects.Container;

  constructor() {
    super("HubScene");
  }

  init(data: HubSceneData) {
    this.items = data.items;
    this.backdropKey = data.backdropKey;
    this.onClose = data.onClose;
    this.discoveredOnly = data.discoveredOnly ? new Set(data.discoveredOnly) : undefined;
    this.decor = new Decor("home", data.homeRegions, data.banked, data.onDecorChanged);
    this.launcherKey = data.launcherKey;
    this.selected = null;
    this.draggingRoom = false;
    this.clickHold = null;
    this.debugRegions = new URLSearchParams(location.search).has("debug");
  }

  /** Same six material SVGs `SatchelScene` loads (`public/art/ui/satchel/
   * *.svg`), reused rather than redrawn — §11 of the style guide's "one
   * icon set, not one per screen" rule. Guarded by `textures.exists()` so
   * loading this scene standalone (Satchel never having run first) still
   * works, and re-loading when it HAS run first is a no-op either way. */
  preload() {
    for (const kind of Object.keys(GLYPH_FILES) as Exclude<GlyphKind, "leaf">[]) {
      const key = glyphTextureKey(kind);
      if (this.textures.exists(key)) continue;
      this.load.svg(key, `art/ui/satchel/${GLYPH_FILES[kind]}.svg`, {
        width: GLYPH_TEXTURE_SIZE,
        height: GLYPH_TEXTURE_SIZE,
      });
    }
    if (this.backdropKey === HOME_BACKDROP_KEY && !this.textures.exists(HOME_DARK_KEY)) {
      this.load.image(HOME_DARK_KEY, HOME_DARK_FILE);
    }
  }

  /** The texture the room actually draws — see `HOME_DARK_KEY`. */
  private roomBackdropKey(): string {
    return this.backdropKey === HOME_BACKDROP_KEY && this.textures.exists(HOME_DARK_KEY)
      ? HOME_DARK_KEY
      : this.backdropKey;
  }

  create() {
    sceneFadeIn(this);
    // "Just the home hub screen" — see `HubSceneData.launcherKey`. Stopping
    // the launcher from rendering is what actually removes the day loop's
    // go-to pills from this screen; the Hub's own backdrop merely covered
    // them before, and covered them at the cost of a second full-frame
    // backdrop drawn every frame underneath this one.
    if (this.launcherKey) this.scene.setVisible(false, this.launcherKey);
    // Opens zoomed in and nudged down, not at plain Fit — see
    // `ROOM_ZOOM_DEFAULT` and `ROOM_ZOOM_DEFAULT_OFFSET_Y`.
    this.roomZoom = new RoomZoomModel(W, H, ROOM_ZOOM_DEFAULT, ROOM_ZOOM_DEFAULT_OFFSET_Y);
    const roomKey = this.roomBackdropKey();
    const backdrop: Phaser.GameObjects.Image | Phaser.GameObjects.Rectangle = this.textures.exists(roomKey)
      ? this.add.image(0, 0, roomKey).setDepth(0)
      : this.add.rectangle(0, 0, W, H, COLOR.night).setDepth(0);
    const [imgW, imgH] = backdrop instanceof Phaser.GameObjects.Image ? [backdrop.width, backdrop.height] : [W, H];
    backdrop.setScale(this.roomZoom.fit(imgW, imgH));
    const at0 = this.roomZoom.place();
    backdrop.setPosition(at0.x, at0.y);
    this.backdropObj = backdrop;
    // Light scrim only — the room should still read as a room. Fixed,
    // full-viewport, deliberately NOT part of the room zoom (same precedent
    // `BackdropSystem`'s own scrim sets for the ambient pan) — a lighting
    // effect over the frame, not room content to zoom into.
    const scrim = this.add.rectangle(W / 2, H / 2, W, H, COLOR.night, 0.25).setDepth(1);

    this.pieceLayer = this.add.container(0, 0).setDepth(10);
    this.uiLayer = this.add.container(0, 0).setDepth(100);
    this.zoomLayer = this.add.container(0, 0).setDepth(101);
    this.zoomReadout = this.add.text(W - 40, 84, "", {
      fontFamily: FONT.mono,
      fontSize: "16px",
      color: COLOR.dim,
    }).setOrigin(1, 0);
    this.zoomLayer.add(this.zoomReadout);
    // The room now OPENS zoomed (`ROOM_ZOOM_DEFAULT`), so "Fit" stopped
    // being the thing this pill returns to — it returns to the view the
    // screen opened in. Its own container so `applyRoomZoom()` can hide it
    // while there is nothing to reset.
    this.resetPill = this.add.container(0, 0);
    this.zoomLayer.add(this.resetPill);
    const resetW = this.pillWidth("Reset view — Esc");
    this.utilityPill(W - 40 - resetW, 108, "Reset view — Esc", () => {
      this.roomZoom.reset();
      this.applyRoomZoom();
    }, false, this.resetPill);

    // The clip itself (see `roomCamera`'s field doc). `setScroll(0, roomTop)`
    // cancels out the viewport's own y-offset, so this camera renders the
    // exact same world region at the exact same screen position as the main
    // camera would — only bounded to a smaller rectangle. Split, not shared:
    // each camera draws a disjoint half of the display list, so nothing is
    // rendered twice and nothing new needs re-wiring on every `redraw()`
    // (the ignore calls are on the two CONTAINERS, not their children).
    const roomTop = HubScene.ROOM_AREA_TOP;
    const roomHeight = HubScene.ROOM_AREA_BOTTOM - roomTop;
    this.roomCamera = this.cameras.add(0, roomTop, W, roomHeight);
    this.roomCamera.setScroll(0, roomTop);
    this.roomCamera.ignore([backdrop, scrim, this.uiLayer, this.zoomLayer]);
    this.cameras.main.ignore(this.pieceLayer);

    // Dragging is the PRIMARY placement gesture here now, and every chip
    // that can be dragged can also be clicked — with the default threshold
    // of 0 a one-pixel wobble during a click registers as a drag, which for
    // a palette chip means the click silently does nothing (the drag ends
    // over the palette bar, which is not a legal drop). 6px is the usual
    // slop for "that was a click."
    this.input.dragDistanceThreshold = 6;

    this.input.keyboard?.on("keydown-ESC", () => {
      // A click-to-place/move hold is the innermost state — cancel it first,
      // same precedence a real Esc-out chain always uses (armed action, then
      // zoom, then the screen itself).
      if (this.clickHold) {
        this.clickHold = null;
        this.redraw();
        return;
      }
      // "Reset view — Esc" (§8, decided revision 4): while the view has been
      // moved off where it opened, Esc is the escape hatch back to the whole
      // room, not the Hub itself — a second Esc (now back at the default
      // view) closes the Hub, same nested-back-out shape as any
      // modal-over-modal in this project. Measured against `atDefault`, not
      // `pannable`, since the Hub now OPENS zoomed and pannable: gating on
      // `pannable` would have made the first Esc a no-op forever and left
      // the keyboard with no way out of the screen at all.
      if (!this.roomZoom.atDefault) {
        this.roomZoom.reset();
        this.applyRoomZoom();
        return;
      }
      this.close();
    });
    this.input.keyboard?.on("keydown-DELETE", () => {
      if (this.selected) {
        // A stale "move" hold pointed at a now-deleted piece would keep
        // claiming to hold it (`completeClickHold` no-ops harmlessly against
        // a missing uid, but the hint text lies) — clear it here, same as
        // the Esc/close/mode-switch paths already do.
        if (this.clickHold?.uid === this.selected) this.clickHold = null;
        this.decor.remove(this.selected);
        this.selected = null;
        this.redraw();
      }
    });
    this.input.keyboard?.on("keydown-F", () => {
      if (this.selected) {
        this.decor.flip(this.selected);
        this.redraw();
      }
    });
    // Click-to-move, without the pill that used to arm it (T7). Dragging a
    // piece is the primary gesture now; this is what keeps a non-drag path
    // to the same result — see `ClickHold`'s header for the pointer-only
    // half of that story.
    this.input.keyboard?.on("keydown-M", () => {
      if (!this.selected || !this.decor.editable) return;
      const p = this.decor.all().find((q) => q.uid === this.selected);
      if (!p) return;
      const label = this.items.find((i) => i.item_id === p.itemId)?.description ?? p.itemId;
      this.clickHold = { kind: "move", uid: p.uid, itemId: p.itemId, label };
      this.redraw();
    });
    // Debug region overlay — see `debugRegions`.
    this.input.keyboard?.on("keydown-D", () => {
      this.debugRegions = !this.debugRegions;
      this.redraw();
    });

    // Scroll-to-zoom, cursor-centered — only when the pointer is over empty
    // room (not an interactive piece/button/chip, and not the opaque
    // palette panel). A piece under the pointer keeps its own wheel-to-
    // resize (`drawPieces()`'s chip handler) — Phaser's own hit-test order
    // resolves which one fires, the same resolution the drag conflict below
    // uses, not a new problem to invent (mode5 wireframe §8).
    this.input.on(
      "wheel",
      (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[], _dx: number, dy: number) => {
        if (!this.roomAreaHit(pointer, gameObjects)) return;
        const changed = this.roomZoom.zoomAt(pointer.x, pointer.y, dy > 0 ? -ROOM_ZOOM_STEP : ROOM_ZOOM_STEP);
        if (changed) this.applyRoomZoom();
      },
    );
    // Drag-to-pan — only starts on empty backdrop (a drag starting ON a
    // piece moves the piece, via the same piece's own `draggable` chip
    // listener) and only once zoomed in (`RoomZoomModel.panTo` itself
    // no-ops at Fit too — belt and braces).
    this.input.on("pointerdown", (pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[]) => {
      // Click-to-place/click-to-move's destination click — takes priority
      // over starting a pan, same "the piece's own listener owns that pixel"
      // resolution `roomAreaHit` already documents. Only fires over empty
      // room (no interactive object underneath), same as pan-start.
      if (this.clickHold && this.roomAreaHit(pointer, gameObjects)) {
        this.completeClickHold(pointer.x, pointer.y);
        return;
      }
      if (!this.roomAreaHit(pointer, gameObjects)) return;
      // Clicking empty room drops the selection — the missing half of "click
      // a piece to select it." Without it the move/flip/remove row had no
      // dismiss gesture at all (Esc goes to Fit, then leaves the Hub), so it
      // read as stuck on: the pills stayed over the last piece touched for
      // the rest of the session. Guarded on there being something to clear
      // so a plain pan-start doesn't pay for a full `redraw()` every time.
      if (this.selected !== null) {
        this.selected = null;
        this.redraw();
      }
      if (!this.roomZoom.pannable) return;
      this.draggingRoom = true;
      this.dragAnchor = {
        x: pointer.x,
        y: pointer.y,
        offsetX: this.roomZoom.offsetX,
        offsetY: this.roomZoom.offsetY,
      };
      this.applyRoomZoom();
    });
    this.input.on("pointermove", (pointer: Phaser.Input.Pointer) => {
      if (!this.draggingRoom) return;
      this.roomZoom.panTo(
        this.dragAnchor.offsetX + (pointer.x - this.dragAnchor.x),
        this.dragAnchor.offsetY + (pointer.y - this.dragAnchor.y),
      );
      this.applyRoomZoom();
    });
    const endRoomDrag = () => {
      if (!this.draggingRoom) return;
      this.draggingRoom = false;
      this.applyRoomZoom();
    };
    this.input.on("pointerup", endRoomDrag);
    this.input.on("pointerupoutside", endRoomDrag);

    this.expose();
    // Push the opening zoom onto `pieceLayer` and the zoom chrome. This used
    // to be skipped because the opening state WAS the identity transform —
    // `create()` set the backdrop's own scale by hand and there was nothing
    // else to do. Now that the room opens at `ROOM_ZOOM_DEFAULT`, skipping
    // it left the backdrop zoomed and every placed piece drawn at 100%, i.e.
    // pieces sliding off the furniture they were saved onto.
    this.applyRoomZoom();
    this.redraw();
  }

  /** Whether `(pointer, gameObjects)` is over pannable/zoomable room space —
   * no interactive object underneath (an object's own handler owns that
   * pixel instead) and above the palette bar's opaque panel. */
  private roomAreaHit(pointer: Phaser.Input.Pointer, gameObjects: Phaser.GameObjects.GameObject[]): boolean {
    return gameObjects.length === 0 && pointer.y < HubScene.ROOM_AREA_BOTTOM;
  }

  /**
   * Re-applies the current `RoomZoomModel` state to the backdrop and
   * `pieceLayer` (the room-content container) and refreshes the zoom
   * chrome. Called on every wheel tick and drag frame — deliberately NOT
   * routed through `redraw()`, which rebuilds the whole palette and chrome
   * and would make scrolling visibly janky for no reason.
   */
  private applyRoomZoom(): void {
    if (this.backdropObj) {
      this.backdropObj.setScale(this.roomZoom.scale);
      const at = this.roomZoom.place();
      this.backdropObj.setPosition(at.x, at.y);
    }
    const t = this.roomZoom.roomLayerTransform;
    this.pieceLayer.setScale(t.scale);
    this.pieceLayer.setPosition(t.x, t.y);

    // The readout is always on now that the room always opens zoomed — the
    // percentage is the only thing on screen that says why the room is
    // cropped. The reset pill only appears once there is something to reset.
    const mode = this.draggingRoom
      ? "drag to pan"
      : this.roomZoom.pannable
        ? "scroll to zoom · drag to pan"
        : "scroll to zoom";
    this.zoomReadout.setText(`${this.roomZoom.percentLabel} · ${mode}`);
    this.resetPill.setVisible(!this.roomZoom.atDefault);
  }

  /**
   * Resolves a click-to-place/click-to-move hold against the room point
   * clicked. `pointer.x/y` are SCREEN coordinates; `roomLayerTransform` is
   * the same inverse `pieceLayer`'s own scale/position apply (see that
   * field's header) — Phaser's drag plugin does this transform internally
   * for the existing drag path, so a click-based completion has to do it by
   * hand to land on the same room point a drag would have. `Decor.place`/
   * `moveTo` take the result as a `Decor`-space fraction, same as the drag
   * handlers already pass.
   */
  private completeClickHold(screenX: number, screenY: number): void {
    if (!this.clickHold) return;
    const t = this.roomZoom.roomLayerTransform;
    const x = (screenX - t.x) / t.scale / W;
    const y = (screenY - t.y) / t.scale / H;
    const hold = this.clickHold;
    this.clickHold = null;
    if (hold.kind === "place") {
      // Re-checked at the moment of commit, not only at arm time — the shelf
      // close-up can spend the last banked copy while this hold sits armed
      // underneath it.
      if (this.canPlace(hold.itemId)) this.decor.place(hold.itemId, x, y);
    } else if (hold.uid) {
      this.decor.moveTo(hold.uid, x, y);
      this.selected = hold.uid;
    }
    this.redraw();
  }

  private close() {
    this.input.keyboard?.removeAllListeners();
    // The room-zoom wheel/pointer listeners live on the scene's own input
    // plugin (`this.input`, not one chip's), same reason the keyboard ones
    // above get removed explicitly rather than trusted to scene teardown.
    this.input.removeAllListeners();
    // Hand rendering back before the launcher is resumed — leaving this to
    // the caller's `onClose` would mean any thrown callback strands the game
    // on an invisible scene.
    if (this.launcherKey) this.scene.setVisible(true, this.launcherKey);
    (window as unknown as Record<string, unknown>).__hub = undefined;
    this.scene.stop();
    this.onClose();
  }

  /**
   * What the palette offers. Three widening gates, most restrictive first:
   *
   *  - `banked` set — only what is actually banked at home, and only as many
   *    copies as are banked (the count lives on `Decor`; see `remaining`).
   *  - `discoveredOnly` set (mode 3) — what this life has ever found.
   *  - neither — the old sandbox, every collectible, infinite copies.
   *
   * A banked item whose last copy has been placed LEAVES the row (Roc,
   * 2026-08-23: "they should be removed from the banked area when you move
   * them onto the screen"). It used to stay on at "×0", greyed, so the row
   * could answer "where did my river stone go" — but the answer is on the
   * wall behind it, and a spent chip that still looks like stock is the
   * thing that made the palette read as an infinite source. Removing a
   * placement hands the copy straight back and the chip returns.
   */
  private palette(): ItemRecord[] {
    return this.items
      .filter((i) => i.collectible && i.persistence !== "world")
      .filter((i) =>
        this.decor.stockLimited
          ? this.decor.remaining(i.item_id) > 0
          : !this.discoveredOnly || this.discoveredOnly.has(i.item_id),
      )
      .sort((a, b) => a.description.localeCompare(b.description));
  }

  /** Every collectible with banked stock, spent or not — what the "N of M
   * banked pieces left to place" line counts over, and what `snapshot()`
   * reports `remaining` for. Separate from `palette()` precisely because
   * that one now DROPS spent items: the accounting must still see them, or
   * the denominator would shrink every time a piece was placed. */
  private bankedRoster(): ItemRecord[] {
    return this.items.filter(
      (i) => i.collectible && i.persistence !== "world" && this.decor.bankedTotal(i.item_id) > 0,
    );
  }

  /** Whether another copy of `itemId` can be placed right now — the one
   * predicate the palette chip, the click-to-place completion and the drag
   * drop all gate on, so a stale armed hold can never outrun the stock. */
  private canPlace(itemId: string): boolean {
    return this.decor.remaining(itemId) > 0;
  }

  private redraw() {
    this.pieceLayer.removeAll(true);
    this.uiLayer.removeAll(true);
    this.drawSurfaces();
    this.drawPieces();
    this.drawPalette();
    this.drawChrome();
  }

  /**
   * The authored surface rects, drawn as outlines ONLY while `debugRegions`
   * is on (T7, Roc 2026-08-23). They were always-on before, which is what
   * made a decorated room read as a level editor: five gold boxes with
   * labels, plus a sixth over the shelf, sitting on top of hand-painted art.
   * Free placement never actually needed them — `Decor.place` accepts a drop
   * anywhere and only *snaps* on a surface, so a hidden surface refuses
   * nothing.
   *
   * The sixteen shelf cubbies are the exception, and stay reachable with the
   * overlay off: at room scale each is ~57×19px, too small to click
   * individually, so `drawShelfHint` draws ONE merged region over their
   * union — the wireframe §8's "entering the close-up" pair — that opens
   * `HubShelfScene`. With the overlay off that region is invisible until
   * hovered, then paints its outline and label; with it on it looks the way
   * it always did.
   */
  private drawSurfaces() {
    if (!this.decor.editable) return;
    const surfaces = this.decor.surfaces();
    const free = surfaces.filter((s2) => !s2.gridded);
    const gridded = surfaces.filter((s2) => s2.gridded);

    if (gridded.length) this.drawShelfHint(gridded);
    if (!this.debugRegions) return;

    for (const surface of free) {
      const box = this.add
        .rectangle(
          (surface.x + surface.w / 2) * W,
          (surface.y + surface.h / 2) * H,
          surface.w * W,
          surface.h * H,
          COLOR.goldNum,
          0.1,
        )
        .setStrokeStyle(2, COLOR.goldNum, 0.5);
      this.pieceLayer.add(box);
      // Backed with COLOR.nightHex (verified night/gold 7.83:1, theme.ts)
      // rather than bare gold text on the raw backdrop photo — a free
      // surface can land anywhere on the room art (the light window pane
      // behind "window sill" measured ~1.9:1 unbacked, well under the 4.5:1
      // AA floor), so the label needs a guaranteed-contrast chip instead of
      // hoping the photo underneath stays dark. Same fix `drawPieces()`'s
      // chip labels already apply for the same reason.
      // Y clamped above the palette bar's own top edge (`ROOM_AREA_BOTTOM`)
      // — the "floor" surface's authored rect (`y:0.66,h:0.18`) otherwise
      // places this label at y≈915, inside the always-on-top (uiLayer,
      // depth 100) palette panel's 0.92-alpha band, rendering it almost
      // entirely hidden underneath.
      const labelY = Math.min((surface.y + surface.h) * H + 8, HubScene.ROOM_AREA_BOTTOM - 26);
      const label = this.add
        .text((surface.x + surface.w / 2) * W, labelY, surface.label, {
          fontFamily: FONT.mono,
          fontSize: "18px",
          color: COLOR.gold,
          backgroundColor: COLOR.nightHex,
          padding: { x: 6, y: 3 },
        })
        .setOrigin(0.5, 0);
      this.pieceLayer.add(label);
    }
  }

  /**
   * One clickable region over the union of the gridded shelf cubbies,
   * padded 20% on every side so the click target is easier to land on than
   * the tight authored rects (a UI affordance, not a second authored
   * geometry — the underlying cubby rects driving `surfaceAt`/`place` are
   * untouched). Shows how many of the sixteen are filled — real data,
   * `Decor.occupant` per cubby, not a guess — and opens the close-up on
   * click, same "examine" gesture Satchel/Notebook/the Hub itself already
   * use for a paused overlay.
   */
  private drawShelfHint(gridded: readonly Surface[]): void {
    const minX = Math.min(...gridded.map((s2) => s2.x));
    const minY = Math.min(...gridded.map((s2) => s2.y));
    const maxX = Math.max(...gridded.map((s2) => s2.x + s2.w));
    const maxY = Math.max(...gridded.map((s2) => s2.y + s2.h));
    const padX = (maxX - minX) * 0.2;
    const padY = (maxY - minY) * 0.2;
    const x0 = Math.max(0, minX - padX);
    const y0 = Math.max(0, minY - padY);
    const x1 = Math.min(1, maxX + padX);
    const y1 = Math.min(1, maxY + padY);

    const cx = ((x0 + x1) / 2) * W;
    const cy = ((y0 + y1) / 2) * H;
    const boxW = (x1 - x0) * W;
    const boxH = (y1 - y0) * H;

    // With the region overlay off this starts invisible and reveals on
    // hover; with it on it is the outlined box it has always been. A
    // near-zero fill alpha (not 0) is what keeps the rectangle hit-testable
    // either way — the same trick `HubShelfScene.drawCubby` uses for an
    // empty cubby.
    const shown = this.debugRegions;
    const box = this.add
      .rectangle(cx, cy, boxW, boxH, COLOR.goldNum, shown ? 0.08 : 0.001)
      .setStrokeStyle(2, COLOR.goldNum, shown ? 0.6 : 0)
      .setInteractive({ useHandCursor: true });

    const filled = gridded.filter((s2) => this.decor.occupant(s2.id)).length;
    // Backed with COLOR.nightHex, same fix drawSurfaces()'s free-surface
    // labels apply just above — bare gold text over the room photo measured
    // ~1.76:1 here, well under the 4.5:1 AA floor.
    const label = this.add
      .text(cx, y1 * H + 8, `high shelf — ${filled}/${gridded.length} filled · click to look closer`, {
        fontFamily: FONT.mono,
        fontSize: "18px",
        color: COLOR.gold,
        backgroundColor: COLOR.nightHex,
        padding: { x: 6, y: 3 },
      })
      .setOrigin(0.5, 0)
      .setVisible(shown);

    box.on("pointerover", () => {
      box.setStrokeStyle(2, COLOR.emberNum, 0.9);
      box.setFillStyle(COLOR.goldNum, 0.08);
      label.setVisible(true);
    });
    box.on("pointerout", () => {
      box.setStrokeStyle(2, COLOR.goldNum, shown ? 0.6 : 0);
      box.setFillStyle(COLOR.goldNum, shown ? 0.08 : 0.001);
      label.setVisible(shown);
    });
    box.on("pointerdown", () => this.openShelfCloseUp());

    this.pieceLayer.add(box);
    this.pieceLayer.add(label);
  }

  /**
   * Opens the shelf close-up as a paused overlay — same `scene.pause()` +
   * `scene.launch()` lifecycle every other Hub sub-screen uses
   * (`CollectScene.openSatchel`/`openCalendar`/`openHub` itself). Passes the
   * SAME live `Decor` instance through, not a new one: a placement made in
   * the close-up and a placement made in the room view are the same fact,
   * never two writers of it (same discipline `DecorSlice`'s header argues
   * for at the save layer).
   */
  private openShelfCloseUp(): void {
    if (this.scene.isActive("HubShelfScene")) return;
    this.scene.pause();
    this.scene.launch("HubShelfScene", {
      decor: this.decor,
      items: this.items,
      discoveredOnly: this.discoveredOnly ? [...this.discoveredOnly] : undefined,
      onClose: () => {
        this.scene.resume();
        this.selected = null;
        this.redraw();
      },
    });
  }

  private drawPieces() {
    for (const p of this.decor.all()) {
      const label = this.items.find((i) => i.item_id === p.itemId)?.description ?? p.itemId;
      const isSelected = this.selected === p.uid;
      const chip = this.add
        .text(p.x * W, p.y * H, label, {
          fontFamily: FONT.display,
          fontSize: "26px",
          color: COLOR.onAccent,
          backgroundColor: isSelected ? COLOR.gold : COLOR.canvasHex,
          padding: { x: 14, y: 10 },
        })
        .setOrigin(0.5)
        .setScale(p.scale * (p.flipped ? -1 : 1), p.scale)
        // Lower on the backdrop draws in front. A flat photo gains depth for
        // free, and it is the one thing that stops a pile reading as a list.
        .setDepth(10 + p.y * 100)
        .setInteractive({ useHandCursor: this.decor.editable, draggable: this.decor.editable });

      /**
       * True once this gesture became a real drag. The whole reason
       * selection moved off `pointerdown` (where it lived until T7):
       * `redraw()` destroys every chip in `pieceLayer`, and Phaser builds
       * its drag list in `processDragDownEvent` BEFORE it emits the down
       * events — so a `pointerdown` handler that redraws hands the drag
       * plugin an object that no longer exists and no longer carries the
       * listeners. Dragging a placed piece did nothing at all, which is
       * exactly Roc's "we should just be able to click and drag specific
       * items." Committing the selection on `pointerup` instead leaves the
       * chip alive for the whole gesture.
       */
      let dragged = false;
      /** Where inside the chip the pointer took hold, in `pieceLayer` local
       * space. Captured on POINTERDOWN, not on `dragstart` — `dragstart`
       * only fires once the pointer has already travelled past
       * `dragDistanceThreshold`, so measuring there bakes that travel into
       * the offset and the piece leaps out from under the cursor by however
       * far the first move happened to be. */
      let grabX = 0;
      let grabY = 0;
      const roomPoint = (pointer: Phaser.Input.Pointer) => {
        const t = this.roomZoom.roomLayerTransform;
        return { x: (pointer.x - t.x) / t.scale, y: (pointer.y - t.y) / t.scale };
      };
      chip.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
        dragged = false;
        const at = roomPoint(pointer);
        grabX = chip.x - at.x;
        grabY = chip.y - at.y;
        // An armed hold used to swallow this click ("finish or cancel it
        // first"), which is what left the previous piece selected and its
        // pill row on screen while a second piece refused to take the
        // selection. A piece is never a legal destination for either hold
        // flavour, so clicking one can only mean "I want THAT piece now":
        // pre-empt the hold. No redraw here — see `dragged`.
        this.clickHold = null;
      });
      chip.on("pointerup", () => {
        if (dragged) return; // the drag already committed and redrew
        // TOGGLE, not set (Roc, 2026-08-23: "clicking on a placed item
        // should toggle its selection"). Clicking the selected piece again
        // is the second dismiss gesture, next to clicking empty room — and
        // the one that still works when the room is zoomed far enough in
        // that there is no empty room left to click.
        this.selected = this.selected === p.uid ? null : p.uid;
        this.redraw();
      });

      if (this.decor.editable) {
        // WHY THE POINTER AND NOT `dragX`/`dragY`. Phaser's drag coordinates
        // are not the parent-local point this code assumed: measured against
        // a real drag, a chip told to sit at `(dragX, dragY)` landed at
        // (440, 652) while the pointer was at (700, 500), and the piece
        // committed to `Decor` wherever that happened to be. Deriving the
        // position from `pointer` and this scene's own zoom inverse — the
        // same inverse `completeClickHold` uses — makes the drag land where
        // the cursor is, by construction, at any zoom or pan.
        chip.on("dragstart", () => {
          dragged = true;
          // A dragged piece becomes the selected one. Set WITHOUT a redraw —
          // redrawing mid-gesture would destroy the chip under the pointer.
          // `dragend`'s own redraw is what finally paints the pill row.
          this.selected = p.uid;
        });
        chip.on("drag", (pointer: Phaser.Input.Pointer) => {
          const at = roomPoint(pointer);
          chip.setPosition(at.x + grabX, at.y + grabY);
        });
        chip.on("dragend", () => {
          // `chip.x/y` is now a `pieceLayer`-local point, and that layer's
          // local space IS `Decor` space scaled by W/H — so the piece commits
          // exactly where it was last drawn. No second transform, and no way
          // for the drop to disagree with what the player was looking at.
          this.decor.moveTo(p.uid, chip.x / W, chip.y / H);
          this.redraw();
        });
        chip.on("wheel", (_p: unknown, _dx: number, dy: number) => {
          this.decor.resize(p.uid, dy > 0 ? -0.1 : 0.1);
          this.redraw();
        });
      }
      this.pieceLayer.add(chip);

      // Wireframe §8 "a selected piece" pair: Del/F work but had no on-screen
      // door into them, named only in the dense status line. Selecting a
      // piece is already the "examine" beat (same as a satchel pocket click)
      // — surface flip/remove right where the player is looking. Added
      // AFTER the chip (container add-order, not setDepth) so the buttons
      // sit in front of the piece they belong to. Keys still work.
      if (isSelected && this.decor.editable) {
        this.drawPieceActions(p, chip, label);
      }
    }
  }

  /**
   * Flip/remove buttons for the currently-selected piece — small §14
   * Utility pills (same geometry family as `utilityPill`, sized down since
   * these are transient per-object controls, not persistent chrome).
   * "Remove" uses the shipped `danger` warn color (SatchelScene's
   * `canvasButton`, SaveLoadScene's "Start Over"), matching the mockup's
   * `.rm` chip. Centered above the piece; keyboard F/Del still fire the
   * same `Decor` calls.
   *
   * NO "MOVE" PILL since T7 (Roc, 2026-08-23: "we should just be able to
   * click and drag specific items, don't need a move button"). Moving a
   * piece is dragging it, and dragging actually works now — see the
   * `dragged` flag in `drawPieces`, which is what the pill was quietly
   * standing in for. The non-drag paths survive without it: `M` arms the
   * same `ClickHold` the pill used to, and "remove" hands the copy back to
   * the banked row where a click-place puts it down again, which is a
   * pointer-only route end to end (WCAG 2.5.7).
   *
   * While a move hold IS armed this collapses to one "cancel move" pill,
   * the same shape `SatchelScene`'s Move/Cancel-Move toggle uses.
   */
  private drawPieceActions(p: Placement, chip: Phaser.GameObjects.Text, _label: string): void {
    const { padY, size } = HubScene.PIECE_ACTION_PILL;
    const measure = this.add.text(0, 0, "flip · F", { fontFamily: FONT.mono, fontSize: size });
    const pillH = measure.height + padY * 2;
    measure.destroy();
    const cy = chip.y - Math.abs(chip.displayHeight) / 2 - 14 - pillH;

    const armedHere = this.clickHold?.kind === "move" && this.clickHold.uid === p.uid;
    if (armedHere) {
      const w = this.pieceActionWidth("cancel move");
      this.pieceActionPill(chip.x - w / 2, cy, "cancel move", false, () => {
        this.clickHold = null;
        this.redraw();
      });
      return;
    }

    const GAP = 8;
    const flipW = this.pieceActionWidth("flip · F");
    const removeW = this.pieceActionWidth("remove · Del");
    const totalW = flipW + GAP + removeW;
    let ax = chip.x - totalW / 2;
    ax += this.pieceActionPill(ax, cy, "flip · F", false, () => {
      this.decor.flip(p.uid);
      this.redraw();
    }) + GAP;
    this.pieceActionPill(ax, cy, "remove · Del", true, () => {
      this.decor.remove(p.uid);
      this.selected = null;
      this.redraw();
    });
  }

  private static readonly PIECE_ACTION_PILL = { padX: 10, padY: 6, size: "15px" } as const;

  /** Width `pieceActionPill` will render `label` at — measured the same way
   * `pillWidth` measures the top-row pills, so callers can center a pair
   * before drawing either one. */
  private pieceActionWidth(label: string): number {
    const { padX, size } = HubScene.PIECE_ACTION_PILL;
    const m = this.add.text(0, 0, label, { fontFamily: FONT.mono, fontSize: size });
    const w = m.width + padX * 2;
    m.destroy();
    return w;
  }

  /** Small utility-pill variant for a per-piece contextual action. `warn`
   * (remove) reuses the shipped `danger` token; no separate hover hue
   * exists for it (SatchelScene's warn `canvasButton` only shifts alpha on
   * hover, never hue), so the border/text stay `danger` in both states and
   * only the border alpha brightens on hover. */
  private pieceActionPill(x: number, y: number, label: string, warn: boolean, on: () => void): number {
    const { padX, padY, size } = HubScene.PIECE_ACTION_PILL;
    const idleColor = warn ? COLOR.danger : COLOR.gold;
    const hoverColor = warn ? COLOR.danger : COLOR.ember;
    const idleBorderNum = warn ? DANGER_NUM : COLOR.goldNum;
    const hoverBorderNum = warn ? DANGER_NUM : COLOR.emberNum;
    const t = this.add.text(x + padX, y + padY, label, {
      fontFamily: FONT.mono,
      fontSize: size,
      color: idleColor,
    });
    const w = t.width + padX * 2;
    const h = t.height + padY * 2;
    const r = h * VN_METRICS.controlCornerOfPill;
    const bg = this.add.graphics({ x, y });
    const paint = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(hover ? COLOR.panelHover : COLOR.night, 0.92);
      bg.lineStyle(2, hover ? hoverBorderNum : idleBorderNum, hover ? 0.9 : 0.45);
      bg.fillRoundedRect(0, 0, w, h, r);
      bg.strokeRoundedRect(0, 0, w, h, r);
    };
    paint(false);
    bg.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, w, h),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    bg.on("pointerover", () => {
      paint(true);
      t.setColor(hoverColor);
    });
    bg.on("pointerout", () => {
      paint(false);
      t.setColor(idleColor);
    });
    bg.on("pointerdown", on);
    // Container children render in ADD ORDER — background first, then label.
    this.pieceLayer.add(bg);
    this.pieceLayer.add(t);
    return w;
  }

  private drawPalette() {
    const editable = this.decor.editable;
    this.uiLayer.add(
      this.add.rectangle(W / 2, H - 96, W, 192, COLOR.night, 0.92).setStrokeStyle(2, COLOR.leatherNum),
    );
    const palette = this.palette();
    // Click-to-place hint (WCAG 2.5.7's non-drag alternative) supersedes the
    // idle instruction line while a palette item is held — same "Holding: X
    // — pick a target" pattern `SatchelScene`'s move flow already uses.
    const heldFromPalette = this.clickHold?.kind === "place" ? this.clickHold : null;
    const stocked = this.decor.stockLimited;
    const paletteHint = !editable
      ? "palette — display-only in meta-hub"
      : heldFromPalette
        ? `Holding: ${heldFromPalette.label} — click a spot in the room to place it (Esc cancels)`
        : stocked
          ? palette.length
            ? "banked at home — drag one into the room, or click it then click a spot"
            : "banked at home"
          : "palette — drag one into the room, or click it then click a spot";
    // Roc, 2026-08-23: "a toggle to be able to hide the hints" — but the
    // "Holding: X" state (`heldFromPalette`) is live feedback for the
    // non-drag placement path (WCAG 2.5.7), not a how-to tip, so it stays up
    // regardless of the setting. Backed with `nightHex` (verified night/dim
    // 7.42:1, theme.ts) rather than trusting the palette bar's own 0.92-alpha
    // fill — that alpha is unverified contrast, only ever checked at 1.0.
    if (PlayerSettings.showHints || heldFromPalette) {
      this.uiLayer.add(
        this.add.text(40, H - 176, paletteHint, {
          fontFamily: FONT.display,
          fontSize: "20px",
          color: heldFromPalette ? COLOR.gold : COLOR.dim,
          backgroundColor: COLOR.nightHex,
          padding: { x: 4, y: 2 },
        }),
      );
    }

    // Decided (revision 5, mockup §8 first .pair): a found-count sits above
    // the chip row, gated items only. Same list `palette()` already filters
    // to (lines 111-116) minus its `discoveredOnly` gate — the denominator
    // is "how many exist," not "how many are shown." No new data.
    let rowY = H - 138;
    if (stocked) {
      // Copies, not kinds — the number that actually limits placing. Counted
      // over `bankedRoster()`, not `palette()`: a spent item drops off the
      // row now, and counting the visible row would shrink the denominator
      // every time something was placed ("1 of 1 left" forever).
      const roster = this.bankedRoster();
      const total = roster.reduce((sum, i) => sum + this.decor.bankedTotal(i.item_id), 0);
      const left = roster.reduce((sum, i) => sum + this.decor.remaining(i.item_id), 0);
      // "0 of 0" says nothing the empty-state sentence below doesn't already
      // say better, so an empty bank gets the sentence alone.
      if (total > 0) {
        this.uiLayer.add(
          this.add.text(40, H - 156, `${left} of ${total} banked pieces left to place`, {
            fontFamily: FONT.mono,
            fontSize: "14px",
            color: COLOR.gold,
          }),
        );
        rowY = H - 128;
      }
    } else if (this.discoveredOnly) {
      const totalCollectible = this.items.filter(
        (i) => i.collectible && i.persistence !== "world",
      ).length;
      this.uiLayer.add(
        this.add.text(40, H - 156, `${palette.length} of ${totalCollectible} found`, {
          fontFamily: FONT.mono,
          fontSize: "14px",
          color: COLOR.gold,
        }),
      );
      rowY = H - 128;
    }

    if (!palette.length && (stocked || this.discoveredOnly)) {
      // Two different empty states once spent items leave the row: nothing
      // was ever banked, or everything banked is already on the wall. Saying
      // "end a day here" to someone who just finished decorating would be
      // wrong, and it is the sentence that has to carry the answer to "where
      // did my river stone go" now that the ×0 chip no longer does.
      const everBanked = stocked && this.bankedRoster().length > 0;
      this.uiLayer.add(
        this.add.text(
          40,
          rowY,
          everBanked
            ? "Everything banked is placed — remove a piece to put it back here."
            : stocked
              ? "Nothing banked at home yet — end a day here and what you carried is banked."
              : "Nothing found yet — forage or talk to neighbours, then come back.",
          { fontFamily: FONT.display, fontSize: "20px", color: COLOR.dim },
        ),
      );
    }

    // Chip = icon + label, the same six satchel material SVGs reused (not
    // redrawn — §11). ICON_PAD reserves room inside the pill's own left
    // padding so the icon sits ON the chip, not floating beside it.
    const ICON = 22;
    const ICON_GAP = 8;
    const PAD = 12;
    let x = 40;
    let y = rowY;
    for (const item of palette) {
      const isHeld = heldFromPalette?.itemId === item.item_id;
      // Stock draw-down: a banked item shows how many copies are left. It
      // can no longer be at zero here — `palette()` drops a spent item off
      // the row entirely (Roc, 2026-08-23) — so `live` now only ever falls
      // to the greyed look for the meta-hub's display-only palette.
      const left = this.decor.remaining(item.item_id);
      const live = editable;
      const chipLabel = stocked ? `${item.description} ×${left}` : item.description;
      const chip = this.add
        .text(x, y, chipLabel, {
          fontFamily: FONT.display,
          fontSize: "22px",
          color: live ? COLOR.onAccent : COLOR.dim,
          backgroundColor: live ? (isHeld ? COLOR.gold : COLOR.pocketHex) : COLOR.leatherDarkHex,
          padding: { left: PAD + ICON + ICON_GAP, right: PAD, top: 8, bottom: 8 },
        })
        .setInteractive({ useHandCursor: live, draggable: live });

      const iconAt = (cx: number) => cx + PAD + ICON / 2;
      const iconCy = (cy: number) => cy + chip.height / 2;
      // Real per-item photo when loaded, else the category glyph / leaf — the
      // one shared render rule (`makeItemIcon`), same fit-within-box treatment
      // the satchel and shelf use.
      const icon = makeItemIcon(this, item.item_id, iconAt(x), iconCy(y), ICON);
      // The icon carries the same spent/live state its chip does — a bright
      // glyph on a greyed pill reads as a rendering slip, not a rule.
      if (!live) icon.setAlpha(0.45);

      if (live) {
        // `dragged` exists here for the same reason it does on the piece
        // chips: arming used to happen on `pointerdown`, which redraws,
        // which destroys the very object Phaser had already queued for
        // dragging — so dragging a banked item into the room did nothing at
        // all. Both gestures now commit on the event that can tell them
        // apart (`pointerup` for the click, `dragend` for the drag), and
        // `dragDistanceThreshold` keeps a wobbly click from counting as a
        // drag. This is Roc's "should be able to click and drag from your
        // banked items onto the screen."
        let dragged = false;
        // Grab offset in SCREEN space (a palette chip lives in the
        // untransformed `uiLayer`), captured on POINTERDOWN — `dragstart`
        // fires only after `dragDistanceThreshold` has been crossed, so
        // measuring there bakes that first jump into the offset.
        let grabX = 0;
        let grabY = 0;
        chip.on("pointerdown", (pointer: Phaser.Input.Pointer) => {
          dragged = false;
          grabX = chip.x - pointer.x;
          grabY = chip.y - pointer.y;
        });
        chip.on("pointerup", () => {
          if (dragged) return;
          // Click-to-place — the non-drag alternative (WCAG 2.5.7). A
          // different hold being armed used to swallow this click, which
          // made the palette look dead until the player found Esc. A palette
          // chip is not a destination for any hold, so clicking one can only
          // mean "hold THIS instead" — pre-empt. Clicking the SAME chip
          // again cancels; clicking a spot in the room completes via
          // `completeClickHold`.
          this.clickHold = isHeld ? null : { kind: "place", itemId: item.item_id, label: item.description };
          this.redraw();
        });
        // Ungated, the palette is a source and dragging COPIES — what
        // "everything unlocked" means concretely. With `banked` set it is a
        // real inventory instead and each drag spends a copy; `dragend`'s
        // `canPlace` gate is where that is enforced.
        // Positioned from `pointer` + the grab offset, not Phaser's
        // `dragX`/`dragY` — see the piece drag above for the measurement
        // that ruled those out.
        chip.on("dragstart", () => {
          dragged = true;
          this.clickHold = null; // a real drag pre-empts any click-armed hold
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
          // A palette chip lives in the UNTRANSFORMED `uiLayer`, so where it
          // was dropped is a screen point — while `Decor` stores room-space
          // fractions, which `pieceLayer`'s zoom/pan transform maps onto the
          // screen. Dividing by W/H directly (what this did before) only
          // agreed with the room while the room sat at exactly 100% and
          // unpanned; now that the Hub opens at `ROOM_ZOOM_DEFAULT` it would
          // drop every piece in the wrong place. Same inverse
          // `completeClickHold` applies for the click path — one gesture,
          // one destination, whichever way the player got there.
          // Aim from the dragged pill's CENTRE, not its top-left corner. A
          // placed piece draws with a centred origin, so dropping by the
          // corner put it up and to the left of the pill the player was
          // actually looking at — about half a chip out, which on the
          // window sill is the difference between the sill and the wall.
          const dropX = chip.x + chip.width / 2;
          const dropY = chip.y + chip.height / 2;
          const dropped = dropY < HubScene.ROOM_AREA_BOTTOM;
          if (dropped && this.canPlace(item.item_id)) {
            const t = this.roomZoom.roomLayerTransform;
            this.decor.place(item.item_id, (dropX - t.x) / t.scale / W, (dropY - t.y) / t.scale / H);
          }
          this.redraw();
        });
      }

      // Container add order is draw order: background+text first, icon on
      // top of the pill it belongs to.
      this.uiLayer.add(chip);
      this.uiLayer.add(icon);
      x += chip.width + 14;
      if (x > W - 260) {
        x = 40;
        y += 46;
      }
    }
  }

  private drawChrome() {
    const mode = this.decor.getMode();
    // Header band. The room's own art runs from a sunlit window to dark
    // stone, and the default zoom put the brightest part of it (the window
    // and the lit floor) directly under the title row — the subtitle
    // measured well under the 4.5:1 AA floor against it. Same guaranteed-
    // contrast fix `CollectScene` already uses at both screen edges, and the
    // same one `drawSurfaces` applies per-label; sized to `ROOM_AREA_TOP`,
    // which is where `roomCamera`'s clip starts, so it can never cover room
    // content that the room camera would otherwise have drawn.
    const bandH = HubScene.ROOM_AREA_TOP - 8;
    this.uiLayer.add(this.add.rectangle(W / 2, bandH / 2, W, bandH, COLOR.night, 0.82));
    const bandEdge = this.add.graphics();
    bandEdge.lineStyle(2, COLOR.leatherNum, 1);
    bandEdge.lineBetween(0, bandH, W, bandH);
    this.uiLayer.add(bandEdge);
    this.uiLayer.add(
      // The subtitle names the gate actually in force. "Discovered items
      // only" was a lie once the palette started drawing down from banked
      // stock — a found-but-not-banked item is not on offer either.
      this.add.text(40, 32, this.decor.stockLimited
        ? "HOME HUB — banked at home"
        : this.discoveredOnly
          ? "HOME HUB — discovered items only"
          : "HOME HUB", {
        fontFamily: FONT.display,
        fontSize: "34px",
        color: GOLD,
      }),
    );
    // The piece count is state, always shown; the control reference after it
    // ("drag a piece to move it · click to select · ...") is the how-to hint
    // Roc's 2026-08-23 note asked for a toggle to hide ("a toggle to be able
    // to hide the hints, and hints also are unreadable because there's not
    // enough contrast") — `PlayerSettings.showHints`, `OptionsScene`-free for
    // now the same way `debugRegions` is: a Hub chrome pill, not a settings
    // row, since nothing else reads this setting yet. Both pieces are backed
    // with `nightHex` rather than trusting the header band's 0.82-alpha fill
    // — that alpha is never the ratio theme.ts actually verifies (verified
    // only at 1.0), so a bright patch of the room art underneath could still
    // wash it out.
    const countLabel = `${this.decor.all().length} pieces placed`;
    const countText = this.add.text(40, 78, countLabel, {
      fontFamily: FONT.mono,
      fontSize: "19px",
      color: COLOR.dim,
      backgroundColor: COLOR.nightHex,
      padding: { x: 4, y: 2 },
    });
    this.uiLayer.add(countText);
    if (PlayerSettings.showHints) {
      this.uiLayer.add(
        this.add.text(
          40 + countText.width + 4,
          78,
          " · drag a piece to move it · click to select · scroll to resize · F flips · Del removes · Esc leaves",
          {
            fontFamily: FONT.mono,
            fontSize: "19px",
            color: COLOR.dim,
            backgroundColor: COLOR.nightHex,
            padding: { x: 4, y: 2 },
          },
        ),
      );
    }

    // "Holding: X — click a spot to move it" — the click-to-move hint
    // (WCAG 2.5.7's non-drag alternative). Only a "move" hold needs one here:
    // the "place" flavor's own hint already lives on the palette row
    // (`drawPalette`), right next to the item it names. Live feedback for an
    // in-progress action, not a how-to tip, so it ignores `showHints` — same
    // reasoning as `drawPalette`'s `heldFromPalette` case.
    if (this.clickHold?.kind === "move") {
      this.uiLayer.add(
        this.add.text(
          40,
          118,
          `Holding: ${this.clickHold.label} — click a spot in the room to move it (Esc cancels)`,
          {
            fontFamily: FONT.mono,
            fontSize: "19px",
            color: COLOR.gold,
            backgroundColor: COLOR.nightHex,
            padding: { x: 4, y: 2 },
          },
        ),
      );
    }

    // Wireframe §8 "the chrome" pair: today's two separate corner clusters
    // (a placement tab pair top-left, a mixed view-tab/action row top-right
    // with "New Life" sitting flush against "Close" — "a slightly wrong
    // click empties the room") become one row of clusters — space, session —
    // the same grouping language as §4's own HUD row. The placement-mode tab
    // pair that used to sit here (Free Drag / Snap Slots) is retired by §8's
    // closing ruling (decided, revision 4): placement mode resolves PER
    // SURFACE now (`Surface.gridded`), not as a scene-wide choice, so a
    // control bound to a scene-wide mode would be a pill that changes
    // nothing — the exact `ui-builder.md` "Options trap." No bespoke icon
    // SVGs exist yet for these actions (§11 — real files only, never
    // inline/redrawn glyphs), so each control stays the shipped §14 pill it
    // already was; a hairline divider between clusters carries the grouping
    // instead of an icon. Right-aligned so the variable-width row packs
    // flush at the margin.
    interface ChromeButton {
      label: string;
      tab: boolean;
      active: boolean;
      danger?: boolean;
      on: () => void;
    }
    const spaceCluster: ChromeButton[] = [
      { label: "In-Game Home", tab: true, active: mode === "home", on: () => {
        this.clickHold = null;
        this.decor.setMode("home");
        this.redraw();
      } },
      { label: "Meta-Hub", tab: true, active: mode === "meta", on: () => {
        this.clickHold = null;
        this.decor.setMode("meta");
        this.selected = null;
        this.redraw();
      } },
    ];
    // "New Life" is GONE (Roc, 2026-08-23: "we don't need the MetaHub and we
    // don't want the new life button in the home hub — those will be handled
    // by saves"). Only the button is cut here: the Meta-Hub tab and
    // `Decor.resetForNewLife` both stay, because the wider MetaHub removal
    // rides on the year-loop save ruling that has not landed yet, and
    // `resetForNewLife` is still what a save-slot reset will call. The
    // handle keeps `__hub.newLife()` so scenarios can still reset a room
    // without a control the player can hit by accident.
    const sessionCluster: ChromeButton[] = [
      {
        label: PlayerSettings.showHints ? "Hints on" : "Hints off",
        tab: true,
        active: PlayerSettings.showHints,
        on: () => {
          PlayerSettings.setShowHints(!PlayerSettings.showHints);
          this.redraw();
        },
      },
      { label: "Close", tab: false, active: false, on: () => this.close() },
    ];
    // Dev-only, and deliberately not in the shipped clusters — same rule
    // `CollectScene` follows for `[ Edit — E ]` and Dev Unlock: an authoring
    // affordance drops out of the always-visible row entirely. Without it
    // the `D` toggle would be a keypress nobody could discover.
    const devCluster: ChromeButton[] = import.meta.env.DEV
      ? [{
          label: this.debugRegions ? "Regions on · D" : "Regions off · D",
          tab: true,
          active: this.debugRegions,
          on: () => {
            this.debugRegions = !this.debugRegions;
            this.redraw();
          },
        }]
      : [];
    const clusters: ChromeButton[][] = devCluster.length
      ? [devCluster, spaceCluster, sessionCluster]
      : [spaceCluster, sessionCluster];

    const GAP = 12;
    const DIVIDER = 28;
    const ROW_Y = 32;
    let total = 0;
    for (const cluster of clusters) {
      const w = cluster.reduce((sum, b) => sum + this.pillWidth(b.label), 0);
      total += w + GAP * (cluster.length - 1);
    }
    total += DIVIDER * (clusters.length - 1);

    let bx = W - 40 - total;
    clusters.forEach((cluster, ci) => {
      cluster.forEach((b, bi) => {
        const w = b.tab
          ? this.tabPill(bx, ROW_Y, b.label, b.active, b.on)
          : this.utilityPill(bx, ROW_Y, b.label, b.on, b.danger);
        bx += w;
        if (bi < cluster.length - 1) bx += GAP;
      });
      if (ci < clusters.length - 1) {
        const lineX = bx + DIVIDER / 2;
        const divider = this.add.graphics();
        divider.lineStyle(1, COLOR.goldNum, 0.25);
        divider.lineBetween(lineX, ROW_Y + 2, lineX, ROW_Y + 34);
        this.uiLayer.add(divider);
        bx += DIVIDER;
      }
    });

    if (mode === "meta") {
      this.uiLayer.add(
        this.add.text(40, 118, "Meta-hub pieces are display-only — never withdrawable into play.", {
          fontFamily: FONT.mono,
          fontSize: "19px",
          color: INK,
        }),
      );
    }
  }

  /**
   * The §14 Utility-pill geometry, shared by every Hub button so a measured
   * width can never drift from a drawn one. Matches `ModalFrame.button` /
   * `PILL` exactly — the Hub can't reach `ModalFrame` (it needs an Inventory),
   * so the geometry is replicated, not reinvented.
   */
  private static readonly PILL = { padX: 20, padY: 9, size: "22px" } as const;

  /** Width the pill for `label` will render at — same geometry the draw helpers
   * use, measured on throwaway text so the right-aligned top row packs first. */
  private pillWidth(label: string): number {
    const { padX, size } = HubScene.PILL;
    const m = this.add.text(0, 0, label, { fontFamily: FONT.mono, fontSize: size });
    const w = m.width + padX * 2;
    m.destroy();
    return w;
  }

  /**
   * §14 **Utility pill** (Control-style, §4) — one-shot actions (New Life,
   * Close). Idle: `night` @ 90% fill, 2px `gold` @ 35% border, `gold` mono
   * label. Hover: `panelHover` fill, `ember` border and label. Corner radius is
   * `controlCornerOfPill` of the pill height, the dialogue-bar math. Anchored
   * top-left at `(x, y)`, grows rightward. Returns the drawn width.
   *
   * `danger` (New Life, once armed) swaps `gold`/`ember` for the shipped
   * `danger` warn token (SatchelScene's `canvasButton`, SaveLoadScene's
   * "Start Over"/"Confirm Erase"). No separate hover hue exists for
   * `danger` in that shipped family either — hover only brightens the
   * border alpha, same as the idle/hover split every other warn control
   * already uses.
   *
   * `layer` defaults to `uiLayer` (every existing caller); the room zoom's
   * persistent "Fit — Esc" pill is the one caller that passes `zoomLayer`
   * instead, reusing this geometry rather than reinventing a second pill
   * drawer for one button.
   */
  private utilityPill(
    x: number,
    y: number,
    label: string,
    on: () => void,
    danger = false,
    layer: Phaser.GameObjects.Container = this.uiLayer,
  ): number {
    const { padX, padY, size } = HubScene.PILL;
    const idleColor = danger ? COLOR.danger : COLOR.gold;
    const hoverColor = danger ? COLOR.danger : COLOR.ember;
    const idleBorderNum = danger ? DANGER_NUM : COLOR.goldNum;
    const hoverBorderNum = danger ? DANGER_NUM : COLOR.emberNum;
    const t = this.add.text(x + padX, y + padY, label, {
      fontFamily: FONT.mono,
      fontSize: size,
      color: idleColor,
    });
    const w = t.width + padX * 2;
    const h = t.height + padY * 2;
    const r = h * VN_METRICS.controlCornerOfPill;
    const bg = this.add.graphics({ x, y });
    const paint = (hover: boolean) => {
      bg.clear();
      bg.fillStyle(hover ? COLOR.panelHover : COLOR.night, 0.9);
      bg.lineStyle(2, hover ? hoverBorderNum : idleBorderNum, hover ? 0.9 : 0.35);
      bg.fillRoundedRect(0, 0, w, h, r);
      bg.strokeRoundedRect(0, 0, w, h, r);
    };
    paint(false);
    bg.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, w, h),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    bg.on("pointerover", () => {
      paint(true);
      t.setColor(hoverColor);
    });
    bg.on("pointerout", () => {
      paint(false);
      t.setColor(idleColor);
    });
    bg.on("pointerdown", on);
    // Container children render in ADD ORDER — background first, then label.
    layer.add(bg);
    layer.add(t);
    return w;
  }

  /**
   * §14 **tab** (§7) for a live toggle group where one member is selected —
   * placement mode (Free Drag / Snap Slots) and space (In-Game Home /
   * Meta-Hub). ACTIVE: solid `gold` fill, dark `onAccent` label. INACTIVE:
   * transparent fill, idle `gold` @ 35% outline (so the group reads as a
   * segmented control matching the Utility pills), `gold` label; hover →
   * `panelHover` fill, `ember` outline and label. Same pill geometry as
   * `utilityPill`. Returns the drawn width.
   */
  private tabPill(x: number, y: number, label: string, active: boolean, on: () => void): number {
    const { padX, padY, size } = HubScene.PILL;
    const t = this.add.text(x + padX, y + padY, label, {
      fontFamily: FONT.mono,
      fontSize: size,
      color: active ? COLOR.onAccent : COLOR.gold,
    });
    const w = t.width + padX * 2;
    const h = t.height + padY * 2;
    const r = h * VN_METRICS.controlCornerOfPill;
    const bg = this.add.graphics({ x, y });
    const paint = (hover: boolean) => {
      bg.clear();
      if (active) {
        bg.fillStyle(COLOR.goldNum, 1);
        bg.fillRoundedRect(0, 0, w, h, r);
        return;
      }
      if (hover) {
        bg.fillStyle(COLOR.panelHover, 0.9);
        bg.fillRoundedRect(0, 0, w, h, r);
      }
      bg.lineStyle(2, hover ? COLOR.emberNum : COLOR.goldNum, hover ? 0.9 : 0.35);
      bg.strokeRoundedRect(0, 0, w, h, r);
    };
    paint(false);
    bg.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, w, h),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    if (!active) {
      bg.on("pointerover", () => {
        paint(true);
        t.setColor(COLOR.ember);
      });
      bg.on("pointerout", () => {
        paint(false);
        t.setColor(COLOR.gold);
      });
    }
    bg.on("pointerdown", on);
    this.uiLayer.add(bg);
    this.uiLayer.add(t);
    return w;
  }

  /** Handle for tools/hub-check.mjs. */
  private expose() {
    (window as unknown as Record<string, unknown>).__hub = {
      place: (itemId: string, x: number, y: number) => {
        const p = this.decor.place(itemId, x, y);
        this.redraw();
        return p;
      },
      move: (uid: string, x: number, y: number) => {
        this.decor.moveTo(uid, x, y);
        this.redraw();
      },
      placeOnSurface: (itemId: string, surfaceId: string) => {
        const p = this.decor.placeOnSurface(itemId, surfaceId);
        this.redraw();
        return p;
      },
      openShelfCloseUp: () => this.openShelfCloseUp(),
      /** Every id the palette could ever offer, ungated — so a scenario can
       * pick real ids to bank without a second data handle. */
      collectibleIds: () =>
        this.items.filter((i) => i.collectible && i.persistence !== "world").map((i) => i.item_id),
      /** Debug seam for the banked draw-down — see `Decor.setBankedForDebug`. */
      bank: (ids: string[]) => {
        this.decor.setBankedForDebug(ids);
        this.redraw();
      },
      surfaces: () =>
        this.decor.surfaces().map((s2) => ({ ...s2, taken: Boolean(this.decor.occupant(s2.id)) })),
      setMode: (m: "home" | "meta") => {
        this.decor.setMode(m);
        this.redraw();
      },
      /** The room-emptying reset. No player-facing control fires this since
       * T7 removed the "New Life" pill — it stays here because scenarios
       * still need a clean room, and because the year-loop save ruling will
       * want the same `Decor` call from a slot reset. */
      newLife: () => {
        this.decor.resetForNewLife();
        this.selected = null;
        this.clickHold = null;
        this.redraw();
      },
      /** Drives the region overlay from a scenario without a synthetic
       * keypress — see `debugRegions`. */
      setDebugRegions: (on: boolean) => {
        this.debugRegions = on;
        this.redraw();
      },
      snapshot: () => ({
        mode: this.decor.getMode(),
        editable: this.decor.editable,
        placements: this.decor.all().map((p: Placement) => ({ ...p })),
        paletteSize: this.palette().length,
        /** The ids actually ON the banked row right now. Separate from
         * `remaining` since T7: a spent item leaves the row but keeps an
         * entry in `remaining` at 0, and a scenario needs to tell "gone from
         * the row" from "gone from the stock model." */
        paletteIds: this.palette().map((i) => i.item_id),
        /** Whether the palette draws down from banked stock, and what is
         * left per item — a scenario asserts the draw-down here instead of
         * reading "×2" off a chip. Keyed over the whole banked roster, NOT
         * the visible row, so a fully-placed item still reports its 0. */
        stockLimited: this.decor.stockLimited,
        remaining: Object.fromEntries(
          (this.decor.stockLimited ? this.bankedRoster() : this.palette()).map((i) => [
            i.item_id,
            this.decor.remaining(i.item_id),
          ]),
        ),
        /** The selected placement's uid, so a scenario can assert that
         * clicking a second piece really moved the selection instead of
         * pixel-reading which chip is gold. */
        selected: this.selected,
        // Room zoom/pan state (wireframe §8) — for `tools/playtest.mjs`
        // scenarios to assert against, same reason every other field here
        // exists: a debug read, not game logic.
        zoom: this.roomZoom.zoom,
        offsetX: this.roomZoom.offsetX,
        offsetY: this.roomZoom.offsetY,
        atDefault: this.roomZoom.atDefault,
        /** Whether the authored surface outlines are being drawn — the `D`
         * toggle's observable state, so a scenario asserts the regions are
         * hidden instead of pixel-reading for gold rectangles. */
        debugRegions: this.debugRegions,
        // The click-to-place/click-to-move hold (WCAG 2.5.7's non-drag
        // alternative) — for a scenario to assert a hold armed/cleared
        // without depending on pixel-reading a hint label.
        clickHold: this.clickHold ? { ...this.clickHold } : null,
      }),
      close: () => this.close(),
    };
  }
}
