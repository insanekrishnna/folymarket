import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { AwardsForm } from "./awards-form";

export default async function AdminAwardsPage() {
  const [teams, awards] = await Promise.all([
    prisma.team.findMany({
      orderBy: { name: "asc" },
      include: { group: true },
    }),
    prisma.actualAwards.findUniqueOrThrow({ where: { singleton: true } }),
  ]);

  const teamOptions = teams.map((t) => ({
    id: t.id,
    code: t.code,
    name: t.name,
    groupLetter: t.group?.letter ?? "",
  }));

  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
      <header className="mb-6">
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          ← Admin panel
        </Link>
        <h1 className="mt-2 text-3xl font-bold tracking-tight">Official Awards</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Actual individual results of the tournament. Names are compared ignoring accents and case.
        </p>
      </header>

      <AwardsForm
        teams={teamOptions}
        initial={{
          topScorerName: awards.topScorerName,
          topAssistName: awards.topAssistName,
          bestPlayerName: awards.bestPlayerName,
          bestGoalkeeperName: awards.bestGoalkeeperName,
          championId: awards.championId,
          runnerUpId: awards.runnerUpId,
        }}
      />
    </main>
  );
}
