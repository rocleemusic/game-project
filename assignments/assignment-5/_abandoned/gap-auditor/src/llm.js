// Thin wrapper around the Claude API (Anthropic SDK).
// Model per assignment spec: claude-sonnet-5. Key from ANTHROPIC_API_KEY
// (the SDK reads it from the environment automatically).
import Anthropic from "@anthropic-ai/sdk";

export const MODEL = "claude-sonnet-5";

let client = null;
function getClient() {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error(
        "ANTHROPIC_API_KEY is not set. Set it for online mode, or run with --offline to replay the recorded run.",
      );
    }
    client = new Anthropic();
  }
  return client;
}

/**
 * One streamed Claude call (streaming avoids HTTP timeouts on long outputs).
 * Returns the concatenated text of the response.
 */
export async function ask(system, userText, maxTokens = 32000) {
  const stream = getClient().messages.stream({
    model: MODEL,
    max_tokens: maxTokens,
    system,
    messages: [{ role: "user", content: userText }],
  });
  const message = await stream.finalMessage();
  if (message.stop_reason === "refusal") {
    throw new Error("Model refused the request (stop_reason: refusal).");
  }
  return message.content
    .filter((b) => b.type === "text")
    .map((b) => b.text)
    .join("");
}

/** Ask for JSON and parse it, tolerating a ```json fence. */
export async function askJson(system, userText, maxTokens = 32000) {
  const text = await ask(system, userText, maxTokens);
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  const raw = fenced ? fenced[1] : text;
  return JSON.parse(raw.trim());
}
