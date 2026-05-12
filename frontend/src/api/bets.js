// Bet logging. When a real JWT is present, calls POST /bets on the backend
// and mirrors the result into localStorage so getBets() works offline too.
// Falls back to localStorage-only when the backend is unreachable or the user
// is not logged in (mock-token from offline login also falls through).

import { getToken } from "./auth";

const BETS_KEY = "dg_bets";
const LIMITS_KEY = "dg_limits";
const API_BASE = "http://localhost:8000";

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

export async function addBet({ game_id, event_name, platform, team, team_name, amount, price_at_entry }) {
  const token = getToken();

  if (token && token !== "mock-token") {
    try {
      const controller = new AbortController();
      setTimeout(() => controller.abort(), 3000);
      const res = await fetch(`${API_BASE}/bets`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ game_id, event_name, platform, team, team_name, amount, price_at_entry }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.detail === "daily_bet_limit") return { ok: false, reason: "daily_bet_limit" };
        if (data.detail === "daily_amount_limit") return { ok: false, reason: "daily_amount_limit" };
        return { ok: false, reason: data.detail ?? "error" };
      }
      const bet = await res.json();
      // Mirror into localStorage so getBets() reflects it immediately
      const bets = getBets();
      bets.push(bet);
      localStorage.setItem(BETS_KEY, JSON.stringify(bets));
      const limits = getLimits();
      const updated = {
        ...limits,
        date: todayKey(),
        bets_today: limits.bets_today + 1,
        amount_today: limits.amount_today + amount,
      };
      localStorage.setItem(LIMITS_KEY, JSON.stringify(updated));
      return { ok: true, bet, limits: updated };
    } catch {
      // Backend unreachable — fall through to localStorage
    }
  }

  // localStorage fallback (no token, mock token, or backend down)
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
