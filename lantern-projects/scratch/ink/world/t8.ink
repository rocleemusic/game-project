// world/t8.ink — generated from screen_spec T8. Do not hand-edit.

=== t8 ===
Placeholder: The Old Shrine (Town). #screen:T8 #id:GB-T8-INTRO
{ TimeOfDay == evening: -> ts_evening }
{ TimeOfDay == night: -> ts_night }
-> hub

= hub
+ [Look at shrine carvings] -> shrine_carvings
+ {movesLeft > 0 && TimeOfDay != night} [Go to The Commons / Well]
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
+ {movesLeft > 0 && TimeOfDay != night} [Wait]
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> t8
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t8
        }
    }
+ [End the day] -> day_end

= shrine_carvings
Placeholder examinable: shrine_carvings (hard-key). #id:GB-T8-EX-shrine_carvings
-> hub

= ts_evening
Placeholder time-state: T8 at evening. #id:GB-T8-TS-evening
-> hub

= ts_night
Placeholder time-state: T8 at night. #id:GB-T8-TS-night
-> hub

