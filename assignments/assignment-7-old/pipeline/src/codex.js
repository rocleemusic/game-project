// THE CANON REGISTER — what already exists in this village.
//
// The Content seat reads it before inventing: an existing entry that can carry a
// reference beats a new invention. The evaluator reads it to answer two questions a
// linter cannot — does this line contradict a locked fact, and did this line invent a
// thing the codex already has?
//
// SOURCE: narrative-pipeline/npc-codex.md. The copy in codex.json is declared, not
// silent, and names its extraction date in its own _source field.
//
// Until this register existed, guardrails.md check 4 was reading against nothing,
// which is why invented offstage people passed silently for weeks.

import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PIPELINE_ROOT } from './config.js'

const codex = JSON.parse(readFileSync(join(PIPELINE_ROOT, 'codex.json'), 'utf8'))

export const CODEX = codex

/** Every entry as a flat `id — text` list, which is what a prompt wants. */
export function codexDigest() {
  const lines = []

  for (const s of codex.souls) lines.push(`${s.id} — ${s.who} Locked: ${s.locked.join(' ')}`)
  for (const r of codex.relations) lines.push(`${r.id} — ${r.what}`)
  for (const w of codex.walk_ons) lines.push(`${w.id} — ${w.what}`)
  for (const o of codex.offstage_people)
    lines.push(`${o.id}${o.status === 'proposed' ? ' (PROPOSED — binds nothing)' : ''} — ${o.what}`)
  for (const f of codex.world_facts) lines.push(`${f.id} — ${f.what}`)
  for (const p of codex.promoted_props) lines.push(`${p.id} — ${p.what}`)

  return lines
}

/** Just the props, which is what the duplicate check reaches for most. */
export function propDigest() {
  return codex.promoted_props.map((p) => `${p.id} — ${p.what}`)
}

export function codexCount() {
  return (
    codex.souls.length +
    codex.relations.length +
    codex.walk_ons.length +
    codex.offstage_people.length +
    codex.world_facts.length +
    codex.promoted_props.length
  )
}
