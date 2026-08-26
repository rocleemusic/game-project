// world/t7.ink — generated from screen_spec T7. Do not hand-edit.

=== t7 ===
Placeholder: Festival Grounds. #screen:T7 #id:GB-T7-INTRO
{ TimeOfDay == evening: -> ts_evening }
{ TimeOfDay == night: -> ts_night }
-> hub

= hub
{ TimeOfDay == night && toby.sc_t7_toby > 0 && ilsa.sc_t7_ilsa > 0: -> festival_vignette }
* {present_toby == "T7" && day >= 5} [Talk to Toby] #scene:SC-T7-toby -> toby.sc_t7_toby
* {present_ilsa == "T7" && day >= 5} [Talk to Ilsa] #scene:SC-T7-ilsa -> ilsa.sc_t7_ilsa
+ [Look at stage] -> stage
+ [Look at lanterns] -> lanterns
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
+ {TimeOfDay == night} [Begin the festival vignette] -> festival_vignette
+ [End the day] -> day_end

= stage
Placeholder examinable: stage (hard-key). #id:GB-T7-EX-stage
-> hub

= lanterns
Placeholder examinable: lanterns (hard-key). #id:GB-T7-EX-lanterns
-> hub

= ts_evening
Placeholder time-state: T7 at evening. #id:GB-T7-TS-evening
-> hub

= ts_night
Placeholder time-state: T7 at night. #id:GB-T7-TS-night
-> hub

