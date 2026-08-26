// emitInk: graph.json -> the ink/ file tree (build-loop.md, file split S4).
//
//   main.ink            INCLUDEs + a minimal day-loop stub
//   state.ink           every LIST and VAR declaration, nothing else
//   world/<screen>.ink  screen = knot; examinables and time-states = stitches
//   souls/<soul>.ink    scenes = stitches in the soul's knot; choice weaves
//   system/externals.ink EXTERNAL declarations + no-op fallback functions
//
// Placeholder lines everywhere — no real prose. The resolver writes every file
// here; hand edits get clobbered on purpose.

import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { inkAddress } from "./ids.ts";
import { compileConditions } from "./predicates.ts";
import { compileStateActions, EXTERNAL_FUNCTIONS } from "./actions.ts";
import { HOME_SCREEN_ID, FESTIVAL_SCREEN_ID, VIGNETTE_SCREEN_ID, NIGHT_SCREEN_ID, FINAL_SCREEN_ID } from "./graph.ts";
import type { ContentLine, Graph, GraphChoiceNode, GraphScene } from "./types.ts";

/** Relative POSIX path -> file content. */
export type InkFiles = Map<string, string>;

function cleanText(text: string): string {
  // Placeholder-safe: one line, no ink flow-control glyphs at risk.
  return text.replace(/\s+/g, " ").trim();
}

function lineTags(line: ContentLine, extra: string[] = []): string {
  const tags = [...extra, `#id:${line.content_id}`, `#speaker:${line.speaker_id}`];
  return tags.join(" ");
}

/**
 * The divert-path flag (ChoiceNode.path_variants).
 *
 * It is emitter-owned, not story state: nothing authored reads it, no
 * predicate compiles to it and the host never mirrors it. It exists because a
 * node reached by a divert has to print different prose than the same node
 * reached from the previous gather, and ink gives a weave point one address —
 * so the entry path has to be carried in a value rather than in a label. Set
 * on the divert itself, consumed by the target node's lines, cleared at that
 * node's gather (see emitChoiceNode), so it is only ever true for the span of
 * one node.
 */
const DIVERT_PATH_FLAG = "enteredByDivert";

// ---------- state.ink ----------

function emitState(graph: Graph): string {
  const out: string[] = [
    "// state.ink — the single declaration site (build-loop.md).",
    "// A LIST or VAR declared anywhere else is a defect. Generated; do not hand-edit.",
    "",
  ];
  for (const v of graph.variables) out.push(v.declaration);
  // Declared here for the same reason as everything above it: state.ink is the
  // one declaration site, even for a flag the weave owns rather than the host.
  out.push(`VAR ${DIVERT_PATH_FLAG} = false // emitter-owned; see ink.ts`);
  return out.join("\n") + "\n";
}

// ---------- system/externals.ink ----------

function emitExternals(): string {
  const out: string[] = [
    "// system/externals.ink — state_actions emit as EXTERNAL calls (choice-node-schema.md).",
    "// The host binds these for real; these fallbacks make the canned web build run.",
    "",
  ];
  for (const fn of EXTERNAL_FUNCTIONS) {
    const params = fn.params.join(", ");
    out.push(`EXTERNAL ${fn.name}(${params})`);
    out.push(`=== function ${fn.name}(${params})`);
    out.push("    // no-op fallback stub");
    out.push("    ~ return 0");
    out.push("");
  }
  return out.join("\n") + "\n";
}

// ---------- world/<screen>.ink ----------

/**
 * The per-screen hub stitch (W1b). Reserved: an examinable or time-state that
 * addressed to this name would silently take over the screen's navigation, so
 * addStitch refuses it.
 */
const HUB_STITCH = "hub";

/** A soul's authored name, for "Talk to Toby" rather than "Talk to toby". */
function soulLabel(graph: Graph, soulId: string): string {
  return graph.souls.find((s) => s.soul_id === soulId)?.name ?? soulId;
}

/**
 * The first day a scene can be entered WITHOUT losing a beat.
 *
 * Note this is the HIGHEST day floor across the scene's beats, not the lowest.
 * The week view and the guarantee floor use the lowest, because they answer
 * "when does this scene become available?" — a floor, so catch-up is possible.
 * This answers a different question: "when is it safe to spend the once-only
 * entry?" Entering a scene plays only the beats open right now and spends the
 * entry, so entering SC-T6-01 on day 1 permanently strands its `day >= 4` beat
 * and the `knows(tavern_tab)` beat that one unlocks. Waiting until every beat is
 * open is what makes a single entry lossless.
 */
function sceneEntryDay(scene: GraphScene): number {
  if (scene.choice_nodes.length === 0) return 1;
  return Math.max(
    ...scene.choice_nodes.map((node) => {
      let floor = 1;
      for (const cond of node.availability_conditions ?? []) {
        const m = /^day\s*(>=|==|=|>)\s*(\d+)$/.exec(cond.trim());
        if (!m) continue;
        floor = Math.max(floor, m[1] === ">" ? Number(m[2]) + 1 : Number(m[2]));
      }
      return floor;
    }),
  );
}

/**
 * scene_id -> ink address, for compiling an entry_gate's played() terms.
 * GraphScene already carries ink_address, so this is a lookup, not a derivation.
 * Cached per graph because emitScreen runs once per screen and the map is the
 * same every time.
 */
const sceneAddressCache = new WeakMap<Graph, Map<string, string>>();
function sceneAddresses(graph: Graph): Map<string, string> {
  let m = sceneAddressCache.get(graph);
  if (!m) {
    m = new Map(graph.scenes.map((s) => [s.scene_id, s.ink_address]));
    sceneAddressCache.set(graph, m);
  }
  return m;
}

/** stall_goods -> "stall goods", for a placeholder examinable label. */
function readable(id: string): string {
  return id.replace(/[_-]+/g, " ");
}

/**
 * "The festival arc" (GP-93 rule 3), as data.
 *
 * The pacing rules (gdd/03-core-loop.md's "Conversation pacing within a day")
 * name "the festival arc" but never define it as a schema field, and GP-93 is
 * explicit that which thread(s) that phrase means is NOT for the implementer
 * to invent. The one place the concept already exists in data is
 * role-workplace.json's `goal_threads` (D7, roleGoals.ts): the thread_id(s)
 * whose thread_move IS a role's external festival-goal contribution —
 * gdd/03-core-loop.md's own worked example (the Baker's toby-feast-short) is
 * the thread this rule was written about. So "the festival arc" is read here
 * as the union of every role's goal_threads, not a hard-coded id — it tracks
 * whichever threads are actually ratified as festival-goal threads, including
 * roles not yet authored (empty goal_threads = no festival-arc scene for that
 * role, same "content gap, not a guess" contract roleGoals.ts already uses).
 */
