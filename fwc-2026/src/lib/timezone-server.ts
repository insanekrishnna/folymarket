import "server-only";
import { cookies } from "next/headers";
import {
  DEFAULT_HOUR_FORMAT,
  DEFAULT_TIMEZONE,
  HOUR_FORMAT_COOKIE,
  TIMEZONE_COOKIE,
  isValidTimezone,
  type DatePrefs,
  type HourFormat,
} from "@/lib/timezone";

export async function getTimezone(): Promise<string> {
  const c = await cookies();
  const v = c.get(TIMEZONE_COOKIE)?.value;
  return v && isValidTimezone(v) ? v : DEFAULT_TIMEZONE;
}

export async function getHourFormat(): Promise<HourFormat> {
  const c = await cookies();
  const v = c.get(HOUR_FORMAT_COOKIE)?.value;
  return v === "12" || v === "24" ? v : DEFAULT_HOUR_FORMAT;
}

export async function getDatePrefs(): Promise<DatePrefs> {
  const [timezone, hourFormat] = await Promise.all([
    getTimezone(),
    getHourFormat(),
  ]);
  return { timezone, hourFormat };
}
