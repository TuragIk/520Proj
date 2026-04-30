from datetime import datetime, timedelta, timezone
from typing import TypedDict

import httpx

from ..data.nba_teams import NBA_TEAMS

ESPN_SCOREBOARD_URL = (
    "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard"
)


class GameMatchup(TypedDict):
    game_id: str
    game_time: str  # ISO 8601 UTC
    home_abbr: str
    away_abbr: str
    home_kalshi_keyword: str
    home_polymarket_keyword: str
    away_kalshi_keyword: str
    away_polymarket_keyword: str


def fetch_games_next_24h() -> list[GameMatchup]:
    """Fetch NBA games starting within the next 24 hours, mapped to market search keywords."""
    now = datetime.now(timezone.utc)
    cutoff = now + timedelta(hours=24)

    # Query both today and tomorrow in case the 24h window spans midnight UTC
    dates = {now.strftime("%Y%m%d"), cutoff.strftime("%Y%m%d")}

    games: list[GameMatchup] = []
    with httpx.Client(timeout=10.0) as client:
        for date_str in sorted(dates):
            resp = client.get(ESPN_SCOREBOARD_URL, params={"dates": date_str})
            resp.raise_for_status()

            for event in resp.json().get("events", []):
                game_time_str = event.get("date", "")
                try:
                    game_time = datetime.fromisoformat(
                        game_time_str.replace("Z", "+00:00")
                    )
                except ValueError:
                    continue

                if not (now <= game_time <= cutoff):
                    continue

                competition = event.get("competitions", [{}])[0]
                competitors = competition.get("competitors", [])

                home = next(
                    (c for c in competitors if c.get("homeAway") == "home"), None
                )
                away = next(
                    (c for c in competitors if c.get("homeAway") == "away"), None
                )

                if not home or not away:
                    continue

                home_abbr = home.get("team", {}).get("abbreviation", "")
                away_abbr = away.get("team", {}).get("abbreviation", "")

                home_data = NBA_TEAMS.get(home_abbr)
                away_data = NBA_TEAMS.get(away_abbr)

                if not home_data or not away_data:
                    continue  # abbreviation missing from hashmap — skip

                games.append(
                    GameMatchup(
                        game_id=event.get("id", ""),
                        game_time=game_time.isoformat(),
                        home_abbr=home_abbr,
                        away_abbr=away_abbr,
                        home_kalshi_keyword=home_data["kalshi_keyword"],
                        home_polymarket_keyword=home_data["polymarket_keyword"],
                        away_kalshi_keyword=away_data["kalshi_keyword"],
                        away_polymarket_keyword=away_data["polymarket_keyword"],
                    )
                )

    return games
