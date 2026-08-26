# Slice Level-Layout — first-pass draft (game-34)

**Status:** spec-mode first pass, 2026-07-19. **Structure only — narrative content (H9) deferred** (per locked sequencing: the mechanical fill H4/H5/H8 hangs off *this layout*, not the story). Names are **placeholder flavor** (swap later — see "Flavor slots to fill"). Feeds Build **§4 / §6a** + the **ink prototype**.

**Sources:** `pnc-grammar` (6 gate archetypes · C1 lock · four families · five-field template · spatial grammar) · `gdd/` — [`13-scope-and-risks`](../gdd/13-scope-and-risks.md) (scope) / [`03-core-loop`](../gdd/03-core-loop.md) (mechanics) / [`06-world-and-progression`](../gdd/06-world-and-progression.md) (recognition) · [`ink-data-model`](../knowledge-base/narrative/ink-data-model.md) (how this maps to ink).

---

## Scope + design principle (Roc, 2026-07-19)

- **2 locations first — Town + Forest**, **~7–8 screens each**, but **progressively unlocked**: **3 screens reachable at start**, the rest opened by **knowledge-key gates**. **Stretch: a third location (Farm)** — the doc reserves a structural slot (§10) so it adds without rework.
- **Variable entry (Roc, 2026-07-19):** the player **chooses Town or Forest**, then starts on a **random one of that location's 3 start screens** — no fixed opening screen; the four-families demo is distributed across the start-trio (see §Opening).
- **Each location is a mini-metroidbrainia.** The map itself is the knowledge-key system: learning a phrase / reading a landmark / earning trust opens the next screen. "Knowledge is the key" is showcased *at the level of traversal*, not just puzzles.
- **⚖ Design law — knowledge lives in the player's head, not a flag (Roc, 2026-07-19).** Knowledge-gates are **performed / solved**, never flag-blocked: the player opens them by *doing the thing that requires the knowledge* (casting the phrase, asserting the cipher's meaning) — the game never checks a "visited X?" flag and **never hand-holds**. It *does* track, per run, whether the player **learned a thing here this run** — but **only as a narrative condition** (dialogue color). Solving a puzzle you "shouldn't" know yet (carried in your own head across lives) is a **reincarnation-awareness beat**, not an error.
- **The cross-location seam is the headline C1 move** — a fragment learned in the Forest opens a Town screen (and vice versa): the travelling-key (Laki), proving knowledge travels free.
- **H14 budget honored:** a day = one location · 3–5 screen-moves/day · 5-day run. Progressive unlock means early days have fewer reachable screens (low authoring load), later days more (the world "opens up").

---

## Legend

