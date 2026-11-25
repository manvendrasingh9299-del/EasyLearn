# database.py
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import MONGO_URI, DATABASE_NAME

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None
_client_error: Optional[Exception] = None  # captured client-creation failure


def get_client() -> Optional[AsyncIOMotorClient]:
    """Create (once) and return the MongoDB client.

    The client is created lazily so that importing this module never crashes
    on a bad / unreachable ``mongodb+srv://`` URI (the SRV DNS lookup happens
    here). If MongoDB is unavailable, returns ``None`` and caches the error so
    the HTTP server can still start and serve non-DB endpoints.
    """
    global _client, _client_error
    if _client is None and _client_error is None:
        try:
            _client = AsyncIOMotorClient(MONGO_URI)
        except Exception as exc:  # bad SRV URI, DNS failure, unreachable host, …
            _client_error = exc
            _client = None
            print(f"⚠  MongoDB client could not be created: {exc}")
    return _client


def get_db() -> Optional[AsyncIOMotorDatabase]:
    """Return the application database, creating the client on first use.

    Returns ``None`` when MongoDB is unavailable.
    """
    global _db
    if _db is None:
        client = get_client()
        if client is None:
            return None
        _db = client[DATABASE_NAME]
    return _db


class _LazyCollection:
    """Module-level collection proxy that defers the MongoDB connection.

    Allows ``from database import summary_collection`` to work at import time
    without connecting; the real connection happens on the first operation.
    Raises a clear ``RuntimeError`` when MongoDB is unavailable instead of a
    cryptic SRV/DNS traceback.
    """

    def __init__(self, name: str):
        self._name = name
        self._col = None

    def _resolve(self):
        if self._col is None:
            client = get_client()
            if client is None:
                detail = f" ({_client_error})" if _client_error else ""
                raise RuntimeError(
                    f"MongoDB is unavailable — collection '{self._name}' cannot be accessed.{detail}"
                )
            self._col = client[DATABASE_NAME][self._name]
        return self._col

    def __getattr__(self, attr):
        return getattr(self._resolve(), attr)


summary_collection = _LazyCollection("summaries")
users_collection = _LazyCollection("users")


async def ping_database() -> bool:
    """Check if MongoDB is reachable. Returns True on success, False otherwise."""
    try:
        await get_client().admin.command("ping")
        return True
    except Exception:
        return False
