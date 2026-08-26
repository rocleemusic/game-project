# Ruling — HUD relayout: one bar, three tenants (T14)

**Ruled by Roc 2026-08-23.** Design record — build is post-capstone per
[2026-08-23-roc-notes-triage-plan.md](2026-08-23-roc-notes-triage-plan.md) Group 5.
The visual spec is the wireframe:
`phaser/tools/screen-flow/mockups/hud-relayout-wireframe.html` — every ruled call
is stamped in it. Nothing left to design there.

## The ruling

The HUD collapses to **one centered bottom bar**. Its contents depend on what the
player is doing — three tenants, one shell:

1. **Explore** — the five nav icons (Satchel, Notebook, Home, Calendar, Options),
   keeping `NavRow.ts`'s shipped language: 44px tiles, three clusters with
   hairline dividers, hover/Tab tooltips, in-tile hotkey letters. Movement is
   clickable screen regions on the painting, not buttons.
2. **Casting (world-cast path)** — the satchel chips replace the icons in the same
   bar shell, plus an Exit-cast pill (Esc). This is the cast-flow redesign's
   Option A ("the satchel strip is the picker") carried into the HUD — never two
   docked strips at once. The notebook trial dock is unchanged.
3. **Dialogue** — the VN control set replaces the icons. Nav hides so nothing
   competes with choices. Pairs with the Group 2 item "VN dialogue buttons hidden
   unless dialogue active": that item hides them in explore, this ruling says
   where they live when shown.

## The five detail calls

- **Tooltips open above the bar.** No persistent Decorate caption — bottom-center
  placement carries the discoverability the caption was for.
- **Clock plaque stays top-left (Option A)**, untouched. Short bar, zero build
  cost on the plaque. The screen name keeps its home there.
- **Dev pills stay top-right**, owning the corner the old NavRow vacates
  (dev builds only).
- **Tenant swaps are instant.** No crossfade.
- **Top-right corner is otherwise empty** — the painting owns it.

## Build notes (when it builds)

- `NavRow.ts` survives as the icon/tile/tooltip component — the change is anchor
  (bottom-center via a new `opts` shape or a thin wrapper) plus tooltip direction
  (above instead of left). Keyboard Tab-focus behavior carries over as-is.
- The tenant swap wants a small owner (a `HudBar` that mounts one of three
  tenants) rather than three scenes each drawing their own bar.
- Coordinate with the cast-flow redesign build
  ([2026-08-23-cast-flow-redesign-build-handoff.md](_handoffs/2026-08-23-cast-flow-redesign-build-handoff.md)):
  its world-cast picker and this bar's cast tenant are the same surface. Whoever
  builds second inherits the other's satchel-strip render.
- "Movement = clickable screen regions" overlaps T11 (examinable-per-screen
  authoring) — move regions are authored geometry too. The region editor is the
  shared tool.
