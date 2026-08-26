---
kind: synthesis artifact
artifact: pnc-grammar
sources:
  - point-and-click/point-and-click-puzzle-design.md          # the interaction contract spine (pilot)
  - myst-ages/kadish-tolesa.md                                # knowledge-is-the-lock; always-night + moonlight-gated puzzle (time-of-day precedent)
  - myst-ages/teledahn.md                                     # one observation gates the chain
  - myst-ages/garrison.md                                     # the gate teaches the key-type; always-daytime sky-as-security (time-of-day precedent)
  - myst-ages/ahnonay.md                                      # infer the world-state to read it; object-state-as-time
  - myst-ages/laki.md                                         # knowledge-fragment that travels
  - point-and-click/top-10-pnc-games.md                       # genre-landscape context (light use)
  - narrative/narrative-deduction-mechanics.md                # NEW — find/think/prove; construction over deduction
  - narrative/heavens-vault-detective-story.md                # NEW — knowledge-state gating; min/max exit conditions
  - narrative/curiosity-driven-exploration-outer-wilds.md     # NEW — knowledge-is-the-key; pull-not-push; tiered clues
  - narrative/invisible-escape-room-alexa.md                  # NEW — addressable-space contract; wrong-action-as-hint
  - narrative/non-linear-level-design-cyberpunk.md            # NEW — discovery/exploration beat; per-path seeding
  - narrative/narrative-approach-to-level-design.md           # NEW — agency/certainty curve; slow-window seeding
built: "Phase 2.5 resynthesis (2026-07-17)"
serves: [H4, H5, H7, H8]
status: "STAGED candidate for GATE 2"
excludes:
  - point-and-click/how-to-make-pnc-in-unreal-ep1.md          # engine scaffolding, no interaction grammar
  - point-and-click/2d-pnc-project-setup-unreal.md            # engine scaffolding, no interaction grammar
refresh-notes: >
  Round-B refresh of the Phase-2 pnc-grammar. Integrations, all marked [NEW] inline:
  (a) the deduction-loop grammar (find/think/prove · form/test/confirm) folded in as a sixth
  gate archetype ALONGSIDE the five Myst archetypes; (b) time-of-day-as-authored-state per the
  GATE-2 C3 carve-out, reconciled with the informational-feedback law and the calendar/Ahnonay
  clock, and grounded on the Kadish always-night moonlight puzzle + Garrison always-daytime
  sky-as-security precedents (fixed authored lighting states, not simulation); (c) the C1 LOCK
  (knowledge travels across scenes/years + a soft in-world reminder) made explicit as its own
  rule; (d) the order-independent-significance constraint named explicitly in §2.2 so the round-A
  Build-GDD §4/§6a dependency is actually satisfied. The 9-section spine and all inline citations
  are preserved; nothing from the prior artifact was concatenated — new material is integrated at
  the point it belongs, and each new rule that rests on a single/thin source is flagged in §8.
---

> **Note (post-restructure, 2026-07-26).** "Build GDD"/"Build-GDD section N" citations below use pre-v5 numbering and do not match the current structure. See [`../../gdd/CONTEXT.md`](../../gdd/CONTEXT.md) for where this content lives now — core loop and world content are [`../../gdd/03-core-loop.md`](../../gdd/03-core-loop.md) and [`../../gdd/08-levels.md`](../../gdd/08-levels.md).

# P&C Interaction Grammar

**How to use this.** This is the reusable *rules* of scene interaction for our cosmic-hide-and-seek reincarnation-deduction roguelike — reverse-outlined from how the pilot, the five Myst Age docs, and (Round-B) the deduction/detective-design talks actually build locks, keys, knowledge-gates, and feedback. It is a **grammar, not a content spec**: it names each pattern, states it as a rule *our game applies*, and hands Phase 3 the axes to fill (families × target-types, verb structure, the proof-step). No filled matrices live here — those are Phase-3 work. Every rule traces to a distilled note (cited inline as `[source]`). Where a rule rests on one thin source, it is flagged. New Round-B material is marked **[NEW]** at the point of integration so a reviewer can see exactly what changed. The document has one job: make the locked pillars — especially **discovery is the reward**, the **informational-feedback law**, and the **C1-locked knowledge-travel spine** — mechanically enforceable at the level of a single click.

**The one-line thesis of the whole grammar.** In this game **knowledge itself is the key** — knowledge travels free, survives save-wipes, and is what actually unlocks the world. This is now doubly grounded: the five Myst Ages converged on it, and the deduction/discovery cluster states it as shipped design — Outer Wilds "knowledge is how you progress," not items [`curiosity-driven-exploration-outer-wilds`]. So the grammar's center of gravity is not the inventory verb; it is *what the player now understands*, and *whether the game made them prove it*. Every rule below serves that.

---

## 1. The core interaction contract (our baseline scene-interaction spec) — H4

The pilot [`point-and-click-puzzle-design`] derives a three-rule fair-puzzle contract from Broken Age's failures and Day of the Tentacle's successes. We adopt it verbatim as the **baseline every interactive scene must pass** before it ships. These are not aspirations; they are gates.

**Rule 1 — Clear goals precede interaction.** The player must always know their short- and long-term goal so they know *which* thing to try and *why*. Offer several live goals at once so a stuck player pivots instead of stalls. *(Reconciliation with our pull-not-push pillar is in §9 — goals stay diegetic and soft.)*

**Rule 2 — Signpost generously; direct sparingly.** Litter every scene with clues surfaced by examining objects and talking to NPCs — subtle enough to earn the "aha," never so hidden it becomes guess-the-designer's-brain. The pilot calls this "the core skill." Our primary signposting channel is **examine** (see §3 and §6).

**Rule 3 — Why-specific feedback.** A failed attempt must explain *why that specific* attempt is flawed and nudge toward the real answer — never a generic "that doesn't work." This is the pilot's external validation of our locked **informational-feedback law**, and it graduates from a nicety to a *law* in §4.

**[NEW] Rule 4 — Declare the addressable space, then let goals stay diegetic.** The deduction/escape-room design literature adds a fourth baseline that the pilot only implies: the game must *teach the verb set itself* before stakes rise. Grossman's biggest playtest failure was players trying actions the game couldn't handle ("chisel it," "make a rope") because the addressable space was never signalled — "it's not possible to overdo" establishing what verbs exist [`invisible-escape-room-alexa`]. The **opening scene must demonstrate (not merely list) the four action families** and let the player practice them before the first real gate. Critically, this is a *how-to-interact* contract, not a *what-to-do-next* push — it names the grammar, never the goal, so it reconciles with pull-not-push (§9).

