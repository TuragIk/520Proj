from fastapi import APIRouter

router = APIRouter()

@router.get("/api/markets")
async def get_mock_markets():
    return {
        "markets": [
            {"id": 1, "event": "BOS vs NYK", "kalshi_odds": 0.54, "poly_odds": 0.52},
            {"id": 2, "event": "CHA vs LAL", "kalshi_odds": 0.38, "poly_odds": 0.41}
        ]
    }