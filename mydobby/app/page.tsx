"use client";

import { useEffect, useMemo, useState } from "react";
import { buildAiGoalUpdate, createDemoHistory, createDemoLetters, getMonthLetterTone } from "@/lib/demo-data";
import { countSavedCheckIns, normalizeHistoryStatus } from "@/lib/checkin-utils";

type TimeOption = "10 min" | "20 min" | "45 min" | "1 hour+";
type EnergyLevel = "low" | "medium" | "high";
type Status = "done" | "partial" | "blocked" | "stuck" | "changed" | "skipped";

type HistoryItem = {
  id: number | string;
  title: string;
  status: Status;
  date: string;
};

type LetterType = "monthly" | "milestone";

const timeOptions: TimeOption[] = ["10 min", "20 min", "45 min", "1 hour+"];
const energyOptions: EnergyLevel[] = ["low", "medium", "high"];
const birdOptions = ["Owl", "Raven", "Phoenix", "Fox", "Hummingbird"];
const profileIcons = [
  { id: "owl", label: "Owl", emoji: "🦉" },
  { id: "fox", label: "Fox", emoji: "🦊" },
  { id: "phoenix", label: "Phoenix", emoji: "🦅" },
  { id: "butterfly", label: "Butterfly", emoji: "🦋" },
  { id: "star", label: "Star", emoji: "✨" },
];
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

function buildAiActionPlan(
  mindDump: string,
  goal: string,
  time: TimeOption,
  energy: EnergyLevel,
  modelPlan?: {
    heard?: string;
    mattersMost?: string;
    matters_most?: string;
    actionLabel?: string;
    actionWhy?: string;
    arrangement?: string[];
    arrange_rest?: string[];
    action?: { text?: string; minutes?: number; why?: string } | null;
    nextStep?: string;
    why?: string;
    safety?: string;
    message?: string;
  },
) {
  const text = mindDump.trim();
  const cleanGoal = goal.trim();
  const timeMinutes = time === "10 min" ? 10 : time === "20 min" ? 20 : time === "45 min" ? 45 : 60;

  const heard = modelPlan?.heard ?? (
    text
      ? text.length > 120
        ? `It sounds like ${text.slice(0, 120).trim()}... and it feels like a lot to carry at once.`
        : `It sounds like ${text}, and that is a lot to hold when your energy is ${energy}.`
      : "You have a lot on your mind, and it makes sense that you want one clear place to begin."
  );

  const mattersMost = modelPlan?.mattersMost ?? modelPlan?.matters_most ?? (
    cleanGoal
      ? `The thing that matters most right now is moving one step toward ${cleanGoal.toLowerCase()}. That keeps the day from getting swallowed by everything else.`
      : "The thing that matters most right now is choosing one small, honest step. That keeps today from becoming a long list of unfinished things."
  );

  const actionText = modelPlan?.action?.text ?? modelPlan?.actionLabel ?? modelPlan?.nextStep ?? (
    cleanGoal
      ? `Do the smallest real task for ${cleanGoal.toLowerCase()} (${Math.min(timeMinutes, 15)} minutes)`
      : `Pick the first task that makes the rest smaller (${Math.min(timeMinutes, 15)} minutes)`
  );

  const actionLabel = modelPlan?.action?.minutes
    ? `${actionText} (${modelPlan.action.minutes} minutes)`
    : actionText;

  const actionWhy = modelPlan?.action?.why ?? modelPlan?.actionWhy ?? modelPlan?.why ?? (
    cleanGoal
      ? `This one matters because it moves your goal forward without asking your ${energy} energy to do too much.`
      : `This one matters because it creates momentum without turning your evening into a full project.`
  );

  const arrangement = modelPlan?.arrange_rest?.length
    ? modelPlan.arrange_rest.filter(Boolean).slice(0, 4)
    : modelPlan?.arrangement?.length
      ? modelPlan.arrangement.filter(Boolean).slice(0, 4)
      : energy === "low"
        ? [
            "Keep the rest of the list small, and let the non-urgent tasks wait.",
            "Only do the work that protects tomorrow.",
            "Leave anything that feels like a second job for another day.",
          ]
        : [
            "Pick the task that matters most, then stop before the list grows again.",
            "Combine anything that can happen in the same block of time.",
            "Let the rest wait until your energy is steadier.",
          ];

  const themes = [
    ...new Set(
      text
        .toLowerCase()
        .replace(/[^a-z\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 4)
        .slice(0, 3),
    ),
  ].map((word) => word.trim());

  return {
    heard: heard.trim(),
    mattersMost: mattersMost.trim(),
    actionLabel: actionLabel.trim(),
    actionWhy: actionWhy.trim(),
    arrangement,
    record: {
      summary: text || "A full mind and a crowded day.",
      themes: themes.length > 0 ? themes : ["focus", "reset"],
      suggested_action: actionLabel.replace(/\s*\([^)]*\)$/, "").trim(),
    },
  };
}

