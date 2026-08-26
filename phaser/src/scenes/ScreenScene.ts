/**
 * The walking skeleton: a backdrop, its hotspots, the ink transcript, and the
 * choices — driven entirely by `LanternPlayer`.
 *
 * Deliberately unstyled. Its job is to prove the seam works end to end before
 * any art or UI is spent on it.
 */

import Phaser from "phaser";
import { InkBridge } from "../ink/InkBridge";
import type { Run } from "../ink/loadRun";
import type { MagicDB } from "../magic/CastResolver";
import { Inventory } from "../world/Inventory";
import { Gates } from "../world/Gates";
import { Forage } from "../world/Forage";
import { Cast } from "../world/Cast";
import { Knowledge } from "../world/Knowledge";
import type { PlayView } from "@lantern/lib/play";
import { COLOR, FONT, sceneFadeIn } from "../ui/theme";
import { utilityPill } from "../ui/buttons";
import { PlayerSettings } from "../world/PlayerSettings";

const W = 1920;
const H = 1080;

export class ScreenScene extends Phaser.Scene {
  private run!: Run;
  private ink!: InkBridge;
  private backdrop?: Phaser.GameObjects.Image;
  /**
   * The scrim that keeps placeholder text readable over photographic art.
   * Created ONCE. It used to be re-added on every screen change and never
   * destroyed, so the alphas compounded — 0.55^10 is ~0.002, which read as
   * "images stop working after about ten moves" and went fully black by day 2.
   */
  private scrim?: Phaser.GameObjects.Rectangle;
  /** Everything drawn per-screen. Cleared wholesale on every screen change. */
  private hotspots: Phaser.GameObjects.GameObject[] = [];
  private transcript!: Phaser.GameObjects.Text;
  private header!: Phaser.GameObjects.Text;
  /** Choice rows AND the styled "continue" pill's parts — `GameObject`, not
   * `Text`, since the pill contributes a Graphics fill too. */
  private choiceTexts: Phaser.GameObjects.GameObject[] = [];
  private currentScreen: string | null = null;

  constructor() {
    super("ScreenScene");
  }

  private magic!: MagicDB;
  private inventory!: Inventory;
  private gates!: Gates;
  /**
   * Whether the host enforces the locks ink only advertises. Off by default so
   * the probe matches today's shipped behaviour; `?locks=1` turns on the
   * proposed behaviour so the two can be compared side by side.
   */
  private enforceLocks = false;
  private forage!: Forage;
  private knowledge!: Knowledge;
  /** Per-screen forage chips, rebuilt on every render. */
  private forageLayer: Phaser.GameObjects.GameObject[] = [];
  private satchelStrip: Phaser.GameObjects.GameObject[] = [];
  private cast!: Cast;
  private castLayer: Phaser.GameObjects.GameObject[] = [];

  init(data: { run: Run; ink: InkBridge; magic: MagicDB }) {
    this.run = data.run;
    this.ink = data.ink;
    this.magic = data.magic;
    this.inventory = new Inventory([...data.run.items, ...data.run.keyItems]);
    // Sandbox: the probe measures casting, not foraging. LanternPlayer already
    // models the day's carry and is tested; re-proving it here would be waste.
    this.inventory.grantAllMaterials();
    this.gates = new Gates(data.run.graph);
    this.enforceLocks = new URLSearchParams(location.search).has("locks");
    this.knowledge = new Knowledge();
    // Guaranteed pool entries: the GDD exempts anything a gate or a soul
    // arc depends on. Authored `forage` names are coarse and do not join to
    // item_ids (GAPS.md G2), so this cannot be derived - herbs is named
    // because T2 Make demo needs it. Provisional, like spellGates.ts.
    this.forage = new Forage(data.run.graph, ["item_berry"]);
    this.cast = new Cast(data.run.graph);
  }

  /**
   * The decoration sandbox. Mounted on HOME — the player's Home Hub — not on
   * T5, which manifest.json files as `homeinterior.jpg` but which graph.json
   * names "A Neighbor's Home" (ruled by Roc 2026-08-12). See GAPS.md G9.
   */
  private openHub() {
    if (this.scene.isActive("HubScene")) return;
    this.scene.pause();
    this.scene.launch("HubScene", {
      items: [...this.run.items, ...this.run.keyItems],
      backdropKey: "bg:HOME",
      // Same banked draw-down mode 3 gets — the ship target is this path, so
      // the "palette is a source, not an inventory" sandbox rule ends here
      // too (Roc, 2026-08-23).
      banked: [...this.ink.view().banked],
      homeRegions: this.run.decorSurfaces.HOME,
      // Stop rendering behind the Hub, not just updating — see
      // `HubSceneData.launcherKey`.
      launcherKey: "ScreenScene",
      onClose: () => {
        this.scene.resume();
        this.render();
      },
    });
  }

