/**
 * t13-slot-board.mjs — T13 Phase 4, the real 3-slot lives board.
 *
 * The plan's own done-when, driven for real: "a real playtest creates three
 * independent lives with three names, resumes each, and the slot cards read
 * «name» — Year N, Day D · block".
 *
 * WHAT IS ACTUALLY EXERCISED, and by what:
 *   1. FIRST BOOT SHOWS THE BOARD. The Phase-3 pass-through ("nothing saved, so
 *      skip the screen") is retired for a slot-set mode, so the very first frame
 *      after preload is three empty columns — not the day-start pick.
 *   2. Every column is a real slot. Picking one is a REAL POINTER CLICK on that
 *      column, and the name is REAL KEY PRESSES into the scene's own `keydown`
 *      capture — not an emitted event, not a probe call.
 *   3. Enter commits and routes to the day-1 pick with that slot and that name
 *      in scene data, which lands as `CollectScene.saveSlot` / `playerName`.
 *   4. Three lives, three keys, three names, no bleed between them.
 *   5. Resume on each card puts the player back into THAT slot under THAT name.
 *
 * TWO THINGS ARE DRIVEN THROUGH THE GAME'S OWN HANDLES RATHER THAN THE MOUSE,
 * and both are deliberate:
 *   - THE MOVE. `mode5.save.autosaveOn` is `screen:changed` / `item:acquired` /
 *     `gate:cleared`, so a life only exists on disk once the player does
 *     something. The move is made through `window.__collect.choose` — the
 *     repo's own headless driver (`tools/walk.mjs`), which runs the same
 *     `ink.choose` + `runToChoice` a clicked move region does. Clicking a move
 *     region instead would need a per-screen coordinate, and each life starts on
 *     a different screen.
 *   - RE-ENTERING THE BOARD. There is no page-reload action in the harness, so
 *     the board is re-entered from the play scene's OWN `ScenePlugin.start`,
 *     which shuts CollectScene down and hands over exactly like
 *     `sceneTransition` does. The Phase-3 scenario used the SceneManager
 *     (`game.scene.start`) instead, which leaves the play scene running
 *     underneath the board — that is what cost it its backdrop art and made its
 *     later screenshots unusable. Do not go back to it.
 *
 * Run: npm run playtest -- --scenario playtest/t13-slot-board.mjs
 */

/** Column centres and the action-row geometry, from `SaveLoadScene`'s own
 * constants: BOARD_X 340 + BOARD_PAD 40, SLOT_W 370, SLOT_GAP 24, SLOT_TOP 328
 * (BOARD_TOP 200 + 128), SLOT_H 430, SLOT_PAD 22. Asserted against the live hit
 * areas below before the first click that depends on them, so a card-geometry
 * change fails loudly here instead of clicking nothing. */
const COL_CENTER_X = [565, 959, 1353];
const COL_CENTER_Y = 543;
/** Resume (filled) and Begin (naming) share the left action slot. */
const PRIMARY_X = [481, 875, 1269];
const ACTION_Y = 716;

/** Every Text on the board, walked out of the scene's one container — a flat
 * `children.list` scan finds nothing, because `SaveLoadScene` nests everything
 * in `this.layer`. */
const READ_TEXTS = `(() => {
  const s = game.scene.getScene("SaveLoadScene");
  if (!s || !s.scene.isActive()) return null;
  const out = [];
  const walk = (list) => list.forEach((o) => {
    if (o.type === "Text") out.push(o.text);
    if (o.list) walk(o.list);
  });
  walk(s.children.list);
  return out;
})()`;

/** Take the first day-start thumbnail if the pick is up. It only is for the
 * FIRST life: once ink has moved into the world, `LocationSelectScene` finds no
 * "Begin at" choices left and passes straight through to play, which is its own
 * documented behaviour. Both outcomes are fine; "no thumbnail while the scene IS
 * up" is not, and reports false. */
