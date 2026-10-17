# MVP Specification

## Product goal
Build a small but memorable app that helps busy people reduce overwhelm by turning mental clutter into one meaningful next step and then reflecting back on progress through a future-self letter.

## Core user flow
1. User opens the app.
2. User writes or speaks what is on their mind.
3. User enters available time and energy.
4. Optional: user picks or creates a goal after enough context.
5. AI suggests one small action.
6. User confirms completion, partial completion, or changed plan.
7. The app updates the progress history.
8. After several meaningful actions or a monthly cycle, the app generates a future-self letter.

## User stories
### As a busy user
- I want to dump my thoughts quickly without a long form.
- I want an app that understands my current energy and time budget.
- I want one useful next step instead of a giant to-do list.
- I want my progress to feel meaningful.
- I want a future-self letter that reflects what I actually did.

### As a user with no clear goal yet
- I want the app to help me feel unstuck without forcing a formal goal too early.
- I want the process to feel gentle and not overwhelming.

## Functional requirements
### 1. Mind dump
- User can enter freeform text.
- Optionally, user can speak their thoughts.
- AI summarization of the main themes and stress points.

### 2. Goal handling
- Goal selection is optional.
- Goals may be added later after a few check-ins.
- If no goal is selected, app still supports general “next step” suggestions.

### 3. Time and energy state
- Time options: short, medium, long blocks
- Energy options: low, medium, high
- Mental load or overwhelm level: optional but helpful

### 4. Small action recommendation
- AI produces a single concrete next action.
- Action must be small and achievable.
- The app should prefer realistic action size over broad planning.

### 5. Progress update
- User can mark action as complete, partial, or changed.
- AI evaluates the update and adjusts the upcoming next step if needed.
- User should not have to manually maintain an elaborate checklist.

### 6. Letter generation
- Trigger monthly letter and milestone letter.
- Letter should be grounded in actual progress and user context.
- Content should sound personal, reflective, and warm.

### 7. Optional journaling
- Simple journaling prompt for reflection.
- Journal entries can inform future letters.

### 8. History log
- Keep a minimal log of actions, completions, and generated letters.
- No detailed analytics required in MVP.

## Non-functional requirements
- simple and calm UI
- fast interaction
- clear language and minimal friction
- AI prompts should prioritize actionability and emotional tone

## Technical stack recommendation
### Frontend
- Next.js
- TypeScript
- Tailwind CSS

### Backend
- Next.js API routes or server actions
- SQLite for the MVP

### AI integration
- OpenAI API or equivalent
- Prompt-based generation for:
  - thought summarization
  - next-step recommendation
  - progress judgment
  - future-self letter generation

## MVP milestone split
### Weekend 1
- onboarding and app shell
- mind dump entry
- time + energy form
- optional goal selection
- AI next-step recommendation
- completion tracking
- persistence

### Weekend 2
- letter generation
- monthly + milestone letter logic
- messenger theme selection
- optional journal
- UI refinements and testing

## Success definition
MVP is successful if a user can:
- input what is on their mind
- get a meaningful next action
- update progress with minimal effort
- receive a future-self letter based on their real actions

This would validate the core product idea and the differentiator.
