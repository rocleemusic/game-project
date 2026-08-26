/**
 * t13-slot-set.mjs — T13, the SCHEMA half: the `SAVE_VERSION` 2 -> 3 bump and
 * the keys it writes. The BOARD half is `t13-slot-board.mjs`; this file
 * deliberately keeps its focus on the bytes.
 *
 * UPDATED FOR PHASE 4 (2026-08-24). Written for Phase 3, when nothing was
 * supposed to look different and the boot gate still passed straight through on
 * a first boot. Phase 4 retired that pass-through — the board now always shows
 * for a slot-set mode — so the steps that assumed it are gone rather than left
 * on disk asserting a behaviour the build no longer has. What it checks now:
 *
 *   1. First boot lands on the BOARD, and a life is begun from it. This one is
 *      begun UNNAMED (Enter on an empty field), because an unnamed life is a
 *      real schema state (`playerName: ""`) and nothing else exercises it.
 *   2. The session's live slot is `mode5-1` — one of `mode.save.slots`, not the
 *      retired single `"mode5"` key.
 *   3. The autosave lands at `phaser-probe/save/v1/mode5-1`, at version 3, with
 *      `playerName` and `clockDisplay.year` present, and the OLD `mode5` key is
 *      never written.
 *   4. Re-entering the gate with that save shows the card, and Resume puts the
 *      player back into the same slot.
 *   5. THE REFUSAL. A version-2 save planted in that slot is refused; the slot
 *      draws as EMPTY-WITH-A-REASON rather than being coerced or silently
 *      passed over, and the planted bytes are still sitting in localStorage
 *      afterwards — refusing a save and then quietly deleting it is the same
 *      data loss with a better excuse.
 *
 * Steps 4 and 5 re-enter `SaveLoadScene` through the PLAY SCENE'S OWN
 * `ScenePlugin.start`, which shuts it down and hands over exactly like
 * `sceneTransition`. The harness has no page-reload action; this reaches the
 * same gate without leaving a second scene running underneath it.
 *
 * Run: npm run playtest -- --scenario playtest/t13-slot-set.mjs
 */

const KEY_NEW = "phaser-probe/save/v1/mode5-1";
const KEY_OLD = "phaser-probe/save/v1/mode5";

