// Scoring engine. Given actual results stored in the DB, recompute the
// `points` column for every Prediction and SpecialPrediction.
//
// The scoring rules are loaded from the ScoringConfig singleton so they
// stay editable.

import { prisma } from "@/lib/prisma";
import {
  computeStandings,
  resolveKnockout,
  type GroupMatchInput,
  type KnockoutMatchInput,
  type TeamRef,
} from "@/lib/bracket";
import type { Stage } from "@/generated/prisma/enums";

function signOf(h: number, a: number): "H" | "D" | "A" {
  if (h > a) return "H";
  if (h < a) return "A";
  return "D";
}

function normalizeName(s: string | null | undefined): string {
  return (s ?? "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

/**
 * Return the effective winner team id for a knockout match result.
 * For ties (tied regulation + ET), the stored winnerId carries the PK result.
 */
function winnerFromResult(
  homeTeamId: number | null,
  awayTeamId: number | null,
  homeScore: number | null,
  awayScore: number | null,
  winnerId: number | null,
): number | null {
  if (homeTeamId === null || awayTeamId === null) return null;
  if (homeScore === null || awayScore === null) return null;
  if (homeScore > awayScore) return homeTeamId;
  if (homeScore < awayScore) return awayTeamId;
  if (winnerId === homeTeamId || winnerId === awayTeamId) return winnerId;
  return null;
}

export type RecomputeSummary = {
  predictionsUpdated: number;
  specialsUpdated: number;
};

export async function recomputeAllScores(): Promise<RecomputeSummary> {
  const [config, matches, awards, specials, predictions, teams] =
    await Promise.all([
      prisma.scoringConfig.findUniqueOrThrow({ where: { singleton: true } }),
      prisma.match.findMany({
        orderBy: { matchNumber: "asc" },
      }),
      prisma.actualAwards.findUniqueOrThrow({ where: { singleton: true } }),
      prisma.specialPrediction.findMany(),
      prisma.prediction.findMany(),
      prisma.team.findMany({ include: { group: true } }),
    ]);

  const matchById = new Map(matches.map((m) => [m.id, m]));

  // --- Per-match points -----------------------------------------------------

  const predictionUpdates: Array<{ id: number; points: number }> = [];
  for (const p of predictions) {
    const m = matchById.get(p.matchId);
    if (!m) {
      predictionUpdates.push({ id: p.id, points: 0 });
      continue;
    }
    if (m.homeScore === null || m.awayScore === null) {
      predictionUpdates.push({ id: p.id, points: 0 });
      continue;
    }
    let pts = 0;
    const exact =
      m.homeScore === p.homeScore && m.awayScore === p.awayScore;
    const sameSign = signOf(m.homeScore, m.awayScore) === signOf(p.homeScore, p.awayScore);
    const sameDiff = m.homeScore - m.awayScore === p.homeScore - p.awayScore;

    if (exact) pts += config.pointsExactScore;
    else if (sameSign) {
      pts += config.pointsCorrectWinner;
      if (sameDiff) pts += config.pointsCorrectGoalDiff;
    }

    predictionUpdates.push({ id: p.id, points: pts });
  }

  // --- Advancement bonuses --------------------------------------------------
  // For each user we derive "predicted team sets" per stage (R16, QF, SF,
  // finalists) and intersect with the actual sets. Each overlap earns
  // per-stage bonuses.

  // Compute ACTUAL team sets from the stored match results + winnerIds.
  const actualWinners = new Map<number, number | null>();
  for (const m of matches) {
    if (m.stage === "GROUP") continue;
    actualWinners.set(
      m.id,
      winnerFromResult(
        m.homeTeamId,
        m.awayTeamId,
        m.homeScore,
        m.awayScore,
        m.winnerId,
      ),
    );
  }

  const matchesByStage = new Map<Stage, typeof matches>();
  for (const m of matches) {
    const arr = matchesByStage.get(m.stage) ?? [];
    arr.push(m);
    matchesByStage.set(m.stage, arr);
  }

  // Build "actual teams playing each stage" sets.
  const actualStageTeams = (stage: Stage): Set<number> => {
    const rows = matchesByStage.get(stage) ?? [];
    const set = new Set<number>();
    for (const m of rows) {
      if (m.homeTeamId) set.add(m.homeTeamId);
      if (m.awayTeamId) set.add(m.awayTeamId);
    }
    return set;
  };
  const actualR32 = actualStageTeams("R32");
  const actualR16 = actualStageTeams("R16");
  const actualQF = actualStageTeams("QF");
  const actualSF = actualStageTeams("SF");
  const actualFinalists = actualStageTeams("FINAL");

  // Set up inputs to rebuild each user's predicted bracket deterministically.
  const teamRefs: TeamRef[] = teams
    .filter((t) => t.groupId && t.group)
    .map((t) => ({
      id: t.id,
      code: t.code,
      name: t.name,
      groupId: t.groupId!,
      groupLetter: t.group!.letter,
    }));

  const predsByUser = new Map<string, typeof predictions>();
  for (const p of predictions) {
    const arr = predsByUser.get(p.userId) ?? [];
    arr.push(p);
    predsByUser.set(p.userId, arr);
  }

  const groupMatches = matches.filter(
    (m) => m.stage === "GROUP" && m.homeTeamId && m.awayTeamId,
  );
  const knockoutMatches = matches.filter((m) => m.stage !== "GROUP");

  type Specials = (typeof specials)[number];
  const specialsByUser = new Map<string, Specials>();
  for (const s of specials) specialsByUser.set(s.userId, s);

  function predictedStageTeams(userId: string) {
    const userPreds = predsByUser.get(userId) ?? [];
    const predByMatch = new Map(userPreds.map((p) => [p.matchId, p]));

    const groupInputs: GroupMatchInput[] = groupMatches.map((m) => {
      const pred = predByMatch.get(m.id);
      return {
        id: m.id,
        groupId: m.groupId!,
        homeTeamId: m.homeTeamId!,
        awayTeamId: m.awayTeamId!,
        predictedHome: pred?.homeScore ?? null,
        predictedAway: pred?.awayScore ?? null,
      };
    });

    const knockoutInputs: KnockoutMatchInput[] = knockoutMatches.map((m) => {
      const pred = predByMatch.get(m.id);
      return {
        id: m.id,
        matchNumber: m.matchNumber,
        homePlaceholder: m.homePlaceholder,
        awayPlaceholder: m.awayPlaceholder,
        predictedHome: pred?.homeScore ?? null,
        predictedAway: pred?.awayScore ?? null,
        predictedWinnerId: pred?.winnerId ?? null,
      };
    });

    const standings = computeStandings(teamRefs, groupInputs);
    const resolved = resolveKnockout(standings, knockoutInputs);
    const resolvedByMatchId = new Map(resolved.map((r) => [r.matchId, r]));

    const teamsForStage = (stage: Stage): Set<number> => {
      const set = new Set<number>();
      for (const m of knockoutMatches) {
        if (m.stage !== stage) continue;
        const r = resolvedByMatchId.get(m.id);
        if (!r) continue;
        if (r.homeTeamId) set.add(r.homeTeamId);
        if (r.awayTeamId) set.add(r.awayTeamId);
      }
      return set;
    };

    return {
      r32: teamsForStage("R32"),
      r16: teamsForStage("R16"),
      qf: teamsForStage("QF"),
      sf: teamsForStage("SF"),
      final: teamsForStage("FINAL"),
    };
  }

  // --- Special predictions points -------------------------------------------

  // Bonus per user. Persisted via upsert in the same transaction as the
  // per-match updates so partial failures roll back cleanly.
  const specialBonusByUser = new Map<string, number>();

  // Iterate over all users who have any prediction or special row.
  const userIds = new Set<string>([
    ...predictions.map((p) => p.userId),
    ...specials.map((s) => s.userId),
  ]);

  for (const userId of userIds) {
    const sp = specialsByUser.get(userId) ?? null;
    let bonus = 0;

    const predictedSets = predictedStageTeams(userId);
    if (actualR32.size > 0) {
      for (const id of predictedSets.r32) {
        if (actualR32.has(id)) bonus += config.pointsAdvanceR32;
      }
    }
    if (actualR16.size > 0) {
      for (const id of predictedSets.r16) {
        if (actualR16.has(id)) bonus += config.pointsAdvanceR16;
      }
    }
    if (actualQF.size > 0) {
      for (const id of predictedSets.qf) {
        if (actualQF.has(id)) bonus += config.pointsAdvanceQF;
      }
    }
    if (actualSF.size > 0) {
      for (const id of predictedSets.sf) {
        if (actualSF.has(id)) bonus += config.pointsAdvanceSF;
      }
    }
    if (actualFinalists.size > 0) {
      for (const id of predictedSets.final) {
        if (actualFinalists.has(id)) bonus += config.pointsFinalist;
      }
    }

    // Champion + runner-up
    if (sp?.championId && awards.championId && sp.championId === awards.championId) {
      bonus += config.pointsChampion;
    }
    if (sp?.runnerUpId && awards.runnerUpId && sp.runnerUpId === awards.runnerUpId) {
      bonus += config.pointsRunnerUp;
    }

    // Player awards (name match, case + accent insensitive)
    const matchName = (a?: string | null, b?: string | null) =>
      !!a && !!b && normalizeName(a) === normalizeName(b) && normalizeName(a) !== "";

    if (matchName(sp?.topScorerName, awards.topScorerName)) bonus += config.pointsTopScorer;
    if (matchName(sp?.topAssistName, awards.topAssistName)) bonus += config.pointsTopAssist;
    if (matchName(sp?.bestPlayerName, awards.bestPlayerName)) bonus += config.pointsBestPlayer;
    if (matchName(sp?.bestGoalkeeperName, awards.bestGoalkeeperName)) bonus += config.pointsBestGoalkeeper;

    specialBonusByUser.set(userId, bonus);
  }

  // --- Persist --------------------------------------------------------------

  const now = new Date();
  await prisma.$transaction([
    ...predictionUpdates.map((u) =>
      prisma.prediction.update({
        where: { id: u.id },
        data: { points: u.points, computedAt: now },
      }),
    ),
    ...[...specialBonusByUser.entries()].map(([userId, points]) =>
      prisma.specialPrediction.upsert({
        where: { userId },
        create: { userId, points, computedAt: now },
        update: { points, computedAt: now },
      }),
    ),
  ]);

  return {
    predictionsUpdated: predictionUpdates.length,
    specialsUpdated: specialBonusByUser.size,
  };
}
