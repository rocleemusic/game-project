/**
 * `RoomZoomModel` — the deliberate room zoom/pan (wireframe §8, "Zoom and
 * pan the room," decided revision 4). No Phaser here, same reason
 * `WorldView.test.ts` tests `PanModel` directly: this is the pure math a
 * headless browser drag/wheel simulation cannot exercise deterministically
 * (`HubScene`'s own `playtest/hub-room-zoom.mjs` covers the Phaser wiring —
 * this file is what backs its assertions when the environment is too noisy
 * for a reliable synthetic pointer sequence).
 */

import { describe, expect, it } from "vitest";
import {
  RoomZoomModel,
  ROOM_ZOOM_DEFAULT,
  ROOM_ZOOM_DEFAULT_OFFSET_Y,
  ROOM_ZOOM_MAX,
  ROOM_ZOOM_MIN,
} from "../src/world/view/RoomZoomModel";
import { panFit } from "../src/world/view/PanModel";

const W = 1920;
const H = 1080;
// A wide image (2400x1200, wider aspect than the 16:9 view) so the fit is
// width-bound and there is real vertical pan slack to assert against.
const IMG_W = 2400;
const IMG_H = 1200;

const model = () => {
  const m = new RoomZoomModel(W, H);
  m.fit(IMG_W, IMG_H);
  return m;
};

