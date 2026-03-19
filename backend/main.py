# main.py
 
from contextlib import asynccontextmanager
 
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
 
from database import ping_database
from routers.summary_router import router
 
 
@asynccontextmanager
async def lifespan(app: FastAPI):
    """Run startup and shutdown tasks."""
    db_ok = await ping_database()
    if not db_ok:
        raise RuntimeError("Cannot connect to MongoDB — check MONGO_URI in .env")
    print("✅ MongoDB connected")
    yield
    print("🛑 EasyLearn shutting down")
 
 
app = FastAPI(
    title="EasyLearn API",
    description="Upload PDFs/images and get AI-powered study summaries.",
    version="0.1.0",
    lifespan=lifespan,
)
 
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],   # Tighten this to your frontend origin in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
 
app.include_router(router, prefix="/api/v1", tags=["Summaries"])
 
 
@app.get("/health", tags=["Health"])
async def health_check():
    db_ok = await ping_database()
    return {"status": "ok", "database": "connected" if db_ok else "unreachable"}
 