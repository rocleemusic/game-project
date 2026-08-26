// world/t5.ink — generated from screen_spec T5. Do not hand-edit.

=== t5 ===
Placeholder: A Neighbor's Home. #screen:T5 #id:GB-T5-INTRO
{ TimeOfDay == evening: -> ts_evening }
-> hub

= hub
+ [Look at mementos] -> mementos
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
        -> t5
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t5
        }
    }
+ [End the day] -> day_end

= mementos
Placeholder examinable: mementos (hard-key). #id:GB-T5-EX-mementos
-> hub

= ts_evening
Placeholder time-state: T5 at evening. #id:GB-T5-TS-evening
-> hub

