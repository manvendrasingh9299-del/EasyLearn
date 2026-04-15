# config.py

import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB
MONGO_URI: str     = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME: str = os.getenv("DATABASE_NAME", "easylearn_db")

# Ollama
# Run `ollama list` to see your exact model names and paste them below.
OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
AI_MODEL: str   = os.getenv("AI_MODEL", "llama3.2:3b")   # fallback if named model not found

# File upload
UPLOAD_DIR: str       = os.getenv("UPLOAD_DIR", "uploads")
MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "20"))
ALLOWED_EXTENSIONS: set[str] = {"pdf", "png", "jpg", "jpeg", "webp"}

# Chunking — 4000 words keeps most PDFs in single-pass mode
CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "4000"))