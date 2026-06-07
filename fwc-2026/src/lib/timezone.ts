// Client-safe timezone constants and helpers. No server-only APIs here so
// this file can be imported from both server and client components.

export const DEFAULT_TIMEZONE = "America/Bogota";
export const TIMEZONE_COOKIE = "tz";

export type HourFormat = "12" | "24";
export const DEFAULT_HOUR_FORMAT: HourFormat = "24";
export const HOUR_FORMAT_COOKIE = "hf";

export type DatePrefs = {
  timezone: string;
  hourFormat: HourFormat;
};

export const DEFAULT_DATE_PREFS: DatePrefs = {
  timezone: DEFAULT_TIMEZONE,
  hourFormat: DEFAULT_HOUR_FORMAT,
};

export type TimezoneOption = {
  value: string;
  label: string;
  region: "Americas" | "Europe" | "Asia" | "Oceania" | "Africa";
};

export const COMMON_TIMEZONES: TimezoneOption[] = [
  // Americas
  { value: "America/Bogota", label: "Bogota / Lima", region: "Americas" },
  { value: "America/Mexico_City", label: "Mexico City", region: "Americas" },
  { value: "America/Monterrey", label: "Monterrey", region: "Americas" },
  { value: "America/Cancun", label: "Cancun", region: "Americas" },
  { value: "America/Tijuana", label: "Tijuana", region: "Americas" },
  { value: "America/New_York", label: "New York · Miami (ET)", region: "Americas" },
  { value: "America/Chicago", label: "Chicago · Kansas City (CT)", region: "Americas" },
  { value: "America/Denver", label: "Denver (MT)", region: "Americas" },
  { value: "America/Phoenix", label: "Phoenix", region: "Americas" },
  { value: "America/Los_Angeles", label: "Los Angeles · Seattle (PT)", region: "Americas" },
  { value: "America/Toronto", label: "Toronto · Montreal", region: "Americas" },
  { value: "America/Vancouver", label: "Vancouver", region: "Americas" },
  { value: "America/Caracas", label: "Caracas", region: "Americas" },
  { value: "America/La_Paz", label: "La Paz", region: "Americas" },
  { value: "America/Santiago", label: "Santiago", region: "Americas" },
  { value: "America/Argentina/Buenos_Aires", label: "Buenos Aires", region: "Americas" },
  { value: "America/Montevideo", label: "Montevideo", region: "Americas" },
  { value: "America/Sao_Paulo", label: "Sao Paulo · Rio", region: "Americas" },

  // Europe
  { value: "Europe/London", label: "London · Lisbon", region: "Europe" },
  { value: "Europe/Madrid", label: "Madrid · Paris · Berlin", region: "Europe" },
  { value: "Europe/Rome", label: "Rome", region: "Europe" },
  { value: "Europe/Athens", label: "Athens · Helsinki", region: "Europe" },
  { value: "Europe/Moscow", label: "Moscow · Istanbul", region: "Europe" },

  // Asia
  { value: "Asia/Dubai", label: "Dubai", region: "Asia" },
  { value: "Asia/Tehran", label: "Tehran", region: "Asia" },
  { value: "Asia/Karachi", label: "Karachi", region: "Asia" },
  { value: "Asia/Kolkata", label: "Delhi · Mumbai", region: "Asia" },
  { value: "Asia/Bangkok", label: "Bangkok", region: "Asia" },
  { value: "Asia/Shanghai", label: "Shanghai · Hong Kong", region: "Asia" },
  { value: "Asia/Tokyo", label: "Tokyo · Seoul", region: "Asia" },

  // Oceania
  { value: "Australia/Perth", label: "Perth", region: "Oceania" },
  { value: "Australia/Sydney", label: "Sydney · Melbourne", region: "Oceania" },
  { value: "Pacific/Auckland", label: "Auckland", region: "Oceania" },

  // Africa
  { value: "Africa/Lagos", label: "Lagos", region: "Africa" },
  { value: "Africa/Cairo", label: "Cairo", region: "Africa" },
  { value: "Africa/Johannesburg", label: "Johannesburg", region: "Africa" },
];

export function isValidTimezone(tz: string): boolean {
  if (!tz || tz.length > 100) return false;
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: tz });
    return true;
  } catch {
    return false;
  }
}

/**
 * Short offset label for a timezone, e.g. "GMT-5". Uses the `shortOffset`
 * timeZoneName, which is supported in all modern browsers & Node >=20.
 */
export function tzOffsetLabel(tz: string, reference: Date = new Date()): string {
  try {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: tz,
      timeZoneName: "shortOffset",
    }).formatToParts(reference);
    const name = parts.find((p) => p.type === "timeZoneName")?.value;
    if (!name) return "";
    return name === "GMT" ? "GMT+0" : name;
  } catch {
    return "";
  }
}
