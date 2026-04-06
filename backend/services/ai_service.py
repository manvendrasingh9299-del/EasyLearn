# services/ai_service.py
#
# Llama 3  → summaries  (structured, clear writing)
# Mistral  → chat       (fast, conversational, general knowledge)
#
# Speed optimisations:
#   - num_predict capped so the model stops when done instead of padding
#   - temperature 0 on summary = deterministic, no wasted exploration
#   - Chunk prompt is minimal — fewer input tokens = faster first token
#   - Final prompt skips redundant instructions already baked into format

import httpx
from config import OLLAMA_URL, AI_MODEL

SUMMARY_MODEL = "llama3"
CHAT_MODEL    = "mistral"


# ── 1. Chunk extraction — Llama 3 ─────────────────────────────────────────────
# Kept deliberately short. Fewer prompt tokens = faster processing.
# Each chunk is ~1000 words → ~750 tokens input. Cap output at 400 tokens.
CHUNK_PROMPT = """\
Extract every important fact from the text below as bullet points.
- One fact per line starting with "- "
- Max 15 words per line
- Only facts from the text, nothing added
- Keep all technical terms exactly as written

Text:
{content}

Facts:"""


# ── 2. Final structured summary — Llama 3 ────────────────────────────────────
# Single-pass: takes the merged chunk facts and writes the full summary.
# No intermediate rewrites — one call, one output.
FINAL_PROMPT = """\
Write a study summary from these bullet points. Reader: exam student.

Rules:
- Plain English. Max 18 words per sentence.
- Define every technical term in the same sentence it appears.
- No filler. No stories. No "Imagine". Start explanation with a fact.
- Exam Summary: 3 short memorable sentences.
- No emojis inside text — only the markers below.

Material:
{content}

EXACTLY this format:

📚 TOPIC
One specific sentence naming the exact topic.

✅ IMPORTANT POINTS
- Fact one. Max 18 words.
- Fact two.
- Fact three.
- Fact four.
- Fact five.
- Fact six.

🔑 KEY CONCEPTS
- Term: Definition, one sentence, max 20 words.
(Up to 8 terms)

🧠 SIMPLE EXPLANATION
4-5 direct factual sentences. What it is, how it works, why it matters.

📝 EXAM SUMMARY
Three sentences. Short. Memorable. The 3 most important exam facts.

🎯 QUICK TIPS TO REMEMBER
- A: Memory technique — acronym, pattern or rule.
- B:
- C:
"""


# ── 3. Chat — Mistral ─────────────────────────────────────────────────────────
# Mistral is fast and conversational. Perfect for quick Q&A.
# Notes injected as context so it answers from the student's material first.
CHAT_PROMPT = """\
You are Ducky, an AI study assistant. Answer like ChatGPT — helpfully and directly.
{notes_block}
Rules: answer any question; use notes when relevant, otherwise use your knowledge; never say "I don't know"; use bullet points for lists; explain terms simply.

Student: {message}
Ducky:"""


# ── Core functions ─────────────────────────────────────────────────────────────

async def generate_chunk_summary(content: str, timeout: float = 120.0) -> str:
    """Fast fact extraction from one text chunk using Llama 3."""
    return await _call(
        prompt=CHUNK_PROMPT.format(content=content),
        model=SUMMARY_MODEL,
        timeout=timeout,
        num_predict=350,   # facts list — no need for more
        temperature=0.1,   # near-deterministic, no rambling
    )


async def generate_final_summary(content: str, timeout: float = 300.0) -> str:
    """Full structured summary from merged chunk facts using Llama 3."""
    return await _call(
        prompt=FINAL_PROMPT.format(content=content),
        model=SUMMARY_MODEL,
        timeout=timeout,
        num_predict=900,   # enough for all 6 sections
        temperature=0.2,
    )


async def generate_chat_reply(message: str, context: str = "", timeout: float = 60.0) -> str:
    """Fast conversational reply from Mistral."""
    notes_block = (
        f"\nStudent's uploaded notes (use as primary source when relevant):\n"
        f"---\n{context[:2500]}\n---\n"
        if context.strip()
        else "\nNo notes uploaded. Answer from your own knowledge.\n"
    )
    return await _call(
        prompt=CHAT_PROMPT.format(notes_block=notes_block, message=message.strip()),
        model=CHAT_MODEL,
        timeout=timeout,
        num_predict=500,   # chat answers should be focused, not essays
        temperature=0.4,
    )


async def _call(
    prompt: str,
    model: str,
    timeout: float,
    num_predict: int = 800,
    temperature: float = 0.2,
) -> str:
    """
    Call Ollama with speed-tuned options.
    Falls back to AI_MODEL from config if the requested model is not found.
    """
    payload = {
        "model":  model,
        "prompt": prompt,
        "stream": False,
        "options": {
            "num_predict": num_predict,   # hard cap on output tokens = no padding
            "temperature": temperature,    # lower = faster + more consistent
            "num_ctx":     4096,           # context window — enough for all tasks
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
        return data["response"].strip()

    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404 and model != AI_MODEL:
            print(f"⚠  Model '{model}' not found — falling back to '{AI_MODEL}'")
            payload["model"] = AI_MODEL
            async with httpx.AsyncClient(timeout=timeout) as c:
                r = await c.post(OLLAMA_URL, json=payload)
                r.raise_for_status()
            return r.json()["response"].strip()
        raise