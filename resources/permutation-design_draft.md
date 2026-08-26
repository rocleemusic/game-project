# Permutation Design — discussion draft (S3 of the branching-dialogue spec phase, [`../plans/2026-07-28-branching-dialogue-spec-phase.md`](../plans/2026-07-28-branching-dialogue-spec-phase.md))

**Status:** **RULED — Roc, 2026-07-29.** All three questions are decided (rulings marked inline below); the ratified rules are recorded in [`../gdd/06-world-and-progression.md`](../gdd/06-world-and-progression.md), and this doc stands as the rationale record. The screen-spec schema's pointer here is now live; Phase 2 (the resolver) is unblocked on this front.

**The frame, fixed by two locked facts.** Runtime is zero-LLM, so nothing generates at play time: every permutation is a **seeded draw from an authored pool**, resolved by host code at day-start or life-start. And the map is a metroidbrainia whose keys live in the player's head ([`level-layout_draft.md`](level-layout_draft.md), the design law — also the source for the cipher, the C1 seam, the Ahnonay landmark, and the ratified variable entry referenced below), so whatever permutes must never move what a remembered key points at.

**Determinism rule (proposed).** The day's seed is `hash(slot | life | day)` — SHA-256 of the three values joined: `slot` ∈ 1–3 (the save slot), `life` = that slot's life counter (starts at 1, +1 each new life), `day` ∈ 1–5. Reloading a day re-rolls nothing. Permutation is texture between lives and days, never a slot machine within one.

---

## Q1 — What permutes on the map? (Roc's roguelite instinct vs. the knowledge law)

The instinct: random screens hanging off a main screen, Hades-style. The tension: the layout draft's design law says knowledge-gates are performed from the player's head — a phrase learned at F4 this life must have an F4 next life. Random topology breaks the reincarnation-knowledge loop silently: the cipher, the C1 seam, and the Ahnonay landmark all depend on places that stay put.

**Shape A — permute contents, not topology (recommended).** Screens, connections, and gates never move. What varies per life and per day: which start screen you land on (already ratified — variable entry, layout draft §Opening), who stands in each NPC slot, what the item slots roll, which 2–3 errand leads are live (the lead *pool* is authored at build time by the triangulation, `../narrative-pipeline/pipeline.md` step 6; the day-start resolver only *selects* which authored leads are live — selection, never generation), and which time-states carry scenes. This is where Hades actually gets its freshness — the room *contents* rotate, the map does not. Cost: the map itself never surprises a returning player. That is arguably the point: the map is the thing they know.

**Shape B — Shape A plus a screen-pool pocket.** One authored slot off a main screen (say, off F5) draws from a small pool of fully-authored screens — this life it's the Mossy Hollow, next life the Fallen Watchtower. Permutation = which authored screen appears, never a generated one. Rules that keep it legal: no pocket screen ever holds a knowledge-key another screen needs (keys never dangle), and the pocket's contents follow the same slot/bucket model as everywhere else. Cost: each pocket screen is a full authoring unit (specs, art state, lines) that many lives never see.

**The deciding criterion is knowledge persistence, and it is binary:** if any key or cipher could land in a pocket, Shape B breaks the loop; kept key-free, Shape B is safe but pays authoring cost for texture. Recommendation: **ship the slice as Shape A; reserve Shape B as a full-game expansion slot** (same reservation pattern as the Farm).

**→ RULED (Roc, 2026-07-29): Shape A, with B reserved** — the slice permutes contents only; the screen-pool pocket is a full-game expansion slot, same reservation pattern as the Farm.

---

## Q2 — NPC availability: where and when a soul can be talked to

The draft already declares per-screen, per-time-block **capacity** (`npc_slots`, e.g. Tavern ×3 evening). The question is who fills the slots each day. Three options:

**Fixed schedules.** Every soul has an authored week — Baker at the Market every morning. Fully predictable, cheap, and dead: the reshuffle's own promise (same soul, new life) does all the work, and days stop differing.

**Pure random draw.** Any present soul may appear in any open slot. Maximum variety, but it fights the fiction (a Baker who is never at the bakery) and can strand an arc: the player may go days without meeting the soul whose thread is live.

**Weighted pool with guarantee floors (recommended).** Per soul per life, an availability pool derived from what already exists:
- **Role anchor:** the dealt `role_tag` names workplace screens and time_blocks (Baker → Market Row, mornings) — high weight. The fiction holds *most* of the time. The role→workplace map itself is a small table the Architect emits with the layout pass (one row per role in the shared pool, `../gdd/07-cast.md`), carried in `graph.json` — it does not exist yet and is that pass's deliverable.
- **Home:** each soul's home screen, evening-weighted (T5's deep-NPC slot).
- **Authored constraints:** Tavern is evening-only; the Festival Grounds fill in festival week; a soul's arc-doc notes can pin a scene.
- **Day-start seeded draw** fills each screen's declared capacity from the pools.
- **Guarantee floors, the anti-strand rules — both computable:** every deep soul (the 3 deep of the 3+5 roster, `../gdd/07-cast.md`) is placed in at least one slot somewhere every day; and a soul carrying a live arc thread is placed on at least one screen **in the location the player picked for that day** (the pick happens the prior evening on the calendar, so the resolver knows it at day-start). This is the existing pacing-layer law made concrete — *it biases, it never forces*: the floor guarantees presence, never an encounter.

