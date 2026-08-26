/**
 * The four modes, as data.
 *
 * Modes 1-3 are written to be FAITHFUL TO WHAT THEY DO TODAY, not to what they
 * ought to do. Every field below was read off the scene that implements it —
 * `ScreenScene.init` for daylife, `CollectScene.init` +
 * `PreloadScene.create` for the other two — so that composing a scene from a
 * descriptor in Wave 1 is a refactor with an unchanged output, and `npm run
 * walk` / `npm run sweep` stay green across it.
 *
 * Nothing here is wired up yet. This file is a description; the reader lands in
 * Wave 1.
 *
 * RULING — MODES 1-3 KEEP `legacy-hedge` GATES. Only Mode 4 uses `authored`.
 * The legacy flag is local to `collectGates.ts` and clears no real `G-*` id, on
 * purpose: F7 also requires `G-F5-cascade`, which nothing in modes 2-3 can
 * clear, so pointing those modes at the authored rulings naively makes F7
 * permanently stuck and the mode unwinnable. Change this only after a playtest
 * says otherwise.
 */

import type { ModeDescriptor } from "./ModeDescriptor";
import { HEDGE_CAST, TEACHING_CAST } from "./castPolicy";

/**
 * Mode 1 — The Festival Week. `?mode=daylife`, `ScreenScene`.
 *
 * The original day-loop probe. It measures CASTING, not foraging, so it grants
 * every pocketable material up front (`Inventory.grantAllMaterials`) and leaves
 * `includeAlwaysAvailable` at its default `true`.
 *
 * Gates: `Gates.ts` reads the real `locked(...)` ids off the graph, but nothing
 * enforces them by default — `#lock:` is advisory metadata and the player walks
 * straight through. `?locks=1` opts into presentation-layer enforcement at
 * runtime; `enforce: false` records the DEFAULT, which is what the descriptor
 * is for.
 */
export const DAYLIFE: ModeDescriptor = {
  id: "daylife",
  title: "The Festival Week",
  blurb: "walk the day loop, talk, cast, decorate",
  entry: "ScreenFlow",
  systems: [
    "backdrop",
    "forage-hotspots",
    "npc-presence",
    "npc-talk",
    "dialogue",
    "cast",
    "satchel",
    "notebook",
    "calendar",
    "hub-decor",
    "gates",
    "walker-probe",
  ],
  // Sandbox: `ScreenScene.init` calls `grantAllMaterials()`, and constructs
  // `new Inventory([...items, ...keyItems])` with no options — default `true`.
  inventory: { grantAllMaterials: true, includeAlwaysAvailable: true },
  // `new Forage(data.run.graph, ["item_berry"])` — the graph as authored, no extras.
  forage: { guaranteedPools: ["item_berry"] },
  gates: { source: "legacy-hedge", enforce: false },
  // `CastScene`, launched from here, is the mode that teaches: an effect
  // confirms the spell, a no-effect leaves a clue, an effect may open a path.
  cast: TEACHING_CAST,
  receiverStates: false,
  save: null,
  dialogue: "row",
  // `tools/walk.mjs` and `tools/cast-sweep.mjs` drive `window.__probe`.
  probeGlobal: "__probe",
};

/**
 * Mode 2 — Collection & Discovery. `?mode=collect`, `CollectScene`.
 *
 * Foraging IS the mechanic here, so it is deliberately not sandboxed:
 * `includeAlwaysAvailable: false` means `item_sticks` must actually be picked
 * up before `ignite` is castable, and `guaranteedPools: ["item_sticks"]` keeps
 * the forage draw from randomising the gate-critical component out.
 *
 * `extraPools` and `EXTRA_FORAGE_POOLS` are gone (Task 3, T19, 2026-08-24) —
 * that file existed to layer "ash" onto T4 and "ore" onto F7/F8 client-side
 * because `screen-specs.json` had no such pools. Task 2 put them in the real
 * `forage` arrays (as `item_ash` and `key_raw_ore`), so every screen's
 * `forage` list is now the complete, authored truth with nothing added here.
 *
 * RULING 2026-08-17: collect-mode casting does NOT teach a spell. A spell that
 * is not already known is not offered. Learning happens in `CastScene`, or as a
 * clue from an NPC. That is why `receiverStates` is false and the hedge gate
 * stays local — this mode's loop is find, ask, confirm, use.
 */
