"use client";

import { useEffect, useMemo, useState } from "react";

type TimeOption = "10 min" | "20 min" | "45 min" | "1 hour+";
type EnergyLevel = "low" | "medium" | "high";
type Status = "done" | "partial" | "changed" | "skipped";

type HistoryItem = {
  id: number;
  title: string;
  status: Status;
  date: string;
};

type LetterType = "monthly" | "milestone";

const timeOptions: TimeOption[] = ["10 min", "20 min", "45 min", "1 hour+"];
const energyOptions: EnergyLevel[] = ["low", "medium", "high"];
const birdOptions = ["Owl", "Raven", "Phoenix", "Fox", "Hummingbird"];
const demoThoughts = [
  "I feel behind on my portfolio and I’m overwhelmed by everything. I only have 20 minutes and medium energy.",
  "I want to start exercising again, but I keep putting it off and I feel tired most evenings.",
  "I have a stressful work project and I need one clear next step I can finish today.",
];

function buildNextStep(mindDump: string, goal: string, time: TimeOption, energy: EnergyLevel) {
  const text = mindDump.toLowerCase();

  if (text.includes("work") || text.includes("project") || text.includes("launch")) {
    return "Write the single next sentence that makes the next step obvious.";
  }

  if (text.includes("stress") || text.includes("overwhelmed") || text.includes("tired")) {
    return "Take a 10-minute reset and write one honest sentence about what matters most today.";
  }

  if (text.includes("health") || text.includes("fitness") || text.includes("exercise")) {
    return "Take a short walk and notice how your body feels before you make any bigger plans.";
  }

  if (goal) {
    return `Do the smallest visible action toward ${goal.toLowerCase()}: spend ${time.toLowerCase()} on the next real step.`;
  }

  if (energy === "low") {
    return "Choose one tiny action that can be done in a gentle, low-pressure way and finish it before anything else.";
  }

  if (time === "10 min") {
    return "Pick one meaningful task, do it in a short focused block, and stop before your energy drains.";
  }

  return "Make the next step clear, finish it with focus, and leave the rest for later.";
}

function buildPlanInsight(mindDump: string, goal: string, time: TimeOption, energy: EnergyLevel) {
  const text = mindDump.toLowerCase();
  const cleanedGoal = goal.trim();

  const priority = cleanedGoal
    ? `Protect the ${cleanedGoal.toLowerCase()} goal without turning it into a giant all-day project.`
    : "Choose the one thing that matters most today, not the whole life plan.";

  const currentLoad = text.includes("overwhelmed") || text.includes("stress") || text.includes("behind")
    ? "You are carrying a lot: pressure, unfinished tasks, and the feeling that everything needs attention at once."
    : text.includes("tired") || text.includes("exhausted")
      ? "Your energy is stretched thin and your brain is asking for a lighter, clearer rhythm."
      : "You are not doing nothing—you are holding many responsibilities and need a smaller frame to move through them.";

  const plan = cleanedGoal
    ? `Keep the work small: spend ${time.toLowerCase()} on the next real step toward ${cleanedGoal.toLowerCase()}, then stop before your ${energy} energy gets drained.`
    : `Use ${time.toLowerCase()} as a focused container. Pick the single action that creates momentum and let the rest wait.`;

  const nextStep = buildNextStep(mindDump, goal, time, energy);
  const why =
    "This is a gentle, practical plan shaped around your actual energy and time—not a fantasy version of your day.";

  return { priority, currentLoad, plan, nextStep, why };
}

function generateMonthlyLetter(mindDump: string, goal: string, messenger: string) {
  const title = `${messenger} letter`;
  const body = `Dear you,\n\nYou have been carrying a lot. The task is not to solve everything at once. It is to keep returning to the small, honest thing that matters.\n\nYou made room for ${goal || "your next meaningful move"}, even when your mind felt full. You kept showing up with a little more clarity and a little more courage. That is the quiet work that changes a life.\n\nYou do not need a perfect plan. You need presence, gentleness, and a next step. Keep listening to what is truly important.\n\nWith care,\nYour future self.`;

  return {
    title,
    body,
    summary: `A ${messenger.toLowerCase()} arrives carrying your real progress: ${mindDump.slice(0, 90) || "your steady effort"}${mindDump.length > 90 ? "..." : ""}`,
  };
}

