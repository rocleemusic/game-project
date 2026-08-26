# `toby-the-shelf` — v01

**This life only.** Toby is dealt Baker this run, so the staging below is jars and orders. The thread's identity — id, open question, the card field it reveals — is ratified in `cast/toby.md`. Everything here is the Baker instance and does not survive a reshuffle.

**Open question:** What does he do with what he is given?

**Status:** Architect brief complete. **Conversations awaiting the Choice designer.** No prose.

---

## Thread shape

Three reveals across **four conversations**.

| # | Reveal | Fact | Card field | Staged this life as |
|---|---|---|---|---|
| R1 | The shelf exists | cast | `conviction` | A shelf of jars behind the counter, none opened |
| R2 | The trade — a gift went back out as goods he made, unmentioned | cast | `conviction` · `warmth_channel` | Two rolls added to the giver's next order, unbilled |
| R3 | Someone else has been repaid the same way | re-touch of R2, no new cast fact | `notice_and_want` from outside | Another villager mentions bread she never ordered |

**Conversation allocation** — the Architect's call, and the constraint the Choice designer works inside:

| Conversation | Scene id | Carries |
|---|---|---|
| C1 | `SC-T2-08` | R1 |
| C2 | `SC-T2-09` | R2 |
| C3 | `SC-T2-10` | Nothing — quiet beat, no fact slots |
| C4 | `SC-T2-11` | R3 |

C3 carries no reveal on purpose. `delta_rule` sanctions the quiet beat as "the breathing room later recognition needs, never a gap to fill." It is exempt from the delta floor and still bound by the ceiling.

---

## What happens across the thread

He keeps what he is given and cannot let it stay given. First you see the jars. Then you see one leave — not opened, not eaten, converted into something he made and sent back out, unmentioned. Then someone who is not you says the same thing happened to them, which makes it a pattern rather than a kindness.

**Where it leaves off on day 5: open.** The furthest this thread travels alone is *the player has named the shelf to his face and he has not repaid that one yet.* It does not close. `toby-unopened-jam` pays off only when the player has given him something with nothing owed **and** named the shelf back to him, and per R7 the echo is cross-soul and belongs to the seam pass. The last state is a held breath.

**The thread's job ends at making that state reachable.**

---

## Dependency order

    C1 (R1) ──> C2 (R2) ──> C3 (quiet) ──> C4 (R3)

- **C1 needs nothing.** Zero-knowledge entry. It must work as the player's first contact with Toby this week — no sibling thread, no prior scene.
- **C2 needs `shelf_seen`.** The trade only reads as a repay-reflex if the jars are known to be unopened. Reached cold it is a baker giving away rolls.
- **C3 needs C2 complete.**
- **C4 needs `shelf_named`.** A third party's remark only lands once the player has named the pattern to Toby's face. Reached cold it is small talk.

### Flags

| Flag | Set by | Read by |
|---|---|---|
| `shelf_seen` | C1, or the `ex-shelf` examinable | C2, C3 |
| `repaid_seen` | C2 | C3 |
| `shelf_named` | C2 | C4 |
| `gave_unowed` | C3 | C4 |

**Every flag has a reader.** `shelf_named` is written by v01's `CH-T2-07-5` and read by nothing today — the write-only flag step 3 exists to catch. Here C4's entry gate reads it. **No flag may be added without a reader.**

### Facts read per conversation

C1 reads none · C2 reads one · C3 reads two · C4 reads two. R6's ceiling is two.

---

## Constraints on the conversation design

- **Entry gate is the previous conversation in this thread completing. Nothing else.** Completion gates the sequence; knowledge gates the content (R3).
- **Every incoming state must walk without dead-ending.** Two facts read means four states.
- **One state is always the fallback** — "you finished the last conversation and learned nothing from it." It is a real state a real player reaches.
- **A missed fact makes the thread shallower, never rerouted** (R5). The shallow path still delivers something.
- **Missed things stay in the world.** If a path is closed, name the examinable that reopens it. `ex-shelf` is wired on T2, sticky and repeatable.
- **Options are equal weight.** No option is the correct answer; no counter keys off repetition (guardrail 10, `guardrails.md` check 2).
- **Bond weights:** Recognition 3, Trust 2, Intimacy 2. The deep path records Recognition, the shallow path records Intimacy or nothing.
- **No `thread_move` in C3.** A quiet beat that moves the thread is not quiet.

### Pacing

A thread may be entered **once per time slot**; the day's opening slot belongs to the festival arc; later slots allow multiple threads (GP-93). The shelf can advance about twice a day, so these four fit in two days minimum.

**Nothing here may assume which slots, which days, or how much clock separates them.** A player may take all four across two days or spread them over five.

**Open and unresolved:** whether a conversation that reveals nothing still costs a full time block. If it does, C3 is expensive. Roc's call, GP-93.

### Id conventions

Choice nodes `CH-T2-08-1`, `-2`, … · options `-a`, `-b` · player line `L-CH-T2-08-1-a-p` · response `L-CH-T2-08-1-a-r1`.

v01's `SC-T2-07` carries shelf, flask and feast beats in one scene — the mixed-thread defect. It is left untouched, not re-scoped. These are new ids.

---

## Conversations

**For the Choice designer.** One section per conversation, each with a content block and a mermaid node graph. **Roc approves the shape before any prose is written.**

The content block says what is open, what is closed and what he reveals, per incoming state. The graph shows the choice nodes, their gates, the options and where each rejoins.

### C1 — `SC-T2-08`

*Awaiting Choice designer.*

### C2 — `SC-T2-09`

*Awaiting Choice designer.*

### C3 — `SC-T2-10`

*Awaiting Choice designer.*

### C4 — `SC-T2-11`

*Awaiting Choice designer.*

---

## Card fields the designer must not contradict

- **`deflection_target`** — when attention turns on him he finds something that still needs doing and goes to do it.
- **`precision_profile`** — exact about what everyone else needs; has not worked out what he needs.
- **`warmth_channel`** — anticipation. It is already there when you reach for it, and he never says he did it.
- **`conviction`** — he refuses care with no strings attached.
- **Warmth is invariant.** He goes flat and short while receiving, but a line that reads brusque, clipped, dismissive, transactional or irritated is a **defect**, even though it is flat and short.
- **No World Truth is ever stated in-scene, and no scene grants Toby a fix as a reward.**
