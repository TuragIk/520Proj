// Fetches normalized game data from the backend (GET /markets).
// Falls back to MOCK_GAMES automatically if the backend is unreachable or times out (3s).
// The source field in the return value ("live" | "mock") drives the status badge in App.jsx.

import { MOCK_GAMES, MOCK_PRICE_HISTORY } from "../data/mockData";
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

export async function fetchPriceHistory(gameId) {
  try {
    const resp = await fetch(`${API_BASE}/markets/${gameId}/history`, {
      signal: AbortSignal.timeout(3000),
    });
    if (!resp.ok) return { history: [] };
    return await resp.json();
  } catch {
    return { history: MOCK_PRICE_HISTORY[gameId] ?? [] };
  }
}
