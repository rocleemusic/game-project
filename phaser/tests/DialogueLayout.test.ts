/**
 * The pure geometry behind the VN dialogue layout.
 *
 * These are the four ways the layout can be wrong in a way that still compiles,
 * still runs, and still looks fine on the one line someone happened to test:
 *
 *   NARRATION vs DIALOGUE — narration is left-aligned with no nameplate and no
 *     sprite. Rendering it centred with a plate is the most likely regression,
 *     because "dialogue" is the case anyone writing this code has in front of
 *     them.
 *   1 CHOICE vs 5 — the stack grows UPWARD, away from the box, so the failure
 *     only appears when a screen happens to author five moves.
 *   LONG SPEAKER NAMES — soul ids are short today. A plate sized purely by its
 *     text out-spans its own box the first time one is not.
 *   OVERFLOWING TEXT — authored prose is rendered verbatim or not at all, so an
 *     over-long line must page, never truncate.
 *
 * No Phaser here, deliberately: measurements are passed in as numbers, which is
 * the whole reason the geometry was split out of `DialogueSystem`.
 */

import { describe, expect, it } from "vitest";
import {
  VN_METRICS,
  bodyTextLayout,
  choiceStackLayout,
  controlBarLayout,
  dialogueBoxRect,
  nameplateLayout,
  advanceCaretLayout,
  backlogLayout,
  paginateLines,
  pillCornerRadius,
  rectBottom,
  rectCenter,
  soulDisplayName,
  spritePlacement,
  vnFontPx,
  type Rect,
  type ViewSize,
} from "../src/world/view/DialogueLayout";

/** The shipped canvas — fixed 1920x1080 with Scale.FIT (see `main.ts`). */
const VIEW: ViewSize = { width: 1920, height: 1080 };
/** A deliberately different aspect, to catch anything hard-coded to 16:9. */
const NARROW: ViewSize = { width: 1024, height: 900 };

function overlaps(a: Rect, b: Rect): boolean {
  return a.y < rectBottom(b) && b.y < rectBottom(a);
}

describe("the dialogue box", () => {
  it("is bottom-centre at ~65% width", () => {
    const box = dialogueBoxRect(VIEW);
    expect(box.w / VIEW.width).toBeCloseTo(0.64, 2);
    expect(rectCenter(box).x).toBeCloseTo(VIEW.width / 2, 5);
    // Floated off the bottom edge — the control bar lives in that gap.
    expect(rectBottom(box)).toBeLessThan(VIEW.height);
    expect(rectBottom(box)).toBeGreaterThan(VIEW.height * 0.9);
  });

  it("scales with the view rather than assuming 1920x1080", () => {
    const box = dialogueBoxRect(NARROW);
    expect(box.w / NARROW.width).toBeCloseTo(0.64, 2);
    expect(rectCenter(box).x).toBeCloseTo(NARROW.width / 2, 5);
  });

  it("leaves the control bar clear of the box", () => {
    const box = dialogueBoxRect(VIEW);
    const bar = controlBarLayout(VIEW, [60, 50, 45, 90, 80]);
    expect(bar.buttons[0].y).toBeGreaterThanOrEqual(rectBottom(box));
    expect(rectBottom(bar.buttons[4])).toBeLessThanOrEqual(VIEW.height);
  });
});

