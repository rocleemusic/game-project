# Scope Parking Lot — game-project

Ideas cut for scope. Nothing here is dead — it's shelved. Each entry records what it was, why it went, and the trigger that would bring it back. Add to the top.

**Format:** Idea · What it was · Cut from · Why parked · Revisit if

---

## Player-authored backstory (D&D-style)
- **What it was:** a player-supplied backstory/background — D&D-style, the player hands the "DM" (pipeline) their own character history — feeding a proposed player arc the way a soul's `backstory_guideline` feeds its essence.
- **Cut from:** never built as a real feature; referenced as an illustrative analogy for the NPC `backstory_guideline` field in `narrative-pipeline/pipeline.md`'s Intake step and `narrative-pipeline/templates/persona-card-schema.md`'s field table — and named as an actual (unbuilt) input in `narrative-pipeline/build-loop.md`'s authoring-loop description ("take in the player background...").
- **Why parked (2026-07-26):** the player's identity is now settled a different way — at save-slot creation the player picks a named role from the shared role pool (mage or blacksmith for the slice), locked for that life, carrying that role's existing goal as their objective. That gives the player a concrete, mechanically-grounded identity without needing a free-text authored backstory.
- **Revisit if:** the design wants the player's picked-role identity to also carry personal history, and there's budget for a lightweight prompt/template filled in at role-pick time.

---

## Lamplighter & Village Chief (future role-pool candidates)

> **Village Chief was un-parked and re-parked on 2026-08-09** — briefly added to seat Linnet, returned here the same day when she was dealt out of the v01 arc. Both stay parked.
- **What it was:** two role names considered for the current pool's 6th non-mage slot alongside Farmer. **Lamplighter** — tends every lantern along the procession path, lighting the way to the Arch before it's lit itself. **Village Chief** — oversees that the town's other festival preparations come together, and gives the closing word when the Arch is lit.
- **Cut from:** `gdd/07-cast.md`'s role pool — Farmer was chosen instead for the current build; the pool (currently Mage/Blacksmith/Baker/Postman/Herbalist/Priest/Farmer) is designed to expand.
- **Why parked (2026-07-26):** both fit thematically (Lamplighter ties directly to the Lantern Arch hook; Village Chief gives the town a secular counterpart to Priest's ceremonial role) but the pool is being kept tight for now; adding either needs a matching goal + mishap pool, same as any new role.
- **Revisit if:** the role pool expands — these are the natural next additions.

---

## Community / diffuse / solitary-release endings taxonomy
- **What it was:** the deepest bond resolves as one of several named ending shapes — community, diffuse, or solitary/release — an explicit enumerated taxonomy for how a soul's arc concludes, cited in `narrative-pipeline/steering-layer.md` as GDD canon.
- **Cut from:** never actually made it into a numbered GDD section (only `resources/_archive/phase-3-decisions_draft.md`); `steering-layer.md`'s citation of it as "per Build GDD §8.3" was itself stale.
- **Why parked (2026-07-26):** superseded by v5's festival-outcome spectrum (quiet / warm / grand / souls-of-the-world — see [`gdd/03-core-loop.md`](../gdd/03-core-loop.md)), which is a different axis — contribution-tier, not bond-ending. Roc's call: drop the citation, keep the idea rather than delete it.
- **Revisit if:** the design wants a second, ending-shaped axis distinct from festival tier — i.e. not just how grand the festival was, but what shape the deepest bond's resolution takes.

---

## Mana floors / spell cost-tiers (hard gating)
- **Confirmed still parked — Roc, 2026-07-29** (the Task-2 "cuts stay cut" check).
- **What it was:** archetypes carry different mana; some spells have a high mana floor a low-mana caster cannot meet — casting gated on a mana resource, not only on knowledge.
- **Cut from:** §4 Magic — softened so mana shapes cast *quality* only; in the slice no spell gates on mana.
- **Why parked:** a mana floor on a traversal/unlock spell can hard-lock a player who knows the spell (review QA finding), against the **Cozy rhythm** (no dead-ends) and **Strategy over dexterity** (gates are knowledge/recall/social, not a resource) pillars.
- **Revisit if:** a post-slice build wants resource-strategy depth *and* every mana-gated path has a guaranteed non-mana alternative, so it can never dead-end.

---

## Obra Dinn recognition / deduction mechanic
- **Confirmed still parked — Roc, 2026-07-29** (the Task-2 "cuts stay cut" check; the fixed-identity ruling in `../gdd/07-cast.md` reinforces it).
- **What it was:** Recognizing a reshuffled soul by a fixed "essence-signature" (an audible leitmotif). The player deduces a returning soul's identity and gets confirmation — the notebook as a deduction engine, "in the manner of *Return of the Obra Dinn*."
- **Cut from:** §3 "A new beginning" (the Obra Dinn note-taking line); §9.1 acceptance table (the **Recognition** row); "souls you recognized" dropped as a festival success-function input in §3.1.
- **Why parked:** Net-new deduction engine plus an audio-recognition system that was graded in acceptance but never designed in the mechanics. It was the #1 BLOCKING finding in the v5 review board — the hook was promised (named outright) but not built. Too much scope for the slice.
- **Revisit if:** the reshuffle is committed to as a real gameplay puzzle (not thematic-only) **and** there's budget for a player-submitted confirmation loop (player names the soul → game locks it in), plus a defined, observable essence-signature to deduce on.

---

## Decision — reshuffle scope: **Path A (thematic-only)** ✔

With the deduction mechanic parked, the reshuffle lost its gameplay reason and is now justified thematically only (reincarnation / *Frieren* melancholy). **Chosen: Path A** — keep the shuffle as an emotional/novelty device, not a permutation puzzle engine. Bank the scope savings: gut most of the two-arrangement permutation authoring and the role × arrangement × bond × warmth variant matrix (the big unbudgeted content cost).

*(Path B — keeping the full permutation engine — would have needed a fresh gameplay justification now that person-deduction is gone. Not taken.)*

**Follow-up ✔ done:** the reshuffle language was rewritten to match Path A. Prose (§1, §3, §6.2, §9.2) now reads as thematic reincarnation — "roles re-deal, essence stays fixed" — with the permutation-engine framing ("two hand-authored arrangements," "engine repermutes automatically") removed. The concrete count lives only in the §9.1 acceptance table, where the Reshuffle target is now "the full cast re-deals into a second hand-authored arrangement" (hand-authored, not an auto-engine).

### Keep Path A add-back-ready (don't strand the future)

Path A is a lighter build on the same bones, **not** a one-way door — *if* one seam is preserved. The deduction game and the full permutation engine both live on the split between a soul's **essence** (fixed core — never changes) and its **role** (what they do in town — the thing the shuffle swaps). This is the same essence/role split the [`narrative-pipeline/`](../narrative-pipeline/CONTEXT.md) already leans on.

- **Keep now (cheap, structural — this is the insurance):**
  - The essence/role split in the soul data model, even with only one arrangement authored.
  - Bonds persisting across runs (already in the design).
  - Souls kept **distinctly recognizable** — a voice, a verbal tic, a visual motif. Wanted anyway for charm; doubles as the raw material a future deduction game would let players deduce *on*.
- **Safe to defer (additive later, not rework):** the second arrangement's content + variant matrix; the deduction confirmation loop (name-the-soul → lock it in); the audio essence-signature.
- **The trap to avoid:** do **not** flatten the model by welding essence to role (a soul just *is* the baker, permanently). That throws away the seam and turns any future add-back into a rewrite of the soul model, save-state, and every line that assumed a fixed identity.
