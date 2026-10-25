# Mydobby AI handoff file

## Project summary
Mydobby is a warm, no-login reflection app. The user writes what feels loud in their mind, chooses their available time and energy, receives one realistic next action, marks progress, and later reviews monthly or milestone letters from a future self.

## Current status
- Core product flow is working: onboarding, mind dump, plan generation, check-in save, and letter archive.
- Realistic demo history and letters are seeded so the app demonstrates polished output even before a real user profile exists.
- AI goal updates are surfaced as a gentle suggestion based on user text and completed check-ins.
- Regression tests pass and the project builds successfully.

## Important files
- app/page.tsx — main app flow and UI
- app/api/plan/route.ts — structured plan generation
- app/api/checkins/route.ts — profile and history persistence
- app/api/letter/route.ts — letter generation with fallback logic
- lib/demo-data.ts — demo letters/history and AI goal refinement helper
- lib/checkin-utils.ts — status normalization and count logic
- supabase/schema.sql — database tables and policies
- tests/checkin-utils.test.ts — status and letter/goal logic regression coverage

## Commands
- Install deps: npm install
- Run dev server: npm run dev
- Run tests: npx tsx --test tests/*.test.ts
- Production build: npm run build

## Notes for another AI agent
- The app is intentionally soft and minimal; keep the tone gentle and grounded.
- When a user has no saved profile, the app seeds demo data so the app looks complete in a live demo.
- Monthly letters should be framed as an early monthly note until enough time has passed.
- Do not over-claim medical or emotional certainty in generated letters; personal, grounded language is better than advice-heavy language.
- If you need to continue work, start from the app/page.tsx screen flow and the AI routes before editing deeper logic.

## Honest assessment
This is a strong proof-of-concept and a good hackathon submission for a 1-day build. It is not yet a product that would guarantee first place without a strong demo video, a crisp narrative, and final polish. The current project is competitive and demo-ready, especially if the demo focuses on the calm UX, realistic letter output, and emotional goal support.

## Recommended next move
- Make a crisp 2-minute demo reel showing the real journey end-to-end.
- Trim any unused or extra UI clutter.
- Double-check the final wording in the letters and step recommendations so the demo feels premium, not experimental.
- If you want to improve odds, emphasize the “AI helps you think, not just generate code” story in the pitch.

## Warning
The app uses Supabase and the warning from @supabase/supabase-js recommends Node 22+, though the app still builds successfully on the current environment. If you run into environment issues, prefer Node 22 for the cleanest local setup.
