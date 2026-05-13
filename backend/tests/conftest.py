import uuid
from decimal import Decimal
from unittest.mock import MagicMock, patch

import pytest
from fastapi.testclient import TestClient
from passlib.context import CryptContext

from src.main import app
from src.db.connection import get_db
from src.api.auth import create_access_token

TEST_USER_ID = str(uuid.uuid4())
FAKE_PASSWORD = "testpassword123"

_pwd = CryptContext(schemes=["bcrypt"], deprecated="auto")


class FakeUser:
    id = TEST_USER_ID
    email = "test@example.com"
    password_hash = _pwd.hash(FAKE_PASSWORD)
    max_bets_per_day = 10
    max_daily_spend = Decimal("100.00")


FAKE_USER = FakeUser()


def make_mock_db(user=FAKE_USER):

    db = MagicMock()
    q = db.query.return_value
    q.filter.return_value.first.return_value = user
    q.filter.return_value.count.return_value = 0
    q.filter.return_value.scalar.return_value = Decimal("0.00")
    q.filter.return_value.all.return_value = []
    q.filter.return_value.order_by.return_value.all.return_value = []
    q.join.return_value.filter.return_value.order_by.return_value.all.return_value = []

    return db


def _mock_get_db():
    yield make_mock_db()


@pytest.fixture(scope="session")
def client():
    app.dependency_overrides[get_db] = _mock_get_db
    with patch("src.main.poll_and_cache"):
        with TestClient(app) as c:
            yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="session")
def auth_headers():
    token = create_access_token(TEST_USER_ID)
    return {"Authorization": f"Bearer {token}"}
