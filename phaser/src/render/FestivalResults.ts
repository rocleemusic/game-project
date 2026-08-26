/**
 * The Final Screen's results panel — what the week came to.
 *
 * This is the thing that used to be a placeholder. Until 2026-08-24 the `FS`
 * screen printed one authored line reading "Placeholder: festival summary and
 * results — festival tier, bonds, threads (wired once role_goals_advanced
 * compiles)" and nothing else; `gdd/08-levels.md:34` named the same three slots
 * as placeholders. `world/FestivalScore.ts` is now the arithmetic and this file
 * is the only place it reaches a player.
 *
 * ---------------------------------------------------------------------------
 * NEVER A SCORE SHOWN — the rule that shapes every line below
 * ---------------------------------------------------------------------------
 *
 * `gdd/03-core-loop.md`: success is "measured as depth of connection reached
 * ..., never a score shown". So no count, total, percentage, tier NUMBER or
 * star rating appears anywhere in this panel, and there is deliberately no
 * code path that could produce one — nothing here is handed a number to
 * format. What the player reads instead is the festival ITSELF:
 *
 *   the TIER as the festival's own look   (the three descriptions the GDD and
 *                                          `00-world-bible.md` already author)
 *   the BONDS as who turned out           (names, and who stayed close)
 *   the GOALS as the town's finished work (each role's authored goal prose)
 *
 * The tier WORDS quiet/warm/grand are not printed either. They are the design
 * doc's names for three lighting states, not in-fiction labels, and printing
 * one would turn the spectrum back into a grade. `TIER_PROSE` below is the
 * only rendering of the tier that exists.
 *
 * ---------------------------------------------------------------------------
 * DRAW DISCIPLINE
 * ---------------------------------------------------------------------------
 *
 * Owns exactly one container and destroys it on every `sync` that changes what
 * should be on screen. `CollectScene.render()` runs on every ink view, so a
 * panel that appended instead of replacing would stack a dozen copies of
 * itself by the time the player finished reading — the same compounding-scrim
 * failure documented in `PhaserDialogueRenderPort.ts`, in text form.
 */

import Phaser from "phaser";
import { COLOR, FONT, filigreeCorners } from "../ui/theme";
import type { FestivalScore, FestivalTier } from "../world/FestivalScore";

/**
 * The three tiers, as the festival LOOKS. Lifted from the tier spectrum in
 * `gdd/03-core-loop.md` ("Festival outcome & soft terminal states") rather
 * than newly invented here — that section is the authored description, and a
 * second paraphrase of it in code would drift from the doc silently.
 */
const TIER_PROSE: Record<FestivalTier, string> = {
  quiet:
    "A modest festival. A few souls in the square, the light low and warm, and a thin scatter of lanterns over it all.",
  warm: "The town turns out. The square fills, the lanterns are lit, and the lights gather and drift — shapes almost forming.",
  grand:
    "A radiant festival. The fullest turnout, the Lantern Arch at its brightest, and the display reaching full flood — the lights become the returned.",
};

/** The rare top state, appended to Grand. Parked-unless-cheap; this is cheap. */
const SOULS_OF_THE_WORLD_PROSE =
  "And past them, the souls of the world, in one tableau.";

const PANEL_W = 1420;
const PANEL_H = 700;
const PAD = 56;

/** Above the backdrop and hotspots, below the HUD bars and any modal. */
const DEPTH = 60;

export interface FestivalResultsDeps {
  readonly scene: Phaser.Scene;
  readonly viewWidth: number;
  readonly viewHeight: number;
}

export class FestivalResults {
  private layer: Phaser.GameObjects.Container | null = null;
  /** What is currently drawn, so an unchanged render is a no-op. */
  private drawnKey: string | null = null;

  constructor(private readonly deps: FestivalResultsDeps) {}

  /** `null` clears the panel — anywhere but the Final Screen. */
  sync(score: FestivalScore | null): void {
    const key = score ? this.keyOf(score) : null;
    if (key === this.drawnKey) return;
    this.clear();
    this.drawnKey = key;
    if (score) this.draw(score);
  }

  clear(): void {
    this.layer?.destroy(true);
    this.layer = null;
    this.drawnKey = null;
  }

  /**
   * Identity of a rendered panel. Includes the bond DEPTHS and the goal
   * completions rather than the raw counts — those are the only inputs that
   * change what is drawn, and keying on the counts would redraw the panel for
   * a change the player cannot see.
   */
  private keyOf(s: FestivalScore): string {
    const who = s.standings.map((x) => `${x.soulId}:${x.depth}`).join(",");
    const what = s.goals.map((g) => `${g.soulId}:${g.completed ? 1 : 0}`).join(",");
    return `${s.tier}|${s.soulsOfTheWorld ? "sotw" : "-"}|${who}|${what}`;
  }

