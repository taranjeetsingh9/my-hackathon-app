# Mydobby

Mydobby is a gentle, local-first personal companion for overwhelmed days. It helps users unload what's on their mind, check their real energy and time, and turn that into one small, meaningful next step.

The experience is designed to feel calm, warm, and supportive rather than productivity-driven. It blends journaling, reflection, and a lightweight AI-like planning assistant into one approachable flow.

## Why this app exists

A lot of people do not need more pressure—they need a softer way to think clearly.

Mydobby helps users:
- dump thoughts and worry without judgment
- notice how much time and energy they actually have
- choose one goal or focus area
- get a gentle next action that fits the day
- reflect on progress and future-self letters

## Core features

- No login required
- Pastel, friendly onboarding flow
- Mind-dump journaling experience
- Time and energy check-in
- Goal selection with optional skip
- AI-style recommendation card for the next small step
- Progress tracking and reflective history
- Monthly and milestone future-self letters
- Local-first persistence using browser storage
- Demo fallback responses when no API key is available

## Tech stack

- Next.js 16
- React 19
- TypeScript
- Tailwind CSS

## Project structure

```text
my-hackathon-app/
├── mydobby/
│   ├── app/
│   ├── public/
│   ├── package.json
│   ├── tsconfig.json
│   └── next.config.ts
├── agent/
├── devpost/
├── .gitignore
├── skills-lock.json
└── README.md
```

## Running locally

Use Node 20.

```bash
cd /Users/taranjeetsingh/Desktop/Hackathons/my-hackathon-app/mydobby
nvm use 20
npm install
npm run dev
```

Then open:

```text
http://localhost:3000
```

## Demo AI behavior

This project is built for a hackathon MVP and does not require Gemini or OpenAI keys to run. If no API key is configured, the app falls back to a thoughtful demo plan and letter output so the experience still feels real and usable.

## Notes

This app is intentionally designed to be:
- emotionally safe
- low-pressure
- practical and simple
- focused on small wins over perfection

## Future ideas

- real AI integration with Gemini/OpenAI
- saved personal history across devices
- richer letter personalization
- mood and habit tracking
- export/share options for reflection notes

## Status

This is an MVP built for a hackathon and designed to showcase a warm, no-login planning experience for real-life reflection and momentum.
