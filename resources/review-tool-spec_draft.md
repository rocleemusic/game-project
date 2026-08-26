# Review Tool Spec — draft (S5 of the branching-dialogue spec phase, [`../plans/2026-07-28-branching-dialogue-spec-phase.md`](../plans/2026-07-28-branching-dialogue-spec-phase.md))

**Status:** spec draft, 2026-07-29, rewritten plain at Roc's direction. The build (Phase 3) is gated on Roc's review of this spec. Working name: **Lantern**, after the Arch. Rename freely.

**What it is.** A local web app with two jobs on one screen:

1. **Graph review.** See the level map and every dialogue tree as nodes. Approve, flag, or edit each one.
2. **Greybox playtest.** Play the compiled story over placeholder screen art with clickable regions. The graph rides beside the play pane and shows where you are. Jump to any branch. Roll back. Take the other path.

The tool reads what the resolver exports and what inklecate compiles. It writes two small files of its own. It generates nothing.

---

## Inputs and outputs

| File | Direction | Source | What it holds |
|---|---|---|---|
| `graph.json` | in | the resolver (Phase 2) | Screens, gates, connections. Per-scene dialogue trees with choice_nodes, options, state_actions, and conditions. Every minted ID with its derived ink address. **The tool never rebuilds structure from compiled ink.** graphink tried that road and shows why it is hard. The pipeline already owns the graph as typed data. Shape pinned below. |
| `story.ink.json` | in | inklecate | The compiled story. inkjs plays it. Play only — never structure. The `#screen:` / `#choice:` / `#opt:` tags plus the per-line `id` tag (build-loop.md) map the running story onto the graph. |
| `day.json` | in | the resolver | One resolved day: seed, NPC slot fill, item rolls, live leads. Playtest shows a real day; a re-roll shows another. Shape pinned below. |
| `manifest.json` + `images/` | in | Roc / art track | One image path per screen: `{ screen_id: "images/t1.png" }`. Nothing else. Regions always come from the screen_spec through `graph.json` — one source, and the manifest never carries geometry. A screen with no image falls back to text buttons. The tool never blocks on art. |
| `approvals.json` | out | the tool | `artifact_id → { status: approved \| flagged \| edited, note?, timestamp }`. An `artifact_id` is any minted pipeline ID (`screen_id`, `scene_id`, `choice_id`, `option_id`, `content_id`). The tool adds no ID space of its own. **`approved` and `edited` both pass the gate** — an edit is approval-as-changed. Only `flagged` holds a thing back. The file lives in the run folder the tool opened at launch ("active" means the open one). The Orchestrator reads it as the human-gate record. |
| `edits.json` | out | the tool | Text patches: `{ target: content_id \| "<choice_id>.<field>", old_text, new_text, timestamp }`. The resolver applies patches on its next pass — compile → edit → patch → retire, the GDD workflow's shape. Three rules: a patch whose `old_text` no longer matches is rejected and surfaced, never silently dropped or forced; a patch whose target no longer exists lands in an orphan report at the same surface; two patches to one target apply in timestamp order, later wins. A regenerated graph never eats an edit silently. A stale edit never eats regenerated content silently. |

**Pinned shapes** (v1 contract — the resolver writes these, milestone 1 reads them):

```
graph.json: { screens: [ screen_spec fields + { ink_address } ],
              seams: [ { from, to, name } ],
              scenes: [ { scene_id, soul, screen_id, ink_address,
                          lines: [ { content_id, slot_type, speaker_id, text } ],
                          choice_nodes: [ choice_node fields, options inline ] } ],
              variables: [ { name, declaration, readers: [ids], writers: [ids] } ] }

day.json:   { seed, day, slot_fill: [ { screen_id, time_block, soul } ],
              item_rolls: [ { slot_id, item | "empty" } ], live_leads: [ids],
              aliveness_band }
```

## Mode A — graph review

