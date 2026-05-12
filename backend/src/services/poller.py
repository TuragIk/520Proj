import json
import logging

from .espn import fetch_games_next_24h
from .kalshi import fetch_markets_for_game as kalshi_fetch
from .polymarket import fetch_market_for_game as polymarket_fetch
from .normalize import normalize_game
from ..cache.redis_client import get_redis

logger = logging.getLogger(__name__)

CACHE_KEY = "markets:all"
CACHE_TTL = 360  # 6 minutes — slightly longer than the 5-min poll interval

def poll_and_cache():
    """Fetch all upcoming games, normalize odds, write to Redis."""
    try:
        games = fetch_games_next_24h()
    except Exception as e:
        logger.error(f"ESPN fetch failed during poll: {e}")
        return

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

    r = get_redis()
    if r:
        r.setex(CACHE_KEY, CACHE_TTL, json.dumps({"games": results, "count": len(results)}))
        logger.info(f"Cached {len(results)} games in Redis")
    else:
        logger.warning("Redis unavailable — poll completed but results not cached")