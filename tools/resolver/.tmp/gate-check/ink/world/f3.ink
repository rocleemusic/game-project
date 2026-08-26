// world/f3.ink — generated from screen_spec F3. Do not hand-edit.

=== f3 ===
Placeholder: The Grove. #screen:F3 #id:GB-F3-INTRO
{ TimeOfDay == afternoon: -> ts_afternoon }
{ TimeOfDay == evening: -> ts_evening }
-> hub

= hub
+ [Look at old carvings] -> old_carvings
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

= old_carvings
Placeholder examinable: old_carvings (ambient). #id:GB-F3-EX-old_carvings
-> hub

= ts_afternoon
Placeholder time-state: F3 at afternoon. #id:GB-F3-TS-afternoon
-> hub

= ts_evening
Placeholder time-state: F3 at evening. #id:GB-F3-TS-evening
-> hub

