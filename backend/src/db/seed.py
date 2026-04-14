import sys, os
sys.path.append(os.path.dirname(__file__))

from connection import SessionLocal, create_tables
from models import User, Market, PlacedBet
import bcrypt

def seed():
    create_tables()
    db = SessionLocal()

    hashed = bcrypt.hashpw(b"password123", bcrypt.gensalt()).decode()
    user = User(email="testuser@umass.edu", password_hash=hashed)
    db.add(user)
    db.flush()

    m1 = Market(external_id="celtics-win-2026", platform="kalshi",
                title="Celtics win NBA Finals 2026", category="NBA")
    m2 = Market(external_id="celtics-win-2026", platform="polymarket",
                title="Celtics win NBA Finals 2026", category="NBA")
    db.add_all([m1, m2])
    db.flush()

    bet = PlacedBet(user_id=user.id, market_id=m1.id,
                    platform="kalshi", amount=25.00)
    db.add(bet)
    db.commit()
    db.close()
    print("✅ Seed data inserted.")

if __name__ == "__main__":
    seed()