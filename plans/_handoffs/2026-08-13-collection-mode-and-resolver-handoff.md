# Handoff — Collection & Discovery mode, UI/UX pass, resolver status

**2026-08-13 overnight session · capstone Tue 2026-08-25 · content freeze Fri 2026-08-21**

Read this first if you're picking the session back up. It covers two workstreams that ran in parallel tonight, plus a UI/UX pass done afterward on Roc's follow-up requests.

---

## 1. Resolver status — the test fix landed, the regeneration did not

**What landed:**
- `tools/resolver/test/week.test.ts`'s `seedThreadsFromContent` assertion was stale (expected 3 thread ids, the function correctly returns 10 now that `data/scene-graph.json` has grown). Fixed — updated to the current 10 ids with per-id soul attribution. `npm test` in `tools/resolver` is green on this test (8/8). The suite still has 9 pre-existing failures in `test/walk.test.ts` (day-gating, bond ceilings, scene-reachability) — confirmed unrelated to this fix and untouched.

**What did NOT land, and is still your call:**
- `lantern-projects/v01` was **not** regenerated. `v01/week.json` still shows the old 2-thread seed set — verified just now, still stale.
- A regenerated run sits in `lantern-projects/scratch/` (`graph.json`, `day-1..5.json`, `week.json`, `story.json`, `ink/`). **Correction to what I told you mid-session:** I said this stayed uncommitted; it did not — it got swept into a commit (`b715c887`) at some point tonight via the repo's auto-commit-on-save hook. It's committed but still a separate folder from `v01`, so nothing downstream (the phaser app, `bundle-content.mjs`) reads it. No functional harm, just a correction for the record.
- **Reachability diff, v01 (before) vs scratch (after):**

  | Soul | v01 | scratch |
  |---|---|---|
  | Ilsa | 21%, reachable days 2,4,5 | 36%, reachable **all 5 days** |
  | Mara | 40%, reachable days 1–4 | 60%, reachable **all 5 days** |
  | Toby | 63%, reachable all 5 days | **44%**, reachable all 5 days — regressed |

  Ilsa and Mara both improve on every metric. **Toby's placement-to-scene-screen hit rate drops** even though he's still reachable every day. This needs a look before you decide to overwrite `v01` — worth understanding why before treating the regen as a clean win.

- **A scope incident, already resolved:** the background agent doing this work ran `git stash`/`git stash pop` at the repo root outside its authorized directories, which popped a leftover stash from an unrelated earlier session and produced a merge conflict in `ideas.md`. It resolved the conflict by keeping both sides' content (the file is append-only) and is already auto-committed (`aeaee9f0`). Nothing was lost, but flagging it since it was outside the agent's scope. There's a stale `stash@{0}` still sitting in your stash list — harmless, drop it with `git stash drop stash@{0}` if you want it gone.

**Recommendation:** don't overwrite `v01` yet. Understand the Toby regression first — possibly it's a real tradeoff (broader reachability elsewhere costs him some), possibly it's a `data/scene-graph.json` change unrelated to the placement fix. Either way it's a content-freeze-week decision, same as it was going in.

---

## 2. New mode: Collection & Discovery

Built tonight, alongside (not replacing) the existing day-loop probe. Same project, new scenes, same `LanternPlayer`/ink/content pipeline — nothing in `tools/lantern`, `content/`, or `lantern-projects/v01` was touched.

