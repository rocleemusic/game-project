/**
 * `EditModeSystem`, mounted not shelved — mode5 plan step 8, scoped to
 * hotspot drawing only (Roc, 2026-08-17; see that class's own header for why
 * lock toggle and story-beat insertion are explicitly NOT built here).
 *
 * FIRST MOUNTED ON `ScreenScene` (mode 1), then moved to `CollectScene`
 * (mode5) the same day — this is THE MODE5 PLAN, and mode 1 is supposed to
 * stay untouched by it (`plans/2026-08-17-mode5-srp-merge-plan.md` says so
 * repeatedly). Activation now matches every other system this plan added:
 * `"edit-mode"` in `MODE5.systems`, checked by `CollectScene`, same shape as
 * `save`/`receiver-states`/`vfx`.
 *
 * Same technique as the other mount tests: a Phaser scene cannot be
 * imported into vitest, so the mount is asserted from source text.
 *
 * GP-203 (2026-08-24) added the move palette — a second kind, a second session
 * map, a two-map export. Most of that is still source-text, for the same
 * reason. The one exception is the last block: `exitMoveInputs` is pure, it is
 * the piece that decides WHICH KEY a drawn move rect is filed under, and a
 * wrong answer there fails silently (the box just stays on its fallback), so it
 * is imported and run.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
// The ONE thing in this feature that is pure enough to run rather than grep:
// the derivation the editor's move palette and `MoveRegions` now share.
import { exitMoveInputs, moveTargetName } from "../src/world/view/MoveRegionPlacement";
import type { PlayChoice } from "@lantern/lib/play";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readText = (p: string) => fs.readFileSync(path.join(root, p), "utf8");

describe("EditModeSystem is mounted, not shelved", () => {
  const editMode = readText("src/render/EditModeSystem.ts");
  const collectScene = readText("src/scenes/CollectScene.ts");
  const screenScene = readText("src/scenes/ScreenScene.ts");
  const modesSource = readText("src/mode/modes.ts");

  it("owns toggle/draw and uses the pure RegionExport math rather than reimplementing it", () => {
    expect(editMode).toContain("class EditModeSystem");
    expect(editMode).toContain("toggle(");
    expect(editMode).toContain("draw(screen");
    expect(editMode).toContain("get isActive()");
    expect(editMode).toContain("pixelDragToRegionRect(");
    // GP-203: was two inline `mergeRegions` calls; the two-map shape is a
    // function now so `RegionExport.test.ts` can test it for real.
    expect(editMode).toContain("regionsFilePayload(");
  });

  it("turns on via MODE5.systems, the same shape as save/receiver-states/vfx", () => {
    const mode5Block = /export const MODE5[\s\S]*?\n};/.exec(modesSource)?.[0] ?? "";
    expect(mode5Block).toMatch(/systems:\s*\[[^\]]*"edit-mode"[^\]]*\]/);
    for (const id of ["DAYLIFE", "COLLECT", "DISCOVER_HOME"]) {
      const block = new RegExp(`export const ${id}[\\s\\S]*?\\n};`).exec(modesSource)?.[0] ?? "";
      expect(block).not.toMatch(/"edit-mode"/);
    }
  });

  it("CollectScene constructs it gated on the descriptor, not a URL flag", () => {
    expect(collectScene).toContain("new EditModeSystem(");
    expect(collectScene).toContain('this.mode.systems.includes("edit-mode")');
    expect(collectScene).toContain("private editMode: EditModeSystem | null = null");
  });

  it("wires Shift+E AND a HUD button, both delegating to the same toggle", () => {
    // WAS BARE `E`. T14 §1b (ruled 2026-08-24) put a player-facing "End day ·
    // E" pill on the HUD bar, and a shipped control outranks an authoring
    // overlay for a bare letter — so the editor moved to Shift+E and its dev
    // pill's caption moved with it. Both still hang off ONE `keydown-E`
    // listener each, split on `shiftKey`, so a single press can never fire
    // both (`render/HudBar.ts` holds the other side of that guard).
    expect(collectScene).toContain("keydown-E");
    expect(collectScene).toContain("if (e.shiftKey) toggleEdit()");
    expect(collectScene).toContain("[ Edit — Shift+E ]");
    expect(collectScene).toContain("this.editMode?.toggle()");
  });

  it("render() draws it whenever a screen is on, using the same declared-∪-shaped id resolution as ScreenScene's drawHotspots", () => {
    expect(collectScene).toContain("this.editMode.draw(screen, ids, moveIds)");
    expect(collectScene).toContain("Object.keys(this.run.regions[screen] ?? {})");
  });

  it("ScreenScene (mode 1) is untouched — no trace of EditModeSystem, no ?edit=1 flag, byte-for-byte what it was", () => {
    expect(screenScene).not.toContain("EditModeSystem");
    expect(screenScene).not.toContain('"edit"');
  });

  it("PreloadScene's mode routing is unaffected", () => {
    const preload = readText("src/boot/PreloadScene.ts");
    expect(preload).not.toContain("EditModeSystem");
  });

  it("draws and reads in PICTURE space through the shared pan, not canvas space (Roc, 2026-08-23, note 43)", () => {
    // The bug: a region fraction multiplied by the CANVAS. The picture is
    // bigger than the canvas by PAN_ZOOM and slides under it, so the boxes
    // landed off their painted features and drifted with every pan.
    expect(editMode).toContain("readonly pan: PanModel");
    expect(editMode).toContain("pan.unplace(");
    expect(editMode).toContain("regionRectToBase(");
    expect(editMode).toContain("baseToPicturePixels(");
    expect(editMode).toContain("picture.width, picture.height");
    // The old canvas-space normalization must be GONE, not merely bypassed.
    expect(editMode).not.toContain("pixelDragToRegionRect(x0, y0, w, h, W, H)");
    expect(collectScene).toContain("pan: this.backdropSys.pan");
  });

  it("hands each committed rect back to the scene, so a drawn region is live before any export", () => {
    expect(editMode).toContain("onRegionCommitted");
    expect(collectScene).toContain("onRegionCommitted:");
    // The scene writes it into the SAME map HotspotSystem reads.
    expect(collectScene).toContain("this.run.regions[screen] ??= {}");
  });

  it("never writes to public/story/regions.json directly — export is copy-to-clipboard plus console, not a live save", () => {
    expect(editMode).not.toContain("fetch(");
    expect(editMode).not.toContain("fs.");
    expect(editMode).toContain("navigator.clipboard");
    expect(editMode).toContain("console.log(");
  });

  /**
   * GP-203 (`plans/2026-08-24-move-region-editor-plan.md`) — one editor, two
   * palettes. T14 shipped `regions.json`'s `moves` key and its runtime consumer
   * but nothing that could author it, so every screen ran on
   * `MoveRegionPlacement`'s margin fallback.
   */
  describe("move-region authoring — the second palette", () => {
    it("arming carries a KIND, not just an id, so one drag gesture can never serve two maps at once", () => {
      expect(editMode).toContain('export type RegionKind = "examine" | "move"');
      expect(editMode).toContain("private armed: { kind: RegionKind; id: string } | null = null");
      // The old single-space field must be GONE, not shadowed.
      expect(editMode).not.toContain("armedId");
    });

    it("keeps a SECOND session map, so a move commit can never land among the examinables", () => {
      expect(editMode).toContain("private readonly editedMoves: RegionMap = {}");
      expect(editMode).toContain(
        'return kind === "examine" ? this.edited : this.editedMoves;',
      );
      // The commit routes through that switch rather than naming `this.edited`.
      expect(editMode).toContain("const target = this.editsFor(armed.kind);");
      expect(editMode).toContain("(target[this.currentScreen] ??= {})[armed.id] = rect;");
    });

    it("falls back to the matching boot-time map when a kind has no session edit", () => {
      expect(editMode).toContain(
        'return kind === "examine" ? this.deps.initialRegions : this.deps.moveRegions;',
      );
    });

    it("exports BOTH maps, each merged onto its own base — `moves` is no longer pass-through", () => {
      expect(editMode).toContain(
        "regionsFilePayload(this.deps.initialRegions, this.edited, this.deps.moveRegions, this.editedMoves)",
      );
      // The trap this replaces: `moves: this.deps.moveRegions` would throw the
      // session's authored move geometry away on export.
      expect(editMode).not.toContain("moves: this.deps.moveRegions");
    });

    it("draws move boxes in dusk and examine boxes in gold, both from theme tokens and neither as a hex literal", () => {
      expect(editMode).toContain("examine: COLOR.goldNum");
      expect(editMode).toContain("move: COLOR.duskNum");
      expect(editMode).not.toMatch(/#a893c9|#c9a15a/);
    });

    it("toggles kind with a clickable chip, spending no new key off the HUD bar's S N H L O W E + Shift+E", () => {
      expect(editMode).toContain('label: "examinables"');
      expect(editMode).toContain('label: "moves"');
      expect(editMode).toContain("this.kind = k.kind;");
      // No second keyboard listener in the editor — the scene owns the only one.
      expect(editMode).not.toContain("keydown");
    });

    it("takes the move palette from the scene rather than re-deriving it, keying by DESTINATION screen id", () => {
      expect(editMode).toContain("draw(screen: string, ids: readonly string[], moveIds: readonly string[] = [])");
      expect(collectScene).toContain(
        "exitMoveInputs(v.choices, (name) => this.gates.screenIdForName(name)).map((m) => m.key)",
      );
    });

    it("a committed move rect goes live in the same map MoveRegions reads, so the box leaves its fallback immediately", () => {
      expect(editMode).toContain("onMoveRegionCommitted");
      expect(collectScene).toContain("onMoveRegionCommitted:");
      expect(collectScene).toContain("this.run.moveRegions[screen] ??= {}");
      // The renderer's own dep is that same object.
      expect(collectScene).toContain("moveRects: this.run.moveRegions");
    });

    it("the renderer and the editor share ONE exit-key derivation", () => {
      const moveRegions = readText("src/render/MoveRegions.ts");
      expect(moveRegions).toContain("exitMoveInputs(v.choices");
      // The parse it used to keep privately must be gone from the renderer.
      expect(moveRegions).not.toContain("private moveTarget(");
    });
  });
});

