import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Crown, Medal, Trophy, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Flag } from "@/components/flag";
import { cn, getSiteUrl } from "@/lib/utils";
import { LeagueCodeShare } from "./code-share";
import { LeagueAdminActions } from "./admin-actions";

export const metadata: Metadata = {
  title: "Private league",
  robots: { index: false, follow: false },
};

export default async function LeagueDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const user = await requireUser();

  const league = await prisma.league.findUnique({
    where: { slug },
    include: {
      members: {
        include: {
          user: { select: { id: true, name: true, username: true, createdAt: true } },
        },
      },
    },
  });

  if (!league) notFound();

  const isMember = league.members.some((m) => m.userId === user.id);
  if (!isMember) {
    return (
      <main className="mx-auto max-w-md flex-1 px-4 py-16 text-center">
        <h1 className="font-display text-2xl font-bold">Private league</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          You are not a member of this league. Ask the admin for the code to join.
        </p>
        <Link
          href="/leagues"
          className={buttonVariants({ variant: "outline", size: "sm" }) + " mt-6 gap-1.5"}
        >
          <ArrowLeft className="size-3.5" />
          My leagues
        </Link>
      </main>
    );
  }

  const memberIds = league.members.map((m) => m.userId);
  const [predictionPoints, specials, teams] = await Promise.all([
    prisma.prediction.groupBy({
      by: ["userId"],
      where: { userId: { in: memberIds } },
      _sum: { points: true },
      _count: { _all: true },
    }),
    prisma.specialPrediction.findMany({
      where: { userId: { in: memberIds } },
      select: { userId: true, points: true, championId: true },
    }),
    prisma.team.findMany({ select: { id: true, code: true, name: true } }),
  ]);

  const predPts = new Map(predictionPoints.map((p) => [p.userId, p._sum.points ?? 0]));
  const predCount = new Map(predictionPoints.map((p) => [p.userId, p._count._all]));
  const specialPts = new Map(specials.map((s) => [s.userId, s.points]));
  const champByUser = new Map(specials.map((s) => [s.userId, s.championId]));
  const teamById = new Map(teams.map((t) => [t.id, t]));

  const rows = league.members.map((m) => ({
    userId: m.userId,
    name: m.user.name ?? m.user.username ?? "Player",
    username: m.user.username,
    joinedAt: m.joinedAt,
    totalPoints: (predPts.get(m.userId) ?? 0) + (specialPts.get(m.userId) ?? 0),
    predictions: predCount.get(m.userId) ?? 0,
    championPick: champByUser.get(m.userId)
      ? teamById.get(champByUser.get(m.userId)!)
      : null,
    isOwner: m.userId === league.ownerId,
  }));

  rows.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.predictions !== a.predictions) return b.predictions - a.predictions;
    return a.joinedAt.getTime() - b.joinedAt.getTime();
  });

  const isOwner = league.ownerId === user.id;

  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
      <div className="mb-4">
        <Link
          href="/leagues"
          className={buttonVariants({ variant: "ghost", size: "sm" }) + " gap-1.5"}
        >
          <ArrowLeft className="size-3.5" />
          My leagues
        </Link>
      </div>

      <div className="mb-6 flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            {league.name}
          </h1>
          {isOwner && (
            <Badge variant="secondary" className="gap-1">
              <Crown className="size-3" />
              Admin
            </Badge>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Private leaderboard — recalculated using the same points as the global pool.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-2">
        <LeagueCodeShare
          leagueName={league.name}
          code={league.code}
          siteUrl={getSiteUrl()}
        />
        <LeagueAdminActions
          leagueId={league.id}
          isOwner={isOwner}
        />
      </div>

      <Card className="overflow-hidden border-border/60 bg-card/70 backdrop-blur">
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border/40 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-4 text-primary" />
            Leaderboard ({rows.length})
          </CardTitle>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <Users className="size-3.5" />
            {rows.length}
          </span>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border/40">
            {rows.map((r, idx) => {
              const pos = idx + 1;
              return (
                <li
                  key={r.userId}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors",
                    r.userId === user.id && "bg-primary/5",
                  )}
                >
                  <Position pos={pos} />
                  <Avatar className="h-10 w-10 border border-border/60">
                    <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                      {r.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="truncate font-medium">{r.name}</span>
                      {r.isOwner && <Crown className="size-3 text-[color:var(--gold)]" />}
                      {r.userId === user.id && (
                        <Badge variant="secondary" className="text-[10px]">You</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {r.username && <span>@{r.username}</span>}
                      {r.username && <span>·</span>}
                      <span>{r.predictions} predictions</span>
                      {r.championPick && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Trophy className="size-3 text-[color:var(--gold)]" />
                            <Flag code={r.championPick.code} size="xs" />
                            {r.championPick.code}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold tabular-nums">
                      {r.totalPoints}
                    </div>
                    <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                      pts
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </CardContent>
      </Card>
    </main>
  );
}

function Position({ pos }: { pos: number }) {
  const medalColors: Record<number, string> = {
    1: "bg-[color:var(--gold)]/15 text-[color:var(--gold)] border-[color:var(--gold)]/40",
    2: "bg-[color:var(--silver)]/15 text-[color:var(--silver)] border-[color:var(--silver)]/40",
    3: "bg-[color:var(--bronze)]/15 text-[color:var(--bronze)] border-[color:var(--bronze)]/40",
  };
  const isMedal = pos <= 3;
  return (
    <div
      className={cn(
        "flex h-9 w-9 flex-none items-center justify-center rounded-md border text-sm font-semibold",
        isMedal ? medalColors[pos] : "border-border/60 bg-background/50 text-muted-foreground",
      )}
    >
      {isMedal ? <Medal className="size-4" /> : pos}
    </div>
  );
}
