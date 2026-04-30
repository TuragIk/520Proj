from fastapi import APIRouter, HTTPException

from ..services.espn import fetch_games_next_24h
from ..services.polymarket import fetch_market_for_game

router = APIRouter(prefix="/markets/polymarket", tags=["polymarket"])


@router.get("")
def get_polymarket_markets():
    try:
        games = fetch_games_next_24h()
    except Exception as e:
        raise HTTPException(status_code=502, detail=f"ESPN API error: {e}")

    results = []
    for game in games:
        try:
            market = fetch_market_for_game(game)
        except Exception as e:
            raise HTTPException(status_code=502, detail=f"Polymarket API error: {e}")

        results.append({
            "game_id": game["game_id"],
            "game_time": game["game_time"],
            "home_abbr": game["home_abbr"],
            "away_abbr": game["away_abbr"],
            "market": market,
        })

    return {"games": results, "count": len(results)}
