/**
 * t6f-font-consistency.mjs — T6f verification (Roc's Group 2 notes: "font
 * consistency pass").
 *
 * The rule now lives in one place, `ui/theme.ts`'s `FONT` block:
 *   - controls you click (utility pills, on-canvas buttons, tabs, chips) -> mono,
 *     except §14 §4.1's primary/choice pill, which is narrative text -> display;
 *   - otherwise by content: names/titles/sentences -> display, counts/eyebrows/
 *     short labels/HUD data -> mono.
 *
 * Verified against the real display list (containers walked, not source
 * grepped) on the three screens the sweep actually moved — the day-start
 * calendar, a live CollectScene, and the notebook's leather book — with a
 * screenshot of each so the change is looked at, not just asserted.
 */

// Collects every Text in a scene, containers included, as {text, font}.
const AUDIT = `(() => {
  window.__fonts = (key) => {
    const scene = game.scene.getScene(key);
    const out = [];
    const walk = (n) => {
      if (n.type === "Text" && typeof n.text === "string" && n.text.trim()) {
        out.push({ text: n.text, font: n.style.fontFamily });
      }
      if (n.type === "Container") n.each(walk);
    };
    scene.children.each(walk);
    return out;
  };
  window.__fontOf = (key, needle) => {
    const hit = window.__fonts(key).find((t) => t.text.includes(needle));
    return hit ? hit.font : null;
  };
  // Every Text on a scene split into the two families, so a stray third
  // family (or a hand-rolled stack) shows up as a leftover.
  window.__split = (key) => {
    const all = window.__fonts(key);
    return {
      serif: all.filter((t) => t.font === "Georgia, serif").map((t) => t.text),
      mono: all.filter((t) => t.font === "monospace").map((t) => t.text),
      other: all.filter((t) => t.font !== "Georgia, serif" && t.font !== "monospace").map((t) => t.font),
    };
  };
  return true;
})()`;

export default [
  { name: "day-start calendar up", action: "wait", ms: 4000 },
  { name: "install the display-list font audit", action: "expect", expect: { expression: AUDIT, equals: true } },
  {
    name: "calendar: board title and its sentence subtitle are BOTH display (subtitle was mono)",
    action: "expect",
    expect: {
      expression: `(() => {
        const key = game.scene.isActive("LocationSelectScene") ? "LocationSelectScene" : "CalendarScene";
        return {
          title: window.__fontOf(key, "THE WEEK"),
          subtitle: window.__fontOf(key, "pick where the day begins"),
          dayCardTab: window.__fontOf(key, "TODAY"),
        };
      })()`,
      equals: { title: "Georgia, serif", subtitle: "Georgia, serif", dayCardTab: "monospace" },
    },
  },
  { name: "calendar — title and subtitle in one family, TODAY tab in the other", action: "screenshot" },

  { name: "pick the day's first start location", action: "click", x: 172, y: 460 },
  { name: "CollectScene ready", action: "wait", ms: 3000 },
  {
    name: "a screen is drawn",
    action: "expect",
    expect: { expression: `typeof window.__collect.snapshot().drawnScreen === "string"`, equals: true },
  },
  {
    name: "CollectScene: every Text lands on the side of the rule it belongs on",
    action: "expect",
    expect: {
      expression: `window.__split("CollectScene")`,
      // MOVED WHOLESALE BY T14 (2026-08-24), and every move is the font rule
      // in `ui/theme.ts` applied to a control that changed shape, not a
      // reclassification:
      //   · "Go to X" / "End the day" pills retired (§1/§1b). The exits are
      //     dashed regions now and their labels are the DESTINATION NAME —
      //     still a name, still serif, so they simply read "The Stream →".
      //     "End the day" became the bar's mono utility pill "End day · E"
      //     (§14 rule 1: a control the player clicks to act is mono).
      //   · "Decorate" is gone — §4 ruled the persistent caption cut.
      //   · S/N/H/L/W are the new in-tile hotkey letters (§1) — short chrome
      //     labels, mono, same family as the "E"/"U" dev-pill keys already here.
      //   · "Edit" keeps its dev pill; only its key caption moved to Shift+E.
      equals: {
        // Sentences, destination names and an NPC nameplate.
        serif: [
          "The Stream →",
          "← The Grove",
          "Town Square →",
          "something's out there",
          "Look at trail signs",
          "Bex",
        ],
        // HUD data, bar controls and their hotkey letters.
        mono: [
          "Satchel 0/6",
          "Day 1 · Morning · Forager's Clearing",
          "S",
          "N",
          "H",
          "L",
          "W",
          "End day · E",
          "Edit",
          "Shift+E",
          "Dev Unlock",
          "U",
        ],
        other: [],
      },
    },
  },
  { name: "CollectScene — prose serif, chrome mono", action: "screenshot" },

  { name: "open the Notebook (N)", action: "key", key: "N" },
  { name: "let the book render", action: "wait", ms: 1200 },
  {
    name: "notebook: title + sentence subtitle display; tabs, close hint, chips and the cast button mono",
    action: "expect",
    expect: {
      expression: `({
        title: window.__fontOf("NotebookScene", "NOTEBOOK"),
        subtitle: window.__fontOf("NotebookScene", "referenced at any time"),
        tab: window.__fontOf("NotebookScene", "Knowledge"),
        closeHint: window.__fontOf("NotebookScene", "to close"),
        spellPhrase: window.__fontOf("NotebookScene", "learned"),
      })`,
      equals: {
        title: "Georgia, serif",
        subtitle: "Georgia, serif",
        tab: "monospace",
        closeHint: "monospace",
        spellPhrase: "monospace",
      },
    },
  },
  {
    name: "nothing in the notebook is left on a third family",
    action: "expect",
    expect: { expression: `window.__split("NotebookScene").other`, equals: [] },
  },
  { name: "notebook — title/subtitle serif, tabs and counts mono", action: "screenshot" },
];
