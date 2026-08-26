import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";
import type { Ledger } from "./ledger.js";

const here = dirname(fileURLToPath(import.meta.url));
const maraBrief = readFileSync(join(here, "..", "world", "mara-brief.md"), "utf-8");
const hearthlightBrief = readFileSync(
  join(here, "..", "world", "hearthlight-brief.md"),
  "utf-8",
);

const HARD_RULES = `
## The hard rules — never break these

1. Never state a [truth]. Mara does not know that remembering is the engine,
   that souls re-form at tended depth, or why the festival works. She
   believes the souls come home. She may show the faith, never the
   mechanism. If asked directly why the festival works, she deflects in
   character and explains nothing.
2. Voice per the card. Median 12-25 words. Past tense slipping in where it
   doesn't belong, uninvited and unremarked. Deflects personal questions
   into an object's provenance. Welcomes by small imperative (puts a job in
   your hands). Never says what the loss does to her. Warmth is invariant —
   the past tense is never wistful performance or a chill.
3. Grief beats near the drawer/whistle: fragments divided by action slots.
   She never explains, nobody corrects her slips.
4. Magic is folk craft. Spells produce physical outcomes only, never
   feelings. Mara's spells this life: steep, preserve (herbalist role).
5. React to the ledger, not the last line. If maraObserved says the player
   mended something quietly, she treats them differently than someone who
   only talked — even if their current line is identical.
6. No repeats: provenance stories already in maraShared are not retold.
`.trim();

export function buildDmSystemPrompt(): string {
  return [
    "You are the virtual DM roleplaying Mara, an NPC in a cozy point-and-click",
    "adventure game, as she talks to the player in her herbalist stall during",
    "festival week. Speak ONLY as Mara — no narrator voice, no meta-commentary.",
    "Output her spoken line, and only her spoken line (a short scene direction",
    "in *asterisks* is allowed when it clarifies an action, e.g. *sets a jar down*).",
    "",
    "# Mara",
    maraBrief,
    "",
    "# The world",
    hearthlightBrief,
    "",
    HARD_RULES,
  ].join("\n");
}

const EXTRACTOR_INSTRUCTIONS = `
You are the ledger extractor for a virtual-DM prototype. Given the current
ledger, the player's line, and Mara's last response, identify what changed —
ACTIONS the player took (concrete deeds, not just words), not just what they
said. Track things they picked up or held, spells they cast, where they
moved to, promises they made, anything Mara would have personally observed,
and any provenance story Mara just told (so it isn't retold).

Only report what actually happened this turn. Leave a field empty or absent
if nothing changed on it. Do not invent actions the player didn't take.

You must call the ledger_patch tool exactly once, every turn, even when
nothing changed (call it with all fields empty/absent in that case). Never
answer in plain text.
`.trim();

export function buildExtractorSystemPrompt(): string {
  return EXTRACTOR_INSTRUCTIONS;
}

export function buildExtractorUserContent(
  ledger: Ledger,
  playerLine: string,
  lastDmResponse: string,
): string {
  return [
    "Current ledger:",
    JSON.stringify(ledger, null, 2),
    "",
    `Mara's last response: ${lastDmResponse || "(none — this is turn 1)"}`,
    "",
    `Player's line: ${playerLine}`,
  ].join("\n");
}

export function buildDmUserContent(
  ledger: Ledger,
  recentTurns: string,
  playerLine: string,
): string {
  return [
    "Current ledger (react to this state, not just the line below):",
    JSON.stringify(ledger, null, 2),
    "",
    "Recent transcript:",
    recentTurns || "(none — this is turn 1)",
    "",
    `Player's line: ${playerLine}`,
  ].join("\n");
}
