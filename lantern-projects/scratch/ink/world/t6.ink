// world/t6.ink — generated from screen_spec T6. Do not hand-edit.

=== t6 ===
Placeholder: The Tavern / Inn. #screen:T6 #id:GB-T6-INTRO
{ TimeOfDay == evening: -> ts_evening }
{ TimeOfDay == night: -> ts_night }
-> hub

= hub
* {present_toby == "T6" && day >= 4 && TimeOfDay != morning} [Talk to Toby] #scene:SC-T6-01 -> toby.sc_t6_01
+ [Look at hearth] -> hearth
+ [Look at ledger] -> ledger
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
+ {movesLeft > 0 && TimeOfDay != night} [Wait]
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> t6
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t6
        }
    }
+ [End the day] -> day_end

= hearth
Placeholder examinable: hearth (soft-signpost). #id:GB-T6-EX-hearth
-> hub

= ledger
Placeholder examinable: ledger (soft-signpost). #id:GB-T6-EX-ledger
-> hub

= ts_evening
Placeholder time-state: T6 at evening. #id:GB-T6-TS-evening
-> hub

= ts_night
Placeholder time-state: T6 at night. #id:GB-T6-TS-night
-> hub

