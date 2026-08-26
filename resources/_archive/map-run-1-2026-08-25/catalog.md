# game-project — map catalog

Walked 2026-08-25. The territory is `ProjectOS/game-project/`: a Phaser 4
TypeScript build (the ship target since the 2026-08-17 pivot), an ink
narrative compiled to `story.json`, JSON content records, a 16-section GDD,
a narrative pipeline, and an external task board (Paca). Capstone Tue
2026-09-01, content freeze Fri 2026-08-28 — `CONTEXT.md` is the authority
on dates and pivot status; several in-folder READMEs still carry the old
framing and say so themselves.

**How to read this map:** open this catalog, open **one** card, follow its
cited source, stop. Never load the whole `cards/` folder.

## Nouns

| Noun | Status | Card |
|---|---|---|
| soul — a character; card of record in `cast/` | live | `cards/soul.md` |
| story.json — the compiled ink graph every host reads | live | `cards/story-json.md` |
| run folder — the current playable week, `lantern-projects/v01/` | live | `cards/run-folder.md` |
| phaser build — the ship target, `phaser/src/` | live | `cards/phaser-build.md` |
| LanternPlayer — the host layer both hosts share | live | `cards/lantern-player.md` |
| resolver data — the layout-pass inputs and `tuning.json` | live | `cards/resolver-data.md` |
| content library — items, key-items, magic; schema law in `_index.md`s | live | `cards/content-library.md` |
| cue — a spell's VFX entry in `cues.json` | live | `cards/cue.md` |
| register — the prose voice contract | live | `cards/register.md` |
| GDD — the 16 numbered design sections | live | `cards/gdd.md` |
| seat contract — an agent's job description in `agents/` | live | `cards/seat-contract.md` |
| pipeline spec — how story content gets made | live | `cards/pipeline-spec.md` |
| playtest harness — headless Chromium walk/sweep/adversary | live | `cards/playtest-harness.md` |
| Paca board — external task state, GP-nnn ids | live | `cards/paca-board.md` |
| pipeline run — dated, frozen narrative-run snapshots | ghost | `cards/pipeline-run.md` |
| assignments — coursework; derives from the game, feeds nothing back | leftover | `cards/assignments.md` |
| Unreal port — post-capstone target in a Perforce workspace | leftover | `cards/unreal-port.md` |

## Collisions (this territory's list)

- **story.json is at least five files.** `lantern-projects/v01/story.json`
  is the record; scratch, `phaser/public/story/`, `phaser/dist/story/` and
  lantern test fixtures also hold one. See `cards/story-json.md`.
- **A soul appears in four places.** `cast/` is the record; pipeline-run
  copies are frozen, `v01/personas.json` is derived, assignment folders
  hold coursework Maras. See `cards/soul.md`.
- **"style guide" is three documents.** Prose voice →
  `narrative-pipeline/register.md`; visuals → `gdd/14-visual-style-guide.md`
  (live pair: `phaser/tools/screen-flow/mockups/design-system.html`);
  `assignments/assignment-7/style-guide.md` is a derived copy, never the source.
- **"spell" splits into cue and magic.** Visuals are a cue
  (`phaser/src/render/vfx/`); mechanics live in `phaser/src/magic/` and the
  records in `content/magic/`. See `cards/cue.md`.
- **assignment-7 is not assignment-7-old.** Same interior filenames; check
  the path segment on every search hit under `assignments/`.
- **The test command is not one command.** `tools/resolver` runs under
  `node --test` (`npm test`); `tools/lantern` and `phaser` run vitest.
  Wrong runner in the wrong folder looks like broken code.
- **PAUSED.md exists despite being "replaced".** `CONTEXT.md` §Session
  resume ruled PAUSED.md retired 2026-08-02, but `/pause` still writes one;
  the current `PAUSED.md` (2026-08-22, VFX session) is a one-session
  handoff holding real cue-calibration rulings — read it via
  `cards/cue.md`, do not treat it as a tracker.
- **Tasks live in two worlds.** Paca holds state, markdown holds reasoning;
  `resources/_archive/game-project-tasks.md` is retired. See
  `cards/paca-board.md`.

## Scoped out, on purpose

- `knowledge-base/` — research, low churn; its own `CONTEXT.md` indexes it.
  One known stale claim (inkcpp ranking) is flagged on `cards/unreal-port.md`.
- `plans/` and `plans/_handoffs/` — design records and session handoffs;
  reasoning, never status, never a record. `plans/CONTEXT.md` rules the split.
- `locations/`, `game-project-ideas.md`, `game-project-resources.md` —
  reference and idea inbox, not state, no cross-file couplings found.
- `resources/` — syllabus, parking lot (`resources/parking-lot.md` stamps
  the parked cuts), archive.
- Debris: `.obsidian/`, `bash.exe.stackdump`, `phaser/.playtest/`,
  `phaser/.adversary/`, `phaser/.tmp-verifier-shots/`, `tools/resolver/`'s
  stray `P:tmpresolver_test_out.txt` — run outputs and editor litter,
  wired to nothing.
