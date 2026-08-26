/**
 * The ONE button chrome — §14's Utility pill (Control-style), lifted out of
 * `render/ModalFrame.ts` so every scene can draw the same object instead of
 * hand-rolling its own `[ bracket ] text` control.
 *
 * WHY THIS FILE EXISTS. `ModalFrame.button()` already drew the approved pill,
 * but only callers holding a `ModalFrame` (which needs a scene, a viewport and
 * an `Inventory`) could reach it. Everything else — the satchel's close, the
 * shelf's close, edit-mode's export, `ScreenScene`'s HUD row — kept rendering
 * raw bracket text, so the same control read two different ways depending on
 * which screen you were on (Roc's note, Group 2: "bracket buttons -> styled
 * buttons everywhere"). The drawing code moved here verbatim; `ModalFrame`
 * now delegates to it, so there is still exactly one implementation and no
 * second button style was invented.
 *
 * Colors, alphas and the corner-radius math are unchanged: `night` @ 90% fill,
 * 2px `gold` @ 35% border, `gold` mono label, hover lifting to
 * `panelHover`/`ember`. Radius is `VN_METRICS.controlCornerOfPill` of the pill
 * height — the same math the dialogue control bar uses (§14 §4).
 */

import Phaser from "phaser";
import { COLOR, FONT } from "./theme";
import { VN_METRICS } from "../world/view/DialogueLayout";

/**
 * Split a HUD button label like `[ notebook — N ]` into its word and its
 * hotkey. The old flat labels carried both inline; the §14 pill renders the
 * word centered and the key as a dimmer suffix, so they are pulled apart here.
 * Anything that is not `[ word — KEY ]` comes back whole with no key.
 */
export function parseButtonLabel(raw: string): { readonly main: string; readonly key: string | null } {
  const inner = raw.replace(/^\[\s*/, "").replace(/\s*\]$/, "").trim();
  const parts = inner.split(/\s*[—·]\s*/);
  if (parts.length >= 2 && parts[1].trim()) return { main: parts[0].trim(), key: parts[1].trim() };
  return { main: inner, key: null };
}

/** §14 Utility-pill geometry, shared by `utilityPill` (which draws one) and
 * `utilityPillWidth` (which measures to pack a row). One source so the
 * measured width can never drift from the drawn width. */
export const PILL = { padX: 20, padY: 9, keyGap: 12, mainSize: "22px", keySize: "16px" } as const;

export interface UtilityPillOpts {
  /** Re-parents every part of the pill into a caller-owned Container instead
   * of leaving them loose on the scene display list. */
  readonly container?: Phaser.GameObjects.Container;
  /** Depth of the fill; the label sits one above it. Default 99/100 — the HUD
   * band `ModalFrame`'s callers have always drawn in. */
  readonly depth?: number;
  /** 0 (default) anchors top-left at `x` and grows rightward; 1 anchors
   * top-RIGHT at `x` and grows leftward, for a control flush to a panel edge. */
  readonly originX?: number;
  /** Mono label size override — the HUD row's 22px is too loud for a small
   * in-panel control like a close button. The hotkey suffix scales with it. */
  readonly fontSize?: string;
}

export interface UtilityPillParts {
  /** The fill/border Graphics — also the hit area, so this is what a caller
   * repositions or destroys if it only keeps one reference. */
  readonly background: Phaser.GameObjects.Graphics;
  /** Every object the pill created, fill first, for a caller that owns its
   * own destroy layer (`ModalFrame.layer`, `SatchelScene.layer`, …). */
  readonly objects: readonly Phaser.GameObjects.GameObject[];
  readonly width: number;
  readonly height: number;
}

/** The width `utilityPill` will render `label` at — same geometry, measured on
 * throwaway text so a row of variable-width pills can be packed before any is
 * placed. */
export function utilityPillWidth(scene: Phaser.Scene, label: string, fontSize?: string): number {
  const { padX, keyGap, mainSize, keySize } = PILL;
  const { main, key } = parseButtonLabel(label);
  const scale = fontSize ? parseFloat(fontSize) / parseFloat(mainSize) : 1;
  const m = scene.add.text(0, 0, main, { fontFamily: FONT.mono, fontSize: fontSize ?? mainSize });
  let w = m.width;
  m.destroy();
  if (key) {
    const k = scene.add.text(0, 0, key, {
      fontFamily: FONT.mono,
      fontSize: `${Math.round(parseFloat(keySize) * scale)}px`,
    });
    w += keyGap + k.width;
    k.destroy();
  }
  return w + padX * 2;
}

/** Draw one §14 Utility pill. See the file header for the palette contract. */
export function utilityPill(
  scene: Phaser.Scene,
  x: number,
  y: number,
  label: string,
  onClick: () => void,
  opts?: UtilityPillOpts,
): UtilityPillParts {
  const { main, key } = parseButtonLabel(label);
  const { padX, padY, keyGap, mainSize, keySize } = PILL;
  const mainSizePx = opts?.fontSize ?? mainSize;
  const scale = parseFloat(mainSizePx) / parseFloat(mainSize);
  const keySizePx = `${Math.round(parseFloat(keySize) * scale)}px`;
  const depth = opts?.depth ?? 99;

  const mainText = scene.add.text(0, 0, main, { fontFamily: FONT.mono, fontSize: mainSizePx, color: COLOR.gold });
  const keyText = key
    ? scene.add.text(0, 0, key, { fontFamily: FONT.mono, fontSize: keySizePx, color: COLOR.muted })
    : null;
  const textW = mainText.width + (keyText ? keyGap + keyText.width : 0);
  const w = textW + padX * 2;
  const h = mainText.height + padY * 2;
  const r = h * VN_METRICS.controlCornerOfPill;
  const left = x - w * (opts?.originX ?? 0);

  const bg = scene.add.graphics({ x: left, y }).setDepth(depth);
  const paint = (hover: boolean): void => {
    bg.clear();
    bg.fillStyle(hover ? COLOR.panelHover : COLOR.night, 0.9);
    bg.lineStyle(2, hover ? COLOR.emberNum : COLOR.goldNum, hover ? 0.9 : 0.35);
    bg.fillRoundedRect(0, 0, w, h, r);
    bg.strokeRoundedRect(0, 0, w, h, r);
  };
  paint(false);
  bg.setInteractive({
    hitArea: new Phaser.Geom.Rectangle(0, 0, w, h),
    hitAreaCallback: Phaser.Geom.Rectangle.Contains,
    useHandCursor: true,
  });

  mainText.setPosition(left + padX, y + padY).setDepth(depth + 1);
  keyText?.setPosition(left + padX + mainText.width + keyGap, y + (h - keyText.height) / 2).setDepth(depth + 1);

  bg.on("pointerover", () => {
    paint(true);
    mainText.setColor(COLOR.ember);
    keyText?.setColor(COLOR.gold);
  });
  bg.on("pointerout", () => {
    paint(false);
    mainText.setColor(COLOR.gold);
    keyText?.setColor(COLOR.muted);
  });
  bg.on("pointerdown", onClick);

  const objects: Phaser.GameObjects.GameObject[] = keyText ? [bg, mainText, keyText] : [bg, mainText];
  // Fill first so the labels stay on top inside the container, matching the
  // 99-under-100 order the loose (no-container) path renders in.
  if (opts?.container) objects.forEach((o) => opts.container!.add(o));
  return { background: bg, objects, width: w, height: h };
}
