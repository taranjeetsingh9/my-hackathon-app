---
name: 9-db-supabase
description: "Design and implement the database layer for Mydobby: store user history, saved check-ins, letters, and app state safely in Supabase without exposing secrets in browser code."
---
# 9-db-supabase — Store user history and letters safely

Use this skill when the app needs a real database layer for saved check-ins, user history, goals, and generated letters.

## Goal

Implement a small, safe Supabase-based data layer that stores:
- user profile data
- each check-in record
- goal and time/energy metadata
- generated letters
- history that can be used to build future-self letters

Keep the project secure and simple: never put secrets in browser code or public GitHub files.

## Architecture to prefer

Use a backend-first pattern in Next.js:
- browser UI sends data to a Next.js route or server action
- server reads Supabase credentials from environment variables
- Supabase handles persistence and retrieval
- frontend only receives the data it needs

Do not use `NEXT_PUBLIC_*` for secrets. Only public keys should go in `NEXT_PUBLIC_*` if truly required, and never database credentials or service role secrets.

## Recommended schema

Create a small table set such as:

### `profiles`
- `id` uuid primary key
- `name`
- `created_at`
- `updated_at`
- `favorite_messenger`
- `icon`

### `checkins`
- `id` uuid primary key
- `user_id` uuid reference
- `created_at`
- `mind_dump` text
- `time_choice` text
- `energy_choice` text
- `goal` text
- `ai_summary` text
- `ai_action` text
- `status` text
- `source` text default `'demo'` or `'ai'`

### `letters`
- `id` uuid primary key
- `user_id` uuid reference
- `created_at`
- `type` text (`monthly` or `milestone`)
- `title` text
- `body` text
- `summary` text

## Data rules

- Every check-in should be stored as an individual record.
- Every letter should be tied to the user and generated from actual check-in history.
- Store enough metadata to generate future letters without reprocessing the whole app state.
- Keep the first version serverless and lightweight: no complex auth, no multi-tenant logic, no heavy analytics.

## Security rules

- Use environment variables only on the server.
- Add `.env.example` with placeholders and no real secrets.
- Never expose the service role key in the browser.
- Do not commit real `.env` files.
- If the app must run without Supabase in local dev, keep a local demo fallback path that mimics the same JSON structure.

## Implementation steps

1. Set up Supabase project and create the tables.
2. Add `.env.example` with values like:
   - `SUPABASE_URL`
   - `SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Create a server utility file for Supabase client creation.
4. Create API routes for:
   - creating a check-in
   - fetching user history
   - creating a letter
   - fetching letters
5. Use the browser only to submit user data; database access stays server-side.
6. Keep the app compatible with the current local-first MVP by allowing localStorage fallback when no DB is configured.

## Output expected

Provide a concise implementation plan with:
- table schema
- environment variables
- API route list
- server helper file
- fallback behavior when database is unavailable
- any migration or seed notes needed for the project

## Important

The product should feel personal, not like a generic data entry app. The database is only there to preserve the history of the user’s check-ins and letters so the future-self feature feels honest and real.
