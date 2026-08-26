# Festival of Souls (working title) — Game Design Document

A cozy roguelite point-and-click adventure about belonging across lifetimes.

---

# Part I: Concept & Pillars

## 1. Concept

A cozy roguelite **point-and-click adventure** set in a hand-painted magical world in the spirit of *Myst*, *Outer Wilds*, *Frieren*, and *Studio Ghibli*, where you **explore, collect, and discover**.

The game explores one question: what does it mean to belong, and does connection span lifetimes?

You are a mage in a Ghibli-warm world who has just arrived in a new town. You spend your days foraging, crafting, learning folk magic, and getting to know your neighbors. You arrive the week before the festival of souls, and by discovering spells and items and learning about people, you contribute to the festival's success. After the festival, time skips forward a year, you see the outcome of your choices, and the run closes on a single ending vignette. On a return to the game, you find the townsfolk have shuffled: the blacksmith may now be the postman, a friend may now be a brother. Each run is a different lifetime: the roles of the souls reshuffle, but the essence and personality of each soul stays fixed. As you spend more time with people your bond grows across lifetimes.

> **The festival of souls.** The Lantern Arch is said to light the way for souls to return, one night each year, so their loved ones can remember them. That night is the festival you build toward.

> **The slice's shape.** For the vertical slice, the world is small and dense: a one-screen Forest with two knowledge-gated unlocks, a Town (one scene plus the Square), and the Festival Grounds. Seven souls populate it (3 deep + 4 texture), a run is one festival week plus one year-jump, and the slice plays one full run then **one reshuffle** — enough to prove the memory payoff on camera.

---

## 2. The Hook

- Short play sessions that reward replays through knowledge and collection completeness.
- Player agency is honored; no two sessions are the same.
- The same souls return each life in shuffled roles, while personalities stay fixed.
- Built with Human-in-the-Loop AI development pipelines integrated.

---

## 3. Inspirations & Target Audience

> Each reference is taken for one precise structural move, not a vibe. One split is worth holding explicitly: **Outer Wilds lends the *form* of a knowledge game — the notebook, the loop, knowledge-as-key; Obra Dinn lends its *subject* — a mystery made of people. What we pay off is belonging, not a cosmic reveal.**

| Game / work                                        | Mechanic / Inspiration                                  | How we adapt                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| -------------------------------------------------- | ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Outer Wilds**                                    | Knowledge is the key; the log holds it                  | The notebook *is* the ship-log / rumor-graph: it auto-links what you've learned and marks "more to learn here". Knowledge travels free, never expires, and opens gates when *performed*. We take the loop that keeps your knowledge and the traversal engine — **not** the promise of a single terminal world-truth. Here, discovery is of people, and the reward is belonging.  Also borrow the timed run constraint but adapt to a move budget instead of a timer. |
| **Return of the Obra Dinn**                        | Deduction you *prove*, not guess                        | Assert-then-confirm as a compound claim (identity × facet × role), evidence-gated so the small soul-list can't be scanned; correct answers lock in small batches with confirmation withheld. Our recognition gate is this, aimed at souls across lives.                                                                                                                                                                                                              |
| **Myst (and its remakes)**                         | The living-diorama, the information-key                 | Static-camera scenes; the key is *information*, not an item. The five-field puzzle template (Problem / Circumstance / Clues / Solution / The Idea).                                                                                                                                                                                                                                                                                                                  |
| **Frieren: Beyond Journey's End**                  | Tone and voice-guide                                    | We borrow the tone and dialogue patterns and model for writing narrative. Collectible folk magic.                                                                                                                                                                                                                                                                                                                                                                    |
| **A Storied Life: Tabitha**                        | Objects are mundane until you learn what they witnessed | Curation-as-authorship: what you keep writes the memory that remains. Our mementos are the low, unflagged echo-carriers.                                                                                                                                                                                                                                                                                                                                             |
| **Spiritfarer / Animal Crossing / Stardew Valley** | Cozy rhythm; social-forward, softly-limited days        | The neighborly moment-to-moment (talk, gift, tend); the day soft-limited by the world (shops close, light fades), never an energy bar.                                                                                                                                                                                                                                                                                                                               |
| **Majora's Mask**                                  | A recurring deadline everybody remembers                | The festival week as the run boundary: urgency plus melancholy, no fail state, inverted here so *everyone remembers* prior years.                                                                                                                                                                                                                                                                                                                                    |

**Who it's for.** Players who enjoy cozy exploration and collection completionists, and players who enjoy character-driven narrative that explores emotional themes.

---

## 4. Design Pillars

> Each pillar carries the thing a builder must never do that would violate it. The refusal is the contract; the phrase is the reason.

| Pillar                                               | What a builder must never do                                                                                                                                                              |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Discovery is the reward**                          | Never hand the player the answer. Watching a neighbor cast gives clues, not the spell; the player still confirms by trying. Proof comes before definition.                                |
| **Cozy rhythm**                                      | Never hard-stop the player. No single-chain dead-ends, no forced sequence. A stuck player always has another live thing to do.                                                            |
| **Pull, not push**                                   | Never issue a directed command or a quest-arrow. The world *offers* leads (a door that names its own key-type); it never orders.                                                          |
| **Knowledge lives in the player's head, not a flag** | Never flag-block a gate the player has the knowledge to solve. Gates are *performed* (cast the correct spell, know where to find the item), never checked against a "visited X?" boolean. |
| **Non-violent core**                                 | Never resolve a beat with a fight, a fail-punish, or a threat. Conflict is social and internal, never combat.                                                                             |
| **Strategy over dexterity**                          | Never gate anything on timing, aim, reflex, or precision input. Every gate is knowledge, recall, or a social state.                                                                       |
| **Agentic AI accelerates, it never decides**         | Never ship a line no human approved. Agents generate volume and check consistency; a human reviews and approves every line before it ships.                                               |

**Non-Goals.** What the game deliberately won't be:

- **No multiplayer or co-op.** The slice is solo-first. If a mechanic needs a second player, cut it.
- **No tactical combat.** Strategy lives in route, deduction, recognition, and curation-under-consequence, not a battle grid.
- **No live-service or always-online systems.** The shipped game runs fully offline.
- **No hard-lose or game-over.** You always leave with something. A wrong action teaches; it never punishes.
- **No red-herring content.** Keeping clues from being trivially obvious is fine; budgeting a decoy layer is asset spend we don't have.

---

# Part II: Game Mechanics

## 5. Core Loop

**The moment-to-moment loop:**

- **Collect.** Pick up anything collectible: components, made things, mementos, spell-phrases (knowledge), and sounds (audio-objects). Listening is Collect applied to sound.
- **Make.** Combine components plus learned knowledge into an output: a spell, a dish, a craft, a piece of art. One structure for all three.
- **Use.** Apply a held thing (a spell or an item) to a target: ignite a lantern, still the water, offer a scritch to a cat. Presenting an item or a sound to a neighbor is also a Use, with the neighbor's reaction as the result.
- **Converse.** Talk to an NPC. Distinct from Use: no object changes hands, the exchange is dialogue.

