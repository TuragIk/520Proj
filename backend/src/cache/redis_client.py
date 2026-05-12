import os
import redis
from dotenv import load_dotenv

load_dotenv()

REDIS_URL = os.getenv("REDIS_URL", "redis://localhost:6379")

_client = None

def get_redis():
    global _client
    if _client is None:
        try:
            _client = redis.from_url(REDIS_URL, decode_responses=True)
            _client.ping()
        except Exception:
            _client = None
    return _client