# Mydobby — AI Handoff / Demo Prep Guide

## 1. Project overview

Mydobby is a calm, no-login reflection and planning app for people who feel overwhelmed. The app helps users dump what is on their mind, choose how much time and energy they have, and receive one realistic next step instead of a long, intimidating to-do list.

The core idea is simple: reduce mental overload, choose one meaningful action, and create a sense of momentum without pressure.

## 2. Product narrative

### Problem
People are often not struggling because they are lazy or unmotivated. They are struggling because they have too many thoughts, too many tasks, and too little clarity. When someone feels overloaded, productivity tools often add more pressure instead of helping.

### Solution
Mydobby gives users a softer path:
- write what is loud in their mind
- choose available time and energy
- set or revisit a goal
- receive a realistic next step
- mark progress and review future-self reflections

The app is intentionally warm, minimal, and emotionally safe.

## 3. Product vision

Mydobby is a local-first MVP built to feel like a calm planning companion rather than a traditional productivity system.

It blends:
- journaling / mind dump
- task prioritization
- emotional reflection
- gentle planning support
- future-self letters

This is intended to feel human and supportive rather than robotic.

## 4. Current app status

### Working features
- welcome and onboarding flow
- profile setup with name and icon selection
- mind dump input
- time and energy selection
- goal selection
- AI-style recommendation card for the next step
- progress tracking and history
- milestone and monthly-letter generation
- demo fallback behavior when no external API is configured
- local-first persistence using browser storage

### Important implementation files
- mydobby/app/page.tsx — main app flow and UI
- mydobby/app/api/plan/route.ts — plan generation logic
- mydobby/app/api/checkins/route.ts — profile and history persistence
- mydobby/app/api/letter/route.ts — letter generation
- mydobby/lib/demo-data.ts — demo history, letters, and fallback planning logic
- mydobby/lib/checkin-utils.ts — status normalization and history logic
- mydobby/tests/checkin-utils.test.ts — regression tests for logic and status mapping
- mydobby/tests/ai-response.test.ts — tests for AI-response parsing
- mydobby/supabase/schema.sql — schema for future local/DB integration

### Verified status
- Test suite passed: 6 tests passed, 0 failed
- Production build is currently blocked by environment mismatch: local Node version is 18.17.0, but Next.js requires Node >= 20.9.0

This means the app is functionally strong and demo-ready, but it needs Node 20+ to do a full production build in this environment.

## 5. Demo-ready product flow

### Suggested user journey
1. User lands on welcome screen.
2. User enters a profile name and chooses a messenger/icon.
3. User writes a messy thought like: “I feel behind on work and I’m overwhelmed.”
4. User selects their available time and energy.
5. User sets a goal or leaves it blank.
6. App generates a calm recommendation for the next step.
7. User sees priorities and a realistic action plan.
8. User updates progress history.
9. User can generate a milestone letter or future-self monthly letter.

### Best demo input
Use a realistic, emotional but clear prompt such as:

“I feel behind on work and I’m overwhelmed. I only have 20 minutes and medium energy.”

This demonstrates the key value clearly:
- overload to clarity
- stress to a next step
- chaos to a realistic plan

## 6. Demo pitch script

### 30-second intro
“Hi everyone, we built Mydobby, a calm check-in app for people who feel overloaded and don’t know what to do next. It helps them turn messy thoughts into clear priorities and one realistic next step.”

### 30-second problem
“Most people are not struggling because they are lazy or unmotivated. They are struggling because there are too many thoughts, too many tasks, and not enough clarity.”

### 60-second product demo
“The app lets a user type anything they are feeling, choose how much time and energy they have, and set a goal. Then it gives them a simple overview of what to focus on, what to ignore for now, and what the next small step should be. The user can also track progress over time and later review reflective letters from a future self.”

### 30-second value statement
“This is not just another productivity app. It is a calmer system for decision-making, emotional clarity, and sustainable progress.”

## 7. Why this project matters

This project is built around the belief that people do not need more pressure—they need a better way to think clearly and take the next step.

The emotional angle is the differentiator:
- not just task management
- not just AI productivity
- but a supportive system for navigating overwhelm and attention

## 8. Key product differentiators

- warm and minimal UX
- no login required
- local-first and fast
- emotionally safe tone
- goal and progress tracking with reflection
- future-self letter concept

## 9. Risks and future improvements

### Current risks
- recommendation quality may feel generic without better prompt design
- UX could still be simplified further for a tighter demo
- letter output may need stronger narrative polish

### Future improvements
- real AI API integration (Gemini/OpenAI)
- richer analytics and trend summaries
- better editing of goals and progress items
- scheduling for monthly reflections
- export/share functionality
- stronger dashboard for ongoing history

## 10. Hackathon submission angle

Position Mydobby as:
- an emotional planning assistant
- a calmer alternative to productivity-driven systems
- a way to turn mental clutter into one realistic action

The strongest storyline is: “AI that helps you think, not just generate tasks.”

## 11. Repository status

Repository is currently on branch:
- feature-ui

Latest commit:
- bf73657 — MVP demo ready for hackathon

Remote repo:
- https://github.com/taranjeetsingh9/my-hackathon-app.git

## 12. Recommended next steps before final submission

1. Run the app locally on Node 20+.
2. Test the exact demo flow from onboarding to letters.
3. Keep the live demo under 2 minutes.
4. Focus on a realistic emotional example rather than a broad feature tour.
5. Prepare a tight presentation explaining the problem, product, and value.

## 13. Working notes for the next AI agent

- Keep the tone gentle and grounded.
- Do not over-claim medical or emotional certainty in generated letters.
- Preserve the emotional-first design language.
- Prioritize the user journey over feature breadth.
- When continuing work, start from the main app flow in mydobby/app/page.tsx and then the AI routes.
- If there is a choice between perfecting features and keeping the demo smooth, prefer the smoother demo flow.

## 14. One-line summary

Mydobby is a warm planning companion that turns overwhelm into clarity by helping users choose one realistic next step and reflect on their progress over time.
