import Anthropic from "@anthropic-ai/sdk";
import readline from "readline/promises";
import { readFileSync } from "fs";
import { stdin, stdout } from "process";
import {
  type Ledger,
  type LedgerPatch,
  initialLedger,
  applyPatch,
  printLedger,
} from "./ledger.js";
import {
  buildDmSystemPrompt,
  buildExtractorSystemPrompt,
  buildExtractorUserContent,
  buildDmUserContent,
} from "./prompts.js";

// Model, and optionally the endpoint, are read from the environment so this
// can point at Claude (the default), or at any other Anthropic-compatible
// endpoint (Moonshot/Kimi's native `/anthropic` surface, a future local
// model) without touching this file. The SDK itself already reads
// ANTHROPIC_BASE_URL / ANTHROPIC_API_KEY from the environment.
const MODEL = process.env.DM_MODEL ?? "claude-sonnet-5";
const MAX_TRANSCRIPT_TURNS = 10;
// Generous headroom, not just for the visible reply: a mandatory-thinking
// backend (e.g. Kimi K3, which cannot turn thinking off) can spend most of
// a small budget on its thinking block and leave nothing for the text/tool
// output — confirmed live: 1024 truncated mid-thought with zero text.
const MAX_TOKENS = 8192;

const client = new Anthropic();

const EXTRACTOR_TOOL: Anthropic.Tool = {
  name: "ledger_patch",
  description: "Report what changed in the ledger this turn.",
  input_schema: {
    type: "object",
    properties: {
      playerHeld: { type: "array", items: { type: "string" }, description: "Items newly picked up this turn." },
      playerSpellsCast: { type: "array", items: { type: "string" }, description: "Spells newly cast this turn." },
      playerLocation: { type: "string", description: "New location, only if the player moved." },
      actions: { type: "array", items: { type: "string" }, description: "Concrete deeds the player did this turn, short strings." },
      promises: { type: "array", items: { type: "string" }, description: "New promises the player made." },
      maraObserved: { type: "array", items: { type: "string" }, description: "What Mara personally saw the player do this turn." },
      maraShared: { type: "array", items: { type: "string" }, description: "Any new provenance story Mara just told." },
      helpedWithTonic: { type: "boolean", description: "Set true only if the player just helped gather herbs for the tonic." },
      touchedTheDrawer: { type: "boolean", description: "Set true only if the player just touched or opened the drawer." },
    },
    additionalProperties: false,
  },
};

async function callExtractor(
  ledger: Ledger,
  playerLine: string,
  lastDmResponse: string,
  toolChoice: Anthropic.MessageCreateParams["tool_choice"],
): Promise<Anthropic.Message> {
  return client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: buildExtractorSystemPrompt(),
    tools: [EXTRACTOR_TOOL],
    tool_choice: toolChoice,
    messages: [
      {
        role: "user",
        content: buildExtractorUserContent(ledger, playerLine, lastDmResponse),
      },
    ],
  });
}

async function extractPatch(
  ledger: Ledger,
  playerLine: string,
  lastDmResponse: string,
): Promise<LedgerPatch> {
  // Forced tool_choice is the reliable path (Claude, and most backends), but
  // some Anthropic-compatible backends reject forcing a tool while their
  // thinking mode is on (e.g. Kimi's thinking-capable models — only "auto"
  // or "none" are accepted there). Fall back to "auto" plus the schema's own
  // description text carrying the instruction, rather than hard-coding a
  // per-model exception.
  let response: Anthropic.Message;
  try {
    response = await callExtractor(ledger, playerLine, lastDmResponse, {
      type: "tool",
      name: "ledger_patch",
    });
  } catch (err) {
    if (err instanceof Anthropic.BadRequestError) {
      response = await callExtractor(ledger, playerLine, lastDmResponse, {
        type: "auto",
      });
    } else {
      throw err;
    }
  }

  const toolUse = response.content.find(
    (b): b is Anthropic.ToolUseBlock => b.type === "tool_use",
  );
  if (!toolUse) {
    const reason = response.stop_reason === "max_tokens" ? " (hit max_tokens)" : "";
    console.warn(`extractor: no tool call returned${reason}; ledger unchanged this turn`);
  }
  return (toolUse?.input as LedgerPatch) ?? {};
}

