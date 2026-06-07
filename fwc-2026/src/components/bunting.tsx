import { prisma } from "@/lib/prisma";
import { isoForFifa } from "@/lib/flag";
import { BuntingClient } from "./bunting-client";

/**
 * Bunting: decorative triangular pennants for the qualified teams, hanging
 * from a subtle cord. It sways with ambient wind and reacts to the cursor like
 * a passing fan. See BuntingClient.
 */
export async function Bunting({ className }: { className?: string }) {
  const teams = await prisma.team.findMany({
    select: { code: true, name: true },
    orderBy: { code: "asc" },
  });

  if (teams.length === 0) return null;

  const pennants = teams.map((t) => ({
    code: t.code,
    name: t.name,
    iso: isoForFifa(t.code),
  }));

  return <BuntingClient teams={pennants} className={className} />;
}
