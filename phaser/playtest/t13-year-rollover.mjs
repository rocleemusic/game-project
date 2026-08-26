/**
 * t13-year-rollover.mjs — T13 Phase 5, the rollover screen and its discovery
 * summary.
 *
 * The plan's own done-when, driven for real: "a scripted playtest plays to
 * festival night, sees the summary, saves + reloads back onto the rollover
 * screen, presses Continue, and lands on Year 2 Day 1 morning with inventory,
 * knowledge, decor and bonds intact and the moves budget full."
 *
 * WHAT IS ACTUALLY EXERCISED, and by what:
 *   1. A NAMED LIFE IN A REAL SLOT. The board is the boot gate now (Phase 4),
 *      so this starts by clicking an empty column and typing a name — the same
 *      real pointer + real keystrokes `t13-slot-board.mjs` uses. Without that
 *      there is no slot, and without a slot there is no autosave to reload.
 *   2. A WHOLE WEEK TO FESTIVAL NIGHT, walked greedily through the game's own
 *      `window.__collect` probe. Lifted from `festival-night-t9.mjs` — see that
 *      file's header for why a driven autoplay rather than a click script (the
 *      route is ~40-50 choices deep and the daily soul placement is drawn by
 *      the resolver, so fixed coordinates would rot on the next reroll).
 *   3. THE ROLLOVER ITSELF — the sentence a player reads, and its two buttons,
 *      both asserted as LIVE HIT AREAS before anything clicks them.
 *   4. THE EXPLICIT-ROLLOVER RULING: a save captured at `final_screen` restores
 *      back to the rollover, not past it. See the block comment on the reload
 *      step below for how that is proven with a genuinely fresh story.
 *   5. CONTINUE: one host divert, and the whole life carried across the year
 *      boundary — spellbook, everHeld, banked, bond bands and decor, each
 *      captured BEFORE the press and compared after, not eyeballed.
 *
 * Run: npm run playtest -- --scenario playtest/t13-year-rollover.mjs --out .playtest/t13-phase5
 */

/** `SaveLoadScene`'s column geometry — same constants `t13-slot-board.mjs`
 * documents. Life 1 is the left column. */
const COL1_X = 565;
const COL_Y = 543;
/** Resume (filled) / Begin (naming) share the left action slot of a column. */
const COL1_PRIMARY_X = 481;
const ACTION_Y = 716;

/**
 * `render/YearRollover.ts`'s own layout, in the two numbers a click needs.
 * PANEL_TOP 874 + 60 puts the button row's TOP edge at 934; the pills are ~44
 * tall, so 956 is inside either of them. The x's are asserted against the live
 * hit areas below before the first click that depends on them.
 */
const ROLLOVER_BUTTON_Y = 956;
const CONTINUE_X = 1030;
const MAIN_MENU_X = 1490;

const DISCOVERY_RE = /^You found \d+ of \d+ spells, collected \d+ of \d+ items, and reached \d+ of \d+ endings\. There is still more to discover!$/;

/** Every Text on a scene, walked out of nested containers — a flat
 * `children.list` scan misses everything `FestivalResults`/`YearRollover` draw,
 * because both own one container. */
const textsOf = (key) => `(() => {
  const s = game.scene.getScene(${JSON.stringify(key)});
  if (!s || !s.scene.isActive()) return null;
  const out = [];
  const walk = (list) => list.forEach((o) => {
    if (o.type === "Text") out.push(o.text);
    if (o.list) walk(o.list);
  });
  walk(s.children.list);
  return out;
})()`;

/** Is (x, y) inside a live, interactive object at depth >= `minDepth`? Proves a
 * hardcoded click coordinate still lands on a button before it is clicked. */
const hitAt = (x, y, minDepth) => `(() => {
  const s = game.scene.getScene("CollectScene");
  let hit = false;
  const walk = (list, depth) => list.forEach((o) => {
    const d = o.depth ?? depth;
    if (o.input && o.input.hitArea && d >= ${minDepth}) {
      const a = o.input.hitArea;
      const ox = o.x ?? 0, oy = o.y ?? 0;
      if (${x} >= ox + a.x && ${x} <= ox + a.x + a.width && ${y} >= oy + a.y && ${y} <= oy + a.y + a.height) hit = true;
    }
    if (o.list) walk(o.list, d);
  });
  walk(s.children.list, 0);
  return hit;
})()`;

/** Take the first day-start thumbnail if the pick is up. See t13-slot-board. */
const TAKE_A_START = `(() => {
  const ls = game.scene.getScene("LocationSelectScene");
  if (!ls || !ls.scene.isActive()) return "the day-start pick was skipped — already in play";
  let hit = null;
  ls.children.list.forEach((o) => { if (!hit && o.type === "Rectangle" && o.input && o.depth === 4) hit = o; });
  if (!hit) return false;
  hit.emit("pointerdown");
  return "picked the first start";
})()`;