const festivalThreadIdsCache = new WeakMap<Graph, Set<string>>();
function festivalThreadIds(graph: Graph): Set<string> {
  let ids = festivalThreadIdsCache.get(graph);
  if (!ids) {
    ids = new Set<string>();
    for (const role of graph.role_workplace) {
      for (const t of role.goal_threads ?? []) ids.add(t);
    }
    festivalThreadIdsCache.set(graph, ids);
  }
  return ids;
}

/**
 * Does entering this scene move a festival-arc thread (see festivalThreadIds)?
 * Scans every choice_node's every option for a thread_move state_action —
 * scene.choice_nodes is the flat per-scene array (nested sub-nodes included
 * via parent_option, not a tree), so this needs no recursion.
 */
function isFestivalArcScene(graph: Graph, scene: GraphScene): boolean {
  const ids = festivalThreadIds(graph);
  if (ids.size === 0) return false;
  for (const node of scene.choice_nodes) {
    for (const opt of node.options) {
      for (const action of opt.state_actions ?? []) {
        if (action.type === "thread_move" && ids.has(action.arg)) return true;
      }
    }
  }
  return false;
}

/**
 * The shared move-spend body for a location choice (RULED 2026-08-01): 3
 * moves per BLOCK, not per day. Used both by a screen's exits and by
 * day_start's screen_hub — picking the day's opening screen spends move 1
 * exactly like any other move, so a block still visits `moves_per_day` (the
 * per-block budget) locations in total.
 *
 * A move on its own must NOT advance the clock. Only a spent budget does —
 * and it advances the BLOCK, not the day. Evening is the day's last block, so
 * spending it out sends the player home (day_end) instead of trying to
 * advance into a fourth block that doesn't exist. This replaces the old
 * "every move calls advance_time()" model, which advanced the clock once per
 * move regardless of the budget.
 */
function emitMoveTo(target: string, indent: string): string[] {
  // Nested if/else, not a `-` chain: ink's multi-line conditional only
  // accepts ONE condition plus an `- else:` — a second `- condition:` reads
  // as a switch case on the outer expression's VALUE, not a second boolean
  // test ("Expected an '- else:' clause here rather than an extra condition").
  return [
    `${indent}~ movesLeft = movesLeft - 1`,
    `${indent}{ movesLeft > 0:`,
    `${indent}    -> ${target}`,
    `${indent}- else:`,
    `${indent}    { TimeOfDay == evening:`,
    `${indent}        -> day_end`,
    `${indent}    - else:`,
    `${indent}        ~ advance_time()`,
    `${indent}        -> ${target}`,
    `${indent}    }`,
    `${indent}}`,
  ];
}

/**
 * The conversation-spend body for returning from a scene (GP-93 rule 1,
 * RULED — including the softened Roc 2026-08-06 ruling that a quiet beat
 * costs the same slot as one that moves a thread, i.e. this applies to every
 * conversation, not only thread-moving ones): a conversation advances the
 * clock UNCONDITIONALLY, not once a move budget empties. Unlike emitMoveTo
 * this never touches movesLeft — advance_time() already resets it, and
 * "spends a full time slot" means the whole block, not one move unit.
 *
 * At night this is a no-op transition (advance_time() only cycles
 * morning->afternoon->evening — see its own comment), so multiple night
 * scenes remain playable back to back exactly as before GP-93 — night is
 * already its own single slot, not subdivided further by this rule.
 *
 * This one mechanism is also what makes rule 2 ("a thread can be entered at
 * most once per time slot") hold without any separate per-thread lock: once
 * any conversation ends, the slot is gone before the hub is offered again, so
 * nothing --thread-bearing or not-- can be entered twice in it.
 */
function emitConversationReturn(target: string, indent: string): string[] {
  return [
    `${indent}{ TimeOfDay == evening:`,
    `${indent}    -> day_end`,
    `${indent}- else:`,
    `${indent}    ~ advance_time()`,
    `${indent}    -> ${target}`,
    `${indent}}`,
  ];
}

/**
 * A screen is a knot that OFFERS what is on it (W1b).
 *
 * Before this, a screen knot printed its intro line and hit `-> DONE`, so the
 * flow ended on arrival and every scene was reachable only through the tool's
 * own jumpTo. There was no organic path from the day loop into any dialogue at
 * all, which is why a week could never be played.
 *
 * Now: intro -> the matching time-state -> a hub offering this screen's scenes,
 * its examinables, its exits (each spending a move against the current
 * block's budget — see emitMoveTo), and End the day. Everything is sticky;
 * see the scene loop for why that matters.
 */