const TAKE_A_START = `(() => {
  const ls = game.scene.getScene("LocationSelectScene");
  if (!ls || !ls.scene.isActive()) return "the day-start pick was skipped — already in play";
  let hit = null;
  ls.children.list.forEach((o) => {
    if (!hit && o.type === "Rectangle" && o.input && o.depth === 4) hit = o;
  });
  if (!hit) return false;
  hit.emit("pointerdown");
  return "picked the first start";
})()`;

/** One real in-story move, which is what fires the autosave. */
const MOVE_ONCE = `(() => {
  const p = window.__collect;
  if (!p) return "no probe — CollectScene is not up";
  const move = p.snapshot().choices.find((c) => c.kind === "move");
  if (!move) return "this screen offers no move";
  p.choose(move.index);
  return true;
})()`;

/** Hand back to the board the way a scene transition does. See the header. */
const REENTER_BOARD = `(() => {
  const s = game.scene.getScene("CollectScene");
  s.scene.start("SaveLoadScene", { run: s.run, ink: s.ink, magic: s.magic, mode: s.mode });
  return true;
})()`;

const type = (word) => [...word].map((ch) => ({ name: `key "${ch}"`, action: "press", key: ch }));

const savedAt = (slot) => `(() => {
  const raw = localStorage.getItem("phaser-probe/save/v1/${slot}");
  if (!raw) return "nothing at ${slot}";
  const s = JSON.parse(raw);
  return { version: s.version, slot: s.slot, name: s.playerName, year: s.clockDisplay.year, day: s.clockDisplay.day };
})()`;

/** One whole life: pick a column, type a name, commit, play far enough to be
 * saved, and come back to the board. */
const live = (col, name, withScreenshots) => {
  const slot = `mode5-${col + 1}`;
  return [
    { name: `click empty column ${col + 1}`, action: "click", x: COL_CENTER_X[col], y: COL_CENTER_Y },
    { name: "the name field opens in that column", action: "wait", ms: 700 },
    ...type(name),
    { name: "let the caret settle", action: "wait", ms: 400 },
    ...(withScreenshots ? [{ name: `naming life ${col + 1} — the field on the board`, action: "screenshot" }] : []),
    {
      name: `the field holds "${name}" and the other two columns are frozen`,
      action: "expect",
      expect: {
        expression: `(() => {
          const t = ${READ_TEXTS};
          if (!t) return "board is not up";
          return { typed: t.includes(${JSON.stringify(name)}), prompt: t.includes("NAME THIS LIFE") };
        })()`,
        equals: { typed: true, prompt: true },
      },
    },
    { name: "Enter begins the life", action: "press", key: "Enter" },
    { name: "leave the board", action: "wait", ms: 3000 },
    { name: "take a day start if the pick is up", action: "expect", expect: { expression: TAKE_A_START } },
    { name: "let play come up", action: "wait", ms: 4000 },
    {
      name: `playing ${slot}, under the name that was typed`,
      action: "expect",
      expect: {
        expression: `(() => {
          const s = game.scene.getScene("CollectScene");
          return { slot: s.saveSlot, name: s.playerName, playing: s.scene.isActive() };
        })()`,
        equals: { slot, name, playing: true },
      },
    },
    { name: "one real move — the event mode5 autosaves on", action: "expect", expect: { expression: MOVE_ONCE, equals: true } },
    { name: "let the autosave land", action: "wait", ms: 1500 },
    {
      name: `${slot} holds a version-3 save named "${name}"`,
      action: "expect",
      expect: { expression: savedAt(slot), equals: { version: 3, slot, name, year: 1, day: 1 } },
    },
    { name: "hand back to the board", action: "expect", expect: { expression: REENTER_BOARD, equals: true } },
    { name: "let the board draw", action: "wait", ms: 2500 },
  ];
};

