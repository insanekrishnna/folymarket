import type { Metadata } from "next";
import { Medal, Trophy, TrendingUp } from "lucide-react";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "Leaderboard",
  description:
    "Live leaderboard of the 2026 World Cup Predictions pool. See who's leading among your friends based on correct predictions.",
  alternates: { canonical: "/ranking" },
  openGraph: {
    title: "Leaderboard - Polymatch",
    description: "Live leaderboard of the 2026 World Cup predictions pool.",
    url: "/ranking",
  },
};
import { getCurrentUser } from "@/lib/session";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Flag } from "@/components/flag";
import {
  ConfederationChip,
  type Confederation,
} from "@/components/confederation-chip";
import { cn } from "@/lib/utils";

export default async function RankingPage() {
  const current = await getCurrentUser();

  const [users, predictionsByUser, specials, teams] = await Promise.all([
    prisma.user.findMany({
      select: { id: true, username: true, name: true, createdAt: true },
      orderBy: { createdAt: "asc" },
    }),
    prisma.prediction.groupBy({
      by: ["userId"],
      _sum: { points: true },
      _count: { _all: true },
    }),
    prisma.specialPrediction.findMany({
      select: { userId: true, points: true, championId: true },
    }),
    prisma.team.findMany({
      select: { id: true, code: true, name: true, confederation: true },
    }),
  ]);

  const predPointsByUser = new Map(
    predictionsByUser.map((p) => [p.userId, p._sum.points ?? 0]),
  );
  const predCountByUser = new Map(
    predictionsByUser.map((p) => [p.userId, p._count._all]),
  );
  const specialPointsByUser = new Map(specials.map((s) => [s.userId, s.points]));
  const championPickByUser = new Map(specials.map((s) => [s.userId, s.championId]));
  const teamById = new Map(teams.map((t) => [t.id, t]));

  const rows = users.map((u) => ({
    ...u,
    totalPoints:
      (predPointsByUser.get(u.id) ?? 0) + (specialPointsByUser.get(u.id) ?? 0),
    predictions: predCountByUser.get(u.id) ?? 0,
    championPick: championPickByUser.get(u.id)
      ? teamById.get(championPickByUser.get(u.id)!)
      : null,
  }));

  rows.sort((a, b) => {
    if (b.totalPoints !== a.totalPoints) return b.totalPoints - a.totalPoints;
    if (b.predictions !== a.predictions) return b.predictions - a.predictions;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ranking
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Current leaderboard for the predictions pool. Recalculated when the admin updates match results.
          </p>
        </div>
        <TrendingUp className="hidden size-8 text-primary sm:block" />
      </div>

      <Card className="overflow-hidden border-border/60 bg-card/70 backdrop-blur">
        <CardHeader className="flex-row items-center justify-between space-y-0 border-b border-border/40 pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <Trophy className="size-4 text-primary" />
            {rows.length} {rows.length === 1 ? "participant" : "participants"}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ul className="divide-y divide-border/40">
            {rows.map((u, idx) => {
              const pos = idx + 1;
              return (
                <li
                  key={u.id}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 transition-colors",
                    u.id === current?.id && "bg-primary/5",
                  )}
                >
                  <Position pos={pos} />
                  <Avatar className="h-10 w-10 border border-border/60">
                    <AvatarFallback className="bg-primary/15 text-xs font-semibold text-primary">
                      {(u.name ?? u.username ?? "??").slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        {u.name ?? u.username ?? "Player"}
                      {u.id === current?.id && (
                        <Badge variant="secondary" className="text-[10px]">
                          You
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {u.username && <span>@{u.username}</span>}
                      {u.username && <span>·</span>}
                      <span>{u.predictions} predictions</span>
                      {u.championPick && (
                        <>
                          <span>·</span>
                          <span className="inline-flex items-center gap-1">
                            <Trophy className="size-3 text-[color:var(--gold)]" />
                            <Flag code={u.championPick.code} size="xs" />
                            {u.championPick.code}
                            <ConfederationChip
                              confederation={
                                u.championPick.confederation as Confederation
                              }
                              compact
                              className="ml-0.5"
                            />
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-display text-2xl font-bold tabular-nums">
                      {u.totalPoints}
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
        isMedal
          ? medalColors[pos]
          : "border-border/60 bg-background/50 text-muted-foreground",
      )}
    >
      {isMedal ? <Medal className="size-4" /> : pos}
    </div>
  );
}
