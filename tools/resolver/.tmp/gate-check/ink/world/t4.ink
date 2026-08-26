// world/t4.ink — generated from screen_spec T4. Do not hand-edit.

=== t4 ===
Placeholder: The Workshop. #screen:T4 #id:GB-T4-INTRO
{ TimeOfDay == afternoon: -> ts_afternoon }
-> hub

= hub
* {present_ilsa == "T4"} [Talk to Ilsa (SC-T4-07)] #scene:SC-T4-07 -> ilsa.sc_t4_07
* {present_ilsa == "T4" && ilsa.sc_t4_07 > 0} [Talk to Ilsa (SC-T4-08)] #scene:SC-T4-08 -> ilsa.sc_t4_08
* {present_ilsa == "T4" && ilsa.sc_t4_08 > 0} [Talk to Ilsa (SC-T4-09)] #scene:SC-T4-09 -> ilsa.sc_t4_09
* {present_ilsa == "T4" && ilsa.sc_t4_09 > 0} [Talk to Ilsa (SC-T4-10)] #scene:SC-T4-10 -> ilsa.sc_t4_10
* {present_ilsa == "T4"} [Talk to Ilsa (SC-T4-03)] #scene:SC-T4-03 -> ilsa.sc_t4_03
* {present_ilsa == "T4" && ilsa.sc_t4_03 > 0} [Talk to Ilsa (SC-T4-04)] #scene:SC-T4-04 -> ilsa.sc_t4_04
* {present_ilsa == "T4" && ilsa.sc_t4_03 > 0} [Talk to Ilsa (SC-T4-05)] #scene:SC-T4-05 -> ilsa.sc_t4_05
* {present_ilsa == "T4" && ilsa.sc_t4_04 > 0 && ilsa.sc_t4_05 > 0} [Talk to Ilsa (SC-T4-06)] #scene:SC-T4-06 -> ilsa.sc_t4_06
* {present_ilsa == "T4"} [Talk to Ilsa (SC-T4-11)] #scene:SC-T4-11 -> ilsa.sc_t4_11
* {present_ilsa == "T4" && ilsa.sc_t4_11 > 0} [Talk to Ilsa (SC-T4-12)] #scene:SC-T4-12 -> ilsa.sc_t4_12
* {present_ilsa == "T4" && ilsa.sc_t4_12 > 0} [Talk to Ilsa (SC-T4-13)] #scene:SC-T4-13 -> ilsa.sc_t4_13
+ [Look at tools] -> tools
+ [Look at recipe board] -> recipe_board
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
+ [End the day] -> day_end

= tools
Placeholder examinable: tools (hard-key). #id:GB-T4-EX-tools
-> hub

= recipe_board
Placeholder examinable: recipe_board (hard-key). #id:GB-T4-EX-recipe_board
-> hub

= ts_afternoon
Placeholder time-state: T4 at afternoon. #id:GB-T4-TS-afternoon
-> hub

