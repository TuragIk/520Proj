// Static mock data used when the backend is offline.
// Matches the NormalizedGame shape returned by GET /markets, extended with
// display-only fields (volume, platform_ids) that the real API doesn't include yet.
// All game times are computed relative to now so they always appear as upcoming games.

import { teamColor } from "./teamData";

function hoursFromNow(h) {
  return new Date(Date.now() + h * 3600 * 1000).toISOString();
}

// Generates price history rows for PriceHistoryChart.
// Each time point produces 4 rows (kalshi home/away, polymarket home/away).
function makeHistory(times, home, away) {
  const rows = [];
  for (let i = 0; i < times.length; i++) {
    rows.push({ recorded_at: times[i], platform: "kalshi",     side: "home", odds: home.kalshi[i] });
    rows.push({ recorded_at: times[i], platform: "kalshi",     side: "away", odds: away.kalshi[i] });
    rows.push({ recorded_at: times[i], platform: "polymarket", side: "home", odds: home.polymarket[i] });
    rows.push({ recorded_at: times[i], platform: "polymarket", side: "away", odds: away.polymarket[i] });
  }
  return rows;
}

const HISTORY_TIMES = [
  "2026-05-13T09:00:00", "2026-05-13T09:15:00",
  "2026-05-13T09:30:00", "2026-05-13T09:45:00",
  "2026-05-13T10:00:00", "2026-05-13T10:15:00",
  "2026-05-13T10:30:00", "2026-05-13T10:45:00",
];

export const MOCK_GAMES = [
  {
    // Highest combined volume — sorts to top of home page
    game_id: "nba-401999005",
    game_time: hoursFromNow(3),
    home: {
      name: "Bucks",
      abbr: "MIL",
      color: teamColor("MIL"),
      odds: { kalshi: 0.63, polymarket: 0.67 },   // Polymarket 4¢ better for MIL bettors
    },
    away: {
      name: "Pacers",
      abbr: "IND",
      color: teamColor("IND"),
      odds: { kalshi: 0.37, polymarket: 0.33 },
    },
    arbitrage: { exists: false, spread: null, description: null },
    volume: { kalshi: 1200000, polymarket: 2100000 },
    platform_ids: {
      kalshi: "KXNBAGAME-26MAY13-IND-MIL",
      polymarket: "nba-ind-mil-2026-05-13",
    },
  },
  {
    game_id: "nba-401999002",
    game_time: hoursFromNow(6),
    home: {
      name: "Thunder",
      abbr: "OKC",
      color: teamColor("OKC"),
      odds: { kalshi: 0.58, polymarket: 0.54 },   // Kalshi 4¢ better for OKC; Polymarket 4¢ better for MIN
    },
    away: {
      name: "Timberwolves",
      abbr: "MIN",
      color: teamColor("MIN"),
      odds: { kalshi: 0.42, polymarket: 0.46 },
    },
    arbitrage: { exists: false, spread: null, description: null },
    volume: { kalshi: 891000, polymarket: 1340000 },
    platform_ids: {
      kalshi: "KXNBAGAME-26MAY13-MIN-OKC",
      polymarket: "nba-min-okc-2026-05-13",
    },
  },
  {
    // ARBITRAGE: Kalshi favors NYK, Polymarket favors PHI — buy both sides for guaranteed profit
    game_id: "nba-401999003",
    game_time: hoursFromNow(5),
    home: {
      name: "76ers",
      abbr: "PHI",
      color: teamColor("PHI"),
      odds: { kalshi: 0.48, polymarket: 0.53 },
    },
    away: {
      name: "Knicks",
      abbr: "NYK",
      color: teamColor("NYK"),
      odds: { kalshi: 0.52, polymarket: 0.47 },
    },
    arbitrage: {
      exists: true,
      spread: 0.05,
      description:
        "Buy PHI on Kalshi (48¢) + NYK on Polymarket (47¢) = 95¢ total → guaranteed $0.05 profit per $1 contract",
    },
    volume: { kalshi: 445000, polymarket: 678000 },
    platform_ids: {
      kalshi: "KXNBAGAME-26MAY13-NYK-PHI",
      polymarket: "nba-nyk-phi-2026-05-13",
    },
  },
  {
    game_id: "nba-401999001",
    game_time: hoursFromNow(4),
    home: {
      name: "Celtics",
      abbr: "BOS",
      color: teamColor("BOS"),
      odds: { kalshi: 0.72, polymarket: 0.74 },   // Polymarket 2¢ better for BOS bettors
    },
    away: {
      name: "Cavaliers",
      abbr: "CLE",
      color: teamColor("CLE"),
      odds: { kalshi: 0.28, polymarket: 0.26 },
    },
    arbitrage: { exists: false, spread: null, description: null },
    volume: { kalshi: 562000, polymarket: 923000 },
    platform_ids: {
      kalshi: "KXNBAGAME-26MAY13-CLE-BOS",
      polymarket: "nba-cle-bos-2026-05-13",
    },
  },
  {
    // Clear best-platform split: Kalshi 5¢ better for DEN, Polymarket 5¢ better for DAL
    game_id: "nba-401999006",
    game_time: hoursFromNow(9),
    home: {
      name: "Nuggets",
      abbr: "DEN",
      color: teamColor("DEN"),
      odds: { kalshi: 0.62, polymarket: 0.57 },
    },
    away: {
      name: "Mavericks",
      abbr: "DAL",
      color: teamColor("DAL"),
      odds: { kalshi: 0.38, polymarket: 0.43 },
    },
    arbitrage: { exists: false, spread: null, description: null },
    volume: { kalshi: 732000, polymarket: 1050000 },
    platform_ids: {
      kalshi: "KXNBAGAME-26MAY14-DAL-DEN",
      polymarket: "nba-dal-den-2026-05-14",
    },
  },
  {
    game_id: "nba-401999004",
    game_time: hoursFromNow(8),
    home: {
      name: "Warriors",
      abbr: "GSW",
      color: teamColor("GSW"),
      odds: { kalshi: 0.43, polymarket: 0.44 },
    },
    away: {
      name: "Lakers",
      abbr: "LAL",
      color: teamColor("LAL"),
      odds: { kalshi: 0.57, polymarket: 0.56 },
    },
    arbitrage: { exists: false, spread: null, description: null },
    volume: { kalshi: 284000, polymarket: 512000 },
    platform_ids: {
      kalshi: "KXNBAGAME-26MAY14-LAL-GSW",
      polymarket: "nba-lal-gsw-2026-05-14",
    },
  },
];

