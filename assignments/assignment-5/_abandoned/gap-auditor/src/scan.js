// Step 2 — SCAN: deterministic codebase scan (no LLM). Walks
// tools/resolver/src, tools/lantern/src, and lantern-projects/v01 collecting
// a file list, exported symbols, and keyword evidence.
import fs from "node:fs";
import path from "node:path";
import { PROJECT_ROOT, SCAN_DIRS } from "./paths.js";

const CODE_EXT = new Set([".ts", ".tsx", ".js", ".jsx", ".ink", ".json"]);
const SKIP_DIRS = new Set(["node_modules", "out", "images", ".git", "dist"]);

// Keywords tied to GDD features — presence/absence is gap evidence.
export const KEYWORDS = [
  "save", "load", "slot", "life", "reshuffle", "persist",
  "bond", "aliveness", "seed", "festival", "role_goal",
  "spell", "cast", "ignite", "satchel", "make", "craft",
  "inkpot", "unreal", "wwise", "walk", "thread",
];

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) yield* walk(path.join(dir, entry.name));
    } else if (CODE_EXT.has(path.extname(entry.name))) {
      yield path.join(dir, entry.name);
    }
  }
}

const EXPORT_RE =
  /^export\s+(?:default\s+)?(?:async\s+)?(?:function|class|const|let|interface|type|enum)\s+([A-Za-z0-9_$]+)/;

export function scan() {
  const files = [];
  for (const dir of SCAN_DIRS) {
    if (!fs.existsSync(dir)) continue;
    for (const file of walk(dir)) {
      const rel = path.relative(PROJECT_ROOT, file).replaceAll("\\", "/");
      const text = fs.readFileSync(file, "utf8");
      const lower = text.toLowerCase();
      const exports = [];
      for (const line of text.split("\n")) {
        const m = line.match(EXPORT_RE);
        if (m) exports.push(m[1]);
      }
      const keywordHits = KEYWORDS.filter((k) => lower.includes(k));
      files.push({ path: rel, lines: text.split("\n").length, exports, keywordHits });
    }
  }
  return { scannedAt: new Date().toISOString(), fileCount: files.length, files };
}
