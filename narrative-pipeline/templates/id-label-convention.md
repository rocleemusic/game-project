# Id and label convention

Closes `GP-114` (ruled by Roc 2026-08-09: "approve the recommendation of a human-readable label"). Two failures in the shelf run trace to ids nobody could scan: a density note miscounted its own options, and QA had to state that it is node 3, not node 2, that gates on `shelf_seen` — the brief's own author had lost track. This document is the fix, and it binds every design document from here on: thread docs, line files, briefs, QA notes.

**The machine ids do not change. At all.** Roc declined shortening the stack: the ids are load-bearing in `../../tools/resolver/data/scene-graph.json`, the ink emission, `graph.json` and the Lantern fixtures, and they appear in save state — so any change is a migration that puts save/load across a reshuffle back in play. Legibility is added where reviewing happens, the way the mermaid graphs already carry a gist per node ([`../../agents/choice-designer.md`](../../agents/choice-designer.md)). The JSON does not need to be pretty; the review surface does.

Who reads this: the Choice designer (mints node and option ids and every gist), Lines (mints slot ids), QA and anyone writing a note that cites an id.

---

## The stack, decoded once

So that no reader ever has to reverse-engineer `L-CH-T2-09-2-a-1-b-r2` again:

| Segment | Means | Minted by |
|---|---|---|
| `L-` / `A-` / `O-` | Content slot: line / action / object | Lines (`L-`) · Choice designer (`A-`, `O-`) |
| `CH-T2-09` | Choice node's home: `CH-<screen>-<scene seq>` | Code, per [`choice-node-schema.md`](choice-node-schema.md) |
| `-2` | Choice node 2 in the scene | Choice designer |
| `-a` | Option a of that node | Choice designer |
| `-1` | **Nested child node 1 inside option a** (`parent_option`) — not a sibling | Choice designer |
| `-b` | Option b of the child | Choice designer |
| `-s` / `-p` / `-act` / `-r1..r3` | Slot role: set-up · player line · deed · response n | Lines |
| one trailing selector | Variant — see below | Lines |

The trap in the middle row is the whole reason labels exist: `-a-1-b` (nesting) and `-1-a-b` (never legal, but visually identical in passing) read the same at a glance. The id cannot show the difference without a migration, so the label must.

---

## The label

**Form:** the id in backticks, an em dash, the gist — the same gist the mermaid node or option label carries, verbatim.

> `CH-T2-09-3` — the trade connects to the shelf

**One gist per id, minted once, in the graph.** The Choice designer writes it into the mermaid label; every later mention reuses it word for word. Reason: the graphs already carry a gist per node, so inventing a second phrasing per document creates exactly the drift this convention exists to end — two names for one thing is how the density note miscounted.

**Where a label is required:** the first mention of an id in any prose section of a design document — content blocks, QA notes, flag rationales, return summaries. Later mentions in the same section may go bare. Exempt: table rows whose text column already shows the content, mermaid labels (they *are* the gist), and JSON/ink, which stay machine-only. Reason: the label is for the reader arriving cold at a sentence; a table row or graph node already tells them what the id is.

**Spoken vs deed follows the mermaid rule:** quote the gist for a spoken option ("asks about the extra rolls"), no quotes for a deed (keeps packing, lets them pass).

## The nesting readout

Any id whose tail crosses into a nested child additionally carries a segment-by-segment readout in parentheses, one `›` per segment past the node:

> `CH-T2-09-2-a-1-b` (node 2 › option a › child 1 › option b) — "presses what the giver did to earn them"

The word **child** is mandatory. Reason: it is the one word the raw id cannot carry — `-a-1-b` collapses "option a's child node 1, its option b" into three characters that look flat, and that collapse is what QA spent a session untangling. Slot tails join the readout in the same words: `-r2` reads `response 2`, `-s` reads `set-up`.

The readout is required wherever a label is required *and* the id contains a nested child; flat ids need only the gist. In graphs, nesting is already visually distinct — the subgraph titled with the parent `option_id` — so graphs never need the readout.

## Variant suffixes

A slot has variants when one slot id needs more than one authored text, selected at runtime — the leave-taking that plays differently on the divert path, the quiet set-up that plays differently by what the player knows. Revision 1 of the slot-id scheme said nothing about this, so two files invented two schemes (C2's `-s-norm` / `-s-div`, C3's `-s-both` / `-s-repaid`). One scheme, from here on:

**A variant id is the base slot id plus exactly one selector segment, and the selector names the condition that picks the text.**

- **Path variants** — the selector is the path, in a fixed two-word vocabulary: `-norm` (the gather path) and `-div` (the divert path). Nothing else, ever. Reason: which path selects the text is the whole condition, and two fixed words cannot drift.

  > `L-CH-T2-09-6-s-div` — set-up when arriving off the divert, "Let's see, what's next..."

- **State variants** — the selector is the knowledge flag that must be known for that text to play, **flag name verbatim**; when the condition is two flags, both names joined by `-and-` (**ruled by Roc 2026-08-09**). Under this rule C3's pair would have been minted `-s-shelf_seen-and-repaid_seen` and `-s-repaid_seen`. Reason: `both` / `-repaid` name a shape, and a shape means nothing once a third file uses it; the flag name *is* the condition, so a reader checking "which text gates on `shelf_seen`" reads the answer off the id — the exact question QA had to answer by hand this session.

  **Why `-and-` and not `+`.** The ink address rule is *lowercase; non-alphanumeric → `_`* (`tools/resolver/src/ids.ts`). Flag names already contain underscores, so `+` would collapse into the same character that separates words *inside* a flag name — `-shelf_seen+repaid_seen` and `-shelf_seen-repaid_seen` both address as `_shelf_seen_repaid_seen`, and the boundary between the two flags is gone. `-and-` addresses as `_and_`, which survives as a readable, unambiguous boundary. Any joiner chosen here must be checked against that rule before it is used.

- **When a slot varies, every variant carries a selector — no bare base id sits beside variants.** Reason: a bare base next to selectored siblings reads as a third text half the time; the count must be readable from the ids alone.

- **A slot wanting both a path variant and a state variant surfaces to Roc.** That is four or more authored texts on one slot; the cost decision is a gate decision, same shape as a fourth option.

- **Variant labels** carry the selector spelled as its condition: `L-CH-T2-10-3-s-repaid_seen` (set-up · plays when `repaid_seen` is known, `shelf_seen` is not) — quiet fallback.

**Grandfathering:** the four existing variant ids (`-s-norm`, `-s-div` in C2; `-s-both`, `-s-repaid` in C3) stand — they are already in `scene-graph.json`, so renaming them is the migration Roc declined. They are the last of their kind: every id minted after 2026-08-09 follows this scheme.

---

## What this convention refuses

- No change to any machine id, anywhere, for legibility. The label is the legibility layer; the id is the address.
- No second gist. If a node's gist is wrong, fix it in the graph and let every citation inherit the fix.
- No new variant vocabulary. A selector is `norm`, `div`, or a flag name. A writer wanting a third kind has found a schema gap and escalates it; inventing a suffix is the drift this document exists to stop.
