# services/ai_service.py
#
# Dual-model pipeline:
#   Mistral  -> chunk extraction  (precise, factual)
#   Llama 3  -> final summary     (clear, structured, student-friendly)

import httpx
from config import OLLAMA_URL, AI_MODEL

EXTRACTION_MODEL = "mistral"
SUMMARY_MODEL    = "llama3"

CHUNK_PROMPT = """You are a precise study note extractor. Read the text and pull out every important fact.

Rules:
- One fact per bullet point. Start each with "- "
- Maximum 20 words per bullet point
- Only include information that is in the text — do not add anything extra
- Use plain English. If a term is technical, include it as-is — do not simplify it
- No introductions, no summaries, no conclusions

Text:
{content}

Facts:"""


FINAL_PROMPT = """You are a study assistant writing a structured summary for a student.
The student needs to understand this topic clearly and quickly.

Hard rules — follow every single one:
1. Simple sentences. Maximum 18 words per sentence.
2. No storytelling. No "Imagine..." or "Think of it like..." sentences.
3. No emojis inside text — only the section marker emojis below.
4. No filler: no "In this section", "As we can see", "It is worth noting".
5. Plain English. If you use a technical term, define it in the same sentence.
6. Write in second person where it helps — use "you" and "your".
7. Simple Explanation: write like a clear, direct textbook paragraph.
8. Exam Summary: 3 short sentences a student can memorise in one read.

Study material:
{content}

---
Write EXACTLY in this format. Keep the emoji markers exactly as shown:

📚 TOPIC
One sentence only. Name the exact topic. Be specific, not vague.

✅ IMPORTANT POINTS
Exactly 6 bullet points. Each starts with "- ".
Each is one complete, factual sentence. Maximum 18 words each. No repetition between points.

🔑 KEY CONCEPTS
Up to 8 terms. Format each as:
- Term: Plain English definition. One sentence. Maximum 20 words.

🧠 SIMPLE EXPLANATION
4 to 5 sentences. Explain what this topic is, how it works, and why it matters.
Start with a direct factual statement — not a question, not an analogy, not "Imagine".
Each sentence adds new information. No padding. No repetition.

📝 EXAM SUMMARY
Exactly 3 sentences. Short and memorable.
These are the 3 most important facts a student must know for an exam.

🎯 QUICK TIPS TO REMEMBER
Give 3 memory aids. Each is 1 to 2 sentences.
Use acronyms, patterns, comparisons or simple rules — not stories or rhymes.
"""


async def generate_chunk_summary(content: str, timeout: float = 300.0) -> str:
    """Mistral extracts raw facts from one chunk."""
    return await _call_ollama(CHUNK_PROMPT.format(content=content), EXTRACTION_MODEL, timeout)


async def generate_final_summary(merged_content: str, timeout: float = 600.0) -> str:
    """Llama 3 writes the final structured summary from extracted facts."""
    return await _call_ollama(FINAL_PROMPT.format(content=merged_content), SUMMARY_MODEL, timeout)


async def _call_ollama(prompt: str, model: str, timeout: float = 300.0) -> str:
    """Call Ollama with fallback to AI_MODEL if model not found."""
    payload = {"model": model, "prompt": prompt, "stream": False}

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.post(OLLAMA_URL, json=payload)
            r.raise_for_status()
        data = r.json()
        if "response" not in data:
            raise KeyError(f"Unexpected Ollama response: {list(data.keys())}")
        return data["response"].strip()

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404 and model != AI_MODEL:
            print(f"Model '{model}' not found, falling back to '{AI_MODEL}'")
            payload["model"] = AI_MODEL
            async with httpx.AsyncClient(timeout=timeout) as client:
                r = await client.post(OLLAMA_URL, json=payload)
                r.raise_for_status()
            return r.json()["response"].strip()
        raise