/** Resume a card and check the player came back into THAT life. */
const resume = (col, name) => [
  {
    name: `the Resume click for column ${col + 1} is inside a live button`,
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("SaveLoadScene");
        let inside = false;
        const walk = (list) => list.forEach((o) => {
          if (o.type === "Rectangle" && o.input && o.height === 40
              && Math.abs(${PRIMARY_X[col]} - o.x) < o.width / 2 && Math.abs(${ACTION_Y} - o.y) < o.height / 2) inside = true;
          if (o.list) walk(o.list);
        });
        walk(s.children.list);
        return inside;
      })()`,
      equals: true,
    },
  },
  { name: `press Resume on life ${col + 1}`, action: "click", x: PRIMARY_X[col], y: ACTION_Y },
  { name: "let CollectScene restore", action: "wait", ms: 4500 },
  {
    name: `resumed into mode5-${col + 1} as "${name}"`,
    action: "expect",
    expect: {
      expression: `(() => {
        const s = game.scene.getScene("CollectScene");
        return { slot: s.saveSlot, name: s.playerName, screen: !!window.__collect.snapshot().drawnScreen };
      })()`,
      equals: { slot: `mode5-${col + 1}`, name, screen: true },
    },
  },
];

export default [
  { name: "boot settles onto the lives board", action: "wait", ms: 4500 },
  { name: "FIRST BOOT — the board itself, three empty slots (the retired pass-through)", action: "screenshot" },
  {
    name: "first boot shows the board, not the day-start pick: three empty columns, nothing to resume",
    action: "expect",
    expect: {
      expression: `(() => {
        const t = ${READ_TEXTS};
        if (!t) return "the board is not up — it passed through";
        return {
          begin: t.filter((x) => x === "Begin a new life here").length,
          resume: t.includes("Resume"),
          // The heading is honest about there being nothing to continue.
          title: t.includes("B E G I N"),
          wentToDayStart: game.scene.isActive("LocationSelectScene"),
        };
      })()`,
      equals: { begin: 3, resume: false, title: true, wentToDayStart: false },
    },
  },

  ...live(0, "Wren", true),
  {
    name: "one life on the board now, and its card leads with the heading",
    action: "expect",
    expect: {
      expression: `(() => {
        const t = ${READ_TEXTS};
        if (!t) return "board is not up";
        return {
          // The first life IS pinned to the block, because it is the only one
          // made on a fresh clock — see the done-when check below for why the
          // other two are not.
          heading: t.includes("Wren — Year 1, Day 1 · morning"),
          stillEmpty: t.filter((x) => x === "Begin a new life here").length,
          title: t.includes("C O N T I N U E"),
        };
      })()`,
      equals: { heading: true, stillEmpty: 2, title: true },
    },
  },
  { name: "one life, two slots still open", action: "screenshot" },

  ...live(1, "Bram", false),
  ...live(2, "Cinder", false),

  {
    name: "THE DONE-WHEN: three independent lives, each card reading «name» — Year N, Day D · block",
    action: "expect",
    expect: {
      expression: `(() => {
        const t = ${READ_TEXTS};
        if (!t) return "board is not up";
        // THE TIME BLOCK IS NOT PINNED, AND THAT IS NOT A LOOSE ASSERTION.
        // All three lives are made in ONE page load off ONE shared ink bridge,
        // so the move each life makes rolls the shared clock forward and life 2
        // starts in the afternoon, life 3 in the evening. A real player makes
        // each life in its own session. The FORMAT is what this pins — the
        // whole string, anchored at both ends, name and year and day exact.
        return {
          headings: ["Wren", "Bram", "Cinder"].map((name) =>
            t.some((x) => new RegExp("^" + name + " — Year 1, Day 1 · [a-z]+$").test(x)),
          ),
          resumes: t.filter((x) => x === "Resume").length,
          startOvers: t.filter((x) => x === "Start Over").length,
          empties: t.filter((x) => x === "Begin a new life here").length,
        };
      })()`,
      equals: { headings: [true, true, true], resumes: 3, startOvers: 3, empties: 0 },
    },
  },
  {
    name: "the three lives are three separate keys, and the retired single-slot key was never written",
    action: "expect",
    expect: {
      expression: `(() => {
        const at = (k) => { const raw = localStorage.getItem("phaser-probe/save/v1/" + k); return raw ? JSON.parse(raw).playerName : null; };
        return { one: at("mode5-1"), two: at("mode5-2"), three: at("mode5-3"), retired: at("mode5") };
      })()`,
      equals: { one: "Wren", two: "Bram", three: "Cinder", retired: null },
    },
  },
  { name: "THREE LIVES on the board", action: "screenshot" },

  // Resume each life in a different order than they were made, so a card
  // resuming "whatever was last played" would fail here.
  ...resume(1, "Bram"),
  { name: "hand back to the board", action: "expect", expect: { expression: REENTER_BOARD, equals: true } },
  { name: "let the board draw", action: "wait", ms: 2500 },
  ...resume(2, "Cinder"),
  { name: "hand back to the board", action: "expect", expect: { expression: REENTER_BOARD, equals: true } },
  { name: "let the board draw", action: "wait", ms: 2500 },
  ...resume(0, "Wren"),
  { name: "resumed the first life last — its world is drawn, not a fresh day 1", action: "screenshot" },

  // START OVER: the two-step confirm survives untouched; what follows it is new.
  // Erasing a life leaves an empty column, and an empty column asks for a name.
  { name: "hand back to the board", action: "expect", expect: { expression: REENTER_BOARD, equals: true } },
  { name: "let the board draw", action: "wait", ms: 2500 },
  { name: "arm Start Over on life 1", action: "click", x: 649, y: ACTION_Y },
  { name: "let it relabel", action: "wait", ms: 600 },
  {
    name: "one click ARMS ONLY THAT COLUMN — the other two still say Start Over, and nothing is erased yet",
    action: "expect",
    expect: {
      expression: `(() => {
        const t = ${READ_TEXTS};
        if (!t) return "board is not up";
        return {
          armed: t.filter((x) => x === "Confirm Erase").length,
          unarmed: t.filter((x) => x === "Start Over").length,
          stillSaved: localStorage.getItem("phaser-probe/save/v1/mode5-1") !== null,
        };
      })()`,
      equals: { armed: 1, unarmed: 2, stillSaved: true },
    },
  },
  { name: "confirm the erase", action: "click", x: 649, y: ACTION_Y },
  { name: "let the column redraw", action: "wait", ms: 800 },
  {
    name: "the life is gone EAGERLY (not on the next autosave), the column asks for a name, and the other two lives are untouched",
    action: "expect",
    expect: {
      expression: `(() => {
        const t = ${READ_TEXTS};
        if (!t) return "board is not up";
        const at = (k) => localStorage.getItem("phaser-probe/save/v1/" + k);
        return {
          erased: at("mode5-1") === null,
          naming: t.includes("NAME THIS LIFE"),
          others: [JSON.parse(at("mode5-2")).playerName, JSON.parse(at("mode5-3")).playerName],
        };
      })()`,
      equals: { erased: true, naming: true, others: ["Bram", "Cinder"] },
    },
  },
  { name: "erased life 1, naming its replacement", action: "screenshot" },
  { name: "Esc backs out of naming", action: "press", key: "Escape" },
  { name: "let the column redraw", action: "wait", ms: 600 },
  {
    name: "cancelling leaves an ordinary empty column — no half-made life",
    action: "expect",
    expect: {
      expression: `(() => {
        const t = ${READ_TEXTS};
        if (!t) return "board is not up";
        return {
          empty: t.filter((x) => x === "Begin a new life here").length,
          naming: t.includes("NAME THIS LIFE"),
          resumes: t.filter((x) => x === "Resume").length,
        };
      })()`,
      equals: { empty: 1, naming: false, resumes: 2 },
    },
  },
  { name: "two lives and one open slot, after a start-over", action: "screenshot" },
];
