# config.py

import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB
MONGO_URI: str = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME: str = os.getenv("DATABASE_NAME", "easylearn_db")

# Ollama / AI
OLLAMA_URL: str = os.getenv("OLLAMA_URL", "http://localhost:11434/api/generate")
AI_MODEL: str = os.getenv("AI_MODEL", "mistral:instruct")

# File upload
UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", "uploads")
MAX_FILE_SIZE_MB: int = int(os.getenv("MAX_FILE_SIZE_MB", "20"))
ALLOWED_EXTENSIONS: set[str] = {"pdf", "png", "jpg", "jpeg", "webp"}

# Chunking — larger chunks = fewer API calls = faster processing for big PDFs
CHUNK_SIZE: int = int(os.getenv("CHUNK_SIZE", "1000"))
 