**The fairness test (the ship gate).** A good solution makes the player say "oh, I should've figured that out," not "are you kidding me." **No solution may depend on information the player was never taught to expect** (the Broken Age scarf puzzle is the anti-pattern) [`point-and-click-puzzle-design`]. Any interaction that fails this test does not ship.

**The three de-friction conveniences (baseline, not optional).**
- **Highlight-all-interactables** — kills pixel-hunting. Ships in the first slice.
- **Timed hint spills / soft nudges** — a stuck player is never permanently stuck.
- **Multiple valid solutions where cheap** — and, for the hardest gate, an optional answer-reveal path. **[NEW]** The deduction talks reinforce *why* this matters mechanically: a combination lock is binary (you know it or you don't) and cannot be balanced, whereas a solution space with multiple valid routes and walk-back-able dead-ends can be tuned [`narrative-deduction-mechanics`]. Prefer gates with more than one legitimate route wherever the content budget allows.

> **Contract summary (the five things a scene owes the player):** a clear reason to act · a *demonstrated* verb set it can honor · a way to *learn* the answer by examining the world · a *why-specific* response to every action, right or wrong · no dependence on untaught information.

---

## 2. The knowledge-key gating model — knowledge itself is the lock — H4/H8

This is the heart of the grammar. Our magic is a **memory-based metroidbrainia**: the gate opens because the player *knows* something, and that knowledge travels free — carried across scenes, across years of the festival week, and across save-wipes. The five Myst Ages independently converged on this exact structure [`_index §3`], and the deduction/discovery cluster confirms it as shipped, buildable design [`curiosity-driven-exploration-outer-wilds`, `heavens-vault-detective-story`, `narrative-deduction-mechanics`]. Below, each named pattern is stated as a **reusable gating rule our game applies**, then cross-mapped to our memory system.

Read these as **six *gate archetypes*** — the five Myst archetypes (2.1–2.5) plus one deduction-loop archetype (2.6, **[NEW]**). Phase 3 picks which archetype each real gate uses; the grammar just names them and their contract. **The C1-lock rule (2.0) governs all six.**

### 2.0 [NEW] The C1 lock — knowledge travels across scenes/years, and a soft in-world reminder keeps it from reading arbitrary

Roc locked this at GATE 2: "knowledge travels across scenes/years **+ a soft in-world reminder** so it never reads arbitrary" [`GATE-2-review.md` C1]. It is not an archetype — it is the *precondition that makes all six archetypes legal in our game*, so it sits above them.

> **Rule (C1-travel-with-reminder).** A memory or insight learned anywhere is usable everywhere and persists across the festival-week replay and across save-wipes — this is the metroidbrainia spine [`curiosity-driven-exploration-outer-wilds`, `laki §2`]. **But** the first time travelled knowledge opens a distant or years-later gate, the world must surface a *soft, diegetic reminder* of where that knowledge came from, so the unlock reads as earned recognition rather than an arbitrary flag flip. The reminder is a **pull** cue (the world acknowledging what the player noticed), never a **push** prompt (a tutorial line telling them what to do).

**How the sources make the reminder buildable — and how it must NOT overreach:**
- Heaven's Vault tracks ~1,500 knowledge flags and only surfaces a question when its prerequisite is held *and* the answer isn't already known; answered questions vanish, "signaling to the player that asking mattered" [`heavens-vault-detective-story`]. Our reminder rides the same knowledge-state check — it fires *because* a specific prior memory is held, so it can name that memory in-world.
- Outer Wilds' ship-log distills each entry to "only what the designer is 100% certain the player knows from that one piece of text" [`curiosity-driven-exploration-outer-wilds`]. Our reminder obeys the same minimum-certainty discipline: it may recall *only* the fragment the player actually earned, never infer a leap for them — otherwise it becomes the prompted-flashback push we banned (§9).
- The Ahnonay "tool-you-already-have" move is the purest travel case: a tool the player already possesses becomes a key "once they understand *what condition must exist* when they use it" [`ahnonay §8-steal`] — nothing is acquired but understanding, so the reminder is *understanding surfaced*, not an item pickup.

**Map to us:** this is what lets a memory learned at the Year-3 festival open a gate the player walked past in Year 1 *without* feeling like a save-flag cheat. The reminder is the seam between "knowledge travels free" (mechanic) and "the world remembers with you" (feeling). Flag: the *reminder* mechanic itself is a design add with no single dedicated source — it is synthesized from the knowledge-state-gating and minimum-certainty patterns above; Phase 3 owns its exact trigger and phrasing.

### 2.1 Kadish pattern — *knowledge is the lock; the mechanism is trivial once you know what's being asked*
In Kadish Tolesa every puzzle is a knowledge-gate in the strict sense: "the physical action is simple once you know *what* the puzzle is actually asking." Knowledge lives in one location (the store); the mechanism lives in another (the Age); the player bridges them [`kadish-tolesa §2`].

> **Rule (Kadish-lock).** A gate's difficulty must live in the *knowing*, not the *doing*. The click that opens it should be simple — even obvious in hindsight. If a gate is hard because the *action* is fiddly, it is the wrong kind of hard for this game (violates *strategy over dexterity*). Design the lock as a question the player must answer, not a mechanism they must operate.

**Map to us:** this *is* the metroidbrainia contract. The reward for a gate is the *understanding*, and once understood the gate is trivial forever — which is exactly why the knowledge can travel free across years and save-wipes without breaking anything. **The "negative space" corollary** [`kadish-tolesa §2`]: the answer is often *what is not shown* (the hidden door, the unlit path, the number not on the lock). Reserve at least one gate whose key is an absence the player must notice.

### 2.2 Teledahn pattern — *one elegant observation gates the whole downstream chain*
Teledahn's periscope solar-lock is "the single chokepoint for the entire age — one elegant knowledge-gate unlocks all downstream systems. Not a code or inventory puzzle; it's observation + alignment" [`teledahn §2`]. One thing understood → power on → 2–3 downstream levers each open one new area.

> **Rule (Teledahn-chokepoint).** Prefer *one* deep observational insight that cascades over *many* shallow locks. Build gate chains as: one hard-won piece of knowledge unlocks a "power state," and that state makes 2–3 previously-inert things newly usable. Depth comes from the cascade, not from lock count.

**Map to us:** this is how a single learned memory can retroactively make a whole cluster of the calendar-map "light up." One insight learned in Year 2 turns a dozen dead interactions across the week into live ones — the metroidbrainia's revisit-with-new-knowledge loop, powered by a single elegant observation rather than a key-item. **[NEW] Reinforced by Outer Wilds' nested-arc structure**: small self-contained story loops pay off regardless of order and interconnect via shared parent arcs, not sequential dependency [`curiosity-driven-exploration-outer-wilds`] — so a Teledahn-cascade can light up the week without forcing a play order.

> **[NEW] The order-independent-significance constraint (the contract this section hands the GDD).** The round-A structure model states that the Build GDD's §4 (core loop) and §6a (slice world) inherit an "order-independent-significance constraint" from this grammar [`gdd-structure-model` (round-A) §8]. Here it is, named explicitly so §4/§6a can cite it: **no gate may depend on the player having solved a specific *other* gate in a specific order; gates depend on *knowledge held*, never on *sequence completed*.** A memory earned in any scene, in any year, is a legal key the moment it is held — that is the whole point of "knowledge travels free" (C1, §2.0). Self-contained arcs may nest under shared parents (Outer Wilds) and one insight may cascade (Teledahn), but the significance of any single discovery must survive being found first, last, or alone. This is what keeps the festival-week-across-years replay from silently becoming a linear funnel — flag each scene dependency that would violate it [`curiosity-driven-exploration-outer-wilds` Watch-out: "if any scene requires prior scene completion for narrative coherence we have introduced a soft funnel"].

### 2.3 Garrison pattern — *the gate teaches the key-TYPE before you find the key*
Garrison's power-out sequence: the intended doors are dead, so "the blocked door teaches that power is the key before the player finds the source." The two-door airlock "explains the security logic before any puzzle asks the player to engage with it — understanding precedes the gate" [`garrison §2`].

> **Rule (Garrison-preview).** A locked thing must *name the kind of key it needs* at the moment the player first meets it — before they possess that key. The gate advertises its own solution-shape ("this needs power" / "this needs the festival password" / "this needs to be seen at night"), so the player leaves knowing *what to go learn*, not just *that they're blocked*.

**Map to us:** this is what converts a dead-end into a *quest the world gave you* (pull, not push). A gate that previews its key-type is the world saying "come back when you know X" without a quest-marker. **[NEW]** This is the same structure as Heaven's Vault's **Chandler unlock**: every location is preconditioned on a reason the player has already found to go there, so players "never stare at an empty map — they choose from two or three live leads, always with a narrative reason in hand" [`heavens-vault-detective-story`]. A Garrison-preview is our version of a live lead. It also makes the informational-feedback law easy: a wrong action against a Garrison-gate can simply re-state the key-type. **Dual-use key corollary** [`garrison §2`]: a single key-item/knowledge should carry a legible meaning from context and open *more than one* kind of lock.

### 2.4 Ahnonay pattern — *a world-state you must infer to read; the clock/calendar is a map you decode, not a readout* — and time-of-day as authored state
Ahnonay's central clock has lights mirroring hidden world-state, but "the clock's function as a map is never explained — it must be inferred from the correlation." The puzzle "teaches its own interface through repeated observation" [`ahnonay §2`, `§5-steal`].

> **Rule (Ahnonay-inferred-state).** The game may present a central, always-visible object whose *state* encodes information the player needs — but it does **not** explain how to read it. The player earns the reading by noticing the correlation over repeated observation. When they crack it, the object becomes a permanent tool.

**Map to us:** our "map" *is* a calendar, and a run is the same festival week replayed across years. That calendar is our Ahnonay clock — a central, always-visible world-state object the player learns to *read* (which day surfaces which event; which year-state changes what). **Object-state-as-time corollary** [`ahnonay §3`]: place the same landmark in degraded states across years to imply elapsed history; continuity is discovered *retroactively* — the Frieren beat rendered spatially. **Tool-you-already-have corollary** [`ahnonay §8-steal`]: a tool the player already possesses becomes the key to a new area *once they understand what condition must exist when they use it*. Keep the *principle*, not Ahnonay's 25-wedge implementation — compress the state count to what a P&C scene can show without reading as noise [`ahnonay §5`].

> **[NEW] Rule (time-of-day-as-authored-state) — the C3 carve-out, made mechanical.** Roc ratified the skip-list with one carve-out: no *simulated* world systems, **but authored time-of-day scene states ARE allowed** — "states, not a sim" [`GATE-2-review.md` C3; `RESYNTHESIS-PLAN.md` §2]. This is a controlled extension of the Ahnonay object-state principle, and — importantly — it has *two direct Myst precedents already in the KB* where a fixed authored lighting condition is mechanically load-bearing, not simulated: Kadish is **always night with a bright moon**, and Puzzle 3 (open the roof → moonlight charges the glow-paint → symbols appear) is *mechanically dependent* on that fixed state [`kadish-tolesa §4`]; Garrison has **no night cycle — always daytime**, an Age "engineered to deny enemies cover of darkness," where the fixed sky-state *is* the worldbuilding [`garrison §3`]. Both prove a scene can bind a puzzle to a single authored lighting state with zero simulation. Our carve-out generalizes that from *one fixed state per Age* to *a small set of discrete states per scene*. The rules that make it legal:
>
> 1. **A scene has a small, hand-authored set of discrete time-of-day states** (e.g., *morning / dusk / night*), each a deliberately painted variant of the same space — never a continuous day-night simulation, no lighting solver, no clock ticking in real time. This is the same discipline as the Ahnonay "compress the count" guardrail [`ahnonay §5`]: authored states scale, a simulation does not. Kadish and Garrison each shipped a *single* authored lighting state [`kadish-tolesa §4`, `garrison §3`]; a per-scene set of two or three is the ceiling, not a floor.
> 2. **Time-of-day is itself a knowledge-gate axis.** A Garrison-preview may name *time* as the key-type ("this needs to be seen at night"); the gate then opens only in the authored night state — exactly the Kadish glow-paint move, where knowing the mechanic needs moonlight *is* the puzzle [`kadish-tolesa §4`]. This is a first-class, on-genre use of the archetype — the key is *knowing when to look*, which is pure knowledge, not dexterity or timing.
> 3. **The informational-feedback law still binds every time-state (§4).** Interacting with a time-gated object in the wrong state must *teach* — "the shutters are drawn; nothing to see until evening" — never a silent no-op. A wrong time is a wrong action, and a wrong action always leaves the player knowing more.
> 4. **Reconcile with the calendar/Ahnonay-clock model (§2.4 above).** Two independent time axes coexist and must not be confused: the **calendar** tracks *which day of the festival week and which year* the run is in (the macro Ahnonay-clock the player decodes across years); **time-of-day** is a *within-scene* authored variant. The calendar is the map the player learns to read; time-of-day is a state some scenes offer. Phase 3 decides which scenes carry time-of-day states at all — it is a *dial per scene*, not a global feature — and keeps the total authored-state count low so it never reads as noise or busywork [`ahnonay §5`; guardrail against the 25-wedge trap].
>
> **Flag (partially grounded, no *day-night* source):** the *time-of-day-as-a-set-of-states* mechanic rests on Roc's C3 decision plus the Ahnonay object-state analogy, now reinforced by the Kadish/Garrison fixed-lighting precedents [`kadish-tolesa §4`, `garrison §3`]. What has *no* KB source is a scene that *cycles between* several authored states — the Myst precedents are each a single fixed state. Treat states as authored art variants gated by knowledge; do not let "time-of-day" drift toward a simulated day-night cycle (which C3 explicitly cuts — the transcript names "day-night cycle" code as exactly the over-scope to avoid at prototype [`transcript` 21:47:18]).

### 2.5 Laki pattern — *a knowledge fragment learned in one place, applied in another; the cipher travels*
Laki's strongest gates combine information across areas: the maze needs a prose guide from the villa *plus* a pace-calibration from a different room — "neither sufficient alone." Beach symbols are decoded by *playing the Game of the Fighters*, then the numbers are applied as pace-counts on Treasure Island — "learn the cipher in one space, apply it in another" [`laki §2`].

> **Rule (Laki-travelling-key).** Knowledge learned anywhere is usable everywhere — this is literally what "knowledge travels free" means as a mechanic. Build gates whose key is a *fragment* combined with another fragment, or a *cipher* learned in one scene and applied in a distant one. This is the metroidbrainia's core loop expressed as content: the reward for solving A is the key to B.

**Map to us:** the travelling cipher is the mechanical spine of our whole magic system — a memory learned at the Year-3 festival is the key to a gate the player walked past in Year 1 (and the C1 reminder in §2.0 is what keeps that unlock from reading arbitrary). **Ritual re-enactment corollary** [`laki §2`]: build at least one gate where the player performs the same act the world's past inhabitants performed — the player learns the history *by* solving, and solves *by* understanding the history (perfect fit for a reincarnation game). **Diegetic-soft-failure corollary** [`laki §4`]: failure returns the player gently ("swept back by the current"), never an invisible wall — see §4.

### 2.6 [NEW] Deduction-loop pattern — *find → think → prove; the player must demonstrate understanding, not just possess it*
This is the sixth archetype, sourced directly from the deduction/detective-design cluster. The Myst archetypes describe *what the lock is*; this one describes *how the player shows they cracked it* — the missing verb-layer the prior grammar only gestured at.

**The loop has three beats:** find → think → **prove** [`narrative-deduction-mechanics`], which the Burden-of-Proof talk frames as *form → test → confirm* a conclusion. The proof step is the payload: "a game without it is linear even if it has clue-gathering" [`narrative-deduction-mechanics`]. Crucially, the proof is a **combination-lock action performed diegetically** — going to the right place, at the right time, choosing the response that *implies* the player connected the dots — "the action IS the proof; no quest marker" [`narrative-deduction-mechanics`].

> **Rule (deduction-proof-step).** A knowledge-gate is not opened by clicking a UI element labelled "I figured it out." It is opened by a **diegetic action that could only be chosen by someone who understood** — arriving at the recognized place, initiating the specific interaction, giving the response that presumes the insight. **Construction over deduction:** build the gate as an argument assembled piece by piece (each piece introduced, discussed, resolved before the next), not a single fact-lookup — because an argument-under-construction has walk-back-able dead ends, multiple valid routes, and tunable difficulty, while a fact-lock is unbalanceable [`narrative-deduction-mechanics`]. **Avoid the fact-linking UI entirely** — atomizing every fact on-screen "kills intuition and social-inference clues" and creates a cluttered possibility space players brute-force [`narrative-deduction-mechanics`].

**Two supporting rules from Heaven's Vault:**
- **Knowledge-state gating drives which options appear** [`heavens-vault-detective-story`]: a deduction option surfaces only when its prerequisite evidence is held *and* the answer isn't already known; resolved options vanish, so every inquiry feels consequential. This is the same flag-check that powers the C1 reminder (§2.0).
- **Minimum & maximum exit conditions replace dead air** [`heavens-vault-detective-story`]: a *minimum* exit is a diegetic beat that lets the player leave naturally ("I think I've seen enough"); a *maximum* exit is a silent backstop that ushers out an exhaustive player before the scene runs dry. Neither is a system message. Together they kill the "scan every pixel of every room" loop — the P&C failure mode our highlight-all convenience only half-solves.

**The player-as-Watson framing** [`narrative-deduction-mechanics`]: the player gathers evidence and *presents* it; a system in the world (an NPC, a memory artifact, a spirit) renders the verdict — "the detective does not get to be the arbiter." This gives us a **fallback "inconclusive" outcome that is not a fail state** — "call me back when you know more" — the cozy-rhythm-compatible closer the talk explicitly recommends over its own replay-to-win default.

**Map to us:** this is the *recognition* mechanic at the emotional core of the game. When the player has assembled enough echoes to believe they know who a reincarnated soul has become, the gate is the **proof-of-understanding action**, not a "confirm identity" button. The climactic recognition is a topic-accumulation conversation: one echo-clue at a time, the player affirms or challenges, each resolved topic accumulates toward a verdict the *world* renders [`narrative-deduction-mechanics`, H16]. **Scope-fit caution:** the proof step needs enough expressive verbs to demonstrate understanding — if our verb set is too narrow, players will have correct deductions they cannot prove, which the talk names a critical failure mode [`narrative-deduction-mechanics`]. Design the four families (§5) *alongside* the proof-gates, not after.

### 2.7 The gating-model summary table (archetypes, not content)

| Pattern | The rule in one line | What the KEY is | Our metroidbrainia use |
|---|---|---|---|
| **Kadish** | Hard to *know*, trivial to *do* | An insight / a noticed absence | The gate-reward *is* the understanding |
| **Teledahn** | One insight cascades to many unlocks | One elegant observation | A single memory lights up the whole week |
| **Garrison** | The gate names its key-type up front | Knowing *what* to go learn | Turns dead-ends into world-issued live leads |
| **Ahnonay** | Infer how to read the world-state | Learning to read the calendar-clock (+ authored time-of-day states) | The calendar-map you decode over years |
| **Laki** | Learn here, apply there | A travelling cipher / fragment | Memory learned in Year N unlocks Year 1's gate |
| **[NEW] Deduction-loop** | Find → think → **prove** | A demonstrated understanding (diegetic action, not a UI click) | The recognition gate: prove *who* they became |

> **[NEW] The C1-lock (§2.0) sits above the table:** every archetype's key travels free across scenes/years and survives save-wipes, and a soft in-world reminder fires the first time travelled knowledge opens a distant gate. Phase 3 assigns each real gate one primary archetype (mixing is fine — a Laki-travelling key can be spent on a Deduction-loop proof step) and writes it with the five-field puzzle template in §6.

---

## 3. Signposting & examine-as-clue-channel — H5 seed

The pilot names signposting "the core skill" and makes **examine** the primary channel: items and objects carry examinable clue text; talking to NPCs surfaces the rest [`point-and-click-puzzle-design`]. The Myst docs prove how far this can go with zero narrator: Teledahn's absent NPC is fully characterized by his journals, maps, and aquarium [`teledahn §3`]; Garrison's institutional memory is "three objects = one institutional memory" [`garrison §3`]; the genre survey confirms objects alone can carry whole character arcs (Unpacking) [`top-10-pnc-games`].

> **Rule (examine-is-the-clue-channel).** Every interactable carries examinable clue text, and **examine is a first-class verb, not flavor**. The clue layer is where signposting lives; the world teaches through what the player *looks at*, not through pushed prompts. Objects accuse before any text does [`teledahn §3`].

**[NEW] Three signposting refinements from the deduction/level-design cluster:**
- **Tier clues by inference-load, not by lock** [`curiosity-driven-exploration-outer-wilds`]. Place clue-carrying objects at three depths: *surface* (easy to reach, fine if skipped, gives a satisfying partial beat), *mid* (requires following a clue chain, cross-connects mysteries), *hidden* (requires synthesizing multiple prior clues, always pays off big). Placement encodes the tier — no difficulty label. This maps our retrospective-significance directly onto examine-text depth.
- **Seed ambient clues in the slow window** [`narrative-approach-to-level-design`]. Environmental storytelling lands when the player is *deterred* from advancing — a puzzle, a pause, an obstacle buys look-time, and the player absorbs seeded detail *voluntarily*. So place essence-echo clues in high-deterrence zones, on the high-agency / low-certainty end of the delivery curve (object-examine text), never as a cutscene [`narrative-approach-to-level-design`]. This is the *mechanical* underpinning of "the clue lands because the player chose to look."
- **Seed per-path, not at bottlenecks** [`non-linear-level-design-cyberpunk`]. Cyberpunk's failure was front-loading all lore onto the safe/obvious generic path, so choosing a playstyle path *cost* narrative richness. Budget unique echo-clues *per route* so the player who takes the longer or knowledge-gated path finds a *richer* slice of world, not a diminished one.

**H5 seed — the axes Phase 3 fills (structure only, no filled table):**
- **Examine text tier** — per interactable, classify the clue text as one of: *ambient* (world-feel, no gate value) · *soft-signpost* (hints a gate's existence or key-type) · *hard-key* (contains the fragment/cipher a gate needs). This tiering is the H5 item-verb-table's clue column; it now aligns with the surface/mid/hidden inference-depth axis above.
- **Diegetic-noise ratio** — deliberately seed non-plot examinables so the real clue hides among them (the Frieren "break Chekhov's gun" method, echoed by Kadish's called-for red herrings) [`kadish-tolesa §2`]. Phase 3 sets the ratio per scene; keep it a *dial*, not a maximum, so signal never drowns [Watch-out §9].
- **Cross-reference links** — an examine clue may point at another object/scene (Laki-travelling-key). Phase 3 authors these links; the grammar only requires the field exist.
- **[NEW] Delivery-mode per beat** — tag each interaction beat on the agency/certainty curve [`narrative-approach-to-level-design`]: object-examine = high-agency/low-certainty (default); triggered ambient bark = mid; reserve cutscene-certainty for almost nothing. Never drop to a mode-switch (dialogue box mid-exploration) that fractures the discovery rhythm.

---

## 4. The informational-feedback law in practice — every wrong action teaches — H7/H8

This is a **locked pillar**, and this section makes the grammar *enforce* it. The pilot's "why-specific feedback" and the Myst docs' wrong-action patterns are the same law seen from two sides — and the deduction cluster names it a third time.

**How the sources implement "a wrong action teaches":**
- Teledahn: pressing the elevator button "makes a sound but nothing comes"; the drain-hatch button "buzzes and refuses with a contextual message when pressed out of order. Wrong actions are informative, not silent" [`teledahn §2`].
- Garrison: blocked doors and sealed ring sections *teach why* — they name that power is missing [`garrison §8-steal`].
- Ahnonay: scaring Quabs into the water sets plates off; linking out fails to rotate the sphere — each wrong action *illuminates the mechanism* [`ahnonay §8-steal`].
- Laki: a wrong maze step is "swept back by the current" — diegetic, soft, and it re-teaches "look before you step" [`laki §4`].
- **[NEW]** Alexa/Jack Ryan: "when a player does something wrong, the response nudges them toward the right thing; when they do something right, it nudges them toward what's interesting next" — hint delivery *as* embedded scene direction [`invisible-escape-room-alexa`].
- **[NEW]** Heaven's Vault — **conservation of narrative momentum**: "a repeated action should express character, not loop the system — a stuck door rattled twice becomes the protagonist's frustration, not a computer cycling. Every wrong or redundant action must move something; it must never dead-end or return a blank acknowledgment" [`heavens-vault-detective-story`].
- Genre echo: the Golden Idol clueboard fails an incorrect word in a way that reveals what *is* missing — informational feedback with no separate hint system [`top-10-pnc-games`].

> **Rule (informational-feedback law, enforced).** **Every action produces a specific, world-consistent response — and a wrong action must leave the player knowing *more* than before they tried it.** No silent no-ops. No generic "that doesn't work." No dead-ends. A wrong Use/Make/Show/Collect must (a) respond in-world, (b) explain or *demonstrate* why *this specific* attempt failed, and (c) nudge toward the key-type or the missing fragment. **[NEW]** A *repeated* action must express character or advance, never blank-cycle [`heavens-vault-detective-story`]. This ships as the definition-of-done for every interaction, checked against the §1 fairness test.

**The feedback ladder (what "teaches" is allowed to mean — softest first):**
1. **Diegetic consequence** — the world visibly reacts and the reaction *is* the lesson (Quabs scatter; current sweeps you back). Preferred.
2. **Contextual refusal message** — a specific in-world line naming why *this* is wrong / what's missing (Teledahn's buzz + message; a drawn shutter naming "not until evening" for a time-gate, §2.4).
3. **Key-type preview** — the refusal states the *kind* of key needed (Garrison), converting the failure into a soft lead.
4. **Soft nudge / timed hint spill** — only after repeated failure, per §1's de-friction conveniences.

**[NEW] The "inconclusive" outcome is a fifth register, not a sixth failure.** For deduction/recognition gates (§2.6), the world may render a verdict of *not yet* — "call me back when you know more" [`narrative-deduction-mechanics`]. This is not a fail state and carries no penalty; it is the deduction-loop's diegetic minimum-exit [`heavens-vault-detective-story`], sending the player back to gather more with dignity intact.

**Failure must stay soft and diegetic.** Do **not** import Myst/Uru's forced link-out-on-failure — we have no link mechanic; harsh setback punishes exploration and violates *cozy rhythm* [`laki §5`]. Return-to-last-state or a visual block is the ceiling of punishment. Soft path-commitment (a cost to switch, not an impossibility) is allowed [`non-linear-level-design-cyberpunk`]; a hard lock-out with no recovery is not.

---

## 5. The four action families as a grammar — Collect · Make · Show/Ask · Use — H8

The four families are our **verb set**. This section defines, per family, *what the verb does to scene state* and *how feedback works* — then hands Phase 3 the **axes** for the H8 families × target-types matrix. **The filled matrix is Phase 3 work; only the axes and the per-family contract live here.**

**[NEW] The addressable-space contract governs the whole set.** Before the first gate, the opening scene must *demonstrate* these four families and let the player practice them — the Alexa lesson that a verb set the game can honor must be signalled hard, or players attempt actions the game can't handle and quit [`invisible-escape-room-alexa`]. The four families are also the **expressive vocabulary the deduction proof-step draws on** (§2.6): a proof gate can only be opened if some family can carry the demonstrating action — so verb coverage and gate design are co-designed, never sequential [`narrative-deduction-mechanics`].

**The verb structure (every interaction, all families).** Reverse-outlined from the Myst state-transition beats [`teledahn §1`, `ahnonay §2`] and the pilot contract, every interaction is:

> **`verb (family) × target (type) → [precondition on knowledge/world-state, incl. time-of-day state] → scene-state change → why-specific feedback`**

The **precondition is where the knowledge-key lives** (§2, including the C1-travel check and any authored time-of-day state). The **feedback is where the law lives** (§4). This single line is the atom Phase 3 instantiates for the H8 matrix.

**Per-family contract:**

- **Collect** — *acquire a thing or a fact into the player's persistent memory/inventory.* Scene-state: the target is marked taken (and, per Teledahn's "moved object" storytelling, its absence may itself become a later clue [`teledahn §3`]). Feedback: confirms *what was learned/gained*, not just "picked up." **Because knowledge travels free (C1), "collecting" a memory is a permanent, cross-year, save-wipe-proof acquisition** — the family that most directly feeds the metroidbrainia. Wrong-action: collecting something with no current relevance still yields an examine-tier clue (never a silent grab).

- **Make** — *combine collected things/knowledge into a new thing or a new understanding.* Scene-state: consumes/retains inputs per recipe, produces an output that may itself be a key. Feedback governed by §6 (crafting rules). Wrong-action: a bad combination must reveal what's *missing or mismatched* (the Golden-Idol model), never a blank "nothing happens."

- **Show/Ask** — *present a thing or a known fact to an NPC/object to elicit a response or unlock.* This is the **social/dialogue knowledge-gate** and the **home of the deduction proof-step** (§2.6): the player *presents* evidence and a system in the world renders the verdict [`narrative-deduction-mechanics`]. Scene-state: NPC state / relationship / world-flag advances; the *right* fact shown is a Laki-travelling-key spent as a proof. Feedback: the NPC's reaction *is* the teach — showing the wrong thing should reveal what they *would* respond to (Garrison key-type preview, socialized), and an under-supported argument yields the diegetic "inconclusive — come back when you know more," not a fail [`narrative-deduction-mechanics`, `heavens-vault-detective-story`]. **[NEW]** Knowledge-state gating decides which Show/Ask options even appear — an option surfaces only when its prerequisite is held and the answer isn't already known [`heavens-vault-detective-story`]. This family is still the least covered by the *Myst* docs (they are largely NPC-absent) — but the deduction cluster now sources its state model far better than the prior artifact could; see §8.

- **Use** — *apply a thing/knowledge to a target mechanism in the world.* This is the classic P&C verb and the best-covered by Myst (levers, periscope, plates, gears). Scene-state: mechanism changes state, often cascading (Teledahn power-on). Feedback: the mechanism's visible state-change teaches the system (multi-state objects — Teledahn's four bucket states [`teledahn §2`]); a wrong Use gives contextual refusal (§4). Prefer Uses whose *state is always readable from where the player stands* [`teledahn §2` indicator lights]. **[NEW]** Time-of-day is a legal Use precondition (§2.4): a mechanism may only respond in an authored night/dusk/morning state.

