/**
 * The lives board (mode5 plan Track 2b — the third UI-migration screen; T13
 * Phase 4 turned it from a resume gate into a real 3-slot picker).
 * Ports `tools/screen-flow/mockups/save-load.html` to Phaser, same VIEW
 * discipline as `SatchelScene`/`NotebookScene`/`CalendarScene`: a snapshot
 * handed in at launch, never touching the ink bridge live. It reads the
 * shipped save layer (`SaveStore`) and renders it; it does not invent state.
 *
 * ROLE — BOOT-TIME LIFE PICKER. Shown by `PreloadScene` before the game runs,
 * for any mode that saves. It took this job over from the retired
 * `ResumePromptScene` (Roc, 2026-08-19), and still reproduces its load-bearing
 * behaviours, with (b) rewritten by Phase 4:
 *
 *   (a) it is the PreloadScene entry for collect/discover-home/mode5;
 *   (b) PASS-THROUGH ONLY FOR A MODE WITH NO SLOTS. `collect` and
 *       `discover-home` carry `save: null`, have nowhere to write, and are sent
 *       straight to LocationSelectScene as before. A SLOT-SET MODE ALWAYS SEES
 *       THE BOARD, INCLUDING ON FIRST BOOT — this replaced the old "nothing
 *       saved, so skip the screen" pass-through (T13 ruling + build plan Phase
 *       4, adopted 2026-08-24). The old behaviour was right when the board could
 *       only ever offer Continue; now there is no save to resume but there IS a
 *       slot to choose and a name to type, and skipping the board would skip the
 *       only place either happens. A refused save (`version-mismatch`) no longer
 *       passes through either: its slot draws as empty-with-a-reason, so the
 *       player is told rather than silently dropped into a new game;
 *   (c) Resume starts CollectScene DIRECTLY, skipping LocationSelectScene, so
 *       CollectScene.init()'s restore runs wholesale;
 *   (d) Start over CLEARS the slot eagerly (not on the next autosave), then asks
 *       for the new life's name in the same card;
 *   (e) it calls `ink.runToChoice()` in create() first, matching
 *       LocationSelectScene, so a later restore has settled — the fix for the
 *       day-1 card-flash bug the old scene documented.
 *
 * NO in-game overlay. Save is automatic (autosave on day/place change), so
 * there is no mid-game save/load button — this scene only ever runs at boot.
 * It keeps a backdrop image behind the board (`bg:mode-picker`) so the gate
 * never renders on black.
 *
 * THREE LIVES, ONE PER COLUMN (T13 Phase 4). Every column binds to one entry of
 * `ModeDescriptor.save.slots`, in order. A column is one of three things and
 * never a placeholder for a fourth:
 *   FILLED  — the save read out of that slot: heading, place, spells, last
 *             played, Resume / Start over.
 *   EMPTY   — "Begin a new life here". This is what replaces the New Life button
 *             (removed under T7); the button is gone, the FUNCTION lives here.
 *   NAMING  — the same column mid-name-entry, after it was picked.
 * The old "1 real slot + 2 hatched dead placeholders" rendering is gone, and so
 * is reading the first slot as a stand-in for a choice nobody had made yet.
 *
 * NAME ENTRY IS A FIELD ON THE BOARD, NOT A SCENE. A Phaser Text plus one
 * `keydown` capture in this scene (the same shape `CastScene` already uses to
 * type a spell phrase), drawn inside the picked column. It does not fight the
 * layout — the card is 370x400 with room to spare once the data rows are
 * replaced by a field — so the plan's "no new scene unless it fights the board"
 * condition was never triggered.
 *
 * AN EMPTY NAME IS ALLOWED, AND SAYS SO. Confirming an empty field begins an
 * unnamed life (`SaveGame.playerName === ""`, a documented schema state), and
 * the hint under the field says that is what will happen. Two reasons, both
 * deliberate: a boot screen with no way forward except typing is a dead end for
 * anyone who does not want to name a save, and the adversary QA harness
 * (`tools/adversary`) enters play by clicking random interactives — a modal that
 * only a real name can leave would wedge it.
 *
 * WHICH LIFE RIDES SCENE DATA. Both routes hand `saveSlot` and `playerName` on
 * to the next scene (`ChosenLife`) rather than letting the play scene re-derive
 * them from the descriptor — the descriptor lists three slots and cannot say
 * which one was chosen, and as of Phase 4 `CollectScene` no longer guesses.
 *
 * "SOULS MET" IS OMITTED. The mockup lists it, but no slice persists a
 * souls-met count (bond bands live inside opaque `ink.storyStateJson`). Per
 * SatchelScene's never-fabricate rule the field is dropped rather than
 * synthesised — see `SaveSlotView.ts`.
 *
 * DRAW-ORDER DISCIPLINE. `this.layer` (a Container) renders children in ADD
 * ORDER, not by `.setDepth()` — the same bug that bit SatchelScene (a label
 * rendered under its own background). Every `draw*` below adds back-to-front;
 * none call `.setDepth()` on a `layer` child. The empty-slot hatch is a
 * generated `TileSprite`, not a masked Graphics pattern, because Phaser 4's
 * WebGL renderer silently no-ops `setMask` (paid for in SatchelScene).
 *
 * COLOUR. Built on the §14 canonical tokens (`COLOR.gold`/`ember`), never the
 * VFX golds — so it does not inherit SatchelScene's pending recolour debt.
 */

