/**
 * Casting UI — option A of the three the plan proposes: tray, slots, phrase,
 * receiver.
 *
 * THE RULE THIS FILE EXISTS TO HOLD: a cast's outcome drives bookkeeping only.
 * It must never change how the result looks. Every landed cast — one that
 * catches fire and one that does nothing at all — gets the same panel, the same
 * colour, the same timing. The moment "no effect" gets a red flash or a shake,
 * the design reads as a bug, and the GDD is explicit that "no effect is an
 * honest result".
 *
 * The only states that DO look different are the ones where the cast never
 * happened: an unknown phrase, or components that don't match. Those are input
 * errors, not outcomes.
 *
 * Phrase entry is hand-rolled keyboard capture rather than a DOM input. Phaser
 * has no built-in text field, and a DOM overlay would drag in scale-manager
 * coordinate conversion, focus stealing and z-order fights — for a field that
 * only ever holds one lowercase word.
 */

import Phaser from "phaser";
import { MagicDB, type CastResult, type ManaBand } from "../magic/CastResolver";
import type { Inventory } from "../world/Inventory";
import type { Gates } from "../world/Gates";
import type { Knowledge } from "../world/Knowledge";
import { PROPOSED_SPELL_GATES } from "../world/spellGates";
import { CastPipeline, type CastPolicy } from "../world/CastPipeline";
import { TEACHING_CAST } from "../mode/castPolicy";
import { GameEventBus } from "../world/events/GameEvents";
import { loadAuthoredCues } from "../render/vfx/CueTable";
import { PhaserVfxBackend } from "../render/vfx/PhaserVfxBackend";
import { VfxSystem } from "../render/vfx/VfxSystem";
import type { VfxAnchor } from "../render/vfx/VfxBackend";
import { COLOR, sceneFadeIn } from "../ui/theme";

const W = 1920;
const H = 1080;

const INK = "#f4ead6";
const GOLD = COLOR.gold;
const DIM = "#8d8371";

/** Left edge of the receiver column. The component tray wraps before it. */
const RECEIVER_X = W - 700;

/**
 * The three ways of naming a spell, built side by side so they can be judged
 * against each other rather than in the abstract. This IS the probe's
 * deliverable — the resolver is identical under all three, so what differs is
 * only how it feels to reach for a spell.
 *
 *  typed      — type the phrase. Recall, not recognition. You can try a phrase
 *               you overheard before you have ever cast it.
 *  known      — pick from the spells you have learned. No keyboard, works on a
 *               projector, makes the notebook mechanically load-bearing — but
 *               removes the act of remembering, and you can never try a phrase
 *               you have not already confirmed.
 *  components — choose components first; the phrase disambiguates what they
 *               could be. Turns the river-stone collision (glimmer / portion /
 *               weigh all take one river stone) from an obstacle into the
 *               designed moment where the phrase earns its place.
 */
export type CastMode = "typed" | "known" | "components";
const MODES: CastMode[] = ["typed", "known", "components"];
const MODE_BLURB: Record<CastMode, string> = {
  typed: "type the phrase from memory",
  known: "pick a spell you have learned",
  components: "choose components, then name what they make",
};

export interface CastSceneData {
  magic: MagicDB;
  inventory: Inventory;
  gates: Gates;
  knowledge: Knowledge;
  screen: string | null;
  /**
   * What a landed cast is allowed to write. Supplied by the mode descriptor;
   * defaults to the teaching policy, which is what this scene has always done.
   */
  castPolicy?: CastPolicy;
  onClose: () => void;
}

export class CastScene extends Phaser.Scene {
  private magic!: MagicDB;
  private inventory!: Inventory;
  private knowledge!: Knowledge;
  private screen!: string | null;
  private onClose!: () => void;
  /**
   * The one cast path (`world/CastPipeline.ts`). This scene no longer owns any
   * bookkeeping — it owns the phrase, the slots and the panel.
   */
  private pipeline!: CastPipeline;
  /** Pure, and deliberately not `InkBridge`, which is render-coupled. */
  private readonly bus = new GameEventBus();
  /**
   * Spell VFX. Reads the bus and nothing else — it never sees the pipeline, the
   * inventory or the result panel, which is why a cue can never disagree with
   * the outcome: both read the same event.
   *
   * Rebuilt in `create()` every time the scene starts, because `detach()` is
   * permanent by design.
   */
  private vfx: VfxSystem | null = null;
  /** receiver id -> where its label is drawn, so a cue plays ON its target. */
  private readonly receiverAnchors = new Map<string, VfxAnchor>();

