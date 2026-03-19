# services/ai_service.py

import httpx
from config import OLLAMA_URL, AI_MODEL

# ---------------------------------------------------------------------------
# Prompt Templates
# ---------------------------------------------------------------------------

CHUNK_SUMMARY_PROMPT = """You are a helpful study assistant. Read the following content and extract the key information in simple, clear bullet points. Focus only on the facts — do not explain yet, just list what's important.

Content:
{content}

Key points (bullet list only):"""


FINAL_SUMMARY_PROMPT = """You are EasyLearn, a friendly and brilliant study tutor who explains things like a great teacher — clear, simple, and engaging, just like how the best tutors on YouTube explain concepts.

A student has uploaded study material. Based on the extracted content below, create a complete and helpful study summary.

Extracted Content:
{content}

---

Please respond in this exact format:

📚 TOPIC
Write the main topic in one clear sentence.

✅ IMPORTANT POINTS
List 6-8 key points. Each point should be a full sentence that's easy to understand. Use simple words. No jargon unless explained.

🔑 KEY CONCEPTS
List the important terms/concepts with a one-line plain English explanation for each.

🧠 SIMPLE EXPLANATION
Explain the whole topic like you're teaching a 16-year-old who has never seen this before. Use an analogy or real-world example to make it click. Write at least 4-5 sentences. Be friendly and conversational — like a tutor talking to a student.

📝 EXAM SUMMARY
Write a short 3-4 sentence paragraph the student can read the night before an exam to quickly remember everything important.

🎯 QUICK TIPS TO REMEMBER
Give 2-3 clever memory tricks, mnemonics, or tips to help the student remember the key ideas easily.
"""

# ---------------------------------------------------------------------------
# Core functions
# ---------------------------------------------------------------------------

async def generate_chunk_summary(content: str, timeout: float = 300.0) -> str:
    """Generate bullet-point extraction from a single chunk."""
    prompt = CHUNK_SUMMARY_PROMPT.format(content=content)
    return await _call_ollama(prompt, timeout)


async def generate_final_summary(merged_content: str, timeout: float = 600.0) -> str:
    """Generate the full structured study summary from all merged chunks."""
    prompt = FINAL_SUMMARY_PROMPT.format(content=merged_content)
    return await _call_ollama(prompt, timeout)


async def _call_ollama(prompt: str, timeout: float = 300.0) -> str:
    """Send a prompt to Ollama and return the response text."""
    payload = {
        "model": AI_MODEL,
        "prompt": prompt,
        "stream": False,
    }

    async with httpx.AsyncClient(timeout=timeout) as client:
        response = await client.post(OLLAMA_URL, json=payload)
        response.raise_for_status()

    data = response.json()

    if "response" not in data:
        raise KeyError(f"Unexpected Ollama response: {list(data.keys())}")

    return data["response"].strip()