Variety comes from the off-anchor draws — the Baker at the Stream one midday is exactly the "huh, they're here today?" texture Roc wants, and it needs no scheduler sim.

**→ RULED (Roc, 2026-07-29): weighted pool with guarantee floors, and the floor covers every deep soul with a live thread** — a soul whose thread is live is placed on at least one screen in the location the player picked for that day; deep souls with no live thread follow the ordinary weighted draw and may sit a day out.

**"Live thread," defined** (so the floor is computable): a thread is an arc-doc narrative line a soul is carrying (the thing `thread_move(thread_id)` advances — e.g. the Giver's receive-thread). A thread is **live** from the day its opening beat plays in this life until the day its closing beat plays; before the opening it is unstarted, after the close it is done, and in both of those states no floor applies. The resolver reads thread state from the host's day-end record of `thread_move` events.

**A late start can mean no finish — by design (Roc, 2026-07-29).** A thread the player opens late may not close before festival night. That is legal: there is no hard-lose, the festival reads the world as it stands, and an unfinished thread simply doesn't pay off this cycle. This matches the seed rule already in force — every seed scene works on its own for a player who never returns.

---

## Q3 — Item randomness: marked slots + buckets (Roc's instinct, schema'd)

Already carried into the screen spec (`../narrative-pipeline/templates/screen-spec-schema.md`): `item_slot { slot_id, region, bucket:[{item, weight}], respawn_rule, conditions }`, with `screen_id` implicit from the containing spec and denormalized into `graph.json` by the resolver. A slot is a marked spot on the screen; the bucket is what may appear there; the day-start seeded roll picks. Emptiness is encoded explicitly: an `{empty, weight}` entry in the bucket — never a null, never a weight remainder.

Proposed defaults, for ruling rather than invention later:
- **Respawn:** a picked slot stays empty until the next day-start roll. No within-day respawn — scarcity is what makes the satchel and pack-triage matter.
- **Weights are per-slot, not global** — the Stream's slot favors river stones; a rare component lives *only* in deep slots (F4's pool bed, F7's cave), so place still teaches probability.
- **Buckets ship keyed to the confirmed components** (sticks · wool · grass · dirt) plus the draft's placeholder flavor list; they refill for real when content-stages 4–6 derive items from spells. The slot layer is deliberately independent of that deferred work.
- **Key items never roll.** Echo-carriers and hard-key examinables are placed, not drawn — a slot's `conditions` field can *gate* an authored appearance (day ≥ 4), but chance never decides whether a story object exists.

**→ RULED (Roc, 2026-07-29): defaults approved as written.**

---

## The `world_aliveness` weight (the one RATIFIED section in this draft — 2026-07-29, not up for re-ruling; everything above awaits Roc)

The cross-life days-played count (`../gdd/06-world-and-progression.md`) enters this system as **one more selection weight**, the same shape as everything above. Its interface so the resolver can stub it: **three bands, `quiet · waking · alive`**, thresholds a later tuning pass sets from playtest:

- **Festival of Souls dressing:** at higher aliveness bands, the festival's rarer dressings weight up sooner — the world is more willing to show itself to someone who keeps coming back.
- **Rare manifestations:** authored entries in ordinary pools, gated on an aliveness band — a spirit glimpsed from the Grove at night, a lantern that lights itself on the Commons. They are screen contents like any other, drawn by the same resolver; there is no spirit *system*.
- **Never from choices.** The count grows from days played only. No option pick, help count, or bond state feeds it — the same guard that keeps the festival tier honest keeps the world's aliveness honest.

Open tuning knob for later, not for this ruling: the band thresholds (how many days to each band), which want playtest data before they mean anything.

---

## What the resolver does with a ruling (Phase 2 preview, for orientation)

At life-start: deal roles, build each soul's availability pool, seed the generated-variable domains (the four LIST domains of `../knowledge-base/narrative/ink-data-model.md` D2 — Keeper's loss · Giver's function · Kinbound's family situation · availability deal). At day-start: derive the day seed, fill NPC slots against capacities and floors, roll item slots, pick the live errand leads, apply aliveness weights. Export the resolved day alongside `graph.json` so the review tool can show a real day, not an abstraction. All deterministic, all replayable from the seed.
