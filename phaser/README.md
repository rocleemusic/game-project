# Feature probe (Phaser 4)

A **design probe**, not a build track. It exists to answer *"what should casting
and hub decoration actually feel like"* before Unreal time is spent on them, and
to stand as fallback insurance if the Unreal track slips.

Capstone is **Tue 2026-08-25**. Nothing here may gate Track A (narrative) or
compete with Track B (Unreal) for review time.

## Why it is small

It is a **presentation layer over `tools/lantern`**, not a new game.

`tools/lantern/src/lib/play.ts` already contains `LanternPlayer`: it loads
`story.json` through inkjs, binds all four `EXTERNAL`s for real, and owns the
satchel, arms-carry, pack-triage, day loop and move budget — under vitest. This
package imports it through a Vite alias rather than forking it. A copy would
drift from the tested original and quietly turn the probe into a third track.

What this package adds is only what exists nowhere else:

| | Status |
|---|---|
| **Casting** (`src/magic/`, `src/scenes/CastScene.ts`) | Built. No implementation anywhere else in the project — the reason the probe exists. All 89 authored outcomes playable. |
| **Hub decoration** (`src/world/Decor.ts`, `src/scenes/HubScene.ts`) | Built as a sandbox — press `H`. A one-line ink placeholder (`SYS-HOME-LOOK`) everywhere else. |
| **Point-and-click presentation** (`src/scenes/`) | Full week walkable, 15 screens, ink-driven clock. |
| **Inventory** (`src/world/Forage.ts`, `src/scenes/NotebookScene.ts`) | Built — forage, satchel, arms-carry, pack-triage, notebook (`N`). |

## Running it

```bash
npm install
npm run prep:content   # bundles content/ + the run folder into public/
npm run dev
npm test               # 65 tests: cast resolver, ink seam, gates, decoration, forage, cast
npm run walk           # headless: walks the full week against a running dev server
npm run sweep          # headless: all 89 authored cast outcomes through the real UI
npm run gates          # audits which locked screens any approved spell can open
npm run presence       # soul placements vs authored scenes
npm run adversary      # adversarial QA: 250 headless steps of deliberately INVALID
                       # input against mode 5, then a structured findings report.
                       # Every command above plays the game correctly; this is the
                       # only one that tries to break it. tools/adversary/README.md
```

## Deploying to itch.io

Mode 5 ships to `rocdoessound.itch.io/the-festival-of-souls` as a playable
prototype. Every update is one command:

```bash
npm run deploy:itch
```

It rebuilds from whatever's currently in the repo (content, run folder,
backdrops) and pushes to the same channel with `butler` — no re-login, no
config changes, same command every time.

One-time setup on a new machine (already done on this one):

1. `tools/bin/butler.exe login` — opens a browser to authorize. `tools/bin/`
   is gitignored; `deploy:itch` downloads butler there itself if it's ever
   missing.
2. `itch.config.json` at this folder's root, gitignored, pointing at the
   push target: `{ "target": "rocdoessound/the-festival-of-souls" }`.
3. Your itch.io account email must be verified — an unverified account gets
   a 400 from butler with no other symptom (`itch.io API error (400):
   /wharf/builds: Please verify your account's email address`), and the
   itch project page shows "No file provided to embed" until a build lands.

Why a build step exists at all rather than just `vite build`: backdrops
live in `lantern-projects/v01/images/`, served in dev only by a middleware
route (`vite.config.ts`) that a static build never sees. `npm run
prep:content` (which `build:itch` runs first) mirrors them into
`public/run-images/` so they ship. All runtime asset paths are relative
(`art/...`, not `/art/...`) because itch serves an HTML5 build from a CDN
subpath, not the domain root — an absolute path resolves to the wrong
place there.

> **This file is stale in three places and has not been rewritten here on purpose
> (2026-08-24) — flagged for Roc rather than silently changed.** Since the
> 2026-08-17 pivot `phaser/` is **the ship target**, not "a design probe, not a
> build track"; the "nothing here may gate Track A" rule was retired by Roc on
> 2026-08-23; and the capstone moved to **Tue 2026-09-01** with content freeze
> **Fri 2026-08-28**. `../CONTEXT.md` is authoritative on all three.

`prep:content` is the re-sync point. Re-run it after a resolver reroll.

### The walker

`npm run walk` drives the running probe through the whole week and asserts on
live state, not on the build succeeding. It exists because a rendering leak
shipped that no unit test could see: the scrim was re-added on every screen
change and never destroyed, so alphas compounded (`0.55^10` is ~0.002) and the
backdrops faded to black after about ten moves. It only existed on the rendered
canvas, across a long session.

So the walker samples real canvas pixels every move, watches the display-object
count for unbounded growth, and seeks coverage rather than taking the first
choice — examinables are sticky (`+`), so a naive walker loops on
`[Look at arch]` forever and never leaves the opening screen.