// Price history for each game — consumed by PriceHistoryChart via fetchPriceHistory mock fallback.
// Rows shape: { recorded_at: ISO string, platform: "kalshi"|"polymarket", side: "home"|"away", odds: number }
export const MOCK_PRICE_HISTORY = {
  // MIL vs IND: MIL trending up; Polymarket consistently 4¢ higher for MIL throughout
  "nba-401999005": makeHistory(HISTORY_TIMES,
    { kalshi:     [0.60, 0.61, 0.61, 0.62, 0.62, 0.63, 0.63, 0.63],
      polymarket: [0.64, 0.64, 0.65, 0.65, 0.66, 0.66, 0.67, 0.67] },
    { kalshi:     [0.40, 0.39, 0.39, 0.38, 0.38, 0.37, 0.37, 0.37],
      polymarket: [0.36, 0.36, 0.35, 0.35, 0.34, 0.34, 0.33, 0.33] }
  ),
  // OKC vs MIN: Volatile close game; platforms disagree and flip across sessions
  "nba-401999002": makeHistory(HISTORY_TIMES,
    { kalshi:     [0.55, 0.56, 0.57, 0.55, 0.56, 0.58, 0.59, 0.58],
      polymarket: [0.53, 0.53, 0.54, 0.53, 0.54, 0.54, 0.55, 0.54] },
    { kalshi:     [0.45, 0.44, 0.43, 0.45, 0.44, 0.42, 0.41, 0.42],
      polymarket: [0.47, 0.47, 0.46, 0.47, 0.46, 0.46, 0.45, 0.46] }
  ),
  // PHI vs NYK (ARBITRAGE): Platforms start equal and visibly diverge — best chart for the demo
  "nba-401999003": makeHistory(HISTORY_TIMES,
    { kalshi:     [0.50, 0.51, 0.50, 0.49, 0.49, 0.48, 0.48, 0.48],
      polymarket: [0.50, 0.50, 0.51, 0.52, 0.52, 0.52, 0.53, 0.53] },
    { kalshi:     [0.50, 0.49, 0.50, 0.51, 0.51, 0.52, 0.52, 0.52],
      polymarket: [0.50, 0.50, 0.49, 0.48, 0.48, 0.48, 0.47, 0.47] }
  ),
  // BOS vs CLE: BOS steady favorite trending up; Polymarket 2¢ higher than Kalshi throughout
  "nba-401999001": makeHistory(HISTORY_TIMES,
    { kalshi:     [0.70, 0.70, 0.71, 0.71, 0.71, 0.72, 0.73, 0.72],
      polymarket: [0.72, 0.72, 0.73, 0.73, 0.74, 0.74, 0.75, 0.74] },
    { kalshi:     [0.30, 0.30, 0.29, 0.29, 0.29, 0.28, 0.27, 0.28],
      polymarket: [0.28, 0.28, 0.27, 0.27, 0.26, 0.26, 0.25, 0.26] }
  ),
  // DEN vs DAL: Kalshi and Polymarket clearly diverging in opposite directions over time
  "nba-401999006": makeHistory(HISTORY_TIMES,
    { kalshi:     [0.59, 0.60, 0.60, 0.61, 0.61, 0.62, 0.62, 0.62],
      polymarket: [0.56, 0.56, 0.56, 0.57, 0.57, 0.57, 0.57, 0.57] },
    { kalshi:     [0.41, 0.40, 0.40, 0.39, 0.39, 0.38, 0.38, 0.38],
      polymarket: [0.44, 0.44, 0.44, 0.43, 0.43, 0.43, 0.43, 0.43] }
  ),
  // GSW vs LAL: LAL steady favorite; tight 1¢ spread between platforms
  "nba-401999004": makeHistory(HISTORY_TIMES,
    { kalshi:     [0.44, 0.44, 0.43, 0.43, 0.43, 0.43, 0.43, 0.43],
      polymarket: [0.45, 0.44, 0.44, 0.44, 0.44, 0.44, 0.44, 0.44] },
    { kalshi:     [0.56, 0.56, 0.57, 0.57, 0.57, 0.57, 0.57, 0.57],
      polymarket: [0.55, 0.56, 0.56, 0.56, 0.56, 0.56, 0.56, 0.56] }
  ),
};

