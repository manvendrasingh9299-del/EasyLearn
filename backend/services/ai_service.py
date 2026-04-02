# services/ai_service.py

import httpx
from config import OLLAMA_URL, AI_MODEL

# ---------------------------------------------------------------------------
# Prompt Templates
# ---------------------------------------------------------------------------

CHUNK_SUMMARY_PROMPT = """Read the text below. Extract the most important facts as short bullet points.
Be direct. No filler words. No examples. Just the facts.

Text:
{content}

Facts (bullet points, one sentence each):"""


FINAL_SUMMARY_PROMPT = """You are a study assistant. A student uploaded their notes. Write a structured summary.

Rules — follow exactly:
- Write in plain English. Short sentences only.
- No storytelling. No "Imagine..." sentences. No analogies.
- No emojis anywhere in the text content.
- Do not say "In conclusion", "Overall", "In summary".
- Be direct. Every sentence must teach something.
- Maximum 20 words per sentence.

Content:
{content}

---

Reply using EXACTLY these section markers (keep the emoji markers — they are used for formatting only):

📚 TOPIC
One sentence. What subject is this? Be specific.

✅ IMPORTANT POINTS
Exactly 6 bullet points. Start each with "- ".
Each point is one clear factual sentence. Max 18 words each.
No filler. No repetition.

🔑 KEY CONCEPTS
Up to 8 terms. Format each as:
- Term: One sentence definition. Plain English. No jargon unless explained.

🧠 SIMPLE EXPLANATION
4 sentences maximum. Explain what this topic is and why it matters.
Do NOT start with "Imagine" or "Think of". Start with a direct factual statement.
No analogies. No stories.

📝 EXAM SUMMARY
3 sentences. The most important things to know for the exam.
Direct. Factual. Memorable.

🎯 QUICK TIPS TO REMEMBER
3 tips. Each is a short sentence with a concrete memory technique.
Can use acronyms, patterns, or connections — but no silly stories.
"""

# ---------------------------------------------------------------------------
# Core functions
# ---------------------------------------------------------------------------

async def generate_chunk_summary(content: str, timeout: float = 300.0) -> str:
    """Extract key facts from a single chunk."""
    prompt = CHUNK_SUMMARY_PROMPT.format(content=content)
    return await _call_ollama(prompt, timeout)


async def generate_final_summary(merged_content: str, timeout: float = 600.0) -> str:
    """Generate the full structured summary from all merged chunks."""
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