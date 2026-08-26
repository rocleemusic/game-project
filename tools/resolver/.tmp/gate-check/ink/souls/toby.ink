// souls/toby.ink — generated. A soul file reads as the person. Do not hand-edit.

=== toby ===
-> DONE

= sc_t2_04
Morning! Mind the flour on the step. #id:L-SC-T2-04-01 #speaker:toby
- (ch_t2_04) { present_toby == "T2": It's nothing. Go on, the square's the place to be. #choice:CH-T2-04 #id:L-SC-T2-04-02 #speaker:toby }
* {present_toby == "T2"} ["Let me carry the trays at least."] #opt:CH-T2-04-a #id:L-CH-T2-04-a-p
    ~ recordBond("toby", "Intimacy")
    ~ recordThreadMove("giver-receive")
    ...Fine. The small ones. Mind the edges. #id:L-CH-T2-04-a-r1 #speaker:toby
* {present_toby == "T2"} [leave the bread on the rack] #opt:CH-T2-04-b
    ~ recordThreadMove("giver-receive")
    Ha, go on then. I'll save you a sweet roll. #id:L-CH-T2-04-b-r1 #speaker:toby
* -> g_ch_t2_04
- (g_ch_t2_04) Placeholder: the scene continues. #id:GB-CH-T2-04-GATHER
-> t2.hub

= sc_t2_08
Behind the counter stands a shelf of jars. There's a ribbon on two of them. They look to be still sealed. Toby is rushing around the bakery. #id:O-SC-T2-08-1 #speaker:toby
Toby slides two trays onto the counter and turns the third to face the heat. #id:A-SC-T2-08-2 #speaker:toby
A folded cloth waits on the near edge of the counter, within reach of the hot tray. #id:O-SC-T2-08-3 #speaker:toby
- (ch_t2_08_1) Ovens are up. First bake comes off in a minute, so mind the counter as you pass it. #choice:CH-T2-08-1 #id:L-CH-T2-08-1-s #speaker:toby
* ["What are all the jars?"] #opt:CH-T2-08-1-a #id:L-CH-T2-08-1-a-p
    ~ KnownPhrases += shelf_seen
    ~ recordKnowledge("shelf_seen")
    ~ recordThreadMove("toby-the-shelf")
    Toby answers quickly as he rushes by: "Thank-yous." #id:L-CH-T2-08-1-a-r1 #speaker:toby
    Kettle's been on the side a while. Pour yourself some tea, it's the good stuff. #id:L-CH-T2-08-1-a-r2 #speaker:toby
    Pass me the peel and I'll have the first trays out. #id:L-CH-T2-08-1-a-r3 #speaker:toby
* [steps in on the order at hand] #opt:CH-T2-08-1-b
    ~ recordBond("toby", "Intimacy")
    A bag of flour has tipped over on the ground. Pick it up. #id:L-CH-T2-08-1-b-act #speaker:toby
    Toby comes over and says quietly, "Ah thank you, can you hold it steady?" #id:L-CH-T2-08-1-b-r1 #speaker:toby
    Toby levels the flour and measures some out, "Your sleeves will be white. Roll them up and I'll wait for you." #id:L-CH-T2-08-1-b-r2 #speaker:toby
* ["Early start for a bake this size."] #opt:CH-T2-08-1-c #id:L-CH-T2-08-1-c-p
    Twelve for the Hallow house, it'll be out by noon. #id:L-CH-T2-08-1-c-r1 #speaker:toby
    There's some space on the window sill, feel free to sit there. #id:L-CH-T2-08-1-c-r2 #speaker:toby
- (g_ch_t2_08_1) Toby slides two trays onto the counter and turns the third to face the heat. #id:A-SC-T2-08-2 #speaker:toby
- (ch_t2_08_2) Rye goes first, it takes the longest. White after. #choice:CH-T2-08-2 #id:L-CH-T2-08-2-s #speaker:toby
* [fetches the next tray before he asks] #opt:CH-T2-08-2-a
    ~ recordBond("toby", "Intimacy")
    Lift the next tray off the rack and set it beside him #id:L-CH-T2-08-2-a-act #speaker:toby
    That's the seed tray. #id:L-CH-T2-08-2-a-r1 #speaker:toby
    You got there ahead of me. #id:L-CH-T2-08-2-a-r2 #speaker:toby
    Take the cloth off the hook before you lift the next one. The handle has a tendency to be hot. #id:L-CH-T2-08-2-a-r3 #speaker:toby
* ["Who's this bake for?"] #opt:CH-T2-08-2-b #id:L-CH-T2-08-2-b-p
    ~ recordBond("toby", "Trust")
    The Hallow house. Two of them won't touch rye, so it's four white, four seed, four rye. #id:L-CH-T2-08-2-b-r1 #speaker:toby
    Their youngest likes the dark end, so I leave one in longer for her. #id:L-CH-T2-08-2-b-r2 #speaker:toby
- (g_ch_t2_08_2) A folded cloth waits on the near edge of the counter, within reach of the hot tray. #id:O-SC-T2-08-3 #speaker:toby
- (ch_t2_08_3) That one's coming off now. It'll be too hot to hold for a good while. #choice:CH-T2-08-3 #id:L-CH-T2-08-3-s #speaker:toby
* ["You notice a cloth appeared on the counter. "That cloth was out before I needed it.""] #opt:CH-T2-08-3-a #id:L-CH-T2-08-3-a-p
    ~ recordBond("toby", "Trust")
    Can't be too careful. #id:L-CH-T2-08-3-a-r1 #speaker:toby
    I always have them handy. #id:L-CH-T2-08-3-a-r2 #speaker:toby
    Double it over on the hot side. If not you'll feel it. #id:L-CH-T2-08-3-a-r3 #speaker:toby
* [takes it and keeps the counter moving] #opt:CH-T2-08-3-b
    ~ recordBond("toby", "Intimacy")
    Take the cloth and move the tray on down the counter #id:L-CH-T2-08-3-b-act #speaker:toby
    Hold on to it. There's a stack of them under the bench. #id:L-CH-T2-08-3-b-r1 #speaker:toby
    Give it a count of fifty and the crust won't burn you. #id:L-CH-T2-08-3-b-r2 #speaker:toby
- (g_ch_t2_08_3) Placeholder: the scene continues. #id:GB-CH-T2-08-3-GATHER
- (ch_t2_08_4) { KnownPhrases ? shelf_seen: People like to bring things sometimes. I keep them. #choice:CH-T2-08-4 #id:L-CH-T2-08-4-s1 #speaker:toby }
* {KnownPhrases ? shelf_seen} ["None of them are open."] #opt:CH-T2-08-4-a #id:L-CH-T2-08-4-a-p
    ~ recordBond("toby", "Recognition")
    No. #id:L-CH-T2-08-4-a-r1 #speaker:toby
    Ribbon's still on two. #id:L-CH-T2-08-4-a-r2 #speaker:toby
    It's drafty where you're standing. The oven side's warmer, move over to that side. #id:L-CH-T2-08-4-a-r3 #speaker:toby
    -- (ch_t2_08_4_a_1) Toby sets a warm roll on the board by the player's hand, eyes still on the sacks. #choice:CH-T2-08-4-a-1 #id:A-CH-T2-08-4-a-1-s #speaker:toby
    ** ["This for me?"] #opt:CH-T2-08-4-a-1-a #id:L-CH-T2-08-4-a-1-a-p
        ~ recordThreadMove("toby-the-shelf")
        It's off the first bake. #id:L-CH-T2-08-4-a-1-a-r1 #speaker:toby
        They're best about now. #id:L-CH-T2-08-4-a-1-a-r2 #speaker:toby
        Eat it while it's hot. Butter's in the crock behind the scales. #id:L-CH-T2-08-4-a-1-a-r3 #speaker:toby
    ** [takes it without comment] #opt:CH-T2-08-4-a-1-b
        ~ recordBond("toby", "Intimacy")
        Take the roll and say nothing #id:L-CH-T2-08-4-a-1-b-act #speaker:toby
        Another under the paper when that's gone. #id:L-CH-T2-08-4-a-1-b-r1 #speaker:toby
        Take a second one for later. I always bake past what the morning needs. #id:L-CH-T2-08-4-a-1-b-r2 #speaker:toby
    -- (g_ch_t2_08_4_a) Placeholder: the scene continues. #id:GB-CH-T2-08-4-a-1-GATHER
* {KnownPhrases ? shelf_seen} [turns back to the order with him] #opt:CH-T2-08-4-b
    ~ recordBond("toby", "Intimacy")
    Pick up the flour scoop and start filling beside him #id:L-CH-T2-08-4-b-act #speaker:toby
    Right. Two trays and the crate and we're clear before the square fills. #id:L-CH-T2-08-4-b-r1 #speaker:toby
    Take the near bin, that one's sifted. The packed one needs breaking loose first. #id:L-CH-T2-08-4-b-r2 #speaker:toby
* -> g_ch_t2_08_4
- (g_ch_t2_08_4) Placeholder: the scene continues. #id:GB-CH-T2-08-4-GATHER
- (ch_t2_08_5) First bake's off. The crate wants to be at the stall before the square fills up. #choice:CH-T2-08-5 #id:L-CH-T2-08-5-s #speaker:toby
* [offers to carry the order out] #opt:CH-T2-08-5-a
    ~ recordBond("toby", "Trust")
    Pick up the crate and carry it out for him #id:L-CH-T2-08-5-a-act #speaker:toby
    The crate... #id:L-CH-T2-08-5-a-r1 #speaker:toby
    It's not much weight. #id:L-CH-T2-08-5-a-r2 #speaker:toby
    I'll get the door. Blue gate past the well, and tell them the second crate comes at noon. #id:L-CH-T2-08-5-a-r3 #speaker:toby
* ["I'll be back again tomorrow!"] #opt:CH-T2-08-5-b #id:L-CH-T2-08-5-b-p
    ~ recordBond("toby", "Intimacy")
    Come while the ovens are still up, I'll keep a loaf for you. #id:L-CH-T2-08-5-b-r1 #speaker:toby
    I'll put aside two. Their yours whether you make it or not. #id:L-CH-T2-08-5-b-r2 #speaker:toby
- (g_ch_t2_08_5) Placeholder: the scene continues. #id:GB-CH-T2-08-5-GATHER
-> t2.hub

= sc_t2_09
A half-wrapped parcel sits on the counter, Nella's name is written on the paper beside it. #id:O-SC-T2-09-1 #speaker:toby
Toby adds two rolls to the package. The order still says four. #id:A-SC-T2-09-2 #speaker:toby
Four twine-tied parcels wait on the pickup shelf for tomorrow, three of them fatter than their papers say. #id:O-SC-T2-09-5 #speaker:toby
- (ch_t2_09_1) Toby is rushing around like usual. "Nella's order goes out before noon. Hold that corner for me?" #choice:CH-T2-09-1 #id:L-CH-T2-09-1-s #speaker:toby
* [helps pack the order] #opt:CH-T2-09-1-a
    ~ recordBond("toby", "Intimacy")
    Take the far corner of the wrapping paper and pack alongside him #id:L-CH-T2-09-1-a-act #speaker:toby
    Flat breads first. #id:L-CH-T2-09-1-a-r1 #speaker:toby
    Rolls on top so they don't press. Look at that! Your fold is neater than mine. #id:L-CH-T2-09-1-a-r2 #speaker:toby
* ["Whose order is this?"] #opt:CH-T2-09-1-b #id:L-CH-T2-09-1-b-p
    ~ recordBond("toby", "Trust")
    Nella's. Six flats, four rolls, one loaf she says is for the dog. #id:L-CH-T2-09-1-b-r1 #speaker:toby
    Her boy likes the soft rolls. The ones on top are for him. #id:L-CH-T2-09-1-b-r2 #speaker:toby
- (g_ch_t2_09_1) Toby adds two rolls to the package. The order still says four. #id:A-SC-T2-09-2 #speaker:toby
- (ch_t2_09_2) That's her lot. Pass me the twine? #choice:CH-T2-09-2 #id:L-CH-T2-09-2-s #speaker:toby
* ["Those two weren't on the order."] #opt:CH-T2-09-2-a #id:L-CH-T2-09-2-a-p
    ~ KnownPhrases += repaid_seen
    ~ recordKnowledge("repaid_seen")
    ~ recordThreadMove("toby-the-shelf")
    Yup, order says four. #id:L-CH-T2-09-2-a-r1 #speaker:toby
    She's feeding four now. The order still says a family of three. #id:L-CH-T2-09-2-a-r2 #speaker:toby
    You're still holding that corner. Tie's done. Let it go. #id:L-CH-T2-09-2-a-r3 #speaker:toby
    -- (ch_t2_09_2_a_1) Toby winks at you, "House measure. The tin bakes six anyways." #choice:CH-T2-09-2-a-1 #id:L-CH-T2-09-2-a-1-s #speaker:toby
    ** [lets the label stand] #opt:CH-T2-09-2-a-1-a
        ~ recordBond("toby", "Intimacy")
        Fold the paper over the rolls and let the label stand #id:L-CH-T2-09-2-a-1-a-act #speaker:toby
        That's done. #id:L-CH-T2-09-2-a-1-a-r1 #speaker:toby
        Next one's for the lane cottages. I'll bring the paper over to you. #id:L-CH-T2-09-2-a-1-a-r2 #speaker:toby
    ** ["What did she do to earn two rolls?"] #opt:CH-T2-09-2-a-1-b #id:L-CH-T2-09-2-a-1-b-p
        ~ recordBond("toby", "Trust")
        Parcel's for the Hallam order. #id:L-CH-T2-09-2-a-1-b-r1 #speaker:toby
        Toby's hands keep working the parcel shut. The order paper lies where it is. #id:A-CH-T2-09-2-a-1-r #speaker:toby
        She's got a new baby. Plus, she left a jar on my step in spring. It's on the shelf still. #id:L-CH-T2-09-2-a-1-b-r2 #speaker:toby
        Let the counter take that corner. The tie holds without you now. #id:L-CH-T2-09-2-a-1-b-r3 #speaker:toby
    -- (g_ch_t2_09_2_a) Placeholder: the scene continues. #id:GB-CH-T2-09-2-a-1-GATHER
* [keeps packing, lets them pass] #opt:CH-T2-09-2-b
    ~ recordBond("toby", "Intimacy")
    Keep packing, and let the two rolls go under the paper #id:L-CH-T2-09-2-b-act #speaker:toby
    Good fold. #id:L-CH-T2-09-2-b-r1 #speaker:toby
    Cross the ties. Nella opens them one-handed with the baby up. #id:L-CH-T2-09-2-b-r2 #speaker:toby
    Jug behind you is fresh from the well. Cup's on the hook. #id:L-CH-T2-09-2-b-r3 #speaker:toby
- (g_ch_t2_09_2) Placeholder: the scene continues. #id:GB-CH-T2-09-2-GATHER
- (ch_t2_09_3) { KnownPhrases ? shelf_seen: Behind Toby the jars stand in their row. He carries Nella's parcel past them. #choice:CH-T2-09-3 #id:L-CH-T2-09-3-s #speaker:toby }
* {KnownPhrases ? shelf_seen} ["You look at the jars on the shelf. "The jars stay shut. The rolls go out.""] #opt:CH-T2-09-3-a #id:L-CH-T2-09-3-a-p
    ~ KnownPhrases += shelf_named
    ~ recordKnowledge("shelf_named")
    ~ recordBond("toby", "Recognition")
    They do. #id:L-CH-T2-09-3-a-r1 #speaker:toby
    Toby goes still with the parcel in both hands, then lifts the empty crate off the counter. #id:A-CH-T2-09-3-a-r #speaker:toby
    Stay if you like. #id:L-CH-T2-09-3-a-r2 #speaker:toby
    Toby stands at the far end with the crate open, sorting papers into two piles. #id:A-CH-T2-09-6-s #speaker:toby
    ~ enteredByDivert = true
    -> toby.sc_t2_09.ch_t2_09_6
* {KnownPhrases ? shelf_seen} [holds the connection unspoken] #opt:CH-T2-09-3-b
    ~ recordBond("toby", "Intimacy")
    Hand him the twine and leave the jars unmentioned #id:L-CH-T2-09-3-b-act #speaker:toby
    That's her lot done. #id:L-CH-T2-09-3-b-r1 #speaker:toby
    Door parcels next. You read me the names and I'll pull them. #id:L-CH-T2-09-3-b-r2 #speaker:toby
    "Your bag's under the counter where the flour won't reach it." Toby's moved your bag without you even realizing. #id:L-CH-T2-09-3-b-r3 #speaker:toby
* -> g_ch_t2_09_3
- (g_ch_t2_09_3) Placeholder: the scene continues. #id:GB-CH-T2-09-3-GATHER
- (ch_t2_09_4) Two more after hers. Names are on the papers if you want to call them out. #choice:CH-T2-09-4 #id:L-CH-T2-09-4-s #speaker:toby
* ["Does she know what came back to her?"] #opt:CH-T2-09-4-a #id:L-CH-T2-09-4-a-p
    ~ recordBond("toby", "Trust")
    She'll see bread. #id:L-CH-T2-09-4-a-r1 #speaker:toby
    The paper says four and the paper's what she keeps. #id:L-CH-T2-09-4-a-r2 #speaker:toby
    Call the next name for me. My hands are full of twine. #id:L-CH-T2-09-4-a-r3 #speaker:toby
* [stacks the finished order for pickup **roc review: cut this**] #opt:CH-T2-09-4-b
    ~ recordBond("toby", "Intimacy")
    Stack the finished parcel with the ties facing up #id:L-CH-T2-09-4-b-act #speaker:toby
    By the door, not the wall. She comes in from the lane. #id:L-CH-T2-09-4-b-r1 #speaker:toby
    That's one job off me. I'll have the papers over before you're out the door. #id:L-CH-T2-09-4-b-r2 #speaker:toby
- (g_ch_t2_09_4) Placeholder: the scene continues. #id:GB-CH-T2-09-4-GATHER
- (ch_t2_09_5) Hers goes on the end. Morning ones come off that side first. #choice:CH-T2-09-5 #id:L-CH-T2-09-5-s #speaker:toby
* ["How many of those carry something extra?"] #opt:CH-T2-09-5-a #id:L-CH-T2-09-5-a-p
    ~ recordBond("toby", "Trust")
    Four. Five, if the Smith boy's cough is still on him tomorrow. #id:L-CH-T2-09-5-a-r1 #speaker:toby
    It's not much. #id:L-CH-T2-09-5-a-r2 #speaker:toby
    Read me the top one. #id:L-CH-T2-09-5-a-r3 #speaker:toby
* [sets the last parcel with it] #opt:CH-T2-09-5-b
    ~ recordBond("toby", "Intimacy")
    Set the last parcel on the pickup shelf beside tomorrow's #id:L-CH-T2-09-5-b-act #speaker:toby
    Saves me the reach. #id:L-CH-T2-09-5-b-r1 #speaker:toby
    Lane names to the left, that's it. You place them straighter than I do. #id:L-CH-T2-09-5-b-r2 #speaker:toby
- (g_ch_t2_09_5) Four twine-tied parcels wait on the pickup shelf for tomorrow, three of them fatter than their papers say. #id:O-SC-T2-09-5 #speaker:toby
- (ch_t2_09_6) {enteredByDivert:Let's see, what's next... #choice:CH-T2-09-6 #id:L-CH-T2-09-6-s-div #speaker:toby|All done. Anything I can get you, while you're stilll here? #choice:CH-T2-09-6 #id:L-CH-T2-09-6-s-norm #speaker:toby}
* [leaves him the task he found] #opt:CH-T2-09-6-a
    ~ recordBond("toby", "Intimacy")
    Leave him the papers and take the door #id:L-CH-T2-09-6-a-act #speaker:toby
    {enteredByDivert:*(divert path)* "Your pack's by the pickup shelf. I stitched the strap back this morning." #id:L-CH-T2-09-6-a-r1-div #speaker:toby|*(normal path)* "Cart goes Thursday. I'll put your name down for a place on it." #id:L-CH-T2-09-6-a-r1-norm #speaker:toby}
    Come on by before noon if you can make it! #id:L-CH-T2-09-6-a-r2 #speaker:toby
* ["{enteredByDivert:*(divert path)* "The work never ends, I guess."|*(normal path)* "Do you ever slow down?"}"] #opt:CH-T2-09-6-b {enteredByDivert:#id:L-CH-T2-09-6-b-p-div|#id:L-CH-T2-09-6-b-p-norm}
    ~ recordBond("toby", "Recognition")
    Toby goes back to the papers. #id:A-CH-T2-09-6-b-s #speaker:toby
    Somebody's got to. #id:L-CH-T2-09-6-b-r1 #speaker:toby
    Lamp at the lane end is lit. #id:L-CH-T2-09-6-b-r2 #speaker:toby
- (g_ch_t2_09_6) Placeholder: the scene continues. #id:GB-CH-T2-09-6-GATHER
    ~ enteredByDivert = false
-> t2.hub

= sc_t2_10
- (ch_t2_10_1) Toby shakes out the folded cloth and folds it again the same way. #choice:CH-T2-10-1 #id:A-SC-T2-10-1 #speaker:toby
* [sets the dawn bundle on the counter, nothing owed] #opt:CH-T2-10-1-a
    ~ KnownPhrases += gave_unowed
    ~ recordKnowledge("gave_unowed")
    Set the jar of plums on the counter and take your hand off it. #id:L-CH-T2-10-1-a-act #speaker:toby
    This is for me. #id:L-CH-T2-10-1-a-r1 #speaker:toby
    Toby stops. The cloth stays in his hand and does not move. #id:A-CH-T2-10-1-a-r #speaker:toby
    You came the long way in. The back lane's half the walk going home. #id:L-CH-T2-10-1-a-r2 #speaker:toby
    The jar of plums sits on the counter where it was put. It is not moved. #id:O-CH-T2-10-1-a-r #speaker:toby
* [shares the lull, gives nothing] #opt:CH-T2-10-1-b
    ~ recordBond("toby", "Intimacy")
    Lean on the counter next to him and stay there. #id:L-CH-T2-10-1-b-act #speaker:toby
    Toby seems uneasy. #id:A-CH-T2-10-1-b-r #speaker:toby
    Nothing needs doing today. #id:L-CH-T2-10-1-b-r1 #speaker:toby
    Brown pot's half full of stew from this morning, if you're wanting any. #id:L-CH-T2-10-1-b-r2 #speaker:toby
* ["Is the square usually this empty?"] #opt:CH-T2-10-1-c #id:L-CH-T2-10-1-c-p
    ~ recordBond("toby", "Trust")
    Till the bells. Then it's everybody at once and I'm short of hands. #id:L-CH-T2-10-1-c-r1 #speaker:toby
    Bells go twice before the rush starts. But right now got nothing to do. #id:L-CH-T2-10-1-c-r2 #speaker:toby
- (g_ch_t2_10_1) Placeholder: the scene continues. #id:GB-CH-T2-10-1-GATHER
- (ch_t2_10_2) { KnownPhrases ? shelf_seen: The shelf behind the counter holds the same jars in the same order. There's a few more now. Every lid is still sealed. #choice:CH-T2-10-2 #id:O-SC-T2-10-2 #speaker:toby }
* {KnownPhrases ? shelf_seen} [stays beside it, saying nothing] #opt:CH-T2-10-2-a
    ~ recordBond("toby", "Intimacy")
    Stand beside the shelf and say nothing at all. #id:L-CH-T2-10-2-a-act #speaker:toby
    Toby stands at the counter and looks at the door. #id:A-CH-T2-10-2-a-r #speaker:toby
    Board's sound. Deep enough to take two rows. #id:L-CH-T2-10-2-a-r1 #speaker:toby
    Chair's by the window. Out of the draught there. #id:L-CH-T2-10-2-a-r2 #speaker:toby
* {KnownPhrases ? shelf_seen} ["Your jar collection is growing."] #opt:CH-T2-10-2-b #id:L-CH-T2-10-2-b-p
    ~ recordBond("toby", "Recognition")
    Toby laughs once. #id:A-CH-T2-10-2-b-r #speaker:toby
    I can't seem to get rid of them. #id:L-CH-T2-10-2-b-r1 #speaker:toby
    Two off Mara, three off the stall run. None of them mine. #id:L-CH-T2-10-2-b-r2 #speaker:toby
    There's a full one behind you. Take it when you go. #id:L-CH-T2-10-2-b-r3 #speaker:toby
* -> g_ch_t2_10_2
- (g_ch_t2_10_2) Placeholder: the scene continues. #id:GB-CH-T2-10-2-GATHER
- (ch_t2_10_3) { KnownPhrases ? repaid_seen: No order half packed on the counter. Toby sets the empty tray in line with its edge. #choice:CH-T2-10-3 #id:L-CH-T2-10-3-s-both #speaker:toby }
* {KnownPhrases ? repaid_seen} [keeps him company in it] #opt:CH-T2-10-3-a
    ~ recordBond("toby", "Intimacy")
    Pull up the stool and wait the empty hour out with him. #id:L-CH-T2-10-3-a-act #speaker:toby
    It'll be an hour yet. #id:L-CH-T2-10-3-a-r1 #speaker:toby
    Cup's set out for you, next to the pot. #id:L-CH-T2-10-3-a-r2 #speaker:toby
* {KnownPhrases ? repaid_seen} ["Just came by to see how you're doing."] #opt:CH-T2-10-3-b #id:L-CH-T2-10-3-b-p
    ~ recordBond("toby", "Recognition")
    Alright. #id:L-CH-T2-10-3-b-r1 #speaker:toby
    That honey cake went unclaimed Tuesday. Split it with me while it's quiet. #id:L-CH-T2-10-3-b-r2 #speaker:toby
* -> g_ch_t2_10_3
- (g_ch_t2_10_3) Placeholder: the scene continues. #id:GB-CH-T2-10-3-GATHER
- (ch_t2_10_4) A boy leans in the doorway with an empty crate under his arm. #choice:CH-T2-10-4 #id:A-SC-T2-10-4 #speaker:toby
* [leaves, the visit having been only company] #opt:CH-T2-10-4-a
    ~ recordBond("toby", "Intimacy")
    Take your things off the counter and go. #id:L-CH-T2-10-4-a-act #speaker:toby
    Thursday the flour cart comes in early. I could use another pair of hands. #id:L-CH-T2-10-4-a-r1 #speaker:toby
    Toby holds the crate in both hands and watches the door until it shuts. #id:L-CH-T2-10-4-a-r2 #speaker:toby
* ["I'll come back next time there's nothing to do."] #opt:CH-T2-10-4-b #id:L-CH-T2-10-4-b-p
    ~ recordBond("toby", "Trust")
    Sunday, maybe. #id:L-CH-T2-10-4-b-r1 #speaker:toby
    Knock if the door's shut. I'll hear you from the back room. #id:L-CH-T2-10-4-b-r2 #speaker:toby
- (g_ch_t2_10_4) Placeholder: the scene continues. #id:GB-CH-T2-10-4-GATHER
-> t2.hub

= sc_t2_11
Marta and Toby are in the bakery. A round loaf sits in Marta's basket, wrapped in brown paper, on top of the eggs she came out for. #id:O-SC-T2-11-1 #speaker:toby
- (ch_t2_11_1) Toby wraps Marta's order while she talks, eyes on the string the whole time. #choice:CH-T2-11-1 #id:A-SC-T2-11-1 #speaker:toby
* ["I know, Toby really know how to look out for people"] #opt:CH-T2-11-1-a #id:L-CH-T2-11-1-a-p
    ~ recordThreadMove("toby-the-shelf")
    I had a few left over. #id:L-CH-T2-11-1-a-r1 #speaker:toby
    Toby sets Marta's basket straight on the board and does not look up. #id:A-CH-T2-11-1-a-r2 #speaker:toby
    Toby turns to the coin box and lifts the lid. #id:A-CH-T2-11-1-a-r3 #speaker:toby
    Your change from Tuesday. You were gone before I counted it out. #id:L-CH-T2-11-1-a-r4 #speaker:toby
* [lets the remark sit] #opt:CH-T2-11-1-b
    ~ recordBond("toby", "Intimacy")
    Say nothing, and let Marta's words stay in the air #id:L-CH-T2-11-1-b-act #speaker:toby
    Marta, your eggs are down the side, I made sure they wouldn't get crushed. #id:L-CH-T2-11-1-b-r1 #speaker:toby
    Toby turns from Marta and holds out a handful of cherries. #id:A-CH-T2-11-1-b-r2 #speaker:toby
    First of the week. Off the morning cart. #id:L-CH-T2-11-1-b-r3 #speaker:toby
* ["What did you come out for, Marta?"] #opt:CH-T2-11-1-c #id:L-CH-T2-11-1-c-p
    ~ recordBond("toby", "Trust")
    Eggs and the barley loaf, and I need to stop by Ilsa's to pickup a repair." #id:L-CH-T2-11-1-c-r1 #speaker:marta
    Toby turns to you. "Walk her basket to the corner for me. It's more than she should carry." #id:L-CH-T2-11-1-c-r2 #speaker:toby
- (g_ch_t2_11_1) Placeholder: the scene continues. #id:GB-CH-T2-11-1-GATHER
- (ch_t2_11_2) { bondLevel_toby == 0: Toby stacks the morning's coppers into a short column at the side of the board while he talks. #choice:CH-T2-11-2 #id:A-CH-T2-11-2-s #speaker:toby }
* {bondLevel_toby == 0} ["And what does mine come to?"] #opt:CH-T2-11-2-a #id:L-CH-T2-11-2-a-p
    ~ recordBond("toby", "Trust")
    Not worked out. #id:L-CH-T2-11-2-a-r1 #speaker:toby
    That tray came out pale on one side. Seconds now, so eat them for me. #id:L-CH-T2-11-2-a-r2 #speaker:toby
    Take two. You'll be out past the drum band. #id:L-CH-T2-11-2-a-r3 #speaker:toby
* {bondLevel_toby == 0} [leaves the ledger closed] #opt:CH-T2-11-2-b
    ~ recordBond("toby", "Intimacy")
    Set the coppers back in the tin and close the lid #id:L-CH-T2-11-2-b-act #speaker:toby
    Right. #id:L-CH-T2-11-2-b-r1 #speaker:toby
    Stand in under the canvas if you're stopping. #id:L-CH-T2-11-2-b-r2 #speaker:toby
* -> g_ch_t2_11_2
- (g_ch_t2_11_2) Placeholder: the scene continues. #id:GB-CH-T2-11-2-GATHER
- (ch_t2_11_3) { bondLevel_toby == 1: Toby carries the crate two steps off and sorts tins facing the square. #choice:CH-T2-11-3 #id:A-CH-T2-11-3-s #speaker:toby }
* {bondLevel_toby == 1} [follows him into the task, works alongside] #opt:CH-T2-11-3-a
    ~ recordBond("toby", "Intimacy")
    Carry the second crate down and sort tins beside him #id:L-CH-T2-11-3-a-act #speaker:toby
    Dented ones by your hand. #id:L-CH-T2-11-3-a-r1 #speaker:toby
    Cheap after dark, that sort. #id:L-CH-T2-11-3-a-r2 #speaker:toby
    You're quicker at it. Leave me the bottom row. #id:L-CH-T2-11-3-a-r3 #speaker:toby
* {bondLevel_toby == 1} [holds position, lets him circle back] #opt:CH-T2-11-3-b
    ~ recordBond("toby", "Trust")
    Stay at the stall and let him sort the tins #id:L-CH-T2-11-3-b-act #speaker:toby
    One minute. #id:L-CH-T2-11-3-b-r1 #speaker:toby
    Tins are done. Go on, you were talking. #id:L-CH-T2-11-3-b-r2 #speaker:toby
    Spiced milk's warming two stalls down. I put a coin across for you when the tins started. #id:L-CH-T2-11-3-b-r3 #speaker:toby
* -> g_ch_t2_11_3
- (g_ch_t2_11_3) Placeholder: the scene continues. #id:GB-CH-T2-11-3-GATHER
- (ch_t2_11_4) { bondLevel_toby == 2: Crate's still to shift. #choice:CH-T2-11-4 #id:L-CH-T2-11-4-s #speaker:toby }
* {bondLevel_toby == 2} ["You didn't go this time."] #opt:CH-T2-11-4-a #id:L-CH-T2-11-4-a-p
    ~ recordBond("toby", "Recognition")
    Didn't. #id:L-CH-T2-11-4-a-r1 #speaker:toby
    Wanted to hear the rest. #id:L-CH-T2-11-4-a-r2 #speaker:toby
    Your parcels went home with the carrier at noon. You're free for the rest of it. #id:L-CH-T2-11-4-a-r3 #speaker:toby
* {bondLevel_toby == 2} [gives him the room, says nothing of it — 2 slots] #opt:CH-T2-11-4-b
    ~ recordBond("toby", "Intimacy")
    Turn toward the square and watch the crowd go past #id:L-CH-T2-11-4-b-act #speaker:toby
    Band comes down this way at dusk. You'll see it all from here. #id:L-CH-T2-11-4-b-r1 #speaker:toby
    That paper parcel by you is cheese. For the wait. #id:L-CH-T2-11-4-b-r2 #speaker:toby
* -> g_ch_t2_11_4
- (g_ch_t2_11_4) Placeholder: the scene continues. #id:GB-CH-T2-11-4-GATHER
- (ch_t2_11_5) { KnownPhrases ? gave_unowed: Brought the shelf out with me. Whole lot of it, for the day. #choice:CH-T2-11-5 #id:L-CH-T2-11-5-s #speaker:toby }
* {KnownPhrases ? gave_unowed} ["It's still wrapped."] #opt:CH-T2-11-5-a #id:L-CH-T2-11-5-a-p
    ~ recordBond("toby", "Recognition")
    It is. #id:L-CH-T2-11-5-a-r1 #speaker:toby
    Wool holds. It's not going anywhere. #id:L-CH-T2-11-5-a-r2 #speaker:toby
    Your water skin's full. Did it while you were over at Marta's. #id:L-CH-T2-11-5-a-r3 #speaker:toby
* {KnownPhrases ? gave_unowed} [leaves it unspent] #opt:CH-T2-11-5-b
    Look at the row of jars and turn back to the square #id:L-CH-T2-11-5-b-act #speaker:toby
    Right. #id:L-CH-T2-11-5-b-r1 #speaker:toby
    The bundle stays tied at the end of the row, and the crowd moves past the board. #id:O-CH-T2-11-5-b-r2 #speaker:toby
* -> g_ch_t2_11_5
- (g_ch_t2_11_5) Placeholder: the scene continues. #id:GB-CH-T2-11-5-GATHER
-> t2.hub

= sc_t6_01
- (ch_t6_01_1) { present_toby == "T6" && day >= 4: Placeholder set-up: Toby is carrying for a room that has stopped noticing him. #choice:CH-T6-01-1 #id:L-SC-T6-01-01 #speaker:toby }
* {present_toby == "T6" && day >= 4} ["Placeholder player line: ask what he has left to bring."] #opt:CH-T6-01-1-a #id:L-CH-T6-01-1-a-p
    ~ KnownPhrases += tavern_tab
    ~ recordKnowledge("tavern_tab")
    Placeholder response: he lists the room's wants, not his own. #id:L-CH-T6-01-1-a-r1 #speaker:toby
* {present_toby == "T6" && day >= 4} [carry two of the plates] #opt:CH-T6-01-1-b
    Placeholder response: he lets the plates go and takes up three more. #id:L-CH-T6-01-1-b-r1 #speaker:toby
* {present_toby == "T6" && day >= 4} ["Placeholder player line: take the bench and wait."] #opt:CH-T6-01-1-c #id:L-CH-T6-01-1-c-p
    Placeholder response: he passes twice before he sits. #id:L-CH-T6-01-1-c-r1 #speaker:toby
* -> g_ch_t6_01_1
- (g_ch_t6_01_1) Placeholder: the scene continues. #id:GB-CH-T6-01-1-GATHER
- (ch_t6_01_2) { present_toby == "T6": Placeholder set-up: someone calls his name for another round. #choice:CH-T6-01-2 #id:L-SC-T6-01-02 #speaker:toby }
* {present_toby == "T6"} ["Placeholder player line: answer for him."] #opt:CH-T6-01-2-a #id:L-CH-T6-01-2-a-p
    Placeholder response: he looks at you, then at the room. #id:L-CH-T6-01-2-a-r1 #speaker:toby
* {present_toby == "T6"} ["Placeholder player line: let him answer."] #opt:CH-T6-01-2-b #id:L-CH-T6-01-2-b-p
    Placeholder response: he is up before the sentence ends. #id:L-CH-T6-01-2-b-r1 #speaker:toby
* -> g_ch_t6_01_2
- (g_ch_t6_01_2) Placeholder: the scene continues. #id:GB-CH-T6-01-2-GATHER
- (ch_t6_01_3) { present_toby == "T6" && KnownPhrases ? tavern_tab: Placeholder set-up: the tab he has been quietly covering, now visible on the board. #choice:CH-T6-01-3 #id:L-SC-T6-01-03 #speaker:toby }
* {present_toby == "T6" && KnownPhrases ? tavern_tab} ["Placeholder player line: name what is on the board."] #opt:CH-T6-01-3-a #id:L-CH-T6-01-3-a-p
    ~ recordThreadMove("giver-receive")
    Placeholder response: he says it is easier than asking. #id:L-CH-T6-01-3-a-r1 #speaker:toby
* {present_toby == "T6" && KnownPhrases ? tavern_tab} ["Placeholder player line: say nothing about the board."] #opt:CH-T6-01-3-b #id:L-CH-T6-01-3-b-p
    Placeholder response: he turns the board face down on his way past. #id:L-CH-T6-01-3-b-r1 #speaker:toby
* -> g_ch_t6_01_3
- (g_ch_t6_01_3) Placeholder: the scene continues. #id:GB-CH-T6-01-3-GATHER
- (ch_t6_01_4) { present_toby == "T6": Placeholder set-up: he offers you the last of the good bread. #choice:CH-T6-01-4 #id:L-SC-T6-01-04 #speaker:toby }
* {present_toby == "T6"} [take the bread] #opt:CH-T6-01-4-a
    Placeholder response: he seems relieved to be rid of it. #id:L-CH-T6-01-4-a-r1 #speaker:toby
* {present_toby == "T6"} ["Placeholder player line: split it with him."] #opt:CH-T6-01-4-b #id:L-CH-T6-01-4-b-p
    Placeholder response: he eats standing, and quickly. #id:L-CH-T6-01-4-b-r1 #speaker:toby
    -> toby.sc_t6_01.ch_t6_01_7
* -> g_ch_t6_01_4
- (g_ch_t6_01_4) Placeholder: the scene continues. #id:GB-CH-T6-01-4-GATHER
- (ch_t6_01_5) { present_toby == "T6": Placeholder set-up: the room thins out and the work does not. #choice:CH-T6-01-5 #id:L-SC-T6-01-05 #speaker:toby }
* {present_toby == "T6"} [stack the benches on his side] #opt:CH-T6-01-5-a
    Placeholder response: he re-stacks them his way, then leaves them. #id:L-CH-T6-01-5-a-r1 #speaker:toby
* {present_toby == "T6"} ["Placeholder player line: ask who closes up."] #opt:CH-T6-01-5-b #id:L-CH-T6-01-5-b-p
    Placeholder response: he says it is not worth waking anyone for. #id:L-CH-T6-01-5-b-r1 #speaker:toby
* -> g_ch_t6_01_5
- (g_ch_t6_01_5) Placeholder: the scene continues. #id:GB-CH-T6-01-5-GATHER
- (ch_t6_01_6) { present_toby == "T6": Placeholder set-up: he counts the till twice and gets the same wrong number. #choice:CH-T6-01-6 #id:L-SC-T6-01-06 #speaker:toby }
* {present_toby == "T6"} ["Placeholder player line: count it with him."] #opt:CH-T6-01-6-a #id:L-CH-T6-01-6-a-p
    ~ recordBond("toby", "Recognition")
    Placeholder response: the third count agrees with your two. #id:L-CH-T6-01-6-a-r1 #speaker:toby
* {present_toby == "T6"} ["Placeholder player line: wait out the third count."] #opt:CH-T6-01-6-b #id:L-CH-T6-01-6-b-p
    Placeholder response: he gets there alone, slower. #id:L-CH-T6-01-6-b-r1 #speaker:toby
* -> g_ch_t6_01_6
- (g_ch_t6_01_6) Placeholder: the scene continues. #id:GB-CH-T6-01-6-GATHER
- (ch_t6_01_7) { present_toby == "T6": Placeholder set-up: the near-receive. He begins to ask you for something and stops. #choice:CH-T6-01-7 #id:L-SC-T6-01-07 #speaker:toby }
* {present_toby == "T6"} ["Placeholder player line: hold the pause open."] #opt:CH-T6-01-7-a #id:L-CH-T6-01-7-a-p
    ~ recordBond("toby", "Intimacy")
    ~ recordThreadMove("giver-receive")
    Placeholder response: he finishes the sentence, barely. #id:L-CH-T6-01-7-a-r1 #speaker:toby
* {present_toby == "T6"} ["Placeholder player line: fill the pause for him."] #opt:CH-T6-01-7-b #id:L-CH-T6-01-7-b-p
    Placeholder response: he takes your version instead of his own. #id:L-CH-T6-01-7-b-r1 #speaker:toby
* -> g_ch_t6_01_7
- (g_ch_t6_01_7) Placeholder: the scene continues. #id:GB-CH-T6-01-7-GATHER
- (ch_t6_01_8) { present_toby == "T6": Placeholder set-up: the door, the cold, and whatever he did or did not say. #choice:CH-T6-01-8 #id:L-SC-T6-01-08 #speaker:toby }
* {present_toby == "T6"} ["Placeholder player line: say you will be back tomorrow."] #opt:CH-T6-01-8-a #id:L-CH-T6-01-8-a-p
    ~ recordThreadMove("giver-receive")
    Placeholder response: he says the bread will be better then. #id:L-CH-T6-01-8-a-r1 #speaker:toby
* {present_toby == "T6"} [leave the lamp lit for him] #opt:CH-T6-01-8-b
    Placeholder response: he does not put it out. #id:L-CH-T6-01-8-b-r1 #speaker:toby
* -> g_ch_t6_01_8
- (g_ch_t6_01_8) Placeholder: the scene continues. #id:GB-CH-T6-01-8-GATHER
-> t6.hub

= sc_t7_toby
- (ch_t7_toby_1) { day >= 5: Placeholder set-up: the grounds are lit and Toby is still carrying, not standing. #choice:CH-T7-toby-1 #id:L-SC-T7-toby-01 #speaker:toby }
* {day >= 5} [take one end of the tray] #opt:CH-T7-toby-1-a
    ~ recordBond("toby", "Intimacy")
    Placeholder response: he hands it over and immediately finds another. #id:L-CH-T7-toby-1-a-r1 #speaker:toby
* {day >= 5} ["It's lit. You can stop."] #opt:CH-T7-toby-1-b #id:L-CH-T7-toby-1-b-p
    ~ recordBond("toby", "Recognition")
    Placeholder response: he says he will, in a minute, the way he always does. #id:L-CH-T7-toby-1-b-r1 #speaker:toby
* -> g_ch_t7_toby_1
- (g_ch_t7_toby_1) Placeholder: the scene continues. #id:GB-CH-T7-toby-1-GATHER
- (ch_t7_toby_2) { day >= 5 && bondLevel_toby == 0: Placeholder set-up (LOW): someone thanks him and he redirects it to the ovens. #choice:CH-T7-toby-2 #id:L-SC-T7-toby-02 #speaker:toby }
* {day >= 5 && bondLevel_toby == 0} ["You did that."] #opt:CH-T7-toby-2-a #id:L-CH-T7-toby-2-a-p
    ~ recordBond("toby", "Recognition")
    Placeholder response: he agrees about the ovens. #id:L-CH-T7-toby-2-a-r1 #speaker:toby
* {day >= 5 && bondLevel_toby == 0} [let him hand the thanks along] #opt:CH-T7-toby-2-b
    Placeholder response: the thanks lands somewhere else, and he looks lighter for it. #id:L-CH-T7-toby-2-b-r1 #speaker:toby
* -> g_ch_t7_toby_2
- (g_ch_t7_toby_2) Placeholder: the scene continues. #id:GB-CH-T7-toby-2-GATHER
- (ch_t7_toby_3) { day >= 5 && bondLevel_toby == 1: Placeholder set-up (MID): someone presses a wrapped thing on him and he keeps it, unnamed. #choice:CH-T7-toby-3 #id:L-SC-T7-toby-03 #speaker:toby }
* {day >= 5 && bondLevel_toby == 1} ["You kept it."] #opt:CH-T7-toby-3-a #id:L-CH-T7-toby-3-a-p
    ~ recordBond("toby", "Recognition")
    ~ recordThreadMove("giver-receive")
    Placeholder response: he looks at his own hands, surprised by them. #id:L-CH-T7-toby-3-a-r1 #speaker:toby
* {day >= 5 && bondLevel_toby == 1} [say nothing and stand with him] #opt:CH-T7-toby-3-b
    ~ recordBond("toby", "Intimacy")
    Placeholder response: he does not put it down for the rest of the hour. #id:L-CH-T7-toby-3-b-r1 #speaker:toby
* -> g_ch_t7_toby_3
- (g_ch_t7_toby_3) Placeholder: the scene continues. #id:GB-CH-T7-toby-3-GATHER
- (ch_t7_toby_4) { day >= 5 && bondLevel_toby == 2: Placeholder set-up (HIGH): he keeps it, and then he says the thing out loud himself. #choice:CH-T7-toby-4 #id:L-SC-T7-toby-04 #speaker:toby }
* {day >= 5 && bondLevel_toby == 2} ["I see you too."] #opt:CH-T7-toby-4-a #id:L-CH-T7-toby-4-a-p
    ~ recordBond("toby", "Intimacy")
    ~ recordThreadMove("giver-receive")
    Placeholder response: he laughs, and does not deflect it. #id:L-CH-T7-toby-4-a-r1 #speaker:toby
* {day >= 5 && bondLevel_toby == 2} [let the sentence stand] #opt:CH-T7-toby-4-b
    ~ recordBond("toby", "Recognition")
    ~ recordThreadMove("giver-receive")
    Placeholder response: he lets it stand too, which is new. #id:L-CH-T7-toby-4-b-r1 #speaker:toby
* -> g_ch_t7_toby_4
- (g_ch_t7_toby_4) Placeholder: the scene continues. #id:GB-CH-T7-toby-4-GATHER
- (ch_t7_toby_5) { day >= 5: Placeholder set-up: the lanterns go up together and the ovens are, finally, someone else's. #choice:CH-T7-toby-5 #id:L-SC-T7-toby-05 #speaker:toby }
* {day >= 5} [stay for the lighting] #opt:CH-T7-toby-5-a
    ~ recordBond("toby", "Intimacy")
    Placeholder response: he watches the lanterns instead of the trays. #id:L-CH-T7-toby-5-a-r1 #speaker:toby
* {day >= 5} ["Save me a sweet roll."] #opt:CH-T7-toby-5-b #id:L-CH-T7-toby-5-b-p
    ~ recordThreadMove("giver-receive")
    Placeholder response: he says he already did, hours ago. #id:L-CH-T7-toby-5-b-r1 #speaker:toby
* -> g_ch_t7_toby_5
- (g_ch_t7_toby_5) Placeholder: the scene continues. #id:GB-CH-T7-toby-5-GATHER
-> t7.hub

= sc_t2_15
- (ch_t2_15_1) A starter crock stands on the bench among Toby's own, a different household's mark scored on the lid. The ovens are coming back up behind it. #choice:CH-T2-15-1 #id:O-SC-T2-15-1 #speaker:toby
* ["What did this morning cost you?"] #opt:CH-T2-15-1-a #id:L-CH-T2-15-1-a-p
    ~ recordBond("toby", "Trust")
    Nothing I'd count. #id:L-CH-T2-15-1-a-r1 #speaker:toby
    It got me a live starter. First batch proves by noon. #id:L-CH-T2-15-1-a-r2 #speaker:toby
    There's a heel of yesterday's loaf by the scales. It's yours. #id:L-CH-T2-15-1-a-r3 #speaker:toby
* [takes up the nearest part of the work] #opt:CH-T2-15-1-b
    ~ recordBond("toby", "Intimacy")
    Take up the nearest tray and carry it to the rack #id:L-CH-T2-15-1-b-act #speaker:toby
    Ah, thanks. Rack's behind you. #id:L-CH-T2-15-1-b-r1 #speaker:toby
    Apron's on the peg, that shirt's too good for flour. #id:L-CH-T2-15-1-b-r2 #speaker:toby
- (g_ch_t2_15_1) Placeholder: the scene continues. #id:GB-CH-T2-15-1-GATHER
- (ch_t2_15_2) Toby counts along the shelf while his hands keep shaping loaves, the tally running over the top of the work. #choice:CH-T2-15-2 #id:A-SC-T2-15-2 #speaker:toby
* ["Where does forty come from?"] #opt:CH-T2-15-2-a #id:L-CH-T2-15-2-a-p
    ~ KnownPhrases += count_is_turnout
    ~ recordKnowledge("count_is_turnout")
    ~ recordThreadMove("toby-feast-short")
    ~ recordBond("toby", "Recognition")
    -- (ch_t2_15_2_a_1) Off the square. I count who might turn out: the smith, the Hallow house, everyone down the row. Anyone standing there eats. #choice:CH-T2-15-2-a-1 #id:L-CH-T2-15-2-a-1-s #speaker:toby
    ** [lets the count stand unquestioned] #opt:CH-T2-15-2-a-1-a
        ~ recordBond("toby", "Intimacy")
        Let the count stand #id:L-CH-T2-15-2-a-1-a-act #speaker:toby
        So forty it is. #id:L-CH-T2-15-2-a-1-a-r1 #speaker:toby
        Second batch is yours to taste when it's out. #id:L-CH-T2-15-2-a-1-a-r2 #speaker:toby
    ** ["You're counting people who ordered nothing."] #opt:CH-T2-15-2-a-1-b #id:L-CH-T2-15-2-a-1-b-p
        ~ recordBond("toby", "Recognition")
        Yup. #id:L-CH-T2-15-2-a-1-b-r1 #speaker:toby
        Order slate's one column. Square's the other. #id:L-CH-T2-15-2-a-1-b-r2 #speaker:toby
        Mind your sleeve, the bench edge is floured. #id:L-CH-T2-15-2-a-1-b-r3 #speaker:toby
    -- (g_ch_t2_15_2_a) Placeholder: the scene continues. #id:GB-CH-T2-15-2-a-1-GATHER
* ["What comes next, then?"] #opt:CH-T2-15-2-b #id:L-CH-T2-15-2-b-p
    ~ recordBond("toby", "Trust")
    Wood, before the second bake. #id:L-CH-T2-15-2-b-r1 #speaker:toby
    Then salt off the stall, then the crock goes back. #id:L-CH-T2-15-2-b-r2 #speaker:toby
    First batch is out at noon if you're near. #id:L-CH-T2-15-2-b-r3 #speaker:toby
- (g_ch_t2_15_2) Placeholder: the scene continues. #id:GB-CH-T2-15-2-GATHER
- (ch_t2_15_3) The day's slate leans at the counter. The order tally runs down one side; a larger figure is written beside it and circled. #choice:CH-T2-15-3 #id:O-SC-T2-15-3 #speaker:toby
* [takes the errand] #opt:CH-T2-15-3-a
    ~ recordBond("toby", "Intimacy")
    Take the wood run #id:L-CH-T2-15-3-a-act #speaker:toby
    Good. Stack it by the far oven, split ends out. #id:L-CH-T2-15-3-a-r1 #speaker:toby
    There's a barrow round the side, save your back. #id:L-CH-T2-15-3-a-r2 #speaker:toby
* ["Who else is carrying a piece of this?"] #opt:CH-T2-15-3-b #id:L-CH-T2-15-3-b-p
    ~ recordBond("toby", "Trust")
    Salt comes off the stall. Hallow house proves two trays, their kitchen holds heat better than mine. #id:L-CH-T2-15-3-b-r1 #speaker:toby
    Warm end of the counter's yours if you're stopping. #id:L-CH-T2-15-3-b-r2 #speaker:toby
* ["What happens if nobody takes it?"] #opt:CH-T2-15-3-c #id:L-CH-T2-15-3-c-p
    ~ recordBond("toby", "Recognition")
    Somebody takes it. #id:L-CH-T2-15-3-c-r1 #speaker:toby
    And if they don't, I'll fetch it between bakes. #id:L-CH-T2-15-3-c-r2 #speaker:toby
- (g_ch_t2_15_3) Placeholder: the scene continues. #id:GB-CH-T2-15-3-GATHER
- (ch_t2_15_4) Goes back full. Market day. #choice:CH-T2-15-4 #id:L-CH-T2-15-4-s1 #speaker:toby
* ["You named the return before you said thanks."] #opt:CH-T2-15-4-a #id:L-CH-T2-15-4-a-p
    ~ recordBond("toby", "Recognition")
    Suppose I did. #id:L-CH-T2-15-4-a-r1 #speaker:toby
    Full crock, market day. It's on the slate. #id:L-CH-T2-15-4-a-r2 #speaker:toby
    Mind the step going out, flour makes it slick. #id:L-CH-T2-15-4-a-r3 #speaker:toby
* [sets the crock where he will want it next] #opt:CH-T2-15-4-b
    ~ recordBond("toby", "Intimacy")
    Set the crock where he will want it next #id:L-CH-T2-15-4-b-act #speaker:toby
    That's the spot. #id:L-CH-T2-15-4-b-r1 #speaker:toby
    Batch after this one's the seed. I'll cut you the end. #id:L-CH-T2-15-4-b-r2 #speaker:toby
- (g_ch_t2_15_4) Placeholder: the scene continues. #id:GB-CH-T2-15-4-GATHER
- (ch_t2_15_5) The next tray goes in and the oven door swings shut ahead of the talk. #choice:CH-T2-15-5 #id:A-SC-T2-15-5 #speaker:toby
* [leaves him to the ovens] #opt:CH-T2-15-5-a
    ~ recordBond("toby", "Intimacy")
    Leave him to the ovens #id:L-CH-T2-15-5-a-act #speaker:toby
    Mind how you go. Square's filling up. #id:L-CH-T2-15-5-a-r1 #speaker:toby
    Door sticks, give it a shoulder. #id:L-CH-T2-15-5-a-r2 #speaker:toby
* ["What should I bring back next time?"] #opt:CH-T2-15-5-b #id:L-CH-T2-15-5-b-p
    ~ recordBond("toby", "Trust")
    Yup, now you're talking. Salt, if the stall still has coarse. #id:L-CH-T2-15-5-b-r1 #speaker:toby
    And yourself, around a mealtime. Bread's best warm. #id:L-CH-T2-15-5-b-r2 #speaker:toby
- (g_ch_t2_15_5) Placeholder: the scene continues. #id:GB-CH-T2-15-5-GATHER
-> t2.hub

= sc_t2_16
- (ch_t2_16_1) The tally sheet lies at the counter, twelve standing under a crossed-out forty. The morning's trays are already queued at the ovens. #choice:CH-T2-16-1 #id:O-SC-T2-16-1 #speaker:toby
* ["What does the twelve still need?"] #opt:CH-T2-16-1-a #id:L-CH-T2-16-1-a-p
    ~ recordBond("toby", "Trust")
    Flour's covered. It's hands and oven hours now, mostly. #id:L-CH-T2-16-1-a-r1 #speaker:toby
    Hallow house takes two trays. That leaves eight loaves and the wood stacked short. #id:L-CH-T2-16-1-a-r2 #speaker:toby
    There's a mug's worth left in the pot, go on. #id:L-CH-T2-16-1-a-r3 #speaker:toby
* [takes up the work nearest the counter] #opt:CH-T2-16-1-b
    ~ recordBond("toby", "Intimacy")
    Take up the work nearest the counter #id:L-CH-T2-16-1-b-act #speaker:toby
    Ah, good. Cloth's in the drawer. #id:L-CH-T2-16-1-b-r1 #speaker:toby
    Stool's under the counter if the standing gets long. #id:L-CH-T2-16-1-b-r2 #speaker:toby
- (g_ch_t2_16_1) Placeholder: the scene continues. #id:GB-CH-T2-16-1-GATHER
- (ch_t2_16_2) The borrowed crock stands in the row of Toby's own, the other household's mark turned outward on the lid. #choice:CH-T2-16-2 #id:O-SC-T2-16-2 #speaker:toby
* ["Whose mark is that on the crock?"] #opt:CH-T2-16-2-a #id:L-CH-T2-16-2-a-p
    ~ KnownPhrases += starter_owed
    ~ recordKnowledge("starter_owed")
    ~ recordThreadMove("toby-feast-short")
    ~ recordBond("toby", "Trust")
    House down the row. It goes back full by market day, that's fixed. #id:L-CH-T2-16-2-a-r1 #speaker:toby
    Their mark stays up so nobody shelves it wrong. #id:L-CH-T2-16-2-a-r2 #speaker:toby
* [sets it back with his own and lets it pass] #opt:CH-T2-16-2-b
    ~ recordBond("toby", "Intimacy")
    Set the crock back in line with his own #id:L-CH-T2-16-2-b-act #speaker:toby
    Good, it likes that corner. #id:L-CH-T2-16-2-b-r1 #speaker:toby
    Wet cloth over the lid if you're passing later. #id:L-CH-T2-16-2-b-r2 #speaker:toby
- (g_ch_t2_16_2) Placeholder: the scene continues. #id:GB-CH-T2-16-2-GATHER
- (ch_t2_16_3) Toby works the lending household's week out on the sheet, his hands never leaving the dough. #choice:CH-T2-16-3 #id:A-SC-T2-16-3 #speaker:toby
* ["How do you know their week that exactly?"] #opt:CH-T2-16-3-a #id:L-CH-T2-16-3-a-p
    ~ recordBond("toby", "Recognition")
    Same as anyone's. You just look. #id:L-CH-T2-16-3-a-r1 #speaker:toby
    Their smoke goes up Thursdays. The rest is counting. #id:L-CH-T2-16-3-a-r2 #speaker:toby
    Ask me anyone's. Go on, pick a house. #id:L-CH-T2-16-3-a-r3 #speaker:toby
* ["What goes back with the crock?"] #opt:CH-T2-16-3-b #id:L-CH-T2-16-3-b-p
    ~ recordBond("toby", "Trust")
    Full past its own mark, plus the flour measure. #id:L-CH-T2-16-3-b-r1 #speaker:toby
    And the first loaf off the new starter. #id:L-CH-T2-16-3-b-r2 #speaker:toby
- (g_ch_t2_16_3) Placeholder: the scene continues. #id:GB-CH-T2-16-3-GATHER
- (ch_t2_16_4) That's every house covered. Now mine. #choice:CH-T2-16-4 #id:L-CH-T2-16-4-s1 #speaker:toby
* ["What are you short of yourself?"] #opt:CH-T2-16-4-a #id:L-CH-T2-16-4-a-p
    ~ recordBond("toby", "Recognition")
    Couldn't tell you. #id:L-CH-T2-16-4-a-r1 #speaker:toby
    Sleep, probably. That's not a column. #id:L-CH-T2-16-4-a-r2 #speaker:toby
    You warm enough? Ovens throw heat this end. #id:L-CH-T2-16-4-a-r3 #speaker:toby
* [puts the thing he keeps reaching past within his reach] #opt:CH-T2-16-4-b
    ~ recordBond("toby", "Intimacy")
    Move his cold cup of tea from behind the flour tin to his hand #id:L-CH-T2-16-4-b-act #speaker:toby
    Oh. Ta. #id:L-CH-T2-16-4-b-r1 #speaker:toby
    Yours is the fresh pot, mind. #id:L-CH-T2-16-4-b-r2 #speaker:toby
* ["Back to the tally. Where were we?"] #opt:CH-T2-16-4-c #id:L-CH-T2-16-4-c-p
    ~ recordBond("toby", "Trust")
    Yup, twelve. Eight once the Hallow trays land. #id:L-CH-T2-16-4-c-r1 #speaker:toby
    You're good at this. Keep the pencil. #id:L-CH-T2-16-4-c-r2 #speaker:toby
- (g_ch_t2_16_4) Placeholder: the scene continues. #id:GB-CH-T2-16-4-GATHER
- (ch_t2_16_5) { bondLevel_toby == 0: Salt stall needs carrying help Thursday. That's a job, if you want one. #choice:CH-T2-16-5 #id:L-CH-T2-16-5-s #speaker:toby }
* {bondLevel_toby == 0} ["Why is your own line always last?"] #opt:CH-T2-16-5-a #id:L-CH-T2-16-5-a-p
    ~ recordBond("toby", "Trust")
    Somebody's got to be. #id:L-CH-T2-16-5-a-r1 #speaker:toby
    Order of the day, that's all. Stall first. #id:L-CH-T2-16-5-a-r2 #speaker:toby
* {bondLevel_toby == 0} [takes the piece he assigned] #opt:CH-T2-16-5-b
    ~ recordBond("toby", "Intimacy")
    Take the stall job #id:L-CH-T2-16-5-b-act #speaker:toby
    Good. Morning, before the crowd's in. #id:L-CH-T2-16-5-b-r1 #speaker:toby
    Tell them the bakery sent you, they'll feed you for it. #id:L-CH-T2-16-5-b-r2 #speaker:toby
* -> g_ch_t2_16_5
- (g_ch_t2_16_5) Placeholder: the scene continues. #id:GB-CH-T2-16-5-GATHER
- (ch_t2_16_6) { bondLevel_toby == 1: Toby turns the whole sheet to face the player and lays the pencil down on it. #choice:CH-T2-16-6 #id:A-CH-T2-16-6-s #speaker:toby }
* {bondLevel_toby == 1} ["Your own row isn't on the sheet."] #opt:CH-T2-16-6-a #id:L-CH-T2-16-6-a-p
    ~ recordBond("toby", "Recognition")
    Huh. So it isn't. #id:L-CH-T2-16-6-a-r1 #speaker:toby
    Sheet's for what wants doing. #id:L-CH-T2-16-6-a-r2 #speaker:toby
    Top row's the stall. Start there if you're reading. #id:L-CH-T2-16-6-a-r3 #speaker:toby
* {bondLevel_toby == 1} [works the sheet beside him, adding no row] #opt:CH-T2-16-6-b
    ~ recordBond("toby", "Intimacy")
    Work the sheet beside him without adding a row #id:L-CH-T2-16-6-b-act #speaker:toby
    Tick them left side as they're done. #id:L-CH-T2-16-6-b-r1 #speaker:toby
    Two pencils in the jar behind you. #id:L-CH-T2-16-6-b-r2 #speaker:toby
* -> g_ch_t2_16_6
- (g_ch_t2_16_6) Placeholder: the scene continues. #id:GB-CH-T2-16-6-GATHER
- (ch_t2_16_7) { bondLevel_toby == 2: Toby slides a plate of warm bread ends across before the sentence is done. #choice:CH-T2-16-7 #id:A-CH-T2-16-7-s #speaker:toby }
* {bondLevel_toby == 2} [lets the answer stand uncovered] #opt:CH-T2-16-7-a
    ~ recordBond("toby", "Recognition")
    Let the answer stand, the plate untouched #id:L-CH-T2-16-7-a-act #speaker:toby
    Well. It's said. #id:L-CH-T2-16-7-a-r1 #speaker:toby
    Plate's still yours whenever. #id:L-CH-T2-16-7-a-r2 #speaker:toby
* {bondLevel_toby == 2} ["Don't mind if I do. It's good bread."] #opt:CH-T2-16-7-b #id:L-CH-T2-16-7-b-p
    ~ recordBond("toby", "Intimacy")
    Course it is. Day old's for toasting, mind. #id:L-CH-T2-16-7-b-r1 #speaker:toby
    Hands turn up. They generally do. #id:L-CH-T2-16-7-b-r2 #speaker:toby
* -> g_ch_t2_16_7
- (g_ch_t2_16_7) Placeholder: the scene continues. #id:GB-CH-T2-16-7-GATHER
- (ch_t2_16_8) That's me. Next batch wants shaping. #choice:CH-T2-16-8 #id:L-CH-T2-16-8-s #speaker:toby
* ["Tell me when the crock goes back?"] #opt:CH-T2-16-8-a #id:L-CH-T2-16-8-a-p
    ~ recordBond("toby", "Trust")
    Market day, morning. Come see it off if you like. #id:L-CH-T2-16-8-a-r1 #speaker:toby
    It'll ride the barrow. There's room to walk alongside. #id:L-CH-T2-16-8-a-r2 #speaker:toby
* [leaves the counter as he had it] #opt:CH-T2-16-8-b
    ~ recordBond("toby", "Intimacy")
    Leave the counter as he had it #id:L-CH-T2-16-8-b-act #speaker:toby
    Ta. Just as it was. #id:L-CH-T2-16-8-b-r1 #speaker:toby
    Loaf end's in your bag already. Don't fight it. #id:L-CH-T2-16-8-b-r2 #speaker:toby
- (g_ch_t2_16_8) Placeholder: the scene continues. #id:GB-CH-T2-16-8-GATHER
-> t2.hub

= sc_t2_17
- (ch_t2_17_1) The sheet lies on the counter, the same total worked twice down the page and the workings not rubbed out. #choice:CH-T2-17-1 #id:O-SC-T2-17-1 #speaker:toby
* ["What's changed since you last added it?"] #opt:CH-T2-17-1-a #id:L-CH-T2-17-1-a-p
    ~ KnownPhrases += sum_wont_close
    ~ recordKnowledge("sum_wont_close")
    ~ recordThreadMove("toby-feast-short")
    ~ recordBond("toby", "Recognition")
    -- (ch_t2_17_1_a_1) Toby pulls the sheet back and starts the same column again from the top. #choice:CH-T2-17-1-a-1 #id:A-CH-T2-17-1-a-1-s #speaker:toby
    ** ["Say what the number won't do."] #opt:CH-T2-17-1-a-1-a #id:L-CH-T2-17-1-a-1-a-p
        ~ recordBond("toby", "Trust")
        --- (ch_t2_17_1_a_1_a_1) Twelve loaves is two pairs of hands and a night of oven time. That's the size of it. #choice:CH-T2-17-1-a-1-a-1 #id:L-CH-T2-17-1-a-1-a-1-s #speaker:toby
        *** [takes the next step as the answer] #opt:CH-T2-17-1-a-1-a-1-a
            ~ recordBond("toby", "Intimacy")
            Take the next step as the answer #id:L-CH-T2-17-1-a-1-a-1-a-act #speaker:toby
            Right. Hands first, then hours. #id:L-CH-T2-17-1-a-1-a-1-a-r1 #speaker:toby
            Gloves by the wood pile, if you're one of the pairs. #id:L-CH-T2-17-1-a-1-a-1-a-r2 #speaker:toby
        *** ["That's a step. It isn't an answer."] #opt:CH-T2-17-1-a-1-a-1-b #id:L-CH-T2-17-1-a-1-a-1-b-p
            ~ recordBond("toby", "Recognition")
            No. #id:L-CH-T2-17-1-a-1-a-1-b-r1 #speaker:toby
            It's the step I've got. #id:L-CH-T2-17-1-a-1-a-1-b-r2 #speaker:toby
            Stand clear of the oven door, it swings wide. #id:L-CH-T2-17-1-a-1-a-1-b-r3 #speaker:toby
        --- (g_ch_t2_17_1_a_1_a) Placeholder: the scene continues. #id:GB-CH-T2-17-1-a-1-a-1-GATHER
    ** [lets the second pass run uninterrupted] #opt:CH-T2-17-1-a-1-b
        ~ recordBond("toby", "Intimacy")
        Let the second pass run without interrupting #id:L-CH-T2-17-1-a-1-b-act #speaker:toby
        Still twelve. #id:L-CH-T2-17-1-a-1-b-r1 #speaker:toby
        Right. Wood first, then the trays. #id:L-CH-T2-17-1-a-1-b-r2 #speaker:toby
    -- (g_ch_t2_17_1_a) Placeholder: the scene continues. #id:GB-CH-T2-17-1-a-1-GATHER
* [holds the sheet steady and lets the sum run] #opt:CH-T2-17-1-b
    ~ recordBond("toby", "Intimacy")
    Hold the sheet steady while the sum runs #id:L-CH-T2-17-1-b-act #speaker:toby
    Ta. #id:L-CH-T2-17-1-b-r1 #speaker:toby
    Twelve. Same as it was. #id:L-CH-T2-17-1-b-r2 #speaker:toby
- (g_ch_t2_17_1) Placeholder: the scene continues. #id:GB-CH-T2-17-1-GATHER
- (ch_t2_17_2) Toby goes down the list of what still has nobody on it, marking each with the pencil's flat end. #choice:CH-T2-17-2 #id:A-SC-T2-17-2 #speaker:toby
* ["What's still got nobody on it?"] #opt:CH-T2-17-2-a #id:L-CH-T2-17-2-a-p
    ~ recordBond("toby", "Trust")
    Wood, the carrying on the night, the long tables. In that order. #id:L-CH-T2-17-2-a-r1 #speaker:toby
    Order's by when they're needed, not by size. #id:L-CH-T2-17-2-a-r2 #speaker:toby
    None of it's yours, mind. Asking's free. #id:L-CH-T2-17-2-a-r3 #speaker:toby
* [takes one of the unassigned pieces] #opt:CH-T2-17-2-b
    ~ recordBond("toby", "Intimacy")
    Take one of the unassigned pieces #id:L-CH-T2-17-2-b-act #speaker:toby
    Tables, then. They come down from the hall loft. #id:L-CH-T2-17-2-b-r1 #speaker:toby
    Take the short ladder. The tall one's a liar. #id:L-CH-T2-17-2-b-r2 #speaker:toby
- (g_ch_t2_17_2) Placeholder: the scene continues. #id:GB-CH-T2-17-2-GATHER
- (ch_t2_17_3) { KnownPhrases ? count_is_turnout: Toby puts the slate back against the counter with the whole circled figure showing. #choice:CH-T2-17-3 #id:A-CH-T2-17-3-s #speaker:toby }
* {KnownPhrases ? count_is_turnout} ["Bake for who's confirmed. That covers it."] #opt:CH-T2-17-3-a #id:L-CH-T2-17-3-a-p
    ~ recordBond("toby", "Recognition")
    Can't do that. #id:L-CH-T2-17-3-a-r1 #speaker:toby
    Slate says forty. Forty's who might stand there. #id:L-CH-T2-17-3-a-r2 #speaker:toby
    Fair thought, mind. It'd be a smaller job. #id:L-CH-T2-17-3-a-r3 #speaker:toby
* {KnownPhrases ? count_is_turnout} ["Who are the extra loaves for?"] #opt:CH-T2-17-3-b #id:L-CH-T2-17-3-b-p
    ~ recordBond("toby", "Trust")
    Whoever's standing in the square when the tables go up. #id:L-CH-T2-17-3-b-r1 #speaker:toby
    Nobody orders on festival night. They just come. #id:L-CH-T2-17-3-b-r2 #speaker:toby
* {KnownPhrases ? count_is_turnout} [sets the slate where he can see the whole figure] #opt:CH-T2-17-3-c
    ~ recordBond("toby", "Intimacy")
    Set the slate where he can see the whole figure #id:L-CH-T2-17-3-c-act #speaker:toby
    Yup, there. #id:L-CH-T2-17-3-c-r1 #speaker:toby
    Chalk's on the ledge if you want to keep tally too. #id:L-CH-T2-17-3-c-r2 #speaker:toby
* -> g_ch_t2_17_3
- (g_ch_t2_17_3) Placeholder: the scene continues. #id:GB-CH-T2-17-3-GATHER
- (ch_t2_17_4) { KnownPhrases ? starter_owed: Crock's owed first. Their measure comes off the top before my twelve. #choice:CH-T2-17-4 #id:L-CH-T2-17-4-s #speaker:toby }
* {KnownPhrases ? starter_owed} ["The loan sits ahead of your own gap."] #opt:CH-T2-17-4-a #id:L-CH-T2-17-4-a-p
    ~ recordBond("toby", "Recognition")
    That's where loans sit. #id:L-CH-T2-17-4-a-r1 #speaker:toby
    It goes back heavier, and then the twelve. #id:L-CH-T2-17-4-a-r2 #speaker:toby
* {KnownPhrases ? starter_owed} ["What do they get back over the loan?"] #opt:CH-T2-17-4-b #id:L-CH-T2-17-4-b-p
    ~ recordBond("toby", "Trust")
    Flour measure, a warm loaf, and first call on feast bread. #id:L-CH-T2-17-4-b-r1 #speaker:toby
    They'd say it's too much. They can say it to the loaf. #id:L-CH-T2-17-4-b-r2 #speaker:toby
* -> g_ch_t2_17_4
- (g_ch_t2_17_4) Placeholder: the scene continues. #id:GB-CH-T2-17-4-GATHER
- (ch_t2_17_5) Toby banks the oven and counts the batches off against the door. #choice:CH-T2-17-5 #id:A-SC-T2-17-5 #speaker:toby
* ["How many can the ovens take in a day?"] #opt:CH-T2-17-5-a #id:L-CH-T2-17-5-a-p
    ~ recordBond("toby", "Trust")
    Six batches, flat out, and they're at six. #id:L-CH-T2-17-5-a-r1 #speaker:toby
    No counting gets a seventh in. #id:L-CH-T2-17-5-a-r2 #speaker:toby
* [banks the oven for the next batch] #opt:CH-T2-17-5-b
    ~ recordBond("toby", "Intimacy")
    Bank the oven for the next batch #id:L-CH-T2-17-5-b-act #speaker:toby
    That's it, bank it high at the back. #id:L-CH-T2-17-5-b-r1 #speaker:toby
    Mind your hands, rake's got a short handle. #id:L-CH-T2-17-5-b-r2 #speaker:toby
- (g_ch_t2_17_5) Placeholder: the scene continues. #id:GB-CH-T2-17-5-GATHER
- (ch_t2_17_6) Twelve. Once more, then. #choice:CH-T2-17-6 #id:L-CH-T2-17-6-s1 #speaker:toby
* [stays through the third pass without a word] #opt:CH-T2-17-6-a
    ~ recordBond("toby", "Intimacy")
    Stay through the third pass without a word #id:L-CH-T2-17-6-a-act #speaker:toby
    There it is. #id:L-CH-T2-17-6-a-r1 #speaker:toby
    Kettle's not long boiled. #id:L-CH-T2-17-6-a-r2 #speaker:toby
* ["Three passes. The number hasn't moved."] #opt:CH-T2-17-6-b #id:L-CH-T2-17-6-b-p
    ~ recordBond("toby", "Recognition")
    It hasn't. #id:L-CH-T2-17-6-b-r1 #speaker:toby
    It adds the same every time. Good pencil. #id:L-CH-T2-17-6-b-r2 #speaker:toby
    Wood's due within the hour. There's that. #id:L-CH-T2-17-6-b-r3 #speaker:toby
- (g_ch_t2_17_6) Placeholder: the scene continues. #id:GB-CH-T2-17-6-GATHER
- (ch_t2_17_7) That's me till the wood comes. Then the sixth batch. #choice:CH-T2-17-7 #id:L-CH-T2-17-7-s #speaker:toby
* ["What should I carry back next visit?"] #opt:CH-T2-17-7-a #id:L-CH-T2-17-7-a-p
    ~ recordBond("toby", "Trust")
    Yourself, and any spare pair of hands you pass. #id:L-CH-T2-17-7-a-r1 #speaker:toby
    There'll be bread worth the walk. #id:L-CH-T2-17-7-a-r2 #speaker:toby
* [leaves the sheet as he had it] #opt:CH-T2-17-7-b
    ~ recordBond("toby", "Intimacy")
    Leave the sheet as he had it #id:L-CH-T2-17-7-b-act #speaker:toby
    Ta. It'll keep. #id:L-CH-T2-17-7-b-r1 #speaker:toby
    Take the dry path past the well, cart's churned the lane. #id:L-CH-T2-17-7-b-r2 #speaker:toby
- (g_ch_t2_17_7) Placeholder: the scene continues. #id:GB-CH-T2-17-7-GATHER
-> t2.hub

= sc_t2_18
- (ch_t2_18_1) The feast count stands met by the door: stacked and covered, tied in half a dozen different knots, no two wrappings alike. #choice:CH-T2-18-1 #id:O-SC-T2-18-1 #speaker:toby
* ["How did it close?"] #opt:CH-T2-18-1-a #id:L-CH-T2-18-1-a-p
    ~ recordBond("toby", "Trust")
    Stall covered the salt. Hallow house proved two trays. The last few came a loaf at a time, all different doors. #id:L-CH-T2-18-1-a-r1 #speaker:toby
    Nobody did the lot. Everybody did a bit. #id:L-CH-T2-18-1-a-r2 #speaker:toby
    Anyways. Tomorrow's bread starts tonight. #id:L-CH-T2-18-1-a-r3 #speaker:toby
* [takes up the loading of the trays] #opt:CH-T2-18-1-b
    ~ recordBond("toby", "Intimacy")
    Take up the loading of the trays #id:L-CH-T2-18-1-b-act #speaker:toby
    Heavy trays ride bottom shelf. #id:L-CH-T2-18-1-b-r1 #speaker:toby
    Supper's on the shelf under the counter. Eat first. #id:L-CH-T2-18-1-b-r2 #speaker:toby
- (g_ch_t2_18_1) Placeholder: the scene continues. #id:GB-CH-T2-18-1-GATHER
- (ch_t2_18_2) { KnownPhrases ? sum_wont_close: Sheet's done with. It can go for kindling now. #choice:CH-T2-18-2 #id:L-CH-T2-18-2-s #speaker:toby }
* {KnownPhrases ? sum_wont_close} ["The counting never closed it, did it?"] #opt:CH-T2-18-2-a #id:L-CH-T2-18-2-a-p
    ~ recordBond("toby", "Recognition")
    No. It didn't. #id:L-CH-T2-18-2-a-r1 #speaker:toby
    Toby goes still. Then he takes the broom from the corner and starts on the far floor. #id:A-CH-T2-18-2-a-r #speaker:toby
    Floor, then. #id:L-CH-T2-18-2-a-r2 #speaker:toby
* {KnownPhrases ? sum_wont_close} [lets the arithmetic have been the answer] #opt:CH-T2-18-2-b
    ~ recordBond("toby", "Intimacy")
    Let the arithmetic have been the answer #id:L-CH-T2-18-2-b-act #speaker:toby
    Kindling it is, then. #id:L-CH-T2-18-2-b-r1 #speaker:toby
    It was good paper. Wrote both sides. #id:L-CH-T2-18-2-b-r2 #speaker:toby
* -> g_ch_t2_18_2
- (g_ch_t2_18_2) Placeholder: the scene continues. #id:GB-CH-T2-18-2-GATHER
- (ch_t2_18_3) { KnownPhrases ? starter_owed: The crock waits by the door, filled past its own mark, the lid tied down for the walk. #choice:CH-T2-18-3 #id:O-SC-T2-18-3 #speaker:toby }
* {KnownPhrases ? starter_owed} ["It's fuller than when it came."] #opt:CH-T2-18-3-a #id:L-CH-T2-18-3-a-p
    ~ recordBond("toby", "Recognition")
    Bit over, maybe. #id:L-CH-T2-18-3-a-r1 #speaker:toby
    Full's a matter of opinion. #id:L-CH-T2-18-3-a-r2 #speaker:toby
    Loaf's going with it. That's just manners. #id:L-CH-T2-18-3-a-r3 #speaker:toby
* {KnownPhrases ? starter_owed} [sets the crock ready by the door] #opt:CH-T2-18-3-b
    ~ recordBond("toby", "Intimacy")
    Set the crock ready by the door #id:L-CH-T2-18-3-b-act #speaker:toby
    Ta. Mind the lid. #id:L-CH-T2-18-3-b-r1 #speaker:toby
    Come first thing if you like. It carries better with two. #id:L-CH-T2-18-3-b-r2 #speaker:toby
* -> g_ch_t2_18_3
- (g_ch_t2_18_3) Placeholder: the scene continues. #id:GB-CH-T2-18-3-GATHER
- (ch_t2_18_4) Ovens light before the sun does. Tonight's for setting up tomorrow. #choice:CH-T2-18-4 #id:L-CH-T2-18-4-s #speaker:toby
* ["What still needs doing tonight?"] #opt:CH-T2-18-4-a #id:L-CH-T2-18-4-a-p
    ~ recordBond("toby", "Trust")
    Bench cleared, wood in, dough set to rise. Then sleep, they tell me. #id:L-CH-T2-18-4-a-r1 #speaker:toby
    Take the wood in with me and we're done sooner. #id:L-CH-T2-18-4-a-r2 #speaker:toby
* [clears the bench for the morning] #opt:CH-T2-18-4-b
    ~ recordBond("toby", "Intimacy")
    Clear the bench for the morning #id:L-CH-T2-18-4-b-act #speaker:toby
    Scraper hangs on the left nail. #id:L-CH-T2-18-4-b-r1 #speaker:toby
    That's the morning half-made already. #id:L-CH-T2-18-4-b-r2 #speaker:toby
* ["You're already counting tomorrow."] #opt:CH-T2-18-4-c #id:L-CH-T2-18-4-c-p
    ~ recordBond("toby", "Recognition")
    Yup. #id:L-CH-T2-18-4-c-r1 #speaker:toby
    Morning bread doesn't care what night it is. #id:L-CH-T2-18-4-c-r2 #speaker:toby
- (g_ch_t2_18_4) Placeholder: the scene continues. #id:GB-CH-T2-18-4-GATHER
- (ch_t2_18_5) Toby is mid-job when the player reaches him, the broom working the far corner. #choice:CH-T2-18-5 #id:A-CH-T2-18-5-s #speaker:toby
* [leaves him the job] #opt:CH-T2-18-5-a
    ~ recordBond("toby", "Intimacy")
    Leave him the job #id:L-CH-T2-18-5-a-act #speaker:toby
    Night. #id:L-CH-T2-18-5-a-r1 #speaker:toby
    Lantern by the door's lit. Lane's black past the well. #id:L-CH-T2-18-5-a-r2 #speaker:toby
* ["Keep me a place at the table tomorrow."] #opt:CH-T2-18-5-b #id:L-CH-T2-18-5-b-p
    ~ recordBond("toby", "Trust")
    Done. End seat, near the bread. #id:L-CH-T2-18-5-b-r1 #speaker:toby
    Come hungry. #id:L-CH-T2-18-5-b-r2 #speaker:toby
- (g_ch_t2_18_5) Placeholder: the scene continues. #id:GB-CH-T2-18-5-GATHER
-> t2.hub

= sc_t2_19
- (ch_t2_19_1) The ovens run hot for festival week, and the rag pile stands beside them, cloth folded on cloth. Toby is working the trays through, one after another. #choice:CH-T2-19-1 #id:O-SC-T2-19-1 #speaker:toby
* [pulls the tray through so he can get clear] #opt:CH-T2-19-1-a
    ~ recordBond("toby", "Intimacy")
    Pull the tray through so he can get clear of the mouth #id:L-CH-T2-19-1-a-act #speaker:toby
    Ta. Set it on the rail. #id:L-CH-T2-19-1-a-r1 #speaker:toby
    Next one's yours if you're staying. Cloth's on the hook. #id:L-CH-T2-19-1-a-r2 #speaker:toby
* ["Is your arm all right?"] #opt:CH-T2-19-1-b #id:L-CH-T2-19-1-b-p
    ~ recordBond("toby", "Trust")
    Batch is fine. #id:L-CH-T2-19-1-b-r1 #speaker:toby
    Rye's in, white's next. Sleeve just got ahead of the peel. #id:L-CH-T2-19-1-b-r2 #speaker:toby
    Oven mouth spits when the door swings. Give it room. #id:L-CH-T2-19-1-b-r3 #speaker:toby
- (g_ch_t2_19_1) Placeholder: the scene continues. #id:GB-CH-T2-19-1-GATHER
- (ch_t2_19_2) Scorch'll keep till the batch is out. Third tray's the heavy one. #choice:CH-T2-19-2 #id:L-CH-T2-19-2-s #speaker:toby
* ["Will the shirt mend?"] #opt:CH-T2-19-2-a #id:L-CH-T2-19-2-a-p
    ~ recordBond("toby", "Trust")
    Not worth the thread. Scorched cloth goes for rags. #id:L-CH-T2-19-2-a-r1 #speaker:toby
    There's tea by the scales, still warm. #id:L-CH-T2-19-2-a-r2 #speaker:toby
* [takes the work nearest the ovens so his hands are free] #opt:CH-T2-19-2-b
    ~ recordBond("toby", "Intimacy")
    Take the work nearest the ovens so his hands are free #id:L-CH-T2-19-2-b-act #speaker:toby
    You're quick. #id:L-CH-T2-19-2-b-r1 #speaker:toby
    Far end's cooler, work from there. I'll feed you trays. #id:L-CH-T2-19-2-b-r2 #speaker:toby
- (g_ch_t2_19_2) Placeholder: the scene continues. #id:GB-CH-T2-19-2-GATHER
- (ch_t2_19_3) The shirt comes off. The collar turns as he folds it, and a stitched name shows inside. #choice:CH-T2-19-3 #id:A-CH-T2-19-3-s #speaker:toby
* ["There's a name stitched in the collar."] #opt:CH-T2-19-3-a #id:L-CH-T2-19-3-a-p
    ~ recordBond("toby", "Recognition")
    Mm. That's old stitching. #id:L-CH-T2-19-3-a-r1 #speaker:toby
    House I grew up in, things got mixed. #id:L-CH-T2-19-3-a-r2 #speaker:toby
    Peg's behind you, pass the spare over. #id:L-CH-T2-19-3-a-r3 #speaker:toby
* [clears the bench so he can set it down] #opt:CH-T2-19-3-b
    ~ recordBond("toby", "Intimacy")
    Clear a space on the bench so he has somewhere to set it down #id:L-CH-T2-19-3-b-act #speaker:toby
    Ta. #id:L-CH-T2-19-3-b-r1 #speaker:toby
    Watch the flour, it gets on everything. #id:L-CH-T2-19-3-b-r2 #speaker:toby
* ["What'll you wear the rest of the week?"] #opt:CH-T2-19-3-c #id:L-CH-T2-19-3-c-p
    ~ recordBond("toby", "Trust")
    Spare on the peg, and the good one Sunday if the ovens are down. #id:L-CH-T2-19-3-c-r1 #speaker:toby
    Yours'd scorch in here too. Apron's on the second hook. #id:L-CH-T2-19-3-c-r2 #speaker:toby
- (g_ch_t2_19_3) Placeholder: the scene continues. #id:GB-CH-T2-19-3-GATHER
- (ch_t2_19_4) Rags now. #choice:CH-T2-19-4 #id:L-CH-T2-19-4-s1 #speaker:toby
* ["It's still got your name in it."] #opt:CH-T2-19-4-a #id:L-CH-T2-19-4-a-p
    ~ KnownPhrases += shirt_shed
    ~ recordKnowledge("shirt_shed")
    ~ recordThreadMove("toby-kept-and-returned")
    ~ recordBond("toby", "Recognition")
    -- (ch_t2_19_4_a_1) The shirt sits where he put it, already under the next cloth. #choice:CH-T2-19-4-a-1 #id:O-CH-T2-19-4-a-1-s #speaker:toby
    ** ["Keep it back. Don't cut that one up."] #opt:CH-T2-19-4-a-1-a #id:L-CH-T2-19-4-a-1-a-p
        ~ recordBond("toby", "Trust")
        It's cloth. #id:L-CH-T2-19-4-a-1-a-r1 #speaker:toby
        Pile's short anyway. Festival week eats rags. #id:L-CH-T2-19-4-a-1-a-r2 #speaker:toby
    ** [sets the first cloth to its job] #opt:CH-T2-19-4-a-1-b
        ~ recordBond("toby", "Intimacy")
        Take the top cloth and wipe down the cooling rail #id:L-CH-T2-19-4-a-1-b-act #speaker:toby
        That's what they're for. #id:L-CH-T2-19-4-a-1-b-r1 #speaker:toby
        Leave the wet ones over the rail end to dry. #id:L-CH-T2-19-4-a-1-b-r2 #speaker:toby
    -- (g_ch_t2_19_4_a) Placeholder: the scene continues. #id:GB-CH-T2-19-4-a-1-GATHER
* [lets the pile take it without a word] #opt:CH-T2-19-4-b
    ~ recordBond("toby", "Intimacy")
    Let the pile take it without a word #id:L-CH-T2-19-4-b-act #speaker:toby
    Right. Second bake. #id:L-CH-T2-19-4-b-r1 #speaker:toby
    First loaf's out shortly. The end bit's yours. #id:L-CH-T2-19-4-b-r2 #speaker:toby
- (g_ch_t2_19_4) Placeholder: the scene continues. #id:GB-CH-T2-19-4-GATHER
- (ch_t2_19_5) { KnownPhrases ? shirt_shed: It all gets cut together. Nothing in there's kept separate. #choice:CH-T2-19-5 #id:L-CH-T2-19-5-s #speaker:toby }
* {KnownPhrases ? shirt_shed} ["Nothing in that pile was ever asked for."] #opt:CH-T2-19-5-a #id:L-CH-T2-19-5-a-p
    ~ recordBond("toby", "Recognition")
    No. #id:L-CH-T2-19-5-a-r1 #speaker:toby
    Stuff people were done with. #id:L-CH-T2-19-5-a-r2 #speaker:toby
    Draught catches that corner, stand oven-side. #id:L-CH-T2-19-5-a-r3 #speaker:toby
* {KnownPhrases ? shirt_shed} [leaves the pile as he stacked it] #opt:CH-T2-19-5-b
    ~ recordBond("toby", "Intimacy")
    Leave the pile as he stacked it #id:L-CH-T2-19-5-b-act #speaker:toby
    Bake's turning. Give me the peel. #id:L-CH-T2-19-5-b-r1 #speaker:toby
* -> g_ch_t2_19_5
- (g_ch_t2_19_5) Placeholder: the scene continues. #id:GB-CH-T2-19-5-GATHER
- (ch_t2_19_6) He damps the oven down. The batch is ahead of the talk. #choice:CH-T2-19-6 #id:A-SC-T2-19-6 #speaker:toby
* [banks the scrap cloth by the bench for him] #opt:CH-T2-19-6-a
    ~ recordBond("toby", "Intimacy")
    Stack the scrap cloth square by the bench for him #id:L-CH-T2-19-6-a-act #speaker:toby
    That'll save a trip. #id:L-CH-T2-19-6-a-r1 #speaker:toby
    Take a roll off the rack going out. They're best now. #id:L-CH-T2-19-6-a-r2 #speaker:toby
* ["How much did the burn cost the batch?"] #opt:CH-T2-19-6-b #id:L-CH-T2-19-6-b-p
    ~ recordBond("toby", "Trust")
    One tray, and the morning ran long. Second bake makes it back by four. #id:L-CH-T2-19-6-b-r1 #speaker:toby
    Come by after four then. Second bake's the better bread. #id:L-CH-T2-19-6-b-r2 #speaker:toby
- (g_ch_t2_19_6) Placeholder: the scene continues. #id:GB-CH-T2-19-6-GATHER
-> t2.hub

= sc_t2_21
- (ch_t2_21_1) Festival eve at the stall's end. The shirt lies folded on the counter between them, the patch uppermost. #choice:CH-T2-21-1 #id:O-SC-T2-21-1 #speaker:toby
* [takes up the work at hand, leaves the counter to them] #opt:CH-T2-21-1-a
    ~ recordBond("toby", "Intimacy")
    Take up the tying and leave the counter to the two of them #id:L-CH-T2-21-1-a-act #speaker:toby
    Knots want doubling, wind's up tonight. #id:L-CH-T2-21-1-a-r1 #speaker:toby
* ["Is the mend finished?"] #opt:CH-T2-21-1-b #id:L-CH-T2-21-1-b-p
    ~ recordBond("toby", "Trust")
    Finished last night. The patch is felled all round and the seam took the strain out. #id:L-CH-T2-21-1-b-r1 #speaker:mara
- (g_ch_t2_21_1) Placeholder: the scene continues. #id:GB-CH-T2-21-1-GATHER
- (ch_t2_21_2) Hold your hands out. #choice:CH-T2-21-2 #id:L-CH-T2-21-2-s1 #speaker:mara
* ["The patch is right where the burn was."] #opt:CH-T2-21-2-a #id:L-CH-T2-21-2-a-p
    ~ recordBond("toby", "Recognition")
    -- (ch_t2_21_2_a_1) His free hand goes to the counter and finds nothing on it. #choice:CH-T2-21-2-a-1 #id:A-CH-T2-21-2-a-1-s #speaker:toby
    ** ["The counter's empty."] #opt:CH-T2-21-2-a-1-a #id:L-CH-T2-21-2-a-1-a-p
        ~ recordBond("toby", "Recognition")
        --- (ch_t2_21_2_a_1_a_1) The reach stops. He holds the shirt and does not put it down. #choice:CH-T2-21-2-a-1-a-1 #id:A-CH-T2-21-2-a-1-a-1-s #speaker:toby
        *** [lets it stand, says nothing more] #opt:CH-T2-21-2-a-1-a-1-a
            ~ recordBond("toby", "Intimacy")
            Let it stand. Say nothing more. #id:L-CH-T2-21-2-a-1-a-1-a-act #speaker:toby
        *** ["It was yours before it was given."] #opt:CH-T2-21-2-a-1-a-1-b #id:L-CH-T2-21-2-a-1-a-1-b-p
            ~ recordBond("toby", "Recognition")
            It was. #id:L-CH-T2-21-2-a-1-a-1-b-r1 #speaker:toby
            Toby folds the shirt once more along its crease and holds it. #id:L-CH-T2-21-2-a-1-a-1-b-r2 #speaker:toby
        --- (g_ch_t2_21_2_a_1_a) Placeholder: the scene continues. #id:GB-CH-T2-21-2-a-1-a-1-GATHER
    ** [gives him the seconds, looks elsewhere] #opt:CH-T2-21-2-a-1-b
        ~ recordBond("toby", "Intimacy")
        Give him the seconds and look elsewhere #id:L-CH-T2-21-2-a-1-b-act #speaker:toby
        Toby squares the fold of the shirt and holds it. #id:L-CH-T2-21-2-a-1-b-r1 #speaker:toby
    -- (g_ch_t2_21_2_a) Placeholder: the scene continues. #id:GB-CH-T2-21-2-a-1-GATHER
* [stays still and lets the seconds run] #opt:CH-T2-21-2-b
    ~ recordBond("toby", "Intimacy")
    Stay still and let the seconds run #id:L-CH-T2-21-2-b-act #speaker:toby
    He turns the shirt over once in his hands. The stall noise carries on past the counter. #id:L-CH-T2-21-2-b-r1 #speaker:toby
    Anyways. Jars. #id:L-CH-T2-21-2-b-r2 #speaker:toby
- (g_ch_t2_21_2) Placeholder: the scene continues. #id:GB-CH-T2-21-2-GATHER
- (ch_t2_21_3) { KnownPhrases ? shirt_shed: Good patch. #choice:CH-T2-21-3 #id:L-CH-T2-21-3-s #speaker:toby }
* {KnownPhrases ? shirt_shed} ["I watched it go into the rag pile."] #opt:CH-T2-21-3-a #id:L-CH-T2-21-3-a-p
    ~ recordBond("toby", "Recognition")
    Mm. #id:L-CH-T2-21-3-a-r1 #speaker:toby
    His hands go back to the jars in front of him. #id:L-CH-T2-21-3-a-r2 #speaker:toby
    Watch the rims, they chip. #id:L-CH-T2-21-3-a-r3 #speaker:toby
* {KnownPhrases ? shirt_shed} [keeps what the player saw to themselves, leaves him the counter] #opt:CH-T2-21-3-b
    ~ recordBond("toby", "Intimacy")
    Keep what you saw to yourself and leave him the counter #id:L-CH-T2-21-3-b-act #speaker:toby
    Pass the small jars over. #id:L-CH-T2-21-3-b-r1 #speaker:toby
* -> g_ch_t2_21_3
- (g_ch_t2_21_3) Placeholder: the scene continues. #id:GB-CH-T2-21-3-GATHER
- (ch_t2_21_4) { KnownPhrases ? collar_name_known: The collar lies turned back. The stitched name is whole, the patch close beside it. #choice:CH-T2-21-4 #id:O-CH-T2-21-4-s #speaker:toby }
* {KnownPhrases ? collar_name_known} ["You stitched around the name."] #opt:CH-T2-21-4-a #id:L-CH-T2-21-4-a-p
    ~ recordBond("toby", "Recognition")
    That stitching's older than the burn. It wasn't any part of what needed the needle. #id:L-CH-T2-21-4-a-r1 #speaker:mara
* {KnownPhrases ? collar_name_known} [folds the collar back down, leaves it unremarked] #opt:CH-T2-21-4-b
    ~ recordBond("toby", "Trust")
    Fold the collar back down and leave it unremarked #id:L-CH-T2-21-4-b-act #speaker:toby
    The jars want their lids while you're here, they're under the bench. #id:L-CH-T2-21-4-b-r1 #speaker:mara
* -> g_ch_t2_21_4
- (g_ch_t2_21_4) Placeholder: the scene continues. #id:GB-CH-T2-21-4-GATHER
- (ch_t2_21_5) The shirt sits in his hands, still folded. It does not go back to the counter and it does not go anywhere else. #choice:CH-T2-21-5 #id:O-CH-T2-21-5-s #speaker:toby
* [leaves him the choice, turns to the stall work] #opt:CH-T2-21-5-a
    ~ recordBond("toby", "Intimacy")
    Turn to the stall work and leave him the choice #id:L-CH-T2-21-5-a-act #speaker:toby
    Lanterns are up at the well end already. #id:L-CH-T2-21-5-a-r1 #speaker:toby
* ["What's next on the tending?"] #opt:CH-T2-21-5-b #id:L-CH-T2-21-5-b-p
    ~ recordBond("toby", "Trust")
    The last bundles want carrying to the line, and the low jars come up after. #id:L-CH-T2-21-5-b-r1 #speaker:mara
* ["That patch will show whether you wear it or not."] #opt:CH-T2-21-5-c #id:L-CH-T2-21-5-c-p
    ~ recordBond("toby", "Recognition")
    It will. #id:L-CH-T2-21-5-c-r1 #speaker:toby
    He sets the shirt to one side, near his own things. #id:L-CH-T2-21-5-c-r2 #speaker:toby
- (g_ch_t2_21_5) Placeholder: the scene continues. #id:GB-CH-T2-21-5-GATHER
- (ch_t2_21_6) Lanterns go up along the row past the stall. The eve moves on around the counter. #choice:CH-T2-21-6 #id:A-SC-T2-21-6 #speaker:toby
* [leaves the two of them to the stall's end] #opt:CH-T2-21-6-a
    ~ recordBond("toby", "Intimacy")
    Leave the two of them to the stall's end #id:L-CH-T2-21-6-a-act #speaker:toby
    Take the near lantern down the row as you go, it's wanted at the well end. #id:L-CH-T2-21-6-a-r1 #speaker:mara
* ["What does the eve still need doing?"] #opt:CH-T2-21-6-b #id:L-CH-T2-21-6-b-p
    ~ recordBond("toby", "Trust")
    Bread to the square, and the stalls want their fronts down by dark. #id:L-CH-T2-21-6-b-r1 #speaker:toby
    Come by the square when the lamps go round. There'll be plenty. #id:L-CH-T2-21-6-b-r2 #speaker:toby
- (g_ch_t2_21_6) Placeholder: the scene continues. #id:GB-CH-T2-21-6-GATHER
-> t2.hub

