from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .api.schedule import router as schedule_router
from .api.kalshi import router as kalshi_router
from .api.polymarket import router as polymarket_router
from .api.markets_unified import router as markets_router
from .api.auth import router as auth_router
from .api.bets import router as bets_router

app = FastAPI(title="Dynamite Gambling API")

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex=r"http://localhost:\d+",
    allow_methods=["GET", "POST"],
    allow_headers=["*"],
)

app.include_router(schedule_router)
app.include_router(kalshi_router)
app.include_router(polymarket_router)
app.include_router(markets_router)
app.include_router(auth_router)
app.include_router(bets_router)


@app.get("/")
async def root():
    return {"message": "Welcome to the Dynamite Gambling API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy", "cache": "disconnected", "db": "disconnected"}
