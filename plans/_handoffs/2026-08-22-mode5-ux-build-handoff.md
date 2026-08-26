# Handoff — Mode 5 UX build (wireframe → shipped Phaser screens)

Paste the block at the bottom into a new session. Everything above it is context
for a human deciding what to do next.

**Written 2026-08-22 · capstone Tue 2026-08-25 — 3 days out**

---

## State

The wireframe is fully decided. Five revisions, all eight open questions ruled
on by Roc, every section in `phaser/tools/screen-flow/mockups/mode5-ux-flow-wireframe.html`
is either "approved as shown" or "decided (revision N)." Nothing left to design
in that document — this handoff is for building it, not deciding it further.

## Build tiers, by size and risk

**Tier 1 — ship first. Small, zero new data model.**
- §4 HUD nav row (`CollectScene.ts` nav row → icon clusters)
- §5 Traversal lock label (`TraversalRow.ts` pill text)

Both were "approved as shown" from the first pass, before any of the
revision-4/5 decisions. Pure layout and copy changes against code paths the
wireframe's own notes already name.

**Tier 2 — medium. Mostly UI, each touches one small real hook.**
- §2 Cast picker → book-page treatment (`HedgeCastPrompt.ts`)
- §6 Notebook mask — `???` until `hasSeen()` (`NotebookScene.ts` `drawIndexPage`
  — the gate already exists in code, only what renders needs to change)
