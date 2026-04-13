from fastapi import FastAPI

app = FastAPI(title="Dynamite Gambling API")

@app.get("/")
async def root():
    return {"message": "Welcome to the Dynamite Gambling API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "cache": "disconnected", "db": "disconnected"}