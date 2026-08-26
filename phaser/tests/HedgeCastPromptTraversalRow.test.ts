/**
 * `HedgeCastPrompt` and `TraversalRow`, mounted not shelved — mode5 plan
 * step 7 (responsibilities 6 and 10 out of `CollectScene`). Per the plan:
 * "After this CollectScene is orchestration plus sub-scene launching, and
 * the SRP claim is measurable rather than asserted."
 *
 * Same technique as the other extraction mount tests: a Phaser scene cannot
 * be imported into vitest, so the mount is asserted from source text — the
 * class exists, `CollectScene` constructs it and delegates, and the
 * ORIGINAL private methods are actually gone rather than duplicated
 * alongside the extracted copy.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const readText = (p: string) => fs.readFileSync(path.join(here, "..", p), "utf8");

describe("HedgeCastPrompt is mounted, not shelved", () => {
  const hedgeCastPrompt = readText("src/render/HedgeCastPrompt.ts");
  const collectScene = readText("src/scenes/CollectScene.ts");

  it("owns the extracted methods", () => {
    expect(hedgeCastPrompt).toContain("class HedgeCastPrompt");
    expect(hedgeCastPrompt).toContain("openHedgePrompt(");
    expect(hedgeCastPrompt).toContain("open(message");
    expect(hedgeCastPrompt).toContain("pickSpell(");
  });

  it("resolves against HEDGE_RECEIVER_ID, the only receiver content authors as clearing a blocked path", () => {
    expect(hedgeCastPrompt).toContain("HEDGE_RECEIVER_ID");
  });

  it("CollectScene constructs it fresh in init() and wires it through TraversalRow/WalkerProbe, rather than duplicating gatedCastPrompt/hedgeSpellPicker", () => {
    expect(collectScene).toContain("new HedgeCastPrompt(");
    expect(collectScene).toContain("this.hedgeCastPrompt.openHedgePrompt()");
    expect(collectScene).toContain("this.hedgeCastPrompt.open(message, obstacleNoun)");
    // THE MIRROR.
    for (const method of [
      "private hedgePrompt(",
      "private gatedCastPrompt(",
      "private hedgeSpellPicker(",
      "private pickerLayer",
    ]) {
      expect(collectScene).not.toContain(method);
    }
  });

  it("mutates the local hedge flag only through setHedgeCleared — never reaches into a real G-* id", () => {
    expect(hedgeCastPrompt).toContain("setHedgeCleared()");
    expect(hedgeCastPrompt).not.toContain("gateEngine");
  });
});

/**
 * WHERE THE MOVE HALF WENT — T14, 2026-08-24.
 *
 * `plans/2026-08-23-hud-relayout-ruling.md` §1 retired the traversal PILL:
 * "Movement = clickable screen regions, not buttons." So the move half of
 * `TraversalRow` — `moveTarget`, `blockingGatesFor`, `hintFor`, the locked
 * label, the "?" pin and the gated-click behaviour — moved WHOLE into
 * `render/MoveRegions.ts`, which draws those same exits as dashed boxes on the
 * painting.
 *
 * The four cases below therefore assert the same behaviours against
 * `MoveRegions.ts` instead of `TraversalRow.ts`. Nothing here was relaxed:
 * every string that was pinned is still pinned, including the refused-gate
 * crash guard, which is the one that catches a real crash rather than a
 * refactor. What `TraversalRow` is still held to is what it still does — draw
 * the choices that are NOT screen-hub verbs — plus a NEW pin that it no longer
 * draws the ones that are.
 */
describe("TraversalRow and MoveRegions are mounted, not shelved", () => {
  const traversalRow = readText("src/render/TraversalRow.ts");
  const moveRegions = readText("src/render/MoveRegions.ts");
  const collectScene = readText("src/scenes/CollectScene.ts");

  it("owns the extracted methods", () => {
    expect(traversalRow).toContain("class TraversalRow");
    expect(traversalRow).toContain("draw(v: PlayView");
    expect(moveRegions).toContain("class MoveRegions");
    // `moveTarget` moved ON, one file further, with GP-203 (2026-08-24): once
    // `EditModeSystem` began AUTHORING `moves[screen][destId]`, "which key does
    // this exit file under" had two readers, so the parse and the id lookup
    // became `exitMoveInputs` in the pure `MoveRegionPlacement`. Still not
    // reimplemented anywhere — the point of the original pin — just shared.
    expect(readText("src/world/view/MoveRegionPlacement.ts")).toContain("export function moveTargetName(");
    expect(moveRegions).toContain("exitMoveInputs(");
    expect(moveRegions).toContain("blockingGatesFor(");
  });

  it("CollectScene constructs both fresh in init() and delegates each row in one call", () => {
    expect(collectScene).toContain("new TraversalRow(");
    expect(collectScene).toContain("this.traversalRow.draw(v, inConversation, talkChoiceIndexes)");
    expect(collectScene).toContain("new MoveRegions(");
    expect(collectScene).toContain("this.moveRegions.draw(v, inConversation)");
    // THE MIRROR.
    for (const method of ["private moveTarget(", "private blockingGatesFor(", "private choiceTexts"]) {
      expect(collectScene).not.toContain(method);
    }
  });

  it("the hub verbs left the pill row for good — T14 §1/§1b", () => {
    // The filter is `hubAction`, not `kind`: `kind === "move"` still covers
    // day-end as well as the exits, because `CollectScene`'s VN scope seam
    // reads it as "hub choice, not conversation" and would flip at night if
    // that grouping were re-partitioned. See `PlayChoice.hubAction`.
    expect(traversalRow).toContain("if (c.hubAction) continue;");
    expect(moveRegions).toContain('c.hubAction === "exit"');
    // …and the pill row has no gate machinery left to drift from the regions'.
    // Asserted on its IMPORTS and its deps, not on prose: the file's header
    // names what it handed over, so a substring check on the whole text would
    // match the documentation rather than the code.
    for (const gone of ["gates/GateEngine", "gates/GateRule", "world/Gates", "collectGates"]) {
      expect(traversalRow).not.toContain(gone);
    }
    expect(traversalRow).not.toContain("readonly gateEngine");
    expect(traversalRow).not.toContain("readonly authoredGates");
  });

  it("opens the hedge/gated cast prompt through HedgeCastPrompt, not a duplicate modal", () => {
    expect(moveRegions).toContain("this.deps.openGatedCastPrompt(");
    expect(moveRegions).toContain("this.deps.openHedgePrompt()");
    expect(collectScene).toContain("openGatedCastPrompt: (message, obstacleNoun) => this.hedgeCastPrompt.open(");
  });

  it("still gates on the authored engine when mode5, and the local hedge flag otherwise — unchanged from before the extraction", () => {
    expect(moveRegions).toContain("authoredGates");
    expect(moveRegions).toContain("HEDGE_SCREEN_ID");
    expect(moveRegions).toContain("hedgeCleared()");
  });

  it("never asserts a rule exists for a REFUSED gate id — the crash this extraction found and fixed", () => {
    // `gateEngine.rules.get(id)!` crashes render() the moment a screen
    // offers a move toward F4/F8 (both refused — `GateEngine.ts`'s own
    // header) — a refused gate blocks correctly but has no entry in
    // `rules`. `hintFor()` filters to describable ids instead of asserting
    // one exists. Pinned here so a future edit cannot reintroduce the `!`.
    expect(moveRegions).not.toContain("rules.get(id)!");
    expect(moveRegions).toContain("hintFor(");
    expect(moveRegions).toContain("filter((rule): rule is GateRule => rule !== undefined)");
  });
});