  private draw(score: FestivalScore): void {
    const { scene, viewWidth: W, viewHeight: H } = this.deps;
    const cx = W / 2;
    const cy = H / 2 - 20;
    const left = cx - PANEL_W / 2 + PAD;
    const wrap = PANEL_W - PAD * 2;

    const layer = scene.add.container(0, 0).setDepth(DEPTH);
    this.layer = layer;

    layer.add(scene.add.rectangle(cx, cy, PANEL_W, PANEL_H, COLOR.panel, 0.94));
    const edge = scene.add.graphics();
    edge.lineStyle(2, COLOR.border, 0.8);
    edge.strokeRect(cx - PANEL_W / 2, cy - PANEL_H / 2, PANEL_W, PANEL_H);
    layer.add(edge);
    layer.add(filigreeCorners(scene, cx, cy, PANEL_W, PANEL_H));

    let y = cy - PANEL_H / 2 + PAD;

    layer.add(
      scene.add.text(left, y, "WHAT THE WEEK CAME TO", {
        fontFamily: FONT.mono,
        fontSize: "20px",
        color: COLOR.dim,
      }),
    );
    y += 44;

    // --- The tier, as the festival's own look ------------------------------
    const tierText = scene.add.text(
      left,
      y,
      score.soulsOfTheWorld
        ? `${TIER_PROSE[score.tier]} ${SOULS_OF_THE_WORLD_PROSE}`
        : TIER_PROSE[score.tier],
      {
        fontFamily: FONT.display,
        fontSize: "30px",
        color: COLOR.ink,
        wordWrap: { width: wrap },
        lineSpacing: 8,
      },
    );
    layer.add(tierText);
    y += tierText.height + 40;

    // --- Who turned out ----------------------------------------------------
    layer.add(
      scene.add.text(left, y, "WHO CAME", {
        fontFamily: FONT.mono,
        fontSize: "18px",
        color: COLOR.dim,
      }),
    );
    y += 32;

    const close = score.attending.filter((s) => s.depth === "close").map((s) => s.name);
    const present = score.attending.filter((s) => s.depth === "present").map((s) => s.name);
    const whoLines: string[] = [];
    if (close.length) {
      whoLines.push(
        `${listOf(close)} ${close.length === 1 ? "finds you" : "find you"} in the crowd — you have talked often enough that there is nothing to explain.`,
      );
    }
    if (present.length) {
      whoLines.push(`${listOf(present)} ${present.length === 1 ? "is" : "are"} here, and ${present.length === 1 ? "nods" : "nod"} across the square.`);
    }
    if (!whoLines.length) {
      whoLines.push("Nobody comes looking for you. The square is full of people you never spoke to.");
    }
    const whoText = scene.add.text(left, y, whoLines.join("\n"), {
      fontFamily: FONT.display,
      fontSize: "24px",
      color: close.length ? COLOR.ember : COLOR.ink,
      wordWrap: { width: wrap },
      lineSpacing: 6,
    });
    layer.add(whoText);
    y += whoText.height + 36;

    // --- The town's work ---------------------------------------------------
    layer.add(
      scene.add.text(left, y, "THE TOWN'S WORK", {
        fontFamily: FONT.mono,
        fontSize: "18px",
        color: COLOR.dim,
      }),
    );
    y += 32;

    // Only goals with authored content are listed. An unauthored role goal is
    // a CONTENT gap, not an unfinished job (`FestivalScore.goalAuthored`), and
    // showing it as "left undone" would blame the player for a hole in the
    // pipeline.
    const listed = score.goals.filter((g) => g.goalAuthored && g.goal);
    if (!listed.length) {
      layer.add(
        scene.add.text(left, y, "Nothing the town set out to finish this year was written down.", {
          fontFamily: FONT.display,
          fontSize: "22px",
          color: COLOR.muted,
          wordWrap: { width: wrap },
        }),
      );
    } else {
      for (const goal of listed) {
        const line = scene.add.text(
          left,
          y,
          goal.completed
            ? `${goal.goal} — done, and your hands were in it.`
            : `${goal.goal} — still short on festival night.`,
          {
            fontFamily: FONT.display,
            fontSize: "24px",
            color: goal.completed ? COLOR.success : COLOR.muted,
            wordWrap: { width: wrap },
          },
        );
        layer.add(line);
        y += line.height + 10;
      }
    }
  }
}

/** "Toby", "Toby and Mara", "Toby, Mara and Ilsa" — never a count. */
function listOf(names: readonly string[]): string {
  if (names.length <= 1) return names[0] ?? "";
  if (names.length === 2) return `${names[0]} and ${names[1]}`;
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}
