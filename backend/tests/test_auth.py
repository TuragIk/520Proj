from src.main import app
from src.db.connection import get_db
from tests.conftest import make_mock_db, _mock_get_db, FAKE_PASSWORD


def _no_user_db():#need to test for no user
    yield make_mock_db(user=None)


def test_register_success(client):
    app.dependency_overrides[get_db] = _no_user_db
    try:
        r = client.post("/auth/register", json={"username": "new@test.com", "password": "secret123"})
    finally:
        app.dependency_overrides[get_db] = _mock_get_db

    assert r.status_code == 201
    body = r.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_register_duplicate_email(client):
    r = client.post("/auth/register", json={"username": "test@example.com", "password": "secret123"})
    assert r.status_code == 409


def test_register_empty_username(client):
    r = client.post("/auth/register", json={"username": "", "password": "secret123"})
    assert r.status_code == 400


def test_register_empty_password(client):
    r = client.post("/auth/register", json={"username": "someone@test.com", "password": ""})
    assert r.status_code == 400


def test_login_success(client):
    r = client.post("/auth/login", json={"username": "test@example.com", "password": FAKE_PASSWORD})
    assert r.status_code == 200
    body = r.json()
    assert "access_token" in body
    assert body["token_type"] == "bearer"


def test_login_wrong_password(client):
    r = client.post("/auth/login", json={"username": "test@example.com", "password": "wrongpassword"})
    assert r.status_code == 401


def test_login_user_not_found(client):
    app.dependency_overrides[get_db] = _no_user_db
    try:
        r = client.post("/auth/login", json={"username": "nobody@test.com", "password": "whatever"})
    finally:
        app.dependency_overrides[get_db] = _mock_get_db

    assert r.status_code == 401
