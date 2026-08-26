# Game-Project GDD — Phase 2.5 Resynthesis Plan (Runbook)

> **Read this first.** Phase 1 (ingestion) + Phase 2 (synthesis) are done and the KB has since
> **doubled** (75 → 157 notes) via two additive kb-intake batches (narrative +54, art-direction +29).
> Tonight's class lecture (Josh Burdick, Assignment-2 GDD scope) plus Roc's `GATE-2-review.md`
> annotations **reframe the GDD's shape**. This runbook resynthesizes the Phase-2 artifacts against
> the full KB and the reframe, **then** holds at GATE 2 for the scope-lock.
>
> **Execution is gated.** Rounds run in order (A → B → C); stop at each **GATE** for Roc. Do not
> fan out past a round's gate. Nothing here starts until the pre-flight items (§7) are cleared.

> **⚙ Unattended-mode override (2026-07-17 overnight run).** This run executes Rounds A→B→C
> **straight through as one background Workflow** — the A/B/C gates **collapse into a single GATE-2
> morning review.** Three deltas from the gated procedure below, all authorized for this run:
> 1. **No mid-round human stop.** Round A's compare **auto-selects the recommended two-doc structure**
>    (Pitch GDD 1–3 pp + expansive Build GDD + a Parking-Lot doc, per §2) so Rounds B and C build on it
>    without waiting. GATES A/B/C become morning review checkpoints, not halts.
> 2. **Outputs are STAGED, not overwritten in place.** Every deliverable + each round's compare
>    write-up is written under `knowledge-base/synthesis/_resynthesis-staging/` (`round-A/` · `round-B/` ·
>    `round-C/` + a top-level `MORNING-REVIEW.md`). The live Phase-2 artifacts in `synthesis/` are left
>    untouched until Roc promotes staged→live at GATE 2. **(Supersedes §8's "rewritten in place" for this run.)**
> 3. **Model routing (supersedes §3's "strong model for all"):** divergent **lens** agents run on
>    **Sonnet**; every **compare/merge** pass + the two straight **refreshes** (voice-style-guide,
>    pnc-grammar) run on **Opus**; the capped Round-C recon runs on Sonnet. Grounding discipline (§5) is unchanged.
> 4. **Round-C recon disposition** (the deferred "committed vs. ephemeral" call) defaults to **staged as
>    `round-C/recon.md`**; Roc promotes it to a committed reference note set or discards it at GATE 2.
> **Still holds: STOP at GATE 2 — do not start Phase 3.**

---

## 1. Why now (the trigger)

- **KB doubled:** 157 grounded notes. The four `synthesis/` artifacts were integrated from the
  original 74 and predate ~83 new notes. Coverage jumped: **H4 ●●●, H10 ●●●, H16/H17 ●●●, H11 ●●○**.
- **Class reframe** (transcript: `P:\_DOWNLOADS\Multi Agent AI for Game Development.txt` — the two
  files Roc supplied are identical): the GDD's target shape changed (see §2).
- **Roc's worksheet decisions** (`GATE-2-review.md`) lock several calls and open others (see §2).

This is **Phase 2.5** — a resynthesis pass inserted before the GATE-2 scope-lock, so the lock rests on
the full KB and the reframed structure rather than the pre-doubling synthesis.

---

## 2. Locked inputs (what's decided going in — do not re-litigate)

**From the class lecture:**
- **Two GDDs.** A **Pitch GDD (1–3 pp, even 1)** — the graded turn-in; must instantly answer
  *"what does the player do?"* — and an **expansive Build GDD** — narrative woven in, the doc handed
  to the dev-crew/agents. Plus a **Parking-Lot doc** for cut ideas (never delete — move and review later).
- **Specificity > length.** *"More specific, not longer. Cut wishes, keep specs."* Agent specs hit the
  **JSON-I/O altitude** (e.g. *content agent → NPC dialogue as JSON: `speaker_id`, `tone ∈ {5}`, `≤40 words`*).
- **~5 agents + an orchestrator/manager** for class scope; one-agent-per-feature; **realistic-capability
  check** ("can an agent actually build this?"). "Agent role clarity" is graded.
- **7/21 = Assignment 1 = a rough first draft** → the **Pitch doc is the 7/21 priority; don't over-polish.**
  Assignment 2 iterates it with feedback (agent stress-test + peer + self). Detail lives in the Build doc + A2.
- **Cut-list discipline** — validates our existing Van Buren guardrail + the §12 parking ledger.

**From Roc's `GATE-2-review.md`:**
- **C1 — LOCKED:** knowledge travels across scenes/years **+ a soft in-world reminder** so it never reads arbitrary.
- **C3 — ratified with one carve-out:** no co-op, no dexterity/timing, no *simulated* world systems —
  **but authored time-of-day scene states ARE allowed** (states, not a sim); rest of the skip-list agreed.
- **NPC personality variance:** tone is good, but **don't homogenize** — leave room for distinct
  personalities to emerge during writing (voice/H2 lens).
- **"Going big" (D1):** a **permitted swell at narrative/reward payoffs** + **sprinkled small wonder/beauty
  moments**; can be **large scale OR intimate zoom** (scene composition either way). Poles (OW / Ghibli /
  Frieren) left **open to experiment** — do not lock one.
- **Tournament/combat mining — KILLED.** Don't extract it.
- **Creative + remaining-spec holes (B3/B4):** walk through **one-by-one at GDD-fill time**; Roc fills as he
  goes ("probe me"). Not resolved in this pass.
- **Map shape (C2):** open — discuss modular vs. one-big-map at spec time (Phase 3), not here.

---

## 3. Method — divergent lenses → compare → synthesize

Reserve multi-agent **divergence** for the artifacts where competing designs genuinely help; use a single
strong-model **refresh** where the work is integration, not a design fork.

| Artifact | Treatment | Why |
|---|---|---|
| **gdd-structure-model** (→ two-doc model) | **Multi-lens** (3) | The two-doc split + what-lives-where is the key open design fork |
| **dev-crew / agent architecture** (H10/H11) | **Multi-lens** (3) | Thinnest required section; external archetypes now available; benefits from compare |
| **going-big / art-direction brief** | **Multi-lens** (3) | Roc wants the poles *experimented*, so divergent outputs ARE the deliverable |
| **voice-style-guide** | **Single refresh** | Integration of new notes + two added sections; no design fork |
| **pnc-grammar** | **Single refresh** | Integration of deduction-loop + time-of-day; no design fork |
| **myst-techniques** | **Unchanged** | No new Myst sources |

**Multi-lens pattern:** K agents, one distinct lens each, run in parallel → a **compare/merge pass** →
Roc gets a **side-by-side + a recommended blend**; Roc picks or remixes. All synthesis on the **strong
model** (Rule #3). Ground every claim in the KB / transcript / repos — **no invention**.

---

## 4. The rounds

### Round A — Two-doc Structure Model  *(rewrite `synthesis/gdd-structure-model.md`)*
The highest-leverage change; it reframes everything downstream, so it runs first and alone.
- **Inputs:** current `gdd-structure-model.md`, the class transcript reframe (§2), the GDD-template
  descriptions (`game-project-resources.md`), the myst-proposal doc-structure notes, `GATE-2-review.md`.
- **3 lenses (parallel):**
  - **L1 minimalist-pitch** — Josh's cut-to-bone; the "what does the player do?" litmus; the 1–3 pp Pitch doc.
  - **L2 buildable / agent-handoff** — the expansive Build doc; JSON-altitude specs; what the dev-crew needs.
  - **L3 narrative-first** — our narrative-heavy game; how narrative weaves into the Build doc *without*
    bloating the Pitch.
- **Compare → deliverable:** the **two-doc model** — Pitch skeleton + Build skeleton + Parking-Lot;
  what-lives-where; altitude per section per doc; the cut-list discipline.
- **GATE A:** Roc approves the two-doc split + section map **before** Rounds B/C build on it.

### Round B — Content syntheses  *(parallel, on the approved structure)*
- **`voice-style-guide.md` — refresh** (single synthesizer): integrate new H9 env-storytelling/subtext/
  emotion notes; **ADD an NPC-variance section** (how NPCs differ *within* the register — uses the new
  NPC-agency notes; answers Roc's homogenization worry); **ADD a visual lens** (color/restraint/Ghibli from
  the art batch).
- **`pnc-grammar.md` — refresh** (single synthesizer): fold the **deduction-loop grammar** (Burden of Proof,
  Heaven's Vault, Outer Wilds) in *alongside* the 5 Myst archetypes; add **time-of-day-as-authored-state**
  (C3 carve-out); reflect the C1 lock.
- **`going-big-brief.md` — NEW** (3 lenses → present experiments): **L1 OW-revelation · L2 Ghibli-awe ·
  L3 Frieren-restraint.** Deliverable presents the experiments and *where each applies* (payoff swell vs.
  sprinkled wonder; large vs. intimate composition) — **not** a locked pole (per D1b).
- **GATE B:** Roc reviews.

### Round C — Dev-crew / Agent Architecture (H10/H11)  *(NEW `synthesis/dev-crew-architecture.md`)*
- **Step 0 — recon** (do first, present before deep extraction): read all three repos —
  `bullish0x/GameStudio/.agents/agents`, `guangyuspace/codex-gamestudio-skill/SKILL.md`,
  `colonel1223/GameStudio` — capture each agent's *name · role · I/O · when-called · orchestration shape*,
  relevance-filtered. **Then decide** (Roc's call #2, deferred) whether the archetypes become a **committed
  reference note set** or an ephemeral compare input.
- **3 lenses:**
  - **L1 KB-grounded** — `ai-workflow` notes + the H10/H11 seeds (narrative-designer role, modular-characters,
    narrative-Lego tiering, worker-decomposition).
  - **L2 external-archetype** — the three repos, filtered (see §5).
  - **L3 class-spec** — ~5 agents + orchestrator; JSON I/O; one-agent-per-feature; realistic-capability.
- **Compare → deliverable:** a recommended **~5-agent dev-crew roster + orchestrator**, each with an I/O
  sketch, cross-checked against the **two-mode architecture** (canned + live) and the **audio-first pipeline**.
- **GATE C:** Roc reviews the roster.

### Then — GATE 2 (the real gate)
Review the full resynthesis + gap map on the reframed structure → **lock which holes are in-scope for the
7/21 Pitch draft** → Phase 3 (hole-filling; Roc walks the B-holes one-by-one).

---

## 5. Guardrails

**Round C archetype filters (so we adopt the grammar, not the headcount):**
- **Relevance filter** — general studio crews skew toward code / 3D / shader / netcode / asset agents;
  for a cozy, narrative, P&C, audio-first, 2D-ish deduction game most of that is noise. Keep the
  **orchestration/manager pattern** + **narrative / content / QA / consistency** archetypes; drop the rest.
  (Same discipline that caught the P&C video tutorials under-delivering.)
- **Two contexts, kept distinct** — the repos model our **dev-pipeline crew (H11)**, *not* the **in-game
  runtime agents (H10 + the emergent-partner "wow")**. Point the mining at H11 only.
- **~5-agent cap + SRP** — repos may define 20–30 agents; adopt the *shape*, distill to the minimal crew
  that earns its place in a 6-week slice.
- **Watch for the consistency/verification-agent pattern** (canon-check across a knowledge base, flag for a
  human) — surfaced in the class Q&A; a natural fit for our two-mode setup.

**General:**
- Ground everything in the 157-note KB + the transcript + the repos. No invention.
- Strong model for all synthesis. Copyright: repos are public — study patterns, cite, write original defs.
- Any new/rewritten workflow doc (incl. this one) passes **`reader-test`** with zero "will break the build"
  gaps before it's used.

---

## 6. Sequence & gates (summary)

```
Round A  Structure (3 lenses → compare)        → GATE A: Roc approves two-doc split
Round B  Voice · PnC · Going-big (parallel)    → GATE B: Roc reviews
Round C  Dev-crew (recon → 3 lenses → compare) → GATE C: Roc reviews roster
                                                → GATE 2: lock 7/21 scope → Phase 3
```

---

## 7. Pre-flight — confirm before Round A runs

1. **Execution mechanics:** run the compare-heavy rounds as a **Workflow** (deterministic fan-out + compare;
   I author the script) or as **manual parallel Agents + my comparison**? *(Rec: Workflow.)*
2. **Budget:** 3 multi-lens artifacts × 3 lenses + 3 compares + 2 single refreshes ≈ **~15–18 agents** across
   the rounds. OK, or trim to 2 lenses each?
3. **Repo sync:** the branch is diverged (the ingestion sessions piled on local commits). **Reconcile before
   we spawn file-writers** so we don't compound conflicts.
4. **Task backlog:** on acceptance, add Phase-2.5 rows (game-30→3x) to `game-project-tasks.md`.

---

## 8. Outputs & naming

| File | State |
|---|---|
| `knowledge-base/synthesis/gdd-structure-model.md` | **Rewritten** — two-doc model |
| `knowledge-base/synthesis/voice-style-guide.md` | Refreshed (+ NPC-variance, + visual lens) |
| `knowledge-base/synthesis/pnc-grammar.md` | Refreshed (+ deduction-loop, + time-of-day state) |
| `knowledge-base/synthesis/going-big-brief.md` | **New** |
| `knowledge-base/synthesis/dev-crew-architecture.md` | **New** |
| `knowledge-base/synthesis/myst-techniques.md` | Unchanged |
| dev-crew archetype reference note set | **TBD** — decided after Round C step-0 recon |
