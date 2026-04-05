# EasyLearn

An AI-powered study assistant for students. Upload PDFs, photos or handwritten notes and get back structured summaries, key concepts, flashcards, exam tips and an interactive AI chat — powered by Llama 3 running entirely on your own machine.

---

## What it does

- Upload one or multiple PDFs, JPG, PNG or WEBP files
- Extracts text from PDFs using pdfplumber
- Extracts text from images and handwritten notes using Tesseract OCR
- Sends content to Llama 3 (running locally via Ollama)
- Returns a structured summary with:
  - Topic overview
  - Key points
  - Key concepts
  - Simple explanation
  - Exam summary
  - Quick tips to remember
- Interactive flashcard review with flip animation
- **Ducky AI chatbot** — full-screen assistant that answers questions from your notes and from general knowledge (like ChatGPT)
  - 💬 Chat tab — ask anything, get clear answers
  - 🎯 Quiz tab — auto-generated multiple choice quiz from your notes
  - 📋 Questions tab — generates 8 important exam-style questions from your notes
- Export summary as a professionally formatted PDF
- Dark mode with night-blue theme
- Saves all summaries to MongoDB for history
- Run everything with a single `start.sh` script

---

## Tech Stack

| Layer      | Technology                              |
|------------|-----------------------------------------|
| Frontend   | React 18, Crimson Pro, DM Sans          |
| Backend    | FastAPI, Uvicorn, Python 3.10+          |
| AI         | Llama 3 via Ollama (all tasks)          |
| Database   | MongoDB with Motor async driver         |
| PDF        | pdfplumber                              |
| OCR        | Tesseract + pytesseract                 |
| HTTP       | httpx (async)                           |

---

## Project Structure

```
EasyLearn/
├── start.sh                        # One-command startup script
├── backend/
│   ├── main.py                     # FastAPI app entry point
│   ├── config.py                   # All settings (env-driven)
│   ├── database.py                 # MongoDB connection
│   ├── .env                        # Your secret config (never commit)
│   ├── .env.example                # Template for .env
│   ├── requirements.txt            # Python dependencies
│   ├── models/
│   │   └── summary_model.py        # Pydantic data models
│   ├── routers/
│   │   ├── summary_router.py       # Upload & summary endpoints
│   │   ├── auth_router.py          # Signup, login, JWT auth
│   │   └── chat_router.py          # Ducky AI chat endpoint
│   └── services/
│       ├── ai_service.py           # Llama 3 prompts & calls
│       ├── chunk_service.py        # Splits text into chunks
│       ├── image_service.py        # OCR for images
│       ├── pdf_service.py          # PDF text extraction
│       └── pipeline_service.py     # Orchestrates everything
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── mascot/
    │       ├── idle.gif
    │       ├── welcome.gif
    │       ├── processing.gif
    │       ├── confused.gif
    │       └── sleeping.png
    ├── src/
    │   ├── index.js
    │   └── app.js                  # Complete React app
    └── package.json
```

---

## Prerequisites

Before running EasyLearn, make sure you have these installed:

