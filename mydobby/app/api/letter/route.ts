import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const {
      type = "milestone",
      mindDump = "",
      goal = "",
      messenger = "Owl",
      history = [],
    } = await request.json();

    const groqKey = process.env.GROQ_API_KEY;

    if (groqKey) {
      const completedSteps = history.filter(
        (h: { status?: string }) => h.status === "done" || h.status === "partial"
      );

      const systemPrompt = `You are Kokoro, a warm, poignant, and deeply reflective companion writing a heartfelt letter from the user's Future Self.
You write in the voice of a caring future self looking back with gratitude, kindness, and grounded wisdom.
The messenger theme chosen by the user is the ${messenger}. Let this motif subtly inspire the warmth and tone (e.g. Owl for quiet stillness, Raven for deep transformation, Phoenix for resilient renewal, Fox for clever adaptability, Hummingbird for joyful lightness).

Respond strictly in valid JSON with these exact keys:
{
  "title": "A warm, poetic letter title (e.g. 'A note from tomorrow', or '${messenger} Letter: The Quiet Steps')",
  "body": "A heartfelt, moving multi-paragraph letter (3-4 paragraphs) addressed to 'Dear you'. Reference their honest mind dump, their goal, and the real steps they took. Remind them that progress is not perfection, and validate the quiet courage of showing up.",
  "summary": "A 1-2 sentence poetic summary of this letter's message."
}`;

      const userPrompt = `Letter Type: ${type}
Messenger Motif: ${messenger}
User's Mind Dump / Mental Season: "${mindDump || "Moving through uncertainty with small steps"}"
User's Core Goal: "${goal || "Cultivating meaning and quiet progress"}"
Total Actions Attempted: ${history.length}
Completed or Partial Actions: ${completedSteps.length}
Recent Action History: ${JSON.stringify(history.slice(0, 5))}`;

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
              max_tokens: 850,
              temperature: 0.8,
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
              if (parsed?.body) {
                return NextResponse.json({
                  title:
                    typeof parsed.title === "string"
                      ? parsed.title.trim()
                      : type === "monthly"
                      ? `${messenger} letter`
                      : "A note from your future self",
                  body: parsed.body.trim(),
                  summary:
                    typeof parsed.summary === "string"
                      ? parsed.summary.trim()
                      : `A reflection delivered by the ${messenger}.`,
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
    const fallback = buildFallbackLetter(type, mindDump, goal, messenger, history);
    return NextResponse.json({ ...fallback, source: "fallback" });
  } catch (error) {
    console.error("Error in letter route:", error);
    const fallback = buildFallbackLetter("milestone", "", "", "Owl", []);
    return NextResponse.json({ ...fallback, source: "fallback" }, { status: 200 });
  }
}

function buildFallbackLetter(
  type: string,
  mindDump: string,
  goal: string,
  messenger: string,
  history: { status?: string }[]
) {
  const completed = history.filter((item) => item.status === "done" || item.status === "partial").length;

  if (type === "monthly") {
    return {
      title: `${messenger} letter`,
      body: `Dear you,\n\nYou have been carrying a lot. The task is not to solve everything at once. It is to keep returning to the small, honest thing that matters.\n\nYou made room for ${goal || "your next meaningful move"}, even when your mind felt full. You kept showing up with a little more clarity and a little more courage. That is the quiet work that changes a life.\n\nYou do not need a perfect plan. You need presence, gentleness, and a next step. Keep listening to what is truly important.\n\nWith care,\nYour future self.`,
      summary: `A ${messenger.toLowerCase()} arrives carrying your real progress from ${mindDump.slice(0, 90) || "your current season"}${mindDump.length > 90 ? "..." : ""}`,
    };
  }

  return {
    title: "A note from your future self",
    body: `Dear you,\n\nI want you to remember this: you did not wait for perfect conditions. You kept moving with what was real.\n\nYou have already completed ${completed} meaningful actions${goal ? ` toward ${goal}` : ""}. That is not small. That is steady.\n\nThe reason this matters is not that you became flawless. It is that you kept returning to what actually mattered, even when your mind was loud.\n\nKeep honoring the rhythm of your life. Your next chapter is built from these daily, honest steps.\n\nWith love,\nYour future self.`,
    summary: `This note reflects the real steps you kept taking and the life you are still building from ${mindDump.slice(0, 80) || "your present moment"}${mindDump.length > 80 ? "..." : ""}`,
  };
}