describe("narration vs dialogue", () => {
  const box = dialogueBoxRect(VIEW);

  it("centres dialogue and left-aligns narration", () => {
    const spoken = bodyTextLayout(VIEW, box, "dialogue");
    const narrated = bodyTextLayout(VIEW, box, "narration");

    expect(spoken.align).toBe("center");
    expect(spoken.originX).toBe(0.5);
    expect(spoken.x).toBeCloseTo(rectCenter(box).x, 5);

    expect(narrated.align).toBe("left");
    expect(narrated.originX).toBe(0);
    expect(narrated.x).toBeGreaterThan(box.x);
    expect(narrated.x).toBeLessThan(rectCenter(box).x);
  });

  it("gives both variants the same wrap width and the same box", () => {
    // The two variants differ in ALIGNMENT only. If narration ever got a
    // narrower column the two would read as different panels.
    const spoken = bodyTextLayout(VIEW, box, "dialogue");
    const narrated = bodyTextLayout(VIEW, box, "narration");
    expect(narrated.wrapWidth).toBe(spoken.wrapWidth);
    expect(narrated.y).toBe(spoken.y);
    expect(narrated.maxLines).toBe(spoken.maxLines);
  });

  it("keeps the text inside the box at every page size", () => {
    // The block is anchored on the box's centre line, so "inside the box" has to
    // hold for a one-line page and for a full one — the two ends move in
    // opposite directions.
    const probe = bodyTextLayout(VIEW, box, "narration");
    expect(probe.wrapWidth).toBeLessThan(box.w);
    for (let lines = 1; lines <= probe.maxLines; lines++) {
      const layout = bodyTextLayout(VIEW, box, "narration", lines);
      expect(layout.y).toBeGreaterThan(box.y);
      expect(layout.y + layout.blockHeight).toBeLessThanOrEqual(rectBottom(box));
    }
  });

  it("budgets for the real height of a line, not just its font size", () => {
    const layout = bodyTextLayout(VIEW, box, "dialogue", 1);
    const font = vnFontPx(VIEW);
    expect(layout.lineHeight).toBeGreaterThan(font.body + layout.lineGap);
    const full = bodyTextLayout(VIEW, box, "dialogue", layout.maxLines);
    const drawn =
      layout.maxLines * font.body * VN_METRICS.lineBoxOfFont +
      (layout.maxLines - 1) * layout.lineGap;
    expect(full.blockHeight).toBeCloseTo(drawn, 5);
    expect(full.y + drawn).toBeLessThanOrEqual(rectBottom(box));
  });

  it("always leaves room for at least one line, even in a squashed view", () => {
    const tiny: ViewSize = { width: 640, height: 200 };
    expect(bodyTextLayout(tiny, dialogueBoxRect(tiny), "dialogue").maxLines).toBeGreaterThanOrEqual(1);
  });

  it("does not send a block too tall for the box upward out of the panel", () => {
    // A view squashed until the padding eats the box: the clamp's two bounds
    // cross, and an unguarded `Math.min(Math.max(...))` would return the LOWER
    // one and lift the text clear of the panel.
    const tiny: ViewSize = { width: 640, height: 200 };
    const tinyBox = dialogueBoxRect(tiny);
    const layout = bodyTextLayout(tiny, tinyBox, "dialogue", 6);
    expect(layout.y).toBeGreaterThanOrEqual(tinyBox.y);
  });
});

describe("the body block sits where the reference puts it", () => {
  const box = dialogueBoxRect(VIEW);

  it("centres a single line near the middle of the box, not at its top", () => {
    // Measured off `talking to npc.jpg` and `when-alone-...jpg`: the glyph box
    // of a one-line message centres at 0.377 and 0.381 of box height. Top
    // anchoring put it at ~0.20 and left the panel reading two-thirds empty.
    const layout = bodyTextLayout(VIEW, box, "dialogue", 1);
    const centre = layout.y + layout.blockHeight / 2;
    expect((centre - box.y) / box.h).toBeCloseTo(0.38, 2);
    expect(centre).toBeGreaterThan(box.y + box.h * 0.3);
  });

  it("grows a page upward and downward around that anchor", () => {
    const one = bodyTextLayout(VIEW, box, "dialogue", 1);
    const two = bodyTextLayout(VIEW, box, "dialogue", 2);
    expect(two.blockHeight).toBeGreaterThan(one.blockHeight);
    expect(two.y).toBeLessThan(one.y);
    expect(two.y + two.blockHeight).toBeGreaterThan(one.y + one.blockHeight);
  });

  it("counts gaps between lines, never after the last one", () => {
    const one = bodyTextLayout(VIEW, box, "dialogue", 1);
    expect(one.blockHeight).toBeCloseTo(one.lineHeight - one.lineGap, 5);
    const three = bodyTextLayout(VIEW, box, "dialogue", 3);
    expect(three.blockHeight).toBeCloseTo(3 * one.blockHeight + 2 * one.lineGap, 5);
  });

  it("clamps a full page below the top padding instead of overflowing", () => {
    const probe = bodyTextLayout(VIEW, box, "narration");
    const full = bodyTextLayout(VIEW, box, "narration", probe.maxLines);
    expect(full.y).toBeGreaterThanOrEqual(
      box.y + VIEW.height * VN_METRICS.boxPadYOfView - 0.001,
    );
  });

  it("treats a degenerate page count as one line", () => {
    const one = bodyTextLayout(VIEW, box, "dialogue", 1);
    for (const n of [0, -4, 0.5]) {
      expect(bodyTextLayout(VIEW, box, "dialogue", n).y).toBeCloseTo(one.y, 5);
    }
  });
});