function generateMonthlyLetter(mindDump: string, goal: string, messenger: string, history: HistoryItem[] = []) {
  const tone = getMonthLetterTone(
    history.length > 0
      ? history.map((item) => ({
          id: String(item.id),
          title: item.title,
          status: normalizeHistoryStatus(item.status) as "done" | "partial" | "blocked" | "stuck",
          date: new Date(item.date).toISOString(),
        }))
      : createDemoHistory(),
  );
  const title = `${messenger} letter`;
  const body = `Dear you,\n\n${tone}\n\nYou made room for ${goal || "your next meaningful move"}, even when your mind felt full. You kept showing up with a little more clarity and a little more courage. That is the quiet work that changes a life.\n\nYou do not need a perfect plan. You need presence, gentleness, and a next step. Keep listening to what is truly important.\n\nWith care,\nYour future self.`;

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
  const [screen, setScreen] = useState<"welcome" | "profile" | "profile-view" | "intro1" | "intro2" | "mind" | "energy" | "goal" | "step" | "letters">("welcome");
  const [mindDump, setMindDump] = useState("");
  const [time, setTime] = useState<TimeOption>("20 min");
  const [energy, setEnergy] = useState<EnergyLevel>("medium");
  const [goal, setGoal] = useState("");
  const [profileGoal, setProfileGoal] = useState("");
  const [profileName, setProfileName] = useState("");
  const [savedProfiles, setSavedProfiles] = useState<string[]>([]);
  const [profileIcon, setProfileIcon] = useState("owl");
  const [messenger, setMessenger] = useState("Owl");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [checkInCount, setCheckInCount] = useState(0);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);
  const [letters, setLetters] = useState<{ type: LetterType; title: string; body: string; summary: string }[]>([]);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authError, setAuthError] = useState("");
  const [isLoadingStep, setIsLoadingStep] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [stepReason, setStepReason] = useState("");
  const [stepDraft, setStepDraft] = useState("");
  const [apiPlan, setApiPlan] = useState<{ heard?: string; mattersMost?: string; actionLabel?: string; actionWhy?: string; arrangement?: string[]; nextStep?: string; why?: string } | null>(null);

  const loadProfileData = async (usernameOverride?: string) => {
    const nextName = (usernameOverride ?? profileName ?? "").trim();
    if (!nextName) {
      return;
    }

    try {
      const response = await fetch(`/api/checkins?profileName=${encodeURIComponent(nextName)}`);
      if (!response.ok) return;

      const data = await response.json();
      const profiles = Array.isArray(data?.profiles) ? data.profiles : [];
      setSavedProfiles(profiles.map((item: any) => item.display_name || "").filter(Boolean));

      const activeProfile = data?.profile ?? profiles.find((item: any) => (item.display_name || "").toLowerCase() === nextName.toLowerCase()) ?? null;
      if (!activeProfile) {
        setProfileName(nextName || "");
        setProfileGoal(goal || "");
        setHistory([]);
        setLetters([]);
        setCheckInCount(0);
        return;
      }

      setProfileName(activeProfile.display_name || nextName);
      setProfileIcon(activeProfile.avatar || "owl");
      setMessenger(activeProfile.letter_messenger || "Owl");

      const mappedHistory = (data.checkIns ?? []).flatMap((checkIn: any) =>
        (checkIn.history ?? []).map((item: any) => ({
          id: item.id || Date.now() + Math.random(),
          title: item.action_label || "Progress",
          status: item.status,
          date: new Date(item.created_at).toLocaleDateString(),
        })),
      );

      const mappedLetters = (data.letters ?? []).map((letter: any) => ({
        type: letter.type,
        title: letter.title,
        summary: letter.summary,
        body: letter.body,
      }));

      setHistory(mappedHistory);
      setCheckInCount(countSavedCheckIns(data.checkIns ?? []));
      setLetters(mappedLetters);
    } catch {
      // ignore profile fetch issues and keep the current local state
    }
  };

  useEffect(() => {
    const loadSavedState = async () => {
      const saved = window.localStorage.getItem("mydobby-state");
      const onboardingSeen = window.localStorage.getItem("mydobby-onboarding") === "true";
      setHasSeenOnboarding(onboardingSeen);

      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setMindDump(parsed.mindDump ?? "");
          setTime(parsed.time ?? "20 min");
          setEnergy(parsed.energy ?? "medium");
          setGoal(parsed.goal ?? "");
          setProfileGoal(parsed.profileGoal ?? parsed.goal ?? "");
          setProfileName(parsed.profileName ?? "");
          setProfileIcon(parsed.profileIcon ?? "owl");
          setMessenger(parsed.messenger ?? "Owl");
          setHistory(parsed.history ?? []);
          setLetters(parsed.letters ?? []);
          if (parsed.mindDump || parsed.goal || parsed.history?.length) {
            setScreen("step");
          } else if (onboardingSeen) {
            setScreen("profile");
          }
          return;
        } catch {
          // ignore malformed storage and continue
        }
      }

      try {
        const response = await fetch("/api/checkins");
        if (!response.ok) return;

        const data = await response.json();
        const profiles = Array.isArray(data?.profiles) ? data.profiles : [];
        setSavedProfiles(profiles.map((item: any) => item.display_name || "").filter(Boolean));

        const activeProfile = data?.profile ?? null;
        if (!activeProfile) {
          setProfileName("");
          setProfileGoal("");
          setGoal("");
          setHistory([]);
          setLetters([]);
          setCheckInCount(0);
          setScreen(onboardingSeen ? "profile" : "welcome");
          return;
        }

        setProfileName(activeProfile.display_name || "");
        setProfileIcon(activeProfile.avatar || "owl");
        setMessenger(activeProfile.letter_messenger || "Owl");

        const mappedHistory = (data.checkIns ?? []).flatMap((checkIn: any) =>
          (checkIn.history ?? []).map((item: any) => ({
            id: item.id || Date.now() + Math.random(),
            title: item.action_label || "Progress",
            status: item.status,
            date: new Date(item.created_at).toLocaleDateString(),
          })),
        );

        const mappedLetters = (data.letters ?? []).map((letter: any) => ({
          type: letter.type,
          title: letter.title,
          summary: letter.summary,
          body: letter.body,
        }));

        setHistory(mappedHistory);
        setCheckInCount(countSavedCheckIns(data.checkIns ?? []));
        setLetters(mappedLetters);
        setScreen(onboardingSeen ? "profile" : "step");
      } catch {
        setScreen(onboardingSeen ? "profile" : "welcome");
      }
    };

    void loadSavedState();
  }, []);

  useEffect(() => {
    const payload = { mindDump, time, energy, goal, profileGoal, profileName, profileIcon, messenger, history, letters };
    window.localStorage.setItem("mydobby-state", JSON.stringify(payload));
  }, [mindDump, time, energy, goal, profileGoal, profileName, profileIcon, messenger, history, letters]);

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

        setApiPlan(data);
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
  const aiPlan = useMemo(() => buildAiActionPlan(mindDump, goal, time, energy, apiPlan ?? undefined), [mindDump, goal, time, energy, apiPlan]);
  const aiGoalSuggestion = useMemo(() => buildAiGoalUpdate(goal || profileGoal || "your current goal", mindDump, history), [goal, profileGoal, mindDump, history]);

  useEffect(() => {
    if (screen === "step") {
      setStepDraft(mindDump);
    }
  }, [screen, mindDump]);

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
    return item;
  };

  const saveCheckInToSupabase = async (historySnapshot: HistoryItem[] = history) => {
    try {
      const result = await fetch("/api/checkins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileName: profileName || "Anonymous",
          profileIcon,
          messenger,
          mindDump,
          goal,
          timeAvailable: time,
          energyLevel: energy,
          history: historySnapshot.map((item) => ({
            ...item,
            status: normalizeHistoryStatus(item.status),
          })),
        }),
      });

      if (result.ok) {
        const data = await result.json();
        if (data?.checkInId) {
          setCheckInCount((prev) => prev + 1);
        }
      }
    } catch {
      // ignore backup/fallback path for local demo
    }
  };

  const saveLetterToSupabase = async (type: LetterType, letter: { title: string; body: string; summary: string }) => {
    try {
      await fetch("/api/letters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          profileName: profileName || "Anonymous",
          profileIcon,
          messenger,
          type,
          title: letter.title,
          summary: letter.summary,
          body: letter.body,
        }),
      });
    } catch {
      // ignore backup/fallback path for local demo
    }
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
      const payload = { type, ...letter };
      setLetters((prev) => [payload, ...prev]);
      await saveLetterToSupabase(type, letter);
      setScreen("letters");
    } catch {
      const letter =
        type === "monthly"
          ? generateMonthlyLetter(mindDump, goal, messenger, history)
          : generateMilestoneLetter(mindDump, goal, history);

      const payload = { type, ...letter };
      setLetters((prev) => [payload, ...prev]);
      await saveLetterToSupabase(type, letter);
      setScreen("letters");
    } finally {
      setIsGeneratingLetter(false);
    }
  };

  const startJourney = () => {
    window.localStorage.setItem("mydobby-onboarding", "true");
    setHasSeenOnboarding(true);
    setScreen("profile");
  };

  const resetJourney = () => {
    window.localStorage.removeItem("mydobby-state");
    window.localStorage.removeItem("mydobby-onboarding");
    setHasSeenOnboarding(false);
    setMindDump("");
    setTime("20 min");
    setEnergy("medium");
    setGoal("");
    setProfileGoal("");
    setProfileName("");
    setProfileIcon("owl");
    setMessenger("Owl");
    setHistory([]);
    setLetters([]);
    setStepReason("");
    setScreen("welcome");
  };

  const renderProfile = () => {
    const isSignIn = authMode === "signin";

    const handleProfileSubmit = async () => {
      const username = profileName.trim();
      if (!username) {
        setAuthError("Please enter a username.");
        return;
      }

      window.localStorage.removeItem("mydobby-state");
      setHistory([]);
      setLetters([]);
      setCheckInCount(0);

      if (isSignIn) {
        try {
          const response = await fetch(`/api/checkins?profileName=${encodeURIComponent(username)}`);
          const data = await response.json();

          if (!response.ok || !data?.profile) {
            setAuthError("No profile found for that username. Please sign up first.");
            return;
          }

          const profile = data.profile;
          setAuthError("");
          setProfileName(profile.display_name || username);
          setProfileIcon(profile.avatar || "owl");
          setMessenger(profile.letter_messenger || "Owl");
          setGoal(profile.goal || profileGoal || "");
          setProfileGoal(profile.goal || profileGoal || "");
          setHistory(
            (data.checkIns ?? []).flatMap((checkIn: any) =>
              (checkIn.history ?? []).map((item: any) => ({
                id: item.id || Date.now() + Math.random(),
                title: item.action_label || "Progress",
                status: item.status,
                date: new Date(item.created_at).toLocaleDateString(),
              })),
            ),
          );
          setCheckInCount(countSavedCheckIns(data.checkIns ?? []));
          setLetters(
            (data.letters ?? []).map((letter: any) => ({
              type: letter.type,
              title: letter.title,
              summary: letter.summary,
              body: letter.body,
            })),
          );
          setScreen("profile-view");
          return;
        } catch {
          setAuthError("That username could not be verified right now. Please try again.");
          return;
        }
      }

      setAuthError("");
      setProfileGoal(profileGoal.trim());
      setGoal(profileGoal.trim());
      if (!hasSeenOnboarding) {
        window.localStorage.setItem("mydobby-onboarding", "true");
        setHasSeenOnboarding(true);
      }
      await loadProfileData(username);
      setScreen("mind");
    };

    return (
      <div className="mx-auto w-full max-w-4xl rounded-[32px] border border-white/60 bg-[rgba(255,255,255,0.5)] p-8 shadow-[0_18px_60px_rgba(74,55,45,0.08)] backdrop-blur-xl">
        <div className="text-center">
          <p className="text-sm uppercase tracking-[0.18em] text-[#8f6db9]">{isSignIn ? "Sign in" : "Create profile"}</p>
          <h2 className="mt-3 text-3xl font-semibold text-[#2a211d]">{isSignIn ? "Welcome back" : "Set up your little corner."}</h2>
        </div>

        <div className="mt-8 grid gap-6 md:grid-cols-[1fr_1fr]">
          <div className="rounded-[24px] border border-white/70 bg-white/50 p-5">
            <label className="mb-2 block text-sm font-medium text-[#544b47]">Username</label>
            <input
              value={profileName}
              onChange={(event) => setProfileName(event.target.value.trimStart())}
              placeholder="my-dobby"
              className="w-full rounded-2xl border border-[#eadbcb] bg-white/80 px-4 py-3 text-base text-[#2a211d] outline-none placeholder:text-[#7f736d] focus:border-[#c8b3eb]"
            />
            <p className="mt-2 text-xs text-[#5f514b]">
              {isSignIn ? "Use your saved username to find your profile." : "Use the same username next time to load your profile."}
            </p>
            {authError && <p className="mt-3 text-sm text-[#9c3d3d]">{authError}</p>}
          </div>

          {!isSignIn && (
            <div className="rounded-[24px] border border-white/70 bg-white/50 p-5">
              <p className="mb-3 text-sm font-medium text-[#544b47]">Choose an icon</p>
              <div className="grid grid-cols-5 gap-2">
                {profileIcons.map((icon) => (
                  <button
                    key={icon.id}
                    onClick={() => setProfileIcon(icon.id)}
                    className={`flex h-12 items-center justify-center rounded-2xl border text-2xl transition ${
                      profileIcon === icon.id ? "border-[#c8b3eb] bg-[#f3ebff] shadow-[0_8px_20px_rgba(143,109,185,0.1)]" : "border-[#eadbcb] bg-white/80"
                    }`}
                    aria-label={icon.label}
                  >
                    {icon.emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {!isSignIn && (
          <div className="mt-6 rounded-[24px] border border-white/70 bg-white/50 p-5">
            <label className="mb-2 block text-sm font-medium text-[#544b47]">Goal (optional)</label>
            <input
              value={profileGoal}
              onChange={(event) => setProfileGoal(event.target.value)}
              placeholder="For example: get better at React"
              className="w-full rounded-2xl border border-[#eadbcb] bg-white/80 px-4 py-3 text-base text-[#2a211d] outline-none placeholder:text-[#7f736d] focus:border-[#c8b3eb]"
            />
            <p className="mt-2 text-xs text-[#5f514b]">This sits in your profile, so it does not interrupt the main check-in flow.</p>
          </div>
        )}

        {savedProfiles.length > 0 && (
          <div className="mt-6 rounded-[24px] border border-white/70 bg-white/50 p-5">
            <p className="mb-3 text-sm font-medium text-[#544b47]">Existing profiles</p>
            <div className="flex flex-wrap gap-2">
              {savedProfiles.map((existing) => (
                <button
                  key={existing}
                  type="button"
                  onClick={async () => {
                    setProfileName(existing);
                    if (isSignIn) {
                      setAuthError("");
                      const response = await fetch(`/api/checkins?profileName=${encodeURIComponent(existing)}`);
                      const data = await response.json();
                      if (!response.ok || !data?.profile) return;
                      const profile = data.profile;
                      setProfileName(profile.display_name || existing);
                      setProfileIcon(profile.avatar || "owl");
                      setMessenger(profile.letter_messenger || "Owl");
                      setHistory(
                        (data.checkIns ?? []).flatMap((checkIn: any) =>
                          (checkIn.history ?? []).map((item: any) => ({
                            id: item.id || Date.now() + Math.random(),
                            title: item.action_label || "Progress",
                            status: item.status,
                            date: new Date(item.created_at).toLocaleDateString(),
                          })),
                        ),
                      );
                      setCheckInCount(countSavedCheckIns(data.checkIns ?? []));
                      setLetters(
                        (data.letters ?? []).map((letter: any) => ({
                          type: letter.type,
                          title: letter.title,
                          summary: letter.summary,
                          body: letter.body,
                        })),
                      );
                      setScreen("profile-view");
                    }
                  }}
                  className="rounded-full border border-[#eadbcb] bg-[#f7f0ee] px-3 py-1.5 text-xs text-[#3a2f2b]"
                >
                  {existing}
                </button>
              ))}
            </div>
          </div>
        )}

        {!isSignIn && (
          <div className="mt-6 rounded-[24px] border border-white/70 bg-white/50 p-5">
            <p className="mb-3 text-sm font-medium text-[#544b47]">Choose your letter messenger</p>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-5">
              {birdOptions.map((option) => {
                const selected = messenger === option;
                const birdGlyph =
                  option === "Owl" ? "🦉" :
                  option === "Raven" ? "🐦" :
                  option === "Phoenix" ? "🦅" :
                  option === "Fox" ? "🦊" :
                  "🐝";

                return (
                  <button
                    key={option}
                    onClick={() => setMessenger(option)}
                    className={`flex flex-col items-center rounded-[20px] border px-3 py-3 transition ${
                      selected ? "border-[#c8b3eb] bg-[#f3ebff] shadow-[0_8px_20px_rgba(143,109,185,0.1)]" : "border-[#eadbcb] bg-white/80"
                    }`}
                  >
                    <div className="text-3xl">{birdGlyph}</div>
                    <span className="mt-2 text-xs font-medium text-[#3a2f2b]">{option}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-8 flex justify-between gap-3">
          <button onClick={() => setScreen("welcome")} className="rounded-full border border-white/70 bg-white/60 px-4 py-2 text-[#3a302b]">
            Back
          </button>
          <button
            onClick={handleProfileSubmit}
            disabled={!profileName.trim()}
            className="rounded-full bg-[linear-gradient(135deg,#d9c8ef,#d6ead8)] px-6 py-3 font-medium text-[#2a211d] shadow-[0_10px_22px_rgba(143,109,185,0.2)] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSignIn ? "Sign in" : "Create profile"}
          </button>
        </div>
      </div>
    );
  };

  const WizardCharacter = ({ name, accent, mood }: { name: string; accent: string; mood: string }) => (
    <div className="rounded-[26px] border border-white/60 bg-white/35 p-4 shadow-[0_18px_40px_rgba(74,55,45,0.06)] backdrop-blur-md">
      <svg viewBox="0 0 140 140" className="mx-auto h-24 w-24" aria-label={name} role="img">
        <defs>
          <linearGradient id={`robe-${accent}`} x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor={accent} />
            <stop offset="100%" stopColor="#f5efe7" />
          </linearGradient>
        </defs>
        <circle cx="70" cy="48" r="22" fill="#f4d7c8" />
        <path d="M48 60 L92 60 L106 112 L34 112 Z" fill={`url(#robe-${accent})`} opacity="0.92" />
        <path d="M54 68 L70 84 L86 68" fill="none" stroke="#7c5d4d" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M58 42 L46 38 L48 54" fill="none" stroke="#4a3b39" strokeWidth="3" strokeLinecap="round" />
        <path d="M82 42 L94 38 L92 54" fill="none" stroke="#4a3b39" strokeWidth="3" strokeLinecap="round" />
        <circle cx="61" cy="48" r="2.2" fill="#3b2f2b" />
        <circle cx="79" cy="48" r="2.2" fill="#3b2f2b" />
        <path d="M62 58 Q70 64 78 58" fill="none" stroke="#7c5d4d" strokeWidth="3" strokeLinecap="round" />
        <path d="M46 100 L58 90 L70 100 L82 90 L94 100" fill="none" stroke="#f1e9e1" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M26 82 L42 68 L52 71" fill="none" stroke="#d9c8ef" strokeWidth="5" strokeLinecap="round" />
        <path d="M114 82 L98 68 L88 71" fill="none" stroke="#d9eadc" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <div className="mt-2 text-center">
        <p className="text-base font-semibold text-[#2a211d]">{name}</p>
        <p className="text-xs uppercase tracking-[0.14em] text-[#5f514b]">{mood}</p>
      </div>
    </div>
  );

  const renderIntroOne = () => (
    <div className="mx-auto w-full max-w-5xl rounded-[32px] border border-white/60 bg-[rgba(255,255,255,0.5)] p-8 shadow-[0_18px_60px_rgba(74,55,45,0.08)] backdrop-blur-xl md:p-10">
      <div className="grid items-center gap-8 md:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#8f6db9]">What Mydobby does</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#2a211d]">A calm place for the noise in your head.</h2>
          <p className="mt-4 text-lg leading-8 text-[#5f514b]">
            You tell it what is bothering you, how much time you have, and how much energy you really have. Then Mydobby helps you pick one simple next step instead of trying to fix everything at once.
          </p>
          <div className="mt-6 flex gap-3">
            <button onClick={() => setScreen("intro2")} className="rounded-full bg-[#d9c8ef] px-6 py-3 text-base font-medium text-[#2a211d] shadow-[0_10px_22px_rgba(143,109,185,0.2)]">
              Next
            </button>
            <button onClick={() => setScreen("mind")} className="rounded-full border border-white/70 bg-white/60 px-5 py-3 text-base font-medium text-[#3a2f2b]">
              Begin gently
            </button>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <WizardCharacter name="Bramble" accent="#d9c8ef" mood="guided" />
          <WizardCharacter name="Juniper" accent="#d9eadc" mood="steady" />
        </div>
      </div>
    </div>
  );

  const renderIntroTwo = () => (
    <div className="mx-auto w-full max-w-5xl rounded-[32px] border border-white/60 bg-[rgba(255,255,255,0.5)] p-8 shadow-[0_18px_60px_rgba(74,55,45,0.08)] backdrop-blur-xl md:p-10">
      <div className="grid items-center gap-8 md:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-[30px] border border-white/60 bg-[linear-gradient(135deg,rgba(255,255,255,0.5),rgba(233,242,235,0.7),rgba(246,236,229,0.7))] p-6 shadow-[0_18px_40px_rgba(74,55,45,0.06)]">
          <div className="flex items-center justify-center">
            <svg viewBox="0 0 220 170" className="h-40 w-full max-w-[220px]" aria-label="Magic guidance" role="img">
              <defs>
                <linearGradient id="magic-sheen" x1="0%" x2="100%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#d9c8ef" />
                  <stop offset="100%" stopColor="#d9eadc" />
                </linearGradient>
              </defs>
              <circle cx="110" cy="58" r="38" fill="rgba(255,255,255,0.2)" stroke="rgba(122,103,90,0.25)" />
              <path d="M65 118 C79 87, 141 87, 155 118" fill="none" stroke="#876a60" strokeWidth="5" strokeLinecap="round" />
              <path d="M77 123 L100 80 L122 123" fill="none" stroke="#876a60" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M58 98 L26 106" fill="none" stroke="url(#magic-sheen)" strokeWidth="7" strokeLinecap="round" />
              <path d="M163 97 L194 88" fill="none" stroke="url(#magic-sheen)" strokeWidth="7" strokeLinecap="round" />
              <path d="M104 40 L116 24 L126 40 L116 50 Z" fill="#f8dcc7" stroke="#7d645d" strokeWidth="2" />
              <circle cx="116" cy="33" r="8" fill="#f3d9cc" stroke="#7d645d" strokeWidth="2" />
              <path d="M110 62 Q116 76 122 62" fill="none" stroke="#3d2f2a" strokeWidth="4" strokeLinecap="round" />
            </svg>
          </div>
          <div className="mt-5 rounded-[24px] border border-white/70 bg-white/45 p-4 text-center backdrop-blur-sm">
            <p className="text-xs uppercase tracking-[0.18em] text-[#8f6db9]">Daily rhythm</p>
            <p className="mt-2 text-xl font-medium text-[#2a211d]">Notice → Choose → Reset → Return</p>
          </div>
        </div>

        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#8f6db9]">Plain and simple</p>
          <h2 className="mt-4 text-4xl font-semibold tracking-tight text-[#2a211d]">This is what it does.</h2>
          <p className="mt-4 text-lg leading-8 text-[#5f514b]">
            You write what feels heavy. You say how much time you have. You say how much energy you have. Then Mydobby gives you one small next step that feels possible.
          </p>

          <div className="mt-6 space-y-3 text-sm leading-7 text-[#4f453f]">
            <div className="rounded-[18px] border border-white/60 bg-white/40 p-3">
              <span className="font-semibold text-[#2a211d]">Check-in:</span> a quick honest note about what is going on in your head.
            </div>
            <div className="rounded-[18px] border border-white/60 bg-white/40 p-3">
              <span className="font-semibold text-[#2a211d]">Next step:</span> one simple action, not a giant plan.
            </div>
            <div className="rounded-[18px] border border-white/60 bg-white/40 p-3">
              <span className="font-semibold text-[#2a211d]">Letters:</span> messages from your future self, like a monthly note or a milestone update to look back on later.
            </div>
          </div>

          <div className="mt-6 flex justify-between gap-3">
            <button onClick={() => setScreen("intro1")} className="rounded-full border border-white/70 bg-white/60 px-4 py-2 text-[#3a2f2b]">
              Back
            </button>
            <button onClick={() => setScreen("mind")} className="rounded-full bg-[#d8c8ef] px-6 py-3 text-base font-medium text-[#2a211d] shadow-[0_10px_22px_rgba(143,109,185,0.2)]">
              Begin gently
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const PastelIllustration = () => (
    <div className="relative h-72 w-full overflow-hidden rounded-[30px] border border-[#eadbcb] bg-[radial-gradient(circle_at_top,_rgba(223,208,246,0.85),_rgba(247,240,233,0.88)_32%,_rgba(237,238,230,0.96)_100%)] p-4 shadow-[0_22px_50px_rgba(74,55,45,0.08)]">
      <div className="absolute inset-x-0 top-0 h-24 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.9),_rgba(255,255,255,0)_70%)]" />
      <div className="absolute left-7 top-8 h-14 w-14 rounded-full bg-[#efe4ff] shadow-[0_0_28px_rgba(163,129,208,0.3)]" />
      <div className="absolute right-9 top-9 h-16 w-16 rounded-full bg-[#e1f0e6] shadow-[0_0_28px_rgba(101,151,123,0.25)]" />
      <div className="absolute left-1/2 top-10 h-24 w-24 -translate-x-1/2 rounded-full border border-white/70 bg-[rgba(255,255,255,0.2)] backdrop-blur-sm" />
      <div className="absolute left-1/2 top-16 h-12 w-12 -translate-x-1/2 rounded-full bg-[#f7dfc2] shadow-[0_0_30px_rgba(245,196,127,0.2)]" />

      <div className="absolute bottom-5 left-1/2 w-[190px] -translate-x-1/2 rounded-[24px] border border-[#eadbcb] bg-[rgba(255,255,255,0.42)] p-3 shadow-[0_16px_35px_rgba(74,55,45,0.08)] backdrop-blur-md">
        <div className="mb-2 flex items-center justify-between">
          <div className="h-2.5 w-2.5 rounded-full bg-[#cbaef4]" />
          <div className="h-2.5 w-12 rounded-full bg-[#e9dfd7]" />
        </div>
        <div className="space-y-2">
          <div className="h-2.5 w-full rounded-full bg-[#f1e7de]" />
          <div className="h-2.5 w-5/6 rounded-full bg-[#e7f0e9]" />
          <div className="h-2.5 w-2/3 rounded-full bg-[#f7e5d6]" />
        </div>
      </div>

      <svg viewBox="0 0 260 186" className="absolute inset-x-0 bottom-0 mx-auto h-full w-full max-w-[260px]" aria-label="Magical owl companion" role="img">
        <defs>
          <linearGradient id="owl-robe" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#d9c8ef" />
            <stop offset="100%" stopColor="#ecdfd4" />
          </linearGradient>
          <linearGradient id="wand-glow" x1="0%" x2="100%" y1="0%" y2="100%">
            <stop offset="0%" stopColor="#f3d98a" />
            <stop offset="100%" stopColor="#d7b8ff" />
          </linearGradient>
        </defs>

        <path d="M70 120L105 88L140 120Z" fill="url(#owl-robe)" opacity="0.96" />
        <circle cx="105" cy="68" r="22" fill="#f4d7c8" />
        <path d="M84 60L59 48L68 72Z" fill="#4b3a36" />
        <path d="M126 60L151 48L142 72Z" fill="#4b3a36" />
        <circle cx="96" cy="68" r="3" fill="#2d2320" />
        <circle cx="114" cy="68" r="3" fill="#2d2320" />
        <path d="M98 80Q105 86 112 80" fill="none" stroke="#6a504a" strokeWidth="3" strokeLinecap="round" />
        <path d="M85 90L68 112" stroke="#6a504a" strokeWidth="3.5" strokeLinecap="round" />
        <path d="M125 90L142 112" stroke="#6a504a" strokeWidth="3.5" strokeLinecap="round" />

        <path d="M170 118L192 72" stroke="url(#wand-glow)" strokeWidth="6" strokeLinecap="round" />
        <circle cx="196" cy="62" r="7" fill="#f9e0a2" stroke="#7c6848" strokeWidth="2" />
        <circle cx="166" cy="126" r="5" fill="#d9c8ef" />
        <circle cx="185" cy="138" r="4.5" fill="#dfeee2" />
        <circle cx="152" cy="140" r="4.5" fill="#f6d3bf" />
        <path d="M192 71L203 60L213 70L202 81Z" fill="#f7e3b6" stroke="#7a6546" strokeWidth="1.5" />
      </svg>

      <div className="absolute bottom-10 right-8 flex h-16 w-16 items-center justify-center rounded-full bg-[rgba(255,255,255,0.52)] shadow-[0_12px_28px_rgba(110,92,73,0.12)] backdrop-blur-sm">
        <span className="text-2xl">✨</span>
      </div>
    </div>
  );

  const renderWelcome = () => (
    <div className="mx-auto w-full max-w-5xl rounded-[36px] border border-white/60 bg-[rgba(255,255,255,0.52)] p-6 shadow-[0_20px_70px_rgba(74,55,45,0.08)] backdrop-blur-xl md:p-8">
      <div className="grid items-center gap-8 md:grid-cols-[1.08fr_0.92fr]">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-white/70 bg-white/50 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#584d46] shadow-sm">
            Mydobby
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => {
                setAuthMode("signin");
                setScreen("profile");
              }}
              className="rounded-full border border-white/70 bg-white/70 px-6 py-3 text-base font-medium text-[#2a211d]"
            >
              Sign in
            </button>
            <button
              onClick={() => {
                setAuthMode("signup");
                setScreen("profile");
              }}
              className="rounded-full bg-[linear-gradient(135deg,#d9c8ef,#d6ead8)] px-6 py-3 text-base font-medium text-[#2a211d] shadow-[0_14px_30px_rgba(141,121,167,0.18)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              Sign up
            </button>
          </div>

          <h1 className="mt-6 text-4xl font-semibold tracking-[-0.04em] text-[#2a211d] md:text-5xl">A softer place to sort your thoughts.</h1>
          <p className="mt-4 max-w-xl text-lg leading-8 text-[#5d514b]">
            Mydobby helps you slow down for a minute, say what is bothering you, and figure out one small thing to do next. It is made for honest check-ins, simple planning, and quiet progress when life feels noisy.
          </p>

          <div className="mt-8 grid gap-3 md:grid-cols-3">
            <div className="rounded-[22px] border border-white/70 bg-white/55 p-4 shadow-[0_8px_24px_rgba(74,55,45,0.04)]">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#8f6db9]">Your letter</p>
              <p className="mt-2 text-sm leading-6 text-[#4f453f]">A kind note from your future self, built from your real progress.</p>
            </div>
            <div className="rounded-[22px] border border-white/70 bg-white/55 p-4 shadow-[0_8px_24px_rgba(74,55,45,0.04)]">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#6ba281]">What it does</p>
              <p className="mt-2 text-sm leading-6 text-[#4f453f]">Turns a messy mind dump into a realistic next step for the day.</p>
            </div>
            <div className="rounded-[22px] border border-white/70 bg-white/55 p-4 shadow-[0_8px_24px_rgba(74,55,45,0.04)]">
              <p className="text-[10px] uppercase tracking-[0.15em] text-[#b57f52]">How to use</p>
              <p className="mt-2 text-sm leading-6 text-[#4f453f]">Write what is in your mind, choose your time and energy, then act on the next step.</p>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => setScreen("intro1")}
              className="rounded-full border border-white/70 bg-white/60 px-5 py-3 text-base font-medium text-[#413b36]"
            >
              How it works
            </button>
          </div>
        </div>

        <PastelIllustration />
      </div>
    </div>
  );


  const renderMind = () => (
    <div className="mx-auto w-full max-w-2xl rounded-[32px] border border-[#eadbcb] bg-[rgba(255,255,255,0.72)] p-8 shadow-[0_18px_60px_rgba(74,55,45,0.08)] backdrop-blur-sm">
      <p className="text-sm uppercase tracking-[0.15em] text-[#8f6db9]">1 / 3</p>
      <h2 className="mt-3 text-3xl font-semibold text-[#2a211d]">What feels loud in your head right now?</h2>

      <div className="mt-5 flex flex-wrap gap-2">
        {demoThoughts.map((example) => (
          <button
            key={example}
            onClick={() => setMindDump(example)}
            className="rounded-full border border-[#eadbcb] bg-[#f8f2ee] px-3 py-1.5 text-xs text-[#3d352f] transition hover:bg-[#f1e9e1]"
          >
            Use example
          </button>
        ))}
      </div>

      <textarea
        value={mindDump}
        onChange={(event) => setMindDump(event.target.value)}
        rows={7}
        className="mt-6 w-full rounded-3xl border border-[#eadbcb] bg-white/80 p-4 text-base text-[#2a211d] outline-none ring-0 placeholder:text-[#7f736d] focus:border-[#c8b3eb]"
        placeholder="You can write anything: the mess in your head, the task you keep postponing, or the feeling you cannot name yet."
      />
      <div className="mt-6 flex justify-between gap-3">
        <button onClick={() => setScreen("welcome")} className="rounded-full border border-[#eadbcb] bg-[#f9f3ee] px-4 py-2 text-[#3a302b]">
          Back
        </button>
        <button
          onClick={() => setScreen("energy")}
          className="rounded-full bg-[#d9eadc] px-5 py-2.5 font-medium text-[#213127]"
          disabled={!mindDump.trim()}
        >
          Continue
        </button>
      </div>
    </div>
  );

  const renderEnergy = () => (
    <div className="mx-auto w-full max-w-2xl rounded-[32px] border border-[#eadbcb] bg-[rgba(255,255,255,0.72)] p-8 shadow-[0_18px_60px_rgba(74,55,45,0.08)] backdrop-blur-sm">
      <p className="text-sm uppercase tracking-[0.15em] text-[#8f6db9]">2 / 3</p>
      <h2 className="mt-3 text-3xl font-semibold text-[#2a211d]">How much room do you really have today?</h2>

      <div className="mt-6">
        <p className="mb-3 text-sm font-medium text-[#544b47]">Time</p>
        <div className="flex flex-wrap gap-3">
          {timeOptions.map((option) => (
            <button
              key={option}
              onClick={() => setTime(option)}
              className={`rounded-full border px-4 py-2 ${
                time === option ? "border-[#c8b3eb] bg-[#f3ebff] text-[#2a211d]" : "border-[#eadbcb] bg-white text-[#544b47]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        <p className="mb-3 text-sm font-medium text-[#544b47]">Energy</p>
        <div className="flex flex-wrap gap-3">
          {energyOptions.map((option) => (
            <button
              key={option}
              onClick={() => setEnergy(option)}
              className={`rounded-full border px-4 py-2 capitalize ${
                energy === option ? "border-[#b6d5b8] bg-[#edf6ee] text-[#213127]" : "border-[#eadbcb] bg-white text-[#544b47]"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-7 flex justify-between gap-3">
        <button onClick={() => setScreen("mind")} className="rounded-full border border-[#eadbcb] bg-[#f9f3ee] px-4 py-2 text-[#3a302b]">
          Back
        </button>
        <button onClick={() => setScreen("step")} className="rounded-full bg-[#d8c8ef] px-5 py-2.5 font-medium text-[#2a211d]">
          Continue
        </button>
      </div>
    </div>
  );

  const renderGoal = () => (
    <div className="mx-auto w-full max-w-2xl rounded-[32px] border border-[#eadbcb] bg-[rgba(255,255,255,0.72)] p-8 shadow-[0_18px_60px_rgba(74,55,45,0.08)] backdrop-blur-sm">
      <p className="text-sm uppercase tracking-[0.15em] text-[#8f6db9]">Profile goal</p>
      <h2 className="mt-3 text-3xl font-semibold text-[#2a211d]">Keep one goal in your profile.</h2>
      <p className="mt-2 text-[#5f514b]">This helps the AI lean on something real, but it does not interrupt the main check-in flow.</p>
      <input
        value={profileGoal}
        onChange={(event) => setProfileGoal(event.target.value)}
        className="mt-6 w-full rounded-3xl border border-[#eadbcb] bg-white/80 p-4 text-base text-[#2a211d] outline-none placeholder:text-[#7f736d] focus:border-[#c8b3eb]"
        placeholder="For example: get better at React, finish the portfolio, or start a writing habit"
      />
      <div className="mt-7 flex justify-between gap-3">
        <button onClick={() => setScreen("energy")} className="rounded-full border border-[#eadbcb] bg-[#f9f3ee] px-4 py-2 text-[#3a302b]">
          Back
        </button>
        <button
          onClick={() => {
            setGoal(profileGoal.trim());
            setScreen("step");
          }}
          className="rounded-full bg-[#d8c8ef] px-5 py-2.5 font-medium text-[#2a211d]"
        >
          Save goal
        </button>
      </div>
    </div>
  );

  const renderStep = () => (
    <div className="mx-auto w-full max-w-3xl rounded-[32px] border border-[#eadbcb] bg-[rgba(255,255,255,0.72)] p-8 shadow-[0_18px_60px_rgba(74,55,45,0.08)] backdrop-blur-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.15em] text-[#8f6db9]">A gentle action</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.03em] text-[#2a211d]">Your next small step</h2>
        </div>
        <button
          onClick={() => setScreen("letters")}
          className="rounded-full border border-[#eadbcb] bg-[#f9f3ee] px-4 py-2 text-sm font-medium text-[#3c322d]"
        >
          View letters
        </button>
      </div>

      <div className="mt-6 rounded-[28px] border border-[#eadbcb] bg-[linear-gradient(135deg,#f7f0ea,#f0f4ef,#f9f3ef)] p-6 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)] space-y-5">
        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#584d46]">What I noticed</p>
          <p className="mt-2 text-base leading-7 text-[#2a211d]">{aiPlan.heard}</p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#584d46]">What matters most</p>
          <p className="mt-2 text-base leading-7 text-[#2a211d]">{aiPlan.mattersMost}</p>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#584d46]">One small action</p>
          <div className="mt-2 rounded-[20px] border border-white/70 bg-white/55 p-4">
            <p className="text-lg font-semibold text-[#2a211d]">{aiPlan.actionLabel}</p>
            <p className="mt-2 text-sm leading-6 text-[#4f453f]">{aiPlan.actionWhy}</p>
          </div>
        </div>

        <div>
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#584d46]">Make the rest easier</p>
          <ul className="mt-2 space-y-2 text-sm leading-6 text-[#4f453f]">
            {aiPlan.arrangement.map((line) => (
              <li key={line} className="rounded-full border border-white/70 bg-white/45 px-3 py-2">{line}</li>
            ))}
          </ul>
        </div>

        <div className="rounded-[24px] border border-[#dfeae1] bg-[#edf6ee] p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#5f8a71]">AI goal update</p>
          <p className="mt-2 text-base leading-7 text-[#2a211d]">{aiGoalSuggestion}</p>
        </div>
      </div>

      <div className="mt-6 rounded-[24px] border border-[#eadbcb] bg-white/70 p-4">
        <label className="mb-2 block text-sm font-medium text-[#544b47]">Update your check-in and refresh the plan</label>
        <textarea
          value={stepDraft}
          onChange={(event) => setStepDraft(event.target.value)}
          rows={5}
          className="w-full rounded-2xl border border-[#eadbcb] bg-white/80 p-3 text-sm leading-6 text-[#2a211d] outline-none placeholder:text-[#7f736d] focus:border-[#c8b3eb]"
          placeholder="Write what feels heavy, or change the wording and click generate."
        />
        <div className="mt-3 flex flex-wrap gap-3">
          <button
            onClick={() => {
              const trimmed = stepDraft.trim();
              if (!trimmed) return;
              setMindDump(trimmed);
            }}
            className="rounded-full bg-[#d9eadc] px-4 py-2 text-sm font-medium text-[#213127] disabled:cursor-not-allowed disabled:opacity-50"
            disabled={!stepDraft.trim()}
          >
            Generate new plan
          </button>
          <button
            onClick={() => setStepDraft(mindDump)}
            className="rounded-full border border-[#eadbcb] bg-[#f9f3ee] px-4 py-2 text-sm text-[#3a302b]"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {[
          { label: "Done", value: "done" },
          { label: "Make it smaller", value: "partial" },
          { label: "Not today", value: "skipped" },
        ].map((action) => (
          <button
            key={action.value}
            onClick={async () => {
              addHistoryItem(action.value as Status);
              await saveCheckInToSupabase();
              setScreen("letters");
            }}
            className="rounded-2xl border border-[#eadbcb] bg-white px-4 py-3 text-sm font-medium text-[#3b302c] transition hover:bg-[#f8f3ef]"
          >
            {action.label}
          </button>
        ))}
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={() => setScreen("energy")} className="rounded-full border border-[#eadbcb] bg-[#f9f3ee] px-4 py-2 text-[#3a302b]">
          Back
        </button>
        <button
          onClick={() => generateLetter("milestone")}
          className="rounded-full bg-[#d8c8ef] px-5 py-2.5 font-medium text-[#2a211d] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isGeneratingLetter}
        >
          {isGeneratingLetter ? "Writing..." : "Write milestone letter"}
        </button>
        <button
          onClick={() => generateLetter("monthly")}
          className="rounded-full bg-[#d9eadc] px-5 py-2.5 font-medium text-[#213127] disabled:cursor-not-allowed disabled:opacity-60"
          disabled={isGeneratingLetter}
        >
          {isGeneratingLetter ? "Sending..." : "Send monthly letter"}
        </button>
      </div>
    </div>
  );

  const renderProfileView = () => (
    <div className="mx-auto w-full max-w-4xl rounded-[32px] border border-white/60 bg-[rgba(255,255,255,0.5)] p-8 shadow-[0_18px_60px_rgba(74,55,45,0.08)] backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-[#8f6db9]">Profile</p>
          <h2 className="mt-2 text-3xl font-semibold text-[#2a211d]">{profileName || "Your profile"}</h2>
        </div>
        <button onClick={() => setScreen("profile")} className="rounded-full border border-[#eadbcb] bg-[#f9f3ee] px-4 py-2 text-[#3a302b]">
          Change profile
        </button>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-[28px] border border-white/70 bg-white/60 p-5 text-center">
          <div className="text-5xl">{profileIcons.find((icon) => icon.id === profileIcon)?.emoji ?? "✨"}</div>
          <p className="mt-4 text-xs uppercase tracking-[0.14em] text-[#7d6a5d]">Profile icon</p>
          <p className="mt-2 text-xl font-semibold text-[#2a211d]">{profileIcons.find((icon) => icon.id === profileIcon)?.label ?? "Owl"}</p>
          <div className="mt-5 rounded-full border border-[#eadbcb] bg-[#f8f2ee] px-3 py-2 text-sm text-[#3d352f]">
            Messenger: {messenger}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-[24px] border border-[#eadbcb] bg-white/70 p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[#8f6db9]">Check-ins</p>
            <p className="mt-3 text-3xl font-semibold text-[#2a211d]">{checkInCount}</p>
          </div>
          <div className="rounded-[24px] border border-[#dfeae1] bg-[#edf6ee] p-5">
            <p className="text-xs uppercase tracking-[0.14em] text-[#5f8a71]">Letters</p>
            <p className="mt-3 text-3xl font-semibold text-[#2a211d]">{letters.length}</p>
          </div>
        </div>
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-[#eadbcb] bg-white/70 p-5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#8f6db9]">Your letter</p>
          <p className="mt-3 text-sm leading-6 text-[#4f453f]">A gentle note from your future self based on your check-ins and progress.</p>
        </div>
        <div className="rounded-[24px] border border-[#dfeae1] bg-[#edf6ee] p-5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#5f8a71]">What Mydobby can do</p>
          <p className="mt-3 text-sm leading-6 text-[#4f453f]">Turn your mind dump into one realistic next step and save a calm personal letter.</p>
        </div>
        <div className="rounded-[24px] border border-[#f1e0ca] bg-[#fff8f1] p-5">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#b57f52]">How to use</p>
          <p className="mt-3 text-sm leading-6 text-[#4f453f]">Write what is in your mind, choose your time and energy, then let the next step emerge.</p>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button onClick={() => setScreen("mind")} className="rounded-full bg-[linear-gradient(135deg,#d9c8ef,#d6ead8)] px-6 py-3 font-medium text-[#2a211d] shadow-[0_10px_22px_rgba(143,109,185,0.2)]">
          Let’s start
        </button>
        <button onClick={() => setScreen("letters")} className="rounded-full border border-[#eadbcb] bg-[#f9f3ee] px-4 py-2 text-[#3a302b]">
          View letters
        </button>
      </div>
    </div>
  );

  const renderLetters = () => (
    <div className="mx-auto w-full max-w-4xl space-y-6">
      <div className="rounded-[32px] border border-[#eadbcb] bg-[rgba(255,255,255,0.72)] p-8 shadow-[0_18px_60px_rgba(74,55,45,0.08)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.15em] text-[#8f6db9]">Progress archive</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#2a211d]">Your reflective history</h2>
          </div>
          <button onClick={() => setScreen("profile-view")} className="rounded-full border border-[#eadbcb] bg-[#f9f3ee] px-4 py-2 text-[#3a302b]">
            Back to profile
          </button>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-[#544b47]">Letter messenger</p>
          <div className="flex flex-wrap gap-2">
            {birdOptions.map((option) => (
              <button
                key={option}
                onClick={() => setMessenger(option)}
                className={`rounded-full border px-3 py-1.5 text-sm ${
                  messenger === option ? "border-[#c8b3eb] bg-[#f3ebff] text-[#2a211d]" : "border-[#eadbcb] bg-white text-[#544b47]"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {history.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-[#eadbcb] bg-[#fbf6f2] p-5 text-[#584d46] md:col-span-3">
              Your progress history is empty. Finish a small action to begin building momentum.
            </div>
          ) : (
            history.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[#eadbcb] bg-white/80 p-4">
                <p className="text-xs uppercase tracking-[0.12em] text-[#6b5d56]">{item.date}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#2a211d]">{item.title}</h3>
                <p className="mt-2 text-sm capitalize text-[#5f514b]">{item.status}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-5">
        {letters.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#eadbcb] bg-[#f9f4f0] p-6 text-[#584d46]">
            No letters yet. Pick a monthly or milestone letter to let your future self speak.
          </div>
        ) : (
          letters.map((letter, index) => (
            <div key={`${letter.title}-${index}`} className="rounded-[32px] border border-[#eadbcb] bg-[rgba(255,255,255,0.72)] p-8 shadow-[0_18px_60px_rgba(74,55,45,0.08)] backdrop-blur-sm">
              <div className="mb-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-[#f1e9e3] px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-[#584d46]">
                  {letter.type}
                </span>
                <span className="text-sm text-[#584d46]">{letter.title}</span>
              </div>
              <p className="whitespace-pre-line text-lg leading-8 text-[#2a211d]">{letter.body}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(242,226,214,0.8)_0%,_#f6f1ea_28%,_#f3eee7_100%)] px-4 py-8 text-[#2a211d] sm:px-6 lg:px-8">
      <div className="mx-auto max-w-6xl">
        {screen !== "welcome" && (
          <header className="mb-8 flex items-center justify-between rounded-full border border-[#eadbcb] bg-[rgba(255,255,255,0.72)] px-5 py-3 shadow-[0_12px_40px_rgba(74,55,45,0.08)] backdrop-blur-sm">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1e6d8] text-lg text-[#7c5d4d]">M</div>
              <div>
                <p className="text-xs uppercase tracking-[0.18em] text-[#5f514b]">Mydobby</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setAuthMode("signin");
                  setScreen("welcome");
                }}
                className="rounded-full border border-[#eadbcb] bg-white px-3 py-2 text-xs font-medium text-[#3b302c]"
              >
                Sign out
              </button>
              <button
                onClick={() => setScreen("letters")}
                className="rounded-full border border-[#eadbcb] bg-white px-4 py-2 text-sm font-medium text-[#3b302c]"
              >
                Letters
              </button>
            </div>
          </header>
        )}

        {screen === "welcome" && renderWelcome()}
        {screen === "profile" && renderProfile()}
        {screen === "profile-view" && renderProfileView()}
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
