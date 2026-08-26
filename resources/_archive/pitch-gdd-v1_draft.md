# CODENAME: rebirth — Pitch GDD (draft)

> **This is the Pitch GDD** — the 1–3 page graded 7/21 turn-in (Assignment 1, a rough first draft;
> depth lives in the separate Build GDD). Its only job is the litmus: *what does the player do, what does
> success feel like, and why are AI agents central?* Structure per `knowledge-base/synthesis/gdd-structure-model.md`
> (Pitch face); content from `resources/concept-dig-notes.md` (Sessions 1–9, locked). **▶ Roc** marks a call to confirm.

---

## P1 · Elevator Pitch

A cozy roguelite **point-and-click adventure** set in a hand-painted magical world in the spirit of *Myst*, *Outer Wilds*, *Frieren*, and *Studio Ghibli* where you **explore, collect, discover**.

You arrive as a newcomer, settle into the life of a village, and slowly uncover what your time here really means.

---

## P2 · Design Pillars + Non-Goals

**Pillars** (each settles an argument in a phrase):
non-violent core · strategy over dexterity · discovery is the reward · cozy rhythm ·
pull, not push (the world is the quest-giver) · trust the player · agentic-AI wow · callback legibility.

**Non-Goals** (what this deliberately is not): no co-op · no dexterity/timing inputs · no simulated
world systems (authored time-of-day scene states are fine — states, not a sim) · no live-service loops ·
no forced mystery.

---

## P3 · Player Role + World Hook

**The Theme** The narrative explores the question: *what does belonging mean —
and does connection outlive a lifetime?*

You're a village mage who has just moved to a new village.  You settle in, forage, make folk magic, and get to know your
neighbors. Your stated goal is to *"collect all the magic."* On the surface this is a cozy life-sim
in a magical town. You learn most magic by knowing your
neighbors, so *collecting* quietly becomes *connecting*.

**The world.** A warm, hand-painted magical countryside — villages, forests, farms, and a festival that is the highlight of each year that every villager contributes to help make a success. By getting to know your neighbors you help contribute to the festival's outcome in the one week leading up to the festival. A **life** spans 3 festival-weeks — the same week in 3 consecutive years. Each new life reshuffles the NPCs: they keep their personalities but not their relationships. For example, the "chef" in one life might be the "postman" in the next, a brother might become a friend. And each NPC's relationship to you deepens with how much time you've spent together across lives.

---

## P4 · Core Loop

**What you do, moment to moment — four interaction families:**
**Collect** (items, components, spells, mementos, and *sounds* — which travel free, like knowledge) ·
**Make** (components + a learned recipe → a spell, a dish, a gift) · **Show/Ask** (present a thing, a
sound, or a topic to a neighbor and read the reaction) · **Use** (apply anything you hold to a target and the *receiver* decides the outcome, so the same spell lands differently on a chicken, a door, a person).

**The loop, three tiers:**

- **A day** — choose *one* location (town / forest / farm) explore using the actions above. You can pick up and examine as many items as you want at a location, but upon leaving a location you can only take what fits in your pack. Knowledge and sounds always travel free.
- **A festival-week run** — the week builds to the town's yearly **festival**. At its end the outcome depends on your decisions leading up to the festival and your choice of who to go to the festival with: someone, a group, or alone — and you **always leave with something** (more
  understanding, or a new memory). 
- **A life (the meta-loop)** — about three festival-years, then an ending and a new life. Neighbors are
  **recognizable but re-dealt into new roles** each life (the chef becomes the blacksmith, and
  half-recognizes you). **Recognizing an essence across those shuffles is the real skill** — tracked on
  per-NPC **personality cards** in your notebook — you read people the way *Obra Dinn* reads its crew,
  filling in each neighbor from what you observe. Magic is knowledge, so your recipes survive every reset.

**How you progress — knowledge, not force.** Reaching new places or unlocking items can take a puzzle or a
chain of interactions to open, *Myst*-style; the key is almost always something you've *learned*, not an
item you carry — and most magic is *learned from people*, by watching neighbors cast and piecing it
together. And across those lives the game quietly remembers each one: the bond you build shaped by who
you spend your time with changes how they react and recognize you as everyone is re-dealt.

