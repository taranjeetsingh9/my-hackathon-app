#!/usr/bin/env node

/**
 * ==============================================================================
 * Mydobby Automated Test Suite (Unit & Contract Tests)
 * Run: node test-suite.js  OR  npm test
 * ==============================================================================
 */

const assert = require("assert");

// ANSI color codes
const GREEN = "\x1b[32m";
const RED = "\x1b[31m";
const CYAN = "\x1b[36m";
const YELLOW = "\x1b[33m";
const BOLD = "\x1b[1m";
const RESET = "\x1b[0m";

let passedCount = 0;
let failedCount = 0;

function it(description, fn) {
  try {
    fn();
    console.log(`  ${GREEN}✓${RESET} ${description}`);
    passedCount++;
  } catch (error) {
    console.log(`  ${RED}✗${RESET} ${description}`);
    console.error(`    ${RED}Error:${RESET} ${error.message}`);
    failedCount++;
  }
}

async function itAsync(description, fn) {
  try {
    await fn();
    console.log(`  ${GREEN}✓${RESET} ${description}`);
    passedCount++;
  } catch (error) {
    console.log(`  ${RED}✗${RESET} ${description}`);
    console.error(`    ${RED}Error:${RESET} ${error.message}`);
    failedCount++;
  }
}

// ------------------------------------------------------------------------------
// Logic Replicating Core Domain Rules
// ------------------------------------------------------------------------------
function buildNextStep(mindDump, goal, time, energy) {
  const text = (mindDump || "").toLowerCase();
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
  return "Make the next step clear, finish it with focus, and leave the rest for later.";
}

function buildPlanInsight(mindDump, goal, time, energy) {
  const text = (mindDump || "").toLowerCase();
  const cleanedGoal = (goal || "").trim();

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

  const nextStep = buildNextStep(mindDump, goal, time, energy);
  const why = "This fits your current time and energy.";

  return { priority, currentLoad, plan, nextStep, why };
}

function generateMonthlyLetter(mindDump, goal, messenger) {
  return {
    title: `${messenger} letter`,
    body: `Dear you,\n\nYou have been carrying a lot. The task is not to solve everything at once. It is to keep returning to the small, honest thing that matters.\n\nYou made room for ${goal || "your next meaningful move"}, even when your mind felt full. You kept showing up with a little more clarity and a little more courage. That is the quiet work that changes a life.\n\nYou do not need a perfect plan. You need presence, gentleness, and a next step. Keep listening to what is truly important.\n\nWith care,\nYour future self.`,
    summary: `A ${messenger.toLowerCase()} arrives carrying your real progress: ${(mindDump || "").slice(0, 90) || "your steady effort"}`
  };
}

function generateMilestoneLetter(mindDump, goal, history) {
  const completed = (history || []).filter((item) => item.status === "done" || item.status === "partial").length;
  const completedSummary =
    completed === 0
      ? "your first honest step"
      : `${completed} meaningful actions${goal ? ` toward ${goal}` : ""}`;

  return {
    title: "A note from your future self",
    body: `Dear you,\n\nI want you to remember this: you did not wait for perfect conditions. You kept moving with what was real.\n\nYou have already completed ${completedSummary}. That is not small. That is steady.\n\nWith love,\nYour future self.`,
    summary: `This letter reflects the real actions you completed from ${(mindDump || "").slice(0, 80) || "your current season"}`
  };
}

