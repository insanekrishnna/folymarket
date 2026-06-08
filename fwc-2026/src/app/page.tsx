import Link from "next/link";
import {
  ArrowRight,
  Code2,
  Goal,
  MapPin,
  Radio,
  Terminal,
  Trophy,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/session";
import { buttonVariants } from "@/components/ui/button";
import { Countdown } from "@/components/countdown";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Flag } from "@/components/flag";

export default async function HomePage() {
  const [user, firstMatch, counts] = await Promise.all([
    getCurrentUser(),
    prisma.match.findFirst({
      orderBy: { date: "asc" },
      include: { homeTeam: true, awayTeam: true },
    }),
    getCounts(),
  ]);

  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ??
    "http://localhost:3000";

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Polymatch",
        inLanguage: "en",
        description:
          "World Cup 2026: Predict match scores, build your bracket and compete with friends.",
      },
      {
        "@type": "SportsEvent",
        name: "FIFA World Cup 2026",
        startDate: "2026-06-11",
        endDate: "2026-07-19",
        sport: "Football",
        eventStatus: "https://schema.org/EventScheduled",
        eventAttendanceMode:
          "https://schema.org/OfflineEventAttendanceMode",
        location: [
          { "@type": "Country", name: "United States" },
          { "@type": "Country", name: "Canada" },
          { "@type": "Country", name: "Mexico" },
        ],
        organizer: {
          "@type": "Organization",
          name: "FIFA",
          url: "https://www.fifa.com",
        },
      },
    ],
  };

  return (
    <main className="flex-1">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute left-1/2 top-[18%] h-[360px] w-[680px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute left-[18%] top-[46%] h-[240px] w-[300px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-48 bg-gradient-to-b from-transparent to-white" />

        <div className="mx-auto max-w-6xl px-4 pb-14 pt-20 sm:pb-16 sm:pt-24">
          <div className="mx-auto max-w-3xl space-y-6 text-center">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/60 px-3 py-1 text-[11px] text-black/58 shadow-[0_12px_35px_rgba(15,23,42,0.08)] backdrop-blur-[22px]">
              <span className="grid size-4 place-items-center rounded bg-primary text-[9px] font-black text-white">
                F
              </span>
              <span>104 match prediction engine</span>
            </div>

            <h1 className="mx-auto max-w-3xl font-display text-5xl font-bold leading-[1.07] tracking-[-0.04em] sm:text-6xl">
              Predict the World Cup with a{" "}
              <span className="text-primary">terminal-fast</span>{" "}
              bracket
            </h1>

            <p className="mx-auto max-w-[460px] text-[15px] leading-[1.65] text-black/58 sm:text-base">
              Predict all {counts.matches} matches, build your bracket and compete
              for the trophy with your friends.
            </p>

            <div className="flex flex-wrap justify-center gap-3 pt-2">
              {user ? (
                <>
                  <Link
                    href="/predictions"
                    className={buttonVariants({ size: "lg" }) + " gap-2"}
                  >
                    <Terminal className="size-4" /> My Predictions
                  </Link>
                  <Link
                    href="/predictions/bracket"
                    className={
                      buttonVariants({ size: "lg", variant: "outline" }) +
                      " gap-2"
                    }
                  >
                    View Bracket <ArrowRight className="size-4" />
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/register"
                    className={buttonVariants({ size: "lg" }) + " gap-2"}
                  >
                    <Code2 className="size-4" /> Start now
                  </Link>
                  <Link
                    href="/login"
                    className={
                      buttonVariants({ size: "lg", variant: "outline" }) +
                      " gap-2"
                    }
                  >
                    Sign in <ArrowRight className="size-4" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {firstMatch && (
            <div className="mx-auto mt-14 max-w-2xl">
              <Card className="terminal-card relative overflow-hidden">
                <div className="absolute inset-x-6 top-0 h-px bg-primary/35" />
                <CardHeader className="pb-2 text-center">
                  <div className="flex items-center justify-center gap-2 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] text-black/45">
                    <Radio className="size-3.5 text-primary" />
                    live countdown
                  </div>
                </CardHeader>
                <CardContent className="space-y-5">
                  <Countdown
                    targetIso={firstMatch.date.toISOString()}
                    label="The opening match"
                  />
                  <div className="flex items-center justify-center gap-4 text-sm">
                    <TeamBadge
                      code={firstMatch.homeTeam?.code}
                      name={firstMatch.homeTeam?.name}
                    />
                    <span className="font-mono text-sm text-black/35">
                      vs
                    </span>
                    <TeamBadge
                      code={firstMatch.awayTeam?.code}
                      name={firstMatch.awayTeam?.name}
                    />
                  </div>
                  <div className="flex items-center justify-center gap-1.5 font-mono text-[11px] text-black/45">
                    <MapPin className="size-3" />
                    {firstMatch.venue}, {firstMatch.city}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="mx-auto mt-14 grid max-w-4xl grid-cols-2 gap-3 sm:grid-cols-4">
            <Stat icon={<Users className="size-4" />} value={counts.users} label={counts.users === 1 ? "User" : "Users"} />
            <Stat icon={<Code2 className="size-4" />} value={counts.teams} label="Teams" />
            <Stat icon={<Goal className="size-4" />} value={counts.matches} label="Matches" />
            <Stat icon={<Trophy className="size-4" />} value={counts.groups} label="Groups" />
          </div>
        </div>
      </section>
    </main>
  );
}

function TeamBadge({
  code,
  name,
}: {
  code: string | null | undefined;
  name: string | null | undefined;
}) {
  return (
    <div className="flex items-center gap-2">
      <Flag code={code} size="md" />
      <div className="text-left">
        <div className="font-mono text-sm font-semibold leading-tight text-black/90">
          {code ?? "-"}
        </div>
        <div className="text-[11px] text-black/45">{name ?? "-"}</div>
      </div>
    </div>
  );
}

function Stat({
  icon,
  value,
  label,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
}) {
  return (
    <div className="terminal-card rounded-2xl p-4 transition-colors hover:border-primary/25">
      <div className="flex items-center gap-2 text-black/45">
        {icon}
        <span className="font-mono text-[10px] uppercase tracking-[0.1em]">{label}</span>
      </div>
      <div className="mt-2 font-mono text-3xl font-bold tabular-nums text-primary">
        {value}
      </div>
    </div>
  );
}

async function getCounts() {
  const [teams, groups, matches, users] = await Promise.all([
    prisma.team.count(),
    prisma.group.count(),
    prisma.match.count(),
    prisma.user.count(),
  ]);
  return { teams, groups, matches, users };
}
