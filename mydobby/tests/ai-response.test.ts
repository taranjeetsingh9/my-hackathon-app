import assert from "node:assert/strict";
import test from "node:test";

import { parseLetterModelResponse, parsePlanModelResponse } from "../lib/ai-response";

test("parsePlanModelResponse accepts a valid plan payload", () => {
  const result = parsePlanModelResponse({
    nextStep: "Write the single next sentence that makes the next step obvious.",
    why: "This keeps the work small enough to feel possible.",
  });

  assert.deepEqual(result, {
    safety: "ok",
    nextStep: "Write the single next sentence that makes the next step obvious.",
    why: "This keeps the work small enough to feel possible.",
  });
});

test("parsePlanModelResponse rejects malformed payloads", () => {
  assert.equal(parsePlanModelResponse({ nextStep: 123, why: "bad" }), null);
  assert.equal(parsePlanModelResponse({}), null);
  assert.equal(parsePlanModelResponse("plain text" as any), null);
});

test("parsePlanModelResponse accepts the Groq structured payload", () => {
  const result = parsePlanModelResponse({
    heard: "Sam, it sounds like a long day, and now five things are competing for what's left of your evening. That's a lot to hold when you're tired.",
    matters_most: "Eating and not missing a bill. Those two protect tomorrow's you.",
    action: {
      text: "Check your electricity bill's due date",
      minutes: 5,
      why: "If it's days away, you can stop worrying tonight. If it's soon, you'll know.",
    },
    arrange_rest: [
      "Dinner next, and keep it simple.",
      "Start laundry while you eat. It runs by itself.",
      "Kitchen: wash only what you need for dinner.",
      "React: ten minutes if you have energy after eating, or skip tonight.",
    ],
    safety: "ok",
    record: {
      summary: "Tired after late work; bill, kitchen, dinner, laundry, React",
      themes: ["bills", "chores", "learning"],
    },
  });

  assert.deepEqual(result, {
    safety: "ok",
    nextStep: "Check your electricity bill's due date",
    why: "If it's days away, you can stop worrying tonight. If it's soon, you'll know.",
    heard: "Sam, it sounds like a long day, and now five things are competing for what's left of your evening. That's a lot to hold when you're tired.",
    matters_most: "Eating and not missing a bill. Those two protect tomorrow's you.",
    action: {
      text: "Check your electricity bill's due date",
      minutes: 5,
      why: "If it's days away, you can stop worrying tonight. If it's soon, you'll know.",
    },
    arrange_rest: [
      "Dinner next, and keep it simple.",
      "Start laundry while you eat. It runs by itself.",
      "Kitchen: wash only what you need for dinner.",
      "React: ten minutes if you have energy after eating, or skip tonight.",
    ],
    record: {
      summary: "Tired after late work; bill, kitchen, dinner, laundry, React",
      themes: ["bills", "chores", "learning"],
    },
  });
});

test("parsePlanModelResponse accepts the crisis-safe Groq payload", () => {
  const result = parsePlanModelResponse({
    safety: "crisis",
    message: "That sounds really heavy, and I'm glad you said it. You don't have to carry this alone. Please reach out to someone you trust, or a local crisis line, right now.",
    action: null,
    arrange_rest: [],
    record: null,
  });

  assert.deepEqual(result, {
    safety: "crisis",
    message: "That sounds really heavy, and I'm glad you said it. You don't have to carry this alone. Please reach out to someone you trust, or a local crisis line, right now.",
    action: null,
    arrange_rest: [],
    record: null,
  });
});

test("parseLetterModelResponse accepts a valid future-self letter payload", () => {
  const result = parseLetterModelResponse({
    title: "A note from your future self",
    body: "Dear you,\n\nYou have made progress.",
    summary: "A note about steady progress.",
  });

  assert.deepEqual(result, {
    title: "A note from your future self",
    body: "Dear you,\n\nYou have made progress.",
    summary: "A note about steady progress.",
  });
});

test("parseLetterModelResponse rejects malformed payloads", () => {
  assert.equal(parseLetterModelResponse({ title: "Hi", body: 123 }), null);
  assert.equal(parseLetterModelResponse({}), null);
  assert.equal(parseLetterModelResponse(null as any), null);
});
