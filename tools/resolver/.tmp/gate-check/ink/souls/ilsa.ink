// souls/ilsa.ink — generated. A soul file reads as the person. Do not hand-edit.

=== ilsa ===
-> DONE

= sc_t7_ilsa
- (ch_t7_ilsa_1) { day >= 5: Placeholder set-up: Ilsa has taken a bench-end at the edge, with room beside her. #choice:CH-T7-ilsa-1 #id:L-SC-T7-ilsa-01 #speaker:ilsa }
* {day >= 5} [take the space beside her] #opt:CH-T7-ilsa-1-a
    ~ recordBond("ilsa", "Intimacy")
    Placeholder response: she moves her coat without comment. #id:L-CH-T7-ilsa-1-a-r1 #speaker:ilsa
* {day >= 5} ["Saving that?"] #opt:CH-T7-ilsa-1-b #id:L-CH-T7-ilsa-1-b-p
    ~ recordBond("ilsa", "Trust")
    Placeholder response: she says she is not, and does not move the coat. #id:L-CH-T7-ilsa-1-b-r1 #speaker:ilsa
* -> g_ch_t7_ilsa_1
- (g_ch_t7_ilsa_1) Placeholder: the scene continues. #id:GB-CH-T7-ilsa-1-GATHER
- (ch_t7_ilsa_2) { day >= 5 && bondLevel_ilsa == 0: Placeholder set-up (LOW): the apron stays folded on the bench, and no one names it. #choice:CH-T7-ilsa-2 #id:L-SC-T7-ilsa-02 #speaker:ilsa }
* {day >= 5 && bondLevel_ilsa == 0} ["Whose is that?"] #opt:CH-T7-ilsa-2-a #id:L-CH-T7-ilsa-2-a-p
    ~ recordBond("ilsa", "Trust")
    Placeholder response: she gives a name and changes the subject in one breath. #id:L-CH-T7-ilsa-2-a-r1 #speaker:ilsa
* {day >= 5 && bondLevel_ilsa == 0} [leave the folded apron alone] #opt:CH-T7-ilsa-2-b
    Placeholder response: it stays folded, and she keeps a hand near it. #id:L-CH-T7-ilsa-2-b-r1 #speaker:ilsa
* -> g_ch_t7_ilsa_2
- (g_ch_t7_ilsa_2) Placeholder: the scene continues. #id:GB-CH-T7-ilsa-2-GATHER
- (ch_t7_ilsa_3) { day >= 5 && bondLevel_ilsa == 1: Placeholder set-up (MID): Mara notices the bench-end, and notices who it is for. #choice:CH-T7-ilsa-3 #id:L-SC-T7-ilsa-03 #speaker:ilsa }
* {day >= 5 && bondLevel_ilsa == 1} [shift down so there is room for both] #opt:CH-T7-ilsa-3-a
    ~ recordBond("ilsa", "Intimacy")
    ~ recordThreadMove("kinbound-absence")
    Placeholder response: Ilsa allows it, which is not nothing. #id:L-CH-T7-ilsa-3-a-r1 #speaker:ilsa
* {day >= 5 && bondLevel_ilsa == 1} ["There's room."] #opt:CH-T7-ilsa-3-b #id:L-CH-T7-ilsa-3-b-p
    ~ recordBond("ilsa", "Recognition")
    ~ recordThreadMove("kinbound-absence")
    Placeholder response: Mara sits, and Ilsa does not move the coat back. #id:L-CH-T7-ilsa-3-b-r1 #speaker:ilsa
* -> g_ch_t7_ilsa_3
- (g_ch_t7_ilsa_3) Placeholder: the scene continues. #id:GB-CH-T7-ilsa-3-GATHER
- (ch_t7_ilsa_4) { day >= 5 && bondLevel_ilsa == 2: Placeholder set-up (HIGH): Mara brings the second apron back, shaken out and worn. #choice:CH-T7-ilsa-4 #id:L-SC-T7-ilsa-04 #speaker:ilsa }
* {day >= 5 && bondLevel_ilsa == 2} ["It fits her."] #opt:CH-T7-ilsa-4-a #id:L-CH-T7-ilsa-4-a-p
    ~ recordBond("ilsa", "Recognition")
    ~ recordThreadMove("kinbound-absence")
    Placeholder response: Ilsa says it was cut for someone taller, and lets her keep it. #id:L-CH-T7-ilsa-4-a-r1 #speaker:ilsa
* {day >= 5 && bondLevel_ilsa == 2} [let it be an ordinary thing] #opt:CH-T7-ilsa-4-b
    ~ recordBond("ilsa", "Intimacy")
    ~ recordThreadMove("kinbound-absence")
    Placeholder response: nobody remarks on it, and that is the whole of it. #id:L-CH-T7-ilsa-4-b-r1 #speaker:ilsa
* -> g_ch_t7_ilsa_4
- (g_ch_t7_ilsa_4) Placeholder: the scene continues. #id:GB-CH-T7-ilsa-4-GATHER
- (ch_t7_ilsa_5) { day >= 5: Placeholder set-up: the lanterns go up, and the bench is fuller than it was. #choice:CH-T7-ilsa-5 #id:L-SC-T7-ilsa-05 #speaker:ilsa }
* {day >= 5} [stay until the lanterns are up] #opt:CH-T7-ilsa-5-a
    ~ recordBond("ilsa", "Intimacy")
    Placeholder response: she stays too, longer than she meant to. #id:L-CH-T7-ilsa-5-a-r1 #speaker:ilsa
* {day >= 5} ["Good night, Ilsa."] #opt:CH-T7-ilsa-5-b #id:L-CH-T7-ilsa-5-b-p
    ~ recordBond("ilsa", "Recognition")
    Placeholder response: she uses your name back, which she has not done before. #id:L-CH-T7-ilsa-5-b-r1 #speaker:ilsa
* -> g_ch_t7_ilsa_5
- (g_ch_t7_ilsa_5) Placeholder: the scene continues. #id:GB-CH-T7-ilsa-5-GATHER
-> t7.hub

= sc_t4_07
- (ch_t4_07_1) The forge stands low, more smoke than heat. The centerpiece stock lies cold on the bench, and the day's work sits laid out down the yard, all of it waiting on the fire. #choice:CH-T4-07-1 #id:O-SC-T4-07-1 #speaker:ilsa
* ["What's wrong with the fire?"] #opt:CH-T4-07-1-a #id:L-CH-T4-07-1-a-p
    ~ recordBond("ilsa", "Trust")
    The coal's not giving. So it's file work this morning. #id:L-CH-T4-07-1-a-r1 #speaker:ilsa
    Bench by the window's yours. Good light for it. #id:L-CH-T4-07-1-a-r2 #speaker:ilsa
* [takes up the bellows at the place she states] #opt:CH-T4-07-1-b
    ~ recordBond("ilsa", "Intimacy")
    Take up the bellows. #id:L-CH-T4-07-1-b-act #speaker:ilsa
    That end's yours. Slow strokes till she catches. #id:L-CH-T4-07-1-b-r1 #speaker:ilsa
    Keep on. She'll tell you when she takes. #id:L-CH-T4-07-1-b-r2 #speaker:ilsa
* [carries the cold stock off the bench] #opt:CH-T4-07-1-c
    ~ recordBond("ilsa", "Trust")
    Carry the cold stock off the bench, out of the way. #id:L-CH-T4-07-1-c-act #speaker:ilsa
    Rack by the door. Flat ones lowest. #id:L-CH-T4-07-1-c-r1 #speaker:ilsa
    You'll fetch them back when she's hot. #id:L-CH-T4-07-1-c-r2 #speaker:ilsa
- (g_ch_t4_07_1) Placeholder: the scene continues. #id:GB-CH-T4-07-1-GATHER
- (ch_t4_07_2) Ilsa goes down to the back of the yard and comes back carrying a filled sack across both arms. #choice:CH-T4-07-2 #id:A-SC-T4-07-2 #speaker:ilsa
* [goes with her and carries] #opt:CH-T4-07-2-a
    ~ recordBond("ilsa", "Intimacy")
    Follow her back and carry the second sack. #id:L-CH-T4-07-2-a-act #speaker:ilsa
    By the fire door. Down easy. #id:L-CH-T4-07-2-a-r1 #speaker:ilsa
    Stack the empties under the bench. #id:L-CH-T4-07-2-a-r2 #speaker:ilsa
* ["What are you going back there for?"] #opt:CH-T4-07-2-b #id:L-CH-T4-07-2-b-p
    ~ recordBond("ilsa", "Trust")
    Bellows want you. She's dropping while we stand. #id:L-CH-T4-07-2-b-r1 #speaker:ilsa
    Keep her fed till I'm back. #id:L-CH-T4-07-2-b-r2 #speaker:ilsa
- (g_ch_t4_07_2) Placeholder: the scene continues. #id:GB-CH-T4-07-2-GATHER
- (ch_t4_07_3) What she brought is house fuel, split small and seasoned, the kind laid in against winter. It goes into the forge a measure at a time, and the fire takes. #choice:CH-T4-07-3 #id:A-CH-T4-07-3-s #speaker:ilsa
* ["That's your winter store going in."] #opt:CH-T4-07-3-a #id:L-CH-T4-07-3-a-p
    ~ KnownPhrases += heat_shortfall_seen
    ~ recordKnowledge("heat_shortfall_seen")
    ~ recordThreadMove("ilsa-forge-short")
    ~ recordBond("ilsa", "Recognition")
    It is. It burns clean. #id:L-CH-T4-07-3-a-r1 #speaker:ilsa
    Ilsa banks the fire close and turns the centerpiece stock back into the heat. #id:A-CH-T4-07-3-a-r2 #speaker:ilsa
    You're on the bellows. #id:L-CH-T4-07-3-a-r3 #speaker:ilsa
* [banks the fire with her and lets it stand] #opt:CH-T4-07-3-b
    ~ recordBond("ilsa", "Intimacy")
    Bank the fire with her and let it stand. #id:L-CH-T4-07-3-b-act #speaker:ilsa
    Ilsa lays the last measure along the coals and turns the stock, and the yard goes back to work. #id:A-CH-T4-07-3-b-r1 #speaker:ilsa
- (g_ch_t4_07_3) Placeholder: the scene continues. #id:GB-CH-T4-07-3-GATHER
- (ch_t4_07_4) Day runs different now. Strike work after midday. You're on files. #choice:CH-T4-07-4 #id:L-CH-T4-07-4-s #speaker:ilsa
* [takes the placement she states in the new order] #opt:CH-T4-07-4-a
    ~ recordBond("ilsa", "Intimacy")
    Take up the file work at the bench. #id:L-CH-T4-07-4-a-act #speaker:ilsa
    To the line. No past it. #id:L-CH-T4-07-4-a-r1 #speaker:ilsa
    Your edge is coming on. Keep that angle. #id:L-CH-T4-07-4-a-r2 #speaker:ilsa
* ["What got bumped to make room?"] #opt:CH-T4-07-4-b #id:L-CH-T4-07-4-b-p
    ~ recordBond("ilsa", "Trust")
    Rails went to tomorrow. Small pieces the day after. #id:L-CH-T4-07-4-b-r1 #speaker:ilsa
    It all lands before the raising. It's arranged. #id:L-CH-T4-07-4-b-r2 #speaker:ilsa
- (g_ch_t4_07_4) Placeholder: the scene continues. #id:GB-CH-T4-07-4-GATHER
- (ch_t4_07_5) That's the fire holding. Stock goes back in at midday. #choice:CH-T4-07-5 #id:L-CH-T4-07-5-s #speaker:ilsa
* ["I'll come back tomorrow."] #opt:CH-T4-07-5-a #id:L-CH-T4-07-5-a-p
    ~ recordBond("ilsa", "Trust")
    Morning heat. The near end's yours. #id:L-CH-T4-07-5-a-r1 #speaker:ilsa
    Come any hour. The yard knows you. #id:L-CH-T4-07-5-a-r2 #speaker:ilsa
* [sets the yard's tools straight before leaving] #opt:CH-T4-07-5-b
    ~ recordBond("ilsa", "Intimacy")
    Set the yard's tools straight before leaving. #id:L-CH-T4-07-5-b-act #speaker:ilsa
    That's them home. #id:L-CH-T4-07-5-b-r1 #speaker:ilsa
    Near end's yours in the morning. #id:L-CH-T4-07-5-b-r2 #speaker:ilsa
- (g_ch_t4_07_5) Placeholder: the scene continues. #id:GB-CH-T4-07-5-GATHER
-> t4.hub

= sc_t4_08
- (ch_t4_08_1) The fire holds at working heat. The centerpiece stands part-shaped on the bench, further along than it was. At the crown seat a stay is wanting, and nothing on the bench is that shape. #choice:CH-T4-08-1 #id:O-SC-T4-08-1 #speaker:ilsa
* ["What's the piece still missing?"] #opt:CH-T4-08-1-a #id:L-CH-T4-08-1-a-p
    ~ recordBond("ilsa", "Trust")
    The crown stay. Iron strap, curved to the seat. #id:L-CH-T4-08-1-a-r1 #speaker:ilsa
    Files till it's sorted. Your bench is set. #id:L-CH-T4-08-1-a-r2 #speaker:ilsa
* [takes the place at the bench she states and works] #opt:CH-T4-08-1-b
    ~ recordBond("ilsa", "Intimacy")
    Take the place at the bench she states and work. #id:L-CH-T4-08-1-b-act #speaker:ilsa
    Draw file first, with the curve. #id:L-CH-T4-08-1-b-r1 #speaker:ilsa
    You keep the rag on that peg. #id:L-CH-T4-08-1-b-r2 #speaker:ilsa
- (g_ch_t4_08_1) Placeholder: the scene continues. #id:GB-CH-T4-08-1-GATHER
- (ch_t4_08_2) { KnownPhrases ? heat_shortfall_seen: There's a blank in my stores will take it. Fetch it down. #choice:CH-T4-08-2 #id:L-CH-T4-08-2-s #speaker:ilsa }
* {KnownPhrases ? heat_shortfall_seen} ["The fire, and now this. All out of your own shop."] #opt:CH-T4-08-2-a #id:L-CH-T4-08-2-a-p
    ~ recordBond("ilsa", "Recognition")
    It's what's in reach. #id:L-CH-T4-08-2-a-r1 #speaker:ilsa
    Hold the seat steady while I offer it up. #id:L-CH-T4-08-2-a-r2 #speaker:ilsa
* {KnownPhrases ? heat_shortfall_seen} [takes up the covering work beside her] #opt:CH-T4-08-2-b
    ~ recordBond("ilsa", "Intimacy")
    Take up the covering work beside her. #id:L-CH-T4-08-2-b-act #speaker:ilsa
    Your side files, mine bends. #id:L-CH-T4-08-2-b-r1 #speaker:ilsa
    You see this one to the finish. #id:L-CH-T4-08-2-b-r2 #speaker:ilsa
* -> g_ch_t4_08_2
- (g_ch_t4_08_2) Placeholder: the scene continues. #id:GB-CH-T4-08-2-GATHER
- (ch_t4_08_3) The raising sheet stands on its post by the gate, two columns ruled down it. Names run down the one side. A neighbour adds one and walks on. #choice:CH-T4-08-3 #id:O-SC-T4-08-3 #speaker:ilsa
* [reads down the sheet where it stands] #opt:CH-T4-08-3-a
    ~ recordBond("ilsa", "Intimacy")
    Read down the sheet where it stands. #id:L-CH-T4-08-3-a-act #speaker:ilsa
    -- (ch_t4_08_3_a_1) Ink's on the string if you're putting a name down. #choice:CH-T4-08-3-a-1 #id:L-CH-T4-08-3-a-1-s #speaker:ilsa
    ** ["Your name's in the giving column. Nowhere else."] #opt:CH-T4-08-3-a-1-a #id:L-CH-T4-08-3-a-1-a-p
        ~ KnownPhrases += sheet_giving_only
        ~ recordKnowledge("sheet_giving_only")
        ~ recordThreadMove("ilsa-forge-short")
        ~ recordBond("ilsa", "Recognition")
        That's the side that's mine. The other one… #id:L-CH-T4-08-3-a-1-a-r1 #speaker:ilsa
        Ilsa comes over, squares the sheet on its post, and goes back to the bench. #id:A-CH-T4-08-3-a-1-a-r #speaker:ilsa
    ** [puts their own name in the giving column beside hers] #opt:CH-T4-08-3-a-1-b
        ~ recordBond("ilsa", "Intimacy")
        Put your own name in the giving column, beside hers. #id:L-CH-T4-08-3-a-1-b-act #speaker:ilsa
        That's the lifting sorted, then. #id:L-CH-T4-08-3-a-1-b-r1 #speaker:ilsa
        Pole end by me, raising day. #id:L-CH-T4-08-3-a-1-b-r2 #speaker:ilsa
    -- (g_ch_t4_08_3_a) Placeholder: the scene continues. #id:GB-CH-T4-08-3-a-1-GATHER
* ["Who else is down for hands?"] #opt:CH-T4-08-3-b #id:L-CH-T4-08-3-b-p
    ~ recordBond("ilsa", "Trust")
    Toby's down, and the mill pair. Lifting's covered. #id:L-CH-T4-08-3-b-r1 #speaker:ilsa
    You'll stand at my end on the day. #id:L-CH-T4-08-3-b-r2 #speaker:ilsa
- (g_ch_t4_08_3) Placeholder: the scene continues. #id:GB-CH-T4-08-3-GATHER
- (ch_t4_08_4) Ilsa writes her name in the giving column, under the others, and holds the sheet out to be passed on. The wanting column goes by untouched. #choice:CH-T4-08-4 #id:A-CH-T4-08-4-s #speaker:ilsa
* [hands the sheet on to the next pair of hands] #opt:CH-T4-08-4-a
    ~ recordBond("ilsa", "Intimacy")
    Take the sheet and hand it on to the next pair of hands. #id:L-CH-T4-08-4-a-act #speaker:ilsa
    Bench again. The seat wants truing. #id:L-CH-T4-08-4-a-r1 #speaker:ilsa
    Your file's where you left it. #id:L-CH-T4-08-4-a-r2 #speaker:ilsa
* ["What does the stay do in the piece?"] #opt:CH-T4-08-4-b #id:L-CH-T4-08-4-b-p
    ~ recordBond("ilsa", "Trust")
    Ties the crown to the collar. Takes the swing out of it. #id:L-CH-T4-08-4-b-r1 #speaker:ilsa
    She'll sit quiet once it's in. #id:L-CH-T4-08-4-b-r2 #speaker:ilsa
- (g_ch_t4_08_4) Placeholder: the scene continues. #id:GB-CH-T4-08-4-GATHER
- (ch_t4_08_5) At the crown seat Ilsa takes another way at the joint, bending a length of her own stock to the shape. Nothing is said about the stay. #choice:CH-T4-08-5 #id:A-SC-T4-08-5 #speaker:ilsa
* [works the substitute with her] #opt:CH-T4-08-5-a
    ~ recordBond("ilsa", "Intimacy")
    Work the substitute with her. #id:L-CH-T4-08-5-a-act #speaker:ilsa
    Hold the curve against the seat. I'll bring the heat. #id:L-CH-T4-08-5-a-r1 #speaker:ilsa
    Good. She's taking the shape. #id:L-CH-T4-08-5-a-r2 #speaker:ilsa
* ["Will the other way hold?"] #opt:CH-T4-08-5-b #id:L-CH-T4-08-5-b-p
    ~ recordBond("ilsa", "Trust")
    It holds. I've bent this seam before. #id:L-CH-T4-08-5-b-r1 #speaker:ilsa
    Keep your grip low when she turns. #id:L-CH-T4-08-5-b-r2 #speaker:ilsa
- (g_ch_t4_08_5) Placeholder: the scene continues. #id:GB-CH-T4-08-5-GATHER
- (ch_t4_08_6) That's the day. Sheet stands till raising morning. #choice:CH-T4-08-6 #id:L-CH-T4-08-6-s #speaker:ilsa
* ["I'll be at the raising."] #opt:CH-T4-08-6-a #id:L-CH-T4-08-6-a-p
    ~ recordBond("ilsa", "Trust")
    Midday start. You're on the near pole. #id:L-CH-T4-08-6-a-r1 #speaker:ilsa
    You'll eat with us before the lift. #id:L-CH-T4-08-6-a-r2 #speaker:ilsa
* [sets the sheet straight on its post before leaving] #opt:CH-T4-08-6-b
    ~ recordBond("ilsa", "Intimacy")
    Set the sheet straight on its post before leaving. #id:L-CH-T4-08-6-b-act #speaker:ilsa
    That'll see the week out. #id:L-CH-T4-08-6-b-r1 #speaker:ilsa
    First heat's early tomorrow. Your end's ready. #id:L-CH-T4-08-6-b-r2 #speaker:ilsa
- (g_ch_t4_08_6) Placeholder: the scene continues. #id:GB-CH-T4-08-6-GATHER
-> t4.hub

= sc_t4_09
- (ch_t4_09_1) The yard is mid-work, fire running steady. The centerpiece stands at the fitting-place at the end of the bench, brought up to it and no further. The work around it goes on. #choice:CH-T4-09-1 #id:O-SC-T4-09-1 #speaker:ilsa
* ["What's left to do?"] #opt:CH-T4-09-1-a #id:L-CH-T4-09-1-a-p
    ~ recordBond("ilsa", "Trust")
    The fitting, then polish. The rest's done or near it. #id:L-CH-T4-09-1-a-r1 #speaker:ilsa
    Your files are out already. #id:L-CH-T4-09-1-a-r2 #speaker:ilsa
* [takes up the work at the place she states] #opt:CH-T4-09-1-b
    ~ recordBond("ilsa", "Intimacy")
    Take up the work at the place she states. #id:L-CH-T4-09-1-b-act #speaker:ilsa
    Left of the vice. Long strokes. #id:L-CH-T4-09-1-b-r1 #speaker:ilsa
    You've got the feel of it now. #id:L-CH-T4-09-1-b-r2 #speaker:ilsa
* [stands with the piece where it stops] #opt:CH-T4-09-1-c
    ~ recordBond("ilsa", "Trust")
    Stand with the piece where it stops. #id:L-CH-T4-09-1-c-act #speaker:ilsa
    Room on that side. You're not in the way. #id:L-CH-T4-09-1-c-r1 #speaker:ilsa
- (g_ch_t4_09_1) Placeholder: the scene continues. #id:GB-CH-T4-09-1-GATHER
- (ch_t4_09_2) { KnownPhrases ? heat_shortfall_seen: Fire gets fed on the half hour. She holds her heat. #choice:CH-T4-09-2 #id:L-CH-T4-09-2-s #speaker:ilsa }
* {KnownPhrases ? heat_shortfall_seen} ["Your winter store, burning for work that's stopped."] #opt:CH-T4-09-2-a #id:L-CH-T4-09-2-a-p
    ~ recordBond("ilsa", "Recognition")
    It burns the same either way. #id:L-CH-T4-09-2-a-r1 #speaker:ilsa
    Bellows, while you're standing there. #id:L-CH-T4-09-2-a-r2 #speaker:ilsa
* {KnownPhrases ? heat_shortfall_seen} [keeps the fire fed anyway] #opt:CH-T4-09-2-b
    ~ recordBond("ilsa", "Intimacy")
    Keep the fire fed anyway. #id:L-CH-T4-09-2-b-act #speaker:ilsa
    Good. Hold her just there. #id:L-CH-T4-09-2-b-r1 #speaker:ilsa
* -> g_ch_t4_09_2
- (g_ch_t4_09_2) Placeholder: the scene continues. #id:GB-CH-T4-09-2-GATHER
- (ch_t4_09_3) Ilsa brings the piece up to the fitting-place and offers it in. It does not pass. She sets it down where it stopped. #choice:CH-T4-09-3 #id:A-CH-T4-09-3-s #speaker:ilsa
* ["It's stopped for something that isn't in town."] #opt:CH-T4-09-3-a #id:L-CH-T4-09-3-a-p
    ~ KnownPhrases += ore_short_named
    ~ recordKnowledge("ore_short_named")
    ~ recordThreadMove("ilsa-forge-short")
    ~ recordBond("ilsa", "Recognition")
    The fitting holds for it. It comes when… #id:L-CH-T4-09-3-a-r1 #speaker:ilsa
    Ilsa lifts the stopped piece off the bench and sets it aside, clear of the day's work. #id:A-CH-T4-09-3-a-r #speaker:ilsa
* [sets the piece down and leaves it where it stopped] #opt:CH-T4-09-3-b
    ~ recordBond("ilsa", "Intimacy")
    Leave the piece where it stopped. #id:L-CH-T4-09-3-b-act #speaker:ilsa
- (g_ch_t4_09_3) Placeholder: the scene continues. #id:GB-CH-T4-09-3-GATHER
- (ch_t4_09_4) By midday the yard is turned around the gap. Rail work comes forward onto the cleared bench and the day runs on it. Nothing is said. #choice:CH-T4-09-4 #id:A-SC-T4-09-4 #speaker:ilsa
* [carries the stopped piece to where she points] #opt:CH-T4-09-4-a
    ~ recordBond("ilsa", "Intimacy")
    Carry the stopped piece to where she points. #id:L-CH-T4-09-4-a-act #speaker:ilsa
    Top rail of the rack. Easy on the collar end. #id:L-CH-T4-09-4-a-r1 #speaker:ilsa
    Two hands under the crown. She's heavier than she looks. #id:L-CH-T4-09-4-a-r2 #speaker:ilsa
* ["What comes forward instead?"] #opt:CH-T4-09-4-b #id:L-CH-T4-09-4-b-p
    ~ recordBond("ilsa", "Trust")
    Rails today, brackets after. All of it lands in time. #id:L-CH-T4-09-4-b-r1 #speaker:ilsa
    The fitting stays where I can see it. #id:L-CH-T4-09-4-b-r2 #speaker:ilsa
- (g_ch_t4_09_4) Placeholder: the scene continues. #id:GB-CH-T4-09-4-GATHER
- (ch_t4_09_5) { KnownPhrases ? sheet_giving_only: The raising sheet stands on its post past the gate, filling. Names run down the giving column. The other column is empty the length of the page. #choice:CH-T4-09-5 #id:O-CH-T4-09-5-s #speaker:ilsa }
* {KnownPhrases ? sheet_giving_only} ["Sheet's still up. Your name's still one side only."] #opt:CH-T4-09-5-a #id:L-CH-T4-09-5-a-p
    ~ recordBond("ilsa", "Recognition")
    Vice end wants you. Rail's ready for truing. #id:L-CH-T4-09-5-a-r1 #speaker:ilsa
    Straight edge is at your left hand. #id:L-CH-T4-09-5-a-r2 #speaker:ilsa
* {KnownPhrases ? sheet_giving_only} [squares the sheet on its post and leaves it] #opt:CH-T4-09-5-b
    ~ recordBond("ilsa", "Intimacy")
    Square the sheet on its post and leave it. #id:L-CH-T4-09-5-b-act #speaker:ilsa
    It'll stand till it's wanted. #id:L-CH-T4-09-5-b-r1 #speaker:ilsa
* -> g_ch_t4_09_5
- (g_ch_t4_09_5) Placeholder: the scene continues. #id:GB-CH-T4-09-5-GATHER
- (ch_t4_09_6) Scroll ends can go on. They hang clear of the fitting. #choice:CH-T4-09-6 #id:L-CH-T4-09-6-s #speaker:ilsa
* [works the parts that can go on] #opt:CH-T4-09-6-a
    ~ recordBond("ilsa", "Intimacy")
    Work the parts that can go on. #id:L-CH-T4-09-6-a-act #speaker:ilsa
    Take the outer curl. Match mine. #id:L-CH-T4-09-6-a-r1 #speaker:ilsa
    That's a fair match. Keep it. #id:L-CH-T4-09-6-a-r2 #speaker:ilsa
* ["What does the ore do in the piece?"] #opt:CH-T4-09-6-b #id:L-CH-T4-09-6-b-p
    ~ recordBond("ilsa", "Trust")
    Any iron takes the shape. The weight wants the ore. #id:L-CH-T4-09-6-b-r1 #speaker:ilsa
    It goes in at the collar, last. #id:L-CH-T4-09-6-b-r2 #speaker:ilsa
- (g_ch_t4_09_6) Placeholder: the scene continues. #id:GB-CH-T4-09-6-GATHER
- (ch_t4_09_7) Day's done. Tomorrow runs rails, then the scrolls. #choice:CH-T4-09-7 #id:L-CH-T4-09-7-s #speaker:ilsa
* [takes the place she states] #opt:CH-T4-09-7-a
    ~ recordBond("ilsa", "Intimacy")
    Set your tools at the place she states for tomorrow. #id:L-CH-T4-09-7-a-act #speaker:ilsa
    They'll be waiting where you leave them. #id:L-CH-T4-09-7-a-r1 #speaker:ilsa
* ["I'll come back tomorrow."] #opt:CH-T4-09-7-b #id:L-CH-T4-09-7-b-p
    ~ recordBond("ilsa", "Trust")
    First heat's yours. Vice end. #id:L-CH-T4-09-7-b-r1 #speaker:ilsa
    You wake her tomorrow. She's laid ready. #id:L-CH-T4-09-7-b-r2 #speaker:ilsa
- (g_ch_t4_09_7) Placeholder: the scene continues. #id:GB-CH-T4-09-7-GATHER
- (ch_t4_09_8) Fire's banked. The fitting stays as she sits. #choice:CH-T4-09-8 #id:L-CH-T4-09-8-s #speaker:ilsa
* [sets the tools by the stopped piece straight] #opt:CH-T4-09-8-a
    ~ recordBond("ilsa", "Intimacy")
    Set the tools by the stopped piece straight. #id:L-CH-T4-09-8-a-act #speaker:ilsa
    They'll keep till they're wanted. #id:L-CH-T4-09-8-a-r1 #speaker:ilsa
    Gate's on the latch till you're through. #id:L-CH-T4-09-8-a-r2 #speaker:ilsa
* ["What time is the raising?"] #opt:CH-T4-09-8-b #id:L-CH-T4-09-8-b-p
    ~ recordBond("ilsa", "Trust")
    Midday. The piece goes over first. #id:L-CH-T4-09-8-b-r1 #speaker:ilsa
    You're at my end of the carry. #id:L-CH-T4-09-8-b-r2 #speaker:ilsa
- (g_ch_t4_09_8) Placeholder: the scene continues. #id:GB-CH-T4-09-8-GATHER
-> t4.hub

= sc_t4_10
- (ch_t4_10_1) Raising morning. The fire is down to grey, the bench cleared its whole length, and the centerpiece stands off the bench for the first time, wrapped for the carry. #choice:CH-T4-10-1 #id:O-SC-T4-10-1 #speaker:ilsa
* [takes the place she states at the piece] #opt:CH-T4-10-1-a
    ~ recordBond("ilsa", "Intimacy")
    Take the place she states at the piece. #id:L-CH-T4-10-1-a-act #speaker:ilsa
    Crown end's yours for the strapping. #id:L-CH-T4-10-1-a-r1 #speaker:ilsa
    Strap goes twice round, flat both turns. #id:L-CH-T4-10-1-a-r2 #speaker:ilsa
* ["What still has to happen today?"] #opt:CH-T4-10-1-b #id:L-CH-T4-10-1-b-p
    ~ recordBond("ilsa", "Trust")
    Straps, the carry, then she goes up. All settled. #id:L-CH-T4-10-1-b-r1 #speaker:ilsa
    You're in the carry. Low end. #id:L-CH-T4-10-1-b-r2 #speaker:ilsa
- (g_ch_t4_10_1) Placeholder: the scene continues. #id:GB-CH-T4-10-1-GATHER
- (ch_t4_10_2) { KnownPhrases ? ore_short_named: Last look at the fitting. Hold her level for me. #choice:CH-T4-10-2 #id:L-CH-T4-10-2-s #speaker:ilsa }
* {KnownPhrases ? ore_short_named} ["That's the joint the work stopped at."] #opt:CH-T4-10-2-a #id:L-CH-T4-10-2-a-p
    ~ recordBond("ilsa", "Recognition")
    It's the one I check last. #id:L-CH-T4-10-2-a-r1 #speaker:ilsa
    Strap end. We lift on my word. #id:L-CH-T4-10-2-a-r2 #speaker:ilsa
* {KnownPhrases ? ore_short_named} [steadies the piece while she checks it] #opt:CH-T4-10-2-b
    ~ recordBond("ilsa", "Intimacy")
    Steady the piece while she checks it. #id:L-CH-T4-10-2-b-act #speaker:ilsa
    Level. Hold it just there. #id:L-CH-T4-10-2-b-r1 #speaker:ilsa
* -> g_ch_t4_10_2
- (g_ch_t4_10_2) Placeholder: the scene continues. #id:GB-CH-T4-10-2-GATHER
- (ch_t4_10_3) Gate end first. Slow at the turn. #choice:CH-T4-10-3 #id:L-CH-T4-10-3-s #speaker:ilsa
* [takes an end and carries] #opt:CH-T4-10-3-a
    ~ recordBond("ilsa", "Intimacy")
    Take an end and carry. #id:L-CH-T4-10-3-a-act #speaker:ilsa
    You've the low end. Keep it off your knee. #id:L-CH-T4-10-3-a-r1 #speaker:ilsa
    Set down twice on the way. My call. #id:L-CH-T4-10-3-a-r2 #speaker:ilsa
* ["Where does it go on the arch?"] #opt:CH-T4-10-3-b #id:L-CH-T4-10-3-b-p
    ~ recordBond("ilsa", "Trust")
    Top and centre, over the road. #id:L-CH-T4-10-3-b-r1 #speaker:ilsa
    You'll stand under it tonight. #id:L-CH-T4-10-3-b-r2 #speaker:ilsa
- (g_ch_t4_10_3) Placeholder: the scene continues. #id:GB-CH-T4-10-3-GATHER
- (ch_t4_10_4) { KnownPhrases ? ore_sourced: Ilsa sets the joint that took the real ore square under her thumb, once, and goes back to the carrying. #choice:CH-T4-10-4 #id:A-CH-T4-10-4-s #speaker:ilsa }
* {KnownPhrases ? ore_sourced} [stands with the piece as it goes up] #opt:CH-T4-10-4-a
    ~ recordBond("ilsa", "Intimacy")
    Stand with the piece as it goes up. #id:L-CH-T4-10-4-a-act #speaker:ilsa
    ~ enteredByDivert = true
    -> ilsa.sc_t4_10.ch_t4_10_6
* {KnownPhrases ? ore_sourced} ["The joint took the real ore."] #opt:CH-T4-10-4-b #id:L-CH-T4-10-4-b-p
    ~ recordBond("ilsa", "Recognition")
    It did. It carries. #id:L-CH-T4-10-4-b-r1 #speaker:ilsa
    ~ enteredByDivert = true
    -> ilsa.sc_t4_10.ch_t4_10_6
* -> g_ch_t4_10_4
- (g_ch_t4_10_4) Placeholder: the scene continues. #id:GB-CH-T4-10-4-GATHER
- (ch_t4_10_5) Ilsa runs a thumb over the joint in the other metal, once, and takes up her end of the carry. #choice:CH-T4-10-5 #id:A-CH-T4-10-5-s #speaker:ilsa
* [stands with the piece as it goes up] #opt:CH-T4-10-5-a
    ~ recordBond("ilsa", "Intimacy")
    Stand with the piece as it goes up. #id:L-CH-T4-10-5-a-act #speaker:ilsa
* ["That joint's in the other metal."] #opt:CH-T4-10-5-b #id:L-CH-T4-10-5-b-p
    ~ recordBond("ilsa", "Recognition")
    It is. It carries. #id:L-CH-T4-10-5-b-r1 #speaker:ilsa
- (g_ch_t4_10_5) Placeholder: the scene continues. #id:GB-CH-T4-10-5-GATHER
- (ch_t4_10_6) The arch takes the piece at top and centre. At dusk the lanterns are lit down its whole length. #choice:CH-T4-10-6 #id:A-SC-T4-10-6 #speaker:ilsa
* [stands with her under the lit arch and says nothing] #opt:CH-T4-10-6-a
    ~ recordBond("ilsa", "Intimacy")
    Stand with her under the lit arch and say nothing. #id:L-CH-T4-10-6-a-act #speaker:ilsa
    It'll burn all week. #id:L-CH-T4-10-6-a-r1 #speaker:ilsa
    Bench runs again the morning after. Your end holds. #id:L-CH-T4-10-6-a-r2 #speaker:ilsa
* ["I'll be at your bench tomorrow."] #opt:CH-T4-10-6-b #id:L-CH-T4-10-6-b-p
    ~ recordBond("ilsa", "Trust")
    Midday heat. Your end's laid ready. #id:L-CH-T4-10-6-b-r1 #speaker:ilsa
    There'll be work enough. There always is. #id:L-CH-T4-10-6-b-r2 #speaker:ilsa
- (g_ch_t4_10_6) Placeholder: the scene continues. #id:GB-CH-T4-10-6-GATHER
    ~ enteredByDivert = false
-> t4.hub

= sc_t4_03
- (ch_t4_03_1) The bench is laid out for the day. Tool sets down its length, one set more than the hands in the yard. The near end stands clear. The second apron lies at the far end, tongs beside it. #choice:CH-T4-03-1 #id:O-SC-T4-03-1 #speaker:ilsa
* ["How far along is it?"] #opt:CH-T4-03-1-a #id:L-CH-T4-03-1-a-p
    ~ recordBond("ilsa", "Trust")
    Past halfway. It goes to the arch whole. #id:L-CH-T4-03-1-a-r1 #speaker:ilsa
    Come see. You can stand at this side. #id:L-CH-T4-03-1-a-r2 #speaker:ilsa
* [steps in on the yard work at hand] #opt:CH-T4-03-1-b
    ~ recordBond("ilsa", "Intimacy")
    Bring the coal barrow in to the fire. #id:L-CH-T4-03-1-b-act #speaker:ilsa
    Tip it left of the tub. #id:L-CH-T4-03-1-b-r1 #speaker:ilsa
    Your gloves are on the peg. #id:L-CH-T4-03-1-b-r2 #speaker:ilsa
* ["That's a lot of tongs for two people."] #opt:CH-T4-03-1-c #id:L-CH-T4-03-1-c-p
    ~ recordBond("ilsa", "Recognition")
    Every pair has its hands. #id:L-CH-T4-03-1-c-r1 #speaker:ilsa
    Yours are the short-jawed ones. Near end. #id:L-CH-T4-03-1-c-r2 #speaker:ilsa
- (g_ch_t4_03_1) Placeholder: the scene continues. #id:GB-CH-T4-03-1-GATHER
- (ch_t4_03_2) Ilsa draws the stock, turns it twice on the anvil, and sets it back in the fire. The bellows handle stands in reach of the near end. #choice:CH-T4-03-2 #id:A-SC-T4-03-2 #speaker:ilsa
* [takes the near end and takes up the work] #opt:CH-T4-03-2-a
    ~ KnownPhrases += bench_end_taken
    ~ recordKnowledge("bench_end_taken")
    ~ recordThreadMove("ilsa-kin-no-show")
    Take the near end and work the bellows through the heat. #id:L-CH-T4-03-2-a-act #speaker:ilsa
    That's it. Keep that pace. #id:L-CH-T4-03-2-a-r1 #speaker:ilsa
    Water's by the tub. We drink at the turn. #id:L-CH-T4-03-2-a-r2 #speaker:ilsa
* ["I'll just watch today, if that's alright."] #opt:CH-T4-03-2-b #id:L-CH-T4-03-2-b-p
    ~ recordBond("ilsa", "Intimacy")
    Stool is by the door, then. #id:L-CH-T4-03-2-b-r1 #speaker:ilsa
    Mind the sparks off the first strike. #id:L-CH-T4-03-2-b-r2 #speaker:ilsa
- (g_ch_t4_03_2) Placeholder: the scene continues. #id:GB-CH-T4-03-2-GATHER
- (ch_t4_03_3) Crown is the last big piece. File work after. #choice:CH-T4-03-3 #id:L-CH-T4-03-3-s #speaker:ilsa
* ["Where does this part sit on the arch?"] #opt:CH-T4-03-3-a #id:L-CH-T4-03-3-a-p
    ~ recordBond("ilsa", "Trust")
    Top and centre. The lanterns hang off it. #id:L-CH-T4-03-3-a-r1 #speaker:ilsa
    You'll see it best from under, raising day. #id:L-CH-T4-03-3-a-r2 #speaker:ilsa
* [clears the bench of scale ahead of the next heat] #opt:CH-T4-03-3-b
    ~ recordBond("ilsa", "Intimacy")
    Sweep the scale off the bench before the next heat. #id:L-CH-T4-03-3-b-act #speaker:ilsa
    Brush hangs on the bench leg. #id:L-CH-T4-03-3-b-r1 #speaker:ilsa
    Crown comes off in a minute. Stand clear of my elbow. #id:L-CH-T4-03-3-b-r2 #speaker:ilsa
- (g_ch_t4_03_3) Placeholder: the scene continues. #id:GB-CH-T4-03-3-GATHER
- (ch_t4_03_4) At the collar of the crown a socket stands empty, filed bright and waiting. Nothing on the bench fits it. #choice:CH-T4-03-4 #id:O-SC-T4-03-4 #speaker:ilsa
* ["What's special about the ore?"] #opt:CH-T4-03-4-a #id:L-CH-T4-03-4-a-p
    ~ recordBond("ilsa", "Trust")
    Nothing in town touches it. It comes in from the forest. #id:L-CH-T4-03-4-a-r1 #speaker:ilsa
    The collar wants it. Plain iron splits at that weight. #id:L-CH-T4-03-4-a-r2 #speaker:ilsa
    -- (ch_t4_03_4_a_1) As she talks, Ilsa squares the far-end tongs a hand truer to the bench edge. #choice:CH-T4-03-4-a-1 #id:A-CH-T4-03-4-a-1-s #speaker:ilsa
    ** ["His end of the bench is all set for him."] #opt:CH-T4-03-4-a-1-a #id:L-CH-T4-03-4-a-1-a-p
        ~ recordBond("ilsa", "Recognition")
        It's his. #id:L-CH-T4-03-4-a-1-a-r1 #speaker:ilsa
        He'll want the long tongs for the collar. #id:L-CH-T4-03-4-a-1-a-r2 #speaker:ilsa
    ** [turns back to the heat with her] #opt:CH-T4-03-4-a-1-b
        ~ recordBond("ilsa", "Intimacy")
        Turn back to the fire and take up the bellows. #id:L-CH-T4-03-4-a-1-b-act #speaker:ilsa
        Right. Bring her up slow. #id:L-CH-T4-03-4-a-1-b-r1 #speaker:ilsa
    -- (g_ch_t4_03_4_a) Placeholder: the scene continues. #id:GB-CH-T4-03-4-a-1-GATHER
* [sets the next day's work forward on the bench] #opt:CH-T4-03-4-b
    ~ recordBond("ilsa", "Intimacy")
    Set the next day's work forward on the bench. #id:L-CH-T4-03-4-b-act #speaker:ilsa
    That saves the morning. #id:L-CH-T4-03-4-b-r1 #speaker:ilsa
    Leave the collar clear. The ore goes there first. #id:L-CH-T4-03-4-b-r2 #speaker:ilsa
- (g_ch_t4_03_4) Placeholder: the scene continues. #id:GB-CH-T4-03-4-GATHER
- (ch_t4_03_5) The light is going. Ilsa squares the tools at the near end and lays the apron over the rail, ready for tomorrow. #choice:CH-T4-03-5 #id:A-SC-T4-03-5 #speaker:ilsa
* [squares the near-end tools before going] #opt:CH-T4-03-5-a
    ~ recordBond("ilsa", "Intimacy")
    Square your own tools at the near end before going. #id:L-CH-T4-03-5-a-act #speaker:ilsa
    They'll be there in the morning. #id:L-CH-T4-03-5-a-r1 #speaker:ilsa
    Go by the road. The path is dark by now. #id:L-CH-T4-03-5-a-r2 #speaker:ilsa
* ["I'll be back for the next heat."] #opt:CH-T4-03-5-b #id:L-CH-T4-03-5-b-p
    ~ recordBond("ilsa", "Trust")
    Midday. The bellows will want you. #id:L-CH-T4-03-5-b-r1 #speaker:ilsa
    Bram's ore may be in by then. #id:L-CH-T4-03-5-b-r2 #speaker:ilsa
- (g_ch_t4_03_5) Placeholder: the scene continues. #id:GB-CH-T4-03-5-GATHER
-> t4.hub

= sc_t4_04
- (ch_t4_04_1) Morning. The bench is laid out down its length. Bram's tools go out at the far end with the rest, set and not yet touched. #choice:CH-T4-04-1 #id:O-SC-T4-04-1 #speaker:ilsa
* ["How's the day going?"] #opt:CH-T4-04-1-a #id:L-CH-T4-04-1-a-p
    ~ recordBond("ilsa", "Trust")
    Filing till midday. The ore comes when it comes. #id:L-CH-T4-04-1-a-r1 #speaker:ilsa
    Stool inside the door is yours. #id:L-CH-T4-04-1-a-r2 #speaker:ilsa
* [stays at the yard edge through a heat] #opt:CH-T4-04-1-b
    ~ recordBond("ilsa", "Intimacy")
    Stand at the yard edge through a heat. #id:L-CH-T4-04-1-b-act #speaker:ilsa
    Sparks reach where you're stood. #id:L-CH-T4-04-1-b-r1 #speaker:ilsa
    You can see her best from there. #id:L-CH-T4-04-1-b-r2 #speaker:ilsa
- (g_ch_t4_04_1) Placeholder: the scene continues. #id:GB-CH-T4-04-1-GATHER
- (ch_t4_04_2) { KnownPhrases ? bench_end_taken: You're filing the crown side. I've the collar. #choice:CH-T4-04-2 #id:L-CH-T4-04-2-s #speaker:ilsa }
* {KnownPhrases ? bench_end_taken} [takes up their end and the day's first heat] #opt:CH-T4-04-2-a
    ~ recordBond("ilsa", "Intimacy")
    Take up the near end and the day's first heat. #id:L-CH-T4-04-2-a-act #speaker:ilsa
    That's it. Long strokes, with the curve. #id:L-CH-T4-04-2-a-r1 #speaker:ilsa
    Water's where it always is. #id:L-CH-T4-04-2-a-r2 #speaker:ilsa
* {KnownPhrases ? bench_end_taken} ["What's the plan for today?"] #opt:CH-T4-04-2-b #id:L-CH-T4-04-2-b-p
    ~ recordBond("ilsa", "Trust")
    Filing this side. Bram sets the ore in at the collar. #id:L-CH-T4-04-2-b-r1 #speaker:ilsa
    Plenty in it for every pair of hands. #id:L-CH-T4-04-2-b-r2 #speaker:ilsa
* -> g_ch_t4_04_2
- (g_ch_t4_04_2) Placeholder: the scene continues. #id:GB-CH-T4-04-2-GATHER
- (ch_t4_04_3) Light's for one more heat. We take it. #choice:CH-T4-04-3 #id:L-CH-T4-04-3-s #speaker:ilsa
* ["Any word come today?"] #opt:CH-T4-04-3-a #id:L-CH-T4-04-3-a-p
    ~ recordBond("ilsa", "Trust")
    None came. #id:L-CH-T4-04-3-a-r1 #speaker:ilsa
    You're on the bellows for the last heat. #id:L-CH-T4-04-3-a-r2 #speaker:ilsa
* [keeps the work moving through the afternoon] #opt:CH-T4-04-3-b
    ~ recordBond("ilsa", "Intimacy")
    Keep the work moving through the afternoon. #id:L-CH-T4-04-3-b-act #speaker:ilsa
    Collar side next. Bring the small file. #id:L-CH-T4-04-3-b-r1 #speaker:ilsa
- (g_ch_t4_04_3) Placeholder: the scene continues. #id:GB-CH-T4-04-3-GATHER
- (ch_t4_04_4) Dusk. Ilsa gathers Bram's tools from the far end and carries them to the rack, the same motion as every dusk. #choice:CH-T4-04-4 #id:A-SC-T4-04-4 #speaker:ilsa
* ["Today was his day. He didn't come."] #opt:CH-T4-04-4-a #id:L-CH-T4-04-4-a-p
    ~ KnownPhrases += absence_witnessed
    ~ recordKnowledge("absence_witnessed")
    ~ recordThreadMove("ilsa-kin-no-show")
    ~ recordBond("ilsa", "Recognition")
    He didn't. #id:L-CH-T4-04-4-a-r1 #speaker:ilsa
    Ilsa finishes racking the tools before anything else is said. His set goes in beside hers. #id:A-CH-T4-04-4-a-r #speaker:ilsa
    -- (ch_t4_04_4_a_1) You're filing the collar side tomorrow. Midday heat. #choice:CH-T4-04-4-a-1 #id:L-CH-T4-04-4-a-1-s #speaker:ilsa
    ** [stands into the arrangement without another word] #opt:CH-T4-04-4-a-1-a
        ~ recordBond("ilsa", "Intimacy")
        Stand into the arrangement without another word. #id:L-CH-T4-04-4-a-1-a-act #speaker:ilsa
        Good. Midday, then. #id:L-CH-T4-04-4-a-1-a-r1 #speaker:ilsa
    ** ["I'll be at the collar side by midday."] #opt:CH-T4-04-4-a-1-b #id:L-CH-T4-04-4-a-1-b-p
        ~ recordBond("ilsa", "Trust")
        Then that's tomorrow settled. #id:L-CH-T4-04-4-a-1-b-r1 #speaker:ilsa
    -- (g_ch_t4_04_4_a) Placeholder: the scene continues. #id:GB-CH-T4-04-4-a-1-GATHER
* [helps put the tools away, lets the day stand] #opt:CH-T4-04-4-b
    ~ recordBond("ilsa", "Intimacy")
    Help carry the tools to the rack and let the day stand. #id:L-CH-T4-04-4-b-act #speaker:ilsa
    His set hangs on the end pegs. #id:L-CH-T4-04-4-b-r1 #speaker:ilsa
    Yours stay out for tomorrow. #id:L-CH-T4-04-4-b-r2 #speaker:ilsa
- (g_ch_t4_04_4) Placeholder: the scene continues. #id:GB-CH-T4-04-4-GATHER
- (ch_t4_04_5) { KnownPhrases ? cover_witnessed: The rack at dusk. His tools hang stowed among the rest, oiled and squared, nothing to pick them out. #choice:CH-T4-04-5 #id:O-CH-T4-04-5-s #speaker:ilsa }
* {KnownPhrases ? cover_witnessed} ["This one's covered already, too."] #opt:CH-T4-04-5-a #id:L-CH-T4-04-5-a-p
    ~ recordBond("ilsa", "Recognition")
    It's put away. #id:L-CH-T4-04-5-a-r1 #speaker:ilsa
    You're first at the fire tomorrow. #id:L-CH-T4-04-5-a-r2 #speaker:ilsa
* {KnownPhrases ? cover_witnessed} [stands with her at the racked tools, saying nothing] #opt:CH-T4-04-5-b
    ~ recordBond("ilsa", "Intimacy")
    Stand with her at the racked tools, saying nothing. #id:L-CH-T4-04-5-b-act #speaker:ilsa
    We start early tomorrow. #id:L-CH-T4-04-5-b-r1 #speaker:ilsa
* -> g_ch_t4_04_5
- (g_ch_t4_04_5) Placeholder: the scene continues. #id:GB-CH-T4-04-5-GATHER
- (ch_t4_04_6) That's the day. Same again tomorrow. #choice:CH-T4-04-6 #id:L-CH-T4-04-6-s #speaker:ilsa
* [sets the near-end tools away alongside hers] #opt:CH-T4-04-6-a
    ~ recordBond("ilsa", "Intimacy")
    Set the near-end tools away alongside hers. #id:L-CH-T4-04-6-a-act #speaker:ilsa
    They'll be out again by the time you're here. #id:L-CH-T4-04-6-a-r1 #speaker:ilsa
    Gate latch sticks. Lift it as you go. #id:L-CH-T4-04-6-a-r2 #speaker:ilsa
* ["I'll come by tomorrow."] #opt:CH-T4-04-6-b #id:L-CH-T4-04-6-b-p
    ~ recordBond("ilsa", "Trust")
    Midday heat. Your end will be out. #id:L-CH-T4-04-6-b-r1 #speaker:ilsa
- (g_ch_t4_04_6) Placeholder: the scene continues. #id:GB-CH-T4-04-6-GATHER
-> t4.hub

= sc_t4_05
- (ch_t4_05_1) Bram's part of the raising work stands finished at the far end, cooled and stacked. Each bend in it closes the way the crown's bends close. His name holds its line on the raising sheet. #choice:CH-T4-05-1 #id:O-SC-T4-05-1 #speaker:ilsa
* ["When did his part get done?"] #opt:CH-T4-05-1-a #id:L-CH-T4-05-1-a-p
    ~ recordBond("ilsa", "Trust")
    Sometime this week. #id:L-CH-T4-05-1-a-r1 #speaker:ilsa
    Yours today is fine work. Take the small file. #id:L-CH-T4-05-1-a-r2 #speaker:ilsa
* [takes up their own work at the near end] #opt:CH-T4-05-1-b
    ~ recordBond("ilsa", "Intimacy")
    Take up your own work at the near end. #id:L-CH-T4-05-1-b-act #speaker:ilsa
    Edges first. She'll want them clean for the fitting. #id:L-CH-T4-05-1-b-r1 #speaker:ilsa
- (g_ch_t4_05_1) Placeholder: the scene continues. #id:GB-CH-T4-05-1-GATHER
- (ch_t4_05_2) { KnownPhrases ? bench_end_taken: Your share's set out at your end. Edges first. #choice:CH-T4-05-2 #id:L-CH-T4-05-2-s #speaker:ilsa }
* {KnownPhrases ? bench_end_taken} [takes the laid-out work] #opt:CH-T4-05-2-a
    ~ recordBond("ilsa", "Intimacy")
    Take the laid-out work. #id:L-CH-T4-05-2-a-act #speaker:ilsa
    That's the morning sorted. #id:L-CH-T4-05-2-a-r1 #speaker:ilsa
    Shout when the first one's done. #id:L-CH-T4-05-2-a-r2 #speaker:ilsa
* {KnownPhrases ? bench_end_taken} ["My share was set out before I got here."] #opt:CH-T4-05-2-b #id:L-CH-T4-05-2-b-p
    ~ recordBond("ilsa", "Trust")
    It's always out. #id:L-CH-T4-05-2-b-r1 #speaker:ilsa
    Start on the edges. I'm on the collar. #id:L-CH-T4-05-2-b-r2 #speaker:ilsa
* -> g_ch_t4_05_2
- (g_ch_t4_05_2) Placeholder: the scene continues. #id:GB-CH-T4-05-2-GATHER
- (ch_t4_05_3) That stack rides to the raising as it stands. #choice:CH-T4-05-3 #id:L-CH-T4-05-3-s #speaker:ilsa
* ["The bends close your way. This is your work."] #opt:CH-T4-05-3-a #id:L-CH-T4-05-3-a-p
    ~ KnownPhrases += cover_witnessed
    ~ recordKnowledge("cover_witnessed")
    ~ recordThreadMove("ilsa-kin-no-show")
    ~ recordBond("ilsa", "Recognition")
    It's mine. #id:L-CH-T4-05-3-a-r1 #speaker:ilsa
    Ilsa sets the piece she is holding down with the rest, under the sheet as it stands. #id:A-CH-T4-05-3-a-r #speaker:ilsa
    It's ready for the raising. #id:L-CH-T4-05-3-a-r2 #speaker:ilsa
* [stacks the pieces with the rest, lets them stay his] #opt:CH-T4-05-3-b
    ~ recordBond("ilsa", "Intimacy")
    Stack the pieces with the rest and let them stay his. #id:L-CH-T4-05-3-b-act #speaker:ilsa
    Flat side down. Top row crosses the bottom. #id:L-CH-T4-05-3-b-r1 #speaker:ilsa
- (g_ch_t4_05_3) Placeholder: the scene continues. #id:GB-CH-T4-05-3-GATHER
- (ch_t4_05_4) { KnownPhrases ? absence_witnessed: The raising sheet on its post. His name stands over the finished work. The dates on the sheet stand empty. #choice:CH-T4-05-4 #id:O-CH-T4-05-4-s #speaker:ilsa }
* {KnownPhrases ? absence_witnessed} ["It was finished before the day he missed."] #opt:CH-T4-05-4-a #id:L-CH-T4-05-4-a-p
    ~ recordBond("ilsa", "Recognition")
    It was ready. #id:L-CH-T4-05-4-a-r1 #speaker:ilsa
    Yours will be too. Keep at the edges. #id:L-CH-T4-05-4-a-r2 #speaker:ilsa
* {KnownPhrases ? absence_witnessed} [stands at the far end with her a moment, saying nothing] #opt:CH-T4-05-4-b
    ~ recordBond("ilsa", "Intimacy")
    Stand at the far end with her a moment, saying nothing. #id:L-CH-T4-05-4-b-act #speaker:ilsa
    That's the last of the fine work. #id:L-CH-T4-05-4-b-r1 #speaker:ilsa
* -> g_ch_t4_05_4
- (g_ch_t4_05_4) Placeholder: the scene continues. #id:GB-CH-T4-05-4-GATHER
- (ch_t4_05_5) The crate's by the gate. These go over first. #choice:CH-T4-05-5 #id:L-CH-T4-05-5-s #speaker:ilsa
* [carries the finished pieces to the raising crate with her] #opt:CH-T4-05-5-a
    ~ recordBond("ilsa", "Intimacy")
    Carry the finished pieces to the raising crate with her. #id:L-CH-T4-05-5-a-act #speaker:ilsa
    Heavy end to me. #id:L-CH-T4-05-5-a-r1 #speaker:ilsa
    That's the two of us done for today. #id:L-CH-T4-05-5-a-r2 #speaker:ilsa
* ["What's left before raising eve?"] #opt:CH-T4-05-5-b #id:L-CH-T4-05-5-b-p
    ~ recordBond("ilsa", "Trust")
    Filing, the strapping, then the carry. Every pair of hands has its place. #id:L-CH-T4-05-5-b-r1 #speaker:ilsa
    You'll see it whole on the eve. #id:L-CH-T4-05-5-b-r2 #speaker:ilsa
- (g_ch_t4_05_5) Placeholder: the scene continues. #id:GB-CH-T4-05-5-GATHER
-> t4.hub

= sc_t4_06
The second apron lies at the far end, tongs beside it, as it has lain all week. The near end is squared for morning. #id:O-SC-T4-06-5 #speaker:ilsa
- (ch_t4_06_1) Raising eve. The centerpiece stands finished on the bench, its whole length wiped down. The yard is squared away around it. #choice:CH-T4-06-1 #id:O-SC-T4-06-1 #speaker:ilsa
* ["It's finished. The whole piece."] #opt:CH-T4-06-1-a #id:L-CH-T4-06-1-a-p
    ~ recordBond("ilsa", "Trust")
    She's done. She goes up tomorrow. #id:L-CH-T4-06-1-a-r1 #speaker:ilsa
    Your filing's in the crown. It shows. #id:L-CH-T4-06-1-a-r2 #speaker:ilsa
* [helps square the yard for morning] #opt:CH-T4-06-1-b
    ~ recordBond("ilsa", "Intimacy")
    Help square the yard for morning. #id:L-CH-T4-06-1-b-act #speaker:ilsa
    Barrow behind the door. Coal keeps till after. #id:L-CH-T4-06-1-b-r1 #speaker:ilsa
- (g_ch_t4_06_1) Placeholder: the scene continues. #id:GB-CH-T4-06-1-GATHER
- (ch_t4_06_2) { KnownPhrases ? absence_witnessed: Ilsa sets out tools for the raising, pair by pair down the bench, one pair more than the hands that will come. #choice:CH-T4-06-2 #id:A-SC-T4-06-2 #speaker:ilsa }
* {KnownPhrases ? absence_witnessed} ["There's a pair set out for him still."] #opt:CH-T4-06-2-a #id:L-CH-T4-06-2-a-p
    ~ recordBond("ilsa", "Recognition")
    There is. #id:L-CH-T4-06-2-a-r1 #speaker:ilsa
    Yours is the second from the fire. #id:L-CH-T4-06-2-a-r2 #speaker:ilsa
* {KnownPhrases ? absence_witnessed} [leaves the count as she made it] #opt:CH-T4-06-2-b
    ~ recordBond("ilsa", "Intimacy")
    Leave the count as she made it. #id:L-CH-T4-06-2-b-act #speaker:ilsa
    Bellows pair stays home tomorrow. The rest go over. #id:L-CH-T4-06-2-b-r1 #speaker:ilsa
* -> g_ch_t4_06_2
- (g_ch_t4_06_2) Placeholder: the scene continues. #id:GB-CH-T4-06-2-GATHER
- (ch_t4_06_3) { KnownPhrases ? cover_witnessed: His part rides over with the piece. It's ready. #choice:CH-T4-06-3 #id:L-CH-T4-06-3-s #speaker:ilsa }
* {KnownPhrases ? cover_witnessed} ["His part goes to the raising finished."] #opt:CH-T4-06-3-a #id:L-CH-T4-06-3-a-p
    ~ recordBond("ilsa", "Recognition")
    It does. #id:L-CH-T4-06-3-a-r1 #speaker:ilsa
    Load it up front on the cart. #id:L-CH-T4-06-3-a-r2 #speaker:ilsa
* {KnownPhrases ? cover_witnessed} [loads it onto the cart with the rest, unremarked] #opt:CH-T4-06-3-b
    ~ recordBond("ilsa", "Intimacy")
    Load it onto the cart with the rest, unremarked. #id:L-CH-T4-06-3-b-act #speaker:ilsa
    Steady. It rides on top. #id:L-CH-T4-06-3-b-r1 #speaker:ilsa
* -> g_ch_t4_06_3
- (g_ch_t4_06_3) Placeholder: the scene continues. #id:GB-CH-T4-06-3-GATHER
- (ch_t4_06_4) Ropes to the mill pair. The far end… #choice:CH-T4-06-4 #id:L-SC-T4-06-4 #speaker:ilsa
* [stands into the count without a word] #opt:CH-T4-06-4-a
    ~ recordBond("ilsa", "Recognition")
    Stand into the count without a word. #id:L-CH-T4-06-4-a-act #speaker:ilsa
* ["I'll be there at midday."] #opt:CH-T4-06-4-b #id:L-CH-T4-06-4-b-p
    ~ recordBond("ilsa", "Trust")
    Midday. She goes up on my word. #id:L-CH-T4-06-4-b-r1 #speaker:ilsa
- (g_ch_t4_06_4) Placeholder: the scene continues. #id:GB-CH-T4-06-4-GATHER
-> t4.hub

= sc_t4_11
- (ch_t4_11_1) The yard is mid-work, the day's pieces laid along the bench in their order. At the far end a boy is at work at his own station, coal dust to the elbows. #choice:CH-T4-11-1 #id:O-SC-T4-11-1 #speaker:ilsa
* ["What's the work today?"] #opt:CH-T4-11-1-a #id:L-CH-T4-11-1-a-p
    ~ recordBond("ilsa", "Trust")
    Hooks for the arch lanterns, all day. #id:L-CH-T4-11-1-a-r1 #speaker:ilsa
    Start on the blanks. They're in the box. #id:L-CH-T4-11-1-a-r2 #speaker:ilsa
* [takes up the place she states] #opt:CH-T4-11-1-b
    ~ recordBond("ilsa", "Intimacy")
    Take the near end and start on the hook blanks. #id:L-CH-T4-11-1-b-act #speaker:ilsa
    That's it. Bend to the mark. #id:L-CH-T4-11-1-b-r1 #speaker:ilsa
    Gloves are where they were. #id:L-CH-T4-11-1-b-r2 #speaker:ilsa
* [goes with the boy to look at what he holds out] #opt:CH-T4-11-1-c
    ~ recordBond("ilsa", "Trust")
    Go with the boy to see what he holds out. #id:L-CH-T4-11-1-c-act #speaker:ilsa
    Look. It came out of the clinker. #id:L-CH-T4-11-1-c-r1 #speaker:pip
    Green, when the light's through it. #id:L-CH-T4-11-1-c-r2 #speaker:pip
- (g_ch_t4_11_1) Placeholder: the scene continues. #id:GB-CH-T4-11-1-GATHER
- (ch_t4_11_2) The boy holds out something he has found, flat on his palm, as she passes. Ilsa turns it once to the light, hands it back, and puts him at his end without breaking the work. #choice:CH-T4-11-2 #id:A-SC-T4-11-2 #speaker:ilsa
* [works the placement she gave] #opt:CH-T4-11-2-a
    ~ recordBond("ilsa", "Intimacy")
    Take up the files and work the placement she gave. #id:L-CH-T4-11-2-a-act #speaker:ilsa
    Good. Long strokes, let the file cut. #id:L-CH-T4-11-2-a-r1 #speaker:ilsa
    You've the feel of it now. #id:L-CH-T4-11-2-a-r2 #speaker:ilsa
* ["How long has Pip been coming here?"] #opt:CH-T4-11-2-b #id:L-CH-T4-11-2-b-p
    ~ recordBond("ilsa", "Trust")
    A good while now. Since spring, near enough. #id:L-CH-T4-11-2-b-r1 #speaker:ilsa
    Stand my side. His elbows travel. #id:L-CH-T4-11-2-b-r2 #speaker:ilsa
- (g_ch_t4_11_2) Placeholder: the scene continues. #id:GB-CH-T4-11-2-GATHER
- (ch_t4_11_3) On the bench rack a set of tools hangs cut down to a boy's hands, handles worn smooth, kept in the row with the full-size sets. #choice:CH-T4-11-3 #id:O-SC-T4-11-3 #speaker:ilsa
* [sets the small tools back where they live] #opt:CH-T4-11-3-a
    ~ recordBond("ilsa", "Intimacy")
    Set the small tools back where they live. #id:L-CH-T4-11-3-a-act #speaker:ilsa
    Third hook, under the tongs. That's them. #id:L-CH-T4-11-3-a-r1 #speaker:ilsa
    He leaves them where he finishes. #id:L-CH-T4-11-3-a-r2 #speaker:ilsa
* ["Whose are the small tools?"] #opt:CH-T4-11-3-b #id:L-CH-T4-11-3-b-p
    ~ recordBond("ilsa", "Trust")
    They live on the third hook. Under the tongs. #id:L-CH-T4-11-3-b-r1 #speaker:ilsa
    Yours are on the bench. Keep on. #id:L-CH-T4-11-3-b-r2 #speaker:ilsa
- (g_ch_t4_11_3) Placeholder: the scene continues. #id:GB-CH-T4-11-3-GATHER
- (ch_t4_11_4) The work stops for midday. Ilsa lays the places down the bench one after another, in one order, the boy's among them. #choice:CH-T4-11-4 #id:A-CH-T4-11-4-s #speaker:ilsa
* ["His place goes down with the rest."] #opt:CH-T4-11-4-a #id:L-CH-T4-11-4-a-p
    ~ KnownPhrases += pip_place_seen
    ~ recordKnowledge("pip_place_seen")
    ~ recordThreadMove("ilsa-not-family")
    ~ recordBond("ilsa", "Recognition")
    It does. #id:L-CH-T4-11-4-a-r1 #speaker:ilsa
    She sets the last place down and squares it with the row. #id:A-CH-T4-11-4-a-r #speaker:ilsa
    Yours is by him. #id:L-CH-T4-11-4-a-r3 #speaker:ilsa
* [takes their own place in the order] #opt:CH-T4-11-4-b
    ~ recordBond("ilsa", "Intimacy")
    Take your own place in the order. #id:L-CH-T4-11-4-b-act #speaker:ilsa
    Bread starts your end today. #id:L-CH-T4-11-4-b-r1 #speaker:ilsa
- (g_ch_t4_11_4) Placeholder: the scene continues. #id:GB-CH-T4-11-4-GATHER
- (ch_t4_11_5) Pip. Round now, while the light's long. #choice:CH-T4-11-5 #id:L-CH-T4-11-5-s #speaker:ilsa
* ["I'll come back tomorrow."] #opt:CH-T4-11-5-a #id:L-CH-T4-11-5-a-p
    ~ recordBond("ilsa", "Trust")
    Midday. Files till the fire's up. #id:L-CH-T4-11-5-a-r1 #speaker:ilsa
    Wren's building in the arch scaffold. Come see. #id:L-CH-T4-11-5-a-r2 #speaker:pip
* [sets their end of the bench straight] #opt:CH-T4-11-5-b
    ~ recordBond("ilsa", "Intimacy")
    Set your end of the bench straight before leaving. #id:L-CH-T4-11-5-b-act #speaker:ilsa
    That's it squared. #id:L-CH-T4-11-5-b-r1 #speaker:ilsa
    Same end in the morning. #id:L-CH-T4-11-5-b-r2 #speaker:ilsa
- (g_ch_t4_11_5) Placeholder: the scene continues. #id:GB-CH-T4-11-5-GATHER
-> t4.hub

= sc_t4_12
- (ch_t4_12_1) The yard is cleared for the eve. The bench is laid down its length, the places set in one order, the count of them settled before anyone arrives. #choice:CH-T4-12-1 #id:O-SC-T4-12-1 #speaker:ilsa
* ["Evening, Ilsa. Juno wouldn't take no."] #opt:CH-T4-12-1-a #id:L-CH-T4-12-1-a-p
    ~ recordBond("ilsa", "Trust")
    So I see. Bread's still to come down. #id:L-CH-T4-12-1-a-r1 #speaker:ilsa
    You're on that. Both arms. #id:L-CH-T4-12-1-a-r2 #speaker:ilsa
* [takes up the last of the carrying with Juno] #opt:CH-T4-12-1-b
    ~ recordBond("ilsa", "Intimacy")
    Take up the last of the carrying with Juno. #id:L-CH-T4-12-1-b-act #speaker:ilsa
    Mind the crock. It only comes out for these. #id:L-CH-T4-12-1-b-r1 #speaker:juno
    Middle of the bench. It goes down first. #id:L-CH-T4-12-1-b-r2 #speaker:ilsa
* [lets the kin-word stand without answering it] #opt:CH-T4-12-1-c
    ~ recordBond("ilsa", "Intimacy")
    Let the word stand, and go on into the yard. #id:L-CH-T4-12-1-c-act #speaker:ilsa
    Boards go down before anyone sits. #id:L-CH-T4-12-1-c-r1 #speaker:ilsa
- (g_ch_t4_12_1) Placeholder: the scene continues. #id:GB-CH-T4-12-1-GATHER
- (ch_t4_12_2) { KnownPhrases ? pip_place_seen: Dishes go down the order. Start that end. #choice:CH-T4-12-2 #id:L-CH-T4-12-2-s #speaker:ilsa }
* {KnownPhrases ? pip_place_seen} ["The boy's place is laid tonight too."] #opt:CH-T4-12-2-a #id:L-CH-T4-12-2-a-p
    ~ recordBond("ilsa", "Recognition")
    It is. He's in after his round. #id:L-CH-T4-12-2-a-r1 #speaker:ilsa
    Set the jug by it. #id:L-CH-T4-12-2-a-r2 #speaker:ilsa
* {KnownPhrases ? pip_place_seen} [helps carry the last things down the bench-side] #opt:CH-T4-12-2-b
    ~ recordBond("ilsa", "Intimacy")
    Help carry the last things down the bench-side. #id:L-CH-T4-12-2-b-act #speaker:ilsa
    Down the line as they come. #id:L-CH-T4-12-2-b-r1 #speaker:ilsa
* -> g_ch_t4_12_2
- (g_ch_t4_12_2) Placeholder: the scene continues. #id:GB-CH-T4-12-2-GATHER
- (ch_t4_12_3) Ilsa is already at the house shelf. She comes back with plate and cup, lays the player a place at the end of the row, and goes on with the eve. #choice:CH-T4-12-3 #id:A-CH-T4-12-3-s #speaker:ilsa
* ["My place went on after the others."] #opt:CH-T4-12-3-a #id:L-CH-T4-12-3-a-p
    ~ KnownPhrases += guest_place_last
    ~ recordKnowledge("guest_place_last")
    ~ recordThreadMove("ilsa-not-family")
    ~ recordBond("ilsa", "Recognition")
    It went on last. The order's... #id:L-CH-T4-12-3-a-r1 #speaker:ilsa
    Ilsa straightens the added place a finger's width, and turns back to the eve. #id:A-CH-T4-12-3-a-r #speaker:ilsa
* [takes the place she laid and lets the arrangement stand] #opt:CH-T4-12-3-b
    ~ recordBond("ilsa", "Intimacy")
    Take the place she laid, and let it stand. #id:L-CH-T4-12-3-b-act #speaker:ilsa
- (g_ch_t4_12_3) Placeholder: the scene continues. #id:GB-CH-T4-12-3-GATHER
- (ch_t4_12_4) The two of them take up their positions somewhere between the pot and the bench, at the pace of a thing done many times. The eve's work does not stop. #choice:CH-T4-12-4 #id:A-CH-T4-12-4-s #speaker:ilsa
* [stays where they are and takes it in] #opt:CH-T4-12-4-a
    ~ recordBond("ilsa", "Intimacy")
    Stay where you are and take it in. #id:L-CH-T4-12-4-a-act #speaker:ilsa
    Wick came for one harvest. That's nineteen years ago. #id:L-CH-T4-12-4-a-r1 #speaker:juno
    Pot's ready. Bowls go down. #id:L-CH-T4-12-4-a-r2 #speaker:ilsa
* ["How did you come to ask me?"] #opt:CH-T4-12-4-b #id:L-CH-T4-12-4-b-p
    ~ recordBond("ilsa", "Trust")
    I can tell you the day, even. #id:L-CH-T4-12-4-b-r1 #speaker:juno
    -- (ch_t4_12_4_b_1) The second morning of the week, at my gate. I knew then. #choice:CH-T4-12-4-b-1 #id:L-CH-T4-12-4-b-1-s #speaker:juno
    ** [lets the placement stand] #opt:CH-T4-12-4-b-1-a
        ~ recordBond("ilsa", "Intimacy")
        Let the placement stand. #id:L-CH-T4-12-4-b-1-a-act #speaker:ilsa
        Juno. Your bowl's going cold. #id:L-CH-T4-12-4-b-1-a-r1 #speaker:ilsa
    ** ["Finish what you were saying."] #opt:CH-T4-12-4-b-1-b #id:L-CH-T4-12-4-b-1-b-p
        ~ recordBond("ilsa", "Trust")
        You waved first. That was the whole of it. #id:L-CH-T4-12-4-b-1-b-r1 #speaker:juno
        Bread's going round. Take some past her. #id:L-CH-T4-12-4-b-1-b-r2 #speaker:ilsa
    -- (g_ch_t4_12_4_b) Placeholder: the scene continues. #id:GB-CH-T4-12-4-b-1-GATHER
* [keeps the eve's work moving through it] #opt:CH-T4-12-4-c
    ~ recordBond("ilsa", "Trust")
    Keep the eve's work moving through it. #id:L-CH-T4-12-4-c-act #speaker:ilsa
    Bowls next. Big pot last. #id:L-CH-T4-12-4-c-r1 #speaker:ilsa
    Haf's been my brother thirty years. Ask him where from. #id:L-CH-T4-12-4-c-r2 #speaker:juno
- (g_ch_t4_12_4) Placeholder: the scene continues. #id:GB-CH-T4-12-4-GATHER
- (ch_t4_12_5) The bench runs full. The places sit in their order, one more added at the end, and the food goes down the whole length of it without a seam. #choice:CH-T4-12-5 #id:O-SC-T4-12-5 #speaker:ilsa
* [passes things back down the bench from the added end] #opt:CH-T4-12-5-a
    ~ recordBond("ilsa", "Intimacy")
    Pass things back down the bench from the added end. #id:L-CH-T4-12-5-a-act #speaker:ilsa
    That's it. Butter follows the bread. #id:L-CH-T4-12-5-a-r1 #speaker:ilsa
    Keep it moving. There's plenty. #id:L-CH-T4-12-5-a-r2 #speaker:ilsa
* ["What goes on the fire tomorrow?"] #opt:CH-T4-12-5-b #id:L-CH-T4-12-5-b-p
    ~ recordBond("ilsa", "Trust")
    Hinges, and the gate braces. Small work. #id:L-CH-T4-12-5-b-r1 #speaker:ilsa
    You're on files for it. #id:L-CH-T4-12-5-b-r2 #speaker:ilsa
- (g_ch_t4_12_5) Placeholder: the scene continues. #id:GB-CH-T4-12-5-GATHER
- (ch_t4_12_6) I'll take mine home with me, then. Good eve, Ilsa. #choice:CH-T4-12-6 #id:L-CH-T4-12-6-s #speaker:juno
* [lets it stand without answering] #opt:CH-T4-12-6-a
    ~ recordBond("ilsa", "Intimacy")
    Let it stand without answering. #id:L-CH-T4-12-6-a-act #speaker:ilsa
    Lamp's at the gate. Take it with you. #id:L-CH-T4-12-6-a-r1 #speaker:ilsa
* ["That's twice tonight you've called me yours."] #opt:CH-T4-12-6-b #id:L-CH-T4-12-6-b-p
    ~ recordBond("ilsa", "Trust")
    So I did. I only say it where I mean it. #id:L-CH-T4-12-6-b-r1 #speaker:juno
    Gate's this way. Mind the step. #id:L-CH-T4-12-6-b-r2 #speaker:ilsa
- (g_ch_t4_12_6) Placeholder: the scene continues. #id:GB-CH-T4-12-6-GATHER
-> t4.hub

= sc_t4_13
- (ch_t4_13_1) The yard is back at work, the fire up. Down the bench the places sit as she laid them for the eve, the order whole, and the added one still at the end. #choice:CH-T4-13-1 #id:O-SC-T4-13-1 #speaker:ilsa
* ["How was the rest of the eve?"] #opt:CH-T4-13-1-a #id:L-CH-T4-13-1-a-p
    ~ recordBond("ilsa", "Trust")
    Late enough. Everyone went home fed. #id:L-CH-T4-13-1-a-r1 #speaker:ilsa
    The crock went home full. #id:L-CH-T4-13-1-a-r2 #speaker:ilsa
* [takes up work at their own end] #opt:CH-T4-13-1-b
    ~ recordBond("ilsa", "Intimacy")
    Take up work at your own end. #id:L-CH-T4-13-1-b-act #speaker:ilsa
    Blanks are in the box still. #id:L-CH-T4-13-1-b-r1 #speaker:ilsa
* [stays with the bench as it was left, saying nothing] #opt:CH-T4-13-1-c
    ~ recordBond("ilsa", "Intimacy")
    Stay with the bench as it was left, saying nothing. #id:L-CH-T4-13-1-c-act #speaker:ilsa
    Bench keeps. Come to the fire. #id:L-CH-T4-13-1-c-r1 #speaker:ilsa
- (g_ch_t4_13_1) Placeholder: the scene continues. #id:GB-CH-T4-13-1-GATHER
- (ch_t4_13_2) { KnownPhrases ? pip_place_seen: Dishes to the shelf. Midday places next. #choice:CH-T4-13-2 #id:L-CH-T4-13-2-s #speaker:ilsa }
* {KnownPhrases ? pip_place_seen} ["His place hasn't moved."] #opt:CH-T4-13-2-a #id:L-CH-T4-13-2-a-p
    ~ recordBond("ilsa", "Recognition")
    It hasn't. #id:L-CH-T4-13-2-a-r1 #speaker:ilsa
    Set yours down next to it. #id:L-CH-T4-13-2-a-r2 #speaker:ilsa
* {KnownPhrases ? pip_place_seen} [works at the place next to it] #opt:CH-T4-13-2-b
    ~ recordBond("ilsa", "Intimacy")
    Work at the place next to it. #id:L-CH-T4-13-2-b-act #speaker:ilsa
    That's the spot. Dishes come to you. #id:L-CH-T4-13-2-b-r1 #speaker:ilsa
* -> g_ch_t4_13_2
- (g_ch_t4_13_2) Placeholder: the scene continues. #id:GB-CH-T4-13-2-GATHER
- (ch_t4_13_3) { KnownPhrases ? guest_place_last: At the far end the added place is still set, plate and cup as she laid them. The eve's other things are gone from around it. #choice:CH-T4-13-3 #id:O-CH-T4-13-3-s #speaker:ilsa }
* {KnownPhrases ? guest_place_last} ["The added place is still there."] #opt:CH-T4-13-3-a #id:L-CH-T4-13-3-a-p
    ~ recordBond("ilsa", "Recognition")
    That's your place. #id:L-CH-T4-13-3-a-r1 #speaker:ilsa
* {KnownPhrases ? guest_place_last} [works around it and leaves it where it is] #opt:CH-T4-13-3-b
    ~ recordBond("ilsa", "Intimacy")
    Work around it and leave it where it is. #id:L-CH-T4-13-3-b-act #speaker:ilsa
* -> g_ch_t4_13_3
- (g_ch_t4_13_3) Placeholder: the scene continues. #id:GB-CH-T4-13-3-GATHER
- (ch_t4_13_4) The last of the eve's things go back to the house shelf. The standing order sits down the bench for midday, place for place, nothing in it moved. #choice:CH-T4-13-4 #id:A-SC-T4-13-4 #speaker:ilsa
* ["Does tomorrow change any of it?"] #opt:CH-T4-13-4-a #id:L-CH-T4-13-4-a-p
    ~ recordBond("ilsa", "Trust")
    Hooks in the morning. Files after. #id:L-CH-T4-13-4-a-r1 #speaker:ilsa
    Pip's in after his round. #id:L-CH-T4-13-4-a-r2 #speaker:ilsa
* [sets the eve's things away with her] #opt:CH-T4-13-4-b
    ~ recordBond("ilsa", "Intimacy")
    Set the eve's things away with her. #id:L-CH-T4-13-4-b-act #speaker:ilsa
    Boards up on their ends first. #id:L-CH-T4-13-4-b-r1 #speaker:ilsa
    That's the eve put away. #id:L-CH-T4-13-4-b-r2 #speaker:ilsa
- (g_ch_t4_13_4) Placeholder: the scene continues. #id:GB-CH-T4-13-4-GATHER
- (ch_t4_13_5) The boy comes through the gate off his round, bag still on his shoulder, takes his place at the bench without asking, and holds a stone out on his palm. #choice:CH-T4-13-5 #id:A-CH-T4-13-5-s #speaker:ilsa
* [leaves the moment unremarked] #opt:CH-T4-13-5-a
    ~ recordBond("ilsa", "Intimacy")
    Leave the moment unremarked. #id:L-CH-T4-13-5-a-act #speaker:ilsa
    Bowls are still warm. Sit in. #id:L-CH-T4-13-5-a-r1 #speaker:ilsa
* ["How was the round?"] #opt:CH-T4-13-5-b #id:L-CH-T4-13-5-b-p
    ~ recordBond("ilsa", "Trust")
    It was lying in the wheel rut. #id:L-CH-T4-13-5-b-r1 #speaker:pip
    Fog had the rest of the lane. #id:L-CH-T4-13-5-b-r2 #speaker:pip
- (g_ch_t4_13_5) Placeholder: the scene continues. #id:GB-CH-T4-13-5-GATHER
- (ch_t4_13_6) Light's going. That's the hooks done. #choice:CH-T4-13-6 #id:L-CH-T4-13-6-s #speaker:ilsa
* ["I'll come to the next one."] #opt:CH-T4-13-6-a #id:L-CH-T4-13-6-a-p
    ~ recordBond("ilsa", "Trust")
    You'll sit where you sat. #id:L-CH-T4-13-6-a-r1 #speaker:ilsa
    You know where the lamp lives. #id:L-CH-T4-13-6-a-r2 #speaker:ilsa
* [leaves the bench as she laid it] #opt:CH-T4-13-6-b
    ~ recordBond("ilsa", "Intimacy")
    Leave the bench as she laid it. #id:L-CH-T4-13-6-b-act #speaker:ilsa
    Midday tomorrow. Your end's yours. #id:L-CH-T4-13-6-b-r1 #speaker:ilsa
- (g_ch_t4_13_6) Placeholder: the scene continues. #id:GB-CH-T4-13-6-GATHER
-> t4.hub

