/**
 * The notebook.
 *
 * "The notebook can be referenced at any time and holds the knowledge you have
 * collected" (`gdd/03-core-loop.md:14`).
 *
 * It is a VIEW, not new state — everything shown already exists in the story or
 * in content. Opening it must never advance the story, so this scene never
 * touches the ink bridge; it reads a snapshot handed in at launch.
 *
 * THE SPELLS TAB IS A RICH SPELLBOOK (Track 2d). It ports
 * `tools/screen-flow/mockups/spellbook.html`: a centered, book-shaped panel
 * floating over the dimmed game (the SatchelScene/SaveLoadScene overlay
 * discipline — a scrim, then a framed panel with `filigreeCorners`), holding two
 * PARCHMENT pages. Left page: an index of Known spells plus a dimmed "to learn ·
 * from neighbours" catalog. Right page: the selected spell's detail with a LIVE
 * VFX PREVIEW that plays its REAL authored effect cue. Page content is dark INK
 * on the canvas gradient (the same parchment surface SaveLoadScene's slot cards
 * use — there is no paper-grain image asset), gold kept only for eyebrow labels
 * and the selected-row accent. The OTHER THREE TABS keep the plain dark-panel
 * drawer/full presentation.
 *
 * HOW THE PREVIEW STAYS IN ITS PANE — geometric separation, no `camera.ignore`
 * bookkeeping. The camera-wide cues (glow/tint/filter) composite a CAMERA's
 * viewport, so a dedicated camera bounded to the pane's on-screen rect is
 * scrolled to a near-black stage parked far off in world space (`STAGE_X/Y`, at
 * 4000+). The MAIN camera views 0..1920 and never sees the stage; the PREVIEW
 * camera views the stage and never sees the notebook UI, so the filter
 * composites the pane and nothing else. PARTICLE cues take the other path — a
 * particle emitter does not render on a secondary camera in Phaser 4, so it
 * emits on the MAIN camera at the pane centre and is kept in the pane by
 * geometry (every authored burst travels less than the pane's half-height —
 * comfortably so since the pane grew to 340 tall).
 * `buildPreview` picks the path from the cue's kind, and reads the pane's
 * CURRENT on-screen rect — so moving the book moves the preview with it.
 *
 * LIFECYCLE IS MANDATORY. Phaser 4 filters are not auto-released, so the preview
 * backend and its camera are torn down on every redraw and rebuilt only for the
 * spells tab, and again on scene shutdown. A leaked preview filter would
 * composite forever.
 */

import Phaser from "phaser";
import type { PlayView } from "@lantern/lib/play";
import type { MagicDB } from "../magic/CastResolver";
import type { Knowledge } from "../world/Knowledge";
import type { ItemRecord } from "../magic/types";
import type { Inventory } from "../world/Inventory";
import { COLOR, FONT, filigreeCorners, sceneFadeIn } from "../ui/theme";
import { PhaserVfxBackend } from "../render/vfx/PhaserVfxBackend";
import { loadAuthoredCues, type CueTable } from "../render/vfx/CueTable";
import { isAnchoredKind, type VfxCue } from "../render/vfx/VfxBackend";
import { spellPreviewCue } from "../magic/spellPreview";

const W = 1920;
const H = 1080;
const GOLD = COLOR.gold;
const INK = COLOR.ink;
const DIM = COLOR.muted;

/** Parchment ink — dark on the canvas gradient, inverted from the dark-panel
 * tabs. Titles/values in `inkOnCanvas`, secondary text in `inkSoftOnCanvas`. */
const PAGE_INK = COLOR.inkOnCanvas;
const PAGE_INK_SOFT = COLOR.inkSoftOnCanvas;

/**
 * The preview STAGE, parked far outside the main camera's 0..1920 x 0..1080
 * view. Nothing the main camera renders ever reaches here, and nothing here
 * ever reaches the main camera — that is what keeps a whole-camera cue inside
 * the pane instead of washing the notebook.
 */
const STAGE_X = 4000;
const STAGE_Y = 4000;

/**
 * How much bigger a cue plays in the pane than out in the world. A 128px sprite
 * at 2.2x is ~282px inside the 340-tall pane — filling it without touching the
 * edges, so an authored burst still cannot overflow the window. See `paneSized`.
 */
const PREVIEW_CUE_SCALE = 2.2;

/** The open book — a centered, book-shaped panel over the dimmed game. Sized to
 * leave the game visible around the edges (NOT edge-to-edge). */
const BOOK_W = 1500;
const BOOK_H = 880;
const BOOK_X = (W - BOOK_W) / 2;
const BOOK_Y = (H - BOOK_H) / 2;
const BOOK_PAD = 26;
/** Gap down the middle where the spine sits, between the two pages. */
const SPINE_GAP = 24;

