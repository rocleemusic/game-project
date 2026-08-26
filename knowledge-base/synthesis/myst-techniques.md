---
kind: synthesis artifact
artifact: myst-techniques
type: borrow-menu
built: Phase 2 (strong-model synthesis pass)
sources:
  - myst-ages/kadish-tolesa.md
  - myst-ages/teledahn.md
  - myst-ages/laki.md
  - myst-ages/garrison.md
  - myst-ages/ahnonay.md
  - myst-proposal/proposal-page1.md
  - myst-proposal/proposal-page2.md
  - myst-proposal/age-myst-island.md
  - myst-proposal/age-mechanical.md
  - myst-proposal/age-selenitic.md
  - myst-proposal/age-stoneship.md
serves: [H4, H7, H8, H9, H16, H17, gdd-structure, scope]
governing-rule: "Rule #4 — this is a MENU, not a decision. Roc chooses; the recommendation is advisory."
---

# Myst Techniques — a Borrow-Menu

**How to use this menu (Rule #4).** Every row below is an *option Roc may adopt*, not a
decision already made. The **Recommendation** column (Adopt / Adapt / Skip-for-scope) is
advisory only — a strong-model opinion, never a lock. The synthesizer's job was to *extract
the grammar* from the Myst/Uru Age docs + the original Myst proposal, cluster it by theme,
and cross-reference each technique to the GDD hole(s) it serves. It is **not** to invent
game content — no NPCs, items, story, or spells appear here; those are Roc's. Where two or
more Ages teach the same pattern, they are merged into one row citing all sources, so this
is an integrated menu, not a per-note dump. Read a group, pick the rows that fit the
six-week slice, and carry the winners into the Phase-3 specs (`pnc-grammar`,
`gdd-structure-model`). The final section lists the open borrow-or-not calls this menu
surfaces so nothing is decided by omission.

**Grounding note.** Every claim cites the source Age/page. The Myst material independently
converged on our two locked mechanics — the **knowledge-key metroidbrainia** (knowledge
itself is the lock) and the **informational-feedback law** (a wrong action must teach why).
That convergence (see `coverage-map.md` §3 signals #1–#2) is why this is the strongest H4/H7/H8
material in the KB. The recommendations are filtered through the LOCKED PILLARS
(non-violent · strategy-over-dexterity · discovery-is-the-reward · cozy rhythm ·
world-as-quest-giver/pull-not-push · trust-the-player · informational-feedback law) and
toward THIS game — a cozy reincarnation-deduction roguelike whose "map" is a festival week
recurring across years within one life.

---

## Group 1 — Gating & puzzle grammar (→ H4 / H7 / H8)

The knowledge-key patterns. These are the on-genre core: the physical action is trivial once
you know *what* the puzzle is actually asking, so the lock is knowledge, not dexterity.

| # | Technique | Source (Age / page) | What it is | Serves | Recommendation |
|---|-----------|---------------------|------------|--------|----------------|
| 1.1 | **Knowledge is the lock** (negative-space gating) | Kadish Tolesa §2 (all 5 puzzles); Teledahn §2 (periscope solar-lock) | The exit/answer is *physically present but not perceived* until the player knows what to look for (hidden door, unlit path, the number *not* shown). One elegant observation, not a code or an item, opens the gate. | H4, H7, H8 | **Adopt** — this *is* our locked memory-based metroidbrainia rendered as puzzle grammar. The single most on-thesis borrow in the KB. |
| 1.2 | **One chokepoint unlocks a chain** (causal dependency) | Teledahn §2 (periscope → power → camshafts → drain → caves); Garrison §2 (gear-room power restore unlocks all doors/elevators at once) | A single "aha" restores a world-power-state that then enables 2–3 downstream levers, each gating one new space. Depth without a long puzzle count. | H4, H7 | **Adopt** — high payoff-per-puzzle; ideal for a slice. Cap the downstream fan-out at 2–3 so it stays cozy, not sprawling. |
| 1.3 | **Blocked path teaches the key-type before you find the key** (power-out metroidbrainia) | Garrison §2 (dead doors say "power is the key"); Myst Island (no voltage → elevator/spaceship simply won't run) | The obstacle itself names what's missing, so the player forms the goal by reading the world — not from a quest-giver. The broken alternate route *is* the puzzle. | H4, H7, H8 | **Adopt** — directly satisfies *world-as-quest-giver (pull, not push)*: the world sets the goal, no NPC hands it over. |
| 1.4 | **Cross-space knowledge-key that travels** (learn cipher here, apply it there) | Laki §2 (Game of Fighters teaches number-symbols → used as pace counts on Treasure Island); Mechanical (alignment-gear number from Myst library → Rotator Room); Kadish §2 (store clues frame the Age); Ahnonay (spatial memory of Sphere 1 keys Sphere 2's blind jump) | Two information fragments in different locations, neither sufficient alone; the player carries knowledge across scenes to open a lock. This is the metroidbrainia "key that travels." | H8 (metroidbrainia), H7 | **Adopt** — the purest fit for our knowledge-as-key core and for the calendar's cross-year echoes. **Guardrail:** cross-scene memory must get a soft in-world reminder (per Mechanical Watch-out) or it reads as arbitrary — reconcile with informational-feedback law. |
| 1.5 | **Wrong action teaches why** (informational feedback at the system level) | Teledahn §2 (buzz + contextual refusal message out of order); Ahnonay §2 (scare Quabs into water → plates trip; link out early → sphere won't rotate); Myst Island (wrong breaker → gear puzzle visibly fails) | A failed attempt gives a contextual, *localized, observable* consequence that illuminates the mechanism — never a silent or generic fail. | H8, H7, H4 | **Adopt** — external proof of our locked informational-feedback law. Make the feedback *visible in the world*, not a dialog box. Non-negotiable on every gate. |
| 1.6 | **A central object is the puzzle's read-out** (clock-as-world-state-map) | Ahnonay §2 (25-light clock reveals occupied plate-wedges); Myst Island (landmarks double as progress read-outs); Teledahn §2 (indicator lights mirror state across floors) | One always-visible object reflects current world/puzzle state; the game never explains the correlation — the player *infers* the interface by observation. | H4, H8, H16 | **Adapt** — keep the principle (a single indicator object reflecting state); **compress the count.** 25 wedges is screen-noise in P&C — use a dial/display/mirror reflecting a few states. |
| 1.7 | **Ritual re-enactment as puzzle** (you perform the inhabitants' act) | Laki §2 (weigh yourself with the fighters' counter-weights, as they weighed the jewel) | The player solves by performing the same physical act the world's original inhabitants performed — learning the history *by* doing the ritual, and vice-versa. | H4, H9, H7 | **Adapt** — beautiful fusion of puzzle + story + *discovery-is-the-reward*. Strong candidate for one signature puzzle; needs a diegetic ritual from Roc's world (don't force it onto every gate). |
| 1.8 | **A tool you already own becomes a key — under the right condition** (saved-link exploit) | Ahnonay §2 (your own Linking Book unlocks Sphere 4, but only if used at the right rotation moment) | An item the player already possesses opens a new area once they understand *what condition must exist* when they use it. The knowledge (the *when*), not the item, is the gate. | H8 (metroidbrainia), H7 | **Adapt** — excellent metroidbrainia shape and a natural fit for a memory-key game. Drop Ahnonay's two-player timing dependency (see 5.1); make the "condition" a knowable world-state, not a coordination stunt. |
| 1.9 | **Multi-state objects that teach the system before the next step** | Teledahn §2 (bucket has 4 legible states: unpowered / running-empty / running-with-rider / stopped); Ahnonay (water level = different reachable zones per sphere) | Each object visibly steps through states so the player learns the system incrementally, one safe state at a time, before an action depends on it. | H4, H8 | **Adopt** — pure *strategy-over-dexterity* teaching. Keep state counts small and each state visually distinct. |
| 1.10 | **Single sensory/mechanical spine per Age** (one grammar, learnable from the space) | Selenitic (whole Age organized around sound); Stoneship (water-level + light as the only two axes); Kadish (darkness/moonlight as the puzzle medium) | All interactions, locations, and gates derive from *one* coherent sensory grammar, so the player infers puzzle logic from the environment before meeting the puzzle. | H4, H17, H16 | **Adopt** — coherence is scope-friendly and cozy: two or three mechanical axes per scene is plenty (Stoneship proves 4–6 nodes on one axis). **Replace any precision input** (Selenitic's dish-aiming) with a knowledge equivalent — pairing, sequence recall, pattern-match — per *strategy-over-dexterity*. |
| 1.11 | **Multi-goal availability** (never a single-chain dead-end) | Pilot (`point-and-click-puzzle-design.md` — offer several goals so a stuck player pivots); tension flagged in Stoneship §Watch-out (strictly sequential chain can stall) | Keep 2+ soft goals live at once so a stuck player pivots instead of stalling. This is the cozy-rhythm safety valve against Kadish/Stoneship's strict linear chains. | H4 | **Adopt** — reconciles the Ages' linear chains with our *cozy rhythm* pillar. Any borrowed chain (1.2) must run in parallel with at least one other available goal. |

**Pillar-tension flags in this group:**
- **Strict linearity** (Kadish's 5-room hidden-exit chain; Stoneship's sequential chain) *tensions with cozy rhythm* — always pair with 1.11.
- **Pressure-plate "clear everything" locks** (Ahnonay) can feel like a completionist sweep, not discovery — *tensions with discovery-is-the-reward*; only use if the spatial hunt is interesting in itself.

---

## Group 2 — Environmental storytelling (→ H9)

Backstory embedded in space and objects, never narrated. This group is our best-covered hole
and the on-screen proof of the game's **retrospective-significance** core: significance
arrives later, read from the ordinary — the same beat Frieren does in prose, realized
spatially.

| # | Technique | Source (Age / page) | What it is | Serves | Recommendation |
|---|-----------|---------------------|------------|--------|----------------|
| 2.1 | **Object-state-as-time-passage** (delta storytelling) | Kadish §3 (store painting = courtyard *before* overgrowth; present = ruin); Ahnonay §3 (same cabin: smoking → roofless → foundation across spheres; Maintainer Markers degrade in sequence); Garrison §3 (collapse/rust = the only clock); Myst Island (Sunken Ship's submersion implies departure); Stoneship (dereliction encoded in spatial state) | The player reads elapsed time as the *delta* between a prior state (shown in an artifact or an earlier area) and the present ruin. No exposition. | H9 | **Adopt** — the single strongest cross-Age technique and a **native match for our engine**: a festival week recurring across years *is* delta-storytelling. Same place, later year = the Kadish/Ahnonay cabin beat, built into our premise. |
| 2.2 | **Historical strata / layered reuse** (one space, three purposes) | Teledahn §3 (pristine → industrial collapse → criminal reuse → present occupation); Laki §3 (architecture shape reveals original function) | Design each location to show evidence of (1) an original benign purpose, (2) a transformation/misuse, (3) the current occupation's traces. Objects accuse before any text does. | H9 | **Adapt** — powerful but content-dense; **Skip the full three-strata depth for the slice**, adopt the two-state minimum (was / is). Perfect for a later Age. |
| 2.3 | **The moved / missing object as power dynamic** | Teledahn §3 (workers' linking book relocated to Sharper's office = who commandeered the exit) | A *single repositioned or absent* object conveys a whole social/power relationship — cheap, precise, no text. | H9 | **Adopt** — highest story-per-asset ratio in the whole set. One object placement = one relationship. Use liberally. |
| 2.4 | **Bodies/evidence in the functionally correct room** | Laki §3 (skeletons in the cage = prep area, carcass in the grave pit = disposal); Kadish §3 (skeletons of family + the vault skeleton with open linking book) | Place material evidence *where it logically happened* so the player reconstructs the system from location alone — the room's purpose plus the evidence = the story. | H9 | **Adapt** — the *placement logic* is gold; **soften the content** for our non-violent core (evidence of a life/loss, not gore). The technique is about legible placement, not death. |
| 2.5 | **Institutional logic encoded in world physics** | Garrison §3 (no night cycle = deny enemies darkness; rotation physically prevents Link-writing); Kadish (a stream's minerals stop tree growth — a physical *why* for every oddity) | The world's rules *are* the lore: a physical fact of the environment (the sky, a rotation, a mineral) carries the backstory, replacing a text panel. | H9 | **Adopt** — elegant and text-free. Every environmental oddity should have a diegetic *why* the player can deduce. |
| 2.6 | **Ambient off-frame life** (visible-but-inaccessible mystery) | Garrison §3 (Barracks shows flickering "life" but no access/explanation); Laki §3 (telescope aimed at the empty fighter homeland); Frieren pilot ("imply stuff going on beyond what we can see") | A space or view that shows signs of life but stays inaccessible/unexplained generates curiosity at near-zero content cost — the world doesn't vanish off-frame. | H9, style-guide | **Adopt** — cheap curiosity engine and squarely on our Frieren voice. **Guardrail:** keep it interpretable, not a promised-then-unpaid thread (Frieren pilot's guidance-vs-confusion dial). |
| 2.7 | **NPC personality read entirely from their objects** (character present in absence) | Teledahn §3 (Sharper's obsession readable from journals/maps/aquarium — he's never on screen); Garrison §3 (guard-lounge furniture, trophies); Mechanical (Throne-Room cache items = character, no dialogue) | A character's traits emerge from the arrangement of their belongings, with the person absent. Characterize by their stuff, not stated traits. | H9, H2 | **Adopt** — pairs exactly with the narrative-track "characterize by repeated small behavior." Roc supplies the actual objects/traits; the *method* is the borrow. |
| 2.8 | **Ambient-life budget** (some elements are life-feel only, non-interactive) | Teledahn §3 (shooters/bug-birds "provide a feeling of life... will not interact"); Laki §3 (audio carries life-feel where visuals are sparse) | Explicitly designate a class of elements as decorative life-feel (often *audio*), separate from the interactive layer — keeps the interactive layer clean and the world alive without puzzle debt. | H9, scope | **Adopt** — a scope-discipline move as much as a story move. Draw the interactive/decorative line explicitly in each scene spec. |
| 2.9 | **Materialize the thesis in a final tableau** (vault payoff) | Kadish §3 (vault: gold + crowns + a skeleton + open linking book = "wow" then "but who cares?"); Ahnonay §3 (engineer's house: sleeping mat, his own creatures as food, the last diagram on the desk) | Accumulate expectation across the whole Age, then state the theme as a *physical tableau* in the final room — the emotional beat is spatial, not spoken. | H9 | **Adapt** — exactly our *retrospective-significance* payoff, but the tableau content is Roc's to author. Adopt the *structure* (final spatial statement), not Myst's specific tableau. |

---

## Group 3 — Spatial & navigation / composition (→ H4 / H16 / H17)

How an Age composes for point-and-click traversal, and how the Age concept images read as
visual identity. Small footprint, high density is the through-line — proof a six-week slice
can feel complete.

| # | Technique | Source (Age / page) | What it is | Serves | Recommendation |
|---|-----------|---------------------|------------|--------|----------------|
| 3.1 | **Compact footprint, dense puzzle layering** (small space ≠ thin) | Stoneship (boat + lighthouse + few rocks → 5 interlocked chains on 2 axes); Selenitic (5–7 named stops, overhead-readable); Mechanical (state changes multiply effective locations) | A tight, self-contained scene with two or three mechanical axes delivers enough density to feel complete — *state changes multiply locations* without more square footage. | H4, H16 | **Adopt** — the single most important scope proof in the KB for a six-week slice. Target one dense scene, not a large map. |
| 3.2 | **Exterior that behaves as interior** (controlled traversal) | Kadish §4 (trunk-forest = "wooden halls," outdoor look, interior constraint) | Spaces that look open but are structurally constrained (walls, water, dead-ends) give an outdoor feel without open-world navigation cost. | H4, H16 | **Adopt** — keeps navigation authored and cozy while feeling like a place, not a corridor. |
| 3.3 | **Hub-and-spoke with conditional spokes** (open map, logical gating) | Myst Island (reach everywhere early; *use* things only after prerequisites); Garrison §4 (three-zone tier: see Zone 3 before you can reach Zone 2) | All zones are visible/reachable early, but the world's own logic (power, water, knowledge), not locked-door UI, governs what yields progress. Tiering = pacing by geography. | H16, H4 | **Adopt** — the calendar/festival map is a natural hub; conditional spokes = *pull, not push*. Prefer environmental gating over "locked" labels. |
| 3.4 | **Three-spoke dead-end hub for early exploration** | Kadish §4 (one path → three terminal areas: two atmospheric dead-ends, one holds the entry mechanic) | Give three short paths to explore before the main sequence opens; two deliver atmosphere, one contains the way forward. Players feel they explored; navigation is never actually complex. | H16, H4 | **Adapt** — good onboarding shape; tune the dead-end count to the slice (even two spokes works). |
| 3.5 | **One dedicated interpretation hub** (the Library pattern) | Myst Island (Library = where all clue texts/age-previews/mechanism explanations converge; the soft hint system) | One space where clue threads converge and repay re-examination as knowledge accrues — a stall anywhere has a natural fallback. | H4, H16 | **Adapt** — strong fit for a deduction game's notebook/hub, **but** Myst-Island's Watch-out applies: a single physical room creates backtracking friction if info is distributed. Adapt to our rumor-graph/notebook UI (H16 spec owns the detail) rather than one literal room. |
| 3.6 | **Landmark visibility = navigation memory** | Myst Island (6–8 named, distinct landmarks); Ahnonay §4 (Pinnacle Rock: same relative spot every sphere, its *state* tells you which sphere — orientation + access + puzzle in one object) | Name and visually distinguish traversal nodes so the player maps by landmark, not coordinate; a recurring landmark whose *state* changes doubles as a world-state indicator. ~6–8 landmarks is the comfortable ceiling for a hub. | H16, H17 | **Adopt** — landmark-anchoring is engine-agnostic and directly supports cross-year recognition ("the same place, changed"). |
| 3.7 | **Fragmented geography forces intentional routing** | Stoneship (boat / submerged lighthouse / rock islands via passages — no wide plane); Laki §4 (islands as hard zones; current as a *diegetic* invisible wall); Ahnonay §4 (crescent loop guarantees you see every element once) | Split the space into discrete legible nodes connected by passages, with barriers that have an in-world reason (water, current). The *connections* are the puzzle, not the nodes. Diegetic failure (swept back by current) beats an invisible wall. | H16, H4 | **Adapt** — routing weight is good; **keep barriers diegetic and failure soft** (per Laki: no forced link-out — we have no teleport safety valve; return-to-checkpoint instead). |
| 3.8 | **State-change multiplies locations** (dual-axis / water-level composition) | Mechanical (rotate + descend = two knowledge-gates, three islands from one hub); Ahnonay §4 (water level changes reachable zones per sphere); Stoneship (pump-box water level as one axis, many effects) | One global mechanical axis (rotation, water level) makes the *same* space yield different reachable zones — spatial richness from state, not size. | H4, H16 | **Adapt** — great density-per-asset, **but** honor Stoneship's Watch-out: a global hidden state tensions with informational-feedback law — every state change's consequence must be *immediately perceivable in the space*, never inferred blind. |
| 3.9 | **Machinery readable as a verb** (affordance from architecture) | Mechanical (the hub visibly *rotates*, the elevator *descends*; rooms named by function telegraph their role) | A mechanism whose visible form declares the action (rotate / align / descend) eliminates guess-the-designer logic without removing challenge; functional room shapes let the player infer purpose before entering. | H4, H17 | **Adopt** — pure anti-moon-logic. Every interactive object should read as its verb at a glance (also serves the pilot's signposting rule). |
| 3.10 | **Reward-space as destination** (the unlock *is* the reward) | Teledahn §4 (every major gate delivers a new view/space; "spatial discovery is the payoff, not an item"); Garrison §4 (upward movement = narrative progress into restricted space) | Budget at least one new spatial reveal per major gate — the new space itself is the payoff, not a collectible or score. | H16, scope | **Adopt** — squarely *discovery-is-the-reward*; also scope discipline (no reward-item economy needed). |
| 3.11 | **Visual identity from the dominant object class, not surface palette** | Mechanical (gears/rotation = industrial silhouette); Stoneship (ruin-state: stone/wood/water/light, single-image read); Selenitic (craters + transmitter towers; look matches mechanic) | An Age's unmistakable silhouette comes from its dominant object class and premise (a machine, a wreck), not from an elaborate art style or color decoration. Look and mechanic match. | H17, H16 | **Adopt** — low-budget-friendly identity: each scene reads as *itself* from silhouette. Feeds the moodboard/art-direction work (H17 spec) with a concrete identity lever. |

---

## Group 4 — Doc structure & altitude (→ gdd-structure)

Borrowable moves for how a shipped/pitched adventure GDD presents world, ages, and history.
**Kept intentionally light** — the `gdd-structure-model` artifact owns the deep version; this
group only flags the moves worth carrying there.

| # | Technique | Source (Age / page) | What it is | Serves | Recommendation |
|---|-----------|---------------------|------------|--------|----------------|
| 4.1 | **Five-field puzzle template** (Problem / Circumstance / Clues / Solution / The Idea) | Kadish §1 | A fixed per-puzzle spec ending in **"The Idea"** — one plain-language line stating design intent, so the *why* is in the spec, not assumed. | gdd-structure | **Adopt** — most portable structural element in the set. Make "The Idea" non-negotiable on every puzzle spec so intent stays visible through the AI build pipeline. |
| 4.2 | **Goal-tiering schema** (Explicit/Implicit × Primary/Secondary) | Teledahn §1 | Names what the player *knows* they're doing vs. what they're *actually* doing, and ranks mandatory vs. optional. Player Actions written as numbered state-transition beats *with named failure states*. | gdd-structure, H4 | **Adopt** — the explicit-vs-implicit split is tailor-made for a game where the real objective is retrospective. |
| 4.3 | **Player role first, lore second** (player-agency-before-world) | proposal-page1 (opens on "detective and judge," player logic, *before* any location); proposal-page2 (myth-form origin as story-before-system) | Lead the GDD with what the player *does* and *why*; world texture follows; history is a late section flagged "depth, not required knowledge." | gdd-structure, H9 | **Adopt** — earns reader buy-in fast. **Import the *sequence*, not Myst's "solve the crime" premise** — that's a push-quest; ours is pull (see 5.5). |
| 4.4 | **Discovery-arc player-experience walkthrough** (specify what the player *understands* per beat) | Ahnonay §1 (the clearest section of the whole doc); Garrison §1 (first-person arrival prose doubles as a spatial-flow test) | Write at least one player-experience section as a discovery arc — what the player *understands* at each beat — before room-by-room specs. Doubles as a readability/flow sanity check. | gdd-structure | **Adopt** — a knowledge-key game must track player *understanding*, not just world state; this is the section that does it. |
| 4.5 | **Functional-backstory line before every area spec** ("what this space was for") | Laki §1 (one-paragraph functional backstory per room); Selenitic (one-page Age sheet: map + 2–3-sentence zones + entrance logic + core mechanic) | A one-paragraph diegetic reason for each space before its puzzle spec — the minimum environmental-story layer; forces knowing *why a space exists* before designing its gate. | gdd-structure, H9 | **Adopt** — cheap, and it feeds Group 2 directly (you can't do 2.1/2.2 without knowing what a space was for). |
| 4.6 | **Two-altitude discipline + declared simplification** | Laki §1 (synopsis altitude + room altitude, no bloated mid-layer); proposal-page2 ("we have simplified... to communicate in its simplest form"); proposal-page1 (motif-only one-line area themes) | Write at exactly two altitudes (why-it-exists synopsis + room-level spec), keep area descriptions gestural/motif-only, and *state* the simplification as a deliberate choice. | gdd-structure | **Adopt** — matches Roc's minimal, SRP-first style; licenses thin, gestural area write-ups (scene design carries the weight). |
| 4.7 | **Map-annotation format** (room name → function → information payload, one page) | Myst Island; Mechanical (margin callouts naming each room, its function, and what info it stores) | Each location gets one short functional paragraph answering "what does the player do here and what changes / what's stored here" — nothing speculative, all on one readable page. | gdd-structure, H16 | **Adopt** — the location-level altitude model; pairs with 4.5. |
| 4.8 | **Version log as cheap audit trail** | Garrison §1 (one-line change summary per version); Ahnonay §1 (revision section explains *why* decisions changed) | A running one-line-per-change log at the doc's end — cheap scope tracking that also records *why* a design changed, not just what. | gdd-structure, scope | **Adapt** — worth it for a multi-week AI-assisted build; keep it one line per change so it doesn't become its own maintenance burden. |

---

## Group 5 — What NOT to borrow (Skip-for-scope)

The "what NOT to borrow" lens is a real deliverable of the myst-ages mining, not an
afterthought. These are the **Van Buren-style over-specification cautions** and dated MMO/AAA
conventions that will not survive a six-week solo slice. Listed so the skip is a *decision*,
not an omission.

| # | Anti-pattern | Source (Age / page) | Why it's a trap | Recommendation |
|---|--------------|---------------------|-----------------|----------------|
| 5.1 | **Two-player / co-op puzzle requirements** | Kadish §5 (Puzzle 4 needs a 2nd player to raise a pillar); Teledahn §5 (bucket ride); Laki §5 (Fighter House 2nd floor); Garrison §5 (blue/red team wall-climb); Ahnonay §5 (2nd player links you into Sphere 4) | Uru's MMO DNA. Zero fit for a solo-first slice; the co-op *dependency* — not the idea — is the problem. Where the idea is good (1.8's saved-link, 1.7's weight puzzle), keep the idea, strip the coordination. | **Skip-for-scope** — never require a second live player. |
| 5.2 | **Dexterity / precision / timed-under-pressure mechanics** | Selenitic §Watch-out (dish-aiming); Laki §5 (Game of Fighters, 10-sec real-time); Ahnonay §5 (Vogondola docking speed-match); Garrison §5 (climbing-wall spectacle) | Directly violate the **strategy-over-dexterity** pillar. Replace every precision/timed input with a knowledge-gate equivalent (pairing, sequence recall, pattern-match). | **Skip-for-scope** — swap the input, keep the *puzzle intent* only. |
| 5.3 | **Simulated (vs. implied) world systems** | Ahnonay §5 (boat displacement physics, grate/valve logic, creature AI tuned to plate sensors, the whole Orborbitor); Teledahn §5 (Shroomie sim-pet AI) | A six-week P&C needs *implied* world logic, not simulated. Creature-behavior-as-puzzle and physics sims are multi-year engine systems. Borrow the *concept* (a machine rotates fake ages; a creature reacts to you) as authored visual states, never as a simulation. | **Skip-for-scope** — imply, don't simulate. |
| 5.4 | **Over-specified geometry / lever mechanics / furniture inventories** (the Van Buren caution) | Laki §5 ("must be manually engaged," exact lever facings); Ahnonay §1 (pressure-plate poundage); Kadish §5 (4-pillar/8-weight counterweight math); Garrison §5 ("couches, chairs, drawing boards"); Ahnonay §5 (25-wedge clock) | Implementation noise at GDD altitude. Extract puzzle *intent*, not lever direction or set-dressing lists. Detail that doesn't survive a scope cut is debt the moment it's written. | **Skip-for-scope** — spec intent; leave mechanism/props to build time. |
| 5.5 | **Directed "solve-the-crime" mystery framing** | proposal-page1 §Watch-out (player is "detective and judge," an explicit external crime) | A **push-quest** — violates *world-as-quest-giver (pull, not push)* and *trust-the-player / don't force mystery*. Keep the structural lesson (player-role-before-lore, 4.3); drop the directed-mystery premise. | **Skip-for-scope** — keep the doc sequence, not the pushed goal. |
| 5.6 | **"Completely nonlinear" over-promise** | proposal-page2 §Watch-out (claim is aspirational; Myst is Age-gated) | Don't over-promise sequence-freedom to a reader. Our world is *pull-open* (no directed path), not literally sequence-free. Precision protects credibility. | **Skip-for-scope** — describe as pull-open, not "nonlinear." |
| 5.7 | **Phase-release / "add it later" design + blank stubs** | Laki §5 (creature-raising deferred to a future update); Garrison §1/§5 (blank "Gameplay Variables" stubs shipped in v1.6) | We have one ship window. Never design assuming a later phase; mechanics described without parameters accumulate debt (Garrison's own cautionary tale). | **Skip-for-scope** — everything in the slice must be shippable in the slice. |
| 5.8 | **Punishing / hard-reset failure states** | Laki §5 (maze trap forces a link-out — relies on a teleport safety valve we don't have); Ahnonay §Watch-out (pressure-plate "clear-all" as checklist sweep) | Significant-setback failure tensions with **cozy rhythm**, and our game has no link-out escape hatch. Soften to return-to-last-checkpoint / visual block. | **Skip-for-scope** — soft failure only. |
| 5.9 | **Red-herring / decoy content density** | Kadish §5 (store demands red-herring artifacts so real clues aren't trivial) | Sound principle (don't make clues trivially obvious) but it demands content *volume* — a false-lead population costs design + asset budget a slice can't spare. | **Adapt (lean)** — borrow the *principle* (subtle, not obvious, per the pilot's signposting rule), not a populated red-herring layer. |

---

## Roc's decisions to make (the open borrow-or-not calls this menu surfaces)

- [ ] **1.4 / 1.8 cross-scene memory keys** — Adopt the "knowledge travels across scenes/years" pattern? If yes, decide the **soft in-world reminder** mechanism (Mechanical's guardrail) so it doesn't read as arbitrary. This is the highest-leverage call — it's our core metroidbrainia.
- [ ] **1.6 world-state read-out** — one central indicator object per scene? Confirm the *compressed* count (a dial/mirror reflecting a few states), not Ahnonay's 25 wedges.
- [ ] **1.7 ritual re-enactment** — commit to at least one signature "perform the inhabitants' act" puzzle? Requires a diegetic ritual from your world.
- [ ] **2.1 delta-storytelling as the default mode** — lock object-state-as-time-passage as the primary env-story engine (it's already native to the recurring-festival premise)?
- [ ] **2.2 historical strata depth** — two-state (was/is) for the slice, full three-strata deferred to a later Age? Confirm the cut.
- [ ] **2.4 evidence placement** — adopt "bodies/evidence in the functionally correct room," softened for the **non-violent core** (evidence of a life/loss, not gore)? Confirm the tone line.
- [ ] **3.1 / 3.7 spatial scale** — commit to one compact, dense scene (Stoneship model) vs. a fragmented multi-node map for the six-week slice?
- [ ] **3.5 interpretation hub** — does the Library-pattern become the **rumor-graph/notebook UI** (H16 spec) rather than a literal room? Confirm so H16 inherits it correctly.
- [ ] **3.8 global-state axis** — adopt a water-level/rotation-style axis that multiplies locations? Only if every state change is *immediately perceivable* (informational-feedback law) — confirm you want the constraint.
- [ ] **4.1–4.7 doc moves** — which structural borrows (five-field puzzle template + "The Idea"; goal-tiering; discovery-arc walkthrough; functional-backstory line; two-altitude discipline; map-annotation format) carry into `gdd-structure-model` and `pnc-grammar`? (This menu recommends all; the deep version lives in the gdd-structure artifact — confirm the handoff.)
- [ ] **5.9 red herrings** — confirm the lean read (subtle signposting, no populated decoy layer) for the slice.
- [ ] **Skip-list ratification (5.1–5.8)** — confirm the eight Skip-for-scope calls so they're decided, not merely un-adopted.