`--shots` writes periodic screenshots. `?walk=1` (added automatically) enables
`preserveDrawingBuffer` so the canvas is readable; without it every pixel reads
black and every check is a false alarm.

Current state: **clean walk** — 5 days, all 4 time blocks including night, 15
screens, story ends at step 197.

`F5 F6 F7 F8 T9` are never reached, but **not because they are locked** — see
GAPS.md G3: `#lock:` is advisory and nothing enforces it, so every screen is
walkable today. They go unvisited because the walker's coverage heuristic
matches on screen ids that never appear in the display text, and the five-day
budget runs out first. Fixing that heuristic is worth doing before the walk is
treated as a coverage guarantee.

### The cast sweep

`npm run sweep` drives **every one of the 89 authored (spell x receiver) pairs
through the real casting UI** in a real browser, and checks that the authored
prose reaches the screen verbatim and that no reaction is invented where the
content has `null`.

It is not a duplicate of the unit tests. Those prove the resolver; this proves
the resolver reaches the player.

```
cast 89 authored pairs
  effect     58
  no-effect  31
  other       0
ignite -> item_flame -> leap on cold_lantern -> effect
the flame is spent by the leap, and was never pocketable
unauthored receivers are reported as content gaps, not papered over
```

## The seams

**Ink owns the clock.** `world/t1.ink`'s `= hub` weave decrements `movesLeft`
and calls `advance_time()` itself. Phaser **reads** `movesLeft`, `TimeOfDay` and
`day` off `view()` and must never write them.

**`choose()` only selects.** Ink runs the option body — including every
`~ recordBond(...)` — on the *next* `continueOnce()`. `InkBridge.choose` always
does both; a bare choose is never exposed.

**Backdrops are served in place** from `lantern-projects/v01/images/` via the
`/run-images` dev route, keyed by `manifest.json`. Nothing is copied, so the
probe cannot go stale against the run folder.

**Hotspots are normalized fractions.** `regions.json` stores `{x,y,w,h}` as
fractions of the backdrop, which is why the canvas is a fixed 1920x1080 with
`Scale.FIT` — sources range from 447x447 to 2000x1333 and would otherwise each
need their own aspect correction.

## Content rules the code enforces

- **`content/magic/` holds 10 rejected spells beside the 16 approved ones**, in
  the same shape, with no filename marker. Both `bundle-content.mjs` and
  `MagicDB` filter on `status === "approved"`. Selecting by filename would ship
  content that never passed Roc's gate.
- **A spell is a phrase PLUS components.** `glimmer`, `portion` and `weigh` all
  take exactly `[item_river_stone]`, so components alone cannot identify a
  spell. A component-only casting UI is unbuildable against the real content.
- **"No effect" is an honest result, never a failure.** `outcome` drives
  bookkeeping only — consumption, production, unlocks. It must never reach the
  view. The moment a no-effect cast gets a red flash or a shake, the design
  reads as a bug. `reaction_kind: null` means render *nothing*, not "she does
  not react".
- **Mana shapes quality, never possibility.** Locked by a test that sweeps all
  89 authored (spell x receiver) pairs at both bands and asserts the outcome is
  identical.
- **Chains run through the item layer.** `ignite` -> `item_flame` -> `leap`
  works because `produces`/`produced_by` agree in the data. If you ever write
  `if (spellId === "ignite")`, the design has broken.

## Known state

- **Hotspot geometry exists for `T1` only** (`r_arch`, `r_board`). Every other
  screen's regions are declared with `shape: null`, so `ScreenScene` renders
  them as labelled pills along the bottom edge — playable now, no authoring
  bottleneck. **Do not build a region editor**: Lantern already has one, and it
  writes this exact format. The geometry it produces is also what the Unreal
  click layer needs.
- Day 1 opens on the `[Begin at X]` start pick, so there is no `#screen` tag and
  no backdrop until the player picks. That is correct, not a missing asset.
- **`T5` is an NPC's home, not the player's** (Roc, 2026-08-12). `HOME` is the
  player's Home Hub and is what the decoration sandbox mounts onto — despite
  `manifest.json` pointing `T5` at `homeinterior.jpg`. Do not read the manifest
  filename as the authority on whose home a screen is.

## Handoff

**[HANDOFF.md](HANDOFF.md)** — start here in a new session. Carries the state,
the one action that matters next, and the mistakes worth not repeating.

## The report

**[REPORT.md](REPORT.md)** is the single document — written to be read cold. It
covers what was built, what it found, what it deliberately did not do, and the
decisions now waiting on Roc.

## The two supporting documents

- **[FINDINGS.md](FINDINGS.md)** — the recommendations the probe was
  commissioned for: which casting UI, which placement model, and the rules that
  are not negotiable. Every option is built and switchable in the running probe,
  so none of it has to be taken on trust.
- **[GAPS.md](GAPS.md)** — every gap the probe walked into, with evidence, owner,
  severity, and the test that pins it.

Together these matter more to the Unreal track than the code does.

