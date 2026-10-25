# Kokoro: Testing, Demo & Presentation Guide

This guide walks you through automated unit testing, local launch, full-flow manual testing, and your final presentation for the **Devpost "Build With AI: Basics" Hackathon**.

---

## 1. Automated Unit & Contract Testing

Kokoro comes with an automated test suite verifying core business logic, fallback heuristics, planning documents, and database safety rules:

```bash
# Run tests via npm:
npm test

# Or run directly with Node:
node test-suite.js
```

### What the unit tests verify:
1. **Ikigai Recommendation Engine**: Confirms that work, overwhelm, or low-energy keywords properly produce bite-sized, low-pressure next actions.
2. **Plan Breakdown Structure**: Verifies that every plan insight generates the 5 required emotional and practical dimensions (`priority`, `currentLoad`, `plan`, `nextStep`, `why`).
3. **Future-Self Letter Engine**: Verifies that monthly and milestone letters dynamically inject the chosen messenger motif and accurately count completed actions.
4. **Hackathon Compliance**: Verifies that `scope.md`, `prd.md`, and `spec.md` exist with `status: approved`.
5. **Database Safety**: Verifies that `supabase-schema.sql` does not contain the reserved PostgreSQL keyword `current_time`.

---

## 2. Cloud & Database Diagnostic Testing

To verify that your Supabase connection and tables are healthy:

```bash
node test-supabase.js
```

* Tests `.env.local` variable detection.
* Tests reachability of Supabase Auth service.
* Confirms that `profiles`, `check_ins`, and `letters` tables exist with active Row Level Security (RLS).

---

## 3. Running the App Locally

To run the complete automated check and start the local development server in one step:

```bash
./run.sh
# or:
bash run.sh
```

Then open your browser to **`http://localhost:3000`**.

---

## 4. Manual End-to-End Test Workflow

Follow this 5-minute testing path:

1. **Diagnostic Check**:
   * Click **☁️ Cloud / Login** in the top right of the header.
   * Click **↻ Test Connection**. Confirm the green badge: *"Connected Successfully! All tables (profiles, check_ins, letters) are detected."*
2. **Account Sign-Up / Login**:
   * In the same modal, switch to **Create Account** (or **Sign In**).
   * Enter your email and password → click **Create Account**.
   * Confirm that your account is immediately logged in and displays your User ID (`UID`).
3. **Check-In Flow**:
   * Click **Start my check-in** on the landing page.
   * Enter a raw mind dump: *"I have an overwhelming list of tasks, feeling behind on my hackathon project."*
   * Select Time: **20 min**, Energy: **Medium**.
   * Enter an optional goal: *"Finish Kokoro project"*.
   * Click **Continue** to advance to the **Step** screen.
4. **Action Completion**:
   * Read the single recommended action and the container breakdown cards.
   * Click **"I did it"**.
   * Watch the celebration confetti burst across the screen!
5. **Interactive 3D Companion**:
   * Navigate to the **Letters** screen or tap **🕊️ 3D Sanctuary** in the header.
   * Drag your mouse to orbit the 3D animal companion in real-time.
   * Switch between **Owl, Raven, Phoenix, Fox, and Hummingbird**.
6. **Future-Self Letter Ceremony**:
   * Return to **Letters** (or the Step page) and tap **"Write milestone letter"**.
   * Click **"📜 Read in Ceremony"** on the generated letter.
   * The animated wax seal pops open, revealing your letter written from your future self.
   * Click **📋 Copy Letter** to verify clipboard functionality.
7. **Logging Multiple Sequential Check-Ins**:
   * Want to log another action without losing past progress?
   * Tap **🌿 Another Check-in** (on the Step screen) or **🌿 New Check-in** in the top header.
   * You can also click the **Kokoro Logo** or **🏠 Home** to return to the welcome landing at any time.
   * Notice your previous check-ins and letters remain intact in the **📜 Letters** archive and in Supabase `check_ins`.
8. **Persistence Verification**:
   * Press **F5 / Command+R** to refresh the browser page.
   * Notice your account is still signed in, your progress history remains intact, and your letters are preserved.
   * Click **Log Out** in the Account modal → state resets for Guest Mode.
   * Sign back in → all cloud records immediately repopulate from Supabase.

---

## 5. Hackathon Video Demo Script (2 to 3 Minutes)

*Record your screen at `http://localhost:3000` while speaking this script:*

- **[0:00 - 0:25] The Problem & Intro**:
  > *"Hi everyone, this is Kokoro—a calm anti-overwhelm companion built for the Build With AI Basics Hackathon. When we’re stressed, opening complex productivity tools like Notion or Jira often just makes us feel more guilty. Kokoro does the opposite: it helps you take a messy stream of thoughts, filter it through your actual energy, and find one single kind next step."*

- **[0:25 - 0:50] Mind Dump & Capacity Selection**:
  > *"Here’s our core loop. I’ll start by dumping what’s loud in my head right now. Next, instead of assuming I have 8 hours of peak focus, Kokoro asks for my honest capacity. I only have 20 minutes and medium energy right now. I'll add my goal and tap Continue."*

- **[0:50 - 1:20] The Recommended Action**:
  > *"Immediately, Kokoro isolates a single, realistic action: 'Write the single next sentence that makes the next step obvious.' It breaks down why this fits my capacity, validates the mental load I'm carrying without judgment, and sets a 20-minute container so I don't burn out."*

- **[1:20 - 1:45] Action Completion & 3D Companion**:
  > *"Let's say I complete this 20-minute block. I tap 'I did it'—we get a celebratory micro-burst of confetti, and the action is logged. Now, look at our companion perch: an interactive 3D messenger companion built with Three.js. You can orbit, zoom, and select different companions like the Owl, Raven, or Phoenix."*

- **[1:45 - 2:15] Future-Self Letter Ceremony**:
  > *"Now the hero moment: receiving a letter from your future self. Tapping 'Write milestone letter' generates a heartfelt letter grounded in the real actions you just completed. In our ceremony view, the wax seal pops open, delivering a warm note reminding you that progress is quiet, steady, and courageous."*

- **[2:15 - 2:45] Supabase Persistence & Wrap-up**:
  > *"Under the hood, Kokoro is backed by Supabase Cloud PostgreSQL with Row Level Security. Every check-in, profile setting, and letter is secured to the user's ID. When I refresh the page or log in on another device, all my reflections are preserved. That's Kokoro—turning overwhelm into one gentle step."*

---

## 6. How to Push to GitHub

```bash
# Check status
git status

# Add all files (including planning docs, tests, and schema)
git add .

# Commit with descriptive message
git commit -m "feat: complete Kokoro MVP with Supabase persistence, 3D messenger, and Devpost skill pack docs"

# Push to your repository
git push origin main
```
