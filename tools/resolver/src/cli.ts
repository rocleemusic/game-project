#!/usr/bin/env node
// resolver CLI — deterministic, no LLM calls.
//
//   node src/cli.ts build       [--data <dir>] [--out <dir>] [--edits <edits.json>]
//       -> <out>/graph.json + <out>/ink/ tree
//       --edits applies Lantern's edits.json patches to the freshly built graph
//       before ink emission, and writes <out>/edit-report.json. Rejected or
//       orphaned patches are printed to stderr and set a non-zero exit code
//       (the build output is still written).
//       If <out>/regions.json exists, it is read as a RegionMap and applied to
//       the INPUT specs before buildGraph runs (flagless; missing file is a
//       silent no-op). Orphans print a stderr warning but never fail the build
//       — geometry lives per run folder now, never in data/screen-specs.json.
//   node src/cli.ts resolve-day --slot N --life N --day N --input <day-input.json>
//                               [--data <dir>] [--out <file>]
//       -> day.json (slot/life/day flags override the input file's values)
//   node src/cli.ts resolve-week [--input <day-input.json>] [--slot N] [--life N]
//                              [--data <dir>] [--out <dir>]
//       -> day-1.json .. day-N.json + week.json (thread moves chained day to day)
//   node src/cli.ts apply-edits --graph <graph.json> --edits <edits.json> [--out <file>]
//       -> patched graph + edit report on stdout
//   node src/cli.ts check-examinables [--threads <dir>] [--data <dir>] [--warn-only]
//       -> guardrails.md check 11: every examinable a thread document declares
//          must exist in screen-specs.json, on the declared screen, setting the
//          declared knowledge flag. Non-zero exit on any mismatch; --warn-only
//          reports without failing (the legitimate mid-authoring state).
//          `build` runs the same check when given --threads.

import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { parseArgs } from "node:util";
import { loadData, PACKAGE_ROOT } from "./data.ts";
import { loadTuning } from "./tuning.ts";
import { buildGraph } from "./graph.ts";
import { emitInk, writeInk } from "./ink.ts";
import { emitStoryJson } from "./story.ts";
import { resolveDay } from "./day.ts";
import { resolveWeek, seedThreadsFromContent } from "./week.ts";
import { applyEdits } from "./edits.ts";
import { applyRegionMap, type RegionMap } from "./regions.ts";
import { findPartialBandCoverage, findUnsatisfiable } from "./conditions.ts";
import {
  checkRequiredExaminables,
  formatExaminableProblem,
  loadDeclaredExaminables,
} from "./examinables.ts";
import type { DayInput, Edit, Graph } from "./types.ts";

function writeJson(file: string, value: unknown): void {
  mkdirSync(dirname(resolve(file)), { recursive: true });
  writeFileSync(file, JSON.stringify(value, null, 2) + "\n", "utf8");
}

const [, , command, ...rest] = process.argv;

const { values: opts } = parseArgs({
  args: rest,
  options: {
    data: { type: "string" },
    out: { type: "string" },
    input: { type: "string" },
    graph: { type: "string" },
    edits: { type: "string" },
    threads: { type: "string" },
    "warn-only": { type: "boolean" },
    slot: { type: "string" },
    life: { type: "string" },
    day: { type: "string" },
    "emit-story": { type: "boolean" },
  },
});

