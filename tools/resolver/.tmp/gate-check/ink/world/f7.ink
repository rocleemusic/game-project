// world/f7.ink — generated from screen_spec F7. Do not hand-edit.

=== f7 ===
Placeholder: The Cave. #screen:F7 #id:GB-F7-INTRO
{ TimeOfDay == night: -> ts_night }
-> hub

= hub
+ [Look at cave walls] -> cave_walls
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
+ [End the day] -> day_end

= cave_walls
Placeholder examinable: cave_walls (hard-key). #id:GB-F7-EX-cave_walls
-> hub

= ts_night
Placeholder time-state: F7 at night. #id:GB-F7-TS-night
-> hub

