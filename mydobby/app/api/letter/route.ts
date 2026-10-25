import { parseLetterModelResponse } from "../../../lib/ai-response";
import { getMonthLetterTone } from "../../../lib/demo-data";

export async function POST(request: Request) {
  const { type = "milestone", mindDump = "", goal = "", messenger = "Owl", history = [] } = await request.json();

  const fallback = buildFallbackLetter(type, mindDump, goal, messenger, history);
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
    return Response.json({ ...fallback, source: "demo" });
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
                      text: `You are Mydobby, a warm and reflective writing companion. Write a heartfelt letter from a future self. Keep it personal, grounded, and emotionally sincere. Return valid JSON only with keys "title", "body", and "summary".\n\nLetter type: ${type}\nMind dump: ${mindDump}\nGoal: ${goal || "No formal goal yet"}\nMessenger: ${messenger}\nRecent history: ${JSON.stringify(history.slice(0, 4))}`,
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
        const parsed = parseLetterModelResponse(content);

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
            temperature: 0.8,
            messages: [
              {
                role: "system",
                content:
                  "You are Mydobby, a warm and reflective writing companion. Write a heartfelt letter from a future self. Keep it personal, grounded, and emotionally sincere. Return valid JSON only with keys: title, body, summary.",
              },
              {
                role: "user",
                content: `Letter type: ${type}\nMind dump: ${mindDump}\nGoal: ${goal || "No formal goal yet"}\nMessenger: ${messenger}\nRecent history: ${JSON.stringify(history.slice(0, 4))}`,
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
        const parsed = parseLetterModelResponse(content);

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
            temperature: 0.8,
            messages: [
              {
                role: "system",
                content:
                  "You are Mydobby, a warm and reflective writing companion. Write a heartfelt letter from a future self. Keep it personal, grounded, and emotionally sincere. Return valid JSON only with keys: title, body, summary.",
              },
              {
                role: "user",
                content: `Letter type: ${type}\nMind dump: ${mindDump}\nGoal: ${goal || "No formal goal yet"}\nMessenger: ${messenger}\nRecent history: ${JSON.stringify(history.slice(0, 4))}`,
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
        const parsed = parseLetterModelResponse(content);

        if (parsed) {
          return Response.json(parsed);
        }
      }
    }
  } catch {
    return Response.json({ ...fallback, source: "demo" });
  }

  return Response.json({ ...fallback, source: "demo" });
}

function buildFallbackLetter(type: string, mindDump: string, goal: string, messenger: string, history: any[]) {
  const completed = history.filter((item) => item.status === "done" || item.status === "partial").length;

  if (type === "monthly") {
    const tone = getMonthLetterTone(
      history.length > 0
        ? history.map((item: any) => ({
            id: String(item.id ?? Math.random()),
            title: item.title || "Progress",
            status: item.status === "done" || item.status === "partial" ? "done" : "blocked",
            date: item.date || new Date().toISOString(),
          }))
        : [],
    );

    return {
      title: `${messenger} letter`,
      body: `Dear you,\n\n${tone}\n\nYou made room for ${goal || "your next meaningful move"}, even when your mind felt full. You kept showing up with a little more clarity and a little more courage. That is the quiet work that changes a life.\n\nYou do not need a perfect plan. You need presence, gentleness, and a next step. Keep listening to what is truly important.\n\nWith care,\nYour future self.`,
      summary: `A ${messenger.toLowerCase()} arrives carrying your real progress from ${mindDump.slice(0, 90) || "your current season"}${mindDump.length > 90 ? "..." : ""}`,
    };
  }

  return {
    title: "A note from your future self",
    body: `Dear you,\n\nI want you to remember this: you did not wait for perfect conditions. You kept moving with what was real.\n\nYou have already completed ${completed} meaningful actions${goal ? ` toward ${goal}` : ""}. That is not small. That is steady.\n\nThe reason this matters is not that you became flawless. It is that you kept returning to what actually mattered, even when your mind was loud.\n\nKeep honoring the rhythm of your life. Your next chapter is built from these daily, honest steps.\n\nWith love,\nYour future self.`,
    summary: `This note reflects the real steps you kept taking and the life you are still building from ${mindDump.slice(0, 80) || "your present moment"}${mindDump.length > 80 ? "..." : ""}`,
  };
}