function emitScreen(graph: Graph, screenId: string): string {
  const screen = graph.screens.find((s) => s.screen_id === screenId);
  if (!screen) throw new Error(`emitScreen: unknown screen ${screenId}`);
  const knot = screen.ink_address;
  const out: string[] = [
    `// world/${knot}.ink — generated from screen_spec ${screen.screen_id}. Do not hand-edit.`,
    "",
    `=== ${knot} ===`,
    `Placeholder: ${cleanText(screen.name)}. #screen:${screen.screen_id} #id:GB-${screen.screen_id}-INTRO`,
  ];

  // Show the time-state that matches the clock, then fall through to the hub.
  // Separate conditionals rather than a switch: the first match diverts, and a
  // screen with no state for this block simply falls past them all.
  for (const ts of screen.time_states ?? []) {
    out.push(`{ TimeOfDay == ${inkAddress(ts)}: -> ts_${inkAddress(ts)} }`);
  }
  out.push(`-> ${HUB_STITCH}`, "");

  const stitchNames = new Set<string>([HUB_STITCH]);
  const addStitch = (name: string, lines: string[]) => {
    if (stitchNames.has(name)) {
      throw new Error(`emitScreen: stitch name clash "${name}" on screen ${screen.screen_id}`);
    }
    stitchNames.add(name);
    // Return to the hub, not DONE: a look that ends the day is not a look.
    out.push(`= ${name}`, ...lines, `-> ${HUB_STITCH}`, "");
  };

  // ---- the hub ----
  out.push(`= ${HUB_STITCH}`);

  // Festival night (RULED 2026-08-01, festival-night-transition-plan.md
  // section C): once every scene on the Festival Grounds has been played,
  // the vignette starts automatically — no further choice to make. Scoped to
  // FESTIVAL_SCREEN_ID only: T7 is the only screen the final sequence's
  // night ever reaches, and (today) the only screen whose every scene is
  // night-gated, so "every scene on this screen" and "every night scene"
  // coincide. A stitch/knot name evaluates to its own read count in ink, so
  // referencing each scene's address directly needs no extra state.
  if (screenId === FESTIVAL_SCREEN_ID) {
    const nightScenes = graph.scenes.filter((s) => s.screen_id === screenId);
    if (nightScenes.length > 0) {
      const allSeen = nightScenes.map((s) => `${s.ink_address} > 0`).join(" && ");
      out.push(`{ TimeOfDay == night && ${allSeen}: -> festival_vignette }`);
    }
  }

  // Scenes on this screen. Once-only (`*`), because a conversation is a beat you
  // have rather than a room you re-enter — and because a sticky entry would let
  // a walker (or a bored player) re-open a spent scene forever.
  //
  // But once-only makes EARLY entry destructive: entering plays only the beats
  // open right now and still spends the entry, so a scene whose beats span days
  // silently loses the later ones. Greeting Ilsa at the festival on day 1 used
  // to cost her whole arc turn, and entering SC-T6-01 on day 1 stranded its
  // `day >= 4` beat. So the entry is guarded on `sceneEntryDay` — the day every
  // beat is open — which makes one entry lossless.
  //
  // Guarded on the soul standing here AND on that day.
  const here = graph.scenes.filter((s) => s.screen_id === screenId);
  for (const scene of here) {
    const presence = `present_${inkAddress(scene.soul)} == "${screen.screen_id}"`;
    const entryDay = sceneEntryDay(scene);
    const dayGuard = entryDay > 1 ? ` && day >= ${entryDay}` : "";
    // The scene's own entry gate — normally played(previous conversation), so a
    // thread's conversations are offered in order instead of all at once. No
    // fallback divert is needed for a false gate here (unlike a gated node,
    // which would dead-end mid-scene): this is one `*` choice among several, so
    // an unavailable entry is simply not offered.
    const entry = compileConditions(scene.entry_gate, {
      screen_id: screen.screen_id,
      scene_addresses: sceneAddresses(graph),
    });
    const entryGuard = entry.guard === "" ? "" : ` && ${entry.guard}`;
    // GP-93 rule 3 (RULED): the day's opening slot (morning) belongs to the
    // festival arc — every other scene needs the clock to have moved past it.
    // Rule 4: every later slot is open to any thread, festival included, so
    // this guard only ever excludes non-festival scenes, and only at morning.
    // Gated on festivalThreadIds being non-empty: with no ratified
    // festival-arc thread in this data (goal_threads all empty — a content
    // gap, or a minimal test fixture with no role_workplace at all), nothing
    // could ever qualify as "the festival arc", and reserving the opening
    // slot for a thread that does not exist would just strand it instead of
    // reserving it for anything.
    const openingSlotGuard =
      festivalThreadIds(graph).size > 0 && !isFestivalArcScene(graph, scene) ? ` && TimeOfDay != morning` : "";
    // Two scenes for one soul on one screen would both read "Talk to Toby",
    // and only the tag would tell them apart — unreadable in review. Suffix the
    // scene id only where the ambiguity actually exists, so the common case
    // stays clean. Order is authored order, so the arc's beats come in sequence.
    const ambiguous = here.filter((s) => s.soul === scene.soul).length > 1;
    const label = cleanText(soulLabel(graph, scene.soul)) + (ambiguous ? ` (${scene.scene_id})` : "");
    out.push(
      `* {${presence}${dayGuard}${entryGuard}${openingSlotGuard}} [Talk to ${label}] #scene:${scene.scene_id} -> ${scene.ink_address}`,
    );
  }

  for (const ex of screen.examinables ?? []) {
    out.push(`+ [Look at ${cleanText(readable(ex.id))}] -> ${inkAddress(ex.id)}`);
  }

  // Exits. NOTE: status locks are NOT enforced here, and that is deliberate.
  // A gate carries an archetype and a prose five_field_ref but no
  // machine-readable condition, so there is nothing to compile. Guarding on the
  // literal status string would strand T4 and T6 — Ilsa's whole arc and
  // SC-T6-01 — and make the week unplayable. The lock rides as a tag so the
  // tool can show it (a display-only advisory, nothing here enforces it).
  //
  // Only status "locked(gate_id[, gate_id])" is a lock — screen-spec-schema.md
  // is explicit that "reachable(gate_id)" is NOT one ("a knowledge-demonstration
  // site that is never blocked... walking up is free, the demonstration is the
  // gate"). Tagging every non-"start" status (as this used to) put a #lock: on
  // reachable() exits too and made the tool's lock badge lie about them.
  //
  // Connections are UNDIRECTED. `connects_to` is declared on one side only, but
  // it models a path between two places, not a one-way door — and computeHealth
  // has always flooded it undirected. Emitting only the declared direction left
  // T6, T7, T8, F6, F7 and F8 with exits and no entrances: each one declares an
  // outward connection and nothing declares one back, so the player could leave
  // them but never arrive. That stranded SC-T6-01 and both festival-night arc
  // turns. Walking the edge from either end is what the data already meant.
  const neighbours = new Set<string>();
  for (const c of screen.connects_to ?? []) {
    neighbours.add(typeof c === "string" ? c : c.screen_id);
  }
  for (const other of graph.screens) {
    for (const c of other.connects_to ?? []) {
      const to = typeof c === "string" ? c : c.screen_id;
      if (to === screen.screen_id) neighbours.add(other.screen_id);
    }
  }
  for (const targetId of [...neighbours].sort()) {
    const target = graph.screens.find((s) => s.screen_id === targetId);
    // A connection to a screen this graph does not contain is skipped rather
    // than thrown: the test fixtures are a deliberate subset (fixture T1
    // connects to F1, which the fixture set omits), and emitting an exit to a
    // knot that does not exist would be an ink compile error either way.
    // Reporting a genuinely dangling connection is W2's job: `conditions.ts`
    // for what is decidable statically, `walk.ts` for what needs a real walk.
    // Either can tell a partial fixture from a broken map; the emitter cannot.
    if (!target) continue;
    const lockTag = target.status.startsWith("locked(") ? ` #lock:${target.status}` : "";
    // No move budget at night, and T7 is the only screen the final sequence
    // ever reaches (RULED 2026-08-01) — suppress every ordinary exit once
    // TimeOfDay is night, same guard style as a day-gated scene entry above.
    out.push(`+ {movesLeft > 0 && TimeOfDay != night} [Go to ${cleanText(target.name)}]${lockTag}`);
    out.push(...emitMoveTo(target.ink_address, "    "));
  }

  if (screenId === FESTIVAL_SCREEN_ID) {
    // Always available at night (RULED 2026-08-01): the player may start the
    // vignette early, before every NPC scene here is spent.
    out.push(`+ {TimeOfDay == night} [Begin the festival vignette] -> festival_vignette`);
  }

  // Wait (T8, RULED by Roc 2026-08-24): stay put and let time pass. The day
  // clock only ever advances through ink — a host-side setVar shortcut is not
  // a legal way to move it — so waiting has to be a real choice here, and it
  // costs a move like every other time-consuming action.
  //
  // It is an exit that leads back to this same screen: emitMoveTo spends one
  // move and only calls advance_time() once the block's budget is empty, so a
  // single Wait either just eats a move or rolls the clock to the next block,
  // exactly matching how every "Go to X" already behaves. Same guard as those
  // exits — no move budget at night, and nothing to wait for once the final
  // sequence is running.
  out.push(`+ {movesLeft > 0 && TimeOfDay != night} [Wait]`);
  out.push(...emitMoveTo(screen.ink_address, "    "));

  out.push("+ [End the day] -> day_end", "");

  for (const ex of screen.examinables ?? []) {
    const body = [
      `Placeholder examinable: ${ex.id} (${ex.clue_tier}). #id:GB-${screen.screen_id}-EX-${ex.id}`,
    ];
    // R5's pickup path: examining the thing records the knowledge, so a player
    // who closed the conversational route can still pick the fact up off the
    // world. Same two lines a `knowledge_flag` state_action compiles to
    // (actions.ts), wrapped in a not-already-known guard.
    //
    // The guard is what lets the hub entry stay STICKY (`+`) without
    // double-recording: the look is repeatable forever — a thing on a shelf
    // does not vanish once seen — but recordKnowledge fires on the first look
    // only, so no host-side counter can key off re-looking (guardrails check 2
    // bars exactly that).
    if (ex.knowledge_flag) {
      const phrase = inkAddress(ex.knowledge_flag);
      body.push(
        `{ not (KnownPhrases ? ${phrase}):`,
        `    ~ KnownPhrases += ${phrase}`,
        `    ~ recordKnowledge("${ex.knowledge_flag}")`,
        `}`,
      );
    }
    addStitch(inkAddress(ex.id), body);
  }
  // ts_ prefix: a bare time-state stitch name would collide with the
  // TimeOfDay LIST elements (ink identifiers share one global namespace).
  for (const ts of screen.time_states ?? []) {
    addStitch(`ts_${inkAddress(ts)}`, [
      `Placeholder time-state: ${screen.screen_id} at ${ts}. #id:GB-${screen.screen_id}-TS-${ts}`,
    ]);
  }
  return out.join("\n") + "\n";
}

