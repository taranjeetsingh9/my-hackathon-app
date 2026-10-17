# Screen Flow and Responsive Website Plan

## Product direction
This is a responsive web app for busy people who feel overwhelmed. It helps them turn a messy stream of thoughts into one small next step and then reflects that progress in a future-self letter.

For MVP:
- no forced login
- local storage or browser persistence first
- auth can be added later if needed
- focus on clarity, calm UX, and fast interaction

---

## Design principles
- Mobile-first and lightweight
- Low-friction experiences
- One key action at a time
- Emphasize emotional calm over productivity pressure
- Keep the letter experience visually memorable
- Avoid a cluttered dashboard
- Use a pastel visual system inspired by gentle magic rather than corporate productivity design
- Keep the UI soft, warm, and welcoming without feeling childish or busy

## Visual language
App name: Mybee

Color direction:
- pastel lavender
- blush pink
- warm cream
- dusty sage
- soft butter yellow
- mint green
- gentle blue-grey

Mood:
- quiet magic
- soft wonder
- comforting and reflective
- reminiscent of a calm, storybook world rather than a professional dashboard

This should feel like a treasured personal note app, not a SaaS productivity tool.

---

## Responsive website layout

### Mobile-first structure
Use a single-column layout by default:
- Header / app name
- Main content card
- CTA buttons
- Sticky bottom action bar for primary actions
- Minimal navigation

### Tablet / desktop structure
Use a wider layout with:
- left sidebar for navigation and history
- central main content panel for active session
- right column for context or progress summary only when needed

### Layout by screen type
Most screens should follow this pattern:
- heading
- short explanation
- main interactive form or card
- bottom action row
- subtle secondary link or support text

A calm, breathable layout is more important than a dense dashboard.

---

## Screen-by-screen flow

### 1) Landing / Welcome screen
Purpose:
- start the experience gently
- explain the app in one sentence
- invite the user to start a check-in

Content:
- app name
- short tagline
- primary button: “Start my check-in”
- secondary button: “I’m not sure yet”

Text example:
> “Your thoughts are not a problem to solve all at once. Let’s find the next small step.”

Mobile behavior:
- quick entry point
- large CTA
- no login required

---

### 2) Mind dump screen
Purpose:
- capture what is on the user’s mind
- keep the interaction low-friction
- allow typing or speaking

UI:
- large text area
- placeholder: “What’s on your mind right now?”
- optional mic button for voice input
- small context hint: “You can write anything—stress, task, idea, worry, goal.”

Buttons:
- “Continue”
- “Save for later”

This should feel like a journal entry, not a form.

---

### 3) Energy + time screen
Purpose:
- gather the user’s actual capacity
- make the decision based on real availability

Fields:
- available time: 10 min / 20 min / 45 min / 1 hour+
- energy level: low / medium / high
- mental load: overwhelmed / busy / steady

UI style:
- simple segmented controls or chips
- visual clarity
authoritative but simple

Buttons:
- “Recommend my next step”
- “Back”

---

### 4) Optional goal selection screen
Purpose:
- let the user define a goal only when ready
- avoid forcing planning too early

Behavior:
- this screen appears only if the user wants to create a goal or if enough context has been built
- else, default into general support mode

Options:
- “Skip for now”
- “Choose a goal”
- “Let the app help me without a formal goal”

Goal examples:
- finish project
- build healthier routine
- improve focus
- prepare one important task

This page should not feel like a commitment form; it should feel like a gentle choice.

---

### 5) Next-step recommendation screen
Purpose:
- present one small action
- make it concrete and achievable

UI:
- card with title: “Your next small step”
- short explanation of why this fits their time and energy
- one clear action statement

Examples:
- “Write 3 bullet points for your first draft.”
- “Reply to the one email that matters most.”
- “Take a 10-minute walk and then note what feels different.”

Action controls:
- “I did it”
- “I partially did it”
- “I changed the plan”
- “I need a new step”

This is the primary action screen.

---

### 6) Progress update screen
Purpose:
- let the user update the action without heavy admin
- let AI evaluate whether the plan should change

UI:
- short prompt: “How did it go?”
- quick options
- optional text area for details

Options:
- completed
- partially completed
- changed my plan
- skipped for now

If the user says they changed the plan, the app can respond with:
- “Here’s a slightly better next step based on what happened.”

This is essential for the “AI updates the plan without the user doing admin work” model.

---

### 7) Letter dashboard / letter archive
Purpose:
- show ongoing history
- give access to generated future-self letters
- preserve the emotional core of the product

Sections:
- active goals
- recent actions
- letter archive
- monthly letter status
- milestone letter history

This page should feel less like analytics and more like personal reflection archive.

---

### 8) Monthly letter screen
Purpose:
- deliver a magical, story-like letter
- memorable brand moment

Visual treatment:
- warm gradient
- delicate motion or glow
- bird or animal messenger icon
- letter text in a large, readable style

Options:
- choose messenger: owl, raven, phoenix, fox, other bird/animal
- one-click “read again”
- “save to archive”

This is one of the hero moments of the app.

---

### 9) Milestone letter screen
Purpose:
- show a more grounded, personal letter from future self
- summarize actual actions and progress

Content:
- user’s actual actions
- what they overcame
- what they changed
- encouragement and reflection

Tone:
- personal, gentle, motivating
- no generic productivity cliché

This letter should be based on real evidence from recent interactions and progress logs.

---

### 10) Journal / reflection screen (optional)
Purpose:
- add optional reflective context
- help improve future letters with personality and nuance

Prompt examples:
- “What happened this week?”
- “What felt hard?”
- “What did you actually do that mattered?”

Keep it short and optional, not required for the MVP.

---

## Navigation model
For MVP, keep navigation simple:
- Home / check-in
- Today / active step
- Letters
- Archive
- Settings

On mobile:
- bottom nav with 4 simple tabs

On desktop:
- left sidebar or top bar

No need for complex nested navigation.

---

## State model and data flow
Minimal required data:
- user session info
- current thoughts / mind dump
- selected or optional goal
- time and energy state
- next recommended action
- action history
- letter history

Data approach for MVP:
- browser local storage for first version
- no login required
- later, move to database-backed auth if needed

This keeps the prototype simple and fast.

---

## MVP page priority
If we build in stages, priority should be:
1. Landing
2. Mind dump
3. Time + energy
4. Next-step recommendation
5. Progress update
6. Letter archive / generated letter
7. Optional journal
8. Goal selection refinement

---

## Minimal UX rules for success
- Never overwhelm the user with a big dashboard
- Always focus on one decision
- Keep every question short and relevant
- Use warm, calm language
- Every action should feel small but meaningful
- Letters should feel like a reward, not a report

---

## Final MVP product shape
The app should feel like a small, thoughtful web experience with three emotional phases:
1. dump the mind
2. take the next step
3. receive a letter from the future

That is the product identity.