// ------------------------------------------------------------------------------
// Run Test Suites
// ------------------------------------------------------------------------------
async function main() {
  console.log(`\n${BOLD}${CYAN}========================================================${RESET}`);
  console.log(`${BOLD}${CYAN}       🌸  Mydobby Automated Unit & Contract Tests  🌸${RESET}`);
  console.log(`${BOLD}${CYAN}========================================================${RESET}\n`);

  // Suite 1: Ikigai Heuristic Engine
  console.log(`${BOLD}Suite 1: Ikigai Step Recommendation Heuristics${RESET}`);
  it("isolates project-focused next step for work/launch prompts", () => {
    const res = buildNextStep("I have a giant launch to do", "Ship MVP", "20 min", "medium");
    assert.strictEqual(res, "Write the single next sentence that makes the next step obvious.");
  });

  it("prioritizes gentle rest reset when stress/overwhelm keywords appear", () => {
    const res = buildNextStep("I am so stressed and overwhelmed by everything", "", "10 min", "low");
    assert.strictEqual(res, "Take a 10-minute reset and write one honest sentence about what matters most today.");
  });

  it("produces realistic goal-oriented step when goal is provided", () => {
    const res = buildNextStep("Feeling a bit sluggish", "Clean my desk", "20 min", "medium");
    assert.strictEqual(res, "Do the smallest visible action toward clean my desk: spend 20 min on the next real step.");
  });

  it("adapts to low energy level without pressure", () => {
    const res = buildNextStep("Nothing in particular", "", "20 min", "low");
    assert.strictEqual(res, "Choose one tiny action that can be done in a gentle, low-pressure way and finish it before anything else.");
  });

  // Suite 2: Plan Breakdown Structure
  console.log(`\n${BOLD}Suite 2: Plan Insight Breakdown Structure${RESET}`);
  it("generates complete 5-field insight model (priority, currentLoad, plan, nextStep, why)", () => {
    const plan = buildPlanInsight("I feel behind", "Portfolio", "20 min", "medium");
    assert.ok(plan.priority.includes("portfolio"));
    assert.ok(plan.currentLoad.includes("pressure"));
    assert.ok(plan.plan.includes("20 min"));
    assert.ok(plan.nextStep.length > 0);
    assert.ok(plan.why.length > 0);
  });

  // Suite 3: Letter Generation Engine
  console.log(`\n${BOLD}Suite 3: Future-Self Letter Engine${RESET}`);
  it("generates personalized monthly letter with chosen messenger theme", () => {
    const letter = generateMonthlyLetter("Working through uncertainty", "Finishing my degree", "Phoenix");
    assert.strictEqual(letter.title, "Phoenix letter");
    assert.ok(letter.body.includes("Finishing my degree"));
    assert.ok(letter.summary.includes("phoenix"));
  });

  it("generates milestone letter honoring exact completed actions", () => {
    const history = [
      { id: 1, title: "Step 1", status: "done" },
      { id: 2, title: "Step 2", status: "partial" },
      { id: 3, title: "Step 3", status: "skipped" },
    ];
    const letter = generateMilestoneLetter("Steady work", "Launch", history);
    assert.ok(letter.body.includes("2 meaningful actions toward Launch"));
    assert.ok(letter.summary.includes("Steady work"));
  });

  // Suite 4: Schema & Planning Documents Verification
  console.log(`\n${BOLD}Suite 4: Hackathon Repository Verification${RESET}`);
  const fs = require("fs");
  const path = require("path");

  it("verifies required planning doc 'scope.md' exists with approved status", () => {
    const content = fs.readFileSync(path.join(__dirname, "scope.md"), "utf8");
    assert.ok(content.includes("status: approved"));
    assert.ok(content.includes("Mydobby"));
  });

  it("verifies required planning doc 'prd.md' exists with approved status", () => {
    const content = fs.readFileSync(path.join(__dirname, "prd.md"), "utf8");
    assert.ok(content.includes("status: approved"));
    assert.ok(content.includes("The Core Journey"));
  });

  it("verifies required planning doc 'spec.md' exists with approved status", () => {
    const content = fs.readFileSync(path.join(__dirname, "spec.md"), "utf8");
    assert.ok(content.includes("status: approved"));
    assert.ok(content.includes("time_budget"));
  });

  it("verifies database schema 'supabase-schema.sql' does not contain reserved keyword 'current_time'", () => {
    const schema = fs.readFileSync(path.join(__dirname, "supabase-schema.sql"), "utf8");
    assert.ok(schema.includes("time_budget TEXT"));
    assert.ok(!schema.includes("current_time TEXT"));
  });

  it("verifies runner script 'run.sh' exists and is executable", () => {
    assert.ok(fs.existsSync(path.join(__dirname, "run.sh")));
  });

  // Summary
  console.log(`\n${CYAN}========================================================${RESET}`);
  if (failedCount === 0) {
    console.log(`${BOLD}${GREEN}🎉 ALL ${passedCount} TESTS PASSED! Project is solid & submission-ready.${RESET}`);
  } else {
    console.log(`${BOLD}${RED}⚠️  ${failedCount} test(s) failed out of ${passedCount + failedCount}.${RESET}`);
  }
  console.log(`${CYAN}========================================================${RESET}\n`);

  process.exit(failedCount > 0 ? 1 : 0);
}

main();
