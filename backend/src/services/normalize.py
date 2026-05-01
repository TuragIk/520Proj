from typing import TypedDict

from .espn import GameMatchup
from .kalshi import KalshiMarket
from .polymarket import PolymarketMarket


class PlatformOdds(TypedDict):
    kalshi: float | None      # win probability 0.0–1.0, None if no market
    polymarket: float | None


class TeamOdds(TypedDict):
    name: str   # e.g. "Celtics"
    abbr: str   # e.g. "BOS"
    odds: PlatformOdds


class NormalizedGame(TypedDict):
    game_id: str
    game_time: str  # ISO 8601 UTC
    home: TeamOdds
    away: TeamOdds


def _kalshi_midpoint(market: KalshiMarket) -> float:
    return (float(market["yes_bid"]) + float(market["yes_ask"])) / 2


def _polymarket_price(pm_market: PolymarketMarket, keyword: str) -> float | None:
    for outcome, price in zip(pm_market["outcomes"], pm_market["prices"]):
        if outcome.lower() == keyword.lower():
            return float(price)
    return None


def normalize_game(
    matchup: GameMatchup,
    kalshi_markets: list[KalshiMarket],
    pm_market: PolymarketMarket | None,
) -> NormalizedGame:
    home_abbr = matchup["home_abbr"]
    away_abbr = matchup["away_abbr"]
    home_keyword = matchup["home_kalshi_keyword"]
    away_keyword = matchup["away_kalshi_keyword"]

    # Match Kalshi markets to teams by ticker suffix (e.g. KXNBAGAME-...-BOS)
    home_kalshi = next(
        (m for m in kalshi_markets if m["ticker"].endswith(f"-{home_abbr}")), None
    )
    away_kalshi = next(
        (m for m in kalshi_markets if m["ticker"].endswith(f"-{away_abbr}")), None
    )

    return NormalizedGame(
        game_id=matchup["game_id"],
        game_time=matchup["game_time"],
        home=TeamOdds(
            name=home_keyword,
            abbr=home_abbr,
            odds=PlatformOdds(
                kalshi=_kalshi_midpoint(home_kalshi) if home_kalshi else None,
                polymarket=_polymarket_price(pm_market, home_keyword) if pm_market else None,
            ),
        ),
        away=TeamOdds(
            name=away_keyword,
            abbr=away_abbr,
            odds=PlatformOdds(
                kalshi=_kalshi_midpoint(away_kalshi) if away_kalshi else None,
                polymarket=_polymarket_price(pm_market, away_keyword) if pm_market else None,
            ),
        ),
    )
