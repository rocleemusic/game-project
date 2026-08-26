/**
 * calendar.mjs — visual check for the redesigned, read-only `CalendarScene`.
 *
 * There is no in-game route to the calendar that a headless run can reach
 * cheaply (it opens on `L` deep inside CollectScene). So this boots the real
 * chain only as far as `LocationSelectScene` — which is enough to guarantee
 * PreloadScene has cached every `bg:<screenId>` backdrop AND `ui:card-frame` —
 * then seeds `DayPicks` with three days of history and starts `CalendarScene`
 * DIRECTLY with a stub `PlayView` (day 3, 2 moves left). No source boot hook,
 * no fragile canvas click: the scene is a pure VIEW over `{ view, onClose }`,
 * so a stub view is all it needs.
 *
 * The shot should show: five light gold-framed parchment panels; dark-ink
 * `day N` labels; NO time-of-day blocks; past days 1 & 2 carrying their
 * chosen-location thumbnails; day 3 emphasized (bloom + double rim + TODAY tab)
 * with its current-location thumbnail and "2 moves left"; day 5 "Festival
 * Night". Diagnostic only — for eyeballing coherence with LocationSelectScene.
 */
export default [
  { name: "let the boot chain settle onto LocationSelectScene", action: "wait", ms: 1400 },
  {
    name: "LocationSelectScene active — all bg textures + card-frame now cached",
    action: "expect",
    expect: { expression: `game.scene.isActive("LocationSelectScene")`, equals: true },
  },
  {
    name: "seed DayPicks history and start CalendarScene on day 3 with a stub view",
    action: "expect",
    expect: {
      expression: `(() => {
        try {
          localStorage.setItem(
            "phaser-probe/day-picks/v1",
            JSON.stringify({ 1: "T1", 2: "F1", 3: "T1" }),
          );
        } catch (e) {}
        game.scene.stop("LocationSelectScene");
        game.scene.start("CalendarScene", { view: { day: 3, movesLeft: 2 }, onClose: () => {} });
        return true;
      })()`,
      equals: true,
    },
  },
  { name: "let CalendarScene render and popIn entrances finish", action: "wait", ms: 900 },
  {
    name: "CalendarScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("CalendarScene")`, equals: true },
  },
  { name: "calendar-redesign", action: "screenshot" },
];
