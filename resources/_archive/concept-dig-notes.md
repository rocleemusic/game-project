# Concept Dig Notes

Running log of concept-digging sessions to find the game concept before class 02 (Tue 7/14). Session 1 (2026-07-10) below; later sessions appended at the end.

## Constraint set (gathered so far)

- Roguelike + cozy; core mechanic is non-violent
- Strategy over dexterity (FFT) — turn-based / low-reflex
- Discovery as the reward (Outer Wilds)
- Sound-design pipeline showcase: event tags/hooks for auto sound hookup; mirrored directory trees (`Game/Animation/<Entity>/…` ↔ `Game/Audio/<Entity>/…`) *[superseded 2026-07-19 → Unreal GameplayTags + a tag→asset library; see H15]*
- Class: agentic AI showcase ("one agent, one wow"); playable capstone due 8/25 (~6 weeks)

## Candidates on the table

- Album/music expedition roguelike (collect instruments/melodies → compose album)
- Meal-planning game (structurally parallel: ingredients → meals)
- Agentic world-morph — world reshapes given params; explore, discover story, solve a mystery or snapshot the world
- Story iteration tool — reframed as the *dev crew*, not the game; composes with any concept (class Assignments #3/#8)

## Findings from the dig

1. **Diagnosis:** none of the candidates grabbed because all three are systems/themes with no fantasy or moment attached. The games Roc loves started from a feeling; the system came after.
2. **Spine:** in every touchstone (Outer Wilds, FFT, Slay the Spire) the player gets **smarter, not stronger** — understanding is the reward, never reflexes.
3. **Moment test answer → new inspirations:** Frieren: Beyond Journey's End and A Storied Life: Tabitha. Both deliver the same emotion: **significance that arrives after the moment is gone** (Frieren understands Himmel fifty years too late; Tabitha's objects are mundane until the memoir teaches what they witnessed; Nomai ruins are just text until the last fragment recontextualizes everything).
4. **Sharpened spine:** the player gets smarter **about what mattered** — retrospective significance is the emotional core.
5. **Impermanence makes roguelike thematically necessary** — first finding that makes the genre a *point* rather than a convenience. Runs end, days end, parties disband, worlds morph; the reset creates the conditions for retrospective meaning.
6. **Snapshot verb fits:** capture ordinary moments *without knowing which will matter*; significance emerges later.
7. **Sound is the strongest retrospective trigger humans have** — re-hearing a melody does the Frieren thing involuntarily. A sound-memory mechanic is Roc's unfair advantage.

## Tabitha mechanics (reference)

Cozy narrative puzzler (Lab42/Secret Mode, Unity). Explore a deceased loved one's home; every object carries a story fragment; choose what to keep via a box-packing puzzle; words tied to kept objects complete her damaged memoir. Choices about what to preserve literally write the story that remains. Branching, replayable, varies per playthrough.

## Open questions — sleeping on these

**Q1 (the live fork): Whose past carries the emotion — yours or someone else's?**

- **The Rememberer (Frieren-mode):** player *lives* the moments in early runs, and later runs bring them back — a place revisited, a melody re-heard, significance lands first-person. Harder to engineer (game must make you care before it can make you grieve); biggest payoff.
- **The Discoverer (Tabitha/Outer Wilds-mode):** the moments happened to *someone else*; player is an archivist/field-recordist piecing together lives from traces. Pairs directly with the agentic world-morph idea — agents actually lived in the world (goals, relationships, memory decay = class week 07) and you find what they left. Empathetic emotion; far more tractable in six weeks.
- Or both — runs let the player accumulate their own memories *while* uncovering the world's.

**Q2: pitch-card comparison** (after the spark is found, not before): three lines per candidate, in chat — *fantasy* (who the player gets to be) / *core verb* (done 500 times) / *the wow* (moment worth telling a friend). If a candidate can't fill three lines, that's the finding.

**Q3+:** standing design questions tracked in [GDD-template-draft.md](GDD-template-draft.md) — run-end pressure, tactical-encounter verb set, persistence spectrum, engine choice.

## Deadline

Concept decision needed by class 02 (Tue 7/14) — class GDD template arrives that session; Assignment #1 (GDD first draft) due ~7/16.

---

# Session 2 — 2026-07-11

The fork dissolved: the ICM loop makes the game itself the Rememberer (player history re-ingested, returned with significance) while the world stays Discoverer-mode (post-BBEG traces). Concept is near-lock; one open item below.

