# Phaser feature probe — final report

**2026-08-13 · capstone Tue 2026-08-25 (12 days) · content freeze Fri 2026-08-21 (8 days)**

Written to be read cold. Detail lives in [FINDINGS.md](FINDINGS.md)
(recommendations) and [GAPS.md](GAPS.md) (17 defects with evidence); this is the
report over both.

---

## 1. What this was for

Four features named in the GDD had to be tried before the Unreal build spent
time on them: exploring screens, casting magic, using inventory, decorating the
home hub.

Reading the 2026-08-11 Unreal feature-complete plan against the GDD showed why
two of them were urgent:

- **Casting had no implementation plan anywhere.** The Unreal plan builds the
  shell, screens, examinables, satchel and hub — but no cast verb, no
  component-selection UI, no receiver-outcome resolver. Magic appears only as a
  read-only notebook tab.
- **Hub decoration was a one-line ink placeholder** (`SYS-HOME-LOOK`).

Meanwhile **89 authored cast outcomes** (16 approved spells × 5–7 receivers)
were sitting in `content/magic/*.json`, unplayable.

**Status agreed: design probe plus fallback insurance.** Not a third build
track, and explicitly not a port. It has never consumed review time and has
never gated Track A.

## 2. What it is

A **presentation layer over `tools/lantern`**, not a new game.

`LanternPlayer` (`tools/lantern/src/lib/play.ts`, 878 lines, under vitest)
already loads `story.json` through inkjs, binds all four `EXTERNAL`s, and owns
the satchel, arms-carry, pack-triage, day loop and move budget. The probe
imports it through a Vite alias rather than forking it — a copy would drift from
the tested original and quietly become a third track.

Phaser 4.2.1, static backdrops, normalized hotspot rects. 4,603 lines total,
small on purpose.

## 3. What was delivered

| Feature | State | Evidence |
|---|---|---|
| Explore screens | Working | 15 screens, 5 days, all 4 time blocks, ink-driven clock |
| Cast magic | Working | 89/89 authored outcomes play; 58 effect / 31 no-effect / 0 error |
| Use inventory | Working | 31 foraged, 25 banked across a week; 6/2 carry caps honoured |
| Decorate hub | Working | Two placement models, two hub spaces, persistence across reload |
| Cast on screen | Working | Portraits for the 3 authored souls; present-but-silent souls shown dimmed |

**Verification, all green:** 65 unit tests · `npm run sweep` (all 89 casts
through the real UI, checking authored prose arrives verbatim) · `npm run walk`
(full week, samples real canvas pixels, watches for object leaks) ·
`npm run gates` (lock audit).

That verification tooling was not planned. It came from a bug Roc reported —
backdrops fading to black after ~10 moves — and has since caught seven more
defects, four of them mine: a second render leak, a sandbox that drained its own
inventory, a stale view cache that left the satchel looking empty, two layout
overruns, and the silent key-item drop behind G10.

## 4. The recommendations

Full reasoning in [FINDINGS.md](FINDINGS.md). All options are built and
switchable in the running build, so none of this needs taking on trust.

**Casting UI: component-first.** Pick what you hold; the phrase names what it
makes. *This reverses the earlier recommendation* — the typed option was built
first and looked right until all three existed side by side. Three approved
spells (`glimmer`, `portion`, `weigh`) take exactly one river stone and nothing
else; typed mode hides that collision, component mode surfaces it and explains
why the phrase exists at the moment it matters.

A learned-spells-only mode **must not ship alone**: with an empty spellbook
there is no way in at all, and it deletes the GDD's discovery — you cannot try a
phrase you overheard if the UI lists only what you have already cast.

**Hub placement: free drag.** Depth-sorting by y does most of the work of making
a flat backdrop feel like a room. Snap slots need surface data that does not
exist, and in play they reliably produce a room that feels like a form being
filled in.

**Unlock state: ink owns it, the host owns the cast.** Ink already owns lock
status, traversal and the clock, and `play.ts` set the precedent by refusing to
let `recordKnowledge` write `KnownPhrases` — *"a second writer would give one
fact two owners."*

**Rules that are not negotiable, whoever builds it:**

- Outcome drives bookkeeping only, never appearance. 31 of 89 outcomes are
  no-effect — a third of the content. Styling those as failure makes a third of
  the magic system feel broken.
- `reaction_kind: null` renders nothing, not "she does not react".
- Casting reach is not the satchel. Conflating them breaks the flame rule.
- No per-spell code. Chains run through `produces`/`produced_by`.
- Pack-triage is the only route that banks arms-carry, so offer it only when
  arms hold something.

## 5. What it found

**17 gaps**, logged with evidence, owner and a pinning test. Six are
capstone-blocking. **Five are content rulings; one (G15) is a regeneration of the
run folder** — and that one is the highest-return item on the list:

| | Gap | Why it blocks |
|---|---|---|
| **G15** | **`v01` was generated before its own fix** | Run folder 2026-08-01, placement fix 2026-08-11. Needs regeneration, not code. |
| **G13** | Foraged things are coarse names (`herbs`), not `item_id`s | Joins to no record — no category, no persistence class, **cannot be cast with**. The forage → cast loop is severed. |
| **G6** | Enforcing locks strands 8 of 20 screens | Only 1 of 7 gates has an approved spell behind it |
| **G5** | `G-F4-still` is keyed to `still`, rejected 2026-08-05 | Unsatisfiable gate |
| **G1** | `ignite.unlocks.screen` is `"Forest Unlock 1"` | Matches no screen; the only unlock in the set |
| **G2** | Nothing maps receivers to screens | You can ignite a hedge from Town Square |

