"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";
import Messenger3D, { MessengerType } from "./components/Messenger3D";
import { supabase } from "../lib/supabase";
import type { User } from "@supabase/supabase-js";

type TimeOption = "10 min" | "20 min" | "45 min" | "1 hour+";
type EnergyLevel = "low" | "medium" | "high";
type Status = "done" | "partial" | "changed" | "skipped";

type HistoryItem = {
  id: number | string;
  title: string;
  status: Status;
  date: string;
};

type LetterType = "monthly" | "milestone";

const timeOptions: TimeOption[] = ["10 min", "20 min", "45 min", "1 hour+"];
const energyOptions: EnergyLevel[] = ["low", "medium", "high"];
const birdOptions: MessengerType[] = ["Owl", "Raven", "Phoenix", "Fox", "Hummingbird"];
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
  const [screen, setScreen] = useState<
    "welcome" | "intro1" | "intro2" | "mind" | "energy" | "goal" | "step" | "letters" | "sanctuary"
  >("welcome");
  const [mindDump, setMindDump] = useState("");
  const [time, setTime] = useState<TimeOption>("20 min");
  const [energy, setEnergy] = useState<EnergyLevel>("medium");
  const [goal, setGoal] = useState("");
  const [messenger, setMessenger] = useState<MessengerType>("Owl");
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [letters, setLetters] = useState<{ type: LetterType; title: string; body: string; summary: string }[]>([]);
  const [isLoadingStep, setIsLoadingStep] = useState(false);
  const [isGeneratingLetter, setIsGeneratingLetter] = useState(false);
  const [readingLetter, setReadingLetter] = useState<{
    type: LetterType;
    title: string;
    body: string;
    summary: string;
  } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [stepReason, setStepReason] = useState("");
  const [aiPlan, setAiPlan] = useState<{
    nextStep?: string;
    why?: string;
    priority?: string;
    currentLoad?: string;
    plan?: string;
    source?: string;
  } | null>(null);

  // Supabase Auth & Connection state
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authNotice, setAuthNotice] = useState<{ text: string; error?: boolean } | null>(null);
  const [isTestingSupabase, setIsTestingSupabase] = useState(false);
  const [supabaseStatus, setSupabaseStatus] = useState<{
    status: string;
    message: string;
    details?: { url?: string; keyPrefix?: string; sessionActive?: boolean; authReachable?: boolean; error?: string; tablesReady?: boolean; missingTables?: string[] };
  } | null>(null);

  // Supabase Sync & Error state (Requirement 5: Show real errors, never silently swallow)
  const [saveError, setSaveError] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load user data from Supabase tables
  const loadUserDataFromSupabase = useCallback(async (currentUser: User) => {
    if (!supabase) return;
    setIsSyncing(true);
    setSaveError(null);

    try {
      // 1. Load Profile
      const { data: profile, error: profileErr } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", currentUser.id)
        .maybeSingle();

      if (profileErr) {
        throw new Error(`Profile query error: ${profileErr.message} (Code: ${profileErr.code || "unknown"})`);
      }

      if (profile) {
        const loadedMindDump = profile.mind_dump ?? profile.current_mind_dump;
        if (loadedMindDump !== undefined && loadedMindDump !== null) {
          setMindDump(loadedMindDump);
        }
        const loadedTime = profile.time_budget ?? profile.current_time;
        if (loadedTime) setTime(loadedTime as TimeOption);
        const loadedEnergy = profile.energy_level ?? profile.current_energy;
        if (loadedEnergy) setEnergy(loadedEnergy as EnergyLevel);
        const loadedGoal = profile.goal ?? profile.current_goal;
        if (loadedGoal !== undefined && loadedGoal !== null) {
          setGoal(loadedGoal);
        }
        if (profile.messenger) setMessenger(profile.messenger as MessengerType);
        if (loadedMindDump || loadedGoal) {
          setScreen("step");
        }
      } else {
        // Initialize profile row in Supabase
        const { error: insErr } = await supabase.from("profiles").upsert({
          id: currentUser.id,
          email: currentUser.email,
          mind_dump: mindDump || "",
          time_budget: time,
          energy_level: energy,
          goal: goal || "",
          messenger: messenger,
          updated_at: new Date().toISOString(),
        });
        if (insErr) {
          throw new Error(`Profile init error: ${insErr.message} (Code: ${insErr.code || "unknown"})`);
        }
      }

      // 2. Load Check-Ins (Action History)
      const { data: checkIns, error: checkInsErr } = await supabase
        .from("check_ins")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (checkInsErr) {
        throw new Error(`Check-ins query error: ${checkInsErr.message} (Code: ${checkInsErr.code || "unknown"})`);
      }

      if (checkIns) {
        setHistory(
          checkIns.map((item) => ({
            id: item.id,
            title: item.title,
            status: item.status as Status,
            date: item.date,
          }))
        );
      }

      // 3. Load Letters
      const { data: lettersData, error: lettersErr } = await supabase
        .from("letters")
        .select("*")
        .eq("user_id", currentUser.id)
        .order("created_at", { ascending: false });

      if (lettersErr) {
        throw new Error(`Letters query error: ${lettersErr.message} (Code: ${lettersErr.code || "unknown"})`);
      }

      if (lettersData) {
        setLetters(
          lettersData.map((l) => ({
            type: l.type as LetterType,
            title: l.title,
            body: l.body,
            summary: l.summary || "",
          }))
        );
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(msg);
    } finally {
      setIsSyncing(false);
    }
  }, [mindDump, time, energy, goal, messenger]);

  // Sync profile edits (mindDump, time, energy, goal, messenger) to Supabase
  const syncProfileToSupabase = async (overrides?: {
    mindDump?: string;
    time?: TimeOption;
    energy?: EnergyLevel;
    goal?: string;
    messenger?: MessengerType;
  }) => {
    if (!supabase || !user) return;
    try {
      const payload = {
        id: user.id,
        email: user.email,
        mind_dump: overrides?.mindDump !== undefined ? overrides.mindDump : mindDump,
        time_budget: overrides?.time !== undefined ? overrides.time : time,
        energy_level: overrides?.energy !== undefined ? overrides.energy : energy,
        goal: overrides?.goal !== undefined ? overrides.goal : goal,
        messenger: overrides?.messenger !== undefined ? overrides.messenger : messenger,
        updated_at: new Date().toISOString(),
      };
      const { error } = await supabase.from("profiles").upsert(payload);
      if (error) {
        setSaveError(`Supabase Profile Save Failed: ${error.message} (Code: ${error.code || "unknown"})`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSaveError(`Supabase Profile Save Error: ${msg}`);
    }
  };

  // Supabase Auth lifecycle
  useEffect(() => {
    if (!supabase) return;

    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null;
      setUser(currentUser);
      if (currentUser) {
        loadUserDataFromSupabase(currentUser);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      const nextUser = session?.user ?? null;
      setUser(nextUser);
      if (nextUser) {
        await loadUserDataFromSupabase(nextUser);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [loadUserDataFromSupabase]);

  const checkSupabaseConnection = async () => {
    setIsTestingSupabase(true);
    setAuthNotice(null);
    try {
      const res = await fetch("/api/test-supabase");
      const data = await res.json();
      setSupabaseStatus(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setSupabaseStatus({
        status: "failed",
        message: "Connection request failed: " + msg,
      });
    } finally {
      setIsTestingSupabase(false);
    }
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supabase) {
      setAuthNotice({
        text: "Supabase client not initialized. Please verify NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY in your environment variables.",
        error: true,
      });
      return;
    }
    if (!authEmail || !authPassword) {
      setAuthNotice({ text: "Please enter both email and password.", error: true });
      return;
    }

    setAuthLoading(true);
    setAuthNotice(null);
    setSaveError(null);

    try {
      if (authMode === "signup") {
        const { data, error } = await supabase.auth.signUp({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        if (data.session && data.user) {
          setUser(data.user);
          setAuthNotice({ text: "Account created and signed in successfully!" });
          await loadUserDataFromSupabase(data.user);
        } else if (data.user && !data.session) {
          setAuthNotice({
            text: "Account registered! If 'Confirm email' is disabled in your Supabase dashboard, switch to 'Sign In' to log in immediately. Otherwise, verify via email.",
          });
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authEmail,
          password: authPassword,
        });
        if (error) throw error;
        if (data.user) {
          setUser(data.user);
          setAuthNotice({ text: "Logged in successfully!" });
          await loadUserDataFromSupabase(data.user);
        }
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setAuthNotice({ text: msg, error: true });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    if (!supabase) return;
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error", err);
    }
    setUser(null);
    setSaveError(null);
    setMindDump("");
    setTime("20 min");
    setEnergy("medium");
    setGoal("");
    setHistory([]);
    setLetters([]);
    setScreen("welcome");
    setAuthNotice({ text: "Logged out. You are now using Guest Mode (Local storage)." });
  };

  // Local storage backup for guest users only
  useEffect(() => {
    if (user) return; // Don't use guest local storage when authenticated
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
  }, [user]);

  useEffect(() => {
    if (user) return; // Only sync to local storage for guests
    const payload = { mindDump, time, energy, goal, messenger, history, letters };
    window.localStorage.setItem("mydobby-state", JSON.stringify(payload));
  }, [mindDump, time, energy, goal, messenger, history, letters, user]);

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

        setAiPlan(data);
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

  const activeNextStep = aiPlan?.nextStep || planInsight.nextStep;
  const activeWhy = aiPlan?.why || stepReason || planInsight.why;
  const activePriority = aiPlan?.priority || planInsight.priority;
  const activeCurrentLoad = aiPlan?.currentLoad || planInsight.currentLoad;
  const activePlan = aiPlan?.plan || planInsight.plan;
  const recommendedStep = isLoadingStep ? "Generating your next gentle step with Groq AI..." : activeNextStep;

  // Add Action Result & Save to Supabase check_ins
  const addHistoryItem = async (status: Status) => {
    const title = goal || "General momentum";
    const date = new Date().toLocaleDateString();
    const tempId = Date.now();

    const item: HistoryItem = {
      id: tempId,
      title,
      status,
      date,
    };

    if (status === "done" || status === "partial") {
      try {
        confetti({
          particleCount: 50,
          spread: 70,
          origin: { y: 0.65 },
          colors: ["#d9c8f4", "#cfeee3", "#ffd1dc", "#fff3bf"],
        });
      } catch {
        // ignore if canvas unavailable
      }
    }

    setHistory((prev) => [item, ...prev]);

    // Save to Supabase if authenticated
    if (supabase && user) {
      try {
        const { data, error } = await supabase
          .from("check_ins")
          .insert({
            user_id: user.id,
            title,
            status,
            date,
          })
          .select()
          .single();

        if (error) {
          setSaveError(`Supabase Action Save Failed: ${error.message} (Code: ${error.code || "unknown"})`);
        } else if (data) {
          setHistory((prev) =>
            prev.map((h) => (h.id === tempId ? { ...h, id: data.id } : h))
          );
        }
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        setSaveError(`Supabase Action Save Error: ${msg}`);
      }
    }
  };

  // Generate Letter & Save to Supabase letters
  const generateLetter = async (type: LetterType) => {
    setIsGeneratingLetter(true);
    let letterResult: { type: LetterType; title: string; body: string; summary: string } | null = null;

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
      letterResult = { type, ...letter };
    } catch {
      const letter =
        type === "monthly"
          ? generateMonthlyLetter(mindDump, goal, messenger)
          : generateMilestoneLetter(mindDump, goal, history);

      letterResult = { type, ...letter };
    } finally {
      setIsGeneratingLetter(false);
    }

    if (letterResult) {
      try {
        confetti({
          particleCount: 65,
          spread: 85,
          origin: { y: 0.5 },
          colors: ["#ffd700", "#d9c8f4", "#cfeee3", "#ffffff"],
        });
      } catch {
        // ignore
      }

      setLetters((prev) => [letterResult!, ...prev]);
      setScreen("letters");

      // Save to Supabase if authenticated
      if (supabase && user) {
        try {
          const { error } = await supabase.from("letters").insert({
            user_id: user.id,
            type: letterResult.type,
            title: letterResult.title,
            body: letterResult.body,
            summary: letterResult.summary || "",
            messenger: messenger,
          });

          if (error) {
            setSaveError(`Supabase Letter Save Failed: ${error.message} (Code: ${error.code || "unknown"})`);
          }
        } catch (err: unknown) {
          const msg = err instanceof Error ? err.message : String(err);
          setSaveError(`Supabase Letter Save Error: ${msg}`);
        }
      }
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
    <div
      onClick={() => setScreen("sanctuary")}
      className="group relative h-64 w-full cursor-pointer overflow-hidden rounded-[28px] bg-[linear-gradient(135deg,#f9f1ff,#eefaf2,#fffaf0)] p-4 shadow-[0_20px_45px_rgba(139,123,168,0.12)] transition-transform hover:scale-[1.02]"
    >
      <div className="absolute left-8 top-8 h-20 w-20 rounded-full bg-[#f7dfe7]/80 animate-float-slow" />
      <div className="absolute right-10 top-10 h-24 w-24 rounded-full bg-[#dfeffc]/80 animate-float-slow" style={{ animationDelay: "1.5s" }} />
      <div className="absolute bottom-6 left-1/2 h-24 w-24 -translate-x-1/2 rounded-full bg-[#e1f4dd]/80 animate-float-slow" style={{ animationDelay: "3s" }} />

      <div className="absolute left-1/2 top-1/2 w-48 -translate-x-1/2 -translate-y-1/2 rounded-[26px] border border-white/90 bg-white/80 p-5 shadow-[0_20px_40px_rgba(143,127,174,0.14)] backdrop-blur-sm text-center">
        <div className="mb-2 flex items-center justify-center text-3xl">🕊️</div>
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6d5d8a]">3D Sanctuary</p>
        <p className="mt-1 text-[11px] text-[#7a6e8f]">Click to explore your interactive 3D messenger</p>
      </div>

      <div className="absolute bottom-4 right-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#f9e7da] shadow-[0_8px_20px_rgba(167,124,90,0.18)] transition-transform group-hover:scale-110">
        <span className="text-xl">🪽</span>
      </div>
    </div>
  );

  const renderWelcome = () => (
    <div className="mx-auto w-full max-w-5xl rounded-[36px] border border-white/80 bg-white/75 p-6 shadow-[0_20px_70px_rgba(144,118,167,0.14)] backdrop-blur-sm md:p-8 animate-fade-in">
      <div className="grid items-center gap-8 md:grid-cols-[1.08fr_0.92fr]">
        <div>
          <div className="mb-6 inline-flex rounded-full border border-[#eadff8] bg-[linear-gradient(135deg,#f5eefe,#eefaf3,#fff5e7)] px-3 py-1.5 text-xs font-medium uppercase tracking-[0.14em] text-[#6d5d8a] shadow-sm">
            Mydobby • AI Writing Sanctuary
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
              className="rounded-full border border-[#eadff8] bg-white/80 px-5 py-3 text-base font-medium text-[#413b52] hover:bg-white"
            >
              See how it works
            </button>
            <button
              onClick={() => setScreen("sanctuary")}
              className="rounded-full border border-[#d8c3f4] bg-[#f8f2ff] px-5 py-3 text-base font-medium text-[#584572] hover:bg-[#f1e5fc]"
            >
              🕊️ 3D Sanctuary
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
          onClick={() => {
            syncProfileToSupabase({ mindDump });
            setScreen("energy");
          }}
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
        <button
          onClick={() => {
            syncProfileToSupabase({ time, energy });
            setScreen("goal");
          }}
          className="rounded-full bg-[#d9c8f4] px-5 py-2.5 font-medium text-[#2a2340]"
        >
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
        <button
          onClick={() => {
            syncProfileToSupabase({ goal });
            setScreen("step");
          }}
          className="rounded-full bg-[#d9c8f4] px-5 py-2.5 font-medium text-[#2a2340]"
        >
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
          <span className="rounded-full border border-[#e8defb] bg-white/80 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-[#6b5c7b]">
            {aiPlan?.source === "groq" ? "Groq LLaMA 3.3" : "AI Recommended"}
          </span>
        </div>
        <p className="mt-2 text-2xl leading-relaxed text-[#2f2a36]">{recommendedStep}</p>
        <p className="mt-4 text-sm leading-7 text-[#564b68]">{activeWhy}</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] border border-[#eadff8] bg-[#faf6ff] p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#7b6894]">Priority</p>
          <p className="mt-3 text-base leading-7 text-[#2f2a36]">{activePriority}</p>
        </div>
        <div className="rounded-[24px] border border-[#dfece3] bg-[#f1faf5] p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#46715d]">Current work</p>
          <p className="mt-3 text-base leading-7 text-[#2f2a36]">{activeCurrentLoad}</p>
        </div>
        <div className="rounded-[24px] border border-[#f4e9d9] bg-[#fffaf2] p-4">
          <p className="text-[10px] uppercase tracking-[0.14em] text-[#8b6644]">Plan</p>
          <p className="mt-3 text-base leading-7 text-[#2f2a36]">{activePlan}</p>
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

  const renderSanctuary = () => (
    <div className="mx-auto w-full max-w-5xl space-y-6 animate-fade-in">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="text-xs uppercase tracking-[0.18em] text-[#7b6894]">Real-time 3D</span>
          <h2 className="mt-1 text-3xl font-semibold text-[#2f2a36]">Your Messenger Sanctuary</h2>
          <p className="mt-1 text-sm text-[#675c75]">
            Drag to orbit, scroll to zoom. Switch avatars below to see how each messenger carries your future letters.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setScreen("step")}
            className="rounded-full border border-[#eadff8] bg-white px-4 py-2 text-sm font-medium text-[#443d59] hover:bg-[#faf6ff]"
          >
            Back to Step
          </button>
          <button
            onClick={() => setScreen("letters")}
            className="rounded-full bg-[#d9c8f4] px-4 py-2 text-sm font-medium text-[#2a2340] hover:bg-[#cfbcee]"
          >
            Letters Archive
          </button>
        </div>
      </div>

      <div className="h-[560px] w-full rounded-[36px] border border-white/80 bg-white/80 p-2 shadow-[0_20px_70px_rgba(144,118,167,0.14)]">
        <Messenger3D
          currentMessenger={messenger}
          onSelectMessenger={(name) => {
            setMessenger(name);
            syncProfileToSupabase({ messenger: name });
          }}
          className="h-full w-full"
        />
      </div>
    </div>
  );

  const renderLetters = () => (
    <div className="mx-auto w-full max-w-4xl space-y-6 animate-fade-in">
      {/* 3D Messenger Companion Perch */}
      <div className="rounded-[32px] border border-white/80 bg-white/75 p-6 shadow-[0_18px_60px_rgba(126,109,134,0.12)]">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#7b6894]">3D Companion</span>
            <h3 className="text-xl font-semibold text-[#2f2a36]">Your {messenger} Messenger</h3>
          </div>
          <button
            onClick={() => setScreen("sanctuary")}
            className="rounded-full bg-[#f3eafc] px-3.5 py-1.5 text-xs font-medium text-[#584572] hover:bg-[#ebdcf7]"
          >
            Fullscreen Sanctuary ↗
          </button>
        </div>
        <div className="h-[300px] w-full overflow-hidden rounded-[24px]">
          <Messenger3D
            currentMessenger={messenger}
            onSelectMessenger={(name) => {
              setMessenger(name);
              syncProfileToSupabase({ messenger: name });
            }}
            isEmbedded={true}
            className="h-full w-full"
          />
        </div>
      </div>

      <div className="rounded-[32px] border border-white/70 bg-white/80 p-8 shadow-[0_18px_60px_rgba(126,109,134,0.12)] backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm uppercase tracking-[0.15em] text-[#7b6894]">Progress archive</p>
            <h2 className="mt-2 text-3xl font-semibold text-[#2f2a36]">Your reflective history</h2>
          </div>
          <button onClick={() => setScreen("step")} className="rounded-full border border-[#eadff8] px-4 py-2 text-[#3f3950] hover:bg-white">
            Back to step
          </button>
        </div>

        <div className="mt-6">
          <p className="mb-3 text-sm font-medium text-[#534d5b]">Letter messenger</p>
          <div className="flex flex-wrap gap-2">
            {birdOptions.map((option) => (
              <button
                key={option}
                onClick={() => {
                  setMessenger(option);
                  syncProfileToSupabase({ messenger: option });
                }}
                className={`rounded-full border px-3 py-1.5 text-sm transition ${
                  messenger === option ? "border-[#d1b8f3] bg-[#f3ebff] font-medium text-[#2f2144]" : "border-[#eadff8] bg-white text-[#4d4660] hover:bg-[#faf6ff]"
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
              <div key={item.id} className="rounded-2xl border border-[#eadff8] bg-[#fffafc] p-4 transition-transform hover:-translate-y-0.5">
                <p className="text-xs uppercase tracking-[0.12em] text-[#857796]">{item.date}</p>
                <h3 className="mt-2 text-lg font-semibold text-[#2f2a36]">{item.title}</h3>
                <p className="mt-2 text-sm capitalize text-[#584d69]">{item.status}</p>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="space-y-5">
        <h3 className="text-xl font-semibold text-[#2f2a36]">Letters From Your Future Self</h3>
        {letters.length === 0 ? (
          <div className="rounded-[28px] border border-dashed border-[#d9c8f4] bg-[#f9f4ff] p-6 text-[#564b68]">
            No letters yet. Return to the step page and tap &ldquo;Write milestone letter&rdquo; or &ldquo;Send monthly letter&rdquo; to hear from your future self.
          </div>
        ) : (
          letters.map((letter, index) => (
            <div
              key={`${letter.title}-${index}`}
              className="rounded-[32px] border border-white/80 bg-white/85 p-8 shadow-[0_18px_60px_rgba(126,109,134,0.12)] backdrop-blur-sm animate-letter-reveal"
            >
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-[#f3edf9] pb-3">
                <div className="flex items-center gap-2">
                  <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#f1ebff] text-xs">🪽</span>
                  <span className="rounded-full bg-[#f1ebff] px-2.5 py-1 text-[10px] uppercase tracking-[0.15em] text-[#6d5d8a]">
                    {letter.type} letter
                  </span>
                  <span className="text-xs text-[#877d94]">• Delivered by {messenger}</span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setReadingLetter(letter)}
                    className="rounded-full bg-[#f3eafc] px-3.5 py-1 text-xs font-medium text-[#55426e] hover:bg-[#ebdcf7]"
                  >
                    📜 Read in Ceremony
                  </button>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(letter.body);
                      setCopiedId(`${index}`);
                      setTimeout(() => setCopiedId(null), 2000);
                    }}
                    className="rounded-full border border-[#eadff8] bg-white px-3 py-1 text-xs text-[#55426e] hover:bg-[#faf6ff]"
                  >
                    {copiedId === `${index}` ? "✓ Copied" : "📋 Copy"}
                  </button>
                </div>
              </div>

              <h4 className="text-xl font-semibold text-[#2f2a36]">{letter.title}</h4>
              <p className="mt-3 whitespace-pre-line text-base leading-8 text-[#3f384a]">{letter.body}</p>

              {letter.summary && (
                <div className="mt-5 rounded-2xl bg-[#faf6ff] p-3 text-xs italic text-[#6e5f80]">
                  &ldquo;{letter.summary}&rdquo;
                </div>
              )}
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
              onClick={() => {
                setShowAuthModal(true);
                if (!supabaseStatus) {
                  checkSupabaseConnection();
                }
              }}
              className="flex items-center gap-1.5 rounded-full border border-[#eadff8] bg-white px-3.5 py-1.5 text-xs font-medium text-[#443d59] shadow-xs hover:bg-[#faf6ff]"
              title="Supabase connection status and authentication"
            >
              <span>{user ? `👤 ${user.email?.split("@")[0]}` : "☁️ Cloud / Login"}</span>
              {isSyncing && <span className="animate-spin text-[10px] text-[#7b6894]">↻</span>}
              <span
                className={`h-2 w-2 rounded-full ${
                  supabaseStatus?.status === "connected"
                    ? "bg-emerald-500"
                    : supabaseStatus?.status === "missing_credentials"
                    ? "bg-amber-400"
                    : "bg-purple-300"
                }`}
              ></span>
            </button>
            <button
              onClick={() => setScreen("sanctuary")}
              className={`rounded-full border px-3.5 py-1.5 text-xs font-medium transition ${
                screen === "sanctuary"
                  ? "border-[#cbb3ed] bg-[#d9c8f4] text-[#2a2340]"
                  : "border-[#eadff8] bg-white text-[#443d59] hover:bg-[#faf6ff]"
              }`}
            >
              🕊️ 3D Sanctuary
            </button>
            <button
              onClick={() => setScreen("letters")}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition ${
                screen === "letters"
                  ? "border-[#cbb3ed] bg-[#d9c8f4] text-[#2a2340]"
                  : "border-[#eadff8] bg-white text-[#443d59] hover:bg-[#faf6ff]"
              }`}
            >
              Letters
            </button>
            <button
              onClick={resetJourney}
              className="rounded-full border border-[#eadff8] bg-white px-3 py-1.5 text-xs font-medium text-[#443d59] hover:bg-[#faf6ff]"
            >
              Reset
            </button>
          </div>
        </header>

        {/* Real Error Banner (Requirement 5: Show real errors during testing, do not silently swallow) */}
        {saveError && (
          <div className="mb-6 flex items-start justify-between rounded-2xl border border-rose-300 bg-rose-50/95 p-4 text-rose-900 shadow-sm backdrop-blur-sm animate-fade-in">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <h4 className="text-sm font-semibold text-rose-950">Supabase Save Notice</h4>
                <p className="mt-1 text-xs leading-relaxed text-rose-800 font-mono break-all">{saveError}</p>
              </div>
            </div>
            <div className="ml-4 flex shrink-0 items-center gap-2">
              {user && (
                <button
                  onClick={() => loadUserDataFromSupabase(user)}
                  className="rounded-full border border-rose-300 bg-white px-2.5 py-1 text-xs font-medium text-rose-800 hover:bg-rose-50"
                >
                  ↻ Retry
                </button>
              )}
              <button
                onClick={() => setSaveError(null)}
                className="rounded-full border border-rose-300 bg-white px-2.5 py-1 text-xs font-medium text-rose-700 hover:bg-rose-100"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

        {screen === "welcome" && renderWelcome()}
        {screen === "intro1" && renderIntroOne()}
        {screen === "intro2" && renderIntroTwo()}
        {screen === "mind" && renderMind()}
        {screen === "energy" && renderEnergy()}
        {screen === "goal" && renderGoal()}
        {screen === "step" && renderStep()}
        {screen === "letters" && renderLetters()}
        {screen === "sanctuary" && renderSanctuary()}
      </div>

      {/* Ceremony Letter Modal */}
      {readingLetter && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-2xl rounded-[36px] border border-white/90 bg-[#fffdf9] p-8 shadow-[0_25px_80px_rgba(100,80,130,0.25)] animate-letter-reveal">
            {/* Wax seal header */}
            <div className="mb-6 flex items-center justify-between border-b border-[#f4eedf] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[linear-gradient(135deg,#e9dcff,#fcdde7)] text-2xl shadow-sm animate-seal">
                  🪽
                </div>
                <div>
                  <span className="text-xs uppercase tracking-[0.18em] text-[#86759c]">Delivered by {messenger}</span>
                  <h3 className="text-xl font-semibold text-[#2f2a36]">{readingLetter.title}</h3>
                </div>
              </div>
              <button
                onClick={() => setReadingLetter(null)}
                className="flex h-9 w-9 items-center justify-center rounded-full border border-[#eadff8] bg-white text-sm text-[#5a4d6e] hover:bg-[#faf6ff]"
              >
                ✕
              </button>
            </div>

            {/* Parchment Body */}
            <div className="max-h-[55vh] overflow-y-auto pr-2">
              <p className="whitespace-pre-line text-lg leading-9 font-serif text-[#322a3d]">
                {readingLetter.body}
              </p>
            </div>

            {/* Footer Summary & Action */}
            <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-[#f4eedf] pt-4">
              <p className="max-w-md text-xs italic text-[#726782]">
                &ldquo;{readingLetter.summary}&rdquo;
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(readingLetter.body);
                    setCopiedId("modal");
                    setTimeout(() => setCopiedId(null), 2000);
                  }}
                  className="rounded-full bg-[#f3eafc] px-4 py-2 text-xs font-medium text-[#584572] hover:bg-[#ebdcf7]"
                >
                  {copiedId === "modal" ? "✓ Copied" : "📋 Copy Letter"}
                </button>
                <button
                  onClick={() => setReadingLetter(null)}
                  className="rounded-full bg-[#6d5494] px-5 py-2 text-xs font-medium text-white shadow-sm hover:bg-[#5b4382]"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Supabase Cloud & Account Modal */}
      {showAuthModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35 p-4 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-lg rounded-[32px] border border-white/90 bg-white/95 p-6 shadow-[0_25px_80px_rgba(100,80,130,0.2)] md:p-8">
            <div className="mb-6 flex items-center justify-between border-b border-[#f0e8f8] pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#f0e6ff] text-xl">
                  ☁️
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-[#2f2a36]">Supabase Cloud & Account</h3>
                  <p className="text-xs text-[#786b88]">Status, connection test & authentication</p>
                </div>
              </div>
              <button
                onClick={() => setShowAuthModal(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full border border-[#eadff8] bg-white text-xs text-[#5a4d6e] hover:bg-[#faf6ff]"
              >
                ✕
              </button>
            </div>

            {/* Supabase Connection Test Card */}
            <div className="mb-6 rounded-2xl border border-[#ece4f5] bg-[#faf7fc] p-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-[#6a5b7d]">
                  Supabase Backend Status
                </span>
                <button
                  onClick={checkSupabaseConnection}
                  disabled={isTestingSupabase}
                  className="rounded-full border border-[#dcd0ec] bg-white px-2.5 py-1 text-xs text-[#584572] transition hover:bg-[#f5eefc] disabled:opacity-60"
                >
                  {isTestingSupabase ? "Testing..." : "↻ Test Connection"}
                </button>
              </div>

              <div className="mt-2.5">
                {isTestingSupabase ? (
                  <p className="text-xs text-[#776c85]">Pinging Supabase endpoints...</p>
                ) : supabaseStatus?.status === "connected" ? (
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/80 p-3">
                    <div className="flex items-center gap-2 text-xs font-medium text-emerald-800">
                      <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                      <span>Connected Successfully!</span>
                    </div>
                    <p className="mt-1 text-[11px] text-emerald-700">
                      Project URL: <span className="font-mono">{supabaseStatus.details?.url}</span>
                    </p>
                    <p className="text-[11px] text-emerald-700">
                      Auth Service: <span className="font-medium">Online & Reachable</span>
                    </p>
                  </div>
                ) : supabaseStatus?.status === "missing_credentials" ? (
                  <div className="rounded-xl border border-amber-200 bg-amber-50/90 p-3 text-xs text-amber-900">
                    <p className="font-medium">⚠️ Credentials not found in local environment</p>
                    <p className="mt-1 text-[11px] leading-relaxed text-amber-800">
                      Ensure <code className="rounded bg-amber-100 px-1 font-mono">NEXT_PUBLIC_SUPABASE_URL</code> and{" "}
                      <code className="rounded bg-amber-100 px-1 font-mono">NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY</code> are saved in your <code className="font-mono">.env.local</code> file and restart the dev server.
                    </p>
                  </div>
                ) : supabaseStatus ? (
                  <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-xs text-rose-800">
                    <p className="font-medium">Connection Notice</p>
                    <p className="mt-1 text-[11px]">{supabaseStatus.message}</p>
                  </div>
                ) : (
                  <p className="text-xs text-[#776c85]">Click &ldquo;Test Connection&rdquo; to test your Supabase setup.</p>
                )}
              </div>
            </div>

            {/* Account / Auth State */}
            {user ? (
              <div className="rounded-2xl border border-purple-100 bg-[#fbf9fe] p-5">
                <div className="flex items-center gap-3">
                  <div className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9dcff] text-lg">
                    ✨
                  </div>
                  <div>
                    <p className="text-xs text-[#7e6f92]">Signed in to Mydobby as</p>
                    <p className="text-sm font-semibold text-[#2f273b]">{user.email}</p>
                    <p className="mt-0.5 font-mono text-[10px] text-[#8e82a0]">UID: {user.id}</p>
                  </div>
                </div>

                <div className="mt-4 rounded-xl bg-white p-3 text-xs text-[#5f5370]">
                  <p className="font-semibold text-emerald-700">✓ Supabase Cloud Sync Active</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-[#7f7391]">
                    Your profile, check-ins, and future-self letters are synced directly to your Supabase tables (<code className="font-mono">profiles</code>, <code className="font-mono">check_ins</code>, <code className="font-mono">letters</code>) with Row Level Security.
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-between gap-2 border-t border-[#f0e8f8] pt-4">
                  <button
                    onClick={() => loadUserDataFromSupabase(user)}
                    disabled={isSyncing}
                    className="rounded-full border border-[#dcd0ec] bg-white px-3 py-1.5 text-xs font-medium text-[#584572] hover:bg-[#f5eefc] disabled:opacity-60"
                  >
                    {isSyncing ? "Syncing..." : "↻ Refresh Cloud Data"}
                  </button>
                  <button
                    onClick={handleSignOut}
                    className="rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs font-medium text-[#7d3b3b] hover:bg-rose-50"
                  >
                    Log Out
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <div className="mb-4 rounded-xl border border-[#eadff8] bg-[#fbf9fe] p-3 text-xs leading-relaxed text-[#5e5370]">
                  <p className="font-medium text-[#3b3248]">🌱 Guest Mode Active</p>
                  <p className="mt-1 text-[11px] text-[#736685]">
                    Mydobby does not force logins. Your thoughts and letters are safely saved in your browser&apos;s storage right now. If you want to backup across devices, you can log in or create a Supabase account below.
                  </p>
                </div>

                {/* Tab switch */}
                <div className="mb-4 flex rounded-full bg-[#f1e9f8] p-1 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setAuthNotice(null);
                    }}
                    className={`flex-1 rounded-full py-1.5 text-center font-medium transition ${
                      authMode === "signin"
                        ? "bg-white text-[#342b42] shadow-xs"
                        : "text-[#6c5e80] hover:text-[#342b42]"
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setAuthNotice(null);
                    }}
                    className={`flex-1 rounded-full py-1.5 text-center font-medium transition ${
                      authMode === "signup"
                        ? "bg-white text-[#342b42] shadow-xs"
                        : "text-[#6c5e80] hover:text-[#342b42]"
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleAuthSubmit} className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[#4f4362]">Email</label>
                    <input
                      type="email"
                      value={authEmail}
                      onChange={(e) => setAuthEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="mt-1 w-full rounded-xl border border-[#e1d5ef] bg-white px-3.5 py-2 text-xs text-[#2f273b] outline-none focus:border-[#a589cf] focus:ring-1 focus:ring-[#a589cf]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#4f4362]">Password</label>
                    <input
                      type="password"
                      value={authPassword}
                      onChange={(e) => setAuthPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1 w-full rounded-xl border border-[#e1d5ef] bg-white px-3.5 py-2 text-xs text-[#2f273b] outline-none focus:border-[#a589cf] focus:ring-1 focus:ring-[#a589cf]"
                    />
                  </div>

                  {authNotice && (
                    <div
                      className={`rounded-xl p-2.5 text-xs ${
                        authNotice.error
                          ? "border border-rose-200 bg-rose-50 text-rose-800"
                          : "border border-emerald-200 bg-emerald-50 text-emerald-800"
                      }`}
                    >
                      {authNotice.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={authLoading}
                    className="mt-2 w-full rounded-xl bg-[#6d5494] py-2.5 text-xs font-medium text-white shadow-sm transition hover:bg-[#5b4382] disabled:opacity-60"
                  >
                    {authLoading
                      ? "Processing..."
                      : authMode === "signin"
                      ? "Sign In"
                      : "Create Account"}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
