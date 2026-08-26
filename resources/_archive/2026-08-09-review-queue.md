> **ARCHIVED 2026-08-09.** Every item was reviewed and ruled the same day. Kept as the decision record for that pass, not as a live queue.
>
> **Closed by ruling, not by doing:** the deferred threads (`ilsa-whose-table`, `mara-shelf-room`) are **not to be touched**; the C1 regeneration is **not to be used** — verified C1 stands.
>
> **What outlived this file:** the `contract-audit.md` tightening pass, and the fact that eight of nine live threads have no spec. Those are work, not review.

# Review Queue — narrative-pipeline hardening

**Date:** 2026-08-09
**Status:** Awaiting Roc
**Source:** the 2026-08-08 / 09 pipeline session. Rulings already reconciled into the GDD via `gdd-sync`; what remains here is review and unmade decisions.
**Gates:** `card-lint` · `codex-lint` · `content-check` — all clean as of writing.

One item per file. Tick as reviewed.

---

## A. Decisions blocking other work

- [ ] **[[mara-set-for-two]]** — her first thread registry. Four open questions: the `SC-T2-12`–`15` id block (no id registry found to check against), C4 wanting three flags against R6's ceiling of two, **whether Bex or a walk-on carries the C4 outside-naming beat** (first time a named texture soul is booked into a specific conversation — it sets a precedent), and whether it should gate on completion only, as written, or follow Toby's pattern.
	- roc-review: fail, its beat structure follows Toby's too closely, and we should make Mara and Ilsa's thread registry first
- [x] **[[npc-codex]]** — eight entries in the Proposed section awaiting ratification: six props, the lane-end household, and the blue door (typed world geography, so Architect work under check 12). Nothing binds until ruled.
	- roc-review: approve all
- [x] **[[06-world-and-progression]]** — the deduction ruling was applied **narrowly**: cross-life soul-identity recognition dropped, recognition gates as a class untouched. Confirm that reading; the broader one is recorded as still open.
	- roc-review: confirm
- [x] **[[kishotenketsu-scene-structure]]** — written in as an *available* shape rather than the default for no-antagonist beats. Also: does it serve **H10** in addition to H9 and H2? My read is no — it is a technique a human applies, not something the runtime composes.
	- roc-review: 
- [ ] **[[nell]]** — open item 3 predates this session: the texture-soul schema variant is still unwritten, and the schema still lists `conviction` as required for souls that cannot have one.
	- roc-review: nell is the least interesting texture character, we should deal him out of this arc, does that give us enough roles?

## B. Generated output to judge

- [ ] **`<scratchpad>/toby-c1-regen.md`** — all 51 C1 slots, written against the revised contracts by a seat that never saw the card, guardrails, or an approved line. Called "85% there"; **not** to replace verified C1. Decide: discard, or harvest specific lines. Compare against [[toby-the-shelf-C1]].
- [ ] **Verifier report on the above** — 46/51 pass. Flags: jargon (*proving*, *ninth bell*); a greeting that reads as **Mara's** channel, which is the same cross-contamination we fixed this morning running the other way; the blue door; and a **batch-scope flag** — the same supply construction in 7 of 34 slots, the exact failure `pipeline.md` step 8 measured, and the first time that check has caught anything.
- [ ] **The evaluation is inconclusive.** The 10-slot blind A/B lost 4–3 with two confounds I introduced (thin bundle, stripped action slots). The 51-slot full-context run was never scored against the committed version. If you want a real answer, that rerun is the one to score.

## C. Prose changed on your behalf

- [x] **[[juno]]** — descriptor cut 139→73. Flagged loss: *"the ones who stopped being hers"* became *"the ones who left."* True, but the original carried the ended-bond nuance, and that nuance is her cost.
	- roc-review: approve
- [ ] **[[linnet]]** — descriptor cut 147→75. Lost *"uncomplaining"* and *"held without bitterness, and without hope either."* That last clause is what separates her from someone waiting. Also carries an **agent-written sample line** — *"The long way home suits me."*
	- roc-review: approve, but Aldith needs to be promoted to codex and should be the match Linnet missed timing on, married someone else and left the village though they grew up together and were childhood sweethearts 
