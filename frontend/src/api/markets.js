import { MOCK_GAMES } from "../data/mockData";
import { teamColor } from "../data/teamData";

const API_BASE = "http://localhost:8000";

export async function getAllMarkets() {
  try {
    const resp = await fetch(`${API_BASE}/markets`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const data = await resp.json();
    return { games: data.games.map(transformGame), source: "live" };
  } catch {
    return { games: MOCK_GAMES, source: "mock" };
  }
}

// Backend returns NormalizedGame without team colors or volume.
// We enrich with colors from the local team map.
function transformGame(g) {
  return {
    game_id: g.game_id,
    game_time: g.game_time,
    home: { ...g.home, color: teamColor(g.home.abbr) },
    away: { ...g.away, color: teamColor(g.away.abbr) },
    arbitrage: g.arbitrage ?? { exists: false, spread: null, description: null },
    volume: { kalshi: null, polymarket: null },
    platform_ids: { kalshi: null, polymarket: null },
  };
}