---

## P5 · Agentic AI — the content pipeline

Where AI is central is **production**: the shipped world, its dialogue, and its content are **human-authored with
assistance from a small crew of agents** — every generated line is reviewed and approved before it ships; the agents
accelerate, they don't decide. The crew runs **between runs (at boot or run-end), never during a run**, so
moment-to-moment play never waits on a model. A **canned mode** (the slice default) plays these pre-baked,
human-approved paths and needs **no LLM at all — the shipped game runs with no runtime model.** An optional **live
mode** (a stretch goal, only if the player brings their own API key) re-runs the pipeline between runs to generate
fresh narrative — including the deepest-bond beat — played back canned.

**The dev-crew — ~5 workers + an orchestrator** (one feature each; full I/O + the "one agent, one wow" beat live in Build GDD §5b):

- **Orchestrator** — sequences the crew, holds the shared session state, surfaces the human gate.
- **Narrative Architect** — story structure: which past-life seed pays off in which scene; NPC persona-card schema.
- **Content / Dialogue Agent** — all player-facing text, JSON per line (`speaker_id`, tone from a fixed 5, ≤40 words).
- **Consistency Verifier** — checks new content against locked canon + voice; flags only, never rewrites.
- **Audio-Tag Agent** — the audio-first USP: names/verifies the game's audio **GameplayTags** + their **tag→asset library** (Wwise events).
- **QA / Playtest Agent** — checks for **unintended dead-ends within the authored graph**, and that win/lose resolves across the slice's canned paths.

---

## P6 · Art & Audio Direction

**Look:** a hand-painted, **Ghibli-warm** fantasy countryside.
**Tone words:** *warm · hand-painted · a melancholic undercoat* — Ghibli warmth with Frieren-style restraint. **Refs:** Studio Ghibli, Frieren.
**Sound (the USP):** audio-first, built in **Wwise** (Unreal integration). **Roc is the sound designer;**
the agents assist — consistency-checking, technical implementation, and task management — and collaborate
with Roc on audio direction. Sounds are collectible objects and can grow meaning with use.
**"Going big":** a permitted swell only at narrative/reward payoffs, plus small sprinkled wonder moments —
large-scale *or* an intimate zoom (delivered in the visuals; the words stay plain). The register maps to the
moment — social payoffs stay Frieren-quiet; world & magic reveals go big (OW revelation + Ghibli awe) —
while which pole leads overall stays open to experiment.
**Engine:** Unreal; **audio via Wwise**. **Built in 3D** — depth for free (parallax, unpainted) + reused
level angles as a scope multiplier; the hand-painted warmth is held by palette + silhouette discipline.

---

## P7 · Milestones + Open Questions

**Milestones:** **7/21** — Assignment-1 GDD draft (this doc). **8/25** — playable vertical-slice capstone.

**Slice contract** (what "done" means): emotional impact delivered in 10 minutes · one run is *fun* up to the festival (the polish bar) · the full
cycle is playable end-to-end (≈3 festivals → an ending → new life) · the story pipeline holds for a few
runs (year-over-year NPC memory) · the role-reshuffle is demonstrable · 1–2 endings ship.

**Resolved** (decided, detailed in the Build GDD): concept · the 8 pillars · the four families ·
nested clocks (day / festival-week / life) · two-mode architecture · festival run-end · persistence
spectrum (knowledge/sounds free, items pack-triaged) · emergent bond · superposition rule · **slice
scope** (H14 — days/paths · 10 spells · 3 items/cat · 3 years · 3 locations) · **3D** (H17) · **audio-tag contract** (H15 — GameplayTags + tag→asset library + Wwise) · **shipped
game runs ~free** (no runtime LLM; canned mode).

**Open** (named questions, no guesses): **dev-time token budget**
(H13 — first-pass estimate; needs a calibration pass to firm) · **which 1–2 endings ship** · the
**letting-go ending** (release the bond vs. hold it — parked) · the **going-big lead pole** (which register
leads — parked). Full 18-hole ledger lives in the Build GDD §12.