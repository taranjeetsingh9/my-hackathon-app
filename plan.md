# Mydobby — Product Plan

## 1. Product summary
Mydobby is a calm personal check-in app where users can type anything on their mind, say how much time and energy they have, and get a simple, realistic next step instead of feeling overloaded. The app sorts the user’s thoughts, highlights what matters most, shows current priorities, keeps a progress history, and helps them manage work and life in a more structured way.

Users can:
- write a free-form check-in about what feels heavy or messy
- set or update their goal
- choose time and energy level
- get an AI-generated overview of what to focus on next
- see progress history and past check-ins
- generate milestone letters and monthly future-self letters

## 2. Current status
Completed so far:
- landing page and intro flow
- profile setup with name and icon selection
- onboarding screens explaining the app in plain language
- check-in flow for mind dump, time, energy, and goal
- AI-style recommendation card for the next step
- progress/history tracking in local storage
- milestone and monthly letter generation flow
- warm magical UI with minimal, calm styling
- local-first MVP without login
- demo AI fallback when no external API key is configured

Still to improve / next steps:
- connect real AI backend or Gemini/OpenAI API integration
- improve the recommendation quality and structure from the AI responses
- add a cleaner dashboard / summary screen for past check-ins and priorities
- allow editing of goal and progress status more naturally
- add real weekly/monthly letter scheduling logic
- add export/share options for letters
- add better analytics or trend view of patterns over time
- polish final landing and onboarding messaging for pitch clarity

## 3. Implementation approach
### Core flow
1. User lands on the welcome screen.
2. User sees a short product explanation in plain language.
3. User sets their profile details and messenger style.
4. User completes the check-in:
   - what feels loud
   - how much time they have
   - how much energy they have
   - what goal they want to move forward
5. App sends the data to the planning model.
6. AI returns a next step, priority, and current load summary.
7. User can mark progress as done, partial, changed, or skipped.
8. User can generate milestone and monthly letters based on their reflection and history.
9. App stores all of this in localStorage for a local MVP.

### Demo AI logic
The current app uses a local fallback flow instead of a real external API. It generates a human-like recommendation and a simple planning summary so the UI can be tested and demonstrated even without an API key.

### Data model
Current local state includes:
- mindDump
- time
- energy
- goal
- profileName
- profileIcon
- messenger
- history
- letters

This is persisted in browser localStorage to keep the MVP lightweight and fast.

## 4. Product features to explain in the hackathon pitch
### Main problem
People often feel overwhelmed, have too many thoughts, and do not know what to do next. They need a system that helps them reduce noise and choose one valuable action.

### Solution
Mydobby is an emotional planning tool that turns a messy thought into a calm plan. A user can write anything they are thinking, and the app helps them understand what matters, what should be prioritized, and what is realistic to do today.

### Key features
- free-form check-in
- AI-powered prioritization
- goal setting and progress tracking
- weekly milestone letters
- monthly future-self letters
- simple, minimal, calming experience
- local-first MVP architecture

## 5. How to pitch this in 2–3 minutes
### Intro (20–30 seconds)
“Hi everyone, we built Mydobby — a calm check-in app for people who feel overloaded and don’t know what to do next. It helps them turn messy thoughts into clear priorities and one realistic next step.”

### Problem (20–30 seconds)
“Most people are not struggling because they are lazy or unmotivated. They are struggling because there are too many thoughts, too many tasks, and not enough clarity. People need a way to pause, sort their brain, and focus on what matters most.”

### Product (45–60 seconds)
“The app lets a user type anything they are feeling, choose how much time and energy they have, and set a goal. Then it gives them a simple overview of what to focus on, what to ignore for now, and what the next small step should be. The user can also track progress over time and see how their priorities change.”

### Letters feature (30–40 seconds)
“We also added reflective letters: a weekly milestone letter that shows progress, and a monthly letter from the future self that looks honestly at what the user has been doing and how things are evolving. It turns daily stress into reflection and momentum.”

### Why it matters / hackathon angle (20–30 seconds)
“This is not just another productivity app. It is a calmer system for decision-making, emotional clarity, and sustainable progress. We built it as a local-first MVP with a warm experience, and it is designed to feel human instead of robotic.”

### Closing line (10–15 seconds)
“We believe people do not need more pressure, they need a better way to understand their day and take the next step.”

## 6. What to show in the demo
During the hackathon demo, show:
- landing page / onboarding
- profile setup
- free-text check-in
- time and energy selection
- goal setup
- AI-generated next step card
- history/progress section
- milestone or monthly letter output

## 7. Suggested demo flow
1. Open the landing page.
2. Explain the idea in one sentence.
3. Type a messy thought such as: “I feel behind on work and I am overwhelmed.”
4. Select time and energy.
5. Add a goal.
6. Show the generated recommendation and priorities.
7. Show the history and letter generation.
8. End with the emotional value: “This helps people move from chaos to clarity.”

## 8. Risks and next steps
Main risks:
- AI output may feel generic without better prompt design
- user experience may still feel too busy if not streamlined
- letter creation may need stronger narratives for a more premium feel

Next steps:
- integrate real AI API
- improve output quality and structure
- add richer analytics and trend summaries
- refine UX flow for a smoother product story
- make the feature explanation even simpler for first-time users

## 9. Final takeaway
Mydobby is a calm planning and reflection companion that turns emotional overload into clarity. It is built to help people understand what matters, focus on one next step, and look back at their progress with honesty instead of pressure.
