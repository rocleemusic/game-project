/**
 * screens.mjs — the screen-flow manifest (single source of truth).
 *
 * Both halves of the tool read this file and nothing else about screen order:
 *   - capture.mjs drives the live mode5 build to each screen that has a
 *     `capture` block and writes shots/<id>.png.
 *   - build-flow.mjs lays every screen out in this order. A screen with a
 *     captured shot shows the screenshot; a screen without one falls back to a
 *     PLACEHOLDER card that embeds an image-gen prompt built from `refs` +
 *     `artNote` + ART_DIRECTION.
 *
 * "Gate" here is navigational, not a `G-*` id: it is the thing a reviewer does
 * (or the condition that must hold) to arrive at the screen in mode5. The
 * capture `steps` reuse the same tiny action vocabulary as tools/playtest.mjs
 * scenarios (wait / press / key / click / evalTrue) so the two stay legible
 * side by side.
 *
 * REF_DIR points at Roc's off-repo reference board. build-flow.mjs embeds each
 * referenced image as a data: URI when the file is present, and degrades to the
 * bare filename when it is not — the page is always self-contained either way.
 */

export const REF_DIR = "C:/Users/rocle/Desktop/8-16-refs/savescreen-inventory";

/** House style baked into every placeholder image-gen prompt. */
export const ART_DIRECTION =
  "Hand-painted, cozy storybook illustration at 1920x1080 (16:9). Warm, " +
  "lived-in interiors, soft natural light, painterly texture and a gentle " +
  "line. Muted-but-saturated palette. Spiritfarer / Frieren register — no " +
  "hard UI chrome, no flat vector panels; diegetic, tactile surfaces.";

/**
 * The mode5 screen order. Screens with a `capture` block are reachable in the
 * live build today and get a real screenshot; the rest are design targets whose
 * art does not exist yet, so they render as placeholders.
 */
