import json

from fastapi import APIRouter, HTTPException

from ..services.espn import fetch_games_next_24h
from ..services.kalshi import fetch_markets_for_game as kalshi_fetch
from ..services.polymarket import fetch_market_for_game as polymarket_fetch
from ..services.normalize import normalize_game
from ..cache.redis_client import get_redis
from ..services.poller import CACHE_KEY

router = APIRouter(tags=["markets"])


@router.get("/markets")
def get_markets():
    r = get_redis()
    if r:
        cached = r.get(CACHE_KEY)
        if cached:
            return json.loads(cached)

    # Cache miss or Redis down — live fetch
    try:
        games = fetch_games_next_24h()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ESPN API error: {e}")

    results = []
    for game in games:
        try:
            kalshi_markets = kalshi_fetch(game)
        except Exception:
            kalshi_markets = []
        try:
            pm_market = polymarket_fetch(game)
        except Exception:
            pm_market = None
        results.append(normalize_game(game, kalshi_markets, pm_market))

    return {"games": results, "count": len(results)}