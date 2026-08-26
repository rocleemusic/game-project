/**
 * Responsibility 4 out of `CollectScene`, extracted verbatim
 * (`plans/2026-08-17-mode5-srp-merge-plan.md`, step 2): `drawCast`,
 * `openNpcSpells`, `pickNpcSpells`, `shareClueOnFirstTalk`, `roleFor`.
 *
 * THE MODAL OFFERS THE CONVERSATION (Roc, 2026-08-17). Clicking an NPC's
 * portrait opens the SPELL-CLUE MODAL (unchanged since Wave 1); if ink is
 * offering a "Talk to X" choice for that soul, the modal gains one more row —
 * "talk with X" — and picking THAT row is what closes the modal and starts
 * the VN conversation. Not automatic: a first pass fired the ink choice the
 * instant the portrait was clicked, alongside the modal, and that reads as
 * two things happening from one click rather than a choice. Originally the
 * conversation choice sat in the flat choices row as a separate pick;
 * `CollectScene` now leaves it out of that row for any soul this system has a
 * portrait wired up for, using `drawCast`'s return value, so the same pick is
 * never offered twice.
 *
 * "Modal UI" (`modalFrame`, `clearModal`, `closeButton`, `componentHint`) is a
 * SEPARATE responsibility (5), extracted in a later step. This system takes
 * those as an injected `ModalHost` rather than duplicating them, so
 * `CollectScene` keeps owning its one `modalLayer` until that step moves it.
 */

import Phaser from "phaser";
import type { PlayView } from "@lantern/lib/play";
import type { InkBridge } from "../ink/InkBridge";
import type { Run } from "../ink/loadRun";
import type { MagicDB } from "../magic/CastResolver";
import type { SpellRecord } from "../magic/types";
import type { Cast } from "../world/Cast";
import type { Knowledge } from "../world/Knowledge";
import type { Inventory } from "../world/Inventory";
import { npcGiftForRole } from "../world/npcItems";
import type { PanModel } from "../world/view/PanModel";
import { rotatingClueIndex } from "../world/hash";
import type { GameEventBus } from "../world/events/GameEvents";
import { COLOR, FONT, imageFadeIn } from "../ui/theme";
import { pillCornerRadius, soulDisplayName } from "../world/view/DialogueLayout";

const W = 1920;
const H = 1080;
const GOLD = COLOR.gold;
const DIM = COLOR.muted;

// Portrait-row geometry (Roc, 2026-08-21, marked up against a live shot: no
// card, no frame — a life-sized cutout standing in the scene). Anchored by
// FEET, not center, so a taller portrait reads as a taller person standing on
// the same floor, not a card that grew in both directions. Roc's second pass
// (same day, same markup session) moved the floor itself much lower — the
// first cut left the cast floating well above the backdrop's own ground line;
// HUD chrome (bottom bar, choices row) draws on top of the portrait's depth,
// so the feet sitting behind it is fine.
const CAST_PORTRAIT_H = 680;
const CAST_FEET_Y = 430;
const CAST_SLOT_W = 460;
// Fallback pill for a present, roled soul with no portrait art (`nell`,
// `linnet`) — the only case that still needs a frame-shaped hit target.
const CAST_FALLBACK_W = 190;
const CAST_FALLBACK_H = 64;
/** Hover-glow feather: [scale multiplier, alpha], tightest/brightest first —
 * see the halo build-out in `drawCast` for why this needs density, not rings. */
const HALO_STEPS: readonly [number, number][] = [
  [1.012, 0.4],
  [1.025, 0.32],
  [1.04, 0.24],
  [1.06, 0.16],
  [1.085, 0.09],
];

