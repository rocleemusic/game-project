// main.ink — INCLUDEs + the day loop (build-loop.md piece 4). Generated.

INCLUDE state.ink
INCLUDE system/externals.ink
INCLUDE world/f1.ink
INCLUDE world/f2.ink
INCLUDE world/f3.ink
INCLUDE world/f4.ink
INCLUDE world/f5.ink
INCLUDE world/f6.ink
INCLUDE world/f7.ink
INCLUDE world/f8.ink
INCLUDE world/t1.ink
INCLUDE world/t2.ink
INCLUDE world/t3.ink
INCLUDE world/t4.ink
INCLUDE world/t5.ink
INCLUDE world/t6.ink
INCLUDE world/t7.ink
INCLUDE world/t8.ink
INCLUDE souls/ilsa.ink
INCLUDE souls/mara.ink
INCLUDE souls/toby.ink

-> day_start

=== day_start ===
~ TimeOfDay = morning
~ movesLeft = 3
Day {day} begins. #id:SYS-DAY-BEGIN
// pickedStartScreen is set at the PRIOR evening's Home Hub calendar (below).
// Day 1 has no prior evening, so it stays "none" and screen_hub covers it.
{ pickedStartScreen != "none":
    -> start_from_calendar
- else:
    -> screen_hub
}

// Arriving at the calendar's pick spends move 1 of the fresh morning
// budget — the same cost as picking a start screen by hand at screen_hub
// (RULED 2026-08-01: picking the start location spends move 1).
=== start_from_calendar ===
~ temp dest = pickedStartScreen
~ pickedStartScreen = "none"
{ dest:
- "t1":
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> t1
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t1
        }
    }
- "t2":
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> t2
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t2
        }
    }
- "t3":
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> t3
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t3
        }
    }
- "f1":
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> f1
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> f1
        }
    }
- "f2":
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> f2
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> f2
        }
    }
- "f3":
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> f3
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> f3
        }
    }
- else:
    -> screen_hub
}

// Manual fallback: day 1 (no calendar pick exists yet) and a safety net
// if the switch above ever misses. Choosing an opening position spends
// move 1 of morning's budget, same as any other move (RULED 2026-08-01).
=== screen_hub ===
+ {movesLeft > 0} [Begin at Town Square]
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> t1
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t1
        }
    }
+ {movesLeft > 0} [Begin at Market Row]
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> t2
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t2
        }
    }
+ {movesLeft > 0} [Begin at The Commons / Well]
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> t3
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t3
        }
    }
+ {movesLeft > 0} [Begin at Forager's Clearing]
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> f1
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> f1
        }
    }
+ {movesLeft > 0} [Begin at The Stream]
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> f2
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> f2
        }
    }
+ {movesLeft > 0} [Begin at The Grove]
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> f3
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> f3
        }
    }
+ [End the day] -> day_end

// The final sequence (GDD 03-core-loop.md day-5 exception; RULED
// 2026-08-01) intercepts BEFORE the day increments below — on the life's
// last day, evening's exhausted budget goes home to home_hub_final, not
// the ordinary calendar, and day never advances past it. The old
// day-overrun ending (retired: it used to fire once day exceeded
// days_per_life) is gone — with the intercept here, day can never exceed
// days_per_life, and the final screen is now the only way a life ends.
=== day_end ===
{ day == 5:
    -> home_hub_final
}
~ day = day + 1
-> home_hub

// The Home Hub (GDD 08-levels.md): day's end always returns here
// (03-core-loop.md, 06-world-and-progression.md). It resets empty each
// life in the shipped game. Bank/decorate/satchel-triage are D6's build
// (out of D2's scope — a niceness-meter of half-built systems is worse
// than an honest placeholder), but the hub offers a real choice of its
// own rather than a single line that auto-advances into the calendar:
// look around (flavor, once) or start the next day. The calendar NEVER
// opens on its own (GP-52, playtest 2026-08-02: "let player open the
// calendar") — looking around returns to the hub, same stitch pattern as
// home_hub_final below, and only the explicit "Start the Next Day" pick
// moves on. Renamed from "Open the calendar" per Roc's 2026-08-23 ruling
// (the knot is still named `calendar`; only the choice label changed). A
// bare day-loop walk spends one extra step here per evening, plus one more
// the single time the once-only look-around is available (walk.test.ts).
=== home_hub ===
You're home for the night. #screen:HOME #id:SYS-HOME-HUB
-> hub_night

= hub_night
* [Look around your home]
    Bank what fits the satchel, and decorate it — placeholder for D6's carry model. #id:SYS-HOME-LOOK
    -> hub_night
+ [Start the Next Day] -> calendar

