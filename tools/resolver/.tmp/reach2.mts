import { join } from "node:path";
import { loadData, PACKAGE_ROOT } from "../src/data.ts";
import { loadTuning } from "../src/tuning.ts";
import { buildGraph } from "../src/graph.ts";
import { emitInk } from "../src/ink.ts";
import { emitStoryJson } from "../src/story.ts";
import { resolveWeek, seedThreadsFromContent } from "../src/week.ts";
import { searchReachable } from "../src/walk.ts";
const DATA_DIR = join(PACKAGE_ROOT, "data");
const data = loadData(DATA_DIR, []);
const tuning = loadTuning(DATA_DIR, []);
const graph = buildGraph(data, tuning);
const storyJson = emitStoryJson(emitInk(graph));
const days = resolveWeek(data, { slot:1, life:1, picked_location:"town", threads:[], lead_pool:["LEAD-01","LEAD-02","LEAD-03"], aliveness_band:"quiet" } as any, tuning, { seedThreads: seedThreadsFromContent(data) });
const t0 = Date.now();
const r = searchReachable({ storyJson, graph, days }, {
  maxScenePaths: 200_000, maxSceneDepth: 200, maxWeeks: 30, maxSteps: 60_000,
  maxMillis: Number(process.env.BUDGET_MS ?? 900_000),
});
const all = graph.scenes.map(s=>s.scene_id);
const missing = all.filter(id=>!r.reachableScenes.includes(id));
console.log("ms", Date.now()-t0, "weeks", r.bounds.weeksWalked);
console.log("MISSING:", missing.length ? missing.join(",") : "(none)");
console.log("unexplored:", r.bounds.unexploredScenes.join(",")||"(none)");
console.log("TIME-TRUNCATED:", r.bounds.reasons.some(x=>x.includes("time budget")));
console.log("reasons:", r.bounds.reasons.join(" | "));
