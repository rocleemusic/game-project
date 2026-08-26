# Handoff — Cast flow redesign (wireframe → shipped Phaser screens)

Paste the block at the bottom into a new session. Everything above it is context
for a human deciding what to do next.

**Written 2026-08-23 · capstone Tue 2026-09-01 · content freeze Fri 2026-08-28**

---

## State

The design is decided. `phaser/tools/screen-flow/mockups/cast-flow-redesign-wireframe.html`
carries all four open calls ruled by Roc, same day it was drafted — §6 is a
decision record, not an open list. Nothing left to design in that document;
this handoff is for building it.

**What it replaces:** the `SpellTrialScene.ts` chrome pass that shipped
earlier the same day (`plans/_handoffs/2026-08-23-spell-trial-rebuild-handoff.md`)
is not wrong — the leather panel, the filigree, the shipped pill buttons, and
the full-opacity backing that fixed the notebook-bleed-through bug are all
correct chrome. This handoff changes the **shape** underneath that chrome: a
full-bleed blocking backing becomes a docked panel that only scrims the
bottom third, so the thing being cast at (a notebook page, or the world
itself) stays visible the whole time.

## The four decisions, verbatim

1. **Satchel picker — Option A.** `SatchelStrip.ts`'s always-on HUD row
   becomes the interactive picker in place. No second, cast-only tray to
   keep in sync.
2. **Dock position — bottom third**, not a side rail.
3. **Right-click replaces left-click for world-casting.** Left-click keeps
   meaning "look" (examine); right-click is the only way to open the cast
   popover on a receiver marker.
4. **VFX intensity stays uniform.** No quieter variant for a repeated
   trial-miss loop. Every landed cast — trial or world — plays the same
   weight of burst; a miss plays none, since nothing landed.

## Three technical notes the wireframe's CSS mockup couldn't surface

The wireframe is composition and interaction only — these are real Phaser/
scene-architecture questions its CSS frames don't have to answer, worth
reading before the build session picks an approach.

**1. "The picker is the satchel" needs one render per scene, not a shared
GameObject.** `SatchelStrip.ts` lives in `CollectScene.ts` and is only ever
drawn there. The trial-cast dock lives in `SpellTrialScene.ts`, which sits
three scenes deep on the stack (`CollectScene`/`ScreenScene` → `NotebookScene`
→ `SpellTrialScene`, each opened via `scene.pause()` + `scene.launch()`) —
the real `SatchelStrip` instance isn't reachable or visible from there, and
`NotebookScene`'s own opaque book background would cover it even if it were.
So Option A, in code, means: `SpellTrialScene` draws its **own** icon-strip,
styled to match `SatchelStrip`'s visual language and reading the same
`Inventory.availableOn(null)` / banked data `SpellTrialScene` already reads
(`held()`/`bankedHeld()`, unchanged) — a second render of the same state, not
a second source of truth. The world-cast popover has no such problem —
`ReceiverHotspots`/`HedgeCastPrompt` already live inside `CollectScene`
itself, right next to the real `SatchelStrip`.

**2. The notebook staying visible behind the dock is free; don't rebuild
scrim mechanics to get it.** The occlusion fix shipped earlier today
(`COLOR.night, 1`, full W×H) exists because Phaser renders a paused scene
normally — pause only stops its update loop. That's exactly the mechanism
this build wants now: shrink `SpellTrialScene`'s backing rect to the bottom
third only (transparent everywhere above it), and the paused `NotebookScene`
underneath shows through the top two-thirds automatically, no new plumbing.
Don't reach for a second scrim technique — this is the same fact that caused
the bug, now used on purpose.

**3. Left-click-as-examine on a receiver marker doesn't exist yet.**
`ReceiverHotspots.sync()` today wires plain `pointerdown` straight to
`onCastOn(...)` — there's no "look before you commit" state on a receiver at
all, unlike pickup hotspots (which already have this, per the *other*
wireframe's §1). Decision 3 needs a small new examine card for receivers,
not just a click-handler swap from left to right. Check whether the pickup
hotspot's own examine-card component (`HotspotSystem.ts` or wherever §1 of
`mode5-ux-flow-wireframe.html` shipped) is reusable here before building a
second one.

## Build tiers, by size and risk

**Tier 1 — small, isolated, ship first.**
- Wire the existing `VfxSystem`/`VfxBackend.ts` into `SpellTrialScene.ts` for
  a landed trial-cast, anchored to screen-center — the exact pattern
  `CollectScene.startVfx()` already uses for `anchorFor: () => null`. No
  scene-stack question here; `SpellTrialScene` already owns everything it
  needs.
- Confirm world-cast VFX (`CastScene.startVfx()`'s `receiverAnchors` path)
  still fires once the popover replaces `HedgeCastPrompt`'s book-page modal —
  likely untouched, but verify rather than assume.

**Tier 2 — medium, real interaction work, mostly contained to one file each.**
- §1 Trial-cast dock: shrink `SpellTrialScene`'s backing per note 2 above,
  rebuild the panel as a bottom-third dock (leather-toned, matching
  `ModalFrame`'s palette even though it's not `ModalFrame.modalFrame()`
  itself — that call draws a centered board, not a docked strip), draw the
  own icon-strip per note 1, wire "try it"/close into the dock's smaller
  footprint.
- §2 Right-click world-cast: right-click detection on `ReceiverHotspots`'
  marker (`pointer.rightButtonDown()` / `pointer.button === 2` — load
  `input-keyboard-mouse-touch` before hand-rolling this; also suppress the
  native browser context menu on the game canvas, or right-click will open
  it instead of the popover), plus a new small anchored popover to replace
  `HedgeCastPrompt`'s 70%-wide book page — pinned to the marker with a
  pointer arrow, sized to its own chip count, not a fixed width.

**Tier 3 — needs a build-time call, not just implementation.**
- The new left-click examine card for receiver markers (note 3) — small in
  isolation, but it's genuinely new interaction, not a port of something
  shipped. Confirm the reusable component question before writing a second
  examine card from scratch.
- Selection-state sharing between the trial dock and the world popover — per
  note 1, each renders its own icon-strip against the same `Inventory` data.
  Confirm that's the intended reading of "no second source of truth" (about
  selection state, not the render call) before building two independent
  pickers that happen to agree.
