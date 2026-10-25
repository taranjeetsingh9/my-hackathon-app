# Mydobby Supabase schema

This folder contains the database schema for the app.

## Files

- `schema.sql` — creates the tables, indexes, triggers, and policies.

## How to use

1. Open your Supabase project.
2. Go to SQL Editor.
3. Paste the contents of `schema.sql`.
4. Run the query.

## What this schema supports

- profiles
- daily or session check-ins
- short progress history items
- future-self letters (monthly and milestone)

This is designed to match the current Mydobby flow: a user writes what is on their mind, picks a goal and energy, reviews progress, and receives a reflective letter.

## Notes

The current app is built without authentication, so the SQL uses open policies for quick local testing. For production, tighten these policies and add proper auth ownership checks.
