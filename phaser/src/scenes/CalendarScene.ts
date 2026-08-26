/**
 * The calendar — ONE calendar, two states (RULED by Roc, 2026-08-23).
 *
 * - **ACTIVE** at the start of a new day only: today's card offers the two
 *   canonical starts (Town Square / Forager's Clearing) as thumbnail buttons,
 *   exactly like the game-start picker. This is what the Home Hub's
 *   "Start the Next Day" opens.
 * - **READ-ONLY** every other time (the `L` key, the nav button): a week
 *   overview, today's current location as a static thumbnail, no picks.
 *
 * The state is not inferred here — the caller decides by passing `picks`. Only
 * `CollectScene`'s hub "Start the Next Day" branch does, and only after the ink
 * bridge has actually advanced to the `calendar` knot, so the offered picks are
 * the real ink choices. That is the fix for Roc's note "Home Hub calendar can't
 * pick forest/town": before this, the hub calendar was hard-read-only and the
 * only way to pick was the `TraversalRow` pills hidden UNDER the overlay.
 *
 * Still a VIEW, still ink-free. Even in active mode this scene never touches
 * `InkBridge` — it reports the chosen `{ screenId, choiceIndex }` back through
 * `onPick` and lets `CollectScene` own the advance, the same discipline as the
 * notebook and the satchel.
 *
 * SHARES `LocationSelectScene`'s look, deliberately. Both draw the festival
 * week as five gold-framed parchment pages on the celestial-book backdrop; the
 * card itself — frame math, TODAY emphasis, past-day thumbnail, live start
 * button, the canonical start list — lives in ONE place (`ui/dayCard.ts`) so the
 * two can never drift again. They drifted once (this scene was left drawing old
 * dark `COLOR.panel` boxes with time-of-day blocks after the picker moved to
 * parchment); the shared helpers are the fix.
 *
 * Past days show the location each was begun at; a day with no recorded pick
 * stays empty. No time-of-day here — Roc: "we don't need to mark time of day."
 */

