# services/ai_service.py
#
# Cloud replacement for Ollama.
# Uses Groq API (free tier) — same function signatures as before,
# so pipeline_service.py, chat_router.py, and everything else is unchanged.
#
# Models:
#   llama-3.1-8b-instant  → summaries  (fast, structured output)
#   mixtral-8x7b-32768    → chat       (large context, conversational)
#
# To switch provider later, only change _call() below.

import os
from groq import AsyncGroq

SUMMARY_MODEL = "llama-3.1-8b-instant"
CHAT_MODEL    = "mixtral-8x7b-32768"

# Reads GROQ_API_KEY from .env automatically
_client = AsyncGroq(api_key=os.environ.get("GROQ_API_KEY"))


# ── Prompts ────────────────────────────────────────────────────────────────────

CHUNK_PROMPT = """\
Extract the key facts from the text below. Write one fact per line starting with "- ". \
Maximum 15 words per line. Only use information from the text.

Text:
{content}

Key facts:"""


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


CHAT_PROMPT = """\
You are Ducky, a helpful AI study assistant inside EasyLearn. Answer like ChatGPT — directly, clearly, and helpfully.
{notes_block}
Rules: answer any question the student asks; use the notes when relevant, otherwise use your own knowledge; \
never say "I don't know"; use bullet points when listing multiple items; keep answers focused.

Student: {message}
Ducky:"""


# ── Reusable cloud call ────────────────────────────────────────────────────────

async def _call(
    prompt: str,
    model: str,
    max_tokens: int = 1200,
    temperature: float = 0.2,
) -> str:
    """
    Single reusable function for all Groq API calls.
    To switch provider (OpenAI, Gemini etc.), only change this function.
    """
    response = await _client.chat.completions.create(
        model=model,
        messages=[{"role": "user", "content": prompt}],
        max_tokens=max_tokens,
        temperature=temperature,
    )
    return response.choices[0].message.content.strip()


# ── Public functions — identical signatures to the Ollama version ──────────────
# pipeline_service.py and chat_router.py call these. Nothing there changes.

async def generate_chunk_summary(content: str, timeout: float = 60.0) -> str:
    """Extract key facts from one text chunk."""
    return await _call(
        prompt=CHUNK_PROMPT.format(content=content),
        model=SUMMARY_MODEL,
        max_tokens=400,
        temperature=0.1,
    )


async def generate_final_summary(content: str, timeout: float = 120.0) -> str:
    """Generate the full 6-section structured summary."""
    result = await _call(
        prompt=FINAL_PROMPT.format(content=content),
        model=SUMMARY_MODEL,
        max_tokens=1200,
        temperature=0.2,
    )
    if "📚" not in result and "TOPIC" not in result:
        print(f"⚠  Summary may be incomplete. Preview: {result[:200]}")
    return result


async def generate_chat_reply(message: str, context: str = "", timeout: float = 30.0) -> str:
    """Answer a student's chat question using Mixtral."""
    notes_block = (
        f"\nThe student has uploaded these notes. Use them as your primary source:\n"
        f"---\n{context[:3000]}\n---\n"
        if context.strip()
        else "\nNo notes uploaded. Answer from your general knowledge.\n"
    )
    return await _call(
        prompt=CHAT_PROMPT.format(notes_block=notes_block, message=message.strip()),
        model=CHAT_MODEL,
        max_tokens=600,
        temperature=0.4,
    )
