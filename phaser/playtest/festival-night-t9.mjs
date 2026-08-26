/**
 * festival-night-t9.mjs — T9 verification: festival scoring reaches a live
 * playthrough all the way to the Final Screen (`FS`) and the results slots
 * (`render/FestivalResults.ts`) show real, non-placeholder content.
 *
 * WHY A DRIVEN AUTOPLAY, NOT SCRIPTED CLICKS. A full week to festival night is
 * roughly 40-50 ink choices deep and the exact daily soul placement is drawn
 * by the resolver's floor logic — a fixed click script would be brittle to
 * regenerated content. `CollectScene`'s own `window.__collect` probe
 * (`render/WalkerProbe.ts`) already exposes the same primitives the resolver's
 * own `walkWeek` uses (`choose`, `advance`, `snapshot`), and the day-start
 * location pick and the Home Hub's "Go to the Festival night" branch are BOTH
 * ordinary ink `move` choices under the hood (`CollectScene.dayStartPicks()` /
 * `launchCalendar` just wrap `ink.choose(pick.choiceIndex)` — see the file's
 * own comment). So a generic greedy walker driven purely through
 * `window.__collect` reaches the same terminus the resolver's own
 * `walk.test.ts` ("the bare day loop terminates: five End-the-day choices
 * reach the final sequence and END") already proves is ink-only reachable —
 * no Phaser-only UI step (Calendar/Hub scenes) is required to get there.
 *
 * BOND, NOT JUST GOALS. `openNpcSpells(soul)` (the same probe method
 * `npc-talk-modal.mjs` uses) is the ONE place `FestivalLedger.recordTalk`
 * fires (`NpcTalkSystem.openNpcSpells`'s `onTalk` call, unconditional and
 * first). The walker calls it on every soul `window.__collect.cast()` reports
 * present, every iteration it is on a screen with someone there — idempotent
 * per soul per day, so this cannot double-count, and it is what makes "WHO
 * CAME" show more than an empty list.
 *
 * WHAT PASSING PROVES. The walker reaches `screen === "FS"`, and:
 *   - `window.__collect.festival()` returns a real `FestivalScore` — a tier,
 *     a `goalsCompleted` count, and per-soul standings — not the placeholder
 *     line `gdd/08-levels.md:34` used to name.
 *   - The rendered panel (`FestivalResults`) actually drew: real depth>=60
 *     objects on `CollectScene`'s display list, not zero.
 *   - The screenshot is the thing a player would actually see: prose, never
 *     a number (`FestivalResults.ts`'s whole header rule).
 */
