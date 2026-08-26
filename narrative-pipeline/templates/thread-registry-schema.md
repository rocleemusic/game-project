# thread_registry Schema

One registry per **soul per life**, at `../../cast/[soul]-[role]-threads.md`. Written by the Narrative Architect whenever a soul is dealt a role; **a carded soul with a role and no registry is an incomplete deal.**

**Why it is not a card field (ruled 2026-08-06, GP-92 — [`../../gdd/07-cast.md`](../../gdd/07-cast.md)).** Threads are dealt with the role and do not survive the reshuffle. Dealt Postman next life, a soul gets a different set, re-authored from scratch — a Baker's feast cannot be finished alone; a Postman's rounds are a different engine. A registry sitting inside a reshuffle-invariant card reads as canon and quietly outlives the life it belongs to. The card travels; this file is replaced.

**Exemplar: [`../../cast/toby-baker-threads.md`](../../cast/toby-baker-threads.md).** Read it before writing one. Where this schema and the exemplar disagree, the exemplar is probably right and this file is stale — say so rather than following it.

*(Written 2026-08-09, capturing rulings made across that session. Before this, the format existed only as Toby's file and every rule below lived in conversation.)*

## Columns

Seven, in this order.

| Column | Holds |
|---|---|
| `Thread` | The id. See **Id prefixes** below. |
| `The open question` | What this life keeps asking about the soul. Open — many scenes can feed it, none closes it. |
| `Moves when` | The trigger. What new information counts as this thread having moved. "Move means new information, not resolution." |
| `Action / conflict` | **What actually happens in a scene.** Someone does something, or two wants collide. Physical where possible. See the test below. |
| `Type` | The **delta class** this thread deals in, per [`../guardrails.md`](../guardrails.md) check 3: `cast` (a possession, habit or line not crossed), `situation` (public, uncapped, stateful), `relational` (true only because these two are in the room). `—` where the row carries no delta. **Not the id prefix** — ownership is carried by the id itself. |
| `Reveals` | The **distinct facet of the essence** this thread opens. See the distinctness rule. |
| `Status` | One of the five below, with a dated reason for anything not ratified. |

## Two tables, one shape

The file carries **two tables with identical columns**. The first holds what is in play — `RATIFIED` and `PROPOSED`. The second sits under a **`## Not in play`** heading and holds `DEFERRED`, `REJECTED` and `RETIRED` (ruled 2026-08-09 — Roc).

Same shape on purpose. A row moves between them by moving, not by rewriting, so reconsidering a rejection costs nothing — and a rejected row that still shows its question, action and facet is the only kind worth keeping. `registry-lint` enforces placement: a live status below the fold, or a dead one above it, is a defect.

## Status vocabulary

`RATIFIED` · `PROPOSED` · `PARKED` · `DEFERRED` · `REJECTED` · `RETIRED` · `CROSS-REF`

**`PARKED` means scope, not quality** (added 2026-08-09): a good thread cut by the three-thread cap, with nothing wrong with its question, action or facet. It is distinct from `DEFERRED`, which names a blocker, and from `REJECTED`, which says the row was wrong. A parked row moves back above the fold if a slot frees, unchanged.

**`CROSS-REF`** marks a `pair-` thread ratified in the *other* registry. It is a pointer: it does not count toward the cap, and it stays below the fold so a soul's live rows read as its own three.

Only Roc ratifies. **Everything else carries a dated reason** — a deferral without a stated blocker is indistinguishable from an oversight, and a rejection without a reason gets re-proposed under a new id six weeks later. Rejected and retired rows **stay in the file** with their reasoning and their original text as a `*(was: …)*` record; a registry is a decision log, not a to-do list.

## Id prefixes

| Prefix | Means | Reshuffle |
|---|---|---|
| `<soul>-` | One soul owns it | Re-authored with the role |
| `world-` | No soul owns it — a property of the deal or the village | Passes to whoever is dealt the role it touches |
| `pair-` | Exactly two souls; it exists only because they are both in the room | **Re-keyed** — bound to the pairing, like `delta_relational` |

Ownership lives in the id, never in `Type`. A `pair-` thread is **declared in both registries** and names one **owner for the runtime join**, since the resolver works in single ids. The owner is the soul whose arc the thread moves; where it moves neither, it is `world-`, not `pair-`. **A cross-thread with a soul who owns no registry belongs to the soul who does** — texture souls own no registry, so an Ilsa–Juno thread is an `ilsa-` thread (ruled 2026-08-09).

## The five tests a row must pass

**1. Role-fed or this-life-fed.** Would the question survive the soul being dealt a different role? If yes it is essence, and it belongs on the card. *(Honest caveat: a deliberately plot-inert role manufactures roughly one thread — the role-goal situation. The rest come from the soul's per-life engine staged in role furniture. Those are this-life-fed, not role-fed, and they are legitimate.)*

**2. A role-goal is a situation, not a thread** (ruled 2026-08-09). The feast, the centerpiece and the tonic are `delta_situation` — uncapped, stateful, feeding threads rather than occupying rows. **The one licensed exception** is a row stating the *tension between the want and the role-goal*, in the `toby-feast-short` form: "the Baker's feast can't be finished alone (the Giver's want × role-goal tension)." A row that merely restates the goal is rejected. One tension row per soul.

**3. Distinct facet.** Every ratified row's `Reveals` must open a **different** face of the essence. **Five rows revealing the same thing are one thread with five stagings.** Toby's set is the bar: what he does with what he is given · what he is when nothing needs doing · how much he does that nobody sees.

**4. A stageable action.** Fill `Action / conflict` and apply the test: *from this cell alone, can a reader decide whether the scene is worth writing?* "The repay-reflex surfaces" fails — that is `Reveals` wearing a different hat. **A row with no writable action is a state, not a thread.** Say so in the cell rather than filling it with mush; the 2026-08-09 pass caught four such rows and three of them were already-rejected, which is the test working.

**5. Not another soul's shape.** Outside-naming is Toby's. A thread that transplants a carded soul's structure into different furniture is rejected however correct it looks.

## The cap, and the three slots

**Maximum three ratified threads per deep soul (ruled 2026-08-09 — Roc).** This reverses the earlier five-minimum, set the same day: **key-item moments** will carry work these threads would otherwise have done, and three threads that get written beat eight that get thinned.

The three are **shaped, not just counted**:

| Slot | Holds | Toby | Mara | Ilsa |
|---|---|---|---|---|
| **a. Festival arc** | This role's mishaps from the arc doc's per-occupation pool, as states of one shortfall, in the want-×-role-goal tension form | `toby-feast-short` | `mara-tonic-frost` | `ilsa-forge-short` |
| **b. Essence** | The soul's own thread — the one the card exists to feed | `toby-the-shelf` | `mara-set-for-two` | `ilsa-kin-no-show` |
| **c. Another NPC** | Engine is another **carded** soul, not an anonymous villager. A soul remarking on the owner is not this — that uses an NPC as an instrument | `pair-giver-kinbound` | `mara-said-out-loud` | `ilsa-not-family` |

**A `pair-` thread counts against its owner only** (ruled 2026-08-09). Its declaration in the other soul's registry is a cross-reference, marked as such and kept below the fold; otherwise one pair thread costs two of six slots across the roster and nobody writes one.

Everything cut for the cap is **`PARKED`**, not rejected — see the status vocabulary. **Texture souls own no registry at all, and a texture soul's role-goal takes no row** — the rite, the letters and the harvest are situations, referenced freely, never tracked (ruled 2026-08-09).

## Checked by

`../../tools/registry-lint.mjs` — columns, status vocabulary, dated reasons, id-prefix agreement with `Type`, empty action cells, and the five-ratified floor. **The distinct-facet test is not mechanical** and stays a human read at the gate.