export const COLLECT: ModeDescriptor = {
  id: "collect",
  title: "Collection & Discovery",
  blurb:
    "forage the forest and town, learn spells from neighbours, confirm them yourself",
  entry: "LocationSelect",
  systems: [
    "backdrop",
    "pan",
    "forage-hotspots",
    "npc-presence",
    "npc-talk",
    "dialogue",
    "cast",
    "satchel",
    "notebook",
    "gates",
  ],
  inventory: { grantAllMaterials: false, includeAlwaysAvailable: false },
  forage: { guaranteedPools: ["item_sticks"] },
  // The one hedge gate on F7, tracked by `collectGates.ts`, independent of the
  // real `G-*` ids and of `?locks=1`. Enforced — it is the mode's only lock.
  gates: { source: "legacy-hedge", enforce: true },
  // Teaches nothing and clears no real `G-*` id — both Roc's 2026-08-17
  // rulings, stated as data. See `castPolicy.ts`.
  cast: HEDGE_CAST,
  receiverStates: false,
  save: null,
  dialogue: "row",
  probeGlobal: "__collect",
};

/**
 * Mode 3 — Discovery & Home. `?mode=discover-home`, `CollectScene` +
 * `hubEnabled`.
 *
 * Mode 2 plus a Home Hub gated to what THIS LIFE has actually found. One array
 * entry different from `COLLECT` — which is the whole argument for descriptors.
 *
 * `Decor.ts` already owns the localStorage key `phaser-probe/decor/v1`. When
 * `DecorSlice` lands it must TAKE OVER that key rather than add a second writer
 * to the same fact.
 */
export const DISCOVER_HOME: ModeDescriptor = {
  ...COLLECT,
  id: "discover-home",
  title: "Discovery & Home",
  blurb:
    "everything from Collection & Discovery, plus a hub you can only decorate with what you've actually found",
  systems: [...COLLECT.systems, "hub-decor"],
};

/**
 * Mode 5 — the merge of mode 3 and mode 4. The capstone target.
 *
 * Supersedes `MODE4` (deleted 2026-08-17, along with `PlayScene` —
 * `plans/2026-08-17-mode5-srp-merge-plan.md`, step 0). MODE4 declared gates,
 * receiver state, save and VFX and mounted none of them; nothing constructed
 * `GateEngine`, `ReceiverStateStore`, `SaveCoordinator` or `SaveStore` in any
 * scene. That plan's whole method is to grow mode 5 by EXTRACTION instead: it
 * starts as an exact copy of mode 3's behaviour — same `CollectScene`, same
 * `hubEnabled` chain, same descriptor fields as `DISCOVER_HOME` — and each
 * step mounts one more real system, with a wiring test and a screenshot
 * proving it, before the descriptor is allowed to claim it.
 *
 * So today this is `DISCOVER_HOME` under a new id, plus `save` (step 1,
 * landed 2026-08-17), the VN layer alongside the spell-clue modal (step 2,
 * landed the same day — `render/NpcTalkSystem.ts`), `GateEngine` —
 * `gates: { source: "authored", enforce: true }` (step 3), and now
 * `ReceiverStateStore` — `receiverStates: true` (step 4, all landed the same
 * day). `CastPipeline` selects a stateful receiver's branch before resolving
 * and advances it after a landed cast; see `world/CastPipeline.ts`'s "1."/
 * "1b." steps and `world/receivers/statefulCast.ts`'s header for why the
 * order is the fix. `ReceiverStatesSlice` rides the same save mounted in
 * step 1.
 *
 * `G-F4-still` and `G-F8-combine` are refused at load — both chain rules name
 * a spell/receiver pair nothing authors (`GateEngine.ts`'s own header has the
 * full accounting). F4 and F8 stay locked all session; that is the engine
 * working as designed, not a step-3 bug to chase.
 *
 * Autosave fires on `screen:changed`, `item:acquired` and now `gate:cleared`
 * — a move, a pickup and an unlock, the moments `CollectScene` can actually
 * emit today. NOT `cast:resolved` — Mode 4's own reasoning against it stands:
 * `npm run sweep` would write dozens of saves for one script run.
 *
 * `"vfx"` (Roc, 2026-08-17, caught mid-session): this blurb has always
 * promised "spell VFX", but the descriptor never actually listed it —
 * `CollectScene.startVfx()` gates on `mode.systems.includes("vfx")`, and
 * that gate's own comment named MODE4, which this descriptor was never
 * built from (it copies `DISCOVER_HOME`, which never had it either). So
 * every cast in mode5 has been silent since the day this descriptor was
 * written — the exact "declared but not wired" defect this whole plan
 * exists to catch, just in the systems array instead of a missing
 * constructor call. Fixed here, not in a later step.
 *
 * `"edit-mode"` (step 8, scoped to hotspot drawing — Roc, 2026-08-17) turns
 * on the same way `"save"`/`"receiver-states"` did: listed here, checked by
 * `CollectScene`, nowhere else. First built mounted on `ScreenScene` (mode
 * 1) by mistake — moved here because this is THE MODE5 PLAN, and mode 1 is
 * supposed to stay untouched. See `EditModeSystem`'s own header for what it
 * does and does not do (hotspot drawing only; lock toggle and story-beat
 * insertion are still unbuilt, undefined beyond two words anywhere in the
 * repo).
 */
