/**
 * Collection & Magic Discovery mode.
 *
 * Same screens, same ink day loop, same `LanternPlayer` satchel caps as the
 * day-loop probe (`ScreenScene`) — but no NPC-conversation focus. This scene
 * exercises a different loop: forage a screen for real, castable items; learn
 * spells by asking neighbours what they know; confirm an unlearned spell by
 * guessing its components in the notebook; use a confirmed spell to clear the
 * one gated path in the slice.
 *
 * Deliberately NOT sandboxed. `ScreenScene` grants every material up front
 * because it measures casting, not foraging. Here foraging IS the mechanic, so
 * items only become castable through the real (if provisional — see
 * `world/foragePoolToItem.ts`) forage -> item_id join.
 */

import Phaser from "phaser";
import { InkBridge } from "../ink/InkBridge";
import type { Run } from "../ink/loadRun";
import type { MagicDB } from "../magic/CastResolver";
import { STARTER_SPELLS } from "../magic/starterSpells";
import type { CollectSceneData } from "./ChosenLife";
import { mode5DebugUnlockButton } from "./debugUnlock";
import { Inventory } from "../world/Inventory";
import { Cast } from "../world/Cast";
import { Knowledge } from "../world/Knowledge";
import { Gates } from "../world/Gates";
import { CastPipeline } from "../world/CastPipeline";
import { PROPOSED_SPELL_GATES } from "../world/spellGates";
import { GameEventBus } from "../world/events/GameEvents";
import { VfxSystem } from "../render/vfx/VfxSystem";
import { PhaserVfxBackend } from "../render/vfx/PhaserVfxBackend";
import { loadAuthoredCues } from "../render/vfx/CueTable";
import { NpcTalkSystem } from "../render/NpcTalkSystem";
import { BackdropSystem } from "../render/BackdropSystem";
import { PlayerSettings } from "../world/PlayerSettings";
import { HotspotSystem } from "../render/HotspotSystem";
import { DroppedItemHotspots } from "../render/DroppedItemHotspots";
import { poolForItem } from "../world/foragePoolToItem";
import { ReceiverHotspots } from "../render/ReceiverHotspots";
import { SatchelStrip } from "../render/SatchelStrip";
import { ModalFrame } from "../render/ModalFrame";
import { WalkerProbe } from "../render/WalkerProbe";
import { HedgeCastPrompt } from "../render/HedgeCastPrompt";
import { TraversalRow } from "../render/TraversalRow";
import { MoveRegions } from "../render/MoveRegions";
import { exitMoveInputs } from "../world/view/MoveRegionPlacement";
import { HudBar } from "../render/HudBar";
import { EditModeSystem } from "../render/EditModeSystem";
import type { ModeDescriptor } from "../mode/ModeDescriptor";
import { SaveCoordinator, type RegisteredSlice } from "../world/save/SaveCoordinator";
import { SaveStore, webSaveStorage } from "../world/save/SaveStore";
import { LanternInkStatePort } from "../world/save/LanternInkStatePort";
import type { InventoryStatePort, PositionPort } from "../world/save/ports";
import { KnowledgeSlice } from "../world/save/slices/KnowledgeSlice";
import { DecorSlice } from "../world/save/slices/DecorSlice";
import { DayPicksSlice } from "../world/save/slices/DayPicksSlice";
import { FestivalSlice } from "../world/save/slices/FestivalSlice";
import { DiscoverySlice } from "../world/save/slices/DiscoverySlice";
import { FestivalLedger, scoreFestivalForRun } from "../world/FestivalScore";
import { FestivalResults } from "../render/FestivalResults";
import { YearRollover } from "../render/YearRollover";
import { summarizeDiscovery } from "../world/DiscoverySummary";
import { NPC_GIFT_ITEM } from "../world/npcItems";
import { DialogueSystem } from "../systems/DialogueSystem";
import { DialogueFeed } from "../systems/DialogueFeed";
import { mountDialogue } from "../systems/mountDialogue";
import { GateEngine, authoredContentFrom, screensByGateFrom } from "../world/gates/GateEngine";
import type { GateWorldFacts } from "../world/gates/GateEvaluator";
import { GatesSlice, type GatesPort } from "../world/save/slices/GatesSlice";
import { RECEIVER_STATES, ReceiverStateStore } from "../world/receivers/ReceiverStateStore";
import { ReceiverStatesSlice } from "../world/save/slices/ReceiverStatesSlice";
import { COLOR, FONT, REDUCED_MOTION, sceneFadeIn, sceneTransition } from "../ui/theme";
import { DAY_STARTS } from "../ui/dayCard";
import type { CalendarPick } from "./CalendarScene";
import type { PlayView } from "@lantern/lib/play";

/** ink's own LIST — `tools/resolver/src/graph.ts` declares exactly these.
 * Matches `CalendarScene.ts`'s own local copy; no shared export exists. */
const TIME_BLOCKS = ["morning", "afternoon", "evening", "night"];

/**
 * The Home Hub's move-on choice, as ink now writes it (`main.ink`'s
 * `hub_night`: `+ [Start the Next Day] -> calendar`). Renamed at the ink
 * source 2026-08-24 per Roc's 2026-08-23 ruling — was "Open the calendar"
 * (still the ink knot's own id, `calendar`; only the choice label changed).
 * No display-layer indirection needed anymore: the ink text is what the
 * player reads.
 */
const HUB_CALENDAR_CHOICE = "Start the Next Day";

/** `graph.ts`'s `FINAL_SCREEN_ID`, mirrored like `TIME_BLOCKS` above (the resolver
 * is not importable here). `tests/FestivalScore.test.ts` re-checks it against `graph.json`. */
const FINAL_SCREEN_ID = "FS";

const W = 1920;
const H = 1080;
const GOLD = COLOR.gold;


// The pan's zoom factor and easing constant now live with the math, in
// `world/view/PanModel.ts`.

// HUD chrome layout. The choices row (dialogue/action/move) sits directly
// above the satchel/hotspot bar (Roc, 2026-08-13 — moved off the old
// right-side vertical list); everything below TOP_BAR_HEIGHT and above
// CHOICES_ROW_TOP is "in the scene," used both to keep hotspots/NPCs clear
// of HUD chrome and to gate mouse-pan (see `updatePan`).
const TOP_BAR_HEIGHT = 76;
const BOTTOM_BAR_HEIGHT = 230;
const CHOICES_ROW_HEIGHT = 150;
const BOTTOM_BAR_TOP = H - BOTTOM_BAR_HEIGHT;
const CHOICES_ROW_TOP = BOTTOM_BAR_TOP - CHOICES_ROW_HEIGHT;
const CHOICES_ROW_CENTER_Y = BOTTOM_BAR_TOP - CHOICES_ROW_HEIGHT / 2;
/** Where NPC portraits sit — clear of the choices row below them. */
const NPC_ROW_CENTER_Y = CHOICES_ROW_TOP - 170;

/** Where a hotspot is allowed to land — screen-absolute, clear of the top
 * bar and the choices-row/satchel HUD stack at the bottom. */
const HOTSPOT_SAFE_X: [number, number] = [90, 1830];
const HOTSPOT_SAFE_Y: [number, number] = [TOP_BAR_HEIGHT + 40, CHOICES_ROW_TOP - 30];

