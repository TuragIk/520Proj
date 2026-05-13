from unittest.mock import patch

FAKE_GAME = {
    "game_id": "401869410",
    "game_time": "2026-05-14T00:00:00+00:00",
    "home_abbr": "BOS",
    "away_abbr": "NYK",
}


def test_schedule_no_games(client):
    with patch("src.api.schedule.fetch_games_next_24h", return_value=[]):
        r = client.get("/schedule/nba")
    assert r.status_code == 200
    assert r.json() == {"games": [], "count": 0}


def test_schedule_with_games(client):
    with patch("src.api.schedule.fetch_games_next_24h", return_value=[FAKE_GAME]):
        r = client.get("/schedule/nba")
    assert r.status_code == 200
    body = r.json()
    assert body["count"] == 1
    assert body["games"][0]["game_id"] == "401869410"
    assert body["games"][0]["home_abbr"] == "BOS"
    assert body["games"][0]["away_abbr"] == "NYK"


def test_schedule_espn_error(client):
    with patch("src.api.schedule.fetch_games_next_24h", side_effect=Exception("ESPN down")):
        r = client.get("/schedule/nba")
    assert r.status_code == 502
