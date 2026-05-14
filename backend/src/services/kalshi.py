"""Kalshi prediction-market client for NBA games.

Wraps the public Kalshi trade API to fetch active markets in the
``KXNBAGAME`` series, filtered to a specific matchup. The list endpoint
returns slightly stale bid/ask prices, so each matched market is
re-fetched individually for a fresh order-book quote before being handed
to the normalization layer.

Date filtering uses Eastern time because Kalshi's ``occurrence_datetime``
field reflects the game's local start date — using UTC would
incorrectly include or exclude late-night games.
"""

from datetime import datetime, timedelta, timezone
from typing import TypedDict

import httpx

from .espn import GameMatchup

_EASTERN = timezone(timedelta(hours=-4))


def _eastern_date(dt_str: str) -> str:
    dt = datetime.fromisoformat(dt_str.replace("Z", "+00:00"))
    return dt.astimezone(_EASTERN).strftime("%Y-%m-%d")

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


def _parse_market(m: dict) -> KalshiMarket:
    return KalshiMarket(
        ticker=m.get("ticker", ""),
        title=m.get("title", ""),
        yes_bid=m.get("yes_bid_dollars", "0"),
        yes_ask=m.get("yes_ask_dollars", "0"),
        no_bid=m.get("no_bid_dollars", "0"),
        no_ask=m.get("no_ask_dollars", "0"),
        expiration_time=m.get("expiration_time", ""),
    )


def fetch_markets_for_game(matchup: GameMatchup) -> list[KalshiMarket]:
    """Fetch active Kalshi NBA game markets matching a matchup's team abbreviations.

    The list endpoint returns slightly cached bid/ask prices, so each matched
    market is re-fetched individually to get the current order-book quote.
    """
    home_abbr = matchup["home_abbr"]
    away_abbr = matchup["away_abbr"]

    with httpx.Client(timeout=10.0) as client:
        resp = client.get(
            f"{KALSHI_API_BASE}/markets",
            params={"series_ticker": KALSHI_NBA_SERIES, "limit": 100},
        )
        resp.raise_for_status()
        data = resp.json()

        game_date = _eastern_date(matchup["game_time"])
        tickers = [
            m.get("ticker", "")
            for m in data.get("markets", [])
            if home_abbr in m.get("event_ticker", "")
            and away_abbr in m.get("event_ticker", "")
            and m.get("status") == "active"
            and _eastern_date(m.get("occurrence_datetime", "1970-01-01T00:00:00Z")) == game_date
        ]

        markets = []
        for ticker in tickers:
            detail_resp = client.get(f"{KALSHI_API_BASE}/markets/{ticker}")
            if detail_resp.status_code != 200:
                continue
            market_data = detail_resp.json().get("market", {})
            markets.append(_parse_market(market_data))

    return markets
