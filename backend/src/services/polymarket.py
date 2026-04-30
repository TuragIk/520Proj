import json
from datetime import datetime, timezone, timedelta
from typing import TypedDict

import httpx

from .espn import GameMatchup

POLYMARKET_API_BASE = "https://gamma-api.polymarket.com"

# NBA games are scheduled in Eastern time; use EDT offset (UTC-4) to derive the
# correct calendar date for the Polymarket slug.
EASTERN = timezone(timedelta(hours=-4))


class PolymarketMarket(TypedDict):
    market_id: str
    question: str
    outcomes: list[str]  # team names, e.g. ["Celtics", "76ers"]
    prices: list[str]    # implied probabilities matching outcomes, e.g. ["0.675", "0.325"]
    liquidity: str
    volume: str


def _build_slug(matchup: GameMatchup) -> str:
    away = matchup["away_abbr"].lower()
    home = matchup["home_abbr"].lower()
    game_dt = datetime.fromisoformat(matchup["game_time"])
    date_str = game_dt.astimezone(EASTERN).strftime("%Y-%m-%d")
    return f"nba-{away}-{home}-{date_str}"


def fetch_market_for_game(matchup: GameMatchup) -> PolymarketMarket | None:
    """Fetch the active Polymarket moneyline market for an NBA game matchup.

    Returns None if no matching market is found.
    """
    slug = _build_slug(matchup)

    with httpx.Client(timeout=10.0) as client:
        resp = client.get(
            f"{POLYMARKET_API_BASE}/events",
            params={"slug": slug},
        )
        resp.raise_for_status()
        events = resp.json()

    for event in events:
        for market in event.get("markets", []):
            if market.get("sportsMarketType") != "moneyline":
                continue

            raw_outcomes = market.get("outcomes", "[]")
            raw_prices = market.get("outcomePrices", "[]")

            # Polymarket returns these as JSON-encoded strings, not arrays
            outcomes = json.loads(raw_outcomes) if isinstance(raw_outcomes, str) else raw_outcomes
            prices = json.loads(raw_prices) if isinstance(raw_prices, str) else raw_prices

            if len(outcomes) != 2 or len(prices) != 2:
                continue

            return PolymarketMarket(
                market_id=str(market.get("id", "")),
                question=market.get("question", ""),
                outcomes=outcomes,
                prices=prices,
                liquidity=str(market.get("liquidity", "0")),
                volume=str(market.get("volume", "0")),
            )

    return None