type Tab = "knowledge" | "spells" | "relationships" | "collection";
const TABS: Tab[] = ["knowledge", "spells", "relationships", "collection"];

export interface NotebookSceneData {
  view: PlayView;
  magic: MagicDB;
  knowledge: Knowledge;
  items: ItemRecord[];
  onClose: () => void;
  /** Present only in Collection & Discovery mode — enables trial-casting a
   * clue spell straight from this scene. Absent elsewhere, unchanged. */
  inventory?: Inventory;
  collectMode?: boolean;
}

export class NotebookScene extends Phaser.Scene {
  private view!: PlayView;
  private magic!: MagicDB;
  private knowledge!: Knowledge;
  private items!: ItemRecord[];
  private onClose!: () => void;
  private inventory?: Inventory;
  private collectMode = false;
  private tab: Tab = "knowledge";
  private layer!: Phaser.GameObjects.Container;

  /** The spell the detail page and preview are showing. */
  private selectedSpell: string | null = null;
  private cueTable!: CueTable;

  /** The live preview — one camera, one near-black stage, one backend, one
   * replay loop. All torn down and rebuilt around the spells tab. */
  private previewBackend?: PhaserVfxBackend;
  private previewCam?: Phaser.Cameras.Scene2D.Camera;
  /** Every scene-root object the preview stage owns (ground + subject) — all at
   * `STAGE_X/Y`, all destroyed on teardown. */
  private previewObjects: Phaser.GameObjects.GameObject[] = [];
  private previewAnchor = { x: STAGE_X, y: STAGE_Y };
  /** The pane's on-screen rect, for the playtest probe only. */
  private previewPane = { x: 0, y: 0, w: 0, h: 0 };

  constructor() {
    super("NotebookScene");
  }

  init(data: NotebookSceneData) {
    this.view = data.view;
    this.magic = data.magic;
    this.knowledge = data.knowledge;
    this.items = data.items;
    this.onClose = data.onClose;
    this.inventory = data.inventory;
    this.collectMode = Boolean(data.collectMode);
    this.tab = this.collectMode ? "spells" : "knowledge";
    this.selectedSpell = null;
  }

  /** In Collection & Discovery mode the non-spells tabs render as a bottom
   * drawer — the screen behind it (already rendered, only paused) stays visible
   * above. The spells tab ignores this and floats a centered book instead. */
  private get panelTop(): number {
    return this.collectMode ? H / 2 : 0;
  }

  create() {
    sceneFadeIn(this);
    this.cueTable = loadAuthoredCues(new Set(this.magic.spells.map((s) => s.spell_id)));
    this.layer = this.add.container(0, 0).setDepth(1);
    this.input.keyboard?.on("keydown-ESC", () => this.close());
    this.input.keyboard?.on("keydown-N", () => this.close());
    // Filters are not auto-released; the preview must be dismantled by hand.
    this.events.once("shutdown", () => this.teardownPreview());
    this.expose();
    this.redraw();
  }

  /** Trial-cast an unconfirmed clue, or cast an already-learned spell, then
   * come back and redraw. */
  private tryClue(spellId: string) {
    if (!this.inventory) return;
    const spell = this.magic.spell(spellId);
    if (!spell) return;
    this.scene.pause();
    this.scene.launch("SpellTrialScene", {
      spell,
      knowledge: this.knowledge,
      inventory: this.inventory,
      items: this.items,
      known: this.knowledge.knows(spellId),
      // Second trial-cast pool (revision 4, mode5-ux-flow-wireframe.html §6) —
      // already threaded end-to-end everywhere else (ScreenScene, SatchelStrip,
      // this scene's own Collection tab at line ~695); SpellTrialScene was the
      // one consumer that never received it.
      banked: this.view.banked,
      onClose: () => {
        this.scene.resume();
        this.redraw();
      },
    });
  }

  private close() {
    this.input.keyboard?.removeAllListeners();
    (window as unknown as Record<string, unknown>).__notebook = undefined;
    this.scene.stop();
    this.onClose();
  }

  private label(itemId: string): string {
    const rec = this.items.find((i) => i.item_id === itemId);
    if (!rec) return itemId;
    // Key-item descriptions are prose, not labels (GAPS.md G11). Trim for the
    // list; the full text belongs on an inspect view that does not exist yet.
    return rec.description.length > 46
      ? `${rec.description.slice(0, 44)}…`
      : rec.description;
  }

  private redraw() {
    // The preview holds a camera and a filter; both must go before the layer is
    // cleared, and are rebuilt only if the spellbook draws them.
    this.teardownPreview();
    this.layer.removeAll(true);
    if (this.tab === "spells") this.drawSpellbook();
    else this.drawStandard();
  }

