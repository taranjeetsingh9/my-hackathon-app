---
name: 10-fullstack-nextjs
description: "Act as a full-stack Next.js engineer for Mydobby: implement the app flow, API routes, data access, UI polish, and safe architecture for a small local-first product with real backend support."
---
# 10-fullstack-nextjs — Full-stack app implementation for Mydobby

Use this skill when building or extending the product as a real web app with both frontend UI and backend data flow.

## Goal

Implement a small, working full-stack Next.js app for Mydobby with:
- calm, user-friendly frontend screens
- a clear check-in flow
- backend API routes for planning and letters
- safe database access
- local-first demo fallback
- minimal but correct architecture for a hackathon MVP

## Core responsibilities

### Frontend
- build the welcome, onboarding, check-in, goal, and history screens
- keep the UI human, warm, and calm
- store local state in the browser when needed
- use clean TypeScript types for user flow data
- keep the app simple and easy to demo

### Backend
- expose API routes under `app/api/`
- accept JSON from the frontend
- process user context and generate a recommendation or letter
- use environment variables for secrets
- call Supabase or any other database layer securely

### Data flow
- user types their thoughts in the UI
- frontend sends data to the backend
- backend combines user inputs with AI or rule-based logic
- backend stores or returns data
- UI renders summary, history, and letter output

## Preferred stack

- Next.js App Router
- TypeScript
- React
- Tailwind CSS
- Supabase for persistence
- localStorage fallback for offline or demo mode

## Best practice rules

- Keep the app route-based and simple.
- Do not expose secrets in public frontend code.
- Keep the AI logic behind a server route, not in the browser.
- Prefer small, testable API handlers instead of giant monolithic files.
- Keep the data contract clear: user input in, structured result out.
- Build the MVP around real product value instead of over-engineering.

## Recommended app structure

```text
app/
  api/
    plan/route.ts
    letter/route.ts
  page.tsx
  globals.css
lib/
  supabase.ts
  types.ts
```

## Recommended request contract

For the check-in route, send:
- `mindDump`
- `goal`
- `time`
- `energy`

For the letter route, send:
- `type`
- `mindDump`
- `goal`
- `messenger`
- `history`

Return responses shaped like:
- `nextStep`
- `why`
- `priority`
- `currentLoad`
- `plan`
- `source`

For letters:
- `title`
- `body`
- `summary`

## Implementation priorities

1. Frontend screens and state flow
2. Data model and localStorage persistence
3. API routes
4. Supabase integration and schema
5. Letter generation from check-in history
6. Final UX polish and demo flow

## Fallback behavior

When no API key or DB is configured, the app should still work with a demo fallback so the product remains demonstrable.

This fallback should:
- feel human and useful
- produce realistic next-step suggestions
- produce realistic future-self letters
- not depend on secret keys or a live service

## Output expected

Provide a practical implementation summary that includes:
- screen flow
- data model
- API endpoints
- environment setup
- DB integration plan
- demo fallback strategy
- next technical milestones

## Important

This is a humble product MVP, not a giant platform. The goal is to finish a useful, believable app in a short timeframe with good UX and clear logic.