describe("the nameplate", () => {
  const box = dialogueBoxRect(VIEW);

  it("straddles the box's top edge, centred", () => {
    const plate = nameplateLayout(VIEW, box, 180).rect;
    expect(rectCenter(plate).x).toBeCloseTo(rectCenter(box).x, 5);
    // Mostly above the edge, dipping into the box — not floating clear of it,
    // and not sunk inside it.
    expect(plate.y).toBeLessThan(box.y);
    expect(rectBottom(plate)).toBeGreaterThan(box.y);
    expect(rectBottom(plate) - box.y).toBeCloseTo(plate.h * VN_METRICS.nameOverlap, 5);
  });

  it("is bisected by the edge, not perched on it", () => {
    // Measured on `talking to npc.jpg`: the plate scans y=504..541 and the box's
    // top border at y=524, so 17 of 37px — 0.46 — is inside. A quarter dip still
    // straddles the edge and still passes the test above, but it reads as a tab
    // sitting on the panel rather than a plate set into it.
    const plate = nameplateLayout(VIEW, box, 180).rect;
    const inside = (rectBottom(plate) - box.y) / plate.h;
    expect(inside).toBeGreaterThan(0.4);
    expect(inside).toBeLessThan(0.55);
  });

  it("holds a minimum width for a short name", () => {
    const short = nameplateLayout(VIEW, box, 10);
    expect(short.rect.w).toBeCloseTo(VIEW.width * VN_METRICS.nameMinWidthOfView, 5);
    expect(short.clamped).toBe(false);
    expect(short.textScale).toBe(1);
  });

  it("grows with a longer name", () => {
    const eleanor = nameplateLayout(VIEW, box, 200);
    const longer = nameplateLayout(VIEW, box, 420);
    expect(longer.rect.w).toBeGreaterThan(eleanor.rect.w);
    expect(longer.clamped).toBe(false);
  });

  it("never out-spans its own box, and shrinks the name instead", () => {
    // `narrator_of_the_long_forest_road` at display size.
    const absurd = nameplateLayout(VIEW, box, 4000);
    expect(absurd.rect.w).toBeLessThanOrEqual(box.w * VN_METRICS.nameMaxWidthOfBox);
    expect(absurd.rect.x).toBeGreaterThanOrEqual(box.x);
    expect(rectBottom(absurd.rect)).toBeLessThan(rectBottom(box));
    expect(absurd.clamped).toBe(true);
    // Scaled to fit, not clipped: the name still renders in full.
    expect(absurd.textScale).toBeLessThan(1);
    expect(4000 * absurd.textScale).toBeCloseTo(absurd.textMaxWidth, 5);
  });

  it("stays centred at every width", () => {
    for (const measured of [0, 10, 200, 900, 4000]) {
      const plate = nameplateLayout(VIEW, box, measured).rect;
      expect(rectCenter(plate).x).toBeCloseTo(rectCenter(box).x, 5);
    }
  });
});

