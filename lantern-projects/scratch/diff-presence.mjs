import fs from "node:fs";
import path from "node:path";

const runs = {
  v01: path.resolve("P:/GitHub/RL_MAP/RL_MAP/ProjectOS/game-project/lantern-projects/v01"),
  scratch: path.resolve("P:/GitHub/RL_MAP/RL_MAP/ProjectOS/game-project/lantern-projects/scratch"),
};

function analyze(dir) {
  const read = (p) => JSON.parse(fs.readFileSync(path.join(dir, p), "utf8"));
  const graph = read("graph.json");

  // soul -> screens that actually have an authored scene for them.
  const scened = new Map();
  for (const sc of graph.scenes ?? []) {
    if (!sc.soul || !sc.screen_id) continue;
    if (!scened.has(sc.soul)) scened.set(sc.soul, new Map());
    const byScreen = scened.get(sc.soul);
    byScreen.set(sc.screen_id, (byScreen.get(sc.screen_id) ?? 0) + 1);
  }

  const days = [];
  for (let d = 1; d <= 5; d++) {
    try {
      days.push(read(`day-${d}.json`));
    } catch {
      break;
    }
  }

  // per-soul stats
  const perSoul = new Map();
  for (const soul of scened.keys()) {
    perSoul.set(soul, { total: 0, live: 0, liveDays: new Set(), allDays: new Set() });
  }

  for (const day of days) {
    for (const fill of day.slot_fill ?? []) {
      if (!scened.has(fill.soul)) continue; // only souls with authored scenes anywhere
      const stat = perSoul.get(fill.soul);
      stat.total++;
      stat.allDays.add(day.day);
      const screens = scened.get(fill.soul);
      if (screens?.has(fill.screen_id)) {
        stat.live++;
        stat.liveDays.add(day.day);
      }
    }
  }

  return { perSoul, scened };
}

const results = {};
for (const [label, dir] of Object.entries(runs)) {
  results[label] = analyze(dir);
}

const allSouls = new Set([
  ...results.v01.perSoul.keys(),
  ...results.scratch.perSoul.keys(),
]);

console.log("Per-soul reachability: % of that soul's placements landing on a screen with an authored scene\n");

for (const soul of [...allSouls].sort()) {
  console.log(`== ${soul} ==`);
  for (const label of ["v01", "scratch"]) {
    const stat = results[label].perSoul.get(soul);
    if (!stat || stat.total === 0) {
      console.log(`  ${label}: no placements found (or soul has no authored scenes in this run's graph)`);
      continue;
    }
    const pct = Math.round((stat.live / stat.total) * 100);
    const liveDays = [...stat.liveDays].sort((a, b) => a - b);
    const allDays = [...stat.allDays].sort((a, b) => a - b);
    console.log(
      `  ${label}: ${stat.live}/${stat.total} placements (${pct}%) on an authored screen; reachable-on-scene-screen days: [${liveDays.join(",")}] out of placed days [${allDays.join(",")}]`,
    );
  }
  console.log("");
}

console.log("\nRegressions (scratch worse than v01):\n");
let anyRegression = false;
for (const soul of [...allSouls].sort()) {
  const before = results.v01.perSoul.get(soul);
  const after = results.scratch.perSoul.get(soul);
  if (!before || !after || before.total === 0 || after.total === 0) continue;
  const beforePct = before.live / before.total;
  const afterPct = after.live / after.total;
  if (afterPct < beforePct) {
    anyRegression = true;
    console.log(`  ${soul}: ${Math.round(beforePct * 100)}% -> ${Math.round(afterPct * 100)}% (WORSE)`);
  }
  const beforeDays = new Set(before.liveDays);
  const afterDays = new Set(after.liveDays);
  for (const d of beforeDays) {
    if (!afterDays.has(d)) {
      anyRegression = true;
      console.log(`  ${soul}: day ${d} was reachable-on-scene-screen in v01 but is NOT in scratch`);
    }
  }
}
if (!anyRegression) console.log("  none found");
