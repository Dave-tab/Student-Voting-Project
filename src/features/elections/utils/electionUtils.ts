import type { Election, ElectionStatusType } from "../types";

export const INSTITUTIONAL_TIMEZONE = "Africa/Lagos";
export const TIMEZONE_LABEL = "West Africa Time";
export const TIMEZONE_ABBR = "WAT";

/**
 * Resolves the display lifecycle status string from an election record.
 * Normalizes between status object (e.g. from election_statuses) and string values.
 */
export function getElectionStatus(election: Election): ElectionStatusType {
  let statusName = "Scheduled";

  if (typeof election.status === "string") {
    statusName = election.status;
  } else if (election.status && typeof election.status.name === "string") {
    statusName = election.status.name;
  }

  const normalized = statusName.toLowerCase();

  if (normalized.includes("draft") || normalized.includes("plan")) {
    return "Draft";
  }
  if (normalized.includes("sched") || normalized.includes("upcom")) {
    return "Scheduled";
  }
  if (normalized.includes("open") || normalized.includes("active")) {
    return "Open";
  }
  if (normalized.includes("close") || normalized.includes("end")) {
    return "Closed";
  }
  if (normalized.includes("publish")) {
    return "Published";
  }
  if (normalized.includes("archiv")) {
    return "Archived";
  }

  return "Scheduled";
}

/**
 * Returns appropriate badge variant and label for election lifecycle state.
 */
export function getElectionStatusBadgeConfig(status: ElectionStatusType): {
  variant: "default" | "secondary" | "success" | "warning" | "destructive";
  label: string;
} {
  switch (status) {
    case "Open":
    case "Active":
      return { variant: "success", label: "Open for Voting" };
    case "Scheduled":
    case "Upcoming":
      return { variant: "warning", label: "Upcoming" };
    case "Closed":
    case "Ended":
      return { variant: "secondary", label: "Voting Closed" };
    case "Published":
      return { variant: "default", label: "Results Published" };
    case "Archived":
      return { variant: "default", label: "Archived" };
    case "Draft":
    case "Planning":
    default:
      return { variant: "secondary", label: "Draft" };
  }
}

/**
 * Calculates a presentation-only countdown string.
 */
export function getPresentationCountdown(election: Election): string | null {
  const status = getElectionStatus(election);
  const now = new Date().getTime();
  const start = new Date(election.start_datetime).getTime();
  const end = new Date(election.end_datetime).getTime();

  if (status === "Scheduled" || status === "Upcoming") {
    if (isNaN(start)) return null;
    const diff = start - now;
    if (diff <= 0) {
      return "Scheduled to open";
    }
    return formatTimeDifference(diff, "Voting opens in");
  }

  if (status === "Open" || status === "Active") {
    if (isNaN(end)) return null;
    const diff = end - now;
    if (diff <= 0) {
      return "Voting closing soon";
    }
    return formatTimeDifference(diff, "Voting closes in");
  }

  if (status === "Closed" || status === "Ended") {
    return "Voting has concluded";
  }

  if (status === "Archived") {
    return "Archived";
  }

  return null;
}

function formatTimeDifference(ms: number, prefix: string): string {
  const totalSeconds = Math.floor(ms / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);

  if (days > 0) {
    return `${prefix}: ${days}d ${hours}h ${minutes}m`;
  }
  if (hours > 0) {
    return `${prefix}: ${hours}h ${minutes}m`;
  }
  return `${prefix}: ${minutes}m`;
}

export interface DateFormatOptions {
  longDate?: boolean;
  withDayOfWeek?: boolean;
  separator?: string;
  includeTimezone?: boolean;
}

/**
 * Formats an ISO datetime string cleanly in institutional West Africa Time (WAT).
 * Example: "Saturday, 26 September 2026 · 9:00 AM" or "26 Sep 2026, 9:00 AM"
 */
