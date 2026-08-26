# Storyline authoring process — design record

**Status: design in progress, 2026-08-03.** Rulings below are Roc's and are marked as such. Everything else is a proposal waiting on him. This is a design record, not status. Board state lives in Paca.

Worked out against Toby. Nothing here has been tested on a second soul.

---

## The goal

Build a standard process that can be handed to agents, so they produce meaningful storylines with branching choices.

"Handed off" sets the bar. Each step needs three things: what goes in, what comes out, and how you know it passed. Steps that only describe the work are not handoffs.

## The shift this makes

Today the pipeline is organised by content class. Arc, then every NPC, then spells, then items.

This process is organised by **soul**. One soul goes all the way through: card, arc, threads, role, conversations, lines.

That fits the problem better, because a storyline belongs to a soul and not to a class. It also gives a clean handoff unit. One agent gets one soul and everything needed to write it.

The cost is that soul-by-soul work misses what happens **between** souls. Juno's line about Toby belongs to neither of them. The `help-not-wanted` thread needs the Content Server. So the process ends with a seam pass, or the village never argues with itself.

---

## The units

**Thread.** An open question the story keeps feeding, never one it resolves. It is not the arc. The arc is what the threads add up to, and it resolves in the player's head rather than in a counter.

**Conversation.** One scene with one soul. The unit the player picks from a screen hub. Carries one thread reveal, or two at most.

**Choice node.** One setup, two or three options, a response each. The unit of *something happens, you pick, he answers*.

Toby's current numbers: 5 scenes, 26 choice nodes, 55 options, 114 lines.

Note that "beat" is used loosely in this repo for at least three things. A **quiet beat** is a scheduled unit carrying no fact slots. A **receive-beat** is a story moment in the arc doc. Neither is a choice node. Say which one you mean.

---

## How long a thread runs

There is a hard budget, and it is smaller than it looks.

