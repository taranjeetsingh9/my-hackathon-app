export async function POST(request: Request) {
  const { mindDump = "", goal = "", time = "20 min", energy = "medium" } = await request.json();

  const fallback = buildFallbackPlan(mindDump, goal, time, energy);
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;

  if (!geminiKey && !openAiKey) {
    return Response.json({ ...fallback, source: "demo" });
  }

  try {
    if (geminiKey) {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `You are Mydobby, a gentle AI companion that helps overwhelmed people choose one small, meaningful next step. Return valid JSON only with keys "nextStep" and "why". Keep it kind, practical, and grounded in time and energy.\n\nMind dump: ${mindDump}\nGoal: ${goal || "No formal goal yet"}\nAvailable time: ${time}\nEnergy: ${energy}`,
                  },
                ],
              },
            ],
            generationConfig: {
              responseMimeType: "application/json",
            },
          }),
        },
      );

      if (!response.ok) {
        throw new Error("Gemini failed");
      }

      const data = await response.json();
      const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!content) {
        throw new Error("No content");
      }

      const parsed = JSON.parse(content);

      if (typeof parsed?.nextStep === "string" && parsed.nextStep.trim()) {
        return Response.json({
          nextStep: parsed.nextStep.trim(),
          why: typeof parsed.why === "string" ? parsed.why.trim() : "This fits your current time and energy.",
        });
      }
    }

    if (openAiKey) {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${openAiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          temperature: 0.75,
          messages: [
            {
              role: "system",
              content:
                "You are Mydobby, a gentle AI companion that helps overwhelmed people choose one small, meaningful next step. Respond with valid JSON only in this shape: {\"nextStep\": string, \"why\": string}. Keep it kind, practical, and grounded in time and energy. Do not be preachy or overly corporate.",
            },
            {
              role: "user",
              content: `Mind dump: ${mindDump}\nGoal: ${goal || "No formal goal yet"}\nAvailable time: ${time}\nEnergy: ${energy}`,
            },
          ],
          response_format: { type: "json_object" },
        }),
      });

      if (!response.ok) {
        throw new Error("OpenAI failed");
      }

      const data = await response.json();
      const content = data?.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error("No content");
      }

      const parsed = JSON.parse(content);

      if (typeof parsed?.nextStep === "string" && parsed.nextStep.trim()) {
        return Response.json({
          nextStep: parsed.nextStep.trim(),
          why: typeof parsed.why === "string" ? parsed.why.trim() : "This fits your current time and energy.",
        });
      }
    }
  } catch {
    return Response.json({ ...fallback, source: "demo" });
  }

  return Response.json({ ...fallback, source: "demo" });
}

function buildFallbackPlan(mindDump: string, goal: string, time: string, energy: string) {
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

  if (text.includes("work") || text.includes("project") || text.includes("launch")) {
    return {
      nextStep: "Write the single next sentence that makes the next step obvious.",
      why: "This creates momentum without asking you to solve the whole project at once.",
      priority,
      currentLoad,
      plan,
    };
  }

  if (text.includes("stress") || text.includes("overwhelmed") || text.includes("tired")) {
    return {
      nextStep: "Take a 10-minute reset and write one honest sentence about what matters most today.",
      why: "You do not need to solve everything; you need a gentle reset and a clear anchor.",
      priority,
      currentLoad,
      plan,
    };
  }

  if (text.includes("health") || text.includes("fitness") || text.includes("exercise")) {
    return {
      nextStep: "Take a short walk and notice how your body feels before you make any bigger plans.",
      why: "A small movement step helps your energy and attention reset without pressure.",
      priority,
      currentLoad,
      plan,
    };
  }

  if (goal) {
    return {
      nextStep: `Do the smallest visible action toward ${goal.toLowerCase()}: spend ${time.toLowerCase()} on the next real step.`,
      why: `The goal is important, but the real win is making the next action small enough to complete with ${energy} energy.`,
      priority,
      currentLoad,
      plan,
    };
  }

  if (energy === "low") {
    return {
      nextStep: "Choose one tiny action that can be done gently and finish it before anything else.",
      why: "A low-energy day still counts when the action is shaped to fit the day.",
      priority,
      currentLoad,
      plan,
    };
  }

  if (time === "10 min") {
    return {
      nextStep: "Pick one meaningful task, do it in a short focused block, and stop before your energy drains.",
      why: "Short, clear actions are often more sustainable than longer ambitious plans.",
      priority,
      currentLoad,
      plan,
    };
  }

  return {
    nextStep: "Make the next step clear, finish it with focus, and leave the rest for later.",
    why: "This keeps the work small enough to feel possible and meaningful enough to move you forward.",
    priority,
    currentLoad,
    plan,
  };
}