import Phaser from "phaser";
import type { InkBridge } from "../ink/InkBridge";
import type { Run } from "../ink/loadRun";
import type { MagicDB } from "../magic/CastResolver";
import type { ModeDescriptor } from "../mode/ModeDescriptor";
import type { SaveLoadDefect } from "../world/save/SaveGame";
import { SaveStore, webSaveStorage } from "../world/save/SaveStore";
import { buildSaveSlot, formatLifeHeading, type SaveSlotView } from "../world/SaveSlotView";
import { COLOR, FONT, REDUCED_MOTION, filigreeCorners, sceneFadeIn, sceneTransition } from "../ui/theme";

const W = 1920;
const H = 1080;

/** The numeric form of the `danger` (rust) token — `COLOR.danger` is only
 * published as a hex string, and Graphics fills/strokes need a number. Derived
 * from the token rather than re-hardcoding the hex, per the §14 no-raw-hex rule. */
const DANGER_NUM = Phaser.Display.Color.HexStringToColor(COLOR.danger).color;
/** Same derivation for the dark parchment ink, which the name field's caret
 * needs as a Rectangle fill (`COLOR.inkOnCanvas` is a hex string only). */
const INK_ON_CANVAS_NUM = Phaser.Display.Color.HexStringToColor(COLOR.inkOnCanvas).color;

const BOARD_W = 1240;
/** Sized to its content, not to the mockup's fixed frame: the cards lost the
 * duplicated Day row to the heading (T13 Phase 4), and a board left at its old
 * 760 stranded ~160px of empty leather between the cards and the footer. */
const BOARD_H = 660;
const BOARD_X = (W - BOARD_W) / 2;
const BOARD_TOP = 200;
const BOARD_PAD = 40;

const SLOT_COLS = 3;
const SLOT_GAP = 24;
const SLOT_W = Math.floor((BOARD_W - 2 * BOARD_PAD - (SLOT_COLS - 1) * SLOT_GAP) / SLOT_COLS);
const SLOT_H = 430;
const SLOT_TOP = BOARD_TOP + 128;
const SLOT_PAD = 22;

/**
 * How long a name may be. Not a schema rule — `SaveGame.playerName` is any
 * string — but a card is 370px wide and the heading has to fit "«name» — Year
 * 2, Day 3 · evening" on one line beside it. Enforced at the only place a name
 * is ever typed.
 */
const NAME_MAX = 14;

export interface SaveLoadSceneData {
  run: Run;
  ink: InkBridge;
  magic: MagicDB;
  mode: ModeDescriptor;
}

/** One column's state: the slot id plus what reading it produced. */
interface SlotColumn {
  readonly slot: string;
  readonly view: SaveSlotView | null;
  /** Why the slot is empty, when it is. `missing` = never written. */
  readonly defect: SaveLoadDefect | null;
}

