import test from "node:test";
import assert from "node:assert/strict";

import { buildAiGoalUpdate, getMonthLetterTone } from "../lib/demo-data";
import { countSavedCheckIns, findActiveProfile, normalizeHistoryStatus } from "../lib/checkin-utils";

test("normalizeHistoryStatus maps the UI states to valid database values", () => {
  assert.equal(normalizeHistoryStatus("done"), "done");
  assert.equal(normalizeHistoryStatus("partial"), "partial");
  assert.equal(normalizeHistoryStatus("changed"), "blocked");
  assert.equal(normalizeHistoryStatus("skipped"), "blocked");
});

test("countSavedCheckIns counts actual check-in rows", () => {
  assert.equal(countSavedCheckIns([{ id: "1" }, { id: "2" }]), 2);
  assert.equal(countSavedCheckIns([]), 0);
  assert.equal(countSavedCheckIns(null), 0);
});

test("findActiveProfile refuses to auto-attach to the first profile when no username is provided", () => {
  const profiles = [
    { id: "p1", display_name: "alex" },
    { id: "p2", display_name: "test3-ai" },
  ];

  assert.equal(findActiveProfile(profiles, ""), null);
  assert.equal(findActiveProfile(profiles, "test3-ai")?.id, "p2");
});

test("getMonthLetterTone keeps early monthly letters honest before a full month passes", () => {
  const tone = getMonthLetterTone([
    { id: "demo-1", title: "Finish draft", status: "done", date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() },
  ]);

  assert.match(tone, /early monthly letter/i);
});

test("buildAiGoalUpdate turns a broad goal into a smaller next action", () => {
  const suggestion = buildAiGoalUpdate("Finish my portfolio", "I feel behind and overwhelmed", [
    { id: "demo-1", title: "Draft homepage", status: "partial", date: new Date().toISOString() },
  ]);

  assert.match(suggestion, /portfolio|next action|finish/i);
});
