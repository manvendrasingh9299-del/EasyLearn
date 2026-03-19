# database.py
 
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from config import MONGO_URI, DATABASE_NAME
 
client: AsyncIOMotorClient = AsyncIOMotorClient(MONGO_URI)
db: AsyncIOMotorDatabase = client[DATABASE_NAME]
 
summary_collection = db["summaries"]
 
 
async def ping_database() -> bool:
    """Check if MongoDB is reachable. Returns True on success."""
    try:
        await client.admin.command("ping")
        return True
    except Exception:
        return False
 