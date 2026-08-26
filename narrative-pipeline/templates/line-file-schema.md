# line_file Schema

This schema exists because nine different writers each did something reasonable and slightly different, and the drift only surfaces when something mechanical — the scene-graph importer — reads the files positionally. A human skimming any one line file can tell what each column means from context; an importer reading column 4 as `text` cannot, if the file next to it put `speaker` in column 4 instead. Three column-order variants and three spellings of the count-column header existed across the 30 line files in `lantern-projects/v01/threads/lines/` before this schema. This is the fix: one column order, one header spelling, one rule for when a `speaker` column exists, stated once so the next file follows it without guessing.

## The canonical table

Every content table in a line file uses this column order and this exact header spelling:

```
| slot id | slot_type | tone | text | W | speaker_intent |
```

Chosen by majority survey evidence across the 30 files (2026-08-10 migration): **26 of 30 files** (867 of the corpus's ~900 authored rows) already used this order — `slot id`, `slot_type`, `tone`, `text`, count column, `speaker_intent`, with the count column following `text`, not preceding it. Only `toby-the-shelf-C3` put the count column before `text`; that file is now normalized to match.

**Count-column header spelling: `W`.** Three spellings existed — `W` (12 files), `words` (8 files), `w` (7 files, before this migration lowercased in `toby-feast-short` and `toby-kept-and-returned` C1–C2) — plus 3 files with no count column at all (the gated `toby-the-shelf` C1/C2/C4). `W` is the plurality spelling and now the only one. It counts the whitespace-token count of the `text` cell — see below.

## The `speaker` column — when it exists, and why

**Default: no `speaker` column.** Most conversations have one soul carrying every `dialogue` slot. That default speaker is named once in the file's front matter (`**Speaker for all `dialogue` slots:** ilsa` or similar), and it is never repeated per row — a column that says the same word 40 times in a row is not information.

**A file may have a second soul speaking occasional lines without a `speaker` column**, if the front matter names the exceptions once: `**Speaker per `dialogue` slot:** mara, except these, which are `bex`: L-CH-T2-24-2-s1, L-CH-T2-24-2-s2, ...`. Any speaker other than the file's default is then marked inline in that row's `speaker_intent` cell with a `*(name)*` prefix, e.g. `*(bex)* He says what the drawer is for...`. `mara-said-out-loud` is the worked example: two carded souls, no `speaker` column, because a short exception list in the front matter says everything an importer or reader needs.

**A `speaker` column is added only when speaking genuinely alternates within the same table** — a real back-and-forth where a front-matter default-plus-exceptions list would have to name most of the rows, defeating the point of having a default. Two files in this corpus meet that bar: `toby-kept-and-returned-C3` (Toby and Mara are both on screen for the whole conversation, trading lines) and `toby-the-shelf-C4` (a walk-on speaks directly across the same table from Toby, table by table). When present, `speaker` sits directly after `tone` and before `text`:

```
| slot id | slot_type | tone | speaker | text | W | speaker_intent |
```

Checked against the four evidence cases named for this migration:
- `toby-kept-and-returned-C2` — Mara only on screen (front matter states this explicitly, "sanctioned by Roc"). No alternation, no `speaker` column. Correct under the rule.
- `mara-said-out-loud` — Bex appears and speaks, but as the front matter's named exception list, not table-wide alternation. No `speaker` column. Correct under the rule.
- `toby-the-shelf-C4` — a walk-on (Marta) trades lines directly with Toby inside the same tables. `speaker` column present. Correct under the rule.
- All other files — single speaker throughout, no column, consistent with every case above.

A walk-on with no card (e.g. Marta) still gets a `speaker` value when the column exists — the column marks who says the line, not who has a card. A walk-on's `speaker_intent` cell stays `—`, since there is no card to check the line against.

## `slot_type`

Exactly one of: **`dialogue` | `action` | `object` | `player_line`**.

**`surface_action` is not a slot type.** It is a `choice-node-schema.md` field on an *option* — the diegetic-deed phrasing for an unspoken option (`[Pick up the trays]`). It has nothing to do with a line file's `slot_type` column, and the two must never be confused. This is not a hypothetical warning: it happened once, leaked into a worked example, and had to be corrected. If you see `surface_action` anywhere near this column, it is a mistake — fix it.

## The count column (`W`)

Counts the words of the `text` cell for that row — nothing else. **It must be recounted any time the text cell changes.** A stale count is a defect the same way a stale slot id would be: the importer and any downstream ceiling check (dialogue 40 · action 60 · object 60 · player_line 12) both read this column, not the prose.

### The counting convention (ruled 2026-08-11 — Roc)

Before this ruling the convention was unwritten, and the files did not agree with each other. Measured on `toby-the-shelf-C3`: **15 of 37 rows** disagreed with any single candidate rule, and disagreed *in both directions* — `Toby laughs once.` was stated as 4, `Toby shakes out the folded cloth and folds it again the same way.` as 12. No rule fit, because there wasn't one. These three settle it:

1. **The `**[action]**` prefix does not count.** It is a render marker, not text that plays.
2. **Square brackets around player-directed action do not count, and neither does the bracket punctuation.** Only the words inside them count — `[Lean on the counter next to him and stay there.]` is **10**.
3. **A contraction is one word.** `you're` is 1, not 2. This matches the corpus measurement the bands were sized against (median turn 5–7 English words); counting contractions as two would silently inflate every band.

Everything else is whitespace tokens of the `text` cell after the marker and brackets are removed. Punctuation attached to a word does not make a second word.

**This column is now machine-checkable, which is the whole point of ruling it.** A count that disagrees with its own text is a defect, and unlike before, a gate can say so.

## `[action]` prefix, quotation marks, and where metadata may live

- **Every non-dialogue slot (`action`, `object`) is prefixed `**[action]**`, once, at the start of the cell.** `dialogue` and `player_line` cells are never prefixed this way.
- **Spoken text — `dialogue` and `player_line` — is wrapped in quotation marks.** A `dialogue` cell is never a mix of narration and quoted speech in the same cell; if a beat needs both a narrated gesture and a line of speech, the narration is its own `action` row, not nested prose inside the dialogue cell. (This migration's Step 6 fix in `toby-the-shelf-C3` is the corrective example — see the migration record.)
- **A routing note, aside, or piece of authoring metadata belongs in `speaker_intent`, never inside the `text` cell.** The `text` cell is exactly what plays; anything about why it plays, who it's really aimed at, or how it should land goes in `speaker_intent`. A `text` cell carrying bracketed authoring commentary is a defect.

## The file's front matter (header block above the table)

Every line file's header block, above the first table, must carry:

- **Conversation identity** — which conversation (C1/C2/...) and its scene id (`SC-<screen>-<seq>`), and what it carries from the thread doc (which run/beat).
- **Structure source** — the thread document section this file's structure comes from, who approved the graph, and confirmation nothing structural was altered.
- **Soul(s)** — which soul(s) this file writes for, with a link to the cast card(s), and the ceilings applied (dialogue 40 · action 60 · object 60 · player_line 12).
- **Default speaker declaration** — for any file without a `speaker` column: which soul carries `dialogue` slots by default, and any named exceptions (see the speaker-column rule above).
- **Render convention** — the `[action]`-prefix and word-count-column statement (may be a single sentence, as most files already carry).
- **Incoming states / gating** — what prior knowledge or flags this conversation reads, and what it does not.
- **Staging vocabulary** — the physical/staging nouns available to this conversation, where relevant.

## What this schema refuses

- No positional-parsing ambiguity: one column order, one header spelling, applied to every table in every line file.
- No `speaker` column as decoration — it exists only where genuine per-row alternation would otherwise force a front-matter exception list onto most of the file's rows.
- No `surface_action` inside a line file. That field belongs to the choice node, not the line.
- No authoring metadata, routing notes, or asides inside a `text` cell. `speaker_intent` is where that lives.