// §14 Choice-pill geometry, matched to `TraversalRow`/`DialogueSystem.drawChoices`
// so a modal-body pill reads identically to a traversal/dialogue choice pill.
// Those constants are module-private in DialogueSystem (not exported), so the
// exact values are replicated here rather than invented.
const PILL_FILL_ALPHA = 0.94; // DialogueSystem PILL_FILL_ALPHA
const PILL_BORDER_ALPHA = 0.55; // DialogueSystem BORDER_ALPHA (enabled)
const PILL_CORNER_OF_PILL = 0.18; // VN_METRICS.choiceCornerOfPill — radius / pill height
const PILL_PAD_X = 16;
const PILL_PAD_Y = 9;
const PILL_FONT_PX = "22px";
const PILL_WRAP_WIDTH = 820; // keeps a wrapped pill inside the 900-wide modal panel
const PILL_GAP = 10; // vertical gap the `ry` cursor advances past a pill

/** Anything `reposition()` can move — Rectangle/Image/Text all qualify. */
interface Positioned {
  setPosition(x: number, y: number): unknown;
}

/**
 * Find EVERY ink choice that starts a conversation with `soul`, if ink is
 * offering any right now. Matched the same way `moveTarget` matches display
 * text elsewhere in this build — there is no structured field naming which
 * soul a choice talks to, only the authored `"[Talk to Toby (SC-T2-15)]"`
 * convention. Scoped to non-`move` choices so a screen name that happens to
 * contain a soul id never matches by accident.
 *
 * PLURAL, not `.find()` (Roc, 2026-08-17 — a soul with a multi-scene arc,
 * e.g. Ilsa, offers SEVERAL "[Talk to Ilsa (SC-T4-XX)]" choices at once, one
 * per authored scene). Taking only the first left the rest sitting in the
 * flat choices row the whole time — invisible while the box replaced that
 * row during a conversation, then visibly "reappearing" the moment the
 * player returned to the hub and the row drew again, which is what actually
 * happened, not a regression on returning.
 */
