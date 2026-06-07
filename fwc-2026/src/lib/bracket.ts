// Pure functions to derive group standings and resolve knockout-bracket
// placeholder labels from a user's predictions.

export type Standing = {
  teamId: number;
  teamCode: string;
  teamName: string;
  groupId: number;
  groupLetter: string;
  played: number;
  won: number;
  drawn: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  points: number;
  position: number; // 1..4 within its group
};

export type GroupMatchInput = {
  id: number;
  groupId: number;
  homeTeamId: number;
  awayTeamId: number;
  predictedHome: number | null;
  predictedAway: number | null;
};

export type TeamRef = {
  id: number;
  code: string;
  name: string;
  groupId: number;
  groupLetter: string;
};

export type KnockoutMatchInput = {
  id: number;
  matchNumber: number;
  homePlaceholder: string | null;
  awayPlaceholder: string | null;
  // User's prediction for this match
  predictedHome: number | null;
  predictedAway: number | null;
  predictedWinnerId: number | null; // used to break ties (ET/pens)
};

// Compute full standings (all 48 teams, positioned 1..4 within their group).
export function computeStandings(
  teams: TeamRef[],
  matches: GroupMatchInput[],
): Standing[] {
  const base = new Map<number, Standing>();
  for (const t of teams) {
    base.set(t.id, {
      teamId: t.id,
      teamCode: t.code,
      teamName: t.name,
      groupId: t.groupId,
      groupLetter: t.groupLetter,
      played: 0,
      won: 0,
      drawn: 0,
      lost: 0,
      goalsFor: 0,
      goalsAgainst: 0,
      goalDiff: 0,
      points: 0,
      position: 0,
    });
  }

  // Head-to-head points map: `${a}-${b}` => points team a earned vs team b.
  const h2h = new Map<string, number>();

  for (const m of matches) {
    if (m.predictedHome === null || m.predictedAway === null) continue;
    const home = base.get(m.homeTeamId);
    const away = base.get(m.awayTeamId);
    if (!home || !away) continue;

    home.played += 1;
    away.played += 1;
    home.goalsFor += m.predictedHome;
    home.goalsAgainst += m.predictedAway;
    away.goalsFor += m.predictedAway;
    away.goalsAgainst += m.predictedHome;

    if (m.predictedHome > m.predictedAway) {
      home.won += 1;
      away.lost += 1;
      home.points += 3;
      h2h.set(key(home.teamId, away.teamId), (h2h.get(key(home.teamId, away.teamId)) ?? 0) + 3);
    } else if (m.predictedHome < m.predictedAway) {
      away.won += 1;
      home.lost += 1;
      away.points += 3;
      h2h.set(key(away.teamId, home.teamId), (h2h.get(key(away.teamId, home.teamId)) ?? 0) + 3);
    } else {
      home.drawn += 1;
      away.drawn += 1;
      home.points += 1;
      away.points += 1;
      h2h.set(key(home.teamId, away.teamId), (h2h.get(key(home.teamId, away.teamId)) ?? 0) + 1);
      h2h.set(key(away.teamId, home.teamId), (h2h.get(key(away.teamId, home.teamId)) ?? 0) + 1);
    }
  }

  // Compute goal diff + sort inside each group + assign position.
  const byGroup = new Map<number, Standing[]>();
  for (const s of base.values()) {
    s.goalDiff = s.goalsFor - s.goalsAgainst;
    const arr = byGroup.get(s.groupId) ?? [];
    arr.push(s);
    byGroup.set(s.groupId, arr);
  }

  for (const arr of byGroup.values()) {
    arr.sort((a, b) => compareStandings(a, b, h2h));
    arr.forEach((s, i) => (s.position = i + 1));
  }

  return [...base.values()];
}

function compareStandings(
  a: Standing,
  b: Standing,
  h2h: Map<string, number>,
): number {
  if (b.points !== a.points) return b.points - a.points;
  if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
  if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
  const aVsB = h2h.get(key(a.teamId, b.teamId)) ?? 0;
  const bVsA = h2h.get(key(b.teamId, a.teamId)) ?? 0;
  if (aVsB !== bVsA) return bVsA - aVsB;
  // Deterministic last-resort: team id ascending.
  return a.teamId - b.teamId;
}

function key(from: number, to: number) {
  return `${from}-${to}`;
}

// Pick the 8 best third-placed teams (across the 12 groups), ordered by the
// same tiebreakers used above.
export function pickTopEightThirds(standings: Standing[]): Standing[] {
  const thirds = standings.filter((s) => s.position === 3);
  thirds.sort((a, b) => compareStandings(a, b, new Map()));
  return thirds.slice(0, 8);
}

// Resolution of a single knockout match.
export type KnockoutResolution = {
  matchId: number;
  homeTeamId: number | null;
  awayTeamId: number | null;
  // Winner (from user's prediction) if both sides resolved, else null.
  winnerId: number | null;
};