export class CollectScene extends Phaser.Scene {
  private run!: Run;
  private ink!: InkBridge;
  private magic!: MagicDB;
  private inventory!: Inventory;
  private cast!: Cast;
  private knowledge!: Knowledge;
  private gates!: Gates;
  /**
   * The one cast path (`world/CastPipeline.ts`), configured by this mode's
   * descriptor. Replaces the bookkeeping that used to sit inline in
   * `hedgeSpellPicker` and had already drifted from `CastScene`'s copy.
   */
  private pipeline!: CastPipeline;
  /** Null between scene shutdown and the next create(). See startVfx(). */
  private vfx: VfxSystem | null = null;
  /** Pure, and deliberately not `InkBridge`, which is render-coupled. */
  private readonly bus = new GameEventBus();
  private hedgeCleared = false;
  /**
   * Responsibility 4 ("npc"), extracted (mode5 plan step 2): the spell-clue
   * modal and the NPC portrait row. Constructed fresh each life in `init()`,
   * same as `Inventory`/`Knowledge`/`Cast` — see `NpcTalkSystem`'s header.
   */
  private npcTalk!: NpcTalkSystem;
  /**
   * The VN layer, ALONGSIDE the spell-clue modal, not replacing it — mode5
   * plan step 2. Null when `mode.dialogue !== "vn"` (modes 2-3) or between
   * shutdown and the next `create()`. `dialogueFeed` walks the ink transcript
   * and scopes what reaches `dialogue` to conversation lines only; see
   * `render()`'s `inConversation`.
   */
  private dialogue: DialogueSystem | null = null;
  private dialogueFeed: DialogueFeed | null = null;
  /** Read by `updatePan`/`update()` — a VN conversation freezes pan the same
   * way a modal does. Set every `render()`, not just while a modal is open. */
  private inConversation = false;
  /**
   * The conversation's own choices, computed on `render()` but not shown
   * until `onAdvance` fires — Roc, 2026-08-17: choices used to appear
   * alongside the very last line of a burst, which reads as "answer before
   * you've finished reading." `DialogueSystem`'s own queue already withholds
   * choices while lines remain queued; this withholds them for the LAST
   * line too, revealing them only once the player has actually clicked past
   * it. Empty outside a conversation.
   */
  private pendingConvChoices: PlayView["choices"] = [];
  /**
   * The authored gate graph — mode5 plan step 3. Null when
   * `mode.gates.source !== "authored"` (modes 2-3 keep `legacy-hedge`, local
   * to `collectGates.ts`, unaffected by this) or between shutdown and the
   * next `create()`. `G-F4-still`/`G-F8-combine` are refused at load —
   * `GateEngine.ts`'s own header has the accounting — and stay locked all
   * session; that is the engine working as designed.
   */
  private gateEngine: GateEngine | null = null;
  private unattachGateEngine: (() => void) | null = null;
  /**
   * The 18 authored spell x receiver state pairs — mode5 plan step 4. Null
   * when `mode.receiverStates` is false (modes 1-3, unaffected: every
   * stateful pair keeps reading as `physical_outcome` whole, exactly as
   * before this store existed) or between shutdown and the next `create()`.
   * Constructed before `this.pipeline` in `init()` — `CastPipeline` takes it
   * as a direct dependency rather than discovering it off the bus.
   */
  private receiverStates: ReceiverStateStore | null = null;

  /**
   * Responsibility 1 ("backdrop + pan"), extracted (mode5 plan step 5):
   * `syncBackdrop`, `updatePan`. Owns the `PanModel` too — `backdropSys.pan`
   * is what `NpcTalkSystem` and `hotspotSys` place themselves against, so
   * everything pans in lockstep. Constructed ONCE (not per-life), same as the
   * `pan` field it replaces — see `BackdropSystem`'s own header. */
  private readonly backdropSys = new BackdropSystem({
    scene: this,
    viewWidth: W,
    viewHeight: H,
    pointerBand: [220, CHOICES_ROW_TOP], // a dead zone (Roc, 2026-08-21)
    pointerXBand: [360, W - 360], deadZone: true,
  });
  /**
   * Responsibility 2 ("hotspots"), extracted (mode5 plan step 5):
   * `drawHotspots`, `withExtraForage`. Built fresh each life in `init()`,
   * same as `Inventory`/`Knowledge`/`NpcTalkSystem` — see `HotspotSystem`'s
   * own header for why (it owns `Forage`, which needs the graph).
   */
  private hotspotSys!: HotspotSystem;
  /** Dropped-item dots (satchel-cluster track, 2026-08-23) — sibling to
   * `hotspotSys`, same lifecycle. See `DroppedItemHotspots`'s own header. */
  private droppedHotspots!: DroppedItemHotspots;
  /** Cast-on-a-thing markers (mode5 plan Track 1) — sibling to `hotspotSys`,
   * same lifecycle. See `ReceiverHotspots`'s own header. */
  private receiverHotspots!: ReceiverHotspots;
  /**
   * Responsibility 3 ("satchel"), extracted (mode5 plan step 6):
   * `drawSatchel`, `effectiveSatchel`, `syncInventory`. Built fresh each
   * life — see `SatchelStrip`'s own header.
   */
  private satchelSys!: SatchelStrip;
  /**
   * Responsibility 5 ("modal UI"), extracted (mode5 plan step 6):
   * `modalFrame`, `clearModal`, `closeButton`, `button`, `componentHint`.
   * Satisfies `NpcTalkSystem`'s `ModalHost` directly — see `ModalFrame`'s
   * own header. `modalSys.isOpen` replaces the `modalOpen` field this
   * extraction removed.
   */
  private modalSys!: ModalFrame;
  /**
   * Responsibility 8 ("walker probe"), extracted (mode5 plan step 6):
   * `exposeForWalker`. See `WalkerProbe`'s own header for why `ScreenScene`'s
   * `__probe`/`CastScene`'s `__cast` are untouched here.
   */
  private walkerProbe!: WalkerProbe;
  /**
   * Responsibility 6 ("hedge cast"), extracted (mode5 plan step 7):
   * `hedgePrompt`, `gatedCastPrompt`, `hedgeSpellPicker`. Its picker rows are
   * ALSO pushed into `modalSys`'s layer — see `ModalFrame`'s header for why
   * that split is safe.
   */
  private hedgeCastPrompt!: HedgeCastPrompt;
  /** Responsibility 10 ("traversal"), extracted (mode5 plan step 7): the
   * choice-row half of `render()`. After this step `CollectScene` is
   * orchestration plus sub-scene launching — the SRP claim is measurable
   * rather than asserted. T14 took the exits out of it: */
  private traversalRow!: TraversalRow;
  /** …into dashed clickable regions on the painting, gate apparatus included. */
  private moveRegions!: MoveRegions;
  /** T14 — the one docked bottom bar, mounting the explore tenant (nav
   * clusters plus §1b's Wait / End-day). Built once. */
  private hudBar!: HudBar;
  /**
   * Step 8, scoped to hotspot drawing (Roc, 2026-08-17) — see
   * `EditModeSystem`'s own header. Null unless `mode.systems.includes(
   * "edit-mode")` — same activation shape as `receiverStates`/`gateEngine`,
   * so every mode without it is unaffected.
   */
  private editMode: EditModeSystem | null = null;
  private header!: Phaser.GameObjects.Text;
  /** Night plaque behind `header`, sized to the text each render so gold stays
   * legible over bright foliage (the top bar alone is too light). */
  private headerPlaque!: Phaser.GameObjects.Rectangle;
  private currentScreen: string | null = null;
  /**
   * One CollectScene, composed by descriptor (Roc, 2026-08-17 — the mode5
   * merge plan) rather than by a growing pile of booleans threaded through
   * `LocationSelectScene`. `hubEnabled` below is now DERIVED from it, not a
   * separately-threaded flag — `discover-home` and `mode5` both set
   * `hubEnabled` true and would otherwise be indistinguishable, which matters
   * once `mode.save` differs between them.
   */
  private mode!: ModeDescriptor;
  /** `SatchelLedger`'s home bank goes through `HubScene`; see `openHub()`. */
  private get hubEnabled(): boolean {
    return this.mode.systems.includes("hub-decor");
  }
  /** Festival scoring's one host-side counter — the per-soul talk calendar (T9,
   * Roc 2026-08-23). See `world/FestivalScore.ts`; the goals half needs no storage. */
  private readonly festivalLedger = new FestivalLedger();
  private festivalResults!: FestivalResults;
  /** The rollover band under the results, and the endings it counts (T13 Phase 5).
   * Both built per LIFE in `init()`, not at declaration like the ledger above, so
   * a second life resumed in one page load starts its endings empty. */
  private yearRollover!: YearRollover;
  private discovery!: DiscoverySlice;