  private phrase = "";
  private slots: string[] = [];
  private mana: ManaBand = "baseline";
  private mode: CastMode = "typed";
  private result: CastResult | null = null;

  private layer!: Phaser.GameObjects.Container;

  constructor() {
    super("CastScene");
  }

  init(data: CastSceneData) {
    this.magic = data.magic;
    this.inventory = data.inventory;
    this.knowledge = data.knowledge;
    this.screen = data.screen;
    this.onClose = data.onClose;
    this.pipeline = new CastPipeline({
      magic: data.magic,
      inventory: data.inventory,
      knowledge: data.knowledge,
      gates: data.gates,
      gateTable: PROPOSED_SPELL_GATES,
      policy: data.castPolicy ?? TEACHING_CAST,
      bus: this.bus,
    });
    this.phrase = "";
    this.slots = [];
    this.result = null;
    const requested = new URLSearchParams(location.search).get("cast");
    this.mode = (MODES as string[]).includes(requested ?? "")
      ? (requested as CastMode)
      : "typed";
  }

  create() {
    sceneFadeIn(this);
    this.add.rectangle(W / 2, H / 2, W, H, 0x0b0906, 0.97).setDepth(0);
    this.layer = this.add.container(0, 0).setDepth(1);
    this.startVfx();

    this.input.keyboard?.on("keydown", (e: KeyboardEvent) => {
      if (e.key === "Escape") return this.close();
      if (e.key === "Backspace") {
        this.phrase = this.phrase.slice(0, -1);
        return this.redraw();
      }
      if (e.key === "Enter") return this.cast();
      // Typing only names a spell in `typed` mode. In the others the phrase is
      // chosen, and a stray keystroke silently editing it would be a trap.
      if (this.mode === "typed" && /^[a-zA-Z]$/.test(e.key)) {
        this.phrase += e.key.toLowerCase();
        this.redraw();
      }
    });

    this.expose();
    this.redraw();
  }

  /**
   * Wire the spell VFX to this scene's bus.
   *
   * DETACH IS THE WHOLE REASON THIS IS A METHOD AND NOT THREE LINES INLINE.
   * Phaser 4 filters are opt-in and are NOT auto-released on scene shutdown —
   * nothing reclaims a filter controller when the scene stops, it stays on the
   * camera's list and composites forever. That is the shape of the scrim leak
   * that already shipped once. So the shutdown hook goes in the same place the
   * system is built, where it cannot be forgotten, rather than in `close()`,
   * which is only one of the ways this scene can end.
   *
   * The cue table is loaded against `MagicDB`'s approved spells, so a row here
   * naming a cut spell becomes an `unknown-spell` defect instead of a cue that
   * silently never fires.
   */
  private startVfx() {
    const backend = new PhaserVfxBackend({ scene: this });
    this.vfx = new VfxSystem({
      bus: this.bus,
      backend,
      table: loadAuthoredCues(new Set(this.magic.spells.map((s) => s.spell_id))),
      // Cues play on the receiver the cast named. Only particle cues actually
      // move — the rest are camera filters and screen-wide by contract.
      anchorFor: (event) => {
        const id = (event as { receiverId?: string }).receiverId;
        return (id && this.receiverAnchors.get(id)) || null;
      },
      defaultAnchor: { x: W / 2, y: H / 2 },
      // This scene has no screen of its own, and nothing here should outlive it.
      stopOnScreenChange: true,
    }).attach();

    this.events.once("shutdown", () => {
      this.vfx?.detach();
      this.vfx = null;
    });
  }

  private close() {
    this.input.keyboard?.removeAllListeners();
    (window as unknown as Record<string, unknown>).__cast = undefined;
    this.scene.stop();
    this.onClose();
  }

  private toggleSlot(id: string) {
    const at = this.slots.indexOf(id);
    if (at >= 0) this.slots.splice(at, 1);
    else this.slots.push(id);
    this.result = null;
    this.redraw();
  }

  /**
   * Name a target and run the cast.
   *
   * All of the bookkeeping — inventory, knowledge, gates, the bus — is
   * `CastPipeline`'s, and which of it happens is the policy's. What is left here
   * is the two fields the panel reads.
   */
  private cast(receiverId?: string) {
    const target = receiverId ?? this.pickedReceiver;
    if (!target) return;
    this.pickedReceiver = target;
    const report = this.pipeline.run({
      phrase: this.phrase,
      offered: this.slots,
      receiverId: target,
      screenId: this.screen,
      mana: this.mana,
    });
    this.result = report.result;
    this.clearedNow = report.clearedNow;
    this.redraw();
  }

  private pickedReceiver: string | null = null;
  /** Gates this very cast opened, for the result panel. */
  private clearedNow: string[] = [];

