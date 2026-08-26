# NPC Codex — the universal canon register

> **Who writes this file (resolved 2026-08-09 — Roc).** **Intake seeds it** at arc start from Roc's roster (`pipeline.md` step 2). **Roc's gate ratifies** every entry — nothing becomes canon without it. **The Orchestrator transcribes** the ratified entry, because it is the seat that already surfaces gates and routes their outcomes, and it writes nothing creative in doing so. **`tools/codex-lint.mjs` verifies** immediately after, so a transcription error cannot become canon. The Verifier never writes here — it flags and proposes, never rewrites. The Architect never writes here either; it authors cards, and this file indexes them.
>
> *Note: `../gdd/11-ai-agents-and-pipeline.md` still says the Architect owns the codex. That line predates this loop and needs a `gdd-sync`.*


**One codex, every arc (ruled 2026-08-09 — Roc).** This is the file ten documents promised and none built: the canonical register of who and what exists — carded souls, walk-ons, offstage people, world facts and geography, promoted props — with the locked facts each carries and the arc each originated in. Until this file existed, `guardrails.md` check 4 was reading against nothing, which is why invented offstage people passed silently. It is universal, not per-arc: the town's lore accumulates in one place, and the `origin` field records where each entry entered.

**Downstream of the World Bible (2026-08-23).** The bible ([`../gdd/00-world-bible.md`](../gdd/00-world-bible.md)) is authored *forward* — it states the world's canon (the festival, the town Hearthlight, the cosmology, the culture) before any scene needs it. This codex stays the continuity ledger *downstream*: it records the specifics scenes invent, so later scenes do not contradict them. Where a `world_fact` entry here and the bible disagree, **the bible wins** and the row is a defect to fix here. New world-level inventions still flow the usual way — Content declares, Verifier proposes, Roc ratifies — and the ratified ones come home to the bible; the codex indexes them.

**Three consumers, one contract:**
- **The Content seat** reads it before inventing (`agents/content-dialogue.md`): an existing entry that can carry a reference beats a new invention — the Juno precedent.
- **The Verifier** reads it every batch for check 4 (no worker invents or contradicts a soul) and check 12 (declared inventions square with it).
- **The human gate** lands ratified inventions here: Content declares → Verifier PROPOSEs → Roc ratifies → this file records. Nothing enters as `ratified` without Roc's ruling or a committed, gated source.

**Entry fields:** `id` · `class` (`soul` | `walk_on` | `offstage_person` | `world_fact` | `promoted_prop`) · `status` (`ratified` | `proposed`) · `origin` (the arc or source it entered from) · locked facts · the places/threads it touches. For carded souls the card file in `../cast/` is the canon authority; the codex row is the index the seats read fast — where they differ, the card wins and the row is a defect to fix here.

**Quantities are scene colour, never canon (ruled 2026-08-09 — Roc).** "Eleven jars" enters no entry and binds nothing; a later scene counting differently contradicts nothing. Only existence-level facts are canon-bearing — the shelf of jars, not their count.

**Status semantics.** A `proposed` entry binds nothing: later content may not build on it as fact, and it exists so Roc can rule on it. `ratified` facts are what check 4 flags contradictions against.

---

## Carded souls (`soul`)

Eight souls, Roc's roster. The soul's *existence and locked store* is ratified canon; several *cards* still sit at the human gate — the "card status" column tracks that separately, and a draft card's facts are still binding on generation (they are the prepared input) until Roc rules otherwise.

| id | who | card status | origin |
|---|---|---|---|
| `soul:toby` | The Giver — Baker (young, this life) | approved + final (2026-07-25) | roster / v01 festival slice |
| `soul:ilsa` | The Kinbound — Blacksmith (older) | approved + final (2026-07-25) | roster / v01 festival slice |
| `soul:mara` | The Keeper — Herbalist (middle) | draft, awaiting gate | roster / v01 festival slice |
| `soul:bex` | The Rule-Breaker — texture (middle, role unassigned) | draft, awaiting gate | roster / v01 festival slice |
| `soul:nell` | The Content Server — texture (middle, role undealt) | draft, awaiting gate | roster / v01 festival slice |
| `soul:juno` | The Found-Family Keeper — texture (older, role undealt) | draft, awaiting gate | roster / v01 festival slice |
| `soul:linnet` | Half of a Pair — texture (middle, role must be pair-inert) | draft, awaiting gate | roster / v01 festival slice |
| `soul:pip` | The Wonder-Seeker — texture (young this life, role undealt) | authored, no gate recorded | roster / v01 festival slice |

