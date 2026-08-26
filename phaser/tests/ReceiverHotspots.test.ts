/**
 * `ReceiverHotspots`, mounted not shelved — mode5 plan Track 1
 * ("cast-on-a-thing", Option B). Same technique as `BackdropHotspotSystem
 * .test.ts`: a Phaser scene cannot be imported into vitest, so the mount is
 * asserted from source text — the class exists, `CollectScene` constructs it
 * and delegates at the same three call sites as `HotspotSystem`
 * (init/render/update), and `HedgeCastPrompt` gained the generalized entry
 * point the marker click needs.
 *
 * The real F8 chain clearing through the derived target ids (the "approach"
 * case, screen ids and all) is pinned in `GateEngine.test.ts` alongside the
 * rest of the F8 evidence, not duplicated here.
 */
import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { approachScreens, castTargetsFor } from "../src/render/ReceiverHotspots";

const here = path.dirname(fileURLToPath(import.meta.url));
const readText = (p: string) => fs.readFileSync(path.join(here, "..", p), "utf8");

describe("castTargetsFor — the union rule, pure", () => {
  const screens = [{ screen_id: "F8", receivers: ["river_stone", "heated_stone", "stone_wall"] }];

  it("returns the static receivers, scoped to that screen, when nothing has been minted yet", () => {
    const targets = castTargetsFor(screens, ["F8"], () => []);
    expect(targets.map((t) => t.id).sort()).toEqual(["heated_stone", "river_stone", "stone_wall"]);
    expect(targets.every((t) => t.screenId === "F8")).toBe(true);
  });

  it("unions in world items on the screen, deduped", () => {
    const targets = castTargetsFor(screens, ["F8"], () => ["item_heated_stone", "heated_stone"]);
    expect(targets.map((t) => t.id).sort()).toEqual([
      "heated_stone",
      "item_heated_stone",
      "river_stone",
      "stone_wall",
    ]);
  });

  it("a screen with no authored receivers still offers whatever's on it", () => {
    expect(castTargetsFor(screens, ["F4"], () => ["item_flame"])).toEqual([{ id: "item_flame", screenId: "F4" }]);
  });

  it("an unknown screen id is just empty, not a throw", () => {
    expect(castTargetsFor(screens, ["nowhere"], () => [])).toEqual([]);
  });

  it("THE APPROACH: unions in a second screen's receivers, each tagged with ITS OWN screen id", () => {
    // F5, the player's actual screen, has none of its own — everything comes
    // from the locked F8 it has a move choice toward.
    const withApproach = [
      { screen_id: "F5" },
      { screen_id: "F8", receivers: ["river_stone", "stone_wall"] },
    ];
    const targets = castTargetsFor(withApproach, ["F5", "F8"], () => []);
    expect(targets).toEqual([
      { id: "river_stone", screenId: "F8" },
      { id: "stone_wall", screenId: "F8" },
    ]);
  });
});

describe("approachScreens — locked-neighbor discovery, pure", () => {
  it("offers a screen with a move choice toward it that is still locked", () => {
    const ids = approachScreens(
      ["[Go to Heart of the Wood]"],
      (name) => (name === "Heart of the Wood" ? "F8" : undefined),
      (screenId) => (screenId === "F8" ? ["G-F8-combine"] : []),
    );
    expect(ids).toEqual(["F8"]);
  });

  it("does not offer a screen once its gate is cleared", () => {
    const ids = approachScreens(
      ["[Go to Heart of the Wood]"],
      () => "F8",
      () => [],
    );
    expect(ids).toEqual([]);
  });

  it("ignores choice text that doesn't resolve to a known screen name", () => {
    const ids = approachScreens(["[Talk to Nell]"], () => undefined, () => ["anything"]);
    expect(ids).toEqual([]);
  });
});

describe("ReceiverHotspots is mounted, not shelved", () => {
  const receiverHotspots = readText("src/render/ReceiverHotspots.ts");
  const collectScene = readText("src/scenes/CollectScene.ts");
  const hedgeCastPrompt = readText("src/render/HedgeCastPrompt.ts");

  it("owns sync/reposition and the marker is visually distinct from forage's gold dot", () => {
    expect(receiverHotspots).toContain("class ReceiverHotspots");
    for (const method of ["sync(", "reposition("]) {
      expect(receiverHotspots).toContain(method);
    }
    // Not the forage dot's gold circle — a dusk-bordered shape instead.
    expect(receiverHotspots).toContain("COLOR.duskNum");
    expect(receiverHotspots).not.toContain("COLOR.goldNum");
  });

  it("CollectScene constructs it once in init() and delegates at all three HotspotSystem call sites", () => {
    expect(collectScene).toContain("new ReceiverHotspots(");
    expect(collectScene).toContain("this.receiverHotspots.sync(");
    expect(collectScene).toContain("this.receiverHotspots.reposition(");
  });

  it("a marker click routes through the generalized HedgeCastPrompt entry point, not a duplicate picker", () => {
    expect(collectScene).toContain(
      "this.hedgeCastPrompt.openCastOn(receiverId, label, screenId)",
    );
    expect(hedgeCastPrompt).toContain("openCastOn(receiverId: string, label: string, screenId: string)");
  });
});