export class SaveLoadScene extends Phaser.Scene {
  private run!: Run;
  private ink!: InkBridge;
  private magic!: MagicDB;
  private mode!: ModeDescriptor;
  private spellsTotal = 0;
  private store!: SaveStore;
  /** Two-step guard for the destructive Start-over, held PER SLOT — the first
   * click arms that column, the second clears it. Three lives means an armed
   * boolean would arm all three at once. Reset every redraw path that leaves
   * the state. */
  private confirmingClearSlot: string | null = null;
  /** The column mid-name-entry, or null. `name` is exactly what has been typed
   * — never trimmed until it is committed, so the caret sits where the player
   * put it. PUBLIC-BY-STRUCTURE for no one; only `onKey` and the card write it. */
  private naming: { slot: string; name: string } | null = null;
  private caretTween: Phaser.Tweens.Tween | null = null;
  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super("SaveLoadScene");
  }

  init(data: SaveLoadSceneData) {
    this.run = data.run;
    this.ink = data.ink;
    this.magic = data.magic;
    this.mode = data.mode;
    this.spellsTotal = data.magic.spells.length;
    this.store = new SaveStore(webSaveStorage(localStorage));
    this.confirmingClearSlot = null;
    this.naming = null;
    this.caretTween = null;
  }

  /**
   * The board's own backdrop, loaded here rather than borrowed.
   *
   * `bg:mode-picker` used to arrive only because `ModePickerScene` had already
   * run and loaded it — which is true when a player picks a mode, and false on
   * a direct `?mode=mode5` boot (dev and every playtest). That was invisible
   * while the board skipped itself on a first boot; now that it always draws, a
   * missing texture means a screen the header promises is never on black IS on
   * black. Guarded, so the common path re-uses the loaded texture.
   */
  preload() {
    if (!this.textures.exists("bg:mode-picker")) {
      this.load.image("bg:mode-picker", "art/ui/mode-picker-bg.jpg");
    }
  }

  create() {
    sceneFadeIn(this);
    // Settle the player past its boot point BEFORE any restore, matching
    // LocationSelectScene's own first line — this is the day-1 card-flash fix.
    this.ink.runToChoice();

    // The ONLY pass-through left (see behaviour (b) in the class header): a mode
    // with no slots has no life to pick and nowhere to write one, so there is
    // nothing for this board to show. Everything else — including a first boot
    // with nothing saved, and a slot holding a save this build refuses — draws
    // the board.
    if (this.slots().length === 0) {
      this.goNewLife(undefined, "");
      return;
    }

    this.ensureHatchTexture();
    this.drawBackdrop();
    this.layer = this.add.container(0, 0).setDepth(2);
    this.bindNameEntry();
    this.redraw();
  }

  private slots(): readonly string[] {
    return this.mode.save?.slots ?? [];
  }

  /** A backdrop image behind the board so the boot gate never sits on black —
   * the same `bg:mode-picker` the retired ResumePromptScene used, under a soft
   * scrim. Falls back to a flat night wash if the texture is missing. */
  private drawBackdrop(): void {
    const bg = this.add.image(W / 2, H / 2, "bg:mode-picker").setDepth(0);
    if (this.textures.exists("bg:mode-picker")) {
      bg.setScale(Math.max(W / bg.width, H / bg.height));
    } else {
      bg.setVisible(false);
      this.add.rectangle(W / 2, H / 2, W, H, COLOR.night, 1).setDepth(0);
    }
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.45).setDepth(1);
  }

  /** Read every slot once per redraw. A defect is CARRIED, not swallowed: an
   * empty column says which kind of empty it is (never written vs. holds a save
   * this build will not read). */
  private columns(): SlotColumn[] {
    return this.slots().map((slot) => {
      const read = this.store.read(slot);
      return read.ok
        ? { slot, view: buildSaveSlot(read.save, this.spellsTotal), defect: null }
        : { slot, view: null, defect: read.defect };
    });
  }

  /** A dark diagonal-stripe tile (mockup: `.slot.empty`'s
   * `repeating-linear-gradient(45deg, ...)`), generated once. A real
   * `TileSprite` texture, not a mask-clipped pattern — see the class header. */
  private ensureHatchTexture(): void {
    const key = "saveload-hatch";
    if (this.textures.exists(key)) return;
    const size = 20;
    const g = this.add.graphics();
    g.fillStyle(COLOR.leatherDarkNum, 1);
    g.fillRect(0, 0, size, size);
    g.lineStyle(9, COLOR.night, 1);
    // One diagonal plus its two corner-completions — the seamless-tile trick
    // `generateTexture` needs so the stripe connects across the tile edge.
    g.lineBetween(0, size, size, 0);
    g.lineBetween(size, size, size * 2, 0);
    g.lineBetween(-size, size, 0, 0);
    g.generateTexture(key, size, size);
    g.destroy();
  }

  // ── Routes out ────────────────────────────────────────────────────────────

  /** Resume the chosen slot. The slot and the name on it ride scene data into
   * `CollectScene` (`ChosenLife`) — the play scene must not re-derive them from
   * a descriptor that lists three slots. The name comes off the save being
   * resumed, so it is whatever that life was actually called; a save written
   * before name entry existed carries `""`, which is passed on as-is. */
  private goResume(slot: string): void {
    const read = this.store.read(slot);
    sceneTransition(this, "CollectScene", {
      run: this.run,
      ink: this.ink,
      magic: this.magic,
      mode: this.mode,
      saveSlot: slot,
      playerName: read.ok ? read.save.playerName : "",
    });
  }

  /**
   * Begin a life in `slot` under `playerName`, via the day-1 pick.
   *
   * `slot` is `undefined` only for a mode with no slots at all (the pass-through
   * in `create()`), which also cannot have a name. Both fields are forwarded
   * verbatim by `LocationSelectScene` and land on `CollectScene`.
   *
   * NOTHING IS DELETED HERE. Start-over does its own eager `remove()` before it
   * asks for a name (see `onStartOver`), and a slot holding a save this build
   * REFUSED is left exactly where it is until the new life's first autosave
   * overwrites it — refusing a save and then quietly deleting it is the same
   * data loss with a better excuse (`SaveStore`'s own rule).
   */
  private goNewLife(slot: string | undefined, playerName: string): void {
    sceneTransition(this, "LocationSelectScene", {
      run: this.run,
      ink: this.ink,
      magic: this.magic,
      mode: this.mode,
      saveSlot: slot,
      playerName,
    });
  }

  // ── Name entry ────────────────────────────────────────────────────────────

  /**
   * One `keydown` listener for the whole scene, installed once in `create()`
   * and dead unless a column is naming. Same shape as `CastScene`'s typed
   * phrase — a Phaser Text plus the raw DOM event's `key`, no DOM input
   * element over the canvas.
   *
   * SPACE and BACKSPACE are captured only WHILE naming (`beginNaming` /
   * `endNaming`): captures are global across scenes, so holding them for the
   * whole scene would be a side effect this screen has no business having.
   */
  private bindNameEntry(): void {
    this.input.keyboard?.on("keydown", (e: KeyboardEvent) => this.onKey(e));
    this.events.once("shutdown", () => {
      this.input.keyboard?.removeAllListeners();
      this.input.keyboard?.removeCapture("SPACE,BACKSPACE");
      this.caretTween?.remove();
      this.caretTween = null;
    });
  }

  private onKey(e: KeyboardEvent): void {
    const naming = this.naming;
    if (!naming) return;
    if (e.key === "Escape") return this.cancelNaming();
    if (e.key === "Enter") return this.commitNaming();
    if (e.key === "Backspace") {
      this.naming = { ...naming, name: naming.name.slice(0, -1) };
      return this.redraw();
    }
    // One printable character, no modifier chord. Deliberately NOT an
    // `[A-Za-z]` allow-list: a name is the player's, and an accented or
    // non-Latin letter arrives here as a single-character `key` like any other.
    // A leading space is dropped so a name cannot start with invisible padding.
    if (e.key.length !== 1 || e.ctrlKey || e.metaKey || e.altKey) return;
    if (e.key === " " && naming.name.length === 0) return;
    if (naming.name.length >= NAME_MAX) return;
    this.naming = { ...naming, name: naming.name + e.key };
    this.redraw();
  }

  private beginNaming(slot: string): void {
    this.confirmingClearSlot = null;
    this.naming = { slot, name: "" };
    this.input.keyboard?.addCapture("SPACE,BACKSPACE");
    this.redraw();
  }

  private cancelNaming(): void {
    this.naming = null;
    this.input.keyboard?.removeCapture("SPACE,BACKSPACE");
    this.redraw();
  }

  /** Confirm the typed name and start the life. An empty field is a real answer
   * — an unnamed life, `playerName: ""` — not a blocked button; see the class
   * header for why this screen never refuses to let the player leave. */
  private commitNaming(): void {
    const naming = this.naming;
    if (!naming) return;
    const name = naming.name.trim();
    this.input.keyboard?.removeCapture("SPACE,BACKSPACE");
    this.naming = null;
    this.goNewLife(naming.slot, name);
  }

  // ── Drawing ───────────────────────────────────────────────────────────────

  private redraw(): void {
    this.layer.removeAll(true);
    // The caret tween's target was just destroyed with the layer. Phaser does
    // not reclaim a tween when its target dies, so it is dropped by hand here
    // rather than left running against a freed object.
    this.caretTween?.remove();
    this.caretTween = null;

    const columns = this.columns();
    this.drawBoard();
    this.drawHeader(columns.some((c) => c.view !== null));

    // While a column is naming, the other two draw but do not respond — a stray
    // click must not start a second name entry on top of the first.
    const live = this.naming === null;
    columns.forEach((column, i) => {
      const x = BOARD_X + BOARD_PAD + (i % SLOT_COLS) * (SLOT_W + SLOT_GAP);
      const y = SLOT_TOP + Math.floor(i / SLOT_COLS) * (SLOT_H + SLOT_GAP);
      if (this.naming?.slot === column.slot) this.drawNamingSlot(this.naming.name, x, y);
      else if (column.view) this.drawFilledSlot(column.view, x, y, live);
      else this.drawEmptySlot(column.slot, column.defect, x, y, live);
    });

    this.drawFooter();
  }

  private drawBoard(): void {
    // Drop shadow first (mockup: `box-shadow: 0 24px 60px rgba(0,0,0,.55)`).
    const shadow = this.add.graphics();
    shadow.fillStyle(COLOR.night, 0.55);
    shadow.fillRoundedRect(BOARD_X - 6, BOARD_TOP + 18, BOARD_W + 12, BOARD_H + 12, 20);
    this.layer.add(shadow);

    // Framed board — §5.1 dark leather gradient, leatherDark border.
    const g = this.add.graphics();
    g.fillGradientStyle(COLOR.leatherNum, COLOR.leatherNum, COLOR.leatherDarkNum, COLOR.leatherDarkNum, 1);
    g.fillRoundedRect(BOARD_X, BOARD_TOP, BOARD_W, BOARD_H, 16);
    g.lineStyle(2, COLOR.leatherDarkNum, 1);
    g.strokeRoundedRect(BOARD_X, BOARD_TOP, BOARD_W, BOARD_H, 16);
    this.layer.add(g);

    // Gold corner filigree in all four corners — the shipped placeholder the
    // §6 style guide mounts on every framed modal.
    this.layer.add(filigreeCorners(this, BOARD_X + BOARD_W / 2, BOARD_TOP + BOARD_H / 2, BOARD_W, BOARD_H));
  }

  /**
   * The board's own title, which now has to be honest on a first boot.
   *
   * "CONTINUE / CHOOSE WHERE TO PICK UP" is a lie in front of three empty
   * slots, and Phase 4 made that a screen the player really sees (behaviour (b)
   * above). So the heading follows the board: Continue when there is something
   * to continue, Begin when there is not. The mockup's wording is kept for the
   * case the mockup drew.
   */
  private drawHeader(anyFilled: boolean): void {
    const cx = BOARD_X + BOARD_W / 2;
    const spaced = (s: string) => s.split("").join(" ");
    const title = this.text(cx, BOARD_TOP + 32, spaced(anyFilled ? "CONTINUE" : "BEGIN"), COLOR.ember, 36, FONT.display)
      .setOrigin(0.5, 0);
    title.setFontStyle("bold");
    // No naming-specific subtitle: the card being named already carries "NAME
    // THIS LIFE" as its own eyebrow, and saying it twice on one screen reads as
    // two instructions.
    const sub = anyFilled ? "CHOOSE WHERE TO PICK UP" : "CHOOSE A SLOT AND NAME YOUR LIFE";
    this.text(cx, BOARD_TOP + 86, sub, COLOR.muted, 15, FONT.mono).setOrigin(0.5, 0);
  }

  /** The parchment card shared by the filled and naming states — §5.2 canvas
   * gradient, gold-bright active border. Drawn first so everything else lands
   * on top of it (ADD ORDER, see the class header). */
  private drawCard(x: number, y: number): void {
    const g = this.add.graphics();
    g.fillGradientStyle(COLOR.canvas, COLOR.canvas, COLOR.canvas2Num, COLOR.canvas2Num, 1);
    g.fillRoundedRect(x, y, SLOT_W, SLOT_H, 12);
    g.lineStyle(2, COLOR.emberNum, 1);
    g.strokeRoundedRect(x, y, SLOT_W, SLOT_H, 12);
    this.layer.add(g);
  }

  private drawFilledSlot(view: SaveSlotView, x: number, y: number, live: boolean): void {
    this.drawCard(x, y);
    this.drawCrest(x + SLOT_W / 2, y + SLOT_PAD + 26, 26);

    // THE HEADING — "«name» — Year 2, Day 3 · evening", composed in
    // `SaveSlotView` so the exact string is unit-tested, not screenshot-tested.
    // Wrapped rather than clipped: a long name pushes to a second line instead
    // of running off the card.
    const heading = this.text(
      x + SLOT_W / 2,
      y + SLOT_PAD + 62,
      formatLifeHeading(view),
      COLOR.inkOnCanvas,
      17,
      FONT.display,
    ).setOrigin(0.5, 0);
    heading.setFontStyle("bold");
    heading.setWordWrapWidth(SLOT_W - 2 * SLOT_PAD, true);
    heading.setAlign("center");

    // Data rows — gold uppercase eyebrow + dark-ink value. Day and block are
    // NOT repeated here; the heading above carries them. "Souls met" is omitted
    // on purpose (see the class header / SaveSlotView.ts).
    const rows: ReadonlyArray<readonly [string, string, string]> = [
      ["PLACE", view.place, ""],
      ["SPELLS LEARNED", String(view.spellsLearned), `of ${view.spellsTotal}`],
      ["LAST PLAYED", view.lastPlayed, ""],
    ];
    let ry = y + SLOT_PAD + 128;
    const rx = x + SLOT_PAD;
    for (const [eyebrow, value, tail] of rows) {
      this.text(rx, ry, eyebrow, COLOR.gold, 11, FONT.mono);
      const val = this.text(rx, ry + 16, value, COLOR.inkOnCanvas, 18, FONT.display);
      if (tail) this.text(rx + val.width + 8, ry + 21, tail, COLOR.inkSoftOnCanvas, 13, FONT.display);
      ry += 52;
    }

    // Two footer actions pinned to the card bottom.
    const btnW = (SLOT_W - 2 * SLOT_PAD - 10) / 2;
    const btnY = y + SLOT_H - SLOT_PAD - 40;
    this.canvasButton(x + SLOT_PAD, btnY, btnW, 40, "Resume", "primary", live, () => this.goResume(view.slot));
    const armed = this.confirmingClearSlot === view.slot;
    this.canvasButton(x + SLOT_PAD + btnW + 10, btnY, btnW, 40, armed ? "Confirm Erase" : "Start Over", "warn", live, () =>
      this.onStartOver(view.slot),
    );
  }

  /**
   * First click arms the confirm and redraws (relabels the button); the second
   * clears the slot. Clearing mid-game is real — the autosave is the running
   * session's own slot — so it never happens on one click.
   *
   * WHAT FOLLOWS THE SECOND CLICK CHANGED IN PHASE 4, THE CONFIRM ITSELF DID
   * NOT. It used to route straight to the day-1 pick with no name. Now the
   * cleared column becomes an empty one and immediately asks for a name,
   * because a new life started here IS a new life and every other way of
   * starting one asks. The eager `remove()` still happens before anything else,
   * so a reload during naming cannot resurrect the abandoned save.
   */
  private onStartOver(slot: string): void {
    if (this.confirmingClearSlot !== slot) {
      this.confirmingClearSlot = slot;
      this.redraw();
      return;
    }
    this.store.remove(slot);
    this.beginNaming(slot);
  }

  /**
   * An empty column — the mechanism that replaced the New Life button.
   *
   * ADD ORDER matters (see class header): hatch + border first, label last.
   * A defect other than `missing` is SAID OUT LOUD rather than rendered as a
   * plain empty slot: those bytes are a save this build refuses to read, the
   * player may well remember playing it, and "empty" alone would read as the
   * game having lost it.
   */
  private drawEmptySlot(slot: string, defect: SaveLoadDefect | null, x: number, y: number, live: boolean): void {
    const cx = x + SLOT_W / 2;
    const cy = y + SLOT_H / 2;
    const hatch = this.add.tileSprite(cx, cy, SLOT_W, SLOT_H, "saveload-hatch");
    const border = this.add
      .rectangle(cx, cy, SLOT_W, SLOT_H, COLOR.night, 0.0001)
      .setStrokeStyle(2, COLOR.leatherLightNum, 0.9);
    this.layer.add([hatch, border]);

    this.text(cx, y + SLOT_PAD + 8, "EMPTY", COLOR.mutedOnLeather, 11, FONT.mono).setOrigin(0.5, 0);
    const label = this.text(cx, cy - 10, "Begin a new life here", live ? COLOR.gold : COLOR.mutedOnLeather, 20, FONT.display)
      .setOrigin(0.5);
    label.setFontStyle("italic");

    if (defect && defect.reason !== "missing") {
      this.text(cx, cy + 26, "An older save is here that this version cannot read.", COLOR.mutedOnLeather, 12, FONT.mono)
        .setOrigin(0.5, 0)
        .setWordWrapWidth(SLOT_W - 2 * SLOT_PAD, true)
        .setAlign("center");
    }

    if (!live) return;
    border.setInteractive({ useHandCursor: true });
    border.on("pointerover", () => {
      border.setStrokeStyle(2, COLOR.emberNum, 1);
      label.setColor(COLOR.ember);
    });
    border.on("pointerout", () => {
      border.setStrokeStyle(2, COLOR.leatherLightNum, 0.9);
      label.setColor(COLOR.gold);
    });
    border.on("pointerdown", () => this.beginNaming(slot));
  }

  /**
   * The picked column, mid-name-entry: an eyebrow, a field with a caret, a
   * hint, and Begin / Cancel. The typed string is passed in rather than read off
   * `this.naming` so this stays a pure draw of one state.
   */
  private drawNamingSlot(typed: string, x: number, y: number): void {
    this.drawCard(x, y);
    this.drawCrest(x + SLOT_W / 2, y + SLOT_PAD + 26, 26);

    const cx = x + SLOT_W / 2;
    this.text(cx, y + SLOT_PAD + 64, "NAME THIS LIFE", COLOR.gold, 11, FONT.mono).setOrigin(0.5, 0);

    // The field: an inset panel on the parchment, then the text, then the
    // caret — back to front, as everything in this scene is.
    const fieldW = SLOT_W - 2 * SLOT_PAD;
    const fieldH = 52;
    const fieldY = y + SLOT_PAD + 92;
    const field = this.add
      .rectangle(cx, fieldY + fieldH / 2, fieldW, fieldH, COLOR.canvas2Num, 1)
      .setStrokeStyle(2, COLOR.emberNum, 1);
    this.layer.add(field);

    const value = this.text(x + SLOT_PAD + 14, fieldY + fieldH / 2, typed, COLOR.inkOnCanvas, 24, FONT.display)
      .setOrigin(0, 0.5);
    const caret = this.add.rectangle(x + SLOT_PAD + 16 + value.width, fieldY + fieldH / 2, 2, 28, INK_ON_CANVAS_NUM, 1);
    this.layer.add(caret);
    // A blinking caret is the only thing that says "this field is listening".
    // Held so the next redraw can drop it — see `redraw()`.
    if (!REDUCED_MOTION) {
      this.caretTween = this.tweens.add({
        targets: caret,
        alpha: { from: 1, to: 0 },
        duration: 480,
        yoyo: true,
        repeat: -1,
        ease: "Steps.Out",
      });
    }

    const hint = typed.trim()
      ? `Enter to begin · Esc to cancel · ${NAME_MAX - typed.length} left`
      : "Type a name — or begin unnamed. Esc to cancel.";
    this.text(cx, fieldY + fieldH + 16, hint, COLOR.inkSoftOnCanvas, 12, FONT.mono)
      .setOrigin(0.5, 0)
      .setWordWrapWidth(fieldW, true)
      .setAlign("center");

    const btnW = (SLOT_W - 2 * SLOT_PAD - 10) / 2;
    const btnY = y + SLOT_H - SLOT_PAD - 40;
    this.canvasButton(x + SLOT_PAD, btnY, btnW, 40, "Begin", "primary", true, () => this.commitNaming());
    this.canvasButton(x + SLOT_PAD + btnW + 10, btnY, btnW, 40, "Cancel", "quiet", true, () => this.cancelNaming());
  }

  /** The mockup's crest — a decorative circular sigil. Drawn with Graphics
   * (it carries no data), on §14 tokens: leatherDark disc, ember flame, gold
   * bead. */
  private drawCrest(cx: number, cy: number, r: number): void {
    const g = this.add.graphics();
    g.fillStyle(COLOR.leatherDarkNum, 1);
    g.fillCircle(cx, cy, r);
    g.lineStyle(2, COLOR.emberNum, 1);
    g.strokeCircle(cx, cy, r);
    // A small leaf/flame — a filled ellipse tapering upward.
    g.fillStyle(COLOR.emberNum, 1);
    g.fillEllipse(cx, cy - r * 0.2, r * 0.5, r * 0.8);
    g.fillStyle(COLOR.goldNum, 1);
    g.fillCircle(cx, cy + r * 0.4, r * 0.22);
    this.layer.add(g);
  }

  /**
   * An on-canvas button — §4.3. `primary` (Resume, Begin) is a gold-wash fill
   * with dark-ink text; `warn` (Start over) is transparent with rust (`danger`)
   * text and a rust-tinted hover; `quiet` (Cancel) is transparent with soft ink
   * — a way out, not a warning, and rust would read as one.
   *
   * A plain rectangle for a reliable rectangular hit area (square corners, as
   * SatchelScene's buttons do — the mockup's 8px radius is a minor loss).
   * `live: false` draws the same button with no input at all, which is how the
   * other two columns freeze while one of them is naming.
   */
  private canvasButton(
    x: number,
    y: number,
    w: number,
    h: number,
    label: string,
    kind: "primary" | "warn" | "quiet",
    live: boolean,
    onClick: () => void,
  ): void {
    const cx = x + w / 2;
    const cy = y + h / 2;
    const fill = kind === "primary" ? COLOR.goldNum : COLOR.canvas;
    const fillAlpha = kind === "primary" ? 0.18 : 0.0001;
    const edge = kind === "primary" ? COLOR.goldNum : COLOR.canvasEdgeNum;
    const textColor = kind === "primary" ? COLOR.inkOnCanvas : kind === "warn" ? COLOR.danger : COLOR.inkSoftOnCanvas;
    const hoverFill = kind === "primary" ? COLOR.goldNum : kind === "warn" ? DANGER_NUM : COLOR.canvasEdgeNum;
    const hoverAlpha = kind === "primary" ? 0.34 : kind === "warn" ? 0.14 : 0.3;
    const hoverEdge = kind === "primary" ? COLOR.emberNum : kind === "warn" ? DANGER_NUM : COLOR.emberNum;

    const bg = this.add.rectangle(cx, cy, w, h, fill, fillAlpha).setStrokeStyle(1, edge, 0.9);
    this.layer.add(bg);
    // §14 §4.3: on-canvas button text is mono (SatchelScene's `canvasButton`
    // is the same control and already reads that way).
    const t = this.text(cx, cy, label, textColor, 15, FONT.mono).setOrigin(0.5);
    if (!live) {
      bg.setAlpha(0.45);
      t.setAlpha(0.45);
      return;
    }

    bg.setInteractive({ useHandCursor: true });
    bg.on("pointerover", () => {
      bg.setFillStyle(hoverFill, hoverAlpha);
      bg.setStrokeStyle(1, hoverEdge, 1);
    });
    bg.on("pointerout", () => {
      bg.setFillStyle(fill, fillAlpha);
      bg.setStrokeStyle(1, edge, 0.9);
    });
    bg.on("pointerdown", onClick);
    t.setInteractive({ useHandCursor: true }).on("pointerdown", onClick);
  }

  /** Autosave explainer — the mockup's `.board-foot` row. */
  private drawFooter(): void {
    const y = BOARD_TOP + BOARD_H - 44;
    // Divider line above the footer.
    const rule = this.add.graphics();
    rule.lineStyle(1, COLOR.goldNum, 0.18);
    rule.lineBetween(BOARD_X + BOARD_PAD, y - 14, BOARD_X + BOARD_W - BOARD_PAD, y - 14);
    this.layer.add(rule);

    // "Progress saves on its own each time the [day or place] changes." — the
    // emphasised phrase in ember, composed as three laid-out segments.
    let fx = BOARD_X + BOARD_PAD;
    const a = this.text(fx, y, "Progress saves on its own each time the ", COLOR.muted, 15, FONT.display);
    fx += a.width;
    const b = this.text(fx, y, "day or place", COLOR.ember, 15, FONT.display);
    b.setFontStyle("bold");
    fx += b.width;
    this.text(fx, y, " changes.", COLOR.muted, 15, FONT.display);
  }

  private text(x: number, y: number, value: string, color: string, size: number, font: string = FONT.display): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, value, { fontFamily: font, fontSize: `${size}px`, color });
    this.layer.add(t);
    return t;
  }
}
