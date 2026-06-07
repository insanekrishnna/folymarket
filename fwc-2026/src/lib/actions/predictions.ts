"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

const scoreSchema = z.coerce
  .number()
  .int("Must be an integer.")
  .min(0, "Minimum 0.")
  .max(20, "Maximum 20.");

const predictionInputSchema = z.object({
  matchId: z.coerce.number().int().positive(),
  homeScore: scoreSchema,
  awayScore: scoreSchema,
});

export type SavePredictionsState = {
  ok?: boolean;
  error?: string;
  savedCount?: number;
};

/**
 * Save all predictions submitted for a given group.
 * Form fields follow the convention: match-<id>-home / match-<id>-away
 */
export async function saveGroupPredictions(
  _prev: SavePredictionsState,
  formData: FormData,
): Promise<SavePredictionsState> {
  const user = await requireUser();

  // Collect all match-X-home / match-X-away fields into rows
  const rows = new Map<number, { homeScore?: string; awayScore?: string }>();
  for (const [key, value] of formData.entries()) {
    const m = key.match(/^match-(\d+)-(home|away)$/);
    if (!m) continue;
    const id = Number(m[1]);
    const side = m[2] as "home" | "away";
    const row = rows.get(id) ?? {};
    if (side === "home") row.homeScore = String(value);
    else row.awayScore = String(value);
    rows.set(id, row);
  }

  // Only save rows where BOTH fields are non-empty — skip partial ones.
  const inputs: Array<{ matchId: number; homeScore: number; awayScore: number }> = [];
  for (const [matchId, row] of rows) {
    if (!row.homeScore || !row.awayScore) continue; // partial row, ignore
    const parsed = predictionInputSchema.safeParse({
      matchId,
      homeScore: row.homeScore,
      awayScore: row.awayScore,
    });
    if (!parsed.success) {
      return { error: "Invalid score. Use numbers between 0 and 20." };
    }
    inputs.push(parsed.data);
  }

  if (inputs.length === 0) {
    return { ok: true, savedCount: 0 };
  }

  // Fetch matches to verify they exist AND aren't locked (kickoff passed).
  const matches = await prisma.match.findMany({
    where: { id: { in: inputs.map((i) => i.matchId) } },
    select: { id: true, date: true, status: true },
  });
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const now = new Date();

  const toWrite = inputs.filter((i) => {
    const m = matchById.get(i.matchId);
    if (!m) return false;
    return m.date > now && m.status === "SCHEDULED";
  });

  await prisma.$transaction(
    toWrite.map((i) =>
      prisma.prediction.upsert({
        where: { userId_matchId: { userId: user.id, matchId: i.matchId } },
        create: {
          userId: user.id,
          matchId: i.matchId,
          homeScore: i.homeScore,
          awayScore: i.awayScore,
        },
        update: {
          homeScore: i.homeScore,
          awayScore: i.awayScore,
        },
      }),
    ),
  );

  revalidatePath("/predictions");
  revalidatePath("/predictions/groups");
  return { ok: true, savedCount: toWrite.length };
}

const knockoutInputSchema = z.object({
  matchId: z.coerce.number().int().positive(),
  homeScore: scoreSchema,
  awayScore: scoreSchema,
  winnerId: z
    .string()
    .optional()
    .transform((v) => (v === undefined || v === "" ? null : Number(v)))
    .pipe(z.number().int().positive().nullable()),
});

/**
 * Save all knockout predictions submitted from the bracket form.
 * Form fields: match-<id>-home, match-<id>-away, match-<id>-winner
 */
