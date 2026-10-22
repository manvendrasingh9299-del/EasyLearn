<div align="center">

EasyLearn

AI-Powered Academic Learning System

An AI-powered study assistant that transforms PDFs, images, and handwritten notes into structured summaries, flashcards, quizzes, and exam-focused questions using Llama 3.2 and Mistral.

</div>

⸻

Overview

EasyLearn is a full-stack academic learning application designed to help students understand concepts and prepare for examinations. It extracts text from documents and images, processes the content using AI models, and generates structured learning materials.

The application supports local AI inference through Ollama and remote GPU inference using Kaggle.

Features

* AI Summarization: Generate structured summaries from study materials.
* Document Processing: Extract text from PDFs, images, and handwritten notes.
* Interactive Flashcards: Review important concepts using flip cards.
* Ducky AI Chatbot: Ask questions about study materials or general topics.
* Quiz Generation: Generate multiple-choice quizzes from uploaded notes.
* Exam Preparation: Generate eight important exam-style questions.
* PDF Export: Export summaries as formatted PDF documents.
* User Authentication: Register and log in using JWT authentication.
* Study History: Store and retrieve summaries using MongoDB.
* Dark Mode: Study using a dark-themed interface.
* Flexible Deployment: Run locally or use a Kaggle GPU backend.

Tech Stack

Component	Technologies
Frontend	React 18, JavaScript, CSS
Backend	Python, FastAPI, Uvicorn
AI Models	Llama 3.2:3b, Mistral Instruct
AI Runtime	Ollama
Database	MongoDB Atlas / MongoDB
PDF Processing	pdfplumber
OCR	Tesseract, pytesseract
HTTP Client	HTTPX
GPU Infrastructure	Kaggle T4 GPU
Tunneling	ngrok

Architecture

flowchart TD
    A[React Frontend] --> B[FastAPI Backend]
    B --> C[Document Processing]
    C --> D[PDF Extraction]
    C --> E[Image OCR]
    D --> F[Text Chunking]
    E --> F
    F --> G[Llama 3.2]
    G --> H[Structured Summary]
    H --> I[MongoDB]
    H --> A
    A --> J[Ducky AI Chatbot]
    J --> K[Mistral Instruct]
    K --> A

Project Structure

EasyLearn/
├── start.sh
├── easylearn_kaggle.ipynb
├── README.md
│
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── .env.example
│   ├── requirements.txt
│   │
│   ├── models/
│   │   └── summary_model.py
│   │
│   ├── routers/
│   │   ├── summary_router.py
│   │   ├── auth_router.py
│   │   └── chat_router.py
│   │
│   └── services/
│       ├── ai_service.py
│       ├── chunk_service.py
│       ├── image_service.py
│       ├── pdf_service.py
│       └── pipeline_service.py
│
└── frontend/
    ├── public/
    │   ├── index.html
    │   └── mascot/
    ├── src/
    │   ├── index.js
    │   └── app.js
    └── package.json

Installation and Setup

Prerequisites

Software	Requirement
Python	3.10 or later
Node.js	18 or later
MongoDB	Local installation or MongoDB Atlas
Ollama	Required for local AI inference
Tesseract OCR	Required for image text extraction

1. Clone the Repository

git clone https://github.com/manvendrasingh9299-del/EasyLearn.git
cd EasyLearn

2. Download AI Models

ollama pull llama3.2:3b
ollama pull mistral:instruct

3. Configure the Backend

cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

Configure the environment variables in backend/.env:

MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=easylearn_db
OLLAMA_URL=http://localhost:11434/api/generate
AI_MODEL=llama3.2:3b
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=20
CHUNK_SIZE=4000
SECRET_KEY=your-secret-key-here

4. Configure the Frontend

Open a new terminal and install the frontend dependencies:

cd EasyLearn/frontend
npm install

5. Run the Application

From the project root, execute:

bash start.sh

Alternatively, start the backend and frontend separately using their configured commands.

Service	Default Address
Frontend	http://localhost:3000
Backend	http://localhost:8000
API Documentation	http://localhost:8000/docs

AI Models

Task	Model	Runtime
Chunk-level fact extraction	Llama 3.2:3b	Ollama
Structured summary generation	Llama 3.2:3b	Ollama
Chatbot responses	Mistral Instruct	Ollama
Quiz generation	Mistral Instruct	Ollama
Exam question generation	Mistral Instruct	Ollama

API Endpoints

Method	Endpoint	Description
POST	/api/v1/upload	Upload files and generate summaries
GET	/api/v1/summaries	Retrieve saved summaries
DELETE	/api/v1/summaries/{name}	Delete a summary
POST	/api/v1/auth/signup	Register a new user
POST	/api/v1/auth/login	Authenticate a user
GET	/api/v1/auth/me	Retrieve the current user
POST	/api/v1/chat	Send messages to Ducky AI
GET	/health	Check server and database health

Supported File Types

File Type	Extensions	Extraction Method
PDF Documents	.pdf	pdfplumber
Photographs	.jpg, .jpeg	Tesseract OCR
Screenshots	.png	Tesseract OCR
Web Images	.webp	Tesseract OCR

Handwritten text recognition depends on handwriting clarity and image quality.

Deployment

EasyLearn supports two deployment configurations.

Deployment	Description
Local Deployment	Run the application and AI models on your own machine using Ollama.
Kaggle GPU	Run AI inference on a Kaggle GPU and expose the backend through ngrok.

Remote deployment requires appropriate database credentials, environment variables, and API URL configuration. Kaggle sessions and ngrok URLs may be temporary.

Security

* Store credentials and secret keys in environment variables.
* Never commit .env files to the repository.
* Configure appropriate database access controls.
* Delete temporary uploads after processing as intended by the application.
* Protect authenticated endpoints with proper authorization checks.

⸻
