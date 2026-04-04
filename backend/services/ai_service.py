# services/ai_service.py
#
# Dual-model split — each model does what it is best at:
#   Llama 3   → summaries   (structured writing, clear English prose)
#   Mistral   → chat        (fast, conversational, knowledgeable Q&A)

import httpx
from config import OLLAMA_URL, AI_MODEL

SUMMARY_MODEL    = "llama3"    # Best for structured, readable output
CHAT_MODEL       = "mistral"   # Best for fast, accurate conversational answers

# ── Chunk extraction (Llama 3) ────────────────────────────────────────────────
CHUNK_PROMPT = """\
Extract every important fact from the text. Output only bullet points.

Rules:
- Start each line with "- "
- Max 20 words per line
- Only facts that are in the text — nothing extra
- Keep all technical terms exactly as written
- No intro sentence. No conclusion. Just the facts.

Text:
{content}

Facts:"""

# ── Final structured summary (Llama 3) ───────────────────────────────────────
FINAL_PROMPT = """\
Write a structured study summary from the bullet points below.
Your reader is a student who needs to understand this topic quickly and clearly.

Rules (follow every one):
- Short sentences. Max 18 words each.
- Plain English. Define any technical term in the same sentence.
- No "Imagine...", no analogies, no stories.
- No filler: no "it is important to", "as we can see", "in summary".
- No emojis inside the text — only use the emoji section markers below.
- Every sentence must add new information. No repetition.
- Simple Explanation: direct textbook-style paragraph. Start with a fact, not a question.
- Exam Summary: 3 short sentences a student can memorise in one read.

Source material:
{content}

---
Reply in EXACTLY this format. Keep all emoji markers:

📚 TOPIC
One sentence. Specific topic name. Not vague.

✅ IMPORTANT POINTS
6 bullet points. Each starts with "- ".
One factual sentence per point. Max 18 words. No repetition between points.

🔑 KEY CONCEPTS
Up to 8 terms. Format:
- Term: Definition. One sentence. Max 20 words.

🧠 SIMPLE EXPLANATION
4-5 sentences. What it is, how it works, why it matters.
Start with a direct statement. No stories. No analogies.

📝 EXAM SUMMARY
3 sentences only. Short. Memorable. The most important exam facts.

🎯 QUICK TIPS TO REMEMBER
3 memory aids. 1-2 sentences each.
Acronyms, patterns, rules. No stories.
"""

# ── Chat prompt (Mistral) ─────────────────────────────────────────────────────
CHAT_PROMPT = """\
You are Ducky, a knowledgeable AI study assistant — like ChatGPT, but focused on helping students.
{notes_section}

Instructions:
- Answer the question directly and helpfully. Never say "I don't know".
- If the question relates to the notes above, use them. Otherwise use your own knowledge.
- Keep answers clear and concise. Use bullet points for lists.
- Explain technical terms simply.
- Match the tone: friendly but informative.

Student: {message}
Ducky:"""


async def generate_chunk_summary(content: str, timeout: float = 300.0) -> str:
    """Llama 3 extracts clean facts from a raw text chunk."""
    return await _call(CHUNK_PROMPT.format(content=content), SUMMARY_MODEL, timeout)


async def generate_final_summary(content: str, timeout: float = 600.0) -> str:
    """Llama 3 writes the full structured student summary."""
    return await _call(FINAL_PROMPT.format(content=content), SUMMARY_MODEL, timeout)


async def generate_chat_reply(message: str, context: str = "", timeout: float = 90.0) -> str:
    """Mistral answers the student's chat question — from notes or general knowledge."""
    notes_section = (
        f"You have access to the student's uploaded notes:\n\n{context[:2800]}\n\nUse these as your primary source when relevant."
        if context.strip() else
        "No notes uploaded yet. Answer from your general knowledge."
    )
    prompt = CHAT_PROMPT.format(notes_section=notes_section, message=message.strip())
    return await _call(prompt, CHAT_MODEL, timeout)


async def _call(prompt: str, model: str, timeout: float) -> str:
    """Send prompt to Ollama. Fallback to AI_MODEL from config if model not found."""
    payload = {"model": model, "prompt": prompt, "stream": False}
    try:
        async with httpx.AsyncClient(timeout=timeout) as c:
            r = await c.post(OLLAMA_URL, json=payload)
            r.raise_for_status()
        data = r.json()
        if "response" not in data:
            raise KeyError(f"Unexpected Ollama keys: {list(data.keys())}")
        return data["response"].strip()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404 and model != AI_MODEL:
            print(f"⚠ Model '{model}' not found — falling back to '{AI_MODEL}'")
            payload["model"] = AI_MODEL
            async with httpx.AsyncClient(timeout=timeout) as c:
                r = await c.post(OLLAMA_URL, json=payload)
                r.raise_for_status()
            return r.json()["response"].strip()
        raise