describe("the choice stack", () => {
  const box = dialogueBoxRect(VIEW);

  it("renders nothing for no choices", () => {
    expect(choiceStackLayout(VIEW, box, 0).pills).toEqual([]);
    expect(choiceStackLayout(VIEW, box, 0).compressed).toBe(false);
  });

  it("puts one choice directly above the box, centred", () => {
    const stack = choiceStackLayout(VIEW, box, 1);
    expect(stack.pills).toHaveLength(1);
    const pill = stack.pills[0];
    expect(rectCenter(pill).x).toBeCloseTo(rectCenter(box).x, 5);
    expect(rectBottom(pill)).toBeLessThan(box.y);
    expect(pill.w).toBeLessThan(box.w);
    expect(stack.compressed).toBe(false);
  });

  it("stacks five choices upward, in order, without overlapping", () => {
    const stack = choiceStackLayout(VIEW, box, 5);
    expect(stack.pills).toHaveLength(5);
    for (let i = 1; i < stack.pills.length; i++) {
      // Order preserved: index 0 is the top pill.
      expect(stack.pills[i].y).toBeGreaterThan(stack.pills[i - 1].y);
      expect(overlaps(stack.pills[i], stack.pills[i - 1])).toBe(false);
      expect(stack.pills[i].x).toBeCloseTo(stack.pills[0].x, 5);
      expect(stack.pills[i].w).toBeCloseTo(stack.pills[0].w, 5);
    }
  });

  it("never covers the box — the prompting line stays readable underneath", () => {
    for (const n of [1, 2, 3, 4, 5, 8]) {
      for (const pill of choiceStackLayout(VIEW, box, n).pills) {
        expect(rectBottom(pill)).toBeLessThanOrEqual(box.y);
      }
    }
  });

  it("compresses rather than climbing off the top of the screen", () => {
    // Twenty is past anything authored, which is exactly when a layout that
    // only grows upward silently walks off the canvas.
    const many = choiceStackLayout(VIEW, box, 20);
    expect(many.compressed).toBe(true);
    expect(many.pills[0].y).toBeGreaterThanOrEqual(
      VIEW.height * VN_METRICS.choiceTopMarginOfView - 0.001,
    );
    for (let i = 1; i < many.pills.length; i++) {
      expect(overlaps(many.pills[i], many.pills[i - 1])).toBe(false);
    }
    expect(many.pillHeight).toBeLessThan(choiceStackLayout(VIEW, box, 2).pillHeight);
  });

  it("does not compress a stack that already fits", () => {
    expect(choiceStackLayout(VIEW, box, 5).pillHeight).toBeCloseTo(
      VIEW.height * VN_METRICS.choiceHeightOfView,
      5,
    );
  });

  it("floats the stack clear of the box rather than resting on it", () => {
    // Measured on `choices.jpg`: the lowest pill's bottom border is at y=405 and
    // the box's top border at y=522 on a 716px capture — 0.163 of the view. At
    // the earlier 0.05 the pills nearly touched the panel and the two elements
    // read as one stacked slab.
    for (const n of [1, 3, 5]) {
      const stack = choiceStackLayout(VIEW, box, n);
      const clearance = box.y - rectBottom(stack.pills[n - 1]);
      expect(clearance / VIEW.height).toBeCloseTo(0.16, 2);
      expect(clearance).toBeGreaterThan(VIEW.height * 0.1);
    }
  });

  it("keeps adjacent pills nearly flush, as one segmented control", () => {
    // `choices.jpg`: "Go right" ends at y=353 and "Go left" begins at y=355. A
    // visible gap turns one control into two floating buttons.
    const stack = choiceStackLayout(VIEW, box, 2);
    expect(stack.gap).toBeGreaterThan(0);
    expect(stack.gap).toBeLessThan(stack.pillHeight * 0.1);
    expect(stack.pills[1].y - rectBottom(stack.pills[0])).toBeCloseTo(stack.gap, 5);
  });
});