  private saveCoordinator: SaveCoordinator | null = null;
  private unbindAutosave: (() => void) | null = null;
  /** Which of `mode.save.slots` this session owns, resolved in `init()` — see
   * `ChosenLife`. PUBLIC because `tools/adversary/lib/agentApi.mjs` reads it:
   * the descriptor lists three slots and can no longer say which one is live. */
  saveSlot: string | null = null;
  /** The name on that life. `""` = never named; never fabricated. */
  private playerName = "";
  /**
   * One-shot fallback for the first `render()` after a save load.
   *
   * `LanternPlayer.restore` deliberately does not put `currentScreen` back —
   * it is derived from a `#screen:` tag as play moves, and a restored state
   * has not printed one yet (`tests/SaveLoad.test.ts`, "puts the player back
   * on a screen ink's own restore does not remember"). So `v.pos.currentScreen`
   * reads as whatever screen `LocationSelectScene`'s OWN initial pick left it
   * on — not null, WRONG — until the next real navigation. This field is the
   * host's own memory (`PositionPort.applyScreenId`), consulted once so the
   * very first post-load render draws the right backdrop; after that, ink's
   * own reporting is accurate again because a real transition sets it.
   */
  private pendingRestoredScreen: string | null = null;

  constructor() {
    super("CollectScene");
  }

  init(data: CollectSceneData) {
    this.run = data.run;
    this.ink = data.ink;
    this.magic = data.magic;
    this.mode = data.mode;
    // Which life (T13 Phase 4). The Phase-3 `?? slots[0]` stub is gone — the
    // board answers on both routes in, and guessing the first slot when a
    // caller forgot would autosave over life 1. See `ChosenLife`.
    this.saveSlot = data.saveSlot ?? null;
    this.playerName = data.playerName ?? "";
    // Foraging IS the mechanic here — `always_available` items (item_sticks,
    // gate-bearing for `ignite`) must still be picked up, not just castable
    // by default the way ScreenScene's sandbox treats them. See Inventory.ts.
    this.inventory = new Inventory([...data.run.items, ...data.run.keyItems], {
      includeAlwaysAvailable: false,
    });
    // `item_sticks` carries its real `always_available` intent (GDD:
    // gate-critical items are "always obtainable, never randomized out") —
    // now that possession actually matters here (above), the forage draw
    // needs to honor that guarantee too. Guaranteed pool comes from the mode
    // descriptor (`mode.forage.guaranteedPools`), not a local hardcode.
    this.hotspotSys = new HotspotSystem({
      scene: this,
      ink: this.ink,
      bus: this.bus,
      pan: this.backdropSys.pan,
      graph: data.run.graph,
      inventory: this.inventory,
      safeBox: { x: HOTSPOT_SAFE_X, y: HOTSPOT_SAFE_Y },
      guaranteedPools: this.mode.forage.guaranteedPools,
      // Authored examine geometry. Handed in whole rather than pre-resolved
      // per screen, so `HotspotSystem` and `EditModeSystem` read exactly the
      // same `regions.json` (Roc, 2026-08-23: regions drawn in edit mode were
      // dead the moment edit mode closed).
      regions: data.run.regions,
      // Pickup-pops-satchel (Roc, 2026-08-23): a committed pickup of a
      // never-before-held item TYPE opens the satchel on its description.
      onFirstPickup: (itemId) => this.openSatchel(itemId),
    });
    // Dropped-item dots — the re-pickupable half of the satchel drop
    // (satchel-cluster track, 2026-08-23). A sibling of `hotspotSys`, same
    // lifecycle, own file — see `DroppedItemHotspots`'s header.
    this.droppedHotspots = new DroppedItemHotspots({
      scene: this,
      ink: this.ink,
      pan: this.backdropSys.pan,
      inventory: this.inventory,
      safeBox: { x: HOTSPOT_SAFE_X, y: HOTSPOT_SAFE_Y },
    });
    this.cast = new Cast(data.run.graph);
    this.gates = new Gates(data.run.graph);
    this.receiverHotspots = new ReceiverHotspots({
      scene: this,
      inventory: this.inventory,
      pan: this.backdropSys.pan,
      graph: data.run.graph,
      safeBox: { x: HOTSPOT_SAFE_X, y: HOTSPOT_SAFE_Y },
      gates: this.gates,
      gateEngine: () => this.gateEngine,
      onCastOn: (receiverId, label, screenId) => this.hedgeCastPrompt.openCastOn(receiverId, label, screenId),
    });
    this.knowledge = new Knowledge();
    for (const id of STARTER_SPELLS) {
      if (this.magic.spell(id)) this.knowledge.learn(id);
    }
    // echo is a starter, but item_captured_sound (free, never spent) is not
    // foraged here, where `always_available` is inert — seed it so echo casts
    // from turn one (Roc, 2026-08-18).
    this.inventory.give("item_captured_sound");
    this.startReceiverStates();
    // The descriptor decides what a landed cast writes — mode 2 and mode 3
    // share `HEDGE_CAST`, which teaches nothing and clears no real `G-*` id.
    // `gateTable` is handed over regardless: the POLICY is what forbids reading
    // it, so there is one place that decision lives.
    this.pipeline = new CastPipeline({
      magic: this.magic,
      inventory: this.inventory,
      knowledge: this.knowledge,
      gates: this.gates,
      gateTable: PROPOSED_SPELL_GATES,
      policy: this.mode.cast,
      receiverStateStore: this.receiverStates ?? undefined,
      bus: this.bus,
    });
    this.startVfx();
    this.hedgeCleared = false;
    this.satchelSys = new SatchelStrip({
      scene: this,
      ink: this.ink,
      inventory: this.inventory,
      viewHeight: H,
    });
    this.modalSys = new ModalFrame({ scene: this, viewWidth: W, viewHeight: H, inventory: this.inventory });
    this.hedgeCastPrompt = new HedgeCastPrompt({
      scene: this,
      modal: this.modalSys,
      magic: this.magic,
      knowledge: this.knowledge,
      inventory: this.inventory,
      pipeline: this.pipeline,
      viewWidth: W,
      viewHeight: H,
      currentScreenId: () => this.currentScreen,
      setHedgeCleared: () => {
        this.hedgeCleared = true;
      },
      render: () => this.render(),
    });
    this.traversalRow = new TraversalRow({
      scene: this, ink: this.ink,
      viewWidth: W, bottomBarTop: BOTTOM_BAR_TOP, choicesRowTop: CHOICES_ROW_TOP,
    });
    this.moveRegions = new MoveRegions({
      scene: this, ink: this.ink, gates: this.gates, pan: this.backdropSys.pan,
      gateEngine: () => this.gateEngine, hedgeCleared: () => this.hedgeCleared,
      authoredGates: this.mode.gates.source === "authored",
      moveRects: this.run.moveRegions, currentScreenId: () => this.currentScreen,
      viewWidth: W, viewHeight: H,
      openGatedCastPrompt: (message, obstacleNoun) => this.hedgeCastPrompt.open(message, obstacleNoun),
      openHedgePrompt: () => this.hedgeCastPrompt.openHedgePrompt(),
    });
    this.hudBar = new HudBar({ scene: this, ink: this.ink, modal: this.modalSys, viewWidth: W, viewHeight: H });
    if (this.mode.systems.includes("edit-mode")) {
      this.editMode = new EditModeSystem({
        scene: this,
        viewWidth: W,
        viewHeight: H,
        initialRegions: this.run.regions,
        moveRegions: this.run.moveRegions,
        pan: this.backdropSys.pan,
        // A rect drawn in edit mode goes straight into the run's own region
        // map, which is the SAME object `HotspotSystem` reads — so leaving
        // edit mode leaves a live, hoverable region instead of one that only
        // exists inside the editor (Roc, 2026-08-23, review note 42). The
        // clipboard export is still what gets it onto disk.
        onRegionCommitted: (screen, regionId, rect) => {
          (this.run.regions[screen] ??= {})[regionId] = rect;
          this.render();
        },
        // The move half of the same seam (GP-203) — `run.moveRegions` is the
        // SAME object `MoveRegions` reads, so a drawn exit box leaves its
        // fallback margin position on this very render, not after a rebuild.
        onMoveRegionCommitted: (screen, destScreenId, rect) => {
          (this.run.moveRegions[screen] ??= {})[destScreenId] = rect;
          this.render();
        },
      });
    }
    this.npcTalk = new NpcTalkSystem({
      scene: this,
      run: this.run,
      ink: this.ink,
      magic: this.magic,
      cast: this.cast,
      knowledge: this.knowledge,
      inventory: this.inventory,
      pan: this.backdropSys.pan,
      bus: this.bus,
      modal: this.modalSys,
      currentScreenId: () => this.currentScreen,
      rowCenterY: NPC_ROW_CENTER_Y,
      // Festival scoring's bond half (T9) — see `NpcTalkDeps.onTalk`. The
      // one-a-day cap is structural inside `FestivalLedger`; the day is read
      // off ink, which owns the clock, and never written back.
      onTalk: (soul) => this.festivalLedger.recordTalk(soul, this.ink.view().day),
    });
    this.festivalResults = new FestivalResults({ scene: this, viewWidth: W, viewHeight: H });
    this.discovery = new DiscoverySlice();
    this.yearRollover = new YearRollover({
      scene: this, viewWidth: W,
      // WHICH SYSTEMS TO ASK — never how to count them. Every rule about what
      // "of N" means lives in `world/DiscoverySummary.ts`.
      summary: () => summarizeDiscovery({
        graph: data.run.graph,
        itemRecords: [...data.run.items, ...data.run.keyItems],
        approvedSpells: this.magic.spells,
        npcGiftItemIds: Object.values(NPC_GIFT_ITEM),
        spellIdsLearned: this.knowledge.spellbook(),
        itemIdsEverHeld: this.inventory.discoveredIds(),
        tiersReached: this.discovery.tiersReached(),
      }),
      // THE HOST ONLY DIVERTS — the STORY resets its own clock, nothing is
      // saved here, and the bridge's own commit re-renders. See `beginNewYear`.
      onContinue: () => this.ink.beginNewYear(),
      onMainMenu: () => sceneTransition(this, "ModePickerScene", { run: this.run }),
    });
    this.walkerProbe = new WalkerProbe({
      ink: this.ink,
      knowledge: this.knowledge,
      cast: this.cast,
      inventory: this.inventory,
      npcTalk: this.npcTalk,
      hotspotSys: this.hotspotSys,
      currentScreenId: () => this.currentScreen,
      hedgeCleared: () => this.hedgeCleared,
      hubEnabled: this.hubEnabled,
      openHedgePrompt: () => this.hedgeCastPrompt.openHedgePrompt(),
      openNotebook: () => this.openNotebook(),
      openCalendar: () => this.openCalendar(),
      openHub: () => this.openHub(),
      festival: () => this.festivalScore(this.ink.view()),
    });
    this.startGates();
    this.startSave();
    this.startDialogue();
  }

