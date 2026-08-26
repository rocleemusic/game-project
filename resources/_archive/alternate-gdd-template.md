Space Junk Cleanup
## Game Design Document — Capstone First Draft

<!--
  SUBMISSION CHECKLIST (delete before export):
  [ ] All four required sections present: Executive Summary, Game Mechanics,
      AI Architecture, Technical Strategy
  [ ] Game is named, with a stated win condition AND loss condition
  [ ] Every agent is named with a one-sentence plain-English role
  [ ] At least one technical constraint is named and explained
  [ ] Token budget included, with numbers a grader would find plausible
  [ ] Every mechanic described as what the PLAYER sees/does, not what the system computes
  [ ] Exported to PDF
<--

## 1. Executive Summary


### The Game


### The Core Loop



### Win & Loss Conditions


## 2. Game Mechanics


### 2.1 Player Actions
*Enumerate the player's verbs — the complete set of things they can actually do. For each: the input, what happens on screen, and what decision it lets the player make.*

| Verb | Input | What the player sees | The decision it enables |
|---|---|---|---|
| | | | |

### 2.2 Moment-to-Moment Play
*Narrate a representative 2–3 minutes of gameplay as the player experiences it. This is where the grader learns what your game feels like. Use your actual mechanics by name.*

### 2.3 Systems as the Player Meets Them
*One short subsection per major system, described strictly through its player-facing behavior. Name the key numbers the player would notice (speeds, limits, ranges) — but frame them as experience ("the lasso reaches about half a screen") backed by the value.*

#### 2.3.X [System Name]
**What the player experiences:**
**The rules as the player learns them:**
**Key values:**

### 2.4 Progression, Failure & Recovery
*How the game escalates across a session, what failure looks like moment to moment, and how the player recovers. Connect this back to the win/loss conditions in Section 1.*

---

## 3. AI Architecture

*Your agent roster. Each agent gets a name and ONE plain-English sentence stating its development role — then a description of its effect on gameplay: what the player ends up seeing because this agent exists. Abstract coordination vocabulary (orchestration, delegation, consensus) is allowed only where it explains something specific about THESE agents on THIS game — if a sentence would survive being pasted into a classmate's GDD unchanged, cut or ground it.*

### 3.1 Agent Roster

*Repeat this block per agent. Keep the roster honest — a small roster with crisp roles scores better than an impressive-sounding org chart.*

#### Agent: [NAME]
- **Role (one sentence, plain English):**
- **What it produces:** *(code, assets, tests, specs — the concrete artifacts)*
- **Gameplay effect:** *(what the player sees/feels in the shipped game because this agent did its job — the rubric's "described through its effect on gameplay")*
- **What it does NOT do:** *(the boundary that keeps it from overlapping its neighbors)*

### 3.2 How the Agents Work Together
*Describe the handoffs concretely: what artifact passes from which agent to which, in what order, and what happens when an agent's output fails downstream. A short diagram or numbered flow is fine. Every coordination claim should name specific agents and specific artifacts from 3.1.*

### 3.3 The Human in the Loop
*What you personally verify, and why an agent can't. (Feel, fun, and visual judgment are the usual honest answers.) Name the specific checkpoints where your sign-off gates the pipeline.*

---

## 4. Technical Strategy

*Feasibility is the rubric criterion here: a grader should finish this section believing you can ship this in a semester.*

### 4.1 Stack & Scope
- **Engine / language / key tools:**
- **Semester scope (what ships):** *(Tie to specific mechanics from Section 2 — the shippable subset)*
- **Explicitly deferred:** *(What you're NOT building this semester. Cutting visibly is a feasibility argument.)*

### 4.2 Agent Roles in the Build Plan
*Map the roster from 3.1 onto the development timeline: which agents are active in which phase, and what each phase delivers. A simple phase table beats prose here.*

| Phase | Weeks | Active agents | Deliverable | Verified by |
|---|---|---|---|---|
| | | | | |

### 4.3 Token Budget
*Real numbers, shown with their arithmetic. Plausible and modest beats impressive. State your assumptions so a grader can check your math.*

- **Model(s) and access:** *(plan/API tier)*
- **Estimated tokens per session:** *(input + output, with a sentence on what a "session" is)*
- **Sessions per week:** ×
- **Weeks:** ×
- **Total estimate:** ≈
- **Buffer / overrun plan:** *(what you cut or compress if you hit the ceiling)*

### 4.4 Constraints
*At least one constraint, named and explained — required. For each: the constraint, why it exists, and the design or pipeline decision you made because of it. Constraints you've personally hit are the most credible.*

#### Constraint: [NAME]
- **What it is:**
- **Why it binds:**
- **What we do about it:**

### 4.5 Risks
*Optional but strengthens feasibility: the 2–3 most likely ways this slips, each with a mitigation. Keep it short.*

---

## Appendix (optional)

*Open questions, references, or a decision log — anything useful to you that the rubric doesn't require. Keep the required sections self-contained; a grader should never need the appendix.*


