---
doc: prd
status: approved
---

# Mydobby — Product Requirements Document

Mydobby is a calm, pastel web app that helps overwhelmed people convert chaotic thoughts into one realistic next action and reflect upon their personal growth through future-self letters and 3D messengers.

Source: `scope.md > The Unique Kernel`, `scope.md > Who It's For`.

## The Core Journey
1. **Arrival**: User arrives at the calm landing view with pastel sky gradients and an intro to the Ikigai rhythm ("Notice → Choose → Rest → Return").
2. **Mind Dump**: User types whatever thoughts, anxieties, tasks, or projects are crowding their mind. Quick-fill examples are available to jump-start reflection.
3. **Capacity Budget**: User specifies their honest bandwidth: Time (`10 min`, `20 min`, `45 min`, `1 hour+`) and Energy (`low`, `medium`, `high`).
4. **Anchor Goal (Optional)**: User can enter an overarching goal or choose to skip without judgment.
5. **Small Step Recommendation**: AI filters the inputs to generate exactly ONE high-impact, realistic next step, along with an empathetic explanation of priority, current emotional load, and container plan.
6. **Action Resolution**: User returns and records their outcome ("I did it", "Partially", "Changed plan", "Skip for now"). Confetti provides micro-celebration.
7. **Letter Ceremony**: User triggers milestone or monthly future-self letters written by Mydobby's reflective AI engine, styled in a parchment wax-sealed modal.
8. **Sanctuary & 3D Companion**: User explores their chosen animal companion (Owl, Raven, Phoenix, Fox, Hummingbird) in a responsive real-time 3D orbit environment.
9. **Account & Cloud Persistence**: User creates an account or logs in with Supabase to sync their profile, check-ins, and letters with strict Row Level Security.

## Screens and Layout
- **Welcome / Landing**: Hero invitation with Ikigai intro cards.
- **Intro 1 & 2**: Two guided cards explaining the Ikigai philosophy ("What you love, what you are good at, what the world needs, what you can do").
- **Mind Dump Screen**: Spacious, distraction-free card with responsive textarea and sample prompts.
- **Energy & Time Screen**: Clean pill selectors for time and energy with active pastel highlighting.
- **Goal Selection Screen**: Low-friction input with "Use this goal" or "Skip for now".
- **Recommended Step Screen**: Hero recommendation card with AI model badge, three contextual breakdown cards (Priority, Current work, Plan), and four outcome action buttons.
- **Progress & Letter Archive Screen**: 3D companion perch, messenger selector, action history cards, and the collection of future-self letters.
- **Parchment Ceremony Modal**: High-fidelity modal with wax seal animation, poetic letter body, and one-click copy.
- **3D Messenger Sanctuary**: Fullscreen interactive Three.js 3D viewport with orbit controls and companion selector.
- **Cloud & Account Modal**: Supabase diagnostic connection testing, authentication tabs (Sign In / Create Account), user ID display, and manual cloud sync button.

## Look and Feel
- **Color Palette**:
  - Background: Radial sky gradient (`#fffdfd` to `#f9f2ff` to `#edf9f3` to `#fff6eb`)
  - Accent Lavender: `#e9dcff`
  - Accent Mint: `#dff4e8`
  - Accent Cream / Amber: `#fff6e8`
  - Deep Eggplant Typography: `#2d2638` and `#3f384a`
- **Typography**: Clean humanist sans-serif with serif parchment letter typography for emotional resonance.
- **Physics & Motion**: Soft float animations (`animate-float-slow`), gentle letter reveal slides (`animate-letter-reveal`), and wax-seal pops (`animate-seal`).
- **3D Graphics**: Interactive Three.js WebGL rendering with procedural geometry, soft ambient and point lighting, and smooth orbit damping.

## Features and Behavior

### AI Next-Step Engine
- Accepts mind dump, time block, energy level, and optional goal.
- Sends structured prompt to Groq API (Qwen 3.8 / LLaMA 3.3 models) with JSON mode.
- Built-in graceful heuristic fallback ensuring 100% uptime even if API keys or network are offline.

### Progress Tracking
- User updates status with one tap.
- Instant feedback with custom pastel confetti.
- Automatically pushes new rows to Supabase `check_ins` table with user ID when logged in.

### Future-Self Letters
- Generates 3-4 paragraph letters written from the compassionate viewpoint of the user's future self.
- Infuses the selected messenger motif (e.g. Owl for stillness, Phoenix for renewal, Fox for clever adaptability).
- Automatically persists to Supabase `letters` table.

### Supabase Cloud Synchronization
- Authenticates users via Supabase Auth (email/password).
- Enforces Row Level Security (RLS) on all tables so users only access their own data.
- Automatically handles email registration with "Confirm email" disabled.
- Displays transparent error messages on any sync or network disruption.

## States and Boundaries
- **Guest State**: Operates fully in browser `localStorage`. No forced login or paywalls.
- **Authenticated State**: Fetches and pushes data to Supabase `profiles`, `check_ins`, and `letters`.
- **Offline / Degraded State**: AI endpoints smoothly degrade to deterministic local Ikigai heuristics without crashing.
- **Error State**: Displays a dismissible top-level banner with exact database error codes for easy debugging.

## What We're Building
A fully functional, single-page application built on Next.js 16 with App Router, Tailwind CSS v4, Three.js 3D rendering, Groq LLM API routes, and Supabase PostgreSQL with RLS.
