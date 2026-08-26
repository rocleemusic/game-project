# Generate the Kinbound (Ilsa) — session prompt

Paste everything below the line into a **fresh session**. It is self-contained. Bring back the **Handback block** at the end.

**Two open inputs are marked ▶ Roc inside.** Both need an answer before generation starts; proposals are supplied so it is one decision each, not a blank page.

---

## The task

Generate **Ilsa, the Kinbound** — the second deep soul — through the game-project narrative pipeline. This is stage 2 (NPCs) of the content-staging model.

Project root: `P:\GitHub\RL_MAP\RL_MAP\ProjectOS\game-project`

Read `CLAUDE.md` at the repo root first, then these, and nothing else unless the run requires it:

- `narrative-pipeline/pipeline.md` — the procedure
- `narrative-pipeline/agents/README.md` — the crew, and the call-down/signal-up rules
- `narrative-pipeline/agents/narrative-architect.md`, `content-dialogue.md`, `consistency-verifier.md` — binding role prompts
- `narrative-pipeline/arc-festival-slice.md` — the ratified arc doc. **Read the Kinbound amendment and the family-pressure pool carefully; both are new.**
- `narrative-pipeline/register.md` · `narrative-pipeline/guardrails.md` — the voice contract and the 8 invariants
- `narrative-pipeline/templates/persona-card-schema.md`, `echo-template-schema.md`
- `pipeline-runs/2026-07-25-giver/giver-persona-card.md` — **the first generated soul. Required reading, for the reason in "The real test" below.**
- `pipeline-runs/2026-07-25-giver/RESULTS.md` — what the proof run established

**This is the second soul, not the first.** The Giver (Toby) was generated on 2026-07-25 and produced ten specification changes, all now in force. Do not re-derive them.

## The real test — read this before generating

Toby's run compared a *generated* card against a *hand-authored* example, which could not answer the question that matters. **This run can.** Two generated souls side by side is the actual homogenisation test:

> Do Toby and Ilsa read as two distinct souls, or as one archetype in different hats?

So: **read Toby's card, and then deliberately do not echo it.** Match its *density* of concrete detail — that is the bar — but nothing about its shape, its axis phrasing, or its sentence rhythm. If Ilsa's `trait_axes` read like Toby's with different nouns, that is the failure this run exists to detect, and it should be reported rather than smoothed over.

Report your own read on this in the handback, honestly, including if the answer is uncomfortable.

## The config (settled by the proof run — do not re-litigate)

| Slot | Model | Note |
|---|---|---|
| **Narrative Architect** | **Opus 5** | Won on trait orthogonality. Cap `essence_descriptor`, `voice_register`, `notice_and_want` at ~60 words each — it runs verbose without the cap. |
| **Content / Dialogue** | **Fable 5** | Won the blind read 6-of-6. A prose-tuned model holds the flat register better, because cadence is the hard part, not restraint. |
| **Consistency Verifier** | **Sonnet 5** | Unchanged. |

Session effort `high`. **Inline every worker's material into its prompt — do not hand it a list of files to read.** That cut billed volume 6.9× on the last run and is now standard.

## The soul seed (locked unless marked ▶ Roc)

```
npc_id: ilsa
name: Ilsa
gender: female (fixed across lives — name and gender do not re-deal)
age_band: older (60s+)
suit_tag: ▶ Roc — not yet assigned. Toby holds `giving`.
essence hint (GDD v5 §6.3): Belonging is given — blood, family above all.
  Genuine warmth at the family table.
conviction: Family above all — loyal to blood, and slow to accept that loyalty
  runs both ways.
recognition hook: Always gathers people to a table.
arc (arc doc, amended 2026-07-25): blood is given -> blood is tended.
```

### The arc is a different shape from Toby's — this is the crux

| | The Giver (Toby) | The Kinbound (Ilsa) |
|---|---|---|
| **Movement** | The belief **flips**: can't receive → can | The belief **qualifies**: given → tended. The conviction survives; only its automatic-ness dies |
| **Pressure comes from** | The **dealt role** — a feast one pair of hands can't finish | **Other people's behavior** — family who don't show up. Has its own pool in the arc doc |
| **Endpoint guard** | — | **Must never land on chosen-family.** That is Juno's stance (the Found-Family Keeper) and the game's own thesis. If Ilsa converts to it, two of eight souls collapse into one and the village stops arguing |

She stays blood-first. What changes is the discovery that a bond you were handed does not hold itself up — someone who shares your blood and never shows up has less of you than they think. **That lands as a wound, not a conversion.** No betrayal set-pieces: the pressure is accumulated small absence, because a belief that *qualifies* would simply break under one dramatic wound.

### ▶ Roc — decision 1: `backstory_guideline`

**Required input; the Architect may not invent one.** Toby's was *"Grew up in a large family where no one ever had enough attention to go around, but learned that being useful and taking care of other people's needs got him praised and noticed."*

Proposed for Ilsa, to accept, edit, or replace:

> Grew up in a house where the door was never closed to family and never opened to anyone else. Belonging was never in question and never had to be earned — which is why it never occurred to her that it might need keeping up.

That makes *given* historical rather than a personality tic, and makes *tended* the exact thing her history never taught her.

### ▶ Roc — decision 2: `voice_register` spread and its invariant