**Starting a run.** On game start you get an intro screen and select a persona; for the slice the only choice is mage. You start in the town or the forest. At each location a day is a budget of **3 to 5 screen-moves**. Each screen hosts solo interactions (foraging, casting: procedural, near-zero authoring) and social interactions with any souls present. The first screen teaches the four verbs by doing (§5.2).

**The satchel, the notebook, the home.** You carry a satchel and a notebook. The notebook can be referenced at any time and holds the knowledge you have collected. At day's end you carry from the screen only what fits the satchel, and you return home. You can also end a day early to bank a full pack plus what you can carry in your arms (pack-triage). Your home is this life's hub: you decorate it and can carry items back out of it (they take satchel room). It starts empty at each new life; everything you've ever collected is recorded permanently in the meta-hub (§9.4). When ready to move on, you open the calendar and pick the next day's location.

**The run.** A run is one festival week followed by one year-jump. The week builds toward festival night; the outcome depends on the choices you make. After festival night, time skips a year — backstory fills the gap and neighbors remember what you did — and the run closes on an ending vignette. 

> (One week + one year-jump is the slice's spine; the multi-year cycle is out of scope, §21.)

**Ending a run.** After the final festival night and the year-jump, an ending vignette based on the player's decisions plays.

**A new beginning.** Each new run reshuffles the souls. Personalities stay fixed, but each soul's role in the town is re-dealt into one of two hand-authored arrangements, chosen at random. Over time the player keeps notes on them, in the manner of *Return of the Obra Dinn*. Across runs, the bond level you build with a soul persists, leading to different outcomes. As your bond deepens across lives, its dialogue **warms**: more familiar, more shorthand. Your care also shows up **obliquely** in the world — a neighbor you once helped find her voice now speaks up for a stranger, never thanking you. 

> Belonging is felt in the texture, never stated (see D2 stance, §8.1).

### 5.1 Festival Outcome & Soft Terminal States

Festival night reads the run — chiefly the **number of soul goals completed** (§5.3), colored by the **bonds** you deepened and the **souls you recognized** — through a single success function, and renders the result as a **spectrum, not a branch**. There are no separate festival scenes: it is one festival, dressed differently in its lighting, its vignette, and who shows up, across three tiers plus a rare top:

- **Quiet** *(0–1 goals complete)* — a modest festival; a few souls present, low warm light.
- **Warm** *(2 goals complete)* — the town turns out; the square fills, the lanterns are lit.
- **Grand** *(all 3 goals complete)* — a radiant festival, the fullest turnout, the Lantern Arch at its brightest.
- **(rare top) Souls-of-the-world display** *(all 3 goals + a recognition / bond-depth condition)* — reached only at exceptional depth: the festival briefly shows the souls of the world, a once-in-many-runs tableau. This is the "going big" moment for the slice.

There is **no hard-lose and no game-over**. A run always ends *with something*: the ending vignette is guaranteed. The festival tier is set by the goals you complete (above); the ending itself reflects the deeper **depth of connection reached** — knowledge of people and collection progress — never a score shown. The game cannot be lost, only lived.

### 5.2 Onboarding

The first screen teaches by doing. On a new save you pick a persona and open in the world with a small set of **safe, obvious hints** that teach the four verbs one at a time: something to **Collect** lying in reach, something to **Make** from it, something to **Use** it on, and a neighbor to **Converse** with. The **notebook is introduced as a found object** — you pick it up, and it is already yours. By the end of the first screen the player has done all four verbs.

### 5.3 Soul Goals & the Festival Objective

Each **deep soul** carries one **festival goal** — a concrete thing they want ready by festival night. Its progress sits on a hidden **completion meter** that moves two ways:

- **On its own, off-screen.** When you are not helping, the meter drifts up at random as the soul works alone — but it **caps short of done** (~50–70%). The town lives without you; it just rarely finishes without you.
- **By your help — and help is knowledge-gated.** Only you can complete a goal, and only by *learning what the soul needs* (a deduction, not a quest marker) and then *doing the thing only someone who knew would do* (a performed action, per the pillars).

The **count of completed goals sets the festival tier** (§5.1). Texture souls carry no goal of their own; they only *point* toward a deep soul's need — a passing rumor, "the smith's been fretting over that centerpiece."

**Worked example — the blacksmith's centerpiece.**

> The blacksmith wants to forge a new centerpiece for the Lantern Arch, but it needs a special ore they can't source. You **unlock a forest screen** and find the ore there; if you have **learned the blacksmith needs it**, you bring it and the goal completes. One beat threads all three of the core's knowledge-keys — a screen unlocked, a need recognized, a contribution performed — into a single festival objective.

A soul's **festival goal is its external objective** (it moves the tier); its **arc / belief-shift is its internal journey** (§12, what makes the soul distinct). The two run in parallel and never collide.

---

## 6. Magic System

**Learned by exploring the world or conversing, confirmed by doing.** Seeing a neighbor cast on a target gives a clue, not the spell; you confirm by trying it yourself or talking to them.

- **A spell is a phrase plus components.** A spellbook section in the notebook records the spells you have learned. You learn them by successfully casting them once.
- To cast, select components from your inventory and input the phrase.
- **Physical outcomes only.** Spells produce physical effects, never a mood or a dictated behavior; the outcome is receiver-determined (§6.1), and "no effect" is an honest result.
- **Cost and tiers.** Anyone can cast, but archetypes carry different mana. Low mana means a lower-quality cast (a bigger or smaller fire), and some spells have a high mana floor a low-mana caster cannot meet.
- **Starter set:** `ignite` (sticks), `scratch` (wool), `breath` (grass + dirt).
- **Magic unlocks screens.** Casting is a knowledge-key: watch a neighbor burn a dry hedge to clear it, then do it yourself to open the way. Traversal is gated by what you know, not a flag.
- **Slice count:** 10 spells.

### 6.1 Receiver-Determined Outcomes

The target of any directed interaction determines the outcome. **The action verb encodes only what was done, never what happened.** Ignite-on-sticks catches; ignite-on-a-person does nothing. Spells produce physical outcomes only: they never set a mood or dictate a behavior.

---

## 7. Collectibles

> Six item categories the player can **Collect**. Persistence follows the Save-State rules (§8.1): sounds and knowledge travel free, everything physical is pack-triaged.

| Category                   | Role                                                                  | Persistence          | Examples                            |
| -------------------------- | --------------------------------------------------------------------- | -------------------- | ----------------------------------- |
| **Components**             | Foraged magic ingredients, consumable; feed Magic casting and Make    | pack-triaged         | a berry · a river stone · a feather |
| **Made things**            | Outputs of Make (dishes, crafts, art); some consumable, some giftable | pack-triaged         | a warm loaf · a small carving       |
| **Mementos / keepsakes**   | Hub decoration and achievement markers                                | pack-triaged         | a worn ribbon · a pressed flower    |
| **Gifts**                  | Key Items to give to NPCs to advance story                            | drawn from above     | a given keepsake                    |
| **Sounds** (audio-objects) | Travel free, no pack space; show / gift / spell-component             | free, like knowledge | a festival bell · a hummed tune     |
| **Tools**                  | Non-consumable Use-family items                                       | pack-triaged         | a lantern · a small knife           |

**Scope:** roughly 3 per category, about 15 distinct items (gifts overlap mementos and made-things); final counts from the content budget (§16).

---

## 8. World & Progression

### 8.1 Save-State: what the save file records

> **Two things about a soul are tracked, and they never feed each other.** The **essence** side is *fact* — assertable, confirmable, and revisable (what you have learned and can prove about who a soul is); it is what the recognition gate checks. The **bond** side is *emergent* — a single hidden count that accretes from how you treat a soul, never shown and never split into stored sub-scores; it is what warms a soul's dialogue across lives (§5) and produces the oblique reciprocity. Essence is deduction; bond is relationship.

The game tracks save-state across two in-game boundaries: a **run** (day to day, year to year within one life) and a **reshuffle** (the start of a new run). A player can choose to delete their save file from disk to wipe NPC memory. There are 3 save slots; the meta-hub collection is shared across all of them, while each life's in-game home starts empty.

| Data                                                          | Within a run (day → day, year → year)                          | Across a reshuffle (new run)                                                    |
| ------------------------------------------------------------- | -------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| **Spells**                                                    | Yes, in the notebook                                           | Yes, in the notebook                                                            |
| **Sounds** (audio-objects)                                    | Yes                                                            | Yes                                                                             |
| **Physical items** (components, made things, mementos, tools) | Only what fits the satchel; the rest stays in this life's home | **No** — the in-game home resets empty                                          |
| **Bond level** (per soul)                                     | Yes, grows                                                     | Yes, builds over time                                                           |
| **Roles / relationships**                                     | Fixed                                                          | Re-dealt                                                                        |
| **In-game home** (this life's décor)                          | Yes, you arrange it                                            | **No** — resets each run                                                        |
| **Meta-hub collection** (items *held* · sounds *heard*)       | Grows as you discover                                          | **Yes** — permanent; new finds unlock as display pieces, never for use in a run |

### 8.2 Game Clock

Time in the game follows this structure:

- **Day.** A budget of 3 to 5 screen-moves at one location. Time of day advances when you move to another location (map). At day's end you return home and pick the next day's location.
- **Week.** The week builds to festival night. A week is currently 5 days but can expand or contract with scope.
- **Year-jump.** After the festival, time skips a year; backstory fills the gap; neighbors remember last year.
- **Run (a life).** One festival week + one year-jump, then an ending vignette: `week → year-jump → vignette`. (The multi-year cycle is out of scope for the slice; see §21.)
- **Postrun (a new timeline).** A new run reshuffles / re-deals roles into one of two hand-authored arrangements (personalities fixed); bond levels carry across.

Route choice is attention allocation: you cannot be everywhere before the festival, so the calendar is the strategy layer.

---

## 9. Levels

> The slice ships a **small, dense map** — three places plus the home hub. Small is deliberate: every screen earns its place, and the Forest alone carries the proof that *knowledge is the key*. Each unlock is **performed, not flagged**: the player opens a path because they know something (a spell watched, a cipher understood), never because they picked up an item. A short path off the Square connects Town and Forest.

**9.1 Town.** The festival's home — one scene plus the Square.

- **Square** *(start)* — under the Lantern Arch, which ages across the years; where you arrive. The Arch lights the way for souls to return each year (§1); the blacksmith's goal (§5.3) is a new centerpiece for it.
- **Town scene** — the lived-in heart: market stalls, the commons and well, and the main NPCs at their work (a blacksmith's bench, a baker's counter). NPC homes open here at a certain bond level. The Tavern corner opens in the evening.

**9.2 Forest.** One screen plus two knowledge-gated unlocks.

- **Forager's Clearing** *(start)* — the onboarding screen (§5.2) on a first life; reshuffles like everywhere else on later runs.
- **Unlock 1** — a path cleared by a spell (e.g. ignite a dry hedge).
- **Unlock 2** — a secret path learned from an NPC.

> Both unlocks are the vertical-slice proof of the metroidbrainia core: traversal itself is gated by knowledge carried across lives.

**9.3 Festival Grounds.** The final screen 

> — the run's build-up pays off here, dressed along the §5.1 tier the run earned (quiet → warm → grand, or the rare souls-of-the-world display).

**9.4 Home Hub.** Two spaces sharing one asset set:

- **In-game home.** Your home during a life — return at day's end, bank what fits the satchel, and decorate it. It resets empty at the start of each new run.
- **Meta-hub (main menu).** The role-select screen doubles as your permanent collection: every item *held* and sound *heard* is recorded, completion tracked across all lives, and each run's new finds unlock as display pieces you arrange. It shares the home's decoration assets, but its pieces are display-only — never withdrawable into a run.

> *(The Farm third location is cut from the slice — see §21.)*

---

## 10. Art & Audio Direction

**Tone words:** Ghibli-warm, painterly, quietly melancholic, lived-in with dialogue modeled on *Frieren*. 

> Concept references set the rules, not the assets: the desaturation discipline and flat emotional register of *Frieren*, the palette warmth and environmental wonder of Studio Ghibli, the static-camera living-diorama of *Myst*. No imagery is reproduced.

**Built in 3D.** The planned engine is Unreal, using the Point-and-Click toolkit from the Fab marketplace. The goal is 3D levels for visual depth, with one built environment reused from many angles: one 3D location yields many static-camera scenes. 

> The replayed festival week across the year-jump then renders cheaply: the same level at a different angle, time-of-day, or seasonal state gives the "time moved, we returned" read with no intertitle.

> 3D can read sterile and un-Ghibli, so warmth is held by a system rather than by hand-finishing every asset: a hard-constrained palette (bands, not a free wheel), a locked silhouette vocabulary every generated variant reads as a variant *of*, and one key-art board plus one review eye. Cohesion comes from rules plus a single reviewer (owned by Agent 6, §13).

**Sonic identity.** Music inspired by Joe Hisaishi and the Studio Ghibli films. Ambience and items grounded in foley libraries and field recordings. Magic follows an anime style. UI is tactile, with fantasy flourishes where appropriate. 

> Sound is the strongest retrospective trigger a person has, which is why the audible essence-signature is the deepest recognition clue: the deepest soul's leitmotif surfaces from the festival mix **once you have noticed and matched a detail about them across lives** — the leitmotif is triggered by a detail the player *caught and connected*, never by an accrual counter ticking over — so you can recognize someone by their sound before you can name them.

**Going big.** There is no single global "epic" register. 

> Each domain of a big moment gets the register that fits it, and the words stay plain in all of them: social payoffs stay narrative-dialogue driven, while world-opening and magic carry the Outer Wilds revelation and Ghibli awe. 

The swell is visual, scale, or revelation — the festival's souls-of-the-world display (§5.1) is the slice's one authored example. Wonder is also sprinkled in mid-run moments, framed either large (a wide tableau) or small (a zoomed-in detail).

---

# Part III: Narrative & AI Pipeline

## 11. The Narrative Process

> The narrative is generated by a repeatable build-time process, not written by one person holding the whole world in their head. A small crew of agents produces the game's content during development, steered by a per-arc document. A human approves every line at the output.

#### The process, step by step

1. **Steer.** Write the per-arc doc: a note per soul for where they are heading, the threads to keep alive, and what the arc is not. Everything downstream reads from it.
2. **Intake.** Hand the crew the arc doc, the soul roster, a backstory guideline per soul, and the player's chosen background. Each scene request carries the character arc, and a request with no steering tag bounces back.
3. **Cards.** Fill a persona card per soul, top-down from a **primal**: each soul starts from one "the world is ___" belief, and its behavior axes — warmth, precision, deflection — are *derived* from that belief, not set independently. Essence stays fixed across every life, role is re-dealt each reshuffle, traits kept orthogonal so no two souls read as the same archetype in different hats. (Primals are *sentences* that seed hand-written specifics, never a stored number — see §13 Agent 1.)
4. **Echoes.** Write the seed-and-payoff templates. A plain detail is planted early beside ordinary business, and it pays off later only once the player has made the deduction its condition names. It is a recognition mechanic, never a promise about feeling.
5. **Graph.** Lay the scene graph as preconditioned encounters, not quests. The world offers two or three live leads, each scene resolves from any entry point, and each adds one new fact under cover of an ordinary job, in the richer form a world fact and a personal fact together.
6. **Gates.** Spec each winnable deduction (Problem, Circumstance, Clues, Solution, the Idea). The proof is a diegetic action only someone who understood would take, never an "I figured it out" button.
7. **Lines.** The Content Agent writes one slot at a time using the style guide.
8. **Check.** A Consistency Verifier flags each batch against a locked invariant set, an automated pass strips the AI tells, and QA confirms the graph is traversable. All three flag only; none rewrite.
9. **Approve.** A human approves every line at the output, using the SDT checklist (autonomy, competence, relatedness) for what the machine cannot judge. Nothing ships unread.

Steps 1–6 are the Narrative Architect's; step 7 is the Content Agent; step 8 is the Consistency Verifier and the QA Agent; step 9 is the human. The Orchestrator sequences the chain — it hands each worker its prepared input, collects the typed output, and surfaces the gates — while the Style and Production agents run alongside (full roster in §13).

**The constraint.** We write stories; we do not script payoff. The mechanical recognition is scripted (the player asserts a soul's essence, the game confirms at a threshold, wrong guesses teach) and the text is authored, but the resonance is invited, never produced or measured. No agent, field, or metric claims to know what the player feels. Procedural technique is primary; cohesion and story serve it.

The full construction spec — the ordered procedure, the guardrail checklist, the register rules, the arc-doc and card and echo templates, the build-time ink authoring loop, and a worked example — is maintained as a separate working specification (`narrative-pipeline/`).

---

## 12. A Worked Soul Arc

To prove a soul reads as a **distinct person on the page** — not a role with a swapped noun — here is one deep soul's arc, in the shape the Narrative Architect (Agent 1, §13) emits. This is the doc that Definition-of-Done criterion 4 (§22.1) must satisfy end-to-end.

**Soul:** **▶ Roc** — name the deep soul *(pipeline working name: Mara).*
**Primal (the seed belief):** **▶ Roc** — one "the world is ___" sentence. *(e.g. "the world is a debt you repay by staying useful.")*
**World Truths:** what is true in this soul's corner of the world, regardless of the player. **▶ Roc.**
**Arc Question (X → Y):** the single question the soul's arc across the run asks. **▶ Roc.**
**Spine:** the belief-shift the arc moves along — from the primal toward what a discovery could change. **▶ Roc.**
**Threads to keep alive:** 2–3 recurring details that survive the reshuffle (a soul-bound object, a turn of phrase, a habit). **▶ Roc.**
**What it's NOT:** the misreads to refuse — the archetype this soul must never collapse into. **▶ Roc.**

**One seed → payoff echo (with real lines):**

- **Seed** (planted early, ≤25 words, beside ordinary business): **▶ Roc.**
- **Payoff condition** (fires only once the player has made the deduction it names): **▶ Roc.**
- **Payoff line** (the recognition beat, in the flat register): **▶ Roc.**

**The distinctness test (§22.2).** Read the deep souls' key lines side by side: each must be **non-swappable** — you cannot turn this soul into another by changing a noun. Because each soul is now derived from a different primal (§11 step 3), the distinctness is generated, not asserted, and therefore checkable on paper (§21).

---

## 13. Agents

The crew obeys three rules: **one agent per feature, each seat with a clear why** (seven workers plus an orchestrator is scope guidance, not a hard cap); **call down, signal up** (the orchestrator hands each agent a prepared input and collects a typed output; workers never call each other, which keeps every agent testable in isolation); and **the human gate lives at the output, never mid-chain** (a human reviews and approves; a broken output is never silently swallowed). Every agent does bounded structured output, classification, or string-pattern work; nothing rests on open-ended generation. Schemas are given at document altitude; the field-level implementation schema is a build task.

**Agent 0: Orchestrator (the manager).** Owns sequencing and gate-keeping, not vision or content. Frames scope, reads the bus, decides which stage runs next, hands each worker its input bundle (the per-arc arc doc and NPC codex ride in every bundle), collects the typed output, and surfaces the human-gate checkpoints. Resolves conflicts when two outputs disagree.

- *In:* `{ session_goal, pipeline_stage: "schema|greybox|prose|canon_check", agents_to_call:[…], arc_doc_ref, npc_codex_ref, session_state_ref, human_gate_required }`
- *Out:* `{ session_id, dispatch_queue:[{ agent_id, input_bundle, gate_before_write }], session_state_update, surfaced_gates:[…] }`
- *When:* always first, and again after each worker completes. *Gate:* routes freely; every worker's output is human-gated before it commits.

**Agent 1: Narrative Architect (schema stage).** Owns story architecture: the structural layer that tells every downstream agent *what* the narrative commits to, without writing a player-facing line. It folds three sub-functions: the seed-and-payoff echo map, the persona-card schema, and the delta rule (what changes across the year-jump vs. what stays canon) plus canon flags. It also maintains the human-note Soul Arc Spines, threads to keep, and what the arc is not, and emits the NPC codex, the canonical per-arc registry of which souls exist and their locked facts. Each persona card is built **top-down from a primal**: the `primal_profile` is the seed, and the behavior axes (warmth, precision, deflection) are its *derived surface expression*, never set independently. It does not write dialogue, does not check consistency, and cannot invent NPCs: the roster is a required input, and the codex enforces it.

- *In:* `{ arc_doc:{ soul_arc_spines:[…human notes…], threads_to_keep, not_this_arc }, slice_npcs:[{ npc_id, primal_seed:"the world is ___", essence_hints:[…seed…], backstory_guideline, suit_tag }], player_background, scene_list:[…], locked_decisions:{ knowledge_travels, superposition_rule, soft_reminder }, voice_guide_ref }`
- *Out:* `{ persona_cards:[{ npc_id, primal_profile:"the world is ___ (seed sentence)", trait_axes:[{axis,value}] (derived from the primal; also serve as bond-weight coefficients, §14), backstory_guideline, essence_descriptor, suit_tag, authored_exceptions:[…] }], echo_templates:[{ npc_id, seed_scene, seed_event(≤25w), payoff_scene, payoff_condition, payoff_voice, reveal_npc_id, prerequisite_theme }], npc_codex:{ souls:[{ npc_id, locked_facts:[…], places_threads:[…] }] }, delta_rule, canon_flags:[…] }`
- *When:* schema stage, once per run, always before any Content call. *Gate:* hard: cards and echo map reviewed before they propagate. **Guard:** the primal is an essence-side *sentence*, orthogonal to the bond guard; it is never flattened into a stored numeric profile.

**Agent 2: Content / Dialogue Agent (prose stage).** Owns all player-facing text (NPC lines, lore, environmental text, object descriptions, echo fragments) inside the voice register. Takes a persona card, an echo template, and scene context and emits finished content, **one slot per call**. Makes no structural decisions and does not assign its own tones (the tone enum is fixed, not generated). It emits the same `speaker_id / tone / text` shape the engine reads at runtime, with no translation layer.

- *In:* `{ npc_id, persona_card, echo_template:{ seed_event, payoff_condition }, scene_context:{ scene_id, time_of_day, world_state_excerpt }, tone_enum:["quiet","wistful","matter_of_fact","warm","distant"], voice_register:"flat|warmth-swell|retrospective", max_words:40, voice_guide_ref }`
- *Out:* `{ content_lines:[{ content_id, speaker_id, tone, text(≤40w dialogue / ≤60 description), scene_id, echo_flag, canon_flag }], human_review_required }`
- *When:* prose stage, after the scaffold locks and cards are approved; per slot, one call one block. *Gate:* an automated tell / voice-drift pre-pass flags markers, then a human reviews only flagged, echo, or retrospective lines; clean lines advance.

**Agent 3: Consistency Verifier (canon-check satellite).** Owns consistency: reads each new content batch and checks it against a **finite, concrete invariant set** plus the voice register, before anything commits. It **flags only**: never generates, rewrites, or auto-repairs. The check-set is the game's own locked rules (seven invariants — superposition, essence-vs-role discipline, delta, knowledge-travels, informational-feedback, voice register, and fact-tier-vs-bias-tier — defined in the `narrative-pipeline/` spec). The superposition invariant carries the bond bright line: one hidden count, never stored per-category sub-scores (§8.1).

- *In:* `{ new_lines:[{ content_id, speaker_id, tone, text, scene_id }], active_canon:{ persona_cards, echo_templates, npc_codex, bond_levels, locked_roles }, session_state_ref, invariant_set:[…7…] }`
- *Out:* `{ verification_report:[{ content_id, scene_id, status:"PASS|FLAG", flag_type, flag_reason(≤30w) }], human_action_required, summary }`
- *When:* after every Content batch, before commit, and at the session-boundary snapshot. *Gate:* always human-gated: no flagged content commits without sign-off; PASS routes silently.

**Agent 4: Audio-Tag Agent.** Owns the audio-tag contract that makes the audio pipeline (§19) work. Takes new entities plus the current tag-to-asset library and produces a compliant Unreal GameplayTag per required audio trigger, mapped to a Wwise event, checking each proposed tag for collisions and orphan or missing mappings. Generates no audio and assigns no style or emotion: it names and verifies format only.

- *In:* `{ new_entities:[{ entity_id, entity_type:"npc|object|scene|spell" }], required_interactions:[…from the four families…], existing_tag_library }`
- *Out:* `{ new_tags:[{ entity_id, gameplay_tag:"NPC.Chef.Show.React", wwise_event, collision_flag, orphan_flag }], library_delta, violations:[…] }`
- *When:* schema / pre-production, whenever new entities enter the slice. *Gate:* soft: the library delta is reviewed and auto-commits on no objection.

**Agent 5: QA / Playtest Agent (traversal & functionality).** Owns structural QA: verifies the assembled slice is **traversable and works as specced** before ship. Enumerates choice permutations, checks every branch and state is reachable and leads somewhere valid (no soft-locks, dead-ends, or orphaned content), confirms win-states are reachable by an intended path, and confirms each interaction produces its specified effect and its wrong-action teach. Flags only. Distinct from Agent 3: the Verifier checks *is it consistent?*; QA checks *does it work and can you get through?*

- *In:* `{ scene_graph, gates:[{ gate_id, key_type, unlocks:[…] }], win_lose_conditions, interaction_specs:[{ interaction_id, expected_effect, wrong_action_teach }], archetypes:["discovery","emotional","puzzle"] }`
- *Out:* `{ reachability:[{ node_id, reachable, via:[…] }], flags:[{ flag_type:"soft_lock|dead_end|unreachable_content|unreachable_win|broken_interaction|missing_wrong_action_teach", location, detail(≤30w), severity }], archetype_notes:[…], human_action_required }`
- *When:* after a batch assembles into a playable scene graph, and again pre-ship. *Gate:* hard on any soft-lock or unreachable-win; soft otherwise.

**Agent 6: Style / Art-Direction Agent (schema / asset stage).** Owns the visual cohesion contract: the color grammar (bands, not a free wheel) and the silhouette vocabulary, expressed as **machine-checkable rules**. Checks each generated art variant reads as a variant *of* the locked vocabulary, flagging palette drift and silhouette breaks. Generates no final art and sets no story; it names and checks the rules a variant must satisfy. This is the **8/6 style-guide milestone** (§20) and fills the art-direction gap in the roster.

- *In:* `{ new_assets:[{ asset_id, asset_type }], locked_palette_bands, silhouette_vocabulary, key_art_ref }`
- *Out:* `{ variant_checks:[{ asset_id, status:"PASS|FLAG", rule_violated }], palette_delta }`
- *When:* whenever new visual assets enter the slice. *Gate:* soft: the single review eye signs off flags.

**Agent 7: Production / PM Agent (all stages).** Owns the schedule, not the content: maintains the milestone-aligned backlog, tracks the human-review queue (the load-bearing bottleneck, §16), flags the unscheduled review-week and back-loaded work, and produces a weekly readiness summary. Makes no design or content decisions; it surfaces risk and sequencing to the human. (Promotes the previously-unstaffed project-manager candidate.)

- *In:* `{ milestone_calendar, task_status, review_queue_depth, remaining_time }`
- *Out:* `{ prioritized_backlog, scope_cut_recommendations, review_week_flags, readiness_summary }`
- *When:* weekly, and at each milestone boundary. *Gate:* advisory only; the human decides.

The runtime persistence system is mechanics, not an agent. One expansion candidate remains named but unstaffed until the build surfaces the need: an audio implementer that wires each tag to a real asset.

**Roster + human-gate summary**

| #   | Agent                    | Feature owned (one)                                                                | Stage        | Human gate                                                               |
| --- | ------------------------ | ---------------------------------------------------------------------------------- | ------------ | ------------------------------------------------------------------------ |
| 0   | Orchestrator             | Sequencing · session-state bus · gate-surfacing                                    | all          | Routes freely; each worker's output is gated                             |
| 1   | Narrative Architect      | Story structure: arc doc + echo map + persona-card schema + delta rule + NPC codex | schema       | Hard: cards + echo map reviewed before propagation                       |
| 2   | Content / Dialogue Agent | All player-facing text                                                             | prose        | Tell-pre-pass, then a human reviews flagged / echo / retrospective lines |
| 3   | Consistency Verifier     | Consistency vs. finite canon invariants; flags only                                | canon-check  | Always gated: no flagged content commits unreviewed                      |
| 4   | Audio-Tag Agent          | Audio-tag contract (GameplayTags + tag-to-asset library)                           | schema       | Soft: library delta auto-commits on no objection                         |
| 5   | QA / Playtest Agent      | Traversal & functionality; flags only                                              | QA           | Hard on soft-lock / unreachable-win; soft otherwise                      |
| 6   | Style / Art-Direction    | Visual cohesion: color grammar + silhouette vocabulary as checkable rules          | schema/asset | Soft: single review eye signs off flags                                  |
| 7   | Production / PM          | Schedule · review-queue · scope-cut recommendations                                | all          | Advisory only; the human decides                                         |

---

## 14. The Content Pipeline

The pipeline is **build-time only**. We run the crew (§13) during development to generate the game's content, and the shipped game plays it back from a static library. **A run makes zero model calls.** This is the shippable-to-anyone mode: fully offline, fully QA-able, needing no server, key, or network.

The mechanism that realizes "call down, signal up" (§13) is a shared **session-state artifact** (the bus): every agent reads it at start and writes its finished output back, and the orchestrator reads the bus to decide what runs next. The pipeline stages are `schema → greybox → prose → canon_check`, gated at each worker's output. Two per-arc artifacts live on the bus and are handed to every worker: the **arc doc** (the steering layer) and the **NPC codex** (the canonical soul registry the Verifier checks against).

The shipped game's memory is ordinary game code. A persistence engine remembers your incarnations, tracks the bond level per soul (the single hidden count of §8.1, accreted from weighted interactions across four action-categories — trust · intimacy · recognition · respect — with per-soul card-trait coefficients), gates the calendar, re-deals roles and relationships into one of the two arrangements at run boundaries, and surfaces the soft in-world reminders. **That same hidden count drives the oblique reciprocity (§5): as it rises, the runtime selects warmer dialogue variants for that soul — a bond-driven text selection, not a new system.** Runtime LLM calls, cloud-token usage, and AI cost are all zero. The dev-crew's only obligation toward it is to author the schema the runtime reads.

---

## 15. Build-Time Agent Plan

Which agent builds each component, and when, aligned to the milestone calendar (§20). Agent responsibilities are specified in §13; this maps them to build components and the two tracks.

| Component                                                               | Build agent(s)                      | Human role                                            |
| ----------------------------------------------------------------------- | ----------------------------------- | ----------------------------------------------------- |
| Orchestration + session-state bus                                       | Orchestrator (0)                    | Frames scope, reads surfaced gates                    |
| Persona cards + echo map                                                | Narrative Architect (1)             | Hard gate: reviews cards + echo map                   |
| Player-facing text (dialogue, lore, echoes)                             | Content / Dialogue Agent (2)        | Reviews flagged / echo / retrospective lines          |
| Consistency check vs. canon                                             | Consistency Verifier (3)            | Signs off every flag                                  |
| Audio + asset tags (GameplayTags → Wwise)                               | Audio-Tag Agent (4)                 | Soft gate: library delta auto-commits on no objection |
| Level / gate layout → scene graph                                       | Human → QA Agent (5)                | Human authors layout; QA validates traversal          |
| Traversal / reachability QA                                             | QA / Playtest Agent (5)             | Triages flags; human playtest is the fun signal       |
| Style guide (color grammar + silhouette vocab)                          | Style / Art-Direction Agent (6)     | Single review eye signs off flags                     |
| Schedule + review-queue tracking                                        | Production / PM Agent (7)           | Human decides on flags and scope-cut recommendations  |
| **Engineering track (persistence · ink↔UE · tag-to-asset · save/load)** | **Human, AI-assisted**              | Human owns architecture; AI assists, never decides    |
| **Track A: narrative proof (ink/html)**                                 | Content pipeline + engineering      | Line review gates content                             |
| **Track B: visual/asset build (Unreal)**                                | Engineering + style discipline (§10) | Assets approved independent of review                 |

Two tracks run in parallel on purpose (§17): the line-review on Track A never bottlenecks Track B's visual asset build.

**The Engineering track** is human-owned with AI assist. The persistence save is load-bearing — it *is* Definition-of-Done criterion 3 (§22.1) — and the pillar says AI never decides architecture, so a human owns it and AI assists. A **week-1 save/load smoke test** proves the reshuffle carries state before any content depends on it (§21 sequencing gate).

---

## 16. Token Budget

The content-budget formula sizes the content component (Agent 2's output volume):

```
interaction-beats = souls-present × years × days × beats/day
                  + echo-strands × bond-deepening candidates
                  + descriptor-reaction lines × NPCs
                  + spells + items + locations
```

The locked inputs are real: **7 souls (3 deep + 4 texture)**; every run caps NPCs present at **5–7** (availability may leave the wanted soul absent); candidate cap 3; **years 1** (one week + one year-jump); locations: Forest (1 screen + 2 unlocks) · Town (1 scene + Square) · Festival Grounds; days per run 5; screen-moves per day 3 to 5; **2 hand-authored arrangements**; slice spells 10; seed items about 3 per category (about 15). A first-pass estimate: about `6 present × 1 year × 5 days × ~1.4 ≈ 40` social beats + 2 echo-strands + about 25 essence-reaction templates, across the 2 arrangements (heavy template overlap).

From content-beats to whole-crew tokens:

```
dev-tokens ≈ interaction-beats × tokens/beat × crew-overhead
```

Only Agent 2 (Content) is output-heavy; the rest are overhead or input-heavy-but-cache-mitigated. The crew-overhead factor (about 1.5 to 2×) is what agents 0/1/3/4/5/6/7 add on the content baseline.

| Agent                       | Runs when                           | Token shape                                    | Load                       |
| --------------------------- | ----------------------------------- | ---------------------------------------------- | -------------------------- |
| **0 Orchestrator**          | every stage + after each worker     | small routing I/O; reads the summarized bus    | overhead, many small calls |
| **1 Narrative Architect**   | once per schema stage               | a few large structured outputs                 | one-time, moderate         |
| **2 Content / Dialogue**    | about 100 to 150 calls              | small output (≤40–60w), cacheable input        | the baseline (dominant)    |
| **3 Consistency Verifier**  | after every content batch           | input-heavy re-read of canon; flag-only output | moderate, cache-mitigated  |
| **4 Audio-Tag**             | per new-entity batch                | small string-gen + collision lookup            | low                        |
| **5 QA / Playtest**         | per scene-graph assembly + pre-ship | input-heavy graph read; flag-only output       | moderate, few calls        |
| **6 Style / Art-Direction** | per new-asset batch                 | small rule-check output                        | low                        |
| **7 Production / PM**       | weekly + milestone boundaries       | small structured summary                       | low                        |

The load-bearing assumption is that prompt caching collapses the input-heavy agents' canon and graph re-reads to about 0.1× (a stable prefix). Projections are first-pass, blended about $10 to $12 per Mtok across a mid tier and a Haiku-class tier, build-time only; runtime is $0:

| Scenario     | Assumptions                                                                     | Dev tokens (one-time) | Cost (est.) |
| ------------ | ------------------------------------------------------------------------------- | --------------------- | ----------- |
| **Lean**     | 1 generation pass · tight caching · verify/QA on Haiku                          | about 1.5M            | about $15   |
| **Expected** | 1 pass + targeted revise loops · about 1.5 to 2× crew-overhead · normal caching | about 2.5M            | about $25   |
| **Heavy**    | weak caching · mid-tier verify · one extra full-crew revise pass                | about 3.5M            | about $40   |

All three are one-time dev costs: runtime stays $0. The binding cost is not dollars but **human review time (about half a week)**, because every shipped line is personally approved (about **100 to 150 items**); this, not tokens, governs the deadline, and it is what Agent 7 (§13) exists to schedule.

---

# Part IV: Technical Strategy & Scope

## 17. Technical Overview

**Full vertical slice.** Unreal (UE5), the Point-and-Click toolkit (Fab marketplace), Wwise audio middleware, 3D static-camera scenes.

**This-week proof-of-concept.** ink + html: the fastest way to prove the narrative pipeline in a browser. Ink is not throwaway; it is the production narrative engine, carried into Unreal via ink-to-UE integration (inkcpp / Inkpot). The ink content graph built this week is the same graph the slice ships on.

**Two build tracks (so review never blocks assets).**

- **Track A: narrative pipeline proof (ink/html), this week.** Proves the seed-to-payoff-to-recognition loop and the content pipeline (§14). Gated by line review.
- **Track B: visual/asset build (Unreal).** Environments, static-camera scenes, audio tags. Runs independently, so review time never stalls visual work.

**The slice contract: polish the run, prove the loop.** Fun lives in the run; everything past it is demonstration. *What the slice must prove, and how we will know it is done, now lives as checkable criteria in §22 (Acceptance Criteria).*

---

## 18. Project Conventions

One idea runs the whole game: a single, department-agnostic tag names each gameplay event, and a lookup table turns that tag into sound, text, and art at once. A strict file-system hierarchy and folder map provide self-documenting asset connections and help an LLM derive where assets live.

```
<Entity>.<Interaction>[.<Phase>]   →   Wwise event · dialogue key · animation/VFX   (per department, via the tag-to-asset library)
```

- **Naming rule:** tags are hierarchical, department-agnostic (no `Audio.` / `Text.` / `Art.` prefix), and extensible: new content adds new tags, never a new scheme or an enum edit.
- **Resolution rule:** every department reads the *same* tag through its own resolver column in the library. Adding a department means adding a column.
- **CI note:** a validation pass (WAAPI-backed) flags orphan tags (a tag with no mapping) and missing mappings, the same collision and orphan check the Audio-Tag Agent runs, promoted to a build check so the library cannot silently drift.

---

## 19. Audio & Asset Implementation

Sounds are collectible objects that travel free like knowledge: you can show one to a neighbor (the leitmotif probe), gift a recorded melody as a declaration, or use one as a spell component. You record deliberately, never knowing which sound will matter, and its significance lands later. The deepest soul's leitmotif surfaces from the festival mix once you have noticed and matched a detail about them across lives (the recognition trigger, §10) — so you can recognize someone by their sound before you can name them.

Triggers are department-agnostic Unreal GameplayTags, resolved to Wwise events through a data-driven tag-to-asset library.

- **One tag is a game-wide gameplay-event key, with no department prefix.** Each event is a hierarchical, extensible GameplayTag: `<Entity>.<Interaction>[.<Phase>]`, for example `NPC.Chef.Show.React` and `NPC.Chef.Ask.React`. One tag names one event, game-wide. The hierarchy grows by adding tags as content grows: no fixed enum, no schema change.
- **A tag-to-asset library resolves each tag per department.** The same tag maps to a Wwise event (audio), a dialogue line or key (text), and an animation or VFX asset (art): one tag, N department resolutions, so a single gameplay event drives sound and text and art together. The library (an Unreal DataAsset / DataTable) is the single source of truth, unaffected by assets being moved or renamed.
- **Direct event targeting.** Gameplay fires the event by tag lookup; each department reads its own resolution. Wwise Switches, States, and RTPCs are reserved for genuine runtime variation only (material-based footsteps, intensity or time-of-day ramps).

The Show and Ask interactions carry distinct interaction names because an NPC reacting to a shown sound resolves to different audio and dialogue than a spoken probe.

**Middleware is Wwise** (locked): familiar, scriptable, and WAAPI is the natural home for library tooling and validation.

**Ownership.** The tag namespace is shared and game-wide. The Audio-Tag Agent (§13) owns the audio resolution: it proposes compliant tags and maps and verifies each tag's Wwise-event entry, flagging collisions and orphan or missing audio mappings. It generates no audio and assigns no style or emotion. Text and art resolutions are owned by their own department passes, keyed off the same tags.

---

## 20. Milestones

Anchored to the course assignment dates. Each milestone carries what must be spec'd before it closes and who or what verifies it.

| Date         | Milestone / deliverable                                                                 | Blocking sub-rows                                                               | Verified by                                       |
| ------------ | --------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------- |
| Tue 7/14     | **GDD first draft** (Assignment #1)                                                     | Concept + pillars locked                                                        | Submitted                                         |
| Thu 7/16     | **Final GDD draft** (Assignment #2)                                                     | Hole-filling substantially closed                                               | Phase-3 decisions                                 |
| **Tue 7/21** | **Agent crew** (Assignment #3: 3+ agents, shared output, dev artifact)                  | Dev-crew roster + JSON I/O (§13); session-state bus field schema                | This GDD, then the review panel                   |
| Thu 7/23     | **Dynamic content pipeline** (Assignment #4: RAG, 3+ content types, consistency checks) | Content Agent + Consistency Verifier contracts (§13); voice register + tone enum | QA / Consistency agents + review of sample output |
| Tue 8/4      | **GER pipeline** (Assignment #6)                                                        | Level layout → gate/verb table; content-budget inputs                           | QA Agent traversal pass on the generated layout   |
| Thu 8/6      | **Style-guide agent** (Assignment #7) → **Agent 6 (Style / Art-Direction)**             | Color grammar + silhouette vocabulary as machine-checkable rules                | Style agent (6) + single review eye               |
| Tue 8/18     | **Complete AI dev pipeline** (Assignment #10)                                           | Token budget calibrated (§16); end-to-end prompt-to-engine documented           | Cost analysis against real generation             |
| **Tue 8/25** | **Capstone: final playable game**                                                       | Slice contract (§17) + Definition of Done (§22.1) met; 1 ending shipped          | Human playtest (primary) + QA Agent pre-ship pass |

The **Production / PM Agent (Agent 7, §13)** owns the schedule across these dates and explicitly schedules the **human-review week** that was previously unplaced — the back-loaded review is the top delivery risk (§21).

---

## 21. Scope & Risks

### 21.1 MUST / SHOULD / STRETCH

The floor stated directly (not inferred from a cut-list). MUST is the true MVP — it is exactly the Definition of Done (§22.1). SHOULD is the intended slice. STRETCH is reach.

| Tier        | Narrative                                                                                      | World / Levels                                                                                          | AI-Pipeline                                                                                       |
| ----------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| **MUST**    | 1 deep soul's arc complete end-to-end (§12); one seed→payoff echo lands                        | Forest (1 screen + 2 unlocks) + Town (Square + 1 scene) + Festival; one week playable to festival night | Persistence save + reshuffle works; Content + Consistency agents produce & check one soul's lines |
| **SHOULD**  | 3 deep souls' key lines authored & distinct side-by-side; oblique reciprocity (dialogue warms) | 3 festival tiers rendered; bond-driven dialogue change on a repeat arrangement                          | Full crew (0–5) runs; 2 hand-authored arrangements demonstrated on camera                         |
| **STRETCH** | 4 texture souls fully written; the souls-of-the-world display top tier                         | 2nd arrangement fully distinct content; extra forest screens; richer effects                            | Agent 6 style-guide automated; Agent 7 PM live; ink→UE integration spike                          |

### 21.2 Sequencing gates (do-not-until rules)

- **Don't author the 2nd arrangement until one plays end-to-end.**
- **Don't build texture souls until the 3 deep souls read as distinct** side by side.
- **Don't gate Track B (visual build) on content** — keep Tracks A/B parallel so review never blocks assets (§17).
- **Don't wire the leitmotif to any counter** — it triggers on a noticed-and-matched detail (guards the §10/§19 recognition fix).
- **Week-1: prove save/load carries state across a reshuffle** before content depends on it.

### 21.3 Top risks (with fallback)

- **NPC perceptual distinctness (the differentiator's soft spot).** Whether the essence-signature card pipeline yields perceptibly distinct neighbors needs real writing samples against the voice guide. Because each soul is now **derived from a different primal** (§11/§13), the distinctness is generated and **checkable on paper**, not merely asserted. *Validate:* generate the 3 deep souls' key lines and read them side by side (§22.2). *Fallback:* hand-author the 3 deep souls; agents handle texture NPCs only.
- **The reshuffle / persistence engine coherence.** The on-camera role-swap must read as the same soul in a new role. *Validate:* the ink prototype demonstrates one reshuffle end to end. *Fallback:* hand-script the single on-camera swap for the slice; generalize later.
- **Ink-to-Unreal integration.** The narrative engine must carry from ink into UE. *Validate:* an early integration spike. *Fallback:* ship the slice as the ink/html build if UE integration slips.
- **Human-review bottleneck (about half a week of review time).** *Fallback:* cut to the MUST column only — 1 soul, 1 arrangement, 1 ending.

### 21.4 Planned scoping cuts

Ordered by what goes first if time runs short; the top of the list is cut before the bottom.

1. **The second arrangement.** Ship one on-camera reshuffle hand-scripted; the 2nd hand-authored arrangement is the first cut.
2. **The Farm (third location).** Already cut from the slice; a reserved slot that adds without reworking Town or Forest.
3. **The texture souls beyond what the deep arcs need.** Trim the 4 texture souls toward the minimum that populates a run.
4. **The upper festival tiers.** Ship the quiet/warm read; grand + the souls-of-the-world display are the last polish.

---

## 22. Acceptance Criteria

*(The finish-line test: how we know the slice is done and working. Distinct from §21, which is what we build and what might make us build less.)*

### 22.1 Definition of Done

The slice is **done** when all four hold in a packaged build, without developer intervention:

1. **You can play one week through to the festival** — the full core loop, start to festival night.
2. **The game reshuffles** — a new run re-deals the souls into one of the 2 arrangements.
3. **The game saves and restores state** — bond levels and collection persist across the reshuffle.
4. **One soul's storyline is complete** — the single deep-soul arc (§12) plays end-to-end, seed to payoff.

### 22.2 Minimum / Target acceptance

Each risky feature gets a floor bar and a reach bar (the §21.3 Validate/Fallback pairs, made checkable):

| Area              | Minimum acceptance                                             | Target acceptance                                                 |
| ----------------- | -------------------------------------------------------------- | ----------------------------------------------------------------- |
| **Core loop**     | One week loads and reaches festival night.                     | Plus the year-jump + a decision-based ending vignette.            |
| **Reshuffle**     | One hand-scripted role-swap plays on camera.                   | The engine re-deals into the 2 arrangements automatically.        |
| **Save-state**    | Bond + collection persist across one reshuffle.                | 3 save slots; meta-hub shared; in-game home resets empty.         |
| **Deep-soul arc** | 1 soul's arc hand-authored, reads distinct, seed→payoff lands. | Agent-generated lines pass the side-by-side distinctness read.    |
| **Festival**      | One festival scene renders at day's-end.                       | 3 tiers (quiet/warm/grand) + the rare souls-of-the-world display. |
| **Recognition**   | The leitmotif fires on a noticed-and-matched detail.           | The audible essence-signature is recognizable before naming.      |
| **Reciprocity**   | Bond persists across lives.                                    | Dialogue visibly warms on a repeat arrangement.                   |

A feature is **accepted** when it works reliably in a packaged Windows build without developer intervention, and the build remains stable across a full run plus one reshuffle.
