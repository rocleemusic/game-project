# Ruling — NPC dialogue rework (T15)

**Ruled by Roc 2026-08-23.** Design record — build is mostly post-capstone per
[2026-08-23-roc-notes-triage-plan.md](2026-08-23-roc-notes-triage-plan.md) Group 5,
**except Assignment #8, due Tue 2026-08-25** (see §Runtime LLM below).
Pipeline territory: this amends `narrative-pipeline/` contracts and needs a
`gdd-sync` when built.

## The ruling, in one paragraph

The current dialogue is scrapped. The deep three (Toby, Ilsa, Mara) each get a
festival-goal encounter chain — three encounters where the player helps them
toward their goal by lending a hand or casting a spell. Every spell gets a story
beat that introduces it and gives clues on how to cast it. All NPCs get greetings
that deepen with bond level and festival-night lines. **Mara is the hand-written
exemplar**; the rest generate through the build-time pipeline against her as the
style anchor. The register fully loosens — warmer and wordier both. Authored
scenes play once; talking again the same day hands off to a runtime LLM.

> **Scope amended later the same day (Roc, 2026-08-23):** greetings ×3 bond
> levels for the deep three only — the texture five get 1 authored greeting
> each, with the runtime LLM generating their variants. Spell beats only for
> the 16 in-game approved spells. Festival-night scenes deep-three only.
> Stretch after the core set gates: concise essence-reveal scenes. The
> row-level tracker is [`../gdd/15-dialogue-inventory.md`](../gdd/15-dialogue-inventory.md).

## Content scope

**Deep three (Toby, Ilsa, Mara):**
- 3 encounters each, built around that soul's festival goal. Each encounter has a
  way for the player to help — a hand lent, or a spell cast.
- Greetings per bond level (T9: bond = talk count, max 5). First-meeting,
  familiar, max-bond at minimum.
- Spell-intro story beats where a spell is assigned to them.
- Festival-night lines (attendance is bond-gated per the T9 festival ruling).

**Shallow five (Linnet, Nell, Juno, Pip, Bex):**
- Greetings per bond level.
- One spell-intro story beat each where a spell is assigned.
- Festival-night lines.
- No encounter chains.

**Spell-intro beats:** every spell in the game is introduced through an NPC story
beat that also teaches the cast — clues, not a manual. Which spell belongs to
which NPC is an Architect assignment at generation time, not ruled here.

**Scrapped:** the existing scene lines on the Toby and Ilsa cards (approved
2026-07-25/08-07) are retired as shipped content. They remain on the cards as
voice evidence — the cards themselves stay canon.

## Register — full loosening

`register.md` is rewritten: warmer, wordier, the 40-word ceiling gone. NPCs may
carry longer self-descriptive lines. Then **every card's `voice_register` is
re-measured against the new register** — but each soul's voice *mechanics*
survive intact: Mara's past-tense slip, Ilsa's proposal-free declaratives, Toby's
deflection speed. Voice stays distinct, just roomier. The 2026-07-29 per-card
loosening is superseded by this, not stacked on it.

## Exemplar and generation

- ~~**Mara is the hand-written exemplar**~~ — **superseded 2026-08-25 (Roc).**
  Local-model testing against a retuned Mara card
  (`assignments/assignment-8-icm/_kobold-tests/round2-findings.md`) produced
  output Roc judged good enough to trust directly. She now generates through
  the pipeline the same as the other seven — no hand-written-first step, no
  special gate ahead of the rest. `gdd/15-dialogue-inventory.md` carries the
  current per-row generation status.
- ~~chosen because her card is canon with zero existing scene lines (clean
  slate), and her essence is festival-native: her conviction *is* keeping the
  festival. Roc writes (or gates line-by-line) her full set: 3 encounters,
  greetings, spell beat, festival lines, under the new register.~~ *(kept for
  history — this was the original reasoning, no longer the process)*
- All eight souls generate through the existing build-time pipeline
  (Steering → Generation → Verify → Purge → QA → human gate). Static ink
  content, every line gated as usual — the human gate moved to a post-generation
  polish pass for the 2026-08-25 overnight run specifically (Roc's call, to
  get content in place before the capstone), not removed from the process.

## Runtime LLM — the hybrid, and its fence

**Authored scenes play once per day. Repeat talk hands off to a runtime LLM.**
If the player keeps talking to an NPC after the day's authored content is spent,
a live model generates the reaction lines, grounded in a JSON facts ledger
(what the player did, holds, cast, said).

**The fence.** The pipeline's north star — every shipped story line is authored
and human-approved — stands. Runtime lines are therefore bounded: repeat-talk
color only. They never advance story, never grant or gate anything (no bond
count past the daily cap, no goal progress, no spell teaching), and never
contradict the ledger. The authored layer is the game; the runtime layer is the
world staying warm when you linger.

**Assignment #8 (due Tue 2026-08-25) builds the scaffolding — standalone, now.**
A virtual-DM prototype: JSON facts ledger updated by player *actions*, reactive
dialogue off ledger state, consistent across 5+ turns, README. Built in
TypeScript + Claude API (Roc: ignore the assignment's Python framing — use what
fits the eventual host, which is TypeScript). The world it roleplays is Mara's
card — real reuse, not a toy. The game hookup (the repeat-talk handoff inside
the Phaser host) stays post-capstone; the assignment ships standalone.

## Player name (T13 dependency)

The year-loop ruling gives the player an entered name usable in dialogue. The
ink gets a name variable; the register rewrite says how souls use it (sparingly —
a name spoken in this world should land like a touch, not a mail-merge). The
runtime LLM's ledger carries it too.

## Phaser wiring (build side, post-capstone)

All NPCs: halo, click-to-talk, spell-learning wiring, placed on the ground in
their screens. This is host work alongside the content — it rides the normal
ui-builder/ui-verifier loop, not the pipeline.

## Order of operations

1. **Now (pre 8-25):** Assignment #8 standalone prototype.
2. **Ruling week:** rewrite `register.md`; re-measure the eight cards.
3. **Then:** Mara exemplar set, hand-written/gated.
4. **Post-capstone:** pipeline generation for the other seven · Phaser wiring ·
   runtime repeat-talk hookup · `gdd-sync`.
