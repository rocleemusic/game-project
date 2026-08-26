**[00:02]** So the way these one-on-ones work.

**[00:04]** We can talk about pretty much anything you want to talk about.

**[00:07]** So if you want to review your prototype or look at your GED or if you have questions, it's really up to you. This is your time.

**[01:25]** So do you want to update the game design document based on your changes, or are you looking to update the game based on the GDD?

**[01:45]** Okay, so you've got a couple of options.

**[01:48]** First off, like you've got to identify why it's not fun and what would be more fun in place of it. So you need an idea of like.

**[01:56]** Does this look like a complete structural teardown? We need to implement a completely new feature or new mechanic here, or is this just we need to make a couple of changes? Like,

**[02:05]** Maybe it's smaller changes, that sort of thing. So which one do you think it is right now?

**[02:56]** I mean, there's all sorts of ways you can set your game up depending on what's fun for you and what's fun for the players. Like a lot of visual novel type games are very heavy on story, and then they'll only break it up every so often with mini games, for example, and people love that.

**[03:11]** Um, you know, I've recently played like Of the Devil is a good example, where it's a visual novel that has mini games every so often, or it has.

**[03:21]** You know, a poker-based mechanic for like continuing gameplay where you can win or lose and stuff like that. So, like, it's not uncommon to have games where you have a ton of narration and a ton of reading before you get to.

**[03:33]** A mini game. So the mini games don't

**[03:35]** Like, you don't have to scrap everything if it feels good. Now, if you're stuck in the point where you're like, this just sucks, I don't like reading through all of this. I just want to get into gameplay or something like that.

**[03:45]** Then, yeah, you could decide to pivot. And there's a couple of ways you can look at it. I mean, you saw how long it took you to.

**[03:51]** spin this this prototype up.

**[03:53]** Right.

**[03:54]** So realistically, you haven't, you don't need to fall into the sunk cost fallacy. Like if this is really far off of what you want.

**[04:01]** You can just throw away pieces of it or throw away the whole thing and rebuild.

**[04:05]** new chunks.

**[04:06]** That's an option if you want to do that. What you would do to do that is you would go in, you would make massive updates to your GDB, you would change everything that you want to change so that it reflects the new state of what you want the game to look like.

**[04:18]** And then you just kick off another build process where you might need to create new agents specific for that build. You might not.

**[04:25]** Um

**[04:26]** And then you just build the next version and then you test that version. That would be what I did with the mech game where I was trying to figure out, you know.

**[04:33]** Is real time better? Is turn-based better? Is this better? So you can just build new versions.

**[04:39]** Um

**[04:40]** And that's just, you know, it's a token cost. Like you got to look at it like.

**[04:44]** Do you have the tokens? Do you want to spend the tokens? Like that sort of thing. You can build a new prototype version and then go from that direction.

**[04:51]** If you feel like most of it is pretty consistent, then you could just like. I like what you did here where you split it into three pieces. That's a good way to think about it.

**[05:00]** because you're isolating each piece of gameplay so that you can test each piece individually.

**[05:05]** Um from there, you can also just make the updates to the

**[05:08]** the pieces that you need to update and still keep the overlying game if that works better for you, you know?

**[05:16]** It's whatever's going to be the closest. Like, is it going to be easier to just

**[05:19]** Adjust from here, or is it going to be easier to just start over, build a new version, and then adjust the new version?

**[06:21]** Okay, so if you've got an issue like that where

**[06:24]** the actual feature that it built is drifting from what you need it to be able to do.

**[06:29]** The first thing you've got to do is you've got to figure out what caused that sort of a drift. So you ask, you know, why does the save?

**[06:36]** System having these issues, right? Get it to evaluate, get it to find.

**[06:40]** Find out the reason and find out what the root cause is on its own. From there, it makes it a lot easier to suggest the plan.

**[06:47]** for being able to resolve it.

**[06:48]** The alternative to that, if it's still having trouble and it's not able to figure out what the root cause of the problem is, is that you would go through and be overly specific with how you want the system to work.

**[06:59]** So for your save game system, you would say for this component of the game.

**[07:03]** This is what I want saved. This is the state that we need to be able to restore.

**[07:07]** for this second component of the game.

**[07:09]** You know, so you can also do that by creating an agent or just asking it to review your code and look at which pieces of this need to be saved to be able to restore the game state to the exact state.

**[07:20]** So that's three different approaches you can take to solve the problem based on