- §6 Trial cast, both pools at once (`SpellTrialScene.ts` — needs `view.banked`
  threaded in, per the wireframe's own note on that gap)
- §8 Home Hub palette icons + "X of Y found" counter (`HubScene.ts`
  `drawPalette` — the denominator is already computable, just not shown)
- §8 Home Hub piece-select actions + chrome regroup (`HubScene.ts`)
- §3 Hint-strength Options setting (new `PlayerSettings.ts` key, same shape as
  the two it already persists) — **flag this one specifically:** §3 itself was
  never explicitly confirmed by Roc the way the revision-4/5 items were. §7's
  drop-confirmation setting reuses its shape, so building §7 as decided
  effectively requires standing up §3 too — worth surfacing to Roc rather than
  assuming it's settled by association.

**Tier 3 — real feature work, not screen porting.**
- §7 Satchel drop + move (needs a real `Inventory.ts` removal/move method,
  two-sided against `LanternPlayer`'s ink-side pool — the wireframe flags this
  explicitly as "not just a UI change")
- §8 Shelf close-up scene + sixteen-cubby multi-slot surfaces (needs
  `Decor.ts`'s surface model expanded, a real Lantern region-authoring pass
  against the backdrop, and the front-on shelf art exported for real — the
  wireframe's shelf is CSS standing in for art that doesn't exist yet)
- §8 Room zoom/pan (new camera interaction; a real drag-piece-vs-drag-room
  conflict to resolve; open call on whether it reuses `PanModel.ts`'s math or
  is built fresh)
- §8 chest/counter/table surface geometry (needs the Lantern region editor,
  not another hand-eyeballed rect)

## Why tiers, not "build all of it now"

Capstone is 2026-08-25. The Amended DoD is save/restore, one week playable,
soul storylines — none of which this wireframe touches. `CONTEXT.md`'s own
rule: `phaser/` "may not gate Track A or compete with Track B for review
time." And the original wireframe handoff's rule was "nothing here should get
picked up as urgent capstone work without Roc saying so explicitly, three days
out" — he has now said so, explicitly, at exactly that three-day mark, which
is why this handoff exists at all. But Tier 3 is multi-day feature work in its
own right — new art, new data models, new camera code — not a screen port.
Building all three tiers before Tuesday is optimistic. **First move for the
new session: confirm with Roc how far to go before capstone.** Tier 1+2 is
realistic in the window; Tier 3 likely reads better as the post-capstone pass
the original handoff already expected for everything except §4/§5.

## The build loop already exists — use it

Two agent seats are already staffed for exactly this:
[`agents/ui-builder.md`](../../agents/ui-builder.md) (mockup + spec → shipped
scene) and [`agents/ui-verifier.md`](../../agents/ui-verifier.md) (independent
fidelity-and-gate verdict, findings only, never fixes). They run as a loop —
Builder builds, Verifier grades from a real `playtest.mjs` screenshot (never
source alone), fixes go back to the Builder, repeat until `clean`, then Roc
gates it. Read [`agents/README.md`](../../agents/README.md)'s "UI pair"
section for how the loop enters at either seat.

**One gap to bridge:** `ui-builder.md` expects a mockup at
`phaser/tools/screen-flow/mockups/<screen>.html` — a real per-screen file.
`mode5-ux-flow-wireframe.html` is a cross-cutting flow spec, not a per-screen
mockup; its own masthead says to read it *alongside* `satchel.html`,
`spellbook.html`, `save-load.html`, `options.html`, not instead of them. For
each screen going into the Builder, hand it the wireframe's relevant decided
section as the spec, plus whichever of those per-screen mockups already
exists for that scene. Don't force a new single-purpose mockup file into
existence first unless a Builder run actually turns out to need one.

Both seats judge against one design system:
[`gdd/14-visual-style-guide.md`](../../gdd/14-visual-style-guide.md) (the
ruling doc) and `phaser/tools/screen-flow/mockups/design-system.html`
(rendered). Read the rendering-lessons checklist in
[`plans/_handoffs/2026-08-19-ui-migration-handoff.md`](2026-08-19-ui-migration-handoff.md)
before either seat runs — every render bug this project has paid for (a
`setMask` bleed, a container draw-order flip, a particle 2×-anchor bug) was
`tsc`-clean and `vitest`-green. Only a screenshot caught any of them.

## Skills to load, not skip

- **`frontend-design` and `ui-ux-pro-max`** — for any layout, typography, or
  interaction judgment the wireframe left to whoever builds it: the cast
  picker's exact book-page proportions, the shelf close-up's real cubby
  geometry, the room-zoom control feel. The design system is the ceiling, not
  a replacement for judgment.
- **`wcag-checker`** — run against every built screen. This is a canvas game,
  not DOM, so translate rather than check literal markup: color contrast (the
  wireframe's own hint-pill and `grp-lbl` gold-on-parchment treatment is a
  real risk flagged during the mockup pass, never verified against real
  numbers), nothing signaled by color alone (the traversal lock already pairs
  color with text plus a `?` reveal — keep that pattern), a non-hover path for
  anything hover-only (the HUD nav row's tooltip-on-hover needs a
  keyboard/gamepad equivalent), and a non-drag path for anything drag-only
  (move-between-pockets, decor-piece drag, room pan).
- **The relevant Phaser skill for each mechanic, loaded before hand-rolling
  it** — `CONTEXT.md`'s own rule, with a real cost behind it: Phaser 4 dropped
  classic `setMask` in WebGL, and a skill would have caught that before it
  shipped broken. `cameras` before touching room zoom/pan (confirm whether
  it's a real Phaser camera zoom or a hand-rolled transform, and whether
  `PanModel.ts`'s math actually reuses cleanly). `input-keyboard-mouse-touch`
  before the drag-piece-vs-drag-room conflict and the satchel move gesture.
  `tweens` for the VN beat and any zoom/pan easing. `text-and-bitmaptext`,
  `graphics-and-shapes`, `groups-and-containers`, `scenes`, `data-manager`,
  and `events-system` as each screen needs them.

## Team plan

This is collaborative, usage-heavy, multi-screen work — a real candidate for
the game-project's Claude team plan rather than Roc's personal usage. Flag it
to Roc rather than assuming either way.

The independent screens (cast picker, notebook, satchel, home hub are
separate files with little shared state) are a real fit for a parallel
multi-agent workflow if Roc wants the wall-clock down. Don't self-authorize
one from this handoff — that needs Roc's own words in the new session.

## Facts worth not re-deriving

- The wireframe — `phaser/tools/screen-flow/mockups/mode5-ux-flow-wireframe.html`
  — is five revisions deep, everything either "approved as shown" or "decided
  (revision N)."
- Source grounding for every decision already lives inline in that file's
  notes: `NotebookScene.ts:376-379,397-414` for the `???` masking,
  `HubScene.ts:111-116,199-210` for the found-counter, `Inventory.ts`/
  `Decor.ts` for the satchel and Home Hub data-model gaps.
- `CollectScene.ts` has a hard line-count gate
  (`tests/HedgeCastPromptTraversalRow.test.ts` caps it under 900 lines) —
  extract, never raise, if wiring the HUD nav row pushes it over.
- `COLOR` tokens live in `phaser/src/ui/theme.ts`; `gold`/`ember` is menu
  chrome, `vfxGold`/`vfxEmber` is spell VFX only — crossing them re-breaks a
  repaint this project already spent a session fixing once.

---

## Prompt for the new session

```
Read ProjectOS/game-project/CONTEXT.md, then this handoff
(plans/_handoffs/2026-08-22-mode5-ux-build-handoff.md) in full, then
phaser/tools/screen-flow/mockups/mode5-ux-flow-wireframe.html (all 5
revisions — everything in it is decided, nothing left to design).

Goal: build the wireframe's decided screens in Phaser. Capstone is Tue
2026-08-25, 3 days out as of this handoff. This work doesn't touch the
Amended DoD (save/restore, one week playable, soul storylines) and must not
compete with Track A/B for review time.

Before writing any code:
1. Tell me which tier (1/2/3, as laid out in the handoff) you'd build before
   capstone versus stage for after, and why. Wait for my call on scope.
2. For whatever's in scope, run it through the agents/ui-builder.md +
   agents/ui-verifier.md loop per screen, gated on a real
   phaser/tools/playtest.mjs screenshot — not tsc/vitest alone.
3. Load frontend-design and ui-ux-pro-max for the design judgment calls, run
   wcag-checker against each built screen (canvas-translated: contrast, no
   color-only signals, no hover-only or drag-only paths), and load the
   specific Phaser skill for each mechanic before hand-rolling it — see the
   handoff's skill mapping.
4. Tell me whether this should run under the game-project's Claude team plan,
   and whether the independent screens are worth a parallel multi-agent
   workflow. I'll decide both — don't self-authorize either.

Wait for my answers before building anything.
```
