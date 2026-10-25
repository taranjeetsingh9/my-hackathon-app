export type PlanModelResponse = {
  nextStep?: string;
  why?: string;
  heard?: string;
  mattersMost?: string;
  matters_most?: string;
  actionLabel?: string;
  actionWhy?: string;
  arrangement?: string[];
  action?: {
    text?: string;
    minutes?: number;
    why?: string;
  } | null;
  arrange_rest?: string[];
  safety?: "ok" | "crisis" | string;
  message?: string;
  record?: {
    summary?: string;
    themes?: string[];
  } | null;
};

export type LetterModelResponse = {
  title: string;
  body: string;
  summary: string;
};

function coerceObject(value: unknown): Record<string, unknown> | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) {
      return null;
    }

    const normalized = trimmed.replace(/^```json\s*/i, "").replace(/```$/i, "").trim();
    const candidate = normalized.match(/\{[\s\S]*\}/)?.[0] ?? normalized;

    try {
      const parsed = JSON.parse(candidate);
      return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }

  return null;
}

export function parsePlanModelResponse(raw: unknown): PlanModelResponse | null {
  const parsed = coerceObject(raw);
  if (!parsed) {
    return null;
  }

  const safety = typeof parsed.safety === "string" ? parsed.safety.trim().toLowerCase() : "ok";

  if (safety === "crisis") {
    const message = typeof parsed.message === "string" ? parsed.message.trim() : "That sounds really heavy, and I'm glad you said it. You don't have to carry this alone.";
    return {
      safety: "crisis",
      message,
      action: null,
      arrange_rest: [],
      record: null,
    };
  }

  const nextStep = typeof parsed.nextStep === "string" ? parsed.nextStep.trim() : "";
  const why = typeof parsed.why === "string" ? parsed.why.trim() : "";
  const heard = typeof parsed.heard === "string" ? parsed.heard.trim() : "";
  const mattersMost = typeof parsed.mattersMost === "string" ? parsed.mattersMost.trim() : "";
  const mattersMostSnake = typeof parsed.matters_most === "string" ? parsed.matters_most.trim() : "";
  const actionLabel = typeof parsed.actionLabel === "string" ? parsed.actionLabel.trim() : "";
  const actionWhy = typeof parsed.actionWhy === "string" ? parsed.actionWhy.trim() : "";
  const arrangement = Array.isArray(parsed.arrangement)
    ? parsed.arrangement
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : [];
  const arrangeRest = Array.isArray(parsed.arrange_rest)
    ? parsed.arrange_rest
        .map((item) => (typeof item === "string" ? item.trim() : ""))
        .filter(Boolean)
    : arrangement;

  const actionObject = parsed.action && typeof parsed.action === "object" && !Array.isArray(parsed.action)
    ? (parsed.action as Record<string, unknown>)
    : null;

  const actionText = actionObject && typeof actionObject.text === "string" ? actionObject.text.trim() : "";
  const actionMinutes = actionObject && typeof actionObject.minutes === "number" ? actionObject.minutes : undefined;
  const actionWhyFromObject = actionObject && typeof actionObject.why === "string" ? actionObject.why.trim() : "";

  const recordObject = parsed.record && typeof parsed.record === "object" && !Array.isArray(parsed.record)
    ? (parsed.record as Record<string, unknown>)
    : null;

  const summary = recordObject && typeof recordObject.summary === "string" ? recordObject.summary.trim() : "";
  const themes = recordObject && Array.isArray(recordObject.themes)
    ? recordObject.themes.map((item) => (typeof item === "string" ? item.trim() : "")).filter(Boolean)
    : [];

  const resolvedNextStep = nextStep || actionText || actionLabel;
  const resolvedWhy = why || actionWhyFromObject || actionWhy;
  const resolvedHeard = heard || "";
  const resolvedMattersMost = mattersMost || mattersMostSnake || "";
  const resolvedAction = actionText || actionLabel
    ? {
        text: actionText || actionLabel,
        minutes: actionMinutes,
        why: actionWhyFromObject || actionWhy || "This is the smallest useful action for this day.",
      }
    : null;

  if (!resolvedNextStep || !resolvedWhy) {
    return null;
  }

  return {
    safety: "ok",
    nextStep: resolvedNextStep,
    why: resolvedWhy,
    ...(resolvedHeard ? { heard: resolvedHeard } : {}),
    ...(resolvedMattersMost ? { matters_most: resolvedMattersMost } : {}),
    ...(resolvedAction ? { action: resolvedAction } : {}),
    ...(arrangeRest.length > 0 ? { arrange_rest: arrangeRest } : {}),
    ...(summary || themes.length > 0 ? { record: { ...(summary ? { summary } : {}), ...(themes.length > 0 ? { themes } : {}) } } : {}),
  };
}

export function parseLetterModelResponse(raw: unknown): LetterModelResponse | null {
  const parsed = coerceObject(raw);
  if (!parsed) {
    return null;
  }

  const title = typeof parsed.title === "string" ? parsed.title.trim() : "";
  const body = typeof parsed.body === "string" ? parsed.body.trim() : "";
  const summary = typeof parsed.summary === "string" ? parsed.summary.trim() : "";

  if (!title || !body || !summary) {
    return null;
  }

  return { title, body, summary };
}
