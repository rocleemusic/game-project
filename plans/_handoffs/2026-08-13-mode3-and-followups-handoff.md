# Handoff — Mode 3 ("Discovery & Home"), item/gate fixes, Collection & Discovery follow-ups

**2026-08-13, later same day · capstone Tue 2026-08-25 · content freeze Fri 2026-08-21**

Follows on from [`2026-08-13-collection-mode-and-resolver-handoff.md`](2026-08-13-collection-mode-and-resolver-handoff.md) (this morning's session, which built Collection & Discovery mode). This doc covers everything since: a round of fixes and feature requests on that mode, two real-content corrections, and mode 3 going from "not started" to playable. Read this first if you're picking the session back up.

Resolver/`v01` regeneration (the Toby-reachability tradeoff from the morning doc) was **not touched** — still an open decision, see that doc's §1.

---

## 1. Collection & Discovery mode — fixes and features, this round

All in `phaser/src/scenes/CollectScene.ts` unless noted.

### A real bug, found in two layers
Roc reported "ignite allows casting when satchel has no sticks," then later "stick consumption does not happen, sticks still in satchel" after the first fix. Two distinct root causes, both in `phaser/src/world/Inventory.ts`:

1. **`availableOn()` had an unconditional `always_available` bypass.** `item_sticks` is flagged `always_available` in real content so the *forage offer* never randomizes it out (a GDD guarantee for gate-critical items) — but `Inventory` was treating that as "always castable," not just "always offered," so `ignite` worked with an empty satchel. Fixed with a new `includeAlwaysAvailable` constructor option (default `true`, so `ScreenScene` is unaffected; `CollectScene` passes `false`).
2. **The visible satchel strip can't reflect consumption at all**, structurally. It reads `v.satchel` — `LanternPlayer`'s own array — directly, and `tools/lantern/src/lib/play.ts` has no API to remove a single entry from it (`pickup()` only ever pushes). So even after (1), the consumed stick stayed visible forever. Fixed with a small ledger on `Inventory` (`consumedCountOf` / `clampConsumedCount`) and `CollectScene.effectiveSatchel()`, which hides the right number of occurrences from the display without ever touching ink's array. Self-corrects when a day reset or home-bank wipes the real satchel out from under it.

Also wired `Forage`'s existing (previously unused in this mode) `guaranteed` param so the "sticks" pool always appears in F1's forage offer — otherwise (1)'s fix could make `ignite` occasionally undrawable rather than just correctly gated.

Regression tests: `tests/CollectMode.test.ts`, describe block `"possession gating..."`.

### Ash / salt / ore — sourcing settled
- **`item_ash`** — forageable at **T4 "The Workshop"** (a client-side pool addition, `phaser/src/world/collectExtraForage.ts` — no screen in real content authors an "ash" pool yet, this is probe-local and flagged as such).
- **`item_salt`** — an NPC hands it over once, free, no currency (`phaser/src/world/npcItems.ts`, keyed `role_tag -> item_id`; Baker -> salt, tied to `role-workplace.json`'s existing Baker/Market Row link). This is a deliberate mechanic divergence from real content (which frames salt as a market trade good) — noted in the file, not silently overwritten.
- **`key_raw_ore`** — new approved key item (§2 below), forageable at F7 "The Cave" and F8 "Heart of the Wood" (added alongside their real pools, nothing replaced).

### NPC interaction — several rounds of iteration, final state:
- **One spell per NPC, not up to two.** `pickNpcSpells()` originally picked a stable subset of up to 2 spells per soul; Roc flagged (twice) that a second still-askable spell next to a shared one read as the NPC "offering something it hadn't offered." Now caps at exactly 1, seeded on soul id (`fnv1a`, deterministic, headless-walker-safe).
- **Proactive clue-sharing.** First talk with a soul each day, they volunteer their one clue unprompted (`shareClueOnFirstTalk()`) — the ask-flow (click the NPC, click the spell row) still works as the reliable fallback.
- **Hides non-offered clues.** A spell already known or already seen (from anywhere) doesn't show as a dimmed row — nothing to show if there's nothing new. Message reads "Nothing new from `{soul}` right now" vs. "Nothing authored for this role yet" depending on which is true.
- **Component hints.** Both the shared-clue line and the ask-flow row now say what the spell needs (`componentHint()`, reads `Inventory.record(id).description`), e.g. `weigh — needs a river stone — click to add as a clue`.
- **Layout.** The shared-clue line is now a row in the same top-down flow as everything else in the modal — same 24px size, same rhythm — not a separately-sized fixed-position banner crowding the heading.
- **NPC gift item mechanic confirmed generally OK** (Roc, this round) — usable again for future key-item acquisition work, with one real constraint found: `cast/ilsa.md` rule 14 says `gift`-category key items run **player -> NPC only**; an NPC handing the player a `gift` key item would be a canon violation. `memento` / `tool` / `material` categories aren't bound by that rule and are the safe candidates.

### Forage chips -> hotspots, backdrop pan/zoom, layout overhaul
- **Hotspots replace labeled forage chips.** Same underlying `Forage.offer()` draw (so hotspot *count* still reflects what's really out there), but now unlabeled pulsing dots at seeded-stable screen positions — clicking one is a surprise, and it's gone until the next day/time-block draw (same `pickedSlots` bookkeeping the old chips used).
- **Backdrop pan ("look around").** Backdrops render at 1.22x a plain cover-fit; mouse position pans within that extra room. Iterated three times on feel:
  - Smoothed with frame-rate-independent exponential easing (`PAN_SMOOTH_TAU`, `update()` loop) — was a jarring direct snap.
  - Frozen (holds last position, doesn't reset) while the pointer is over HUD chrome or a modal is open (`modalOpen` flag) — was dragging the scene out from under the cursor while reaching for a button or reading a dialog.
  - Respects `prefers-reduced-motion` (snaps instantly instead of easing).
- **NPCs pan with the scene too** — same lockstep-reposition mechanism as hotspots (`castPan`), not fixed HUD.
- **Choices row moved.** Dialogue/action/move choices are now a horizontal row directly above the satchel bar (wraps upward if a visit has enough options), replacing the old right-side vertical list. NPC portraits moved up (`NPC_ROW_CENTER_Y`) to clear it.

---

## 2. Two real-content fixes

### The Workshop (T4) is no longer recipe-gated
Roc: "workshop should not be recipe gated." Investigation found this was **already non-functional** — `phaser/src/world/Gates.ts`'s own header states plainly: *"WHAT IS ACTUALLY ENFORCED TODAY: nothing... every locked screen is reachable right now."* The `#lock:` tag on ink's `[Go to The Workshop]` choice is advisory metadata only; ink's own condition never mentions the gate.

So this was a design-of-record correction, not a behavior fix:
- `tools/resolver/data/screen-specs.json` and `lantern-projects/v01/graph.json` — T4's `status` changed from `locked(G-T4-recipe)` to `start`. The gate entry is kept on record (not deleted) with a `RULED` note, matching this codebase's audit-trail convention.
- **Not touched:** `lantern-projects/v01/ink/world/t2.ink`'s `#lock:` tag and the compiled `story.json` — both generated artifacts (`t4.ink`: *"Do not hand-edit"*). Harmless to leave stale since nothing reads the tag, but a future real `v01` regen will pick up the change and should clear it.
- `phaser/tests/Gates.test.ts` — two pinned assertions updated (T4 dropped from the locked-screens list; "would strand 8 screens" -> 7).

### Item catalog corrected
`content/items/item_ash.json` and `content/items/_index.md` — source_locations changed from the vague "Town scene · Square" to **"The Workshop · Square,"** matching what's actually implemented. Propagated to the phaser bundle via `npm run prep:content` (also refreshed `public/story/graph.json` from `v01` and `public/content/*.json` from `content/*` — picks up the T4 fix and the ore key item too).

`item_salt` left canonical/unchanged — still "Town scene · Festival Grounds," a trade good — since the NPC-gift mechanic is a flagged probe-only divergence, not a canon change. Revisit if that should be reconciled.

### `key_raw_ore` — new approved key item
Roc: the cave item is ore, and it's the material for Ilsa's arch. First draft (soul-tied to Ilsa, category "material") collided with two real rules, both caught before writing: the 2026-08-05 two-soul-tied-key-items-per-soul cap (Ilsa's two slots are already `key_spare_apron`/`key_knotted_cord`), and Ilsa's own card, which states her role (Blacksmith) carries the arc-work, not her as a soul ("deliberately plot-inert"). Corrected to **role-tied to Blacksmith**, matching the existing `key_arch_filing` precedent (the filing from the *finished* centerpiece; `key_raw_ore` is the raw material that feeds it — distinct items, same role).

- New file: `content/key-items/key_raw_ore.json`.
- `content/key-items/_index.md` — new row, plus a note that `category: "material"` is a new (7th) category alongside the GDD's six, and why role-tied sidesteps the cap.
- Forage-sourced at F7/F8 (see §1).

---

## 3. Mode 3 — "Discovery & Home" — playable

Reuses `CollectScene`'s entire engine rather than forking a new scene — a `hubEnabled` boolean threads through the chain (`ModePickerScene -> PreloadScene -> LocationSelectScene -> CollectScene`) rather than duplicating the day-loop.

- **New 3rd mode-picker button**, "Discovery & Home" — everything Collection & Discovery has, plus a Home Hub gated to what this life has actually found. `?mode=discover-home` skips the picker for headless driving, same pattern as the other two modes.
- **`Inventory.discoveredIds()`** — new lifetime-tracking set, separate from `held` (which shrinks on consumption). Populated by `give()` and by `applyCast`'s produced branch. Casting away a stick you found doesn't make it un-decoratable.
- **`HubScene` gained `discoveredOnly?: string[]`** — when set, `palette()` is restricted to those ids instead of every collectible item in the game (the existing "everything unlocked" sandbox behavior `ScreenScene` relies on is the default, untouched). Empty palette shows "Nothing found yet — forage or talk to neighbours, then come back" instead of a blank room. Title reads "HOME HUB — discovered items only" when gated.
- **`CollectScene` gained a `[ home — H ]` button**, shown only when `hubEnabled` — launches `HubScene` with `discoveredOnly: this.inventory.discoveredIds()`. Deliberately not gated on ink reaching the literal HOME screen: this mode has no `day_end`/home-hub wiring of its own yet, and gating the button on screen id would strand the player with no way to decorate at all.
- **Key-item acquisition**: `key_raw_ore` (forage-sourced) already demonstrates a working path into the gated hub. A broader NPC-gift path for key items is still open — deferred by Roc this session; see the constraint noted in §1 (gift-category items are player->NPC only; memento/tool/material are safe).

---

## 4. Verification note — read before trusting "looks right"

**No visual screenshot capability existed in this session's environment.** Every round of UI work (layout, pan feel, hotspot placement, modal spacing) was verified by: `npx tsc --noEmit` (clean throughout), the full `vitest` suite (71 -> 80 tests across the session, all green), and a clean browser console on reload after each change. That's meaningfully weaker than an eyeballed check for anything about *feel* or *spacing* — the NPC-modal text sizing/positioning fix in particular (§1) was made from a screenshot Roc pasted in, not from direct observation. **Worth an actual playtest pass on your end before calling any of tonight's UI work done.**

---

## 5. Still open

1. **`v01` full regeneration** — the Ilsa/Mara/Toby reachability tradeoff from the morning handoff. Untouched, still Roc's call.
2. **`v01/ink/world/t2.ink`'s stale `#lock:` tag and `story.json`** — harmless today, but a real regen should clear the rescinded T4 gate from the generated ink.
3. **`item_salt`'s canonical source_locations** — left as "Town scene · Festival Grounds" despite the NPC-gift divergence. Decide if that should be reconciled.
4. **Key-item acquisition beyond forage** — deferred. `memento`/`tool`/`material` key items are safe for an NPC-gift extension; `gift`-category ones are not (player->NPC only, ruled).
5. **PM board**: `GP-40` (Assignment #7, Style/Art-Direction agent) was due 2026-08-13 and untouched as of the morning's `/pm` check; `GP-160`/`GP-161` were tagged `tier:could` pending your confirmation. Not revisited this session — "we'll not worry about pm stuff today" (Roc).
6. **Accessibility** (keyboard focus, screen-reader support) — structurally out of scope for a canvas-rendered Phaser app, per the morning handoff. Still true, not revisited.
7. **A visual playtest pass** — see §4.

---

## 6. Running it

```bash
cd ProjectOS/game-project/phaser
npm install
npm run dev              # mode picker -> pick any of the three modes
npm test                 # 80 tests
npx tsc --noEmit         # typecheck
npm run prep:content     # re-sync public/content + public/story from content/ and lantern-projects/v01
```

`?mode=collect` / `?mode=daylife` / `?mode=discover-home` skip the mode picker for scripted/headless driving. `?walk=1` implies daylife mode, unchanged from before.
