# EasyLearn

An AI-powered study assistant for students. Upload PDFs, photos or handwritten notes and get back structured summaries, key concepts, flashcards, exam tips and an interactive AI chat — powered by Llama 3 and Mistral, running on a free Kaggle T4 GPU or entirely on your own machine.

---

## What it does

- Upload one or multiple PDFs, JPG, PNG or WEBP files
- Extracts text from PDFs using pdfplumber
- Extracts text from images and handwritten notes using Tesseract OCR
- Sends content to **Llama 3.2:3b** (summaries) and **Mistral:instruct** (Ducky chatbot) via Ollama
- Returns a structured summary with:
  - Topic overview
  - Key points
  - Key concepts
  - Simple explanation
  - Exam summary
  - Quick tips to remember
- Interactive flashcard review with flip animation
- **Ducky AI chatbot** — full-screen assistant that answers questions from your notes and from general knowledge
  - 💬 Chat tab — ask anything, get clear answers
  - 🎯 Quiz tab — auto-generated multiple choice quiz from your notes
  - 📋 Questions tab — generates 8 important exam-style questions from your notes
- Export summary as a professionally formatted PDF
- Dark mode with night-blue theme
- Saves all summaries to MongoDB for history
- Run everything locally with a single `start.sh` script

---

## AI Models

| Task | Model |
|---|---|
| Chunk extraction | llama3.2:3b |
| Final summary | llama3.2:3b |
| Ducky chatbot replies | mistral:instruct |
| Quiz & question generation | mistral:instruct |

Both models run via Ollama — locally on your machine, or remotely on a free Kaggle T4 GPU.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Crimson Pro, DM Sans |
| Backend | FastAPI, Uvicorn, Python 3.10+ |
| AI | Llama 3.2:3b + Mistral via Ollama |
| Database | MongoDB Atlas (cloud) or local MongoDB |
| PDF | pdfplumber |
| OCR | Tesseract + pytesseract |
| HTTP | httpx (async) |
| GPU backend | Kaggle T4 x2 (free) + ngrok tunnel |

---

## Project Structure

```
EasyLearn/
├── start.sh                        # One-command startup script
├── easylearn_kaggle.ipynb          # Kaggle GPU backend notebook
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
│       ├── ai_service.py           # Llama 3 + Mistral prompts & calls
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

## Running the Backend

EasyLearn supports two backend modes — choose the one that fits your setup.

### Option A — Kaggle T4 GPU (free, no local GPU needed)

Use this if you don't have a GPU or want faster AI responses for free.

1. Upload `easylearn_kaggle.ipynb` to [kaggle.com/code](https://kaggle.com/code)
2. Enable GPU: right panel → **Accelerator** → **GPU T4 x2** → Save
3. Edit these three cells before running:

**Step 1** — system packages (already fixed to include `zstd`):
```python
subprocess.run(['apt-get', 'install', '-y',
    'zstd', 'tesseract-ocr', 'tesseract-ocr-eng',
    'libgl1-mesa-glx', 'curl'
], check=True, capture_output=False)
```

**Step 5** — your MongoDB Atlas URI:
```python
MONGO_URI  = 'mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net'
SECRET_KEY = 'your-long-random-secret-key'
```

**Step 7** — your ngrok token (free at [dashboard.ngrok.com](https://dashboard.ngrok.com)):
```python
NGROK_TOKEN = 'your_ngrok_authtoken_here'
```

4. Click **Run All**
5. Copy the public URL printed at the end — it looks like:
```
https://xxxx-xx-xx-xxx-xx.ngrok-free.app
```
6. Paste it into your frontend when `start.sh` asks, or set it in `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=https://xxxx-xx-xx-xxx-xx.ngrok-free.app/api/v1
```

> **Note:** ngrok URLs expire when the Kaggle session ends. Each new session gives a new URL — update your frontend `.env.local` each time.

---

### Option B — Run everything locally

Use this if you have Ollama installed and want everything on your own machine.

**Prerequisites:**
- Python 3.10+ — [python.org](https://python.org)
- Node.js 18+ — [nodejs.org](https://nodejs.org)
- MongoDB — [mongodb.com/try/download/community](https://mongodb.com/try/download/community)
- Ollama — [ollama.com](https://ollama.com)
- Tesseract OCR

Install Tesseract on Mac:
```bash
brew install tesseract
```

Install Tesseract on Ubuntu/Debian:
```bash
sudo apt install tesseract-ocr
```

**Pull the AI models** (one-time, ~6 GB total):
```bash
ollama pull llama3.2:3b
ollama pull mistral:instruct
```

**Backend setup:**
```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env`:
```
MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=easylearn_db
OLLAMA_URL=http://localhost:11434/api/generate
AI_MODEL=llama3.2:3b
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=20
CHUNK_SIZE=4000
SECRET_KEY=your-secret-key-here
```

**Frontend setup:**
```bash
cd ../frontend
npm install
```

---

## Starting the App

### One command (recommended)
```bash
cd ~/EasyLearn
bash start.sh
```

### Switching from Kaggle back to local

If you previously used the Kaggle ngrok URL and want to run locally:
```bash
# Remove the old ngrok URL
sed -i 's|https://.*ngrok-free.app|http://localhost:8000|g' ~/EasyLearn/frontend/.env.local

