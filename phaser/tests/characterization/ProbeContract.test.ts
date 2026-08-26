/**
 * CHARACTERIZATION — the walker probe contract, as it stands 2026-08-17.
 *
 * `GAPS.md`-adjacent risk 6 in the pivot plan, stated plainly:
 *
 *     "The walker contract is invisible to the type system. walk.mjs calls
 *      window.__probe.forage(), .choose(), __cast.run(). Any rename breaks
 *      the evidence with zero test failures."
 *
 * `npm run walk` is the load-bearing check in this project — it exists because
 * a compounding-scrim leak shipped that no unit test could see. If a rename
 * silently kills it, the project loses its only pixel-level evidence and finds
 * out days later.
 *
 * So this file IS the contract. It does not hand-write the required method
 * names: it reads `tools/walk.mjs` and `tools/cast-sweep.mjs`, extracts every
 * `window.__probe.X` / `window.__cast.X` they actually call, and checks those
 * against the object literals `ScreenScene.exposeForWalker()` and
 * `CastScene.expose()` really publish. Add a call to a script and this test
 * demands the method. Rename the method and this test fails instead of the
 * walk going quiet.
 *
 * Source-text, not runtime, because both literals live inside Phaser scenes
 * and `src/scenes/**` cannot be imported into vitest.
 */

import { describe, expect, it } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const source = (...p: string[]) => fs.readFileSync(path.join(root, ...p), "utf8");

const walkSrc = source("tools", "walk.mjs");
const sweepSrc = source("tools", "cast-sweep.mjs");
const screenSrc = source("src", "scenes", "ScreenScene.ts");
const castSrc = source("src", "scenes", "CastScene.ts");

/** Every `window.<global>.<method>` a driver script reaches for. */
function methodsCalledOn(global: string, ...scripts: string[]): string[] {
  const re = new RegExp(`window\\.${global}\\.([A-Za-z_$][\\w$]*)`, "g");
  const found = new Set<string>();
  for (const s of scripts) for (const m of s.matchAll(re)) found.add(m[1]);
  return [...found].sort();
}

/**
 * Top-level keys of the object literal that follows `anchor`.
 *
 * Brace/paren/bracket aware and skips strings and comments, so a default
 * parameter (`mana: ManaBand = "baseline"`) is not mistaken for a key and a
 * nested return object is not flattened into the top level.
 */
function objectLiteralKeys(src: string, anchor: string): string[] {
  const at = src.indexOf(anchor);
  if (at < 0) throw new Error(`anchor not found: ${anchor}`);
  let i = src.indexOf("{", at);
  let brace = 0;
  let paren = 0;
  let bracket = 0;
  let lastSignificant = "";
  const keys: string[] = [];

  for (; i < src.length; i++) {
    const c = src[i];
    const two = src.slice(i, i + 2);

    if (two === "//") {
      const nl = src.indexOf("\n", i);
      if (nl < 0) break;
      i = nl;
      continue;
    }
    if (two === "/*") {
      const end = src.indexOf("*/", i);
      if (end < 0) break;
      i = end + 1;
      continue;
    }
    if (c === '"' || c === "'" || c === "`") {
      const quote = c;
      i++;
      while (i < src.length && src[i] !== quote) {
        if (src[i] === "\\") i++;
        i++;
      }
      lastSignificant = quote;
      continue;
    }
    if (/\s/.test(c)) continue;

    if (c === "{") {
      brace++;
      lastSignificant = c;
      continue;
    }
    if (c === "}") {
      brace--;
      if (brace === 0) break;
      lastSignificant = c;
      continue;
    }
    if (c === "(") paren++;
    if (c === ")") paren--;
    if (c === "[") bracket++;
    if (c === "]") bracket--;

    const atKeySlot =
      brace === 1 && paren === 0 && bracket === 0 && (lastSignificant === "{" || lastSignificant === ",");

    if (atKeySlot && /[A-Za-z_$]/.test(c)) {
      let j = i;
      while (j < src.length && /[\w$]/.test(src[j])) j++;
      const name = src.slice(i, j);
      let k = j;
      while (k < src.length && /\s/.test(src[k])) k++;
      if (src[k] === ":") {
        keys.push(name);
        i = k;
        lastSignificant = ":";
        continue;
      }
      i = j - 1;
      lastSignificant = name[name.length - 1];
      continue;
    }

    lastSignificant = c;
  }
  return keys;
}

const probeExposed = objectLiteralKeys(screenSrc, ".__probe = {");
const castExposed = objectLiteralKeys(castSrc, ".__cast = {");
const probeRequired = methodsCalledOn("__probe", walkSrc, sweepSrc);
const castRequired = methodsCalledOn("__cast", walkSrc, sweepSrc);

// ---------------------------------------------------------------------------
// 23. The key sets are frozen
// ---------------------------------------------------------------------------

