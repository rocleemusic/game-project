// SCORING — a number derived from flags, never asked of a model.
//
// This pipeline refuses to rate whether a line is good. That refusal is written down
// in two places: narrative-pipeline/review.md ("No agent scores relatedness,
// resonance, or closeness ... the checklist is questions Roc reads, not numbers the
// orchestrator computes") and the Verifier's own contract ("never ask whether a line
// *feels* right — judging resonance is measuring it").
//
// So the evaluator scores the one thing it legitimately can: distance from written
// rules. Every deduction below traces to a named rule in style-guide.md, and the
// model that runs the judgment layers never sees a number. It reports which rule
// broke. The arithmetic happens here, in code.
//
// WHY THESE WEIGHTS. Not taste. A deduction is the cost of recovering from the flag,
// which is the same axis the circuit breaker already routes on:
//
//   6  Re-wording cannot fix it. The loop exits and a human or the Architect picks it
//      up. That is the most expensive outcome the system has.
//   4  The fix is a bookkeeping decision rather than a rewrite — reuse this codex
//      entry, or retype this declaration. Cost and routing are separate axes here: a
//      mistyped declaration leaves the loop for a ruling, and still costs 4, because
//      what it needs is a ratification and not a better line.
//   3  Re-wording can fix it, and finding the fix needs judgment.
//   2  Re-wording can fix it mechanically. A regex found it and a regex could
//      describe the fix.
//   1/word, capped at 4 — length is the one rule with a real distance, so it is the
//      one deduction that scales. A line 2 words over and a line 15 words over are
//      not the same defect, and a scale that cannot say so is a pass/fail test
//      wearing a number.

export const MAX_SCORE = 10
export const MIN_SCORE = 1

/**
 * The rule table. `id` matches a section of style-guide.md; `cost` is the deduction.
 * Everything the evaluator can flag appears here exactly once.
 */
export const RULES = {
  'length.ceiling': { cost: null, scales: true, guide: 'Constraint 1 — Length' },
  'format.em_dash': { cost: 2, guide: 'Constraint 2 — Formatting' },
  'structure.slot_type': { cost: 6, guide: 'Constraint 1 — Length' },
  'voice.channel': { cost: 3, guide: 'Constraint 3 — Tone and voice' },
  'voice.channel_structural': { cost: 6, guide: 'Constraint 3 — Tone and voice' },
  'lore.contradiction': { cost: 6, guide: 'Constraint 4 — Lore and invention' },
  'invention.duplicate': { cost: 4, guide: 'Constraint 4 — Lore and invention' },
  'invention.mistyped': { cost: 4, guide: 'Constraint 4 — Lore and invention' },
  'invention.undeclared': { cost: 3, guide: 'Constraint 4 — Lore and invention' },
}

/** The length deduction: one point per word over, capped at 4. */
export function ceilingCost(words, cap) {
  return Math.min(4, Math.max(0, words - cap))
}

/**
 * Score a set of fired rules.
 *
 * @param {Array<{rule: string, cost?: number, detail: string}>} fired
 * @returns {{score: number, deductions: Array, reason: string}}
 */
export function scoreOf(fired) {
  const deductions = fired.map((f) => {
    const spec = RULES[f.rule]
    if (!spec) throw new Error(`Unknown rule "${f.rule}" — every flag must appear in RULES.`)
    const cost = spec.scales ? f.cost : spec.cost
    return { rule: f.rule, cost, guide: spec.guide, detail: f.detail }
  })

  const total = deductions.reduce((n, d) => n + d.cost, 0)
  const score = Math.max(MIN_SCORE, MAX_SCORE - total)

  const reason = deductions.length
    ? deductions.map((d) => `[-${d.cost}] ${d.rule}: ${d.detail}`).join(' ')
    : 'No rule in the style guide was broken.'

  return { score, deductions, reason }
}

/** A clean result. Nothing fired, so nothing was deducted. */
export const PERFECT = () => scoreOf([])

/**
 * PROPOSE scores a full 10 and deducts nothing.
 *
 * A declared invention that is new, duplicates nothing, contradicts nothing and is
 * typed correctly is not a defect — it is a candidate for canon (guardrails.md check
 * 12). Six props entered the game this way from a single batch on 2026-08-09. Scoring
 * it down would teach the loop to stop inventing, which is the opposite of what the
 * disposition exists for.
 */
export const PROPOSED = () => ({
  score: MAX_SCORE,
  deductions: [],
  reason: 'Declared invention is new, non-duplicating, correctly typed. Routed to the human gate as a canon candidate, not a defect.',
})

/** Render for the run log and the README. */
export function formatScore({ score, reason }) {
  return `SCORE: ${score}/${MAX_SCORE}\nREASON: ${reason}`
}