  /**
   * Mount `ReceiverStateStore` — mode5 plan step 4.
   *
   * GATED ON THE DESCRIPTOR, same reasoning as `startGates()`/`startSave()`.
   * Called from `init()` BEFORE `this.pipeline` is constructed, unlike the
   * other `start*` methods: the store is a direct `CastPipeline` dependency,
   * not something the pipeline discovers off the bus the way `GateEngine`
   * hears `cast:resolved`.
   */
  private startReceiverStates() {
    if (!this.mode.receiverStates) return;
    this.receiverStates = new ReceiverStateStore(RECEIVER_STATES, { bus: this.bus });
    this.events.once("shutdown", () => {
      this.receiverStates = null;
    });
  }

  /** Ink's clock + `WorldState`'s bond bands, as `GateEngine` reads them —
   * a READ-ONLY MIRROR, same rule as everywhere else ink's clock is touched. */
  private gateWorldFacts(): GateWorldFacts {
    const v = this.ink.view();
    return { timeBlock: v.timeBlock, bondBands: v.bondBands };
  }

  /**
   * Mount `GateEngine` — mode5 plan step 3.
   *
   * GATED ON THE DESCRIPTOR, same reasoning as `startVfx()`/`startSave()`/
   * `startDialogue()`: only `mode.gates.source === "authored"` gets it, so
   * modes 2-3 keep `legacy-hedge` (local to `collectGates.ts`) exactly as
   * before. `attach()` re-evaluates on `cast:resolved`/`screen:changed`; the
   * explicit `refresh()` right after covers whatever is ALREADY true at boot
   * (a bond gate from a restored life, a time gate if the save landed in the
   * right block) before either event has fired once.
   */
  private startGates() {
    if (this.mode.gates.source !== "authored") return;
    const content = authoredContentFrom(this.magic.spells, {
      itemIds: this.run.items.map((i) => i.item_id),
      timeBlocks: TIME_BLOCKS,
    });
    const knownGateIds = new Set<string>();
    for (const req of this.gates.requirements.values()) {
      for (const gateId of req.gateIds) knownGateIds.add(gateId);
    }
    this.gateEngine = new GateEngine({
      content,
      knownGateIds,
      screensByGate: screensByGateFrom(this.gates.requirements.values()),
      bus: this.bus,
    });
    this.unattachGateEngine = this.gateEngine.attach(this.bus, () => this.gateWorldFacts());
    this.gateEngine.refresh({ log: this.bus.log(), facts: this.gateWorldFacts() });

    this.events.once("shutdown", () => {
      this.unattachGateEngine?.();
      this.unattachGateEngine = null;
      this.gateEngine = null;
    });
  }

