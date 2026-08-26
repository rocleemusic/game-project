/**
 * The real renderer behind `DialogueRenderPort`.
 *
 * POOLED, NEVER CHURNED. Everything the port has ever been asked to draw is
 * kept and reused: one `Graphics` per shape layer, one `Text` per id, a growing
 * pool of `Rectangle` hit targets per group. Hiding is `setVisible(false)`, not
 * `destroy()`. A dialogue system draws on every single line, and re-creating
 * objects per line is precisely the unbounded-growth shape `npm run walk`
 * watches for — the same class of bug as the scrim that compounded to black.
 *
 * ONE ROOT CONTAINER. Every object is added to it at creation, so `detach()` is
 * a single `destroy()` that cannot half-succeed and cannot be defeated by a
 * later edit forgetting to append to a parallel tracking array.
 *
 * NO COLOURS, NO GEOMETRY, NO POLICY. It is handed finished numbers and
 * finished `COLOR` members. It decides nothing.
 *
 * PHASER IS A TYPE HERE, NOT A VALUE. Nothing in this file constructs a Phaser
 * class; every object comes off the scene's own factories. Importing the
 * namespace `import type` keeps the engine out of the module graph at load, so
 * `PhaserDialogueRenderPort.test.ts` can stand a ~150-line stub scene in front
 * of it and COUNT objects — which is the only way the pooling and the one-call
 * `detach()` below are actually verified rather than asserted in prose.
 */

import type Phaser from "phaser";
import type {
  DialogueRenderPort,
  HitSpec,
  RoundedRectShape,
  TextSpec,
} from "./DialogueRenderPort";
import type { SpritePlacement } from "../world/view/DialogueLayout";
import { COLOR } from "../ui/theme";

/** Depth of each shape layer within the root, low to high. */
const LAYER_ORDER = [
  "sprite",
  "box",
  "choices",
  "nameplate",
  "controls",
  "backlog",
] as const;

export interface PhaserDialogueRenderPortOptions {
  readonly depth?: number;
  /** Overrides `scene.scale`. Injectable so a caller can pin the layout size. */
  readonly view?: { width: number; height: number };
}

export class PhaserDialogueRenderPort implements DialogueRenderPort {
  private readonly scene: Phaser.Scene;
  private readonly root: Phaser.GameObjects.Container;
  private readonly view: { width: number; height: number } | null;

  private readonly shapeLayers = new Map<string, Phaser.GameObjects.Graphics>();
  private readonly texts = new Map<string, Phaser.GameObjects.Text>();
  private readonly hitGroups = new Map<string, Phaser.GameObjects.Rectangle[]>();
  private readonly timers = new Map<string, Phaser.Time.TimerEvent>();
  private readonly keyHandlers: { key: string; handler: () => void }[] = [];
  /**
   * Extra teardown the mounting code needs run.
   *
   * Not on `DialogueRenderPort`: a scene-lifecycle listener is a Phaser fact,
   * and the interface exists precisely so the system never learns one. Keeping
   * it here means there is still exactly ONE release path — `detach()`.
   */
  private readonly cleanups: (() => void)[] = [];
  private image: Phaser.GameObjects.Image | null = null;
  private imageKey: string | null = null;
  /** A ruler for `measureTextWidth`, never on the display list. */
  private ruler: Phaser.GameObjects.Text | null = null;
  private detached = false;

  constructor(scene: Phaser.Scene, options: PhaserDialogueRenderPortOptions = {}) {
    this.scene = scene;
    this.view = options.view ?? null;
    this.root = scene.add.container(0, 0).setDepth(options.depth ?? 200);
    // Declared once, here: insertion order IS depth order inside a container,
    // so no scattered setDepth calls can fight over the stack later.
    for (const layer of LAYER_ORDER) this.layerFor(layer);
  }

  get attached(): boolean {
    return !this.detached;
  }

  viewSize(): { width: number; height: number } {
    return this.view ?? { width: this.scene.scale.width, height: this.scene.scale.height };
  }