- `aria-live` for cast outcomes (§5 of the wireframe). **Grep confirms zero
  DOM-accessibility bridge anywhere in `phaser/src` today** — no
  `aria-live`, no `createElement`, nothing. This is new infrastructure (a
  real DOM element layered outside the canvas, not a Phaser Text object), not
  a quick attribute add. Scope it deliberately — likely its own small task,
  not folded silently into Tier 2.

## Files touched — check for collisions before starting

`SpellTrialScene.ts`, `ReceiverHotspots.ts`, `HedgeCastPrompt.ts` (or a new
sibling popover component), `SatchelStrip.ts`, `VfxSystem.ts`/
`VfxBackend.ts` (read/wire, likely no edits), possibly `CollectScene.ts` if
right-click wiring needs a hook there — watch its line-count gate
(`tests/HedgeCastPromptTraversalRow.test.ts` caps it under ~920 lines;
extract, don't raise, if this pushes it over.

As of this handoff, a parallel session's hot files are `HubScene.ts`,
`RoomZoomModel.ts`, `HubShelfScene.ts`, `NavRow.ts` — no overlap with the
list above. Re-check `git log` before starting; handoffs are stale by design.

## The build loop already exists — use it

Same as every other Phaser UI pass in this project:
[`agents/ui-builder.md`](../../agents/ui-builder.md) +
[`agents/ui-verifier.md`](../../agents/ui-verifier.md), gated on a real
`phaser/tools/playtest.mjs` screenshot, not `tsc`/`vitest` alone — this
project has paid for that lesson more than once (a `setMask` bleed, a
container draw-order flip, a particle 2×-anchor bug, all `tsc`-clean and
`vitest`-green until a screenshot caught them).

## Skills to load, not skip

- **`frontend-design` and `ui-ux-pro-max`** for the dock's exact proportions,
  the popover's pointer-arrow placement, and the icon-strip's touch-target
  sizing — the wireframe is composition, not final art.
- **`wcag-checker`**, canvas-translated: keyboard path for right-click (Tab
  to a receiver marker, Enter/Space opens the same popover — §5's own
  requirement), focus-visible ring on the dock's first interactive element,
  reduced-motion fallback for the VFX burst, 44×44 hit targets on icon
  slots even if drawn smaller, contrast at the dock's faded scrim edge (not
  just its opaque bottom).
- **`input-keyboard-mouse-touch`** before the right-click detection and
  context-menu suppression.
- **`events-system`**, **`data-manager`** if selection state ends up shared
  rather than duplicated per note 1's open question.

## Verification

`npm test` + `npx tsc --noEmit` in `tools/lantern`, then
`phaser/tools/playtest.mjs` with real screenshots of: the trial dock in CLUE
mode with the notebook page visible above it, the trial dock's VFX burst on
a landed cast, the world-cast right-click popover with the world still lit
around it, and its VFX burst at the real receiver position. A UI change
isn't done until the screenshot looks right, not just green tests — same
standard as the rest of this project's Phaser work.

## Model / effort

**Opus, high** — real feature and interaction-model work across several
files, not a chrome pass on one scene.

---

## Prompt for the new session

```
Read ProjectOS/game-project/CONTEXT.md, then this handoff
(plans/_handoffs/2026-08-23-cast-flow-redesign-build-handoff.md) in full,
then phaser/tools/screen-flow/mockups/cast-flow-redesign-wireframe.html (all
four decisions are ruled — nothing left to design in that document).

Goal: build the wireframe's decided cast flow in Phaser — a docked,
non-blocking trial-cast panel replacing the current full-bleed
SpellTrialScene modal, and a right-click anchored popover replacing
HedgeCastPrompt's book-page modal for casting on world receivers, with VFX
wired into both so a landed cast is always visible, never hidden behind a
blackout.

Before writing any code:
1. Re-check git log for the current parallel-session hot files (this handoff
   lists HubScene.ts, RoomZoomModel.ts, HubShelfScene.ts, NavRow.ts as of
   2026-08-23 — likely stale by the time you're reading this).
2. Read the handoff's "three technical notes" section in full — it resolves
   real scene-architecture questions the wireframe's CSS mockup couldn't
   (how the satchel-picker literally renders across three stacked scenes, why
   the notebook shows through for free, and that left-click-examine on a
   receiver is new interaction, not a click-handler swap).
3. Tell me which tier (1/2/3, as laid out in the handoff) you'd build now
   versus stage for later, and flag the two Tier 3 open calls (selection-state
   sharing shape, and whether aria-live is in scope for this pass or its own
   follow-up) before writing code against them.
4. Run each piece through the agents/ui-builder.md + agents/ui-verifier.md
   loop, gated on a real phaser/tools/playtest.mjs screenshot. Load
   frontend-design, ui-ux-pro-max, wcag-checker, and
   input-keyboard-mouse-touch before implementing.

Wait for my answers before building anything.
```