## Decisions locked

- **Interaction model:** Myst-like scene-based point-and-click — mouse-first, stationary "living diorama" scenes, no time boxing, easy stop/start (20–60 min sessions). Lineage: escape rooms, Myst, Secret Island of Dr. Quandary, Ren'Py hotspot models.
- **Engine: Unreal.** Static 3D scenes with periodic animation/interaction; MetaSounds *[→ Wwise, 2026-07-19]* supports the audio-first pipeline natively; 2D and 3D art pipelines both testable (per-Age art styles possible). Pipelines to build: narration, quests, art (2D+3D), audio tagging/auto-hookup, the ICM.
- **World structure:** cozy hub + discrete Ages via linking books (Myst); Absolum's start-anywhere preserved; Myst's remake puzzle-randomization = precedent for roguelike-ified Myst.
- **Multiple endings via curation:** what the player preserves writes the world's official memory of the conflict (Myst's brothers-judgment + Tabitha's memoir, scaled to a world). The biggest choice is values-based with no correct answer (SDT autonomy).
- **Save-scumming honored as diegetic:** reload/branch-peeking feeds the world's response (NPC déjà vu, dreams of abandoned branches); wipes remembered nostalgically; guardrail accepted — **texture, never gotcha**. Same policy for system-clock changes (time-scumming). Precedents: Undertale (inverts its judging tone), OneShot, NieR save-deletion.
- **Real-clock time:** optional Animal Crossing-style seasonal/diegetic drift — rewarded, never required.
- **The log as central artifact** (see ideas file): diegetic save file, deduction workspace, curation interface, ICM's visible face; inventory + item memory-replay + rumor-map graph (people ↔ places ↔ items ↔ moments). "Relationship between people and places" gets its UI here.
- **SDT wiring** (from Roc's SDT reference): autonomy = real route choices, diegetic rationales for constraints, no timers ("two genuine choices beat twenty illusory ones" — small scene count is theory-correct); competence = informational-feedback law (a wrong guess always teaches something) + traceability; relatedness = ICM/NPCs who remember and reciprocate. Design warning: ICM callbacks must be legible/traceable to the player's actual past actions or they read as noise — callback legibility is pillar-grade.
- **Player decision taxonomy:** route / search / deduction / curation / social / pacing.
- **FFT-style tactics: parked** (logged in ideas) — strategy lives in route, deduction, and curation-under-consequence; may return once the moment-verb set matures.
- **What changes between visits (layer mix):** nature/atmosphere + time-of-day DRIFT · NPCs/story-surface REACT (ICM) · geography FIXED, though architecture may visually change over time (healing world) · re-rolls live on the carry-one surface only. Law: **re-roll texture, never truth** (evidence-bearing content is sacred).
- **What pulls you back (run pulls):** cross-Age knowledge/item dependencies (Obra Dinn-style synthesis — late deductions deliberately span Ages), log gaps, new tools, invitations (Roc's favorite), optional real-clock events.
- **Run boundary:** session-shaped (20–60 min) with clear stopping points; "expedition + homecoming ritual + recorder capacity" proposed but held pending the moment-loop answer.

## The keystone mechanic (Roc's): carry one

Each room ends with choosing ONE thing to take onward; it shapes how the next room reacts. Chains rooms causally (a run becomes a sentence the player writes), doubles as the diegetic roguelite bonus, and is the re-roll surface.

## LIVE PROPOSAL — six-beat room grammar (awaiting Roc's reaction — the open item)

**listen** (audio-first arrival, Obra Dinn-style: sound before visuals) → **search** (hotspots; some revealed by sound/time-of-day) → **read** (micro-deduction: *what happened here?* — 2–4 evidence pieces, one drag to the log graph, wrong interpretations revisable) → **converse** (sometimes — social problem colored by what you carry/recorded) → **capture** (limited recorder; evidence and pure wonder both) → **choose one** (carry-forward).
Room = 5–8 minutes. This is the answer-in-progress to "what does the player do at each moment" — the blocker for finalizing run shape and re-roll policy.

## Vertical slice math

Run = 3 rooms + hub homecoming ≈ 25–40 min (fits Roc's session length). Slice = 4 Unreal dioramas (hub + 3), one Age, one demonstrable ICM callback on a revisit (the wow, on camera). Capstone ≈ 5–6 rooms.

## Composite pitch card (current)

> **Fantasy:** you're the one who comes after — walking a healing world after the great conflict ended, piecing together what happened and what it meant.
> **Core verb:** read a scene — search it, hear it, deduce it, then choose what to preserve.
> **The wow:** the world remembers you back — something you recorded runs ago returns, re-contextualized.

## Next steps

1. Roc reacts to the six-beat room grammar (the blocker)
2. Grammar lock → concept lock → final pitch-card check
3. Class 02 (Tue 7/14): receive class template; merge with [GDD-template-draft.md](GDD-template-draft.md); Assignment #1 GDD draft due ~7/16

---

# Session 3 — 2026-07-11/12: The Story

The concept that grabbed. Near-lock pending Roc's final confirmation.

## The story — cosmic hide-and-seek (Roc's)

- You are searching for your partner across reincarnations. You never know who they'll reincarnate as — you must figure it out each cycle, gaining more information each run.
- The game "ends" when you finally break the cycle of reincarnation. Clear ending, endless permutation between beginning and end — motivation to replay AND motivation to wipe a save on disk.
- Philosophy backend: Daoism, reincarnation, past lives, breaking the cycle into enlightenment — **never surfaced to the player**.
- Difficulty: after each successful run, the number of NPCs to choose from increases. Random item/room generation makes identification easier or harder — but **you always leave with something**: more information or a new memory.
- **Symmetric amnesia:** the player character doesn't know their own past lives either — interactions gradually awaken them. NPCs don't know their past lives but may hint at them as familiarity grows or when given specific items.
- **Stated goal vs. underlying goal:** the surface quest covers the true one. The underlying end = identifying your partner → triggers a clean wipe → an experienced player starts over with a new goal, because the one save file that survives enlightenment is the player's own head.
- **Multiple past-life stories:** you also discover past connections to other NPCs — every NPC is a potential story, no trail wasted; this fills the rumor graph.
- **Setting:** Studio Ghibli-inspired fantasy magical world; player actions flavored accordingly.
- **Creation:** hub room you rearrange with mementos between runs.
- **Notebook:** carried everywhere — game-curated log plus free-text typed notes page (player's own words can feed the ICM). Small bag holds 1–2 items, grows to a larger pack.
- **Folk spells (from Frieren):** collectible everyday magic.
- **Declaration = gift:** the unlock moment is a puzzle/quest resolving in giving them a specific note or artifact.
- **Reunion beat:** an UP-first-ten-minutes-style cutscene — out of scope for the vertical slice.

## Why it locks (analysis, accepted in discussion)

- The story retro-explains every mechanic built so far: reincarnation = runs; save wipe = the enlightenment ending (NieR lineage, Daoist spine); identity deduction = the Love form as core mechanic ("which of you is *you*?"); rooms = portraits of people (Tabitha's mechanic as evidence layer); ICM = persona generation with a persistent essence-signature across incarnations (= class persona-consistency week); difficulty curve without combat.
- Gift-declaration beats Obra Dinn's anti-brute-force: the key is *made of deduction* — you can't guess-spam because the declaration artifact must be earned. A wrong gift is a gentle social beat that still teaches.
- Folk spells hold four jobs: tool-progression run-pull, collectible layer, verb-set expansion beyond point-click, RAG content type for class.
- Symmetric amnesia = Outer Wilds structure (stated goal as alibi; the game reveals what it really is through play).
- Proposal on the table: the partner's essence is partly **audible** — a leitmotif or sonic habit that survives reincarnation; the deepest clue is something you hear (sound-designer signature mechanic).

## Slice directive (Roc) + the vignette proposal

- Keep the full game-completion cycle documented, but drill down on the core game: **fun and emotional impact within one play session.**
- Proposal: the **memory vignette** — a 15-second audio-led awakened past-life fragment triggered by an object or sound — is the reunion's fractal unit: same pipeline (short cinematic tooling, ICM callback, audio trigger), same emotion, deliverable in-slice. Slice loop: hub → one place (3 rooms) → 2–3 NPCs → one vignette → one folk spell → carry one → homecoming. If the 15-second fragment moves a playtester in session one, the 10-minute ending will work.

## Fourteen Forms of Fun audit (Garneau — see resources row)

- **Core stack:** Discovery · Intellectual Problem Solving (multi-solution, "find your own way") · Beauty (article's exemplar is literally Myst; audio included in the form) · Immersion.
- **Differentiators:** **Love + Creation** — the two forms Garneau names as most underused industry-wide; this game has both natively (remembrance-as-gameplay; curation/mementos/archive as made things). USP language for the GDD.
- Validations: "short but highly replayable games are fun — yet relatively rare" = session-shaped runs; voluntary stakes beat forced stakes (Diablo II hardcore) = opt-in wipe.
- Non-goals with citations: Competition, Thrill of Danger (beyond opt-in wipe), Physical Activity, Application of Skill.

## Pitch card v2 (current)

> **Fantasy:** a cosmic hide-and-seek — you're a soul searching for your partner across reincarnations, in a Ghibli-warm magical world.
> **Core verb:** read lives — explore rooms, listen, converse, deduce who they've become this time.
> **The wow:** the game remembers every life you've lived — and the true ending asks whether you can let all of it go.

## Open questions

1. **The stated goal / cover occupation** (sharpest): what job licenses the verb set — entering homes, asking personal questions, examining belongings, recording? (Letter-carrier of unsent mail? Spell-collector? Census-taker for a vanished kingdom?) Sets tone; Roc sleeping on it.
2. Reunion vignette specifics — in-slice sibling designed; full cutscene deferred.
3. Does the found partner awaken/remember? (NPCs hint when familiar — but what does being found do to them?)
4. Six-beat room grammar — still awaiting formal reaction, now aimed at reading people.
5. Mix of authored past-life stories vs. generated personas ("re-roll texture, never truth" governs).

## Status

Concept: **near-lock** — pending Roc's confirmation on re-read. Then: pitch-card final check, class 02 template merge (Tue 7/14), Assignment #1 GDD draft (~7/16).

---

# Session 4 — 2026-07-12: Personas, Arrival, and the Remembered Signal

## Personas are lives, not occupations

- Roc: cover occupation felt limiting; open the frame to a Ghibli world. Resolution: the persona is **the life you were born into this time** — witch's apprentice, child who sees spirits, elder, shopkeeper's niece. You reincarnate too; archetypes are diegetic.
- Lenses are **doors, never multipliers** — different lives change what you can access and perceive (a child is told different secrets than an elder), never how fast you win.
- **Dealt → chosen:** early cycles the wheel assigns your rebirth; as you awaken you gain increasing say over who you return as; the final unlock is choosing not to return at all. The meta-progression is the enlightenment arc made mechanical; never surfaced in philosophical terms.
- Vertical slice ships **one persona, fixed**; archetype system documented as roadmap.

## Arrival as license; the world as quest-giver

- Ghibli protagonists are newcomers, not professionals — **arrival licenses the verbs.** Every cycle you've just arrived in a new life; "settling in" is the universal cover story, dealt fresh each run.
- **The world is the quest-giver** (pillar language): pull, not push. Errands — small community favors — are the Ghibli quest structure, chain you through homes and lives, and are ICM-generatable from world state.
- **Genre alibi:** the surface experience is a cozy life-sim in a magical town; the reincarnation mystery is what it slowly reveals itself to be. The stated goal goes all the way down to genre.

## Design principle (Roc's correction, recorded)

**Trust the player.** Don't engineer forced mystery-anomaly stacks or force an answer to "why would the player explore" — the world's interest emerges from its liveliness and the player's own curiosity. (Claude's A–E world-mystery decomposition was over-design; rejected.)

## The remembered signal

- Pentiment's "this will be remembered"-style acknowledgment, refit to tone: **the notebook writes itself** — quill-scratch for minor moments, a brief memory-motif for significant ones, full vignette for past-life awakenings. Serves the pillar-grade callback-legibility requirement (SDT competence/traceability).
- Inversion: the ICM occasionally acknowledges the player's own typed notes — *you* will be remembered.

## Research adds

Pentiment and Chronoquartz → `mechanics-research`; Animal Crossing and Stardew Valley → `cozy-research` (see ideas file for hooks). Chronoquartz's 10-turn loop budget flagged as a candidate run-boundary model.

## Open item — "what the player does," new angle

Room-grammar beats didn't land as the frame. Next angle: the cozy life-verb hypothesis suggested by the AC/Stardew adds — moment-to-moment play may be **daily-life rituals** (tend, cook, deliver, garden, gift) with deduction riding on top, rather than investigation verbs. Chronoquartz suggests a turn-budget alternative for decision weight. To dig from Roc's lead: what each research game was added to steal.

---

# Session 5 — 2026-07-12: Time Architecture

## The nested clocks (Roc's)

- **Day** — soft limits on how much you can do, implicit not explicit (Stardew steal, de-metered): the *world* is the limiter — shops close, light fades, people sleep, welcomes expire. No energy bar.
- **Week = the run** — time progresses toward a **deadline that is a recurring yearly event** (the festival). The run ends at the event: a diegetic, festive stopping point, and likely the **declaration window** — the night the gift can be given. Precedent: Majora's Mask (three-day loop → Carnival of Time; urgency + melancholy, no fail state).
- **Cycle = the incarnation** — the reincarnation layer.
- **Timelines = save slots** — each slot is a parallel universe with its own character type (personas housed at the save layer). Actions in one timeline affect another. **The hub is shared across all timelines** — the waystation outside the cycle; findings pool there (the shared notebook is the cheap part; cross-timeline effects are the ICM-heavy part, and callback-legibility applies double).
- **Timeline cap:** max 3 timelines even in the final game. Completing a game cycle frees a slot; the player can also choose to delete one.
- Slice scope: one timeline; hub architected for N.

## The steals (Roc's answers)

- **Animal Crossing → social interactions** — the moment-to-moment is talking, gifting, being neighborly; social-forward life-sim confirmed.
- **Stardew Valley → interaction density + the soft daily limiter** (as an idea, never explicit).
- **Chronoquartz → puzzle inspiration** — distilled as **knowledge-key puzzles**: locks whose key is information from a previous loop or another timeline, not an item. Puzzles made of remembering.

## Open question (paused on — first move at resume)

**What is the relationship between the week, the year, and the cycle?** Smallest form: *what happens at the festival when you're wrong — or not ready — and what does the walk home after look like?* (Is each run the same festival week of successive years within one lifetime, time experienced in jumps? When exactly does reincarnation trigger?) This answer defines the emotional shape of every session.

---

# Session 6 — 2026-07-12: The Systems Session

## Memory-based magic (Roc's)

Components (berries, rocks, world items) + the magic word = cast. Recipes are learned through interactions in the world **or discovered accidentally**. Implications accepted in discussion: the recipe is *knowledge* — unloseable, carried in the player's head, wipe-surviving — so **magic is the metroidbrainia system**; spells are the knowledge-keys already designed for puzzles. Components are gatherable (foraging = the Stardew life-verb hands). Accidental discovery = trust-the-player as mechanic.

## Collections and persona gradients (Roc's)

- Collect magic, artifacts, mementos (hub decoration feeds from this).
- **Start persona: the mage** — stated goal "collect all magic": self-directed, no quest-giver, aims the player at the magic/knowledge engine. **This answers the open slice-persona question.**
- Later persona: **the artist** — makes art to give people (the gift/declaration system through a different medium).
- Personas carry **skill gradients**: mage casts well but draws poorly; artist draws well but has low mana. Tension with "doors, never multipliers" resolved by the **gradient rule**: doing a thing poorly produces *different-but-delightful* outcomes, never failure.

## The inverted map = the calendar (Roc's)

No branching node-map. Each day you choose **one location** (city / forest / farm); you operate there for the day; locations deepen into multiple areas as you engage; after a set number of weeks comes the major event. **Route choice becomes attention allocation** — you cannot be everywhere before the festival, so where you spend days is the strategy AND the emotional thesis (what you spend time on is who you love) unified. Precedents: Persona's calendar, Majora's schedules. Parallel timelines gain meaning: another timeline = another way to spend the same days.

## Self-directed quests (Roc's)

A pure collector/decorator playthrough — never talking to people — is fully valid. The story lives in people and surfaces only through engagement. The genre alibi with teeth: the cozy collector game is complete; the mystery is the reward for relating.

## Pack-triage run ending (Roc's)

End a run early to bank a full pack, or continue with only what fits; knowledge always travels free. Cozy extraction-decision: the end-of-run question isn't "did I survive" but **"what's worth carrying"** — the game's whole theme in miniature.

## Status after Session 6

Answered: slice persona (mage), stated goal (collect all magic), map structure (calendar), moment-to-moment direction (life-verbs: forage, gather, gift, talk; magic as the skill expression). Still open, unchanged first move: **the festival question** — what happens when you're wrong or not ready, and the walk home.

---

# Session 7 — 2026-07-12: Festival Night & the Emergent Partner

The festival question — the pause point — answered end to end.

## The year-loop (VS time shape) (Roc's)

- Run = the **same festival week of successive years within one lifetime** — time experienced in jumps; backstory fills in between years; NPCs remember prior years' activities. (Inverts the Majora precedent: urgency + *everybody remembers*.)
- **VS cap: ~3 years triggers an ending.** After the ending: sandbox mode to collection-complete, then prompt — new save / clear the save / new persona.
- Scale dial: more years per life, mid-year festivals/events for variety (future), full reincarnation cycles later. The year-loop is a fractal of the incarnation loop — same shape, smaller stakes.

## The emergent partner (Roc's)

- The past-life partner is **not pre-authored — it's gradually determined by who the player chooses to be with most.** Tracked per NPC: runs and cycles played, helps, festival-ending choices. Solidifying a partner takes a certain number of replays.
- Conceit held: **there was a partner in the past life — real but indeterminate** until play collapses it. Fail-forward: while undetermined, "not this life" just means not enough lived-with yet.
- "What you spend time on is who you love" — promoted from the calendar's strategic thesis to the metaphysics of the game. The player believes they're deducing; they're constituting. Never surfaced.

## The ending vignette (Roc's)

Triggered at festival's end regardless of outcome — "you always leave with something," made ritual. A combination of:

- **People you helped** → revealed as echoes of things you once did for your partner in a past life.
- **Places you saw, activities you did** → shared past-life moments.
- **Guaranteed: a vision of the festival against the night** — different versions depending on your choices.
- **The silhouette:** the vignette centers an empty silhouette that gradually fills in across plays — *essence* features (face, mannerisms) fill as data accumulates; **the job outfit is a red herring** when data is thin. The player over-reads the costume; the mistake teaches essence-vs-role and costs nothing — informational-feedback law by construction.
- Audio sibling (accepted): the partner's **leitmotif surfaces from the festival mix** the same way — early visions carry ambience only; the motif emerges as data accumulates. The Session 3 audible-essence proposal lands here.

## Role shuffle (Roc's)

- NPCs are **recognizable but in different roles** between plays (chef in one, blacksmith in another) — the randomization surface, replacing Session 3's random items/rooms.
- **Boundary law: roles are fixed within a life; a new life re-deals them.** "Per save or per persona" unify — rebirth (new persona) and parallel timeline (new save) are both "different life." Within a life, roles are truth and sacred; the re-roll surface opens only at life boundaries.
- VS: starting a new persona after the 3-festival arc brings **the first rebirth into the slice as a doorway** — the reshuffle ("she was the chef; now she's the blacksmith, and she half-remembers you") is a candidate on-camera wow.

## Festival night mechanic (Roc's)

- The attention mechanic compressed: **limited time at the festival; at the end, choose who to be with — someone, a group, or alone.**
- **The choice is free; the gift deepens it.** The gift is an amplifier, never a gate — heavier solidification weight plus a richer vision version (Claude's read, accepted). Gating the choice on a key would contradict indeterminacy: a free choice *is* the data. A wrong gift stays a gentle social beat.

## Rule amendments (pending formal write-up)

1. **Evidence-sacred → superposition rule:** before solidification there is no fact, only leanings; once collapsed, a fact is permanent and sacred. (Past-life echoes coalesce retroactively around invested NPCs.)
2. **Pitch-card verb check:** "deduce who they've become" is becoming **recognize** — recognizing essence across role-shuffles is the actual skill. Check at final pitch-card pass.
3. **Gift-declaration restated:** license → amplifier (see festival night mechanic).

## Open questions

1. **Slice endpoint:** end at the rebirth prompt, or one scene into life #2 so the reshuffle is demonstrated rather than promised? (~1 scene of extra cost; candidate strongest closing shot.)
2. Does the chosen partner awaken — what does being found do to them?
3. Authored past-life stories vs. generated personas — the mix (superposition rule now governs alongside "re-roll texture, never truth").
4. Six-beat room grammar — retire or re-aim under the life-verbs direction?

## Roadmap / deferred

- **Alone-path** vignette variants (non-attachment as its own quiet path?) — the festival-ending tracker already records it; slot-in later. VS: one version or no variation.
- Mid-year festivals/events — interim deadlines for the calendar's attention allocation.
- Group endings.

## Status after Session 7

Festival question closed: year-loop shape, emergent partner, silhouette vignette, role-shuffle boundary law, free choice + gift-as-amplifier. Next: class 02 template merge (Tue 7/14), Assignment #1 GDD draft (~7/16); open queue above.

---

# Session 8 — 2026-07-12: The Interaction Set

The moment-to-moment verb set consolidated into canonical families; the deduction game gets its social UI.

## The four action families (Roc's)

- **Collect** — all collectibles: items, components, audio, spells/recipes, mementos. Listen dissolves into Collect — listening is collecting, applied to sound.
- **Make** — the recipe pattern generalized: spells, dishes, art all share one structure (components + learned knowledge = output). Where persona gradients live — doing it outside your gradient produces different-but-delightful, never failure.
- **Show/Ask** — the non-committal probe: present an item, sound, or topic to an NPC and read the reaction. Distinct from gift, which transfers and carries declaration weight.
- **Use** — apply any held thing (spell or item) to a target: cast mend on a fence, key on a door, feed a chicken. Spells aren't special-cased — they're usable things you happen to have made.

Social verbs (talk · help · gift · end-festival-with), memory verbs (notebook, log), and pacing verbs (day-location choice, pack-triage) stay their own layers.

## Receiver determines the outcome (Roc's — pillar-grade implementation rule)

- **Strategy pattern:** the target of a directed interaction holds the response logic — the action never encodes its outcome. The same spell lands differently on a chicken, a door, a neighbor.
- Scoring boundary solved the same way: using items/spells on a person **can** score — the receiver decides whether it reads as social attention (healing a sick neighbor scores; showing off sparks is the neighbor's call).
- Composes with the gradient rule: maker-side quality × receiver-side disposition = outcome.
- This is the multi-agent showcase at the interaction level — every NPC an agent owning its own responses (class-relevant), and receiver reactions double as descriptor evidence for personality cards.

## Audio as objects (Roc's)

- Sounds are collectibles **without a physical equivalent**: no pack space, travel free like knowledge — the bridge category between items and knowledge.
- **Deliberately recorded, never auto-saved** — the original snapshot bet preserved: capture without knowing which sounds will matter. The notebook's writes-itself behavior stays text-side.
- Live as log entries; play on click/view. Scope stays contained — no recorder tool, no capacity meter.
- Inherit the object verbs: **show-able** (play a sound *to* an NPC — the leitmotif probe made physical), **gift-able** (a recorded melody as the declaration gift — the sound-designer's love letter), candidate spell component.

## Personality cards (Roc's — the Obra Dinn steal)

- Choosing descriptors fills out per-NPC personality cards; first impressions are revisable — gruff at first, later revealed a softie without good tact. Wrong descriptors teach (informational-feedback law with a UI).
- Descriptors are **essence-level**, so cards persist across the role shuffle and across lives: **the cross-life recognition tool** — next life, the blacksmith starts matching the card you filled out for the chef. "Recognize" made mechanical (this answers the pitch-card verb check).
- A true deduction target that doesn't fight the superposition rule: NPC essence is fact; only partner identity is emergent.
- Home: the notebook — descriptor chips on the rumor graph.

## Social layer (Roc's)

- **Social interactions feed the solidification score** — and social-only scoring is quietly load-bearing: a pure collector playthrough never accidentally solidifies a partner. The mystery only exists through relating — the genre alibi enforced by the scoring rule itself.
- **Interactions as rewards:** new interactions unlock during the day from items or past interactions — the social knowledge-key ("this conversation became possible because of what you did this morning"). Gives the day clock a positive face alongside the soft limiter; clean ICM surface.

## Creatures (Roc's)

- Filler **"active props"** (chickens, cats): world liveliness and Use/spell targets, no essence, explicitly cuttable. The partner-as-creature door is closed (roadmap-at-best).

## Status after Session 8

Action set canonical: **Collect · Make · Show/Ask · Use**, governed by receiver-determined outcomes. Deduction found its UI (personality cards); audio unified as free-traveling, deliberately-recorded objects. **The six-beat room grammar is retired** (Roc, closing Session 7 open Q4) — superseded by the four families + social layer; its survivors already migrated (audio-first arrival → art/audio direction · recorder → deliberate audio capture · choose-one → pack-triage). Remaining queue: slice endpoint · partner awakening · authored-vs-generated mix. Next: class 02 template merge (Tue 7/14), Assignment #1 GDD draft (~7/16).

---

# Session 9 — 2026-07-13: The Promise, the Two Modes & the Slice Contract

The last three live design questions close, plus the phase-change ruling. Concept is GDD-ready.

## The true ending — the kept promise (Roc's)

- When the past-life vignette is solid (partner solidified), it finally plays to its end — and its last beat is the reason for the whole search: the partner asks **"Promise you'll find me in the next life."** The player remembers the promise at the moment they've fulfilled it — retrospective significance at maximum, landing on the game's own progress mechanic (the silhouette completes → the sentence completes).
- Then a series of dialog options with the awakened partner: they're happy the player kept their promise, and ask to be together to the end of this life *and the next*. → **The true ending.**
- After credits: the player may **continue** — or the game **tells them how to delete the save file** for a true wipe. The game never breaks the cycle for you; the true ending *renews* it. Enlightenment is a player act outside the game, by hand. (NieR lineage, gentler — permission instead of sacrifice; "the only save that survives is the player's head," Session 3, now literal.) **The end is just the beginning of the next.**

## Phase-change ruling (Roc's)

- **Once a true partner emerges, it is fixed until the save is wiped.** The game phase-changes: **constitution** (superposition — attention collapses the partner) → **recognition** (the same soul, new life, new role, every cycle after).
- "Cosmic hide-and-seek" becomes literal in the endgame — the title names the post-solidification game.
- The superposition rule completes its arc: no fact before solidification · collapse is permanent per save · **the wipe returns the world to superposition** — letting go releases the bond back into possibility.

## Two modes — ICM-optional architecture (Roc's)

- **Canned mode:** at least one fully pre-generated path, a few total — playable with no agent connected. Deterministic, QA-able, shippable to anyone.
- **Live mode:** connect an ICM → a unique experience every time.
- Canned paths are built by the **same pipeline** — dev-crew agents batch-generate, Roc curates. The agentic showcase exists at two layers (runtime agents optional, pipeline agents always), mapping directly onto the GDD §5 in-game/dev-crew split.

## Content-budget levers (canned paths)

- **Emergence is the multiplier:** any NPC can solidify, so a full path needs partner-grade content (echo strands, promise-vignette variants) per viable candidate. Levers:
  1. **Cap the viable candidate pool** per canned path (e.g., 3 fully provisioned; others social-only).
  2. **Count units from the data model:** NPCs × years × day-slots × interactions-per-slot, plus echo strands × candidates, plus descriptor-reaction lines.
  3. **Templates with essence slot-fill** vs. fully authored lines for the long tail.
- The GDD's writing rule wants real numbers — this becomes a named table at the template merge.

## The slice contract (Roc's) — polish the run, prove the loop

Fun lives in the run; everything beyond it is demonstration, not polish.

1. **One run is fun** (up to the festival) — the quality bar; the polish budget lives here (Session 3's directive unchanged).
2. **The full cycle loop is playable end to end** — 3 festivals → an ending → sandbox → new persona.
3. **The story pipeline holds for a few runs** — year-over-year NPC memory, backstory fill between years, echo accumulation across festivals.
4. **NPCs have different-role content** — the reshuffle is demonstrable, not promised (absorbs the slice-endpoint question; the on-camera "she was the chef" moment comes free).
5. **1–2 endings ship; the true ending does not** — documented for the GDD, deferred from the slice.

## Open questions

1. **Which 1–2 endings ship in the slice?** Natural candidates: the "not this life" melancholy version + one solidified-enough warmer variant — both fall out of the vision-versioning already designed.
2. **Slice math re-derivation** under the calendar model (locations × days × NPCs × years) — Session 2's rooms-based math is obsolete; do at the template merge.
3. Standing passes: final pitch-card check (deduce → recognize) · superposition amendment gets its formal home when the GDD assembles (full form above).

## Status after Session 9

All live design questions closed. The concept walks into class 02 with: a complete story spine (promise → search → reunion → renewal → player-authored release), a canonical interaction set, the nested-clock time architecture, a two-mode content architecture, and a slice contract. Next: class 02 template merge (Tue 7/14); Assignment #1 GDD draft (~7/16).
