/**
 * locselect-redesign.mjs — visual check for the redesigned `LocationSelectScene`.
 *
 * A fresh mode5 context boots PreloadScene → SaveLoadScene (passthrough) →
 * LocationSelectScene, the day-1 start. This screenshots that screen: the
 * calendar-style five-day layout with the two map-thumbnail starts (Town
 * Square / Forager's Clearing) inside day 1, and "Festival Night" on day 5.
 * Diagnostic only — for eyeballing the redesign against CalendarScene.
 */
export default [
  { name: "let the boot chain settle onto LocationSelectScene", action: "wait", ms: 1200 },
  {
    name: "LocationSelectScene is active",
    action: "expect",
    expect: { expression: `game.scene.isActive("LocationSelectScene")`, equals: true },
  },
  { name: "let popIn entrances finish", action: "wait", ms: 600 },
  { name: "location-select redesign", action: "screenshot" },
];