export const MODE5: ModeDescriptor = {
  ...DISCOVER_HOME,
  id: "mode5",
  title: "Mode 5",
  blurb:
    "everything from Discovery & Home, growing toward gated traversal, magic chains, spell VFX, save and restore",
  systems: [...DISCOVER_HOME.systems, "save", "receiver-states", "vfx", "edit-mode"],
  // Three independent lives (T13 Phase 3, 2026-08-24). Was one `slot: "mode5"`
  // through `SAVE_VERSION = 2`; the old key is left in localStorage untouched
  // and simply stops being addressed, because no descriptor names it any more.
  // Listed outright rather than derived from `id` — see `ModeDescriptor.save`.
  save: {
    slots: ["mode5-1", "mode5-2", "mode5-3"],
    autosaveOn: ["screen:changed", "item:acquired", "gate:cleared"],
  },
  dialogue: "vn",
  gates: { source: "authored", enforce: true },
  receiverStates: true,
};

/** Every mode, by id. The picker and `modeFromUrl` read this and nothing else. */
export const MODES: Readonly<Record<string, ModeDescriptor>> = {
  daylife: DAYLIFE,
  collect: COLLECT,
  "discover-home": DISCOVER_HOME,
  mode5: MODE5,
};

/** Picker order. Mode 5 last, newest at the bottom, as the picker reads today. */
export const MODE_ORDER: readonly ModeDescriptor[] = [
  DAYLIFE,
  COLLECT,
  DISCOVER_HOME,
  MODE5,
];

/**
 * The SINGLE reader of `?mode=`.
 *
 * There are four independent readers of `location.search` today
 * (`main.ts`, `ModePickerScene`, `ScreenScene`, `CastScene`) and they have
 * already drifted. This replaces the mode half of that.
 *
 * Takes the query string rather than reading `location` itself, because
 * `src/mode/**` is pure — the caller in `src/scenes` passes
 * `location.search`.
 *
 * Returns `null` for "no mode requested", which is what makes the picker
 * appear. `?walk=1` resolves to daylife with no picker, matching
 * `ModePickerScene.preload` — the headless walker must never see the menu.
 * An unrecognised `?mode=` value also returns `null` rather than guessing.
 */
export function modeFromUrl(search: string): ModeDescriptor | null {
  const params = new URLSearchParams(search);
  if (params.has("walk")) return DAYLIFE;
  const id = params.get("mode");
  if (!id) return null;
  return MODES[id] ?? null;
}