  /** The plain dark-panel presentation for the three non-spellbook tabs. */
  private drawStandard() {
    const top = this.panelTop;
    const drawer = this.collectMode;

    const bg = this.add.rectangle(W / 2, top + (H - top) / 2, W, H - top, COLOR.panel, drawer ? 0.97 : 1);
    this.layer.add(bg);
    if (drawer) this.layer.add(this.add.rectangle(W / 2, top, W, 3, COLOR.goldNum, 0.9));

    this.text(64, top + 24, "NOTEBOOK", GOLD, this.collectMode ? 26 : 34, FONT.display);
    this.text(
      64,
      top + (this.collectMode ? 58 : 88),
      "referenced at any time — the story does not advance",
      DIM,
      17,
      FONT.display,
    );

    const tabY = top + (this.collectMode ? 92 : 140);
    this.drawTabs(64, tabY, 20);

    const y0 = tabY + (this.collectMode ? 50 : 80);
    if (this.tab === "knowledge") this.drawKnowledge(y0);
    if (this.tab === "relationships") this.drawRelationships(y0);
    if (this.tab === "collection") this.drawCollection(y0);

    const closeY = top + (this.collectMode ? H / 2 - 40 : H - 70);
    this.drawCloseHint(64, closeY);
  }

  /** The tab row — the one navigation control shared by both presentations, so
   * every tab stays reachable from either. Dark pills, gold text, the active tab
   * a solid gold fill. */
  private drawTabs(x: number, y: number, size: number) {
    let tx = x;
    for (const t of TABS) {
      const hot = t === this.tab;
      const el = this.text(tx, y, t[0].toUpperCase() + t.slice(1), hot ? COLOR.onAccent : GOLD, size, FONT.mono);
      el.setPadding(10, 8, 10, 8);
      el.setBackgroundColor(hot ? COLOR.gold : COLOR.panelHex);
      el.setInteractive({ useHandCursor: true });
      if (!hot) {
        el.on("pointerover", () => el.setBackgroundColor(COLOR.panelHoverHex));
        el.on("pointerout", () => el.setBackgroundColor(COLOR.panelHex));
      }
      el.on("pointerdown", () => {
        this.tab = t;
        this.redraw();
      });
      tx += el.width + 10;
    }
  }

  private drawCloseHint(x: number, y: number) {
    const close = this.text(x, y, "Esc or N to close", DIM, 18, FONT.mono);
    close.setPadding(8, 8, 8, 8);
    close.setInteractive({ useHandCursor: true });
    close.on("pointerover", () => close.setColor(COLOR.ember));
    close.on("pointerout", () => close.setColor(DIM));
    close.on("pointerdown", () => this.close());
  }

  // -------------------------------------------------------------------------
  // The spellbook — a centered book overlaid on the dimmed game.
  // -------------------------------------------------------------------------

  private drawSpellbook() {
    const book = this.knowledge.spellbook();
    const clues = this.knowledge.clues();
    const selectable = [...book, ...clues];
    if (this.selectedSpell && !selectable.includes(this.selectedSpell)) this.selectedSpell = null;
    if (!this.selectedSpell && selectable.length) this.selectedSpell = selectable[0];

    // Scrim over the paused game.
    this.layer.add(this.add.rectangle(W / 2, H / 2, W, H, COLOR.night, 0.6));

    // Drop shadow, then the leather cover.
    const shadow = this.add.graphics();
    shadow.fillStyle(COLOR.night, 0.55);
    shadow.fillRoundedRect(BOOK_X - 8, BOOK_Y + 20, BOOK_W + 16, BOOK_H + 16, 22);
    this.layer.add(shadow);

    const cover = this.add.graphics();
    cover.fillGradientStyle(COLOR.leatherLightNum, COLOR.leatherLightNum, COLOR.leatherDarkNum, COLOR.leatherDarkNum, 1);
    cover.fillRoundedRect(BOOK_X, BOOK_Y, BOOK_W, BOOK_H, 18);
    cover.lineStyle(3, COLOR.leatherDarkNum, 1);
    cover.strokeRoundedRect(BOOK_X, BOOK_Y, BOOK_W, BOOK_H, 18);
    this.layer.add(cover);

    // Header band on the leather cover: title, subtitle, and the tab row — so
    // the tabs live on the book itself and every tab stays one click away.
    this.text(BOOK_X + 36, BOOK_Y + 22, "NOTEBOOK", GOLD, 22, FONT.display);
    this.text(BOOK_X + 36, BOOK_Y + 52, "the spellbook — referenced at any time", DIM, 13, FONT.display);
    this.drawTabs(BOOK_X + 36, BOOK_Y + 80, 18);

    // The two parchment pages, split by a spine shadow.
    const pagesTop = BOOK_Y + 126;
    const pagesH = BOOK_H - 126 - 44;
    const pageW = (BOOK_W - 2 * BOOK_PAD - SPINE_GAP) / 2;
    const leftX = BOOK_X + BOOK_PAD;
    const rightX = leftX + pageW + SPINE_GAP;
    this.drawPage(leftX, pagesTop, pageW, pagesH);
    this.drawPage(rightX, pagesTop, pageW, pagesH);
    this.drawSpine(BOOK_X + BOOK_W / 2, pagesTop, pagesH);

    // Gold corner filigree — the framed-modal language, mounted on the book.
    this.layer.add(filigreeCorners(this, BOOK_X + BOOK_W / 2, BOOK_Y + BOOK_H / 2, BOOK_W, BOOK_H));

    this.drawIndexPage(leftX, pagesTop, pageW, book, clues);
    this.drawDetailPage(rightX, pagesTop, pageW);

    this.drawCloseHintOnLeather(BOOK_X + 36, BOOK_Y + BOOK_H - 30);
  }

