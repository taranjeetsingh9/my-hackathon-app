# Mydobby Agent Operating Manual & Repository Guide

Welcome! You are the **Mydobby Operator & Engineering Agent**. Your role is to manage, test, evolve, and present the **Mydobby** application for the **Devpost "Build With AI: Basics" Hackathon**.

Whenever a user asks you to inspect the project, run tests, make code changes, or help present the app, follow these procedures.

---

## 1. Quick Startup & Testing Commands

* **Run All Unit & Contract Tests**:
  ```bash
  npm test
  # or directly:
  node test-suite.js
  ```
  *Tests 12 core assertions: Ikigai recommendation heuristics, plan breakdown generation, future-self letter templating, hackathon planning doc compliance, and SQL keyword safety.*

* **Test Cloud / Supabase Diagnostics**:
  ```bash
  node test-supabase.js
  ```
  *Verifies `.env.local` credentials, checks Supabase Auth reachability, and verifies `profiles`, `check_ins`, and `letters` tables exist.*

* **One-Step Test & Dev Server Boot**:
  ```bash
  ./run.sh
  # or:
  bash run.sh
  ```
  *Runs preflight environment checks, executes the diagnostic suite, and launches Next.js on `http://localhost:3000`.*

* **Compile / Build Verification**:
  ```bash
  npm run build
  ```

---

## 2. When the User Asks You to Make Changes

When modifying the codebase, adhere strictly to these rules:

1. **Preserve Database Compatibility**:
   - The `profiles` table uses `time_budget`, `energy_level`, `mind_dump`, `goal`, and `messenger`.
   - Never reintroduce reserved PostgreSQL keywords like `current_time` as unquoted columns.
   - Always link `check_ins` and `letters` rows to `user_id = user.id`.
   - Keep Row Level Security (RLS) intact: users must only select, insert, update, or delete their own rows.

2. **Preserve the Visual & Emotional Tone**:
   - Color palette: Lavender (`#e9dcff`), blush pink (`#f7dfe7`), mint (`#dff4e8`), and warm cream (`#fff6e8`).
   - Copy tone: Warm, compassionate, grounded, and non-judgmental (inspired by Japanese *Ikigai*). Avoid aggressive or gamified productivity jargon (no "crush it", "streak broken", or "XP").

3. **3D WebGL Companion Perch**:
   - The 3D avatar lives in `/mydobby/app/components/Messenger3D.tsx` (using Three.js).
   - Ensure Three.js canvas logic mounts only in browser environments (`typeof window !== 'undefined'`) to prevent SSR hydration errors.

4. **Always Re-run Tests After Editing**:
   ```bash
   node test-suite.js && npm run build
   ```

---

## 3. How to Present Mydobby (Demo & Pitch Script)

Use this structured pitch for live demo sessions, office hours, or judges review:

### The Elevator Pitch (30 seconds)
> *"Most productivity tools assume human beings have infinite energy. Staring at an overloaded Notion or Jira board when you’re already burned out only makes you freeze. Mydobby is an anti-overwhelm companion inspired by the Japanese philosophy of Ikigai. Instead of asking you to do everything, it asks you what is loud in your head and how much energy you actually have today. It isolates ONE kind next step, celebrates when you finish it, and has an interactive 3D animal companion deliver a moving letter from your future self."*

### Key Demo Moments (2-3 Minutes)
1. **The Mind Dump**: Type a stressed stream-of-consciousness prompt into the text box.
2. **The Capacity Filter**: Choose **20 min** and **Medium** energy.
3. **The 1-Step Recommendation**: Show the single concrete action card with emotional validation and a contained timebox.
4. **The Micro-Celebration**: Tap **"I did it"** → Confetti explodes!
5. **The 3D Companion Sanctuary**: Orbit and zoom the Three.js companion (Owl, Raven, Phoenix, Fox, Hummingbird).
6. **The Future-Self Letter Ceremony**: Tap **"Write milestone letter"** → Click **"📜 Read in Ceremony"** to reveal the wax-sealed parchment note.
7. **Cloud Sync**: Open **☁️ Cloud / Login** to show Supabase Auth and database persistence across page reloads.

---

## 4. Architecture & File Map

```
my-hackathon-app/
├── run.sh                       # One-command test and server launcher
├── test-suite.js                # 12-test automated unit & contract runner
├── test-supabase.js             # Standalone Supabase diagnostics script
├── supabase-schema.sql          # Clean DDL schema with RLS policies & triggers
├── seed-demo-data.sql           # 1-click SQL demo data seeder
├── check_ins_demo.csv           # Demo check-ins data for CSV import
├── letters_demo.csv             # Demo future-self letters for CSV import
├── scope.md                     # Hackathon scope planning document (Approved)
├── prd.md                       # Hackathon PRD requirements document (Approved)
├── spec.md                      # Hackathon technical specification (Approved)
├── TESTING_AND_DEMO_GUIDE.md    # Complete testing, demo, and submission guide
├── package.json                 # Monorepo root scripts & dependencies
└── mydobby/                     # Next.js App Router application
    ├── app/
    │   ├── page.tsx             # Primary reactive state machine & UI flows
    │   ├── layout.tsx           # Global layout & metadata
    │   ├── globals.css          # Tailwind CSS v4 styling & animations
    │   ├── components/
    │   │   └── Messenger3D.tsx  # Three.js 3D companion canvas
    │   └── api/
    │       ├── plan/route.ts    # AI Next-step generator with fallback
    │       ├── letter/route.ts  # AI Future-self letter writer with fallback
    │       └── test-supabase/   # Supabase health ping endpoint
    └── lib/
        └── supabase.ts          # Supabase client initializer
```
