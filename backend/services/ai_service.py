# services/ai_service.py
#
# Dual-model pipeline:
#   Mistral  -> chunk extraction  (precise, factual, fast)
#   Llama 3  -> final summary + chat  (clear, natural English)

import httpx
from config import OLLAMA_URL, AI_MODEL

EXTRACTION_MODEL = "mistral"
SUMMARY_MODEL    = "llama3"

# ── Chunk extraction prompt (Mistral) ─────────────────────────────────────────
CHUNK_PROMPT = """\
Extract every important fact from the text below.

Output rules:
- One fact per line, starting with "- "
- Max 20 words per line
- Only use information from the text — nothing extra
- Keep technical terms exactly as written
- No intro, no conclusion, just the facts

Text:
{content}

Facts:"""


# ── Final summary prompt (Llama 3) ────────────────────────────────────────────
FINAL_PROMPT = """\
Write a structured study summary from the bullet points below.

Writing rules (follow every one):
- Short sentences — max 18 words each
- Plain English — explain any technical term in the same sentence
- No storytelling, no analogies, no "Imagine..." sentences
- No filler phrases ("it is important to note", "as we can see")
- No emojis inside text — only the section markers shown below
- Direct and factual — every sentence must add new information
- Write in second person ("you", "your") where it helps

Source material:
{content}

---
Use EXACTLY this format. Keep the emoji section markers:

📚 TOPIC
One sentence. The specific subject. Be precise.

✅ IMPORTANT POINTS
6 bullet points. Each starts with "- ".
One factual sentence per point. Max 18 words. No repetition.

🔑 KEY CONCEPTS
Up to 8 terms. One per line:
- Term: Definition in one plain sentence. Max 20 words.

🧠 SIMPLE EXPLANATION
4-5 sentences. What this topic is, how it works, why it matters.
Start with a direct statement. No stories. No analogies.
Each sentence adds new information.

📝 EXAM SUMMARY
3 sentences only. Short and memorable.
The 3 most important facts for an exam.

🎯 QUICK TIPS TO REMEMBER
3 memory aids. 1-2 sentences each.
Acronyms, patterns, comparisons — no silly stories.
"""


# ── Chat prompt (Llama 3) ──────────────────────────────────────────────────────
CHAT_PROMPT = """\
You are Ducky, a helpful AI study assistant inside EasyLearn.
{context_section}
Answer the student's question clearly and helpfully.

Rules:
- Give direct, useful answers — never say "I don't know"
- Keep answers focused and concise
- Use bullet points for lists
- Plain English — explain technical terms simply
- If the notes don't cover the question, answer from your general knowledge

Student: {message}
Ducky:"""


# ── Core functions ─────────────────────────────────────────────────────────────

async def generate_chunk_summary(content: str, timeout: float = 300.0) -> str:
    """Mistral extracts raw facts from one text chunk."""
    return await _call_ollama(
        CHUNK_PROMPT.format(content=content),
        model=EXTRACTION_MODEL,
        timeout=timeout,
    )


async def generate_final_summary(merged_content: str, timeout: float = 600.0) -> str:
    """Llama 3 writes the final structured summary."""
    return await _call_ollama(
        FINAL_PROMPT.format(content=merged_content),
        model=SUMMARY_MODEL,
        timeout=timeout,
    )


async def generate_chat_reply(message: str, context: str = "", timeout: float = 60.0) -> str:
    """Llama 3 answers a student's chat question, with optional notes context."""
    context_section = (
        f"You have access to the student's uploaded notes:\n\n{context[:2500]}\n\n"
        f"Use these notes as your primary source when relevant."
        if context.strip()
        else "No notes have been uploaded yet — answer from your general knowledge."
    )
    prompt = CHAT_PROMPT.format(
        context_section=context_section,
        message=message,
    )
    return await _call_ollama(prompt, model=SUMMARY_MODEL, timeout=timeout)


async def _call_ollama(prompt: str, model: str, timeout: float = 300.0) -> str:
    """Call Ollama. Falls back to AI_MODEL from config if model is not found."""
    payload = {"model": model, "prompt": prompt, "stream": False}

    try:
        async with httpx.AsyncClient(timeout=timeout) as client:
            r = await client.post(OLLAMA_URL, json=payload)
            r.raise_for_status()
        data = r.json()
        if "response" not in data:
            raise KeyError(f"Unexpected Ollama response keys: {list(data.keys())}")
        return data["response"].strip()

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404 and model != AI_MODEL:
            print(f"⚠️  Model '{model}' not found — falling back to '{AI_MODEL}'")
            payload["model"] = AI_MODEL
            async with httpx.AsyncClient(timeout=timeout) as client:
                r = await client.post(OLLAMA_URL, json=payload)
                r.raise_for_status()
            return r.json()["response"].strip()
        raise