// Demo limits preset: 4/5 bets used today, $40/$50 spent.
// One more logged bet triggers the frequency warning live during the demo.
// See demo setup command below.
export const MOCK_LIMITS = {
  max_bets_per_day: 5,
  max_daily_amount: 50,
  bets_today: 4,
  amount_today: 40.0,
};

// Bet history: 2 settled bets (won/lost) + 1 from yesterday (shows as "closed") + 4 from today.
// The 4 today-bets match MOCK_LIMITS (bets_today: 4, amount_today: $12+$10+$8+$10 = $40).
export const MOCK_USER_BETS = [
  {
    id: "bet-001",
    game_id: "nba-401999001",
    event_name: "CLE @ BOS",
    platform: "kalshi",
    team_name: "Celtics",
    amount: 15.0,
    price_at_entry: 0.68,
    status: "won",
    placed_at: hoursFromNow(-72),
  },
  {
    id: "bet-002",
    game_id: "nba-401999004",
    event_name: "GSW @ LAL",
    platform: "polymarket",
    team_name: "Warriors",
    amount: 8.0,
    price_at_entry: 0.45,
    status: "lost",
    placed_at: hoursFromNow(-96),
  },
  {
    // Placed yesterday — BetRow displays this as "closed" despite status: "open"
    id: "bet-003",
    game_id: "nba-401999002",
    event_name: "MIN @ OKC",
    platform: "polymarket",
    team_name: "Timberwolves",
    amount: 5.0,
    price_at_entry: 0.46,
    status: "open",
    placed_at: hoursFromNow(-30),
  },
  {
    id: "bet-004",
    game_id: "nba-401999005",
    event_name: "IND @ MIL",
    platform: "polymarket",
    team_name: "Bucks",
    amount: 12.0,
    price_at_entry: 0.65,
    status: "open",
    placed_at: hoursFromNow(-2),
  },
  {
    id: "bet-005",
    game_id: "nba-401999006",
    event_name: "DAL @ DEN",
    platform: "kalshi",
    team_name: "Nuggets",
    amount: 10.0,
    price_at_entry: 0.60,
    status: "open",
    placed_at: hoursFromNow(-1),
  },
  {
    id: "bet-006",
    game_id: "nba-401999001",
    event_name: "CLE @ BOS",
    platform: "polymarket",
    team_name: "Celtics",
    amount: 8.0,
    price_at_entry: 0.73,
    status: "open",
    placed_at: hoursFromNow(-0.5),
  },
  {
    id: "bet-007",
    game_id: "nba-401999003",
    event_name: "NYK @ PHI",
    platform: "kalshi",
    team_name: "76ers",
    amount: 10.0,
    price_at_entry: 0.48,
    status: "open",
    placed_at: hoursFromNow(-0.25),
  },
];
