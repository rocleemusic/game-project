/**
 * Responsibility 6 out of `CollectScene`, extracted verbatim
 * (`plans/2026-08-17-mode5-srp-merge-plan.md`, step 7): `hedgePrompt`,
 * `gatedCastPrompt`, `hedgeSpellPicker`.
 *
 * `gatedCastPrompt` (renamed `open` here) is the mode5-step-3 generalisation
 * of the original F7-only hedge prompt: `open()` defaults to
 * `HEDGE_RECEIVER_ID` — the one receiver content authors as "clearing the
 * path it had blocked" — but takes any receiver id, worded via
 * `obstacleNoun` rather than always naming a hedge. `openHedgePrompt()` is
 * legacy-hedge's own fixed wording, kept as the one-argument entry point
 * modes 2-3 and the walker probe still call. `openCastOn()` (mode5 Track 1,
 * "cast-on-a-thing") is the other caller — a `ReceiverHotspots` marker click,
 * threading a real receiver id through instead of the hedge's default.
 *
 * `GateEngine` hears the resulting `cast:resolved` off the shared bus and
 * updates its own cleared set; nothing here tracks that state directly —
 * this class only sets the LOCAL legacy-hedge flag via `setHedgeCleared`.
 *
 * --------------------------------------------------------------------------
 * REVISION 4 — the picker is one parchment book page, not a two-step modal.
 * --------------------------------------------------------------------------
 * Wireframe §2 (`mode5-ux-flow-wireframe.html#cast`), decided: no "Use" pill
 * (it was a dead stub, cut not hidden — every click answered the same canned
 * line regardless of what was held); no separate "Cast" step (`open()` opens
 * straight onto the spell list); no 4-column grid (a single flowing column of
 * §14 chips instead, wrapped, unranked — guessing which known spell might
 * work is the point). It reads as the real spellbook's own page
 * (`NotebookScene.drawPage()`'s canvas/canvas2 gradient + canvas-edge border,
 * copied here rather than reinvented), not the dark leather `ModalFrame`
 * every other prompt uses — a deliberate style break, Roc's call (wireframe
 * §2, "decided — the picker reads as the book").
 *
 * The book page still rides on `ModalFrame`'s shared teardown/pan-freeze
 * lifecycle (`pushModal`/`clearModal`/`closeButton`) via the new
 * `markOpen()` — it just skips `modalFrame()`'s own leather-board drawing,
 * since this page draws its own frame.
 *
 * HINT STRENGTH (`PlayerSettings.hintStrength`, wireframe §3) gates two
 * things, both driven by the SAME data — `components you hold ∩ this
 * receiver's class` (`Receiver.receiver_class`, the one field `CastResolver`
 * itself already keys receiver lookups on):
 *   - Off:      neither.
 *   - Subtle:   only the post-cast "worth trying" pill, and only when the
 *               landed cast actually produced something new
 *               (`nextWorthTrying`, off the receiver's own `produces` chain).
 *   - Generous: the post-cast pill AND a pre-guess split of the picker's own
 *               list into "worth trying" / "everything else"
 *               (`worthTryingSpells`).
 * Neither path invents per-spell copy — the pill just names the plain spell
 * phrase a produced item unlocks, exactly the wireframe's "not invented
 * per-spell copy" note.
 */

import Phaser from "phaser";
import type { MagicDB } from "../magic/CastResolver";
import type { SpellRecord } from "../magic/types";
import type { Knowledge } from "../world/Knowledge";
import type { Inventory } from "../world/Inventory";
import { CastPipeline, componentsFromHeld } from "../world/CastPipeline";
import { HEDGE_RECEIVER_ID } from "../world/collectGates";
import type { ModalFrame } from "./ModalFrame";
import { COLOR, FONT, popIn } from "../ui/theme";
import { PlayerSettings } from "../world/PlayerSettings";

// The book page's own geometry — a parchment card (§14 §5), not a framed
// board, so no `filigreeCorners()` and no `panel`/leather fill. Sized to
// keep `ModalFrame.closeButton()`'s fixed top-right anchor sitting inside
// the page the same way it always has on the 900-wide leather modal.
const PAGE_W = 900;
const PAGE_H = 660;
const PAGE_PAD_X = 44;
const PAGE_PAD_TOP = 44;
// Small radius on the left (spine) edge, larger on the right — a page torn
// from a book, not a symmetric card (wireframe `.bookpage` CSS: `6px 12px
// 12px 6px`).
const PAGE_RADIUS = { tl: 8, bl: 8, tr: 20, br: 20 };
const CHIP_FONT_PX = "16px";
const CHIP_PAD = { x: 14, y: 7 };
const CHIP_GAP = 10;
const CHIP_ROW_H = 40;