  private openNotebook() {
    if (this.scene.isActive("NotebookScene")) return;
    this.scene.pause();
    this.scene.launch("NotebookScene", {
      view: this.ink.view(),
      magic: this.magic,
      knowledge: this.knowledge,
      items: [...this.run.items, ...this.run.keyItems],
      onClose: () => {
        this.scene.resume();
        this.render();
      },
    });
  }

  private openCast() {
    if (this.scene.isActive("CastScene")) return;
    // Paused, not merely covered: an active scene underneath keeps its choices
    // hoverable and clickable through the overlay, which reads as two competing
    // interfaces.
    this.scene.pause();
    this.scene.launch("CastScene", {
      magic: this.magic,
      inventory: this.inventory,
      gates: this.gates,
      screen: this.ink.view().pos.currentScreen,
      knowledge: this.knowledge,
      onClose: () => {
        this.scene.resume();
        this.render();
      },
    });
  }

  create() {
    sceneFadeIn(this);
    this.header = this.add
      .text(24, 20, "", { fontFamily: FONT.mono, fontSize: "28px", color: COLOR.gold })
      .setDepth(100);

    this.transcript = this.add
      .text(24, 70, "", {
        fontFamily: FONT.display,
        fontSize: "26px",
        color: "#ffffff",
        wordWrap: { width: W - 560 },
        lineSpacing: 8,
      })
      .setDepth(100);

    this.ink.on("view", () => this.render());
    this.ink.on("error", (msg: string) => console.error("[ink]", msg));

    // Casting is host-side, not in ink — the story knows nothing about spells.
    this.input.keyboard?.on("keydown-C", () => this.openCast());
    // The §14 Utility pill, not the old `[ bracket ]` text (Roc's Group 2 note:
    // "bracket buttons -> styled buttons everywhere"). Same chrome
    // `ModalFrame.button` draws — one implementation, in `ui/buttons.ts`.
    utilityPill(this, W - 220, 20, "[ Cast — C ]", () => this.openCast(), { depth: 100 });

    this.input.keyboard?.on("keydown-H", () => this.openHub());
    utilityPill(this, W - 460, 20, "[ Hub — H ]", () => this.openHub(), { depth: 100 });

    this.input.keyboard?.on("keydown-N", () => this.openNotebook());
    utilityPill(this, W - 700, 20, "[ Notebook — N ]", () => this.openNotebook(), { depth: 100 });

    this.exposeForWalker();

    this.ink.runToChoice();
    this.render();
  }

  /**
   * A live handle for `tools/walk.mjs`. The walker drives real choices and
   * samples real canvas pixels, which is the only way to catch rendering
   * faults that accumulate over a long session — a unit test cannot see a
   * scrim compounding to black across ten screen changes.
   */
  private exposeForWalker() {
    (window as unknown as Record<string, unknown>).__probe = {
      choose: (i: number) => {
        this.ink.choose(i);
        this.ink.runToChoice();
      },
      advance: () => this.ink.advance(),
      openCast: () => this.openCast(),
      openHub: () => this.openHub(),
      openNotebook: () => this.openNotebook(),
      /** Read ink VARs directly — presence, clock, anything the story owns. */
      vars: (names: string[]) => this.ink.player.peekVars(names),
      /** Who is on this screen, and whether they can be talked to. */
      cast: () => {
        const v = this.ink.view();
        const screen = v.pos.currentScreen;
        if (!screen) return [];
        return this.cast.presentOn(
          screen,
          this.ink.player.peekVars(this.cast.souls.map((s) => `present_${s}`)),
        );
      },
      forage: () => {
        const v = this.ink.view();
        const screen = v.pos.currentScreen;
        if (!screen) return [];
        return this.forage
          .offer(screen, v.day, v.timeBlock)
          .filter((slot) => !v.pickedSlots.includes(slot.slotId));
      },
      pickup: (slotId: string, item: string) => {
        const ok = this.ink.player.pickup(slotId, item);
        this.ink.refresh();
        return ok;
      },
      packTriage: () => {
        const ok = this.ink.player.packTriage();
        this.ink.runToChoice();
        return ok;
      },
      /** A plain, fully-enumerable object — getters would not survive the
       *  page/driver boundary, which silently returns undefined fields. */
      snapshot: () => {
        const v = this.ink.view();
        return {
          day: v.day,
          timeBlock: v.timeBlock,
          movesLeft: v.movesLeft,
          screen: v.pos.currentScreen,
          choices: v.choices.map((c) => ({
            index: c.index,
            kind: c.kind,
            display: c.display,
          })),
          canContinue: v.canContinue,
          ended: v.ended,
          errors: [...v.errors],
          satchel: [...v.satchel],
          notebook: [...v.notebook],
          arms: [...v.arms],
          banked: [...v.banked],
          spellbook: this.knowledge.spellbook(),
          hasBackdrop: Boolean(this.backdrop),
          displayCount: this.children.list.length,
          enforceLocks: this.enforceLocks,
          clearedGates: this.gates.clearedGates(),
          // Which offered moves the host would block, whether or not it is
          // currently enforcing them.
          blockedMoves: v.choices
            .filter((c) => c.kind === "move")
            .map((c) => ({ display: c.display, blocked: this.gates.blockingForMoveText(c.display) }))
            .filter((m) => m.blocked)
            .map((m) => ({ display: m.display, gates: m.blocked!.gates })),
        };
      },
    };
  }

