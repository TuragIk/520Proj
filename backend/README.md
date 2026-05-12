# Backend

FastAPI backend for Dynamite Gambling. Fetches NBA game schedules from ESPN, queries live odds from Kalshi and Polymarket, and serves normalized market data to the frontend.

## Tech Stack

- **FastAPI** — API framework
- **PostgreSQL** — persistent storage (bets, price history, users)
- **Redis** — short-TTL odds cache
- **APScheduler** — background polling every 5 minutes
- **httpx** — async-capable HTTP client for external API calls

## Prerequisites

- Python 3.12+
- [Docker Desktop](https://www.docker.com/products/docker-desktop/) — used to run PostgreSQL and Redis locally

## Setup
**Step 1 — Start the database and cache** (from the project root, not the backend/ directory):

```bash
docker-compose up -d

# From the backend/ directory
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```
Create a `.env` file in `backend/`:
```
cp .env.example .env
```
The values in .env.example are already configured to match the docker-compose credentials — no edits needed for local development.

## Running

```bash
# From the backend/ directory, with .venv active
uvicorn src.main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

On first startup, the server automatically creates all database tables and seeds a default login: admin@dynamite.com, password123

Additional accounts can be created via POST /auth/register

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check / welcome |
| `GET` | `/health` | Service status |
| `GET` | `/schedule/nba` | NBA games starting in the next 24h (from ESPN) |
| `GET` | `/markets/kalshi` | Raw Kalshi markets for each upcoming game |
| `GET` | `/markets/polymarket` | Raw Polymarket markets for each upcoming game |
| `GET` | `/markets` | **Primary endpoint.** Normalized odds from both platforms side by side |
| `POST`| `/auth/register`| Creates a new user account |
| `POST`| `/auth/login`| Returns a JWT bearer token |
| `GET`| `/users/me`| Current user profile and today's usage stats |
| `GET`| `/bets`| All placed bets for the authenticated user |
| `POST`| `/bets`| Log a new placed bet(for authenticated user) |



### `GET /markets` response shape

```json
{
  "count": 2,
  "games": [
    {
      "game_id": "401869410",
      "game_time": "2026-05-01T00:00:00+00:00",
      "home": {
        "name": "76ers",
        "abbr": "PHI",
        "odds": {
          "kalshi": 0.325,
          "polymarket": 0.325
        }
      },
      "away": {
        "name": "Celtics",
        "abbr": "BOS",
        "odds": {
          "kalshi": 0.675,
          "polymarket": 0.675
        }
      },
      "arbitrage": {
        "exists": false,
        "spread": null,
        "description": null
      }
    }
  ]
}
```

Odds are win probabilities (0.0–1.0). Either platform's value may be `null` if no market exists for that game.

## Project Structure

```
backend/
├── requirements.txt
└── src/
    ├── main.py               # FastAPI app and router registration
    ├── api/
    │   ├── auth.py             # POST /auth/login, POST /auth/register
    │   ├── bets.py             # GET /bets, POST /bets, GET /users/me (JWT protected)
    │   ├── markets_unified.py  # GET /markets (Redis cache → live fetch fallback)
    │   ├── schedule.py         # GET /schedule/nba
    │   ├── kalshi.py           # GET /markets/kalshi
    │   └── polymarket.py       # GET /markets/polymarket
    ├── services/
    │   ├── poller.py           # poll_and_cache(): full fetch → Redis + DB write-through
    │   ├── espn.py             # ESPN scoreboard fetcher
    │   ├── kalshi.py           # Kalshi API client
    │   ├── polymarket.py       # Polymarket Gamma API client
    │   └── normalize.py        # Merges Kalshi + Polymarket into NormalizedGame schema
    ├── cache/
    │   └── redis_client.py     # Redis connection with fallback when unavailable
    ├── data/
    │   └── nba_teams.py        # ESPN abbreviation → Kalshi/Polymarket keyword map (all 30 teams)
    └── db/
        ├── models.py           # SQLAlchemy ORM models (User, Market, PlacedBet, PriceHistory, UserWatchlist)
        ├── connection.py       # DB engine and get_db() dependency; safe when DATABASE_URL is unset
        └── seed.py             # Standalone dev seed script (auto-seeding is handled by main.py)
```

## TODO 

The polling pipeline and caching layer still need to be wired up:

- **APScheduler jobs** (add to `main.py` startup):
  - Hourly: call `fetch_games_next_24h()` from `services/espn.py` to refresh the active game list
  - Every 5 min: for each active game, call `fetch_markets_for_game()` (Kalshi) and `fetch_market_for_game()` (Polymarket), normalize via `normalize_game()`, write to Redis + DB

- **Redis caching**: cache the output of `normalize_game()` per game with a TTL of ~5–6 minutes; update `GET /markets` to serve from cache (live fetch as fallback on cache miss)

- **DB writes**: on each poll, upsert a `Market` row per platform per game, then insert a `PriceHistory` row with the current normalized odds

All the fetcher and normalization functions are already implemented and tested — this task is purely the scheduling and persistence wiring.
