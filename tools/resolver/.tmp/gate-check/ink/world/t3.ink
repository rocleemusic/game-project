// world/t3.ink — generated from screen_spec T3. Do not hand-edit.

=== t3 ===
Placeholder: The Commons / Well. #screen:T3 #id:GB-T3-INTRO
{ TimeOfDay == morning: -> ts_morning }
{ TimeOfDay == afternoon: -> ts_afternoon }
{ TimeOfDay == evening: -> ts_evening }
-> hub

= hub
+ [Look at well] -> well
+ [Look at doorsteps] -> doorsteps
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
+ {movesLeft > 0 && TimeOfDay != night} [Go to A Neighbor's Home] #lock:locked(G-T5-trust)
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> t5
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t5
        }
    }
+ {movesLeft > 0 && TimeOfDay != night} [Go to The Old Shrine (Town)]
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

= well
Placeholder examinable: well (ambient). #id:GB-T3-EX-well
-> hub

= doorsteps
Placeholder examinable: doorsteps (ambient). #id:GB-T3-EX-doorsteps
-> hub

= ts_morning
Placeholder time-state: T3 at morning. #id:GB-T3-TS-morning
-> hub

= ts_afternoon
Placeholder time-state: T3 at afternoon. #id:GB-T3-TS-afternoon
-> hub

= ts_evening
Placeholder time-state: T3 at evening. #id:GB-T3-TS-evening
-> hub