The day scheduler places Toby **16 times** a week — 3 per day, 4 on day 5. *(Corrected 2026-08-06 against `lantern-projects/v01/day-*.json`. This said "about five times a week." Five is the **guaranteed floor**, not a count: the resolver test "every deep soul with an arc is guaranteed on a scene screen on every day" guarantees one per day. Most of the other eleven are co-presence slots, which matches R9's "Toby alone shares a slot about ten times a week.")* The delta ceiling allows **two cast facts per scene**.

The binding limit is not placements. Under the pacing rules (GP-93) the day's opening slot belongs to the festival arc and a thread may be entered once per time slot, so what bounds a week is conversations, not opportunities.

Four cast-typed threads share those ten. That is **two or three real reveals each**.

This is the number that matters, not the choice-node count. Only about ten of Toby's 26 choice nodes can carry a *new* fact. The rest are texture, deflection, or a branch that adds nothing.

**Amended by R11 (Roc, 2026-08-04).** The paragraph above counts new facts, and the original conclusion — that v01's 19 moves against a ceiling of ten made "most recorded moves re-touches", stated as a defect — no longer holds. A re-touch is legitimate and spends against the same two-per-scene ceiling. See R11.

`tuning.json` already assumes this scale. `arch_promote` reads `threads_moved_min: 3, of_threads: 5`. The festival tier needs three of five threads moved. **Five threads per soul is already a tuned number**, even though only two threads exist in the whole project today.

---

## Rulings (Roc, 2026-08-03)

### R1 — Do not pre-author graph shape

v01's placeholder graph was calibration. It proved the machinery renders varied shapes. Going forward, nobody lays out the week.

This matches `pipeline.md` step 6, which already refuses it: scenes assemble from small preconditioned pieces rather than fixed trees, and "a scripted quest tree with next-point pointers is the concrete alternative that atomic-encounter assembly replaces."

**"Graph before prose" means know a beat's branch logic before writing its words.** It does not mean lay out the week. The unit is the piece, not the tree.

Variety is a result, not a design. If pieces are gated on state, different players reach different subsets. The thing to check is not "can we make varied shapes" but "does every piece survive being reached first, last, or alone."

### R2 — Order by dependency, not by calendar

Seeing the shelf comes before naming it because one needs the other, not because one is Tuesday. The resolver's day scheduler turns dependency order into days at runtime. Nobody hand-places a soul across the week.

### R3 — Completion gates the sequence, knowledge gates the content

A conversation completing unlocks the next conversation in its thread. **The player never lands in the middle of a thread.**

What the player *learned* decides what the next conversation can be about. Didn't see the jam jar, so the shelf path is closed and he behaves like someone whose shelf you have never noticed.

**Rationale.** An earlier proposal had a specific option set the progress flag. That lets a player fall off a thread without being told, and it breaks guardrail 10, because a branch that advances the story while another does not is the correct answer. Splitting the two gates keeps the thread intact without flattening the choices.

**This also sharpens the fallback.** Every piece already needs a zero-information fallback. Now it is specific: the fallback is "you finished the last conversation and learned nothing from it." That is a real state a real player reaches, so QA can walk it.

**Amended by Roc, 2026-08-06 — a knowledge entry gate is allowed when the Architect chooses it.** The rule above reads as an absolute ban on gating a conversation's *entry* on knowledge, and the shelf run needed one: `SC-T2-11` opens only for a player who named the shelf. Roc ruled that **not seeing a conversation in a given life is by design** — threads are discoverable, and missing one is play, not a defect. The danger the original rule was aimed at is narrower than the rule: it is entering a thread **midway without the beats behind it**, which reads as discontinuity. Completion-gating already prevents that, and it still binds. So the split stands as the default, and a knowledge entry gate is an Architect decision, never a Choice designer's. Where one exists, the conversation's unreachable incoming states are recorded rather than passed over.

### R4 — Missing a thread is fine

A thread that never starts is a player choice, not a defect.

**Consequence:** the staleness bias is no longer load-bearing. The arc doc specifies that a thread untouched for six scenes should bias the next scene toward it, and nobody built it. It is worth building for pacing. It is not blocking anything.

### R5 — A missed fact makes the thread shallower, and the player can pick it up later

The thread does not reroute. It runs shallower.

But the missed thing stays in the world. The jam jar is still on the shelf, and clicking it later opens the deeper path. A shallow run still delivers something, just less.

**Shallow moves bond less.** `tuning.json` already supports this: Recognition weights 3, Trust and Intimacy weight 2. The deep path records Recognition, the shallow path records Intimacy, or nothing.

**The pickup mechanism exists — built by GP-111, not found lying around.** *(Corrected 2026-08-09.)* This rule originally claimed "no new machinery": screens carried `examinables` and an examinable setting a knowledge flag was supposedly the whole pickup path. That was false — nothing carried the flag. GP-111 (Done, approved by Roc 2026-08-09) built it: `knowledge_flag` on `Examinable` (`tools/resolver/src/types.ts`), carried through the resolver into ink, with the flag's phrase declared even when no choice sets it. The pickup path works now, and it works because it was built.

### R6 — A conversation may read at most two prior facts

Two facts is four incoming states, one of which is the fallback.

**Rationale.** Every fact a conversation branches on doubles its variants. Three facts is eight versions of one conversation, most of which nobody sees. Two is writable and walkable. It also matches the delta ceiling: a conversation reveals at most two cast facts, so it should read at most two.

**Start here and revisit.** The number is a starting point, not a finding. If real content wants three, that is a decision at the gate, not a limit an agent may raise.

### R7 — Echo is a technique, not the structure

Threads carry continuity. An echo is an occasional deferred payoff, considered rather than reached for. One echo across a five-day run is the right density.

The not-the-job test keeps them rare without help. Most candidate seeds fail it, which is what happened to Toby's stool seed.

**Echo stays out of the thread registry** because an echo's payoff can be spoken by a **different soul** than the one who planted it. That makes it cross-soul, so it cannot live inside a per-soul package. It belongs to the seam pass.

### R8 — The arc lives on the cast card

A soul reads in one place: card, arc, thread registry, role. The arc doc stays the source and wins any disagreement.

Standing risk: a third copy of the arc spine already exists as a display string in `tools/lantern/src/lib/personaCard.ts`, and it has already drifted. It dropped the corrective clause. If the card copy drifts too, move the spine's home to the card and have the arc doc point at it. Do not keep three copies in step.

### R9 — Cross-soul work happens with the souls, not after them

Per-soul work (steps 1 to 5) runs as a **batch across every soul**, not one soul end to end. Agents fan out, one per soul. Only then does anyone write a conversation, because a cross-soul beat needs both souls' threads to already exist.

**Co-presence is abundant, not scarce.** Every day has seven slots where two souls share a screen and time block. Day 5 has nine, including two triples. Toby alone shares a slot about ten times a week, which is more co-presence slots than he has solo reveals. Cross-soul content today: none.

**Never author to a specific pairing on a specific day.** `day-N.json` is generated, and a re-roll changes who stands where. Author the piece and gate it on **who is present**. The scheduler makes the opportunity; the piece fires when the condition is true. Same model as R1.

**Key cross-soul pieces to stance pairs, not to named souls.** The arc doc's social conflict table already does this: Giver × Content Server, Kinbound × Found-Family Keeper. Stance pairs re-key themselves when roles reshuffle. Soul pairs do not. The table has five rows and no content behind any of them.

### R10 — Three fact types, and a shared scene trades depth for breadth

A **relational fact** (`delta_relational`) is true only because two souls are in the room: a debt between them, a subject they route around, who defers to whom.

It is **not** a cast fact. A cast fact is soul-bound and travels across lives. A relational fact is bound to the pair and **re-keys on reshuffle**, which is exactly why the conflict table is written to stances. That difference is the reason it needs its own type rather than a slot in the cast budget.

| Type | Bound to | Travels across lives | Cap |
|---|---|---|---|
| `delta_situation` | The world | No | None |
| `delta_cast` | One soul | Yes | 2 solo · 1 per cast member present in a shared scene |
| `delta_relational` | The pair | No | 1 per scene |

**Solo scenes stay at two cast facts.** So a solo scene goes deep on one soul, and a shared scene goes broad: one fact each plus the relational. Co-presence buys the pairing and costs depth. It is never a route around the ceiling.

**No cast member is a prop.** Each soul's fact must feed one of *that soul's own* threads, because you cannot know which soul the player is following. Either could be the primary. A soul present only to make someone else's beat land is a flag. Walk-ons are the exception, which is what the walk-on codex class is for: business, no card, no thread, no facts.

### R11 — Continuity outranks novelty, and threads are a pool (Roc, 2026-08-04)

**The two-cast-facts-per-scene ceiling holds, and a re-touch spends against it.** A scene may spend either of its two facts on a fact already used. Restating what the player knows, in a new situation, is thread work — not waste.

This resolves the density problem that ratifying eight threads for Toby would otherwise create. The ~10-per-week budget in *How long a thread runs* counts **new** facts only; it is not a cap on thread moves, so it never was the constraint on how many threads a soul may carry.

**Threads are a pool, not a checklist.** No run plays every thread. `toby-feast-short` surfaces every run because the festival arc requires it; the cast threads surface as the week deals them. **A thread that never comes up in a run is not a gap** — this is R4 restated at the run level rather than the player level.

**Consequence for authoring.** Write each thread to be legible from whatever subset a run surfaces. A thread cannot assume a sibling thread was seen. The cross-thread version of R3's fallback: every thread's first move must work as the player's first contact with that soul this week.

**Consequence for `arch_promote`.** `tuning.json` reads `threads_moved_min: 3, of_threads: 5`. With eight ratified threads on Toby and a random surfacing pool, that denominator is now wrong and the gate's difficulty drifts with the deal. Flagged, not fixed — retuning is Roc's call.

---

## The process

| # | Step | Output | Done when |
|---|---|---|---|
| 1 | Soul package | Card, arc, thread registry, role | Every thread names the card field it reveals |
| 2 | Thread shape | Two or three reveals per thread, in order, and where the thread leaves off on day 5 | Reveal count fits the fact budget |
| 3 | Dependency order | What each reveal needs first | No reveal depends on something unreachable. No write-only flags |
| 4 | **Cross-soul pass** | One piece per stance pair, gated on co-presence | Every pair's fact feeds a thread on **both** sides |
| 5 | Author each conversation | Entry gate, incoming states, per-state content, fallback, outcomes | All four incoming states walk without dead-ending |
| 6 | Lines | Prose | One slot per call |
| 7 | Seam pass | Check, not invent | Every cross-soul beat has an owner |

**Steps 1 to 3 run as a batch across every soul** before step 4 starts. Agents fan out, one soul each.

Steps 2, 3 and 5 are new. Step 3 is the one not to skip: it is cheap, and it is the step that would have caught v01's dead flag. Step 4 moved forward from the end, per R9 — the seam pass at step 7 now checks cross-soul content rather than inventing it.

### What step 4 writes, per conversation

- **Entry gate.** The previous conversation in this thread completed. Nothing else.
- **Incoming states.** The two facts it reads, so four states.
- **Per state.** What is open, what is closed, what he reveals.
- **The fallback.** The state where the player learned nothing last time.
- **Outcomes.** What each option records: knowledge flag, bond category, thread move.
- **Pickup.** If a path is closed, which examinable reopens it.

Fixed shape, one page per conversation, and QA can walk all four states.

---

## Split the Architect — RULED (Roc, 2026-08-04)

**Ruled in.** The split below is canon. The Choice designer is a real seat and its contract is written: [`../agents/choice-designer.md`](../agents/choice-designer.md). This closes open item 4.

*(Location corrected 2026-08-06. This said the contract would live in `narrative-pipeline/agents/`; Roc placed it in `agents/` when it was written. Noting the convention it cuts against, for Roc to overrule if he wants: `agents/` currently holds project-level seats such as `production-pm.md`, while `narrative-pipeline/agents/` holds pipeline seats such as `narrative-director.md`, and the Choice designer is a pipeline seat running step 5. The file stays where Roc put it; the plan doc is what was wrong.)*

The catch at the end of this section still stands as written: test the split on one soul and one thread — Toby and `toby-the-shelf` — before writing it into the crew spec. If the two seats keep passing work back and forth, the line is wrong, and that costs one thread to learn instead of eight souls.

The Architect already owns six of thirteen pipeline steps: intake, cards, echoes, delta and canon, graph, and recognition gates. Adding thread shape, dependency order and conversation design makes one seat own everything except the prose.

That breaks the crew's own rule that each worker does bounded work. It also concentrates risk. The 2026-07-25 run's failures were nearly all structural. Wrong slot type, unsatisfiable constraint set, bent ceiling. All came from that seat.

**Split into two.**

| Seat | Owns |
|---|---|
| Architect (soul) | Card, arc, threads, thread shape, dependency order |
| Choice designer | Conversations, gates and predicates, options, outcomes, fallbacks |

The line is **what gets revealed** versus **when and how it can be reached**. Different skills, different failure modes. Character work fails by being generic. Structure work fails by being unreachable. One reviewer cannot hold both standards at once.

QA stays where it is and checks the choice designer's output. That is better than today, where the Architect checks its own graph.

**Do not add more seats.** Thread shape is characterization and belongs with the soul Architect. The seam pass is direction and belongs to the Director.

**The catch.** Every seat costs handoffs, and handoffs are where the tokens went last time. The 2026-07-25 run spent 79 percent there. Test the split on one soul and one thread before writing it into the crew spec. If the two seats keep passing work back and forth, the line is wrong, and that costs one thread to learn instead of eight souls.

---

## Still open

1. ~~**Ratify the five threads** for Toby.~~ **Closed 2026-08-04.** Eight ratified, one deferred (`toby-help-not-wanted`, needs the Content Server), one retired (`giver-receive`). Recorded in `cast/toby.md`.
2. ~~**The arc doc thread table has no id column.**~~ **Closed 2026-08-04.** Column added to `arc-festival-slice.md`; ids are `<soul>-<thread>`, with `world-` for the two rows no soul owns.
3. **Does the echo-as-technique position go into `echo-template-schema.md`?** Right now it sits on one soul's card, which is exactly where the not-the-job test ended up before the next Architect failed to see it.
4. ~~**Does the choice designer become a real seat**~~ **Closed 2026-08-04 — yes.** Contract file in `narrative-pipeline/agents/` still to be written.

**Carried in from the ratification.** Two things the data has not caught up to:

- `giver-receive` is still wired into `role-workplace.json`'s Baker `goal_threads`, `story.json`, `graph.json` and the Lantern fixtures. Retiring the id in the docs did not rewire them.
- `tuning.json`'s `arch_promote` reads `of_threads: 5` against eight ratified threads. See R11.

## What this changes in v01

Not scheduled. Recorded so the list exists.

- **The T2 hub jumps into the middle of a thread.** It offers both Toby conversations from the start, gated only on him being present. R3 says one must gate on the other.
- **`giver-receive` should be retired.** Nineteen moves on one counter cannot distinguish "he deflected a tray" from "he kept a gift."
- **`shelf_named` is written and never read.** Step 3 exists to catch this.
- ~~**No `action` slots exist.**~~ **Stale as of 2026-08-06.** `action` and `object` slots both appear in live data now, and `surface_action` is wired in `tools/resolver/src/ink.ts:386` — an option must be a spoken line or a deed, and the build throws if it is neither. The echo seed has somewhere legal to go. What remains true is that most of Toby's v01 non-player slots are still `dialogue`.
- **`toby_repays_every_gift` exists in no file**, so the festival payoff fires on accumulated bond. That is the thing the echo rule forbids, and only Ilsa has an exception for it.
- **A conversation currently mixes threads.** SC-T2-07 carries shelf, flask and feast beats in one run. Under the fact budget a conversation should serve one thread, or two at most.

## Next move

Prove the process on one thread before writing it into the crew spec. Run steps 2, 3 and 5 on `the-shelf`, which has the most existing material.

That tests the per-soul half only. Step 4 needs two finished souls, and Ilsa has a card, so **Toby × Ilsa is runnable now**: Giver versus Kinbound is a real row in the conflict table, and the two of them already share T7 on day 5.

So run Toby solo through the per-soul steps, then one Toby × Ilsa pair through step 4. That tests both halves for the cost of one soul and one pairing. If the process survives, it scales. If it does not, that is what one thread costs to find out.
