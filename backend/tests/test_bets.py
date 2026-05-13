from decimal import Decimal
from src.main import app
from src.db.connection import get_db
from tests.conftest import make_mock_db, _mock_get_db

VALID_BET = {
    "game_id": "401869410",
    "event_name": "BOS @ NYK",
    "platform": "kalshi",
    "team": "BOS",
    "team_name": "Boston Celtics",
    "amount": 10.0,
    "price_at_entry": 0.65,
}


def test_get_me_requires_auth(client):
    r = client.get("/users/me")
    assert r.status_code == 403


def test_get_me(client, auth_headers):
    r = client.get("/users/me", headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    assert body["username"] == "test@example.com"
    assert body["max_bets_per_day"] == 10
    assert body["max_daily_spend"] == 100.0
    assert body["bets_today"] == 0
    assert body["amount_today"] == 0.0



def test_get_bets_requires_auth(client):
    r = client.get("/bets")
    assert r.status_code == 403


def test_get_bets_empty(client, auth_headers):
    r = client.get("/bets", headers=auth_headers)
    assert r.status_code == 200
    assert r.json() == []



def test_place_bet_requires_auth(client):
    r = client.post("/bets", json=VALID_BET)
    assert r.status_code == 403


def test_place_bet_success(client, auth_headers):
    r = client.post("/bets", json=VALID_BET, headers=auth_headers)
    assert r.status_code == 201
    body = r.json()
    assert body["game_id"] == "401869410"
    assert body["platform"] == "kalshi"
    assert body["amount"] == 10.0
    assert body["status"] == "active"


def test_place_bet_daily_bet_limit(client, auth_headers):
    def _at_limit_db():
        db = make_mock_db()
        db.query.return_value.filter.return_value.count.return_value = 10  # == max_bets_per_day
        yield db

    app.dependency_overrides[get_db] = _at_limit_db
    try:
        r = client.post("/bets", json=VALID_BET, headers=auth_headers)
    finally:
        app.dependency_overrides[get_db] = _mock_get_db

    assert r.status_code == 400
    assert r.json()["detail"] == "daily_bet_limit"


def test_place_bet_spend_limit(client, auth_headers):
    def _near_spend_limit_db():
        db = make_mock_db()
        db.query.return_value.filter.return_value.scalar.return_value = Decimal("95.00")  # 95 + 10 > 100
        yield db

    app.dependency_overrides[get_db] = _near_spend_limit_db
    try:
        r = client.post("/bets", json=VALID_BET, headers=auth_headers)
    finally:
        app.dependency_overrides[get_db] = _mock_get_db

    assert r.status_code == 400
    assert r.json()["detail"] == "daily_amount_limit"




def test_update_limits_requires_auth(client):
    r = client.put("/users/me", json={"max_bets_per_day": 5})
    assert r.status_code == 403


def test_update_limits(client, auth_headers):
    r = client.put("/users/me", json={"max_bets_per_day": 5, "max_daily_spend": 50.0}, headers=auth_headers)
    assert r.status_code == 200
    body = r.json()
    assert body["max_bets_per_day"] == 5
    assert body["max_daily_spend"] == 50.0


def test_update_limits_invalid_bets(client, auth_headers):
    r = client.put("/users/me", json={"max_bets_per_day": 0}, headers=auth_headers)
    assert r.status_code == 400


def test_update_limits_invalid_spend(client, auth_headers):
    r = client.put("/users/me", json={"max_daily_spend": 0.0}, headers=auth_headers)
    assert r.status_code == 400
