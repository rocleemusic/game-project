// world/f5.ink — generated from screen_spec F5. Do not hand-edit.

=== f5 ===
Placeholder: Old-Growth Hollow. #screen:F5 #id:GB-F5-INTRO
{ TimeOfDay == afternoon: -> ts_afternoon }
{ TimeOfDay == evening: -> ts_evening }
-> hub

= hub
+ [Look at great trunk] -> great_trunk
+ {movesLeft > 0 && TimeOfDay != night} [Go to The Grove]
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> f3
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> f3
        }
    }
+ {movesLeft > 0 && TimeOfDay != night} [Go to The Old Shrine (Forest) / Ruin] #lock:locked(G-F5-cascade)
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> f6
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> f6
        }
    }
+ {movesLeft > 0 && TimeOfDay != night} [Go to The Cave] #lock:locked(G-F5-cascade, G-F7-light)
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> f7
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> f7
        }
    }
+ {movesLeft > 0 && TimeOfDay != night} [Go to Heart of the Wood] #lock:locked(G-F8-combine)
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
+ {movesLeft > 0 && TimeOfDay != night} [Wait]
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

= great_trunk
Placeholder examinable: great_trunk (hard-key). #id:GB-F5-EX-great_trunk
-> hub

= ts_afternoon
Placeholder time-state: F5 at afternoon. #id:GB-F5-TS-afternoon
-> hub

= ts_evening
Placeholder time-state: F5 at evening. #id:GB-F5-TS-evening
-> hub