- **Level view.** Screens as nodes, placed by location: Town cluster, Forest cluster, the seam edge between. Edges are connections. Locked screens carry a gate badge with archetype and key. Hover a screen to see today's slot fill from `day.json`.
- **Scene view.** Click a screen to see its scenes. Click a scene to see its dialogue tree. **Flow runs left to right; sibling options stack vertically** (Roc, 2026-07-29) — so a choice node's options read as a vertical stack, the same way the game's choice list renders them, and depth advances rightward, which suits wide text cards. Choice nodes fan out to their options (the player_line text sits on the option node), then responses, then the gather or divert. Conditions and state_actions show as small chips on edges and nodes.
- **Level view has no flow axis.** It is spatial: Town cluster, Forest cluster, the seam between — geography, not sequence.
- **Variable inspector.** A side list of every state variable, each with its readers and writers, fed by `graph.json`'s `variables` block. Click a variable and its nodes light up.
- **Per-node controls**, on every node — screens, scenes, choices, options, lines:
  - **Approve.** One click. Writes `approvals.json`. Approve-with-note writes `flagged`.
  - **Edit in place.** Click the text, type, done. Writes `edits.json` and marks the node `edited`. Roc's edit is the approval. Editable: line text, player_line, option labels, notes. **Not editable here: structure.** Adding or removing options, rewiring edges, and changing conditions go through the specs and the pipeline. The tool edits words, not structure (v1 boundary).
- **Review sweep.** A filter that shows only unreviewed and flagged nodes, so a pass over a new batch is a short list, not a hunt.

## Mode B — greybox playtest

- **Stage.** The current screen's image. Regions from the screen_spec draw as soft outlined hotspots: item slots, examinables, exits. Click a slot that rolled an item to pick it up; a placeholder sprite or text chip joins the satchel strip. No image means the same interactions as a stacked text-button list.
- **Presence.** NPCs stand in today's slots (from `day.json`) as simple markers. Click one to Converse; play enters the ink flow at the mapped knot.
- **Dialogue.** inkjs plays the story. A spoken option renders as its player_line — the quoted words. An unspoken option renders as its bracketed deed: `[Pick up the trays]`. Both come straight from the ink weave. Neither is ever a feelings label (the two option shapes, `choice-node-schema.md`).
- **The node toggle.** The graph pane rides alongside, or flips full-screen. The current knot glows. The visited path holds a warm trace. Unvisited branches stay dim. **Click any node to jump there** (`ChoosePathString`). The tool snapshots inkjs state at every choice, so jumping back to take the other branch is a snapshot restore — instant, no replay. A seed control re-rolls the day without restarting the app.
- Review and playtest share one surface. Mid-playthrough, any line can be edited or approved on the graph pane.

## Design direction

Skills loaded before this section and again before the build: **frontend-design**, **ui-ux-pro-max**. Reference set: `C:\Users\rocle\Desktop\tool-visual-ref` — seven website and game-UI clips (two painterly wellness pages, a dark-and-parchment audiobook storefront and its detail page, a dark cozy game landing, an in-game paper calendar, a quiet Shinto editorial page). **Reference only. Copy nothing** — no asset, layout, or palette value lifts from them. They calibrate rhythm, type contrast, and warmth.

What the refs agree on: warm paper surfaces; a deep warm dark for atmosphere; classical serif display type, spent sparingly; one ember accent; tactile object-like UI; editorial white space with hairline rules instead of heavy chrome.

- **Two surfaces, one identity.** The graph canvas is **night**: a deep warm dark (charcoal with a brown-violet undertone, never blue-black), where nodes sit as small lantern-lit paper cards. Panels — inspector, play stage, dialogs — are **parchment**: warm paper neutrals. Canvas is the world at night; paper is the desk.
- **The signature: lantern light as state.** One warm amber accent carries every "alive" meaning. The current position glows like a lantern. The visited path keeps a faint warm trace. An approved node takes a small pressed wax-seal mark. This is the one aesthetic risk, spent in one place. Everything else stays quiet.
- **Type.** A classical serif display for screen and soul names only. A quiet humanist sans for UI and node text. A mono for IDs, predicates, and state chips. Body at 16px or larger, line-height 1.5 or more.
- **Status colors stay muted.** Flagged is a dry clay red. Edited is a graphite note. Pending is untinted paper. The amber accent never means error.
- **Spacing is generous, rules are hairline.** The tool should read like a well-set page that happens to contain a graph, not an IDE.
- **Token values come first in the build.** The concrete palette, type scale, and spacing scale are milestone 1's first deliverable, derived from this direction and contrast-checked against the floor below before any component is styled. The spec fixes direction; the build fixes values.
- **Floor (non-negotiable):** 4.5:1 text contrast on both surfaces. Visible focus rings. Full keyboard navigation: tab through nodes in reading order, enter opens, `a` approves — but only while a node has focus and no text field is open; inside an edit, every key is text. Touch targets 44px or larger. `prefers-reduced-motion` respected: the lantern glow becomes a static amber ring. Cursor-pointer on everything clickable. No hover that shifts layout.