/** `0xRRGGBB` -> `rgba(r,g,b,a)` — the only way to get a translucent chip
 * fill out of a `COLOR` token without writing a second hex literal per tint;
 * `Phaser.GameObjects.Text`'s own background only takes a CSS color string,
 * not a `(color, alpha)` pair the way `Graphics.fillStyle` does. */
function rgba(colorNum: number, alpha: number): string {
  const r = (colorNum >> 16) & 0xff;
  const g = (colorNum >> 8) & 0xff;
  const b = colorNum & 0xff;
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** "river stone" -> "River stone" — the book page's title case; spell
 * phrases (the outcome page's own title) stay lowercase, that's how they're
 * authored. */
function titleCase(label: string): string {
  return label.length ? label[0].toUpperCase() + label.slice(1) : label;
}

/** An `ItemRecord.description` that says nothing past "a/an <label>" reads
 * as redundant sitting directly under a title that already says the label —
 * fall back to the caller's own contextual `message` instead of repeating
 * it. Never invents replacement prose; only picks which REAL string to show. */
function isTrivialDescription(description: string, label: string): boolean {
  const norm = description.trim().toLowerCase();
  return norm === `a ${label}` || norm === `an ${label}`;
}

export interface HedgeCastPromptDeps {
  readonly scene: Phaser.Scene;
  readonly modal: ModalFrame;
  readonly magic: MagicDB;
  readonly knowledge: Knowledge;
  readonly inventory: Inventory;
  readonly pipeline: CastPipeline;
  readonly viewWidth: number;
  readonly viewHeight: number;
  readonly currentScreenId: () => string | null;
  /** Legacy-hedge's own local flag — set true on any landed cast, never
   * cleared again. Never a real `G-*` id (`world/CastPipeline.ts`'s header). */
  readonly setHedgeCleared: () => void;
  /** Re-render after a landed cast — neither gate mechanism re-triggers one
   * on its own, or the choice list keeps showing "blocked"/"locked" until
   * the player leaves and returns. */
  readonly render: () => void;
}

export class HedgeCastPrompt {
  /** Page content only — title/sub/feedback/chips/outcome, whatever the
   * current state draws. Cleared and rebuilt on every state change. The
   * page's own frame (background + spine + close pill) is drawn once per
   * `open()` and lives only in `modal`'s layer, not here. */
  private pageLayer: Phaser.GameObjects.GameObject[] = [];

  constructor(private readonly deps: HedgeCastPromptDeps) {}

  private get pageX(): number {
    return this.deps.viewWidth / 2 - PAGE_W / 2;
  }
  private get pageY(): number {
    return this.deps.viewHeight / 2 - PAGE_H / 2;
  }

  /** The one gated screen in legacy-hedge mode (2-3). */
  openHedgePrompt(): void {
    this.open("A dry hedge blocks the path.", "a dry hedge");
  }

  /** Mode5 Option B: any screen receiver, not just the hedge —
   * `ReceiverHotspots`' marker click opens here, pre-targeted. `screenId` is
   * the target's OWN screen — "the approach" (that class's header) means
   * this can differ from wherever the player is physically standing, and the
   * cast must book its production against the target, not the approach. */
  openCastOn(receiverId: string, label: string, screenId: string): void {
    this.open(`Cast on ${label}?`, label, receiverId, screenId);
  }

  open(message: string, obstacleNoun: string, receiverId: string = HEDGE_RECEIVER_ID, screenId?: string): void {
    const { modal } = this.deps;
    modal.clearModal();
    modal.markOpen();
    this.drawFrame();
    this.pickSpell(receiverId, obstacleNoun, message, screenId);
  }

  /** The page's persistent chrome — background, spine feather, close pill.
   * Drawn once per `open()`; `pickSpell()`/`renderOutcome()` only ever touch
   * `pageLayer` (the content on top of this), never redraw it. */
  private drawFrame(): void {
    const { scene, modal } = this.deps;
    const x = this.pageX;
    const y = this.pageY;

    // Drop shadow first, same technique as every other framed surface in
    // this build (`NotebookScene.create()`, `SatchelScene.drawPouch()`).
    const shadow = scene.add.graphics().setDepth(199);
    shadow.fillStyle(COLOR.night, 0.5);
    shadow.fillRoundedRect(x - 6, y + 16, PAGE_W + 12, PAGE_H + 12, 20);
    modal.pushModal(shadow);

    // The page itself — the real spellbook's own parchment gradient
    // (`NotebookScene.drawPage()`), not a leather panel.
    const panel = scene.add.graphics().setDepth(200);
    panel.fillGradientStyle(COLOR.canvas, COLOR.canvas, COLOR.canvas2Num, COLOR.canvas2Num, 1);
    panel.fillRoundedRect(x, y, PAGE_W, PAGE_H, PAGE_RADIUS);
    panel.lineStyle(1.5, COLOR.canvasEdgeNum, 1);
    panel.strokeRoundedRect(x, y, PAGE_W, PAGE_H, PAGE_RADIUS);
    modal.pushModal(panel);
    popIn(scene, panel);

    // A soft feathered seam along the left edge — this page reads as torn
    // from a bound book, not a free-floating card. Same two-alpha-strip
    // technique as `NotebookScene.drawSpine()`, one-sided.
    const spine = scene.add.graphics().setDepth(201);
    spine.fillStyle(COLOR.night, 0.16);
    spine.fillRect(x, y + 10, 12, PAGE_H - 20);
    spine.fillStyle(COLOR.night, 0.08);
    spine.fillRect(x + 12, y + 10, 14, PAGE_H - 20);
    modal.pushModal(spine);

    modal.closeButton(() => modal.clearModal());
  }

  private clearContent(): void {
    this.pageLayer.forEach((o) => o.destroy());
    this.pageLayer = [];
  }

  private pushContent(obj: Phaser.GameObjects.GameObject): void {
    this.pageLayer.push(obj);
    this.deps.modal.pushModal(obj);
  }

  /**
   * The single step revision 4 replaces the old two-step flow with: receiver
   * name + flavor, then the flat known-only spell list
   * (`knowledge.spellbook()`), unranked unless hint strength is Generous.
   * `feedback`, when passed, is a REJECTED-outcome line (wrong components /
   * unknown receiver) — the list stays up so the player can try again,
   * exactly as the old inline `result.setText()` behaved.
   */
  private pickSpell(
    receiverId: string,
    obstacleNoun: string,
    message: string,
    screenId: string | undefined,
    feedback?: string,
  ): void {
    const { scene, magic, knowledge, inventory, pipeline } = this.deps;
    this.clearContent();

    const x = this.pageX + PAGE_PAD_X;
    const wrapWidth = PAGE_W - PAGE_PAD_X * 2;
    let y = this.pageY + PAGE_PAD_TOP;

    const title = scene.add
      .text(x, y, titleCase(obstacleNoun), { fontFamily: FONT.display, fontSize: "34px", color: COLOR.inkOnCanvas })
      .setFontStyle("bold")
      .setDepth(201);
    this.pushContent(title);
    y += title.height + 10;

    // Real flavor when it exists and says more than the title already does
    // (`ItemRecord.description`, keyed off the `item_<receiverId>` a
    // collectible receiver mints from) — never invented prose. Falls back to
    // the caller's own contextual `message` for a non-item receiver (the
    // hedge) or a trivial "a/an X" description.
    const item = inventory.record(`item_${receiverId}`);
    const flavor = item && !isTrivialDescription(item.description, obstacleNoun) ? item.description : message;
    const sub = scene.add
      .text(x, y, flavor, {
        fontFamily: FONT.display,
        fontSize: "17px",
        fontStyle: "italic",
        color: COLOR.inkSoftOnCanvas,
        wordWrap: { width: wrapWidth },
      })
      .setDepth(201);
    this.pushContent(sub);
    y += sub.height + 22;

    if (feedback) {
      const fb = scene.add
        .text(x, y, feedback, {
          // A sentence on the parchment page, like the flavour line above it.
          fontFamily: FONT.display,
          fontSize: "15px",
          color: COLOR.inkOnCanvas,
          wordWrap: { width: wrapWidth },
        })
        .setDepth(201);
      this.pushContent(fb);
      y += fb.height + 20;
    }

    const book = knowledge.spellbook();
    if (!book.length) {
      const empty = scene.add
        .text(x, y, "You don't know any spells yet.", {
          fontFamily: FONT.display,
          fontSize: "17px",
          fontStyle: "italic",
          color: COLOR.inkSoftOnCanvas,
        })
        .setDepth(201);
      this.pushContent(empty);
      return;
    }

    const maxX = this.pageX + PAGE_W - PAGE_PAD_X;

    // One cast path for the whole build (`world/CastPipeline.ts`). This mode
    // teaches nothing — that's its `CastPolicy`, not an `if` in here
    // (`mode/castPolicy.ts`). Whether the cast clears a real `G-*` id is
    // `GateEngine`'s call, made off the `cast:resolved` this emits on the
    // shared bus, not this method's.
    const onSpell = (id: string): void => {
      const s = magic.spell(id);
      if (!s) return;
      const report = pipeline.run({
        phrase: s.phrase,
        offered: componentsFromHeld(s, inventory.availableOn(null)),
        receiverId,
        screenId: screenId ?? this.deps.currentScreenId(),
      });
      const res = report.result;
      if (res.outcome === "wrong-components") {
        this.pickSpell(
          receiverId,
          obstacleNoun,
          message,
          screenId,
          `You know ${s.phrase}, but you're not carrying what it needs.`,
        );
        return;
      }
      if (res.outcome === "unknown-receiver") {
        this.pickSpell(receiverId, obstacleNoun, message, screenId, `${s.phrase} does nothing to ${obstacleNoun}.`);
        return;
      }
      // Monotonic, exactly as before: a landed cast opens the path and
      // nothing closes it again.
      if (report.localGateCleared) this.deps.setHedgeCleared();
      this.deps.render();
      const hint = PlayerSettings.hintStrength !== "off" ? this.nextWorthTrying(res.produced, s.spell_id) : null;
      this.renderOutcome(s.phrase, res.narration, hint);
      scene.time.delayedCall(1400, () => this.deps.modal.clearModal());
    };

    if (PlayerSettings.hintStrength === "generous") {
      const worthTrying = this.worthTryingSpells(receiverId, book);
      const rest = book.filter((id) => !worthTrying.has(id));
      if (worthTrying.size) {
        y = this.drawGroupLabel(x, y, "worth trying");
        y = this.drawChipRow(x, y, maxX, [...worthTrying], COLOR.greenNum, 0.22, onSpell) + 14;
      }
      if (rest.length) {
        y = this.drawGroupLabel(x, y, "everything else");
        this.drawChipRow(x, y, maxX, rest, COLOR.goldNum, 0.2, onSpell);
      }
    } else {
      y = this.drawGroupLabel(x, y, "what you know");
      this.drawChipRow(x, y, maxX, book, COLOR.goldNum, 0.2, onSpell);
    }
  }

  private drawGroupLabel(x: number, y: number, label: string): number {
    const lbl = this.deps.scene.add
      .text(x, y, label.toUpperCase(), { fontFamily: FONT.mono, fontSize: "12px", color: COLOR.inkSoftOnCanvas })
      .setDepth(201);
    this.pushContent(lbl);
    return y + lbl.height + 10;
  }

  /**
   * One flowing, wrapped row of §14 chips (`Text` + padding + background,
   * `SatchelScene.drawInspect()`'s own "carried for" technique — not a
   * `Graphics` pill, chips don't need one) — never a fixed-column grid.
   * Returns the y a caller can stack the next block at.
   */
  private drawChipRow(
    x: number,
    y: number,
    maxX: number,
    ids: readonly string[],
    tint: number,
    alpha: number,
    onSpell: (id: string) => void,
  ): number {
    const { scene, magic } = this.deps;
    let cx = x;
    let cy = y;
    for (const id of ids) {
      const spell = magic.spell(id);
      if (!spell) continue;
      const chip = scene.add
        .text(0, 0, spell.phrase, { fontFamily: FONT.mono, fontSize: CHIP_FONT_PX, color: COLOR.inkOnCanvas })
        .setPadding(CHIP_PAD.x, CHIP_PAD.y, CHIP_PAD.x, CHIP_PAD.y)
        .setBackgroundColor(rgba(tint, alpha))
        .setDepth(201);
      if (cx > x && cx + chip.width > maxX) {
        cx = x;
        cy += CHIP_ROW_H;
      }
      chip.setPosition(cx, cy);
      chip.setInteractive({ useHandCursor: true });
      chip.on("pointerover", () => chip.setBackgroundColor(rgba(tint, Math.min(1, alpha + 0.16))));
      chip.on("pointerout", () => chip.setBackgroundColor(rgba(tint, alpha)));
      chip.on("pointerdown", () => onSpell(id));
      this.pushContent(chip);
      cx += chip.width + CHIP_GAP;
    }
    return cy + CHIP_ROW_H;
  }

  /**
   * The outcome page — same book page, its content swapped: the phrase cast,
   * the authored narration verbatim (never rendered as a failure even on
   * "no-effect" — `CastResolver.ts`'s own rule), and, at Subtle/Generous hint
   * strength, one pointer to the next thing worth trying.
   */
  private renderOutcome(spellPhrase: string, narration: string, hint: SpellRecord | null): void {
    const { scene } = this.deps;
    this.clearContent();

    const x = this.pageX + PAGE_PAD_X;
    const wrapWidth = PAGE_W - PAGE_PAD_X * 2;
    let y = this.pageY + PAGE_PAD_TOP;

    const title = scene.add
      .text(x, y, spellPhrase, { fontFamily: FONT.display, fontSize: "34px", color: COLOR.inkOnCanvas })
      .setFontStyle("bold")
      .setDepth(201);
    this.pushContent(title);
    y += title.height + 14;

    const result = scene.add
      .text(x, y, narration, {
        fontFamily: FONT.display,
        fontSize: "18px",
        fontStyle: "italic",
        color: COLOR.inkSoftOnCanvas,
        wordWrap: { width: wrapWidth },
      })
      .setDepth(201);
    this.pushContent(result);
    y += result.height + 22;

    if (hint) {
      const pill = scene.add
        .text(x, y, `worth trying: ${hint.phrase}`, {
          fontFamily: FONT.mono,
          fontSize: "14px",
          color: COLOR.inkOnCanvas,
        })
        .setPadding(12, 7, 12, 7)
        .setBackgroundColor(rgba(COLOR.goldNum, 0.28))
        .setDepth(201);
      this.pushContent(pill);
    }
  }

  /**
   * Subtle/Generous only. What a landed cast's own `produced` items unlock —
   * drawn straight off the receiver's own `produces` chain, never invented
   * per-spell copy. A minted item becomes a NEW RECEIVER in the world, not a
   * new casting component — confirmed against real content: `ignite` on
   * `river_stone` produces `item_heated_stone`, and `temper` authors a
   * receiver entry for `heated_stone` (`content/magic/temper.json`), not a
   * `item_heated_stone` component anywhere. So the match is
   * `producedItemId` (minus its `item_` prefix) against another spell's own
   * `receiver_id`, not against its `components`. Excludes the spell just
   * cast so a self-referential chain can never point back at itself.
   */
  private nextWorthTrying(produced: readonly string[], castSpellId: string): SpellRecord | null {
    if (!produced.length) return null;
    const { magic } = this.deps;
    for (const itemId of produced) {
      const receiverId = itemId.replace(/^item_/, "");
      const match = magic.spells.find(
        (s) => s.spell_id !== castSpellId && s.receivers.some((r) => r.receiver_id === receiverId),
      );
      if (match) return match;
    }
    return null;
  }

  /**
   * Generous only. Which of the player's known spells are plausible against
   * THIS receiver — every component held right now, same intersection
   * `componentsFromHeld` uses for the cast itself, AND the spell has
   * authored content for this receiver's own class (`Receiver.receiver_class`
   * — the field `CastResolver` already keys every receiver lookup on, not a
   * new grouping invented for this picker). No receiver class on file for
   * this id (nothing authors it yet) means no grouping at all, never a
   * fabricated one.
   */
  private worthTryingSpells(receiverId: string, known: readonly string[]): Set<string> {
    const { magic, inventory } = this.deps;
    const held = new Set(inventory.availableOn(null));
    const receiverClass = magic.spells.flatMap((s) => s.receivers).find((r) => r.receiver_id === receiverId)
      ?.receiver_class;
    const out = new Set<string>();
    if (!receiverClass) return out;
    for (const id of known) {
      const spell = magic.spell(id);
      if (!spell) continue;
      const castable = spell.components.every((c) => held.has(c));
      const matchesClass = spell.receivers.some((r) => r.receiver_class === receiverClass);
      if (castable && matchesClass) out.add(id);
    }
    return out;
  }
}
