// Step 3 — DETECT GAPS: Claude call comparing the GDD feature inventory
// against the deterministic code scan. Verdict per feature:
// IMPLEMENTED / PARTIAL / MISSING, with evidence.
import { askJson } from "./llm.js";

const SYSTEM = `You compare a game design document's feature inventory against
a codebase scan (file list, exported symbols, keyword hits).
For each inventory feature return ONLY JSON: an array of objects with fields
  feature (string, copied from the inventory),
  tier (copied from the inventory),
  gdd_source (copied from the inventory),
  status ("IMPLEMENTED"|"PARTIAL"|"MISSING"),
  evidence (string — cite file paths / exports / keyword absence that justify the verdict).
Be conservative: keyword absence across the whole scan supports MISSING;
placeholder markers or partial coverage support PARTIAL. Do not invent files.`;

export async function detectGaps(inventory, scanResult) {
  return askJson(
    SYSTEM,
    `FEATURE INVENTORY:\n${JSON.stringify(inventory, null, 2)}\n\n` +
      `CODEBASE SCAN:\n${JSON.stringify(scanResult, null, 2)}`,
  );
}
