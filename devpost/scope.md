---
doc: scope
status: approved
---

# Kokoro

A calm, pastel companion web app that transforms mental overwhelm into one kind, realistic next action and returns your progress as heartfelt future-self reflection letters delivered by interactive 3D animal messengers.

## The Unique Kernel
Instead of another demanding productivity checklist or overwhelming to-do board, Kokoro acts as an anti-overwhelm container inspired by the Japanese philosophy of **Ikigai**. It takes an unedited stream of thoughts ("mind dump"), filters it through the user's *actual current energy* and *available time budget*, isolates **only ONE visible, doable next step**, and turns real completed steps into poignant letters from your future self delivered by 3D companions.

## Who It's For
The overwhelmed knowledge worker, student, developer, or creator who is staring at a paralyzing mountain of tasks, feeling behind, and exhausted. Today they either freeze, doomscroll, or open complex project management tools (Notion, Jira, Todoist) that only heighten their guilt.

## The Core Loop
1. **Open & Dump**: User enters what's loud in their head without structure.
2. **Capacity Check**: User selects available time (10 min to 1 hr+) and energy (low, medium, high).
3. **Receive 1 Step**: AI recommends exactly one gentle, achievable next action.
4. **Take Action & Update**: User completes it (or marks partial/changed) with celebratory confetti.
5. **Future-Self Ceremony**: A 3D messenger (Owl, Raven, Phoenix, Fox, Hummingbird) delivers a deeply personal letter reflecting on their real courage and quiet momentum.

## Inspiration & Identity
- **Aesthetic**: Soft pastel gradients (lavender `#e9dcff`, blush pink `#f7dfe7`, mint `#dff4e8`, warm cream `#fff6e8`), rounded organic glass cards, storybook typography.
- **Philosophy**: Ikigai ("reason for being" — finding what you love, what you can do, and what brings quiet meaning without burnout).
- **Tone**: Warm, grounded, compassionate, and reassuring. Not toxic positivity; real emotional safety.
- **Visual Centerpiece**: Real-time 3D messenger perch with orbit controls and a dedicated fullscreen sanctuary.

## Why This Matters to the Learner
During hackathons and intense projects, burnout happens when everything feels urgent. We wanted to build something that honors our human limits, proves that small steady steps change lives, and makes AI feel like a gentle friend rather than an automated supervisor.

## What "Working" Looks Like
A user types a stressed mind dump, chooses 20 minutes and medium energy, immediately gets a single high-clarity next step, marks it "I did it", receives an AI-authored letter from their future self acknowledging that specific victory, views it in a wax-sealed parchment ceremony, and sees all their progress saved seamlessly to cloud storage.

## The POC Boundary
- **In**:
  - Interactive onboarding explaining Ikigai principles.
  - Mind dump text input with quick sample triggers.
  - Time and energy capacity selectors.
  - Optional goal setting with smart skip.
  - Real-time Next.js API route integrating Groq AI (with robust deterministic fallback heuristics).
  - Progress updates ("I did it", "Partially", "Changed plan", "Skip for now") with confetti.
  - Letter generation engine (milestone & monthly) grounded in user history.
  - Real-time Three.js 3D messenger canvas with 5 distinct animal models.
  - Wax-seal parchment reading ceremony with clipboard copy.
  - Supabase Cloud authentication and PostgreSQL persistence with Row Level Security (RLS).
  - Diagnostic connection tester & live error banner.
- **Later**: Voice speech-to-text input, scheduled push notifications, daily recurring email delivery, audio letter narrator.
- **Explicitly Cut**: Complex kanban boards, multi-project task hierarchies, social feeds, and gamified streaks (to prevent productivity anxiety).
