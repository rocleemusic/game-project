import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Cast } from "../src/world/Cast";
import type { Graph } from "../../tools/lantern/src/types";

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (p: string) => JSON.parse(fs.readFileSync(path.join(here, "..", p), "utf8"));

const graph = read("public/story/graph.json") as Graph;
const cast = new Cast(graph);
const days = [1, 2, 3, 4, 5].map((d) => read(`public/story/day-${d}.json`)) as {
  day: number;
  slot_fill: { screen_id: string; time_block: string; soul: string }[];
}[];

describe("who is on a screen", () => {
  it("reads presence off the ink VARs, not from the day file", () => {
    // The host must never re-derive presence: ink owns it, applyPresence sets
    // it, and this only reads it back.
    const here2 = cast.presentOn("T1", {
      present_ilsa: "T1",
      present_mara: "T1",
      present_toby: "T2",
      present_bex: "none",
    });
    expect(here2.map((h) => h.soul).sort()).toEqual(["ilsa", "mara"]);
  });

  it("puts souls who can actually speak first", () => {
    // A screen with one real conversation must not bury it behind people who
    // cannot speak.
    const here2 = cast.presentOn("T2", { present_linnet: "T2", present_toby: "T2" });
    expect(here2[0].soul).toBe("toby");
    expect(here2[0].scened).toBe(true);
    expect(here2[1].scened).toBe(false);
  });

  it("knows where each soul's scenes actually are", () => {
    expect(cast.screensFor("mara")).toEqual(["F1", "T2"]);
    expect(cast.screensFor("ilsa")).toEqual(["T4", "T7"]);
    expect(cast.screensFor("toby")).toEqual(["T2", "T6", "T7"]);
  });

  it("has portraits for every soul except nell and linnet", () => {
    for (const soul of ["bex", "ilsa", "juno", "mara", "pip", "toby"]) {
      expect(cast.portraitKey(soul)).toBe(`cast:${soul}`);
      expect(cast.bustPortraitKey(soul)).toBe(`cast:${soul}:bust`);
    }
    for (const soul of ["linnet", "nell"]) {
      expect(cast.portraitKey(soul)).toBeNull();
      expect(cast.bustPortraitKey(soul)).toBeNull();
    }
  });
});

describe("G15 — v01 predates the 2026-08-11 placement fix", () => {
  const roleOf = new Map((graph.souls ?? []).map((x: any) => [x.soul_id, x.role_tag]));
  const workplace = new Map(
    ((graph as any).role_workplace ?? []).map((r: any) => [r.role_tag, r.workplace_screens ?? []]),
  );
  const wpFor = (soul: string): string[] => (workplace.get(roleOf.get(soul)) as string[]) ?? [];

  it("has scenes authored at exactly each soul's role workplace", () => {
    // The system IS coherent: the crew authored every scene where the role
    // works. T6 and T7 are deliberate extras (tavern evening, festival night).
    for (const soul of ["mara", "toby", "ilsa"]) {
      for (const screen of wpFor(soul)) {
        expect(cast.hasScene(soul, screen)).toBe(true);
      }
    }
    expect(wpFor("mara").sort()).toEqual(["F1", "T2"]);
    expect(wpFor("ilsa")).toEqual(["T4"]);
  });

  it("records v01's placement counts, regenerated 2026-08-24", () => {
    // NOT evidence that the resolver ignores role_workplace — it does not.
    //
    // BEFORE (run folder generated 2026-08-01, ten days before day.ts's
    // placement logic was last fixed): 15 at workplace, 106 off.
    // THEN   (regenerated 2026-08-17, this time also re-running resolve-week
    // so the day files move, not just graph.json): 17 at, 104 off.
    // AFTER  (regenerated 2026-08-24 — T19 Task 5): 36 at, 85 off. `wpFor`
    // reads EVERY soul's role, not just mara/toby/ilsa — three more souls
    // (bex/Farmer, juno/Priest, pip/Postman) got a `role_tag` this pass, and
    // `role-workplace.json` already carried real `workplace_screens` rows for
    // all three (Task 5's own note: "the Farmer, Postman and Priest rows it
    // already carries"). Their placements now count as "at workplace" for the
    // first time — this is the wiring working, not a regression.
    //
    // The earlier movement was small because most placements are the ordinary
    // weighted draw doing its job — ambient population, not conversation
    // slots. This jump is larger because it adds three role_tags at once,
    // each with its own `role_anchor` weight and workplace rows.
    let at = 0;
    let off = 0;
    for (const day of days) {
      for (const fill of day.slot_fill) {
        if (wpFor(fill.soul).includes(fill.screen_id)) at++;
        else off++;
      }
    }
    expect(at).toBe(36);
    expect(off).toBe(85);
  });
});