### Visual states (per element: idle → active → resolved)

| Element | Idle | Active / hover | Resolved |
|---|---|---|---|
| Node (any) | paper card, hairline border | lifted: warmer border, soft shadow, pointer | approved: wax-seal mark · edited: graphite corner-fold · flagged: clay tick |
| Current play position | — | lantern glow (reduced motion: static amber ring) | visited: faint warm trace on node and edge |
| Unvisited branch | dim, 60% paper | full opacity on hover | — |
| Edge with condition | hairline + mono chip | chip expands to the full predicate | satisfied in the current playthrough: warm; unsatisfied: unchanged |
| Item slot region (stage) | soft dashed outline | solid outline + pointer | picked: outline empties; chip joins the satchel strip |
| NPC marker | simple silhouette + name | name + "Converse" affordance | conversed today: small check by the name |
| Editable text | as rendered | caret + underline on click | saved: brief graphite confirmation, then rest |

## Tech

Decided in planning; re-argue at build only if something breaks. Vite + React + TypeScript. **React Flow** for both graphs, with **dagre/elkjs** auto-layout. **inkjs** for play. Plain CSS custom properties for the tokens — no UI framework; the identity is bespoke and small. File access through Vite's dev middleware: it reads the open run folder and writes `approvals.json` and `edits.json`, local only by construction. No network calls. No LLM. Nothing leaves the machine.

## v2 backlog (ruled additions, not in v1)

- **Branch comparison view** (Roc, 2026-07-30): restoring a snapshot keeps rolling the transcript back (ruled — the transcript is the story so far); a v2 view may show both branches side by side, greyed, for comparison.
- **Rehome the snapshot breadcrumb buttons** (Roc, 2026-07-30): their current placement is awkward. **Ruled: live with it until the rebuild finishes** — not a blocker, revisit as part of that pass rather than as a one-off move now.
- **Settings drawer in the app** (Roc, 2026-07-30 — building now, promoted from the token sheet): a file-menu/button panel that live-edits the design tokens (colors, text size, radius), persists, and exports CSS.

## Non-goals (v1)

- Not a structure editor. Options, edges, conditions, and screens change through the specs.
- Never writes generated or canonical artifacts — no `.ink`, no `graph.json`, no `content_lines`. Its only outputs are its own two record files. The resolver owns applying them.
- No LLM in the tool. Generation stays in the pipeline behind the Orchestrator.
- Not shipped software. A desk tool: no auth, no deploy, no mobile. Keyboard-and-mouse desktop; it should merely not break at smaller widths.

## Build milestones (Phase 3, gated — each lands reviewable)

1. **Tokens + graph mode** on `graph.json` alone: level and scene views, the inspector, all visual states rendered with mock statuses. Tokens contrast-checked first.
2. **Play mode:** inkjs, tag mapping, the node toggle, snapshots and jump.
3. **Approve + edit:** `approvals.json`, `edits.json`, and one proven resolver round-trip — edit, regenerate, edit survives.
4. **Greybox stage:** images, regions, pickups, `day.json` presence, seed re-roll.

**Acceptance:** review Line 04's choice node; edit one player_line in place; the edit survives a regeneration; play both branches through the node toggle without replaying the scene; and complete the whole pass keyboard-only at least once.
