# game-project Ideas

- roguelike cozy game
- look into godot or that simple game engine as backend
- roguelike where you compose songs for an album and you progress by collecting instruments and melodies
- non-linear map movement — player chooses different areas to explore freely; areas unlock based on conditions
- meal planning game theme — collect ingredients, compose meals (structurally parallel to the album roguelike)
- agentic world morph — world morphs given params; user explores and discovers story; solving a mystery? or makes a snapshot of the world?
- story iteration tool — agent crew that generates story iterations; dev-pipeline tool that composes with any game concept (maps to class Assignments #3/#8)
- exploring a world after the BBEG has been defeated
- create moments of wonder — you want to stop and admire the beauty of the world or take in a moment
- context of what you do gets saved; through a preset ICM it gets re-ingested as context to generate future content, and the ICM decides how that wires back into the game
- hobbies as themes: rock climbing? dancing?
- figure out what happened in a given scene — post-apocalyptic? but maybe smaller scope to avoid the apocalyptic trope
- FFT-style tactical play — parked in background; maybe introduced later once we figure out WHAT the player does beyond point-clicking and dialogue trees
- save-scumming as diegetic mechanic — honor reloading/branch-peeking as a player decision; save count and abandoned branches feed how the game responds (NPCs get déjà vu, bouts of confusion referencing other branches); a save wipe clears everything but wipes are also remembered, so there's a nostalgic feeling toward the past; option: the game continues after a full memory wipe; hidden option to truly delete all hard-file memory (technical decision)
- the log as central artifact — if knowledge is the progression, knowledge needs a body: an evolving journal that auto-fills, shows connections, and marks gaps; it is at once the diegetic save file, the deduction workspace, the curation interface, the ICM's visible face, and the thing a save-wipe wipes; also holds inventory with notes, items can replay memories attached to them, and an Outer Wilds rumor-map-style graph shows connections between people, places, and items
- carry one — each room ends with choosing ONE thing to take onward (item, recording, memory); it affects how the next room reacts; chains rooms causally, doubles as the diegetic roguelite bonus and the re-roll surface (what's available to carry re-rolls between visits; evidence never does)
- cosmic hide-and-seek — reincarnation story concept, the near-locked candidate (full write-up: resources/concept-dig-notes.md, Session 3)
- folk spells from frieren — collectible everyday magic; also tools that expand how you read rooms and people
- notebook carried everywhere — game-curated log plus a free-text notes page the player types into; small bag (1–2 items) growing to a larger pack over time
- hub room you can rearrange with your mementos
- the notebook writes itself — tone-fitting "this will be remembered" signal: quiet quill-scratch for minor moments, brief memory-motif for significant ones, full vignette for past-life awakenings; ICM can occasionally acknowledge the player's own typed notes
- personas are lives, not occupations — "the life you were born into this time" (witch's apprentice, child who sees spirits, elder, shopkeeper's niece); lenses are doors never multipliers (access/perception, not power); dealt at first → increasingly chosen as you awaken; the final unlock is choosing not to return (the ending); vertical slice ships one persona
- arrival as license — every cycle you've just arrived in a new life; newcomer-hood licenses the verbs (no job needed); world as quest-giver: pull not push; errand web as gentle quest structure (ICM-generatable); genre alibi: cozy life-sim on the surface, reincarnation mystery underneath
- design principle: trust the player — don't engineer forced mystery-anomaly stacks or force answers to "why explore"; the world's interest emerges from its liveliness and the player's own curiosity
- nested time architecture — day (soft world-as-limiter: shops close, light fades, no meters) → week = the run, progressing toward a recurring yearly event (the festival = the deadline, likely the declaration window) → cycle = the incarnation → timelines = save slots
- save slots are parallel universes — choose a character type per slot; actions in one timeline affect another; the hub is shared across all timelines (the waystation outside the cycle) and pools findings; max 3 timelines even in the final game; completing a game cycle frees a slot, or you can choose to delete one
- knowledge-key puzzles (chronoquartz steal) — locks whose key is information from a previous loop or another timeline, not an item; puzzles made of remembering
- memory-based magic — components (berries, rocks, world items) + the magic word = cast; recipes learned through interactions in the world or discovered accidentally; the recipe is knowledge, so magic is the metroidbrainia system
- collections and persona gradients — collect magic, artifacts, mementos; start as the mage (stated goal: collect all magic), later unlock the artist (makes art to give people); persona affects how well you do things — mage casts well but draws poorly, artist draws well but has low mana
- gradient rule — doing a thing poorly produces different-but-delightful outcomes, never failure (the mage's wonky drawing is still a gift, maybe loved because it's terrible)
- inverted roguelike map = the calendar — no branching node-map; each day choose one location (city / forest / farm), operate there for the day; locations open into multiple areas as you progress; after a set number of weeks, the major event; route choice becomes attention allocation
- quests are self-directed — a pure collector/decorator playthrough (never talking to people) is fully valid; engaging with people is what surfaces the story
- pack-triage run ending — end a run early to leave with your items when the pack can't fit everything you want to keep, or continue with only what fits; knowledge in your head always travels free

_(captured 2026-07-17, during GATE-2 review — for Phase-3/Build-GDD, not yet acted on)_
- same scene, different views — reframe one scene at different zoom levels and different focus (down toward the ground vs. up toward the sky) for variety and for the "large-scale OR intimate zoom" dial (→ `going-big-brief`; `gdd/09-art-direction.md`)
- varied pacing for tension — mostly slow with occasional fast; tension comes from the contrast, not absolute speed (→ `voice-style-guide` §6; `going-big-brief`)
- the super-slow pan that only completes if you linger — a reveal that pays off only for a player who sits with the scene (a discovery for the one who "walked away" and stayed); a self-created *ma* beat / concrete going-big wonder mechanic (→ `going-big-brief` §5 static-scene-timing / L3 self-created *ma*)
- workflow agent — Jira project manager — the PM/task-board agent, concretely on Jira: decompose `gdd/` into a board, track built-vs-pending (→ `dev-crew-architecture` §8A "Project Manager")
- workflow agent — audio asset coordinator — organizes/tracks audio assets (naming, manifest, gaps); sibling to the Audio-Tag Agent, upstream of hookup
- workflow agent — audio hookup — wires sounds to events/triggers and emits the asset list (→ `dev-crew-architecture` §8A "Audio Implementer"; likely a mechanics+agent hybrid)
- workflow agent — QA playtester (permutations of options) — already the standing Agent 5 (QA/Playtest); reconfirming the choice-permutation-coverage focus (→ `dev-crew-architecture` §7A)
- lowest common denominator = a choose-your-own-adventure book — the simplest playable form of the branching narrative; a clean frame for the **canned mode** / the minimal pipeline output (→ two-mode architecture; `gdd/11-ai-agents-and-pipeline.md`)
- persona-driven generation loop — feed a persona in → how does the world respond, how does that person respond, how do they link with others? — the reaction/relationship-web core; a concrete agent-pipeline test and the heart of the ICM + rumor graph (→ `dev-crew-architecture` Narrative Architect + persona-card schema; receiver-determines-outcome rule; H1/H2 + rumor-graph H16)
- rapid-prototyping the canned mode — the choose-your-own-adventure LCD can be proto'd cheaply *before* Unreal: a plain CYOA script, or a simple HTML page with clickable on-screen zones (different areas) — validate the loop fast, then port. Connects to H18 format (rubric rewards clean HTML) and the two-mode canned path (→ pitch P5; `dev-crew-architecture` two-mode). **Strong candidate tool: ink + Inky (inkle)** — Inky exports a self-contained HTML page (inkjs), and its preconditioned-atomic-content model *is* the Heaven's Vault approach; a "canned path" = a compiled ink story file (deterministic JSON), and ink could double as the **Content Agent's output format** (agents write ink → compile → canned mode). Keep two uses distinct: prototyping tool (clear win) vs. shipped Unreal runtime layer (needs a plugin/bridge — verify). See resources row for links.

cozy-research
- spiritfarer
- a storied life
- frieren: beyond journey's end — slice-of-life moments that hit unexpectedly when past significance is remembered
- studio ghibli
- animal crossing — real-clock world, community rhythm, life-verb routines
- stardew valley — daily-ritual verb set, seasons, relationship progression

rogue-research
- slay the spire
- cartopoli?
- hades
- absolum — world map where sections unlock as you progress, but a run can start in any part of the world

research
- good game design
- schell games game design

mechanics-research
- return of the obra dinn — audio-first death scenes (sound plays in darkness before the diorama resolves), out-of-order chronology the player assembles, rule-of-three fate validation (anti-brute-force), cross-scene synthesis deductions
- oneshot — tone wrong, mechanics interesting: the game as an entity that knows and manipulates its own save; lineage for continue-after-memory-wipe
- pentiment — dialogue options and the "this will be remembered"-style acknowledgment (we want a tone-fitting equivalent); character backgrounds gate which clues you can read — occupation/persona-as-lens, shipped and proven
- chronoquartz — time-loop puzzle adventure, hard budget of 10 turns per loop, knowledge carries across loops (metroidbrainia); candidate model for run boundaries: a turn budget makes every action a weighted decision
- majora's mask — the festival-deadline loop precedent: three days counting down to the Carnival of Time; urgency and melancholy with no fail state; Bombers' Notebook as precedent for our auto-filling log — tracks NPC schedules, troubles, and kindnesses across loops, and makes helping people the collectible
