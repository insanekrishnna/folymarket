"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { recomputeAllScores } from "@/lib/scoring";

const scoreSchema = z.coerce.number().int().min(0).max(20);

const matchResultSchema = z
  .object({
    matchId: z.coerce.number().int().positive(),
    homeScore: scoreSchema,
    awayScore: scoreSchema,
    winnerId: z
      .string()
      .optional()
      .transform((v) => (v === undefined || v === "" ? null : Number(v)))
      .pipe(z.number().int().positive().nullable()),
    status: z.enum(["SCHEDULED", "LIVE", "FINISHED"]),
  })
  .refine(
    (d) =>
      d.homeScore !== d.awayScore ||
      d.winnerId !== null ||
      d.status !== "FINISHED",
    {
      message: "Tied knockout matches require a winner (ET/pen).",
      path: ["winnerId"],
    },
  );

export type AdminActionState = {
  ok?: boolean;
  error?: string;
  message?: string;
};

export async function saveMatchResult(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = matchResultSchema.safeParse({
    matchId: formData.get("matchId"),
    homeScore: formData.get("homeScore"),
    awayScore: formData.get("awayScore"),
    winnerId: formData.get("winnerId"),
    status: formData.get("status"),
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return { error: first?.message ?? "Invalid data." };
  }

  const match = await prisma.match.findUnique({
    where: { id: parsed.data.matchId },
    select: { id: true, stage: true, homeTeamId: true, awayTeamId: true },
  });
  if (!match) return { error: "Match not found." };

  if (match.homeTeamId === null || match.awayTeamId === null) {
    return {
      error:
        "This match doesn't have assigned teams yet (unresolved placeholder).",
    };
  }

  await prisma.match.update({
    where: { id: parsed.data.matchId },
    data: {
      homeScore: parsed.data.homeScore,
      awayScore: parsed.data.awayScore,
      winnerId: parsed.data.winnerId,
      status: parsed.data.status,
    },
  });

  // Recompute scores so rankings reflect the new result immediately.
  // If recompute fails, the match update still persists; admin can retry
  // via the "Recalcular" button on /admin.
  let recomputeWarning: string | undefined;
  try {
    await recomputeAllScores();
  } catch (err) {
    console.error("[saveMatchResult] recomputeAllScores failed", err);
    recomputeWarning =
      "Result saved, but automatic recalculation failed. Use the 'Recalculate' button.";
  }

  revalidatePath("/admin/matches");
  revalidatePath("/predictions");
  revalidatePath("/ranking");
  revalidatePath("/leagues");
  return recomputeWarning
    ? { ok: true, message: recomputeWarning }
    : { ok: true };
}

const advancementSchema = z.object({
  matchId: z.coerce.number().int().positive(),
  side: z.enum(["home", "away"]),
  teamId: z.coerce.number().int().positive(),
});

/**
 * Admin action: assign a team to one of the two sides of a knockout match.
 * Used to fix placeholder resolutions when real results diverge from the
 * automatic bracket (e.g., tiebreakers that don't match our algorithm).
 */
export async function assignKnockoutTeam(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const parsed = advancementSchema.safeParse({
    matchId: formData.get("matchId"),
    side: formData.get("side"),
    teamId: formData.get("teamId"),
  });
  if (!parsed.success) return { error: "Invalid data." };

  await prisma.match.update({
    where: { id: parsed.data.matchId },
    data:
      parsed.data.side === "home"
        ? { homeTeamId: parsed.data.teamId, homePlaceholder: null }
        : { awayTeamId: parsed.data.teamId, awayPlaceholder: null },
  });

  revalidatePath("/admin/matches");
  return { ok: true };
}

const awardsSchema = z.object({
  topScorerName: z.string().trim().max(80).optional().transform((v) => v || null),
  topAssistName: z.string().trim().max(80).optional().transform((v) => v || null),
  bestPlayerName: z.string().trim().max(80).optional().transform((v) => v || null),
  bestGoalkeeperName: z.string().trim().max(80).optional().transform((v) => v || null),
  championId: z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === "" ? null : Number(v)))
    .pipe(z.number().int().positive().nullable()),
  runnerUpId: z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === "" ? null : Number(v)))
    .pipe(z.number().int().positive().nullable()),
});

export async function saveActualAwards(
  _prev: AdminActionState,
  formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();

  const parsed = awardsSchema.safeParse({
    topScorerName: formData.get("topScorerName") ?? "",
    topAssistName: formData.get("topAssistName") ?? "",
    bestPlayerName: formData.get("bestPlayerName") ?? "",
    bestGoalkeeperName: formData.get("bestGoalkeeperName") ?? "",
    championId: formData.get("championId") ?? "",
    runnerUpId: formData.get("runnerUpId") ?? "",
  });
  if (!parsed.success) return { error: "Invalid data." };

  await prisma.actualAwards.update({
    where: { singleton: true },
    data: parsed.data,
  });

  revalidatePath("/admin/awards");
  return { ok: true };
}

export async function recomputeScoresAction(
  _prev: AdminActionState,
  _formData: FormData,
): Promise<AdminActionState> {
  await requireAdmin();
  const summary = await recomputeAllScores();
  revalidatePath("/ranking");
  revalidatePath("/admin");
  return {
    ok: true,
    message: `Recalculated: ${summary.predictionsUpdated} predictions, ${summary.specialsUpdated} special awards.`,
  };
}