// ---------- souls/<soul>.ink ----------

function lineById(scene: GraphScene, contentId: string): ContentLine {
  const line = scene.lines.find((l) => l.content_id === contentId);
  if (!line) {
    throw new Error(`Scene ${scene.scene_id}: content_id "${contentId}" not found in lines`);
  }
  return line;
}

/** Does this node carry per-path prose at all? Most nodes do not. */
function hasPathVariants(node: GraphChoiceNode): boolean {
  return Object.keys(node.path_variants ?? {}).length > 0;
}

/**
 * The printable body for a slot, honouring `path_variants`.
 *
 * With no variant the body is what it always was. With one, both bodies go out
 * as a single ink conditional on DIVERT_PATH_FLAG — text AND tags, so the
 * #id tag names the line that actually printed and QA's tag stream stays
 * truthful on both paths. `{cond:a|b}` binds tags to the branch that runs
 * (verified against inkjs), which is why this can be one line rather than two
 * guarded ones.
 */
function pathBody(
  scene: GraphScene,
  node: GraphChoiceNode,
  line: ContentLine,
  extraTags: string[] = [],
): string {
  const normal = `${cleanText(line.text)} ${lineTags(line, extraTags)}`;
  const divertId = node.path_variants?.[line.content_id];
  if (!divertId) return normal;
  const divert = lineById(scene, divertId);
  return `{${DIVERT_PATH_FLAG}:${cleanText(divert.text)} ${lineTags(divert, extraTags)}|${normal}}`;
}

/**
 * Emit one choice node as an ink weave.
 *
 * `depth` is the weave level: 1 is the scene's own line (`*` / `-`), 2 is a
 * sub-conversation nested inside an option (`**` / `--`). ink counts nesting by
 * marker repetition, so depth is the only thing that changes between the two —
 * the body is identical, which is the reason this is a parameter rather than a
 * second emitter.
 */