  /**
   * Receivers offered as targets.
   *
   * Both authored and unauthored ones are shown, on purpose. Hiding the
   * unauthored ones would hide the content gaps this probe exists to measure —
   * an `unknown-receiver` result is a finding for the narrative crew, not a
   * failure to design around.
   */
  private receiverOptions(): { id: string; authored: boolean }[] {
    const spell = this.magic.byPhraseText(this.phrase);
    const authored = new Set(spell?.receivers.map((r) => r.receiver_id) ?? []);
    const all = new Set<string>(authored);
    for (const s of this.magic.spells) for (const r of s.receivers) all.add(r.receiver_id);
    return [...all]
      .sort()
      .map((id) => ({ id, authored: authored.has(id) }))
      .sort((a, b) => Number(b.authored) - Number(a.authored) || a.id.localeCompare(b.id));
  }

  /** Switch between the three ways of naming a spell, live. */
  private drawModeSwitch() {
    let x = 48;
    for (const m of MODES) {
      const hot = m === this.mode;
      const t = this.text(x, 118, m[0].toUpperCase() + m.slice(1), hot ? "#1a1208" : GOLD, 19, "monospace");
      t.setPadding(10, 6, 10, 6);
      t.setBackgroundColor(hot ? COLOR.gold : "#241d14");
      t.setInteractive({ useHandCursor: true });
      t.on("pointerdown", () => {
        this.mode = m;
        this.phrase = "";
        this.slots = [];
        this.result = null;
        this.redraw();
      });
      x += t.width + 10;
    }
    this.text(x + 8, 124, MODE_BLURB[this.mode], DIM, 18, "monospace");
  }

  /** A — recall. You may type anything, including a phrase you only overheard. */
  private drawPhraseTyped(spell: ReturnType<MagicDB["byPhraseText"]>) {
    this.text(48, 168, "Phrase", DIM, 20, "monospace");
    this.text(48, 196, this.phrase.length ? this.phrase : "…", spell ? GOLD : INK, 44, "monospace");
    if (this.phrase && !spell) {
      this.text(48, 252, "no spell by that name", DIM, 20, "monospace");
    } else if (spell) {
      this.text(
        48,
        252,
        `takes ${spell.components.map((c) => this.label(c)).join(" + ")}`,
        DIM,
        20,
        "monospace",
      );
    }
  }

  /**
   * B — recognition. Only spells already confirmed by casting are offered, so
   * the spellbook becomes the interface. The cost is visible here: with an
   * empty spellbook there is nothing to click, and no way in.
   */
  private drawPhraseKnown() {
    const book = this.knowledge.spellbook();
    this.text(48, 168, `spellbook — ${book.length} learned`, DIM, 20, "monospace");
    if (!book.length) {
      this.text(
        48,
        200,
        "Nothing learned yet. In this mode there is no way to try an unknown\nphrase — a spell must be confirmed some other way first.",
        DIM,
        22,
      );
      return;
    }
    let x = 48;
    let y = 200;
    for (const id of book) {
      const sp = this.magic.spell(id)!;
      const hot = sp.phrase === this.phrase;
      const t = this.text(x, y, sp.phrase, hot ? "#1a1208" : INK, 24, "monospace");
      t.setPadding(12, 8, 12, 8);
      t.setBackgroundColor(hot ? COLOR.gold : "#241d14");
      t.setInteractive({ useHandCursor: true });
      t.on("pointerdown", () => {
        this.phrase = sp.phrase;
        // Naming the spell fills its own components — there is no reason to
        // make the player restate what the record already says.
        this.slots = [...sp.components];
        this.result = null;
        this.redraw();
      });
      x += t.width + 10;
      if (x > RECEIVER_X - 120) {
        x = 48;
        y += 46;
      }
    }
  }

  /**
   * C — component-first. Pick what you are holding, and the phrase names which
   * of the possible spells you mean. When more than one matches, the collision
   * is shown as the point of the mechanic rather than hidden.
   */
  private drawPhraseFromComponents() {
    const matches = this.magic.spells.filter(
      (sp) =>
        sp.components.length === this.slots.length &&
        sp.components.every((c) => this.slots.includes(c)),
    );

    this.text(48, 168, "what these components could make", DIM, 20, "monospace");
    if (!this.slots.length) {
      this.text(48, 200, "Choose components below.", DIM, 22);
      return;
    }
    if (!matches.length) {
      this.text(48, 200, "Nothing is made from exactly these.", DIM, 22);
      return;
    }

    let x = 48;
    for (const sp of matches) {
      const hot = sp.phrase === this.phrase;
      const t = this.text(x, 200, sp.phrase, hot ? "#1a1208" : INK, 24, "monospace");
      t.setPadding(12, 8, 12, 8);
      t.setBackgroundColor(hot ? COLOR.gold : "#241d14");
      t.setInteractive({ useHandCursor: true });
      t.on("pointerdown", () => {
        this.phrase = sp.phrase;
        this.result = null;
        this.redraw();
      });
      x += t.width + 10;
    }
    if (matches.length > 1) {
      this.text(
        48,
        250,
        `${matches.length} spells take exactly these components — the phrase is what tells them apart.`,
        GOLD,
        19,
        "monospace",
      );
    }
  }

