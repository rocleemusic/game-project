# Ruling 2 — forest reachability. A decision doc, not a plan.

Read this, pick per screen, tell me. I wired nothing here — reachability touches
content, so it is yours. Written overnight 2026-08-18 while you slept.

## The headline: "6 stranded" was wrong. It's really 2.

The editor's Screen-unlocks tab flagged **6** screens (F4, F5, F6, F8, T5, T6).
That number came from the *provisional* `spellGates.ts` join, which only knows
`ignite`/`glimmer` → `G-F7-light`. The **engine** clears gates from a different,
richer file — `src/world/gates/data/gateRules.json` — and by its real rules most
of those six already clear by playing:

| Screen | Lock | Real rule (gateRules.json) | Reachable? |
|---|---|---|---|
| **T5** A Neighbor's Home | `G-T5-trust` | bond, band ≥ 1 | **Yes** — build a bond with the soul |
| **T6** The Tavern / Inn | `G-T6-evening` | time = evening | **Yes** — visit in the evening |
| **F5** Old-Growth Hollow | `G-F5-cascade` | cast `ignite`, any effect | **Yes** — cast ignite once |
| **F6** The Old Shrine | `G-F5-cascade` | cast `ignite`, any effect | **Yes** — same |
| **F4** The Still Pool | `G-F4-still` | **chain**: ignite×river_stone → temper×(its product) | **No** — pairs unauthored |
| **F8** Heart of the Wood | `G-F8-combine` | **chain**: ignite×river_stone → fetch×stone_wall → temper | **No** — pairs unauthored |

So **F5, F6, T5, T6 are not content-stranded.** The walk never reached them
because the headless walker never cast ignite or built a bond, not because they
are locked shut. That is a walker-coverage gap, not a ruling.

**The real decision is F4 and F8**, and only because their chain gates name cast
pairs no spell authors: `ignite` has receivers `stick, dry_hedge, furnace, bread,
cat, toby, ilsa` — no `river_stone`. `fetch` has no `stone_wall`. `temper` has no
product-of-ignite. So the chains can never fire.

---

## F4 — The Still Pool

**Gate `G-F4-still`.** Authored note: *"knowledge-key phrase 'still the water',
learned at F2 or the Workshop."* But `gateRules.json` implements it as an
ignite→temper chain, and the spell it was named for, `still`, was **rejected**
at the 2026-08-05 gate.

The gate's own note and its rule disagree. The note says a *phrase you learn*.
The rule says a *cast chain*. Pick one:

- **A. Make it a knowledge-phrase gate (recommended).** Change the rule to
  `{kind:"knowledge", key:"still-the-water"}`, learned at F2 or the Workshop.
  Matches the authored note exactly, needs no new casts, and gives the forest a
  non-combat "learn the words" lock — variety from what you already have.
- **B. Re-point to a single approved cast.** No approved spell stills water, so
  this means approving a spell or bending an existing one. More content.
- **C. Drop the lock**, like the Cave. F4 becomes freely enterable.

## F8 — Heart of the Wood

**Gate `G-F8-combine`.** Authored note: *"Laki combine — two fragments, neither
sufficient alone."* Item-based by intent, but the rule is a 3-step spell chain
whose pairs are unauthored.

- **A. Make it an item-combine gate (recommended).** Change the rule to require
  holding two key items (the two "fragments"). Matches the authored intent, and
  it is satisfiable by foraging — no unauthored casts. Candidates already exist:
  `key_raw_ore` (found at the Cave / Heart of the Wood) could be one fragment.
- **B. Author the chain's cast pairs.** Add `ignite×river_stone`,
  `fetch×stone_wall`, `temper×product` to those spells. Narratively odd — you do
  not set a river stone alight — and it is the most content.
- **C. Drop the lock.** F8 becomes freely enterable.

---

## Two smaller confirmations (not decisions, just flags)

- **T5 / T6 already work by design** (bond / time). No action needed. If you want
  them to *feel* gated in a first playthrough, that is a tuning call, not a fix.
- **The editor over-reported.** Its Screen-unlocks tab reads the provisional
  `spellGates.ts`, not `gateRules.json`. I am fixing it the same night so the tab
  reflects the real engine rules — cast/chain gates checked against the authored
  receiver matrix, bond/time gates never counted as stranded. After the fix the
  tab should show only F4 and F8 red.

## My recommendation in one line

**F4 → knowledge-phrase (option A). F8 → item-combine (option A).** Both match the
authored intent, both are satisfiable by playing, and neither needs a new spell.
If you would rather ship a smaller forest for the capstone, **drop both locks**
and revisit post-capstone.
