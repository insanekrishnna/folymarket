import Link from "next/link";
import { ArrowRight, Check, Star, Trophy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Flag } from "@/components/flag";

export default async function PredictionsIndexPage() {
  const user = await requireUser();

  const [groups, predictions] = await Promise.all([
    prisma.group.findMany({
      orderBy: { letter: "asc" },
      include: {
        teams: { orderBy: { name: "asc" } },
        _count: { select: { matches: true } },
      },
    }),
    prisma.prediction.findMany({
      where: { userId: user.id },
      select: { matchId: true, match: { select: { stage: true, groupId: true } } },
    }),
  ]);

  const predictedByGroup = new Map<number, number>();
  for (const p of predictions) {
    if (p.match.stage === "GROUP" && p.match.groupId) {
      predictedByGroup.set(p.match.groupId, (predictedByGroup.get(p.match.groupId) ?? 0) + 1);
    }
  }

  const total = groups.reduce((a, g) => a + g._count.matches, 0);
  const done = [...predictedByGroup.values()].reduce((a, n) => a + n, 0);

  return (
    <main className="mx-auto max-w-6xl flex-1 px-4 py-8">
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            My Predictions
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Predict all 72 group stage matches — they lock when each match starts.
          </p>
          <div className="mt-3 flex items-center gap-3 text-xs text-muted-foreground">
            <div className="inline-flex items-center gap-1.5 rounded-full border border-border/60 bg-card/70 px-2.5 py-1">
              <Check className="size-3 text-primary" />
              <span className="tabular-nums">
                {done}/{total} scores
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/predictions/bracket"
            className={buttonVariants({ variant: "outline", size: "sm" }) + " gap-1.5"}
          >
            <Trophy className="size-3.5" />
            Knockout Bracket
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

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((g) => {
          const predicted = predictedByGroup.get(g.id) ?? 0;
          const total = g._count.matches;
          const complete = predicted === total && total > 0;

          return (
            <Link
              key={g.id}
              href={`/predictions/groups/${g.letter}`}
              className="group rounded-xl outline-none ring-offset-2 focus-visible:ring-2 focus-visible:ring-ring"
            >
              <Card className="relative h-full overflow-hidden border-border/60 bg-card/60 p-5 transition-colors hover:border-primary/40 hover:bg-card">
                <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-primary/0 via-primary/80 to-primary/0 opacity-0 transition-opacity group-hover:opacity-100" />
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    <span className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Group
                    </span>
                    <span className="font-display text-3xl font-bold text-primary">
                      {g.letter}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={complete ? "default" : "secondary"}
                      className="tabular-nums"
                    >
                      {predicted}/{total}
                    </Badge>
                    <ArrowRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5 group-hover:text-foreground" />
                  </div>
                </div>

                <ul className="mt-4 space-y-2 text-sm">
                  {g.teams.map((t) => (
                    <li
                      key={t.id}
                      className="flex items-center gap-2.5 rounded-md px-1.5 py-0.5"
                    >
                      <Flag code={t.code} size="sm" />
                      <span className="font-mono text-[11px] font-semibold text-muted-foreground">
                        {t.code}
                      </span>
                      <span className="truncate">{t.name}</span>
                    </li>
                  ))}
                </ul>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