  // -------------------------------------------------------------------------
  // Measurement
  // -------------------------------------------------------------------------

  measureTextWidth(text: string, fontPx: number, fontFamily: string): number {
    if (this.detached) return 0;
    const ruler = this.rulerFor(fontPx, fontFamily);
    ruler.setText(text);
    return ruler.width;
  }

  wrapText(
    text: string,
    fontPx: number,
    fontFamily: string,
    wrapWidth: number,
  ): readonly string[] {
    if (this.detached) return [text];
    const ruler = this.rulerFor(fontPx, fontFamily);
    ruler.setStyle({ wordWrap: { width: Math.max(1, wrapWidth) } });
    const lines = ruler.getWrappedText(text);
    // Reset, so the ruler's next job as a width measurer is not silently
    // wrapped by a width some earlier caller happened to want.
    ruler.setStyle({ wordWrap: { width: 0 } });
    return lines.length ? lines : [""];
  }

  imageSize(key: string): { width: number; height: number } | null {
    if (this.detached || !this.scene.textures.exists(key)) return null;
    const source = this.scene.textures.get(key).getSourceImage();
    return { width: source.width, height: source.height };
  }

  // -------------------------------------------------------------------------
  // Drawing
  // -------------------------------------------------------------------------

  drawShapes(layer: string, shapes: readonly RoundedRectShape[]): void {
    if (this.detached) return;
    const g = this.layerFor(layer);
    g.clear();
    for (const shape of shapes) {
      const { rect, radius, style } = shape;
      const r = Math.max(0, Math.min(radius, rect.h / 2, rect.w / 2));
      g.fillStyle(style.fillColor, style.fillAlpha);
      g.fillRoundedRect(rect.x, rect.y, rect.w, rect.h, r);
      if (style.strokeWidth > 0 && style.strokeAlpha > 0) {
        g.lineStyle(style.strokeWidth, style.strokeColor, style.strokeAlpha);
        g.strokeRoundedRect(rect.x, rect.y, rect.w, rect.h, r);
      }
    }
  }

  drawText(id: string, spec: TextSpec | null): void {
    if (this.detached) return;
    const existing = this.texts.get(id);
    if (!spec) {
      existing?.setVisible(false);
      return;
    }
    const t = existing ?? this.makeText(id);
    t.setStyle({
      fontFamily: spec.fontFamily,
      fontSize: `${spec.fontPx}px`,
      color: spec.color,
      align: spec.align,
      wordWrap: { width: spec.wrapWidth ?? 0 },
    });
    t.setLineSpacing(spec.lineSpacing ?? 0);
    t.setText(spec.text);
    t.setOrigin(spec.originX, spec.originY);
    t.setScale(spec.scale ?? 1);
    t.setPosition(spec.x, spec.y);
    t.setVisible(true);
  }

  setHits(group: string, hits: readonly HitSpec[]): void {
    if (this.detached) return;
    const pool = this.hitGroups.get(group) ?? [];
    if (!this.hitGroups.has(group)) this.hitGroups.set(group, pool);

    while (pool.length < hits.length) {
      // Fully transparent — the fill is a required argument, not a decision.
      // Still a `COLOR` member: `theme.ts` is audited by grep, and an exception
      // "because alpha is 0" is how the next one gets in.
      const rect = this.scene.add.rectangle(0, 0, 1, 1, COLOR.night, 0);
      this.root.add(rect);
      pool.push(rect);
    }
    hits.forEach((hit, i) => {
      const rect = pool[i];
      // Handlers are per-set, so the previous set's closures must go or a stale
      // one fires against the wrong choice index.
      rect.removeAllListeners();
      rect.setPosition(hit.rect.x + hit.rect.w / 2, hit.rect.y + hit.rect.h / 2);
      rect.setSize(hit.rect.w, hit.rect.h);
      rect.setVisible(true);
      rect.setInteractive({ useHandCursor: hit.cursor });
      rect.input!.hitArea.setTo(0, 0, hit.rect.w, hit.rect.h);
      if (hit.onDown) rect.on("pointerdown", hit.onDown);
      if (hit.onOver) rect.on("pointerover", hit.onOver);
      if (hit.onOut) rect.on("pointerout", hit.onOut);
    });
    for (let i = hits.length; i < pool.length; i++) {
      pool[i].removeAllListeners();
      pool[i].disableInteractive();
      pool[i].setVisible(false);
    }
  }

