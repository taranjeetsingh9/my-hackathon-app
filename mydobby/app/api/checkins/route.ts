import { NextResponse } from "next/server";
import { findActiveProfile } from "@/lib/checkin-utils";
import { createSupabaseServerClient } from "@/utils/supabase/server";

function isMissingTableError(error: { message?: string } | null | undefined) {
  const message = error?.message?.toLowerCase() ?? "";
  return message.includes("does not exist") || message.includes("relation") || message.includes("not found");
}

async function insertWithFallback<T>(
  supabase: any,
  preferredTables: string[],
  queryBuilder: (table: string) => any,
) {
  let lastError: { message?: string } | null = null;

  for (const table of preferredTables) {
    const result = queryBuilder(table);
    const response = await result;

    if (!response.error) {
      return response;
    }

    lastError = response.error;

    if (!isMissingTableError(response.error)) {
      return response;
    }
  }

  return { error: lastError ?? { message: "Table not found" } } as T;
}

export async function GET(request: Request) {
  try {
    const supabase = await createSupabaseServerClient();
    const url = new URL(request.url);
    const requestedProfileName = (url.searchParams.get("profileName") ?? "").trim();

    const profileListResult = await insertWithFallback(
      supabase,
      ["profiles", "profile"],
      (table) =>
        supabase
          .from(table)
          .select("*")
          .order("created_at", { ascending: false }),
    );

    const profiles = profileListResult?.data ?? [];
    const profile = findActiveProfile(profiles, requestedProfileName);

    if (!requestedProfileName) {
      return NextResponse.json({ profile: null, profiles, checkIns: [], letters: [] }, { status: 200 });
    }

    if (!profile) {
      return NextResponse.json({ profile: null, profiles, checkIns: [], letters: [] }, { status: 200 });
    }

    const checkInsForProfile = profile
      ? await insertWithFallback(
          supabase,
          ["check_ins", "checkin"],
          (table) =>
            supabase.from(table).select("*").eq("profile_id", profile.id).order("created_at", { ascending: false }),
        )
      : { data: [] };

    const letterResult = profile
      ? await insertWithFallback(
          supabase,
          ["letters", "letter"],
          (table) => supabase.from(table).select("*").eq("profile_id", profile.id).order("created_at", { ascending: false }),
        )
      : { data: [] };

    const checkIns = checkInsForProfile?.data ?? [];
    const letters = letterResult?.data ?? [];

    const checkInsWithHistory = await Promise.all(
      (checkIns as any[]).map(async (checkIn) => {
        const historyResult = await insertWithFallback(
          supabase,
          ["check_in_history", "checkin_history", "checkinhistory"],
          (table) =>
            supabase
              .from(table)
              .select("*")
              .eq("check_in_id", checkIn.id)
              .order("created_at", { ascending: false }),
        );

        return {
          ...checkIn,
          history: historyResult?.data ?? [],
        };
      }),
    );

    return NextResponse.json({
      profile,
      profiles,
      checkIns: checkInsWithHistory,
      letters,
    });
  } catch {
    return NextResponse.json({ profile: null, checkIns: [], letters: [] }, { status: 200 });
  }
}

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const {
      profileName = "Anonymous",
      profileIcon = "owl",
      messenger = "Owl",
      mindDump = "",
      goal = "",
      timeAvailable = "20 min",
      energyLevel = "medium",
      history = [],
    } = payload;

    const supabase = await createSupabaseServerClient();

    const profileNameTrimmed = String(profileName || "Anonymous").trim();
    const profileLookupResult = await insertWithFallback(
      supabase,
      ["profiles", "profile"],
      (table) =>
        supabase
          .from(table)
          .select("*")
          .eq("display_name", profileNameTrimmed)
          .maybeSingle(),
    );

    let profile = profileLookupResult.data;

    if (!profile) {
      const profileResult = await insertWithFallback(
        supabase,
        ["profiles", "profile"],
        (table) =>
          supabase
            .from(table)
            .insert({
              display_name: profileNameTrimmed || "Anonymous",
              avatar: profileIcon,
              letter_messenger: messenger,
            })
            .select()
            .single(),
      );

      if (profileResult.error || !profileResult.data) {
        return NextResponse.json({ success: false, error: profileResult.error?.message || "Profile save failed" }, { status: 400 });
      }

      profile = profileResult.data;
    } else {
      const updateResult = await insertWithFallback(
        supabase,
        ["profiles", "profile"],
        (table) =>
          supabase
            .from(table)
            .update({
              avatar: profileIcon,
              letter_messenger: messenger,
              updated_at: new Date().toISOString(),
            })
            .eq("id", profile.id)
            .select()
            .single(),
      );

      if (updateResult.data) {
        profile = updateResult.data;
      }
    }

    const checkInResult = await insertWithFallback(
      supabase,
      ["check_ins", "checkin"],
      (table) =>
        supabase
          .from(table)
          .insert({
            profile_id: profile.id,
            time_available: timeAvailable,
            energy_level: energyLevel === "low" ? 1 : energyLevel === "medium" ? 3 : 5,
            mind_dump: mindDump,
            goal,
            summary: goal || "General reflection",
          })
          .select()
          .single(),
    );

    if (checkInResult.error || !checkInResult.data) {
      return NextResponse.json({ success: false, error: checkInResult.error?.message || "Check-in save failed" }, { status: 400 });
    }

    const checkIn = checkInResult.data;
    const historyRows = Array.isArray(history)
      ? history.map((item) => ({
          check_in_id: checkIn.id,
          status: item.status,
          action_label: item.title || "Progress",
          details: item.date || "",
        }))
      : [];

    if (historyRows.length > 0) {
      const historyResult = await insertWithFallback(
        supabase,
        ["check_in_history", "checkin_history", "checkinhistory"],
        (table) => supabase.from(table).insert(historyRows),
      );

      if (historyResult.error) {
        return NextResponse.json({ success: false, error: historyResult.error.message }, { status: 400 });
      }
    }

    return NextResponse.json({
      success: true,
      profileId: profile.id,
      checkInId: checkIn.id,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
