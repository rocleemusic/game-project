// souls/mara.ink — generated. A soul file reads as the person. Do not hand-edit.

=== mara ===
-> DONE

= sc_t2_24
- (ch_t2_24_1) The drawer stands open on the bench, mid-sort, with the day's stock crated beside it. At the row's end a farm cart is being unloaded. #choice:CH-T2-24-1 #id:O-SC-T2-24-1 #speaker:mara
* [takes the job she puts in the player's hands] #opt:CH-T2-24-1-a
    ~ recordBond("mara", "Intimacy")
    Hold the sacks open while she fills them. #id:L-CH-T2-24-1-a-act #speaker:mara
    Twist the necks as they fill, a loose sack bruises the greens by noon. #id:L-CH-T2-24-1-a-r1 #speaker:mara
    The greens used to go out in baskets. The sacks are his idea, and they carry more. #id:L-CH-T2-24-1-a-r2 #speaker:mara
* ["What still has to be done to the delivery?"] #opt:CH-T2-24-1-b #id:L-CH-T2-24-1-b-p
    ~ recordBond("mara", "Trust")
    Weighed, trimmed, and the roots cellared before the sun's on them. Greens go out front as they are. #id:L-CH-T2-24-1-b-r1 #speaker:mara
    Start on the trimming while I weigh, the small knife's under the bench cloth. #id:L-CH-T2-24-1-b-r2 #speaker:mara
- (g_ch_t2_24_1) Placeholder: the scene continues. #id:GB-CH-T2-24-1-GATHER
- (ch_t2_24_2) Bex sets the day's delivery down at the bench end, unhurried, and stays by it. #choice:CH-T2-24-2 #id:A-SC-T2-24-2 #speaker:mara
* [stays at the bench, takes the sorting she does not stop doing] #opt:CH-T2-24-2-a
    ~ KnownPhrases += stayed_through_it
    ~ recordKnowledge("stayed_through_it")
    Stay at the bench and take the next handful of the sorting. #id:L-CH-T2-24-2-a-act #speaker:mara
    Cloth things to the left, hard things to me, and anything doubtful goes between us where I can reach it. #id:L-CH-T2-24-2-a-r1 #speaker:mara
* [steps back, gives the two of them the room] #opt:CH-T2-24-2-b
    ~ recordBond("mara", "Intimacy")
    Step back from the bench and leave the two of them the stall. #id:L-CH-T2-24-2-b-act #speaker:mara
    The crates behind you aren't stacked yet, not till he's done with the cart. #id:L-CH-T2-24-2-b-r1 #speaker:mara
- (g_ch_t2_24_2) Placeholder: the scene continues. #id:GB-CH-T2-24-2-GATHER
- (ch_t2_24_3) The roots go under the bench in the shade as the crates come off, they hold the week that way. #choice:CH-T2-24-3 #id:L-CH-T2-24-3-s #speaker:mara
* ["You meant that, about the drawer."] #opt:CH-T2-24-3-a #id:L-CH-T2-24-3-a-p
    ~ KnownPhrases += bex_answered
    ~ recordKnowledge("bex_answered")
    ~ recordThreadMove("mara-said-out-loud")
    -- (ch_t2_24_3_a_1) I did. Every word of it. #choice:CH-T2-24-3-a-1 #id:L-CH-T2-24-3-a-1-s #speaker:bex
    ** ["Nothing at the bench changed."] #opt:CH-T2-24-3-a-1-a #id:L-CH-T2-24-3-a-1-a-p
        ~ recordBond("mara", "Recognition")
        No. It never does. #id:L-CH-T2-24-3-a-1-a-r1 #speaker:bex
        At the bench, Mara has not stopped. The sorted pile is one thing taller. #id:A-CH-T2-24-3-a-1-r #speaker:mara
    ** [lets the answer stand, turns back to the bench] #opt:CH-T2-24-3-a-1-b
        ~ recordBond("mara", "Intimacy")
        Let the answer stand and turn back to the bench. #id:L-CH-T2-24-3-a-1-b-act #speaker:mara
        These are ready for the rack, high side first so the stems drain. #id:L-CH-T2-24-3-a-1-b-r1 #speaker:mara
    -- (g_ch_t2_24_3_a) Placeholder: the scene continues. #id:GB-CH-T2-24-3-a-1-GATHER
* [sets the stall back to rights where the crates came through] #opt:CH-T2-24-3-b
    ~ recordBond("mara", "Intimacy")
    Straighten the knocked stock and set the stall back to rights where the crates came through. #id:L-CH-T2-24-3-b-act #speaker:mara
    That bench edge takes a knock every delivery. It was planed flat the year the stall went up. #id:L-CH-T2-24-3-b-r1 #speaker:mara
    Now hold the scale steady, the load's behind and the morning won't stretch. #id:L-CH-T2-24-3-b-r2 #speaker:mara
* ["What does the delivery need before frost?"] #opt:CH-T2-24-3-c #id:L-CH-T2-24-3-c-p
    ~ recordBond("mara", "Trust")
    The roots want cellaring and the greens want selling, in that order. Frost takes the greens first and improves the roots. #id:L-CH-T2-24-3-c-r1 #speaker:mara
    Take the near crate and start the roots under the bench for me. #id:L-CH-T2-24-3-c-r2 #speaker:mara
- (g_ch_t2_24_3) Placeholder: the scene continues. #id:GB-CH-T2-24-3-GATHER
- (ch_t2_24_4) The drawer is still open on the bench, exactly as it was. Nothing in it has moved. #choice:CH-T2-24-4 #id:O-CH-T2-24-4-s #speaker:mara
* [takes the last job out with her instruction on it] #opt:CH-T2-24-4-a
    ~ recordBond("mara", "Trust")
    Take the greens and carry them out toward the well end. #id:L-CH-T2-24-4-a-act #speaker:mara
    Deliveries to the well end came by handcart once. The corner's busy where the lanterns are going up. #id:L-CH-T2-24-4-a-r1 #speaker:mara
* ["I'll be back to finish the sorting with you."] #opt:CH-T2-24-4-b #id:L-CH-T2-24-4-b-p
    ~ recordBond("mara", "Intimacy")
    That saves me sliding it home twice. The bench can spare the room a day or two. #id:L-CH-T2-24-4-b-r1 #speaker:mara
- (g_ch_t2_24_4) Placeholder: the scene continues. #id:GB-CH-T2-24-4-GATHER
-> t2.hub

= sc_t2_25
- (ch_t2_25_1) The drawer stands open on the bench, unchanged since the last visit, still mid-sort. Along Market Row the lanterns have reached the next bracket. #choice:CH-T2-25-1 #id:O-SC-T2-25-1 #speaker:mara
* [takes the job she puts in the player's hands] #opt:CH-T2-25-1-a
    ~ recordBond("mara", "Intimacy")
    Take the ties and bunch as she calls the counts. #id:L-CH-T2-25-1-a-act #speaker:mara
    Six to a bunch and don't crowd the seventh in, they sweat in the jar crowded. #id:L-CH-T2-25-1-a-r1 #speaker:mara
* ["What still needs doing before the frost?"] #opt:CH-T2-25-1-b #id:L-CH-T2-25-1-b-p
    ~ recordBond("mara", "Trust")
    Bunching, the last scalding, and the tonic bottled by festival eve. The frost does the rest of it for free. #id:L-CH-T2-25-1-b-r1 #speaker:mara
    Start the ties, we'll have the bunching done before he's off the cart. #id:L-CH-T2-25-1-b-r2 #speaker:mara
- (g_ch_t2_25_1) Placeholder: the scene continues. #id:GB-CH-T2-25-1-GATHER
- (ch_t2_25_2) You keep those so nobody's gone. #choice:CH-T2-25-2 #id:L-CH-T2-25-2-s1 #speaker:bex
* ["How long have you been saying it?"] #opt:CH-T2-25-2-a #id:L-CH-T2-25-2-a-p
    -- (ch_t2_25_2_a_1) Years. As long as that drawer. #choice:CH-T2-25-2-a-1 #id:L-CH-T2-25-2-a-1-s #speaker:bex
    ** ["The drawer's the same as last time."] #opt:CH-T2-25-2-a-1-a #id:L-CH-T2-25-2-a-1-a-p
        ~ recordBond("mara", "Recognition")
        Yes. It usually is. #id:L-CH-T2-25-2-a-1-a-r1 #speaker:bex
    ** [lets the answer stand, turns back to the bench] #opt:CH-T2-25-2-a-1-b
        ~ recordBond("mara", "Intimacy")
        Let the answer stand and turn back to the bench. #id:L-CH-T2-25-2-a-1-b-act #speaker:mara
        Bex goes back to the crates. The next one comes off the cart. #id:A-CH-T2-25-2-a-1-r #speaker:mara
    -- (g_ch_t2_25_2_a) Placeholder: the scene continues. #id:GB-CH-T2-25-2-a-1-GATHER
* [keeps sorting beside her, takes the next handful] #opt:CH-T2-25-2-b
    ~ recordBond("mara", "Intimacy")
    Keep sorting beside her and take the next handful. #id:L-CH-T2-25-2-b-act #speaker:mara
    That lot's mostly cloth, it goes to the left. The rest I'll take by feel. #id:L-CH-T2-25-2-b-r1 #speaker:mara
* ["What did the cart bring today?"] #opt:CH-T2-25-2-c #id:L-CH-T2-25-2-c-p
    ~ recordBond("mara", "Trust")
    Roots, mostly. Whatever was ready. #id:L-CH-T2-25-2-c-r1 #speaker:bex
    The beets go by the trough where it's cold, and the rest stays crated till there's room. #id:L-CH-T2-25-2-c-r2 #speaker:mara
- (g_ch_t2_25_2) Placeholder: the scene continues. #id:GB-CH-T2-25-2-GATHER
- (ch_t2_25_3) { KnownPhrases ? stayed_through_it: The sorting at the bench sits at the same place it was left, the piles as they stood. #choice:CH-T2-25-3 #id:O-CH-T2-25-3-s #speaker:mara }
* {KnownPhrases ? stayed_through_it} [takes it up again where it was left] #opt:CH-T2-25-3-a
    ~ recordBond("mara", "Intimacy")
    Take the sorting up again where it was left. #id:L-CH-T2-25-3-a-act #speaker:mara
    You remember the piles, good. The doubtful things still come to me. #id:L-CH-T2-25-3-a-r1 #speaker:mara
* {KnownPhrases ? stayed_through_it} ["It's exactly where it was left."] #opt:CH-T2-25-3-b #id:L-CH-T2-25-3-b-p
    ~ recordBond("mara", "Recognition")
    Then your hands know it. Here, this lot next, cloth left, hard to me. #id:L-CH-T2-25-3-b-r1 #speaker:mara
* -> g_ch_t2_25_3
- (g_ch_t2_25_3) Placeholder: the scene continues. #id:GB-CH-T2-25-3-GATHER
- (ch_t2_25_4) { KnownPhrases ? bex_answered: Last of the load. #choice:CH-T2-25-4 #id:L-CH-T2-25-4-s #speaker:bex }
* {KnownPhrases ? bex_answered} ["You'll say it to her again."] #opt:CH-T2-25-4-a #id:L-CH-T2-25-4-a-p
    ~ recordThreadMove("mara-said-out-loud")
    ~ recordBond("mara", "Recognition")
    When it wants saying, yes. #id:L-CH-T2-25-4-a-r1 #speaker:bex
    It was never hard. #id:L-CH-T2-25-4-a-r2 #speaker:bex
* {KnownPhrases ? bex_answered} ["Leave it now, Bex."] #opt:CH-T2-25-4-b #id:L-CH-T2-25-4-b-p
    ~ recordBond("mara", "Trust")
    All right, then. #id:L-CH-T2-25-4-b-r1 #speaker:bex
* -> g_ch_t2_25_4
- (g_ch_t2_25_4) Placeholder: the scene continues. #id:GB-CH-T2-25-4-GATHER
- (ch_t2_25_5) That's the delivery in. The row wants its lanterns up before the week's out, and the well end's behind. #choice:CH-T2-25-5 #id:L-CH-T2-25-5-s #speaker:mara
* [carries the empties out to the cart] #opt:CH-T2-25-5-a
    ~ recordBond("mara", "Intimacy")
    Carry the empties out to the cart. #id:L-CH-T2-25-5-a-act #speaker:mara
    Stack them open side down or they'll ride loose, he never ties a load. #id:L-CH-T2-25-5-a-r1 #speaker:mara
* ["What do the lanterns still need?"] #opt:CH-T2-25-5-b #id:L-CH-T2-25-5-b-p
    ~ recordBond("mara", "Trust")
    Wicks, mostly, and a straight eye on the brackets past the corner. Every one of those carried two lamps apiece, in a fuller year. #id:L-CH-T2-25-5-b-r1 #speaker:mara
    Take the spare wicks down to them if you're passing the corner anyway. #id:L-CH-T2-25-5-b-r2 #speaker:mara
- (g_ch_t2_25_5) Placeholder: the scene continues. #id:GB-CH-T2-25-5-GATHER
- (ch_t2_25_6) Mara puts a bunched tie of frost herbs into the player's hands. #choice:CH-T2-25-6 #id:A-SC-T2-25-6 #speaker:mara
* [takes the last job and goes] #opt:CH-T2-25-6-a
    ~ recordBond("mara", "Intimacy")
    Take the herbs and go, hanging them on the drying line on the way out. #id:L-CH-T2-25-6-a-act #speaker:mara
    Day's squared away, then. There'll be a slow morning for the drawer after the week. #id:L-CH-T2-25-6-a-r1 #speaker:mara
* ["I'll come back for the rest of it."] #opt:CH-T2-25-6-b #id:L-CH-T2-25-6-b-p
    ~ recordBond("mara", "Trust")
    Sorting's not work that spoils. There's enough of it to see the winter out. #id:L-CH-T2-25-6-b-r1 #speaker:mara
- (g_ch_t2_25_6) Placeholder: the scene continues. #id:GB-CH-T2-25-6-GATHER
-> t2.hub

= sc_t2_12
- (ch_t2_12_1) The herb stall stands mid-set for festival week. Crates of cut herbs wait along the bench, and empty tonic jars stand in rows. Mara is tying bundles as fast as they come in. #choice:CH-T2-12-1 #id:O-SC-T2-12-1 #speaker:mara
* [takes the job she puts in the player's hands] #opt:CH-T2-12-1-a
    ~ recordBond("mara", "Intimacy")
    Hold the bundles steady while she ties. #id:L-CH-T2-12-1-a-act #speaker:mara
    Keep them stem-down, they bruise from the top. You learn that the first year and never again after. #id:L-CH-T2-12-1-a-r1 #speaker:mara
    There used to be a second line for drying, over the door. This lot will fit the one. #id:L-CH-T2-12-1-a-r2 #speaker:mara
* ["What do the tonic herbs still need?"] #opt:CH-T2-12-1-b #id:L-CH-T2-12-1-b-p
    ~ recordBond("mara", "Trust")
    Washing, tying, hanging, and the jars scalded. The tying is the slow part, the stems have to lie flat or they rot. #id:L-CH-T2-12-1-b-r1 #speaker:mara
    Take the near crate and start on the washing, the trough's already filled. #id:L-CH-T2-12-1-b-r2 #speaker:mara
- (g_ch_t2_12_1) Placeholder: the scene continues. #id:GB-CH-T2-12-1-GATHER
- (ch_t2_12_2) At the stall's end, past the working clutter, a second stool stands with a cup beside it. Both are clear, wiped, and in nobody's use. #choice:CH-T2-12-2 #id:O-CH-T2-12-2-s #speaker:mara
* [sets the cup back where it was] #opt:CH-T2-12-2-a
    ~ recordBond("mara", "Intimacy")
    Move the cup to make room, then set it back exactly where it stood. #id:L-CH-T2-12-2-a-act #speaker:mara
    That's its place, yes. #id:L-CH-T2-12-2-a-r1 #speaker:mara
    There's a ring worn in the wood under it. Things find their spot and keep it if you let them. #id:L-CH-T2-12-2-a-r2 #speaker:mara
* ["Do you want this stool down the working end?"] #opt:CH-T2-12-2-b #id:L-CH-T2-12-2-b-p
    ~ recordBond("mara", "Trust")
    No, it does its work where it is. The bench end has stools enough for the trade. #id:L-CH-T2-12-2-b-r1 #speaker:mara
    Bring the low crate up instead, the fennel's at the bottom of it. #id:L-CH-T2-12-2-b-r2 #speaker:mara
- (g_ch_t2_12_2) Placeholder: the scene continues. #id:GB-CH-T2-12-2-GATHER
- (ch_t2_12_3) Mara takes the broom to a patch of paving by the stall and sweeps it, though it is already clean, talking on about the week as she goes. #choice:CH-T2-12-3 #id:A-CH-T2-12-3-s #speaker:mara
* [takes the broom and finishes the pass] #opt:CH-T2-12-3-a
    ~ recordBond("mara", "Intimacy")
    Take the broom from her and finish the pass over the patch. #id:L-CH-T2-12-3-a-act #speaker:mara
    Go to the edges, the row dust drifts in by noon whatever you do. #id:L-CH-T2-12-3-a-r1 #speaker:mara
    That patch was swept twice a day when the stalls ran the whole row. #id:L-CH-T2-12-3-a-r2 #speaker:mara
* ["How often do you sweep that patch?"] #opt:CH-T2-12-3-b #id:L-CH-T2-12-3-b-p
    ~ recordBond("mara", "Trust")
    Twice a day this week, once a day the rest of the year. Mornings, before the row wakes. #id:L-CH-T2-12-3-b-r1 #speaker:mara
    Hand me the pan and we'll have it done before the next lot comes. #id:L-CH-T2-12-3-b-r2 #speaker:mara
- (g_ch_t2_12_3) Placeholder: the scene continues. #id:GB-CH-T2-12-3-GATHER
- (ch_t2_12_4) Under the bench a shallow drawer stands open on its runners. Inside is a mixed lot of kept things, none of them herbs. A folded apron and a child's whistle sit among the rest, unremarked. #choice:CH-T2-12-4 #id:O-CH-T2-12-4-s #speaker:mara
* [slides the drawer back under the bench for her] #opt:CH-T2-12-4-a
    ~ recordBond("mara", "Intimacy")
    Slide the drawer shut and back under the bench. #id:L-CH-T2-12-4-a-act #speaker:mara
    Ease it, the left runner sticks. It stuck the year the bench moved and I've never planed it. #id:L-CH-T2-12-4-a-r1 #speaker:mara
    Good. Now the far crate, the roots in it want trimming while we talk. #id:L-CH-T2-12-4-a-r2 #speaker:mara
* ["Is anything in that drawer spoken for?"] #opt:CH-T2-12-4-b #id:L-CH-T2-12-4-b-p
    ~ recordBond("mara", "Trust")
    It holds what nobody's claimed yet. The shelf above it takes the jars once there's room. #id:L-CH-T2-12-4-b-r1 #speaker:mara
    Some of it is older than this stall. #id:L-CH-T2-12-4-b-r2 #speaker:mara
- (g_ch_t2_12_4) Placeholder: the scene continues. #id:GB-CH-T2-12-4-GATHER
- (ch_t2_12_5) The bundles are up and the bench is clearing. #choice:CH-T2-12-5 #id:L-CH-T2-12-5-s1 #speaker:mara
* ["That corner and the drawer are the same kind of keeping."] #opt:CH-T2-12-5-a #id:L-CH-T2-12-5-a-p
    ~ KnownPhrases += tending_seen
    ~ recordKnowledge("tending_seen")
    Mm. The trough water's gone cold, it'll want changing. #id:L-CH-T2-12-5-a-r1 #speaker:mara
    Take the kettle across and top it up, we'll scald the first dozen. #id:L-CH-T2-12-5-a-r2 #speaker:mara
* [keeps the sorting going at the bench] #opt:CH-T2-12-5-b
    ~ recordBond("mara", "Intimacy")
    Stay at the bench and keep the sorting going. #id:L-CH-T2-12-5-b-act #speaker:mara
    You've got the rhythm of it now. Stems left, flower heads right, anything doubtful to me. #id:L-CH-T2-12-5-b-r1 #speaker:mara
* [takes the crate down the row to the lantern-hanging] #opt:CH-T2-12-5-c
    ~ recordBond("mara", "Trust")
    Shoulder the crate and carry it down the row to the lantern-hanging. #id:L-CH-T2-12-5-c-act #speaker:mara
    Tell them it's the stall's spare hooks and they're a loan, I'll want them back after the week. #id:L-CH-T2-12-5-c-r1 #speaker:mara
    Before, the lanterns always went up from the well end. Watch how they hang them now. #id:L-CH-T2-12-5-c-r2 #speaker:mara
    -> mara.sc_t2_12.ch_t2_12_6
- (g_ch_t2_12_5) Placeholder: the scene continues. #id:GB-CH-T2-12-5-GATHER
- (ch_t2_12_6) Mara puts a tied bundle of herbs for the drying line into the player's hands. #choice:CH-T2-12-6 #id:A-SC-T2-12-6 #speaker:mara
* [takes the job she sends the player off with] #opt:CH-T2-12-6-a
    ~ recordBond("mara", "Trust")
    Take the bundle and hang it on the drying line on the way out. #id:L-CH-T2-12-6-a-act #speaker:mara
    That's the day shorter. Come by when the next lot's in and I'll load you again. #id:L-CH-T2-12-6-a-r1 #speaker:mara
* ["I'll come back and help finish the sorting."] #opt:CH-T2-12-6-b #id:L-CH-T2-12-6-b-p
    ~ recordBond("mara", "Intimacy")
    Good. The sorting sits where it sits, nobody touches your half of a job in this stall. #id:L-CH-T2-12-6-b-r1 #speaker:mara
- (g_ch_t2_12_6) Placeholder: the scene continues. #id:GB-CH-T2-12-6-GATHER
-> t2.hub

= sc_t2_13
- (ch_t2_13_1) Lanterns are going up along Market Row, one bracket at a time. At the stall, the drawer of unclaimed things stands out on the bench, mid-sort, and the shelf above it is coming clear for tonic jars. #choice:CH-T2-13-1 #id:O-SC-T2-13-1 #speaker:mara
* [takes a share of the sorting] #opt:CH-T2-13-1-a
    ~ recordBond("mara", "Intimacy")
    Take the left end of the drawer and start sorting. #id:L-CH-T2-13-1-a-act #speaker:mara
    Anything you can't place, set it between us and I'll know it by the feel. #id:L-CH-T2-13-1-a-r1 #speaker:mara
    The shelf used to take the weight of the winter stock. Jars are nothing to it. #id:L-CH-T2-13-1-a-r2 #speaker:mara
* ["What's the shelf being cleared for?"] #opt:CH-T2-13-1-b #id:L-CH-T2-13-1-b-p
    ~ recordBond("mara", "Trust")
    Tonic jars. Fifty of them by festival eve, and they want a dry shelf at shoulder height, away from the trough steam. #id:L-CH-T2-13-1-b-r1 #speaker:mara
    So the drawer comes down to one layer. Keep sorting, we're losing the morning. #id:L-CH-T2-13-1-b-r2 #speaker:mara
- (g_ch_t2_13_1) Placeholder: the scene continues. #id:GB-CH-T2-13-1-GATHER
- (ch_t2_13_2) Mara hands sorted things across one at a time, and the shelf above the bench comes clear. #choice:CH-T2-13-2 #id:A-SC-T2-13-2 #speaker:mara
* [sets the sorted things back in as she hands them over] #opt:CH-T2-13-2-a
    ~ recordBond("mara", "Intimacy")
    Take each thing as she hands it over and set it back in the drawer. #id:L-CH-T2-13-2-a-act #speaker:mara
    That's it, flat and square. A drawer packed right opens for years without complaint. #id:L-CH-T2-13-2-a-r1 #speaker:mara
    The left runner's still not planed. Ease it when you shut it later. #id:L-CH-T2-13-2-a-r2 #speaker:mara
* ["What goes up on the shelf first?"] #opt:CH-T2-13-2-b #id:L-CH-T2-13-2-b-p
    ~ recordBond("mara", "Trust")
    Empty jars, scalded, mouths down till they're wanted. The full ones stand at the front from festival eve. #id:L-CH-T2-13-2-b-r1 #speaker:mara
- (g_ch_t2_13_2) Placeholder: the scene continues. #id:GB-CH-T2-13-2-GATHER
- (ch_t2_13_3) Nearly the bottom of it now. #choice:CH-T2-13-3 #id:L-CH-T2-13-3-s1 #speaker:mara
* ["Tell me about the doll."] #opt:CH-T2-13-3-a #id:L-CH-T2-13-3-a-p
    ~ KnownPhrases += provenance_heard
    ~ recordKnowledge("provenance_heard")
    -- (ch_t2_13_3_a_1) The mend on the doll's arm sits at the shoulder, close-stitched in waxed thread, a different thread from the rest of it. #choice:CH-T2-13-3-a-1 #id:O-CH-T2-13-3-a-1-s #speaker:mara
    ** ["When did you mend the arm?"] #opt:CH-T2-13-3-a-1-a #id:L-CH-T2-13-3-a-1-a-p
        ~ recordBond("mara", "Trust")
        Nine years this midwinter. The same waxed thread I keep for the stall's mending, it outlasts the wool. #id:L-CH-T2-13-3-a-1-a-r1 #speaker:mara
    ** [takes the doll and sets it back in the drawer for her] #opt:CH-T2-13-3-a-1-b
        ~ recordBond("mara", "Intimacy")
        Take the doll and set it back in the drawer. #id:L-CH-T2-13-3-a-1-b-act #speaker:mara
        Shape on top, that's right. It rides on the folded things and nothing presses it. #id:L-CH-T2-13-3-a-1-b-r1 #speaker:mara
    -- (g_ch_t2_13_3_a_1) Placeholder: the scene continues. #id:GB-CH-T2-13-3-a-1-GATHER
    -- (ch_t2_13_3_a_2) The feet could take new dye. #choice:CH-T2-13-3-a-2 #id:L-CH-T2-13-3-a-2-s1 #speaker:mara
    ** [goes on sorting with her] #opt:CH-T2-13-3-a-2-a
        ~ recordBond("mara", "Intimacy")
        Go on sorting with her. #id:L-CH-T2-13-3-a-2-a-act #speaker:mara
        Cloth to the basket still. We're through the worst of the tangle. #id:L-CH-T2-13-3-a-2-a-r1 #speaker:mara
    ** ["You dated the mend, not the year it came in."] #opt:CH-T2-13-3-a-2-b #id:L-CH-T2-13-3-a-2-b-p
        ~ recordBond("mara", "Recognition")
        Mm. Here, these are the last of it. #id:L-CH-T2-13-3-a-2-b-r1 #speaker:mara
    -- (g_ch_t2_13_3_a) Placeholder: the scene continues. #id:GB-CH-T2-13-3-a-2-GATHER
* [takes the next thing she hands over, lets the name stand] #opt:CH-T2-13-3-b
    ~ recordBond("mara", "Intimacy")
    Take the next thing she hands over. #id:L-CH-T2-13-3-b-act #speaker:mara
    Top layer's light things only. Then it's the jars, and the morning's ours again. #id:L-CH-T2-13-3-b-r1 #speaker:mara
* ["What else goes up beside the jars?"] #opt:CH-T2-13-3-c #id:L-CH-T2-13-3-c-p
    ~ recordBond("mara", "Trust")
    The scale and the small weights, and the strainers once they're dry. Everything the tonic wants in one reach. #id:L-CH-T2-13-3-c-r1 #speaker:mara
- (g_ch_t2_13_3) Placeholder: the scene continues. #id:GB-CH-T2-13-3-GATHER
- (ch_t2_13_4) That's the drawer done. Slide it home for me and we'll start the jars while the light holds. #choice:CH-T2-13-4 #id:L-CH-T2-13-4-s #speaker:mara
* [slides the drawer home] #opt:CH-T2-13-4-a
    ~ recordBond("mara", "Intimacy")
    Slide the drawer home under the bench. #id:L-CH-T2-13-4-a-act #speaker:mara
    Eased it past the runner, good. It'll keep till there's a slow day. #id:L-CH-T2-13-4-a-r1 #speaker:mara
* ["Will the shelf hold the whole count?"] #opt:CH-T2-13-4-b #id:L-CH-T2-13-4-b-p
    ~ recordBond("mara", "Trust")
    It held double that in winter stock. Fifty jars won't trouble it, full or empty. #id:L-CH-T2-13-4-b-r1 #speaker:mara
- (g_ch_t2_13_4) Placeholder: the scene continues. #id:GB-CH-T2-13-4-GATHER
- (ch_t2_13_5) { KnownPhrases ? tending_seen: At the stall's end the cup and the stool stand clear, wiped, in nobody's use, with the drawer shut under the bench behind them. #choice:CH-T2-13-5 #id:O-CH-T2-13-5-s #speaker:mara }
* {KnownPhrases ? tending_seen} ["You keep that corner the way you keep the drawer."] #opt:CH-T2-13-5-a #id:L-CH-T2-13-5-a-p
    ~ recordBond("mara", "Recognition")
    The cloth wants wringing out. #id:L-CH-T2-13-5-a-r1 #speaker:mara
    Take the first jars up while I finish here. #id:L-CH-T2-13-5-a-r2 #speaker:mara
* {KnownPhrases ? tending_seen} [sets the cup and the stool clear again, says nothing of it] #opt:CH-T2-13-5-b
    ~ recordBond("mara", "Intimacy")
    Wipe the cup and the stool and set them clear again. #id:L-CH-T2-13-5-b-act #speaker:mara
    That end's done, then. The jars want us at the other. #id:L-CH-T2-13-5-b-r1 #speaker:mara
* -> g_ch_t2_13_5
- (g_ch_t2_13_5) Placeholder: the scene continues. #id:GB-CH-T2-13-5-GATHER
- (ch_t2_13_6) The jars go up in rows of five, mouths down, labels out. Start at the wall end. #choice:CH-T2-13-6 #id:L-CH-T2-13-6-s #speaker:mara
* [keeps the job through to the end and loads the shelf with her] #opt:CH-T2-13-6-a
    ~ KnownPhrases += helped_tend
    ~ recordKnowledge("helped_tend")
    Load the shelf with her, jar by jar, to the end. #id:L-CH-T2-13-6-a-act #speaker:mara
    That's the shelf done and the week half beaten. You hold a job once it's in your hands, I'll say that. #id:L-CH-T2-13-6-a-r1 #speaker:mara
* ["Where does each jar go?"] #opt:CH-T2-13-6-b #id:L-CH-T2-13-6-b-p
    ~ recordBond("mara", "Trust")
    Empties to the wall, fulls to the front as they come, the cracked one to me for the trough end. #id:L-CH-T2-13-6-b-r1 #speaker:mara
- (g_ch_t2_13_6) Placeholder: the scene continues. #id:GB-CH-T2-13-6-GATHER
- (ch_t2_13_7) Mara puts a wrapped pair of tonic jars into the player's hands. #choice:CH-T2-13-7 #id:A-SC-T2-13-7 #speaker:mara
* [takes the last job out with her instruction on it] #opt:CH-T2-13-7-a
    ~ recordBond("mara", "Trust")
    Take the jars and carry them out toward the well end. #id:L-CH-T2-13-7-a-act #speaker:mara
    Midweek, other years, the well end was already strung. The corner will be thick with people this hour. #id:L-CH-T2-13-7-a-r1 #speaker:mara
* ["I'll be back for the rest of it."] #opt:CH-T2-13-7-b #id:L-CH-T2-13-7-b-p
    ~ recordBond("mara", "Intimacy")
    The wall end will still be there. Jars are patient, it's herbs that aren't, so I'll be on those. #id:L-CH-T2-13-7-b-r1 #speaker:mara
- (g_ch_t2_13_7) Placeholder: the scene continues. #id:GB-CH-T2-13-7-GATHER
-> t2.hub

= sc_t2_14
- (ch_t2_14_1) The lanterns are up the length of Market Row. On the stall's cleared shelf the tonic jars are filling, row by row, and the bench is back to herbs. #choice:CH-T2-14-1 #id:O-SC-T2-14-1 #speaker:mara
* [takes the job she puts in the player's hands] #opt:CH-T2-14-1-a
    ~ recordBond("mara", "Intimacy")
    Hold the funnel steady while she pours. #id:L-CH-T2-14-1-a-act #speaker:mara
    Steady now, tip it with me. The press only gives the once, so we take it slow. #id:L-CH-T2-14-1-a-r1 #speaker:mara
* ["What does the row still need before the lighting?"] #opt:CH-T2-14-1-b #id:L-CH-T2-14-1-b-p
    ~ recordBond("mara", "Trust")
    Oil for the brackets, a dry night, and the tonic corked by festival eve. The rest is hands. #id:L-CH-T2-14-1-b-r1 #speaker:mara
    Yours can start on the corks. #id:L-CH-T2-14-1-b-r2 #speaker:mara
- (g_ch_t2_14_1) Placeholder: the scene continues. #id:GB-CH-T2-14-1-GATHER
- (ch_t2_14_2) The row's nearly ready for it. #choice:CH-T2-14-2 #id:L-CH-T2-14-2-s1 #speaker:mara
* [sweeps the far end of the patch with her] #opt:CH-T2-14-2-a
    ~ recordBond("mara", "Intimacy")
    Take the broom and sweep the far end of the patch. #id:L-CH-T2-14-2-a-act #speaker:mara
    Edges first, same as before. You've kept the way of it. #id:L-CH-T2-14-2-a-r1 #speaker:mara
* ["What still wants doing before the festival?"] #opt:CH-T2-14-2-b #id:L-CH-T2-14-2-b-p
    ~ recordBond("mara", "Trust")
    Corking, the carting to the square, the brackets oiled, and the trough drained the last night. #id:L-CH-T2-14-2-b-r1 #speaker:mara
- (g_ch_t2_14_2) Placeholder: the scene continues. #id:GB-CH-T2-14-2-GATHER
- (ch_t2_14_3) { KnownPhrases ? provenance_heard: The drawer sits shut under the bench, the runners home, the bench above it working herbs again. #choice:CH-T2-14-3 #id:O-CH-T2-14-3-s #speaker:mara }
* {KnownPhrases ? provenance_heard} ["Everything in that drawer is somebody's."] #opt:CH-T2-14-3-a #id:L-CH-T2-14-3-a-p
    ~ recordBond("mara", "Recognition")
    Mm. Corks are in the low crate. #id:L-CH-T2-14-3-a-r1 #speaker:mara
    Start at the wall end and work toward me. #id:L-CH-T2-14-3-a-r2 #speaker:mara
* {KnownPhrases ? provenance_heard} [goes on with the work, does nothing with it] #opt:CH-T2-14-3-b
    Go on with the corking and leave the drawer shut. #id:L-CH-T2-14-3-b-act #speaker:mara
    Good hands today. We'll be through the crate by noon. #id:L-CH-T2-14-3-b-r1 #speaker:mara
* -> g_ch_t2_14_3
- (g_ch_t2_14_3) Placeholder: the scene continues. #id:GB-CH-T2-14-3-GATHER
- (ch_t2_14_4) { KnownPhrases ? helped_tend: Come here a minute. That end, the cup and the stool. Set the cup back if it moves, and keep that end clear. #choice:CH-T2-14-4 #id:L-CH-T2-14-4-s #speaker:mara }
* {KnownPhrases ? helped_tend} [takes the corner and keeps it clear] #opt:CH-T2-14-4-a
    ~ recordBond("mara", "Intimacy")
    Wipe the cup, square the stool, and leave that end clear. #id:L-CH-T2-14-4-a-act #speaker:mara
    That's it. It'll want doing again by evening, they always do. #id:L-CH-T2-14-4-a-r1 #speaker:mara
* {KnownPhrases ? helped_tend} ["How do you like that end kept?"] #opt:CH-T2-14-4-b #id:L-CH-T2-14-4-b-p
    ~ recordBond("mara", "Trust")
    Cup on its ring, stool square to the bench, nothing set down there however full the stall runs. #id:L-CH-T2-14-4-b-r1 #speaker:mara
    The ring's in the wood, you'll find it. #id:L-CH-T2-14-4-b-r2 #speaker:mara
* -> g_ch_t2_14_4
- (g_ch_t2_14_4) Placeholder: the scene continues. #id:GB-CH-T2-14-4-GATHER
- (ch_t2_14_5) Mara puts a crate of corked jars into the player's hands and turns to the next. #choice:CH-T2-14-5 #id:A-SC-T2-14-5 #speaker:mara
* [takes the last job out with her instruction on it] #opt:CH-T2-14-5-a
    ~ recordBond("mara", "Trust")
    Take the crate and carry it up toward the square. #id:L-CH-T2-14-5-a-act #speaker:mara
    The square used to take two carts of it, festival week. One crate at a time will do it now. #id:L-CH-T2-14-5-a-r1 #speaker:mara
* ["I'll be back for the next of it."] #opt:CH-T2-14-5-b #id:L-CH-T2-14-5-b-p
    ~ recordBond("mara", "Intimacy")
    There's always a next lot. Yours is the one by the press. #id:L-CH-T2-14-5-b-r1 #speaker:mara
* [sets the cup and the stool clear one more time before going] #opt:CH-T2-14-5-c
    ~ recordBond("mara", "Intimacy")
    Set the cup and the stool clear once more before going. #id:L-CH-T2-14-5-c-act #speaker:mara
    That end's right again. #id:L-CH-T2-14-5-c-r1 #speaker:mara
    Go on, the square's waiting on the jars. #id:L-CH-T2-14-5-c-r2 #speaker:mara
- (g_ch_t2_14_5) Placeholder: the scene continues. #id:GB-CH-T2-14-5-GATHER
-> t2.hub

= sc_t2_22
- (ch_t2_22_1) The shelf behind the stall stands cleared. Empty tonic jars are set out along it in counted rows, and the bench below is dressed for cutting work. #choice:CH-T2-22-1 #id:O-SC-T2-22-1 #speaker:mara
* ["How many do you need, and by when?"] #opt:CH-T2-22-1-a #id:L-CH-T2-22-1-a-p
    ~ KnownPhrases += frost_date_known
    ~ recordKnowledge("frost_date_known")
    ~ recordThreadMove("mara-tonic-frost")
    -- (ch_t2_22_1_a_1) The shelf takes fifty jars by festival eve, and a third of what fills them is still standing out in the forest. #choice:CH-T2-22-1-a-1 #id:L-CH-T2-22-1-a-1-s1 #speaker:mara
    ** ["Will the herbs come in on time?"] #opt:CH-T2-22-1-a-1-a #id:L-CH-T2-22-1-a-1-a-p
        ~ recordBond("mara", "Trust")
        Two afternoons of cutting and a day at the fire. The weather I can't price, so we start early. #id:L-CH-T2-22-1-a-1-a-r1 #speaker:mara
        Wipe those jars out while we talk, they take dust standing. #id:L-CH-T2-22-1-a-1-a-r2 #speaker:mara
    ** [sets the counted jars straight with her] #opt:CH-T2-22-1-a-1-b
        ~ recordBond("mara", "Intimacy")
        Set the counted jars straight along the shelf with her. #id:L-CH-T2-22-1-a-1-b-act #speaker:mara
        Mouths level, that's it. The corking goes quick when the row starts straight. #id:L-CH-T2-22-1-a-1-b-r1 #speaker:mara
    -- (g_ch_t2_22_1_a) Placeholder: the scene continues. #id:GB-CH-T2-22-1-a-1-GATHER
* [takes the share of the work she puts in the player's hands] #opt:CH-T2-22-1-b
    ~ recordBond("mara", "Intimacy")
    Take the near end of the bench and strip leaves as she cuts. #id:L-CH-T2-22-1-b-act #speaker:mara
    Stems to the pail, leaves to the tray, nothing bruised. A bruised leaf turns the whole jar bitter. #id:L-CH-T2-22-1-b-r1 #speaker:mara
    When the frost came early, the tonic went out warm. #id:L-CH-T2-22-1-b-r2 #speaker:mara
* ["What goes into the tonic?"] #opt:CH-T2-22-1-c #id:L-CH-T2-22-1-c-p
    ~ recordBond("mara", "Trust")
    Frost herbs, bitterroot, white yarrow, and honey to carry them. Steeped a day, boiled down an evening, corked warm. #id:L-CH-T2-22-1-c-r1 #speaker:mara
    You'll see the whole of it before the week's out. Start on the stripping. #id:L-CH-T2-22-1-c-r2 #speaker:mara
- (g_ch_t2_22_1) Placeholder: the scene continues. #id:GB-CH-T2-22-1-GATHER
- (ch_t2_22_2) Count them down the shelf as you wipe. If I'm one short I want to know it today, not at the fire. #choice:CH-T2-22-2 #id:L-CH-T2-22-2-s #speaker:mara
* [sets the jars out in the count] #opt:CH-T2-22-2-a
    ~ recordBond("mara", "Intimacy")
    Set the jars out along the shelf, counting them down. #id:L-CH-T2-22-2-a-act #speaker:mara
    Fifty, and none cracked. Set the wide-mouthed ones nearest, they fill first. #id:L-CH-T2-22-2-a-r1 #speaker:mara
* ["How many does the festival take?"] #opt:CH-T2-22-2-b #id:L-CH-T2-22-2-b-p
    ~ recordBond("mara", "Trust")
    Fifty for the square and the long tables. Sixty, when the whole row still traded. #id:L-CH-T2-22-2-b-r1 #speaker:mara
    The number's the festival's. It doesn't change for weather. #id:L-CH-T2-22-2-b-r2 #speaker:mara
- (g_ch_t2_22_2) Placeholder: the scene continues. #id:GB-CH-T2-22-2-GATHER
- (ch_t2_22_3) The carrying basket stands ready at the bench end, empty, its straps laid open. #choice:CH-T2-22-3 #id:O-SC-T2-22-3 #speaker:mara
* [gets the carry ready for the run] #opt:CH-T2-22-3-a
    ~ recordBond("mara", "Intimacy")
    Open the basket and set its cloth and ties in order. #id:L-CH-T2-22-3-a-act #speaker:mara
    Ties to the left side, they come to hand quicker in the field. #id:L-CH-T2-22-3-a-r1 #speaker:mara
* ["When is the light best for cutting?"] #opt:CH-T2-22-3-b #id:L-CH-T2-22-3-b-p
    ~ recordBond("mara", "Trust")
    The hour past midday, this week. After that the frost herbs close and the cutting bruises them. #id:L-CH-T2-22-3-b-r1 #speaker:mara
    The clearing held the light late, the year the big birch came down. #id:L-CH-T2-22-3-b-r2 #speaker:mara
- (g_ch_t2_22_3) Placeholder: the scene continues. #id:GB-CH-T2-22-3-GATHER
- (ch_t2_22_4) Mara puts a bundle of jar cloths and the written count into the player's hands. #choice:CH-T2-22-4 #id:A-SC-T2-22-4 #speaker:mara
* [takes the job she sends the player off with] #opt:CH-T2-22-4-a
    ~ recordBond("mara", "Trust")
    Take the cloths and the count out to scald and hang. #id:L-CH-T2-22-4-a-act #speaker:mara
    You've bought us a day of it. We go out for the rest after midday. #id:L-CH-T2-22-4-a-r1 #speaker:mara
* ["I'll be there for the run."] #opt:CH-T2-22-4-b #id:L-CH-T2-22-4-b-p
    ~ recordBond("mara", "Intimacy")
    The run wants two pairs of hands and now it has them. After midday, then. #id:L-CH-T2-22-4-b-r1 #speaker:mara
- (g_ch_t2_22_4) Placeholder: the scene continues. #id:GB-CH-T2-22-4-GATHER
-> t2.hub

= sc_f1_03
- (ch_f1_03_1) The clearing opens off the trail, the herb stand still standing at its middle, the light already low along the treeline. #choice:CH-F1-03-1 #id:O-SC-F1-03-1 #speaker:mara
* [takes a share of the run and works the near stand] #opt:CH-F1-03-1-a
    ~ recordBond("mara", "Intimacy")
    Take a share of the run and work the near stand. #id:L-CH-F1-03-1-a-act #speaker:mara
    A hand above the root, and leave anything flowered. A flowered stem has given its strength away. #id:L-CH-F1-03-1-a-r1 #speaker:mara
* ["What are you cutting first?"] #opt:CH-F1-03-1-b #id:L-CH-F1-03-1-b-p
    ~ recordBond("mara", "Trust")
    Frost herbs first, they close soonest. Then bitterroot, it doesn't mind the dark coming. The yarrow cuts by feel. #id:L-CH-F1-03-1-b-r1 #speaker:mara
    Take the near stand and keep pace with me. #id:L-CH-F1-03-1-b-r2 #speaker:mara
- (g_ch_f1_03_1) Placeholder: the scene continues. #id:GB-CH-F1-03-1-GATHER
- (ch_f1_03_2) They cut down the rows, handful by handful, and the carry fills. The light drops a shade at a time. #choice:CH-F1-03-2 #id:A-SC-F1-03-2 #speaker:mara
* [works the near stand alongside her] #opt:CH-F1-03-2-a
    ~ recordBond("mara", "Intimacy")
    Work the near stand alongside her, matching her cut. #id:L-CH-F1-03-2-a-act #speaker:mara
    You've got the pace of it. Hold it and we're clear before dark. #id:L-CH-F1-03-2-a-r1 #speaker:mara
* ["What does the frost take first?"] #opt:CH-F1-03-2-b #id:L-CH-F1-03-2-b-p
    ~ recordBond("mara", "Trust")
    The frost herbs, the first night it lands. Bitterroot keeps under it a week. The yarrow goes black by morning. #id:L-CH-F1-03-2-b-r1 #speaker:mara
- (g_ch_f1_03_2) Placeholder: the scene continues. #id:GB-CH-F1-03-2-GATHER
- (ch_f1_03_3) Set the next lot on the cloth, not in. #choice:CH-F1-03-3 #id:L-CH-F1-03-3-s1 #speaker:mara
* [stays with it and holds the carry steady] #opt:CH-F1-03-3-a
    ~ KnownPhrases += drift_seen
    ~ recordKnowledge("drift_seen")
    Stay with it and hold the carry steady while she works. #id:L-CH-F1-03-3-a-act #speaker:mara
    Hold it just there. The stitch goes cleaner when the rim can't flex. #id:L-CH-F1-03-3-a-r1 #speaker:mara
* ["We've stopped. The light hasn't."] #opt:CH-F1-03-3-b #id:L-CH-F1-03-3-b-p
    ~ KnownPhrases += drift_seen
    ~ recordKnowledge("drift_seen")
    -- (ch_f1_03_3_b_1) Two minutes of thread now, or a spilled carry on the trail. The binding went on three summers back, it was due. Take this lot while I work. #choice:CH-F1-03-3-b-1 #id:L-CH-F1-03-3-b-1-s #speaker:mara
    ** ["How long will it take, against the light?"] #opt:CH-F1-03-3-b-1-a #id:L-CH-F1-03-3-b-1-a-p
        ~ recordBond("mara", "Trust")
        --- (ch_f1_03_3_b_1_a_1) A hundred count, maybe two. A stitch hurried is a stitch done twice, so it gets its two. #choice:CH-F1-03-3-b-1-a-1 #id:L-CH-F1-03-3-b-1-a-1-s #speaker:mara
        *** [lets the time stand and holds the light for her] #opt:CH-F1-03-3-b-1-a-1-a
            ~ recordBond("mara", "Intimacy")
            Stand so the last light falls on her hands, and let the time run. #id:L-CH-F1-03-3-b-1-a-1-a-act #speaker:mara
            That's better. Hold there till the knot's in. #id:L-CH-F1-03-3-b-1-a-1-a-r1 #speaker:mara
        *** ["The carry was holding fine before you started."] #opt:CH-F1-03-3-b-1-a-1-b #id:L-CH-F1-03-3-b-1-a-1-b-p
            ~ recordBond("mara", "Recognition")
            Mm. It was. #id:L-CH-F1-03-3-b-1-a-1-b-r1 #speaker:mara
            Mara pulls the binding tight and sets the knot. The mend holds. #id:A-CH-F1-03-3-b-1-a-1-r #speaker:mara
            Yarrow next. #id:L-CH-F1-03-3-b-1-a-1-b-r2 #speaker:mara
        --- (g_ch_f1_03_3_b_1_a) Placeholder: the scene continues. #id:GB-CH-F1-03-3-b-1-a-1-GATHER
    ** [takes the handful and works beside her] #opt:CH-F1-03-3-b-1-b
        ~ recordBond("mara", "Intimacy")
        Take the handful and work on beside her. #id:L-CH-F1-03-3-b-1-b-act #speaker:mara
        Strip as you go, it saves the bench later. #id:L-CH-F1-03-3-b-1-b-r1 #speaker:mara
    -- (g_ch_f1_03_3_b) Placeholder: the scene continues. #id:GB-CH-F1-03-3-b-1-GATHER
* [keeps gathering along the treeline] #opt:CH-F1-03-3-c
    ~ recordBond("mara", "Intimacy")
    Keep gathering along the treeline while the mend goes on behind. #id:L-CH-F1-03-3-c-act #speaker:mara
    Take the far row down to the birches. Anything flowered stays. #id:L-CH-F1-03-3-c-r1 #speaker:mara
    -> mara.sc_f1_03.ch_f1_03_6
- (g_ch_f1_03_3) Placeholder: the scene continues. #id:GB-CH-F1-03-3-GATHER
- (ch_f1_03_4) Right. The far stand, then the ground under the beech. We'll have the whole of it yet. #choice:CH-F1-03-4 #id:L-CH-F1-03-4-s #speaker:mara
* [takes the carry and gets the run moving again] #opt:CH-F1-03-4-a
    ~ recordBond("mara", "Intimacy")
    Take the carry from her and get the run moving again. #id:L-CH-F1-03-4-a-act #speaker:mara
    It rides better full. Keep it against your hip. #id:L-CH-F1-03-4-a-r1 #speaker:mara
* ["What's still to cut?"] #opt:CH-F1-03-4-b #id:L-CH-F1-03-4-b-p
    ~ recordBond("mara", "Trust")
    The yarrow under the beech and the last row of bitterroot. Half an hour's work in good light. #id:L-CH-F1-03-4-b-r1 #speaker:mara
- (g_ch_f1_03_4) Placeholder: the scene continues. #id:GB-CH-F1-03-4-GATHER
- (ch_f1_03_5) { KnownPhrases ? frost_date_known: Past the far stand a last stretch of herbs is still standing, grey against the light going down the treeline. #choice:CH-F1-03-5 #id:O-CH-F1-03-5-s #speaker:mara }
* {KnownPhrases ? frost_date_known} ["The mend's minutes came out of your count."] #opt:CH-F1-03-5-a #id:L-CH-F1-03-5-a-p
    ~ recordBond("mara", "Recognition")
    The grey heads hold their oil till morning; they're not lost. Take the row nearest the dark. #id:L-CH-F1-03-5-a-r1 #speaker:mara
* {KnownPhrases ? frost_date_known} [works faster beside her, says nothing of it] #opt:CH-F1-03-5-b
    ~ recordBond("mara", "Intimacy")
    Work faster beside her and say nothing of it. #id:L-CH-F1-03-5-b-act #speaker:mara
    Good hands. Leave the short stems, they're not worth the stoop tonight. #id:L-CH-F1-03-5-b-r1 #speaker:mara
* -> g_ch_f1_03_5
- (g_ch_f1_03_5) Placeholder: the scene continues. #id:GB-CH-F1-03-5-GATHER
- (ch_f1_03_6) The carry stands full at the trailhead, the fresh mend plain at its rim, pale thread against the dark weave. #choice:CH-F1-03-6 #id:O-CH-F1-03-6-s #speaker:mara
* [carries the full basket back down the trail] #opt:CH-F1-03-6-a
    ~ KnownPhrases += herbs_carried
    ~ recordKnowledge("herbs_carried")
    Take the full basket and carry it back down the trail. #id:L-CH-F1-03-6-a-act #speaker:mara
    Keep it against your hip, there's roots across the trail past the birches. #id:L-CH-F1-03-6-a-r1 #speaker:mara
* ["What goes in first at the shelf?"] #opt:CH-F1-03-6-b #id:L-CH-F1-03-6-b-p
    ~ recordBond("mara", "Trust")
    Frost herbs to the steep pot the same night. The rest hangs till morning. #id:L-CH-F1-03-6-b-r1 #speaker:mara
    Back when the stall brewed for three villages, this clearing filled two carries a day. #id:L-CH-F1-03-6-b-r2 #speaker:mara
- (g_ch_f1_03_6) Placeholder: the scene continues. #id:GB-CH-F1-03-6-GATHER
-> f1.hub

= sc_t2_23
- (ch_t2_23_1) The tonic jars stand full and corked on the cleared shelf, fifty in counted rows, labels out. Frost silvers the boards of Market Row, and Mara has the stall's winter canvas across her knees. #choice:CH-T2-23-1 #id:O-SC-T2-23-1 #speaker:mara
* [takes the job she puts in the player's hands] #opt:CH-T2-23-1-a
    ~ recordBond("mara", "Intimacy")
    Take the dried bunches down from the line, one by one. #id:L-CH-T2-23-1-a-act #speaker:mara
    Leave the ties on them, they hang again come spring. The line stays up all winter. #id:L-CH-T2-23-1-a-r1 #speaker:mara
* ["Did the count come out?"] #opt:CH-T2-23-1-b #id:L-CH-T2-23-1-b-p
    ~ recordBond("mara", "Trust")
    Fifty, corked by yesterday's dark, and the frost came overnight. The festival has its tonic. #id:L-CH-T2-23-1-b-r1 #speaker:mara
* ["Your shelf's full."] #opt:CH-T2-23-1-c #id:L-CH-T2-23-1-c-p
    ~ recordThreadMove("mara-tonic-frost")
    It is. This hem isn't. Hold the near end flat for me. #id:L-CH-T2-23-1-c-r1 #speaker:mara
- (g_ch_t2_23_1) Placeholder: the scene continues. #id:GB-CH-T2-23-1-GATHER
- (ch_t2_23_2) The count's out and corked, the whole fifty. #choice:CH-T2-23-2 #id:L-CH-T2-23-2-s1 #speaker:mara
* [stands with the finished shelf, says nothing of it] #opt:CH-T2-23-2-a
    ~ recordBond("mara", "Intimacy")
    Stand with the finished shelf and say nothing of it. #id:L-CH-T2-23-2-a-act #speaker:mara
    Bring me the small shears while you're standing. #id:L-CH-T2-23-2-a-r1 #speaker:mara
* ["What does the shelf still need?"] #opt:CH-T2-23-2-b #id:L-CH-T2-23-2-b-p
    ~ recordBond("mara", "Trust")
    Nothing. It's done. The canvas wants thread, the line wants coiling, and the bitterroot wants stringing for winter. #id:L-CH-T2-23-2-b-r1 #speaker:mara
- (g_ch_t2_23_2) Placeholder: the scene continues. #id:GB-CH-T2-23-2-GATHER
- (ch_t2_23_3) { KnownPhrases ? drift_seen: The carrying basket stands at the bench end among the finished work, the pale thread of the mend plain on its rim. #choice:CH-T2-23-3 #id:O-CH-T2-23-3-s #speaker:mara }
* {KnownPhrases ? drift_seen} ["The mend outlasted the run."] #opt:CH-T2-23-3-a #id:L-CH-T2-23-3-a-p
    ~ recordBond("mara", "Recognition")
    Waxed thread does. High peg, mind the straps. #id:L-CH-T2-23-3-a-r1 #speaker:mara
* {KnownPhrases ? drift_seen} [sets the carry back where it lives] #opt:CH-T2-23-3-b
    ~ recordBond("mara", "Intimacy")
    Hang the carry high on its peg where it lives. #id:L-CH-T2-23-3-b-act #speaker:mara
    That's it. It hangs dry there till the spring runs. #id:L-CH-T2-23-3-b-r1 #speaker:mara
* -> g_ch_t2_23_3
- (g_ch_t2_23_3) Placeholder: the scene continues. #id:GB-CH-T2-23-3-GATHER
- (ch_t2_23_4) { KnownPhrases ? herbs_carried: The wall-end jars hold what you carried down. Frost herbs off the near stand, and the yarrow from under the beech. #choice:CH-T2-23-4 #id:L-CH-T2-23-4-s #speaker:mara }
* {KnownPhrases ? herbs_carried} [takes the next job the same way] #opt:CH-T2-23-4-a
    ~ recordBond("mara", "Intimacy")
    Hold out a hand for the next load, the same way. #id:L-CH-T2-23-4-a-act #speaker:mara
    The bitterroot, then. Strung in fives and hung where the wind is. You know the weight of a fair load now. #id:L-CH-T2-23-4-a-r1 #speaker:mara
* {KnownPhrases ? herbs_carried} ["What happens to the shelf after the festival?"] #opt:CH-T2-23-4-b #id:L-CH-T2-23-4-b-p
    ~ recordBond("mara", "Trust")
    It empties in a night, jar by jar off the front row. Then it takes the winter stock. #id:L-CH-T2-23-4-b-r1 #speaker:mara
* -> g_ch_t2_23_4
- (g_ch_t2_23_4) Placeholder: the scene continues. #id:GB-CH-T2-23-4-GATHER
- (ch_t2_23_5) That's the whole of the tonic work done. #choice:CH-T2-23-5 #id:L-CH-T2-23-5-s1 #speaker:mara
* [takes a part of it and works it with her] #opt:CH-T2-23-5-a
    ~ recordBond("mara", "Intimacy")
    Take a part of the hem and work it with her. #id:L-CH-T2-23-5-a-act #speaker:mara
    -- (ch_t2_23_5_a_1) This canvas has been on the stall eleven winters. It wants a new hem every frost and a patch where the pole rubs, and it gets them. #choice:CH-T2-23-5-a-1 #id:L-CH-T2-23-5-a-1-s #speaker:mara
    ** ["You haven't gone back to the shelf."] #opt:CH-T2-23-5-a-1-a #id:L-CH-T2-23-5-a-1-a-p
        ~ recordBond("mara", "Recognition")
        Mm. This needle's going blunt, there's a fresh one in the roll. #id:L-CH-T2-23-5-a-1-a-r1 #speaker:mara
        Pull the next stitch through while I thread it. #id:L-CH-T2-23-5-a-1-a-r2 #speaker:mara
    ** [works on without marking it] #opt:CH-T2-23-5-a-1-b
        ~ recordBond("mara", "Intimacy")
        Work on down the hem without marking it. #id:L-CH-T2-23-5-a-1-b-act #speaker:mara
        You keep a fair stitch. This side's done by dark at this rate. #id:L-CH-T2-23-5-a-1-b-r1 #speaker:mara
    -- (g_ch_t2_23_5_a) Placeholder: the scene continues. #id:GB-CH-T2-23-5-a-1-GATHER
* ["Was the tonic the last of it?"] #opt:CH-T2-23-5-b #id:L-CH-T2-23-5-b-p
    ~ recordBond("mara", "Trust")
    The last of the jars, not of the work. The wet years wore the canvas through at the grommets. There's stringing and coiling after it. #id:L-CH-T2-23-5-b-r1 #speaker:mara
- (g_ch_t2_23_5) Placeholder: the scene continues. #id:GB-CH-T2-23-5-GATHER
- (ch_t2_23_6) Mara wraps six corked jars into a carrier and puts it into the player's hands. #choice:CH-T2-23-6 #id:A-SC-T2-23-6 #speaker:mara
* [takes the last job out with her instruction on it] #opt:CH-T2-23-6-a
    ~ recordBond("mara", "Trust")
    Take the jars out with her instruction on them. #id:L-CH-T2-23-6-a-act #speaker:mara
    Mouths up the whole way. That's the festival's share moving. #id:L-CH-T2-23-6-a-r1 #speaker:mara
* ["I'll come back for the rest of the hem."] #opt:CH-T2-23-6-b #id:L-CH-T2-23-6-b-p
    ~ recordBond("mara", "Intimacy")
    Hem work suits a cold morning. Come when the frost quiets the row and bring your fair stitch. #id:L-CH-T2-23-6-b-r1 #speaker:mara
- (g_ch_t2_23_6) Placeholder: the scene continues. #id:GB-CH-T2-23-6-GATHER
-> t2.hub

= sc_t2_20
- (ch_t2_20_1) At the stall's end the drawer stands open on unclaimed things. A scorched shirt lies folded on top, the collar turned up, a thread already through its edge. #choice:CH-T2-20-1 #id:O-SC-T2-20-1 #speaker:mara
* [takes the job she hands over] #opt:CH-T2-20-1-a
    ~ recordBond("mara", "Intimacy")
    Take the crate and start stripping the stems #id:L-CH-T2-20-1-a-act #speaker:mara
    Second joint, mind, the lower leaves go bitter in the jar. You'd taste it come frost. #id:L-CH-T2-20-1-a-r1 #speaker:mara
    There used to be two crates of the frost lot by now. This year the one. #id:L-CH-T2-20-1-a-r2 #speaker:mara
* ["What are these for?"] #opt:CH-T2-20-1-b #id:L-CH-T2-20-1-b-p
    ~ recordBond("mara", "Trust")
    The tonic. These are the bittering leaves, they go in dry and they're the last thing in. #id:L-CH-T2-20-1-b-r1 #speaker:mara
    Strip while you ask, we can do both. #id:L-CH-T2-20-1-b-r2 #speaker:mara
- (g_ch_t2_20_1) Placeholder: the scene continues. #id:GB-CH-T2-20-1-GATHER
- (ch_t2_20_2) She works past the open drawer without a look at it. The thread waits in the shirt's collar where the mend is begun. #choice:CH-T2-20-2 #id:A-CH-T2-20-2-s #speaker:mara
* [turns the collar and reads the stitched name] #opt:CH-T2-20-2-a
    ~ KnownPhrases += collar_name_known
    ~ recordKnowledge("collar_name_known")
    ~ recordThreadMove("toby-kept-and-returned")
    ~ recordBond("mara", "Recognition")
    Turn the collar and read the name stitched inside #id:L-CH-T2-20-2-a-act #speaker:mara
    Mara ties off a bundle and reaches for the next. Her eyes stay on her hands. #id:L-CH-T2-20-2-a-r1 #speaker:mara
    The jars want counting next, there's meant to be twenty of the small. #id:L-CH-T2-20-2-a-r2 #speaker:mara
* ["How far along is that mend?"] #opt:CH-T2-20-2-b #id:L-CH-T2-20-2-b-p
    ~ recordBond("mara", "Trust")
    Collar's tacked and the seam's true again. The scorch wants a patch cut yet, that's the evening's work. #id:L-CH-T2-20-2-b-r1 #speaker:mara
    Cloth that's worked hot takes the needle better than new. It's held a shape already. #id:L-CH-T2-20-2-b-r2 #speaker:mara
* [sets it back as she had it, leaves the drawer alone] #opt:CH-T2-20-2-c
    ~ recordBond("mara", "Intimacy")
    Set the shirt back as she had it and leave the drawer alone #id:L-CH-T2-20-2-c-act #speaker:mara
    Collar up, yes. It sits so the thread doesn't pull when the drawer runs. #id:L-CH-T2-20-2-c-r1 #speaker:mara
- (g_ch_t2_20_2) Placeholder: the scene continues. #id:GB-CH-T2-20-2-GATHER
- (ch_t2_20_3) The patch goes on whole. #choice:CH-T2-20-3 #id:L-CH-T2-20-3-s1 #speaker:mara
* [takes up the mend beside her and works it] #opt:CH-T2-20-3-a
    ~ recordBond("mara", "Intimacy")
    Take up the needle and work the patch's far side beside her #id:L-CH-T2-20-3-a-act #speaker:mara
    Small stitches on the turn, you can go long on the straight. It'll outlast the rest of the shirt. #id:L-CH-T2-20-3-a-r1 #speaker:mara
    -> mara.sc_t2_20.ch_t2_20_5
* ["Why leave the burn showing?"] #opt:CH-T2-20-3-b #id:L-CH-T2-20-3-b-p
    ~ recordBond("mara", "Recognition")
    A patch over the top holds. Cut the scorch out and you're sewing edge to edge, and it goes again first wash. #id:L-CH-T2-20-3-b-r1 #speaker:mara
- (g_ch_t2_20_3) Placeholder: the scene continues. #id:GB-CH-T2-20-3-GATHER
- (ch_t2_20_4) { KnownPhrases ? shirt_shed: That one's this week's. The rest have been in longer. #choice:CH-T2-20-4 #id:L-CH-T2-20-4-s #speaker:mara }
* {KnownPhrases ? shirt_shed} ["That shirt was set down, not lost."] #opt:CH-T2-20-4-a #id:L-CH-T2-20-4-a-p
    ~ recordBond("mara", "Recognition")
    It came in unclaimed. It's here now, and it's being kept. #id:L-CH-T2-20-4-a-r1 #speaker:mara
    Hold the collar flat while I get the shoulder. #id:L-CH-T2-20-4-a-r2 #speaker:mara
* {KnownPhrases ? shirt_shed} [leaves the knowing where it is, gets on with the tending] #opt:CH-T2-20-4-b
    ~ recordBond("mara", "Intimacy")
    Leave it where it is and get back to the bundles #id:L-CH-T2-20-4-b-act #speaker:mara
    Tie the loose ones first, they've been cut longest. #id:L-CH-T2-20-4-b-r1 #speaker:mara
* -> g_ch_t2_20_4
- (g_ch_t2_20_4) Placeholder: the scene continues. #id:GB-CH-T2-20-4-GATHER
- (ch_t2_20_5) The player's hands are still in the work when she eases the drawer shut. #choice:CH-T2-20-5 #id:A-CH-T2-20-5-s #speaker:mara
* [puts the tools back the way she keeps them] #opt:CH-T2-20-5-a
    ~ recordBond("mara", "Intimacy")
    Wind the thread and set the needle back where she keeps it #id:L-CH-T2-20-5-a-act #speaker:mara
    Point-down, so the damp doesn't sit in the eye. You've put tools away before. #id:L-CH-T2-20-5-a-r1 #speaker:mara
* ["Is there more mending for next time?"] #opt:CH-T2-20-5-b #id:L-CH-T2-20-5-b-p
    ~ recordBond("mara", "Trust")
    There's always more. Come when you're passing and I'll have something for your hands. #id:L-CH-T2-20-5-b-r1 #speaker:mara
    The drawer shut flush once, years back. It hasn't since. #id:L-CH-T2-20-5-b-r2 #speaker:mara
- (g_ch_t2_20_5) Placeholder: the scene continues. #id:GB-CH-T2-20-5-GATHER
-> t2.hub

