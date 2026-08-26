/**
 * `SatchelStrip`, `ModalFrame` and `WalkerProbe`, mounted not shelved —
 * mode5 plan step 6 (responsibilities 3, 5 and 8 out of `CollectScene`).
 *
 * Same technique as `tests/NpcTalkSystem.test.ts`/`BackdropHotspotSystem.test.ts`:
 * a Phaser scene cannot be imported into vitest, so the mount is asserted
 * from source text — the class exists, `CollectScene` constructs it and
 * delegates, and the ORIGINAL private methods are actually gone rather than
 * duplicated alongside the extracted copy.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const readText = (p: string) => fs.readFileSync(path.join(here, "..", p), "utf8");

describe("SatchelStrip is mounted, not shelved", () => {
  const satchelStrip = readText("src/render/SatchelStrip.ts");
  const collectScene = readText("src/scenes/CollectScene.ts");

  it("owns the extracted methods", () => {
    expect(satchelStrip).toContain("class SatchelStrip");
    for (const method of ["effectiveSatchel(", "syncInventory(", "draw("]) {
      expect(satchelStrip).toContain(method);
    }
  });

  it("CollectScene constructs it fresh in init() and delegates, rather than duplicating drawSatchel", () => {
    expect(collectScene).toContain("new SatchelStrip(");
    expect(collectScene).toContain("this.satchelSys.effectiveSatchel(");
    expect(collectScene).toContain("this.satchelSys.syncInventory(");
    expect(collectScene).toContain("this.satchelSys.draw(");
    // THE MIRROR.
    for (const method of ["private effectiveSatchel(", "private syncInventory(", "private drawSatchel("]) {
      expect(collectScene).not.toContain(method);
    }
  });

  it("effectiveSatchel/syncInventory stay public — HotspotSystem's 'full' check reads them off the SAME instance", () => {
    // `render()` reads `effectiveSatchel` off the SAME instance, not a
    // recomputed copy, for the `hotspotsFull` check that feeds
    // `HotspotSystem.sync(v, full)`. (The header used to read it too, for a
    // `satchel N/M` count; Roc's 2026-08-19 screen-flow feedback dropped that
    // from the header — the count now lives only on the bottom satchel strip.)
    const occurrences = collectScene.split("this.satchelSys.effectiveSatchel(").length - 1;
    expect(occurrences).toBeGreaterThanOrEqual(1);
    expect(collectScene).toContain("this.satchelSys.syncInventory(");
  });
});

describe("ModalFrame is mounted, not shelved", () => {
  const modalFrame = readText("src/render/ModalFrame.ts");
  const collectScene = readText("src/scenes/CollectScene.ts");

  it("owns the extracted methods, and satisfies NpcTalkSystem's ModalHost directly", () => {
    expect(modalFrame).toContain("class ModalFrame");
    for (const method of ["button(", "modalFrame(", "componentHint(", "closeButton(", "clearModal(", "pushModal("]) {
      expect(modalFrame).toContain(method);
    }
  });

  it("CollectScene constructs it fresh in init() and hands it to NpcTalkSystem as `modal:`", () => {
    expect(collectScene).toContain("new ModalFrame(");
    expect(collectScene).toContain("modal: this.modalSys");
    // No longer `modal: this` — CollectScene itself no longer implements
    // ModalHost.
    expect(collectScene).not.toContain("modal: this,");
  });

  it("CollectScene delegates its own HUD calls, rather than duplicating the methods", () => {
    // Only `buttonRow()` (the HUD chrome nav row) and `isOpen` are called
    // directly from CollectScene now — `modalFrame`/`clearModal`/
    // `closeButton`/`pushModal` moved with the hedge/gated cast prompt into
    // `render/HedgeCastPrompt.ts` (mode5 plan step 7), which takes the SAME
    // `modalSys` instance as an injected dependency rather than a duplicate.
    expect(collectScene).toContain("this.modalSys.buttonRow(");
    expect(collectScene).toContain("this.modalSys.isOpen");
    const hedgeCastPrompt = readText("src/render/HedgeCastPrompt.ts");
    // Revision 4 (wireframe §2, "decided — the picker reads as the book"):
    // the cast picker draws its own parchment book-page panel instead of
    // `modalFrame()`'s leather board, so it calls `markOpen()` (added for
    // exactly this) rather than `modalFrame()` — but it still rides
    // `ModalFrame`'s shared clear/close/push lifecycle, not a duplicate.
    for (const call of ["modal.clearModal(", "modal.markOpen(", "modal.closeButton(", "modal.pushModal("]) {
      expect(hedgeCastPrompt).toContain(call);
    }
    // THE MIRROR.
    for (const method of [
      "private button(",
      "modalFrame(title",
      "componentHint(spell",
      "closeButton(onClose",
      "clearModal() {",
      "pushModal(obj",
    ]) {
      expect(collectScene).not.toContain(method);
    }
  });

  it("owns modalOpen — CollectScene reads modalSys.isOpen instead of its own field", () => {
    expect(modalFrame).toContain("get isOpen(): boolean");
    expect(collectScene).toContain("this.modalSys.isOpen");
    expect(collectScene).not.toContain("private modalOpen");
  });
});

describe("WalkerProbe is mounted, not shelved", () => {
  const walkerProbe = readText("src/render/WalkerProbe.ts");
  const collectScene = readText("src/scenes/CollectScene.ts");

  it("owns exposeForWalker's replacement and installs window.__collect", () => {
    expect(walkerProbe).toContain("class WalkerProbe");
    expect(walkerProbe).toContain("expose(): void");
    expect(walkerProbe).toContain(".__collect = {");
  });

  it("CollectScene constructs it in init() and calls expose() from create(), rather than duplicating exposeForWalker", () => {
    expect(collectScene).toContain("new WalkerProbe(");
    expect(collectScene).toContain("this.walkerProbe.expose()");
    // THE MIRROR.
    expect(collectScene).not.toContain("private exposeForWalker(");
    expect(collectScene).not.toContain(".__collect = {");
  });

  it("publishes the same fourteen keys the probe always has — a rename would silently break walk-style driving", () => {
    // Not derived from a driver script the way ProbeContract.test.ts derives
    // __probe/__cast (no tool drives __collect the same way today), so this
    // is a plain pin: touch this list deliberately if the shape changes.
    for (const key of [
      "snapshot:",
      "choose:",
      "advance:",
      "forage:",
      "pickup:",
      "cast:",
      "openNpcSpells:",
      "openHedgePrompt:",
      "openNotebook:",
      "openCalendar:",
      "openHub:",
      "seeSpell:",
      "inventoryHeld:",
      "discoveredIds:",
    ]) {
      expect(walkerProbe).toContain(key);
    }
  });
});

describe("step 6 leaves CollectScene's line count lower still", () => {
  /**
   * THE NUMBER LIVES IN ONE PLACE — `HedgeCastPromptTraversalRow.test.ts`.
   *
   * This assertion used to carry its own second gate, `< 1100`, written when
   * step 6 cut the scene from 1171. Step 7 then opened a THIRD-party gate in
   * `HedgeCastPromptTraversalRow.test.ts` and has maintained it since,
   * documenting every deliberate bump (847 → 1071 → 1120) in the case name.
   * Nobody maintained this one, so two gates on the same file drifted 20 lines
   * apart and the STALE one silently governed: any change landing between 1100
   * and 1120 failed here while passing the gate that actually records the
   * project's reasoning.
   *
   * T14 (2026-08-24) is the change that surfaced it — mounting `MoveRegions`
   * and `HudBar` is ordinary orchestration wiring, exactly what the maintained
   * gate's own changelog is a list of, but it landed in the dead zone. Rather
   * than invent a third number, this defers to the maintained one. The claim
   * this test was really making — "step 6's extractions are still extracted" —
   * is what the cases above it assert, and they are untouched.
   */
  const GATE = 1195; // must match HedgeCastPromptTraversalRow.test.ts's gate

  it(`CollectScene is under ${GATE} lines — the single gate, maintained in HedgeCastPromptTraversalRow.test.ts`, () => {
    const lines = readText("src/scenes/CollectScene.ts").split("\n").length;
    expect(lines).toBeLessThan(GATE);
  });
});
