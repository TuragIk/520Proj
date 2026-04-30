from fastapi import APIRouter, HTTPException

from ..services.espn import fetch_games_next_24h

router = APIRouter(prefix="/schedule", tags=["schedule"])


@router.get("/nba")
def get_nba_schedule():
    try:
        games = fetch_games_next_24h()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ESPN API error: {e}")
    return {"games": games, "count": len(games)}
