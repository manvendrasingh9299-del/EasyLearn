<div align="center">

EasyLearn

AI-Powered Academic Learning System

Transform study materials into structured summaries, flashcards, quizzes, and exam-focused questions using open-source AI models.

React · FastAPI · MongoDB · Llama 3.2 · Mistral

</div>

⸻

Overview

EasyLearn is a full-stack AI-powered study assistant that helps students understand concepts and prepare for examinations. It processes PDFs, images, and handwritten notes to generate structured learning materials through an interactive web application.

The system uses Llama 3.2 for summarization and Mistral Instruct for chatbot responses, quizzes, and exam-question generation. AI inference can run locally through Ollama or on a remote Kaggle GPU backend.

Features

Feature	Description
Document Processing	Upload PDFs, images, and handwritten notes.
AI Summarization	Generate structured summaries using Llama 3.2.
Key Concepts	Extract important points, concepts, and explanations.
Exam Preparation	Generate exam-focused summaries, revision tips, and important questions.
Interactive Flashcards	Review concepts using flip cards.
AI Chatbot	Ask questions about study materials or general topics using Ducky AI.
Quiz Generation	Generate multiple-choice quizzes from uploaded notes.
PDF Export	Export generated summaries as formatted PDF documents.
User Authentication	Support registration and login using JWT authentication.
Study History	Store and retrieve summaries using MongoDB.
Dark Mode	Provide a dark-themed interface for studying.
Flexible Inference	Run AI models locally or use a remote GPU backend.

Technology Stack

Component	Technology
Frontend	React 18, JavaScript, CSS
Typography	Crimson Pro, DM Sans
Backend	Python, FastAPI, Uvicorn
AI Models	Llama 3.2:3b, Mistral Instruct
AI Runtime	Ollama
Database	MongoDB Atlas / MongoDB
PDF Processing	pdfplumber
OCR	Tesseract OCR, pytesseract
HTTP Client	HTTPX
Authentication	JWT
GPU Infrastructure	Kaggle T4 GPU
Tunneling	ngrok

Architecture

flowchart TD
    A["React Frontend"] --> B["FastAPI Backend"]
    B --> C["Authentication"]
    B --> D["Document Processing"]
    D --> E["PDF Extraction"]
    D --> F["Image OCR"]
    E --> G["Text Chunking"]
    F --> G
    G --> H["Llama 3.2:3b"]
    H --> I["Structured Summary"]
    I --> J[("MongoDB")]
    I --> K["Learning Materials"]
    K --> L["Flashcards and Quizzes"]
    L --> A
    I --> A
    A --> M["Ducky AI Chatbot"]
    M --> N["Mistral Instruct"]
    N --> A

Project Structure

EasyLearn/
├── backend/
│   ├── models/
│   │   └── summary_model.py
│   ├── routers/
│   │   ├── summary_router.py
│   │   ├── auth_router.py
│   │   └── chat_router.py
│   ├── services/
│   │   ├── ai_service.py
│   │   ├── chunk_service.py
│   │   ├── image_service.py
│   │   ├── pdf_service.py
│   │   └── pipeline_service.py
│   ├── main.py
│   ├── config.py
│   ├── database.py
│   ├── requirements.txt
│   └── .env.example
├── frontend/
│   ├── public/
│   │   ├── index.html
│   │   └── mascot/
│   ├── src/
│   │   ├── index.js
│   │   └── app.js
│   └── package.json
├── easylearn_kaggle.ipynb
├── start.sh
└── README.md

Getting Started

EasyLearn supports local deployment and remote GPU inference.

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

2. Install Tesseract OCR

macOS

brew install tesseract

Ubuntu / Debian

sudo apt update
sudo apt install tesseract-ocr

3. Download AI Models

Ensure Ollama is installed and running.

ollama pull llama3.2:3b
ollama pull mistral:instruct

4. Configure the Backend

cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env

For Windows, activate the virtual environment using:

venv\Scripts\activate

Configure backend/.env:

MONGO_URI=mongodb://localhost:27017
DATABASE_NAME=easylearn_db
OLLAMA_URL=http://localhost:11434/api/generate
AI_MODEL=llama3.2:3b
UPLOAD_DIR=uploads
MAX_FILE_SIZE_MB=20
CHUNK_SIZE=4000
SECRET_KEY=your-secret-key-here

Update the values according to your environment. Use a strong, unique secret key and keep the .env file private.

5. Configure the Frontend

Open a new terminal:

cd EasyLearn/frontend
npm install

6. Start the Application

From the project root, run:

bash start.sh

Alternatively, start the backend and frontend separately using their configured commands.

Local Application URLs

Service	URL
Frontend	http://localhost:3000
Backend	http://localhost:8000
API Documentation	http://localhost:8000/docs

The URLs above assume the application is configured to use these ports.

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
GET	/api/v1/auth/me	Retrieve the authenticated user
POST	/api/v1/chat	Send messages to Ducky AI
GET	/health	Check server and database health

Interactive API documentation is available at /docs when the backend is running.

Supported File Types

File Type	Extensions	Extraction Method
PDF Documents	.pdf	pdfplumber
Photographs	.jpg, .jpeg	Tesseract OCR
Screenshots	.png	Tesseract OCR
Web Images	.webp	Tesseract OCR

Handwritten text recognition depends on handwriting clarity, image resolution, and image quality. Scanned PDFs may require OCR when they do not contain an extractable text layer.

Deployment Options

Deployment	Description
Local Deployment	Run the backend, frontend, database, and AI models on your own machine.
Kaggle GPU	Run AI inference on a Kaggle GPU and expose the backend through ngrok.

For Kaggle deployment, configure the MongoDB connection, secret key, ngrok authentication token, and frontend API URL in the appropriate configuration files.

Kaggle sessions and ngrok URLs may be temporary. A new session may require updating the frontend API configuration.

Environment Variables

Variable	Default	Description
MONGO_URI	mongodb://localhost:27017	MongoDB connection string
DATABASE_NAME	easylearn_db	Database name
OLLAMA_URL	http://localhost:11434/api/generate	Ollama API endpoint
AI_MODEL	llama3.2:3b	Default summarization model
UPLOAD_DIR	uploads	Temporary upload directory
MAX_FILE_SIZE_MB	20	Maximum upload size in MB
CHUNK_SIZE	4000	Configured text chunk size
SECRET_KEY	Not configured	JWT signing secret

Ensure the CHUNK_SIZE unit matches the implementation in the chunking service.

Security

* Store credentials and secret keys in environment variables.
* Never commit .env files or other sensitive credentials.
* Configure appropriate MongoDB access controls.
* Protect authenticated endpoints with proper authorization checks.
* Ensure temporary uploaded files are deleted as intended.
* Review data handling when using remote GPU infrastructure and cloud databases.

License

Add your chosen open-source license to the repository if you intend to distribute the project under one.

⸻

<div align="center">

EasyLearn — Structured learning powered by AI.

</div>
