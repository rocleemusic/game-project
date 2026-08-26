// world/t2.ink — generated from screen_spec T2. Do not hand-edit.

=== t2 ===
Placeholder: Market Row. #screen:T2 #id:GB-T2-INTRO
{ TimeOfDay == morning: -> ts_morning }
{ TimeOfDay == afternoon: -> ts_afternoon }
-> hub

= hub
* {present_toby == "T2" && TimeOfDay != morning} [Talk to Toby (SC-T2-04)] #scene:SC-T2-04 -> toby.sc_t2_04
* {present_toby == "T2" && TimeOfDay != morning} [Talk to Toby (SC-T2-08)] #scene:SC-T2-08 -> toby.sc_t2_08
* {present_toby == "T2" && toby.sc_t2_08 > 0 && KnownPhrases ? shelf_seen && TimeOfDay != morning} [Talk to Toby (SC-T2-09)] #scene:SC-T2-09 -> toby.sc_t2_09
* {present_toby == "T2" && toby.sc_t2_09 > 0 && TimeOfDay != morning} [Talk to Toby (SC-T2-10)] #scene:SC-T2-10 -> toby.sc_t2_10
* {present_toby == "T2" && toby.sc_t2_10 > 0 && KnownPhrases ? shelf_named && TimeOfDay != morning} [Talk to Toby (SC-T2-11)] #scene:SC-T2-11 -> toby.sc_t2_11
* {present_mara == "T2" && mara.sc_t2_14 > 0 && TimeOfDay != morning} [Talk to Mara (SC-T2-24)] #scene:SC-T2-24 -> mara.sc_t2_24
* {present_mara == "T2" && mara.sc_t2_24 > 0 && TimeOfDay != morning} [Talk to Mara (SC-T2-25)] #scene:SC-T2-25 -> mara.sc_t2_25
* {present_mara == "T2" && TimeOfDay != morning} [Talk to Mara (SC-T2-12)] #scene:SC-T2-12 -> mara.sc_t2_12
* {present_mara == "T2" && mara.sc_t2_12 > 0 && TimeOfDay != morning} [Talk to Mara (SC-T2-13)] #scene:SC-T2-13 -> mara.sc_t2_13
* {present_mara == "T2" && mara.sc_t2_13 > 0 && TimeOfDay != morning} [Talk to Mara (SC-T2-14)] #scene:SC-T2-14 -> mara.sc_t2_14
* {present_mara == "T2" && TimeOfDay != morning} [Talk to Mara (SC-T2-22)] #scene:SC-T2-22 -> mara.sc_t2_22
* {present_mara == "T2" && mara.sc_f1_03 > 0 && TimeOfDay != morning} [Talk to Mara (SC-T2-23)] #scene:SC-T2-23 -> mara.sc_t2_23
* {present_toby == "T2"} [Talk to Toby (SC-T2-15)] #scene:SC-T2-15 -> toby.sc_t2_15
* {present_toby == "T2" && toby.sc_t2_15 > 0} [Talk to Toby (SC-T2-16)] #scene:SC-T2-16 -> toby.sc_t2_16
* {present_toby == "T2" && toby.sc_t2_16 > 0} [Talk to Toby (SC-T2-17)] #scene:SC-T2-17 -> toby.sc_t2_17
* {present_toby == "T2" && toby.sc_t2_17 > 0 && TimeOfDay != morning} [Talk to Toby (SC-T2-18)] #scene:SC-T2-18 -> toby.sc_t2_18
* {present_toby == "T2" && TimeOfDay != morning} [Talk to Toby (SC-T2-19)] #scene:SC-T2-19 -> toby.sc_t2_19
* {present_mara == "T2" && toby.sc_t2_19 > 0 && TimeOfDay != morning} [Talk to Mara (SC-T2-20)] #scene:SC-T2-20 -> mara.sc_t2_20
* {present_toby == "T2" && mara.sc_t2_20 > 0 && TimeOfDay != morning} [Talk to Toby (SC-T2-21)] #scene:SC-T2-21 -> toby.sc_t2_21
+ [Look at stall goods] -> stall_goods
+ [Look at ex shelf] -> ex_shelf
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
+ {movesLeft > 0 && TimeOfDay != night} [Go to The Workshop] #lock:locked(G-T4-recipe)
    ~ movesLeft = movesLeft - 1
    { movesLeft > 0:
        -> t4
    - else:
        { TimeOfDay == evening:
            -> day_end
        - else:
            ~ advance_time()
            -> t4
        }
    }
+ {movesLeft > 0 && TimeOfDay != night} [Wait]
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

= stall_goods
Placeholder examinable: stall_goods (soft-signpost). #id:GB-T2-EX-stall_goods
-> hub

= ex_shelf
Placeholder examinable: ex-shelf (soft-signpost). #id:GB-T2-EX-ex-shelf
{ not (KnownPhrases ? shelf_seen):
    ~ KnownPhrases += shelf_seen
    ~ recordKnowledge("shelf_seen")
}
-> hub

= ts_morning
Placeholder time-state: T2 at morning. #id:GB-T2-TS-morning
-> hub

= ts_afternoon
Placeholder time-state: T2 at afternoon. #id:GB-T2-TS-afternoon
-> hub