function emitChoiceNode(
  graph: Graph,
  scene: GraphScene,
  node: GraphChoiceNode,
  depth = 1,
): string[] {
  const out: string[] = [];
  const compiled = compileConditions(node.availability_conditions, { screen_id: scene.screen_id });
  const guard = compiled.guard === "" ? "" : `{${compiled.guard}} `;
  // ink counts nesting by marker repetition, not whitespace, so the indent is
  // purely for the human reading the generated file — and Roc does read it.
  const lead = "    ".repeat(depth - 1);
  const bullet = `${lead}${"*".repeat(depth)}`;
  const rule = `${lead}${"-".repeat(depth)}`;
  // Body lines sit one step in from their bullet; at depth 1 that is the
  // 4-space indent the emitter has always used.
  const pad = "    ".repeat(depth);
  // Sub-nodes are emitted by their parent option, not by the scene loop.
  const subNodes = (parentOptionId: string) =>
    scene.choice_nodes.filter((n) => n.parent_option === parentOptionId);

  // Set-up line: the flat-array line back-referencing this choice with no
  // option_id. A gather_line matches that description too — it belongs to the
  // node and names no option — so it is excluded by id, or a node whose only
  // unoptioned line is its gather would print that line as its set-up and then
  // again at the gather.
  // A divert-path variant of the set-up (path_variants) matches that
  // description too — same choice_id, no option_id — so it is excluded by id
  // as well. Excluding by VALUE rather than by array order is what keeps the
  // normal-path line the set-up regardless of which of the pair is authored
  // first in `lines`.
  const variantTargets = new Set(Object.values(node.path_variants ?? {}));
  const setup = scene.lines.find(
    (l) =>
      l.choice_id === node.choice_id &&
      !l.option_id &&
      l.content_id !== node.gather_line &&
      !variantTargets.has(l.content_id),
  );
  // Anchor this node with its OWN address (node.ink_address — "weave anchor
  // label form of choice_id", types.ts) as a labelled gather-dash line, not a
  // plain content line. ink only makes a point cross-referenceable when it is
  // declared with a gather "-", so this is what lets divert_to (below) land on
  // the actual node instead of replaying the scene from its top.
  const anchor = `${rule} (${node.ink_address})`;
  let choiceTagPlaced = false;
  if (setup) {
    const body = pathBody(scene, node, setup, [`#choice:${node.choice_id}`]);
    // A gated node must gate its OWN set-up line, not just its options — a
    // player who never met the node's condition should never read the line
    // that presumes they did (live bug: CH-T4-02-3's set-up printed ungated).
    out.push(compiled.guard ? `${anchor} { ${compiled.guard}: ${body} }` : `${anchor} ${body}`);
    choiceTagPlaced = true;
  } else {
    // No separate set-up line — still anchor the node so a cross-scene
    // divert_to (or a future jump-to-node feature) has a real address.
    out.push(anchor);
  }

  for (const opt of node.options) {
    // #choice: rides the first option line when the node has no set-up line.
    const choiceTag = choiceTagPlaced ? "" : ` #choice:${node.choice_id}`;
    choiceTagPlaced = true;

    let label: string;
    let labelIdTag: string;
    if (opt.player_line) {
      const pl = lineById(scene, opt.player_line);
      // A player_line can have a divert-path variant too — what the player has
      // room to say depends on how the beat opened. The conditional sits inside
      // the quotes (text) and inside the tag value (id) rather than wrapping
      // the whole option, so the option stays ONE choice on both paths.
      const plDivert = node.path_variants?.[pl.content_id];
      if (plDivert) {
        const div = lineById(scene, plDivert);
        label = `"{${DIVERT_PATH_FLAG}:${cleanText(div.text)}|${cleanText(pl.text)}}"`;
        // The whole tag alternates, not the value inside it: a conditional in
        // the tag VALUE comes back as "#id: L-..." (ink keeps the space), and
        // every id consumer reads "#id:" with no space.
        labelIdTag = ` {${DIVERT_PATH_FLAG}:#id:${div.content_id}|#id:${pl.content_id}}`;
      } else {
        label = `"${cleanText(pl.text)}"`;
        labelIdTag = ` #id:${pl.content_id}`;
      }
    } else if (opt.surface_action) {
      label = cleanText(opt.surface_action);
      labelIdTag = "";
    } else {
      throw new Error(`Option ${opt.option_id}: needs exactly one of player_line / surface_action`);
    }
    out.push(`${bullet} ${guard}[${label}] #opt:${opt.option_id}${choiceTag}${labelIdTag}`);

    const acts = compileStateActions(opt.state_actions, scene.soul);
    for (const l of acts.inkLines) out.push(`${pad}${l}`);
    for (const slotId of opt.response_slots ?? []) {
      const resp = lineById(scene, slotId);
      out.push(`${pad}${pathBody(scene, node, resp)}`);
    }

    // The sub-conversation, if this option carries one. It emits INSIDE the
    // option at the next weave level, and its last node gathers at this
    // option's own label (graph.ts assigns that address), so every path
    // through the option converges before the parent gather takes over.
    const subs = subNodes(opt.option_id);
    if (subs.length > 0) {
      if (opt.rejoin === "divert") {
        throw new Error(
          `Option ${opt.option_id}: carries a sub-conversation and rejoin "divert". ` +
            `A diverting option leaves the scene, so its sub-nodes could never play.`,
        );
      }
      for (const sub of subs) out.push(...emitChoiceNode(graph, scene, sub, depth + 1));
      continue;
    }

    if (opt.rejoin === "divert") {
      // Bug fix: this used to divert to the SCENE containing the target node
      // (target.ink_address alone) rather than the node itself, so a diverting
      // option landed back at the top of the scene — a replay loop — instead
      // of at the beat it actually names. The node's own address (anchored
      // above as a gather-dash label) is what makes the target addressable;
      // qualify it with the owning scene's address so a divert can cross
      // scenes (divert_to is not scoped to the current scene).
      const targetScene = graph.scenes.find((s) =>
        s.choice_nodes.some((n) => n.choice_id === opt.divert_to),
      );
      const targetNode = targetScene?.choice_nodes.find((n) => n.choice_id === opt.divert_to);
      if (!targetScene || !targetNode) {
        throw new Error(`Option ${opt.option_id}: divert_to "${opt.divert_to}" not found`);
      }
      // Tell the target which door it was entered by, when the answer matters:
      // either the target prints per-path prose, or this node does and the flag
      // may still be true from the divert that brought us in. Assigned rather
      // than only set, so a chain of diverts always leaves it correct for the
      // node about to run.
      if (hasPathVariants(targetNode) || hasPathVariants(node)) {
        out.push(`${pad}~ ${DIVERT_PATH_FLAG} = ${hasPathVariants(targetNode)}`);
      }
      out.push(`${pad}-> ${targetScene.ink_address}.${targetNode.ink_address}`);
    }
  }

  // A gated node guards every option with the same availability condition, so
  // when the gate is false the choice point has no available option. Ink would
  // stop there — the scene cannot reach its gather and dead-ends. A fallback
  // choice (no text, just a divert) fires automatically only when no normal
  // option is available, skipping the beat to the gather. So a failed gate
  // never blocks the scene from ending.
  if (node.availability_conditions.length > 0) {
    out.push(`${bullet} -> ${node.gather_address}`);
  }

  // gather point — rejoin-by-default keeps QA's walk linear in choice count.
  // A gather is a beat: `gather_line` names the content slot that says what is
  // true now that the branch has converged. Without one it keeps the generated
  // placeholder, so an unauthored gather is visible rather than silent.
  const gatherLine = node.gather_line ? lineById(scene, node.gather_line) : undefined;
  const gatherText = gatherLine
    ? pathBody(scene, node, gatherLine)
    : `Placeholder: the scene continues. #id:GB-${node.choice_id}-GATHER`;
  out.push(`${rule} (${node.gather_address}) ${gatherText}`);
  // Every path through this node has converged here and every variant slot has
  // printed, so the divert-path flag has done its job. Clearing it at the
  // gather is what keeps it scoped to one node — a later NORMAL entry to this
  // same node must not inherit a divert from earlier in the life.
  if (hasPathVariants(node)) out.push(`${pad}~ ${DIVERT_PATH_FLAG} = false`);
  return out;
}