describe("23 — window.__probe and window.__cast key sets are frozen", () => {
  it("derives what the driver scripts require from the scripts themselves", () => {
    // The five Roc named, plus openCast, which cast-sweep.mjs uses to reach
    // the casting layer. Derived, not asserted into existence.
    expect(probeRequired).toEqual([
      "advance",
      "choose",
      "forage",
      "openCast",
      "pickup",
      "snapshot",
    ]);
    expect(castRequired).toEqual(["available", "run"]);
    for (const must of ["forage", "pickup", "choose", "advance", "snapshot"]) {
      expect(probeRequired).toContain(must);
    }
  });

  it("publishes exactly these eleven keys on window.__probe", () => {
    // ScreenScene.exposeForWalker(). Frozen: adding one is a deliberate act,
    // and this test is where you record it.
    expect([...probeExposed].sort()).toEqual([
      "advance",
      "cast",
      "choose",
      "forage",
      "openCast",
      "openHub",
      "openNotebook",
      "packTriage",
      "pickup",
      "snapshot",
      "vars",
    ]);
  });

  it("publishes exactly these six keys on window.__cast", () => {
    // CastScene.expose().
    expect([...castExposed].sort()).toEqual([
      "available",
      "close",
      "run",
      "setMode",
      "setSlots",
      "snapshot",
    ]);
  });

  it("keeps __probe.snapshot()'s payload fields, which walk.mjs reads by name", () => {
    // A getter would not survive the page/driver boundary, so the snapshot is
    // a plain enumerable object. These field names are read directly in
    // walk.mjs (s.screen, s.errors, s.hasBackdrop, s.displayCount, ...).
    const start = screenSrc.indexOf("snapshot: () => {", screenSrc.indexOf(".__probe = {"));
    expect(start).toBeGreaterThan(-1);
    const body = screenSrc.slice(start, screenSrc.indexOf("\n    };", start));
    for (const field of [
      "day",
      "timeBlock",
      "movesLeft",
      "screen",
      "choices",
      "canContinue",
      "ended",
      "errors",
      "satchel",
      "notebook",
      "arms",
      "banked",
      "spellbook",
      "hasBackdrop",
      "displayCount",
      "enforceLocks",
      "clearedGates",
      "blockedMoves",
    ]) {
      expect(body).toContain(`${field}:`);
    }
  });

  it("keeps __cast.run()'s returned fields, which cast-sweep.mjs reads by name", () => {
    const start = castSrc.indexOf("run: (", castSrc.indexOf(".__cast = {"));
    expect(start).toBeGreaterThan(-1);
    const body = castSrc.slice(start, castSrc.indexOf("available:", start));
    for (const field of [
      "outcome",
      "narration",
      "reaction",
      "consumed",
      "produced",
      "unlockedScreen",
    ]) {
      expect(body).toContain(`${field}:`);
    }
  });

  it("keeps a forage slot's `slotId` and `item`, which the pickup loop pairs", () => {
    // walk.mjs: `for (const s of slots) __probe.pickup(s.slotId, s.item)`.
    // Note `item` is a POOL NAME, not an item id — see the satchel ledger
    // characterization and GAPS.md G13.
    expect(walkSrc).toContain("window.__probe.pickup(s.slotId, s.item)");
    const forageSrc = source("src", "world", "Forage.ts");
    expect(forageSrc).toContain("slotId: string;");
    expect(forageSrc).toContain("item: string;");
  });
});

// ---------------------------------------------------------------------------
// 24. A rename fails here, rather than silently killing the walk evidence
// ---------------------------------------------------------------------------

describe("24 — a rename fails this test instead of going quiet", () => {
  it("exposes everything walk.mjs and cast-sweep.mjs call", () => {
    const missingProbe = probeRequired.filter((m) => !probeExposed.includes(m));
    const missingCast = castRequired.filter((m) => !castExposed.includes(m));
    expect({ missingProbe, missingCast }).toEqual({ missingProbe: [], missingCast: [] });
  });

  it("still installs both globals on the window", () => {
    // The assignment itself, not just the shape. If the exposure moves to a
    // `WalkerProbe.ts` system, point these two anchors at it — that is the
    // one edit this file should need during the extraction.
    expect(screenSrc).toContain(".__probe = {");
    expect(castSrc).toContain(".__cast = {");
    expect(screenSrc).toContain("this.exposeForWalker();");
  });

  it("keeps the walk's entry condition — `?walk=1` must never see the picker", () => {
    // ModePickerScene skips itself under ?walk=1 so __probe exists the moment
    // the page settles. walk.mjs waits on exactly that.
    const picker = source("src", "scenes", "ModePickerScene.ts");
    expect(picker).toContain('params.has("walk")');
    expect(walkSrc).toContain("waitForFunction(() => window.__probe");
    expect(sweepSrc).toContain("waitForFunction(() => window.__cast");
  });

  it("tears __cast down on close, so a stale handle cannot answer for a dead scene", () => {
    expect(castSrc).toContain(".__cast = undefined;");
  });

  it("names the mode-2 probe separately, so the two never collide", () => {
    // CollectScene publishes `__collect`, deliberately not `__probe`. Modes
    // 1-3 must still run after the Wave 1 extraction, and the walk drives
    // mode 1 only. The `.__collect = {` literal itself moved into
    // `render/WalkerProbe.ts` (mode5 plan step 6) — this file's own header
    // anticipated exactly this move for `__probe`/`__cast`: "point these two
    // anchors at it — that is the one edit this file should need."
    const collect = source("src", "scenes", "CollectScene.ts");
    const walkerProbe = source("src", "render", "WalkerProbe.ts");
    expect(walkerProbe).toContain(".__collect = {");
    expect(collect).not.toContain(".__probe = {");
    expect(collect).not.toContain(".__collect = {");
    expect(collect).toContain("new WalkerProbe(");
  });
});