  /** Swap the backdrop when ink's `#screen:` tag changes. */
  private syncBackdrop(screen: string | null) {
    if (screen === this.currentScreen) return;
    this.currentScreen = screen;

    this.backdrop?.destroy();
    this.backdrop = undefined;
    this.hotspots.forEach((h) => h.destroy());
    this.hotspots = [];
    if (!screen) return;

    const key = `bg:${screen}`;
    if (this.textures.exists(key)) {
      this.backdrop = this.add.image(W / 2, H / 2, key).setDepth(0);
      // `cover` the fixed canvas — the backdrops are mixed aspect ratios.
      const img = this.backdrop;
      img.setScale(Math.max(W / img.width, H / img.height));
    } else {
      console.warn("[assets] no backdrop for screen", screen);
    }

    // One scrim for the life of the scene, shown only when there is art under
    // it AND the player has asked for any dimming at all. Reused rather than
    // recreated, and its alpha ASSIGNED from the setting rather than layered —
    // see the field's comment for what happens when it accumulates instead.
    const scrimAlpha = PlayerSettings.scrimAlpha;
    this.scrim ??= this.add.rectangle(W / 2, H / 2, W, H, COLOR.night, 0).setDepth(1);
    this.scrim.setFillStyle(COLOR.night, scrimAlpha);
    this.scrim.setVisible(Boolean(this.backdrop) && scrimAlpha > 0);

    this.drawHotspots(screen);
  }

  /**
   * Hotspots come from regions.json as fractions of the backdrop, so they need
   * no per-screen aspect correction against a fixed canvas.
   *
   * Only T1 has authored geometry today. Screens whose regions carry no shape
   * fall back to a labelled row along the bottom, so every screen is playable
   * now and hotspot authoring never blocks play.
   */
  private drawHotspots(screen: string) {
    const rects = this.run.regions[screen] ?? {};
    const spec = this.run.graph.screens?.find((s) => s.screen_id === screen);
    const declared = (spec?.regions ?? []).map((r) => r.region_id);
    const ids = new Set([...Object.keys(rects), ...declared]);

    let fallbackX = 40;
    for (const id of ids) {
      const r = rects[id];
      if (r) {
        const box = this.add
          .rectangle(
            (r.x + r.w / 2) * W,
            (r.y + r.h / 2) * H,
            r.w * W,
            r.h * H,
            COLOR.goldNum,
            0.18,
          )
          .setStrokeStyle(2, COLOR.goldNum, 0.9)
          .setDepth(10)
          .setInteractive({ useHandCursor: true });
        box.on("pointerover", () => box.setFillStyle(COLOR.goldNum, 0.35));
        box.on("pointerout", () => box.setFillStyle(COLOR.goldNum, 0.18));
        box.on("pointerdown", () => console.log("[hotspot]", screen, id));
        this.hotspots.push(box);
      } else {
        // No geometry authored yet — render as a pill so it is still clickable.
        const label = this.add
          .text(fallbackX, H - 128, id, {
            fontFamily: FONT.mono,
            fontSize: "22px",
            color: COLOR.onAccent,
            backgroundColor: COLOR.gold,
            padding: { x: 14, y: 8 },
          })
          .setDepth(10)
          .setInteractive({ useHandCursor: true });
        label.on("pointerdown", () => console.log("[hotspot:unshaped]", screen, id));
        // Tracked like the shaped boxes — untracked pills accumulated across
        // screens and piled up along the bottom edge.
        this.hotspots.push(label);
        fallbackX += label.width + 14;
      }
    }
  }