**Per-screen fields:** `Vibe` (1 line) · `Interactables` (forage · examinables w/ clue-tier · NPC-slots) · `Gate(s)` it holds · `Time-of-day` states (if any) · `Connects to`.
**Clue-tiers** (`pnc-grammar §3`): *ambient* (world-feel) · *soft-signpost* (hints a gate/key-type) · *hard-key* (carries the fragment a gate needs).
**Gate archetypes** (`pnc-grammar §2`): **Kadish** (know-hard/do-trivial · time-of-day) · **Teledahn** (one insight cascades) · **Garrison** (gate names its key-type up front) · **Ahnonay** (infer the world-state; landmark-aged-across-years) · **Laki** (learn here, apply there — the travelling key) · **Deduction-loop** (find→think→**prove**; the recognition gate).
**Time-of-day states** (`ink-data-model`): `morning · midday · evening` (+ `night` where a scene needs it) — authored art variants, **not a sim** (C3 line).
**Unlock status:** `[START]` reachable at run-start · `[LOCK: <key>]` = access needs `<key>`, **opened by *performing* the knowledge** (cast / solve / assert), not a flag-check or hand-hold (see the design law) · *relationship gates* (a neighbor's trust) = earned social access, a separate legit category. *The game's per-run "learned-here" tracking is narrative-only.*

---

## Flavor — placeholder, stood up for Roc to edit directly

The layout below is **stood up with placeholder flavor** (used throughout the tables); the structure is final, only the **physical place identity** is open. Edit these six in place — the gate/screen structure doesn't change either way:

1. **Town identity + central landmark** — what kind of town; the landmark that ages across years (Ahnonay-state). *Placeholder: the Lantern Arch on the Square.*
2. **Forest identity** — foraging woods? old-growth w/ ruins? *Placeholder: mixed woods with a stream, an old shrine, a cave.*
3. **The festival's home** — where the weekly build-up lands. *Placeholder: the Town Square → Festival Grounds.*
4. **Forageables / interactable classes** — what you gather + folk-magic vibe, so Collect/Make have real targets. **Confirmed spell components (H6): sticks · wool · grass · dirt.** *Placeholder (Roc to flavor/expand): herbs · river stones · feathers · lantern-oil.*
5. **1–2 anchor landmarks** — the aged-across-years objects. *Placeholder: the Lantern Arch (Town) · the Old Shrine (Forest).*
6. **Town↔Forest connection** — the path/gate between them. *Placeholder: the Forest Path off the Square.*

---

## TOWN — 7–8 screens (3 start · 5 progressively unlocked)

| # | Screen (placeholder) | Status | Vibe | Interactables | Gate(s) held / unlock | Time-of-day | Connects to |
|---|---|---|---|---|---|---|---|
| T1 | **Town Square** | `[START]` | The festival's home; the **Lantern Arch** landmark | forage: none · examine: Arch (*ambient→hard-key later*), notice-board (*soft-signpost*) · NPC-slot ×2 | **Show/Ask** intro (greet a neighbor) + the **Ahnonay landmark-state** (Arch aged across years). Part of the distributed opening (§Opening) | `morning/midday/evening` | T2, T3, Forest Path |
| T2 | **Market Row** | `[START]` | Stalls, trade, small folk-magic | forage: herbs, lantern-oil, **wool** · examine: stall goods (*soft-signpost*) · NPC-slot ×2 | **Make** intro (combine at a stall) | `morning/midday` | T1, T4 |
| T3 | **The Commons / Well** | `[START]` | A cluster of homes; daily life | forage: none · examine: well, doorsteps (*ambient*) · NPC-slot ×2 | **Use** intro (**ignite** a brazier / lantern — no effect on a person: receiver-determined) | `morning/midday/evening` | T1, T5 |
| T4 | **The Workshop** | `[LOCK: a learned recipe]` | Where Make gets deep | examine: tools, recipe-board (*hard-key*) · NPC-slot ×1 | **Unlock = Kadish-lock** (know the recipe → the door is trivial). Holds deep **Make** gates | `midday` | T2 |
| T5 | **A Neighbor's Home** | `[LOCK: trust / Show-Ask]` | Deeper social interior | examine: mementos (*hard-key* echo-carriers) · NPC-slot ×1 (a deep NPC) | **Unlock = Garrison-preview** (the door *names its key-type*: "they'll open when they trust you"). Holds a **Show/Ask** relationship gate | `evening` | T3 |
| T6 | **The Tavern / Inn** | `[LOCK: time-of-day]` | Evening social hub | examine: hearth, ledger (*soft-signpost*) · NPC-slot ×3 | **Unlock = Kadish time-of-day** (only opens in `evening`; a Garrison-preview names *time* as the key) | `evening/night` | T1 |
| T7 | **Festival Grounds** | `[LOCK: late — festival-week climax]` | Where the run's build-up pays off | examine: stage, lanterns (*hard-key*) · NPC-slot ×3 | **Holds the Deduction-loop RECOGNITION gate** (prove who a soul became — H16 assert→confirm) | `evening/night` | T1 |
| T8 | **The Old Shrine (Town)** *(stretch 8th)* | `[READ: the cipher — player knowledge]` | A quiet edge-of-town relic | examine: shrine carvings (*hard-key*) | **Reading the carvings = the C1 knowledge-demonstration** (assert the cipher; learnable at **F6** *or here* — bidirectional). **Reachable, not flag-locked**; seen-tracking = narrative only | `evening/night` | T3 |

---

## FOREST — 7–8 screens (3 start · 5 progressively unlocked)

| # | Screen (placeholder) | Status | Vibe | Interactables | Gate(s) held / unlock | Time-of-day | Connects to |
|---|---|---|---|---|---|---|---|
| F1 | **Forager's Clearing** | `[START]` | Sun-dappled edge of the wood | forage: herbs, feathers, **sticks, grass, dirt** · examine: trail signs (*soft-signpost*) · NPC-slot ×1 | **Collect** + **Show/Ask** intro. Part of the distributed opening (§Opening) | `morning/midday/evening` | Forest Path, F2, F3 |
| F2 | **The Stream** | `[START]` | Running water, a crossing | forage: river stones · examine: the ford (*soft-signpost*) | **Use** intro (**ignite** a fire-ring / gathered kindling — no effect on the water: receiver-determined) | `morning/midday` | F1, F4 |
| F3 | **The Grove** | `[START]` | Deeper, quieter woods | forage: mushrooms · examine: old carvings (*ambient→hard-key*) · NPC-slot ×1 | **Make** intro (field-craft: combine two forageables) | `midday/evening` | F1, F5 |
| F4 | **The Still Pool** | `[LOCK: spell-phrase "still the water"]` | A waterfall pool | forage: rare component · examine: pool bed (*hard-key*) | **Unlock = Kadish-lock** via the knowledge-key phrase (learned at F2/Workshop). *Metroidbrainia gate at the map level* | `midday` | F2 |
| F5 | **Old-Growth Hollow** | `[LOCK: an observation]` | Ancient trees, one chokepoint | examine: the great trunk (*hard-key*) · NPC-slot ×1 | **Unlock = Teledahn-chokepoint** — one insight here lights up **F6 + F7** at once (cascade) | `midday/evening` | F3 |
| F6 | **The Old Shrine (Forest) / Ruin** | `[LOCK: Teledahn cascade]` *(traversal)* | A ruin the past inhabitants used | examine: ritual marks (*hard-key* — the **travelling cipher**) | **Cipher-read = a knowledge-demonstration** (assert the meaning) — **bidirectional with T8** (learn here → read there, *or vice versa*); reachable, not flag-locked. **Kadish time-of-day**: marks readable only at `night` (moonlight). Seen-tracking = narrative only | `evening/night` | F5 |
| F7 | **The Cave** | `[LOCK: Teledahn cascade + light]` | Dark, deep, a payoff space | examine: cave walls (*hard-key*) · forage: deep component | **Unlock** via the F5 insight + a light-source knowledge-key. **Reward-space-as-destination** (`pnc-grammar §7`) | `night` | F5 |
| F8 | **Heart of the Wood** *(stretch 8th)* | `[LOCK: combine two fragments — Laki]` | The forest's deepest secret | examine: the heart-tree (*hard-key*) | **Unlock = Laki combine** (two fragments, "neither sufficient alone") | `evening/night` | F5 |

---

## Cross-location seam (the C1 travelling-knowledge — headline feature)

**Bidirectional (Roc, 2026-07-19), and NOT a lock/blocker** — the seam is *knowledge in the player's head*, not a flag the game checks (see the design law).

- **Forest Path** connects **T1 (Square) ↔ F1 (Clearing)** — the physical seam; a screen-move that swaps location. Both shrines are **reachable**; nothing gates walking up to them.
- **The travelling knowledge:** the **cipher** marks both the **Forest Ruin (F6)** and the **Town Old Shrine (T8)**. Reading *either* site's carvings is a **knowledge-demonstration** (assert the meaning, `pnc-grammar §2.6 deduction-proof-step`) — solvable by any player who understands the symbols, **from either site, any run, or their own head.** Learn at F6 → read T8; learn at T8 → read F6. **Bidirectional.**
- **The game tracks (per run) whether the player has *seen* the cipher — as a narrative condition only.** Reading a site *without having seen the cipher this run* (carried from a past life) fires a **reincarnation-awareness beat** — an NPC or memory-motif marks the uncanny familiarity. The **C1 soft reminder** (*"the marks here echo the ruin's"*) is a **pull** cue, never a push prompt, and **never a required step**.
- *(ink: the read is the deduction assert; `seen_cipher_this_run` = a read-count on the F6/T8 knot, tested **only** for dialogue branching — never to gate the read.)*

---

## Slice gate-map — featured archetypes (5-field stubs)

Four archetypes featured (not all 6). Five-field template per `pnc-grammar §6` (**Problem · Circumstance · Clues · Solution · The Idea**). Content is structural; specific phrases fill with H9/spell content.

**G1 — Garrison-preview (Neighbor's Home door, T5)**
- *Problem:* the door is closed to you. *Circumstance:* a deep NPC's home; you're still a newcomer. *Clues:* the door/NPC *names the key-type* ("come back when they trust you" / "needs the festival password"). *Solution:* raise the Show/Ask relationship state to the threshold, then the door opens. *The Idea:* **turn a dead-end into a world-issued live lead** (pull, not push).

**G2 — Laki travelling-knowledge (Forest Ruin F6 ↔ Town Old Shrine T8, bidirectional)**
- *Problem:* a site's carvings are unreadable until you understand the cipher. *Circumstance:* the same ritual-culture marks both sites; both are reachable. *Clues:* either site teaches the cipher (readable only at `night` — moonlight). *Solution:* **understand the cipher (at either site, or from a past life), then assert the reading** — a knowledge-demonstration, **not a flag-unlock**; bidirectional. *The Idea:* **knowledge travels free and lives in the player's head — the game never blocks or hand-holds, it only *notices* (a reincarnation beat if you knew it without seeing it this run).**

**G3 — Deduction-loop recognition gate (Festival Grounds T7)**
- *Problem:* which re-dealt NPC is the Soul you've been reading? *Circumstance:* the reshuffle doorway at the festival. *Clues:* essence descriptors gathered across screens/days (examine + Show/Ask), the anchor recognition-hook, the leitmotif. *Solution:* the **Obra-Dinn dropdown pick** + **batch-lock** confirm (H16) — a diegetic *prove* action, not a "confirm identity" button. *The Idea:* **the recognition mechanic at the emotional core — prove understanding, don't click to assert it.** (Inconclusive = "come back when you know more," not a fail.)

**G4 — Kadish time-of-day (Tavern T6 / Forest Ruin F6)**
- *Problem:* the thing can't be seen/used now. *Circumstance:* an authored `evening`/`night` state. *Clues:* a Garrison-preview names *time* as the key ("nothing to see until evening"; "the marks need moonlight"). *Solution:* return in the right authored state. *The Idea:* **the key is knowing *when* to look — pure knowledge, no dexterity/timing** (C3 authored-state, not a sim).

**Supporting:** **Teledahn** (F5 insight cascades to F6+F7) · **Ahnonay landmark-state** (the Lantern Arch T1 aged across years = the calendar-read).

---

## Opening — variable entry + distributed four-families demo (Roc, 2026-07-19)

**No single fixed opening screen.** The player **chooses to start in Town or Forest**, then lands on a **random one of that location's 3 `[START]` screens**. The four-families demo (the addressable-space contract, `pnc-grammar §1 Rule 4`) is therefore **distributed across each location's start-trio** — the 3 start screens are freely inter-reachable, and since a day is 3–5 screen-moves, the player naturally visits all three before the first `[LOCK]` gate, learning the full verb grammar regardless of where they land. Each demo signals *how to interact*, never *what to do next* (pull-not-push), with **why-specific feedback**.

**Town start-trio covers all four:** T1 Square = **Show/Ask** (greet a neighbor) · T2 Market Row = **Collect** (forage) + **Make** (combine at a stall) · T3 Commons/Well = **Use** (**ignite** a brazier / lantern — *no effect on a person*, receiver-determined).
**Forest start-trio covers all four:** F1 Clearing = **Collect** (forage) + **Show/Ask** (a forager) · F2 Stream = **Use** (**ignite** a fire-ring / gathered kindling — *no effect on the water*, receiver-determined) · F3 Grove = **Make** (field-craft).

*Starter spell = **`ignite`* (Roc, 2026-07-19): catches on wood/fire; **no effect on inappropriate targets** (a person, water). The "nothing happens" is itself the receiver-determined teach — magic here is **literal**, not whimsical-social.*

*Design note:* each location's trio is a self-contained tutorial cluster, so either entry point teaches the whole grammar before its first gate.

---

## Stretch — third location (Farm) structural slot

If added: **Farm**, same shape — 3 start screens (Yard · Field · Barn) + progressive unlocks (Orchard · Mill · Cellar · Loft…), one featured archetype not yet used elsewhere (e.g., an **Ahnonay-inferred-state** gate: read the field/season-state), and a **third C1 seam** (Farm↔Town or Farm↔Forest). Slots in without reworking Town/Forest.

---

## Ink-prototype notes (feeds the Inky build)

Maps cleanly onto ink (`ink-data-model`): each **screen = a knot**; **progressive unlock = a conditional divert/choice gated on a knowledge-key** (`{ KnownPhrases ? still_the_water } [Enter the Still Pool]`); **read-counts** track visited screens for free; **time-of-day** = `LIST TimeOfDay`; **`#` tags** emit the per-screen `GameplayTag` events. The **C1 travelling-key** = a `LIST` membership set in F6, tested at T8. Prototype the **T1 opening + one gated unlock + the Forest→Town seam** first (smallest slice that proves the loop) → Inky web-export = the canned-mode proof.

---

## Open / next (for Roc)

- **Flavor slots** (above) — edit the placeholders in place whenever.
- **Resolved 2026-07-19:** C1 seam = **bidirectional** (not a lock) · starter spell = **`ignite`** · opening = **variable entry** (choose location → random of 3 start screens).
- **Then:** the ink prototype is deferred (**game-36**, post-GDD).
