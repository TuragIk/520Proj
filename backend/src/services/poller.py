import json
import logging
from datetime import datetime, timezone

from .espn import fetch_games_next_24h
from .kalshi import fetch_markets_for_game as kalshi_fetch
from .polymarket import fetch_market_for_game as polymarket_fetch
from .normalize import normalize_game
from ..cache.redis_client import get_redis
from ..db.connection import SessionLocal
from ..db.models import Market, PriceHistory

logger = logging.getLogger(__name__)

CACHE_KEY = "markets:all"
CACHE_TTL = 360

def poll_and_cache():
    """Fetch all upcoming games, normalize odds, write to Redis and DB."""
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

    # Write to Redis cache
    r = get_redis()
    if r:
        r.setex(CACHE_KEY, CACHE_TTL, json.dumps({"games": results, "count": len(results)}))
        logger.info(f"Cached {len(results)} games in Redis")
    else:
        logger.warning("Redis unavailable — poll results not cached")

    # Write to DB (upsert Market rows + insert PriceHistory rows)
    if SessionLocal is None:
        return  # DB not configured, skip

    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        for normalized in results:
            for side, platform_key in [
                (normalized["home"], "kalshi"),
                (normalized["away"], "kalshi"),
                (normalized["home"], "polymarket"),
                (normalized["away"], "polymarket"),
            ]:
                odds_value = side["odds"].get(platform_key)
                if odds_value is None:
                    continue

                game_id = normalized["game_id"]
                title = f"{normalized['away']['abbr']} @ {normalized['home']['abbr']}"

                market = db.query(Market).filter(
                    Market.external_id == game_id,
                    Market.platform == platform_key,
                ).first()
                if not market:
                    market = Market(
                        external_id=game_id,
                        platform=platform_key,
                        title=title,
                        category="NBA",
                    )
                    db.add(market)
                    db.flush()
                else:
                    market.last_updated = now

                db.add(PriceHistory(
                    market_id=market.id,
                    platform=platform_key,
                    odds=odds_value,
                ))

        db.commit()
        logger.info("DB write-through complete")
    except Exception as e:
        db.rollback()
        logger.error(f"DB write-through failed: {e}")
    finally:
        db.close()