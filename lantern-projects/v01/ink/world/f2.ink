// world/f2.ink — generated from screen_spec F2. Do not hand-edit.

=== f2 ===
Placeholder: The Stream. #screen:F2 #id:GB-F2-INTRO
{ TimeOfDay == morning: -> ts_morning }
{ TimeOfDay == afternoon: -> ts_afternoon }
-> hub

= hub
+ [Look at ford] -> ford
+ {movesLeft > 0 && TimeOfDay != night} [Go to Forager's Clearing]
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
+ {movesLeft > 0 && TimeOfDay != night} [Go to The Still Pool]
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
+ {movesLeft > 0 && TimeOfDay != night} [Wait]
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
+ [End the day] -> day_end

= ford
Placeholder examinable: ford (soft-signpost). #id:GB-F2-EX-ford
-> hub

= ts_morning
Placeholder time-state: F2 at morning. #id:GB-F2-TS-morning
-> hub

= ts_afternoon
Placeholder time-state: F2 at afternoon. #id:GB-F2-TS-afternoon
-> hub

