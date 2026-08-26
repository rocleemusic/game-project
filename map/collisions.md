# Naming collisions — game-project

Built fresh on this walk (2026-08-25). Same name, different things; grab the wrong
one and the change vanishes, breaks a passing test, or imports a dead ruling.

**story.json is five files.** `lantern-projects/v01/story.json` is the record.
`lantern-projects/scratch/story.json` is a scratch copy. `phaser/public/story/story.json`
is the copy `prep:content` bundles for the Phaser build. `phaser/dist/story/story.json`
is build output. `tools/lantern/fixtures/story.json` is a test fixture. Edit anything
but the first and the change either vanishes on the next build or breaks an honest test.

**PAUSED.md is a retired container holding live rulings.** `CONTEXT.md` §Session resume
declares PAUSED.md replaced on 2026-08-02 — "a one-session handoff note, not a tracker."
The current `PAUSED.md` (2026-08-22, VFX pipeline) nevertheless carries load-bearing
calibration canon: `leap`'s texture-baked `originY: 0.6667` ("do not recompute"), the
neutral-flip parity rule, and the only record of the unwired vortex/firework prototypes.
The container's status does not decide the contents' status — the cue card cites these
rulings directly. Do not trust the whole file as current state, and do not discard the
rulings with it; they belong folded into a design record.

**phaser/README.md is stale in three flagged places — on purpose.** Its own 2026-08-24
banner says so: it still opens with "a design probe, not a build track," still carries
the retired "nothing here may gate Track A" rule, and still says capstone 2026-08-25.
`CONTEXT.md` is authoritative on all three (ship target; rule retired 2026-08-23;
capstone Tue 2026-09-01, freeze Fri 2026-08-28). The rest of the file (seams, content
rules, deploy) is live.

**A soul card is not always the soul.** `cast/mara.md` is the record. `pipeline-runs/*/`
hold same-named copies, frozen and knowingly divergent. `cast/mara-herbalist-threads.md`
is a threads companion beside the card, not a second card.

**appearance.md is three files.** `cast/appearance.md` (character portrait/art notes),
`content/key-items/appearance.md` (key-item art), `locations/appearance.md` (location
art). None is a copy of another; a bare "appearance.md" hit needs its folder before it
means anything.

**"style guide" is three documents.** `narrative-pipeline/register.md` is the record
for prose voice. `gdd/14-visual-style-guide.md` governs visuals, with a live rendered
counterpart at `phaser/tools/screen-flow/mockups/design-system.html`.
`assignments/assignment-7/style-guide.md` is a derived coursework restatement and is
never the source.

**"spell" splits into cue and magic.** The visual half is a cue
(`phaser/src/render/vfx/cues.json` + `CueTable.ts`); the mechanical half is
`phaser/src/magic/` and the record `content/magic/*.json`. The word appears in all
three and wires none of them to the others' neighbors.

**assignment-7 is not assignment-7-old.** `assignments/assignment-7/` is live;
`assignments/assignment-7-old/` is the superseded tree with the same interior
filenames. Check the path segment before trusting any search hit under `assignments/`.

**Tasks live in two worlds.** The Paca board (external, `GP-nnn`) holds current state;
repo markdown holds reasoning and history. The backlog at
`resources/_archive/game-project-tasks.md` is frozen — a task found only there is not
a task.

**The test command is not one command.** `tools/resolver` tests run under `node --test`
(`npm test`); `tools/lantern` and `phaser` run vitest. `npx vitest run` in resolver
collects 0 tests and looks like a wall of failures (`CONTEXT.md` §Rules).

**"home" is not what the manifest says.** `T5` is an NPC's home despite
`lantern-projects/v01/manifest.json` pointing it at `homeinterior.jpg`; the player's
Home Hub is `HOME`, which the decoration sandbox mounts (Roc, 2026-08-12, recorded in
`phaser/README.md` §Known state). Do not read a manifest filename as authority on
whose home a screen is.

**"Forest Unlock 1" is a label, not a screen.** `ignite.unlocks.screen` names it, but
it matches no screen id or name — a GDD-era label never minted (`phaser/README.md`
§Three things block, GP-106). The join the graph actually uses is gate ids like
`G-F7-light`.

## Debris (no resolution needed, just don't trust it)

`bash.exe.stackdump` at the territory root and
`tools/resolver/P:tmpresolver_test_out.txt` (an escaped Windows redirect) are shell
accidents wired to nothing. `phaser/.playtest/`, `phaser/.adversary/`,
`phaser/.tmp-verifier-shots/`, `phaser/dist/`, `tools/resolver/out-calib/` and
`tools/resolver/out/` are regenerated outputs.