**Locked facts the seats trip over most** (full store: each card in `../cast/`):

- **`soul:toby`** — the shelf of unopened thank-you gift jars behind the counter (soul-bound, travels with `toby`); the water flask refilled and set by the door before the player wakes; refuses care with no strings (`conviction`); no new facts attributable to any other soul beyond their locked store; sanctioned long run logistics-only, barred while receiving. Threads: the eight ratified `toby-*` threads; places: bakery, square stall.
- **`soul:ilsa`** — never converted (*blood is tended*, never *blood is chosen*); the player is a witness — nothing repairs the family; second apron and tongs at the empty bench-end; counting arrivals against a number she never says; the arch centerpiece forged in her yard; **Bram** is her bound offstage fact (below); `arc_turn_bond_gate` is her sanctioned exception.
- **`soul:mara`** — never released (endpoint: the bond re-forms); the drawer of unclaimed objects, the child's whistle, the corner set for two, the unasked mending — all travel with `mara`, never the shop; the whistle is not for sale; the lost person is **her sister** (ratified 2026-08-07, unnamed; whether she can be dealt present is open); precision axis thing-versus-person.
- **`soul:bex`** — the roster's authored exception to deflect-do-not-name, scope: naming a feeling in dialogue, nothing else; his naming never does the player's work; buried his sister **Adren** (below) before the story opens. *(Corrected 2026-08-16 — this row read "brother", the pre-merge reading. `offstage:adren` below has carried the 2026-08-09 ruling correctly since it was written; this index row did not.)*
- **`soul:nell`** — keeps no score, total absence of tally; the hum binds to working hands, stops only with the work, one reserved alarm state (hands moving, hum stopped), never explained.
- **`soul:juno`** — stance is bias-tier always and she never wins the argument; performs nothing for Corin — a date she knows, not a thing she does; nothing of hers is a pickup or key item; her household (below) is role-side, re-dealt each life.
- **`soul:linnet`** — the marriage is settled permanently, no reunion, no player "helping"; fully legible to herself — asked, she names the person plainly; one habit for one person travels with `linnet` (form may re-dress); saved seat and route home past their window are the two exemplar forms; "Aldith" is a placeholder, **not** an entry here.
- **`soul:pip`** — deflects to found things, never names a feeling (Bex's licence alone); the signal is a stance, not an age; weight rides `action`/`object` slots at 1:2 or better in beats he drives.

## Walk-ons (`walk_on`)

No essence, no card, no arc, no bond — business of one scene, walk-on band in `register.md` unless the entry narrows it (`pipeline.md` step 2).

- **`walkon:marta`** — ratified · origin: v01 `toby-the-shelf` (C4, committed). Comes out for eggs and the barley loaf; found a never-ordered loaf on her step Tuesday morning, still warm; means to stop at Ilsa's for a repair; her basket carried her starter across the square all spring. Declared walk-on class in the thread doc itself — business only, no facts accrue.
- **`walkon:festival-runner`** — ratified · origin: v01 Kinbound run (2026-07-25, gated). Anonymous functionary; goes round with the festival sign-up sheet for the arch raising; reported Bram's word. Nameless by ruling.
- **`walkon:crate-boy`** — ratified · origin: v01 `toby-the-shelf` C3 (committed). Non-speaking; a boy in the doorway with an empty crate under his arm, after hours.

*Negative record:* `toby-the-shelf` C1–C3 declare **no walk-ons** — do not retro-fit any.

## Offstage people (`offstage_person`)

Mentioned, never staged. What is locked is exactly what committed content or a Roc ruling states — the unstated parts are unstated on purpose and stay that way.

- **`offstage:lane-end-household`** — ratified · origin: v01 Toby C1 evaluation batch, Roc's gate 2026-08-09. The lane-end house: six loaves, rolls for the boys, a dark loaf for the grandmother who won't eat the white; the youngest likes the crust dark. **Possible collision: this may be `offstage:nella`'s household** (committed C2 — the lane, the boys, feeding four). Same family or two? Roc's call; if same, reuse and the grandmother extends Nella's entry.
- **`offstage:bram`** — ratified (Roc, at the 2026-07-25 gate) · origin: v01 Kinbound. Ilsa's family member who did not come to the arch raising. **Name only** — relation, reason, backstory deliberately unstated. Bound to `soul:ilsa`. **Amended 2026-08-09 (Roc): Bram was to bring the special ore for the centerpiece.** That is what he did not bring, so the Blacksmith mishap "the special ore can't be sourced in town" and his no-show are **one event**. He stays name-only and offstage; the ore's absence is how he is present in a scene.
- **`offstage:nella`** — ratified · origin: v01 `toby-the-shelf` C2 (committed). A name on an order paper, never appears; has a new baby ("feeding four now" against an order for three); her boy likes the soft rolls; opens ties one-handed with the baby up; left a jar on Toby's step in spring — still on the shelf; comes in from the lane.
- **`offstage:ovin`** — ratified · origin: v01 `mara-set-for-two`. A folding pocket-knife with a twice-mended handle in Mara's drawer "was Ovin's, before." A name attached to an object, relationship unstated **permanently** — extraction of who Ovin is exceeds any brief. Never conflated with the child's whistle.
- **`offstage:adren`** — ratified (Roc, 2026-08-08; amended 2026-08-09) · origin: v01 / Bex card + Mara card. **Sister to both Bex and Mara**, buried before the story opens; the village privately knew she was dying and nobody said so. *(Amended 2026-08-09 — Roc: Adren was carded as Bex's brother and Mara's lost person was a separate unnamed sister. They are **one person**. Bex and Mara are siblings, and Adren is the sister they both buried.)* **This is the seam the two engines run off:** the same death, two responses — Mara keeps what was hers and will not decide she is not coming back; Bex says the true thing out loud because nobody said it to Adren in time. Neither knows the other's response is the same grief.
- **`offstage:hallow-house`** — ratified · origin: v01 `toby-the-shelf` C1 (committed). A household ordering twelve loaves by noon; two of them won't touch rye.
- **`offstage:smith-household`** — ratified · origin: v01 / Toby card (approved line 02) + C2. Smith is out of salt and will not ask; Toby tucks a measure in and calls it bakery weight. The Smith boy has a cough.
- ~~**`offstage:maras-sister`**~~ — **merged into `offstage:adren` 2026-08-09 (Roc).** Mara's lost person is her sister, and her sister is Adren, who is also Bex's. The old entry left her unnamed and left "can she be dealt present" open; she is named now and stays buried. Id retired, not reused.
- **`offstage:rite-elder`** — ratified · origin: v01 arc doc (`arc-festival-slice.md`). The elder who taught the rite is one of this life's "past" souls; the rite's words are half-remembered because of it.
- **`offstage:juno-household`** — **proposed** (card is draft, names await Roc's gate) · origin: v01 / Juno card. Sella (off the winter ferry, "my sister"), Wick (came for one harvest, stayed, "my boy"), Haf (old, origin never said, "my brother"), Corin (left; the one seat she does not refill). Role-side placeholders, re-dealt each life.

- **`offstage:aldith`** — ratified · origin: v01 / Roc's gate 2026-08-09. Linnet's missed match. They grew up together and were childhood sweethearts; she married someone else and **left the village**. Gone before the arc opens, and never seen. Linnet answers her name plainly when asked who the saved seat is for, and says nothing else. Promoted from placeholder — `../cast/linnet.md` had carried "Aldith" as a shape-of-answer example explicitly marked not-canon; that open item closes with this entry. Referenceable in dialogue; Linnet herself is dealt out of v01.

## Family relations (`relation`)

Bound to the pairing, not to either soul. **Ruled 2026-08-09 (Roc).** A relation is relational in the `delta_relational` sense: it is true because these two are in this life together, and the reshuffle re-deals who stands next to whom. What travels with a soul is the *shape* of its history — Bex buried a sibling nobody spoke to — not **who** that sibling also belonged to.

- **`rel:ilsa-juno`** — ratified · origin: v01 / Roc's gate 2026-08-09. **Sisters.** Both `older`. Two theories of belonging in one bloodline: Ilsa counts who came, Juno set a table for whoever turned up. **The friction is specific: Ilsa does not like Juno bringing in people who are not family.** Juno's patchwork predates the disagreement and is not about her sister — she simply does not think blood is the thing that makes it. Neither converts.
- **`rel:ilsa-pip`** — ratified · origin: v01 / Roc's gate 2026-08-09. **Not blood.** Pip is a **stand-in grandson** — treated as kin, underfoot at the forge, no relation to her. He is the crack in her own stance: the woman who holds blood above all keeps a boy who is not hers, and never counts it as the same thing. Ilsa's actual absence stays absent — `offstage:bram` does not come, and nothing here resolves him.
- **`rel:bex-mara`** — ratified · origin: v01 / Roc's gate 2026-08-09. **Siblings.** Both `middle`. They buried the same sister, `offstage:adren`, and answered it in opposite directions.

- **`prop:adrens-doll`** — ratified · origin: v01 / Roc's gate 2026-08-09. A cloth doll with a re-stitched arm, kept in Mara's drawer. **Adren's** — sister to both Mara and Bex. It is the one object Mara gives a full provenance run to, and the only time she says the name of the person the drawer is for. Ovin's objects remain in the drawer un-provenanced; this is the one that gets the run.

- **`prop:tobys-shirt`** — ratified · origin: v01 / Roc's gate 2026-08-09. A work shirt with **Toby's name stitched inside the collar**, made for him in the crowded house he grew up in — where clothes got mixed between too many children, so marking one was ordinary practical work and also the only thing in that house that said *this one is yours, distinctly*. He scorches the sleeve at the oven mouth, working, and **puts it in the rag pile** rather than ask anyone to mend it: a burned shirt at a bakery becomes cleaning rags, and reclassifying it as stock is cheaper to him than receiving. Mara takes it in — a shirt in a rag pile is unclaimed — reads the name in the collar, and mends it with a **visible patch** (ruled 2026-08-09: her mends make a thing last, they do not erase what happened to it). The name survives the mend. Engine of `toby-kept-and-returned`.

## World facts and geography (`world_fact`)

- **`world:blue-door`** — ratified · origin: v01 Toby C1 evaluation batch, Roc's gate 2026-08-09. (the batch declared it borderline; check 12's scene-locality criterion routes it to the Architect). "Left at the well, the blue door" plus a standing Thursday seed-loaf arrangement with whoever lives there. **Possible collision: committed C1 already says "blue gate past the well."** Door and gate may be the same landmark misremembered or two things ten feet apart — Roc's call before either is written toward again. **No committed landmark of this name exists** — an earlier note claiming a conflict with a committed "blue gate" was itself fabricated. This is a clean new proposal, not a reconciliation.
- **`world:festival-of-souls`** — ratified · origin: GDD / v01 arc. The Lantern Arch lights the way for souls to return one night a year; the Arch ages year over year; the Blacksmith forges its centerpiece; the Priest leads the rite that lights it. Festival night is fixed.
- **`world:arch-raising`** — ratified · origin: v01 Kinbound run. A public work-party with a sign-up sheet, short a pair of hands.
- **`world:the-square`** — ratified · origin: v01 (committed lines). The village square; fills at a predictable morning hour and for the festival; Toby's stall sits at its edge on festival day.
- **`world:the-well`** — ratified · origin: v01 (committed lines). Route landmark for directions; fresh water. *(Correction 2026-08-09: this entry previously cited a committed line "Blue gate past the well." **No such line exists** — zero occurrences of "blue" in any committed file. The quote was fabricated by the seeding pass and is struck. The well itself is real and widely referenced; only the quoted directions were invented.)*
- **`world:the-lane`** — ratified · origin: v01 `toby-the-shelf` C2/C3 (committed). A delivery district: lane cottages get their own order run; parcels shelve "lane names to the left"; a lamp at the lane end is lit for people walking home; the back lane is half the walk home.
- **`world:market-row`** — ratified · origin: v01 `mara-set-for-two`. Mara's herb stall is on Market Row; festival lantern-hanging begins there.
- **`world:tobys-bakery`** — ratified · origin: v01 (committed lines + card). Ovens, counter, window sill, pickup shelf by the door, back room, cellar, coin box, the jar shelf behind the counter (the soul-bound fact is `soul:toby`'s; the room is the world's).
- **`world:ilsas-forge`** — ratified · origin: v01 Kinbound run. Forge and yard; centerpiece in progress; slack tub, bench, bellows. ("Coal up a coin" was that week's `delta_situation` — situations are state, not standing world facts; do not read this entry as fixing a coal price.)
- **`world:maras-stall`** — ratified · origin: v01 `mara-set-for-two`. Stall bench with the drawer under it; second stool and cup kept clear at the stall's end; the swept patch of paving beside it. Role goal: the festival tonic against the first frost.
- **`world:drum-band`** — ratified · origin: v01 `toby-the-shelf` C4 (committed). Plays into the festival evening.
- **`world:winter-ferry`** — ratified · origin: v01 / Juno card. A ferry arrives in winter and brings people with nowhere to go.
- **`world:the-forest`** — ratified · origin: v01 arc doc. Sourcing location off the village screen; the Blacksmith's special ore unlocks a forest screen.
- **`world:role-pool`** — ratified · origin: GDD `07-cast.md`. Mage, Blacksmith, Baker, Postman, Herbalist, Priest, Farmer; Lamplighter and Village Chief parked; 1–2 souls dealt "past" each life, lean on 2.

- **`world:centerpiece-wrong-metal`** — ratified · origin: v01 / Roc's gate 2026-08-09. **The ore never came, so the centerpiece is not finished — it is *shaped*.** Bram was bringing the special ore (`offstage:bram`); it did not arrive, and Ilsa worked the piece in replacement metal she sourced herself. It has the form and not the substance: right silhouette, wrong material, and she knows it. This is what the thread means by his part being found already done — done in the wrong metal, by her, without remark. **It opens a branch:** if the player sources the real ore, the Arch can actually be completed. If they do not, the festival is lit by a centerpiece that looks right. Neither outcome is failure — the shape-without-substance ending is authored, not a loss state.

- **`world:the-flood-year`** — ratified · origin: v01 `mara-set-for-two` C2 Lines pass, declared under check 12, Roc's gate 2026-08-10. A flood in the village's past, far enough back that a child's toy carried through it in a coat pocket and the dye at its feet never came back. Referenced in Mara's provenance run for [`prop:adrens-doll`](#promoted-props-promoted_prop) as a dated marker on the object's history, never as an event the scene depicts. **It is a date, not a disaster** — nothing in v01 stages it, mourns it, or names who was lost in it, and a line treating it as trauma has taken a fact about how a thing survived and made it about people.

## Promoted props (`promoted_prop`)

Props a Content batch invented that Roc ratified into standing canon — furniture that graduated. **Six ratified 2026-08-09** — the first promotions, all from the Toby C1 evaluation batch. A prop that never needs to outlive its scene never needs an entry here; it lives in the examinables table (check 11) and nothing more.

- **`prop:counter-cup`** — ratified · origin: v01 Toby C1 evaluation batch, Roc's gate 2026-08-09. The cup of tea already poured at the counter's end.
- **`prop:window-stool`** — ratified · origin: v01 Toby C1 evaluation batch, Roc's gate 2026-08-09. The stool by the window nobody sits on mornings.
- **`prop:cloth-hook`** — ratified · origin: v01 Toby C1 evaluation batch, Roc's gate 2026-08-09. The cloth on its hook by the ovens, plus the stack under the bench.
- **`prop:water-jug`** — ratified · origin: v01 Toby C1 evaluation batch, Roc's gate 2026-08-09. The water jug at the counter's end. (C2's committed "jug behind you is fresh from the well" may already carry this — reuse candidate.)
- **`prop:seed-roll-butter`** — ratified · origin: v01 Toby C1 evaluation batch, Roc's gate 2026-08-09. The warm seed roll and butter dish. Consumable scene business; may not merit an entry at all.
- **`prop:sourdough-starter`** — ratified · origin: v01 Toby C1 evaluation batch, Roc's gate 2026-08-09. Toby's starter, extrapolated from the card's "Pass me the starter" exemplar; arguably already card-implied — ruling would just make it explicit.

---

## Proposed — awaiting Roc's ruling

**Empty.** The eight entries from the 2026-08-08 Toby C1 evaluation batch were ratified on 2026-08-09 and moved into their class sections above. New inventions land here from the Verifier's PROPOSE disposition and stay until Roc rules.

## Extending this file

The seeding pass (2026-08-09) covered: the eight cards in `../cast/`, the committed `toby-the-shelf` thread + C1–C4 lines, `mara-set-for-two`, the arc doc, GDD `07-cast.md`, and the two gated pipeline runs (2026-07-25 Kinbound and Giver). **It may be incomplete** — content committed after that date, or corners of the run logs, may hold established names this file missed. If committed content references a person, place, or standing fact with no entry here, that is a seeding gap, not an invention: add it as `ratified` with its source cited, and note the addition's date. Everything else enters through the loop — Content declares, Verifier PROPOSEs, Roc ratifies, an entry lands here with `origin` set to the arc that produced it.
