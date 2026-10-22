<div align="center">
EasyLearn

AI-Powered Academic Learning System

Transform PDFs, images, and handwritten notes into structured summaries, flashcards, quizzes, and exam-focused questions using open-source AI models.

Built with React, FastAPI, MongoDB, Llama 3.2, and Mistral.

</div>
Overview

EasyLearn is a full-stack AI-powered learning application that helps students understand concepts and prepare for examinations. It extracts text from documents and images, processes the content using large language models, and generates structured learning materials.

The application supports local AI inference through Ollama and remote GPU inference through Kaggle.

Features

* AI Summarization: Generate structured summaries from uploaded study materials.
* Document Processing: Extract text from PDFs, images, and handwritten notes using pdfplumber and Tesseract OCR.
* Interactive Flashcards: Review important concepts using flip cards.
* Ducky AI: Chat with an AI assistant about study materials and general topics.
* Quiz Generation: Generate multiple-choice quizzes from uploaded notes.
* Exam Preparation: Generate eight important exam-style questions.
* PDF Export: Export summaries as formatted PDF documents.
* User Authentication: Secure registration and login using JWT.
* Study History: Store and retrieve summaries using MongoDB.
* Dark Mode: A clean, dark-themed study interface.
* Flexible Deployment: Run locally or use a Kaggle GPU backend.
  
Tech Stack

| Component | Technologies |
|---|---|
| Frontend | React 18, JavaScript, CSS |
| Backend | Python, FastAPI, Uvicorn |
| AI Models | Llama 3.2:3b, Mistral Instruct |
| AI Runtime | Ollama |
| Database | MongoDB Atlas / MongoDB |
| PDF Processing | pdfplumber |
| OCR | Tesseract, pytesseract |
| HTTP Client | HTTPX |
| GPU Infrastructure | Kaggle T4 GPU |
| Tunneling | ngrok |

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
    A --> J[Ducky AI]
    J --> K[Mistral Instruct]
    K --> A