The proof run's hardest lesson: **when you hand down an axis that varies, state what does not vary along it.** Passing a spread without its invariant cost two rounds on Toby.

Proposed for Ilsa, to accept or replace:

- **The spread — certainty.** She states arrangements as settled rather than proposing them. Not commands; assumptions. *"You'll sit here."* Nobody is invited to her table because nobody needed inviting.
- **The invariant — certainty is never coldness, and never instruction.** Her warmth is constant and its channel is **inclusion**: she assumes you into the group rather than welcoming you into it. A line where her certainty reads as bossy, brusque, or as issuing orders is a defect, however well it satisfies "settled."
- **The flat end is a pause, not a chill.** When a given bond visibly fails to hold, she has no vocabulary for it — she does not get cold, she goes briefly wordless. That absence of language *is* the arc showing.

Held distinct from **Juno** (Found-Family Keeper, also `older`, also gathers people): Juno chose everyone at her table; Ilsa was born to hers. Same warmth on the surface, opposite engine underneath. **A line Ilsa could speak that Juno could speak unchanged is a Verifier flag** — this is the same distinctness test Toby carried against Nell, and it caught two defects last run.

### Role and scene ▶ Roc — proposed

- **`role_tag`: Blacksmith.** The arc doc gives the Blacksmith the Lantern Arch centerpiece as a festival goal. Chosen deliberately *because it does not generate her arc* — her pressure is family-side, so the role should stay out of the way. It also proves the pipeline handles a soul whose arc engine is not the role, which Toby's run never tested.
- **Scene**: draw from the arc doc's **family-pressure pool**. The strongest opener is *someone she counts as family doesn't turn up for a festival task they promised*, with the Blacksmith's centerpiece work as the plot-inert business the seed hides inside.
- **Tone**: one from the enum, fixed for the scene. **max_words 40.**

## The ten rules now in force

All were earned by the last run. They are live in the specs; this run is the first real test of whether they hold.

1. **Warmth is invariant** across a register spread — a "correctly flat" line that reads brusque is a defect (`guardrails.md` check 6).
2. **Seed slot typing** — a seed that is an act the soul performs and never mentions **cannot** be a dialogue slot; it must be `action` scene business.
3. **Revision cap: two per item**, any worker, any flag type, and it **does not reset at a human gate**.
4. **Every revision brief restates the full constraint set**, never only the defect, plus a self-check against it. Four times out of four, a single-axis brief made the Content Agent silently spend a different constraint.
5. **Specify the invariant** whenever you hand down a varying axis.
6. **Hard ceiling of two facts per scene** — one world, one personal. The Architect may not raise it; a request to exceed surfaces to Roc.
7. **Player choice is not expressible** — no branching unit exists in the schema. If this scene wants one, stop and report; do not invent a shape.
8. **Brief for concreteness, not shape** — see "The real test" above.
9. **`slot_type`** is `dialogue` \| `action` \| `object`; `action` renders `[action]` in review and must make its actor unambiguous.
10. **`age_band` is role-side** — re-dealt each life; nothing on the essence side may depend on it.

**Sanctioned exception for this soul:** the Kinbound's arc turn lands at a **bond level** rather than on a named deduction, which breaks the echo rule that payoffs fire on deductions and never on accumulation. This is deliberate and recorded in the arc doc — mark it in `authored_exceptions` so the Verifier reads it as sanctioned rather than flagging it every pass.

## How to run it

You are the **Orchestrator**: sequence, prepare each input, route flags, generate nothing yourself.

**Sequence:** Narrative Architect → Content → Consistency Verifier → *(QA light)* → **Roc's gate.**

- Workers never call each other. Flags route **up** to you and back down.
- **The human gate is real.** Stop and put output in front of Roc; do not self-approve.
- Narrate each hand-off briefly.

## What to capture

Write into `pipeline-runs/2026-07-XX-kinbound/`:

- **`ilsa-persona-card.md`** — the approved card + echo(s). Closes the last §6.3 stub.
- **`run-log.md`** — the call-down/signal-up trail.

**Tokens — three measures, never mixed:** output (what the agent generated) · footprint (final context size, what the panel shows) · billed volume (per-call usage summed; every turn re-bills the cached prefix). Reference from the Giver run: **~51K footprint for the Architect, ~107K per soul-appearance** for Content + Verifier.

---

## Handback block — paste this back for synthesis

```
KINBOUND HANDBACK

1. CONFIG RUN — models/effort per slot; was inlining applied.
2. THE APPROVED CARD — final persona_card + echo_template(s) as gated.
3. THE LINES — final content lines with slot_type and speaker_intent.
4. VERIFIER — flag count, each flag_type + reason, and the resolution.
5. REVISIONS — how many per worker; did the two-per-item cap bind.
6. TOKENS — per agent: output / footprint / billed. Compare against the
   Giver run's ~51K Architect and ~107K per appearance.
7. ROC'S GATE — approved, changed, rejected, and why.
8. THE HOMOGENISATION TEST — the answer this run exists for. Do Toby and
   Ilsa read as two souls or one archetype? Compare trait_axes, voice, and
   sentence rhythm directly. Report honestly if they collapse.
9. DID THE TEN RULES HOLD — for each: did it fire, did it help, did it get
   in the way. Especially warmth invariance, the revision cap, and
   full-constraint briefing.
10. OPEN — anything unresolved, and any spec change this run earned.
```
