/**
 * `npm run orphans` — content that is authored but wired to NOTHING.
 *
 * A script and not an agent, for the same reason `content-check.mjs` is one:
 * "does this record join to anything" has exactly one right answer for a given
 * set of files, so the judgement an agent would add is judgement that is not
 * needed. `agents/README.md`'s own precedent — "a fourth check is deterministic
 * and is not a seat".
 *
 * THIS FILE IS THE ONLY PART OF THE AUDIT THAT TOUCHES DISK. Every rule lives
 * in `src/world/audit/rules.ts`, which is pure and knows no paths; the report
 * lives in `src/world/audit/report.ts`. That split is what lets the rules be
 * unit-tested against fixtures instead of against the real content, so a rule
 * can be proven to FIRE and not only to stay quiet.
 *
 * Exits non-zero when anything is orphaned, so it can gate a commit.
 *
 * WHERE IT READS, AND WHY THE TWO SOURCES DIFFER.
 *
 *   content/{magic,items,key-items}/   the authored records, RAW
 *   lantern-projects/v01/             the resolver's run folder, the source of
 *                                     truth `npm run prep:content` copies FROM
 *
 * Raw, not `public/content/*.json`, because the bundler drops rejected spells
 * and `loadRun.ts` normalises key items onto `item_id`. Both drops are exactly
 * what the audit exists to see through — G5 is a gate keyed to a rejected
 * spell, G10 is the key-item schema divergence.
 *
 * The run folder rather than `public/story/` because `public/` is a COPY, and
 * auditing a copy means a stale bundle reads as clean content. If the run folder
 * is missing the script falls back to `public/story/` and says so in the report.
 *
 * Run: npm run orphans   (or: node tools/content-audit.mjs)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { audit } from "../src/world/audit/rules.ts";
import { formatReport } from "../src/world/audit/report.ts";
import { NPC_GIFT_ITEM } from "../src/world/npcItems.ts";

const here = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const PROJECT = path.resolve(here, "..");
const CONTENT = path.join(PROJECT, "content");
const RUN = path.join(PROJECT, "lantern-projects", "v01");
const PUBLIC_STORY = path.join(here, "public", "story");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));

/** Every record in a content dir. `_`-prefixed files are meta, never records. */
function readRecords(dir) {
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".json") && !f.startsWith("_"))
    .sort()
    .map((f) => readJson(path.join(dir, f)));
}

/**
 * The decoration category vocabulary, read off `src/magic/types.ts` rather than
 * restated here.
 *
 * A second hand-maintained list of categories would be one more join that can
 * drift silently — which is the whole defect class this script reports. So the
 * union is extracted, and a failure to extract it is a hard error rather than
 * an empty set that would flag every key item as miscategorised.
 */
function decorationCategories() {
  const src = fs.readFileSync(path.join(here, "src", "magic", "types.ts"), "utf8");
  const block = /export type ItemCategory\s*=([\s\S]*?);/.exec(src);
  if (!block) {
    throw new Error("could not find `export type ItemCategory` in src/magic/types.ts");
  }
  const names = [...block[1].matchAll(/"([^"]+)"/g)].map((m) => m[1]);
  if (names.length === 0) throw new Error("ItemCategory union parsed as empty");
  return names;
}

/** The run folder if it is there, `public/story` if it is not. */
function runDir(notes) {
  if (fs.existsSync(path.join(RUN, "graph.json"))) return RUN;
  notes.push(
    `lantern-projects/v01/graph.json is missing — read the COPY in public/story/ instead, ` +
      `which is only as fresh as the last \`npm run prep:content\`.`,
  );
  return PUBLIC_STORY;
}

function main() {
  const notes = [];
  const dir = runDir(notes);
  const graph = readJson(path.join(dir, "graph.json"));

  const placements = [];
  let days = 0;
  for (let d = 1; d <= 5; d++) {
    const file = path.join(dir, `day-${d}.json`);
    if (!fs.existsSync(file)) continue;
    days++;
    for (const fill of readJson(file).slot_fill ?? []) {
      placements.push({ soul: fill.soul, screen_id: fill.screen_id });
    }
  }
  if (days === 0) notes.push("no day-N.json files were found in the run folder.");

  // Wave 2 Track B owns this file. Absent is a legitimate state right now, and
  // `audit()` reports it as unchecked rather than as "no gate defects".
  // Track B shipped this at src/world/gates/data/. The audit was written against
  // a guessed path (src/world/data/) and so silently skipped its three gate
  // checks — the exact "a rule that did not run is not a rule that passed" case
  // the report itself warns about. Both are tried so neither layout goes unread.
  const gateRulesFile = [
    path.join(here, "src", "world", "gates", "data", "gateRules.json"),
    path.join(here, "src", "world", "data", "gateRules.json"),
  ].find((p) => fs.existsSync(p));
  const gateRulesRaw = gateRulesFile ? readJson(gateRulesFile) : null;
  // The file wraps its table in a `rules` key; the audit wants the table itself.
  const gateRules = gateRulesRaw ? (gateRulesRaw.rules ?? gateRulesRaw) : null;

  // `screen-specs.json` authors `item_id`s directly now (Task 1, 2026-08-23
  // reconciliation) — `foragePoolToItem.ts` is an identity shim, so passing
  // it here would be meaningless. Build the map from the graph itself: every
  // name a screen's `forage` array uses maps to itself. This keeps
  // `forage-pool-unjoined` meaningful — it now asks whether every forage
  // entry names a real item or key-item record.
  const poolNames = new Set((graph.screens ?? []).flatMap((s) => s.forage ?? []));
  const foragePoolToItem = Object.fromEntries([...poolNames].map((p) => [p, p]));

  const result = audit({
    spells: readRecords(path.join(CONTENT, "magic")),
    items: readRecords(path.join(CONTENT, "items")),
    keyItems: readRecords(path.join(CONTENT, "key-items")),
    screens: graph.screens ?? [],
    scenes: graph.scenes ?? [],
    placements,
    foragePoolToItem,
    // `collectExtraForage.ts` is gone (Task 3, T19) — every forage pool is
    // now a real, authored entry in `screen-specs.json`, so there is nothing
    // left to layer on.
    extraForagePools: {},
    npcGiftItems: Object.values(NPC_GIFT_ITEM),
    gateRules,
    decorationCategories: decorationCategories(),
  });

  const withNotes = { ...result, unchecked: [...notes, ...result.unchecked] };
  process.stdout.write(formatReport(withNotes));
  console.log(`  read: ${path.relative(PROJECT, dir)} (${days} days) + content/ records`);
  console.log("");

  if (result.findings.length > 0) {
    console.log(`FAIL — ${result.findings.length} authored records join to nothing.`);
    console.log("");
    process.exitCode = 1;
  }
}

main();
