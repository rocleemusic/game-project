# screen_spec Schema

The typed form of a screen. The layout/graph pass emits it; code compiles it. It formalizes the legend of [`../../resources/level-layout_draft.md`](../../resources/level-layout_draft.md) — it does not replace it. **The layout draft's structure is ratified** ("the structure is final, only the physical place identity is open"). So the slice's screen_spec instances are transcribed from the draft's tables, never regenerated. New screens (the Farm stretch, expansions) follow the same path: human layout intent in, Architect formalization out.

**Who does what.** Roc seeds layout intent (the draft, flavor edits). The Narrative Architect formalizes it in the layout/graph pass: screen_specs, the scene graph, and choice_nodes (`choice-node-schema.md`) — one scoped call type with its own lean input bundle. Code mints IDs, resolves permutations (seeded, at day-start), compiles gates to ink guards, and exports `graph.json` for the review tool. QA walks the result. The build-plan row in [`../../gdd/11-ai-agents-and-pipeline.md`](../../gdd/11-ai-agents-and-pipeline.md) carries this ownership (updated 2026-07-29): the human authors layout *intent*, the Architect owns its formalization, code owns its assembly.

## The spec

| Field | What it holds |
|---|---|
| `screen_id` | Code-minted, stable. The draft's T1/F4 codes carry over. The ink knot name derives from it by the address rule in `../build-loop.md` (`T1` → `=== t1 ===`); the `#screen:` tag keeps the ID form. |
| `location` | `town` · `forest` (· `farm` reserved). |
| `name` | Placeholder flavor until Roc solidifies it. Renaming never changes `screen_id`. |
| `status` | `start` · `locked(gate_id[, gate_id])` · `reachable(gate_id)`. These are the draft's `[START]`, `[LOCK: key]`, and its third category: a knowledge-demonstration site that is never blocked (T8's `[READ]`, the shrines) — walking up is free, the *demonstration* is the gate. A relationship lock (T5's trust door) is `locked(gate_id)` with a Signpost gate. **A lock may name two gates — F7 The Cave needs the F5 insight *and* a light-source key (approved, Roc 2026-07-30). Conjunction only: both keys, always. There is no OR form; a door openable two ways is two doors.** Any lock opens by *performing* the knowledge, never by a flag-check (the design law). |
| `vibe` | One line. |
| `gates` | The gates this screen holds: `{ gate_id, archetype, five_field_ref }`. The archetype enum is one word each, named for what the gate does (renamed at Roc's direction, 2026-07-29): **Knowledge** — know it and the door is trivial; includes knowing *when* to look. **Cascade** — one insight opens several places at once. **Signpost** — the gate names its own key up front; the draft's `-preview` forms are Signpost entries with `preview: true`. **Landmark** — read the world's state from an observed thing (an aged arch, a season); may ride as an examinable's state instead of a lock. **Traveler** — knowledge learned in one place applies in another. **Proof** — prove the deduction diegetically; the recognition gate. **Demo** — the place a verb is first taught (approved, Roc 2026-07-30). A Demo blocks nothing and has no key: it is the record of where Collect, Make, or Use gets shown to the player for the first time, kept as a gate entry so the tool and the scene-mapping instrumentation can see it. It is the one archetype that never appears in a `status` lock; a Demo that blocks passage is a defect. Mapping from the layout draft's and pnc-grammar's Myst names: Kadish→Knowledge · Teledahn→Cascade · Garrison→Signpost · Ahnonay→Landmark · Laki→Traveler · Deduction-loop→Proof. Those docs keep their names; this enum is the schema's. The five-field template (Problem · Circumstance · Clues · Solution · The Idea) is unchanged from pipeline step 7. |
| `examinables` | `{ id, clue_tier (ambient · soft-signpost · hard-key), promotes_to?, region, knowledge_flag? }`. `promotes_to` covers the draft's "ambient→hard-key later": the tier it becomes, plus the predicate that flips it. **`knowledge_flag` (added 2026-08-07, GP-111)** is the phrase examining the thing records — the same vocabulary as a `knowledge_flag` state_action and the `knows(phrase)` predicate, so a flag set here opens exactly the paths a choice-set flag would. This is R5's pickup path (`../../plans/2026-08-03-storyline-authoring-process.md`): a missed thing stays in the world, and looking at it later hands the player the fact the closed conversational route would have. The look stays **sticky and re-clickable** and records **once** — the emitted stitch guards on `not (KnownPhrases ? phrase)`, so nothing can key off re-looking (check 2). Optional: an examinable that only shows the player something sets nothing. A thread document that declares a flag the build does not set is `../guardrails.md` check 11. |
| `forage` | The screen's free-pickup components, from the draft's lists. Flavor-level gathering: no slot, no roll, no scarcity. Anything whose *presence should vary* belongs in `item_slots`. If both name the same component, the slot decides spawning and `forage` is set dressing. |
| `npc_slots` | Capacity per time_block: `{ time_block, count, restrict? }` — the draft's "NPC-slot ×2". `time_block` values are the members of `TimeOfDay`. One name for one concept: `time_block` is the field, `TimeOfDay` its ink LIST, `time_of_day` its predicate. Optional `restrict: deep` narrows a slot to a deep NPC — T5 A Neighbor's Home is a trust-locked social interior whose one slot is a deep NPC only (approved, Roc 2026-07-30). A slot with no `restrict` takes anyone. **Capacity only.** Who stands in a slot on a given day is the permutation resolver's output (`../../resources/permutation-design_draft.md`), never authored here. |
| | **Story-NPC guarantee (ruled, Roc 2026-07-30).** A soul whose thread is live is guaranteed a slot on the **main screens** — the hub and the screens open by default (T1 · T2 · T3 · F1 · F2 · F3). T7 Festival Grounds carries a story-NPC slot too, drawn more rarely. The guarantee is filtered by the role→workplace table (`../../tools/resolver/data/role-workplace.json`): a soul appears only where their role reaches, so a town-anchored soul does not surface on a forest day and that thread waits. Placement prefers screens the player can enter today; locked screens may hold slots once specced, and the draw falls back to unlocked ones. |
| `item_slots` | `{ slot_id, region, bucket: [{item, weight}], respawn_rule, conditions }`. `screen_id` is implicit from the containing spec; the resolver denormalizes it into `graph.json`. A slot is a marked spot; the bucket is what may appear there. An `{empty, weight}` entry encodes "nothing appears." Seeded roll at day-start. Buckets ship keyed to the confirmed components (sticks · wool · grass · dirt) plus placeholders. The slot layer is independent of the deferred item derivation (`../content-stages.md` stages 4–6). |
| `time_states` | Authored variants from `LIST TimeOfDay = morning, midday, evening, night`. `night` is this schema's extension of the data model's original three; the resolver declares the 4-member LIST in `state.ink` (`../build-loop.md`). Authored art states, not a sim. |
| `connects_to` | Adjacent `screen_id`s. The town↔forest seam is an edge annotation, not a screen: `F1 (seam: forest_path)`. The draft's Forest Path is the *name of that edge* and gets no `screen_id`. Topology is stable across lives — the metroidbrainia law depends on it. |
| `regions` | Named areas on the screen image: `{ region_id, shape }`. A shape is `rect {x, y, w, h}` or `polygon [[x,y], …]`. All coordinates are normalized 0–1 from the image's top-left, so one region survives any image resolution. Examinables and item_slots reference regions by id. Feeds the review tool's clickable greybox; placeholder rectangles until images exist. |

## The predicate vocabulary (availability_conditions compile from this)

These are the only predicates a lock, a choice_node, or a dialogue guard may use. Two rows carry a scope rule: `seen(...)` and `bond_band(...)` may color dialogue but **never gate a lock or an essence step**. Each predicate maps to one ink declaration. The resolver emits every declaration below into `state.ink` (`../build-loop.md`). Base constructs come from `../../knowledge-base/narrative/ink-data-model.md`; the ones this schema adds are marked *(new)*. Code compiles the predicate. The Architect never writes raw ink.

| Predicate | Meaning | ink declaration it compiles against |
|---|---|---|
| `current_screen = X` | Player is on screen X | the knot itself (position is structural) |
| `time_of_day = X` | Screen's authored state | `LIST TimeOfDay = morning, midday, evening, night` |
| `day >= N` | Day of the cycle. N ∈ 1–5 in the slice (`VAR day = 1` of 5; the cycle is 5 days now, expandable) | `day` VAR test |
| `npc_present(soul)` | Soul stands in one of this screen's slots now | *(new)* `VAR present_<soul>`, holding a screen_id or `none`; the resolver writes it at day-start |
| `item_held(item)` | In the satchel | *(new)* `LIST Satchel` membership (`Satchel ? item`) |
| `item_in_slot(slot)` | The slot's roll produced an item and it remains | *(new)* `VAR slot_<slot_id>`, holding an item or `empty`; written at day-start, emptied on pickup |
| `knows(phrase)` | Knowledge-key held | `KnownPhrases ? phrase` |
| `seen(knot)` | Visited or read this life. **Dialogue color only, never a lock** (the design law) | read-count |
| `bond_band(soul)` | Coarse read-only band: `low · mid · high` (thresholds belong to the persistence engine, mirrored in). **Dialogue color only — never a lock or an essence gate** (check 2: bond never gates an essence fact) | `VAR bondLevel_<soul>`, mirrored. Mirror in, event out; ink never assigns it |
| `threads_moved(N)` | At least N of the live arc threads have moved at least once this life (added 2026-07-30, Roc — the Arch promote formula's first input) | *(new)* `VAR threads_moved`, host-written, mirrored in |
| `role_goals_advanced(N)` | At least N role-goals have advanced a stage this cycle (added 2026-07-30, Roc — the formula's second input; thresholds tune in `tuning.json`) | *(new)* `VAR role_goals_advanced`, host-written, mirrored in |

Anything not in this table is not a predicate. A condition that needs a new one is a schema change at the gate — the same rule as `state_actions`.

## Worked instance — T1 Town Square (transcribed, proving the legend maps 1:1)

- `screen_id: T1` · `location: town` · `name: "Town Square"` (placeholder) · `status: start` · `vibe:` the festival's home; the Lantern Arch landmark.
- `gates:` `{ G-T1-showask, archetype: Signpost, preview: true, five_field_ref: opening Show/Ask intro }` · the Landmark state (the Arch aged across years) rides as an examinable state, not a lock.
- `examinables:` `{ arch, clue_tier: ambient, promotes_to: { hard-key, condition: RULED (Roc, 2026-07-29) — a formula over how far the town's stories have moved: NPC arc-thread progress (`thread_move` ladders) plus role-goal progress. Bond is not an input (dropped by Roc's ruling; check 2 bars bond from gating). The Architect proposes the exact predicate at the layout pass; Roc gates it. }, region: r_arch }` · `{ notice_board, clue_tier: soft-signpost, region: r_board }`.
- `forage:` none.
- `npc_slots:` `{ morning, 2 } { midday, 2 } { evening, 2 }`.
- `item_slots:` none in the draft; the schema permits adding one without touching structure.
- `time_states:` morning · midday · evening.
- `connects_to:` T2, T3, F1 (seam: forest_path).

Every legend field of the draft's T1 row lands in exactly one spec field. Nothing is left over. The only additions are typings the draft left at prose level — the seam annotation, `preview: true`, the ruled promote condition — each marked as such. That is the schema's acceptance test.

## What this schema refuses

- **No generated topology.** Screens, gates, and connections are authored. Permutation touches contents — who is present, what spawns, which leads are live — never the map. **Ruled (Roc, 2026-07-29): Shape A, pocket reserved.** The bounded screen-pool pocket stays a full-game expansion slot (`../../resources/permutation-design_draft.md`); if it ever ships, this section gains its rules then.
- **No simulation.** Time states are authored variants. NPC presence is a seeded draw into declared capacity, not a schedule sim.
- **No flag-gates.** `seen(knot)` colors dialogue only. A lock that checks a visited-flag instead of a performed knowledge-demonstration is a defect against the design law.
