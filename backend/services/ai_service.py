# services/ai_service.py
#
# Single model: llama3 for all tasks.
# Llama 3 handles extraction, summarisation, and chat equally well.
# Clear role-specific prompts ensure each task gets the best output.

import httpx
from config import OLLAMA_URL, AI_MODEL

MODEL = "llama3"   # One model, all tasks


# ── 1. Chunk fact extraction ──────────────────────────────────────────────────
CHUNK_PROMPT = """\
You are a precise note extractor. Read the text and pull out every important fact.

Output format:
- Start each fact with "- "
- One fact per line, maximum 20 words
- Use only information in the text — nothing added
- Keep technical terms exactly as written
- No introduction, no conclusion, just facts

Text:
{content}

Facts:"""


# ── 2. Final structured summary ───────────────────────────────────────────────
FINAL_PROMPT = """\
Write a clear, structured study summary. Your reader is a student preparing for an exam.

Writing rules — follow every one:
- Plain English. Max 18 words per sentence.
- Define every technical term in the same sentence it appears.
- No filler phrases. Every sentence must add new information.
- No storytelling, no "Imagine...", no analogies.
- Start the Simple Explanation with a direct factual statement.
- Exam Summary: 3 punchy sentences the student can memorise in 30 seconds.
- No emojis inside the text — only use the emoji markers shown below.

Source material:
{content}

Write output in EXACTLY this format. Keep every emoji marker:

📚 TOPIC
One sentence. The exact topic name. Specific, not vague.

✅ IMPORTANT POINTS
- Point one. One clear fact. Max 18 words.
- Point two.
- Point three.
- Point four.
- Point five.
- Point six.

🔑 KEY CONCEPTS
- Term: Definition in one clear sentence. Max 20 words.
(Up to 8 terms)

🧠 SIMPLE EXPLANATION
Write 4 to 5 sentences. Direct and factual.
Explain what this topic is, how it works, and why it matters.
No stories. No analogies.

📝 EXAM SUMMARY
Three sentences only. Short and memorable.
The three most important facts for the exam.

🎯 QUICK TIPS TO REMEMBER
- Tip A: One memory technique. Acronym, pattern, or rule. Max 2 sentences.
- Tip B:
- Tip C:
"""


# ── 3. Chat ───────────────────────────────────────────────────────────────────
CHAT_PROMPT = """\
You are Ducky, an AI study assistant inside EasyLearn. You work like ChatGPT — you can answer any question on any topic.
{notes_block}

How to respond:
- Answer directly and helpfully. Never say "I don't know" or "I can't help with that."
- If the question relates to the student's notes, use them as the primary source.
- For anything not in the notes, answer from your own general knowledge.
- Keep answers clear and focused. Use bullet points for lists of 3 or more items.
- Explain technical terms simply. Be friendly but informative.
- If generating exam questions, number them clearly and make them exam-quality.

Student: {message}
Ducky:"""


# ── Core functions ─────────────────────────────────────────────────────────────

async def generate_chunk_summary(content: str, timeout: float = 300.0) -> str:
    return await _call(CHUNK_PROMPT.format(content=content), timeout)


async def generate_final_summary(content: str, timeout: float = 600.0) -> str:
    return await _call(FINAL_PROMPT.format(content=content), timeout)


async def generate_chat_reply(message: str, context: str = "", timeout: float = 90.0) -> str:
    notes_block = (
        f"\nYou have the student's uploaded notes below. Use them as your primary source when relevant.\n\n"
        f"--- Student Notes ---\n{context[:3000]}\n--- End of Notes ---\n"
        if context.strip() else
        "\nNo notes uploaded yet. Answer any question from your general knowledge.\n"
    )
    prompt = CHAT_PROMPT.format(notes_block=notes_block, message=message.strip())
    return await _call(prompt, timeout)


async def _call(prompt: str, timeout: float) -> str:
    """Call Ollama with llama3. Falls back to AI_MODEL from config if not found."""
    payload = {"model": MODEL, "prompt": prompt, "stream": False}
    try:
        async with httpx.AsyncClient(timeout=timeout) as c:
            r = await c.post(OLLAMA_URL, json=payload)
            r.raise_for_status()
        data = r.json()
        if "response" not in data:
            raise KeyError(f"Unexpected Ollama response: {list(data.keys())}")
        return data["response"].strip()
    except httpx.HTTPStatusError as e:
        if e.response.status_code == 404 and MODEL != AI_MODEL:
            print(f"⚠  llama3 not found — falling back to {AI_MODEL}")
            payload["model"] = AI_MODEL
            async with httpx.AsyncClient(timeout=timeout) as c:
                r = await c.post(OLLAMA_URL, json=payload)
                r.raise_for_status()
            return r.json()["response"].strip()
        raise