# Spec

## Tech
- Next.js 16 app-router app
- TypeScript
- React
- Supabase for persistence
- AI provider fallback for plan and letter generation
- Seeded demo data for testing and screenshot-ready output

## Routes and modules
- app/page.tsx: main UI and user flow
- app/api/plan/route.ts: plan generation
- app/api/checkins/route.ts: profile and history persistence
- app/api/letter/route.ts: future-self letter generation
- app/api/letters/route.ts: letter storage
- lib/demo-data.ts: realistic demo history and letter content
- lib/checkin-utils.ts: status normalization and count logic
- supabase/schema.sql: database schema and policies

## UX flow
- Welcome / intro screens
- Mind dump entry
- Time + energy choice
- Goal or profile refinement
- Step recommendation screen
- Check-in history update
- Letter archive and view

## Data model
- Profile: display_name, avatar, letter_messenger
- Check-ins: profile_id, time_available, energy_level, mind_dump, goal, summary
- Check-in history: check_in_id, status, action_label, details
- Letters: profile_id, type, title, summary, body

## UI rules
- Keep wording gentle and non-technical
- Use realistic future-self letter tone
- Show early monthly note language before a full month has passed
- Keep AI suggestions grounded in the user’s actual text and progress
