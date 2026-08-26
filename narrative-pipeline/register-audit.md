# Register — audit record

Forensic history moved out of [`register.md`](register.md) and [`guardrails.md`](guardrails.md) on 2026-08-08 so the live contracts carry only live rules. Nothing here is binding on its own; the conclusions that still bind are restated where they bind, with pointers back to this file. Every dated ruling and attribution is preserved verbatim.

## Source provenance, and one rule that was wrong (audited 2026-08-06)

*Moved from the head of `register.md`, wording intact.*

> **Provenance, and one rule that was wrong (audited 2026-08-06).** The `eNN.md` episode files are distilled from **un-diarized, caption-compressed subtitles** — every one declares `subslikescript transcript, un-diarized` in its own frontmatter. Captions carry no speaker attribution and split one speaker's turn across several events, so short lines in them are a **subtitle box, not a cadence**. Measured across all seven raw files: median 5 words per line, p90 7–8, identical in comedy, grief and exposition. That invariance is a fixed-width renderer.
>
> So: **the episode files are authoritative for technique and structure — deflection, preloaded weight, effect-before-definition, the turn shapes — and never for line length or turn count.** [`../knowledge-base/frieren-primary/frieren-dialogue-jp.md`](../knowledge-base/frieren-primary/frieren-dialogue-jp.md) is diarized and is the authority for cadence.
>
> **Known artifact, do not re-import:** `e07.md:67` asserts "short-line rhythm (≤8 words per beat) should be the default across tonal modes." Eight words is the p90 of the caption box. `e07.md:20` describes the line-wrap itself as an authorial device. Both are the renderer, misread as craft.
>
> **The captions were right about the middle and wrong about the tail.** Measured off the diarized Japanese, the median turn is **5–7 English words** — the same place the caption median sits. The renderer was not distorting the centre. It destroyed the long tail, and that is the whole of the defect.
>
> **`frieren-dialogue-jp.md` is the cadence authority but is itself unreliable in places** — it read ASR segment-merges as floor-holds and cites gap timing to a file (`transcript.json`) whose inter-segment gaps are 0.00 by construction. Real pause data lives only in the RTTM. Verified sound in it: the logistics-first reveal (B7), the communal cut-off (B9), the motif recurrence (B12), the meteor-promise cut-off (B3). Verified wrong: the EP.1 funeral run (A3/B2) and the Zoltraak "long expository run" (EP.3). **EP.7, EP.11 and EP.14 have ASR capped at ~28 characters, so no length claim sourced from them can be trusted.**

## The EP.1 funeral "run" that was a Whisper merge (correction, 2026-08-06)

*Moved from the long-run rule in `register.md`, wording intact. The rule it corrects now stands in its corrected form; this is the record of how it got there.*

> **Correction, 2026-08-06 (same day).** The first version of this rule said the run-on was "reserved for a rupture beat" and cited EP.1's funeral realization as "a single unbroken run." **Both were wrong, and a raw-transcript audit caught them.**
>
> The EP.1 funeral "run" does not exist. It is a Whisper ASR segment merged across a **24.5-second silence** — the longest pause in the corpus, against an episode median of 0.83s — plus two more of 12.9s and 7.8s. The heaviest beat in the episode is fragments and silence, the opposite of a run-on. `frieren-dialogue-jp.md` read the merge as a floor-hold and never checked the diarization it cites as its authority; that error propagated straight into this document.
>
> The rupture licence was also backwards. Long turns in the source are overwhelmingly **information**, not feeling. Replacing "long-never" with "long-only-for-rupture" swapped one wrong rule for a narrower wrong rule.
>
> The verified exemplar, absent from `frieren-dialogue-jp.md` entirely, is **EP.14 09:35–10:01 — 26 seconds, seven clauses, one speaker, uninterrupted**: Heiter's *"the truth is my heart has barely changed since I was a child… I'll probably keep pretending to be an adult until I die, because children need an adult they can lean on."* A confession, and an **answer to a question**. Cite this, not EP.1.
>
> **Also unsupported:** the demons' run-ons as a faction device (`frieren-dialogue-jp.md` A5). Clinical detachment as a faction voice holds; distinctive *length* does not — their turns are no longer than any other exposition-giver's, and EP.7's ASR is capped at ~28 characters so length is unmeasurable there anyway.

## Why the delta count replaced the old one (guardrails check 3)

*Moved from `guardrails.md` check 3, wording intact. The corrected count itself lives there and is unchanged.*

> *Why this replaced the old count.* The previous form was "one WORLD fact + one PERSONAL fact." `delta_world` collided with the arc doc's World Truths while actually holding something else entirely — the situation — so the rule rationed the thing that should flow freely and squeezed the thing it meant to meter. That is why the 2026-07-25 proof run had to bend the ceiling mid-pass: the situation was occupying a cast slot. The Verifier correctly read the bend as the rule yielding to content rather than governing it, but the real defect was upstream in the count. Under the corrected count that scene sits exactly at two and nothing is cut.
