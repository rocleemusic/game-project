/**
 * Renders an `AuditResult` as the text a person reads.
 *
 * Separate from `rules.ts` for one reason: the rules decide what is TRUE, the
 * report decides how it is SAID, and only the second is allowed to change on
 * taste. It is pure and returns a string rather than printing, so the shape of
 * the report is testable without capturing stdout.
 *
 * WHY `RULE_INFO` IS A `Record<AuditRuleId, …>` AND NOT AN ARRAY. It is the
 * single place a rule's question, its `GAPS.md` reference and its position in
 * the report are decided — and being a Record keyed on the union means adding a
 * rule id in `rules.ts` without describing it here is a COMPILE ERROR, not a
 * rule that silently prints nothing. Report order is this object's key order.
 *
 * TWO THINGS THE FORMAT IS DELIBERATE ABOUT.
 *
 * Rules that found nothing are still printed, as `ok`. A report listing only
 * failures cannot distinguish "this join is sound" from "that check quietly
 * stopped running", and this project has already paid once for a status banner
 * that was materially wrong.
 *
 * Rules that could not run are printed LOUDLY, above the summary, under a
 * heading that says so. A check that did not run is not a check that passed.
 */

import type { AuditResult, AuditRuleId, Finding } from "./rules";

interface RuleInfo {
  /** What the rule asks, phrased as the question the report answers. */
  readonly question: string;
  /** The `GAPS.md` entry this instantiates, when there is one. */
  readonly gap: string | null;
}

/** Worst join first. Key order is report order. */
const RULE_INFO: Record<AuditRuleId, RuleInfo> = {
  "gate-unclearable": {
    question: "which locked screens can no authored rule ever open?",
    gap: "G6",
  },
  "gate-rule-unknown-spell": {
    question: "which gate rules name a spell that has no record?",
    gap: null,
  },
  "gate-rule-rejected-spell": {
    question: "which gate rules name a spell REJECTED at Roc's gate?",
    gap: "G5",
  },
  "gate-rule-unknown-receiver": {
    question: "which gate rules name a receiver no spell record authors?",
    gap: null,
  },
  "gate-rule-unauthored-pair": {
    question: "which gate rules need a spell x receiver pair nobody authored?",
    gap: null,
  },
  "forage-pool-unjoined": {
    question: "which forage pools hand over a string that is not an item_id?",
    gap: "G13",
  },
  "spell-components-unco-located": {
    question: "which spells have no single screen carrying every screen-bound component?",
    gap: null,
  },
  "item-unobtainable": {
    question: "which items can nothing in the world ever give the player?",
    gap: "G13",
  },
  "item-behind-its-own-lock": {
    question: "which items forage only from screens that are locked?",
    gap: "G6",
  },
  "item-unused": {
    question: "which items does no approved spell consume?",
    gap: null,
  },
  "spell-no-placed-receiver": {
    question: "which spells have no receiver reachable anywhere? (souls count — days place them)",
    gap: "G2",
  },
  "receiver-unplaced": {
    question: "which receivers exist on no screen at all?",
    gap: "G2",
  },
  "spell-unlocks-nothing": {
    question: "which spells claim to unlock a screen that does not exist?",
    gap: "G1",
  },
  "key-item-uncategorised": {
    question: "which key items carry a category no decoration surface knows?",
    gap: "G10",
  },
  "item-source-not-a-screen": {
    question: "which source_locations name a place that is not a screen?",
    gap: "GP-106",
  },
  "scene-never-placed": {
    question: "which authored scenes sit where their soul never stands?",
    gap: "G15",
  },
};

/** Report order, derived from the one table. */
export const REPORT_ORDER = Object.keys(RULE_INFO) as AuditRuleId[];

/** How many findings one rule prints before it truncates. */
const MAX_ROWS = 12;

function block(id: AuditRuleId, rows: readonly Finding[]): string[] {
  const info = RULE_INFO[id];
  const head = rows.length === 0 ? "ok" : `${rows.length} orphaned`;
  const gap = info.gap ? `[${info.gap}]` : "";
  const out = [`  ${id.padEnd(28)} ${head.padEnd(14)} ${gap}`, `      ${info.question}`];
  for (const row of rows.slice(0, MAX_ROWS)) out.push(`        ${row.subject} — ${row.detail}`);
  if (rows.length > MAX_ROWS) out.push(`        … and ${rows.length - MAX_ROWS} more`);
  out.push("");
  return out;
}

export function formatReport(result: AuditResult): string {
  const ran = new Set<AuditRuleId>(result.ran);
  const byRule = new Map<AuditRuleId, Finding[]>();
  for (const f of result.findings) byRule.set(f.rule, [...(byRule.get(f.rule) ?? []), f]);

  const lines: string[] = ["", "content audit — authored, but wired to nothing", ""];

  for (const id of REPORT_ORDER) {
    if (!ran.has(id)) continue;
    lines.push(...block(id, byRule.get(id) ?? []));
  }

  const skipped = REPORT_ORDER.filter((id) => !ran.has(id));
  if (skipped.length || result.unchecked.length) {
    lines.push("NOT CHECKED — a rule that did not run is not a rule that passed", "");
    for (const id of skipped) lines.push(`  ${id.padEnd(28)} did not run`);
    for (const note of result.unchecked) lines.push(`  ${note}`);
    lines.push("");
  }

  const clean = REPORT_ORDER.filter((id) => ran.has(id) && !(byRule.get(id) ?? []).length);
  lines.push(
    "summary",
    `  ${result.findings.length} orphaned records, across ${byRule.size} of the ${result.ran.length} rules that ran`,
    `  ${clean.length} rules found nothing: ${clean.join(", ") || "none"}`,
    "",
  );

  return lines.join("\n");
}
