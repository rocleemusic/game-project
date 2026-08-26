// EVALUATOR — three layers, cheap first, and a score derived from all of them.
//
// Layer 1  deterministic, free      length ceilings + formatting
// Layer 2  judgment, one call       voice register (guardrails check 6)
// Layer 3  judgment, one call       lore + invention register (checks 4 and 12)
//
// The layers are ordered by cost and each one runs only on what survived the one
// before it. A line 20 words over its ceiling never reaches a model.
//
// NO MODEL IS EVER ASKED FOR A NUMBER. Each judgment layer names which rule broke and
// why. score.js does the arithmetic. This is not a style choice — narrative-pipeline/
// review.md forbids an agent scoring resonance, and the Verifier's contract forbids it
// asking whether a line feels right. What a machine may measure is distance from a
// written rule, so that is the only thing measured here.
//
// The Verifier flags. It never rewrites. (narrative-pipeline/guardrails.md)

import { countWords, CEILING } from './ceilings.js'
import { askJson } from './llm.js'
import { MODELS, ENFORCED_CHECK } from './config.js'
import { rivalChannels } from './card.js'
import { codexDigest } from './codex.js'
import { scoreOf, ceilingCost, PROPOSED } from './score.js'

export const VERDICT = {
  PASS: 'PASS',
  PROSE_FLAG: 'PROSE_FLAG', // re-wording can fix it → refine
  STRUCTURAL_FLAG: 'STRUCTURAL_FLAG', // re-wording cannot fix it → leave the loop
  PROPOSE: 'PROPOSE', // not a defect → leave the loop upward, as a canon candidate
}

// ---------------------------------------------------------------------------
// Layer 1 — deterministic. No API call, no cost, runs first.
// ---------------------------------------------------------------------------

export function evaluateMechanical(slot, line) {
  const cap = slot.max_words ?? CEILING[slot.slot_type]
  const words = countWords(line)
  const fired = []

  if (!(slot.slot_type in CEILING)) {
    fired.push({
      rule: 'structure.slot_type',
      detail: `Unknown slot_type "${slot.slot_type}". The slot spec is wrong, not the line.`,
    })
    return { verdict: VERDICT.STRUCTURAL_FLAG, layer: 'mechanical', words, ...scoreOf(fired) }
  }

  // Length is the one rule with a real distance, so it is the one that scales.
  if (words > cap)
    fired.push({
      rule: 'length.ceiling',
      cost: ceilingCost(words, cap),
      detail: `${words} words, over the ${slot.slot_type} ceiling of ${cap}. Cut it to ${cap} or fewer without losing the beat.`,
    })

  // The tell-purge, mechanically checkable half (pipeline.md step 11).
  if (line.includes('—'))
    fired.push({
      rule: 'format.em_dash',
      detail: 'Contains an em-dash. The tell-purge bans them; use a full stop.',
    })

  return {
    verdict: fired.length ? VERDICT.PROSE_FLAG : VERDICT.PASS,
    layer: 'mechanical',
    words,
    ...scoreOf(fired),
  }
}

// ---------------------------------------------------------------------------
// Layer 2 — voice. Runs only on what survived layer 1.
// ---------------------------------------------------------------------------

const VOICE_SYSTEM = `You are the Consistency Verifier for a narrative pipeline.

You check one line against ONE guardrail and report. You never rewrite, never suggest
replacement wording, and never comment on whether the line is good. Whether a line
lands is the human gate's call, not yours.

You never return a score. You name which rule broke and why. The number is computed
elsewhere, from your finding.

${ENFORCED_CHECK.name} is check ${ENFORCED_CHECK.id}: ${ENFORCED_CHECK.rule}

The defect that matters most is a soul speaking ANOTHER soul's channel. It survives
every mechanical check, and it is the reason this check exists. A line can be well
written, in range, and correct about the facts, and still be wrong because the warmth
in it arrives the way a different neighbour's warmth arrives.

Return ONLY JSON:
{
  "verdict": "PASS" | "PROSE_FLAG" | "STRUCTURAL_FLAG",
  "reason": "one or two sentences, concrete, quoting the words at fault",
  "channel_observed": "how warmth actually arrives in this line, in a few words",
  "rival_match": "npc_id whose channel this matches, or null"
}

PROSE_FLAG when re-wording the line inside the same beat can fix it.
STRUCTURAL_FLAG when it cannot — when the beat the slot was given requires the soul
to act against its card. That is a scene-spec problem and goes back to the Architect.
PASS when the warmth arrives by this soul's own channel, or when the line carries no
warmth beat at all and is not required to.`