**H8 matrix axes (what Phase 3 fills — grammar defines the axes, not the cells):**
- **Axis 1 — Family:** Collect · Make · Show/Ask · Use (fixed, above).
- **Axis 2 — Target-type:** the classes of thing a verb can act on. *Phase 3 enumerates the actual list* (e.g., portable item · fixed mechanism · NPC · examinable-scenery · memory/fact · the calendar-clock itself · a time-of-day-stated scene). The grammar's requirement: the target-type list must include a **pure-knowledge target** (a fact/memory), because in this game knowledge is a first-class interactable, not only physical objects.
- **Per-cell contract (the shape of every filled cell):** each family×target cell must specify `precondition (incl. C1-travel + time-of-day where relevant) · scene-state change · why-specific feedback (incl. the wrong-action teach)`. A cell with no defined wrong-action teach is incomplete by the informational-feedback law.
- **Coverage rule:** not every cell must be populated, but every *populated* cell obeys the §1 contract and §4 law. Phase 3 decides which cells are live for the slice.

---

## 6. Crafting / Make discovery rules — H7 seed

Kadish gives us the **spec format**; the Ages give the **discovery patterns**.

**The five-field puzzle/recipe template (mandatory on every Make and every gate).** From Kadish's puzzle anatomy [`kadish-tolesa §1`], adopted as our per-recipe/per-gate spec:

