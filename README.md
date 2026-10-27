<div align="center">

# EasyLearn

### AI-Powered Study Assistant

Upload PDFs, photos or handwritten notes and get back structured summaries, key concepts, flashcards, exam tips and an interactive AI chat.
Powered by **Llama 3** and **Mistral**, running on a free **Kaggle T4 GPU** or entirely on your own machine.

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-Python_3.10+-009688?logo=fastapi&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-Atlas_|_Local-47A248?logo=mongodb&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-Llama_3.2_|_Mistral-000000)
![Tesseract](https://img.shields.io/badge/OCR-Tesseract-4B8BBE)

[Features](#features) · [Quick Start](#quick-start) · [Backend Options](#backend-options) · [API](#api-endpoints) · [Architecture](#how-it-works)

</div>

---

## Table of Contents

1. [Features](#features)
2. [AI Models](#ai-models)
3. [Tech Stack](#tech-stack)
4. [Quick Start](#quick-start)
5. [Backend Options](#backend-options)
6. [Starting the App](#starting-the-app)
7. [How It Works](#how-it-works)
8. [API Endpoints](#api-endpoints)
9. [Configuration](#configuration)
10. [Supported File Types](#supported-file-types)
11. [Project Structure](#project-structure)
12. [Notes](#notes)
13. [What I Learned](#what-i-learned)

---

## Features

### Study Tools

| Feature | Details |
|---|---|
| **Multi-file upload** | One or many PDF, JPG, PNG or WEBP files |
| **Smart extraction** | `pdfplumber` for PDFs, Tesseract OCR for images and handwriting |
| **Structured summary** | Topic overview, key points, key concepts, simple explanation, exam summary, quick tips |
| **Flashcards** | Interactive review with flip animation |
| **PDF export** | Download your summary as a professionally formatted PDF |
| **History** | Every summary is saved to MongoDB |

### Ducky AI Chatbot

A full-screen assistant that answers questions from your notes and from general knowledge.

| Tab | What it does |
|---|---|
| **Chat** | Ask anything, get clear answers |
| **Quiz** | Auto-generated multiple-choice quiz from your notes |
| **Questions** | 8 important exam-style questions from your notes |

### Extras

- Dark mode with a night-blue theme
- JWT authentication (signup / login)
- One-command startup with `start.sh`
- Privacy-first: files never reach a third-party AI server

---

## AI Models

Both models run via [Ollama](https://ollama.com), locally on your machine or remotely on a free Kaggle T4 GPU.

| Task | Model |
|---|---|
| Chunk extraction | `llama3.2:3b` |
| Final summary | `llama3.2:3b` |
| Ducky chatbot replies | `mistral:instruct` |
| Quiz & question generation | `mistral:instruct` |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Crimson Pro, DM Sans |
| **Backend** | FastAPI, Uvicorn, Python 3.10+ |
| **AI** | Llama 3.2:3b + Mistral via Ollama |
| **Database** | MongoDB Atlas (cloud) or local MongoDB |
| **PDF** | pdfplumber |
| **OCR** | Tesseract + pytesseract |
| **HTTP** | httpx (async) |
| **GPU backend** | Kaggle T4 x2 (free) + ngrok tunnel |

---

## Quick Start

Already set up? Just run:

```bash
cd ~/EasyLearn
bash start.sh
```

Then open **http://localhost:3000**.

First time here? Pick a backend below, then come back to this step.

---

## Backend Options

EasyLearn supports two backend modes. Choose the one that fits your setup.

| | Option A: Kaggle GPU | Option B: Local |
|---|---|---|
| **Cost** | Free | Free |
| **Needs a GPU?** | No | Helpful, not required |
| **Speed** | Fast (T4 x2) | Depends on your hardware |
| **Setup effort** | Low | Medium |
| **Privacy** | Your own Kaggle session | Everything stays on your machine |
| **Caveat** | URL changes every session | Models need ~6 GB disk |

<details>
<summary><b>Option A: Kaggle T4 GPU (free, no local GPU needed)</b></summary>

<br>

Use this if you don't have a GPU or want faster AI responses for free.

**1. Upload the notebook**
Upload `easylearn_kaggle.ipynb` to [kaggle.com/code](https://kaggle.com/code).

**2. Enable the GPU**
Right panel → **Accelerator** → **GPU T4 x2** → Save.

**3. Edit three cells before running**

*Step 1: system packages (already includes `zstd`)*
```python
subprocess.run(['apt-get', 'install', '-y',
    'zstd', 'tesseract-ocr', 'tesseract-ocr-eng',
    'libgl1-mesa-glx', 'curl'
], check=True, capture_output=False)
```

*Step 5: your MongoDB Atlas URI*
```python
MONGO_URI  = 'mongodb+srv://youruser:yourpassword@cluster0.xxxxx.mongodb.net'
SECRET_KEY = 'your-long-random-secret-key'
```

*Step 7: your ngrok token (free at [dashboard.ngrok.com](https://dashboard.ngrok.com))*
```python
NGROK_TOKEN = 'your_ngrok_authtoken_here'
```

**4. Click Run All**

**5. Copy the public URL** printed at the end:
```
https://xxxx-xx-xx-xxx-xx.ngrok-free.app
```

**6. Point the frontend at it**
Paste it when `start.sh` asks, or set it in `frontend/.env.local`:
```
NEXT_PUBLIC_API_URL=https://xxxx-xx-xx-xxx-xx.ngrok-free.app/api/v1
```

> [!NOTE]
> ngrok URLs expire when the Kaggle session ends. Each new session gives a new URL, so update your frontend `.env.local` each time.

</details>

<details>
<summary><b>Option B: Run everything locally</b></summary>

<br>

Use this if you have Ollama installed and want everything on your own machine.

**Prerequisites**

| Tool | Link |
|---|---|
| Python 3.10+ | [python.org](https://python.org) |
| Node.js 18+ | [nodejs.org](https://nodejs.org) |
| MongoDB | [mongodb.com/try/download/community](https://mongodb.com/try/download/community) |
| Ollama | [ollama.com](https://ollama.com) |
| Tesseract OCR | see below |

**Install Tesseract**

```bash
# macOS
brew install tesseract

# Ubuntu / Debian
sudo apt install tesseract-ocr
```

**Pull the AI models** (one-time, ~6 GB total)

```bash
ollama pull llama3.2:3b
ollama pull mistral:instruct
```

**Set up the backend**

```bash
cd backend
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env
```

Edit `backend/.env`:
```env
MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=easylearn_db
OLLAMA_URL=http://localhost:11434/api/generate
AI_MODEL=llama3.2:3b
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=20
CHUNK_SIZE=4000
SECRET_KEY=your-secret-key-here
```

**Set up the frontend**

```bash
cd ../frontend
npm install
```

</details>

---

## Starting the App

### Option 1: One command (recommended)

```bash
cd ~/EasyLearn
bash start.sh
```

### Option 2: Three terminals

```bash
# Terminal 1: Ollama
ollama serve

# Terminal 2: Backend
cd ~/EasyLearn/backend
source venv/bin/activate
uvicorn main:app --reload

# Terminal 3: Frontend
cd ~/EasyLearn/frontend
npm start
```

Open **http://localhost:3000** in your browser.

<details>
<summary><b>Switching from Kaggle back to local</b></summary>

<br>

If you previously used a Kaggle ngrok URL and want to run locally:

```bash
# Remove the old ngrok URL
sed -i 's|https://.*ngrok-free.app|http://localhost:8000|g' ~/EasyLearn/frontend/.env.local

# Verify it changed
cat ~/EasyLearn/frontend/.env.local
```

Then run `bash start.sh` as normal.

</details>

---

## How It Works

### Summary Pipeline

| Step | Component | Responsibility |
|:---:|---|---|
| 1 | `auth_router.py` | Authenticates the request with JWT |
| 2 | `summary_router.py` | Validates uploads and saves them temporarily |
| 3 | `pipeline_service.py` | Orchestrates the full pipeline |
| 4 | `pdf_service.py` / `image_service.py` | Extracts text from PDFs (pdfplumber) or images and handwriting (Tesseract OCR) |
| 5 | `chunk_service.py` | Splits the text into 4000-word chunks |
| 6 | `ai_service.py` | Llama 3.2:3b extracts key facts from each chunk |
| 7 | `ai_service.py` | Llama 3.2:3b writes the final structured summary |
| 8 | MongoDB | Stores the summary for history |
| 9 | React frontend | Displays topic, explanation, key points, concepts, flashcards and exam tips |

### Ducky Chat Pipeline

| Step | Component | Responsibility |
|:---:|---|---|
| 1 | `chat_router.py` | Receives the user message along with the notes context |
| 2 | `ai_service.py` | Mistral:instruct answers from the notes or from general knowledge |
| 3 | React frontend | Receives the streamed response and displays it |

---

## API Endpoints

Interactive docs available at **http://localhost:8000/docs**

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/v1/upload` | Upload files and get an AI summary |
| `GET` | `/api/v1/summaries` | Retrieve stored summaries |
| `DELETE` | `/api/v1/summaries/{name}` | Delete a summary by filename |
| `POST` | `/api/v1/auth/signup` | Create a new account |
| `POST` | `/api/v1/auth/login` | Sign in and get a JWT token |
| `GET` | `/api/v1/auth/me` | Get the current authenticated user |
| `POST` | `/api/v1/chat` | Send a message to the Ducky chatbot |
| `GET` | `/health` | Server and database health check |

---

## Configuration

All settings are environment-driven via `backend/.env`.

| Variable | Default | Description |
|---|---|---|
| `MONGO_URI` | `mongodb://localhost:27017` | MongoDB connection string |
| `DATABASE_NAME` | `easylearn_db` | MongoDB database name |
| `OLLAMA_URL` | `http://localhost:11434/api/generate` | Ollama API endpoint |
| `AI_MODEL` | `llama3.2:3b` | Model for summaries |
| `UPLOAD_DIR` | `uploads` | Temporary upload folder |
| `MAX_FILE_SIZE_MB` | `20` | Maximum file size in MB |
| `CHUNK_SIZE` | `4000` | Words per chunk sent to the AI |
| `SECRET_KEY` | none | JWT signing secret (**required**) |

---

## Supported File Types

| Type | Extension | Extraction method |
|---|---|---|
| PDF | `.pdf` | pdfplumber |
| Photo / scan | `.jpg`, `.jpeg` | Tesseract OCR |
| Screenshot | `.png` | Tesseract OCR |
| Web image | `.webp` | Tesseract OCR |

> **Tip:** Handwritten notes work via OCR. Clearer handwriting gives better results.

---

## Project Structure

<details>
<summary><b>Click to expand</b></summary>

```
EasyLearn/
├── start.sh                        # One-command startup script
├── easylearn_kaggle.ipynb          # Kaggle GPU backend notebook
│
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
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── mascot/                 # Ducky animations
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

</details>

---

## Notes

> [!IMPORTANT]
> Never commit your `.env` file to Git. The `venv/` folder is already in `.gitignore`.

- All AI processing happens locally (or in your own Kaggle session). Your files never go to a third-party AI server.
- The `uploads/` folder is temporary. Files are deleted after processing.
- Large PDFs (10+ pages) may take several minutes depending on your hardware.
- Kaggle sessions time out after ~20 minutes of browser inactivity. Leave the keep-alive cell running while demoing.

---

## What I Learned

This project was built as a learning exercise in full-stack development with Python, FastAPI, React and local AI models.

| Area | Skills |
|---|---|
| **Backend** | Async Python with FastAPI, REST API design and error handling |
| **Auth & data** | JWT auth with python-jose and bcrypt, MongoDB with the Motor async driver |
| **AI** | Local inference with Ollama, Llama 3.2 and Mistral; free GPU inference via Kaggle + ngrok |
| **Extraction** | PDF parsing with pdfplumber, image OCR with Tesseract and pytesseract |
| **Frontend** | React component architecture with hooks, dark mode theming with CSS variables, PDF generation from JavaScript |

---

<div align="center">

EasyLearn: a full-stack AI study assistant

</div>