/**
 * The palette source itself, run rather than grepped — it is pure (no Phaser),
 * and it is the piece that decides which KEY a drawn move rect is filed under.
 * Get it wrong and the editor writes `moves.T1["The Mill"]` while the renderer
 * looks up `moves.T1.T2`, and the box silently stays on its fallback forever.
 */
describe("exitMoveInputs — the move palette's ids", () => {
  const choice = (display: string, hubAction?: PlayChoice["hubAction"]): PlayChoice =>
    ({ index: 0, display, kind: "move", hubAction }) as PlayChoice;
  const names: Record<string, string> = { "The Mill": "T2", "The Hollow": "F1" };
  const lookup = (n: string) => names[n];

  it("keys each exit by its DESTINATION screen id, which is what regions.json's moves map is keyed by", () => {
    const out = exitMoveInputs([choice("[Go to The Mill]", "exit")], lookup);
    expect(out).toEqual([{ key: "T2", label: "The Mill" }]);
  });

  it("filters on hubAction === exit, so End-the-day never becomes a box on the painting", () => {
    const out = exitMoveInputs(
      [
        choice("[Go to The Mill]", "exit"),
        choice("[End the day]", "endday"),
        choice("Talk to Miri"),
        choice("[Go to The Hollow]", "exit"),
      ],
      lookup,
    );
    expect(out.map((m) => m.key)).toEqual(["T2", "F1"]);
  });

  it("preserves choice order, so a caller may zip it back against its own filtered list by index", () => {
    const out = exitMoveInputs(
      [choice("[Go to The Hollow]", "exit"), choice("[Go to The Mill]", "exit")],
      lookup,
    );
    expect(out.map((m) => m.label)).toEqual(["The Hollow", "The Mill"]);
  });

  it("falls back to the display name as the key when the graph knows no such screen", () => {
    // Same `?? name` the renderer has always used — a rect authored against
    // this key still round-trips; it just never matches a real screen.
    expect(exitMoveInputs([choice("[Go to Nowhere]", "exit")], lookup)[0].key).toBe("Nowhere");
  });

  it("reads both ink phrasings, bracketed or not", () => {
    expect(moveTargetName("[Go to The Mill]")).toBe("The Mill");
    expect(moveTargetName("[Begin at The Mill]")).toBe("The Mill");
    expect(moveTargetName("Go to The Mill")).toBe("The Mill");
    // Anything that is not a move phrase yields "", which `??`s to "" — it is
    // never silently filed under a neighbouring screen's id.
    expect(moveTargetName("Talk to Miri")).toBe("");
  });

  it("is empty when the hub offers no exits — the accepted night/zero-move edge", () => {
    expect(exitMoveInputs([choice("[End the day]", "endday")], lookup)).toEqual([]);
    expect(exitMoveInputs([], lookup)).toEqual([]);
  });
});
