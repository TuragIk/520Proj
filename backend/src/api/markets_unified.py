import json

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session

from ..services.espn import fetch_games_next_24h
from ..services.kalshi import fetch_markets_for_game as kalshi_fetch
from ..services.polymarket import fetch_market_for_game as polymarket_fetch
from ..services.normalize import normalize_game
from ..cache.redis_client import get_redis
from ..services.poller import CACHE_KEY
from ..db.connection import get_db
from ..db.models import Market, PriceHistory

router = APIRouter(tags=["markets"])


@router.get("/markets")
def get_markets():
    r = get_redis()
    if r:
        cached = r.get(CACHE_KEY)
        if cached:
            return json.loads(cached)

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

@router.get("/markets/{game_id}/history")
def get_price_history(game_id: str, db: Session = Depends(get_db)):
    markets = db.query(Market).filter(Market.external_id == game_id).all()
    if not markets:
        return {"game_id": game_id, "history": []}

    market_ids = [m.id for m in markets]
    rows = (
        db.query(PriceHistory)
        .filter(PriceHistory.market_id.in_(market_ids))
        .order_by(PriceHistory.recorded_at)
        .all()
    )

    return {
        "game_id": game_id,
        "history": [
            {
                "platform": h.platform,
                "side": h.side,
                "odds": float(h.odds),
                "recorded_at": h.recorded_at.isoformat() if h.recorded_at else None,
            }
            for h in rows
        ],
    }