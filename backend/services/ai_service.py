# services/ai_service.py

import httpx
from config import OLLAMA_URL, AI_MODEL

# ---------------------------------------------------------------------------
# Prompt Templates
# ---------------------------------------------------------------------------

CHUNK_SUMMARY_PROMPT = """You are a friendly study helper. Read the text below and pull out the most important facts as short, simple bullet points. Write like you are texting a friend — short sentences, easy words, no complicated terms.

Text:
{content}

Key facts (bullet points, max 10 words each):"""


FINAL_SUMMARY_PROMPT = """You are EasyLearn — a chill, friendly study buddy who makes hard topics feel easy. A student just uploaded their study notes. Your job is to explain everything so clearly that even someone who knows NOTHING about this topic can understand it.

Rules:
- Write like you are talking to a friend, not writing an essay
- Use short sentences. Maximum 20 words per sentence.
- Replace every complicated word with a simpler one
- Use "you" and "your" to feel personal
- Give real life examples — things students actually see every day
- No academic language. No passive voice. Keep it human.

Study content:
{content}

---

Reply in EXACTLY this format, including the emojis as section markers:

📚 TOPIC
One sentence. What is this whole thing about? Keep it under 15 words.

✅ IMPORTANT POINTS
Write exactly 6 bullet points. Each one is one sentence. Max 20 words each. Start each with "- ". Use the simplest words possible.

🔑 KEY CONCEPTS
List up to 8 important words or ideas. For each one write: the word, then a colon, then explain it in one simple sentence like you are explaining to a 12 year old. Example format:
- Photosynthesis: How plants make their own food using sunlight, like a tiny food factory inside every leaf.

🧠 SIMPLE EXPLANATION
Write 5 sentences maximum. Explain the whole topic using a real life example or story the student can picture. Start with "Imagine..." or "Think of it like..." Make it click. Be warm and friendly.

📝 EXAM SUMMARY
Write 3 sentences only. The most important things to remember for the exam. Short, punchy, memorable.

🎯 QUICK TIPS TO REMEMBER
Give 3 memory tricks. Can be a rhyme, acronym, silly story or visual trick. Keep each tip under 2 sentences.
"""

# ---------------------------------------------------------------------------
# Core functions
# ---------------------------------------------------------------------------

async def generate_chunk_summary(content: str, timeout: float = 300.0) -> str:
    """Generate simple bullet-point extraction from a single chunk."""
    prompt = CHUNK_SUMMARY_PROMPT.format(content=content)
    return await _call_ollama(prompt, timeout)


async def generate_final_summary(merged_content: str, timeout: float = 600.0) -> str:
    """Generate the full friendly study summary from all merged chunks."""
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