# Verify it changed
cat ~/EasyLearn/frontend/.env.local
```

Then run `bash start.sh` as normal.

### Three terminals manually
```bash
# Terminal 1 — Ollama
ollama serve

# Terminal 2 — Backend
cd ~/EasyLearn/backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 3 — Frontend
cd ~/EasyLearn/frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| POST | /api/v1/upload | Upload files and get AI summary |
| GET | /api/v1/summaries | Retrieve stored summaries |
| DELETE | /api/v1/summaries/{name} | Delete a summary by filename |
| POST | /api/v1/auth/signup | Create a new account |
| POST | /api/v1/auth/login | Sign in and get a JWT token |
| GET | /api/v1/auth/me | Get the current authenticated user |
| POST | /api/v1/chat | Send a message to the Ducky AI chatbot |
| GET | /health | Server and database health check |

Interactive API docs: [http://localhost:8000/docs](http://localhost:8000/docs)

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
chunk_service.py — splits text into 4000-word chunks
      ↓
ai_service.py — Llama 3.2:3b extracts facts from each chunk
      ↓
ai_service.py — Llama 3.2:3b writes the final structured summary
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
ai_service.py — Mistral:instruct answers from notes or general knowledge
      ↓
Response streamed back to frontend
```

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| MONGO_URI | mongodb://localhost:27017 | MongoDB connection string |
| DATABASE_NAME | easylearn_db | MongoDB database name |
| OLLAMA_URL | http://localhost:11434/api/generate | Ollama API endpoint |
| AI_MODEL | llama3.2:3b | Model for summaries |
| UPLOAD_DIR | uploads | Temporary upload folder |
| MAX_FILE_SIZE_MB | 20 | Maximum file size in MB |
| CHUNK_SIZE | 4000 | Words per chunk sent to AI |
| SECRET_KEY | — | JWT signing secret (set in .env) |

---

## Supported File Types

| Type | Extension | Extraction Method |
|---|---|---|
| PDF | .pdf | pdfplumber |
| Photo / scan | .jpg, .jpeg | Tesseract OCR |
| Screenshot | .png | Tesseract OCR |
| Web image | .webp | Tesseract OCR |

Handwritten notes work via OCR — clearer handwriting gives better results.

---

## Notes

- All AI processing happens locally (or on your own Kaggle session) — your files never go to a third-party AI server
- The `uploads/` folder is temporary — files are deleted after processing
- Never commit your `.env` file to Git
- The `venv/` folder is already in `.gitignore`
- Large PDFs (10+ pages) may take several minutes depending on your hardware
- Kaggle sessions time out after ~20 minutes of browser inactivity — leave the keep-alive cell running while demoing

---

## Built With

This project was built as a learning exercise to understand full-stack development with Python, FastAPI, React and local AI models.

What was learned building this:

- Python async programming with FastAPI
- JWT authentication with python-jose and bcrypt
- MongoDB with the Motor async driver
- Local AI inference with Ollama, Llama 3.2 and Mistral
- Free GPU inference via Kaggle + public tunneling via ngrok
- PDF extraction with pdfplumber
- Image OCR with Tesseract and pytesseract
- React component architecture with hooks
- REST API design and error handling
- Dark mode theming with CSS variables
- PDF generation from JavaScript