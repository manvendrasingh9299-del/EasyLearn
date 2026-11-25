# services/chunk_service.py

import re

from config import CHUNK_SIZE

# Split on sentence boundaries (. ! ? followed by whitespace) so chunks end
# at natural pauses rather than mid-sentence / mid-word.
_SENTENCE_SPLIT = re.compile(r"(?<=[.!?])\s+")


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE) -> list[str]:
    """
    Split *text* into chunks of at most *chunk_size* words.

    Unlike a naive word-split, this breaks at sentence boundaries first, so
    each chunk stays coherent (no mid-sentence cuts). If a single sentence is
    still longer than *chunk_size*, it is hard-split by words as a fallback.

    Empty or whitespace-only input returns an empty list.
    """
    if not text or not text.strip():
        return []

    # ── Step 1: break into sentences ────────────────────────────────────
    sentences = [s.strip() for s in _SENTENCE_SPLIT.split(text) if s.strip()]

    # ── Step 2: greedily pack sentences into chunks ≤ chunk_size words ──
    chunks: list[str] = []
    current: list[str] = []
    current_len = 0

    for sentence in sentences:
        sentence_words = sentence.split()
        sentence_len = len(sentence_words)

        # A single oversized sentence can't fit — flush current chunk first
        if current and current_len + sentence_len > chunk_size:
            chunks.append(" ".join(current))
            current = []
            current_len = 0

        # Oversized sentence: hard-split it by words
        if sentence_len > chunk_size:
            for i in range(0, len(sentence_words), chunk_size):
                chunks.append(" ".join(sentence_words[i : i + chunk_size]))
            continue

        current.append(sentence)
        current_len += sentence_len

    if current:
        chunks.append(" ".join(current))

    return chunks