  /**
   * Forage points for this visit. Drawn every render rather than only on a
   * screen change, so a pickup removes its own slot immediately.
   */
  /**
   * Souls standing on this screen.
   *
   * Portraits are framed rather than cut out: the source art is JPG with no
   * alpha, so a bare sprite would be a hard rectangle over the backdrop. A
   * deliberate frame reads as a choice instead of a mistake.
   *
   * A present soul with no authored scene here is still SHOWN, and said so
   * plainly. Hiding them would hide the gap — 102 of 121 placements across the
   * week are silent (GAPS.md G15) — and a player would just see an empty square
   * where the day file says someone is standing.
   */
  private drawCast(v: PlayView) {
    this.castLayer.forEach((o) => o.destroy());
    this.castLayer = [];
    const screen = v.pos.currentScreen;
    if (!screen) return;

    const presence = this.ink.player.peekVars(
      this.cast.souls.map((s) => `present_${s}`),
    );
    const here = this.cast.presentOn(screen, presence);
    if (!here.length) return;

    // Spread along a baseline. There is no data anywhere for where a soul
    // stands on a screen (GAPS.md G16), so this is a layout, not a placement.
    const slotW = 250;
    const startX = W / 2 - ((here.length - 1) * slotW) / 2;
    const baseY = H - 430;

    here.forEach((who, i) => {
      const x = startX + i * slotW;
      const key = this.cast.portraitKey(who.soul);

      const frame = this.add
        .rectangle(x, baseY, 190, 250, 0x14110c, 0.85)
        .setStrokeStyle(3, who.scened ? COLOR.goldNum : 0x6b6252)
        .setDepth(14);
      this.castLayer.push(frame);

      if (key && this.textures.exists(key)) {
        const portrait = this.add.image(x, baseY, key).setDepth(15);
        const scale = Math.min(178 / portrait.width, 238 / portrait.height);
        portrait.setScale(scale);
        if (!who.scened) portrait.setAlpha(0.45);
        this.castLayer.push(portrait);
      } else {
        this.castLayer.push(
          this.add
            .text(x, baseY, who.soul, {
              fontFamily: FONT.display,
              fontSize: "28px",
              color: "#6b6252",
            })
            .setOrigin(0.5)
            .setDepth(15),
        );
      }

      const name = this.add
        .text(x, baseY + 134, who.soul, {
          // A soul's name — display, matching `NpcTalkSystem`'s name plates.
          fontFamily: FONT.display,
          fontSize: "22px",
          color: who.scened ? COLOR.onAccent : "#cdbfa6",
          backgroundColor: who.scened ? COLOR.gold : "#2a2419",
          padding: { x: 10, y: 5 },
        })
        .setOrigin(0.5)
        .setDepth(16);
      this.castLayer.push(name);

      if (!who.scened) {
        const elsewhere = this.cast.screensFor(who.soul);
        this.castLayer.push(
          this.add
            .text(
              x,
              baseY + 168,
              elsewhere.length
                ? `nothing to say here\nscenes: ${elsewhere.join(", ")}`
                : "no scenes authored",
              {
                fontFamily: FONT.mono,
                fontSize: "16px",
                color: "#8d8371",
                align: "center",
              },
            )
            .setOrigin(0.5, 0)
            .setDepth(16),
        );
      }
    });
  }

  private drawForage(v: PlayView) {
    this.forageLayer.forEach((o) => o.destroy());
    this.forageLayer = [];
    const screen = v.pos.currentScreen;
    if (!screen) return;

    const offered = this.forage
      .offer(screen, v.day, v.timeBlock)
      .filter((slot) => !v.pickedSlots.includes(slot.slotId));
    if (!offered.length) return;

    const full =
      v.satchel.length >= v.satchelCapacity && v.arms.length >= v.armsCapacity;
    const y = H - 190;
    const head = this.add
      .text(40, y - 32, full ? "out here (satchel and arms full)" : "out here", {
        // Matches `HotspotSystem`'s forage line, the shipped equivalent.
        fontFamily: FONT.display,
        fontSize: "20px",
        color: "#8d8371",
      })
      .setDepth(20);
    this.forageLayer.push(head);

    let x = 40;
    for (const slot of offered) {
      const chip = this.add
        .text(x, y, "+ " + slot.item + (slot.guaranteed ? " *" : ""), {
          fontFamily: FONT.mono,
          fontSize: "22px",
          color: full ? "#6b6252" : COLOR.onAccent,
          backgroundColor: full ? "#2a2419" : "#b9d8a0",
          padding: { x: 12, y: 8 },
        })
        .setDepth(20)
        .setInteractive({ useHandCursor: !full });
      chip.on("pointerdown", () => {
        // LanternPlayer owns capacity, arms-carry and the picked-slot ledger.
        this.ink.player.pickup(slot.slotId, slot.item);
        this.ink.refresh();
      });
      this.forageLayer.push(chip);
      x += chip.width + 12;
    }
  }