switch (command) {
  case "build": {
    const warnings: string[] = [];
    const data = loadData(opts.data, warnings);
    const tuning = loadTuning(opts.data, warnings);
    for (const w of warnings) console.error(`warning: ${w}`);
    const outDir = opts.out ?? join(PACKAGE_ROOT, "out");
    // Regions overlay the INPUT specs, BEFORE buildGraph — applying it to the
    // built graph after would lose the geometry on the next build, because
    // buildGraph re-reads the specs. --out IS the run folder (graph.json lands
    // at <out>/graph.json), so regions.json sits at the run-folder top level as
    // an input, beside manifest.json. Flagless and silent-no-op when absent:
    // geometry lives per run folder now, never in the global specs.
    const regionsFile = join(outDir, "regions.json");
    if (existsSync(regionsFile)) {
      const map = JSON.parse(readFileSync(regionsFile, "utf8")) as RegionMap;
      const report = applyRegionMap(data.screens, map);
      for (const o of report.orphans) {
        console.error(`WARNING: region orphan — ${o}`);
      }
    }
    // Static condition check (W2): contradictions decidable from the text
    // alone, so a gate that can never open fails the build instead of showing
    // up later as a beat that mysteriously never fires.
    const unsatisfiable = findUnsatisfiable(data.sceneGraph, tuning.day_loop.days_per_life);
    for (const p of unsatisfiable) {
      console.error(`unsatisfiable gate: ${p.scene_id}/${p.choice_id} — ${p.reason} [${p.conditions.join(", ")}]`);
    }
    for (const p of findPartialBandCoverage(data.sceneGraph)) {
      console.error(`warning: partial band coverage: ${p.scene_id} — ${p.reason}`);
    }
    if (unsatisfiable.length > 0) process.exitCode = 1;

    // Guardrail check 11 — required examinables. Opt-in on --threads, because
    // the thread documents live outside the data folder and a build against
    // the fixtures has none to read.
    if (opts.threads) {
      const problems = checkRequiredExaminables(
        data.screens,
        loadDeclaredExaminables(resolve(opts.threads)),
      );
      for (const p of problems) console.error(formatExaminableProblem(p));
      if (problems.length > 0 && !opts["warn-only"]) process.exitCode = 1;
    }

    const graph = buildGraph(data, tuning);
    if (opts.edits) {
      const edits = JSON.parse(readFileSync(opts.edits, "utf8")) as Edit[];
      const report = applyEdits(graph, edits);
      writeJson(join(outDir, "edit-report.json"), report);
      for (const r of report.rejected) {
        console.error(`edit rejected: ${r.edit.target} — ${r.reason}`);
      }
      for (const o of report.orphans) {
        console.error(`edit orphaned: ${o.edit.target} — ${o.reason}`);
      }
      if (report.rejected.length > 0 || report.orphans.length > 0) process.exitCode = 1;
    }
    writeJson(join(outDir, "graph.json"), graph);
    const inkFiles = emitInk(graph);
    writeInk(inkFiles, join(outDir, "ink"));
    let storyNote = "";
    if (opts["emit-story"]) {
      // Compile the emitted ink and write the playable story.json. A compile
      // error throws here, so --emit-story doubles as the compile check.
      const storyJson = emitStoryJson(inkFiles);
      writeFileSync(join(outDir, "story.json"), storyJson, "utf8");
      storyNote = " + story.json";
    }
    console.log(`graph.json + ink/${storyNote} written to ${outDir}`);
    break;
  }
  case "resolve-day": {
    if (!opts.input) throw new Error("resolve-day needs --input <day-input.json>");
    const warnings: string[] = [];
    const data = loadData(opts.data, warnings);
    const tuning = loadTuning(opts.data, warnings);
    for (const w of warnings) console.error(`warning: ${w}`);
    const input = JSON.parse(readFileSync(opts.input, "utf8")) as DayInput;
    if (opts.slot) input.slot = Number(opts.slot);
    if (opts.life) input.life = Number(opts.life);
    if (opts.day) input.day = Number(opts.day);
    const day = resolveDay(data, input, tuning);
    if (opts.out) {
      writeJson(opts.out, day);
      console.log(`day.json written to ${opts.out}`);
    } else {
      console.log(JSON.stringify(day, null, 2));
    }
    break;
  }
  case "resolve-week": {
    // A whole life, chained through the thread feedback loop (W1d). Writes
    // day-1.json .. day-N.json plus a week.json index, so a walker can step a
    // real week instead of replaying day 1 five times.
    const warnings: string[] = [];
    const data = loadData(opts.data, warnings);
    const tuning = loadTuning(opts.data, warnings);
    for (const w of warnings) console.error(`warning: ${w}`);
    const base = opts.input
      ? (JSON.parse(readFileSync(opts.input, "utf8")) as DayInput)
      : ({
          slot: 1,
          life: 1,
          day: 1,
          picked_location: "town",
          threads: [],
          lead_pool: ["LEAD-01", "LEAD-02", "LEAD-03"],
          aliveness_band: "quiet",
        } as DayInput);
    if (opts.slot) base.slot = Number(opts.slot);
    if (opts.life) base.life = Number(opts.life);
    // Seed from the content unless the caller supplied their own record: the
    // floor only holds souls with a LIVE thread, so an unseeded life guarantees
    // nobody on day 1 and no scene is reachable.
    const seedThreads = base.threads.length ? base.threads : seedThreadsFromContent(data);
    const days = resolveWeek(data, base, tuning, { seedThreads });
    const outDir = opts.out ?? join(PACKAGE_ROOT, "out");
    days.forEach((d, i) => writeJson(join(outDir, `day-${i + 1}.json`), d));
    writeJson(join(outDir, "week.json"), {
      slot: base.slot,
      life: base.life,
      days: days.length,
      seed_threads: seedThreads,
      files: days.map((_, i) => `day-${i + 1}.json`),
    });
    // day.json stays the day-1 file so every existing reader keeps working.
    writeJson(join(outDir, "day.json"), days[0]);
    console.log(`week resolved: ${days.length} days written to ${outDir}`);
    break;
  }
  case "apply-edits": {
    if (!opts.graph || !opts.edits) throw new Error("apply-edits needs --graph and --edits");
    const graph = JSON.parse(readFileSync(opts.graph, "utf8")) as Graph;
    const edits = JSON.parse(readFileSync(opts.edits, "utf8")) as Edit[];
    const report = applyEdits(graph, edits);
    writeJson(opts.out ?? opts.graph, graph);
    console.log(JSON.stringify(report, null, 2));
    if (report.rejected.length > 0 || report.orphans.length > 0) process.exitCode = 1;
    break;
  }
  case "check-examinables": {
    // Guardrail check 11, standalone. Reads no scene graph and emits no
    // build, so it is cheap enough to run from a thread author's loop.
    const warnings: string[] = [];
    const data = loadData(opts.data, warnings);
    const threadsDir = resolve(opts.threads ?? join(PACKAGE_ROOT, "..", "..", "lantern-projects", "v01", "threads"));
    const declared = loadDeclaredExaminables(threadsDir);
    const problems = checkRequiredExaminables(data.screens, declared);
    for (const p of problems) console.error(formatExaminableProblem(p));
    console.log(
      `check-examinables: ${declared.length} declared in ${threadsDir}, ${problems.length} problem(s)`,
    );
    if (problems.length > 0 && !opts["warn-only"]) process.exitCode = 1;
    break;
  }
  default:
    console.error(
      "usage: resolver <build | resolve-day | resolve-week | apply-edits | check-examinables> [options]",
    );
    process.exitCode = 2;
}
