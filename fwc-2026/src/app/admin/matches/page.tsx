import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { MatchResultForm } from "./match-result-form";
import type { Stage } from "@/generated/prisma/enums";
import { getDatePrefs } from "@/lib/timezone-server";
import { formatDate } from "@/lib/datetime";

export const dynamic = "force-dynamic";

const STAGE_LABEL: Record<Stage, string> = {
  GROUP: "Group Stage",
  R32: "Round of 32",
  R16: "Round of 16",
  QF: "Quarterfinals",
  SF: "Semifinals",
  TP: "Third Place",
  FINAL: "Final",
};

export default async function AdminMatchesPage({
  searchParams,
}: {
  searchParams: Promise<{ stage?: string }>;
}) {
  const { stage: stageParam } = await searchParams;
  const stage = parseStage(stageParam);
  const prefs = await getDatePrefs();

  const matches = await prisma.match.findMany({
    where: stage ? { stage } : undefined,
    orderBy: { matchNumber: "asc" },
    include: { homeTeam: true, awayTeam: true, group: true },
  });

  return (
    <main className="mx-auto max-w-4xl flex-1 px-4 py-8">
      <header className="mb-6">
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Admin panel
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Match Results</h1>
      </header>

      <nav className="mb-6 flex flex-wrap gap-2">
        <StageLink href="/admin/matches" active={!stage} label="All" />
        {(["GROUP", "R32", "R16", "QF", "SF", "TP", "FINAL"] as Stage[]).map((s) => (
          <StageLink
            key={s}
            href={`/admin/matches?stage=${s}`}
            active={stage === s}
            label={STAGE_LABEL[s]}
          />
        ))}
      </nav>

      <div className="space-y-4">
        {matches.map((m) => (
          <Card key={m.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="flex items-center gap-2 text-base">
                <span className="text-muted-foreground">#{m.matchNumber}</span>
                {m.group ? (
                  <Badge variant="secondary">Group {m.group.letter}</Badge>
                ) : (
                  <Badge variant="outline">{STAGE_LABEL[m.stage]}</Badge>
                )}
                <span className="font-normal">
                  {m.homeTeam?.name ?? m.homePlaceholder ?? "TBD"}
                  {" vs "}
                  {m.awayTeam?.name ?? m.awayPlaceholder ?? "TBD"}
                </span>
              </CardTitle>
              <div className="text-xs text-muted-foreground">
                {formatDate(m.date, prefs, {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </CardHeader>
            <CardContent>
              <MatchResultForm
                match={{
                  id: m.id,
                  isKnockout: m.stage !== "GROUP",
                  home: m.homeTeam
                    ? { id: m.homeTeam.id, code: m.homeTeam.code, name: m.homeTeam.name }
                    : null,
                  away: m.awayTeam
                    ? { id: m.awayTeam.id, code: m.awayTeam.code, name: m.awayTeam.name }
                    : null,
                  homeScore: m.homeScore,
                  awayScore: m.awayScore,
                  winnerId: m.winnerId,
                  status: m.status,
                }}
              />
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}

function parseStage(raw: string | undefined): Stage | null {
  const valid: Stage[] = ["GROUP", "R32", "R16", "QF", "SF", "TP", "FINAL"];
  if (raw && (valid as string[]).includes(raw)) return raw as Stage;
  return null;
}

function StageLink({
  href,
  active,
  label,
}: {
  href: string;
  active: boolean;
  label: string;
}) {
  return (
    <Link
      href={href}
      className={buttonVariants({
        variant: active ? "default" : "outline",
        size: "sm",
      })}
    >
      {label}
    </Link>
  );
}