  /** What you are carrying, and what carrying it costs. */
  private drawSatchel(v: PlayView) {
    this.satchelStrip.forEach((o) => o.destroy());
    this.satchelStrip = [];

    const parts: string[] = ["Satchel " + v.satchel.length + "/" + v.satchelCapacity];
    if (v.satchel.length) parts.push(v.satchel.join(", "));
    if (v.arms.length) {
      parts.push("Arms " + v.arms.length + "/" + v.armsCapacity + ": " + v.arms.join(", "));
    }
    if (v.banked.length) parts.push("Banked " + v.banked.length);

    const t = this.add
      .text(40, H - 70, parts.join("  \u00b7  "), {
        fontFamily: FONT.mono,
        fontSize: "21px",
        color: v.arms.length ? COLOR.gold : "#e8dcc0",
      })
      .setDepth(20);
    this.satchelStrip.push(t);

    // Pack-triage is the ONLY route that banks arms-carry. Offered only when it
    // would actually save something, so it never reads as a second "End the day".
    if (v.arms.length) {
      const btn = this.add
        .text(40, H - 34, "[ pack-triage: go home now and keep what is in your arms ]", {
          fontFamily: FONT.mono,
          fontSize: "20px",
          color: COLOR.onAccent,
          backgroundColor: COLOR.gold,
          padding: { x: 10, y: 6 },
        })
        .setDepth(20)
        .setInteractive({ useHandCursor: true });
      btn.on("pointerdown", () => {
        this.ink.player.packTriage();
        this.ink.runToChoice();
      });
      this.satchelStrip.push(btn);
    }
  }

  private render() {
    const v = this.ink.view();
    this.syncBackdrop(v.pos.currentScreen);
    this.drawCast(v);
    this.drawForage(v);
    this.drawSatchel(v);

    this.header.setText(
      `Day ${v.day} · ${v.timeBlock} · Moves ${v.movesLeft} · ` +
        `Satchel ${v.satchel.length}/${v.satchelCapacity} · ` +
        `Screen ${v.pos.currentScreen ?? "—"}`,
    );

    const lines = v.lines.slice(-8).map((l) => (l.player ? `  > ${l.text}` : l.text));
    this.transcript.setText(lines.join("\n\n"));

    this.choiceTexts.forEach((t) => t.destroy());
    this.choiceTexts = [];

    let y = 140;
    const x = W - 500;
    for (const c of v.choices) {
      // Ink emits every move unconditionally and tags it `#lock:` as advisory
      // metadata — nothing in the weave's condition mentions a gate. So a
      // locked screen is walkable today. Under `?locks=1` the host enforces
      // what ink only advertises, which is the behaviour being proposed.
      const blocked = c.kind === "move" ? this.gates.blockingForMoveText(c.display) : null;
      const locked = this.enforceLocks && Boolean(blocked);

      const color = locked ? "#7a6f5e" : c.kind === "move" ? "#9fd7ff" : "#ffffff";
      const label = blocked
        ? `${c.display}  🔒 ${blocked.gates.join(", ")}`
        : c.display;

      const t = this.add
        .text(x, y, label, {
          fontFamily: FONT.display,
          fontSize: "24px",
          color,
          wordWrap: { width: 460 },
        })
        .setDepth(100)
        .setInteractive({ useHandCursor: !locked });

      if (!locked) {
        t.on("pointerover", () => t.setColor(COLOR.gold));
        t.on("pointerout", () => t.setColor(color));
        t.on("pointerdown", () => {
          this.ink.choose(c.index);
          this.ink.runToChoice();
        });
      }
      this.choiceTexts.push(t);
      y += t.height + 18;
    }

    if (v.canContinue && v.choices.length === 0) {
      // Styled pill, not `[ Continue ]` text — every part goes onto the same
      // teardown list the choice rows use, so a redraw destroys the whole pill.
      const cont = utilityPill(this, x, y, "continue", () => this.ink.advance(), { depth: 100 });
      this.choiceTexts.push(...cont.objects);
    }
  }
}
