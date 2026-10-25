export type DemoHistoryStatus = "done" | "partial" | "blocked" | "stuck";

export type DemoHistoryItem = {
  id: string | number;
  title: string;
  status: DemoHistoryStatus;
  date: string;
};

export type DemoLetter = {
  type: "monthly" | "milestone";
  title: string;
  summary: string;
  body: string;
  source: "ai" | "fallback";
};

export function createDemoHistory(): DemoHistoryItem[] {
  const today = new Date();
  const iso = (daysAgo: number) => {
    const date = new Date(today);
    date.setDate(today.getDate() - daysAgo);
    return date.toISOString();
  };

  return [
    {
      id: "demo-hist-1",
      title: "Finish portfolio draft",
      status: "done",
      date: iso(32),
    },
    {
      id: "demo-hist-2",
      title: "Reply to recruiter message",
      status: "partial",
      date: iso(21),
    },
    {
      id: "demo-hist-3",
      title: "Outline application tasks",
      status: "done",
      date: iso(12),
    },
    {
      id: "demo-hist-4",
      title: "Work on portfolio story",
      status: "blocked",
      date: iso(5),
    },
  ];
}

export function createDemoLetters(): DemoLetter[] {
  return [
    {
      type: "monthly",
      title: "A gentle look from your future self",
      summary: "This early monthly note reflects the first few honest steps you took and the momentum you are building.",
      body: "Dear you,\n\nThis is an early monthly note, not a perfect report card. You have already done more than you think. You kept showing up, wrote the hard truth, and made one next move instead of waiting for a perfect moment.\n\nYou are still building the habit of steady effort. That matters more than speed. The work you did this month is the kind that compounds quietly: a little clarity, a little courage, and a little more trust in your own rhythm.\n\nKeep making the next small decision. You do not need a dramatic leap. You need a faithful, honest step again and again.\n\nWith care,\nYour future self.",
      source: "ai",
    },
    {
      type: "milestone",
      title: "A note from your future self",
      summary: "You kept moving toward your goal even when the work felt uneven and unfinished.",
      body: "Dear you,\n\nI want you to remember this: meaningful progress is rarely loud. A lot of the work you have done has happened quietly, in the spaces where you were honest enough to continue.\n\nYou have already finished the parts that mattered most and you kept returning to the work even when the energy was uneven. That steadiness is the real skill.\n\nContinue choosing the next useful step, not the perfect version of the whole plan.\n\nWith love,\nYour future self.",
      source: "ai",
    },
  ];
}

export function getMonthLetterTone(history: Array<{ id?: string | number; title?: string; status?: string; date?: string }> = []) {
  const doneCount = history.filter((item) => item.status === "done" || item.status === "partial").length;
  const latestDate = history.reduce<Date | null>((acc, item) => {
    const itemDate = new Date(item.date ?? "");
    if (Number.isNaN(itemDate.getTime())) return acc;
    if (!acc || itemDate > acc) return itemDate;
    return acc;
  }, null);

  if (!latestDate) {
    return "This is an early monthly letter based on the first few check-ins, not a full month of data yet.";
  }

  const now = new Date();
  const daysSince = Math.max(0, Math.round((now.getTime() - latestDate.getTime()) / (1000 * 60 * 60 * 24)));

  if (daysSince < 25) {
    return "This is an early monthly letter based on the first few check-ins, not a full month of data yet.";
  }

  return doneCount > 0
    ? "This monthly letter reflects the real progress you made across the month and the momentum you built from it."
    : "This monthly letter is a gentle snapshot of the season so far, based on the work you have done and the pattern you are learning.";
}

export function buildAiGoalUpdate(goal: string, mindDump: string, history: Array<{ id?: string | number; title?: string; status?: string; date?: string }> = []) {
  const cleanGoal = goal.trim();
  const doneCount = history.filter((item) => item.status === "done" || item.status === "partial").length;
  const recentTheme = mindDump.trim().split(/\s+/).slice(0, 8).join(" ") || "your current season";

  if (!cleanGoal) {
    return "Make one small decision that moves your work forward, then stop before the rest of the list grows.";
  }

  if (doneCount >= 2) {
    return `Keep ${cleanGoal.toLowerCase()} as the main focus, but make the work smaller and more consistent so progress remains sustainable.`;
  }

  return `Refine ${cleanGoal.toLowerCase()} into one next action you can finish this week, using this context: ${recentTheme}.`;
}
