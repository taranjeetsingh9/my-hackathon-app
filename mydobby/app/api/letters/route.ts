import { NextResponse } from "next/server";
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

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    const {
      profileName = "Anonymous",
      messenger = "Owl",
      type = "monthly",
      title = "Letter",
      summary = "",
      body = "",
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
              avatar: "owl",
              letter_messenger: messenger,
            })
            .select()
            .single(),
      );

      if (profileResult.error || !profileResult.data) {
        return NextResponse.json({ success: false, error: profileResult.error?.message || "Profile lookup failed" }, { status: 400 });
      }

      profile = profileResult.data;
    }

    const letterResult = await insertWithFallback(
      supabase,
      ["letters", "letter"],
      (table) =>
        supabase
          .from(table)
          .insert({
            profile_id: profile.id,
            type,
            title,
            summary,
            body,
          })
          .select()
          .single(),
    );

    if (letterResult.error || !letterResult.data) {
      return NextResponse.json({ success: false, error: letterResult.error?.message || "Letter save failed" }, { status: 400 });
    }

    return NextResponse.json({ success: true, letterId: letterResult.data.id });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
