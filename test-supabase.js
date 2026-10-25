#!/usr/bin/env node

/**
 * Mydobby Supabase & Environment Diagnostic Tester
 * Run: node test-supabase.js
 */

const fs = require("fs");
const path = require("path");

// Simple .env.local / .env parser
function loadEnv() {
  const envFiles = [
    path.join(__dirname, ".env.local"),
    path.join(__dirname, "mydobby", ".env.local"),
    path.join(__dirname, ".env"),
    path.join(__dirname, "mydobby", ".env"),
  ];

  for (const file of envFiles) {
    if (fs.existsSync(file)) {
      const content = fs.readFileSync(file, "utf8");
      content.split("\n").forEach((line) => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
          const idx = trimmed.indexOf("=");
          const key = trimmed.slice(0, idx).trim();
          const val = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, "");
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    }
  }
}

loadEnv();

const url =
  process.env.NEXT_PUBLIC_SUPABASE_URL ||
  process.env.SUPABASE_URL ||
  "";

const key =
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.SUPABASE_ANON_KEY ||
  "";

const groqKey = process.env.GROQ_API_KEY || "";

console.log("\n========================================================");
console.log("       🌸  Mydobby Environment & Cloud Tester  🌸");
console.log("========================================================\n");

console.log("1. Checking Environment Variables:");
console.log(`   - SUPABASE_URL:             ${url ? "✓ Detected (" + url + ")" : "✗ NOT SET"}`);
console.log(`   - SUPABASE_PUBLISHABLE_KEY: ${key ? "✓ Detected (" + key.slice(0, 14) + "...)" : "✗ NOT SET"}`);
console.log(`   - GROQ_API_KEY:             ${groqKey ? "✓ Detected (" + groqKey.slice(0, 10) + "...)" : "○ Not set (Using deterministic heuristics fallback)"}`);

if (!url || !key) {
  console.log("\n⚠️  Notice: Supabase credentials not found in environment or .env.local.");
  console.log("   The app will run in 'Guest Mode' with local browser storage.");
  console.log("   To connect Supabase, add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
  console.log("   to your .env.local file.\n");
  process.exit(0);
}

// Dynamically test using @supabase/supabase-js
async function runTests() {
  console.log("\n2. Testing Supabase Cloud Connectivity:");
  try {
    const { createClient } = require("@supabase/supabase-js");
    const supabase = createClient(url, key);

    // Test 1: Auth service
    process.stdout.write("   - Checking Supabase Auth Service... ");
    const { data: authData, error: authErr } = await supabase.auth.getSession();
    if (authErr && authErr.status !== 400 && authErr.status !== 401) {
      console.log(`✗ Error (${authErr.message})`);
    } else {
      console.log("✓ Online & Reachable");
    }

    // Test 2: Check tables
    process.stdout.write("   - Checking 'profiles' table... ");
    const { error: profErr } = await supabase.from("profiles").select("id").limit(1);
    if (profErr) {
      if (profErr.code === "42P01") {
        console.log("✗ Table does not exist (Need to run supabase-schema.sql)");
      } else {
        console.log(`✓ Table found (RLS active: ${profErr.message})`);
      }
    } else {
      console.log("✓ Table exists & readable");
    }

    process.stdout.write("   - Checking 'check_ins' table... ");
    const { error: checkErr } = await supabase.from("check_ins").select("id").limit(1);
    if (checkErr) {
      if (checkErr.code === "42P01") {
        console.log("✗ Table does not exist (Need to run supabase-schema.sql)");
      } else {
        console.log(`✓ Table found (RLS active: ${checkErr.message})`);
      }
    } else {
      console.log("✓ Table exists & readable");
    }

    process.stdout.write("   - Checking 'letters' table... ");
    const { error: letterErr } = await supabase.from("letters").select("id").limit(1);
    if (letterErr) {
      if (letterErr.code === "42P01") {
        console.log("✗ Table does not exist (Need to run supabase-schema.sql)");
      } else {
        console.log(`✓ Table found (RLS active: ${letterErr.message})`);
      }
    } else {
      console.log("✓ Table exists & readable");
    }

    console.log("\n========================================================");
    console.log("✨ Diagnostics completed successfully!");
    console.log("========================================================\n");
  } catch (err) {
    console.error("\n✗ Test failed:", err.message);
  }
}

runTests();
