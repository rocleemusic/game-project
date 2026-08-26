# Ruling — Item descriptions content pass (T17)

**Ruled by Roc 2026-08-23.** Design record — build post-capstone per
[2026-08-23-roc-notes-triage-plan.md](2026-08-23-roc-notes-triage-plan.md) Group 5.

## The ruling

**Voice: the mage's field notes.** Every description reads as the player-voice
observing — notebook-entry register, fitting the satchel/notebook framing and
T15's loosened register. Not neutral narration, not NPC quotes.

**Scope: every record in `content/`** — items, key items, magic — gets a
rewritten description through the pipeline with the usual human gate.

**Future extension (recorded, not built): NPC-sourced additions.** Talking with
NPCs can later append what they told you about an item to its entry — the field
notes grow. Descriptions should be written so an appended "what Ilsa said" line
reads naturally under them. No build work now; just don't write descriptions
that close the door on it.

## Build notes

- Runs after the `register.md` rewrite (T15) so the player-voice it uses is the
  ratified one — the register's player voice (Roc+Frieren blend) is the anchor.
- Each `content/` folder's `_index.md` schema rulings still govern structure;
  this pass changes description text, not schemas. Verify with
  `node tools/content-check.mjs` as usual.
- Pipeline route: Content Agent generation, Verifier, human gate — same loop as
  dialogue, batched per content folder.