  create() {
    sceneFadeIn(this);
    // NO full-width top scrim any more (T14 §1/§4). It existed to make the
    // top-right nav row legible on any backdrop; the row moved to the bottom
    // bar, which carries its own plate, and §1's whole claim is "the sky is
    // clear." The plaque below keeps its own stronger local scrim, so the one
    // thing still living up here reads on bright foliage regardless.
    this.headerPlaque = this.add.rectangle(14, 14, 400, 46, COLOR.night, 0.85).setOrigin(0, 0).setDepth(99.5);
    this.header = this.add
      .text(24, 22, "", { fontFamily: FONT.mono, fontSize: "24px", color: GOLD })
      .setDepth(100);

    // Same reasoning at the bottom edge, where the satchel/hotspot line
    // sits — guaranteed contrast regardless of the backdrop underneath.
    this.add.rectangle(W / 2, H - BOTTOM_BAR_HEIGHT / 2, W, BOTTOM_BAR_HEIGHT, COLOR.night, 0.5).setDepth(19);
    // A row directly above it for dialogue/action/move choices — moved off
    // the old right-side vertical list (Roc, 2026-08-13).
    this.add
      .rectangle(W / 2, CHOICES_ROW_CENTER_Y, W, CHOICES_ROW_HEIGHT, COLOR.night, 0.55)
      .setDepth(19);

    // THE BRIDGE OUTLIVES THIS SCENE (`PreloadScene` builds it once and every
    // scene shares it), so these listeners must not: a leftover `view` listener
    // renders a TORN-DOWN scene on the next commit, and Phaser's Text throws
    // inside a destroyed texture manager (T13 Phase 4 — found re-entering the
    // boot board from play; two live instances would also render twice).
    const onView = () => this.render();
    const onError = (msg: string) => console.error("[ink]", msg);
    this.ink.on("view", onView).on("error", onError);
    this.events.once("shutdown", () => this.ink.off("view", onView).off("error", onError));

    // T14 §1/§1b: the nav clusters move from top-right to the one centred
    // bottom bar, joined by the Wait/End-day cluster. `HudBar` owns the plate,
    // every hotkey on it (S N H L O W E) and End-day's confirm.
    this.hudBar.build({
      openSatchel: () => this.openSatchel(), openNotebook: () => this.openNotebook(),
      openHome: this.hubEnabled ? () => this.openHub() : null,
      openCalendar: () => this.openCalendar(), openOptions: () => this.openOptions(),
    }, { dayActions: true });

    // Dev-only affordances stay OUT of the bar (§4: "Dev pills stay top-right,
    // owning the corner the old NavRow vacates") — same text-pill row, now at
    // the top of that corner. Edit mode's toggle moved from bare `E` to
    // `Shift+E`: §1b gives the bare key to the End-day pill, and an authoring
    // overlay does not outrank a shipped player-facing control.
    const devRow: { label: string; onClick: () => void }[] = [];
    if (this.editMode) {
      const toggleEdit = () => { this.editMode?.toggle(); this.render(); };
      this.input.keyboard?.on("keydown-E", (e: KeyboardEvent) => { if (e.shiftKey) toggleEdit(); });
      devRow.push({ label: "[ Edit — Shift+E ]", onClick: toggleEdit });
    }
    if (import.meta.env.DEV && this.mode.id === "mode5")
      devRow.push(mode5DebugUnlockButton({
        scene: this, magic: this.magic, knowledge: this.knowledge, inventory: this.inventory,
        gates: this.gates, gateEngine: () => this.gateEngine, rerender: () => this.render(),
      }));
    if (devRow.length) this.modalSys.buttonRow(devRow, { rightX: W - 24, y: 20 });

    // "Look around": the backdrop is blown up past a plain cover-fit
    // (`PAN_ZOOM`), and the mouse position pans it within that extra room.
    // Hotspots pan in lockstep (`updatePan`) so they read as fixed points in
    // the scene rather than floating HUD.
    this.input.on("pointermove", (p: Phaser.Input.Pointer) => this.updatePan(p.x, p.y));

    this.ink.runToChoice();
    this.walkerProbe.expose();
    // NOT a second `this.render()` here. `runToChoice()` unconditionally ends
    // in `InkBridge.commit()`, which emits "view" — and the listener above is
    // already attached, so that emission already ran `render()` once,
    // synchronously, before this line. A second call used to be harmless
    // (idempotent) but stopped being once `render()` started consuming
    // `pendingRestoredScreen`: the first call applies the save's screen, and a
    // second one, reading ink's still-stale `v.pos.currentScreen`, clobbered
    // it right back — the redraw a browser reload needs, undone by a redraw
    // nothing needed.
  }

  /** Only ever sets the TARGET — `update()` is what actually moves anything,
   * eased, every frame. */
  private updatePan(pointerX: number, pointerY: number) {
    // Hold the last target while a modal or a VN conversation is open (Roc,
    // 2026-08-13/17) — reading either shouldn't drag the scene out from
    // under it. The same holding rule for HUD chrome is `pointerBand`.
    if (this.modalSys.isOpen || this.inConversation) return;
    this.backdropSys.updatePan(pointerX, pointerY);
  }

  /** Phaser's per-frame hook — eases toward the pan target and repositions
   * everything that pans, unless frozen (same gate as `updatePan`). */
  update(_time: number, delta: number) {
    if (!this.backdropSys.hasBackdrop || this.modalSys.isOpen || this.inConversation) return;
    this.backdropSys.pan.setTau(PlayerSettings.panTauMs);
    this.backdropSys.step(delta, REDUCED_MOTION);
    this.hotspotSys.reposition();
    this.droppedHotspots.reposition();
    this.receiverHotspots.reposition();
    this.npcTalk.reposition();
    this.moveRegions.reposition();
  }

  private openNotebook() {
    if (this.scene.isActive("NotebookScene")) return;
    this.scene.pause();
    this.scene.launch("NotebookScene", {
      view: this.ink.view(),
      magic: this.magic,
      knowledge: this.knowledge,
      items: [...this.run.items, ...this.run.keyItems],
      inventory: this.inventory,
      collectMode: true,
      onClose: () => {
        this.scene.resume();
        this.render();
      },
    });
  }

  /** `onDrop`/`onMove`/`onMoveToArms`/`onMoveArmsToSatchel`: the live half of
   * the satchel actions — mutate `Inventory` + `LanternPlayer` for real, then
   * hand back a fresh view. Every mutation here is TWO-SIDED by rule
   * (`Inventory.drop`'s and `SatchelLedger.ts`'s headers): the pool-name
   * half on `LanternPlayer`, the item-id half on `Inventory`, or the next
   * render's `reJoinInto` resync undoes whichever half ran alone — the exact
   * shape of Roc's 2026-08-23 "drop does not actually remove" bug.
   *
   * `focusItemId` is the pickup-pops-satchel wire (see `HotspotSystem`'s
   * `onFirstPickup`): passed through so the scene opens on that item's
   * description. */
  private openSatchel(focusItemId?: string) {
    if (this.scene.isActive("SatchelScene")) return;
    this.scene.pause();
    this.scene.launch("SatchelScene", {
      view: this.ink.view(),
      inventory: this.inventory,
      spells: this.magic.spells,
      knowledge: this.knowledge,
      focusItemId,
      onClose: () => {
        this.scene.resume();
        this.render();
      },
      onDrop: (itemId: string, slotIndex: number | null) => {
        if (slotIndex !== null) {
          this.ink.player.dropSatchelSlot(slotIndex);
        } else {
          // An UNSLOTTED entry — an arms- or banked-derived held id (or a
          // pool-less free item, where `poolForItem` is null and there is no
          // satchel side to clear). Without this, the render-time re-join
          // from `arms`/`banked` re-gave the item every frame and the drop
          // visibly did nothing.
          const pool = poolForItem(itemId);
          if (pool) this.ink.player.removeCarriedPool(pool);
        }
        // The dropped thing LANDS on the current screen and renders as a
        // re-pickupable dot (`DroppedItemHotspots`).
        this.inventory.drop(itemId, this.currentScreen);
        this.ink.refresh();
        return this.ink.view();
      },
      onMove: (fromSlot: number, toSlot: number) => {
        this.ink.player.moveSatchelSlot(fromSlot, toSlot);
        this.ink.refresh();
        return this.ink.view();
      },
      onMoveToArms: (fromSlot: number) => {
        this.ink.player.moveSatchelSlotToArms(fromSlot);
        this.ink.refresh();
        return this.ink.view();
      },
      onMoveArmsToSatchel: (itemId: string) => {
        // Pool vocabulary at the seam, same join the drop path uses.
        const pool = poolForItem(itemId);
        if (pool) this.ink.player.moveArmsPoolToSatchel(pool);
        this.ink.refresh();
        return this.ink.view();
      },
    });
  }

