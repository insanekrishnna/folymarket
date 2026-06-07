// Official FIFA World Cup 2026 data.
// Source: draw held on 2025-12-05 at Kennedy Center (Washington D.C.);
// confirmed after inter-confederation and UEFA playoffs (March 31, 2026).
// Schedule cross-referenced from FIFA.com + NBC Sports + MLSSoccer.com.
// A handful of times may shift slightly — verify against fifa.com before the tournament.

export type TeamSeed = {
  code: string;
  name: string;
  confederation: "UEFA" | "CONMEBOL" | "CONCACAF" | "CAF" | "AFC" | "OFC";
  group: string; // "A".."L"
};

export type MatchSeed = {
  matchNumber: number;
  stage: "GROUP" | "R32" | "R16" | "QF" | "SF" | "TP" | "FINAL";
  group: string | null;
  date: string; // ISO 8601 with offset
  venue: string;
  city: string;
  country: "MEX" | "CAN" | "USA";
  // For group stage: 3-letter team code. For knockout: placeholder (e.g. "1A", "W73", "3ABCDF").
  home: string;
  away: string;
};

export const TEAMS: TeamSeed[] = [
  // Group A
  { code: "MEX", name: "Mexico",                             confederation: "CONCACAF", group: "A" },
  { code: "RSA", name: "South Africa",                          confederation: "CAF",      group: "A" },
  { code: "KOR", name: "Korea Republic",                      confederation: "AFC",      group: "A" },
  { code: "CZE", name: "Czechia",                    confederation: "UEFA",     group: "A" },
  // Group B
  { code: "CAN", name: "Canada",                             confederation: "CONCACAF", group: "B" },
  { code: "BIH", name: "Bosnia and Herzegovina",               confederation: "UEFA",     group: "B" },
  { code: "QAT", name: "Qatar",                              confederation: "AFC",      group: "B" },
  { code: "SUI", name: "Switzerland",                              confederation: "UEFA",     group: "B" },
  // Group C
  { code: "BRA", name: "Brazil",                             confederation: "CONMEBOL", group: "C" },
  { code: "MAR", name: "Morocco",                          confederation: "CAF",      group: "C" },
  { code: "HAI", name: "Haiti",                              confederation: "CONCACAF", group: "C" },
  { code: "SCO", name: "Scotland",                            confederation: "UEFA",     group: "C" },
  // Group D
  { code: "USA", name: "United States",                     confederation: "CONCACAF", group: "D" },
  { code: "PAR", name: "Paraguay",                           confederation: "CONMEBOL", group: "D" },
  { code: "AUS", name: "Australia",                          confederation: "AFC",      group: "D" },
  { code: "TUR", name: "Turkiye",                            confederation: "UEFA",     group: "D" },
  // Group E
  { code: "GER", name: "Germany",                           confederation: "UEFA",     group: "E" },
  { code: "CUW", name: "Curaçao",                            confederation: "CONCACAF", group: "E" },
  { code: "CIV", name: "Cote d'Ivoire",                    confederation: "CAF",      group: "E" },
  { code: "ECU", name: "Ecuador",                            confederation: "CONMEBOL", group: "E" },
  // Group F
  { code: "NED", name: "Netherlands",                       confederation: "UEFA",     group: "F" },
  { code: "JPN", name: "Japan",                              confederation: "AFC",      group: "F" },
  { code: "SWE", name: "Sweden",                             confederation: "UEFA",     group: "F" },
  { code: "TUN", name: "Tunisia",                              confederation: "CAF",      group: "F" },
  // Group G
  { code: "BEL", name: "Belgium",                            confederation: "UEFA",     group: "G" },
  { code: "EGY", name: "Egypt",                             confederation: "CAF",      group: "G" },
  { code: "IRN", name: "Iran",                               confederation: "AFC",      group: "G" },
  { code: "NZL", name: "New Zealand",                      confederation: "OFC",      group: "G" },
  // Group H
  { code: "ESP", name: "Spain",                             confederation: "UEFA",     group: "H" },
  { code: "CPV", name: "Cabo Verde",                         confederation: "CAF",      group: "H" },
  { code: "KSA", name: "Saudi Arabia",                       confederation: "AFC",      group: "H" },
  { code: "URU", name: "Uruguay",                            confederation: "CONMEBOL", group: "H" },
  // Group I
  { code: "FRA", name: "France",                            confederation: "UEFA",     group: "I" },
  { code: "SEN", name: "Senegal",                            confederation: "CAF",      group: "I" },
  { code: "IRQ", name: "Iraq",                               confederation: "AFC",      group: "I" },
  { code: "NOR", name: "Norway",                            confederation: "UEFA",     group: "I" },
  // Group J
  { code: "ARG", name: "Argentina",                          confederation: "CONMEBOL", group: "J" },
  { code: "ALG", name: "Algeria",                            confederation: "CAF",      group: "J" },
  { code: "AUT", name: "Austria",                            confederation: "UEFA",     group: "J" },
  { code: "JOR", name: "Jordan",                           confederation: "AFC",      group: "J" },
  // Group K
  { code: "POR", name: "Portugal",                           confederation: "UEFA",     group: "K" },
  { code: "COD", name: "Congo DR",                confederation: "CAF",      group: "K" },
  { code: "UZB", name: "Uzbekistan",                         confederation: "AFC",      group: "K" },
  { code: "COL", name: "Colombia",                           confederation: "CONMEBOL", group: "K" },
  // Group L
  { code: "ENG", name: "England",                         confederation: "UEFA",     group: "L" },
  { code: "CRO", name: "Croatia",                            confederation: "UEFA",     group: "L" },
  { code: "GHA", name: "Ghana",                              confederation: "CAF",      group: "L" },
  { code: "PAN", name: "Panama",                             confederation: "CONCACAF", group: "L" },
];

