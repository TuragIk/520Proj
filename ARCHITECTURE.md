# Architecture

This document describes how data flows through Dynamite Gambling end to end. Pair it with `backend/README.md` and `frontend/README.md` for setup details.

## High-level diagram

```
                                  ┌─────────────────┐
                                  │  React + Vite   │
                                  │   (frontend)    │
                                  └────────┬────────┘
                                           │  HTTPS (JSON)
                                           ▼
┌──────────────────────────────────────────────────────────────────┐
│                          FastAPI backend                          │
│                                                                   │
│   ┌─────────┐   ┌──────────────────┐   ┌─────────────────────┐   │
│   │  auth   │   │  markets_unified │   │        bets         │   │
│   └─────────┘   └────────┬─────────┘   └──────────┬──────────┘   │
│                          │                        │              │
│                          │ read cache             │ enforce limits│
│                          ▼                        ▼              │
│   ┌─────────────────┐   ┌──────────┐    ┌──────────────────┐    │
│   │ APScheduler job │   │  Redis   │    │   PostgreSQL     │    │
│   │ poll_and_cache()│──▶│ markets: │    │ users, markets,  │    │
│   │  every 5 min    │   │   all    │    │ placed_bets,     │    │
│   └────────┬────────┘   └──────────┘    │ price_history    │    │
│            │                            └──────────────────┘    │
└────────────┼────────────────────────────────────────────────────┘
             │
             ▼
   ┌──────────────────┐   ┌──────────────────┐   ┌──────────────────┐
   │   ESPN scoreboard│   │   Kalshi API     │   │ Polymarket Gamma │
   │ (next-24h games) │   │ (KXNBAGAME bets) │   │   (moneyline)    │
   └──────────────────┘   └──────────────────┘   └──────────────────┘
```

## Components

| Layer | Tech | Responsibility |
|-------|------|----------------|
| Frontend | React 19, Vite, Recharts | Renders markets, bet modal, price history chart, my-bets page. Persists JWT and a local bet mirror in `localStorage`. |
| Backend | FastAPI, SQLAlchemy, APScheduler | Routes user requests, owns auth, enforces daily bet/spend limits, runs the polling job. |
| Cache | Redis | Single key `markets:all` holds the full normalized snapshot. TTL 360 s. Read by `GET /markets`. |
| Database | PostgreSQL | Source of truth for users, placed bets, and historical odds. |
| External APIs | ESPN, Kalshi, Polymarket | Game schedules and live prediction-market prices. |

## Request flow — `GET /markets`

1. Frontend calls `GET http://localhost:8000/markets`.
2. Backend (`api/markets_unified.py`) checks Redis for `markets:all`.
   - **Cache hit** — return the cached JSON immediately.
   - **Cache miss** — fetch live: ESPN → for each game, fetch Kalshi + Polymarket → normalize → return the result (live path does *not* persist to DB; only the scheduled poller does).
3. Response is a `NormalizedGame[]` with per-platform odds for home and away, plus an `arbitrage` flag.

## Background poll — `poll_and_cache()`

Runs once on startup and then every 5 minutes via APScheduler.

1. `services/espn.py` returns NBA games starting in the next 24 hours (mapped to Kalshi/Polymarket keywords via `data/nba_teams.py`).
2. For each game:
   - `services/kalshi.py` queries `KXNBAGAME` markets, filters by team abbreviation and game date, and re-fetches each match individually for fresh bid/ask quotes.
   - `services/polymarket.py` builds an event slug `nba-{away}-{home}-{date}` and pulls the moneyline market from the Gamma API.
3. `services/normalize.py` merges both into a single `NormalizedGame` per game and runs arbitrage detection: if the cheapest "home" price plus the cheapest "away" price (across platforms) sums to under \$1, an opportunity exists.
4. The full result is written to:
   - **Redis** — one key `markets:all` with TTL 360 s (read by `GET /markets`).
   - **PostgreSQL** — one row per `(market_id, platform, side)` snapshot inserted into `price_history`; markets are upserted as needed.

## Authentication and bet flow

- **Register / login** (`POST /auth/register`, `POST /auth/login`) — passwords are bcrypt-hashed. Login returns a JWT (24 h expiry).
- **Authenticated requests** — frontend sends `Authorization: Bearer <token>`. `get_current_user` in `api/bets.py` decodes the token and loads the user row.
- **Placing a bet** (`POST /bets`) — server enforces both daily caps (`max_bets_per_day`, `max_daily_spend`) before inserting. Finds-or-creates the `Market` row for the (`external_id`, `platform`) pair, then inserts a `PlacedBet`.
- **Daily totals** (`GET /users/me`) — counts bets placed today and sums their amounts, returned alongside the user's limits.

## Database schema

See `backend/src/db/models.py` for the SQLAlchemy definitions.

| Table | Purpose |
|-------|---------|
| `users` | Auth principals; stores bcrypt password hash and per-user daily limits. |
| `markets` | One row per `(external_id, platform)` pair. `external_id` is the ESPN game id. Parent for placed bets and price history. |
| `placed_bets` | User-logged bets. Junction between `users` and `markets`. `status` always `"active"` today (no resolution job yet). |
| `price_history` | Time-series odds snapshots. One row per `(market_id, platform, side)` per poll. The `side` column tells you whether the odds value is for the home or away team. |
| `user_watchlist` | Schema only; the watchlist/alert feature (FR-4) is not yet implemented. |

## Where state lives

| Data | Lives in | Notes |
|------|----------|-------|
| Live odds snapshot (all games) | Redis (`markets:all`) | Refreshed every 5 minutes. Gone on restart. |
| Historical odds over time | PostgreSQL (`price_history`) | Accumulates one row per platform/side per poll. Feeds the chart. |
| Users, sessions, bet logs | PostgreSQL | Source of truth for authentication and bet records. |
| Token + bet mirror | Browser `localStorage` | `dg_token`, `dg_user`, `dg_bets`, `dg_limits` — exists so the UI works offline. |
| External API credentials | Backend `.env` | Never committed; `.env.example` is the template. |

## Failure modes and degradation

- **ESPN down** — poll aborts; the previous Redis snapshot keeps serving until its TTL expires. After that, `GET /markets` recomputes live and propagates the error if ESPN is still down.
- **Kalshi or Polymarket down** — the other platform's odds are still returned for each game; the missing platform's value is `null` and the arbitrage detector simply reports no opportunity.
- **Redis down** — backend logs a warning, every `GET /markets` recomputes live, external API quotas burn faster. No user-visible breakage.
- **PostgreSQL down** — all authenticated endpoints return 503 via `get_db()`. The `GET /markets` (unauthenticated) endpoint still works because it does not require the DB on the cache-hit path.
- **Backend entirely unreachable** — the frontend has a 3-second timeout on `GET /markets` and falls back to bundled mock data, showing a "Mock data — backend offline" badge.