function emitSoul(graph: Graph, soulId: string): string {
  const knot = inkAddress(soulId);
  const scenes = graph.scenes.filter((s) => s.soul === soulId);
  const out: string[] = [
    `// souls/${knot}.ink — generated. A soul file reads as the person. Do not hand-edit.`,
    "",
    `=== ${knot} ===`,
    "-> DONE",
    "",
  ];
  for (const scene of scenes) {
    const stitch = scene.ink_address.split(".")[1];
    out.push(`= ${stitch}`);
    // Free-standing lines (no choice/option back-reference), in authored order.
    for (const line of scene.lines) {
      if (line.choice_id || line.option_id) continue;
      out.push(`${cleanText(line.text)} ${lineTags(line)}`);
    }
    // Top-level nodes only. A node with a parent_option is emitted from inside
    // that option, at the next weave level; emitting it here as well would put
    // the same beat in the scene twice.
    for (const node of scene.choice_nodes) {
      if (node.parent_option) continue;
      out.push(...emitChoiceNode(graph, scene, node));
    }
    // Return to the screen the conversation happened on, not DONE (W1b).
    // `-> DONE` ended the whole flow, so a scene entered from the world ended
    // the day. Diverting back also fixes jumpTo, which used to dead-end.
    // A tunnel (`-> scene ->` / `->->`) would be more idiomatic ink, but
    // ChoosePathString straight into a scene would then hit `->->` with an
    // empty tunnel stack and throw — and jumping into a scene is a shipped
    // feature of the tool.
    const screen = graph.screens.find((s) => s.screen_id === scene.screen_id);
    if (!screen) {
      throw new Error(`emitSoul: scene ${scene.scene_id} names unknown screen ${scene.screen_id}`);
    }
    out.push(...emitConversationReturn(`${screen.ink_address}.${HUB_STITCH}`, ""), "");
  }
  return out.join("\n") + "\n";
}

// ---------- main.ink ----------

/**
 * The day loop (W1c, extended for the Home Hub — D2). What this replaced was
 * a stub in three ways: it offered `graph.screens[0]` and literally nothing
 * else, so exactly one screen in the world was reachable; `movesLeft` was
 * hard-coded to 3; and the clock never moved, so a `day >= 4` gate could not
 * open in play and SC-T6-01's gated half was unwalkable.
 *
 * Now day_start puts the player at a start screen — either the one picked at
 * the PRIOR evening's Home Hub calendar, or (day 1, which has no prior
 * evening) one the player chooses by hand at screen_hub. Movement between
 * screens spends a move and advances the clock. day_end always returns to
 * the Home Hub (GDD 08-levels.md; 03-core-loop.md; 06-world-and-progression.md
 * "return home... pick the next day's location"), where the calendar sets
 * `pickedStartScreen`/`pickedLocation` for tomorrow, then rolls the day over
 * until the life ends.
 *
 * Two VARs come out of one calendar pick, for two different readers:
 *   `pickedStartScreen` — the exact screen's ink_address. day_start reads
 *     this back (start_from_calendar) to know exactly where to place the
 *     player, same as before D2 iteration 2. Screen-local, this tool only.
 *   `pickedLocation` — the screen's LOCATION region ("town"/"forest"/"farm").
 *     graph.ts's HOME_HUB_WRITER comment and types.ts's DayInput.picked_location
 *     both document this as "the location the player picked the prior
 *     evening", and day.ts's guarantee floor compares it against
 *     ScreenSpec.location directly — a screen id compares equal to nothing
 *     there, which is the exact bug iteration 1 shipped (a "t1" pick can
 *     never match a screen whose location is "town", so the floor's own
 *     `collectOpenings` always came back empty and resolveDay threw). Keeping
 *     the calendar at one choice per SCREEN (not per location) preserves the
 *     walk/search machinery's existing "Go to <screen name>" route-matching
 *     (walk.ts's plannedStrategy) untouched; only the WRITTEN VALUE changes.
 *
 * home_hub and calendar both carry `#screen:${HOME_SCREEN_ID}` (D2 iteration
 * 3) — graph.ts's HOME_SCREEN_ID is a real ScreenSpec entry (status "hub",
 * excluded above from emitScreen's generic loop) that exists FOR this tag.
 * Before this, neither knot carried a #screen: tag at all, so play.ts's
 * currentScreen tracking never changed while the player stood in the Home
 * Hub — the stage pane kept showing whatever real screen was visited last,
 * for the whole Home Hub visit.
 */
