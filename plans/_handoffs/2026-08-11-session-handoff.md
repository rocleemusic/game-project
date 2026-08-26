# Session handoff — 2026-08-10 / 11

**For the PM agent evaluating the board.** Written at the end of the session that completed the nine-thread authoring run. Everything below is verified against files, not against agent reports — that distinction cost this session real time and is lesson 7 on GP-121.

---

## The one-paragraph version

All nine threads across the three deep souls are authored end to end — Architect → Roc's gate → Choice designer → Roc's gate → Lines — producing **30 conversation files and 1,426 slots**. A convergence audit found real soul-voice defects, which forced a new pipeline seat into existence (**batch reconciler**, the first seat licensed to rewrite). The line files turned out to have no format contract, which was fixed with a written schema, a full migration and a **sixth repo gate**. The content is import-ready: no negated gates, no bad slot types, no id collisions. **Seven cards closed.** The next real move is GP-113 or GP-120.

---

## What the board looks like now

**Closed 2026-08-11:** GP-56, GP-57, GP-114, GP-121, GP-124, GP-126, GP-134.

**In Review, deliberately left:**

| Card | Why it is still open |
|---|---|
| GP-120 | Needs Roc to play C4 in Lantern. That *is* the card; it cannot be closed on the page. |
| GP-96 | ThreadsPanel — Track B tool work, not this content. |
| GP-82 | personas.json re-sync — Track B. |

**S3, unblocked and ready:**

| Card | State |
|---|---|
| GP-113 | Cross-soul echo payoff. Its stated dependency — Ilsa's threads not existing — cleared tonight. |
| GP-21 | Bond-band guard, rescoped 2026-08-11. Moved S2 → S3. |

---

## The five things a PM should actually weigh

### 1. Toby's central echo has no payoff anywhere in the build

`toby_repays_every_gift` is the `payoff_condition` for the `toby-unopened-jam` echo, and **nothing in the repo sets it.** This is correct by design — Roc ruled 2026-08-06 that the payoff lives in the shared festival scene, not a fifth Toby conversation, so the shelf thread deliberately produces `shelf_named` + `gave_unowed` with the gift unrepaid and stops on the held breath.

It is correct **only until GP-113 lands.** This is the highest-value open item on the board and it is now unblocked.

### 2. The bond ruling is broken right now, quietly

"One life earns mid, a second earns high." Thresholds were re-sized 2026-08-10 to `mid_min: 12`, `high_min: 82` (from 36). **Ilsa's two-life ceiling is 63** — her high band is unreachable, so the second half of the ruling is false for her. Toby's *one-life* ceiling of 71 already exceeds her two-life ceiling.

Roc ruled 2026-08-10 to leave the numbers. GP-21 was rescoped rather than closed, because its acceptance criterion is now that **the guard must fail on Ilsa** — a test that goes green against a known break certifies the break. Do not let anyone close GP-21 by making it pass.

### 3. Ilsa's declared instrument is the one thing the run did not establish

Her tell is **grammar** — the sentence going incomplete. It fires **4 times in 282 lines**, and in `ilsa-kin-no-show`, her deepest thread, once. Her actual pressure move there is the clipped *complete* sentence, which is Toby's tempo doing her work.

The batch reconciler fixed her warmth channel (borrowed anticipation 16 → 5) but deliberately did not force the grammar tell, because the thread doc states three times that it is saved for C4. **That is Roc's open ruling:** either the C4-reserved design stands, or the doc is amended. It does not block anything, and it is the deepest unresolved question in the content.

### 4. 179 slots are ceiling-unchecked

1,426 rows carry a slot id; **1,138 carry a checkable count.** `toby-the-shelf` C1/C2/C4 have no `W` column at all. Those rows sit outside the new gate and outside the per-soul band measurements the souls are distinguished by. Does **not** block the engine import.

### 5. The capstone is 2026-08-25

Fourteen days. The per-soul authoring is done; what remains is the cross-soul pass, the engine port, and Track B tooling.

---

## What was built this session

### The batch reconciler — a new seat

`agents/batch-reconciler.md`, minted by Roc 2026-08-10 on the second live instance of the defect.

The gap it fills is structural, and neither adjacent seat is wrong about it: **step 8 (Content) can fix convergence and cannot see it**, because it works one slot at a time; **step 11 (purge) can see it and is forbidden to fix it**, because it flags only. Nothing between them reconciled a finished batch.

**It rewrites.** That makes it unlike the Verifier and the purge pass, and is why minting it needed Roc's word rather than a seat's. Four defect classes, in cost order: another soul's channel · a licensed device misused · a template · verbatim reuse.

Run across all three souls. Counts on GP-126. Notably it **rejected four audit findings** after checking them against the cards rather than applying them as written — audits are leads to verify, not work orders.

### The line-file schema and a sixth gate

The files had no format contract. Thirty files by many agents had drifted into thirty near-variants.

**Why it was a build blocker, not tidying:** a positional word-count parse returned 46 short lines against the reconciler's 85. The parse was wrong because the column index was not stable — and it failed *silently*, returning a number that simply wasn't the right one. Same shape as the no-negation predicate bug.

- `narrative-pipeline/templates/line-file-schema.md` — canonical order `slot id | slot_type | tone | text | W | speaker_intent`, chosen by corpus plurality rather than invention (26/30 files already put text before count; `W` won 12–8–7). Speaker column only where speaking alternates table-wide — 2 of 30.
- **Counting convention ruled by Roc 2026-08-11:** the `**[action]**` marker does not count; brackets do not count but their inner words do; a contraction is one word. Recount corrected **18 of 1,133** slots.
- `tools/line-lint.mjs` — **the sixth gate.** Checks `W` against its own text, the ceilings (40/60/60/12, 75 marked long run), and `slot_type` membership. It rejected two of the five new rows written this session, minutes after being added.

**One deliberate limitation:** the heading-vs-table check flags **shortfalls only**. The corpus counts "response slots" two ways — `-1-a` includes its unlabeled action and object beats in its four, `-1-b` excludes them from its two. Until that is ruled, a surplus is ambiguous and a shortfall is not. A check firing on the ambiguous direction becomes noise, and noise gets muted.

### Content fixes

- **Five slots written** in `toby-the-shelf-C3` that had briefs but no prose — three option headings had promised response counts their tables never carried. Two id defects fixed in the same pass.
- **One render defect** that would have imported wrong: `toby-the-shelf-C2` `L-CH-T2-09-2-a-1-b-r1` was typed `dialogue` while holding the stage direction `[action] Toby pretends he didn't hear`. The importer would have spoken it aloud. Its heading and its own intent note both called for a line, so it was an unreplaced placeholder; line written.
- **A self-contradicting status line** in `ilsa-kin-no-show.md` claimed C2 awaited its gate and that Lines had run C1 only — contradicting the approval two sentences earlier and the four files on disk. It would have told whoever runs the import that three quarters of the thread did not exist.

---

## Import readiness — audited 2026-08-11

| Check | Result |
|---|---|
| Negated predicates in live gates | **none** — every mention is a prose warning |
| `slot_type` outside the four | **none** |
| `surface_action` used as a slot type | **none** |
| Render-prefix mismatches | 1, fixed |
| Id collisions | none |
| All six gates | clean |

---

## How to read agent output in this project

Three session limits were hit. **Agents wrote files, then died before reporting.** One workflow reported 1 thread written when 29 of 30 files existed on disk.

**Check artifacts, not agent reports.** A schema migration that claims 30 files in 2 tool calls is a claim, not a result — verify it. This is lesson 7 on GP-121 and it earned its place twice in one session.
