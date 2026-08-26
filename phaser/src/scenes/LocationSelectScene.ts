/**
 * The day-start screen — laid out as the calendar it feeds.
 *
 * Redesigned 2026-08-19 to read as `CalendarScene`: the festival week as five
 * day rectangles, gold-framed on the calendar backdrop. The day's start is a
 * choice between EXACTLY TWO screens — Town Square and Forager's Clearing
 * (GDD `03-core-loop.md`, "Start-of-day location (RULED 2026-08-19)"; canonical
 * ids in `08-levels.md`) — presented as MAP-THUMBNAIL buttons of each backdrop,
 * sitting inside the CURRENT day's rectangle. Day 5 carries no location choice:
 * it is Festival Night (the day-5 exception / finale).
 *
 * The ink story still offers more `Begin at …` exits than the ruling allows
 * (it predates 2026-08-19). This screen enforces the two-start ruling at the UI
 * layer by matching only the two canonical starts from the ink hub — picking a
 * thumbnail plays out that real ink `[Begin at X]`/`[Go to X]` choice and hands
 * the advanced bridge to `CollectScene`, exactly as before.
 *
 * PER-DAY HISTORY. Each PAST day shows the location you began it at, per
 * `gdd/03-core-loop.md` ("The calendar records each past day's chosen
 * location"). `DayPicks` (`world/DayPicks.ts`) is the record: this scene writes
 * a pick when the player chooses a start, keyed by the clock's current day, and
 * reads the map back to draw each past cell's `bg:<screenId>` thumbnail.
 * `DayPicksSlice` carries that key through save/load. FUTURE cells stay empty.
 *
 * SHARED WITH THE CALENDAR since 2026-08-23. `DAY_STARTS`, the thumbnail button
 * and the name lookup all live in `ui/dayCard.ts` now — `CalendarScene` in its
 * ACTIVE state draws the identical picker (Roc's ruling: one calendar, active at
 * the start of a new day, read-only otherwise). Keep new picker behavior in the
 * shared helper, not here, or the two drift again.
 */

import Phaser from "phaser";
import { InkBridge } from "../ink/InkBridge";
import type { Run } from "../ink/loadRun";
import type { MagicDB } from "../magic/CastResolver";
import type { ModeDescriptor } from "../mode/ModeDescriptor";
import type { ChosenLife } from "./ChosenLife";
import { DayPicks } from "../world/DayPicks";
import { COLOR, FONT, popIn, sceneFadeIn, sceneTransition } from "../ui/theme";
import {
  DAY_STARTS,
  FRAME_PAD_X,
  FRAME_PAD_Y,
  addCardFrame,
  addThumbButton,
  addThumbImage,
  addTodayEmphasis,
  cardFrameHeight,
  locationName,
} from "../ui/dayCard";

const W = 1920;
const H = 1080;
const GOLD = COLOR.gold;
/** Dark parchment inks — the §5.2 "Parchment card" text tones. A day card is a
 * light framed page now, so its labels invert to dark ink (the theme's
 * `inkOnCanvas`/`inkSoftOnCanvas`, verified 10.9:1 / 4.9:1 on `canvas`). The
 * old `COLOR.ink` is the LIGHT parchment tone and would read light-on-light. */
const INK_DARK = COLOR.inkOnCanvas;
const INK_SOFT = COLOR.inkSoftOnCanvas;

const DAYS = 5;

/**
 * `ChosenLife` rides through UNREAD (T13 Phase 3, 2026-08-24). This scene is on
 * the new-game route between the slot board and `CollectScene`, so the chosen
 * slot and name have to survive the hop; nothing here looks at either. Forwarded
 * verbatim rather than re-derived, because the descriptor now lists three slots
 * and cannot say which one was picked.
 */
export interface LocationSelectData extends ChosenLife {
  run: Run;
  ink: InkBridge;
  magic: MagicDB;
  /**
   * The descriptor threaded through to `CollectScene`, which reads it for
   * `hubEnabled` (whether `"hub-decor"` is in `systems`) and, as of the mode5
   * merge, for `save` too — a boolean could not tell `discover-home` and
   * `mode5` apart, and both mount `CollectScene` with `hubEnabled: true`.
   */
  mode: ModeDescriptor;
}

export class LocationSelectScene extends Phaser.Scene {
  private run!: Run;
  private ink!: InkBridge;
  private magic!: MagicDB;
  private mode!: ModeDescriptor;
  /** Carried, never read here — see `LocationSelectData`. */
  private life: ChosenLife = {};

  constructor() {
    super("LocationSelectScene");
  }

  init(data: LocationSelectData) {
    this.run = data.run;
    this.ink = data.ink;
    this.magic = data.magic;
    this.mode = data.mode;
    this.life = { saveSlot: data.saveSlot, playerName: data.playerName };
  }

  /** The scene data every exit to `CollectScene` hands over. One place, so the
   * two exits below cannot drift apart on which fields they forward. */
  private collectData() {
    return {
      run: this.run,
      ink: this.ink,
      magic: this.magic,
      mode: this.mode,
      ...this.life,
    };
  }

  preload() {
    if (!this.textures.exists("bg:calendar")) {
      this.load.image("bg:calendar", "art/ui/calendar-bg.jpg");
    }
    if (!this.textures.exists("ui:card-frame")) {
      this.load.image("ui:card-frame", "art/ui/card-frame.jpg");
    }
  }