  /** One parchment page — the canvas gradient IS the paper surface (no texture
   * asset), a canvas-edge hairline border, same as SaveLoadScene's slot cards. */
  private drawPage(x: number, y: number, w: number, h: number) {
    const g = this.add.graphics();
    g.fillGradientStyle(COLOR.canvas, COLOR.canvas, COLOR.canvas2Num, COLOR.canvas2Num, 1);
    g.fillRoundedRect(x, y, w, h, 12);
    g.lineStyle(2, COLOR.canvasEdgeNum, 1);
    g.strokeRoundedRect(x, y, w, h, 12);
    this.layer.add(g);
  }

  /** The center-spine shadow — a soft dark seam feathering onto both inner page
   * edges, so the two pages read as one open book. */
  private drawSpine(cx: number, y: number, h: number) {
    const g = this.add.graphics();
    g.fillStyle(COLOR.night, 0.22);
    g.fillRect(cx - SPINE_GAP / 2, y, SPINE_GAP, h);
    g.fillStyle(COLOR.night, 0.1);
    g.fillRect(cx - SPINE_GAP / 2 - 22, y, 22, h);
    g.fillRect(cx + SPINE_GAP / 2, y, 22, h);
    this.layer.add(g);
  }

  private drawCloseHintOnLeather(x: number, y: number) {
    const close = this.text(x, y, "Esc or N to close", DIM, 15, FONT.mono);
    close.setInteractive({ useHandCursor: true });
    close.on("pointerover", () => close.setColor(COLOR.ember));
    close.on("pointerout", () => close.setColor(DIM));
    close.on("pointerdown", () => this.close());
  }

  /** LEFT PAGE — Known, seen-but-unconfirmed, and the locked neighbour catalog. */
  private drawIndexPage(pageX: number, pageY: number, pageW: number, book: string[], clues: string[]) {
    const x = pageX + 22;
    const rowW = pageW - 44;
    let yy = pageY + 22;

    this.text(x, yy, `${book.length} of ${this.magic.spells.length} learned`, PAGE_INK_SOFT, 17, FONT.mono);
    yy += 38;

    this.groupLabel(x, yy, rowW, "KNOWN");
    yy += 30;
    if (!book.length && !clues.length) {
      this.text(x, yy, "No spells yet. Cast one to confirm it.", PAGE_INK_SOFT, 17, FONT.display);
      yy += 32;
    } else {
      for (const id of book) yy = this.spellRow(x, yy, rowW, id, "known");
      for (const id of clues) yy = this.spellRow(x, yy, rowW, id, "clue");
    }

    yy += 16;
    this.groupLabel(x, yy, rowW, "TO LEARN · FROM NEIGHBOURS");
    yy += 30;
    // Not known, and not even glimpsed — the clue rows above already carry the
    // seen ones. Ordered by teaching role, then phrase, so the catalog reads by
    // neighbour the way the mockup groups it.
    const locked = this.magic.spells
      .filter((s) => !this.knowledge.knows(s.spell_id) && !this.knowledge.hasSeen(s.spell_id))
      .sort((a, b) => a.role.localeCompare(b.role) || a.phrase.localeCompare(b.phrase));
    for (const s of locked) yy = this.spellRow(x, yy, rowW, s.spell_id, "locked");
  }

  private groupLabel(x: number, y: number, w: number, text: string) {
    this.text(x, y, text, GOLD, 12, FONT.mono);
    const line = this.add.rectangle(x + w / 2, y + 22, w, 1, COLOR.canvasEdgeNum, 0.8).setOrigin(0.5);
    this.layer.add(line);
  }

