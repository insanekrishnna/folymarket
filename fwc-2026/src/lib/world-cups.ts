/**
 * History of the 22 completed World Cup editions (1930-2022).
 * Static data: this does not change over time and does not need a DB table.
 *
 * To keep team listings consistent with the rest of the app, we use 3-letter
 * FIFA codes. Some mappings are historical simplifications, for example GER
 * covers pre-1990 West Germany and CZE covers pre-1993 Czechoslovakia.
 */

export type Edition = {
  year: number;
  editionNumber: number;
  hosts: string[];
  champion: string;
  runnerUp: string;
  scoreHome: number;
  scoreAway: number;
  /** "aet" if decided after extra time, "pens" if decided by penalties */
  decision?: "aet" | "pens";
  /** Penalty shootout score if applicable, for example "4-2" */
  penalties?: string;
  /** Brief historical note (optional) */
  note?: string;
};

export type CurrentTournament = {
  year: number;
  editionNumber: number;
  hosts: string[];
  startDate: string;
  endDate: string;
  teams: number;
  matches: number;
  venues: number;
  groups: number;
  openingMatch: {
    home: string;
    away: string;
    date: string;
    venue: string;
    city: string;
  };
  final: {
    date: string;
    venue: string;
    city: string;
  };
  debutants: string[];
  sourceUrl: string;
};

/** English name by FIFA code, only for teams that appear in past editions. */
export const TEAM_NAME_EN: Record<string, string> = {
  URU: "Uruguay",
  ARG: "Argentina",
  ITA: "Italy",
  CZE: "Czechoslovakia",
  HUN: "Hungary",
  BRA: "Brazil",
  GER: "Germany",
  SWE: "Sweden",
  CHI: "Chile",
  ENG: "England",
  MEX: "Mexico",
  NED: "Netherlands",
  ESP: "Spain",
  USA: "United States",
  FRA: "France",
  KOR: "South Korea",
  JPN: "Japan",
  RSA: "South Africa",
  RUS: "Russia",
  CRO: "Croatia",
  QAT: "Qatar",
  SUI: "Switzerland",
  CAN: "Canada",
  CPV: "Cabo Verde",
  CUW: "Curacao",
  JOR: "Jordan",
  UZB: "Uzbekistan",
};

export const teamName = (code: string) => TEAM_NAME_EN[code] ?? code;

export const CURRENT_TOURNAMENT: CurrentTournament = {
  year: 2026,
  editionNumber: 23,
  hosts: ["CAN", "MEX", "USA"],
  startDate: "2026-06-11",
  endDate: "2026-07-19",
  teams: 48,
  matches: 104,
  venues: 16,
  groups: 12,
  openingMatch: {
    home: "MEX",
    away: "RSA",
    date: "2026-06-11",
    venue: "Mexico City Stadium",
    city: "Mexico City",
  },
  final: {
    date: "2026-07-19",
    venue: "New York New Jersey Stadium",
    city: "New York New Jersey",
  },
  debutants: ["CPV", "CUW", "JOR", "UZB"],
  sourceUrl:
    "https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/match-schedule-fixtures-results-teams-stadiums",
};