function emitMain(
  graph: Graph,
  worldFiles: string[],
  soulFiles: string[],
  dayLoop: { moves_per_day: number; days_per_life: number },
): string {
  const includes = ["state.ink", "system/externals.ink", ...worldFiles, ...soulFiles];
  // Every screen the data marks "start" — the calendar and the day-1 manual
  // fallback both offer exactly this set. Festival Grounds carries status
  // "reachable" instead (screen-specs.json note, RULED 2026-07-30: "open by
  // default, but not a main screen"), so it is walkable but never a start
  // option here — GDD 08-levels.md calls it "the final screen".
  const starts = graph.screens.filter((s) => s.status.startsWith("start"));
  const festivalScreen = graph.screens.find((s) => s.screen_id === FESTIVAL_SCREEN_ID);
  if (!festivalScreen) {
    throw new Error(`emitMain: FESTIVAL_SCREEN_ID "${FESTIVAL_SCREEN_ID}" not found in graph.screens`);
  }
  const out: string[] = [
    "// main.ink — INCLUDEs + the day loop (build-loop.md piece 4). Generated.",
    "",
    ...includes.map((f) => `INCLUDE ${f}`),
    "",
    "-> day_start",
    "",
    "=== day_start ===",
    "~ TimeOfDay = morning",
    `~ movesLeft = ${dayLoop.moves_per_day}`,
    "Day {day} begins. #id:SYS-DAY-BEGIN",
    "// pickedStartScreen is set at the PRIOR evening's Home Hub calendar (below).",
    "// Day 1 has no prior evening, so it stays \"none\" and screen_hub covers it.",
    '{ pickedStartScreen != "none":',
    "    -> start_from_calendar",
    "- else:",
    "    -> screen_hub",
    "}",
    "",
    "// Arriving at the calendar's pick spends move 1 of the fresh morning",
    "// budget — the same cost as picking a start screen by hand at screen_hub",
    "// (RULED 2026-08-01: picking the start location spends move 1).",
    "=== start_from_calendar ===",
    "~ temp dest = pickedStartScreen",
    '~ pickedStartScreen = "none"',
    "{ dest:",
  ];
  for (const s of starts) {
    out.push(`- "${s.ink_address}":`);
    out.push(...emitMoveTo(s.ink_address, "    "));
  }
  out.push(
    "- else:",
    "    -> screen_hub",
    "}",
    "",
    "// Manual fallback: day 1 (no calendar pick exists yet) and a safety net",
    "// if the switch above ever misses. Choosing an opening position spends",
    "// move 1 of morning's budget, same as any other move (RULED 2026-08-01).",
    "=== screen_hub ===",
  );
  for (const s of starts) {
    out.push(`+ {movesLeft > 0} [Begin at ${cleanText(s.name)}]`);
    out.push(...emitMoveTo(s.ink_address, "    "));
  }
  out.push(
    "+ [End the day] -> day_end",
    "",
    "// The final sequence (GDD 03-core-loop.md day-5 exception; RULED",
    "// 2026-08-01) intercepts BEFORE the day increments below — on the life's",
    "// last day, evening's exhausted budget goes home to home_hub_final, not",
    "// the ordinary calendar, and day never advances past it. The old",
    "// day-overrun ending (retired: it used to fire once day exceeded",
    "// days_per_life) is gone — with the intercept here, day can never exceed",
    "// days_per_life, and the final screen is now the only way a life ends.",
    "=== day_end ===",
    `{ day == ${dayLoop.days_per_life}:`,
    "    -> home_hub_final",
    "}",
    "~ day = day + 1",
    "-> home_hub",
    "",
    "// The Home Hub (GDD 08-levels.md): day's end always returns here",
    "// (03-core-loop.md, 06-world-and-progression.md). It resets empty each",
    "// life in the shipped game. Bank/decorate/satchel-triage are D6's build",
    "// (out of D2's scope — a niceness-meter of half-built systems is worse",
    "// than an honest placeholder), but the hub offers a real choice of its",
    "// own rather than a single line that auto-advances into the calendar:",
    "// look around (flavor, once) or start the next day. The calendar NEVER",
    "// opens on its own (GP-52, playtest 2026-08-02: \"let player open the",
    "// calendar\") — looking around returns to the hub, same stitch pattern as",
    "// home_hub_final below, and only the explicit \"Start the Next Day\" pick",
    "// moves on. Renamed from \"Open the calendar\" per Roc's 2026-08-23 ruling",
    "// (the knot is still named `calendar`; only the choice label changed). A",
    "// bare day-loop walk spends one extra step here per evening, plus one more",
    "// the single time the once-only look-around is available (walk.test.ts).",
    "=== home_hub ===",
    `You're home for the night. #screen:${HOME_SCREEN_ID} #id:SYS-HOME-HUB`,
    "-> hub_night",
    "",
    "= hub_night",
    "* [Look around your home]",
    "    Bank what fits the satchel, and decorate it — placeholder for D6's carry model. #id:SYS-HOME-LOOK",
    "    -> hub_night",
    "+ [Start the Next Day] -> calendar",
    "",
    "// \"When ready to move on, you open the calendar and pick the next day's",
    "// location\" (03-core-loop.md). Sets pickedStartScreen (exact screen, for",
    "// day_start's routing) AND pickedLocation (that screen's region, for the",
    "// resolver's DayInput.picked_location contract — types.ts: \"the location",
    "// the player picked the prior evening\") — see the emitMain doc comment.",
    "=== calendar ===",
    `Pick tomorrow's destination. #screen:${HOME_SCREEN_ID} #id:SYS-CALENDAR`,
  );
  for (const s of starts) {
    out.push(`+ [Go to ${cleanText(s.name)}]`);
    out.push(`    ~ pickedStartScreen = "${s.ink_address}"`);
    out.push(`    ~ pickedLocation = "${s.location}"`);
    out.push("    -> day_start");
  }
  out.push(
    "",
    "// The final sequence (GDD 03-core-loop.md day-5 exception; RULED",
    "// 2026-08-01, RATIFIED as \"final sequence\"): no calendar — there is no",
    "// day 6 to plan. The only forward option is the Festival; that choice is",
    "// the ONLY place `night` ever enters the clock (advance_time() below",
    "// still never reaches it). One-way: nothing diverts from here back into",
    "// the ordinary day cycle.",
    "=== home_hub_final ===",
    `You're home for the last night. Tomorrow there is no cycle left — only the festival. #screen:${HOME_SCREEN_ID} #id:SYS-HOME-HUB-FINAL`,
    "-> hub_final",
    "",
    "= hub_final",
    "* [Look around your home]",
    "    One last look, before the festival. #id:SYS-HOME-FINAL-LOOK",
    "    -> hub_final",
    "+ [Go to the Festival night]",
    "    ~ TimeOfDay = night",
    `    -> ${festivalScreen.ink_address}`,
    "",
    "// The vignette (T9), the night screen (TN) and the final screen (FS)",
    "// are real screens (screen-specs.json — graph.ts's VIGNETTE_SCREEN_ID /",
    "// NIGHT_SCREEN_ID / FINAL_SCREEN_ID),",
    "// hand-authored here like home_hub rather than generated by emitScreen —",
    "// see emitInk's exclusion list. Placeholder prose only, tagged for the",
    "// prose pass (\"graph before prose\", pipeline.md step 6).",
    `=== festival_vignette ===`,
    `Placeholder: the festival night vignette, shaped by the choices made this life. #screen:${VIGNETTE_SCREEN_ID} #id:SYS-FESTIVAL-VIGNETTE`,
    "-> night_screen",
    "",
    "// The night-version screen (GP-51, Roc's playtest note 2026-08-02:",
    '// "needs a Night time screen that shows night version before the Final',
    '// Screen"). Holds the night view of the town between the vignette and',
    "// the results; its single forward choice keeps the play paused here so",
    "// the screen is actually seen, instead of falling straight through.",
    `=== night_screen ===`,
    `Placeholder: the town under festival night — the night version of the world. #screen:${NIGHT_SCREEN_ID} #id:SYS-NIGHT-SCREEN`,
    "+ [Go to the results] -> final_screen",
    "",
    "// The results slot stopped being a placeholder on 2026-08-24 (T9, Roc's",
    "// festival-scoring ruling of 2026-08-23). The HOST reads the score and",
    "// draws what the week came to — the tier as the festival's own look, the",
    "// souls who turned out, the town work that got finished. Ink states the",
    "// frame and nothing else, for two reasons: the counters are host-side",
    "// (per-NPC daily talk count; festival goals completed) and ink stores",
    "// none of them, and NEVER A SCORE SHOWN (03-core-loop.md) means there is",
    "// no number for ink to interpolate here even if it had one.",
    `=== final_screen ===`,
    `The lanterns are down, and the square keeps whatever the week made of it. #screen:${FINAL_SCREEN_ID} #id:SYS-FINAL-SUMMARY`,
    "There is still more to find, whenever you're ready to look. #id:SYS-FINAL-RESTART",
    "-> END",
    "",
    "// Year-loop saves (T13, 2026-08-23 ruling): the story resets its own",
    "// clock. HOST-DIVERT-ONLY — nothing above diverts here and no choice",
    "// ever offers it; the host (LanternPlayer.jumpToAddress) is the only way",
    "// in, from final_screen's parked END, once the player picks \"continue\"",
    "// on the rollover screen (Phase 5). That is why walk.ts and the week-walk",
    "// test suite never need to see this knot — it is unreachable by any ink",
    "// choice, on purpose. day_start already resets TimeOfDay and movesLeft",
    "// (see above), so this knot resets only what day_start doesn't.",
    "=== begin_new_year ===",
    "~ year = year + 1",
    "~ day = 1",
    '~ pickedStartScreen = "none"',
    "-> day_start",
    "",
    "// Advances the block, NOT called per move (emitMoveTo only calls this",
    "// once a block's move budget is exhausted) — and (GP-93) called",
    "// unconditionally on returning from every conversation, quiet or not",
    "// (emitConversationReturn). Either caller only ever reaches this from",
    "// morning or afternoon; an exhausted evening/evening-ending-conversation",
    "// diverts straight to day_end instead, so this never needs to produce",
    "// `night`. At night it is a harmless no-op (no `was == night` branch",
    "// below), which is what lets multiple night scenes still play back to",
    "// back — night is festival night, the final sequence (see home_hub_final",
    "// above), not a normal block. A temp holds the block being left, so a",
    "// single call cannot cascade two steps.",
    "=== function advance_time() ===",
    "~ temp was = TimeOfDay",
  );
  // Multi-line conditionals: ink rejects a `~` inside a one-line `{ c: ~ x }`
  // ("tildas are for logic that's on its own line").
  const blocks = ["morning", "afternoon", "evening"];
  for (let i = 0; i < blocks.length - 1; i++) {
    out.push(`{ was == ${blocks[i]}:`, `    ~ TimeOfDay = ${blocks[i + 1]}`, "}");
  }
  // A fresh block starts with a fresh budget — reset here so every caller
  // (screen_hub's start pick included) gets it for free.
  out.push(`~ movesLeft = ${dayLoop.moves_per_day}`, "");
  return out.join("\n") + "\n";
}