describe("overflowing text", () => {
  const box = dialogueBoxRect(VIEW);
  const layout = bodyTextLayout(VIEW, box, "dialogue");

  it("fits a short line on one page", () => {
    const pages = paginateLines(["I guess we won't find a rare bird so quickly, right?"], layout.maxLines);
    expect(pages).toHaveLength(1);
  });

  it("pages a line too long for the box instead of truncating it", () => {
    const lines = Array.from({ length: 11 }, (_, i) => `line ${i}`);
    const pages = paginateLines(lines, 3);
    expect(pages).toHaveLength(4);
    for (const page of pages) expect(page.length).toBeLessThanOrEqual(3);
    // Nothing dropped, nothing reordered — authored prose renders verbatim.
    expect(pages.flat()).toEqual(lines);
  });

  it("survives a degenerate line budget", () => {
    expect(paginateLines(["a", "b"], 0)).toEqual([["a"], ["b"]]);
    expect(paginateLines([], 4)).toEqual([[]]);
  });

  it("uses the real box budget, which is more than one line", () => {
    expect(layout.maxLines).toBeGreaterThan(1);
    expect(paginateLines(Array.from({ length: 40 }, (_, i) => `${i}`), layout.maxLines).flat()).toHaveLength(40);
  });
});

describe("the control bar", () => {
  it("centres the row and keeps reference order", () => {
    const widths = [60, 50, 45, 100, 85];
    const bar = controlBarLayout(VIEW, widths);
    expect(bar.buttons).toHaveLength(5);
    const left = bar.buttons[0].x;
    const rowRight = bar.buttons[4].x + bar.buttons[4].w;
    expect((left + rowRight) / 2).toBeCloseTo(VIEW.width / 2, 5);
    for (let i = 1; i < bar.buttons.length; i++) {
      expect(bar.buttons[i].x).toBeGreaterThan(
        bar.buttons[i - 1].x + bar.buttons[i - 1].w - 0.001,
      );
    }
  });

  it("gives every button the same width, sized to the widest label", () => {
    // The reference row scans at 106px for all five pills on all four captures,
    // for labels running from three characters (`Log`) to seven (`Options`).
    // Per-label widths made `Log` two-thirds the width of `Hide UI`.
    const bar = controlBarLayout(VIEW, [40, 35, 30, 200, 180]);
    const padX = VIEW.width * VN_METRICS.controlPadXOfView;
    expect(bar.buttonWidth).toBeCloseTo(200 + padX * 2, 5);
    for (const button of bar.buttons) expect(button.w).toBeCloseTo(bar.buttonWidth, 5);
    expect(new Set(bar.buttons.map((b) => Math.round(b.w))).size).toBe(1);
  });

  it("keeps the widest label inside its own pill", () => {
    const widest = 200;
    const bar = controlBarLayout(VIEW, [40, widest]);
    expect(bar.buttonWidth).toBeGreaterThan(widest);
  });

  it("spaces the row evenly, so the pitch is one width plus one gap", () => {
    const bar = controlBarLayout(VIEW, [40, 35, 30, 200, 180]);
    const pitch = bar.buttons[1].x - bar.buttons[0].x;
    for (let i = 1; i < bar.buttons.length; i++) {
      expect(bar.buttons[i].x - bar.buttons[i - 1].x).toBeCloseTo(pitch, 5);
    }
    expect(pitch).toBeCloseTo(
      bar.buttonWidth + VIEW.width * VN_METRICS.controlGapOfView,
      5,
    );
  });

  it("handles an empty bar without producing NaN", () => {
    const bar = controlBarLayout(VIEW, []);
    expect(bar.buttons).toEqual([]);
    expect(Number.isFinite(bar.centerY)).toBe(true);
    expect(Number.isFinite(bar.buttonWidth)).toBe(true);
  });

  it("does not collapse a pill on a degenerate measurement", () => {
    const bar = controlBarLayout(VIEW, [-50, 0]);
    expect(bar.buttonWidth).toBeGreaterThan(0);
    expect(bar.buttons[0].w).toBeCloseTo(bar.buttons[1].w, 5);
  });
});