**[07:24]** Um like what specific issues it's running into and you know

**[07:28]** I usually start with the first one where you try to get it to resolve.

**[07:32]** Why it ran into that issue in the first place, because that preloads all the context you need to fix the issue.

**[08:07]** So I usually just go based off of the state.

**[08:10]** of the game.

**[08:11]** So

**[08:12]** Um for the most part, I try to avoid

**[08:15]** unless I'm getting close to like a production release, I try to avoid looking at

**[08:19]** independent lines of code and things like that. I'm more checking.

**[08:23]** How does the feature work now? Like, are we seeing massive performance issues?

**[08:28]** Like those sort of questions. And then, as you get closer to production release, that's when you can do like a couple of code review cycles where you get it to review different aspects.

**[08:38]** fine-tune things from there. But at this stage, you're just prototyping. So like

**[08:43]** You just need the thing to work.

**[08:44]** and then you can test the gameplay mechanics from there.

**[08:47]** And then, as you start getting a game that starts feeling more fun, like it's good to interact with, like you enjoy playing the game, you want to come back.

**[08:55]** And playtest it more instead of you just feeling like you're grinding through playtesting because you're trying to, you know.

**[09:01]** You'll know when it happens, right? You'll know the moment when it starts feeling better to play through the game.

**[09:06]** Um

**[09:07]** Then yeah, you can kind of adjust for that.

**[09:10]** and make all those sort of changes.

**[09:12]** Hmm.

**[09:13]** Mm-hmm.

**[09:31]** Yeah. Yeah. So

**[09:33]** So the human AI hybrid type work.

**[09:36]** Uh you'd likely want to be using something like Codex or VS Code where you can actually review the changes as they come in.

**[09:44]** Um you can set up like a co-pilot through there or something like that.

**[09:48]** Um where you have the ability to like directly review changes or

**[09:53]** What I like doing is I set it up so that I review on a PR level.

**[09:57]** So I'll push the PR up. The PR will have its own type of code review.

**[10:01]** In place, where it'll have an AI code review that runs even before I look at it, which compares it to the rest of the code base as well.

**[10:08]** And then from there, you go in and review it on a PR level. So you start reviewing changes. You try to focus less on the line per line and more about the system as a whole. And then when you need that documentation, I develop, I write that documentation constantly, basically.

**[10:22]** So you can't even set up an agent that just runs as part of your pipeline where you make a change, it documents it immediately.

**[10:28]** Like it creates a system document, it updates existing system documents, things like that.

**[10:33]** You can also just document whenever you get done with something and you need it documented.

**[10:38]** And lastly, even if you don't document it, you can always do that review process where you have your.

**[10:43]** AI.

**[10:44]** Review the code, you know.

**[10:46]** I identify how it actually works compared to your GED, how the code.

**[10:50]** itself works and then you can do documentation retroactively as well.

**[10:55]** Um

**[10:56]** You can do the same thing if you're using like uh any sort of uh commits.

**[11:01]** where you have it look at specific PRs that have been merged.

**[11:04]** And you can get it to document that specific feature because, like, that's when the feature was built out. So, that's another way to.

**[11:10]** kind of separate it and get it to look at only a specific piece of code instead of

**[11:14]** Bite the hole.

**[11:15]** system at the same time.

**[11:28]** Well, I I mean PRs are if you're using GitHub.

**[11:31]** or per force already and you have that version control in place.

**[11:35]** Then having them commit to that version control gives you a place where you can go in and you can review it.

**[11:41]** You can have all your hook processes run where it's doing AI code review or whatever.

**[11:46]** It's running your linting. It's running. It's basically checking all the stuff that.

**[11:50]** Is like the low-hanging fruit errors that can just pick up easily. So you don't have to worry about those, you only have to care about like.

**[11:57]** Logic errors and architecture errors, and like, you know, you're not reviewing the syntax line per line, you're reviewing.

**[12:03]** Like, how does this system interact with that system? Okay, this sucks. Let's change this part around.

**[12:09]** You know, so um, AI does, if you don't have it review your code base, it has a habit of like.

**[12:14]** Build a new feature means we're going to build a new file. We're going to put everything over here. It's going to be completely independent from.

**[12:20]** The rest of the system, it'll have its own variables, like all that kind of stuff. So, you're basically trying to get away from that.

**[12:26]** where you're the one defining the architecture. You're saying this needs to live over here.

**[12:31]** And then the code or you know your AI tool is what's actually writing the line by line code.

