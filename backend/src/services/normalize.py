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


class ArbitrageInfo(TypedDict):
    exists: bool
    spread: float | None       # guaranteed profit per $1 contract
    description: str | None


class NormalizedGame(TypedDict):
    game_id: str
    game_time: str  # ISO 8601 UTC
    home: TeamOdds
    away: TeamOdds
    arbitrage: ArbitrageInfo


def _detect_arbitrage(home_odds: PlatformOdds, away_odds: PlatformOdds) -> ArbitrageInfo:
    home_prices = {p: v for p, v in home_odds.items() if v is not None}
    away_prices = {p: v for p, v in away_odds.items() if v is not None}

    if not home_prices or not away_prices:
        return ArbitrageInfo(exists=False, spread=None, description=None)

    best_home_platform = min(home_prices, key=home_prices.__getitem__)
    best_away_platform = min(away_prices, key=away_prices.__getitem__)
    best_home = home_prices[best_home_platform]
    best_away = away_prices[best_away_platform]
    total = best_home + best_away

    if total >= 0.99:
        return ArbitrageInfo(exists=False, spread=None, description=None)

    spread = round(1 - total, 3)
    return ArbitrageInfo(
        exists=True,
        spread=spread,
        description=(
            f"Buy away on {best_away_platform.capitalize()} ({best_away:.0%}) + "
            f"home on {best_home_platform.capitalize()} ({best_home:.0%}) "
            f"= {total:.0%} cost → ${spread:.2f} profit per $1 contract"
        ),
    )


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

    home_odds = PlatformOdds(
        kalshi=_kalshi_midpoint(home_kalshi) if home_kalshi else None,
        polymarket=_polymarket_price(pm_market, home_keyword) if pm_market else None,
    )
    away_odds = PlatformOdds(
        kalshi=_kalshi_midpoint(away_kalshi) if away_kalshi else None,
        polymarket=_polymarket_price(pm_market, away_keyword) if pm_market else None,
    )

    return NormalizedGame(
        game_id=matchup["game_id"],
        game_time=matchup["game_time"],
        home=TeamOdds(name=home_keyword, abbr=home_abbr, odds=home_odds),
        away=TeamOdds(name=away_keyword, abbr=away_abbr, odds=away_odds),
        arbitrage=_detect_arbitrage(home_odds, away_odds),
    )
