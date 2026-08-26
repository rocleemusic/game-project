/**
 * `BackdropSystem` and `HotspotSystem`, mounted not shelved — mode5 plan
 * step 5 (responsibilities 1 and 2 out of `CollectScene`).
 *
 * Same technique as `tests/NpcTalkSystem.test.ts`: a Phaser scene cannot be
 * imported into vitest, so the mount is asserted from source text — the class
 * exists, `CollectScene` constructs it and delegates to it, and the ORIGINAL
 * private methods are actually gone rather than duplicated alongside the
 * extracted copy (the mirror check that caught the VFX gap).
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const readText = (p: string) => fs.readFileSync(path.join(here, "..", p), "utf8");

describe("BackdropSystem is mounted, not shelved", () => {
  const backdropSys = readText("src/render/BackdropSystem.ts");
  const collectScene = readText("src/scenes/CollectScene.ts");

  it("owns the extracted methods, and exposes the shared PanModel", () => {
    expect(backdropSys).toContain("class BackdropSystem");
    for (const method of ["sync(", "updatePan(", "step("]) {
      expect(backdropSys).toContain(`${method}`);
    }
    expect(backdropSys).toContain("readonly pan: PanModel");
  });

  it("CollectScene constructs it once and delegates, rather than duplicating syncBackdrop/updatePan", () => {
    expect(collectScene).toContain("new BackdropSystem(");
    expect(collectScene).toContain("this.backdropSys.sync(");
    expect(collectScene).toContain("this.backdropSys.updatePan(");
    expect(collectScene).toContain("this.backdropSys.step(");
    // THE MIRROR. `syncBackdrop` must be GONE from CollectScene, not just
    // duplicated alongside the extracted copy. `updatePan` stays — it still
    // gates on modal/conversation state before delegating — but its own
    // `!this.backdrop` check (BackdropSystem's own job now) must be gone.
    expect(collectScene).not.toContain("private syncBackdrop(");
    expect(collectScene).not.toContain("if (!this.backdrop) return;");
  });

  it("every other system that needs to pan reads the SAME PanModel instance, not a second one", () => {
    // `NpcTalkSystem` and `HotspotSystem` both take `pan` as a dependency —
    // if CollectScene ever constructed a second `PanModel`, hotspots/NPCs
    // would pan out of lockstep with the backdrop.
    expect(collectScene).not.toContain("new PanModel(");
    expect(collectScene).toContain("pan: this.backdropSys.pan");
  });
});

describe("HotspotSystem is mounted, not shelved", () => {
  const hotspotSys = readText("src/render/HotspotSystem.ts");
  const collectScene = readText("src/scenes/CollectScene.ts");

  it("owns the extracted methods", () => {
    expect(hotspotSys).toContain("class HotspotSystem");
    for (const method of ["sync(", "offeredSlots(", "reposition("]) {
      expect(hotspotSys).toContain(`${method}`);
    }
  });

  it("withExtraForage is GONE, not shelved (Task 3, T19, 2026-08-24)", () => {
    // It existed to layer `EXTRA_FORAGE_POOLS` (T4 "ash", F7/F8 "ore") onto a
    // cloned graph client-side, because `screen-specs.json` had no such pools.
    // T19's Task 2 put them in the real `forage` arrays; `collectExtraForage
    // .ts` is deleted, and the constructor reads `deps.graph` directly with
    // `deps.guaranteedPools` (from `mode.forage.guaranteedPools`) — no clone.
    expect(hotspotSys).not.toContain("withExtraForage");
    expect(hotspotSys).not.toContain("EXTRA_FORAGE_POOLS");
    expect(hotspotSys).toContain("guaranteedPools");
  });

  it("CollectScene constructs it fresh in init() and delegates, rather than duplicating drawHotspots", () => {
    expect(collectScene).toContain("new HotspotSystem(");
    expect(collectScene).toContain("this.hotspotSys.sync(");
    expect(collectScene).toContain("this.hotspotSys.reposition(");
    // `offeredSlots(` itself is called from `WalkerProbe.ts` now (mode5 plan
    // step 6, the walker probe's own `forage:` method) rather than directly
    // in CollectScene — the mirror check below still confirms CollectScene
    // does not duplicate the underlying `drawHotspots`.
    const walkerProbe = readText("src/render/WalkerProbe.ts");
    expect(walkerProbe).toContain("hotspotSys.offeredSlots(");
    // THE MIRROR — same technique as NpcTalkSystem's own mount test.
    expect(collectScene).not.toContain("private drawHotspots(");
    expect(collectScene).not.toContain("new Forage(");
  });

  it("does not own the satchel-full check — that's a later step's responsibility", () => {
    // `sync(v, full)` takes `full` as an argument; CollectScene still computes
    // it from `effectiveSatchel` (responsibility 3, not yet extracted). Not a
    // bare string check — the header names `effectiveSatchel` in prose to
    // explain the boundary, which is not the same as calling it.
    expect(hotspotSys).not.toContain("effectiveSatchel(");
    expect(collectScene).toContain("this.hotspotSys.sync(v, hotspotsFull)");
  });

  it("places itself with the safe box the SCENE computes, not a duplicated copy", () => {
    // `HOTSPOT_SAFE_X`/`HOTSPOT_SAFE_Y` derive from HUD layout constants
    // (`TOP_BAR_HEIGHT`, `CHOICES_ROW_TOP`) that only `CollectScene` knows —
    // declaring them a second time in `HotspotSystem` would let the two drift.
    expect(hotspotSys).not.toContain("const HOTSPOT_SAFE");
    expect(collectScene).toContain("safeBox: { x: HOTSPOT_SAFE_X, y: HOTSPOT_SAFE_Y }");
  });
});

describe("examine regions are hoverable, seen-on-dwell, and pinned to the picture", () => {
  const hotspotSys = readText("src/render/HotspotSystem.ts");
  const collectScene = readText("src/scenes/CollectScene.ts");

  it("renders the authored regions itself, outside edit mode", () => {
    // Roc, 2026-08-23 (note 42): "edit mode sets regions but then the regions
    // are not actually hoverable or clickable." Nothing but the editor drew
    // them, so they died the moment the editor closed.
    expect(hotspotSys).toContain("planRegionHotspots(");
    expect(hotspotSys).toContain("private syncRegions(");
    expect(collectScene).toContain("regions: data.run.regions");
  });

  it("is not gated on the forage draw — an examinable is a fact about the painting", () => {
    // `sync()` returns early when the day offers no forage slots here; the
    // region pass has to happen BEFORE that return or a screen with nothing
    // to pick up shows no examinables either.
    const sync = /sync\(v: PlayView, full: boolean\): void \{[\s\S]*?\n  \}/.exec(hotspotSys)?.[0] ?? "";
    expect(sync).toContain("this.syncRegions(screen)");
    expect(sync.indexOf("this.syncRegions(screen)")).toBeLessThan(sync.indexOf("if (!offered.length) return;"));
  });

  it("marks a region seen only after a one-second dwell, and a click dismisses the tooltip without removing it", () => {
    expect(hotspotSys).toContain("REGION_SEEN_DWELL_MS = 1000");
    expect(hotspotSys).toContain("this.seenRegions.add(key)");
    // The click path: hide the tooltip, and nothing else. No pickup, no ink.
    const click = /box\.on\("pointerdown", \(\) => \{[\s\S]*?\}\);/.exec(hotspotSys)?.[0] ?? "";
    expect(click).toContain("this.destroyRegionTip()");
    // The box itself survives the click — "click will not remove the region."
    expect(click).not.toContain("box.destroy");
    expect(click).not.toContain("ink.");
  });

  it("takes its region geometry from the picture and repositions with the pan", () => {
    expect(hotspotSys).toContain("pan.pictureWidth");
    const reposition = /reposition\(\): void \{[\s\S]*?\n  \}/.exec(hotspotSys)?.[0] ?? "";
    expect(reposition).toContain("this.regionSpots");
  });
});

describe("the two extractions leave CollectScene's line count lower", () => {
  it("CollectScene is under 1200 lines — it carried 1278 before this step", () => {
    const lines = readText("src/scenes/CollectScene.ts").split("\n").length;
    expect(lines).toBeLessThan(1200);
  });
});
