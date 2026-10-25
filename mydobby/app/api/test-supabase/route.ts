import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function GET() {
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

  if (!url || !key) {
    return NextResponse.json({
      status: "missing_credentials",
      message: "Supabase URL or Publishable Key is missing from your .env.local file.",
      details: {
        hasUrl: !!url,
        hasKey: !!key,
        expectedVariables: [
          "NEXT_PUBLIC_SUPABASE_URL",
          "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        ],
      },
    }, { status: 200 });
  }

  try {
    const supabase = createClient(url, key);

    // Test 1: Check Auth service health
    const { data: authData, error: authError } = await supabase.auth.getSession();

    if (authError && authError.status !== 400 && authError.status !== 401) {
      return NextResponse.json({
        status: "connection_error",
        message: `Supabase returned an error: ${authError.message}`,
        details: { url, error: authError.message },
      }, { status: 200 });
    }

    // Test 2: Check tables existence (profiles, check_ins, letters)
    const [profilesCheck, checkInsCheck, lettersCheck] = await Promise.all([
      supabase.from("profiles").select("id").limit(1),
      supabase.from("check_ins").select("id").limit(1),
      supabase.from("letters").select("id").limit(1),
    ]);

    const tableErrors: string[] = [];
    if (profilesCheck.error && profilesCheck.error.code === "42P01") tableErrors.push("profiles");
    if (checkInsCheck.error && checkInsCheck.error.code === "42P01") tableErrors.push("check_ins");
    if (lettersCheck.error && lettersCheck.error.code === "42P01") tableErrors.push("letters");

    return NextResponse.json({
      status: "connected",
      message: tableErrors.length > 0
        ? `Connected to Supabase, but missing table(s): ${tableErrors.join(", ")}. Run supabase-schema.sql in the Supabase SQL Editor.`
        : "Successfully connected to your Supabase project! All tables (profiles, check_ins, letters) are detected.",
      details: {
        url,
        keyPrefix: key.slice(0, 15) + "...",
        sessionActive: !!authData?.session,
        authReachable: true,
        tablesReady: tableErrors.length === 0,
        missingTables: tableErrors,
      },
    }, { status: 200 });
  } catch (err: unknown) {
    const errorMessage = err instanceof Error ? err.message : String(err);
    return NextResponse.json({
      status: "failed",
      message: "Failed to connect to Supabase: " + errorMessage,
    }, { status: 500 });
  }
}