  setImage(key: string | null, placement: SpritePlacement | null): void {
    if (this.detached) return;
    if (!key || !placement || !this.scene.textures.exists(key)) {
      this.image?.setVisible(false);
      this.imageKey = null;
      return;
    }
    if (!this.image) {
      this.image = this.scene.add.image(0, 0, key);
      // Below every shape layer: the figure stands behind the box.
      this.root.addAt(this.image, 0);
    } else if (this.imageKey !== key) {
      this.image.setTexture(key);
    }
    this.imageKey = key;
    this.image
      .setOrigin(placement.originX, placement.originY)
      .setPosition(placement.x, placement.y)
      .setScale(placement.scale)
      .setVisible(true);
  }

  // -------------------------------------------------------------------------
  // Input and time
  // -------------------------------------------------------------------------

  onKey(key: string, handler: () => void): void {
    if (this.detached) return;
    const event = `keydown-${key.toUpperCase()}`;
    this.scene.input.keyboard?.on(event, handler);
    this.keyHandlers.push({ key: event, handler });
  }

  startTimer(id: string, intervalMs: number, tick: () => void): void {
    if (this.detached) return;
    this.stopTimer(id);
    this.timers.set(
      id,
      this.scene.time.addEvent({
        delay: Math.max(1, intervalMs),
        loop: true,
        callback: tick,
      }),
    );
  }

  stopTimer(id: string): void {
    const timer = this.timers.get(id);
    if (!timer) return;
    timer.remove(false);
    this.timers.delete(id);
  }

  /** Run `fn` when this port detaches. Safe to call before or after mounting. */
  addCleanup(fn: () => void): void {
    if (this.detached) fn();
    else this.cleanups.push(fn);
  }

  detach(): void {
    if (this.detached) return;
    this.detached = true;
    for (const fn of this.cleanups.splice(0)) fn();
    for (const id of [...this.timers.keys()]) this.stopTimer(id);
    for (const { key, handler } of this.keyHandlers) {
      this.scene.input.keyboard?.off(key, handler);
    }
    this.keyHandlers.length = 0;
    this.ruler?.destroy();
    this.ruler = null;
    // One call, and NO `fromScene` argument. `destroy(true)` means "the scene
    // is already tearing this down", which skips removing the container from
    // the display list — the exact leak this port is built to make impossible.
    this.root.destroy();
    this.shapeLayers.clear();
    this.texts.clear();
    this.hitGroups.clear();
    this.image = null;
    this.imageKey = null;
  }

  // -------------------------------------------------------------------------
  // Pools
  // -------------------------------------------------------------------------

  private layerFor(layer: string): Phaser.GameObjects.Graphics {
    let g = this.shapeLayers.get(layer);
    if (!g) {
      g = this.scene.add.graphics();
      this.root.add(g);
      this.shapeLayers.set(layer, g);
    }
    return g;
  }

  private makeText(id: string): Phaser.GameObjects.Text {
    const t = this.scene.add.text(0, 0, "", {});
    this.root.add(t);
    this.texts.set(id, t);
    return t;
  }

  private rulerFor(fontPx: number, fontFamily: string): Phaser.GameObjects.Text {
    // Made once and never added to the root: it exists to be measured, and a
    // measuring object on the display list is a blank rectangle in the scene.
    this.ruler ??= this.scene.make.text({ add: false }, false);
    this.ruler.setStyle({
      fontFamily,
      fontSize: `${fontPx}px`,
      wordWrap: { width: 0 },
    });
    return this.ruler;
  }
}
