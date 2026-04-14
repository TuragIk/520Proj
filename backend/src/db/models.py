from sqlalchemy import Column, String, Integer, Numeric, ForeignKey, TIMESTAMP
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import declarative_base
from sqlalchemy.sql import func
import uuid

Base = declarative_base()

class User(Base):
    __tablename__ = "users"
    id                = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email             = Column(String(255), unique=True, nullable=False)
    password_hash     = Column(String(255), nullable=False)
    max_bets_per_day  = Column(Integer, default=10)
    max_daily_spend   = Column(Numeric(10, 2), default=100.00)
    created_at        = Column(TIMESTAMP, server_default=func.now())

class Market(Base):
    __tablename__ = "markets"
    id           = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    external_id  = Column(String(255), nullable=False)
    platform     = Column(String(50), nullable=False)
    title        = Column(String, nullable=False)
    category     = Column(String(100))
    last_updated = Column(TIMESTAMP, server_default=func.now())

class PlacedBet(Base):
    __tablename__ = "placed_bets"
    id        = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id   = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    market_id = Column(UUID(as_uuid=True), ForeignKey("markets.id", ondelete="CASCADE"))
    platform  = Column(String(50), nullable=False)
    amount    = Column(Numeric(10, 2), nullable=False)
    status    = Column(String(50), default="active")
    placed_at = Column(TIMESTAMP, server_default=func.now())

class PriceHistory(Base):
    __tablename__ = "price_history"
    id          = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    market_id   = Column(UUID(as_uuid=True), ForeignKey("markets.id", ondelete="CASCADE"))
    platform    = Column(String(50), nullable=False)
    odds        = Column(Numeric(6, 4), nullable=False)
    recorded_at = Column(TIMESTAMP, server_default=func.now())

class UserWatchlist(Base):
    __tablename__ = "user_watchlist"
    id              = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id         = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    market_id       = Column(UUID(as_uuid=True), ForeignKey("markets.id", ondelete="CASCADE"))
    alert_threshold = Column(Numeric(5, 2), default=10.00)