export async function evaluateVoice(slot, line, card) {
  const rivals = rivalChannels(card.npc_id)

  const user = [
    `## The soul: ${card.npc_id}`,
    '',
    `**Declared warmth_channel:** ${card.enforcement.warmth_channel}`,
    '',
    `**Declared precision_profile:** ${card.enforcement.precision_profile}`,
    '',
    `**Declared deflection_target:** ${card.enforcement.deflection_target}`,
    '',
    '## The other souls in this town, for contrast',
    '',
    ...rivals.map((r) => `- **${r.npc_id}:** ${r.warmth_channel}`),
    '',
    '## The slot',
    '',
    `- **slot_type:** ${slot.slot_type} · **tone:** ${slot.tone}`,
    `- **scene:** ${slot.scene_context}`,
    `- **this slot must:** ${slot.beat}`,
    '',
    '## The line to check',
    '',
    line,
  ].join('\n')

  const out = await askJson(VOICE_SYSTEM, user, {
    model: MODELS.evaluate,
    maxTokens: 1400,
    label: `verify-voice-${slot.slot_id}`,
  })

  const known = [VERDICT.PASS, VERDICT.PROSE_FLAG, VERDICT.STRUCTURAL_FLAG]
  if (!known.includes(out.verdict))
    return {
      verdict: VERDICT.STRUCTURAL_FLAG,
      layer: 'voice',
      ...scoreOf([
        {
          rule: 'voice.channel_structural',
          detail: `Verifier returned an unknown verdict "${out.verdict}". Treated as unshippable.`,
        },
      ]),
    }

  if (out.verdict === VERDICT.PASS) return { ...out, layer: 'voice', ...scoreOf([]) }

  const rule =
    out.verdict === VERDICT.STRUCTURAL_FLAG ? 'voice.channel_structural' : 'voice.channel'
  const detail = out.rival_match
    ? `${out.reason} Warmth reads as ${out.channel_observed}, which is ${out.rival_match}'s channel.`
    : out.reason

  return { ...out, layer: 'voice', ...scoreOf([{ rule, detail }]) }
}

// ---------------------------------------------------------------------------
// Layer 3 — lore and the invention register. Runs only on what survived layer 2.
// ---------------------------------------------------------------------------

