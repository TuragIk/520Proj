// Primary brand colors for all 30 NBA teams, keyed by standard 3-letter abbreviation.
// Used to enrich live backend data (which carries no color info) with display colors.
// Falls back to a neutral slate if an abbreviation isn't found.

export const TEAM_COLORS = {
  ATL: "#E03A3E", BOS: "#007A33", BRK: "#000000", CHA: "#1D1160",
  CHI: "#CE1141", CLE: "#860038", DAL: "#00538C", DEN: "#0E2240",
  DET: "#C8102E", GSW: "#1D428A", HOU: "#CE1141", IND: "#FDBB30",
  LAC: "#C8102E", LAL: "#552583", MEM: "#5D76A9", MIA: "#98002E",
  MIL: "#00471B", MIN: "#236192", NOP: "#0C2340", NYK: "#F58426",
  OKC: "#007AC1", ORL: "#0077C0", PHI: "#006BB6", PHX: "#E56020",
  POR: "#E03A3E", SAC: "#5A2D81", SAS: "#C4CED4", TOR: "#CE1141",
  UTA: "#002B5C", WAS: "#002B5C",
};

export function teamColor(abbr) {
  return TEAM_COLORS[abbr] ?? "#64748b";
}