describe("RoomZoomModel", () => {
  it("starts at Fit — zoom 1, centred, not pannable", () => {
    const m = model();
    expect(m.zoom).toBe(ROOM_ZOOM_MIN);
    expect(m.offsetX).toBe(0);
    expect(m.offsetY).toBe(0);
    expect(m.pannable).toBe(false);
    expect(m.atFit).toBe(true);
    expect(m.percentLabel).toBe("100%");
  });

  it("fit()'s returned scale matches panFit at zoom 1 — the same cover-fit HubScene drew before this existed", () => {
    const m = new RoomZoomModel(W, H);
    const scale = m.fit(IMG_W, IMG_H);
    expect(scale).toBe(panFit(IMG_W, IMG_H, W, H, 1).scale);
    expect(m.scale).toBe(scale);
  });

  it("place() centres the backdrop at Fit, same shape as PanModel.place(0, 0)", () => {
    const m = model();
    expect(m.place()).toEqual({ x: W / 2, y: H / 2 });
  });

  it("roomLayerTransform is identity at Fit — the room container must not move pieces that were fine before zoom existed", () => {
    const m = model();
    const t = m.roomLayerTransform;
    expect(t).toEqual({ scale: 1, x: 0, y: 0 });
  });

  it("zoomAt at the exact view centre only changes scale, offset stays 0,0", () => {
    const m = model();
    const changed = m.zoomAt(W / 2, H / 2, 0.5);
    expect(changed).toBe(true);
    expect(m.zoom).toBeCloseTo(1.5);
    expect(m.offsetX).toBeCloseTo(0);
    expect(m.offsetY).toBeCloseTo(0);
    expect(m.pannable).toBe(true);
  });

  it("zoomAt clamps to ROOM_ZOOM_MAX and reports no-op once already there", () => {
    const m = model();
    m.zoomAt(W / 2, H / 2, 50);
    expect(m.zoom).toBe(ROOM_ZOOM_MAX);
    const changed = m.zoomAt(W / 2, H / 2, 1);
    expect(changed).toBe(false);
    expect(m.zoom).toBe(ROOM_ZOOM_MAX);
  });

  it("zoomAt never goes below ROOM_ZOOM_MIN (Fit) even asked to zoom out further", () => {
    const m = model();
    const changed = m.zoomAt(W / 2, H / 2, -0.5);
    expect(changed).toBe(false);
    expect(m.zoom).toBe(ROOM_ZOOM_MIN);
  });

  it("cursor-centered zoom: the room-space point under the pointer does not move", () => {
    const m = model();
    // A point off-centre, inside the vertical slack this image's aspect gives.
    const px = W * 0.7;
    const py = H * 0.25;

    // The room-space point under the pointer before zooming (zoom=1, offset 0,0
    // at this stage, so room-space == screen-space here).
    const roomXBefore = px;
    const roomYBefore = py;

    m.zoomAt(px, py, 0.8);
    expect(m.zoom).toBeCloseTo(1.8);

    // Recover the room-space point under the SAME screen pixel after zooming,
    // using the model's own roomLayerTransform (the formula HubScene's pieces
    // are placed by) — it must equal what was there before.
    const t = m.roomLayerTransform;
    const roomXAfter = (px - t.x) / t.scale;
    const roomYAfter = (py - t.y) / t.scale;
    expect(roomXAfter).toBeCloseTo(roomXBefore, 6);
    expect(roomYAfter).toBeCloseTo(roomYBefore, 6);
  });

  it("panTo clamps to the current slack and is a no-op at Fit", () => {
    const m = model();
    // At Fit there is no slack — panTo must not move anything.
    m.panTo(500, 500);
    expect(m.offsetX).toBe(0);
    expect(m.offsetY).toBe(0);

    m.zoomAt(W / 2, H / 2, 1); // zoom 2 — plenty of vertical slack on this image
    const bigOffset = 999999;
    m.panTo(bigOffset, bigOffset);
    const { maxX, maxY } = panFit(IMG_W, IMG_H, W, H, m.zoom);
    expect(m.offsetX).toBeCloseTo(maxX);
    expect(m.offsetY).toBeCloseTo(maxY);
  });

  it("reset() returns to Fit from anywhere — the 'Fit — Esc' escape hatch", () => {
    const m = model();
    m.zoomAt(W * 0.8, H * 0.2, 1.5);
    m.panTo(40, 40);
    expect(m.pannable).toBe(true);
    m.reset();
    expect(m.zoom).toBe(ROOM_ZOOM_MIN);
    expect(m.offsetX).toBe(0);
    expect(m.offsetY).toBe(0);
    expect(m.pannable).toBe(false);
  });

  // T7 (Roc, 2026-08-23): the Home Hub opens zoomed in and nudged down, so a
  // caller can ask for an opening view that is not Fit. Every test above uses
  // the no-argument constructor and so still describes the Fit-on-entry case
  // unchanged — that is the point of defaulting rather than switching.
  describe("opening view (initialZoom / initialOffsetY)", () => {
    const hub = () => {
      const m = new RoomZoomModel(W, H, ROOM_ZOOM_DEFAULT, ROOM_ZOOM_DEFAULT_OFFSET_Y);
      m.fit(IMG_W, IMG_H);
      return m;
    };

    it("opens at the requested zoom and pan, and calls that state atDefault", () => {
      const m = hub();
      expect(m.zoom).toBe(ROOM_ZOOM_DEFAULT);
      expect(m.offsetX).toBe(0);
      expect(m.offsetY).toBe(ROOM_ZOOM_DEFAULT_OFFSET_Y);
      expect(m.atDefault).toBe(true);
      expect(m.defaultZoom).toBe(ROOM_ZOOM_DEFAULT);
      // Opening zoomed means opening PANNABLE — which is exactly why Esc in
      // `HubScene` had to stop gating on `pannable` and start gating on
      // `atDefault`, or the first Esc would have been a no-op forever.
      expect(m.pannable).toBe(true);
    });

    it("atDefault goes false on any move and true again after reset()", () => {
      const m = hub();
      m.zoomAt(W * 0.8, H * 0.2, 0.5);
      expect(m.atDefault).toBe(false);
      m.panTo(40, 40);
      expect(m.atDefault).toBe(false);
      m.reset();
      expect(m.zoom).toBe(ROOM_ZOOM_DEFAULT);
      expect(m.offsetY).toBe(ROOM_ZOOM_DEFAULT_OFFSET_Y);
      expect(m.atDefault).toBe(true);
    });

    it("can still be zoomed all the way out to Fit by hand", () => {
      const m = hub();
      m.zoomAt(W / 2, H / 2, -10);
      expect(m.zoom).toBe(ROOM_ZOOM_MIN);
      expect(m.atFit).toBe(true);
      expect(m.atDefault).toBe(false);
    });

    it("an opening pan larger than the slack is clamped, and atDefault still holds there", () => {
      // The point of clamping in `fit()`: an unreachable opening offset would
      // leave `atDefault` permanently false and strand the "Reset view" pill
      // on screen with nothing to do.
      const m = new RoomZoomModel(W, H, ROOM_ZOOM_DEFAULT, 99999);
      m.fit(IMG_W, IMG_H);
      const { maxY } = panFit(IMG_W, IMG_H, W, H, ROOM_ZOOM_DEFAULT);
      expect(m.offsetY).toBeCloseTo(maxY);
      expect(m.atDefault).toBe(true);
    });
  });

  it("percentLabel matches the mockup's own readout shape", () => {
    const m = model();
    m.zoomAt(W / 2, H / 2, 0.65);
    expect(m.percentLabel).toBe("165%");
  });

  it("zoomAt/fit before any fit() call are no-ops, never NaN", () => {
    const m = new RoomZoomModel(W, H);
    const changed = m.zoomAt(W / 2, H / 2, 1);
    expect(changed).toBe(false);
    expect(m.zoom).toBe(ROOM_ZOOM_MIN);
  });
});
