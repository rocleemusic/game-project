/**
 * The spellbook VFX preview selects a spell's REAL authored effect cue, and the
 * preview backend releases it.
 *
 * Two things are pinned:
 *
 *  1. `spellPreviewCue` resolves each starter spell to its own
 *     `cue.cast.effect.<id>` row — the same cue a live cast plays — never a
 *     hand-authored stand-in and never the no-effect twin. Proven against the
 *     table loaded from the SHIPPED records, so a renamed or recoloured cue
 *     fails here rather than drifting the preview away from the game.
 *
 *  2. The preview leaks nothing. A preview pane attaches a filter/emitter per
 *     play exactly as the world does, and Phaser 4 will not release it on
 *     teardown — so after a play the fake backend holds one live handle, and
 *     after `detach()` the module-level live-handle registry is back to zero.
 */

import { describe, expect, it, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadAuthoredCues } from "../src/render/vfx/CueTable";
import { FakeVfxBackend, fakeVfxLiveHandles, resetFakeVfxRegistry } from "../src/render/vfx/FakeVfxBackend";
import { spellPreviewCue } from "../src/magic/spellPreview";

const here = path.dirname(fileURLToPath(import.meta.url));
const MAGIC_JSON = path.resolve(here, "../public/content/magic.json");
const APPROVED_SPELL_IDS: ReadonlySet<string> = new Set(
  (JSON.parse(fs.readFileSync(MAGIC_JSON, "utf8")) as { spell_id: string; status: string }[])
    .filter((s) => s.status === "approved")
    .map((s) => s.spell_id),
);

const CUES = loadAuthoredCues(APPROVED_SPELL_IDS);

const STARTERS = ["glimmer", "echo", "fetch"] as const;

describe("spellPreviewCue selects the real authored effect cue", () => {
  it("loads the shipped table with no defects", () => {
    expect(CUES.defects).toEqual([]);
  });

  it.each(STARTERS)("resolves %s to its cue.cast.effect.<id> row", (id) => {
    const cue = spellPreviewCue(id, CUES);
    expect(cue).not.toBeNull();
    // The preview must reuse the spell's OWN authored effect cue, verbatim — not
    // the generic `cue.cast.effect.any` fallback and not a no-effect twin.
    expect(cue!.id).toBe(`cue.cast.effect.${id}`);
  });

  it("carries the authored kind for each starter (sprite vs rings vs trail)", () => {
    // glimmer is a sprite-loop cue; echo moved to the `rings` composite
    // (2026-08-22, the VFX prototype batch — the shipped `sprite`/
    // `vfx_echo_ripple` cue is kept, just no longer echo's own row, freed up
    // for reuse elsewhere); fetch is a redrawn-Graphics pull trail. The
    // preview has to render all of them, so the selector must not flatten them.
    expect(spellPreviewCue("glimmer", CUES)!.kind).toBe("sprite");
    expect(spellPreviewCue("echo", CUES)!.kind).toBe("rings");
    expect(spellPreviewCue("fetch", CUES)!.kind).toBe("trail");
  });

  it("never returns a no-effect cue — always the effect register", () => {
    for (const id of STARTERS) {
      expect(spellPreviewCue(id, CUES)!.id).not.toContain("noeffect");
    }
  });
});

describe("the preview backend releases every cue it plays", () => {
  beforeEach(() => resetFakeVfxRegistry());

  it("holds one live handle after play and zero after detach", () => {
    const backend = new FakeVfxBackend();
    for (const id of STARTERS) {
      const cue = spellPreviewCue(id, CUES);
      expect(cue).not.toBeNull();
      backend.play(cue!, { x: 0, y: 0 });
    }
    // Three starters, three live handles — one filter/emitter each.
    expect(fakeVfxLiveHandles()).toBe(STARTERS.length);
    backend.detach();
    expect(fakeVfxLiveHandles()).toBe(0);
  });

  it("stays at zero across repeated attach/detach cycles", () => {
    for (let i = 0; i < 10; i++) {
      const backend = new FakeVfxBackend();
      const cue = spellPreviewCue("glimmer", CUES);
      backend.play(cue!, { x: 0, y: 0 });
      backend.detach();
    }
    expect(fakeVfxLiveHandles()).toBe(0);
  });
});
