const BETS_KEY = "dg_bets";
const LIMITS_KEY = "dg_limits";

const DEFAULT_LIMITS = { max_bets_per_day: 5, max_daily_amount: 50.0 };

function todayKey() {
  return new Date().toDateString();
}

export function getBets() {
  try {
    return JSON.parse(localStorage.getItem(BETS_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function getLimits() {
  try {
    const stored = JSON.parse(localStorage.getItem(LIMITS_KEY) ?? "{}");
    if (stored.date !== todayKey()) {
      return { ...DEFAULT_LIMITS, bets_today: 0, amount_today: 0.0 };
    }
    return { ...DEFAULT_LIMITS, ...stored };
  } catch {
    return { ...DEFAULT_LIMITS, bets_today: 0, amount_today: 0.0 };
  }
}

export function addBet({ game_id, event_name, platform, team, team_name, amount, price_at_entry }) {
  const limits = getLimits();
  if (limits.bets_today >= limits.max_bets_per_day) {
    return { ok: false, reason: "daily_bet_limit" };
  }
  if (limits.amount_today + amount > limits.max_daily_amount) {
    return { ok: false, reason: "daily_amount_limit" };
  }

  const bet = {
    id: `bet-${Date.now()}`,
    game_id,
    event_name,
    platform,
    team,
    team_name,
    amount,
    price_at_entry,
    status: "open",
    placed_at: new Date().toISOString(),
  };

  const bets = getBets();
  bets.push(bet);
  localStorage.setItem(BETS_KEY, JSON.stringify(bets));

  const updated = {
    ...limits,
    date: todayKey(),
    bets_today: limits.bets_today + 1,
    amount_today: limits.amount_today + amount,
  };
  localStorage.setItem(LIMITS_KEY, JSON.stringify(updated));

  return { ok: true, bet, limits: updated };
}
