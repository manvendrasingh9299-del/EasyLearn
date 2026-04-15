# services/ai_service.py
#
# Llama 3.2:3b  → summaries
# Mistral:instruct → chat

import httpx
from config import OLLAMA_URL, AI_MODEL

SUMMARY_MODEL = "llama3.2:3b"
CHAT_MODEL    = "mistral:instruct"


# ── 1. Chunk extraction ────────────────────────────────────────────────────────
CHUNK_PROMPT = """\
Extract the key facts from the text below. Write one fact per line, starting with "- ". \
Maximum 15 words per line. Only use information from the text.

Text:
{content}

Key facts:"""


# ── 2. Final structured summary ───────────────────────────────────────────────
# Rules kept very short to reduce input tokens.
# Placeholder lines removed — they confused the model and wasted tokens.
FINAL_PROMPT = """\
You are a study assistant. Write a structured summary from the notes below.
Use plain English. Keep sentences short (max 18 words). Define technical terms simply.
Do not write stories or use "Imagine...". No emojis inside the text content.

Notes:
{content}

Write your response in this EXACT format (keep the emoji markers, they are required):

📚 TOPIC
Write one sentence stating exactly what this topic is about.

✅ IMPORTANT POINTS
Write exactly 6 bullet points. Each starts with "- " and is one factual sentence.

🔑 KEY CONCEPTS
Write up to 8 terms. Format: "- Term: definition in one sentence."

🧠 SIMPLE EXPLANATION
Write 4 sentences explaining what this topic is, how it works, and why it matters. Start with a direct fact.

📝 EXAM SUMMARY
Write exactly 3 short sentences covering the most important exam facts.

🎯 QUICK TIPS TO REMEMBER
Write 3 memory tips labelled A, B, C. Each is one sentence with a useful technique.
"""


# ── 3. Chat ────────────────────────────────────────────────────────────────────
CHAT_PROMPT = """\
You are Ducky, a helpful AI study assistant inside EasyLearn. Answer like ChatGPT — directly, clearly, and helpfully.
{notes_block}
Rules: answer any question the student asks; use the notes when relevant, otherwise use your own knowledge; \
never say "I don't know"; use bullet points when listing multiple items; keep answers focused.

Student: {message}
Ducky:"""


# ── Core functions ─────────────────────────────────────────────────────────────

async def generate_chunk_summary(content: str, timeout: float = 120.0) -> str:
    return await _call(
        prompt=CHUNK_PROMPT.format(content=content),
        model=SUMMARY_MODEL,
        timeout=timeout,
        num_predict=400,
        temperature=0.1,
    )


async def generate_final_summary(content: str, timeout: float = 300.0) -> str:
    return await _call(
        prompt=FINAL_PROMPT.format(content=content),
        model=SUMMARY_MODEL,
        timeout=timeout,
        num_predict=1200,   # must be high enough to complete all 6 sections
        temperature=0.2,
    )


async def generate_chat_reply(message: str, context: str = "", timeout: float = 90.0) -> str:
    notes_block = (
        f"\nThe student has uploaded these notes. Use them as your primary source when relevant:\n"
        f"---\n{context[:2500]}\n---\n"
        if context.strip()
        else "\nNo notes have been uploaded yet. Answer from your general knowledge.\n"
    )
    return await _call(
        prompt=CHAT_PROMPT.format(notes_block=notes_block, message=message.strip()),
        model=CHAT_MODEL,
        timeout=timeout,
        num_predict=500,
        temperature=0.4,
    )


async def _call(
    prompt: str,
    model: str,
    timeout: float,
    num_predict: int = 1200,
    temperature: float = 0.2,
) -> str:
    payload = {
        "model":  model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": num_predict,
            "temperature": temperature,
            "num_ctx":     4096,
            "top_k":       40,
            "top_p":       0.9,
        },
    }

    try:
        async with httpx.AsyncClient(timeout=timeout) as c:
            r = await c.post(OLLAMA_URL, json=payload)
            r.raise_for_status()
        data = r.json()
        if "response" not in data:
            raise KeyError(f"Unexpected Ollama response keys: {list(data.keys())}")
        result = data["response"].strip()

        # Safety check — if model cut off before writing the TOPIC section,
        # the response is unusable. Log it so you can see what happened.
        if "📚" not in result and "TOPIC" not in result:
            print(f"⚠  Summary appears incomplete. Response preview: {result[:200]}")

        return result

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404 and model != AI_MODEL:
            print(f"⚠  Model '{model}' not found — check 'ollama list'. Falling back to '{AI_MODEL}'")
            payload["model"] = AI_MODEL
            async with httpx.AsyncClient(timeout=timeout) as c:
                r = await c.post(OLLAMA_URL, json=payload)
                r.raise_for_status()
            return r.json()["response"].strip()
        raise