describe("step 7 makes CollectScene orchestration plus sub-scene launching — the SRP claim is measurable", () => {
  const collectScene = readText("src/scenes/CollectScene.ts");

  it("CollectScene is under 1140 lines — it carried 1020 before this step, 847 after, 863 with cast-on-a-thing wiring (Track 1), 880 with the satchel button (Track 2a); Track 2b's save/load is now the boot gate (SaveLoadScene owns it), so no in-game button and the count fell back to 879; Track 2c's Options landed at 899; the satchel drop/move track (2026-08-22) wired live `onDrop`/`onMove` callbacks into `openSatchel()` — landing at 911, gate 920; the 2026-08-23 review-notes round then landed three tracks in parallel — the satchel cluster's two-sided drop/move-to-arms/first-pickup wiring (`DroppedItemHotspots` mounted, four `openSatchel` callbacks), the one-calendar ruling (`openCalendar`'s day-start picker wiring) and the region-hotspot pass — at 1071 together, all of it launch/callback orchestration of extracted systems, so the gate bumped to 1120; T14 (`MoveRegions` + `HudBar` mounted, the top scrim retired) then spent almost all of that headroom at 1118 of 1120, and T13 Phase 3 (2026-08-24, the SAVE_VERSION 2 -> 3 slot set) added 16 lines of the same kind — reading the chosen slot and player name off scene data and handing them to `SaveCoordinator`, with the scene-data CONTRACT itself extracted to `scenes/ChosenLife.ts` rather than declared here — so the gate bumps to 1140 with the same documented discipline, not silently raised; T13 Phase 4 (the real slot board) then spent 6 of those lines on SCENE LIFECYCLE rather than on any new responsibility — the ink bridge OUTLIVES this scene, so `create()`'s `view`/`error` listeners are now named and unbound on shutdown (a leftover listener rendered a torn-down scene into a destroyed texture manager the moment the boot board was re-entered from play) — plus 3 for saying out loud that a session that reached play without a chosen slot will not autosave, now that the `slots[0]` fallback is gone, landing at 1146 and moving the gate to 1150; T13 Phase 5 (the year rollover and its discovery summary) spent 42 more on the same kind of wiring and the gate moves to 1195 — the DERIVATION it could have carried is deliberately not here: the sentence, both denominators and the intersect-don't-count rule are all in `world/DiscoverySummary.ts` behind one `summarizeDiscovery` call, and the endings counter is a slice, so what remains is constructing two objects, naming which systems the panel asks, and the seven-line note on why the final screen is now `FS` AND a parked story rather than `FS` alone", () => {
    const lines = collectScene.split("\n").length;
    expect(lines).toBeLessThan(1195);
  });

  it("every one of the eleven original responsibilities is now either extracted or legitimately scene-level", () => {
    // 1 backdrop+pan, 2 hotspots, 3 satchel, 4 npc, 5 modal UI, 6 hedge cast,
    // 8 walker probe, 10 traversal — all extracted, mode5 plan steps 2-7.
    for (const system of [
      "BackdropSystem",
      "HotspotSystem",
      "SatchelStrip",
      "NpcTalkSystem",
      "ModalFrame",
      "HedgeCastPrompt",
      "WalkerProbe",
      "TraversalRow",
    ]) {
      expect(collectScene).toContain(`new ${system}(`);
    }
    // 7 sub-scenes, 9 vfx cue anchoring, 11 orchestration — legitimately
    // scene-level per the plan's own responsibility breakdown, never claimed
    // as extraction targets.
    for (const subScene of ["openNotebook", "openCalendar", "openHub"]) {
      expect(collectScene).toContain(`private ${subScene}()`);
    }
  });
});
