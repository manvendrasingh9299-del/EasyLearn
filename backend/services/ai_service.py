# services/ai_service.py
#
# Kaggle deployment version
# Ollama runs locally inside Kaggle notebook on T4 GPU
#
# Models (both pulled in the Kaggle notebook setup cell):
#   llama3.2:3b      → summaries  (structured, clear output)
#   mistral:instruct → chat       (fast, conversational)

import httpx
from config import OLLAMA_URL, AI_MODEL

SUMMARY_MODEL = "llama3.2:3b"
CHAT_MODEL    = "mistral:instruct"


# ── Chunk extraction — Llama 3.2 ──────────────────────────────────────────────
CHUNK_PROMPT = """\
Extract the key facts from the text below. Write one fact per line starting with "- ". \
Maximum 15 words per line. Only use information from the text.

Text:
{content}

Key facts:"""


# ── Final structured summary — Llama 3.2 ─────────────────────────────────────
FINAL_PROMPT = """\
You are a study assistant. Write a structured summary from the notes below.
Use plain English. Keep sentences short (max 18 words). Define technical terms simply.
Do not write stories or use "Imagine...". No emojis inside the text content.

Notes:
{content}

Write your response in this EXACT format (keep the emoji markers):

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


# ── Chat — Mistral:instruct ───────────────────────────────────────────────────
CHAT_PROMPT = """\
You are Ducky, a helpful AI study assistant inside EasyLearn. Answer like ChatGPT — directly, clearly, and helpfully.
{notes_block}
Rules: answer any question the student asks; use the notes when relevant, otherwise use your own knowledge; \
never say "I don't know"; use bullet points when listing multiple items; keep answers focused.

Student: {message}
Ducky:"""


# ── Reusable Ollama call with speed options ────────────────────────────────────
async def _call(
    prompt: str,
    model: str,
    timeout: float = 300.0,
    num_predict: int = 1200,
    temperature: float = 0.2,
) -> str:
    """
    Call Ollama running inside Kaggle notebook.
    Falls back to AI_MODEL from config if named model not found.
    T4 GPU gives ~150-200 tok/s — much faster than local CPU.
    """
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
            raise KeyError(f"Unexpected Ollama response: {list(data.keys())}")
        result = data["response"].strip()
        if model == SUMMARY_MODEL and "📚" not in result and "TOPIC" not in result:
            print(f"⚠  Summary may be incomplete. Preview: {result[:200]}")
        return result
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404 and model != AI_MODEL:
            print(f"⚠  Model '{model}' not found — falling back to '{AI_MODEL}'")
            payload["model"] = AI_MODEL
            async with httpx.AsyncClient(timeout=timeout) as c:
                r = await c.post(OLLAMA_URL, json=payload)
                r.raise_for_status()
            return r.json()["response"].strip()
        raise


async def generate_chunk_summary(content: str, timeout: float = 120.0) -> str:
    return await _call(CHUNK_PROMPT.format(content=content), SUMMARY_MODEL, timeout, num_predict=400, temperature=0.1)


async def generate_final_summary(content: str, timeout: float = 300.0) -> str:
    return await _call(FINAL_PROMPT.format(content=content), SUMMARY_MODEL, timeout, num_predict=1200, temperature=0.2)


async def generate_chat_reply(message: str, context: str = "", timeout: float = 90.0) -> str:
    notes_block = (
        f"\nStudent's uploaded notes (use as primary source when relevant):\n---\n{context[:2500]}\n---\n"
        if context.strip() else
        "\nNo notes uploaded. Answer from your own knowledge.\n"
    )
    return await _call(
        CHAT_PROMPT.format(notes_block=notes_block, message=message.strip()),
        CHAT_MODEL, timeout, num_predict=500, temperature=0.4,
    )