- **Python 3.10+** — [python.org](https://python.org)
- **Node.js 18+** — [nodejs.org](https://nodejs.org)
- **MongoDB** — [mongodb.com/try/download/community](https://mongodb.com/try/download/community)
- **Ollama** — [ollama.com](https://ollama.com)
- **Tesseract OCR** — for image and handwriting support

Install Tesseract on Mac:
```bash
brew install tesseract
```

Install Tesseract on Ubuntu/Debian:
```bash
sudo apt install tesseract-ocr
```

---

## Setup & Installation

### 1. Clone the project

```bash
git clone https://github.com/yourusername/EasyLearn.git
cd EasyLearn
```

### 2. Pull the AI model

```bash
ollama pull llama3
```

This downloads Llama 3 (~4.7 GB). Only needed once.

### 3. Backend setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

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
AI_MODEL=llama3
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=20
CHUNK_SIZE=1000
SECRET_KEY=your-secret-key-here
```

### 4. Frontend setup

```bash
cd ../frontend
npm install
```

---

## Running the App

### Option A — One command (recommended)

From the project root:

```bash
chmod +x start.sh   # only needed once
./start.sh
```

This starts Ollama, the backend, and the frontend automatically in a single terminal. Press `Ctrl+C` to stop everything.

### Option B — Three terminals manually

**Terminal 1 — Ollama:**
```bash
ollama serve
```

**Terminal 2 — Backend:**
```bash
cd ~/EasyLearn/backend
source venv/bin/activate
uvicorn main:app --reload
```

**Terminal 3 — Frontend:**
```bash
cd ~/EasyLearn/frontend
npm start
```

Then open **`http://localhost:3000`** in your browser.

---

## API Endpoints

| Method   | Path                          | Description                            |
|----------|-------------------------------|----------------------------------------|
| `POST`   | `/api/v1/upload`              | Upload files and get AI summary        |
| `GET`    | `/api/v1/summaries`           | Retrieve stored summaries              |
| `DELETE` | `/api/v1/summaries/{name}`    | Delete a summary by filename           |
| `POST`   | `/api/v1/auth/signup`         | Create a new account                   |
| `POST`   | `/api/v1/auth/login`          | Sign in and get a JWT token            |
| `GET`    | `/api/v1/auth/me`             | Get the current authenticated user     |
| `POST`   | `/api/v1/chat`                | Send a message to the Ducky AI chatbot |
| `GET`    | `/health`                     | Server and database health check       |

Interactive API docs: `http://localhost:8000/docs`

---

## How It Works

```
User uploads files
      ↓
auth_router.py — JWT authentication
      ↓
summary_router.py — validates & saves files temporarily
      ↓
pipeline_service.py — orchestrates the full pipeline
      ↓
pdf_service.py (PDFs) or image_service.py (images / handwriting)
      ↓
chunk_service.py — splits text into 1000-word chunks
      ↓
ai_service.py — Llama 3 extracts facts from each chunk
      ↓
ai_service.py — Llama 3 writes the final structured summary
      ↓
Saved to MongoDB
      ↓
Returned to React frontend
      ↓
Displayed as Topic, Explanation, Key Points, Concepts, Flashcards, Exam Tips

User opens Ducky chatbot
      ↓
chat_router.py — receives message + notes context
      ↓
ai_service.py — Llama 3 answers from notes or general knowledge
      ↓
Response streamed back to frontend
```

---

## Ducky AI Chatbot

Ducky is a full-screen AI assistant powered by Llama 3. It opens by clicking the mascot button in the bottom-right corner.

**Three modes:**

| Tab | What it does |
|-----|--------------|
| 💬 Chat | Ask anything — answered from your notes first, then from Llama 3's general knowledge |
| 🎯 Quiz | Auto-generated multiple choice quiz built from your uploaded notes |
| 📋 Questions | Generates 8 exam-style questions from your notes, with a regenerate option |

Ducky answers any question — not just questions about your notes. If the topic is not in your notes, it answers from its own knowledge like ChatGPT would.

---

## AI Model

EasyLearn uses **Llama 3** for all AI tasks:

| Task | What Llama 3 does |
|------|-------------------|
| Chunk extraction | Pulls key facts from each 1000-word chunk of text |
| Final summary | Writes the structured 6-section summary |
| Chat replies | Answers student questions with context from notes |
| Question generation | Creates exam-quality questions from notes |

The model runs locally — your data never leaves your machine.

---

## Environment Variables

| Variable           | Default                               | Description                        |
|--------------------|---------------------------------------|------------------------------------|
| `MONGO_URI`        | `mongodb://localhost:27017`           | MongoDB connection string          |
| `DATABASE_NAME`    | `easylearn_db`                        | MongoDB database name              |
| `OLLAMA_URL`       | `http://localhost:11434/api/generate` | Ollama API endpoint                |
| `AI_MODEL`         | `llama3`                              | Model name (fallback if llama3 not found) |
| `UPLOAD_DIR`       | `uploads`                             | Temporary upload folder            |
| `MAX_FILE_SIZE_MB` | `20`                                  | Maximum file size in MB            |
| `CHUNK_SIZE`       | `1000`                                | Words per chunk sent to AI         |
| `SECRET_KEY`       | —                                     | JWT signing secret (set in .env)   |

---

## Supported File Types

| Type             | Extension        | Extraction Method |
|------------------|------------------|-------------------|
| PDF              | `.pdf`           | pdfplumber        |
| Photo / scan     | `.jpg`, `.jpeg`  | Tesseract OCR     |
| Screenshot       | `.png`           | Tesseract OCR     |
| Web image        | `.webp`          | Tesseract OCR     |

Handwritten notes work via OCR — clearer handwriting gives better results.

---

## Notes

- All AI processing happens locally — your files never leave your machine
- The `uploads/` folder is temporary — files are deleted after processing
- Never commit your `.env` file to Git
- The `venv/` folder is already in `.gitignore`
- Large PDFs (10+ pages) may take several minutes depending on your hardware
- If Llama 3 is not found, the app falls back to the `AI_MODEL` value in your `.env`

---

## Built With

This project was built as a learning exercise to understand full-stack development with Python, FastAPI, React and local AI models.

**What was learned building this:**
- Python async programming with FastAPI
- JWT authentication with python-jose and bcrypt
- MongoDB with the Motor async driver
- Local AI inference with Ollama and Llama 3
- PDF extraction with pdfplumber
- Image OCR with Tesseract and pytesseract
- React component architecture with hooks
- REST API design and error handling
- Dark mode theming with CSS variables
- PDF generation from JavaScript