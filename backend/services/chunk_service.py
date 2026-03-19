# services/chunk_service.py

from config import CHUNK_SIZE


def chunk_text(text: str, chunk_size: int = CHUNK_SIZE) -> list[str]:
    """
    Split *text* into non-overlapping chunks of at most *chunk_size* words.

    Empty or whitespace-only input returns an empty list.
    """
    if not text or not text.strip():
        return []

    words = text.split()
    return [
        " ".join(words[i : i + chunk_size])
        for i in range(0, len(words), chunk_size)
    ]