**[12:36]** To accomplish that. So at that point, if you're more developer savvy and you know how to do that sort of a workflow.

**[12:43]** then you can define a lot more of the architecture and you also know the language that's required to get it to review it successfully.

**[12:50]** because you know what you're looking for.

**[13:32]** Yeah, what do you do for work?

**[14:05]** Yeah, for sure. And I mean, especially if you just need a slider.

**[14:09]** That like changes something or adjusts a variable in game so you can kind of fine-tune it. It's really good at doing stuff like that.

**[14:15]** So

**[14:29]** Nice.

**[14:39]** Yeah, that's awesome. Yeah, any of that kind of work it it's definitely really helpful for. It's obviously

**[14:44]** A little bit less good at some things, like level design. And I'm sure as you're using it and trying to build it out, like sometimes it works and.

**[14:51]** Sometimes it needs a lot more hand placement and stuff like that, but especially when it comes to creating tools or working with data or anything like that, it's really, really solid for that.

**[15:06]** Well, just some of the things that have been announced with the next version of Unreal already. I mean, they're definitely leaning into MCP and

**[15:14]** you know, leaning more into the AI development workflow.

**[15:17]** I'm a little nervous about Blueprint.

**[15:20]** because they're talking about, you know.

**[15:24]** Yeah, like let's use a new scripting language. And I mean, it makes sense when you're looking at it from an AI-centric workflow.

**[15:31]** But when you're looking at from

**[15:33]** I mean, we've used blueprints for a long time, so obviously that's going to be a major change.

**[15:37]** Um besides that, I'm most interested in just you know

**[15:42]** better code tools better

**[15:45]** I want to help people realize their creative vision. I'm not as big into the generative assets, the generative side of it. So it's all the things that help out with implementation. Like, somebody should have an idea and be able to.

**[15:58]** Mm-hmm.

**[15:59]** You know.

**[16:00]** And prototype that idea and iterate on that idea and that sort of thing. I just want to see more games, like more games coming up.

**[16:07]** That are actually good, right? Not just like.

**[16:10]** Garbage that, like, people just came out with. But in order to get more games, we need more people releasing their first game.

**[16:17]** And then releasing their second game, and like this sort of process gets you there faster. So I'm hoping more people start sticking.

**[16:24]** And you know.

**[16:25]** sticking with it because it takes years to get

**[16:28]** good at this sort of stuff.

**[17:00]** Yeah.

**[17:18]** Yeah, I've seen firsthand what happens when a studio just gets stuck and just keeps trying to iterate on the same thing over and over again. And on the more macro level, it's even more damaging, right? Because it's not just you wasting time, it's like.

**[17:31]** Hundreds of people wasting time working on something that nobody's validated and nobody's done anything with. So I think this sort of rapid prototyping is just really important because, like, you need to figure out what works and what doesn't.

**[17:43]** No amount of just thinking about it is going to do that. I mean, everybody thought Concorde was going to be amazing.

**[17:48]** Everybody thought Marathon was going to make a trillion dollars, right?

**[17:51]** But

**[17:52]** They didn't validate either of those with like actual users. They didn't have a way of validating that sort of thing.

**[17:58]** They just kept dumping money into it. So doing these sort of rapid prototyping is just going to help you scale.

**[18:33]** Yeah, and I think on top of that, like especially for your game, once you get it to the state where you feel like it's fun and you've worked out all the systems, that's when it gets easier to work it into Unreal, because you have a really firm definition of like,

**[18:45]** what everything needs to do, how it needs to interact with each other, like what's important, what's not important.

**[18:50]** You know where to focus your time, you know. It's not going to make it so that you can make the perfect unreal version the same way that you made the phaser version, where you just do one iteration and

**[19:00]** 30 minutes later, it works, right? But it could cut down, you know, a month's worth of work to a week's worth of work instead of a month.

**[19:06]** So it's all about those savings and the multiplication rather than fully replacing. I don't think anybody really feels like it replaces people anymore.

**[19:16]** Mm-hmm.

**[19:25]** Yeah, definitely.

**[19:37]** Yeah, no problem. And I look forward to seeing what you come out with. I think you've got

**[19:42]** You know, you've got a reasonable scope.

**[19:44]** your game. So I feel like you're gonna be able to complete something pretty solid.

**[19:48]** Yeah, I can't wait to see it. And yeah, I'll see you in class later.

**[19:53]** 'Kay.

**[19:53]** Yeah.