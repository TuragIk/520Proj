from src.services.normalize import _detect_arbitrage, normalize_game

FAKE_MATCHUP = {
    "game_id": "401869410",
    "game_time": "2026-05-14T00:00:00+00:00",
    "home_abbr": "BOS",
    "away_abbr": "NYK",
    "home_kalshi_keyword": "celtics",
    "away_kalshi_keyword": "knicks",
    "home_polymarket_keyword": "Boston Celtics",
    "away_polymarket_keyword": "New York Knicks",
}

KALSHI_HOME = {
    "ticker": "KXNBAGAME-2026-05-14-BOS",
    "title": "Celtics",
    "yes_bid": 0.64, "yes_ask": 0.66,  # midpoint = 0.65
    "no_bid": 0.34,  "no_ask": 0.36,
    "expiration_time": "2026-05-14T03:00:00Z",
}

KALSHI_AWAY = {
    "ticker": "KXNBAGAME-2026-05-14-NYK",
    "title": "Knicks",
    "yes_bid": 0.33, "yes_ask": 0.35,
    "no_bid": 0.65,  "no_ask": 0.67,
    "expiration_time": "2026-05-14T03:00:00Z",
}

PM_MARKET = {
    "market_id": "abc123",
    "question": "NBA: NYK @ BOS (2026-05-14)?",
    "outcomes": ["celtics", "knicks"],  # must match home/away_kalshi_keyword used by normalize_game
    "prices": [0.64, 0.36],
    "liquidity": 5000.0,
    "volume": 12000.0,
}

# ---------------------------------------------------------------------------
# _detect_arbitrage
# ---------------------------------------------------------------------------

def test_no_arbitrage_when_odds_sum_to_one():
    home = {"kalshi": 0.65, "polymarket": 0.65}
    away = {"kalshi": 0.35, "polymarket": 0.35}
    result = _detect_arbitrage(home, away)
    assert result["exists"] is False
    assert result["spread"] is None
    assert result["description"] is None


def test_arbitrage_detected_when_total_below_threshold():
    # best_home = 0.44, best_away = 0.44 → total = 0.88 < 0.99
    home = {"kalshi": 0.44, "polymarket": 0.65}
    away = {"kalshi": 0.44, "polymarket": 0.35}
    result = _detect_arbitrage(home, away)
    assert result["exists"] is True
    assert result["spread"] > 0
    assert result["description"] is not None


def test_arbitrage_spread_is_correct():
    # total = 0.40 + 0.40 = 0.80 → spread = 0.20
    home = {"kalshi": 0.40, "polymarket": None}
    away = {"kalshi": None, "polymarket": 0.40}
    result = _detect_arbitrage(home, away)
    assert result["exists"] is True
    assert result["spread"] == 0.20


def test_no_arbitrage_when_home_odds_missing():
    home = {"kalshi": None, "polymarket": None}
    away = {"kalshi": 0.35, "polymarket": 0.35}
    result = _detect_arbitrage(home, away)
    assert result["exists"] is False


def test_no_arbitrage_when_away_odds_missing():
    home = {"kalshi": 0.65, "polymarket": 0.65}
    away = {"kalshi": None, "polymarket": None}
    result = _detect_arbitrage(home, away)
    assert result["exists"] is False


# ---------------------------------------------------------------------------
# normalize_game
# ---------------------------------------------------------------------------

def test_normalize_both_platforms():
    result = normalize_game(FAKE_MATCHUP, [KALSHI_HOME, KALSHI_AWAY], PM_MARKET)
    assert result["game_id"] == "401869410"
    assert result["home"]["abbr"] == "BOS"
    assert result["away"]["abbr"] == "NYK"
    assert result["home"]["odds"]["kalshi"] == 0.65   # midpoint of 0.64/0.66
    assert result["home"]["odds"]["polymarket"] == 0.64
    assert result["away"]["odds"]["polymarket"] == 0.36


def test_normalize_no_kalshi_data():
    result = normalize_game(FAKE_MATCHUP, [], PM_MARKET)
    assert result["home"]["odds"]["kalshi"] is None
    assert result["away"]["odds"]["kalshi"] is None
    assert result["home"]["odds"]["polymarket"] == 0.64


def test_normalize_no_polymarket_data():
    result = normalize_game(FAKE_MATCHUP, [KALSHI_HOME, KALSHI_AWAY], None)
    assert result["home"]["odds"]["polymarket"] is None
    assert result["away"]["odds"]["polymarket"] is None
    assert result["home"]["odds"]["kalshi"] is not None


def test_normalize_flags_arbitrage_opportunity():
    # Set both teams' Kalshi midpoints to 0.44 → total 0.88 < 0.99
    arb_home = {**KALSHI_HOME, "yes_bid": 0.43, "yes_ask": 0.45}
    arb_away = {**KALSHI_AWAY, "yes_bid": 0.43, "yes_ask": 0.45}
    result = normalize_game(FAKE_MATCHUP, [arb_home, arb_away], None)
    assert result["arbitrage"]["exists"] is True
    assert result["arbitrage"]["spread"] > 0