  /** One index row on parchment. Known/clue rows select on click; locked rows
   * are inert and dimmer. Returns the next row's y. */
  private spellRow(
    x: number,
    y: number,
    w: number,
    id: string,
    kind: "known" | "clue" | "locked",
  ): number {
    const s = this.magic.spell(id);
    // Locked rows are masked until a neighbour has actually mentioned the spell
    // (revision 5, mode5-ux-flow-wireframe.html §6) — hasSeen()/knows() both
    // false. The moment hasSeen() flips, drawIndexPage()'s own filter moves the
    // row out of "locked" into the seen-clue group, and both the phrase and role
    // are revealed together there. No new state; Knowledge.ts already has
    // seen/learned.
    const phrase = kind === "locked" ? "???" : (s?.phrase ?? id);
    const selected = this.selectedSpell === id;
    const rowH = 32;
    const midY = y + 12;

    if (selected) {
      const hl = this.add.rectangle(x + w / 2 - 6, midY, w, 28, COLOR.goldNum, 0.2).setOrigin(0.5);
      const accent = this.add.rectangle(x - 6, midY, 3, 24, COLOR.goldNum, 1).setOrigin(0.5);
      this.layer.add([hl, accent]);
    }

    const color = kind === "known" ? PAGE_INK : PAGE_INK_SOFT;
    this.text(x, y, phrase, color, 21, FONT.display);

    const tag =
      kind === "known" ? (s?.role ?? "") : kind === "clue" ? "seen · try it" : "not yet mentioned";
    this.text(x + w, y + 4, tag, PAGE_INK_SOFT, 12, FONT.mono).setOrigin(1, 0);

    if (kind !== "locked") {
      // A transparent hit zone spanning the whole row, added last so it sits on
      // top for input. Alpha 0 still receives pointer events (Phaser hit-tests
      // geometry, not pixels).
      const zone = this.add
        .rectangle(x + w / 2 - 6, midY, w, 28, 0x000000, 0)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      this.layer.add(zone);
      zone.on("pointerover", () => zone.setFillStyle(COLOR.goldNum, 0.1));
      zone.on("pointerout", () => zone.setFillStyle(0x000000, 0));
      zone.on("pointerdown", () => {
        this.selectedSpell = id;
        this.redraw();
      });
    }

    return y + rowH;
  }

  /** RIGHT PAGE — the selected spell: phrase, live preview, components, what it
   * does, and a cast/try affordance. All dark ink on parchment. */
  private drawDetailPage(pageX: number, pageY: number, pageW: number) {
    const x = pageX + 24;
    const w = pageW - 48;
    let yy = pageY + 24;

    if (!this.selectedSpell) {
      this.text(x, yy + 30, "Select a spell to see its casting.", PAGE_INK_SOFT, 19, FONT.display);
      return;
    }
    const s = this.magic.spell(this.selectedSpell);
    if (!s) return;
    const known = this.knowledge.knows(s.spell_id);

    this.text(x, yy, s.phrase, PAGE_INK, 30, FONT.display);
    yy += 44;
    this.text(x, yy, `you say “${s.phrase}”`, PAGE_INK_SOFT, 17, FONT.display).setFontStyle("italic");
    yy += 36;

    this.text(x, yy, "VFX PREVIEW", GOLD, 12, FONT.mono);
    // The pane IS the cast affordance now — there is no separate Play button,
    // so the invitation sits where that button used to, in the reading order.
    this.text(x + w, yy, "click the pane to cast", PAGE_INK_SOFT, 12, FONT.mono).setOrigin(1, 0);
    yy += 22;

    // The scrying window takes the page rather than sitting in a letterbox: the
    // right page carried ~230px of dead parchment under the old 664x200 pane
    // (`.playtest/t10-before`), and the preview read small because of it. It now
    // bleeds 12px wider than the text column on each side and stands 340 tall,
    // which still leaves the components/outcome/cast stack its room below.
    const paneX = pageX + 12;
    const paneW = pageW - 24;
    const paneH = 340;
    // The dark scrying window inset into the parchment. buildPreview reads THIS
    // rect for the preview camera viewport, so it tracks the book's position.
    this.buildPreview(paneX, yy, paneW, paneH);
    yy += paneH + 14;

    this.text(x, yy, "COMPONENTS", GOLD, 12, FONT.mono);
    yy += 24;
    let cx = x;
    for (const comp of s.components) {
      const cw = this.drawChip(cx, yy, this.label(comp));
      cx += cw + 10;
      if (cx > x + w - 120) {
        cx = x;
        yy += 40;
      }
    }
    yy += 46;

    this.text(x, yy, "WHAT IT DOES", GOLD, 12, FONT.mono);
    yy += 24;
    // No spell-level summary field exists, so this is composed from authored
    // data only: the component → produces transformation, then the first
    // receiver's own physical_outcome prose, verbatim. Nothing invented.
    const transform =
      s.components.map((c) => this.label(c)).join(" + ") +
      (s.produces.length ? "  →  " + s.produces.map((p) => this.label(p)).join(", ") : "");
    const tline = this.text(x, yy, transform, PAGE_INK, 15, FONT.mono);
    tline.setWordWrapWidth(w, true);
    yy += tline.height + 8;
    const outcome = s.receivers[0]?.physical_outcome;
    if (outcome) {
      const o = this.text(x, yy, outcome, PAGE_INK_SOFT, 16, FONT.display);
      o.setWordWrapWidth(w, true);
      yy += o.height + 16;
    }

    if (this.inventory) {
      this.drawCastButton(x, yy, known ? `Cast ${s.phrase}` : `Try ${s.phrase}`, () => this.tryClue(s.spell_id));
    }
  }