  private redraw() {
    this.layer.removeAll(true);
    const spell = this.magic.byPhraseText(this.phrase);

    this.text(48, 40, "CASTING", GOLD, 34, "monospace");
    const how: Record<CastMode, string> = {
      typed: "type the phrase · click components · click a receiver",
      known: "pick a spell · click a receiver",
      components: "click components · name the spell · click a receiver",
    };
    this.text(48, 86, how[this.mode] + " · Esc to leave", DIM, 20, "monospace");

    this.drawModeSwitch();
    if (this.mode === "typed") this.drawPhraseTyped(spell);
    if (this.mode === "known") this.drawPhraseKnown();
    if (this.mode === "components") this.drawPhraseFromComponents();

    // Components. The tray is casting reach, not the satchel — world items on
    // this screen appear here and are marked, because a flame can be cast from
    // but never pocketed.
    let y = 320;
    this.text(48, y, "Components", DIM, 20, "monospace");
    y += 34;
    const available = this.inventory.availableOn(this.screen);
    let x = 48;
    for (const id of available) {
      const picked = this.slots.includes(id);
      const world = this.inventory.isWorldItem(id);
      const t = this.text(
        x,
        y,
        `${picked ? "◆" : "◇"} ${this.label(id)}${world ? " (world)" : ""}`,
        picked ? GOLD : INK,
        22,
        "monospace",
      );
      // Wrap on measured width, before committing the position. Checking after
      // placing lets a long label that STARTED inside the limit overrun past
      // it — which is how "an existing flame (world)" collided with the
      // receiver column.
      if (x > 48 && x + t.width > RECEIVER_X - 40) {
        x = 48;
        y += 36;
        t.setPosition(x, y);
      }
      t.setInteractive({ useHandCursor: true });
      t.on("pointerdown", () => this.toggleSlot(id));
      x += t.width + 28;
    }

    // Mana — quality only. Never gates a cast; the test suite sweeps all 89
    // authored pairs at both bands to keep it that way.
    y += 60;
    const manaT = this.text(
      48,
      y,
      `Mana: ${this.mana}  (click to toggle — changes quality, never possibility)`,
      DIM,
      20,
      "monospace",
    );
    manaT.setInteractive({ useHandCursor: true });
    manaT.on("pointerdown", () => {
      this.mana = this.mana === "baseline" ? "high" : "baseline";
      if (this.result) this.cast(this.pickedReceiver ?? undefined);
      else this.redraw();
    });

    // Receivers, in two columns so the list fits above the result panel.
    // Authored ones first and brighter; unauthored ones are still offered,
    // because casting at one is how a content gap gets found.
    this.text(RECEIVER_X, 140, "Receiver", DIM, 20, "monospace");
    const options = this.receiverOptions();
    const perColumn = 15;
    options.slice(0, perColumn * 2).forEach(({ id, authored }, i) => {
      const col = Math.floor(i / perColumn);
      const x = RECEIVER_X + col * 330;
      const y = 174 + (i % perColumn) * 30;
      // Where a spell cue plays. The render layer owns geometry; the VFX system
      // is handed the position and never reads the scene.
      this.receiverAnchors.set(id, { x: x + 90, y: y + 12, radius: 40 });
      const t = this.text(
        x,
        y,
        `${authored ? "•" : "◦"} ${id}`,
        authored ? INK : DIM,
        21,
        "monospace",
      );
      t.setInteractive({ useHandCursor: true });
      t.on("pointerover", () => t.setColor(GOLD));
      t.on("pointerout", () => t.setColor(authored ? INK : DIM));
      t.on("pointerdown", () => this.cast(id));
    });
    if (options.length > perColumn * 2) {
      this.text(
        RECEIVER_X,
        174 + perColumn * 30 + 8,
        `+${options.length - perColumn * 2} more receivers not shown`,
        DIM,
        18,
        "monospace",
      );
    }

    if (this.result) this.drawResult();
  }

