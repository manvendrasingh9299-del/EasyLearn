# main.py

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import ping_database
from routers.summary_router import router
from routers.auth_router import router as auth_router
from routers.chat_router import router as chat_router   # ← NEW


@asynccontextmanager
async def lifespan(app: FastAPI):
    db_ok = await ping_database()
    if not db_ok:
        raise RuntimeError("Cannot connect to MongoDB — check MONGO_URI in .env")
    print("✅ MongoDB connected")
    yield
    print("🛑 EasyLearn shutting down")


app = FastAPI(
    title="EasyLearn API",
    description="Upload PDFs/images and get AI-powered study summaries.",
    version="0.2.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router,       prefix="/api/v1",      tags=["Summaries"])
app.include_router(auth_router,  prefix="/api/v1/auth", tags=["Auth"])
app.include_router(chat_router,  prefix="/api/v1",      tags=["Chat"])   # ← NEW


@app.get("/health", tags=["Health"])
async def health_check():
    db_ok = await ping_database()
    return {"status": "ok", "database": "connected" if db_ok else "unreachable"}