**G15 came from a bug report** — *"Ilsa and Mara's conversations don't open"* —
and my first diagnosis of it was wrong. I reported that the day resolver ignores
`role_workplace`. It does not: `soulWeight()` weights for it, and a guarantee
floor holds each deep soul on a screen where they have an authored scene,
rotating across a life so every scene screen is reached.

The real cause is staleness. `tools/resolver/src/day.ts` was last fixed
**2026-08-11**; `lantern-projects/v01/day-*.json` was generated **2026-08-01**.
The run folder is ten days older than the fix, so every measurement taken
against it — including my 84%-silent figure — describes code that no longer
exists. `day.ts`'s own comment on that change names the reported symptom almost
verbatim.

**The action is to regenerate `v01`, not to change the resolver.** Two caveats
before doing so: the resolver's test suite has a pre-existing failure
(`seedThreadsFromContent` returns 10 thread ids where the test expects 3), and
regeneration is a content operation eight days from freeze — new seeds, changed
placements, possibly invalidating reviewed lines.

Two things regeneration will not fix: **T4 carries one afternoon NPC slot** while
Ilsa's eleven-scene arc sits there, rate-limiting that arc to a scene a day; and
**the texture souls hold no role**, so nothing can place them deliberately.

**The GDD did not state the rule (G17) — fixed 2026-08-13.** The role table
gained a **Workplace** column, the rule, and this slice's ratified deal
(Mara → Herbalist, Toby → Baker, Ilsa → Blacksmith), with the source's
`uncertain: true` flags carried through. `08-levels.md` gained the reciprocal
pointer and still names no soul — the Workshop is where the Blacksmith is,
whoever holds it. That amendment stands; only its stated justification was
corrected once the staleness came to light.

**Three of those six are instances of GP-106** (G1, G2, G13) — the
content-vocabulary vs screen-id split the Unreal plan already flags as live. The
probe did not find a new problem so much as measure how far that one reaches: it
now touches unlocks, receivers, foraging and the satchel.

Also worth naming: **G12 — there is no empty room to decorate.** The hub art is
already densely furnished, so keepsakes read as labels over someone else's room.
No UI work compensates. That is an art requirement following from the mechanic,
worth knowing before art time is spent.

## 6. What it did not do

Stated plainly rather than left to inference:

- **No screen-exploration or inventory design answers.** Both were already
  specified for Unreal; the probe implemented them to exercise the seams, not to
  redesign them.
- **No region authoring.** 15 of 16 screens still have no hotspot geometry (G7).
  Lantern already has an editor that writes the format — this is an hour of
  drawing rectangles, not a build task.
- **No save/load, reshuffle, meta-hub progression, role select, festival tiers
  or final sequence.** Out of probe scope.
- **No art, no audio, no animation.** None exists and the static-camera design
  does not need it.
- **No writes into `lantern-projects/` or `content/`.** The provisional joins
  (`spellGates.ts`, forage guarantees, `HOME_SURFACES`) are probe-local props so
  no content record was edited during freeze week.
- **The unlock mirror is not wired.** It cannot be: `state.ink` has no gate
  variable and ink LISTs cannot gain members at runtime (G4). The emitter change
  needed is written out in the README.

## 7. Decisions needed, and from whom

All upstream of any further engineering.

1. **G15 — constrain `slot_fill` to `role_workplace`.** The rule is now stated in
   the GDD; the resolver still ignores it, so souls remain scattered where
   nothing is authored for them. No new content and no schema change — the data
   exists and is reviewed. **Highest return of anything on this list**, and the
   only one that is a code change rather than a ruling. Owner: Track A.
2. **G13 — the forage → item mapping.** Many-to-one and must be authored, not
   inferred. Unblocks the forage → cast loop, which is severed today.
3. **G6 / G5 — what clears each gate**, and whether `still` returns or `G-F4`
   re-keys. Decides whether the forest is traversable at all.
4. **G1 / G2 — whether spell records gain `unlocks.gate_id` and a receiver→screen
   mapping** now, or wait behind GP-106. A schema change during freeze week is a
   risk only Roc can weigh.
5. **Texture souls hold no role**, so the placement rule cannot cover them. Deal
   them from the pool, or give them Mage's *roams* marker explicitly — an empty
   workplace should be a decision, not a blank.
6. **Whether the probe becomes the fallback build.** It is structured for it —
   real ink, real content, real carry model — but has no save/load.

## 8. Recommendation

**Stop adding features to the probe.** It has answered the design questions and
produced a work-list, and further Phaser work has lower return than acting on
the gap list.

**Do G15 next, and it is not a probe task.** Regenerate `lantern-projects/v01`
so the run folder carries the 2026-08-11 placement fix. That is the difference
between meeting the three deep souls reliably and meeting them by luck, and the
capstone is a playthrough. Clear the resolver's pre-existing test failure first.

Everything else on the list is a ruling that can wait for one.

## 9. Running it

```bash
cd ProjectOS/game-project/phaser
npm install
npm run prep:content    # re-sync point after a resolver reroll
npm run dev             # C = cast, H = hub, N = notebook
npm test                # 56 tests
npm run walk            # headless full week
npm run sweep           # all 89 casts through the real UI
npm run gates           # lock audit
npm run presence        # where souls are placed vs where scenes exist
```

`?cast=components` picks a casting mode · `?locks=1` enforces the locks ink only
advertises · `?walk=1` makes the canvas readable for the harness.
