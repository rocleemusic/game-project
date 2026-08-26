// world/f1.ink — generated from screen_spec F1. Do not hand-edit.

=== f1 ===
Placeholder: Forager's Clearing. #screen:F1 #id:GB-F1-INTRO
{ TimeOfDay == morning: -> ts_morning }
{ TimeOfDay == afternoon: -> ts_afternoon }
{ TimeOfDay == evening: -> ts_evening }
-> hub

= hub
* {present_mara == "F1" && mara.sc_t2_22 > 0} [Talk to Mara] #scene:SC-F1-03 -> mara.sc_f1_03
+ [Look at trail signs] -> trail_signs
+ {movesLeft > 0 && TimeOfDay != night} [Go to The Stream]
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
+ {movesLeft > 0 && TimeOfDay != night} [Go to The Grove]
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
+ {movesLeft > 0 && TimeOfDay != night} [Go to Town Square]
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
+ [End the day] -> day_end

= trail_signs
Placeholder examinable: trail_signs (soft-signpost). #id:GB-F1-EX-trail_signs
-> hub

= ts_morning
Placeholder time-state: F1 at morning. #id:GB-F1-TS-morning
-> hub

= ts_afternoon
Placeholder time-state: F1 at afternoon. #id:GB-F1-TS-afternoon
-> hub

= ts_evening
Placeholder time-state: F1 at evening. #id:GB-F1-TS-evening
-> hub

