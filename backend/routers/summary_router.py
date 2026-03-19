# routers/summary_router.py

import os
import uuid
from typing import List

from fastapi import APIRouter, File, HTTPException, UploadFile, status

from config import UPLOAD_DIR, MAX_FILE_SIZE_MB, ALLOWED_EXTENSIONS
from services.pipeline_service import process_multiple_files
from database import summary_collection

router = APIRouter()

os.makedirs(UPLOAD_DIR, exist_ok=True)

_MAX_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _validate_extension(filename: str) -> str:
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail=f"'.{ext}' is not supported. Allowed: {sorted(ALLOWED_EXTENSIONS)}",
        )
    return ext


async def _save_upload(file: UploadFile) -> str:
    """Stream an upload to disk and return the saved file path."""
    safe_name = f"{uuid.uuid4().hex}_{file.filename}"
    file_path = os.path.join(UPLOAD_DIR, safe_name)

    written = 0
    with open(file_path, "wb") as buffer:
        while chunk := await file.read(1024 * 256):
            written += len(chunk)
            if written > _MAX_BYTES:
                buffer.close()
                os.remove(file_path)
                raise HTTPException(
                    status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                    detail=f"'{file.filename}' exceeds the {MAX_FILE_SIZE_MB} MB limit.",
                )
            buffer.write(chunk)

    return file_path


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@router.post(
    "/upload",
    summary="Upload one or more PDFs/images and get a single combined AI summary.",
    status_code=status.HTTP_200_OK,
)
async def upload_files(files: List[UploadFile] = File(...)):
    """
    Upload multiple files (PDFs and/or images). All files are treated as one
    study session — the AI reads everything together and produces a single
    unified, structured summary.
    """
    if not files:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="No files provided.",
        )

    # Validate all extensions before saving anything
    for file in files:
        _validate_extension(file.filename or "")

    # Save all files to disk
    saved: list[tuple[str, str]] = []
    try:
        for file in files:
            file_path = await _save_upload(file)
            saved.append((file_path, file.filename or "unknown"))
    except HTTPException:
        for fp, _ in saved:
            if os.path.exists(fp):
                os.remove(fp)
        raise

    try:
        result = await process_multiple_files(saved)
    except ValueError as exc:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=str(exc),
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Processing failed: {exc}",
        )

    # Count extraction outcomes
    succeeded = sum(1 for s in result["file_statuses"] if s["extracted"])
    failed = sum(1 for s in result["file_statuses"] if not s["extracted"])

    return {
        "total_files": len(files),
        "extracted_successfully": succeeded,
        "extraction_failed": failed,
        "file_statuses": result["file_statuses"],
        "summary": result["summary"],
    }


@router.get(
    "/summaries",
    summary="Retrieve stored summaries.",
)
async def get_summaries(limit: int = 20, skip: int = 0):
    """Return the most recently created summaries from MongoDB."""
    cursor = (
        summary_collection.find({}, {"_id": 0})
        .sort("created_at", -1)
        .skip(skip)
        .limit(limit)
    )
    results = await cursor.to_list(length=limit)
    return {"total": len(results), "summaries": results}


@router.delete(
    "/summaries/{filename}",
    summary="Delete a summary by filename.",
)
async def delete_summary(filename: str):
    """Delete a stored summary by filename."""
    result = await summary_collection.delete_one({"filenames": filename})
    if result.deleted_count == 0:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No summary found for '{filename}'.",
        )
    return {"message": f"Summary for '{filename}' deleted."}