/** Everything that has to survive the year boundary, in one read. */
const LIFE_STATE = `(() => {
  const s = game.scene.getScene("CollectScene");
  const p = window.__collect.snapshot();
  const v = s.ink.view();
  return {
    spellbook: p.spellbook,
    everHeld: window.__collect.discoveredIds().slice().sort(),
    banked: [...v.banked].sort(),
    bondBands: v.bondBands,
    decor: localStorage.getItem("phaser-probe/decor/v1"),
  };
})()`;

const CLOCK = `(() => {
  const s = game.scene.getScene("CollectScene");
  const p = window.__collect.snapshot();
  return { year: s.ink.view().year, day: p.day, timeBlock: p.timeBlock, movesLeft: p.movesLeft, ended: p.ended };
})()`;

const savedAt = (slot) => `(() => {
  const raw = localStorage.getItem("phaser-probe/save/v1/${slot}");
  if (!raw) return "nothing at ${slot}";
  const s = JSON.parse(raw);
  return { year: s.clockDisplay.year, day: s.clockDisplay.day, screen: s.position.screenId, tiers: s.slices.discovery.tiersReached };
})()`;

/** One real in-story move — the event mode5 autosaves on. */
const MOVE_ONCE = `(() => {
  const p = window.__collect;
  const move = p.snapshot().choices.find((c) => c.kind === "move");
  if (!move) return "this screen offers no move";
  p.choose(move.index);
  return true;
})()`;

/**
 * THE RELOAD. `PreloadScene.create()` builds a BRAND NEW `InkBridge` (and a new
 * `MagicDB`) every time it runs, so restarting it is the same condition a
 * browser reload puts the game in for everything this step is about: the story
 * that was parked at `final_screen` is GONE, and whatever comes back has to
 * come back out of `localStorage`.
 *
 * That distinction is the whole point. Re-entering the board with the SAME
 * bridge (what `t13-slot-board.mjs` does, correctly, for what it tests) would
 * make "you are still on the rollover" true for free — ink never moved. Here it
 * has to be reconstructed from the save.
 *
 * The harness has no page-reload action and holds one `canvas` element handle,
 * so a real `location.reload()` would strand every screenshot after it. Started
 * from the play scene's own `ScenePlugin`, not the SceneManager, for the reason
 * `t13-slot-board.mjs` documents: `game.scene.start` leaves CollectScene
 * running underneath and costs the later shots their backdrop.
 */
const RELOAD = `(() => {
  const s = game.scene.getScene("CollectScene");
  s.scene.start("PreloadScene", { run: s.run, mode: "mode5" });
  return true;
})()`;

const type = (word) => [...word].map((ch) => ({ name: `key "${ch}"`, action: "press", key: ch }));

/** The greedy week-walker, verbatim in intent from `festival-night-t9.mjs`. */
const WALK_THE_WEEK = `(() => {
  const GOAL_SOULS = ["toby", "mara", "ilsa"];
  const MAX_ITERS = 900;
  let iterations = 0, lastKey = null, stagnant = 0;
  while (iterations++ < MAX_ITERS) {
    const s = window.__collect.snapshot();
    if (s.screen === "FS" || s.drawnScreen === "FS") break;
    if (s.ended) break;
    if (s.canContinue) { window.__collect.advance(); continue; }
    const choices = s.choices || [];
    if (!choices.length) break;
    try {
      for (const w of (window.__collect.cast() || [])) {
        const soul = typeof w === "string" ? w : w.soul;
        if (soul) window.__collect.openNpcSpells(soul);
      }
    } catch (e) { /* a screen with nobody on it */ }
    const key = s.day + "|" + s.timeBlock + "|" + s.movesLeft + "|" + s.screen + "|" + choices.map((c) => c.display).join(",");
    if (key === lastKey) { if (++stagnant > 20) break; } else stagnant = 0;
    lastKey = key;
    let chosenIdx = -1, talkedSoul = null;
    for (const soul of GOAL_SOULS) {
      const idx = choices.findIndex((c) => c.kind !== "move" && /^\\[Talk to /i.test(c.display) && c.display.toLowerCase().includes(soul));
      if (idx >= 0) { chosenIdx = idx; talkedSoul = soul; break; }
    }
    if (chosenIdx < 0) {
      const idx = choices.findIndex((c) => c.kind !== "move" && /^\\[Talk to /i.test(c.display));
      if (idx >= 0) {
        chosenIdx = idx;
        const m = choices[idx].display.match(/^\\[Talk to ([^\\s(]+)/i);
        talkedSoul = m ? m[1].toLowerCase() : null;
      }
    }
    if (talkedSoul) { try { window.__collect.openNpcSpells(talkedSoul); } catch (e) {} }
    if (chosenIdx < 0) {
      const moveIdxs = [];
      choices.forEach((c, i) => { if (c.kind === "move" && !/^\\[Wait\\]$/i.test(c.display)) moveIdxs.push(i); });
      if (moveIdxs.length) chosenIdx = moveIdxs[Math.floor(Math.random() * moveIdxs.length)];
    }
    if (chosenIdx < 0) chosenIdx = choices.findIndex((c) => c.kind === "move");
    if (chosenIdx < 0) chosenIdx = 0;
    window.__collect.choose(choices[chosenIdx].index);
  }
  window.__rolloverIterations = iterations;
  return true;
})()`;

