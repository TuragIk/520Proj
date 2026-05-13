const WATCHLIST_KEY = "dg_watchlist";

function oddsSnapshot(game) {
  return {
    kalshi_home: game.home.odds.kalshi,
    kalshi_away: game.away.odds.kalshi,
    polymarket_home: game.home.odds.polymarket,
    polymarket_away: game.away.odds.polymarket,
  };
}

export function getWatchlist() {
  try { return JSON.parse(localStorage.getItem(WATCHLIST_KEY) ?? "[]"); }
  catch { return []; }
}

export function isWatched(gameId) {
  return getWatchlist().some((w) => w.game_id === gameId);
}

export function addWatch(game, threshold) {
  const list = getWatchlist().filter((w) => w.game_id !== game.game_id);
  list.push({
    game_id: game.game_id,
    label: `${game.away.abbr} @ ${game.home.abbr}`,
    threshold: Number(threshold),
    odds_snapshot: oddsSnapshot(game),
  });
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
}

export function removeWatch(gameId) {
  const list = getWatchlist().filter((w) => w.game_id !== gameId);
  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(list));
}

export function checkAlerts(games) {
  const list = getWatchlist();
  if (!list.length) return [];

  const alerts = [];
  const updated = list.map((entry) => {
    const game = games.find((g) => g.game_id === entry.game_id);
    if (!game) return entry;

    const snap = entry.odds_snapshot;
    const threshold = entry.threshold / 100;

    const checks = [
      { key: "kalshi_home",      current: game.home.odds.kalshi,      label: `${game.home.abbr} (Kalshi)` },
      { key: "kalshi_away",      current: game.away.odds.kalshi,      label: `${game.away.abbr} (Kalshi)` },
      { key: "polymarket_home",  current: game.home.odds.polymarket,  label: `${game.home.abbr} (Polymarket)` },
      { key: "polymarket_away",  current: game.away.odds.polymarket,  label: `${game.away.abbr} (Polymarket)` },
    ];

    for (const { key, current, label } of checks) {
      const prev = snap[key];
      if (prev == null || current == null) continue;
      const change = Math.abs(current - prev);
      if (change >= threshold) {
        const dir = current > prev ? "↑" : "↓";
        alerts.push({
          id: `${entry.game_id}-${key}-${Date.now()}`,
          message: `${entry.label}: ${label} moved ${dir} ${(change * 100).toFixed(1)}% → now ${(current * 100).toFixed(0)}%`,
        });
      }
    }

    return { ...entry, odds_snapshot: oddsSnapshot(game) };
  });

  localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
  return alerts;
}