  /** A gold-tinted component chip with dark-ink text on the parchment. Returns
   * its width so the caller can advance. bg is added before the text (ADD ORDER
   * is stacking order in the layer container). */
  private drawChip(x: number, y: number, label: string): number {
    // §14 §8: chip text is mono, like the satchel's "carried for" chips.
    const t = this.add.text(x + 11, y + 5, label, { fontFamily: FONT.mono, fontSize: "15px", color: PAGE_INK });
    const cw = t.width + 22;
    const ch = t.height + 10;
    const bg = this.add.graphics();
    bg.fillStyle(COLOR.goldNum, 0.16);
    bg.fillRoundedRect(x, y, cw, ch, 6);
    bg.lineStyle(1, COLOR.canvasEdgeNum, 1);
    bg.strokeRoundedRect(x, y, cw, ch, 6);
    this.layer.add(bg);
    this.layer.add(t);
    return cw;
  }

  /** The primary action — a gold-wash button with dark-ink text, §4.3, the same
   * language SaveLoadScene's Resume uses. Auto-sized to the label. */
  private drawCastButton(x: number, y: number, label: string, onClick: () => void) {
    // §14 §4.3: the on-canvas button family is mono — same as SatchelScene's
    // `canvasButton` and SaveLoadScene's Resume/Start Over.
    const t = this.add.text(0, 0, label, { fontFamily: FONT.mono, fontSize: "15px", color: PAGE_INK });
    const bw = t.width + 36;
    const bh = t.height + 22;
    const cx = x + bw / 2;
    const cy = y + bh / 2;
    t.setPosition(cx, cy).setOrigin(0.5);
    const bg = this.add.rectangle(cx, cy, bw, bh, COLOR.goldNum, 0.18).setStrokeStyle(1, COLOR.goldNum, 0.9);
    this.layer.add(bg);
    this.layer.add(t);
    const enter = () => bg.setFillStyle(COLOR.goldNum, 0.34).setStrokeStyle(1, COLOR.emberNum, 1);
    const leave = () => bg.setFillStyle(COLOR.goldNum, 0.18).setStrokeStyle(1, COLOR.goldNum, 0.9);
    for (const o of [bg, t] as Phaser.GameObjects.GameObject[]) {
      o.setInteractive({ useHandCursor: true });
      o.on("pointerover", enter);
      o.on("pointerout", leave);
      o.on("pointerdown", onClick);
    }
  }

