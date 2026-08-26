// world/t1.ink — generated from screen_spec T1. Do not hand-edit.

=== t1 ===
Placeholder: Town Square. #screen:T1 #id:GB-T1-INTRO
{ TimeOfDay == morning: -> ts_morning }
{ TimeOfDay == afternoon: -> ts_afternoon }
{ TimeOfDay == evening: -> ts_evening }
-> hub

= hub
+ [Look at arch] -> arch
+ [Look at notice board] -> notice_board
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
+ {movesLeft > 0 && TimeOfDay != night} [Go to Market Row]
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> t2
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t2
        }
    }
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
+ {movesLeft > 0 && TimeOfDay != night} [Go to The Tavern / Inn] #lock:locked(G-T6-evening)
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> t6
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t6
        }
    }
+ {movesLeft > 0 && TimeOfDay != night} [Go to Festival Grounds]
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> t7
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t7
        }
    }
+ [End the day] -> day_end

= arch
Placeholder examinable: arch (ambient). #id:GB-T1-EX-arch
-> hub

= notice_board
Placeholder examinable: notice_board (soft-signpost). #id:GB-T1-EX-notice_board
-> hub

= ts_morning
Placeholder time-state: T1 at morning. #id:GB-T1-TS-morning
-> hub

= ts_afternoon
Placeholder time-state: T1 at afternoon. #id:GB-T1-TS-afternoon
-> hub

= ts_evening
Placeholder time-state: T1 at evening. #id:GB-T1-TS-evening
-> hub