import Phaser from "phaser";
import type { PlayView } from "@lantern/lib/play";
import { DayPicks } from "../world/DayPicks";
import { COLOR, FONT, popIn, sceneFadeIn } from "../ui/theme";
import {
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
 * light framed page, so its labels invert to dark ink (verified 10.9:1 / 4.9:1
 * on `canvas`). Mirrors `LocationSelectScene`. */
const INK_DARK = COLOR.inkOnCanvas;
const INK_SOFT = COLOR.inkSoftOnCanvas;

const DAYS = 5;

/**
 * One offered start, already matched to a real ink choice by the caller.
 * `screenId` keys the `bg:<screenId>` thumbnail AND is what gets recorded to
 * `DayPicks`; `choiceIndex` is the ink choice to play out.
 */
export interface CalendarPick {
  screenId: string;
  name: string;
  choiceIndex: number;
}

export interface CalendarSceneData {
  view: PlayView;
  onClose: () => void;
  /**
   * ACTIVE mode. Present (and non-empty) only when the calendar is opened at
   * the start of a new day — today's card then becomes the location picker.
   * Absent/empty anywhere else, which is the read-only reference state.
   */
  picks?: ReadonlyArray<CalendarPick>;
  /** Called with the chosen start. The scene closes itself right after; the
   * caller owns the ink advance (this scene never touches the bridge). */
  onPick?: (pick: CalendarPick) => void;
}

export class CalendarScene extends Phaser.Scene {
  private view!: PlayView;
  private onClose!: () => void;
  private picks: ReadonlyArray<CalendarPick> = [];
  private onPick?: (pick: CalendarPick) => void;

  constructor() {
    super("CalendarScene");
  }

  init(data: CalendarSceneData) {
    this.view = data.view;
    this.onClose = data.onClose;
    // A pick list with no handler would render dead buttons — treat that as
    // read-only rather than drawing something that cannot be clicked.
    this.picks = data.onPick ? (data.picks ?? []) : [];
    this.onPick = data.onPick;
  }

  /** ACTIVE = there is at least one real start to offer. */
  private get isPicker(): boolean {
    return this.picks.length > 0;
  }

  preload() {
    if (!this.textures.exists("bg:calendar")) {
      this.load.image("bg:calendar", "art/ui/calendar-bg.jpg");
    }
    // The framed day-card art. Normally already cached (LocationSelectScene loads
    // it earlier in the flow), but the calendar can be the first scene to want it.
    if (!this.textures.exists("ui:card-frame")) {
      this.load.image("ui:card-frame", "art/ui/card-frame.jpg");
    }
  }

  create() {
    sceneFadeIn(this);
    const bg = this.add.image(W / 2, H / 2, "bg:calendar").setDepth(0);
    bg.setScale(Math.max(W / bg.width, H / bg.height));
    // `bg:calendar` is the celestial-book backdrop (no printed numbers); a light
    // scrim just settles it behind the day cards. Kept in step with
    // `LocationSelectScene`, which shares this backdrop — do not let them drift.
    this.add.rectangle(W / 2, H / 2, W, H, COLOR.night, 0.3).setDepth(1);

    // A night plaque behind the header so the title/subtitle stay legible over
    // the calendar photo (fix pass; matches `LocationSelectScene`).
    this.add
      .rectangle(44, 32, 900, 92, COLOR.night, 0.82)
      .setOrigin(0, 0)
      .setStrokeStyle(1, COLOR.goldNum, 0.5)
      .setDepth(1);
    this.add
      .text(64, 44, "THE WEEK", { fontFamily: FONT.display, fontSize: "34px", color: GOLD })
      .setDepth(2);
    const today = this.view.day;
    this.add
      .text(
        64,
        92,
        this.isPicker
          ? `day ${today} — pick where the day begins`
          : "the festival is five days out — a read-only look at where you are",
        {
          fontFamily: FONT.display,
          fontSize: "18px",
          color: COLOR.ink,
        },
      )
      .setDepth(2);

    const dayPicks = new DayPicks();

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
      const isToday = d === today;
      const isPast = d < today;
      const isDay5 = d === DAYS;

      // TODAY's warm bloom sits BEHIND the frame; its gold/ember double rim and
      // "TODAY" tab sit above it — the shared day-card emphasis. Drawn before the
      // frame so the bloom lands under it (both order by explicit depth anyway).
      if (isToday) addTodayEmphasis(this, x, y, cardW, cardH);

      // The framed parchment panel — the art-backed card. Its printed gold frame
      // reads as the panel border; labels/thumbnails sit inside the inner margin.
      const frame = addCardFrame(this, x, y, cardW, cardH);
      // Every day but today recedes: the parchment fades toward the book so TODAY
      // is the one lit page. Past days keep more presence than empty future ones.
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

      // Day 5 is the finale — no location, ever. Festival Night (day-5 exception),
      // same treatment as the picker.
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

      if (isToday && this.isPicker) {
        // ACTIVE — start of a new day. Today's card carries the offered starts as
        // live thumbnail buttons, laid out exactly as the game-start picker does
        // (same slots, same cell size) so the two read as the same screen. No
        // "moves left" readout: the day has not begun yet, so there is nothing
        // truthful to count.
        const slots = [y - 58, y + 116];
        this.picks.forEach((pick, i) => {
          const cy = slots[i] ?? y;
          const btn = addThumbButton(this, x, cy, innerW, 150, pick.screenId, pick.name, () => {
            // Record the day's start before leaving, so this same card can show
            // it once the day is in the past (GDD 03-core-loop) — the picker
            // writes the identical record.
            dayPicks.record(today, pick.screenId);
            this.onPick?.(pick);
            this.close();
          });
          popIn(this, btn);
        });
      } else if (isToday) {
        // TODAY, read-only: the CURRENT location as one static thumbnail (no
        // interactive starts — the calendar is reference outside a day start),
        // plus "N moves left". No recorded pick yet leaves the emphasized empty
        // card, just the readout.
        const picked = dayPicks.pickFor(today);
        if (picked) {
          popIn(this, addThumbImage(this, x, y - 40, innerW, 280, picked, locationName(picked)));
        }
        this.add
          .text(x, y + 150, `${this.view.movesLeft} moves left`, {
            fontFamily: FONT.mono,
            fontSize: "18px",
            color: INK_DARK,
          })
          .setOrigin(0.5)
          .setDepth(3);
      } else if (isPast) {
        // A PAST day shows the location it was begun at — one static thumbnail,
        // read from `DayPicks`. A day with no recorded pick stays empty.
        const picked = dayPicks.pickFor(d);
        if (picked) {
          popIn(this, addThumbImage(this, x, y + 14, innerW, 200, picked, locationName(picked)));
        }
      }
    }

    this.input.keyboard?.on("keydown-ESC", () => this.close());
    this.input.keyboard?.on("keydown-L", () => this.close());
    const close = this.add
      .text(64, H - 70, "Esc or L to close", { fontFamily: FONT.mono, fontSize: "20px", color: COLOR.muted })
      .setPadding(8, 8, 8, 8)
      .setDepth(2)
      .setInteractive({ useHandCursor: true });
    close.on("pointerover", () => close.setColor(COLOR.ember));
    close.on("pointerout", () => close.setColor(COLOR.muted));
    close.on("pointerdown", () => this.close());
  }

  private close() {
    this.input.keyboard?.removeAllListeners();
    this.scene.stop();
    this.onClose();
  }
}