export const MATCHES: MatchSeed[] = [
  // ---------- GROUP STAGE ----------
  // Group A
  { matchNumber:  1, stage: "GROUP", group: "A", date: "2026-06-11T13:00:00-06:00", venue: "Estadio Azteca",          city: "Mexico City",     country: "MEX", home: "MEX", away: "RSA" },
  { matchNumber:  2, stage: "GROUP", group: "A", date: "2026-06-11T20:00:00-06:00", venue: "Estadio Akron",           city: "Guadalajara",     country: "MEX", home: "KOR", away: "CZE" },
  { matchNumber:  3, stage: "GROUP", group: "A", date: "2026-06-18T12:00:00-04:00", venue: "Mercedes-Benz Stadium",   city: "Atlanta",         country: "USA", home: "CZE", away: "RSA" },
  { matchNumber:  4, stage: "GROUP", group: "A", date: "2026-06-18T19:00:00-06:00", venue: "Estadio Akron",           city: "Guadalajara",     country: "MEX", home: "MEX", away: "KOR" },
  { matchNumber:  5, stage: "GROUP", group: "A", date: "2026-06-24T19:00:00-06:00", venue: "Estadio Azteca",          city: "Mexico City",     country: "MEX", home: "CZE", away: "MEX" },
  { matchNumber:  6, stage: "GROUP", group: "A", date: "2026-06-24T19:00:00-06:00", venue: "Estadio BBVA",            city: "Monterrey",       country: "MEX", home: "RSA", away: "KOR" },
  // Group B
  { matchNumber:  7, stage: "GROUP", group: "B", date: "2026-06-12T15:00:00-04:00", venue: "BMO Field",               city: "Toronto",         country: "CAN", home: "CAN", away: "BIH" },
  { matchNumber:  8, stage: "GROUP", group: "B", date: "2026-06-13T12:00:00-07:00", venue: "Levi's Stadium",          city: "Santa Clara",     country: "USA", home: "QAT", away: "SUI" },
  { matchNumber:  9, stage: "GROUP", group: "B", date: "2026-06-18T12:00:00-07:00", venue: "SoFi Stadium",            city: "Inglewood",       country: "USA", home: "SUI", away: "BIH" },
  { matchNumber: 10, stage: "GROUP", group: "B", date: "2026-06-18T15:00:00-07:00", venue: "BC Place",                city: "Vancouver",       country: "CAN", home: "CAN", away: "QAT" },
  { matchNumber: 11, stage: "GROUP", group: "B", date: "2026-06-24T12:00:00-07:00", venue: "BC Place",                city: "Vancouver",       country: "CAN", home: "SUI", away: "CAN" },
  { matchNumber: 12, stage: "GROUP", group: "B", date: "2026-06-24T12:00:00-07:00", venue: "Lumen Field",             city: "Seattle",         country: "USA", home: "BIH", away: "QAT" },
  // Group C
  { matchNumber: 13, stage: "GROUP", group: "C", date: "2026-06-13T15:00:00-04:00", venue: "MetLife Stadium",         city: "East Rutherford", country: "USA", home: "BRA", away: "MAR" },
  { matchNumber: 14, stage: "GROUP", group: "C", date: "2026-06-13T21:00:00-04:00", venue: "Gillette Stadium",        city: "Foxborough",      country: "USA", home: "HAI", away: "SCO" },
  { matchNumber: 15, stage: "GROUP", group: "C", date: "2026-06-19T18:00:00-04:00", venue: "Gillette Stadium",        city: "Foxborough",      country: "USA", home: "SCO", away: "MAR" },
  { matchNumber: 16, stage: "GROUP", group: "C", date: "2026-06-19T21:00:00-04:00", venue: "Lincoln Financial Field", city: "Philadelphia",    country: "USA", home: "BRA", away: "HAI" },
  { matchNumber: 17, stage: "GROUP", group: "C", date: "2026-06-24T18:00:00-04:00", venue: "Hard Rock Stadium",       city: "Miami Gardens",   country: "USA", home: "SCO", away: "BRA" },
  { matchNumber: 18, stage: "GROUP", group: "C", date: "2026-06-24T18:00:00-04:00", venue: "Mercedes-Benz Stadium",   city: "Atlanta",         country: "USA", home: "MAR", away: "HAI" },
  // Group D
  { matchNumber: 19, stage: "GROUP", group: "D", date: "2026-06-12T18:00:00-07:00", venue: "SoFi Stadium",            city: "Inglewood",       country: "USA", home: "USA", away: "PAR" },
  { matchNumber: 20, stage: "GROUP", group: "D", date: "2026-06-12T21:00:00-07:00", venue: "BC Place",                city: "Vancouver",       country: "CAN", home: "AUS", away: "TUR" },
  { matchNumber: 21, stage: "GROUP", group: "D", date: "2026-06-19T12:00:00-07:00", venue: "Lumen Field",             city: "Seattle",         country: "USA", home: "USA", away: "AUS" },
  { matchNumber: 22, stage: "GROUP", group: "D", date: "2026-06-18T21:00:00-07:00", venue: "Levi's Stadium",          city: "Santa Clara",     country: "USA", home: "TUR", away: "PAR" },
  { matchNumber: 23, stage: "GROUP", group: "D", date: "2026-06-25T19:00:00-07:00", venue: "SoFi Stadium",            city: "Inglewood",       country: "USA", home: "TUR", away: "USA" },
  { matchNumber: 24, stage: "GROUP", group: "D", date: "2026-06-25T19:00:00-07:00", venue: "Levi's Stadium",          city: "Santa Clara",     country: "USA", home: "PAR", away: "AUS" },
  // Group E
  { matchNumber: 25, stage: "GROUP", group: "E", date: "2026-06-14T12:00:00-05:00", venue: "NRG Stadium",             city: "Houston",         country: "USA", home: "GER", away: "CUW" },
  { matchNumber: 26, stage: "GROUP", group: "E", date: "2026-06-14T18:00:00-04:00", venue: "Lincoln Financial Field", city: "Philadelphia",    country: "USA", home: "CIV", away: "ECU" },
  { matchNumber: 27, stage: "GROUP", group: "E", date: "2026-06-20T16:00:00-04:00", venue: "BMO Field",               city: "Toronto",         country: "CAN", home: "GER", away: "CIV" },
  { matchNumber: 28, stage: "GROUP", group: "E", date: "2026-06-20T19:00:00-05:00", venue: "Arrowhead Stadium",       city: "Kansas City",     country: "USA", home: "ECU", away: "CUW" },
  { matchNumber: 29, stage: "GROUP", group: "E", date: "2026-06-25T16:00:00-04:00", venue: "MetLife Stadium",         city: "East Rutherford", country: "USA", home: "ECU", away: "GER" },
  { matchNumber: 30, stage: "GROUP", group: "E", date: "2026-06-25T16:00:00-04:00", venue: "Lincoln Financial Field", city: "Philadelphia",    country: "USA", home: "CUW", away: "CIV" },
  // Group F
  { matchNumber: 31, stage: "GROUP", group: "F", date: "2026-06-14T15:00:00-05:00", venue: "AT&T Stadium",            city: "Arlington",       country: "USA", home: "NED", away: "JPN" },
  { matchNumber: 32, stage: "GROUP", group: "F", date: "2026-06-14T21:00:00-06:00", venue: "Estadio BBVA",            city: "Monterrey",       country: "MEX", home: "SWE", away: "TUN" },
  { matchNumber: 33, stage: "GROUP", group: "F", date: "2026-06-20T12:00:00-05:00", venue: "NRG Stadium",             city: "Houston",         country: "USA", home: "NED", away: "SWE" },
  { matchNumber: 34, stage: "GROUP", group: "F", date: "2026-06-19T23:00:00-06:00", venue: "Estadio BBVA",            city: "Monterrey",       country: "MEX", home: "TUN", away: "JPN" },
  { matchNumber: 35, stage: "GROUP", group: "F", date: "2026-06-25T18:00:00-05:00", venue: "AT&T Stadium",            city: "Arlington",       country: "USA", home: "JPN", away: "SWE" },
  { matchNumber: 36, stage: "GROUP", group: "F", date: "2026-06-25T18:00:00-05:00", venue: "Arrowhead Stadium",       city: "Kansas City",     country: "USA", home: "TUN", away: "NED" },
  // Group G
  { matchNumber: 37, stage: "GROUP", group: "G", date: "2026-06-15T18:00:00-07:00", venue: "SoFi Stadium",            city: "Inglewood",       country: "USA", home: "IRN", away: "NZL" },
  { matchNumber: 38, stage: "GROUP", group: "G", date: "2026-06-15T12:00:00-07:00", venue: "Lumen Field",             city: "Seattle",         country: "USA", home: "BEL", away: "EGY" },
  { matchNumber: 39, stage: "GROUP", group: "G", date: "2026-06-21T12:00:00-07:00", venue: "SoFi Stadium",            city: "Inglewood",       country: "USA", home: "BEL", away: "IRN" },
  { matchNumber: 40, stage: "GROUP", group: "G", date: "2026-06-21T18:00:00-07:00", venue: "BC Place",                city: "Vancouver",       country: "CAN", home: "NZL", away: "EGY" },
  { matchNumber: 41, stage: "GROUP", group: "G", date: "2026-06-26T20:00:00-07:00", venue: "Lumen Field",             city: "Seattle",         country: "USA", home: "EGY", away: "IRN" },
  { matchNumber: 42, stage: "GROUP", group: "G", date: "2026-06-26T20:00:00-07:00", venue: "BC Place",                city: "Vancouver",       country: "CAN", home: "NZL", away: "BEL" },
  // Group H
  { matchNumber: 43, stage: "GROUP", group: "H", date: "2026-06-15T12:00:00-04:00", venue: "Mercedes-Benz Stadium",   city: "Atlanta",         country: "USA", home: "ESP", away: "CPV" },
  { matchNumber: 44, stage: "GROUP", group: "H", date: "2026-06-15T18:00:00-04:00", venue: "Hard Rock Stadium",       city: "Miami Gardens",   country: "USA", home: "KSA", away: "URU" },
  { matchNumber: 45, stage: "GROUP", group: "H", date: "2026-06-21T12:00:00-04:00", venue: "Mercedes-Benz Stadium",   city: "Atlanta",         country: "USA", home: "ESP", away: "KSA" },
  { matchNumber: 46, stage: "GROUP", group: "H", date: "2026-06-21T18:00:00-04:00", venue: "Hard Rock Stadium",       city: "Miami Gardens",   country: "USA", home: "URU", away: "CPV" },
  { matchNumber: 47, stage: "GROUP", group: "H", date: "2026-06-26T19:00:00-05:00", venue: "NRG Stadium",             city: "Houston",         country: "USA", home: "CPV", away: "KSA" },
  { matchNumber: 48, stage: "GROUP", group: "H", date: "2026-06-26T18:00:00-06:00", venue: "Estadio Akron",           city: "Guadalajara",     country: "MEX", home: "URU", away: "ESP" },
  // Group I
  { matchNumber: 49, stage: "GROUP", group: "I", date: "2026-06-16T15:00:00-04:00", venue: "MetLife Stadium",         city: "East Rutherford", country: "USA", home: "FRA", away: "SEN" },
  { matchNumber: 50, stage: "GROUP", group: "I", date: "2026-06-16T18:00:00-04:00", venue: "Gillette Stadium",        city: "Foxborough",      country: "USA", home: "IRQ", away: "NOR" },
  { matchNumber: 51, stage: "GROUP", group: "I", date: "2026-06-22T17:00:00-04:00", venue: "Lincoln Financial Field", city: "Philadelphia",    country: "USA", home: "FRA", away: "IRQ" },
  { matchNumber: 52, stage: "GROUP", group: "I", date: "2026-06-22T20:00:00-04:00", venue: "MetLife Stadium",         city: "East Rutherford", country: "USA", home: "NOR", away: "SEN" },
  { matchNumber: 53, stage: "GROUP", group: "I", date: "2026-06-26T15:00:00-04:00", venue: "Gillette Stadium",        city: "Foxborough",      country: "USA", home: "NOR", away: "FRA" },
  { matchNumber: 54, stage: "GROUP", group: "I", date: "2026-06-26T15:00:00-04:00", venue: "BMO Field",               city: "Toronto",         country: "CAN", home: "SEN", away: "IRQ" },
  // Group J
  { matchNumber: 55, stage: "GROUP", group: "J", date: "2026-06-16T20:00:00-05:00", venue: "Arrowhead Stadium",       city: "Kansas City",     country: "USA", home: "ARG", away: "ALG" },
  { matchNumber: 56, stage: "GROUP", group: "J", date: "2026-06-16T21:00:00-07:00", venue: "Levi's Stadium",          city: "Santa Clara",     country: "USA", home: "AUT", away: "JOR" },
  { matchNumber: 57, stage: "GROUP", group: "J", date: "2026-06-22T12:00:00-05:00", venue: "AT&T Stadium",            city: "Arlington",       country: "USA", home: "ARG", away: "AUT" },
  { matchNumber: 58, stage: "GROUP", group: "J", date: "2026-06-22T20:00:00-07:00", venue: "Levi's Stadium",          city: "Santa Clara",     country: "USA", home: "JOR", away: "ALG" },
  { matchNumber: 59, stage: "GROUP", group: "J", date: "2026-06-27T21:00:00-05:00", venue: "Arrowhead Stadium",       city: "Kansas City",     country: "USA", home: "ALG", away: "AUT" },
  { matchNumber: 60, stage: "GROUP", group: "J", date: "2026-06-27T21:00:00-05:00", venue: "AT&T Stadium",            city: "Arlington",       country: "USA", home: "JOR", away: "ARG" },
  // Group K
  { matchNumber: 61, stage: "GROUP", group: "K", date: "2026-06-17T12:00:00-05:00", venue: "NRG Stadium",             city: "Houston",         country: "USA", home: "POR", away: "COD" },
  { matchNumber: 62, stage: "GROUP", group: "K", date: "2026-06-17T20:00:00-06:00", venue: "Estadio Azteca",          city: "Mexico City",     country: "MEX", home: "UZB", away: "COL" },
  { matchNumber: 63, stage: "GROUP", group: "K", date: "2026-06-23T12:00:00-05:00", venue: "NRG Stadium",             city: "Houston",         country: "USA", home: "POR", away: "UZB" },
  { matchNumber: 64, stage: "GROUP", group: "K", date: "2026-06-23T20:00:00-06:00", venue: "Estadio Akron",           city: "Guadalajara",     country: "MEX", home: "COL", away: "COD" },
  { matchNumber: 65, stage: "GROUP", group: "K", date: "2026-06-27T19:30:00-04:00", venue: "Hard Rock Stadium",       city: "Miami Gardens",   country: "USA", home: "COL", away: "POR" },
  { matchNumber: 66, stage: "GROUP", group: "K", date: "2026-06-27T19:30:00-04:00", venue: "Mercedes-Benz Stadium",   city: "Atlanta",         country: "USA", home: "COD", away: "UZB" },
  // Group L
  { matchNumber: 67, stage: "GROUP", group: "L", date: "2026-06-17T15:00:00-05:00", venue: "AT&T Stadium",            city: "Arlington",       country: "USA", home: "ENG", away: "CRO" },
  { matchNumber: 68, stage: "GROUP", group: "L", date: "2026-06-17T19:00:00-04:00", venue: "BMO Field",               city: "Toronto",         country: "CAN", home: "GHA", away: "PAN" },
  { matchNumber: 69, stage: "GROUP", group: "L", date: "2026-06-23T16:00:00-04:00", venue: "Gillette Stadium",        city: "Foxborough",      country: "USA", home: "ENG", away: "GHA" },
  { matchNumber: 70, stage: "GROUP", group: "L", date: "2026-06-23T19:00:00-04:00", venue: "BMO Field",               city: "Toronto",         country: "CAN", home: "PAN", away: "CRO" },
  { matchNumber: 71, stage: "GROUP", group: "L", date: "2026-06-27T17:00:00-04:00", venue: "MetLife Stadium",         city: "East Rutherford", country: "USA", home: "PAN", away: "ENG" },
  { matchNumber: 72, stage: "GROUP", group: "L", date: "2026-06-27T17:00:00-04:00", venue: "Lincoln Financial Field", city: "Philadelphia",    country: "USA", home: "CRO", away: "GHA" },

  // ---------- ROUND OF 32 ----------
  { matchNumber: 73, stage: "R32",   group: null, date: "2026-06-28T12:00:00-07:00", venue: "SoFi Stadium",            city: "Inglewood",       country: "USA", home: "2A",       away: "2B"       },
  { matchNumber: 74, stage: "R32",   group: null, date: "2026-06-29T16:30:00-04:00", venue: "Gillette Stadium",        city: "Foxborough",      country: "USA", home: "1E",       away: "3ABCDF"   },
  { matchNumber: 75, stage: "R32",   group: null, date: "2026-06-29T19:00:00-06:00", venue: "Estadio BBVA",            city: "Monterrey",       country: "MEX", home: "1F",       away: "2C"       },
  { matchNumber: 76, stage: "R32",   group: null, date: "2026-06-29T12:00:00-05:00", venue: "NRG Stadium",             city: "Houston",         country: "USA", home: "1C",       away: "2F"       },
  { matchNumber: 77, stage: "R32",   group: null, date: "2026-06-30T17:00:00-04:00", venue: "MetLife Stadium",         city: "East Rutherford", country: "USA", home: "1I",       away: "3CDFGH"   },
  { matchNumber: 78, stage: "R32",   group: null, date: "2026-06-30T12:00:00-05:00", venue: "AT&T Stadium",            city: "Arlington",       country: "USA", home: "2E",       away: "2I"       },
  { matchNumber: 79, stage: "R32",   group: null, date: "2026-06-30T19:00:00-06:00", venue: "Estadio Azteca",          city: "Mexico City",     country: "MEX", home: "1A",       away: "3CEFHI"   },
  { matchNumber: 80, stage: "R32",   group: null, date: "2026-07-01T12:00:00-04:00", venue: "Mercedes-Benz Stadium",   city: "Atlanta",         country: "USA", home: "1L",       away: "3EHIJK"   },
  { matchNumber: 81, stage: "R32",   group: null, date: "2026-07-01T17:00:00-07:00", venue: "Levi's Stadium",          city: "Santa Clara",     country: "USA", home: "1D",       away: "3BEFIJ"   },
  { matchNumber: 82, stage: "R32",   group: null, date: "2026-07-01T13:00:00-07:00", venue: "Lumen Field",             city: "Seattle",         country: "USA", home: "1G",       away: "3AEHIJ"   },
  { matchNumber: 83, stage: "R32",   group: null, date: "2026-07-02T19:00:00-04:00", venue: "BMO Field",               city: "Toronto",         country: "CAN", home: "2K",       away: "2L"       },
  { matchNumber: 84, stage: "R32",   group: null, date: "2026-07-02T12:00:00-07:00", venue: "SoFi Stadium",            city: "Inglewood",       country: "USA", home: "1H",       away: "2J"       },
  { matchNumber: 85, stage: "R32",   group: null, date: "2026-07-02T20:00:00-07:00", venue: "BC Place",                city: "Vancouver",       country: "CAN", home: "1B",       away: "3EFGIJ"   },
  { matchNumber: 86, stage: "R32",   group: null, date: "2026-07-03T18:00:00-04:00", venue: "Hard Rock Stadium",       city: "Miami Gardens",   country: "USA", home: "1J",       away: "2H"       },
  { matchNumber: 87, stage: "R32",   group: null, date: "2026-07-03T20:30:00-05:00", venue: "Arrowhead Stadium",       city: "Kansas City",     country: "USA", home: "1K",       away: "3DEIJL"   },
  { matchNumber: 88, stage: "R32",   group: null, date: "2026-07-03T13:00:00-05:00", venue: "AT&T Stadium",            city: "Arlington",       country: "USA", home: "2D",       away: "2G"       },

  // ---------- ROUND OF 16 ----------
  { matchNumber:  89, stage: "R16",  group: null, date: "2026-07-04T17:00:00-04:00", venue: "Lincoln Financial Field", city: "Philadelphia",    country: "USA", home: "W74",  away: "W77"  },
  { matchNumber:  90, stage: "R16",  group: null, date: "2026-07-04T12:00:00-05:00", venue: "NRG Stadium",             city: "Houston",         country: "USA", home: "W73",  away: "W75"  },
  { matchNumber:  91, stage: "R16",  group: null, date: "2026-07-05T16:00:00-04:00", venue: "MetLife Stadium",         city: "East Rutherford", country: "USA", home: "W76",  away: "W78"  },
  { matchNumber:  92, stage: "R16",  group: null, date: "2026-07-05T18:00:00-06:00", venue: "Estadio Azteca",          city: "Mexico City",     country: "MEX", home: "W79",  away: "W80"  },
  { matchNumber:  93, stage: "R16",  group: null, date: "2026-07-06T14:00:00-05:00", venue: "AT&T Stadium",            city: "Arlington",       country: "USA", home: "W83",  away: "W84"  },
  { matchNumber:  94, stage: "R16",  group: null, date: "2026-07-06T17:00:00-07:00", venue: "Lumen Field",             city: "Seattle",         country: "USA", home: "W81",  away: "W82"  },
  { matchNumber:  95, stage: "R16",  group: null, date: "2026-07-07T12:00:00-04:00", venue: "Mercedes-Benz Stadium",   city: "Atlanta",         country: "USA", home: "W86",  away: "W88"  },
  { matchNumber:  96, stage: "R16",  group: null, date: "2026-07-07T13:00:00-07:00", venue: "BC Place",                city: "Vancouver",       country: "CAN", home: "W85",  away: "W87"  },

  // ---------- QUARTERFINALS ----------
  { matchNumber:  97, stage: "QF",   group: null, date: "2026-07-09T16:00:00-04:00", venue: "Gillette Stadium",        city: "Foxborough",      country: "USA", home: "W89",  away: "W90"  },
  { matchNumber:  98, stage: "QF",   group: null, date: "2026-07-10T12:00:00-07:00", venue: "SoFi Stadium",            city: "Inglewood",       country: "USA", home: "W93",  away: "W94"  },
  { matchNumber:  99, stage: "QF",   group: null, date: "2026-07-11T17:00:00-04:00", venue: "Hard Rock Stadium",       city: "Miami Gardens",   country: "USA", home: "W91",  away: "W92"  },
  { matchNumber: 100, stage: "QF",   group: null, date: "2026-07-11T20:00:00-05:00", venue: "Arrowhead Stadium",       city: "Kansas City",     country: "USA", home: "W95",  away: "W96"  },

  // ---------- SEMIFINALS ----------
  { matchNumber: 101, stage: "SF",   group: null, date: "2026-07-14T14:00:00-05:00", venue: "AT&T Stadium",            city: "Arlington",       country: "USA", home: "W97",  away: "W98"  },
  { matchNumber: 102, stage: "SF",   group: null, date: "2026-07-15T15:00:00-04:00", venue: "Mercedes-Benz Stadium",   city: "Atlanta",         country: "USA", home: "W99",  away: "W100" },

  // ---------- THIRD PLACE ----------
  { matchNumber: 103, stage: "TP",   group: null, date: "2026-07-18T17:00:00-04:00", venue: "Hard Rock Stadium",       city: "Miami Gardens",   country: "USA", home: "L101", away: "L102" },

  // ---------- FINAL ----------
  { matchNumber: 104, stage: "FINAL", group: null, date: "2026-07-19T15:00:00-04:00", venue: "MetLife Stadium",        city: "East Rutherford", country: "USA", home: "W101", away: "W102" },
];
