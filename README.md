# EasyLearn 

An AI-powered study assistant for students. Upload PDFs, photos or handwritten notes and get back structured summaries, key concepts, flashcards and exam tips — powered by a local Mistral AI model running entirely on your machine.

---

## What it does

- Upload one or multiple PDFs, JPG, PNG or WEBP files
- Extracts text from PDFs using pdfplumber
- Extracts text from images and handwritten notes using Tesseract OCR
- Sends content to Mistral AI (running locally via Ollama)
- Returns a structured summary with:
  - Topic overview
  - Key points
  - Key concepts
  - Simple explanation
  - Exam summary
  - Quick tips to remember
- Displays everything in a beautiful warm editorial React UI
- Saves all summaries to MongoDB for history
---

## Tech Stack

| Layer      | Technology                        |
|------------|-----------------------------------|
| Frontend   | React 18, DM Sans, Crimson Pro    |
| Backend    | FastAPI, Uvicorn, Python 3.14     |
| AI         | Mistral 7B via Ollama             |
| Database   | MongoDB with Motor async driver   |
| PDF        | pdfplumber                        |
| OCR        | Tesseract + pytesseract           |
| HTTP       | httpx (async)                     |

---

## Project Structure

```
EasyLearn/
├── backend/
│   ├── main.py                 # FastAPI app entry point
│   ├── config.py               # All settings (env-driven)
│   ├── database.py             # MongoDB connection
│   ├── .env                    # Your secret config (never commit)
│   ├── .env.example            # Template for .env
│   ├── requirements.txt        # Python dependencies
│   ├── models/
│   │   └── summary_model.py    # Pydantic data models
│   ├── routers/
│   │   └── summary_router.py   # API endpoints
│   └── services/
│       ├── ai_service.py       # Mistral AI prompts & calls
│       ├── chunk_service.py    # Splits text into chunks
│       ├── image_service.py    # OCR for images
│       ├── pdf_service.py      # PDF text extraction
│       └── pipeline_service.py # Orchestrates everything
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── index.js
    │   └── App.js              # Complete React app
    └── package.json
```

---

## Prerequisites

Before running EasyLearn, make sure you have these installed:

- **Python 3.10+** — python.org
- **Node.js 18+** — nodejs.org
- **MongoDB** — mongodb.com/try/download/community
- **Ollama** — ollama.com
- **Tesseract OCR** — for image/handwriting support

Install Tesseract on Mac:
```bash
brew install tesseract
```

---

## Setup & Installation

### 1. Clone the project

```bash
git clone https://github.com/yourusername/EasyLearn.git
cd EasyLearn
```

### 2. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create your .env file
cp .env.example .env
```

Edit `.env` with your settings:

```env
MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=easylearn_db
OLLAMA_URL=http://localhost:11434/api/generate
AI_MODEL=mistral:instruct
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=20
CHUNK_SIZE=1000
```

### 3. Frontend setup

```bash
cd ../frontend
npm install
```

### 4. Pull the AI model

```bash
ollama pull mistral:instruct
```

This downloads the Mistral 7B model (~4 GB). Only needed once.

---

## Running the App

You need **3 terminal tabs** open at the same time:

**Terminal 1 — Backend:**
```bash
cd ~/EasyLearn/backend
source venv/bin/activate
uvicorn main:app --reload
```

**Terminal 2 — Ollama:**
```bash
ollama serve
```

**Terminal 3 — Frontend:**
```bash
cd ~/EasyLearn/frontend
npm start
```

Then open **`http://localhost:3000`** in your browser.

---

## API Endpoints

| Method   | Path                        | Description                        |
|----------|-----------------------------|------------------------------------|
| `POST`   | `/api/v1/upload`            | Upload files, get AI summary       |
| `GET`    | `/api/v1/summaries`         | Get all stored summaries           |
| `DELETE` | `/api/v1/summaries/{name}`  | Delete a summary by filename       |
| `GET`    | `/health`                   | Server + database health check     |

Interactive API docs available at `http://localhost:8000/docs`

---

## How It Works

```
User uploads files
      ↓
summary_router.py validates & saves files temporarily
      ↓
pipeline_service.py orchestrates the flow
      ↓
pdf_service.py (PDFs) or image_service.py (images/photos)
      ↓
chunk_service.py splits text into 1000-word chunks
      ↓
ai_service.py sends each chunk to Mistral via Ollama
      ↓
Final summary generated from all chunk summaries
      ↓
Saved to MongoDB
      ↓
Returned to React frontend
      ↓
Displayed as Topic, Key Points, Concepts, Flashcards, Exam Tips
```

---

## Environment Variables

| Variable          | Default                                  | Description                    |
|-------------------|------------------------------------------|--------------------------------|
| `MONGO_URI`       | `mongodb://localhost:27017`              | MongoDB connection string      |
| `DATABASE_NAME`   | `easylearn_db`                           | MongoDB database name          |
| `OLLAMA_URL`      | `http://localhost:11434/api/generate`    | Ollama API endpoint            |
| `AI_MODEL`        | `mistral:instruct`                       | Model to use for summaries     |
| `UPLOAD_DIR`      | `uploads`                                | Temporary file storage folder  |
| `MAX_FILE_SIZE_MB`| `20`                                     | Maximum upload size in MB      |
| `CHUNK_SIZE`      | `1000`                                   | Words per chunk sent to AI     |

---

## Supported File Types

| Type        | Extension          | Method           |
|-------------|-------------------|------------------|
| PDF         | `.pdf`            | pdfplumber       |
| Photo       | `.jpg`, `.jpeg`   | Tesseract OCR    |
| Screenshot  | `.png`            | Tesseract OCR    |
| Web image   | `.webp`           | Tesseract OCR    |

Handwritten notes work via OCR — clearer handwriting gives better results.

---

## Notes

- All processing happens locally — your files never leave your machine
- The `uploads/` folder is temporary — files are deleted after processing
- Never commit your `.env` file to Git
- The `venv/` folder should not be committed either — it is already in `.gitignore`
- Large PDFs (10+ pages) may take a few minutes depending on your hardware

---

## Built With

This project was built as a learning exercise to understand full-stack development with Python, FastAPI, React and local AI models.

**Stack learned:**
- Python async programming with FastAPI
- MongoDB with Motor async driver
- Local AI inference with Ollama
- PDF and image text extraction
- React component architecture
- REST API design
