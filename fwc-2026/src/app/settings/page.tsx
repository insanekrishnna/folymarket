import { ArrowLeft, Clock, Globe2 } from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { getDatePrefs } from "@/lib/timezone-server";
import { formatDate } from "@/lib/datetime";
import { tzOffsetLabel } from "@/lib/timezone";
import { TimezoneSetting } from "./timezone-setting";
import { HourFormatSetting } from "./hour-format-setting";

export const metadata = {
  title: "Preferences - Polymatch",
};

export default async function SettingsPage() {
  const prefs = await getDatePrefs();
  const now = new Date();
  const offset = tzOffsetLabel(prefs.timezone);

  const previewFull = formatDate(now, prefs, {
    weekday: "long",
    day: "2-digit",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  });

  const previewKickoff = formatDate(new Date("2026-06-11T20:00:00+00:00"), prefs, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <main className="mx-auto max-w-2xl flex-1 px-4 py-8">
      <div className="mb-6">
        <Link
          href="/"
          className={buttonVariants({ variant: "ghost", size: "sm" }) + " -ml-2 gap-1.5"}
        >
          <ArrowLeft className="size-3.5" />
          Back
        </Link>
        <h1 className="mt-3 font-display text-3xl font-bold tracking-tight sm:text-4xl">
          Preferences
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust how dates and times are displayed throughout the app.
        </p>
      </div>

      <div className="space-y-4">
        <Card className="bg-card/70 backdrop-blur">
          <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
            <Globe2 className="size-4 text-primary" />
            <CardTitle className="text-base">Timezone</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Match scores and calendar will display in this timezone.
            </p>
            <TimezoneSetting currentTz={prefs.timezone} />
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 rounded-md border border-border/40 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium">Now here:</span>
              <span className="capitalize text-foreground">{previewFull}</span>
              <span className="ml-auto rounded bg-muted/50 px-1.5 py-0.5 font-mono">
                {offset}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card/70 backdrop-blur">
          <CardHeader className="flex-row items-center gap-2 space-y-0 pb-3">
            <Clock className="size-4 text-primary" />
            <CardTitle className="text-base">Time format</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose between 24-hour format (14:00) or 12-hour format with a.m. / p.m. (2:00 p.m.).
            </p>
            <HourFormatSetting current={prefs.hourFormat} />
            <div className="flex items-center gap-2 rounded-md border border-border/40 bg-background/40 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium">Example opening match:</span>
              <span className="capitalize text-foreground">{previewKickoff}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