### The loop
Forage real screens for real items (translated through a new provisional join, see below) → items become castable → learn spells two ways: pre-seeded starters, or asking an NPC what spells their current role knows (adds a "clue," per the GDD's seen-vs-learned split) → confirm a clue by guessing its components in the notebook → a cleared spell can clear the one gated screen in the slice (a dry hedge, cast with `ignite`).

### New scenes (`phaser/src/scenes/`)
| Scene | Role |
|---|---|
| `ModePickerScene` | First screen. Background art (`start.jpg`), picks day-loop probe vs. this mode. |
| `LocationSelectScene` | **Added after Roc's follow-up.** The screen right after the mode picker — calendar backdrop, day 1's real reachable locations (pulled live off ink's actual choices) as clickable cards. Picking one plays that `[Go to X]` choice for real, then hands the already-advanced ink bridge to `CollectScene`. |
| `CollectScene` | The main loop — forage, satchel, NPC portraits (clickable), the hedge gate. |
| `SpellTrialScene` | Launched from the notebook. Two modes: guess-and-test for an unconfirmed clue, or cast-on-demand for an already-learned spell. |
| `CalendarScene` | Read-only day/time-block overview, calendar-inspiration backdrop. Reachable from `CollectScene` (L key / button) at any time — kept as a standing option per Roc, in addition to the new location-select screen using the same art. |

`NotebookScene` (shared with the day-loop probe) gained a `collectMode` flag: in this mode it renders as a **bottom-half drawer** rather than a full-screen cover, so the screen behind it stays visible (it's paused, not hidden — Phaser keeps rendering a paused scene). Spellbook rows are now clickable in both known and clue states.

### New provisional joins (`phaser/src/world/`), both explicitly flagged in their own file headers
- **`foragePoolToItem.ts`** — the forage→item_id mapping GAPS.md's G13 says doesn't exist as real content. Hand-guessed by name/theme (`herbs`→`item_berry`, `river stones`→`item_river_stone`, etc.), pinned by a test that checks every pool name in `graph.json` resolves. Two items (`item_ash`, `item_salt`) have no forage source and are flagged rather than force-mapped — `dry` and `preserve` aren't practically castable in this mode yet.
- **`collectGates.ts`** — the hedge gate. No screen in the real data is actually tagged with a hedge obstacle (that's G1 — `ignite.json`'s `unlocks.screen: "Forest Unlock 1"` matches nothing). This picks **F7 "The Cave"** as the target screen — a guess, confirm or redirect.

Both are same posture as the existing `spellGates.ts`: probe-local, not written into `content/`, deletable once real data lands.

### Fixes from Roc's two follow-up rounds tonight
1. Casting an already-**learned** spell was previously impossible outside the hedge — the notebook only ever offered the *guess* flow. Fixed: clicking a known spellbook entry now opens a direct cast panel (shows the recipe, a `[ cast ]` button enabled once you hold what it needs).
2. Notebook was a full-screen cover — now a bottom-half drawer (above).
3. Calendar backdrop image — was actually loading correctly; the dark overlay (0.72 alpha) was crushing it to near-black. Dropped to 0.45(→0.45, harmonized under the theme pass below).
4. Hedge-cast auto-picked the first matching known spell — now opens a spellbook picker; you choose.
5. Hedge clearing required leaving and returning to the screen to see the choice list update — the clear is host-side state, not an ink change, so nothing re-triggered a render. Fixed with an explicit `render()` call right after a successful hedge cast.
6. Location-select screen — see `LocationSelectScene` above; this replaced what used to be a blank loading beat right after the mode picker.

---

## 3. UI/UX pass (this session's last task)

Ran the `frontend-design` and `ui-ux-pro-max` skills plus a manual WCAG contrast pass over the new mode's scenes (day-loop `ScreenScene`/`CastScene`/`HubScene` were left alone — out of scope, already reviewed/frozen per `HANDOFF.md`).

### What changed
- **New shared theme** — `phaser/src/ui/theme.ts`. Replaces the ad hoc "gold text on near-black" scattered through each scene with a named, contrast-checked palette grounded in the subject (a lantern festival kept in a hand-written notebook): warm lamp-lit-wood panels instead of flat near-black, parchment ink for body text, lantern gold as the one "you can act on this" accent, a warm ember for hover/active states (so hover reads as motion, not just a recolor), a dusk plum for secondary/clue text. Every pair is contrast-verified (WCAG AA, 4.5:1+) — ratios are documented in the file's header comment.
- **A real accessibility bug, fixed**: HUD text (day/time/moves header, the move-choice list, forage/satchel strip) was rendering directly over photographic backdrops with no guaranteed contrast — legible on a dark screen, potentially not on a bright one. Added persistent scrim bars behind all three regions in `CollectScene`.
- **Touch targets**: buttons/rows that were bare text gained padding, pushing their hit area past a comfortable tap target even after the canvas scales down to a smaller viewport.
- **Hover states**: every clickable element in the new mode now gives visual feedback (color or fill change) on hover, not just on click.
- **Motion**: modals and the location-select cards now fade/scale in (~180ms), reading as one deliberate entrance rather than popping in instantly. Respects `prefers-reduced-motion` — checked once at module load (`REDUCED_MOTION` in `theme.ts`), skipped entirely when set.
- **Failure/success color coding**: the spell-trial fail lines now render in a warm danger color, success text in green — failure and confirmation are now visually distinct, not just textually.

### Known limitations, stated plainly rather than left to inference
- **No real keyboard focus or screen-reader support.** This is a Phaser canvas app — there's no DOM for a screen reader to read, and no native tab order for keyboard users. Every interaction here is mouse/touch-only. A few of WCAG's criteria (visible keyboard focus, meaningful alt text, ARIA labeling) fundamentally don't apply to a canvas renderer without a parallel HTML overlay, which is out of scope for tonight. What *did* get done — contrast, touch-target size, hover feedback, motion preference — are the criteria a canvas app can actually meet.
- Contrast ratios were verified against the theme's flat colors at full opacity; several panels render at 0.85–0.97 alpha over a backdrop, which is *more* contrast than the flat-color calculation assumes (backdrop plus a dark panel is darker than the panel alone), so the documented ratios are a conservative floor, not an overstatement.

---

## 4. Things to decide or confirm in the morning

1. **Don't overwrite `v01`** without understanding Toby's regression first (§1).
2. **The hedge/F7 mapping is a guess** — `collectGates.ts` header explains why; confirm or redirect.
3. **Starter spells** (`ignite`, `breath`) were picked for simple, quickly-forageable components — fine as placeholders, not a ruling.
4. **`item_ash`/`item_salt` have no forage source** in `foragePoolToItem.ts` — `dry`/`preserve` aren't practically castable in this mode until that's addressed.
5. Drop the stray `stash@{0}` if you want (§1).

## 5. Running it

```bash
cd ProjectOS/game-project/phaser
npm install
npm run dev              # mode picker -> Collection & Discovery -> calendar location-select
npm test                 # 71 tests, including the new CollectMode.test.ts
npm run walk              # day-loop probe, unaffected
npm run sweep
npm run gates
```

`?mode=collect` / `?mode=daylife` skip the mode picker for scripted/headless driving. `?walk=1` implies daylife mode, unchanged from before tonight.
