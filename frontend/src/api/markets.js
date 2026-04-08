import { MOCK_GAMES } from "../data/mockData";

export async function searchMarkets(query) {
  // TODO: Replace with real API call to backend
  const filtered = MOCK_GAMES.filter(
    (g) =>
      g.event_name.toLowerCase().includes(query.toLowerCase()) ||
      g.team_a.name.toLowerCase().includes(query.toLowerCase()) ||
      g.team_b.name.toLowerCase().includes(query.toLowerCase()) ||
      g.team_a.abbr.toLowerCase().includes(query.toLowerCase()) ||
      g.team_b.abbr.toLowerCase().includes(query.toLowerCase())
  );
  return filtered;
}

export async function getAllMarkets() {
  // TODO: Replace with real API call to backend
  return MOCK_GAMES;
}
