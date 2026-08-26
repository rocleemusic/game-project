/**
 * Load the backdrops, then start the game.
 *
 * The run data is already fetched before the game exists (see main.ts) — that
 * keeps this scene to the one thing Phaser's loader is actually good at.
 *
 * Backdrops are served straight out of the run folder via the `/run-images`
 * dev route, keyed by screen_id from manifest.json, so the prototype never
 * forks `lantern-projects/v01` and never goes stale against it.
 */

import Phaser from "phaser";
import type { Run } from "../ink/loadRun";
import { InkBridge } from "../ink/InkBridge";
import { MagicDB } from "../magic/CastResolver";
import { MODES } from "../mode/modes";
import { COLOR, FONT, sceneTransition } from "../ui/theme";
import { CAST_PORTRAIT_SOULS } from "../world/Cast";

/**
 * `discover-home` is mode 3 (Roc, 2026-08-13) — Collection & Discovery's
 * loop, plus a Home Hub gated to what this life has actually found, plus
 * key-item acquisition. It reuses `collect`'s whole scene chain (same
 * `LocationSelectScene` -> `CollectScene`) rather than forking a new one;
 * `hubEnabled` is the one behavioral difference threaded through.
 *
 * `mode5` (Roc, 2026-08-17 — supersedes `mode4`/`PlayScene`, deleted) starts
 * as an exact copy of `discover-home` and reuses the same chain for the same
 * reason, until `plans/2026-08-17-mode5-srp-merge-plan.md`'s extraction steps
 * give it systems `discover-home` does not have.
 */
export type GameMode = "daylife" | "collect" | "discover-home" | "mode5";

export class PreloadScene extends Phaser.Scene {
  private run!: Run;
  private mode: GameMode = "daylife";

  constructor() {
    super("PreloadScene");
  }

  init(data: { run: Run; mode?: GameMode }) {
    this.run = data.run;
    this.mode = data.mode ?? "daylife";
  }

  preload() {
    this.add.text(40, 40, "loading backdrops…", {
      fontFamily: FONT.mono,
      fontSize: "24px",
      color: COLOR.gold,
    });

    for (const [screenId, imgPath] of Object.entries(this.run.manifest)) {
      const file = imgPath.replace(/^images\//, "");
      this.load.image(`bg:${screenId}`, `run-images/${encodeURIComponent(file)}`);
    }

    // Cast portraits — full crop for the HUD cast row, bust crop for the VN
    // conversation sprite. `nell`/`linnet` have no art yet.
    for (const soul of CAST_PORTRAIT_SOULS) {
      this.load.image(`cast:${soul}`, `art/cast/${soul}-full.png`);
      this.load.image(`cast:${soul}:bust`, `art/cast/${soul}-bust.png`);
    }

    // Per-item art — one photo per item id (common items under `art/items/`,
    // key-items under `art/key-items/`), keyed `art:item:${id}`. Ids come
    // straight off the run data (`run.items` / `run.keyItems`, the latter
    // already normalized so `item_id` carries the `key_item_id`), so this
    // never drifts from the content the game actually loads. Not every id has
    // a file yet (e.g. `item_dirt`, several key-items) — those simply miss and
    // fall back to a category glyph; the non-fatal `loaderror` handler below
    // is what keeps a missing art from taking the boot down, exactly like the
    // cast portraits with no art.
    for (const item of this.run.items) {
      this.load.image(`art:item:${item.item_id}`, `art/items/${item.item_id}.png`);
    }
    for (const keyItem of this.run.keyItems) {
      this.load.image(`art:item:${keyItem.item_id}`, `art/key-items/${keyItem.item_id}.png`);
    }

    // `sprite`-kind VFX cues (`PhaserVfxBackend.spriteFx`) name a texture key
    // they expect the scene to have already loaded — the art has been on disk
    // at `public/art/vfx/` since 2026-08-22, but only the content-editor
    // preview (`tools/content-editor/src/preview.ts`) ever loaded it, so
    // every sprite cue played inert in the real game (silently — see
    // `spriteFx`'s own comment on why a missing texture is not a throw).
    // Same table as that preview file; keep them in sync. Every sheet is
    // 128px wide; `leap` is 192 tall (torch + ring share one frame, so the
    // torch is shifted up inside a taller cell to meet the ring — see the
    // build note in cues.json's leap rows), everything else is 128 square.
    const VFX_SHEETS: Record<string, { file: string; frameWidth: number; frameHeight: number }> = {
      vfx_ignite_flame: { file: "ignite-flame", frameWidth: 128, frameHeight: 128 },
      vfx_glimmer_motes: { file: "glimmer-motes", frameWidth: 128, frameHeight: 128 },
      vfx_echo_ripple: { file: "echo-ripple", frameWidth: 128, frameHeight: 128 },
      vfx_furrow_growth: { file: "furrow-growth", frameWidth: 128, frameHeight: 128 },
      vfx_temper_hiss: { file: "temper-hiss", frameWidth: 128, frameHeight: 128 },
      vfx_leap_streak: { file: "leap-streak", frameWidth: 128, frameHeight: 192 },
      vfx_seal_ward_temp: { file: "seal-ward-TEMP", frameWidth: 128, frameHeight: 128 },
      vfx_preserve_bloom: { file: "preserve-bloom", frameWidth: 256, frameHeight: 256 },
      vfx_dry_portal: { file: "dry-portal", frameWidth: 128, frameHeight: 128 },
    };
    for (const [key, { file, frameWidth, frameHeight }] of Object.entries(VFX_SHEETS)) {
      this.load.spritesheet(key, `art/vfx/${file}.png`, { frameWidth, frameHeight });
    }

    // A missing asset must not take the boot down — the manifest points at
    // scraped reference art that may not all be present, and per-item art has
    // real gaps (ids with no file yet). Both warn and continue.
    this.load.on("loaderror", (f: Phaser.Loader.File) =>
      console.warn("[assets] missing asset:", f.key, f.url),
    );
  }

  create() {
    const run = this.run;
    const ink = new InkBridge(run);
    const magic = new MagicDB(run.spells, run.items);

    // Proof of seam. Reaching this line at all means LanternPlayer constructed
    // the story and bound all four EXTERNALs — with fallbacks off, an unbound
    // one would have thrown rather than silently returning zero.
    const outcomes = magic.spells.reduce((n, s) => n + s.receivers.length, 0);
    console.log(`[probe] ${magic.spells.length} approved spells · ${outcomes} authored outcomes`);
    console.log(
      "[probe] component sets needing a phrase to disambiguate:",
      magic.ambiguousComponentSets().map((g) => g.map((s) => s.spell_id).join("/")),
    );

    if (this.mode === "collect" || this.mode === "discover-home" || this.mode === "mode5") {
      // The boot life picker. Still a pass-through for `collect`/
      // `discover-home` (`mode.save: null` — no slots, nothing to pick), but as
      // of T13 Phase 4 `mode5` ALWAYS sees the board, including the first boot
      // with nothing saved: that is where a slot is chosen and a name is typed.
      // See `SaveLoadScene`'s header, behaviour (b).
      sceneTransition(this, "SaveLoadScene", {
        run,
        ink,
        magic,
        mode: MODES[this.mode],
      });
    } else {
      sceneTransition(this, "ScreenScene", { run, ink, magic });
    }
  }
}