  create() {
    sceneFadeIn(this);
    const bg = this.add.image(W / 2, H / 2, "bg:calendar").setDepth(0);
    bg.setScale(Math.max(W / bg.width, H / bg.height));
    // `bg:calendar` is the celestial-book backdrop (no printed numbers), so it no
    // longer fights the day cards — a light scrim just settles it behind them.
    // NOTE: `CalendarScene` shares this backdrop and scrim value — keep in step.
    this.add.rectangle(W / 2, H / 2, W, H, COLOR.night, 0.3).setDepth(1);

    // The bridge is already constructed by PreloadScene (and, on the mode5
    // passthrough, already run to choice by SaveLoadScene); run it to its first
    // real choice point so the starts on offer are the real ones.
    this.ink.runToChoice();
    const day = this.ink.view().day;
    const dayPicks = new DayPicks();

    // The header text sits on the calendar photo, which washes it out. A night
    // plaque behind the title/subtitle block keeps both legible (fix pass).
    this.add
      .rectangle(44, 32, 470, 92, COLOR.night, 0.82)
      .setOrigin(0, 0)
      .setStrokeStyle(1, COLOR.goldNum, 0.5)
      .setDepth(1);
    this.add
      .text(64, 44, "THE WEEK", { fontFamily: FONT.display, fontSize: "34px", color: GOLD })
      .setDepth(2);
    this.add
      .text(64, 92, `day ${day} — pick where the day begins`, {
        fontFamily: FONT.display,
        fontSize: "18px",
        color: COLOR.ink,
      })
      .setDepth(2);

    // The two canonical starts, matched to the real ink move-choices. Any other
    // "Begin at …" the story still offers is dropped — the 2026-08-19 ruling
    // fixes the starts to these two.
    const moves = this.ink
      .view()
      .choices.filter((c) => c.kind === "move" && /^\[(Go to|Begin at)\s/.test(c.display));
    const offered = DAY_STARTS.map((s) => ({
      ...s,
      choice: moves.find((c) => c.display.includes(s.name)),
    })).filter((s) => s.choice);

    if (!offered.length) {
      // Nothing to pick from — do not strand the player on a dead screen.
      sceneTransition(this, "CollectScene", this.collectData());
      return;
    }

    const cardW = 320;
    const cardH = cardFrameHeight(this, cardW);
    const gap = 30;
    const startX = W / 2 - (DAYS * cardW + (DAYS - 1) * gap) / 2 + cardW / 2;
    const y = H / 2 + 30;
    const padX = cardW * FRAME_PAD_X;
    const padY = cardH * FRAME_PAD_Y;
    const innerW = cardW - 2 * padX;

    for (let d = 1; d <= DAYS; d++) {
      const x = startX + (d - 1) * (cardW + gap);
      const isToday = d === day;
      const isPast = d < day;
      const isDay5 = d === DAYS;

      // TODAY's warm bloom sits BEHIND the frame; its gold/ember double rim and
      // "TODAY" tab sit above it — the shared day-card emphasis. Drawn before the
      // frame so the bloom lands under it (both order by explicit depth anyway).
      if (isToday) addTodayEmphasis(this, x, y, cardW, cardH);

      // The framed parchment panel — the art-backed card. Its printed gold frame
      // reads as the panel border; labels/thumbnails sit inside the inner margin.
      // Not popped in: the image is sized by its scale, and popIn's scale tween
      // would snap it back to the full texture size.
      const frame = addCardFrame(this, x, y, cardW, cardH);
      // Every day but today recedes: the parchment fades toward the book so
      // TODAY is the one lit page. Past days keep more presence than empty future
      // ones. Labels/thumbnails draw ON TOP at higher depth, so they stay crisp.
      if (!isToday) frame.setAlpha(isPast ? 0.82 : 0.64);

      const dayLabel = this.add
        .text(x, y - cardH / 2 + padY - 6, `Day ${d}`, {
          fontFamily: FONT.display,
          fontSize: "30px",
          color: isToday ? INK_DARK : INK_SOFT,
        })
        .setOrigin(0.5)
        .setDepth(3);
      popIn(this, dayLabel);

      // Day 5 is the finale — no location choice, ever (day-5 exception).
      if (isDay5) {
        const finale = this.add
          .text(x, y + 6, "Festival Night", {
            fontFamily: FONT.display,
            fontSize: "26px",
            color: isToday ? INK_DARK : INK_SOFT,
            align: "center",
            wordWrap: { width: innerW },
          })
          .setOrigin(0.5)
          .setDepth(3);
        popIn(this, finale);
        continue;
      }

      // The two map-thumbnail starts sit inside TODAY's framed opening.
      if (isToday) {
        const thumbW = innerW;
        const thumbH = 150;
        const slots = [y - 58, y + 116];
        offered.forEach((start, i) => {
          const cy = slots[i] ?? y;
          const btn = addThumbButton(this, x, cy, thumbW, thumbH, start.screenId, start.name, () => {
            // Record the day's start before leaving, so the calendar can show it
            // on this cell once the day is in the past (GDD 03-core-loop).
            dayPicks.record(day, start.screenId);
            this.ink.choose(start.choice!.index);
            this.ink.runToChoice();
            sceneTransition(this, "CollectScene", this.collectData());
          });
          popIn(this, btn);
        });
      } else if (isPast) {
        // A PAST day shows the location it was begun at — one static thumbnail,
        // read from `DayPicks`. A day with no recorded pick stays empty (a save
        // predating this record, or a day skipped without a start).
        const picked = dayPicks.pickFor(d);
        if (picked) {
          popIn(this, addThumbImage(this, x, y + 14, innerW, 200, picked, locationName(picked)));
        }
      }
    }
  }
}