  /**
   * The result panel.
   *
   * `effect` and `no-effect` are rendered IDENTICALLY — same colour, same
   * layout, no icon, no flash. That is the whole point. Only the two
   * never-happened states are styled apart, and even those are stated plainly.
   */
  private drawResult() {
    const r = this.result!;
    const panelY = 720;
    this.layer.add(
      this.add.rectangle(W / 2, panelY + 130, W - 96, 300, 0x1a1610, 0.96).setStrokeStyle(2, 0x4a4034),
    );

    if (r.outcome === "unknown-spell") {
      this.text(72, panelY + 40, "Nothing answers to that phrase.", DIM, 26);
      return;
    }
    if (r.outcome === "wrong-components") {
      const missing = r.missing.map((c) => this.label(c)).join(", ");
      const extra = r.extra.map((c) => this.label(c)).join(", ");
      this.text(72, panelY + 40, "The phrase does not take.", DIM, 26);
      if (missing) this.text(72, panelY + 78, `missing: ${missing}`, DIM, 22, "monospace");
      if (extra) this.text(72, panelY + 108, `not part of it: ${extra}`, DIM, 22, "monospace");
      return;
    }
    if (r.outcome === "unknown-receiver") {
      // A content gap, named as one. No invented prose stands in for it.
      this.text(72, panelY + 40, "— no authored outcome —", DIM, 26, "monospace");
      this.text(
        72,
        panelY + 80,
        `${r.spellId} x ${r.receiverId} is not in the content. This is a gap to author,\nnot a result to design around.`,
        DIM,
        20,
        "monospace",
      );
      return;
    }

    // Landed. Authored prose, verbatim, identically for effect and no-effect.
    this.text(72, panelY + 34, r.narration, INK, 28, "Georgia, serif", W - 200);
    let y = panelY + 34 + this.lastHeight + 18;
    if (r.reaction) {
      // `reaction_kind: null` renders nothing at all — silence is the content.
      this.text(72, y, r.reaction, "#cdbfa6", 24, "Georgia, serif", W - 200);
      y += this.lastHeight + 14;
    }
    if (r.manaNote) {
      this.text(72, y, r.manaNote, DIM, 20, "Georgia, serif", W - 200);
      y += this.lastHeight + 14;
    }
    const notes: string[] = [];
    if (r.consumed.length) notes.push(`spent ${r.consumed.map((c) => this.label(c)).join(", ")}`);
    if (r.produced.length) notes.push(`made ${r.produced.map((c) => this.label(c)).join(", ")}`);
    if (r.unlockedScreen) notes.push(`opens ${r.unlockedScreen}`);
    if (notes.length) {
      this.text(72, y, notes.join("  ·  "), DIM, 20, "monospace");
      y += this.lastHeight + 10;
    }
    if (this.clearedNow.length) {
      this.text(72, y, `gate cleared: ${this.clearedNow.join(", ")}`, GOLD, 20, "monospace");
    }
  }

  private lastHeight = 0;

  private label(itemId: string): string {
    return this.inventory.record(itemId)?.description ?? itemId;
  }

  private text(
    x: number,
    y: number,
    value: string,
    color: string,
    size: number,
    font = "Georgia, serif",
    wrap?: number,
  ): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, value, {
      fontFamily: font,
      fontSize: `${size}px`,
      color,
      ...(wrap ? { wordWrap: { width: wrap } } : {}),
      lineSpacing: 6,
    });
    this.layer.add(t);
    this.lastHeight = t.height;
    return t;
  }

  /** Handle for tools/walk.mjs so casts can be exercised headlessly. */
  private expose() {
    (window as unknown as Record<string, unknown>).__cast = {
      run: (phrase: string, components: string[], receiver: string, mana: ManaBand = "baseline") => {
        this.phrase = phrase;
        this.slots = [...components];
        this.mana = mana;
        this.cast(receiver);
        const r = this.result!;
        return {
          outcome: r.outcome,
          narration: r.narration,
          reaction: r.reaction,
          consumed: r.consumed,
          produced: r.produced,
          unlockedScreen: r.unlockedScreen,
        };
      },
      available: () => this.inventory.availableOn(this.screen),
      setSlots: (ids: string[]) => {
        this.slots = [...ids];
        this.result = null;
        this.redraw();
      },
      setMode: (m: CastMode) => {
        this.mode = m;
        this.phrase = "";
        this.slots = [];
        this.result = null;
        this.redraw();
      },
      snapshot: () => ({
        mode: this.mode,
        phrase: this.phrase,
        slots: [...this.slots],
        spellbook: this.knowledge.spellbook(),
      }),
      close: () => this.close(),
    };
  }
}
