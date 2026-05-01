# Backend

FastAPI backend for Dynamite Gambling. Fetches NBA game schedules from ESPN, queries live odds from Kalshi and Polymarket, and serves normalized market data to the frontend.

## Tech Stack

- **FastAPI** — API framework
- **PostgreSQL** — persistent storage (bets, price history, users)
- **Redis** — short-TTL odds cache
- **httpx** — async-capable HTTP client for external API calls

## Prerequisites

- Python 3.12+
- PostgreSQL running locally or via a connection URL
- Redis running locally (default port 6379)

## Setup

```bash
# From the backend/ directory

python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

Create a `.env` file in `backend/`:

```
DATABASE_URL=postgresql://user:password@localhost:5432/dynamite
```

## Running

```bash
# From the backend/ directory, with .venv active
uvicorn src.main:app --reload
```

The API will be available at `http://localhost:8000`. Interactive docs at `http://localhost:8000/docs`.

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check / welcome |
| `GET` | `/health` | Service status |
| `GET` | `/schedule/nba` | NBA games starting in the next 24h (from ESPN) |
| `GET` | `/markets/kalshi` | Raw Kalshi markets for each upcoming game |
| `GET` | `/markets/polymarket` | Raw Polymarket markets for each upcoming game |
| `GET` | `/markets` | **Primary endpoint.** Normalized odds from both platforms side by side |

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
    │   ├── schedule.py       # GET /schedule/nba
    │   ├── kalshi.py         # GET /markets/kalshi
    │   ├── polymarket.py     # GET /markets/polymarket
    │   └── markets_unified.py # GET /markets (normalized)
    ├── services/
    │   ├── espn.py           # ESPN scoreboard fetcher
    │   ├── kalshi.py         # Kalshi API client
    │   ├── polymarket.py     # Polymarket Gamma API client
    │   └── normalize.py      # Merges Kalshi + Polymarket into common schema
    ├── data/
    │   └── nba_teams.py      # ESPN abbreviation → team metadata hashmap
    └── db/
        ├── models.py         # SQLAlchemy ORM models
        ├── connection.py     # DB session and engine setup
        └── seed.py           # Dev seed data
```

## TODO 

The polling pipeline and caching layer still need to be wired up:

- **APScheduler jobs** (add to `main.py` startup):
  - Hourly: call `fetch_games_next_24h()` from `services/espn.py` to refresh the active game list
  - Every 5 min: for each active game, call `fetch_markets_for_game()` (Kalshi) and `fetch_market_for_game()` (Polymarket), normalize via `normalize_game()`, write to Redis + DB

- **Redis caching**: cache the output of `normalize_game()` per game with a TTL of ~5–6 minutes; update `GET /markets` to serve from cache (live fetch as fallback on cache miss)

- **DB writes**: on each poll, upsert a `Market` row per platform per game, then insert a `PriceHistory` row with the current normalized odds

All the fetcher and normalization functions are already implemented and tested — this task is purely the scheduling and persistence wiring.