function generateMilestoneLetter(mindDump: string, goal: string, history: HistoryItem[]) {
  const completed = history.filter((item) => item.status === "done" || item.status === "partial").length;
  const completedSummary =
    completed === 0
      ? "your first honest step"
      : `${completed} meaningful actions${goal ? ` toward ${goal}` : ""}`;

  return {
    title: "A note from your future self",
    body: `Dear you,\n\nI want you to remember this: you did not wait for perfect conditions. You kept moving with what was real.\n\nYou have already completed ${completedSummary}. That is not small. That is steady.\n\nThe reason this matters is not that you became flawless. It is that you kept returning to what actually mattered, even when your mind was loud.\n\nKeep honoring the rhythm of your life. Your next chapter is built from these daily, honest steps.\n\nWith love,\nYour future self.`,
    summary: `This letter reflects the real actions you completed and the progress you kept building from ${mindDump.slice(0, 80) || "your current season"}${mindDump.length > 80 ? "..." : ""}`,
  };
}

export default function Home() {
  const [screen, setScreen] = useState<"welcome" | "intro1" | "intro2" | "mind" | "energy" | "goal" | "step" | "letters">("welcome");
  const [mindDump, setMindDump] = useState("");
  const [time, setTime] = useState<TimeOption>("20 min");
  const [energy, setEnergy] = useState<EnergyLevel>("medium");
  const [goal, setGoal] = useState("");
  const [messenger, setMessenger] = useState("Owl");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [letters, setLetters] = useState<{ type: LetterType; title: string; body: string; summary: string }[]>([]);
  const [isLoadingStep, setIsLoadingStep] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [stepReason, setStepReason] = useState("");

  useEffect(() => {
    const saved = window.localStorage.getItem("mydobby-state");
    if (!saved) return;

    try {
      const parsed = JSON.parse(saved);
      setMindDump(parsed.mindDump ?? "");
      setTime(parsed.time ?? "20 min");
      setEnergy(parsed.energy ?? "medium");
      setGoal(parsed.goal ?? "");
      setMessenger(parsed.messenger ?? "Owl");
      setHistory(parsed.history ?? []);
      setLetters(parsed.letters ?? []);
      if (parsed.mindDump || parsed.goal || parsed.history?.length) {
        setScreen("step");
      }
    } catch {
      // ignore malformed storage and continue
    }
  }, []);

  useEffect(() => {
    const payload = { mindDump, time, energy, goal, messenger, history, letters };
    window.localStorage.setItem("mydobby-state", JSON.stringify(payload));
  }, [mindDump, time, energy, goal, messenger, history, letters]);

  useEffect(() => {
    if (screen !== "step") return;

    let isMounted = true;
    const loadStep = async () => {
      setIsLoadingStep(true);
      try {
        const response = await fetch("/api/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mindDump, goal, time, energy }),
        });

        if (!response.ok) {
          throw new Error("Failed to get a recommendation");
        }

        const data = await response.json();
        if (!isMounted) return;

        setStepReason(data.why || "This fits your current time and energy.");
      } catch {
        if (isMounted) {
          setStepReason("This fits your current time and energy.");
        }
      } finally {
        if (isMounted) {
          setIsLoadingStep(false);
        }
      }
    };

    loadStep();
    return () => {
      isMounted = false;
    };
  }, [screen, mindDump, goal, time, energy]);

  const planInsight = useMemo(() => buildPlanInsight(mindDump, goal, time, energy), [mindDump, goal, time, energy]);

  const nextStep = planInsight.nextStep;
  const recommendedStep = isLoadingStep ? "Generating your next gentle step..." : nextStep;

  const addHistoryItem = (status: Status) => {
    const item: HistoryItem = {
      id: Date.now(),
      title: goal || "General momentum",
      status,
      date: new Date().toLocaleDateString(),
    };

    setHistory((prev) => [item, ...prev]);
  };

  const generateLetter = async (type: LetterType) => {
    setIsGeneratingLetter(true);
    try {
      const response = await fetch("/api/letter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, mindDump, goal, messenger, history }),
      });

      if (!response.ok) {
        throw new Error("Failed to generate letter");
      }

      const letter = await response.json();
      setLetters((prev) => [{ type, ...letter }, ...prev]);
      setScreen("letters");
    } catch {
      const letter =
        type === "monthly"
          ? generateMonthlyLetter(mindDump, goal, messenger)
          : generateMilestoneLetter(mindDump, goal, history);

      setLetters((prev) => [{ type, ...letter }, ...prev]);
      setScreen("letters");
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const startJourney = () => setScreen("intro1");

  const resetJourney = () => {
    window.localStorage.removeItem("mydobby-state");
    setMindDump("");
    setTime("20 min");
    setEnergy("medium");
    setGoal("");
    setMessenger("Owl");
    setHistory([]);
    setLetters([]);
    setStepReason("");
    setScreen("welcome");
  };

  const renderIntroOne = () => (
    <div className="mx-auto w-full max-w-5xl rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_60px_rgba(126,109,134,0.12)] backdrop-blur-sm md:p-10">
      <div className="grid items-center gap-8 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#7b6894]">Ikigai 01</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#2f2a36]">A calm life is not built by doing everything.</h2>
          <p className="mt-4 text-lg leading-8 text-[#5f5868]">
            In the spirit of Ikigai, your life becomes clearer when you listen for what brings you wonder, meaning, and ease. Mydobby helps you gently notice what matters without turning it into pressure.
          </p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setScreen("intro2")} className="rounded-full bg-[#d9c8f4] px-6 py-3 text-base font-medium text-[#2a2340]">
              Next
            </button>
            <button onClick={() => setScreen("mind")} className="rounded-full border border-[#eadff8] bg-white px-5 py-3 text-base font-medium text-[#3f3950]">
              Skip intro
            </button>
          </div>
        </div>

        <div className="rounded-[30px] bg-[linear-gradient(135deg,#f9f1ff,#edf7f1,#fff5ea)] p-6 shadow-[0_18px_40px_rgba(134,119,162,0.12)]">
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              { label: "What you love", emoji: "💛" },
              { label: "What you are good at", emoji: "✨" },
              { label: "What the world needs", emoji: "🌿" },
              { label: "What you can do", emoji: "🌞" },
            ].map((item) => (
              <div key={item.label} className="rounded-[22px] border border-white/70 bg-white/75 p-4 shadow-sm">
                <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-[#f3ebff] text-xl">{item.emoji}</div>
                <p className="text-sm text-[#534d5b]">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderIntroTwo = () => (
    <div className="mx-auto w-full max-w-5xl rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_60px_rgba(126,109,134,0.12)] backdrop-blur-sm md:p-10">
      <div className="grid items-center gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[30px] bg-[linear-gradient(135deg,#eefaf2,#f4edff,#fff7ec)] p-6 shadow-[0_18px_40px_rgba(134,119,162,0.12)]">
          <div className="flex items-center justify-center">
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[#f6ecff] text-6xl shadow-[0_18px_35px_rgba(157,122,177,0.18)]">🫶</div>
          </div>
          <div className="mt-5 rounded-[24px] border border-white/70 bg-white/70 p-4 text-center">
            <p className="text-xs uppercase tracking-[0.18em] text-[#7b6894]">Daily rhythm</p>
            <p className="mt-2 text-xl font-medium text-[#2f2a36]">Notice → Choose → Rest → Return</p>
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#7b6894]">Ikigai 02</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#2f2a36]">Your first step is not the whole path.</h2>
          <p className="mt-4 text-lg leading-8 text-[#5f5868]">
            Mydobby turns your messy thoughts into one kind next move. It helps you make room for clarity, choose what fits your real energy, and honor the quiet pace that keeps you alive and purposeful.
          </p>
          <div className="mt-6 flex justify-between gap-3">
            <button onClick={() => setScreen("intro1")} className="rounded-full border border-[#eadff8] px-4 py-2 text-[#3f3950]">
              Back
            </button>
            <button onClick={() => setScreen("mind")} className="rounded-full bg-[#d9c8f4] px-6 py-3 text-base font-medium text-[#2a2340]">
              Start my check-in
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const PastelIllustration = () => (
    <div className="relative h-64 w-full overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#f9f1ff,#eefaf2,#fffaf0)] p-4 shadow-[0_20px_45px_rgba(139,123,168,0.12)]">
      <div className="absolute left-8 top-8 h-20 w-20 rounded-full bg-[#f7dfe7]/80" />
      <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-[#dfeffc]/80" />
      <div className="absolute bottom-6 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-[#e1f4dd]/80" />

      <div className="absolute left-1/2 top-1/2 w-44 -translate-x-1/2 -translate-y-1/2 rounded-[26px] border border-white/80 bg-white/75 p-4 shadow-[0_20px_40px_rgba(143,127,174,0.14)] backdrop-blur-sm">
        <div className="mb-3 flex items-center justify-between">
          <div className="h-3 w-3 rounded-full bg-[#d8baf5]" />
          <div className="h-3 w-16 rounded-full bg-[#e9e0f7]" />
        </div>
        <div className="space-y-2">
          <div className="h-2.5 w-full rounded-full bg-[#f0e3ff]" />
          <div className="h-2.5 w-5/6 rounded-full bg-[#e8f2ea]" />
          <div className="h-2.5 w-2/3 rounded-full bg-[#f9e7da]" />
        </div>
      </div>

      <div className="absolute bottom-12 right-10 flex h-16 w-16 items-center justify-center rounded-full bg-[#f9e7da] shadow-[0_12px_30px_rgba(167,124,90,0.18)]">
        <span className="text-2xl">🪽</span>
      </div>
    </div>
  );

  const renderWelcome = () => (
    <div className="mx-auto w-full max-w-5xl rounded-[36px] border border-white/80 bg-white/75 p-6 shadow-[0_20px_70px_rgba(144,118,167,0.14)] backdrop-blur-sm md:p-8">
      <div className="grid items-center gap-8 md:grid-cols-[1.08fr_0.92fr]">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-[#eadff8] bg-[linear-gradient(135deg,#f5eefe,#eefaf3,#fff5e7)] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#6d5d8a] shadow-sm">
            Mydobby
          </div>
          <h1 className="text-4xl font-semibold tracking-[-0.04em] text-[#2d2634] md:text-5xl">Your next tiny, kind step is waiting.</h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-[#5d5669]">
            Unload the noise in your head, notice the real energy in your day, and let Mydobby turn it into one gentle action you can actually finish.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={startJourney}
              className="rounded-full bg-[linear-gradient(135deg,#d9c8f4,#cfeee3)] px-6 py-3 text-base font-medium text-[#2a2340] shadow-[0_14px_30px_rgba(183,154,220,0.28)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Start my check-in
            </button>
            <button
              onClick={() => setScreen("intro1")}
              className="rounded-full border border-[#eadff8] bg-white/80 px-5 py-3 text-base font-medium text-[#413b52]"
            >
              See how it works
            </button>
          </div>
        </div>

        <PastelIllustration />
      </div>
    </div>
  );

  const renderMind = () => (
    <div className="mx-auto w-full max-w-2xl rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_60px_rgba(126,109,134,0.12)] backdrop-blur-sm">
      <p className="text-sm uppercase tracking-[0.15em] text-[#7b6894]">1 / 4</p>
      <h2 className="mt-3 text-3xl font-semibold text-[#2f2a36]">What is on your mind right now?</h2>

      <div className="mt-5 flex flex-wrap gap-2">
        {demoThoughts.map((example) => (
          <button
            key={example}
            onClick={() => setMindDump(example)}
            className="rounded-full border border-[#eadff8] bg-[#faf6ff] px-3 py-1.5 text-xs text-[#4d4360] transition hover:bg-[#f3ebff]"
          >
            Try example
          </button>
        ))}
      </div>

      <textarea
        value={mindDump}
        onChange={(event) => setMindDump(event.target.value)}
        rows={7}
        className="mt-6 w-full rounded-3xl border border-[#e7dff6] bg-[#fffdfd] p-4 text-base text-[#2f2a36] outline-none ring-0 placeholder:text-[#948ca2] focus:border-[#d1b8f3]"
        placeholder="Write your thoughts, worries, tasks, or plans here. Example: I feel behind on my portfolio and I only have 20 minutes today."
      />
      <div className="mt-6 flex justify-between gap-3">
        <button onClick={() => setScreen("welcome")} className="rounded-full border border-[#eadff8] px-4 py-2 text-[#3f3950]">
          Back
        </button>
        <button
          onClick={() => setScreen("energy")}
          className="rounded-full bg-[#d7f0e2] px-5 py-2.5 font-medium text-[#1d3b2d]"
          disabled={!mindDump.trim()}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderEnergy = () => (
    <div className="mx-auto w-full max-w-2xl rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_60px_rgba(126,109,134,0.12)] backdrop-blur-sm">
      <p className="text-sm uppercase tracking-[0.15em] text-[#7b6894]">2 / 4</p>
      <h2 className="mt-3 text-3xl font-semibold text-[#2f2a36]">How much time and energy do you actually have?</h2>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-[#534d5b]">Time</p>
        <div className="flex flex-wrap gap-3">
          {timeOptions.map((option) => (
            <button
              key={option}
              onClick={() => setTime(option)}
              className={`rounded-full border px-4 py-2 ${
                time === option ? "border-[#d1b8f3] bg-[#f3ebff] text-[#2f2144]" : "border-[#eadff8] bg-white text-[#4d4660]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-sm font-medium text-[#534d5b]">Energy</p>
        <div className="flex flex-wrap gap-3">
          {energyOptions.map((option) => (
            <button
              key={option}
              onClick={() => setEnergy(option)}
              className={`rounded-full border px-4 py-2 capitalize ${
                energy === option ? "border-[#cfe8d9] bg-[#ebfaf0] text-[#254d39]" : "border-[#e8f2ea] bg-white text-[#4d5a58]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 flex justify-between gap-3">
        <button onClick={() => setScreen("mind")} className="rounded-full border border-[#eadff8] px-4 py-2 text-[#3f3950]">
          Back
        </button>
        <button onClick={() => setScreen("goal")} className="rounded-full bg-[#d9c8f4] px-5 py-2.5 font-medium text-[#2a2340]">
          Continue
        </button>
      </div>
    </div>
  );

  const renderGoal = () => (
    <div className="mx-auto w-full max-w-2xl rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_60px_rgba(126,109,134,0.12)] backdrop-blur-sm">
      <p className="text-sm uppercase tracking-[0.15em] text-[#7b6894]">3 / 4</p>
      <h2 className="mt-3 text-3xl font-semibold text-[#2f2a36]">Do you want to choose a goal right now?</h2>
      <p className="mt-2 text-[#5f5868]">You can skip this and just let Mybee help you with the next small step.</p>
      <input
        value={goal}
        onChange={(event) => setGoal(event.target.value)}
        className="mt-6 w-full rounded-3xl border border-[#e7dff6] bg-[#fffdfd] p-4 text-base text-[#2f2a36] outline-none placeholder:text-[#948ca2] focus:border-[#d1b8f3]"
        placeholder="Examples: finish my portfolio, call my family, prepare my first draft"
      />
      <div className="mt-7 flex justify-between gap-3">
        <button onClick={() => setScreen("energy")} className="rounded-full border border-[#eadff8] px-4 py-2 text-[#3f3950]">
          Back
        </button>
        <button onClick={() => setScreen("step")} className="rounded-full bg-[#d9c8f4] px-5 py-2.5 font-medium text-[#2a2340]">
          {goal ? "Use this goal" : "Skip for now"}
        </button>
      </div>
    </div>
  );

  const renderStep = () => (
    <div className="mx-auto w-full max-w-3xl rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_60px_rgba(126,109,134,0.12)] backdrop-blur-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.15em] text-[#7b6894]">Your next small step</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#2f2a36]">A gentle action that fits your day</h2>
        </div>
        <button
          onClick={() => setScreen("letters")}
          className="rounded-full border border-[#e6ddf8] bg-[#f7f4fe] px-4 py-2 text-sm font-medium text-[#43396a]"
        >
          View letters
        </button>
      </div>

      <div className="mt-6 rounded-[28px] bg-[linear-gradient(135deg,#f9f4ff,#eefaf2,#fdf6eb)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="mb-4 flex items-center justify-between gap-3">
          <p className="text-sm font-medium uppercase tracking-[0.12em] text-[#6c5e7d]">Recommended action</p>
          <span className="rounded-full border border-[#e8defb] bg-white/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#6b5c7b]">Demo AI</span>
        </div>
        <p className="mt-2 text-2xl leading-relaxed text-[#2f2a36]">{recommendedStep}</p>
        <p className="mt-4 text-sm leading-7 text-[#564b68]">{stepReason || planInsight.why}</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-[#eadff8] bg-[#faf6ff] p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#7b6894]">Priority</p>
          <p className="mt-3 text-base leading-7 text-[#2f2a36]">{planInsight.priority}</p>
        </div>
        <div className="rounded-[24px] border border-[#dfece3] bg-[#f1faf5] p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#46715d]">Current work</p>
          <p className="mt-3 text-base leading-7 text-[#2f2a36]">{planInsight.currentLoad}</p>
        </div>
        <div className="rounded-[24px] border border-[#f4e9d9] bg-[#fffaf2] p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#8b6644]">Plan</p>
          <p className="mt-3 text-base leading-7 text-[#2f2a36]">{planInsight.plan}</p>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-4">
        {[
          { label: "I did it", value: "done" },
          { label: "Partially", value: "partial" },
          { label: "Changed plan", value: "changed" },
          { label: "Skip for now", value: "skipped" },
        ].map((action) => (
          <button
            key={action.value}
            onClick={() => {
              addHistoryItem(action.value as Status);
              setScreen("letters");
            }}
            className="rounded-2xl border border-[#eadff8] bg-white px-4 py-3 text-sm font-medium text-[#3c3450] transition hover:bg-[#faf6ff]"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={() => setScreen("goal")} className="rounded-full border border-[#eadff8] px-4 py-2 text-[#3f3950]">
          Edit goal
        </button>
        <button
          onClick={() => generateLetter("milestone")}
          className="rounded-full bg-[#d9c8f4] px-5 py-2.5 font-medium text-[#2a2340] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isGeneratingLetter}
        >
          {isGeneratingLetter ? "Writing..." : "Write milestone letter"}
        </button>
        <button
          onClick={() => generateLetter("monthly")}
          className="rounded-full bg-[#d7f0e2] px-5 py-2.5 font-medium text-[#1d3b2d] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isGeneratingLetter}
        >
          {isGeneratingLetter ? "Sending..." : "Send monthly letter"}
        </button>
      </div>
    </div>
  );

  const renderLetters = () => (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_60px_rgba(126,109,134,0.12)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.15em] text-[#7b6894]">Progress archive</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#2f2a36]">Your reflective history</h2>
          </div>
          <button onClick={() => setScreen("step")} className="rounded-full border border-[#eadff8] px-4 py-2 text-[#3f3950]">
            Back to step
          </button>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-[#534d5b]">Letter messenger</p>
          <div className="flex flex-wrap gap-2">
            {birdOptions.map((option) => (
              <button
                key={option}
                onClick={() => setMessenger(option)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  messenger === option ? "border-[#d1b8f3] bg-[#f3ebff] text-[#2f2144]" : "border-[#eadff8] bg-white text-[#4d4660]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#e3d9f0] bg-[#fbf8ff] p-5 text-[#584d69] md:col-span-3">
              Your progress history is empty. Finish a small action to begin building momentum.
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[#eadff8] bg-[#fffafc] p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#857796]">{item.date}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#2f2a36]">{item.title}</h3>
                <p className="mt-2 text-sm capitalize text-[#584d69]">{item.status}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-5">
        {letters.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#d9c8f4] bg-[#f9f4ff] p-6 text-[#564b68]">
            No letters yet. Pick a monthly or milestone letter to let your future self speak.
          </div>
        ) : (
          letters.map((letter, index) => (
            <div key={`${letter.title}-${index}`} className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_60px_rgba(126,109,134,0.12)] backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#f1ebff] px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-[#6d5d8a]">
                  {letter.type}
                </span>
                <span className="text-sm text-[#726a7e]">{letter.title}</span>
              </div>
              <p className="whitespace-pre-line text-lg leading-8 text-[#2f2a36]">{letter.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_#fffdfd_0%,_#f9f2ff_28%,_#edf9f3_60%,_#fff6eb_100%)] px-4 py-8 text-[#2f2a36] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex items-center justify-between rounded-full border border-white/80 bg-white/40 px-5 py-3 shadow-[0_12px_40px_rgba(126,109,134,0.08)] backdrop-blur-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f0e6ff] text-lg text-[#5e4e7d]">M</div>
            <div>
              <p className="text-xs uppercase tracking-[0.18em] text-[#736a7f]">Mydobby</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={resetJourney}
              className="rounded-full border border-[#eadff8] bg-white px-3 py-2 text-xs font-medium text-[#443d59]"
            >
              Reset onboarding
            </button>
            <button
              onClick={() => setScreen("letters")}
              className="rounded-full border border-[#eadff8] bg-white px-4 py-2 text-sm font-medium text-[#443d59]"
            >
              Letters
            </button>
          </div>
        </header>

        {screen === "welcome" && renderWelcome()}
        {screen === "intro1" && renderIntroOne()}
        {screen === "intro2" && renderIntroTwo()}
        {screen === "mind" && renderMind()}
        {screen === "energy" && renderEnergy()}
        {screen === "goal" && renderGoal()}
        {screen === "step" && renderStep()}
        {screen === "letters" && renderLetters()}
      </div>
    </main>
  );
}
