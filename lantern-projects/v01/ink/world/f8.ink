// world/f8.ink — generated from screen_spec F8. Do not hand-edit.

=== f8 ===
Placeholder: Heart of the Wood. #screen:F8 #id:GB-F8-INTRO
{ TimeOfDay == evening: -> ts_evening }
{ TimeOfDay == night: -> ts_night }
-> hub

= hub
+ [Look at heart tree] -> heart_tree
+ {movesLeft > 0 && TimeOfDay != night} [Go to Old-Growth Hollow] #lock:locked(G-F5-cascade)
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> f5
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> f5
        }
    }
+ {movesLeft > 0 && TimeOfDay != night} [Wait]
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> f8
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> f8
        }
    }
+ [End the day] -> day_end

= heart_tree
Placeholder examinable: heart_tree (hard-key). #id:GB-F8-EX-heart_tree
-> hub

= ts_evening
Placeholder time-state: F8 at evening. #id:GB-F8-TS-evening
-> hub

= ts_night
Placeholder time-state: F8 at night. #id:GB-F8-TS-night
-> hub