describe("the sprite", () => {
  it("is centred, bottom-anchored, and capped short of full view height", () => {
    // Roc, 2026-08-17: flush against the top edge read as the backdrop being
    // gone. `spriteTopPadOfView` leaves that share of the view clear above
    // the figure's head; the origin (bottom edge) is unchanged.
    const place = spritePlacement(VIEW, 1440);
    expect(place.x).toBe(VIEW.width / 2);
    expect(place.y).toBe(VIEW.height);
    expect(place.originY).toBe(1);
    expect(1440 * place.scale).toBeCloseTo(
      VIEW.height * (1 - VN_METRICS.spriteTopPadOfView),
      5,
    );
  });

  it("does not divide by zero on a degenerate texture", () => {
    expect(spritePlacement(VIEW, 0).scale).toBe(1);
  });

  it("clamps a landscape source by width instead of spanning the screen", () => {
    // The backdrops in this project run to 2000x1333. Height-fitting that gives
    // a ~1620-wide figure that reaches under the whole box.
    const place = spritePlacement(VIEW, 1333, 2000);
    expect(2000 * place.scale).toBeCloseTo(
      VIEW.width * VN_METRICS.spriteMaxWidthOfView,
      5,
    );
    expect(1333 * place.scale).toBeLessThan(VIEW.height);
  });

  it("leaves a portrait alone — height still leads", () => {
    const withWidth = spritePlacement(VIEW, 1440, 700);
    expect(withWidth.scale).toBeCloseTo(spritePlacement(VIEW, 1440).scale, 5);
  });

  it("ignores a degenerate width rather than collapsing the figure", () => {
    expect(spritePlacement(VIEW, 1440, 0).scale).toBeCloseTo(
      spritePlacement(VIEW, 1440).scale,
      5,
    );
  });
});

describe("type sizes", () => {
  it("scale with the view", () => {
    expect(vnFontPx(VIEW).body).toBeGreaterThan(vnFontPx(NARROW).body);
    for (const px of Object.values(vnFontPx(VIEW))) expect(px).toBeGreaterThan(0);
  });
});


describe("choice pills sized to their labels", () => {
  const box = dialogueBoxRect(VIEW);

  it("gives a two-line label a taller pill than a one-line one", () => {
    const stack = choiceStackLayout(VIEW, box, [1, 2, 3]);
    expect(stack.pills[1].h).toBeGreaterThan(stack.pills[0].h);
    expect(stack.pills[2].h).toBeGreaterThan(stack.pills[1].h);
    // Each further line adds the same amount, so the growth is linear and a
    // four-line label cannot quietly outrun its pill.
    expect(stack.pills[1].h - stack.pills[0].h).toBeCloseTo(stack.extraLineHeight, 5);
    expect(stack.pills[2].h - stack.pills[1].h).toBeCloseTo(stack.extraLineHeight, 5);
  });

  it("still stacks in order without overlapping when the pills differ", () => {
    const stack = choiceStackLayout(VIEW, box, [3, 1, 2, 1, 4]);
    for (let i = 1; i < stack.pills.length; i++) {
      expect(stack.pills[i].y).toBeGreaterThan(stack.pills[i - 1].y);
      expect(overlaps(stack.pills[i], stack.pills[i - 1])).toBe(false);
    }
    for (const pill of stack.pills) {
      expect(rectBottom(pill)).toBeLessThanOrEqual(box.y);
    }
  });

  it("treats a bare count as one line each", () => {
    const counted = choiceStackLayout(VIEW, box, 3);
    const listed = choiceStackLayout(VIEW, box, [1, 1, 1]);
    expect(listed.pills).toEqual(counted.pills);
  });

  it("compresses a stack of long labels rather than climbing off the screen", () => {
    const many = choiceStackLayout(VIEW, box, [3, 3, 3, 3, 3, 3, 3, 3]);
    expect(many.compressed).toBe(true);
    expect(many.pills[0].y).toBeGreaterThanOrEqual(
      VIEW.height * VN_METRICS.choiceTopMarginOfView - 0.001,
    );
    for (let i = 1; i < many.pills.length; i++) {
      expect(overlaps(many.pills[i], many.pills[i - 1])).toBe(false);
    }
    // Compression scales the pills together, so a three-line pill is still
    // taller than a one-line one would have been at the same scale.
    expect(many.extraLineHeight).toBeLessThan(
      VIEW.height * VN_METRICS.choiceLineHeightOfView,
    );
  });

  it("ignores a degenerate line count instead of shrinking a pill", () => {
    const stack = choiceStackLayout(VIEW, box, [0, -3, 1]);
    expect(stack.pills[0].h).toBeCloseTo(stack.pills[2].h, 5);
    expect(stack.pills[1].h).toBeCloseTo(stack.pills[2].h, 5);
  });

  it("never rounds a corner past the pill it is rounding", () => {
    const stack = choiceStackLayout(VIEW, box, [1, 3]);
    for (const pill of stack.pills) {
      const r = pillCornerRadius(pill, stack.cornerRadius);
      expect(r).toBeLessThanOrEqual(pill.h / 2);
      expect(r).toBeLessThanOrEqual(pill.w / 2);
      expect(r).toBeGreaterThanOrEqual(0);
    }
    expect(pillCornerRadius({ x: 0, y: 0, w: 4, h: 4 }, 999)).toBe(2);
  });
});

