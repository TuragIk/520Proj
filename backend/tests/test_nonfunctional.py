import time
import json
from datetime import datetime, timedelta, timezone
from unittest.mock import patch, MagicMock

from jose import jwt

from src.services.poller import CACHE_TTL
from tests.conftest import FAKE_USER, FAKE_PASSWORD
from tests.test_markets import FAKE_NORMALIZED


def test_password_not_stored_in_plaintext():
    assert FAKE_USER.password_hash != FAKE_PASSWORD
    assert FAKE_USER.password_hash.startswith("$2b$")  # bcrypt hash prefix


def test_expired_token_rejected(client):
    expired = jwt.encode(
        {"sub": "some-id", "exp": datetime.now(timezone.utc) - timedelta(hours=1)},
        "change-me-in-production",
        algorithm="HS256",
    )
    r = client.get("/users/me", headers={"Authorization": f"Bearer {expired}"})
    assert r.status_code == 401


def test_tampered_token_rejected(client):
    r = client.get("/users/me", headers={"Authorization": "Bearer notavalidtoken"})
    assert r.status_code == 401



def test_health_response_under_4_seconds(client):
    with patch("src.cache.redis_client.get_redis", return_value=None):
        start = time.time()
        client.get("/health")
        assert time.time() - start < 4.0


def test_markets_response_under_4_seconds(client):
    with patch("src.api.markets_unified.get_redis", return_value=None), \
         patch("src.api.markets_unified.fetch_games_next_24h", return_value=[]):
        start = time.time()
        client.get("/markets")
        assert time.time() - start < 4.0


def test_schedule_response_under_4_seconds(client):
    with patch("src.api.schedule.fetch_games_next_24h", return_value=[]):
        start = time.time()
        client.get("/schedule/nba")
        assert time.time() - start < 4.0


def test_stale_cache_served_when_espn_fails(client):
    fake_redis = MagicMock()
    fake_redis.get.return_value = json.dumps({"games": [FAKE_NORMALIZED], "count": 1})

    with patch("src.api.markets_unified.get_redis", return_value=fake_redis), \
         patch("src.api.markets_unified.fetch_games_next_24h", side_effect=Exception("ESPN down")):
        r = client.get("/markets")

    assert r.status_code == 200
    assert r.json()["count"] == 1


def test_app_responds_without_database(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "healthy"


def test_app_responds_without_redis(client):
    with patch("src.api.markets_unified.get_redis", return_value=None), \
         patch("src.api.markets_unified.fetch_games_next_24h", return_value=[]):
        r = client.get("/markets")
    assert r.status_code == 200
