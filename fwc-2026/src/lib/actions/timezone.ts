"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  HOUR_FORMAT_COOKIE,
  TIMEZONE_COOKIE,
  isValidTimezone,
  type HourFormat,
} from "@/lib/timezone";

const YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function setTimezoneAction(tz: string): Promise<void> {
  if (!isValidTimezone(tz)) return;
  const c = await cookies();
  c.set(TIMEZONE_COOKIE, tz, {
    path: "/",
    maxAge: YEAR_IN_SECONDS,
    sameSite: "lax",
    httpOnly: false,
  });
  revalidatePath("/", "layout");
}

export async function setHourFormatAction(hf: HourFormat): Promise<void> {
  if (hf !== "12" && hf !== "24") return;
  const c = await cookies();
  c.set(HOUR_FORMAT_COOKIE, hf, {
    path: "/",
    maxAge: YEAR_IN_SECONDS,
    sameSite: "lax",
    httpOnly: false,
  });
  revalidatePath("/", "layout");
}
