import Phaser from "phaser";
import { loadRun } from "./ink/loadRun";
import { PreloadScene } from "./boot/PreloadScene";
import { ModePickerScene } from "./scenes/ModePickerScene";
import { ScreenScene } from "./scenes/ScreenScene";
import { LocationSelectScene } from "./scenes/LocationSelectScene";
import { CollectScene } from "./scenes/CollectScene";
import { CastScene } from "./scenes/CastScene";
import { HubScene } from "./scenes/HubScene";
import { HubShelfScene } from "./scenes/HubShelfScene";
import { NotebookScene } from "./scenes/NotebookScene";
import { CalendarScene } from "./scenes/CalendarScene";
import { SatchelScene } from "./scenes/SatchelScene";
import { SaveLoadScene } from "./scenes/SaveLoadScene";
import { OptionsScene } from "./scenes/OptionsScene";
import { SpellTrialScene } from "./scenes/SpellTrialScene";

/**
 * Fixed 1920x1080 with Scale.FIT. This is what lets regions.json's normalized
 * hotspot fractions map to pixels with one multiply, across backdrops whose
 * sources run from 447x447 to 2000x1333.
 */
/**
 * `?walk=1` makes the WebGL back buffer readable so tools/walk.mjs can sample
 * real pixels. It carries a small cost, so it is opt-in rather than always on —
 * without it, reading the canvas returns black and every check is a false
 * alarm.
 */
const WALK_MODE = new URLSearchParams(location.search).has("walk");

const CONFIG: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1920,
  height: 1080,
  backgroundColor: "#12100c",
  parent: "game",
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  render: { preserveDrawingBuffer: WALK_MODE },
  scene: [
    ModePickerScene,
    PreloadScene,
    ScreenScene,
    LocationSelectScene,
    CollectScene,
    CastScene,
    HubScene,
    HubShelfScene,
    NotebookScene,
    CalendarScene,
    SatchelScene,
    SaveLoadScene,
    OptionsScene,
    SpellTrialScene,
  ],
};

async function boot() {
  const el = document.getElementById("status");
  try {
    const run = await loadRun();
    if (el) el.remove();
    const game = new Phaser.Game(CONFIG);
    // Dev-only handle for `tools/playtest.mjs` (the headless runtime-verification
    // harness) — costs nothing in production, never runs outside `npm run dev`/
    // `preview` under Vite's own DEV flag. See `playtest/` for this project's
    // scenario scripts.
    if (import.meta.env.DEV) (window as unknown as Record<string, unknown>).__PHASER_GAME__ = game;
    game.scene.start("ModePickerScene", { run });
  } catch (err) {
    if (el) {
      el.textContent = `Failed to load the run: ${err}`;
      el.style.color = "#ff8080";
    }
    throw err;
  }
}

void boot();