export const EDITIONS: Edition[] = [
  { editionNumber: 1,  year: 1930, hosts: ["URU"], champion: "URU", runnerUp: "ARG", scoreHome: 4, scoreAway: 2 },
  { editionNumber: 2,  year: 1934, hosts: ["ITA"], champion: "ITA", runnerUp: "CZE", scoreHome: 2, scoreAway: 1, decision: "aet" },
  { editionNumber: 3,  year: 1938, hosts: ["FRA"], champion: "ITA", runnerUp: "HUN", scoreHome: 4, scoreAway: 2 },
  { editionNumber: 4,  year: 1950, hosts: ["BRA"], champion: "URU", runnerUp: "BRA", scoreHome: 2, scoreAway: 1, note: "Maracanazo - final group stage decided by points" },
  { editionNumber: 5,  year: 1954, hosts: ["SUI"], champion: "GER", runnerUp: "HUN", scoreHome: 3, scoreAway: 2 },
  { editionNumber: 6,  year: 1958, hosts: ["SWE"], champion: "BRA", runnerUp: "SWE", scoreHome: 5, scoreAway: 2 },
  { editionNumber: 7,  year: 1962, hosts: ["CHI"], champion: "BRA", runnerUp: "CZE", scoreHome: 3, scoreAway: 1 },
  { editionNumber: 8,  year: 1966, hosts: ["ENG"], champion: "ENG", runnerUp: "GER", scoreHome: 4, scoreAway: 2, decision: "aet" },
  { editionNumber: 9,  year: 1970, hosts: ["MEX"], champion: "BRA", runnerUp: "ITA", scoreHome: 4, scoreAway: 1 },
  { editionNumber: 10, year: 1974, hosts: ["GER"], champion: "GER", runnerUp: "NED", scoreHome: 2, scoreAway: 1 },
  { editionNumber: 11, year: 1978, hosts: ["ARG"], champion: "ARG", runnerUp: "NED", scoreHome: 3, scoreAway: 1, decision: "aet" },
  { editionNumber: 12, year: 1982, hosts: ["ESP"], champion: "ITA", runnerUp: "GER", scoreHome: 3, scoreAway: 1 },
  { editionNumber: 13, year: 1986, hosts: ["MEX"], champion: "ARG", runnerUp: "GER", scoreHome: 3, scoreAway: 2 },
  { editionNumber: 14, year: 1990, hosts: ["ITA"], champion: "GER", runnerUp: "ARG", scoreHome: 1, scoreAway: 0 },
  { editionNumber: 15, year: 1994, hosts: ["USA"], champion: "BRA", runnerUp: "ITA", scoreHome: 0, scoreAway: 0, decision: "pens", penalties: "3-2" },
  { editionNumber: 16, year: 1998, hosts: ["FRA"], champion: "FRA", runnerUp: "BRA", scoreHome: 3, scoreAway: 0 },
  { editionNumber: 17, year: 2002, hosts: ["KOR", "JPN"], champion: "BRA", runnerUp: "GER", scoreHome: 2, scoreAway: 0 },
  { editionNumber: 18, year: 2006, hosts: ["GER"], champion: "ITA", runnerUp: "FRA", scoreHome: 1, scoreAway: 1, decision: "pens", penalties: "5-3" },
  { editionNumber: 19, year: 2010, hosts: ["RSA"], champion: "ESP", runnerUp: "NED", scoreHome: 1, scoreAway: 0, decision: "aet" },
  { editionNumber: 20, year: 2014, hosts: ["BRA"], champion: "GER", runnerUp: "ARG", scoreHome: 1, scoreAway: 0, decision: "aet" },
  { editionNumber: 21, year: 2018, hosts: ["RUS"], champion: "FRA", runnerUp: "CRO", scoreHome: 4, scoreAway: 2 },
  { editionNumber: 22, year: 2022, hosts: ["QAT"], champion: "ARG", runnerUp: "FRA", scoreHome: 3, scoreAway: 3, decision: "pens", penalties: "4-2" },
];

export type TitleCount = {
  code: string;
  name: string;
  titles: number;
  years: number[];
};

/** Ranking of titles by country, ordered descending. Ties resolved by most recent title. */
export function getTitleRanking(): TitleCount[] {
  const map = new Map<string, TitleCount>();
  for (const e of EDITIONS) {
    const existing = map.get(e.champion);
    if (existing) {
      existing.titles += 1;
      existing.years.push(e.year);
    } else {
      map.set(e.champion, {
        code: e.champion,
        name: teamName(e.champion),
        titles: 1,
        years: [e.year],
      });
    }
  }
  return [...map.values()].sort((a, b) => {
    if (b.titles !== a.titles) return b.titles - a.titles;
    return Math.max(...b.years) - Math.max(...a.years);
  });
}

export type HostCount = {
  code: string;
  name: string;
  times: number;
  years: number[];
};

/** Host counts by country, counting co-hosted editions once for each country. */
export function getHostRanking(): HostCount[] {
  const map = new Map<string, HostCount>();
  for (const e of EDITIONS) {
    for (const h of e.hosts) {
      const existing = map.get(h);
      if (existing) {
        existing.times += 1;
        existing.years.push(e.year);
      } else {
        map.set(h, {
          code: h,
          name: teamName(h),
          times: 1,
          years: [e.year],
        });
      }
    }
  }
  return [...map.values()].sort((a, b) => b.times - a.times || Math.max(...b.years) - Math.max(...a.years));
}