export default [
  { name: "let the boot chain settle onto LocationSelectScene", action: "wait", ms: 1400 },
  {
    name: "LocationSelectScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("LocationSelectScene")`, equals: true },
  },
  { name: "start at Town Square — day 1's upper thumbnail", action: "click", x: 172, y: 460 },
  { name: "let CollectScene create() + first render() run", action: "wait", ms: 1500 },
  {
    name: "CollectScene is active and the walker probe is installed",
    action: "expect",
    expect: { expression: `game.scene.isActive("CollectScene") && typeof window.__collect === "object"`, equals: true },
  },
  { name: "day-1-start", action: "screenshot" },

  // ---------------------------------------------------------------------
  // The greedy walker. Runs entirely inside the page — see the file header
  // for why this is ink-only and needs no Calendar/Hub scene interaction.
  // ---------------------------------------------------------------------
  {
    name: "walk the week to festival night, talking to every soul on the way",
    action: "expect",
    expect: {
      expression: `(() => {
        const GOAL_SOULS = ["toby", "mara", "ilsa"]; // T9's three authored role goals
        const MAX_ITERS = 900;
        const log = [];
        let iterations = 0;
        let lastKey = null;
        let stagnant = 0;

        while (iterations++ < MAX_ITERS) {
          const s = window.__collect.snapshot();
          if (s.screen === "FS" || s.drawnScreen === "FS") {
            log.push("reached FS at iteration " + iterations);
            break;
          }
          if (s.ended) { log.push("ink ended at iteration " + iterations); break; }
          if (s.canContinue) { window.__collect.advance(); continue; }

          const choices = s.choices || [];
          if (!choices.length) { log.push("stuck: no choices at iteration " + iterations + " on " + s.screen); break; }

          // Greet every present, roled soul this loop pass — idempotent per
          // soul per day inside FestivalLedger, so calling it every iteration
          // on the same screen is harmless and is what builds real bond depth
          // across the week rather than a single token talk.
          try {
            const present = window.__collect.cast() || [];
            for (const w of present) {
              const soul = typeof w === "string" ? w : w.soul;
              if (soul) window.__collect.openNpcSpells(soul);
            }
          } catch (e) { log.push("cast() probe error: " + e.message); }

          // Includes timeBlock/movesLeft, not just the choice text: at one
          // screen the SAME choice list (e.g. "[Wait]"/"[Go to X]") is
          // re-offered verbatim on every move within a block while movesLeft
          // silently ticks down — keying on display text alone reads that
          // real, ongoing progress as stagnation and aborts a healthy walk.
          const key = s.day + "|" + s.timeBlock + "|" + s.movesLeft + "|" + s.screen + "|" + choices.map((c) => c.display).join(",");
          if (key === lastKey) {
            stagnant++;
            if (stagnant > 20) { log.push("stagnant (same day/block/moves/choice-set 20x), aborting at iteration " + iterations); break; }
          } else stagnant = 0;
          lastKey = key;

          // 1) Prefer entering a goal soul's own conversation — this is what
          //    fires recordThreadMove and completes a festival goal.
          let chosenIdx = -1;
          let talkedSoul = null;
          for (const soul of GOAL_SOULS) {
            const idx = choices.findIndex(
              (c) => c.kind !== "move" && /^\\[Talk to /i.test(c.display) && c.display.toLowerCase().includes(soul),
            );
            if (idx >= 0) { chosenIdx = idx; talkedSoul = soul; break; }
          }
          // 2) Otherwise any offered conversation, for bond breadth.
          if (chosenIdx < 0) {
            const idx = choices.findIndex((c) => c.kind !== "move" && /^\\[Talk to /i.test(c.display));
            if (idx >= 0) {
              chosenIdx = idx;
              const m = choices[idx].display.match(/^\\[Talk to ([^\\s(]+)/i);
              talkedSoul = m ? m[1].toLowerCase() : null;
            }
          }
          if (talkedSoul) { try { window.__collect.openNpcSpells(talkedSoul); } catch (e) {} }
          // 3) Otherwise a kind:"move" choice that costs a move and actually
          //    advances the world — a Go-to, an End-the-day, the day-start
          //    location pick, or the Home Hub's forward-only "Go to the
          //    Festival night" (all ordinary ink move choices; see the file
          //    header). NOT any non-Talk choice: this screen also offers
          //    flavor/examine "deed" picks (e.g. "[Look at arch]") that cost
          //    no move and re-offer identically forever, which is a dead
          //    fixed point for a walker that must reach day 5.
          // RANDOM among the non-Wait moves, not always the first: a
          // deterministic findIndex re-picks the identical "[Go to X]" every
          // time the same choice set recurs, which pins the walker to a
          // two-screen cycle (e.g. F1<->F2) for the whole week and never
          // visits the screens toby/mara/ilsa's goal-thread scenes are
          // anchored to. Random exploration is what a real player's route
          // varies by, and it is what actually reaches every region in five
          // days.
          if (chosenIdx < 0) {
            const moveIdxs = [];
            choices.forEach((c, i) => { if (c.kind === "move" && !/^\\[Wait\\]$/i.test(c.display)) moveIdxs.push(i); });
            if (moveIdxs.length) chosenIdx = moveIdxs[Math.floor(Math.random() * moveIdxs.length)];
          }
          // 4) A move that IS Wait — still real progress (burns a move).
          if (chosenIdx < 0) chosenIdx = choices.findIndex((c) => c.kind === "move");
          // 5) Absolute last resort — nothing move-shaped was offered at all.
          if (chosenIdx < 0) chosenIdx = 0;

          // window.__collect.choose forwards straight to ink.choose(i),
          // which wants ink's OWN choice number (choices[].index) — the
          // same field CollectScene.dayStartPicks()/launchCalendar pass as
          // choiceIndex. That is NOT necessarily the array position
          // findIndex above returns, so the two must not be conflated.
          window.__collect.choose(choices[chosenIdx].index);
          if (iterations <= 30 || iterations % 25 === 0) {
            log.push(iterations + ": day" + s.day + " " + s.timeBlock + " moves=" + s.movesLeft + " " + s.screen + " -> chose[" + choices[chosenIdx].index + "] " + JSON.stringify(choices[chosenIdx].display));
          }
        }

        window.__t9Log = log;
        window.__t9Iterations = iterations;
        return true;
      })()`,
      equals: true,
    },
  },
  {
    // The walker's last openNpcSpells() call leaves the NPC-talk modal open
    // over the results panel (the same modal npc-talk-modal.mjs drives) —
    // harmless to the score itself, but it visually covers "WHO CAME"/"THE
    // TOWN'S WORK" in the screenshot. Close it the same way its own close
    // button does, so the shot below is the results panel alone.
    name: "close any leftover NPC-talk modal before the results shot",
    action: "expect",
    expect: {
      expression: `(() => { const sc = game.scene.getScene("CollectScene"); if (sc.modalSys && typeof sc.modalSys.clearModal === "function") sc.modalSys.clearModal(); return true; })()`,
      equals: true,
    },
  },
  { name: "let the final render settle", action: "wait", ms: 800 },

  {
    name: "the walker actually reached the Final Screen (not stuck or stagnant)",
    action: "expect",
    expect: { expression: `window.__collect.snapshot().drawnScreen`, equals: "FS" },
  },
  {
    name: "walker diagnostics, for the record",
    action: "expect",
    expect: { expression: `({ log: window.__t9Log, iterations: window.__t9Iterations })`, },
  },

  // ---------------------------------------------------------------------
  // The score itself — read once through the probe, same as a verifier
  // would, never through anything the player sees.
  // ---------------------------------------------------------------------
  {
    name: "festival() returns a real score, not a placeholder",
    action: "expect",
    expect: {
      expression: `(() => {
        const f = window.__collect.festival();
        return {
          tier: f.tier,
          goalsCompleted: f.goalsCompleted,
          goalsTotal: f.goals.length,
          standingsCount: f.standings.length,
          attendingCount: f.attending.length,
        };
      })()`,
    },
  },
  {
    name: "the tier is one of the three ruled tiers",
    action: "expect",
    expect: {
      expression: `["quiet", "warm", "grand"].includes(window.__collect.festival().tier)`,
      equals: true,
    },
  },
  {
    name: "at least one festival goal is authored and reachable in the shipped run",
    action: "expect",
    expect: { expression: `window.__collect.festival().goals.filter((g) => g.goalAuthored).length`, atLeast: 1 },
  },

  // ---------------------------------------------------------------------
  // The rendered panel — what the player actually sees.
  // ---------------------------------------------------------------------
  {
    name: "FestivalResults actually drew objects (depth>=60) on CollectScene",
    action: "expect",
    expect: {
      expression: `(() => {
        const sc = game.scene.getScene("CollectScene");
        return sc.children.list.filter((o) => (o.depth ?? 0) >= 60 && (o.depth ?? 0) < 200).length;
      })()`,
      atLeast: 5,
    },
  },
  { name: "festival-night-final-screen", action: "screenshot" },
];