  /**
   * Stand up the live preview for the selected spell. The cue's KIND decides how,
   * because Phaser 4 renders the two families differently:
   *
   *  - PARTICLES emit on the MAIN camera at the pane's on-screen centre. A
   *    particle emitter does NOT render on a secondary camera in this build
   *    (verified: a 24-dot burst on the preview camera showed nothing), so it
   *    cannot use the off-world stage. Containment is geometric instead — every
   *    authored particle cue travels at most ~94px, well inside the pane's 170px
   *    half-height, so the burst stays in the pane without a clip.
   *
   *  - GLOW / TINT / FILTER composite a CAMERA's viewport, so they get a
   *    dedicated camera bounded to the pane and scrolled to a near-black stage
   *    far off in world space (`STAGE_X/Y`). That stage carries a dim warm
   *    subject: a camera filter TRANSFORMS the rendered frame, and a flat black
   *    frame gives it nothing to transform (glow has no luminance to halo, tint
   *    multiplies dark into dark). The subject stands in for the lit backdrop the
   *    cue composites in-game. (This subject is a deliberate deviation from the
   *    flat-near-black recipe — see the handoff report.)
   *
   * The pane's leather border is drawn in the layer (main camera). All four
   * coordinates come from the caller, so the preview follows the pane wherever
   * the book is placed.
   */
  private buildPreview(paneX: number, paneY: number, paneW: number, paneH: number) {
    // Border ring + near-black interior, in the layer. For particle cues this
    // interior IS the visible ground; for filter cues the preview camera paints
    // over it. A pane-sized rectangle needs no clip — it cannot overflow itself.
    const border = this.add
      .rectangle(paneX + paneW / 2, paneY + paneH / 2, paneW, paneH, COLOR.night, 1)
      .setStrokeStyle(2, COLOR.leatherDarkNum, 1);
    this.layer.add(border);
    this.previewPane = { x: paneX + paneW / 2, y: paneY + paneH / 2, w: paneW, h: paneH };

    // THE PANE IS THE CAST TRIGGER. Same affordance language as the index rows
    // and the cast button — hand cursor, gold on hover, fire on pointerdown.
    // It is hit-tested against the MAIN camera (Phaser returns the first camera
    // below the pointer that has hits, and the main camera is first in the
    // scene's list), so the preview camera parked over this rect does not eat
    // the click.
    border.setInteractive({ useHandCursor: true });
    border.on("pointerover", () => border.setStrokeStyle(2, COLOR.goldNum, 1));
    border.on("pointerout", () => border.setStrokeStyle(2, COLOR.leatherDarkNum, 1));
    border.on("pointerdown", () => {
      if (this.selectedSpell) this.playPreview(this.selectedSpell);
    });

    const cue = this.selectedSpell ? spellPreviewCue(this.selectedSpell, this.cueTable) : null;
    const anchored = cue ? isAnchoredKind(cue.kind) : false;

    if (anchored) {
      // Particles on the main camera, bursting from the pane centre. The anchor
      // is the pane centre directly — `PhaserVfxBackend.emit` now emits from the
      // emitter's own origin (the anchor), so the burst lands where told.
      this.previewBackend = new PhaserVfxBackend({ scene: this, depth: 900 });
      this.previewAnchor = { x: paneX + paneW / 2, y: paneY + paneH / 2 };
    } else {
      const inset = 3;
      const camW = paneW - inset * 2;
      const camH = paneH - inset * 2;
      const scx = STAGE_X + camW / 2;
      const scy = STAGE_Y + camH / 2;

      const ground = this.add.rectangle(scx, scy, camW, camH, COLOR.night, 1).setDepth(100);
      this.previewObjects.push(ground);
      this.drawPreviewSubject(scx, scy, camH);

      const cam = this.cameras.add(paneX + inset, paneY + inset, camW, camH);
      cam.setScroll(STAGE_X, STAGE_Y);
      this.previewCam = cam;

      this.previewBackend = new PhaserVfxBackend({ scene: this, camera: cam, depth: 900 });
      this.previewAnchor = { x: scx, y: scy };
    }

    // NO AUTOPLAY AND NO REPLAY LOOP. The pane is built dark and stays dark
    // until the player clicks it. Selecting a spell is navigation, not a cast,
    // and `redraw()` runs on every selection and on every return from
    // SpellTrialScene — an autoplay here fired a cue the player never asked for
    // each time.
  }

  /** A broad, soft, warm MID-TONE wash — the scrying-window's stand-in for the
   * lit backdrop, used only in the camera-filter path. A glow needs edges of
   * luminance to halo and a tint needs a mid-tone to bend; a flat black frame
   * gives them neither. Low-contrast on purpose, so the transformed frame reads
   * as "the world answered" rather than as a bright object. */
  private drawPreviewSubject(cx: number, cy: number, h: number) {
    const rings: [number, number, number][] = [
      [h * 0.85, 0x2a2012, 0.8],
      [h * 0.62, 0x3c2e18, 0.75],
      [h * 0.42, 0x50401f, 0.7],
      [h * 0.24, 0x64502a, 0.65],
    ];
    for (const [r, color, a] of rings) {
      const c = this.add.circle(cx, cy, r, color, a).setDepth(200);
      this.previewObjects.push(c);
    }
  }

  private playPreview(id: string) {
    if (!this.previewBackend || !this.previewBackend.attached) return;
    this.previewBackend.stopAll();
    const cue = spellPreviewCue(id, this.cueTable);
    if (cue) {
      this.previewBackend.play(this.paneSized(cue), { x: this.previewAnchor.x, y: this.previewAnchor.y });
    }
  }

