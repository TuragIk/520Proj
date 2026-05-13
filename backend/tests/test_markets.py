import json
from unittest.mock import patch, MagicMock


FAKE_GAME = {
    "game_id": "401869410",
    "game_time": "2026-05-14T00:00:00+00:00",
    "home_abbr": "BOS",
    "away_abbr": "NYK",
    "home_kalshi_keyword": "celtics",
    "away_kalshi_keyword": "knicks",
    "home_polymarket_keyword": "Boston Celtics",
    "away_polymarket_keyword": "New York Knicks",
}

FAKE_NORMALIZED = {
    "game_id": "401869410",
    "game_time": "2026-05-14T00:00:00+00:00",
    "home": {"name": "Celtics", "abbr": "BOS", "odds": {"kalshi": 0.65, "polymarket": 0.64}},
    "away": {"name": "Knicks", "abbr": "NYK", "odds": {"kalshi": 0.35, "polymarket": 0.36}},
    "arbitrage": {"exists": False, "spread": None, "description": None},
}

FAKE_KALSHI_MARKET = {
    "ticker": "KXNBAGAME-2026-05-14-BOS",
    "title": "Celtics vs Knicks",
    "yes_bid": 0.64,
    "yes_ask": 0.66,
    "no_bid": 0.34,
    "no_ask": 0.36,
    "expiration_time": "2026-05-14T03:00:00Z",
}

FAKE_POLYMARKET_MARKET = {
    "market_id": "abc123",
    "question": "NBA: NYK @ BOS (2026-05-14)?",
    "outcomes": ["Boston Celtics", "New York Knicks"],
    "prices": [0.64, 0.36],
    "liquidity": 5000.0,
    "volume": 12000.0,
}

def test_get_markets_no_games(client):
    with patch("src.api.markets_unified.get_redis", return_value=None), \
         patch("src.api.markets_unified.fetch_games_next_24h", return_value=[]):
        r = client.get("/markets")
    assert r.status_code == 200
    assert r.json() == {"games": [], "count": 0}


def test_get_markets_with_games(client):
    with patch("src.api.markets_unified.get_redis", return_value=None), \
         patch("src.api.markets_unified.fetch_games_next_24h", return_value=[FAKE_GAME]), \
         patch("src.api.markets_unified.kalshi_fetch", return_value=[FAKE_KALSHI_MARKET]), \
         patch("src.api.markets_unified.polymarket_fetch", return_value=FAKE_POLYMARKET_MARKET), \
         patch("src.api.markets_unified.normalize_game", return_value=FAKE_NORMALIZED):
        r = client.get("/markets")

    assert r.status_code == 200
    body = r.json()
    assert body["count"] == 1
    assert body["games"][0]["game_id"] == "401869410"
    assert "home" in body["games"][0]
    assert "away" in body["games"][0]
    assert "arbitrage" in body["games"][0]


def test_get_markets_espn_error(client):
    with patch("src.api.markets_unified.get_redis", return_value=None), \
         patch("src.api.markets_unified.fetch_games_next_24h", side_effect=Exception("ESPN down")):
        r = client.get("/markets")
    assert r.status_code == 502


def test_get_markets_cache_hit(client):
    cached_payload = json.dumps({"games": [FAKE_NORMALIZED], "count": 1})
    fake_redis = MagicMock()
    fake_redis.get.return_value = cached_payload

    with patch("src.api.markets_unified.get_redis", return_value=fake_redis):
        r = client.get("/markets")

    assert r.status_code == 200
    body = r.json()
    assert body["count"] == 1
    assert body["games"][0]["game_id"] == "401869410"



def test_get_kalshi_no_games(client):
    with patch("src.api.kalshi.fetch_games_next_24h", return_value=[]):
        r = client.get("/markets/kalshi")
    assert r.status_code == 200
    assert r.json() == {"games": [], "count": 0}


def test_get_kalshi_with_games(client):
    with patch("src.api.kalshi.fetch_games_next_24h", return_value=[FAKE_GAME]), \
         patch("src.api.kalshi.fetch_markets_for_game", return_value=[FAKE_KALSHI_MARKET]):
        r = client.get("/markets/kalshi")

    assert r.status_code == 200
    body = r.json()
    assert body["count"] == 1
    game = body["games"][0]
    assert game["game_id"] == "401869410"
    assert game["home_abbr"] == "BOS"
    assert game["away_abbr"] == "NYK"
    assert len(game["markets"]) == 1


def test_get_kalshi_espn_error(client):
    with patch("src.api.kalshi.fetch_games_next_24h", side_effect=Exception("ESPN down")):
        r = client.get("/markets/kalshi")
    assert r.status_code == 502

def test_get_polymarket_no_games(client):
    with patch("src.api.polymarket.fetch_games_next_24h", return_value=[]):
        r = client.get("/markets/polymarket")
    assert r.status_code == 200
    assert r.json() == {"games": [], "count": 0}


def test_get_polymarket_with_games(client):
    with patch("src.api.polymarket.fetch_games_next_24h", return_value=[FAKE_GAME]), \
         patch("src.api.polymarket.fetch_market_for_game", return_value=FAKE_POLYMARKET_MARKET):
        r = client.get("/markets/polymarket")

    assert r.status_code == 200
    body = r.json()
    assert body["count"] == 1
    game = body["games"][0]
    assert game["game_id"] == "401869410"
    assert game["market"]["market_id"] == "abc123"


def test_get_polymarket_espn_error(client):
    with patch("src.api.polymarket.fetch_games_next_24h", side_effect=Exception("ESPN down")):
        r = client.get("/markets/polymarket")
    assert r.status_code == 502


def test_price_history_no_market(client):
    r = client.get("/markets/401869410/history")
    assert r.status_code == 200
    assert r.json() == {"game_id": "401869410", "history": []}