export function formatElectionDate(
  isoString: string,
  options?: DateFormatOptions
): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "TBD";

    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: INSTITUTIONAL_TIMEZONE,
      day: "numeric",
      month: options?.longDate ? "long" : "short",
      year: "numeric",
    };

    if (options?.withDayOfWeek) {
      dateOptions.weekday = "long";
    }

    const dateFormatted = new Intl.DateTimeFormat("en-GB", dateOptions).format(d);

    const timeFormatted = new Intl.DateTimeFormat("en-US", {
      timeZone: INSTITUTIONAL_TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);

    const sep = options?.separator ?? (options?.withDayOfWeek ? " · " : ", ");
    const tz = options?.includeTimezone ? ` ${TIMEZONE_ABBR}` : "";

    return `${dateFormatted}${sep}${timeFormatted}${tz}`;
  } catch {
    return "TBD";
  }
}

/**
 * Alias for formatElectionDate for backward compatibility.
 */
export function formatElectionDateWAT(
  isoString: string,
  options?: DateFormatOptions
): string {
  return formatElectionDate(isoString, options);
}

/**
 * Formats date portion only in WAT.
 * Example: "26 September 2026"
 */
export function formatDateOnlyWAT(isoString: string, long = true): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "TBD";

    return new Intl.DateTimeFormat("en-GB", {
      timeZone: INSTITUTIONAL_TIMEZONE,
      day: "numeric",
      month: long ? "long" : "short",
      year: "numeric",
    }).format(d);
  } catch {
    return "TBD";
  }
}

/**
 * Formats time portion only in WAT.
 * Example: "9:00 AM"
 */
export function formatTimeOnlyWAT(isoString: string): string {
  try {
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return "TBD";

    return new Intl.DateTimeFormat("en-US", {
      timeZone: INSTITUTIONAL_TIMEZONE,
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    }).format(d);
  } catch {
    return "TBD";
  }
}

/**
 * Dynamically computes a future default start and end schedule in West Africa Time.
 * Section 8 Rule: The start time must ALWAYS begin in the future, never in the past.
 *
 * Rule:
 * 1. If current WAT hour is before 16:00 (4:00 PM), schedule starts today at the next 2-hour interval (e.g. 14:00) and ends tomorrow at 16:00.
 * 2. If current WAT hour is 16:00 or later, schedule starts tomorrow at 09:00 AM and ends the day after tomorrow at 16:00.
 */
export function getDefaultElectionScheduleWAT(): {
  start_datetime: string;
  end_datetime: string;
} {
  const now = new Date();

  // Extract current parts in WAT
  const partsFormatter = new Intl.DateTimeFormat("en-US", {
    timeZone: INSTITUTIONAL_TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });

  const parts = partsFormatter.formatToParts(now);
  const getPart = (type: string) => parts.find((p) => p.type === type)?.value || "00";

  const currentHour = parseInt(getPart("hour"), 10);

  // If before 4 PM, start today rounded forward + 2 hours
  if (currentHour < 16) {
    const startHour = Math.min(currentHour + 2, 17);
    const startHourStr = startHour.toString().padStart(2, "0");

    const todayDateStr = `${getPart("year")}-${getPart("month")}-${getPart("day")}`;

    // Tomorrow for end
    const tomorrowDate = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tomorrowParts = partsFormatter.formatToParts(tomorrowDate);
    const getTomorrowPart = (type: string) => tomorrowParts.find((p) => p.type === type)?.value || "00";
    const tomorrowDateStr = `${getTomorrowPart("year")}-${getTomorrowPart("month")}-${getTomorrowPart("day")}`;

    return {
      start_datetime: `${todayDateStr}T${startHourStr}:00`,
      end_datetime: `${tomorrowDateStr}T16:00`,
    };
  }

  // If 4 PM or later, start tomorrow 09:00 AM and end next day 16:00 PM
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const dayAfter = new Date(now.getTime() + 48 * 60 * 60 * 1000);

  const tomorrowParts = partsFormatter.formatToParts(tomorrow);
  const dayAfterParts = partsFormatter.formatToParts(dayAfter);

  const getT = (type: string) => tomorrowParts.find((p) => p.type === type)?.value || "00";
  const getD = (type: string) => dayAfterParts.find((p) => p.type === type)?.value || "00";

  const tomorrowDateStr = `${getT("year")}-${getT("month")}-${getT("day")}`;
  const dayAfterDateStr = `${getD("year")}-${getD("month")}-${getD("day")}`;

  return {
    start_datetime: `${tomorrowDateStr}T09:00`,
    end_datetime: `${dayAfterDateStr}T16:00`,
  };
}
