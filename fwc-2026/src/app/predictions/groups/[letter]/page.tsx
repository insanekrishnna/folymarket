import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { GroupPredictionsForm } from "./group-predictions-form";
import { buttonVariants } from "@/components/ui/button";
import { Flag } from "@/components/flag";
import {
  ConfederationChip,
  type Confederation,
} from "@/components/confederation-chip";
import { getDatePrefs } from "@/lib/timezone-server";

export default async function GroupPredictionsPage({
  params,
}: {
  params: Promise<{ letter: string }>;
}) {
  const user = await requireUser();
  const { letter: rawLetter } = await params;
  const letter = rawLetter.toUpperCase();
  const prefs = await getDatePrefs();

  const group = await prisma.group.findUnique({
    where: { letter },
    include: {
      teams: { orderBy: { name: "asc" } },
      matches: {
        orderBy: { date: "asc" },
        include: {
          homeTeam: true,
          awayTeam: true,
          predictions: { where: { userId: user.id } },
        },
      },
    },
  });

  if (!group) notFound();

  const now = new Date();
  const matches = group.matches.map((m) => ({
    id: m.id,
    matchNumber: m.matchNumber,
    dateIso: m.date.toISOString(),
    venue: m.venue,
    city: m.city,
    homeTeam: m.homeTeam
      ? { code: m.homeTeam.code, name: m.homeTeam.name }
      : null,
    awayTeam: m.awayTeam
      ? { code: m.awayTeam.code, name: m.awayTeam.name }
      : null,
    prediction: m.predictions[0]
      ? { homeScore: m.predictions[0].homeScore, awayScore: m.predictions[0].awayScore }
      : null,
    locked: m.date <= now || m.status !== "SCHEDULED",
    actual:
      m.homeScore !== null && m.awayScore !== null
        ? { homeScore: m.homeScore, awayScore: m.awayScore }
        : null,
  }));

  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
      <div className="mb-6 flex items-center justify-between gap-3">
        <Link
          href="/predictions"
          className={buttonVariants({ variant: "ghost", size: "sm" }) + " gap-1.5"}
        >
          <ArrowLeft className="size-3.5" />
          All Groups
        </Link>
        <Link
          href={nextGroupHref(letter)}
          className={buttonVariants({ variant: "ghost", size: "sm" }) + " gap-1.5"}
        >
          Group {nextGroupLetter(letter)}
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      <header className="mb-6 rounded-xl border border-border/60 bg-card/60 p-5 backdrop-blur">
        <div className="flex items-baseline gap-3">
          <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Group
          </span>
          <span className="font-display text-5xl font-bold text-primary">
            {group.letter}
          </span>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
          {group.teams.map((t) => (
            <div
              key={t.id}
              className="flex items-center gap-2 rounded-md border border-border/50 bg-background/50 px-2.5 py-1.5"
            >
              <Flag code={t.code} size="sm" />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 leading-none">
                  <span className="font-mono text-[10px] font-bold text-muted-foreground">
                    {t.code}
                  </span>
                  <ConfederationChip
                    confederation={t.confederation as Confederation}
                    compact
                  />
                </div>
                <div className="mt-0.5 truncate text-xs leading-tight">
                  {t.name}
                </div>
              </div>
            </div>
          ))}
        </div>
      </header>

      <GroupPredictionsForm matches={matches} prefs={prefs} />
    </main>
  );
}

function nextGroupLetter(current: string): string {
  const letters = "ABCDEFGHIJKL";
  const idx = letters.indexOf(current);
  return letters[(idx + 1) % letters.length];
}

function nextGroupHref(current: string): string {
  return `/predictions/groups/${nextGroupLetter(current)}`;
}
