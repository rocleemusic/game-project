// Shared path resolution. The agent lives at
//   <game-project>/assignments/assignment-5/agent/src/
// and reads the game project two levels up from assignment-5/.
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export const AGENT_DIR = path.resolve(here, "..");
export const ASSIGNMENT_DIR = path.resolve(AGENT_DIR, "..");
export const PROJECT_ROOT = path.resolve(ASSIGNMENT_DIR, "..", "..");

export const GDD_DIR = path.join(PROJECT_ROOT, "gdd");
export const SCAN_DIRS = [
  path.join(PROJECT_ROOT, "tools", "resolver", "src"),
  path.join(PROJECT_ROOT, "tools", "lantern", "src"),
  path.join(PROJECT_ROOT, "lantern-projects", "v01"),
];
export const TYPES_FILE = path.join(PROJECT_ROOT, "tools", "resolver", "src", "types.ts");

export const FIXTURES_DIR = path.join(AGENT_DIR, "fixtures");
export const OUT_DIR = path.join(ASSIGNMENT_DIR, "out");
export const GENERATED_DIR = path.join(OUT_DIR, "generated");
export const RECORDED_REPORT = path.join(ASSIGNMENT_DIR, "report", "gap-audit-2026-08-03.md");