async function generateDmResponse(
  ledger: Ledger,
  recentTurns: string,
  playerLine: string,
): Promise<string> {
  const response = await client.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: buildDmSystemPrompt(),
    messages: [
      {
        role: "user",
        content: buildDmUserContent(ledger, recentTurns, playerLine),
      },
    ],
  });

  const textBlock = response.content.find(
    (b): b is Anthropic.TextBlock => b.type === "text",
  );
  if (!textBlock) {
    const reason = response.stop_reason === "max_tokens" ? " (hit max_tokens)" : "";
    console.warn(`dm: no text returned${reason}`);
  }
  return textBlock?.text.trim() ?? "";
}

function appendTranscript(transcript: string[], playerLine: string, dmLine: string): string[] {
  const next = [...transcript, `Player: ${playerLine}`, `Mara: ${dmLine}`];
  return next.slice(-MAX_TRANSCRIPT_TURNS * 2);
}

async function runTurn(
  ledger: Ledger,
  transcript: string[],
  lastDmResponse: string,
  playerLine: string,
): Promise<{ ledger: Ledger; transcript: string[]; dmLine: string }> {
  const patch = await extractPatch(ledger, playerLine, lastDmResponse);
  const nextLedger = applyPatch(ledger, patch);

  const dmLine = await generateDmResponse(nextLedger, transcript.join("\n"), playerLine);
  const nextTranscript = appendTranscript(transcript, playerLine, dmLine);

  return { ledger: nextLedger, transcript: nextTranscript, dmLine };
}

const DEMO_LINES = [
  "I walk up to your stall and say hello.",
  "I pick up the whistle from the drawer.",
  "I help you gather herbs for the tonic.",
  "Do you have any family in town?",
  "Tell me about that whistle again.",
  "Why does the festival work? What makes the souls come home?",
];

// Drives a fixed list of player lines straight through runTurn — used by
// both --demo (canned lines, baked in) and --script (an arbitrary file, one
// line per turn). Piped stdin through the real readline interactive loop
// closes the interface as soon as the input stream hits EOF, independent of
// how many lines are still queued, so a scripted multi-turn run needs this
// path rather than fighting that readline behavior.
async function runScriptedLines(lines: string[], playerName: string): Promise<void> {
  let ledger = initialLedger(playerName);
  let transcript: string[] = [];
  let lastDmResponse = "";

  for (const line of lines) {
    console.log(`> ${line}`);
    const result = await runTurn(ledger, transcript, lastDmResponse, line);
    ledger = result.ledger;
    transcript = result.transcript;
    lastDmResponse = result.dmLine;
    console.log(`Mara: ${result.dmLine}\n`);
    console.log(printLedger(ledger));
    console.log("");
  }
}

async function runInteractive(): Promise<void> {
  let ledger = initialLedger("Traveler");
  let transcript: string[] = [];
  let lastDmResponse = "";

  const rl = readline.createInterface({ input: stdin, output: stdout });
  try {
    while (true) {
      const playerLine = await rl.question("> ");
      if (playerLine.trim().toLowerCase() === "quit") break;
      if (!playerLine.trim()) continue;

      const result = await runTurn(ledger, transcript, lastDmResponse, playerLine);
      ledger = result.ledger;
      transcript = result.transcript;
      lastDmResponse = result.dmLine;

      console.log(`Mara: ${result.dmLine}\n`);
      console.log(printLedger(ledger));
      console.log("");
    }
  } finally {
    rl.close();
  }
}

async function main() {
  console.log("=== Assignment 8 — Narrative Engine Prototype (Mara, virtual DM) ===");

  if (process.argv.includes("--demo")) {
    console.log("Running canned demo session...\n");
    await runScriptedLines(DEMO_LINES, "Wren");
    return;
  }

  const scriptFlagIndex = process.argv.indexOf("--script");
  if (scriptFlagIndex !== -1) {
    const scriptPath = process.argv[scriptFlagIndex + 1];
    const lines = readFileSync(scriptPath, "utf-8")
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.length > 0);
    console.log(`Running scripted session from ${scriptPath}...\n`);
    await runScriptedLines(lines, "Traveler");
    return;
  }

  console.log("Type your line, or 'quit' to exit.\n");
  await runInteractive();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