/**
 * Resolve all knockout matches: figure out which team plays each slot
 * from the user's group predictions (standings) + their knockout predictions.
 *
 * Placeholder formats:
 *   "1A".."1L"  → 1st place of group X
 *   "2A".."2L"  → 2nd place of group X
 *   "3XYZ..."    → one of the 8 best thirds from the listed groups
 *   "W<num>"    → winner of match #num
 *   "L<num>"    → loser of match #num (for 3rd-place match)
 */
export function resolveKnockout(
  standings: Standing[],
  matches: KnockoutMatchInput[],
): KnockoutResolution[] {
  const standByPosition = new Map<string, Standing>(); // "1A", "2B" etc.
  for (const s of standings) {
    if (s.position === 1 || s.position === 2) {
      standByPosition.set(`${s.position}${s.groupLetter}`, s);
    }
  }

  const topThirds = pickTopEightThirds(standings);
  // Map each qualifying third-place team by group letter.
  const thirdByGroup = new Map<string, Standing>();
  for (const t of topThirds) thirdByGroup.set(t.groupLetter, t);

  // Greedy assignment: go through the knockout matches by matchNumber,
  // and for each "3XYZ..." pick the best unused qualifying third.
  const usedThirdGroups = new Set<string>();
  const ordered = [...matches].sort((a, b) => a.matchNumber - b.matchNumber);

  // First pass: resolve 1X/2X + "W?" / "L?" (knockout stuff depends on earlier
  // knockouts, so we keep iterating until stable).
  const resolved = new Map<number, { home: number | null; away: number | null }>();

  function resolveSide(placeholder: string | null): number | null {
    if (!placeholder) return null;
    // 1A, 2B, ...
    if (/^[12][A-L]$/.test(placeholder)) {
      return standByPosition.get(placeholder)?.teamId ?? null;
    }
    // 3ABCDF -> one of the listed groups
    if (/^3[A-L]+$/.test(placeholder)) {
      const letters = placeholder.slice(1).split("");
      // Prefer the best qualifying third among those letters, not already used.
      const candidates = letters
        .map((l) => thirdByGroup.get(l))
        .filter((s): s is Standing => !!s && !usedThirdGroups.has(s.groupLetter))
        .sort((a, b) => compareStandings(a, b, new Map()));
      const pick = candidates[0];
      if (!pick) return null;
      usedThirdGroups.add(pick.groupLetter);
      return pick.teamId;
    }
    // W73 → winner of match 73
    const win = placeholder.match(/^W(\d+)$/);
    if (win) {
      const srcId = matches.find((m) => m.matchNumber === Number(win[1]))?.id;
      if (srcId === undefined) return null;
      return winnerOf(srcId);
    }
    // L101 → loser of match 101
    const lose = placeholder.match(/^L(\d+)$/);
    if (lose) {
      const srcId = matches.find((m) => m.matchNumber === Number(lose[1]))?.id;
      if (srcId === undefined) return null;
      return loserOf(srcId);
    }
    return null;
  }

  function winnerOf(matchId: number): number | null {
    const src = ordered.find((m) => m.id === matchId);
    if (!src) return null;
    const r = resolved.get(matchId);
    if (!r || r.home === null || r.away === null) return null;
    if (src.predictedHome === null || src.predictedAway === null) return null;
    if (src.predictedHome > src.predictedAway) return r.home;
    if (src.predictedHome < src.predictedAway) return r.away;
    if (src.predictedWinnerId === r.home || src.predictedWinnerId === r.away) {
      return src.predictedWinnerId;
    }
    return null; // tie with no declared winner
  }

  function loserOf(matchId: number): number | null {
    const src = ordered.find((m) => m.id === matchId);
    if (!src) return null;
    const r = resolved.get(matchId);
    if (!r || r.home === null || r.away === null) return null;
    const w = winnerOf(matchId);
    if (w === null) return null;
    return w === r.home ? r.away : r.home;
  }

  // Since resolveSide for W?/L? depends on earlier resolutions, iterate
  // through ordered matches in matchNumber order (which is also temporal order).
  for (const m of ordered) {
    resolved.set(m.id, {
      home: resolveSide(m.homePlaceholder),
      away: resolveSide(m.awayPlaceholder),
    });
  }

  return ordered.map((m) => {
    const r = resolved.get(m.id)!;
    const winnerId =
      r.home !== null && r.away !== null && m.predictedHome !== null && m.predictedAway !== null
        ? m.predictedHome > m.predictedAway
          ? r.home
          : m.predictedHome < m.predictedAway
            ? r.away
            : m.predictedWinnerId === r.home || m.predictedWinnerId === r.away
              ? m.predictedWinnerId
              : null
        : null;
    return {
      matchId: m.id,
      homeTeamId: r.home,
      awayTeamId: r.away,
      winnerId,
    };
  });
}
