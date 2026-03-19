# services/pipeline_service.py

import os
import asyncio
from datetime import datetime, timezone

from database import summary_collection
from services.pdf_service import extract_text_from_pdf
from services.image_service import extract_text_from_image
from services.chunk_service import chunk_text
from services.ai_service import generate_chunk_summary, generate_final_summary

SUPPORTED_IMAGE_EXTENSIONS = {"png", "jpg", "jpeg", "webp"}
SUPPORTED_PDF_EXTENSIONS = {"pdf"}


def _get_extension(filename: str) -> str:
    return filename.rsplit(".", 1)[-1].lower() if "." in filename else ""


def _extract_text(file_path: str, filename: str) -> str:
    ext = _get_extension(filename)
    if ext in SUPPORTED_PDF_EXTENSIONS:
        return extract_text_from_pdf(file_path)
    elif ext in SUPPORTED_IMAGE_EXTENSIONS:
        return extract_text_from_image(file_path)
    else:
        raise ValueError(f"Unsupported file type: .{ext}")


async def _extract_text_async(file_path: str, filename: str) -> str:
    loop = asyncio.get_event_loop()
    return await loop.run_in_executor(None, _extract_text, file_path, filename)


async def process_multiple_files(files: list[tuple[str, str]]) -> dict:
    """
    Process multiple files as ONE combined study session.

    Pipeline:
    1. Extract text from all files concurrently.
    2. Merge all text together.
    3. Chunk the merged text.
    4. Summarise each chunk SEQUENTIALLY (prevents Ollama timeout overload).
    5. Generate ONE final high-quality summary from all chunk summaries.
    6. Save to MongoDB.
    7. Delete temp files.
    """
    file_names = [fn for _, fn in files]

    # Step 1: Extract text from all files concurrently
    extraction_results = await asyncio.gather(
        *[_extract_text_async(fp, fn) for fp, fn in files],
        return_exceptions=True,
    )

    # Step 2: Collect results, track per-file status
    all_texts: list[str] = []
    file_statuses: list[dict] = []

    for (_, filename), result in zip(files, extraction_results):
        if isinstance(result, Exception):
            file_statuses.append({
                "filename": filename,
                "extracted": False,
                "error": str(result),
            })
        elif not result or not result.strip():
            file_statuses.append({
                "filename": filename,
                "extracted": False,
                "error": "No readable text found.",
            })
        else:
            all_texts.append(f"--- From: {filename} ---\n{result}")
            file_statuses.append({
                "filename": filename,
                "extracted": True,
                "error": None,
            })

    if not all_texts:
        raise ValueError("No readable text could be extracted from any uploaded file.")

    # Step 3: Merge and chunk
    merged_text = "\n\n".join(all_texts)
    chunks = chunk_text(merged_text)

    print(f"📄 Total chunks to process: {len(chunks)}")

    # Step 4: Process chunks SEQUENTIALLY — avoids hammering Ollama in parallel
    # which caused the 2m timeout crash on large PDFs
    chunk_summaries: list[str] = []
    for i, chunk in enumerate(chunks):
        print(f"  ⚙️  Processing chunk {i + 1}/{len(chunks)}...")
        summary = await generate_chunk_summary(chunk)
        chunk_summaries.append(summary)

    # Step 5: Generate ONE final structured summary
    print("✨ Generating final summary...")
    merged_chunks = "\n\n".join(chunk_summaries)
    final_summary = await generate_final_summary(merged_chunks)

    # Step 6: Save to MongoDB
    await summary_collection.insert_one({
        "filenames": file_names,
        "file_count": len(files),
        "summary": final_summary,
        "file_statuses": file_statuses,
        "created_at": datetime.now(timezone.utc),
    })

    # Step 7: Clean up temp files
    for file_path, _ in files:
        try:
            os.remove(file_path)
        except OSError:
            pass

    return {
        "filenames": file_names,
        "summary": final_summary,
        "file_statuses": file_statuses,
    }