describe("G15 — presence and authored content disagree", () => {
  it("no longer strands ilsa or mara on a screen with nothing authored (regen 2026-08-17)", () => {
    // THE REPORTED BUG, AND ITS FIX, PINNED.
    //
    // BEFORE the regen, day 1 morning T1 held exactly ["ilsa", "mara"], and
    // neither has a scene on T1. That was the "Ilsa's and Mara's conversations
    // don't open" report: presence was correct, the screen was just silent.
    //
    // AFTER, the guarantee floor puts them where they have authored scenes and
    // T1 draws the texture souls instead. Ilsa now reaches T4 on days 1-4 (was
    // 2 and 4) and Mara reaches T2 on all five days (was 3). So the assertion
    // flips: no deep soul may be placed anywhere they have nothing to say on
    // day 1 morning, and whoever IS drawn there is voiceless by design.
    const d1 = days[0].slot_fill.filter(
      (f) => f.time_block === "morning" && f.screen_id === "T1",
    );
    for (const f of d1) {
      expect(cast.screensFor(f.soul).length, `${f.soul} was drawn to T1`).toBe(0);
    }
    // And the two souls the bug was reported about now land on their own screens.
    const ilsaScreens = new Set(
      days.flatMap((d) => d.slot_fill.filter((f) => f.soul === "ilsa").map((f) => f.screen_id)),
    );
    const maraScreens = new Set(
      days.flatMap((d) => d.slot_fill.filter((f) => f.soul === "mara").map((f) => f.screen_id)),
    );
    expect([...ilsaScreens].some((s) => cast.hasScene("ilsa", s))).toBe(true);
    expect([...maraScreens].some((s) => cast.hasScene("mara", s))).toBe(true);
  });

  it("records v01's silent-placement count, regenerated 2026-08-24", () => {
    // NOT evidence of a defect: the ordinary weighted draw is meant to place
    // souls broadly as ambient population, and a village filled only to its
    // conversational slots would read as empty. See GAPS.md G15.
    //
    // BEFORE (2026-08-01 run): 121 placements, 19 live, 84% silent.
    // THEN   (2026-08-17 regen): 121 placements, 21 live, 83% silent.
    // AFTER  (2026-08-24 regen — T19 Task 5): 121 placements, 20 live, 83%
    // silent. `live` counts a placement where the soul has an AUTHORED SCENE
    // on that exact screen — bex/juno/pip have no authored scenes anywhere
    // (they are texture souls, same as nell/linnet), so their new role_tag
    // moves them onto their workplace screens (the test above) without
    // adding any live conversation there. One fewer of the OLD draw's
    // incidental scene-screen landings for mara/toby/ilsa got displaced by
    // the reshuffled weights; the rounded percentage does not move.
    let total = 0;
    let live = 0;
    for (const day of days) {
      for (const fill of day.slot_fill) {
        total++;
        if (cast.hasScene(fill.soul, fill.screen_id)) live++;
      }
    }
    expect(total).toBe(121);
    expect(live).toBe(20);
    expect(Math.round(((total - live) / total) * 100)).toBe(83);
  });

  it("records the five souls placed with no scenes anywhere", () => {
    // Expected — they are the STRETCH-tier texture souls. Asserted so the
    // distinction from the deep-soul case stays explicit.
    const placed = new Set(days.flatMap((d) => d.slot_fill.map((f) => f.soul)));
    const voiceless = [...placed].filter((s) => cast.screensFor(s).length === 0).sort();
    expect(voiceless).toEqual(["bex", "juno", "linnet", "nell", "pip"]);
  });
});
