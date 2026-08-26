/**
 * Mode picker — the very first thing shown.
 *
 * Four modes hand off to the same `PreloadScene` with a `mode` flag, so all
 * share one run-loading path and none forks it.
 */

import Phaser from "phaser";
import type { Run } from "../ink/loadRun";
import { MODES } from "../mode/modes";
import type { GameMode } from "../boot/PreloadScene";
import { COLOR, FONT, popIn, REDUCED_MOTION, sceneFadeIn, sceneTransition } from "../ui/theme";

const W = 1920;
const H = 1080;

export interface ModePickerData {
  run: Run;
}

export class ModePickerScene extends Phaser.Scene {
  private run!: Run;

  constructor() {
    super("ModePickerScene");
  }

  init(data: ModePickerData) {
    this.run = data.run;
  }

  preload() {
    // `?walk=1` drives the day-loop probe headlessly (tools/walk.mjs,
    // cast-sweep.mjs) and expects `window.__probe` on ScreenScene to exist the
    // moment the page settles — it must never see the picker. `?mode=collect`
    // is the equivalent skip for driving the new mode headlessly later.
    const params = new URLSearchParams(location.search);
    if (params.has("walk") || params.get("mode") === "daylife") {
      this.scene.start("PreloadScene", { run: this.run, mode: "daylife" });
      return;
    }
    if (params.get("mode") === "collect") {
      this.scene.start("PreloadScene", { run: this.run, mode: "collect" });
      return;
    }
    if (params.get("mode") === "discover-home") {
      this.scene.start("PreloadScene", { run: this.run, mode: "discover-home" });
      return;
    }
    if (params.get("mode") === "mode5") {
      this.scene.start("PreloadScene", { run: this.run, mode: "mode5" });
      return;
    }
    this.load.image("bg:mode-picker", "art/ui/mode-picker-bg.jpg");
  }

  create() {
    if (!this.textures.exists("bg:mode-picker")) return;
    sceneFadeIn(this);
    const bg = this.add.image(W / 2, H / 2, "bg:mode-picker").setDepth(0);
    bg.setScale(Math.max(W / bg.width, H / bg.height));
    this.add.rectangle(W / 2, H / 2, W, H, 0x000000, 0.35).setDepth(1);

    const title = this.add
      .text(W / 2, 200, "LANTERN", {
        fontFamily: FONT.display,
        fontSize: "72px",
        color: "#ffe9b0",
      })
      .setOrigin(0.5)
      .setDepth(2);
    const sub = this.add
      .text(W / 2, 280, "choose a mode to play", {
        fontFamily: FONT.display,
        fontSize: "24px",
        color: "#e8dcc0",
      })
      .setOrigin(0.5)
      .setDepth(2);
    if (!REDUCED_MOTION) {
      popIn(this, title);
      popIn(this, sub);
    }

    this.button(W / 2, 460, "The Festival Week", "walk the day loop, talk, cast, decorate", () =>
      this.pick("daylife"),
    );
    this.button(
      W / 2,
      620,
      "Collection & Discovery",
      "forage the forest and town, learn spells from neighbours, confirm them yourself",
      () => this.pick("collect"),
    );
    this.button(
      W / 2,
      760,
      "Discovery & Home",
      "everything from Collection & Discovery, plus a hub you can only decorate with what you've actually found",
      () => this.pick("discover-home"),
    );
    this.button(
      W / 2,
      900,
      MODES.mode5.title,
      MODES.mode5.blurb,
      () => this.pick("mode5"),
    );
  }

  private pick(mode: GameMode) {
    sceneTransition(this, "PreloadScene", { run: this.run, mode });
  }

  private button(x: number, y: number, title: string, sub: string, onClick: () => void) {
    const box = this.add
      .rectangle(x, y, 720, 120, COLOR.panel, 0.85)
      .setStrokeStyle(2, COLOR.goldNum, 0.9)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });
    const t = this.add
      .text(x, y - 20, title, { fontFamily: FONT.display, fontSize: "30px", color: COLOR.gold })
      .setOrigin(0.5)
      .setDepth(3);
    const s = this.add
      .text(x, y + 24, sub, { fontFamily: FONT.display, fontSize: "18px", color: "#cdbfa6" })
      .setOrigin(0.5)
      .setDepth(3);
    box.on("pointerover", () => {
      box.setFillStyle(COLOR.panelHover, 0.95);
      box.setStrokeStyle(2, COLOR.emberNum, 1);
    });
    box.on("pointerout", () => {
      box.setFillStyle(COLOR.panel, 0.85);
      box.setStrokeStyle(2, COLOR.goldNum, 0.9);
    });
    box.on("pointerdown", onClick);
    t.setInteractive({ useHandCursor: true }).on("pointerdown", onClick);
    s.setInteractive({ useHandCursor: true }).on("pointerdown", onClick);
  }
}