describe("the advance caret", () => {
  const box = dialogueBoxRect(VIEW);

  it("sits inside the box's bottom-right corner", () => {
    const caret = advanceCaretLayout(VIEW, box);
    expect(caret.x).toBeGreaterThan(rectCenter(box).x);
    expect(caret.x + caret.size / 2).toBeLessThanOrEqual(box.x + box.w);
    expect(caret.y).toBeGreaterThan(rectCenter(box).y);
    expect(caret.y + caret.size / 2).toBeLessThanOrEqual(rectBottom(box));
  });

  it("scales with the view like everything else", () => {
    expect(advanceCaretLayout(NARROW, dialogueBoxRect(NARROW)).size).toBeLessThan(
      advanceCaretLayout(VIEW, box).size,
    );
  });
});

describe("the backlog panel", () => {
  it("stops short of the control bar, so the same button can close it", () => {
    const layout = backlogLayout(VIEW);
    const bar = controlBarLayout(VIEW, [60, 50, 45, 90, 80]);
    expect(rectBottom(layout.panel)).toBeLessThanOrEqual(bar.buttons[0].y);
    expect(layout.panel.y).toBeGreaterThan(0);
    expect(rectCenter(layout.panel).x).toBeCloseTo(VIEW.width / 2, 5);
  });

  it("always has room for at least one line", () => {
    for (const view of [VIEW, NARROW, { width: 640, height: 200 }]) {
      expect(backlogLayout(view).maxLines).toBeGreaterThanOrEqual(1);
    }
  });

  it("budgets for the real height of a line, not just its font size", () => {
    // Type does not occupy `fontSize` pixels. Budgeting as `fontSize + gap`
    // over-counts, and the last lines of a full backlog render past the panel.
    const layout = backlogLayout(VIEW);
    expect(layout.lineHeight).toBeGreaterThan(layout.fontPx + layout.lineGap);
    const drawn =
      layout.maxLines * layout.fontPx * VN_METRICS.lineBoxOfFont +
      (layout.maxLines - 1) * layout.lineGap;
    expect(layout.textY + drawn).toBeLessThanOrEqual(rectBottom(layout.panel));
  });
});

describe("a soul id rendered as a name", () => {
  it("title-cases the ids the graph actually carries", () => {
    expect(soulDisplayName("mara")).toBe("Mara");
    expect(soulDisplayName("toby")).toBe("Toby");
    expect(soulDisplayName("old_wren")).toBe("Old Wren");
    expect(soulDisplayName("narrator-of-the-road")).toBe("Narrator Of The Road");
  });

  it("leaves a name that is already a name alone", () => {
    expect(soulDisplayName("Eleanor")).toBe("Eleanor");
    expect(soulDisplayName("McRae")).toBe("McRae");
  });

  it("does not turn an empty id into an empty plate silently", () => {
    expect(soulDisplayName("")).toBe("");
    expect(soulDisplayName("   ")).toBe("   ");
  });
});
