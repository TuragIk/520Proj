from typing import TypedDict

import httpx

from .espn import GameMatchup

KALSHI_API_BASE = "https://api.elections.kalshi.com/trade-api/v2"
KALSHI_NBA_SERIES = "KXNBAGAME"


class KalshiMarket(TypedDict):
    ticker: str
    title: str
    yes_bid: str   # USD string, e.g. "0.38"
    yes_ask: str
    no_bid: str
    no_ask: str
    expiration_time: str  # ISO 8601 UTC


def fetch_markets_for_game(matchup: GameMatchup) -> list[KalshiMarket]:
    """Fetch active Kalshi NBA game markets matching a matchup's team abbreviations."""
    home_abbr = matchup["home_abbr"]
    away_abbr = matchup["away_abbr"]

    with httpx.Client(timeout=10.0) as client:
        resp = client.get(
            f"{KALSHI_API_BASE}/markets",
            params={
                "series_ticker": KALSHI_NBA_SERIES,
                "limit": 100,
            },
        )
        resp.raise_for_status()
        data = resp.json()

    markets = []
    for m in data.get("markets", []):
        event_ticker = m.get("event_ticker", "")
        if home_abbr not in event_ticker or away_abbr not in event_ticker:
            continue
        if m.get("status") != "active":
            continue

        markets.append(
            KalshiMarket(
                ticker=m.get("ticker", ""),
                title=m.get("title", ""),
                yes_bid=m.get("yes_bid_dollars", "0"),
                yes_ask=m.get("yes_ask_dollars", "0"),
                no_bid=m.get("no_bid_dollars", "0"),
                no_ask=m.get("no_ask_dollars", "0"),
                expiration_time=m.get("expiration_time", ""),
            )
        )

    return markets
