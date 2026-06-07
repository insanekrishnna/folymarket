import type { DatePrefs } from "@/lib/timezone";

/**
 * Timezone-aware datetime formatting helpers. All dates in the DB are stored
 * in UTC; these helpers format them in the user's chosen timezone.
 */

export function formatInTz(
  date: Date,
  timezone: string,
  options: Intl.DateTimeFormatOptions,
  locale: string = "es-CO",
): string {
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: timezone,
  }).format(date);
}

/**
 * Format a date using the user's full preferences (timezone + 12/24h).
 * Applies `hour12` automatically when the options include an `hour` field.
 */
export function formatDate(
  date: Date,
  prefs: DatePrefs,
  options: Intl.DateTimeFormatOptions,
  locale: string = "es-CO",
): string {
  const hasHour = options.hour !== undefined;
  return new Intl.DateTimeFormat(locale, {
    ...options,
    timeZone: prefs.timezone,
    ...(hasHour ? { hour12: prefs.hourFormat === "12" } : {}),
  }).format(date);
}

/**
 * Return a YYYY-MM-DD string representing the calendar day of `date` within
 * the provided timezone. Safe for grouping and sorting.
 */
export function dayKeyInTz(date: Date, timezone: string): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const d = parts.find((p) => p.type === "day")?.value;
  return `${y}-${m}-${d}`;
}

export function todayKeyInTz(timezone: string): string {
  return dayKeyInTz(new Date(), timezone);
}
