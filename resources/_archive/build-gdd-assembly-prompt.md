# Build GDD Assembly — paste-ready workflow prompt (game-26)

**Purpose:** assemble the full **Build GDD** (the expansive dev-handoff doc) from the settled Phase-3 decisions, via a
multi-agent workflow. **Run in a FRESH session** — this is a ~200–400k-token build, too big for a context already in use.
Paste the block below. (This is the game-project analog of `pitch-reconciliation-prompt.md`.)

---

use a workflow. go to projectos/game-project. Read CLAUDE.md, then the game-project routing/context. Assemble the full
**Build GDD** (game-26) — the 12-section spine at **T2→T3**, ~10–18 pp — from the settled Phase-3 decisions. This is a large
multi-agent build; fan out by section per the assembly order below.

**The blueprint:** `knowledge-base/synthesis/gdd-structure-model.md` — the three-doc model. §4 is the Build section-map
(which section houses which holes, at what tier) · §5 the cross-doc what-lives-where map · §7 the **Van Buren over-spec
guardrail** · §8 the **assembly order (Wave A → B → C)**. FOLLOW THIS.

**Source of truth for decisions:** `resources/phase-3-decisions_draft.md` (all 18 holes; **where it conflicts with the KB,
Phase-3 wins**). Plus, per section:
- `resources/level-layout_draft.md` — the slice level layout (feeds **§4 / §6a** mechanical fill)
- `resources/concept-dig-notes.md` — the locked concept (Sessions 1–9)
- `knowledge-base/synthesis/` — **dev-crew-architecture** (§5; note its "Refined by Phase 3" banner) · **voice-style-guide**
  (§6 voice register) · **pnc-grammar** (§4/§6a interaction grammar) · **belonging-brief** + **belonging-across-lifetimes**
  (§6 theme) · **going-big-brief** (§7) · **myst-techniques** (§6a)
- `resources/GDD-template-draft.md` — the section skeleton · `resources/ink-data-model.md` — the prototype data model (ref for §5/§6)

**Output:** the Build GDD into **`resources/build-gdd_draft.md`** (new). **Human-readable** — expand internal shorthand
(H1 / S7 / §-refs) into plain prose; **write per Roc's voice guides:** `BizDev/skills/brand-voice/roc/voice-rules.md` +
`DND_Obojima/prep/references/prep-text-voice-guide.md` (read these first).

**Workflow shape (per §8):**
- **Wave A** (cheap & decided): §1 Elevator · §2 Pillars + Non-Goals · §3 Inspirations · §11 Milestones · §4 Core Loop · §6 World & Progression.
- **Wave B** (decided shape, needs authoring): §8 Audio-First Pipeline · §9 Project Conventions · §10 Platform/Engine/Scope · §6a Slice World.
- **Wave C** (frame + fill): §5 Agentic AI (dev-crew roster + JSON I/O) · §7 Art & Audio · §12 Unresolved ledger.
- Then a **coherence pass** over the assembled doc (terminology, cross-refs, altitude).

**LOCKED — do NOT relitigate (from `phase-3-decisions` + the 2026-07-18/19 session):**
- **Terminology: bond level** — *not* "partner"; the deepest bond is an emergent possibility, never a prescribed goal/winning worldview.
- **Audio (H15): department-agnostic Unreal GameplayTags + a tag→asset library + Wwise** (NOT the old
  `<Entity>_<AnimVerb>_<State>` string / MetaSounds / mirrored-tree). One tag = a game-wide event key resolved per department (audio/text/art).
- **Live mode (H10): player-BYOK; the pipeline runs between runs (boot/run-end), never during a run;** canned mode = **0 model
  calls**. Content is **human-authored with agent assistance** (Roc reviews/approves every line; agents accelerate, don't decide).
- **Spells (H6): physical outcomes only — never mood/behavior;** the receiver's *nature* decides (incl. **no effect**). Starter =
  `ignite` (sticks); + `scratch` (wool), `breath` (grass+dirt).
- **Recognition (H16): Obra-Dinn dropdown-pick + batch-lock;** **Soul** (essence = the key) vs **Role** (per-life costume);
  essence-FACT vs **bond-level**-EMERGENT; notebook is a **data model** (UI deferred).
- **Design law: knowledge lives in the player's head, not a flag** — gates are *performed/solved*, never flag-blocked or
  hand-held; the game's per-run "learned-here" tracking is **narrative-only** (a reincarnation beat, not a gate).
- **Endings (H18): no hard-lose** (soft terminal states; a run always leaves "with something"); slice ships **1–2 endings**.
- **3D (H17) · Wwise · UE5 (inkcpp/Inkpot for the later prototype).**
- **Template grafts (2026-07-19):** §4 **win/loss = soft terminal states** + **experience-forward, value-backed** writing rule
  · §10 **token-budget block** (skeleton; a **named open question in draft — real numbers at final**) · §11 **"Verified by" column**.

**PARKED — do NOT resolve:** the **letting-go ending** (release vs. hold the bond) · the **going-big lead pole** (which register leads).

**GUARDRAILS:**
- **Van Buren (§7):** do NOT over-specify — no numbers you haven't prototyped; every such number is a **§12 open question**, not a guess. Depth is per-tier and earned.
- **Method-vs-content split:** ship the *method* (the pipeline/contracts/schemas); the actual *content* parks — **H9 baseline
  narrative** (slice place · the 15-sec memory vignette · the seed-payoff spine) is a **separate task (game-35), deferred** to the settled frame.
- **The ink prototype is deferred** (game-36, post-GDD) — do NOT build it here.
- **§12 ledger:** carry every still-open item (token-budget calibration, which 1–2 endings ship, letting-go ending, going-big pole, H9 content, map-shape C2, etc.).

**When done:** report the assembled Build GDD path + the §12 open ledger. Then **game-27** (submission HTML) and **game-28**
(6-agent panel on the *full* doc → game-29 revise) follow.
