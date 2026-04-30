from fastapi import FastAPI

from .api.schedule import router as schedule_router
from .api.kalshi import router as kalshi_router
from .api.polymarket import router as polymarket_router

app = FastAPI(title="Dynamite Gambling API")

app.include_router(schedule_router)
app.include_router(kalshi_router)
app.include_router(polymarket_router)

@app.get("/")
async def root():
    return {"message": "Welcome to the Dynamite Gambling API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "cache": "disconnected", "db": "disconnected"}