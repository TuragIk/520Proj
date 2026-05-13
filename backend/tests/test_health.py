def test_root(client):
    r = client.get("/")
    assert r.status_code == 200
    assert r.json() == {"message": "Welcome to the Dynamite Gambling API"}


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    data = r.json()
    assert data["status"] == "healthy"
    assert "cache" in data
    assert "db" in data