  /**
   * The same authored cue, sized for the scrying window.
   *
   * Cue art is authored for a cast out in the world — glimmer's mote sheet is a
   * 128px sprite — which reads as a speck once the pane is 340 tall. Only the
   * SPATIAL `scale` param is touched: colour, weight, kind and duration stay
   * exactly as authored, so `spellPreview.ts`'s guarantee (a preview shows the
   * REAL cue, never an invented one) still holds. `scale` is read by the
   * `sprite` path; the other kinds carry their own tuned geometry and ignore it.
   */
  private paneSized(cue: VfxCue): VfxCue {
    const authored = typeof cue.params?.scale === "number" ? cue.params.scale : 1;
    return { ...cue, params: { ...cue.params, scale: authored * PREVIEW_CUE_SCALE } };
  }

  /** Release the preview's camera, filter/emitter and stage. Idempotent, and
   * safe to call when no preview is up. */
  private teardownPreview() {
    if (this.previewBackend) {
      this.previewBackend.detach();
      this.previewBackend = undefined;
    }
    if (this.previewCam) {
      this.cameras.remove(this.previewCam);
      this.previewCam = undefined;
    }
    for (const o of this.previewObjects.splice(0)) o.destroy();
  }

  /** Ink's own KnownPhrases, mirrored host-side by WorldState. */
  private drawKnowledge(y: number) {
    const known = this.view.notebook;
    this.text(64, y, `${known.length} facts learned`, DIM, 20, "monospace");
    if (!known.length) {
      this.text(64, y + 40, "Nothing yet. Facts are learned by talking and looking.", DIM, 24);
      return;
    }
    known.forEach((k, i) => {
      this.text(64 + (i % 3) * 600, y + 44 + Math.floor(i / 3) * 34, `· ${k}`, INK, 22, "monospace");
    });
  }

  /** Bond BANDS only — never a raw score. WorldState refuses to expose one. */
  private drawRelationships(y: number) {
    const bands = this.view.bondBands ?? {};
    const souls = Object.keys(bands).sort();
    this.text(64, y, `${souls.length} souls met`, DIM, 20, "monospace");
    if (!souls.length) {
      this.text(64, y + 40, "No one yet. Bonds build by talking.", DIM, 24);
      return;
    }
    souls.forEach((s, i) => {
      const band = bands[s];
      const dots = "●".repeat(Number(band) + 1) + "○".repeat(2 - Number(band));
      this.text(64, y + 46 + i * 34, `${s.padEnd(10)} ${dots}`, INK, 24, "monospace");
    });
  }

  private drawCollection(y: number) {
    const { satchel, arms, banked } = this.view;
    this.text(
      64,
      y,
      `Satchel ${satchel.length}/${this.view.satchelCapacity} · ` +
        `Arms ${arms.length}/${this.view.armsCapacity} · Banked ${banked.length}`,
      DIM,
      20,
      "monospace",
    );
    const rows: [string, string[]][] = [
      ["Satchel", satchel],
      ["Arms", arms],
      ["Banked at Home", banked],
    ];
    let ry = y + 50;
    for (const [name, list] of rows) {
      this.text(64, ry, name, GOLD, 22, "monospace");
      ry += 32;
      if (!list.length) {
        this.text(88, ry, "—", DIM, 22, "monospace");
        ry += 34;
        continue;
      }
      list.forEach((item, i) => {
        this.text(88 + (i % 4) * 420, ry + Math.floor(i / 4) * 32, `· ${this.label(item)}`, INK, 22, "monospace");
      });
      ry += 34 * Math.ceil(list.length / 4) + 12;
    }
  }

  private text(
    x: number,
    y: number,
    value: string,
    color: string,
    size: number,
    font = "Georgia, serif",
  ): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, value, {
      fontFamily: font,
      fontSize: `${size}px`,
      color,
    });
    this.layer.add(t);
    return t;
  }

  private expose() {
    (window as unknown as Record<string, unknown>).__notebook = {
      setTab: (t: Tab) => {
        this.tab = t;
        this.redraw();
      },
      /** Jump to the spells tab and select a spell by id — deterministic entry
       * for playtests, no pixel-hunting the index rows. */
      select: (id: string) => {
        this.tab = "spells";
        this.selectedSpell = id;
        this.redraw();
      },
      /** What the preview is doing right now — for playtest assertions. */
      preview: () => ({
        selected: this.selectedSpell,
        cameras: this.cameras.cameras.length,
        live: this.previewBackend?.liveCount ?? 0,
        /** The pane's on-screen rect — a playtest clicks its centre for real
         * rather than hard-coding a guess at the layout. */
        pane: { ...this.previewPane },
      }),
      snapshot: () => ({
        tab: this.tab,
        knowledge: [...this.view.notebook],
        spellbook: this.knowledge.spellbook(),
        clues: this.knowledge.clues(),
        bonds: { ...(this.view.bondBands ?? {}) },
        satchel: [...this.view.satchel],
        arms: [...this.view.arms],
        banked: [...this.view.banked],
      }),
      close: () => this.close(),
    };
  }
}