## Findings — for the Unreal track

**The recommendations live in [FINDINGS.md](FINDINGS.md)**, including which
casting UI and which placement model to build. In short: **component-first**
casting (not the typed option this file used to recommend — all three are now
built, and the comparison changed the answer), and **free drag** for the hub.

The rest of this section is the supporting detail.

**Casting reach is not the satchel, and conflating them breaks the flame.**
Reach is `satchel ∪ always-available materials ∪ world items on this screen`.
Enforced in one place (`Inventory.availableOn`), which is what makes "cast on
and cast from, never pocketed" true mechanically instead of by convention. After
igniting a hedge, `an existing flame (world)` appears in the tray marked as
world; leaping from it spends it and it never enters the pack.

**58 effect / 31 no-effect.** A third of all authored casts do nothing
physically. That ratio is the argument for the styling rule: no-effect is not an
edge case to handle, it is a third of the content. Rendering it as a failure
state would make a third of the magic system feel broken.

**Show unauthored receivers, do not hide them.** Casting at one returns a named
content gap rather than invented prose. That is a work-list for the narrative
crew. `MagicDB.receiverCoverageGaps()` enumerates them.

## Unlock state — who owns it

**Recommendation: ink owns the unlock, the host owns the cast.** Run
`npm run gates` for the audit behind this.

Ink already owns lock state — `graph.json` carries
`status: "locked(G-F5-cascade, G-F7-light)"`, gates are typed, and the `= hub`
weave is what offers each `[Go to X]`. `play.ts:bindExternals` already set the
precedent when it refused to let `recordKnowledge` write `KnownPhrases`, because
*"a second writer would give one fact two owners."* Casting stays host-side
because ink mentions no spell anywhere, and 89 receiver-determined outcomes in
the story graph would force an inklecate recompile on every content edit.

### Three things block that today

**1. Nothing enforces the locks.** The emitted move is

```ink
+ {movesLeft > 0 && TimeOfDay != night} [Go to The Cave] #lock:locked(G-F5-cascade, G-F7-light)
```

The condition never mentions a gate — `#lock:` is advisory metadata. Every
locked screen is walkable right now. (This corrects an earlier note here: F5-F8
went unreached in the walk because of the walker's coverage heuristic and the
5-day budget, not because they were locked.)

**2. There is nowhere to mirror to.** Mirroring gate state into ink needs a
variable in `state.ink`, which is the single generated declaration site — *"a
LIST or VAR declared anywhere else is a defect"* — and ink LISTs cannot gain
members at runtime. So the emitter needs, roughly:

```ink
LIST GatesCleared = G_F4_still, G_F5_cascade, G_F7_light, G_F8_combine, ...
```

and each gated move's condition extended:

```ink
+ {movesLeft > 0 && TimeOfDay != night && GatesCleared ? (G_F5_cascade, G_F7_light)} [Go to The Cave]
```

The host then mirrors in after a cast, exactly the *mirror in, event out*
pattern the Unreal plan already cites. Until that lands, this probe models gate
state host-side and enforces it in the presentation layer under `?locks=1` — a
demonstration of the mechanic, explicitly **not** the shipping ownership.

**3. The spell→gate join is broken.** `ignite.unlocks.screen` is
`"Forest Unlock 1"`, which matches no screen id and no screen name. It is a
GDD-era label never minted as a screen — a third instance of **GP-106**. The fix
is `unlocks.gate_id` keyed to ids the graph already uses (`G-F7-light`), after
which `src/world/spellGates.ts` gets deleted.

### The scope finding

**If the locks were enforced today, 8 of 20 screens would be unreachable** —
`T4 T5 T6 F4 F5 F6 F7 F8`. Only one of seven gates has any approved spell behind
it, and even `F7` also needs `G-F5-cascade`, which nothing clears.

Worse, `G-F4-still` is keyed to the phrase *"still the water"* — but `still` was
**rejected** at the 2026-08-05 gate. That gate is unsatisfiable by construction.

The other gates are not spell-shaped at all: `G-F5-cascade` is an insight
chokepoint, `G-F8-combine` is item-based, `G-T5-trust` is a bond signpost. So
"magic unlocks screens" currently has exactly one candidate instance in the
whole run. That is a content decision, not an engineering one, and it is pinned
by a test in `tests/Gates.test.ts` so it cannot drift unnoticed.

## Not in scope

No character controller, physics, tilemaps, animation, particles or audio — the
asset set has none and the static-camera design does not need them. No save/load
UI, no reshuffle, no meta-hub progression, no festival tiers. No edits to
`lantern-projects/v01/ink/`: casting is host-side, and touching the ink would
mean recompiling with inklecate.

Never load `Gold icons set 1-01.png` (8334x8334) or `Game menus-01.png`
(6617x5618) at runtime — 8334px exceeds the 8192px `MAX_TEXTURE_SIZE` on many
GPUs and will render black or fail to upload.
