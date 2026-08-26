// Step 1 — PERCEIVE: read the GDD (gdd/*.md, 13 numbered files) and extract a
// feature inventory via the Claude API. Each entry: feature, tier
// (MUST / SHOULD / STRETCH / other), and source file:line.
import fs from "node:fs";
import path from "node:path";
import { GDD_DIR } from "./paths.js";
import { askJson } from "./llm.js";

export function readGdd() {
  const files = fs
    .readdirSync(GDD_DIR)
    .filter((f) => /^\d\d-.*\.md$/.test(f))
    .sort();
  return files.map((f) => ({
    file: f,
    text: fs.readFileSync(path.join(GDD_DIR, f), "utf8"),
  }));
}

const SYSTEM = `You extract a feature inventory from a game design document.
Return ONLY JSON: an array of objects with fields
  feature (string), tier ("MUST"|"SHOULD"|"STRETCH"|"other"),
  gdd_source (string, "file.md:line" — line numbers of the strongest citation),
  notes (string, optional).
Prefer the scope/risks and technical-overview files for tier assignments.
Do not invent features not stated in the documents.`;

export async function perceive() {
  const docs = readGdd();
  const numbered = docs
    .map(
      (d) =>
        `=== ${d.file} ===\n` +
        d.text
          .split("\n")
          .map((line, i) => `${i + 1}\t${line}`)
          .join("\n"),
    )
    .join("\n\n");
  const inventory = await askJson(
    SYSTEM,
    `Extract the feature inventory (feature, tier, source file:line) from this GDD:\n\n${numbered}`,
  );
  return { docs: docs.map((d) => d.file), inventory };
}