  /**
   * The ONE calendar (Roc, 2026-08-23) in its READ-ONLY state — week reference,
   * no picks. This is what the `L` key and the nav button always open.
   */
  private openCalendar() {
    this.launchCalendar([]);
  }

  /**
   * The SAME calendar, ACTIVE: today's card is the location picker, matching
   * game-start behavior. Only the Home Hub's "Start the Next Day" branch calls
   * it. Which state to open is a CALLER decision, not something sniffed off the
   * view, because ordinary mid-day traversal can also offer "Go to Town Square"
   * — a view-shape guess would flip the calendar into a picker in the middle of
   * a day already underway, which is the opposite of the ruling.
   *
   * `dayStartPicks()` is still an AND, not an OR: even here only the two
   * canonical starts are offered, and if ink offers neither the empty list falls
   * back to read-only rather than drawing a dead card.
   */
  private openDayStartCalendar() {
    this.launchCalendar(this.dayStartPicks());
  }

  /** The one launch path both states share — `picks` IS the state. */
  private launchCalendar(picks: CalendarPick[]) {
    if (this.scene.isActive("CalendarScene")) return;
    this.scene.pause();
    this.scene.launch("CalendarScene", {
      view: this.ink.view(),
      picks,
      onPick: (pick: CalendarPick) => {
        // The scene already wrote the `DayPicks` record; the ink advance is ours
        // — same two lines `TraversalRow` runs for a move pill, so picking on the
        // card and picking the pill underneath cannot diverge.
        this.ink.choose(pick.choiceIndex);
        this.ink.runToChoice();
      },
      onClose: () => {
        this.scene.resume();
        // Ink may have moved (a pick), so redraw rather than trusting the
        // pre-overlay frame — `openSatchel` closes the same way.
        this.render();
      },
    });
  }

