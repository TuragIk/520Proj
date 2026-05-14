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

## Troubleshooting

Common issues encountered during local setup, and how to resolve them.

### `role "dynamite" does not exist` when starting the backend
PostgreSQL is running on port 5432 but it is not the Docker container — most likely a local Homebrew install of Postgres started automatically and grabbed the port before Docker could. Confirm with:
```bash
lsof -i :5432
```
If you see a `postgres` process owned by your user, stop it:
```bash
brew services stop postgresql@14   # adjust version as needed
```
Then re-run `docker-compose up -d` and restart the backend.

### `ModuleNotFoundError: No module named 'src'`
The `uvicorn` command must be run from inside the `backend/` directory, not the project root. The module path `src.main:app` is relative to your current working directory.

### Port 5432 conflict on first `docker-compose up`
If Docker reports the port is already in use, see the first troubleshooting entry above — stop the local Postgres process and try again. Alternatively, change the host port mapping in `docker-compose.yml` (e.g. `"5433:5432"`) and update `DATABASE_URL` in your `.env` to match.

### Backend starts but `/health` shows `db: disconnected`
Either `DATABASE_URL` is missing from `.env`, or PostgreSQL is not actually reachable. Verify with:
```bash
docker-compose ps           # postgres container should be "Up"
docker exec -it 520proj-postgres-1 pg_isready -U dynamite
```

### Schema change requires dropping a table
This project does not use a migration tool yet (e.g. Alembic). When a column is added or renamed in `models.py`, the existing table must be dropped so SQLAlchemy can recreate it on startup. Example for `price_history`:
```bash
docker exec -it 520proj-postgres-1 psql -U dynamite -d dynamite \
  -c "DROP TABLE IF EXISTS price_history CASCADE;"
```
The backend will recreate the table with the new schema on the next startup.

### Redis client says `disconnected` in `/health`
The Redis container is not running or `REDIS_URL` is wrong. The backend continues to function without Redis — every `GET /markets` recomputes data live instead of reading from cache — but external API quotas will be consumed faster.

### `psutil` import error: "incompatible architecture (have 'x86_64', need 'arm64')"
You are on an Apple Silicon Mac but a previously-installed Python package is the Intel build. Reinstall with the cache disabled so pip rebuilds:
```bash
pip uninstall -y psutil
pip install --no-cache-dir psutil
```
If the same error returns, your Python itself is x86_64 (running under Rosetta). Reinstall Python from python.org using the universal2 or arm64 installer, or via `brew install python@3.12`.

## Testing

To test the backend open up a venv from the backend folder. Then 'pip install -r requirements.txt'
Lastly, 