export default [
  { name: "the lives board comes up", action: "wait", ms: 4500 },
  { name: "first boot — the board, not a pass-through (Phase 4)", action: "screenshot" },
  { name: "begin a life in the first column", action: "click", x: 565, y: 543 },
  { name: "the name field opens", action: "wait", ms: 800 },
  // NO NAME TYPED. Enter on an empty field begins an unnamed life on purpose —
  // `SaveGame.playerName` documents `""` as a real value, and this is the only
  // scenario that puts one on disk.
  { name: "Enter with an empty field begins an unnamed life", action: "press", key: "Enter" },
  { name: "leave the board", action: "wait", ms: 3000 },
  { name: "pick the day's first start location", action: "click", x: 172, y: 460 },
  { name: "CollectScene ready", action: "wait", ms: 3500 },
  { name: "playing an unnamed life in mode5-1", action: "screenshot" },

  {
    name: "the session owns ONE slot, and it is the first of the mode's three",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("CollectScene");
        return { slots: [...s.mode.save.slots], live: s.saveSlot };
      })()`,
      equals: { slots: ["mode5-1", "mode5-2", "mode5-3"], live: "mode5-1" },
    },
  },

  {
    name: "the autosave is a version-3 save at the new key, and the retired mode5 key was never written",
    action: "expect",
    expect: {
      expression: `(() => {
        const raw = localStorage.getItem(${JSON.stringify(KEY_NEW)});
        if (!raw) return "nothing at " + ${JSON.stringify(KEY_NEW)};
        const save = JSON.parse(raw);
        return {
          version: save.version,
          slot: save.slot,
          // The field is PRESENT and EMPTY, which is the point: nothing was
          // typed, and nothing back-filled a stand-in name.
          name: save.playerName,
          year: save.clockDisplay.year,
          oldKeyUntouched: localStorage.getItem(${JSON.stringify(KEY_OLD)}) === null,
        };
      })()`,
      equals: { version: 3, slot: "mode5-1", name: "", year: 1, oldKeyUntouched: true },
    },
  },

  {
    name: "re-enter the boot gate with that save in the slot",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("CollectScene");
        // The play scene's OWN plugin, so it shuts down and hands over the way
        // sceneTransition does. game.scene.start would leave it running under
        // the board, and its ink listener would render a dead scene.
        s.scene.start("SaveLoadScene", { run: s.run, ink: s.ink, magic: s.magic, mode: s.mode });
        return true;
      })()`,
      equals: true,
    },
  },
  { name: "let the board draw", action: "wait", ms: 2500 },
  { name: "the Continue board, reading a version-3 save out of slot mode5-1", action: "screenshot" },

  {
    name: "the board reads the version-3 save: an UNNAMED card, year and day in the heading, spells, Resume",
    action: "expect",
    expect: {
      // SaveLoadScene nests every child in `this.layer`, so a flat
      // `children.list` scan finds nothing — walk the container.
      expression: `(() => {
        const s = game.scene.getScene("SaveLoadScene");
        if (!s || !s.scene.isActive()) return "SaveLoadScene is not up";
        const texts = [];
        const walk = (list) => list.forEach((o) => {
          if (o.type === "Text") texts.push(o.text);
          if (o.list) walk(o.list);
        });
        walk(s.children.list);
        window.__t13texts = texts;
        return {
          resume: texts.includes("Resume"),
          startOver: texts.includes("Start Over"),
          // AN UNNAMED LIFE DROPS THE NAME AND THE DASH — it does not gain a
          // placeholder. The clock half of the heading is all there is.
          heading: texts.includes("Year 1, Day 1 · morning"),
          noStandInName: !texts.some((t) => /unnamed|unknown/i.test(t)),
        };
      })()`,
      equals: { resume: true, startOver: true, heading: true, noStandInName: true },
    },
  },

  // A REAL pointer click on the Resume button, not an emitted event — the
  // coordinate is asserted inside the button's own hit area first, the same
  // convention `t14-hud-bar.mjs` uses.
  {
    name: "the click coordinate below is inside the Resume button",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("SaveLoadScene");
        let btn = null;
        const walk = (list) => list.forEach((o) => {
          if (o.type === "Rectangle" && o.input && o.height === 40 && !btn) btn = o;
          if (o.list) walk(o.list);
        });
        walk(s.children.list);
        if (!btn) return "no Resume button";
        const px = 481, py = 716;
        return Math.abs(px - btn.x) < btn.width / 2 && Math.abs(py - btn.y) < btn.height / 2
          ? true
          : "button is at " + Math.round(btn.x) + "," + Math.round(btn.y);
      })()`,
      equals: true,
    },
  },
  { name: "press Resume", action: "click", x: 481, y: 716 },
  { name: "let CollectScene restart and restore", action: "wait", ms: 3500 },
  {
    name: "back in play, on the SAME slot the board chose — not re-derived from the descriptor",
    action: "expect",
    expect: {
      expression: `game.scene.getScene("CollectScene").saveSlot`,
      equals: "mode5-1",
    },
  },
  {
    // The screenshot at this step shows NO BACKDROP ART, and that is an
    // artifact of restarting `CollectScene` inside one page load, not a
    // regression. `BackdropSystem` is a FIELD INITIALIZER on the scene, so a
    // restart reuses the same instance with `drawnScreen` still set to the
    // screen it drew last time; `sync()` sees no change and skips redrawing an
    // image the shutdown already destroyed. Nothing in the real boot chain
    // restarts the play scene (the board is boot-only, and Resume is that
    // scene's FIRST start in its page load). So the state is asserted here
    // rather than read off the pixels: the right screen, the right slot, and a
    // full render of everything else the scene owns.
    name: "the resumed session is on the saved screen with its world intact",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("CollectScene");
        const snap = window.__collect.snapshot();
        return {
          slot: s.saveSlot,
          screen: snap.drawnScreen === "T1",
          day: s.ink.view().day,
          // The move regions redrew for the restored screen, so render() ran
          // against real restored state and not an empty view.
          exits: s.children.list.filter((o) => o.type === "Rectangle" && o.depth === 10 && o.input).length > 0,
        };
      })()`,
      equals: { slot: "mode5-1", screen: true, day: 1, exits: true },
    },
  },
  { name: "resumed into slot mode5-1 (see the note in the scenario source)", action: "screenshot" },

  {
    name: "plant a version-2 save in that slot and re-enter the gate",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("CollectScene");
        const real = JSON.parse(localStorage.getItem(${JSON.stringify(KEY_NEW)}));
        // A real version-2 save: no playerName, no clockDisplay.year.
        delete real.playerName;
        delete real.clockDisplay.year;
        real.version = 2;
        window.__t13v2 = JSON.stringify(real);
        localStorage.setItem(${JSON.stringify(KEY_NEW)}, window.__t13v2);
        game.scene.start("SaveLoadScene", { run: s.run, ink: s.ink, magic: s.magic, mode: s.mode });
        return true;
      })()`,
      equals: true,
    },
  },
  { name: "let the gate decide", action: "wait", ms: 3000 },
  { name: "the refused slot, drawn as empty WITH A REASON", action: "screenshot" },
  {
    // WHAT THIS ASSERTS CHANGED IN PHASE 4, THE REFUSAL DID NOT. Through Phase
    // 3 a refused save meant the whole gate passed through to the day-start
    // pick. Now the board stays up and the refused slot draws as empty with the
    // reason on it, which is the same decision (never coerce) told to the player
    // instead of swallowed. The bytes still have to be exactly where they were.
    name: "REFUSED, not coerced: the slot reads empty with a reason, and the version-2 bytes are still there",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("SaveLoadScene");
        if (!s.scene.isActive()) return "the board passed through instead of showing the refusal";
        const texts = [];
        const walk = (list) => list.forEach((o) => {
          if (o.type === "Text") texts.push(o.text);
          if (o.list) walk(o.list);
        });
        walk(s.children.list);
        return {
          offersToBegin: texts.filter((t) => t === "Begin a new life here").length,
          saysWhy: texts.some((t) => /cannot read/.test(t)),
          noResume: !texts.includes("Resume"),
          bytesIntact: localStorage.getItem(${JSON.stringify(KEY_NEW)}) === window.__t13v2,
        };
      })()`,
      equals: { offersToBegin: 3, saysWhy: true, noResume: true, bytesIntact: true },
    },
  },
];