  /**
   * The day-start choices on offer at the ink `calendar` knot, matched to the
   * two canonical starts. The match is against `DAY_STARTS`, not `kind ===
   * "move"` alone: the knot still lists all seven `Begin at …`/`Go to …` exits
   * it did before the 2026-08-19 two-start ruling, and the UI layer is where
   * that ruling is enforced — exactly as `LocationSelectScene` does it.
   */
  private dayStartPicks(): CalendarPick[] {
    const moves = this.ink
      .view()
      .choices.filter((c) => c.kind === "move" && /^\[(Go to|Begin at)\s/.test(c.display));
    return DAY_STARTS.flatMap((s) => {
      const choice = moves.find((c) => c.display.includes(s.name));
      return choice ? [{ screenId: s.screenId, name: s.name, choiceIndex: choice.index }] : [];
    });
  }

  /** Global settings overlay (Track 2c). A VISUAL SHELL — no `SettingsStore`
   * exists yet, so `OptionsScene`'s controls are inert; see its header. Same
   * paused-overlay lifecycle as `openSatchel`/`openCalendar`. */
  private openOptions() {
    if (this.scene.isActive("OptionsScene")) return;
    this.scene.pause();
    this.scene.launch("OptionsScene", {
      onClose: () => {
        this.scene.resume();
        // Scene Dimming is a live row. `render()` alone would not reach the
        // scrim — `backdropSys.sync()` no-ops on an unchanged screen.
        this.backdropSys.refreshScrim();
        this.render();
      },
    });
  }

  /**
   * Mode 3's Home Hub (Roc, 2026-08-13) — same `HubScene` `ScreenScene`
   * mounts on HOME, but with `discoveredOnly` set: the palette is only what
   * `Inventory.discoveredIds()` has actually recorded for this life, not
   * every collectible item. Reachable any time via the `[ home ]` button
   * rather than gated on ink actually reaching the HOME screen — this mode
   * has no day_end/home_hub wiring of its own yet, and gating the button on
   * screen id would strand the player with no way to decorate at all.
   */
  private openHub() {
    if (this.scene.isActive("HubScene")) return;
    this.scene.pause();
    this.scene.launch("HubScene", {
      items: [...this.run.items, ...this.run.keyItems],
      backdropKey: "bg:HOME",
      discoveredOnly: this.inventory.discoveredIds(),
      // Palette draws down from real banked stock, not infinite copies (Roc, 2026-08-23).
      banked: [...this.ink.view().banked],
      homeRegions: this.run.decorSurfaces.HOME,
      // Decorating fires none of the autosave's three events, so the slot kept
      // `{"raw":null}` and the next resume DELETED the placements — see
      // `Decor.onChange`. Same call `bindAutosave` makes. Roc, 2026-08-23.
      onDecorChanged: () => this.saveCoordinator?.save(),
      // "Home hub should just be the home hub screen" (Roc, 2026-08-23) —
      // `pause()` alone leaves this scene's go-to pills, nav row and satchel
      // strip being drawn behind the Hub every frame. See
      // `HubSceneData.launcherKey`.
      launcherKey: "CollectScene",
      onClose: () => {
        this.scene.resume();
        this.render();
      },
    });
  }

  /**
   * Mount the VFX system on THIS scene's bus.
   *
   * WHY THIS EXISTS. CollectScene builds its own GameEventBus and its own
   * CastPipeline, and that pipeline emits cast:resolved / cast:rejected. But
   * nothing was listening: `new VfxSystem(` appeared only in CastScene, so a
   * player casting in mode 2 or mode 3 — both of which route through here — saw
   * no particles, no tint, and no answer at all on a no-effect cast.
   *
   * The VFX suite could not see the hole. It asked "does every authored cue row
   * reach SOME mounted VfxSystem" and never the mirror question, "does every
   * scene that builds a cue-bearing emitter mount one". The mirror assertion now
   * lives in VfxSystem.test.ts alongside the original.
   *
   * This mirrors CastScene.startVfx(). Two differences, both deliberate:
   * stopOnScreenChange is FALSE because this scene owns a persistent screen and
   * a cue should survive its own frame, and the anchor is the screen centre
   * because collect-mode casting has no per-receiver hotspot to hang off.
   */
  private startVfx() {
    // GATED ON THE DESCRIPTOR, not on the scene. Only MODE5 lists "vfx" in its
    // systems (added 2026-08-17, caught mid-session — `modes.ts`'s own
    // header has the accounting), so modes 2 and 3 run exactly as they did
    // before — which is the point: a system exists in one place and each
    // mode declares whether it wants it. An earlier pass mounted this
    // unconditionally and quietly gave modes 2/3 a feature their own
    // records never asked for.
    if (!this.mode.systems.includes("vfx")) return;
    this.vfx?.detach();
    this.vfx = new VfxSystem({
      bus: this.bus,
      backend: new PhaserVfxBackend({ scene: this }),
      table: loadAuthoredCues(new Set(this.magic.spells.map((s) => s.spell_id))),
      anchorFor: () => null,
      defaultAnchor: { x: W / 2, y: H / 2 },
      stopOnScreenChange: false,
    }).attach();

    this.events.once("shutdown", () => {
      this.vfx?.detach();
      this.vfx = null;
    });
  }

  /**
   * Mount save on THIS scene's bus, and load whatever is in the slot.
   *
   * GATED ON THE DESCRIPTOR, same reasoning as `startVfx()`: only a mode that
   * lists `"save"` gets it, so `collect` and `discover-home` are unaffected.
   * `SaveCoordinator`, `SaveStore`, `LanternInkStatePort` and the slices were
   * built and tested (Wave 2 Track C) and constructed nowhere — this is the
   * mount (`plans/2026-08-17-mode5-srp-merge-plan.md`, step 1).
   *
   * `inventory`/`position` are satisfied as small inline adapters rather than
   * classes of their own: `Inventory.captureState`/`restoreState` and this
   * scene's own `currentScreen` tracking are already exactly what the ports
   * ask for, so a class would only wrap a single delegate call each.
   */
  private startSave() {
    if (!this.mode.systems.includes("save") || !this.mode.save) return;
    // No slot = nowhere to write, so no coordinator rather than one pointed at
    // `undefined`. On a mode that DOES declare slots that means a caller skipped
    // the board (T13 Phase 4); silently not saving is worse than saying so.
    const slot = this.saveSlot;
    if (!slot) {
      if (this.mode.save.slots.length) console.warn("[save] no slot chosen — this session will not autosave");
      return;
    }
    const storage = webSaveStorage(localStorage);
    const inventoryPort: InventoryStatePort = {
      captureInventory: () => this.inventory.captureState(),
      restoreInventory: (state) => this.inventory.restoreState(state),
    };
    const positionPort: PositionPort = {
      currentScreenId: () => this.currentScreen,
      // Recorded, not drawn — `render()` consumes it once. See
      // `pendingRestoredScreen`'s header for why a direct `syncBackdrop` call
      // here would be wrong (this runs during `init()`, before `create()`).
      applyScreenId: (screenId) => { this.pendingRestoredScreen = screenId; },
    };
    // `DecorSlice` takes ownership of `Decor.ts`'s existing localStorage key
    // rather than adding a second writer to the same fact — Risk 3 in the
    // plan's step 1. `GatesSlice` joins now that `startGates()` (called
    // before this, in `init()`) has a real `GateEngine` to wrap — step 1
    // deliberately skipped it as dead weight while nothing populated it.
    // `ReceiverStatesSlice` joins the same way now that `startReceiverStates()`
    // has a real store to wrap — mode5 plan step 4.
    // `DayPicksSlice` moves `DayPicks.ts`'s key (per-day start history) the way `DecorSlice` moves Decor's — one writer, opaque bytes.
    // `FestivalSlice` carries the per-soul talk calendar (T9) — unconditional, unlike the two
    // gated slices below; its header says why bonds that die on reload cannot be scored at all.
    // `DiscoverySlice` carries endings reached across this life's years (T13
    // Phase 5) — unconditional like `FestivalSlice`, and for the same reason.
    const slices: RegisteredSlice[] = [new KnowledgeSlice(this.knowledge), new DecorSlice(storage), new DayPicksSlice(storage), new FestivalSlice(this.festivalLedger), this.discovery];
    if (this.gateEngine) {
      const engine = this.gateEngine;
      const gatesPort: GatesPort = {
        clearedGates: () => engine.clearedGates(),
        // `GateEngine` restores as one wholesale set (`restoreCleared`), not
        // per-id — `GatesSlice.restore` calls `clear(id)` once per saved id,
        // so each call folds that id into the CURRENT cleared set rather than
        // replacing it. Cheap at this scale (six authored gates, max) and
        // never emits `gate:cleared` — `restoreCleared` is silent by design,
        // so a load does not replay every VFX cue the player already saw.
        clear: (gateId) => engine.restoreCleared([...engine.clearedGates(), gateId]),
      };
      slices.push(new GatesSlice(gatesPort));
    }
    if (this.receiverStates) {
      slices.push(new ReceiverStatesSlice(this.receiverStates));
    }
    this.saveCoordinator = new SaveCoordinator({
      slot,
      playerName: this.playerName,
      modeId: this.mode.id,
      store: new SaveStore(storage),
      ink: new LanternInkStatePort(this.ink.player),
      inventory: inventoryPort,
      position: positionPort,
      slices,
      bus: this.bus,
    });
    this.saveCoordinator.load();
    this.unbindAutosave = this.saveCoordinator.bindAutosave(this.bus, this.mode.save.autosaveOn);

    this.events.once("shutdown", () => {
      this.unbindAutosave?.();
      this.unbindAutosave = null;
      this.saveCoordinator = null;
    });
  }

  /**
   * Mount the VN layer ALONGSIDE the spell-clue modal — mode5 plan step 2.
   *
   * GATED ON THE DESCRIPTOR, same reasoning as `startVfx()`/`startSave()`:
   * only a mode declaring `dialogue: "vn"` gets it, so modes 2-3 keep the
   * flat choices row exactly as before. `mountDialogue` registers its own
   * shutdown teardown; this only needs to drop the references.
   *
   * `onAdvance` is what actually reveals the conversation's choices — see
   * `pendingConvChoices`'s header. It fires from `DialogueSystem.advance()`,
   * which only ever runs in response to the player clicking/keying past the
   * box, never from `render()` itself — so this cannot fire on the same pass
   * that populated `pendingConvChoices`.
   */
  private startDialogue() {
    if (this.mode.dialogue !== "vn") return;
    this.dialogueFeed = new DialogueFeed(this.bus);
    this.dialogue = mountDialogue(this, this.bus, {
      spriteKeyFor: (soul) => this.cast.bustPortraitKey(soul),
      depth: 150,
      onAdvance: () => this.revealConversationChoices(),
      // Control-bar "Options" button → openOptions() (a Scene DialogueSystem can't launch).
      onControl: (id) => { if (id === "options") this.openOptions(); },
    });
    this.events.once("shutdown", () => {
      this.dialogue = null;
      this.dialogueFeed = null;
    });
  }

  private revealConversationChoices() {
    if (!this.dialogue || this.pendingConvChoices.length === 0) return;
    const convChoices = this.pendingConvChoices;
    this.dialogue.showChoices(
      convChoices.map((c) => ({ text: c.display })),
      (i) => {
        const picked = convChoices[i];
        const startsNextDay = picked.text === HUB_CALENDAR_CHOICE;
        this.ink.choose(picked.index);
        this.ink.runToChoice();
        // "Start the Next Day" opens the calendar in its ACTIVE state — AFTER
        // the advance, so ink is sitting on the `calendar` knot and the real
        // "Go to X" choices exist to offer. Opening it before the advance (the
        // old order) is why the hub calendar could not pick forest/town: the
        // overlay had nothing to hand the player, and the only live picks were
        // the TraversalRow pills hidden UNDERNEATH it.
        if (startsNextDay) this.openDayStartCalendar();
      },
    );
  }

  /** Festival scoring's one read (T9). Pure — see `scoreFestivalForRun`. */
  private festivalScore(v: PlayView) {
    return scoreFestivalForRun(this.run.graph, v, this.festivalLedger);
  }

  private render() {
    const rawView = this.ink.view();
    // `pendingRestoredScreen` wins over ink's own (possibly stale, post-load)
    // report, exactly once — see that field's header. `v` is corrected for
    // the WHOLE pass, not just the backdrop: `drawCast`/`drawHotspots`/the
    // header text all read `pos.currentScreen` off whatever view they are
    // handed, and one render on the stale screen would query the wrong NPCs
    // and the wrong forage offer for the backdrop actually on screen.
    //
    // `?? this.currentScreen` (Roc, 2026-08-17 — reported with screenshots)
    // is NOT redundant with `pendingRestoredScreen`: that field only fixes
    // the FIRST render after a restore. `LanternPlayer.currentScreen` only
    // updates when a NEW `#screen:` tag prints (`takeTags`), and a
    // conversation's own lines do not carry one — so if the player's next
    // several actions are all "talk with X" and never a move, ink's own
    // report stays stuck at whatever it was pre-restore (often null) for the
    // rest of the session: no backdrop, no portraits, "screen —" in the
    // header. Falling back to the scene's OWN last-drawn screen makes the
    // correction durable instead of one render deep — this method only ever
    // writes `this.currentScreen` from an already-corrected `screen` (right
    // after `backdropSys.sync(screen)`, below), so this cannot entrench a
    // wrong value the way trusting ink again would.
    const screen = this.pendingRestoredScreen ?? rawView.pos.currentScreen ?? this.currentScreen;
    this.pendingRestoredScreen = null;
    const v: PlayView =
      screen === rawView.pos.currentScreen
        ? rawView
        : { ...rawView, pos: { ...rawView.pos, currentScreen: screen } };
    const previousScreen = this.currentScreen;
    this.backdropSys.sync(screen);
    this.currentScreen = screen;
    // `FS` **AND** A PARKED STORY (T13 Phase 5). `screen` alone stopped being
    // enough once the host could divert out of `FS`: `begin_new_year` ->
    // `day_start` -> `screen_hub` prints no `#screen:` tag, so ink keeps
    // reporting `"FS"` until the first move of the new year and both panels
    // would sit over year 2 day 1. `ended` also makes the ruled reload case
    // work: a save captured here restores an ENDED story, back on the rollover.
    const atFinalScreen = screen === FINAL_SCREEN_ID && v.ended;
    // A NEW ENDING SAVES ITSELF, because the autosave genuinely cannot: `FS`
    // prints its `#screen:` tag one `continueOnce` BEFORE `-> END`, so
    // `screen:changed` fires while `ended` is still false and `record` has not
    // run — and the week is over, so no second event follows. Same shape and
    // precedent as `openHub`'s `onDecorChanged`; `record` is true only on a
    // tier's FIRST time, so this writes once per ending, not once per render.
    if (atFinalScreen && this.discovery.record(this.festivalScore(v).tier)) {
      this.saveCoordinator?.save();
    }
    if (screen && screen !== previousScreen) {
      this.bus.emit({
        type: "screen:changed",
        from: previousScreen,
        to: screen,
        day: v.day,
        timeBlock: v.timeBlock,
        movesLeft: v.movesLeft,
      });
    }
    // The Final Screen's results (T9) and, appended under them, the year
    // rollover (T13 Phase 5). `null` anywhere but a parked `FS`; both panels key
    // on their own content, so an unchanged re-render is a no-op.
    this.festivalResults.sync(atFinalScreen ? this.festivalScore(v) : null);
    this.yearRollover.sync(atFinalScreen);
    this.satchelSys.syncInventory(v);
    const hotspotsFull =
      this.satchelSys.effectiveSatchel(v.satchel).length >= v.satchelCapacity && v.arms.length >= v.armsCapacity;
    this.hotspotSys.sync(v, hotspotsFull);
    this.droppedHotspots.sync(v, hotspotsFull);
    this.receiverHotspots.sync(v);
    this.satchelSys.draw(v);
    if (this.editMode && screen) {
      // Same declared-∪-shaped resolution `ScreenScene.drawHotspots` uses —
      // `HotspotSystem`'s own forage dots are a different mechanic and carry
      // no region ids at all, so this is the only place mode5 needs them.
      const spec = this.run.graph.screens?.find((s) => s.screen_id === screen);
      const declared = (spec?.regions ?? []).map((r) => r.region_id);
      const ids = [...new Set([...Object.keys(this.run.regions[screen] ?? {}), ...declared])];
      // The MOVE palette (GP-203): this screen's live exits keyed by destination
      // screen id, from the same `exitMoveInputs` call `MoveRegions.draw` makes
      // below — so the chip you arm and the key the renderer looks up are one.
      const moveIds = exitMoveInputs(v.choices, (name) => this.gates.screenIdForName(name)).map((m) => m.key);
      this.editMode.draw(screen, ids, moveIds);
    }

    // Roc, 2026-08-19 (screen-flow feedback): day · time · screen NAME only.
    // Moves-left lives on the calendar; the satchel count is on the bottom strip.
    this.header.setText(`Day ${v.day} · ${v.timeBlock.charAt(0).toUpperCase() + v.timeBlock.slice(1)} · ${this.gates.nameOf(v.pos.currentScreen)}`);
    this.headerPlaque.setSize(this.header.width + 20, 46);

    // THE VN SCOPE SEAM (mode5 plan step 2). `kind === "move"` is the screen
    // layout; `kind === "spoken" | "deed"` is a conversation. The hub always
    // mixes both (a "Talk to X" deed sits beside "[Go to Y]" moves), so
    // "the current choice set has no move choice" is a reliable, stateless
    // signal that ink has descended into a conversation sub-tree — checked
    // fresh every render, no flag to fall out of sync.
    const inConversation =
      this.dialogue !== null && v.choices.length > 0 && !v.choices.some((c) => c.kind === "move");
    this.inConversation = inConversation;
    this.dialogueFeed?.sync(v, inConversation);
    // Which "Talk to X" choices `npcTalk.drawCast` just wired up to a
    // portrait click, in the SAME render — the flat row below must leave
    // these out, or the pick is offered twice through two different UIs.
    // Empty while `inConversation` (no portraits drawn to click) — see
    // `npcTalk.clear()`'s own header.
    let talkChoiceIndexes: ReadonlySet<number> = new Set();
    if (this.dialogue) {
      if (inConversation) {
        // The VN sprite already shows who's speaking — the small hub
        // portrait row underneath would double the same soul on screen.
        this.npcTalk.clear();
        // NOT shown here. `pendingConvChoices` is only revealed once the
        // player has clicked past whatever text just arrived — see
        // `revealConversationChoices`'s header on `startDialogue()`.
        this.pendingConvChoices = v.choices.filter((c) => c.kind !== "move");
      } else {
        this.dialogue.clear();
        this.pendingConvChoices = [];
        talkChoiceIndexes = this.npcTalk.drawCast(v);
      }
    } else {
      talkChoiceIndexes = this.npcTalk.drawCast(v);
    }

    this.traversalRow.draw(v, inConversation, talkChoiceIndexes);
    // T14: exits are boxes on the painting; the day verbs dim on the bar when
    // ink stops offering them.
    this.moveRegions.draw(v, inConversation);
    this.hudBar.sync(v);
  }
}
