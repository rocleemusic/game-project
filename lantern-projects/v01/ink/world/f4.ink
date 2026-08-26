// world/f4.ink — generated from screen_spec F4. Do not hand-edit.

=== f4 ===
Placeholder: The Still Pool. #screen:F4 #id:GB-F4-INTRO
{ TimeOfDay == afternoon: -> ts_afternoon }
-> hub

= hub
+ [Look at pool bed] -> pool_bed
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
+ {movesLeft > 0 && TimeOfDay != night} [Wait]
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> f4
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> f4
        }
    }
+ [End the day] -> day_end

= pool_bed
Placeholder examinable: pool_bed (hard-key). #id:GB-F4-EX-pool_bed
-> hub

= ts_afternoon
Placeholder time-state: F4 at afternoon. #id:GB-F4-TS-afternoon
-> hub