// ---------- entry ----------

export function emitInk(graph: Graph): InkFiles {
  const files: InkFiles = new Map();
  files.set("state.ink", emitState(graph));
  files.set("system/externals.ink", emitExternals());

  // Four screens are hand-authored in emitMain, not generated by emitScreen's
  // generic per-screen pipeline: the Home Hub (HOME_SCREEN_ID — home_hub/
  // calendar/home_hub_final) and the final sequence's three screens
  // (VIGNETTE_SCREEN_ID/NIGHT_SCREEN_ID/FINAL_SCREEN_ID —
  // festival_vignette/night_screen/final_screen).
  // Running any of them through emitScreen too would mint a second,
  // unreachable world/*.ink knot that nothing diverts into — dead generated
  // code, not a second real screen.
  const HAND_AUTHORED_SCREEN_IDS = new Set([HOME_SCREEN_ID, VIGNETTE_SCREEN_ID, NIGHT_SCREEN_ID, FINAL_SCREEN_ID]);

  const worldFiles: string[] = [];
  for (const screen of [...graph.screens].sort((a, b) => a.screen_id.localeCompare(b.screen_id))) {
    if (HAND_AUTHORED_SCREEN_IDS.has(screen.screen_id)) continue;
    const rel = `world/${screen.ink_address}.ink`;
    files.set(rel, emitScreen(graph, screen.screen_id));
    worldFiles.push(rel);
  }

  const soulIds = [...new Set(graph.scenes.map((s) => s.soul))].sort();
  const soulFiles: string[] = [];
  for (const soulId of soulIds) {
    const rel = `souls/${inkAddress(soulId)}.ink`;
    files.set(rel, emitSoul(graph, soulId));
    soulFiles.push(rel);
  }

  // day_loop rides the graph (stamped from tuning.json by buildGraph), so
  // emitInk keeps its one-argument signature. A graph built before W1c has no
  // block, and the fallback is exactly the values the loop was hard-coded to.
  const dayLoop = graph.day_loop ?? { moves_per_day: 3, days_per_life: 5 };
  files.set("main.ink", emitMain(graph, worldFiles, soulFiles, dayLoop));
  return files;
}

export function writeInk(files: InkFiles, outDir: string): void {
  for (const [rel, content] of files) {
    const abs = join(outDir, ...rel.split("/"));
    mkdirSync(dirname(abs), { recursive: true });
    writeFileSync(abs, content, "utf8");
  }
}