export async function saveKnockoutPredictions(
  _prev: SavePredictionsState,
  formData: FormData,
): Promise<SavePredictionsState> {
  const user = await requireUser();

  type Row = { homeScore?: string; awayScore?: string; winnerId?: string };
  const rows = new Map<number, Row>();
  for (const [key, value] of formData.entries()) {
    const m = key.match(/^match-(\d+)-(home|away|winner)$/);
    if (!m) continue;
    const id = Number(m[1]);
    const field = m[2] as "home" | "away" | "winner";
    const row = rows.get(id) ?? {};
    if (field === "home") row.homeScore = String(value);
    else if (field === "away") row.awayScore = String(value);
    else row.winnerId = String(value);
    rows.set(id, row);
  }

  const inputs: Array<{
    matchId: number;
    homeScore: number;
    awayScore: number;
    winnerId: number | null;
  }> = [];
  for (const [matchId, row] of rows) {
    // Knockout rows must have both scores; winnerId is only relevant on ties.
    if (!row.homeScore || !row.awayScore) continue;
    const parsed = knockoutInputSchema.safeParse({
      matchId,
      homeScore: row.homeScore,
      awayScore: row.awayScore,
      winnerId: row.winnerId,
    });
    if (!parsed.success) {
      return { error: "Invalid score. Use numbers between 0 and 20." };
    }
    // If tie, winner must be chosen.
    if (parsed.data.homeScore === parsed.data.awayScore && parsed.data.winnerId === null) {
      return {
        error: "In knockout ties you must choose a winner (extra time / penalties).",
      };
    }
    inputs.push(parsed.data);
  }

  if (inputs.length === 0) return { ok: true, savedCount: 0 };

  const matches = await prisma.match.findMany({
    where: { id: { in: inputs.map((i) => i.matchId) } },
    select: { id: true, date: true, status: true, stage: true },
  });
  const matchById = new Map(matches.map((m) => [m.id, m]));
  const now = new Date();

  const toWrite = inputs.filter((i) => {
    const m = matchById.get(i.matchId);
    if (!m) return false;
    if (m.stage === "GROUP") return false; // use saveGroupPredictions instead
    return m.date > now && m.status === "SCHEDULED";
  });

  await prisma.$transaction(
    toWrite.map((i) =>
      prisma.prediction.upsert({
        where: { userId_matchId: { userId: user.id, matchId: i.matchId } },
        create: {
          userId: user.id,
          matchId: i.matchId,
          homeScore: i.homeScore,
          awayScore: i.awayScore,
          winnerId: i.winnerId,
        },
        update: {
          homeScore: i.homeScore,
          awayScore: i.awayScore,
          winnerId: i.winnerId,
        },
      }),
    ),
  );

  revalidatePath("/predictions");
  revalidatePath("/predictions/bracket");
  return { ok: true, savedCount: toWrite.length };
}

const optionalTeamId = z
  .string()
  .optional()
  .transform((v) => (v === undefined || v === "" ? null : Number(v)))
  .pipe(z.number().int().positive().nullable());

const optionalName = z
  .string()
  .trim()
  .max(80, "Maximum 80 characters.")
  .optional()
  .transform((v) => (v && v.length > 0 ? v : null));

const specialSchema = z.object({
  topScorerName: optionalName,
  topAssistName: optionalName,
  bestPlayerName: optionalName,
  bestGoalkeeperName: optionalName,
  championId: optionalTeamId,
  runnerUpId: optionalTeamId,
});

export type SaveSpecialState = {
  ok?: boolean;
  error?: string;
};

export async function saveSpecialPredictions(
  _prev: SaveSpecialState,
  formData: FormData,
): Promise<SaveSpecialState> {
  const user = await requireUser();

  // Lock once the final has started (date of matchNumber 104 has passed).
  const final = await prisma.match.findUnique({
    where: { matchNumber: 104 },
    select: { date: true },
  });
  if (final && final.date <= new Date()) {
    return { error: "Predictions are already closed." };
  }

  const raw = {
    topScorerName: String(formData.get("topScorerName") ?? ""),
    topAssistName: String(formData.get("topAssistName") ?? ""),
    bestPlayerName: String(formData.get("bestPlayerName") ?? ""),
    bestGoalkeeperName: String(formData.get("bestGoalkeeperName") ?? ""),
    championId: String(formData.get("championId") ?? ""),
    runnerUpId: String(formData.get("runnerUpId") ?? ""),
  };

  const parsed = specialSchema.safeParse(raw);
  if (!parsed.success) {
    return { error: "Check the fields: there is invalid data." };
  }

  if (
    parsed.data.championId !== null &&
    parsed.data.runnerUpId !== null &&
    parsed.data.championId === parsed.data.runnerUpId
  ) {
    return { error: "Champion and runner-up cannot be the same team." };
  }

  await prisma.specialPrediction.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      ...parsed.data,
    },
    update: {
      ...parsed.data,
    },
  });

  revalidatePath("/predictions");
  revalidatePath("/predictions/special");
  return { ok: true };
}