const LORE_SYSTEM = `You are the Consistency Verifier, running two checks against the
canon register of a village: guardrails check 4 (knowledge travels) and check 12 (the
invention register).

You never rewrite and you never return a score. You name the finding and quote the
words at fault. The number is computed elsewhere.

Writers are LICENSED to invent physical props. A scene needs a jar, a crate, a cloth
over the trays, and putting one there is part of writing the slot. Your job is the
bookkeeping, not the permission.

Findings, in the order you should test them:

CONTRADICTION — the line fights a locked fact in the register below. Adren is the
  sister Bex and Mara buried; a line making her a brother is a contradiction. The flood
  year is a date, not a disaster; a line mourning it is a contradiction.

DUPLICATE — the line invents a thing an existing register entry could already carry.
  Reuse was available and was not taken. A newly invented stool by the window
  duplicates prop:window-stool. A newly invented jug at the counter duplicates
  prop:water-jug. This is the check writers fail most.

MISTYPED — the line's new thing is not scene furniture at all. A prop must be
  examinable from where the scene happens. A landmark down the road, or a household at
  the lane end, is world geography or an offstage person. That is Architect work, not a
  prop.

UNDECLARED — the line introduces a named offstage person or a standing world fact, as
  opposed to ordinary scene furniture, with nothing in the register covering it.

PROPOSE — the line invents something new, scene-local, correctly a prop, duplicating
  nothing and contradicting nothing. THIS IS NOT A DEFECT. It is a candidate for canon
  and it goes to the human gate. Six props entered this game exactly this way.

CLEAN — the line invents nothing, or references only what is already in the register.

QUANTITIES ARE NEVER A FINDING. "Eleven jars" binds nothing. A later scene counting
differently contradicts nothing. Only the existence-level fact is canon-bearing.

Return ONLY JSON:
{
  "finding": "CLEAN" | "PROPOSE" | "CONTRADICTION" | "DUPLICATE" | "MISTYPED" | "UNDECLARED",
  "reason": "one or two sentences, concrete, quoting the words at fault",
  "codex_id": "the register entry involved, or null",
  "invention": "the thing the line introduced, in a few words, or null"
}`

const FINDING = {
  CLEAN: null,
  PROPOSE: null,
  CONTRADICTION: { verdict: VERDICT.STRUCTURAL_FLAG, rule: 'lore.contradiction' },
  DUPLICATE: { verdict: VERDICT.PROSE_FLAG, rule: 'invention.duplicate' },
  MISTYPED: { verdict: VERDICT.STRUCTURAL_FLAG, rule: 'invention.mistyped' },
  UNDECLARED: { verdict: VERDICT.PROSE_FLAG, rule: 'invention.undeclared' },
}

export async function evaluateLore(slot, line) {
  const user = [
    '## The canon register',
    '',
    ...codexDigest().map((l) => `- ${l}`),
    '',
    '## The slot',
    '',
    `- **soul:** ${slot.npc_id} · **slot_type:** ${slot.slot_type}`,
    `- **scene:** ${slot.scene_context}`,
    `- **this slot must:** ${slot.beat}`,
    '',
    '## The line to check',
    '',
    line,
  ].join('\n')

  const out = await askJson(LORE_SYSTEM, user, {
    model: MODELS.evaluate,
    maxTokens: 1400,
    label: `verify-lore-${slot.slot_id}`,
  })

  if (!(out.finding in FINDING))
    return {
      verdict: VERDICT.STRUCTURAL_FLAG,
      layer: 'lore',
      ...scoreOf([
        {
          rule: 'lore.contradiction',
          detail: `Verifier returned an unknown finding "${out.finding}". Treated as unshippable.`,
        },
      ]),
    }

  if (out.finding === 'CLEAN') return { ...out, verdict: VERDICT.PASS, layer: 'lore', ...scoreOf([]) }

  // The third disposition. Not a defect, and it costs the line nothing.
  if (out.finding === 'PROPOSE')
    return { ...out, verdict: VERDICT.PROPOSE, layer: 'lore', ...PROPOSED() }

  const { verdict, rule } = FINDING[out.finding]
  const detail = out.codex_id ? `${out.reason} Register entry: ${out.codex_id}.` : out.reason

  return { ...out, verdict, layer: 'lore', ...scoreOf([{ rule, detail }]) }
}

// ---------------------------------------------------------------------------
// All three, cheapest first.
// ---------------------------------------------------------------------------

/**
 * A layer stops the chain when it does not return PASS. Every returned result carries
 * `score`, `deductions` and `reason`, whichever layer produced it.
 */
export async function evaluate(slot, line, card) {
  const mech = evaluateMechanical(slot, line)
  if (mech.verdict !== VERDICT.PASS) return mech

  const voice = await evaluateVoice(slot, line, card)
  if (voice.verdict !== VERDICT.PASS) return { ...voice, words: mech.words }

  const lore = await evaluateLore(slot, line)
  return { ...lore, words: mech.words }
}
