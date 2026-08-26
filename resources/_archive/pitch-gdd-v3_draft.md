# Codename: rebirth

 A cozy roguelite **point-and-click adventure** set in a hand-painted magical world in the spirit of *Myst*, *Outer Wilds*, *Frieren*, and *Studio Ghibli*, where you **explore, collect, and discover**.

The game explores one question: what does it mean to belong, and does connection span lifetimes?

---

## THE STORY

You have just moved to a small magical town, and the festival of souls is a week away. You do not know anyone yet. So you do what a newcomer does: you walk the market and the woods, you forage what grows, you make small things, and you learn the town's folk magic by watching the people who already know it. Everything you learn and everyone you meet feeds the festival, and the festival is the thing the whole town is building toward together.

The week has a shape. Each day you pick one place to be — the square, the forest clearing, the old shrine at the town's quiet edge You gather more than fits in your pack, so at day's end you decide what to carry home and what to leave behind. 

Then festival night comes, and how it goes depends on what you did with your week and who you choose to spend it with. Afterward, time skips forward a year, and at the end of the third year the game shows you a quiet retrospective of your time here.

And then you begin a new life, and the town has shuffled. The blacksmith is the postman now. Someone who was a friend is a brother. The roles are re-dealt, but the *souls* are the same — the same essence, the same personality, wearing a new life. The more time you spend with a soul across your lives, the deeper your bond grows, and the more the world remembers you back.

---

## WHY IT'S DIFFERENT

**The same souls return, in new roles — and the town remembers.** Every new life reshuffles who everyone is: the chef becomes the blacksmith, half-recognizing you. Their personality never changes, only their place in the town. You keep notes on them the way *Return of the Obra Dinn* keeps its crew manifest, reading each neighbor from what you observe — and the bond you build with a soul carries across every life you live.

**Knowledge lives in your head, not a save flag.** You learn a spell by watching a neighbor cast it, then confirming it yourself — proof before definition. Gates open when you *perform* what you know: watch someone burn a dry hedge to clear the trail, then do it, and the way is open. Nothing is unlocked by a "visited here" checkbox. What you carry between lives is what you actually learned.

**Point and click adventure game combining visual novel and roguelike elements**.  Story is designed to deliver quick beats and keep play sessions short but provide replay value.

---

## ONE FESTIVAL WEEK, START TO FINISH

1. **Choose who you are and where to begin.** For the slice you play a mage; you start, at random, in the town or the forest.
2. **Spend the day.** A day is three to five moves across a location. You forage, you make things, you cast, and you talk to whoever is around — solo and social, side by side.
3. **Learn magic by watching people.** Most spells are learned from neighbors, not found: see the cast, try it yourself, and a new place or a new possibility opens.
4. **Carry what you can home.** At day's end you keep only what fits your satchel; the rest stays behind. Knowledge and sounds travel free. Your home is yours to arrange this life.
5. **Pick tomorrow on the calendar.** Route is attention. You cannot see everyone before the festival, so where you go is the strategy layer.
6. **The week builds to festival night.** The outcome turns on your decisions and on who you choose to spend the festival with — someone, a group, or alone.
7. **Time jumps a year.** Backstory fills the gap, the neighbors remember, and the week begins again. Three festival-years make one life, and then a retrospective and a new beginning.

Sessions are short by design, and the reward is what you learn and collect, not what you clear. Come back, and the souls have been re-dealt into new lives — noticing who they still are is the game.

## WINNING, AND WHAT HAPPENS WHEN YOU DON'T

You cannot lose this game, only live it. There is no game-over and no fail screen. Every run ends *with something* — the ending vignette is guaranteed, and it is drawn from the choices you made. Success is measured as the depth of connection you reached: how well you came to know the souls around you, and how much of the world you gathered. A wrong action teaches; it never punishes.

## WHO IT'S FOR

Players who love cozy exploration and the pull of a collection to complete, and players who come for character-driven narrative about belonging, memory, and connection. It asks for patience and attention rather than reflexes, and it rewards both.

---

## THE SLICE IS SMALL ON PURPOSE

The full document describes the whole game. The vertical slice, built toward the August 25 capstone with the AI dev crew, is a thin, *complete* piece of it — chosen to cross the riskiest ground first: proving that the same soul, re-dealt into a new role, reads as the same soul, and that the town's memory lands for real inside the game rather than as a promise.

**What the slice is:** one run polished and fun all the way to the festival — that is where the polish budget goes. The short cycle is the wow: one full run and then a reshuffle, played end to end, so the memory payoff is demonstrated, not scripted. The story pipeline holds for a few runs — year-over-year neighbor memory, backstory filling the gaps, echoes accumulating across festivals. Neighbors carry different-role content, so the reshuffle is shown on camera. One or two authored endings ship, each a point on the belonging spectrum, with no prescribed "true" win.

**What the slice is not:** multiple runs of hand-authored content, not the third location (the Farm is a reserved slot), and not every screen if time runs short. Each of these is named in the full document as designed-later work with its cuts ordered in advance — which is why the GDD carries the whole map and the slice walks the first mile.

## UNDER THE HOOD, IN ONE PARAGRAPH

The slice is built in Unreal Engine 5 with the point-and-click toolkit, Wwise for audio, and 3D static-camera scenes — one built location reused from many angles, so the replayed festival week renders cheaply and "time moved, we returned" reads for free. The narrative runs on **ink**, proven in a browser this week and carried into Unreal, so the content graph built now is the graph the game ships on. **Runtime AI cost is zero:** the shipped game makes no model calls, needs no cloud, and runs fully offline — its memory of your lives and its reshuffling of the souls is ordinary, deterministic game code. That is the intelligence you feel on screen. Behind the scenes, a build-time crew of agents — an orchestrator plus a narrative architect, a dialogue writer, a consistency checker, an audio-tag namer, and a QA pass — generates the game's content during development, and a human approves every line before it ships.
