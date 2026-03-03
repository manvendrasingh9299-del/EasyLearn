# routers/summary_router.py

from fastapi import APIRouter, UploadFile, File
import shutil
import os
from services.pipeline_service import process_pdf

router = APIRouter()

UPLOAD_DIR = "uploads"
os.makedirs(UPLOAD_DIR, exist_ok=True)


@router.post("/upload")
async def upload_pdf(file: UploadFile = File(...)):
    file_path = os.path.join(UPLOAD_DIR, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    result = await process_pdf(file_path)

    return {"summary": result}