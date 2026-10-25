export type SavedHistoryStatus = "done" | "partial" | "stuck" | "blocked";

export function normalizeHistoryStatus(status: string): SavedHistoryStatus {
  switch (status) {
    case "done":
      return "done";
    case "partial":
      return "partial";
    case "changed":
    case "skipped":
      return "blocked";
    default:
      return "stuck";
  }
}

export function countSavedCheckIns(checkIns: unknown[] | null | undefined): number {
  return Array.isArray(checkIns) ? checkIns.length : 0;
}

export function findActiveProfile<T extends { display_name?: string | null; id?: string | number }>(profiles: T[], requestedProfileName?: string | null): T | null {
  const trimmed = (requestedProfileName ?? "").trim();

  if (!trimmed) {
    return null;
  }

  return profiles.find((profile) => (profile.display_name || "").toLowerCase() === trimmed.toLowerCase()) ?? null;
}
