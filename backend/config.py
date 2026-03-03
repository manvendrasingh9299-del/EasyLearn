# config.py

import os
from dotenv import load_dotenv

load_dotenv()

# MongoDB
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DATABASE_NAME = "easylearn_db"

# Hugging Face API
HF_API_KEY = os.getenv("HF_API_KEY")
HF_MODEL = "facebook/bart-large-cnn"