// "When ready to move on, you open the calendar and pick the next day's
// location" (03-core-loop.md). Sets pickedStartScreen (exact screen, for
// day_start's routing) AND pickedLocation (that screen's region, for the
// resolver's DayInput.picked_location contract — types.ts: "the location
// the player picked the prior evening") — see the emitMain doc comment.
=== calendar ===
Pick tomorrow's destination. #screen:HOME #id:SYS-CALENDAR
+ [Go to Town Square]
    ~ pickedStartScreen = "t1"
    ~ pickedLocation = "town"
    -> day_start
+ [Go to Market Row]
    ~ pickedStartScreen = "t2"
    ~ pickedLocation = "town"
    -> day_start
+ [Go to The Commons / Well]
    ~ pickedStartScreen = "t3"
    ~ pickedLocation = "town"
    -> day_start
+ [Go to Forager's Clearing]
    ~ pickedStartScreen = "f1"
    ~ pickedLocation = "forest"
    -> day_start
+ [Go to The Stream]
    ~ pickedStartScreen = "f2"
    ~ pickedLocation = "forest"
    -> day_start
+ [Go to The Grove]
    ~ pickedStartScreen = "f3"
    ~ pickedLocation = "forest"
    -> day_start

// The final sequence (GDD 03-core-loop.md day-5 exception; RULED
// 2026-08-01, RATIFIED as "final sequence"): no calendar — there is no
// day 6 to plan. The only forward option is the Festival; that choice is
// the ONLY place `night` ever enters the clock (advance_time() below
// still never reaches it). One-way: nothing diverts from here back into
// the ordinary day cycle.
=== home_hub_final ===
You're home for the last night. Tomorrow there is no cycle left — only the festival. #screen:HOME #id:SYS-HOME-HUB-FINAL
-> hub_final

= hub_final
* [Look around your home]
    One last look, before the festival. #id:SYS-HOME-FINAL-LOOK
    -> hub_final
+ [Go to the Festival night]
    ~ TimeOfDay = night
    -> t7

// The vignette (T9), the night screen (TN) and the final screen (FS)
// are real screens (screen-specs.json — graph.ts's VIGNETTE_SCREEN_ID /
// NIGHT_SCREEN_ID / FINAL_SCREEN_ID),
// hand-authored here like home_hub rather than generated by emitScreen —
// see emitInk's exclusion list. Placeholder prose only, tagged for the
// prose pass ("graph before prose", pipeline.md step 6).
=== festival_vignette ===
Placeholder: the festival night vignette, shaped by the choices made this life. #screen:T9 #id:SYS-FESTIVAL-VIGNETTE
-> night_screen

// The night-version screen (GP-51, Roc's playtest note 2026-08-02:
// "needs a Night time screen that shows night version before the Final
// Screen"). Holds the night view of the town between the vignette and
// the results; its single forward choice keeps the play paused here so
// the screen is actually seen, instead of falling straight through.
=== night_screen ===
Placeholder: the town under festival night — the night version of the world. #screen:TN #id:SYS-NIGHT-SCREEN
+ [Go to the results] -> final_screen

// The results slot stopped being a placeholder on 2026-08-24 (T9, Roc's
// festival-scoring ruling of 2026-08-23). The HOST reads the score and
// draws what the week came to — the tier as the festival's own look, the
// souls who turned out, the town work that got finished. Ink states the
// frame and nothing else, for two reasons: the counters are host-side
// (per-NPC daily talk count; festival goals completed) and ink stores
// none of them, and NEVER A SCORE SHOWN (03-core-loop.md) means there is
// no number for ink to interpolate here even if it had one.
=== final_screen ===
The lanterns are down, and the square keeps whatever the week made of it. #screen:FS #id:SYS-FINAL-SUMMARY
Start a new game to live it again. #id:SYS-FINAL-RESTART
-> END

// Advances the block, NOT called per move (emitMoveTo only calls this
// once a block's move budget is exhausted) — and (GP-93) called
// unconditionally on returning from every conversation, quiet or not
// (emitConversationReturn). Either caller only ever reaches this from
// morning or afternoon; an exhausted evening/evening-ending-conversation
// diverts straight to day_end instead, so this never needs to produce
// `night`. At night it is a harmless no-op (no `was == night` branch
// below), which is what lets multiple night scenes still play back to
// back — night is festival night, the final sequence (see home_hub_final
// above), not a normal block. A temp holds the block being left, so a
// single call cannot cascade two steps.
=== function advance_time() ===
~ temp was = TimeOfDay
{ was == morning:
    ~ TimeOfDay = afternoon
}
{ was == afternoon:
    ~ TimeOfDay = evening
}
~ movesLeft = 3

