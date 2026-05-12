import os
from datetime import datetime, date, timezone
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
from pydantic import BaseModel
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..db.connection import get_db
from ..db.models import User, Market, PlacedBet

router = APIRouter(tags=["bets"])

SECRET_KEY = os.getenv("JWT_SECRET", "change-me-in-production")
ALGORITHM = "HS256"

_bearer = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(_bearer),
    db: Session = Depends(get_db),
) -> User:
    token = credentials.credentials
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str | None = payload.get("sub")
        if not user_id:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token.")
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found.")
    return user

def _today_start() -> datetime:
    today = date.today()
    return datetime(today.year, today.month, today.day, tzinfo=timezone.utc)

@router.get("/users/me")
def get_me(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = _today_start()
    bets_today = (
        db.query(PlacedBet)
        .filter(PlacedBet.user_id == current_user.id, PlacedBet.placed_at >= today)
        .count()
    )
    amount_today = (
        db.query(func.sum(PlacedBet.amount))
        .filter(PlacedBet.user_id == current_user.id, PlacedBet.placed_at >= today)
        .scalar()
        or 0
    )
    return {
        "username": current_user.email,
        "max_bets_per_day": current_user.max_bets_per_day,
        "max_daily_spend": float(current_user.max_daily_spend),
        "bets_today": bets_today,
        "amount_today": float(amount_today),
    }

@router.get("/bets")
def get_bets(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    rows = (
        db.query(PlacedBet, Market)
        .join(Market, PlacedBet.market_id == Market.id)
        .filter(PlacedBet.user_id == current_user.id)
        .order_by(PlacedBet.placed_at.desc())
        .all()
    )
    return [
        {
            "id": str(bet.id),
            "game_id": market.external_id,
            "event_name": market.title,
            "platform": bet.platform,
            "team": None,
            "team_name": market.title,
            "amount": float(bet.amount),
            "price_at_entry": None,
            "status": bet.status,
            "placed_at": bet.placed_at.isoformat() if bet.placed_at else None,
        }
        for bet, market in rows
    ]

class PlaceBetRequest(BaseModel):
    game_id: str
    event_name: str
    platform: str
    team: str
    team_name: str
    amount: float
    price_at_entry: Optional[float] = None

@router.post("/bets", status_code=201)
def place_bet(
    body: PlaceBetRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    today = _today_start()

    bets_today = (
        db.query(PlacedBet)
        .filter(PlacedBet.user_id == current_user.id, PlacedBet.placed_at >= today)
        .count()
    )
    if bets_today >= current_user.max_bets_per_day:
        raise HTTPException(status_code=400, detail="daily_bet_limit")

    amount_today = (
        db.query(func.sum(PlacedBet.amount))
        .filter(PlacedBet.user_id == current_user.id, PlacedBet.placed_at >= today)
        .scalar()
        or 0
    )
    if float(amount_today) + body.amount > float(current_user.max_daily_spend):
        raise HTTPException(status_code=400, detail="daily_amount_limit")

    market = db.query(Market).filter(
        Market.external_id == body.game_id,
        Market.platform == body.platform,
    ).first()
    if not market:
        market = Market(
            external_id=body.game_id,
            platform=body.platform,
            title=body.event_name,
            category="NBA",
        )
        db.add(market)
        db.flush()

    bet = PlacedBet(
        user_id=current_user.id,
        market_id=market.id,
        platform=body.platform,
        amount=body.amount,
        status="active",
    )
    db.add(bet)
    db.commit()
    db.refresh(bet)

    return {
        "id": str(bet.id),
        "game_id": body.game_id,
        "event_name": body.event_name,
        "platform": body.platform,
        "team": body.team,
        "team_name": body.team_name,
        "amount": body.amount,
        "price_at_entry": body.price_at_entry,
        "status": bet.status,
        "placed_at": bet.placed_at.isoformat() if bet.placed_at else None,
    }