export const SCREENS = [
  {
    id: "mode-picker",
    name: "Mode Picker",
    gate: "App boot with no ?mode= — the entry menu that lists all four modes.",
    capture: {
      // No mode selected → ModePickerScene renders the menu.
      url: "?",
      steps: [{ action: "wait", ms: 900 }],
    },
  },
  {
    id: "location-select",
    name: "Location Select",
    gate: "Choose Mode 5 → LocationSelectScene (mode5's declared entry).",
    capture: {
      url: "?mode=mode5",
      steps: [{ action: "wait", ms: 1000 }],
    },
  },
  {
    id: "collect-forage",
    name: "Forage Screen",
    gate: "Pick a starting location card → CollectScene backdrop with the satchel/hotspot HUD.",
    capture: {
      url: "?mode=mode5",
      steps: [
        { action: "wait", ms: 900 },
        // "Begin at Forager's Clearing" card — the (960,490) hotspot, per playtest/mode5-vfx.mjs.
        { action: "click", x: 960, y: 490 },
        { action: "wait", ms: 900 },
      ],
    },
  },
  {
    id: "spellbook",
    name: "Spellbook (Cast)",
    gate: "Cast at a gated hotspot with a known spell → the spellbook row list.",
    // The cast modal renders live, but the target design is a full painted
    // spellbook (spells left, VFX + description right), so refs ride along too.
    capture: {
      url: "?mode=mode5",
      steps: [
        { action: "wait", ms: 900 },
        { action: "click", x: 960, y: 490 },
        { action: "wait", ms: 900 },
        // Press U (DEV-only unlock, active in the dev server) so sticks is held
        // and the cast path is deterministic, not dependent on a lucky forage.
        { action: "press", key: "U" },
        { action: "wait", ms: 300 },
        {
          action: "evalTrue",
          // Setup via the scene's own walker probe (see playtest/mode5-vfx.mjs).
          expression: `(() => {
            const p = window.__collect;
            if (!p) return false;
            const slot = p.forage().find((s) => s.item === "item_sticks");
            if (slot) p.pickup(slot.slotId, slot.item);
            if (!p.inventoryHeld().includes("item_sticks")) return false;
            p.openHedgePrompt();
            return true;
          })()`,
        },
        { action: "wait", ms: 250 },
        // "[ Cast ]" button on the modal, then let the spellbook render.
        { action: "click", x: 607, y: 442 },
        { action: "wait", ms: 350 },
      ],
    },
    refs: [
      "spell-book-bg.jpg",
      "spellbook-layout-inspo-spells-on-left-spell-vfx-and-description-right.jpg",
      "book over bg.jpg",
    ],
    artNote:
      "Spells listed down the left as a hand-written index; the right page shows the " +
      "selected spell's VFX preview above its description. Reads as an open grimoire, " +
      "not a menu.",
  },
  {
    id: "notebook",
    name: "Notebook",
    gate: "Press N (or the top-right [ notebook — N ] button) in CollectScene.",
    capture: {
      url: "?mode=mode5",
      steps: [
        { action: "wait", ms: 900 },
        { action: "click", x: 960, y: 490 },
        { action: "wait", ms: 900 },
        { action: "press", key: "N" },
        { action: "wait", ms: 700 },
      ],
    },
    refs: ["npc details in notebook.jpg"],
    artNote:
      "An NPC dossier spread: portrait, name, and the clues/relationships the player " +
      "has gathered, laid out like journal entries rather than a data table.",
  },
  {
    id: "calendar",
    name: "Calendar",
    gate: "Press L (or the top-right [ calendar — L ] button) in CollectScene.",
    capture: {
      url: "?mode=mode5",
      steps: [
        { action: "wait", ms: 900 },
        { action: "click", x: 960, y: 490 },
        { action: "wait", ms: 900 },
        { action: "press", key: "L" },
        { action: "wait", ms: 700 },
      ],
    },
    refs: ["calendar-has-where-you-visited.webp"],
    artNote:
      "A week/month spread that also records where the player has already been — " +
      "visited locations marked on the days, so the calendar doubles as a travel log.",
  },
  {
    id: "hub-decor",
    name: "Home Hub (Decoration)",
    gate: "Press H in CollectScene → HubScene, the decoratable mage's workspace.",
    capture: {
      url: "?mode=mode5",
      steps: [
        { action: "wait", ms: 900 },
        { action: "click", x: 960, y: 490 },
        { action: "wait", ms: 900 },
        { action: "press", key: "H" },
        { action: "wait", ms: 800 },
      ],
    },
    refs: [
      "mage-workspace.jpg",
      "workspace-inspiration.webp",
      "worspace-arrangement.webp",
      "shelf-in-mage-workspace.webp",
      "table-look.jpg",
      "cozy-corners-game-reference.jpg",
      "make-room-game-reference.jpg",
    ],
    artNote:
      "A cozy mage's corner the player arranges: shelves, a work table, and small " +
      "found objects placed by hand. Warm clutter that reflects what this life has " +
      "actually collected — the room is the save file made visible.",
  },
  {
    id: "satchel",
    name: "Satchel (Inventory)",
    gate: "Design target — the full-screen bag view behind the always-on satchel strip.",
    // No capture block: the live build only shows the HUD strip, not a screen.
    refs: ["inventory-bag.jpg", "inventory-alt.jpg", "inventory-inspect.jpg"],
    artNote:
      "The opened satchel as a painted bag interior: gathered materials as tactile " +
      "objects the player can inspect, not icons in a grid. Includes a close-up inspect " +
      "state for a single item.",
  },
  {
    id: "save-load",
    name: "Save / Load",
    gate: "Design target — the slot picker (today only ResumePromptScene's resume/new choice exists).",
    refs: ["save-load-screen.jpg"],
    artNote:
      "Save slots shown as book plates or shelf entries, each with its day/season and a " +
      "small snapshot of that life. Loading feels like pulling a volume off the shelf.",
  },
  {
    id: "options",
    name: "Options",
    gate: "Design target — settings screen (not built in any mode5 scene yet).",
    refs: ["options.jpg"],
    artNote:
      "A quiet settings page in the same painted frame: audio, text, and accessibility " +
      "controls styled as diegetic dials/labels rather than OS-style form rows.",
  },
];

/** Build the image-gen prompt embedded in a placeholder card for one screen. */
export function genPrompt(screen) {
  const refs = screen.refs && screen.refs.length ? screen.refs.join(", ") : "(no reference on file)";
  const note = screen.artNote ? ` ${screen.artNote}` : "";
  return (
    `Screen: ${screen.name}. Derive the composition and mood from reference ` +
    `image(s): ${refs}.${note} ${ART_DIRECTION}`
  );
}
