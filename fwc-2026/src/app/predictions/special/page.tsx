import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";
import { SpecialForm } from "./special-form";
import { buttonVariants } from "@/components/ui/button";

export default async function SpecialPredictionsPage() {
  const user = await requireUser();

  const [teams, existing, final] = await Promise.all([
    prisma.team.findMany({
      orderBy: { name: "asc" },
      include: { group: true },
    }),
    prisma.specialPrediction.findUnique({ where: { userId: user.id } }),
    prisma.match.findUnique({
      where: { matchNumber: 104 },
      select: { date: true },
    }),
  ]);

  const locked = !!final && final.date <= new Date();

  const teamOptions = teams.map((t) => ({
    id: t.id,
    code: t.code,
    name: t.name,
    groupLetter: t.group?.letter ?? "",
  }));

  return (
    <main className="mx-auto max-w-3xl flex-1 px-4 py-8">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Individual Awards</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Predict the champion, runner-up, and individual awards of the tournament.
            {locked && " (Predictions are closed.)"}
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/predictions"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            ← Back
          </Link>
        </div>
      </div>

      <SpecialForm
        teams={teamOptions}
        existing={existing ?? null}
        locked={locked}
      />
    </main>
  );
}