/** The walker's last `openNpcSpells` leaves a modal over the panels. */
const CLOSE_MODAL = `(() => {
  const sc = game.scene.getScene("CollectScene");
  if (sc.modalSys && typeof sc.modalSys.clearModal === "function") sc.modalSys.clearModal();
  return true;
})()`;

export default [
  { name: "boot settles onto the lives board", action: "wait", ms: 4500 },
  { name: "begin a life in column 1", action: "click", x: COL1_X, y: COL_Y },
  { name: "the name field opens", action: "wait", ms: 700 },
  ...type("Ash"),
  { name: "Enter begins the life", action: "press", key: "Enter" },
  { name: "leave the board", action: "wait", ms: 3000 },
  { name: "take a day start if the pick is up", action: "expect", expect: { expression: TAKE_A_START } },
  { name: "let play come up", action: "wait", ms: 4000 },
  {
    name: "playing mode5-1 as Ash",
    action: "expect",
    expect: {
      expression: `(() => { const s = game.scene.getScene("CollectScene"); return { slot: s.saveSlot, name: s.playerName }; })()`,
      equals: { slot: "mode5-1", name: "Ash" },
    },
  },

  // -----------------------------------------------------------------------
  // The week.
  // -----------------------------------------------------------------------
  { name: "walk the week to festival night, talking to every soul on the way", action: "expect", expect: { expression: WALK_THE_WEEK, equals: true } },
  { name: "close the leftover NPC modal", action: "expect", expect: { expression: CLOSE_MODAL, equals: true } },
  { name: "let the final render settle", action: "wait", ms: 1200 },
  {
    name: "the walker reached the Final Screen and the story is PARKED there (-> END)",
    action: "expect",
    expect: {
      expression: `(() => { const p = window.__collect.snapshot(); return { screen: p.drawnScreen, ended: p.ended, day: p.day }; })()`,
      equals: { screen: "FS", ended: true, day: 5 },
    },
  },
  {
    name: "the discovery summary is on screen, in the ruled sentence, under the results panel",
    action: "expect",
    expect: {
      expression: `(() => {
        const t = ${textsOf("CollectScene")};
        const line = t.find((x) => ${DISCOVERY_RE}.test(x));
        return {
          line: line ?? t.join(" | "),
          resultsStillDrawn: t.includes("WHAT THE WEEK CAME TO"),
          buttons: [t.includes("Continue your exploration in the next year"), t.includes("Return to main menu")],
        };
      })()`,
    },
  },
  {
    name: "…and it really is that sentence, not something near it",
    action: "expect",
    expect: {
      expression: `${DISCOVERY_RE}.test((${textsOf("CollectScene")}).find((x) => x.startsWith("You found ")) ?? "")`,
      equals: true,
    },
  },
  {
    name: "both rollover buttons are live hit areas at the coordinates this scenario clicks",
    action: "expect",
    expect: {
      expression: `({ continue: ${hitAt(CONTINUE_X, ROLLOVER_BUTTON_Y, 160)}, mainMenu: ${hitAt(MAIN_MENU_X, ROLLOVER_BUTTON_Y, 160)} })`,
      equals: { continue: true, mainMenu: true },
    },
  },
  { name: "THE ROLLOVER — results above, discovery summary and two choices below", action: "screenshot" },
  {
    name: "the slot on disk, at the rollover",
    action: "expect",
    expect: { expression: savedAt("mode5-1") },
  },
  {
    name: "…parked on FS in year 1 day 5, with the ending ALREADY RECORDED — the arrival autosave fires one continueOnce too early to carry it, so a first-time ending saves itself",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = JSON.parse(localStorage.getItem("phaser-probe/save/v1/mode5-1"));
        return { screen: s.position.screenId, year: s.clockDisplay.year, day: s.clockDisplay.day, endings: s.slices.discovery.tiersReached.length };
      })()`,
      equals: { screen: "FS", year: 1, day: 5, endings: 1 },
    },
  },
  { name: "capture the life, to compare across the boundary", action: "expect", expect: { expression: `(window.__before = ${LIFE_STATE})` } },

  // -----------------------------------------------------------------------
  // THE RULED EXPLICIT ROLLOVER: save at final_screen, reload, land back HERE.
  // -----------------------------------------------------------------------
  { name: "RELOAD — a brand new story, from PreloadScene", action: "expect", expect: { expression: RELOAD, equals: true } },
  { name: "let the board draw", action: "wait", ms: 4500 },
  { name: "Resume life 1", action: "click", x: COL1_PRIMARY_X, y: ACTION_Y },
  { name: "let CollectScene restore", action: "wait", ms: 5000 },
  {
    name: "THE RULING HELD: the reload landed BACK ON THE ROLLOVER — year 1, day 5, festival night, story still parked — not auto-advanced past it",
    action: "expect",
    expect: {
      // `movesLeft` is deliberately not pinned here: the final sequence reaches
      // FS through `hub_final`, which sets `night` without a fresh budget, so
      // whatever it holds at that point is ink's business, not this ruling's.
      expression: `(() => { const c = ${CLOCK}; return { year: c.year, day: c.day, timeBlock: c.timeBlock, ended: c.ended, screen: window.__collect.snapshot().drawnScreen }; })()`,
      equals: { year: 1, day: 5, timeBlock: "night", ended: true, screen: "FS" },
    },
  },
  {
    name: "and the panels are redrawn from the restored state, sentence and all",
    action: "expect",
    expect: {
      expression: `(() => {
        const t = ${textsOf("CollectScene")};
        return {
          summary: ${DISCOVERY_RE}.test(t.find((x) => x.startsWith("You found ")) ?? ""),
          results: t.includes("WHAT THE WEEK CAME TO"),
          canContinue: t.includes("Continue your exploration in the next year"),
        };
      })()`,
      equals: { summary: true, results: true, canContinue: true },
    },
  },
  { name: "BACK ON THE ROLLOVER AFTER A RELOAD", action: "screenshot" },

  // -----------------------------------------------------------------------
  // Continue — one host divert, and the life carries over.
  // -----------------------------------------------------------------------
  { name: "capture the restored life", action: "expect", expect: { expression: `(window.__before = ${LIFE_STATE})` } },
  {
    name: "the Continue button is a live hit area after the restore too",
    action: "expect",
    expect: { expression: hitAt(CONTINUE_X, ROLLOVER_BUTTON_Y, 160), equals: true },
  },
  { name: "press Continue", action: "click", x: CONTINUE_X, y: ROLLOVER_BUTTON_Y },
  { name: "let the divert land and the panels clear", action: "wait", ms: 1500 },
  {
    name: "YEAR 2, DAY 1, MORNING, FULL MOVE BUDGET — and the story is running again, not ended",
    action: "expect",
    expect: { expression: CLOCK, equals: { year: 2, day: 1, timeBlock: "morning", movesLeft: 3, ended: false } },
  },
  {
    name: "both final-screen panels are gone — the divert prints no #screen: tag, so this is what `ended` is guarding",
    action: "expect",
    expect: {
      expression: `(() => {
        const t = ${textsOf("CollectScene")};
        return { summary: t.some((x) => x.startsWith("You found ")), results: t.includes("WHAT THE WEEK CAME TO") };
      })()`,
      equals: { summary: false, results: false },
    },
  },
  {
    name: "INVENTORY, KNOWLEDGE, DECOR AND BONDS ALL INTACT across the boundary",
    action: "expect",
    expect: { expression: `JSON.stringify(${LIFE_STATE}) === JSON.stringify(window.__before)`, equals: true },
  },
  { name: "what carried over, for the record", action: "expect", expect: { expression: `window.__before` } },
  { name: "the new year's opening choices are offered", action: "expect", expect: { expression: `window.__collect.snapshot().choices.map((c) => c.display)` } },
  { name: "YEAR 2 DAY 1 MORNING, after Continue", action: "screenshot" },

  // -----------------------------------------------------------------------
  // The boundary reaches disk through the ordinary autosave, not a special case.
  // -----------------------------------------------------------------------
  { name: "one real move — the event mode5 autosaves on", action: "expect", expect: { expression: MOVE_ONCE, equals: true } },
  { name: "let the autosave land", action: "wait", ms: 1500 },
  {
    name: "the slot now holds YEAR 2 DAY 1, written by the ordinary screen:changed autosave — no save call of the rollover's own",
    action: "expect",
    expect: {
      expression: `(() => {
        const s = JSON.parse(localStorage.getItem("phaser-probe/save/v1/mode5-1"));
        return { year: s.clockDisplay.year, day: s.clockDisplay.day, endings: s.slices.discovery.tiersReached.length };
      })()`,
      equals: { year: 2, day: 1, endings: 1 },
    },
  },
  { name: "year 2 underway", action: "screenshot" },
];
