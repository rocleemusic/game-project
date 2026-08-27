# Catalog — game-project

Highest-authority prose: `CONTEXT.md` at the territory root (the front door — read it
before anything; the capstone date, the pivot, and the Paca-first rule live there).
The public repo also carries a `README.md` front door — it describes the map and what
the public copy leaves out, not the game; it is not a noun and gets no card.
Walked 2026-08-25 (run 2; run 1 was earlier the same day).

Naming collisions: [`collisions.md`](collisions.md) — read it before trusting any
search hit; the same name lands on different things in this territory.

Open work: [`open-work.md`](open-work.md) — a Paca snapshot of what's in flight,
filed by noun. Point-in-time, not live; run `/pm` for the current list.

Reader's walk: this catalog → one card → the cited source → stop.

Shore marks the design/build seam — the boundary most changes must cross.
`design` nouns govern what the game says and means; `build` nouns are what runs;
`—` sits on neither shore.

| Noun | Status | Shore | Card |
|---|---|---|---|
| soul — a character; card of record in `cast/` | live | design | `cards/soul.md` |
| run folder v01 — the playable week, home of `story.json` | live | build | `cards/run-folder-v01.md` |
| spell record — one JSON per spell, approved and rejected side by side | live | design | `cards/spell-record.md` |
| item record — the item/key-item library spells join against | live | design | `cards/item-record.md` |
| cue — a spell's VFX entry, data-driven | live | build | `cards/cue.md` |
| phaser build — the ship target since the 2026-08-17 pivot | live | build | `cards/phaser-build.md` |
| lantern player — the host layer both engines need | live | build | `cards/lantern-player.md` |
| resolver — mints graph, ink scaffold, and story.json from data | live | build | `cards/resolver.md` |
| register — the Frieren-flat voice contract for player-facing text | live | design | `cards/register.md` |
| gdd — the design doc as 17 numbered files, synced by ruling | live | design | `cards/gdd.md` |
| dialogue inventory — the T15/T16 fill tracker; the rulings rule | live | design | `cards/dialogue-inventory.md` |
| narrative pipeline — the content-production contracts and agent seats | live | design | `cards/narrative-pipeline.md` |
| gdd-sync — how session rulings reach `gdd/`; spec at RL_MAP root | live | design | `cards/gdd-sync.md` |
| Paca board — external task state, `GP-nnn` ids | live | — | `cards/paca-board.md` |
| seat contract — an agent's job description, audited | live | design | `cards/seat-contract.md` |
| pipeline run — dated run output; newest is `2026-08-25-thread-driven-scenes`, pending pick-and-polish | live | design | `cards/pipeline-run.md` |
| design record — why it was built this way (`plans/`) | live | design | `cards/design-record.md` |
| session handoff — where the last session stopped; never cited | live | — | `cards/session-handoff.md` |
| assignment — coursework; derives from the game, feeds nothing back | live | — | `cards/assignment.md` |
| knowledge base — external reference; superseded calls get banners | live | design | `cards/knowledge-base.md` |
| Unreal port — parked post-capstone; wakes after 2026-09-01 ships | dormant | build | `cards/unreal-port.md` |
| assignment-7-old — superseded tree with duplicate interior names | leftover | — | `cards/assignment-7-old.md` |
| archive — `resources/_archive/`, retired drafts and frozen records | leftover | — | `cards/archive.md` |

## Scoped out, on purpose

- `.obsidian/` — editor configuration, not territory material.
- `phaser/src` subsystem detail (scenes, ui, systems, mode) — heaviest churn in the
  territory; claimed as one noun by `cards/phaser-build.md`, whose doors
  (`phaser/ARCHITECTURE.md`, `GAPS.md`) carry the interior map. Card-per-subfolder
  here would be photocopying the architecture doc.
- `game-project-ideas.md`, `game-project-resources.md` — a pre-Paca idea inbox and a
  link list; neither is state and neither couples to anything.
- `locations/` — a single art doc (`locations/appearance.md`); carried by the
  appearance.md entry in `collisions.md` rather than a card.