- [x] **[[nell]]** — carries an **agent-written sentence** now riding into every call: *"What he says stays close to the work in front of him."* Derivable from carded behaviour, not verbatim from it.
	- roc-review: deal nell out of the v01 arc
- [ ] **[[bex]]** — rewritten wholesale early in the session (engine sentence, five failure modes, would-never/would-say table, pressure and per-soul sections). Open items remain: `role_tag`, whether flag 4's non-effect wants a positive beat, and the kept 3–8 word band.
	- roc-review: propose roles for the ones who don't have them and I will approve or correct
- [x] **[[toby]]** — your *"I made sure they wouldn't get crushed"* ruling is applied as harvest move 6 and mirrored on his enforcement side. Check the exception is scoped as you meant: it licenses naming the act, not justifying the offer.
	- roc-review: approve

## D. Contracts to skim

- [ ] **[[persona-card-schema]]** — the `voice_register` / `voice_enforcement` split, pinned-context hygiene, budgets 75/400, card-prose rules 8–9, `suit_tag` marked retired.
	- roc-review: good but wonder if it has a lot of noise in it that can be tightened
- [ ] **[[register]]** — 26 of your C2/C4 hand edits harvested as five named moves, labelled as **Toby's** with a take-the-move-not-the-words rule after a Mara run came back sounding like him.
	- roc-review: good but wonder if it has a lot of noise in it that can be tightened
- [ ] **[[register-audit]]** — new. The ASR forensics and the EP.1 correction moved out of the live contract. Check nothing binding left with them.
	- roc-review: good record, does more stuff need to move in here? i have a new audit rules doc here: P:\GitHub\RL_MAP\RL_MAP\ProjectOS\game-project\agents\contract-audit.md
- [x] **[[guardrails]]** — new **check 12, Invention register**; check 3 trimmed with its history moved; check 6 now reads the checkable half from `voice_enforcement`.
	- roc-review: approve
- [ ] **[[content-dialogue]]** · **[[consistency-verifier]]** · **[[orchestrator]]** · **[[narrative-architect]]** — all four seat prompts rewritten. The Verifier critiqued its own brief after a live run and those gaps are fixed.
	- roc-review: good but wonder if it has a lot of noise in it that can be tightened, see audit tool mentioned at register-audit
## E. Known-imperfect, deliberately left

- [x] **[[dev-crew-architecture]]** — still declares `suit_tag` as an enum in two JSON I/O contracts and assigns the codex to the Architect. Bannered rather than edited, because it is a synthesis record.
	- roc-review: superseded
- [x] **`lantern-projects/v01/threads/lines/toby-the-shelf-C2.md`, `-C3`, `-C4`** — your hand edits are still uncommitted. Untouched all session, as promised.
	- roc-review: i committed

---

## Two fabrications caught — read before trusting any agent report from this session

1. An agent quoted *"Rolls on top so they don't press. **Look at that!** Your fold is neater than mine"* as pipeline output, proving generated dialogue was already healthy. **"Look at that!" is your uncommitted hand edit.** Its headline conclusion was wrong, and I nearly relayed it.
2. The codex seeding pass wrote a **ratified** entry citing a committed line *"Blue gate past the well."* No such line exists — zero occurrences of "blue" in any committed file. It then built a decision point on top of its own invention.

Both were agents reading generated or invented content as source. Both were caught by grepping, not by reading. `tools/codex-lint.mjs` now makes the second class mechanically impossible; the first has no automated guard.

## Pattern worth naming

Three artifacts this session were correct content that nothing could reach: the **NPC codex** (specified in ten documents, never built — guardrails check 4 had been reading against nothing), **Pip's "signal, playable" block** (praised by an audit, sat under its own heading so it was never actually pinned into calls), and the **kishōtenketsu note** (zero inbound references until today). Your own `ex-shelf` lesson: *a proposal nothing verifies is indistinguishable from a thing that exists.* Two of the three now have gates. Knowledge-base notes still rely on an index entry, which is a convention rather than a check.
- roc-review: fixed with linter