// world/f6.ink — generated from screen_spec F6. Do not hand-edit.

=== f6 ===
Placeholder: The Old Shrine (Forest) / Ruin. #screen:F6 #id:GB-F6-INTRO
{ TimeOfDay == evening: -> ts_evening }
{ TimeOfDay == night: -> ts_night }
-> hub

= hub
+ [Look at ritual marks] -> ritual_marks
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

= ritual_marks
Placeholder examinable: ritual_marks (hard-key). #id:GB-F6-EX-ritual_marks
-> hub

= ts_evening
Placeholder time-state: F6 at evening. #id:GB-F6-TS-evening
-> hub

= ts_night
Placeholder time-state: F6 at night. #id:GB-F6-TS-night
-> hub

