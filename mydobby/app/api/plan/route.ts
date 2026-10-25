import { readFileSync } from "fs";

import { parsePlanModelResponse } from "../../../lib/ai-response";

const demoPlanResponse = JSON.parse(
  readFileSync(new URL("../../data/demo-ai-response.json", import.meta.url), "utf8"),
) as {
  nextStep: string;
  why: string;
  priority: string;
  currentLoad: string;
  plan: string;
  source: string;
};

export async function POST(request: Request) {
  const { mindDump = "", goal = "", time = "20 min", energy = "medium" } = await request.json();

  const fallback = buildFallbackPlan(mindDump, goal, time, energy);
  const geminiKey = process.env.GEMINI_API_KEY;
  const openAiKey = process.env.OPENAI_API_KEY;
  const groqKey = process.env.GROQ_API_KEY;
  const preferredProvider = (process.env.AI_PROVIDER || "gemini").toLowerCase().trim();
  const providerOrder =
    preferredProvider === "openai"
      ? ["openai", "gemini", "groq"]
      : preferredProvider === "groq"
        ? ["groq", "gemini", "openai"]
        : ["gemini", "openai", "groq"];

  if (!geminiKey && !openAiKey && !groqKey) {
    return Response.json({
      ...demoPlanResponse,
      nextStep: fallback.nextStep,
      why: fallback.why,
      priority: fallback.priority,
      currentLoad: fallback.currentLoad,
      plan: fallback.plan,
      source: "demo",
    });
  }

  try {
    for (const provider of providerOrder) {
      if (provider === "gemini" && geminiKey) {
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
                      text: `You are Mydobby, a gentle AI companion for overwhelmed people. Return valid JSON only in one of these schemas:\n\nNormal: {"heard":"string","matters_most":"string","action":{"text":"string","minutes":5,"why":"string"},"arrange_rest":["string"],"safety":"ok","record":{"summary":"string","themes":["string"]}}\nCrisis: {"safety":"crisis","message":"string","action":null,"arrange_rest":[],"record":null}\n\nRules:\n- Use a warm, grounded tone and keep advice tiny and realistic.\n- "heard" should reflect the felt burden in the user's own words.\n- "matters_most" should name the 1-2 highest-priority tasks that matter now.\n- "action.text" must be a single tiny next step.\n- Keep "minutes" practical and small.\n- If the user sounds unsafe or in crisis, set safety to "crisis" and provide a brief supportive message.\n- Do not include markdown or commentary outside the JSON.\n\nMind dump: ${mindDump}\nGoal: ${goal || "No formal goal yet"}\nAvailable time: ${time}\nEnergy: ${energy}`,
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
          continue;
        }

        const data = await response.json();
        const content = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        const parsed = parsePlanModelResponse(content);

        if (parsed) {
          return Response.json(parsed);
        }
      }

      if (provider === "openai" && openAiKey) {
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
                  "You are Mydobby, a gentle AI companion for overwhelmed people. Output valid JSON only in one of these schemas: {\"heard\":\"string\",\"matters_most\":\"string\",\"action\":{\"text\":\"string\",\"minutes\":5,\"why\":\"string\"},\"arrange_rest\":[\"string\"],\"safety\":\"ok\",\"record\":{\"summary\":\"string\",\"themes\":[\"string\"]}} or {\"safety\":\"crisis\",\"message\":\"string\",\"action\":null,\"arrange_rest\":[],\"record\":null}. Keep the tone warm and grounded. Use very small practical actions. If the user sounds unsafe, output the crisis schema.",
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
          continue;
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        const parsed = parsePlanModelResponse(content);

        if (parsed) {
          return Response.json(parsed);
        }
      }

      if (provider === "groq" && groqKey) {
        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${groqKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            model: "openai/gpt-oss-120b",
            temperature: 0.75,
            messages: [
              {
                role: "system",
                content:
                  "You are Mydobby, a gentle AI companion for overwhelmed people. Output valid JSON only in one of these schemas: {\"heard\":\"string\",\"matters_most\":\"string\",\"action\":{\"text\":\"string\",\"minutes\":5,\"why\":\"string\"},\"arrange_rest\":[\"string\"],\"safety\":\"ok\",\"record\":{\"summary\":\"string\",\"themes\":[\"string\"]}} or {\"safety\":\"crisis\",\"message\":\"string\",\"action\":null,\"arrange_rest\":[],\"record\":null}. Keep the tone warm and grounded. Use very small practical actions. If the user sounds unsafe, output the crisis schema.",
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
          continue;
        }

        const data = await response.json();
        const content = data?.choices?.[0]?.message?.content;
        const parsed = parsePlanModelResponse(content);

        if (parsed) {
          return Response.json(parsed);
        }
      }
    }
  } catch {
    return Response.json({
      ...demoPlanResponse,
      nextStep: fallback.nextStep,
      why: fallback.why,
      priority: fallback.priority,
      currentLoad: fallback.currentLoad,
      plan: fallback.plan,
      source: "demo",
    });
  }

  return Response.json({
    ...demoPlanResponse,
    nextStep: fallback.nextStep,
    why: fallback.why,
    priority: fallback.priority,
    currentLoad: fallback.currentLoad,
    plan: fallback.plan,
    source: "demo",
  });
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