> **Problem · Circumstance · Clues · Solution · The Idea**

**"The Idea" is non-negotiable** — one plain-language sentence stating the design intent, so *why* is visible across the whole build pipeline [`kadish-tolesa §8-steal`]. It also separates the three things a knowledge-gate must keep distinct: *what the player must do* / *what the player must know* / *where the knowledge lives*.

**Discovery rules (how a recipe is found, not just executed):**
- **Recipe-as-knowledge, learned then applied elsewhere** (Laki cipher) — a recipe learned in one scene should be applicable in another; discovering the recipe is itself a gate reward.
- **The recipe teaches its own interface through observation** (Ahnonay clock) — a Make interface may not be fully explained; the player infers combinability from correlation, and cracking that *is* the discovery. Reserve this for optional depth, not the critical path.
- **Ritual re-enactment as recipe** (Laki weight-matching) — at least one Make where the player reproduces a historical act; the history *is* the recipe.
- **[NEW] Diegetic cover for every combination** [`invisible-escape-room-alexa`] — puzzles work better when they have an in-world reason to exist; give each recipe a character/world reason it takes the form it does (Grossman's Kessel "hides things in code only he understands" gave diegetic cover for every lock). A recipe with no in-world reason to be a recipe reads as a designer's contrivance.
- **Fairness governs discovery** — a recipe must be *derivable* from taught clues (§1 fairness test); no moon-logic combinations. The Broken Age scarf puzzle is the banned pattern.

**H7 seed — axes Phase 3 fills (no filled recipe table here):**
- **Recipe format** = the five-field template above, plus `inputs → output`, plus `output-is-key? (y/n)`.
- **Discovery-type per recipe:** *taught-explicitly* · *derivable-from-clues* · *inferred-by-observation* (Ahnonay) · *learned-elsewhere* (Laki-travelling). Phase 3 tags each recipe.
- **Wrong-combination feedback** is a required field per recipe (§4): what does a near-miss *reveal*?

**Scope guard for Make:** keep recipe *count* low and *depth* high — Kadish's lesson is that puzzle value is in individual anatomy, not chain length [`kadish-tolesa §5`]. One or two deep Make-gates beat a crafting tree.

---

## 7. Spatial & de-friction grammar (traversal without open-world cost)

Not a hole owner, but the Ages and the level-design talks give traversal rules that keep the P&C scope tight and the fairness test satisfied. Stated as rules our scenes apply:

- **Exterior-as-interior** [`kadish-tolesa §4`] — traversal spaces may *look* open but stay structurally constrained (walls, water, dead-ends). Outdoor feel, no open-world navigation cost.
- **Three-spoke dead-end hub** [`kadish-tolesa §4`] — early exploration = a few short paths, some atmospheric dead-ends, one that opens the main sequence. Feels like a world; navigation never actually branches hard.
- **Decoy exit / opt-in depth** [`garrison §2`, `§8-steal`] — the main task path is short and completable; deeper content branches off it and is never blocking. Players who leave early aren't punished ("Good. No problem."). Directly serves *trust the player*.
- **Reward-space-as-destination** [`teledahn §4`] — every major gate-unlock delivers a *new space* that is itself the reward, not an item or score. Keeps *discovery is the reward* literal.
- **Landmark-state as orientation** [`ahnonay §4`] — one distinctive landmark in a recognizable state tells the player *which year/which state* they're in with no UI. Our calendar-run needs this: the same festival square, aged, tells the year at a glance. **[NEW]** Authored time-of-day states (§2.4) are a second, within-scene orientation layer — a scene painted at dusk reads as dusk with no clock UI.
- **[NEW] Discovery / Exploration beat structure** [`non-linear-level-design-cyberpunk`] — build a scene in two alternating phases: a *wide Discovery zone* that presents the player's options (examines, paths, interactables), then a *narrow Exploration zone* that pays off the choice with its own puzzle or content. Break sightlines between alternative exits (Principle 2) so a small P&C space *feels* like it has depth even when it's compact — "wonder requires not knowing what you missed."
- **[NEW] Live-leads over empty maps** [`heavens-vault-detective-story`] — the player should always leave a scene holding two or three preconditioned reasons to go somewhere next (Chandler unlock), never facing an unmotivated map. Garrison-previews (§2.3) are how we mint those leads.

**De-friction (restating §1's conveniences as spatial law):** highlight-all-interactables kills pixel-hunting; no hidden-path gate may require a pixel-hunt to *find* (only to *understand*); soft/diegetic failure only (§4); and **min/max exit conditions** [`heavens-vault-detective-story`] keep an exhaustive player out of dead-air scanning. **No pixel-hunting, no moon-logic** are hard constraints, not preferences.

---

## 8. Thin spots & KB gaps (be honest)

- **Show/Ask (dialogue/social gates) is much better sourced now, but the *social-state model* is still net-new design.** The prior artifact flagged this family as the thinnest because the Myst docs are NPC-absent. Round B fixes the *loop* half — the deduction cluster [`narrative-deduction-mechanics`, `heavens-vault-detective-story`] gives us construction-over-deduction, knowledge-state gating, the proof-step, and the inconclusive outcome. What is *still* un-sourced is the NPC relationship/affinity state machine underneath a Show/Ask (how showing the right memory changes a character over the festival week). Phase 3 owns that; the loop grammar is ready, the social-state schema is not. Flag for H1/H2 dependency.
- **The time-of-day carve-out is grounded for *fixed* states, thin for *cycling* ones.** It rests on Roc's C3 decision [`GATE-2-review.md` C3] plus the Ahnonay object-state analogy [`ahnonay §3`, `§5`], and is now reinforced by two Myst precedents where a *single fixed* authored lighting state is mechanically load-bearing: Kadish's always-night + moonlight-charged glow-paint puzzle [`kadish-tolesa §4`] and Garrison's always-daytime "sky as security document" [`garrison §3`]. What remains un-sourced is a scene that *cycles between* two or three authored states — no KB note demonstrates that, so treat multi-state scenes as the design frontier and keep the state count low. In all cases: *authored art states gated by knowledge* only — the moment it drifts toward a simulated day-night cycle it violates the C3 cut and the transcript's own prototype-scope warning [`transcript` 21:47:18].
- **The C1 "soft reminder" is a synthesized mechanic, not a lifted one.** Its trigger (a knowledge-state flag firing on a distant unlock) and its restraint (minimum-certainty, recall only the earned fragment) are assembled from Heaven's Vault flag-gating [`heavens-vault-detective-story`] and the Outer Wilds ship-log discipline [`curiosity-driven-exploration-outer-wilds`]. The exact trigger point and phrasing are Phase-3 design work; do not treat §2.0 as a finished spec.
- **No I/O schemas for interactions.** The Ages give state-transition *prose* (Teledahn's numbered beats), not formal contracts. The `verb × target → precondition → state-change → feedback` atom in §5 is *synthesis*, grounded in the beats but Phase 3 owns its formalization. The deduction talks similarly give architecture, not schema — Heaven's Vault's ~1,500-flag system and triangulated clue generator are *models to compress*, not to port at scale [`heavens-vault-detective-story` Watch-outs].
- **The genre survey [`top-10-pnc-games`] is landscape, not craft.** Its knowledge-as-verb validation (Obra Dinn, Golden Idol) corroborates our thesis but "names mechanics without explaining implementation" — used only to corroborate, never as a primary mechanic source.
- **Ahnonay's world-state readout is powerful but scope-dangerous.** The clock-as-map principle is core to our calendar; the 25-wedge implementation is not. Phase 3 must design the *compressed* readout (and keep authored time-of-day states equally low-count) — real design work, not a lift.
- **The deduction talks assume a replay-to-win or heavily-procedural frame we are not building.** Burden of Proof loops until you win; Heaven's Vault leans on constant procedural backstop content [`narrative-deduction-mechanics`, `heavens-vault-detective-story` Watch-outs]. We adopt the *loop grammar and exit conditions*, delivered through hand-authored content and our diegetic informational-feedback law — not a procedural clue generator. Keep these from drifting apart.
- **Excluded as directed:** the two Unreal how-to notes contribute nothing to this grammar (~85% engine scaffolding) [`_index §3 signal #1`] and are listed in frontmatter `excludes`.

---

## 9. Watch-outs (pillar tensions to hold)

- **"Clear goals" / "declare the addressable space" vs. world-as-quest-giver (pull, not push).** The pilot's Rule 1 and the Alexa Rule 4 (§1) must **not** degrade into hand-holding push-quests [`point-and-click-puzzle-design` Watch-outs; `invisible-escape-room-alexa` Watch-outs]. Resolution: the addressable-space contract signals the *verb grammar*, never the *next goal*; the Garrison-preview (§2.3) and Chandler live-leads (§7) supply goals **diegetically and softly** — the world *pulling* toward a goal, never a marker *pushing*. Signpost generously; direct sparingly [`narrative-approach-to-level-design` Watch-outs — high-agency/low-certainty is our default; accept that some players miss seeded detail].
- **Signpost density vs. information overload.** Frieren's "hide the real clue among non-plot noise" [`the-secret-to-frierens-worldbuilding`] and Kadish's red herrings both raise clue-count; the fact-linking UI failure shows the overload endpoint [`narrative-deduction-mechanics`]. Treat diegetic-noise ratio as an **explicit dial**, not a maximum (§3), and keep deduction as *constructed argument*, never atomized on-screen facts.
- **Pressure-plate "clear everything" gates can feel like a checklist, not discovery.** Only use Ahnonay-style sweep-clear gates if the *hunt itself* is interesting [`ahnonay` Watch-outs] — otherwise they violate *discovery is the reward*. Same caution applies to time-of-day gates: a scene that forces the player to cycle every state to brute-force a lock is a checklist; the state should be *deduced*, not swept.
- **Genre's dark register vs. our cozy pillar.** The successful investigative titles skew dark ("gruesome deaths") [`top-10-pnc-games`]; borrow their *knowledge-as-verb* mechanics, not their emotional register.
- **Temporal-reveal must be player-initiated.** Obra-Dinn-style memory replay is a *push* mechanic unless the player initiates it [`top-10-pnc-games` Watch-outs]; Outer Wilds confirms pushed information "is resisted and forgotten," sought information "lands and sticks" [`curiosity-driven-exploration-outer-wilds`]. Our year-to-year knowledge travel — and the C1 soft reminder (§2.0) — must always be player-*chosen* discovery surfaced as recognition, never a prompted flashback. Load-bearing for *pull-not-push* and *trust the player*.
- **[NEW] Per-path uniqueness costs real budget.** Seeding echo-clues per route (§3) only works if each path delivers a distinct payoff — and in a short slice that is a genuine cost; don't spec three paths if only two finish well [`non-linear-level-design-cyberpunk` Watch-outs]. Use soft path-commitment (a cost to switch), never a hard, unrecoverable lock-out — that reads as punishment in a cozy game.
- **[NEW] The proof-step needs verb coverage or it breaks.** If the four families (§5) can't express a demonstrating action, players will hold correct deductions they cannot prove — the deduction talk's named critical failure [`narrative-deduction-mechanics`]. Co-design verb coverage with the recognition gates; never spec the gate first and hope a verb fits.
- **[NEW] Time-of-day is a *state*, not a *sim* — hold the C3 line.** Authored discrete states only; the instant it needs a lighting solver or a real-time clock it has become the simulated world-system C3 cut [`GATE-2-review.md` C3]. Keep the state count low so it never reads as noise (the Ahnonay 25-wedge lesson) [`ahnonay §5`].
- **Strip every co-op and dexterity mechanic at the door.** All five Ages carry Uru's MMO/dexterity DNA (two-player levers, timed docking, wall-climb, shimmy); the deduction talks carry replay-to-win and procedural-generation DNA. None survive contact with our solo, strategy-over-dexterity, non-violent, hand-authored, cozy pillars. Borrow the *gating idea and the loop grammar*, never the co-op, reflex, or replay-to-win implementation [`kadish §5`, `teledahn §5`, `laki §5`, `garrison §5`, `ahnonay §5`, `narrative-deduction-mechanics` Watch-outs].
