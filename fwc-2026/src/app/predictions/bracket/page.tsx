import Link from "next/link";
import { ArrowLeft, Star } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import {
  computeStandings,
  type GroupMatchInput,
  type TeamRef,
} from "@/lib/bracket";
import { BracketForm, type BracketRow, type TeamLite } from "./bracket-form";
import { buttonVariants } from "@/components/ui/button";
import { getDatePrefs } from "@/lib/timezone-server";

export default async function BracketPage() {
  const user = await requireUser();
  const prefs = await getDatePrefs();

  const [teams, groupMatches, knockoutMatches] = await Promise.all([
    prisma.team.findMany({ include: { group: true } }),
    prisma.match.findMany({
      where: { stage: "GROUP" },
      include: { predictions: { where: { userId: user.id } } },
    }),
    prisma.match.findMany({
      where: { stage: { not: "GROUP" } },
      orderBy: { matchNumber: "asc" },
      include: { predictions: { where: { userId: user.id } } },
    }),
  ]);

  const teamRefs: TeamRef[] = teams
    .filter((t) => t.groupId && t.group)
    .map((t) => ({
      id: t.id,
      code: t.code,
      name: t.name,
      groupId: t.groupId!,
      groupLetter: t.group!.letter,
    }));

  const groupMatchInputs: GroupMatchInput[] = groupMatches
    .filter((m) => m.homeTeamId && m.awayTeamId && m.groupId)
    .map((m) => {
      const pred = m.predictions[0];
      return {
        id: m.id,
        groupId: m.groupId!,
        homeTeamId: m.homeTeamId!,
        awayTeamId: m.awayTeamId!,
        predictedHome: pred?.homeScore ?? null,
        predictedAway: pred?.awayScore ?? null,
      };
    });

  const standings = computeStandings(teamRefs, groupMatchInputs);

  const teamsLite: TeamLite[] = teams.map((t) => ({
    id: t.id,
    code: t.code,
    name: t.name,
  }));

  const now = new Date();

  const rows: BracketRow[] = knockoutMatches.map((m) => {
    const pred = m.predictions[0];
    return {
      id: m.id,
      matchNumber: m.matchNumber,
      stage: m.stage,
      dateIso: m.date.toISOString(),
      venue: m.venue,
      city: m.city,
      homePlaceholder: m.homePlaceholder,
      awayPlaceholder: m.awayPlaceholder,
      initialHomeScore: pred?.homeScore ?? null,
      initialAwayScore: pred?.awayScore ?? null,
      initialWinnerId: pred?.winnerId ?? null,
      locked: m.date <= now || m.status !== "SCHEDULED",
      actual:
        m.homeScore !== null && m.awayScore !== null
          ? { homeScore: m.homeScore, awayScore: m.awayScore }
          : null,
    };
  });

  const groupsPredicted = groupMatchInputs.filter(
    (m) => m.predictedHome !== null && m.predictedAway !== null,
  ).length;
  const allGroupsPredicted = groupsPredicted === 72;

  return (
    <main className="mx-auto max-w-7xl flex-1 px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Knockout Bracket
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            The bracket updates in real-time based on your scores and winners.
            {!allGroupsPredicted && (
              <>
                {" "}
                {72 - groupsPredicted} group stage matches remaining to complete the starting point.
              </>
            )}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/predictions"
            className={buttonVariants({ variant: "outline", size: "sm" }) + " gap-1.5"}
          >
            <ArrowLeft className="size-3.5" />
            Group Stage
          </Link>
          <Link
            href="/predictions/special"
            className={buttonVariants({ variant: "outline", size: "sm" }) + " gap-1.5"}
          >
            <Star className="size-3.5" />
            Individual Awards
          </Link>
        </div>
      </div>

      <BracketForm
        rows={rows}
        teams={teamsLite}
        standings={standings}
        prefs={prefs}
      />
    </main>
  );
}
