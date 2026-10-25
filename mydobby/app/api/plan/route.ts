import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      mindDump = "",
      goal = "",
      time = "20 min",
      energy = "medium",
    } = await request.json();

    const groqKey = process.env.GROQ_API_KEY;

    if (groqKey) {
      const systemPrompt = `You are Kokoro, an empathetic, perceptive, and gentle AI companion inspired by the philosophy of Ikigai.
Your mission is to help overwhelmed people transform mental clutter into one kind, realistic, and visible next action that fits their actual time and energy.
Do NOT give them a huge list. Focus on ONE concrete next step.

Respond strictly in valid JSON with these exact fields:
{
  "nextStep": "A concrete, achievable, low-friction action (1-2 sentences) tailored to their available time and energy.",
  "why": "A gentle 1-2 sentence explanation of why this step is kind and realistic right now.",
  "priority": "A 1-sentence statement clarifying the core thing that matters most today.",
  "currentLoad": "An empathetic 1-sentence validation of what they are currently holding without judgment.",
  "plan": "A concise 1-sentence realistic container plan for their time block."
}`;

      const userPrompt = `User's current state:
- Mind dump: "${mindDump || "Feeling scattered and unsure where to start"}"
- Chosen goal: "${goal || "No specific goal chosen yet"}"
- Available time: ${time}
- Energy level: ${energy}`;

      const candidateModels = ["qwen/qwen3.8-27b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"];
      
      for (const model of candidateModels) {
        try {
          const groqResponse = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${groqKey}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              model,
              max_tokens: 500,
              temperature: 0.7,
              messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
              ],
              response_format: { type: "json_object" },
            }),
          });

          if (groqResponse.ok) {
            const groqData = await groqResponse.json();
            const content = groqData?.choices?.[0]?.message?.content;
            if (content) {
              const parsed = JSON.parse(content);
              if (parsed?.nextStep) {
                return NextResponse.json({
                  nextStep: parsed.nextStep.trim(),
                  why: parsed.why?.trim() || "Designed to match your current capacity.",
                  priority: parsed.priority?.trim() || (goal ? `Protect the ${goal} focus.` : "Anchor in what matters most today."),
                  currentLoad: parsed.currentLoad?.trim() || "You are holding a lot and making room for clarity.",
                  plan: parsed.plan?.trim() || `Spend ${time} calmly and stop before your energy drains.`,
                  source: "groq",
                  model,
                });
              }
            }
          }
        } catch (e) {
          console.warn(`Groq model ${model} failed, trying next`, e);
        }
      }
    }

    // Fallback if Groq key is absent or request fails
    const fallback = buildFallbackPlan(mindDump, goal, time, energy);
    return NextResponse.json({ ...fallback, source: "fallback" });
  } catch (error) {
    console.error("Error in plan route:", error);
    const fallback = buildFallbackPlan("", "", "20 min", "medium");
    return NextResponse.json({ ...fallback, source: "fallback" }, { status: 200 });
  }
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
      : "You are holding many thoughts and responsibilities; a smaller container will help you move forward.";

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

  if (cleanedGoal) {
    return {
      nextStep: `Do the smallest visible action toward ${cleanedGoal.toLowerCase()}: spend ${time.toLowerCase()} on the next real step.`,
      why: `The goal is important, but the real win is making the next action small enough to complete with ${energy} energy.`,
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
