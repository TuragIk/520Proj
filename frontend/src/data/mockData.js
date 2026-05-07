import { teamColor } from "./teamData";

// Matches NormalizedGame shape from GET /markets, extended with display-only fields
// (volume and platform_ids are not in the real API response — used for mock only)
export const MOCK_GAMES = [
  {
    game_id: "nba-401999001",
    game_time: "2026-05-06T23:30:00Z",
    home: {
      name: "Celtics",
      abbr: "BOS",
      color: teamColor("BOS"),
      odds: { kalshi: 0.72, polymarket: 0.72 },
    },
    away: {
      name: "Cavaliers",
      abbr: "CLE",
      color: teamColor("CLE"),
      odds: { kalshi: 0.28, polymarket: 0.28 },
    },
    arbitrage: { exists: false, spread: null, description: null },
    volume: { kalshi: 284000, polymarket: 512000 },
    platform_ids: {
      kalshi: "KXNBAGAME-26MAY06-CLE-BOS",
      polymarket: "nba-cle-bos-2026-05-06",
    },
  },
  {
    game_id: "nba-401999002",
    game_time: "2026-05-07T02:00:00Z",
    home: {
      name: "Thunder",
      abbr: "OKC",
      color: teamColor("OKC"),
      odds: { kalshi: 0.56, polymarket: 0.57 },
    },
    away: {
      name: "Timberwolves",
      abbr: "MIN",
      color: teamColor("MIN"),
      odds: { kalshi: 0.44, polymarket: 0.43 },
    },
    arbitrage: { exists: false, spread: null, description: null },
    volume: { kalshi: 891000, polymarket: 1340000 },
    platform_ids: {
      kalshi: "KXNBAGAME-26MAY06-MIN-OKC",
      polymarket: "nba-min-okc-2026-05-06",
    },
  },
  {
    // Platforms disagree: Kalshi favors PHI, Polymarket favors NYK → arbitrage
    game_id: "nba-401999003",
    game_time: "2026-05-07T00:00:00Z",
    home: {
      name: "76ers",
      abbr: "PHI",
      color: teamColor("PHI"),
      odds: { kalshi: 0.48, polymarket: 0.52 },
    },
    away: {
      name: "Knicks",
      abbr: "NYK",
      color: teamColor("NYK"),
      odds: { kalshi: 0.52, polymarket: 0.48 },
    },
    arbitrage: {
      exists: true,
      spread: 0.04,
      description:
        "Buy NYK on Polymarket (48%) + PHI on Kalshi (48%) = 96% cost → $0.04 profit per $1 contract",
    },
    volume: { kalshi: 445000, polymarket: 678000 },
    platform_ids: {
      kalshi: "KXNBAGAME-26MAY06-NYK-PHI",
      polymarket: "nba-nyk-phi-2026-05-06",
    },
  },
  {
    game_id: "nba-401999004",
    game_time: "2026-05-07T01:30:00Z",
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
    volume: { kalshi: 562000, polymarket: 923000 },
    platform_ids: {
      kalshi: "KXNBAGAME-26MAY07-LAL-GSW",
      polymarket: "nba-lal-gsw-2026-05-07",
    },
  },
];

export const MOCK_USER_BETS = [
  {
    id: "bet-001",
    game_id: "nba-401999001",
    event_name: "CLE @ BOS",
    platform: "kalshi",
    team: "BOS",
    position: "YES",
    amount: 10.0,
    price_at_entry: 0.65,
    status: "open",
    placed_at: "2026-05-05T10:15:00Z",
  },
  {
    id: "bet-002",
    game_id: "nba-401999002",
    event_name: "MIN @ OKC",
    platform: "polymarket",
    team: "MIN",
    position: "YES",
    amount: 5.0,
    price_at_entry: 0.42,
    status: "open",
    placed_at: "2026-05-05T14:30:00Z",
  },
];

export const INITIAL_LIMITS = {
  max_bets_per_day: 5,
  bets_today: 2,
  max_daily_amount: 50.0,
  amount_today: 15.0,
};
