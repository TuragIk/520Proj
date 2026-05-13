import json
from fastapi import APIRouter, HTTPException

from ..services.espn import fetch_games_next_24h
from ..cache.redis_client import get_redis

router = APIRouter(prefix="/schedule", tags=["schedule"])

SCHEDULE_CACHE_KEY = "nba:schedule"
SCHEDULE_TTL = 300  # 5 minutes


@router.get("/nba")
def get_nba_schedule():
    r = get_redis()
    if r:
        cached = r.get(SCHEDULE_CACHE_KEY)
        if cached:
            return json.loads(cached)

    try:
        games = fetch_games_next_24h()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ESPN API error: {e}")

    result = {"games": games, "count": len(games)}
    if r:
        r.set(SCHEDULE_CACHE_KEY, json.dumps(result), ex=SCHEDULE_TTL)

    return result
