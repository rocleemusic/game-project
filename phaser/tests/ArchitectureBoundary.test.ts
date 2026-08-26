/**
 * The one rule that holds the line: `src/world/**` and `src/mode/**` may never
 * import Phaser.
 *
 * That boundary is what lets systems be built in parallel — the VFX and
 * dialogue tracks build against a pure event bus with no engine underneath, and
 * the world logic stays deep-testable in vitest with no canvas. A single
 * `import Phaser` anywhere in those folders and both properties are gone, quietly,
 * with everything still compiling and every other test still green.
 *
 * So it is checked by GREP rather than by convention. Cheap, and the only thing
 * that will actually hold across parallel sessions.
 *
 * WHY MODULE SPECIFIERS AND NOT THE WHOLE FILE. `Decor.ts` contains the string
 * `"phaser-probe/decor/v1"` as its localStorage key, and several files discuss
 * Phaser in their header comments — deliberately, since explaining what the
 * boundary is for is part of keeping it. A whole-file substring search would
 * fail on all of that. This extracts the import/require SPECIFIERS and tests
 * only those.
 */

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const srcRoot = path.join(here, "..", "src");

/** The folders the rule applies to. */
const PURE_DIRS = ["world", "mode"] as const;

function tsFilesUnder(dir: string): string[] {
  if (!fs.existsSync(dir)) return [];
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...tsFilesUnder(full));
    else if (entry.isFile() && /\.tsx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

/**
 * Every module specifier a file references.
 *
 * Covers the four forms that can pull a module in: `... from "x"`, a
 * side-effect `import "x"`, a dynamic `import("x")` and a `require("x")`.
 * `export ... from "x"` is caught by the first.
 */
function moduleSpecifiers(source: string): string[] {
  const patterns = [
    /\bfrom\s*["']([^"']+)["']/g,
    /\bimport\s+["']([^"']+)["']/g,
    /\bimport\s*\(\s*["']([^"']+)["']\s*\)/g,
    /\brequire\s*\(\s*["']([^"']+)["']\s*\)/g,
  ];
  const found: string[] = [];
  for (const re of patterns) {
    for (const m of source.matchAll(re)) found.push(m[1]);
  }
  return found;
}

describe("architecture boundary — src/world and src/mode are Phaser-free", () => {
  it("finds files to check in every pure folder", () => {
    // Guards against this test passing because it looked at nothing.
    for (const dir of PURE_DIRS) {
      expect(tsFilesUnder(path.join(srcRoot, dir)).length).toBeGreaterThan(0);
    }
  });

  it("no file under src/world/** or src/mode/** imports phaser", () => {
    const offenders: string[] = [];
    for (const dir of PURE_DIRS) {
      for (const file of tsFilesUnder(path.join(srcRoot, dir))) {
        const specs = moduleSpecifiers(fs.readFileSync(file, "utf8"));
        for (const spec of specs) {
          if (/phaser/i.test(spec)) {
            offenders.push(`${path.relative(srcRoot, file).replace(/\\/g, "/")} -> ${spec}`);
          }
        }
      }
    }
    expect(offenders).toEqual([]);
  });

  it("the extractor sees the import forms it claims to", () => {
    // A test for the test: if `moduleSpecifiers` silently stopped matching,
    // the rule above would pass for the wrong reason.
    const sample = [
      'import Phaser from "phaser";',
      'import type { A } from "./a";',
      'import "./side-effect";',
      'const m = await import("phaser/types");',
      'const r = require("phaser");',
      'export type { B } from "./b";',
    ].join("\n");
    expect(moduleSpecifiers(sample).sort()).toEqual([
      "./a",
      "./b",
      "./side-effect",
      "phaser",
      "phaser",
      "phaser/types",
    ]);
  });
});