function talkChoicesFor(
  choices: PlayView["choices"],
  soul: string,
): PlayView["choices"][number][] {
  const lowerSoul = soul.toLowerCase();
  return choices.filter(
    (c) =>
      c.kind !== "move" &&
      /^\[Talk to /i.test(c.display) &&
      c.display.toLowerCase().includes(lowerSoul),
  );
}

/**
 * `modalFrame`/`clearModal`/`closeButton`/`componentHint` stay on
 * `CollectScene` until step 5-6 extracts "modal UI" — this is the seam.
 * `CollectScene` already implements all four with matching signatures, so it
 * satisfies this structurally with no adapter.
 */
export interface ModalHost {
  modalFrame(title: string, height: number): { top: number; bottom: number };
  clearModal(): void;
  closeButton(onClose: () => void): void;
  componentHint(spell: SpellRecord): string;
  /** Push one more display object into the shared modal layer. */
  pushModal(obj: Phaser.GameObjects.GameObject): void;
}

export interface NpcTalkDeps {
  readonly scene: Phaser.Scene;
  readonly run: Run;
  readonly ink: InkBridge;
  readonly magic: MagicDB;
  readonly cast: Cast;
  readonly knowledge: Knowledge;
  readonly inventory: Inventory;
  readonly pan: PanModel;
  readonly bus: GameEventBus;
  readonly modal: ModalHost;
  /** The scene's own authoritative drawn screen — see `CollectScene.render()`. */
  readonly currentScreenId: () => string | null;
  /** Where the NPC row sits, screen-space, before pan is applied. */
  readonly rowCenterY: number;
  /**
   * The player just talked to this soul — festival scoring's bond half (T9,
   * Roc's ruling 2026-08-23: bond is "the number of times the player talked to
   * that NPC", capped at one a day).
   *
   * Fired from `openNpcSpells`, which is the moment the panel opens — the same
   * moment `shareClueOnFirstTalk` already treats as this day's greeting, so
   * the two agree on what "talked" means instead of counting two different
   * things. The ONE-A-DAY CAP IS NOT ENFORCED HERE: `FestivalLedger` holds a
   * Set of day numbers, so the cap is structural on its side and this may fire
   * as often as the panel opens. Optional, so every existing construction site
   * (and `NpcTalkSystem`'s own tests) is unaffected.
   */
  readonly onTalk?: (soulId: string) => void;
}

export class NpcTalkSystem {
  private castLayer: Phaser.GameObjects.GameObject[] = [];
  private castPan: { obj: Positioned; baseX: number; baseY: number }[] = [];
  /** role_tags whose one-time NPC gift has already been taken this life. */
  private takenNpcGifts = new Set<string>();
  /** `${soul}:${day}` keys already given their once-per-day shared clue. */
  private greetedToday = new Set<string>();
  /**
   * Souls drawn in the LAST `drawCast()` — every call fully destroys and
   * rebuilds the row (`CollectScene.render()` runs on every ink `view`
   * change, far more often than a screen change), so without this a soul
   * already on screen would fade in fresh on every unrelated action, not
   * just when they actually arrive. Only a soul missing from this set gets
   * `imageFadeIn`; `clear()` empties it, so leaving and returning to a
   * screen counts as arriving again.
   */
  private shownSouls = new Set<string>();

  /**
   * One instance per life — `CollectScene.init()` constructs a fresh one
   * every time, same as it does `Inventory`/`Knowledge`/`Cast`, so there is
   * no separate `reset()`: the empty `Set`s above ARE the reset. Phaser tears
   * down the outgoing scene's whole display list on `scene.start()`, so the
   * previous life's portraits do not need manual destruction here either.
   */
  constructor(private readonly deps: NpcTalkDeps) {}

  /** Called from the scene's `update()` to keep portraits panning in lockstep. */
  reposition(): void {
    for (const c of this.castPan) {
      const p = this.deps.pan.place(c.baseX, c.baseY);
      c.obj.setPosition(p.x, p.y);
    }
  }

  /**
   * Drop the portrait row without redrawing it — the VN layer's own sprite
   * (`DialogueSystem.drawSprite`) already shows who is speaking during a
   * conversation, and leaving the small hub portraits underneath doubled the
   * same soul on screen, one large and one small, overlapping the VN box.
   */
  clear(): void {
    this.castLayer.forEach((o) => o.destroy());
    this.castLayer = [];
    this.castPan = [];
    this.shownSouls.clear();
  }

  /** soul_id -> role_tag, straight off `graph.json`'s souls array. */
  roleFor(soul: string): string | null {
    const rec = (this.deps.run.graph.souls ?? []).find(
      (s) => (typeof s === "string" ? s : (s as { soul_id?: string }).soul_id) === soul,
    ) as { role_tag?: string } | undefined;
    return rec?.role_tag ?? null;
  }

  /**
   * Souls present, clickable to open the spell-clue modal — which, if ink is
   * offering one, gains a "talk with X" row to actually start the
   * conversation. See this file's header.
   *
   * Returns the choice indexes it wired up this way, so `CollectScene` can
   * leave them out of the flat row — that pick would otherwise be offered
   * twice, through two different UIs. A soul with no `role` (no clickable
   * portrait) is deliberately left out of this set: if ink is somehow still
   * offering "Talk to" them, that choice stays in the flat row rather than
   * becoming unreachable.
   *
   * "PRESENT" AND "OFFERING A CONVERSATION" ARE TWO DIFFERENT FACTS THAT CAN
   * DISAGREE (Roc, 2026-08-17; GAPS.md G15 — `present_<soul>` vs. a scene
   * being authored on this screen, "102 of 121 placements" apart). Ilsa
   * reliably reproduced it: ink offered three `[Talk to Ilsa (...)]` choices
   * while `cast.presentOn` did not consider her present, so `here` never
   * included her, no portrait ever drew, and the flat-row exclusion below —
   * nested inside the loop over `here` — never ran for her either. Any soul
   * ink is willing to let the player talk to is added to the draw list
   * regardless of what presence tracking says; the choice list is ground
   * truth for what is actually reachable, presence is not.
   *
   * Pans with the backdrop — an NPC reads as standing somewhere in the
   * scene, not floating HUD, same as a forage hotspot.
   */
  drawCast(v: PlayView): ReadonlySet<number> {
    this.castLayer.forEach((o) => o.destroy());
    this.castLayer = [];
    this.castPan = [];
    const handled = new Set<number>();
    const screen = v.pos.currentScreen;
    if (!screen) return handled;

    const { scene, cast, ink } = this.deps;
    const presence = ink.player.peekVars(cast.souls.map((s) => `present_${s}`));
    const here = cast.presentOn(screen, presence);
    const presentSouls = new Set(here.map((who) => who.soul));
    const talkOnly = cast.souls
      .filter((soul) => !presentSouls.has(soul) && talkChoicesFor(v.choices, soul).length > 0)
      .map((soul) => ({ soul, scened: true, hasPortrait: cast.portraitKey(soul) !== null }));
    const shown = [...here, ...talkOnly];
    if (!shown.length) {
      this.shownSouls.clear();
      return handled;
    }

    const previouslyShown = this.shownSouls;
    this.shownSouls = new Set(shown.map((w) => w.soul));
    const startX = W / 2 - ((shown.length - 1) * CAST_SLOT_W) / 2;

    shown.forEach((who, i) => {
      const isNew = !previouslyShown.has(who.soul);
      const baseX = startX + i * CAST_SLOT_W - W / 2;
      const baseY = this.deps.rowCenterY - H / 2;
      const { x, y } = this.deps.pan.place(baseX, baseY);
      const key = cast.portraitKey(who.soul);
      const role = this.roleFor(who.soul);
      const talks = role ? talkChoicesFor(v.choices, who.soul) : [];
      for (const talk of talks) handled.add(talk.index);

      // role is truthy whenever this handler is even attached — see below.
      const onClick = () => this.openNpcSpells(who.soul, role!, talks);

      // Hover reads as an affordance, not decoration: an ember glow says
      // "there's a conversation here," a gold glow says "this soul has
      // something to say" (spell/gift only). Both open the same modal —
      // the glow is the only thing telling the player which they'll get.
      const hoverColor = talks.length ? COLOR.emberNum : COLOR.goldNum;
      const feetY = y + CAST_FEET_Y;
      const name = soulDisplayName(who.soul);

      if (key && scene.textures.exists(key)) {
        // A life-sized cutout standing in the scene — no card, no scrim.
        // Bottom-anchored so it grows UPWARD from a fixed floor as it scales.
        const portrait = scene.add.image(x, feetY, key).setOrigin(0.5, 1).setDepth(15);
        portrait.setScale(CAST_PORTRAIT_H / portrait.height);
        // Only a soul genuinely arriving fades in — `drawCast` reruns (and
        // fully rebuilds) on every ink `view` change, not just a screen
        // change, so an unconditional fade would replay every action.
        if (isNew) imageFadeIn(scene, portrait);

        // The glow is a FEATHER, not a rim: several tinted, additive copies
        // of the SAME cutout, packed tight (small scale steps) with alpha
        // fading out toward the edge — reads as a soft gradient hugging the
        // silhouette, not a second outline. (Roc, 2026-08-21: a single
        // oversized copy read as a hard-edged silhouette glow, not
        // feathered; a two-ring version before that ghosted — visibly two
        // distinct outlines. Density is what a feather needs that a ring
        // count of one or two can't give it.)
        const halo = HALO_STEPS.map(([scaleStep, alpha]) =>
          scene.add
            .image(x, feetY, key)
            .setOrigin(0.5, 1)
            .setScale(portrait.scaleX * scaleStep)
            .setTint(hoverColor)
            .setAlpha(alpha)
            .setBlendMode(Phaser.BlendModes.ADD)
            .setDepth(14.5)
            .setVisible(false),
        );
        this.castLayer.push(...halo);
        for (const layer of halo) this.castPan.push({ obj: layer, baseX, baseY: baseY + CAST_FEET_Y });

        // A cursor-following tooltip, not a nameplate glued to the
        // character — same shape this'll take for regions/items later, so
        // it doesn't sit on top of whatever it's naming.
        const tooltip = scene.add
          .text(x, feetY, name, {
            // A soul's name — display, like every other name plate (§14 §2).
            fontFamily: FONT.display,
            fontSize: "20px",
            color: COLOR.onAccent,
            backgroundColor: GOLD,
            padding: { x: 10, y: 5 },
          })
          .setOrigin(0, 1)
          .setDepth(200)
          .setVisible(false);
        this.castLayer.push(tooltip);
        const moveTooltip = (pointer: Phaser.Input.Pointer): void => {
          tooltip.setPosition(pointer.x + 18, pointer.y - 12);
        };

        // `pixelPerfect` so hover/click honor the cutout's actual silhouette,
        // not the transparent PNG's full rectangular canvas — there is no
        // frame anymore to mark the honest hit area for the player.
        portrait.setInteractive({ pixelPerfect: true, alphaTolerance: 1, useHandCursor: Boolean(role) });
        if (role) {
          portrait.on("pointerdown", onClick);
          portrait.on("pointerover", (pointer: Phaser.Input.Pointer) => {
            for (const layer of halo) layer.setVisible(true);
            tooltip.setVisible(true);
            moveTooltip(pointer);
          });
          portrait.on("pointermove", moveTooltip);
          portrait.on("pointerout", () => {
            for (const layer of halo) layer.setVisible(false);
            tooltip.setVisible(false);
          });
        }
        this.castLayer.push(portrait);
        this.castPan.push({ obj: portrait, baseX, baseY: baseY + CAST_FEET_Y });
      } else {
        // No portrait art (`nell`, `linnet`) — fall back to a plain name pill,
        // the only case that still needs a frame-shaped hit target.
        const pill = scene.add
          .rectangle(x, feetY - CAST_FALLBACK_H / 2, CAST_FALLBACK_W, CAST_FALLBACK_H, COLOR.night, 0.85)
          .setStrokeStyle(3, role ? COLOR.goldNum : COLOR.leatherLightNum)
          .setDepth(14)
          .setInteractive({ useHandCursor: Boolean(role) });
        if (isNew) imageFadeIn(scene, pill);
        this.castLayer.push(pill);
        this.castPan.push({ obj: pill, baseX, baseY: baseY + CAST_FEET_Y - CAST_FALLBACK_H / 2 });
        if (role) {
          pill.on("pointerdown", onClick);
          pill.on("pointerover", () => pill.setStrokeStyle(4, hoverColor));
          pill.on("pointerout", () => pill.setStrokeStyle(3, role ? COLOR.goldNum : COLOR.leatherLightNum));
        }
        const pillLabel = scene.add
          .text(x, feetY - CAST_FALLBACK_H / 2, role ? `${name} (${role})` : name, {
            fontFamily: FONT.display,
            fontSize: "18px",
            color: COLOR.onAccent,
          })
          .setOrigin(0.5)
          .setDepth(16);
        if (isNew) imageFadeIn(scene, pillLabel);
        this.castLayer.push(pillLabel);
        this.castPan.push({ obj: pillLabel, baseX, baseY: baseY + CAST_FEET_Y - CAST_FALLBACK_H / 2 });
      }
    });
    return handled;
  }

  /**
   * A role usually knows several spells. Showing all of them from every
   * same-role soul made every soul an identical clue vendor, so we still show
   * ONE spell at a time. But which one ROTATES BY DAY (Roc, 2026-08-18): the
   * offset cycles the role's set across the week, so a role held by a single
   * soul still teaches all its spells rather than fixing on one forever. The
   * `fnv1a(soul)` base keeps two same-role souls out of lockstep and keeps a
   * headless walker reproducible; adding `day` advances the pick each morning.
   */
  private pickNpcSpells(soul: string, roleSpells: SpellRecord[]): SpellRecord[] {
    if (roleSpells.length <= 1) return roleSpells;
    const day = this.deps.ink.view().day;
    return [roleSpells[rotatingClueIndex(soul, day, roleSpells.length)]];
  }

  /**
   * The first time you talk to a soul on a given day, they offer up a clue
   * unprompted. Only ever gives ONE clue, once per soul per day, and only
   * when there's an unseen spell left to give.
   */
  private shareClueOnFirstTalk(soul: string, roleSpells: SpellRecord[]): SpellRecord | null {
    const day = this.deps.ink.view().day;
    const key = `${soul}:${day}`;
    if (this.greetedToday.has(key)) return null;
    this.greetedToday.add(key);
    const candidate = roleSpells.find(
      (s) => !this.deps.knowledge.knows(s.spell_id) && !this.deps.knowledge.hasSeen(s.spell_id),
    );
    if (!candidate) return null;
    this.deps.knowledge.see(candidate.spell_id);
    return candidate;
  }

  /**
   * Click an NPC -> see the one spell their role deals them -> add as a clue,
   * with a hint at what it needs. Also offers this role's one-time NPC gift
   * item, if any (`npcItems.ts`), and — if ink is offering any — a row per
   * "Talk to X" conversation ink currently offers (a multi-scene soul can
   * offer several at once). `talks` is threaded through the gift/clue rows'
   * own re-render calls so it survives picking one of them.
   */
  openNpcSpells(
    soul: string,
    role: string,
    talks: readonly PlayView["choices"][number][] = [],
  ): void {
    const { scene, magic, knowledge, modal, inventory, bus, ink } = this.deps;
    // Festival scoring's bond tick (T9). Before `clearModal()`, so a talk is
    // recorded even if some later line of this method throws — the counter is
    // save state, and losing a day's bond to a render bug is worse than
    // recording one the player barely saw.
    this.deps.onTalk?.(soul);
    modal.clearModal();
    const roleSpells = this.pickNpcSpells(soul, magic.spells.filter((s) => s.role === role));
    const shared = this.shareClueOnFirstTalk(soul, roleSpells);
    const offerable = roleSpells.filter(
      (s) => !knowledge.knows(s.spell_id) && !knowledge.hasSeen(s.spell_id),
    );
    const name = soulDisplayName(soul);
    modal.modalFrame(`${name} — spells a ${role} knows`, 560);

    let ry = H / 2 - 190;
    if (shared) {
      modal.pushModal(
        scene.add
          .text(
            W / 2 - 420,
            ry,
            `${name} mentions "${shared.phrase}" without being asked — needs ${modal.componentHint(shared)}.`,
            { fontFamily: FONT.display, fontSize: "24px", color: COLOR.ember, wordWrap: { width: 840 } },
          )
          .setDepth(201),
      );
      ry += 54;
    }

    if (!roleSpells.length || !offerable.length) {
      modal.pushModal(
        scene.add
          .text(
            W / 2 - 420,
            ry,
            roleSpells.length ? `Nothing new from ${name} right now.` : "Nothing authored for this role yet.",
            { fontFamily: FONT.display, fontSize: "22px", color: DIM },
          )
          .setDepth(201),
      );
      ry += 44;
    }

    // One pill per conversation ink is offering right now — plural, since a
    // multi-scene soul (Ilsa) can offer several "Talk to X" choices at once.
    // Placed ahead of gift/spell rows: talking is why the portrait's hover
    // rim went ember in the first place. No richer topic label exists to
    // show than "talk with X": `PlayChoice` carries no authored subject,
    // only the scene id in its own display text.
    talks.forEach((talk, i) => {
      const label = talks.length > 1 ? `Talk with ${name} — ${i + 1}` : `Talk with ${name}`;
      const h = this.choicePill(W / 2 - 420, ry, label, () => {
        modal.clearModal();
        ink.choose(talk.index);
        ink.runToChoice();
      });
      ry += h + PILL_GAP;
    });

    const giftItem = npcGiftForRole(role);
    if (giftItem && !this.takenNpcGifts.has(role)) {
      const h = this.choicePill(W / 2 - 420, ry, `take ${giftItem} — offered freely, no trade`, () => {
        inventory.give(giftItem);
        this.takenNpcGifts.add(role);
        bus.emit({
          type: "item:acquired",
          itemId: giftItem,
          source: "npc",
          screenId: this.deps.currentScreenId(),
          poolName: null,
        });
        this.openNpcSpells(soul, role, talks);
      });
      ry += h + PILL_GAP;
    }
    for (const s of offerable) {
      const h = this.choicePill(
        W / 2 - 420,
        ry,
        `${s.phrase}  —  needs ${modal.componentHint(s)}  —  click to add as a clue`,
        () => {
          knowledge.see(s.spell_id);
          this.openNpcSpells(soul, role, talks);
        },
      );
      ry += h + PILL_GAP;
    }

    modal.closeButton(() => modal.clearModal());
  }

  /**
   * One §14 Choice pill for the modal body — the same object a traversal or
   * dialogue choice draws. A `Graphics` rounded rect (`fillRoundedRect` +
   * `strokeRoundedRect`, never `Graphics.setMask` — Phaser 4 WebGL no-ops it)
   * carries the fill/border and the hit area; the label sits centered on top.
   * Colors, alphas and the corner-radius math mirror `TraversalRow.buildPill` /
   * `DialogueSystem.drawChoices`: `COLOR.panel`/`panelHover` fill at
   * `PILL_FILL_ALPHA`, 2px `COLOR.border`/`emberNum` border at
   * `PILL_BORDER_ALPHA`, `COLOR.ink`/`ember` label. Both objects are pushed into
   * the shared modal layer so `clearModal()` tears them down; returns the pill
   * height so the caller can advance its `ry` cursor.
   */
  private choicePill(x: number, y: number, label: string, onClick: () => void): number {
    const { scene, modal } = this.deps;
    const probe = scene.add
      .text(0, 0, label, { fontFamily: FONT.display, fontSize: PILL_FONT_PX, wordWrap: { width: PILL_WRAP_WIDTH } })
      .setVisible(false);
    const w = probe.width + PILL_PAD_X * 2;
    const h = probe.height + PILL_PAD_Y * 2;
    probe.destroy();

    const radius = pillCornerRadius({ x: 0, y: 0, w, h }, h * PILL_CORNER_OF_PILL);
    const g = scene.add.graphics().setDepth(201).setPosition(x, y);
    const paint = (hover: boolean): void => {
      g.clear();
      g.fillStyle(hover ? COLOR.panelHover : COLOR.panel, PILL_FILL_ALPHA);
      g.fillRoundedRect(0, 0, w, h, radius);
      g.lineStyle(2, hover ? COLOR.emberNum : COLOR.border, PILL_BORDER_ALPHA);
      g.strokeRoundedRect(0, 0, w, h, radius);
    };
    paint(false);
    g.setInteractive({
      hitArea: new Phaser.Geom.Rectangle(0, 0, w, h),
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });

    const t = scene.add
      .text(x + w / 2, y + h / 2, label, {
        fontFamily: FONT.display,
        fontSize: PILL_FONT_PX,
        color: COLOR.ink,
        align: "center",
        wordWrap: { width: w - PILL_PAD_X * 2 },
      })
      .setOrigin(0.5)
      .setDepth(202);

    g.on("pointerover", () => {
      paint(true);
      t.setColor(COLOR.ember);
    });
    g.on("pointerout", () => {
      paint(false);
      t.setColor(COLOR.ink);
    });
    g.on("pointerdown", onClick);

    modal.pushModal(g);
    modal.pushModal(t);
    return h;
  }
}
