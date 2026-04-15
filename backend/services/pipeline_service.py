# services/pipeline_service.py
#
# Speed optimisations vs original:
#   1. CHUNK_SIZE raised to 3000 words → far fewer chunks → far fewer Llama calls
#   2. If text fits in one chunk, skip chunk stage entirely (single-pass)
#   3. Chunk summaries run concurrently when there are multiple chunks
#   4. merged_chunks capped at 6000 words before final summary call

import os
import asyncio
from datetime import datetime, timezone

from database import summary_collection
from services.pdf_service import extract_text_from_pdf
from services.image_service import extract_text_from_image
from services.chunk_service import chunk_text
from services.ai_service import generate_chunk_summary, generate_final_summary

SUPPORTED_IMAGE_EXT = {"png", "jpg", "jpeg", "webp"}
SUPPORTED_PDF_EXT   = {"pdf"}

# Larger chunks = fewer AI calls = much faster.
# 3000 words ≈ ~2200 tokens — comfortably within llama3's 4096 context.
FAST_CHUNK_SIZE = 4000   # 9-page PDF (~4500 words) = 2 chunks max

# Cap the merged facts sent to the final summary call.
# Beyond ~6000 words the model sees diminishing returns and slows down.
MERGE_CAP_WORDS = 4000   # Keep final prompt input tight for 3b model speed


def _get_ext(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def _extract(file_path: str, filename: str) -> str:
    ext = _get_ext(filename)
    if ext in SUPPORTED_PDF_EXT:
        return extract_text_from_pdf(file_path)
    if ext in SUPPORTED_IMAGE_EXT:
        return extract_text_from_image(file_path)
    raise ValueError(f"Unsupported file type: .{ext}")


async def _extract_async(file_path: str, filename: str) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _extract, file_path, filename)


async def process_multiple_files(files: list[tuple[str, str]]) -> dict:
    """
    Fast pipeline:
    1. Extract text from all files concurrently.
    2. Merge all text.
    3a. If text fits in one chunk → send directly to final summary (skip chunk stage).
    3b. If multiple chunks needed → summarise chunks CONCURRENTLY, then merge.
    4. Generate final structured summary.
    5. Save to MongoDB.
    6. Delete temp files.
    """
    file_names = [fn for _, fn in files]

    # ── Step 1: Extract text concurrently ─────────────────────────────────────
    results = await asyncio.gather(
        *[_extract_async(fp, fn) for fp, fn in files],
        return_exceptions=True,
    )

    all_texts: list[str] = []
    file_statuses: list[dict] = []

    for (_, filename), result in zip(files, results):
        if isinstance(result, Exception) or not (result or "").strip():
            file_statuses.append({
                "filename": filename,
                "extracted": False,
                "error": str(result) if isinstance(result, Exception) else "No readable text found.",
            })
        else:
            all_texts.append(f"--- {filename} ---\n{result}")
            file_statuses.append({"filename": filename, "extracted": True, "error": None})

    if not all_texts:
        raise ValueError("No readable text could be extracted from any uploaded file.")

    merged_text = "\n\n".join(all_texts)
    word_count  = len(merged_text.split())
    print(f"📄 Extracted {word_count} words from {len(all_texts)} file(s)")

    # ── Step 2: Route based on text length ────────────────────────────────────
    if word_count <= FAST_CHUNK_SIZE:
        # Short document — single pass, no chunking needed
        print("⚡ Single-pass summary (document fits in one call)")
        content_for_summary = merged_text
    else:
        # Long document — chunk, summarise concurrently, merge
        chunks = chunk_text(merged_text, chunk_size=FAST_CHUNK_SIZE)
        print(f"📦 {len(chunks)} chunk(s) — summarising concurrently...")

        # Run all chunk summaries at the same time
        chunk_facts = await asyncio.gather(
            *[generate_chunk_summary(chunk) for chunk in chunks]
        )

        # Cap merged facts to avoid overloading the final call
        merged_facts = "\n\n".join(chunk_facts)
        words = merged_facts.split()
        if len(words) > MERGE_CAP_WORDS:
            merged_facts = " ".join(words[:MERGE_CAP_WORDS])
            print(f"✂️  Capped merged facts to {MERGE_CAP_WORDS} words")

        content_for_summary = merged_facts

    # ── Step 3: Final structured summary ──────────────────────────────────────
    print("✨ Generating final summary...")
    final_summary = await generate_final_summary(content_for_summary)

    # ── Step 4: Save to MongoDB ────────────────────────────────────────────────
    await summary_collection.insert_one({
        "filenames":     file_names,
        "file_count":    len(files),
        "summary":       final_summary,
        "file_statuses": file_statuses,
        "created_at":    datetime.now(timezone.utc),
    })

    # ── Step 5: Delete temp files ──────────────────────────────────────────────
    for file_path, _ in files:
        try:
            os.remove(file_path)
        except OSError:
            pass

    return {
        "filenames":     file_names,
        "summary":       final_summary,
        "file_statuses": file_statuses,
    }