# services/pdf_service.py

import concurrent.futures

import pdfplumber
import pypdfium2 as pdfium

from services.image_service import extract_text_from_pil

# If a PDF yields fewer than this many characters via pdfplumber, treat it as
# a scanned / image-based PDF and OCR it page-by-page instead.
_SCANNED_TEXT_THRESHOLD = 40

# Render DPI for the OCR fallback (200 DPI is a good speed/accuracy balance).
_OCR_DPI = 200


def _extract_page_text(page) -> str:
    """Extract text from a single pdfplumber page, never raising."""
    try:
        return page.extract_text() or ""
    except Exception:
        return ""


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract all text from a PDF file.

    For text-based PDFs, uses pdfplumber with page-level parallelism.
    For scanned / image PDFs (little or no embedded text), falls back to
    rendering each page to an image and running OCR.

    Args:
        file_path: Absolute or relative path to the PDF.

    Returns:
        Concatenated text from every page, stripped of leading/trailing
        whitespace.

    Raises:
        FileNotFoundError: if *file_path* does not exist.
        pdfplumber.exceptions.PDFSyntaxError: if the file is not a valid PDF.
    """
    with pdfplumber.open(file_path) as pdf:
        pages = list(pdf.pages)

        # Parallel text extraction across pages (faster on multi-page PDFs)
        with concurrent.futures.ThreadPoolExecutor() as executor:
            page_texts = list(executor.map(_extract_page_text, pages))

    text = "\n\n".join(t for t in page_texts if t).strip()

    # Scanned PDF fallback: almost no embedded text -> OCR each page
    if len(text) < _SCANNED_TEXT_THRESHOLD:
        text = _ocr_scanned_pdf(file_path)

    return text


def _ocr_scanned_pdf(file_path: str) -> str:
    """Render each PDF page to an image and OCR it (for scanned PDFs)."""
    pdf_doc = pdfium.PdfDocument(file_path)
    try:
        page_count = len(pdf_doc)

        def _ocr_page(index: int) -> str:
            page = pdf_doc[index]
            try:
                # scale to reach ~_OCR_DPI (PDF default is 72 DPI)
                scale = _OCR_DPI / 72.0
                bitmap = page.render(scale=scale)
                try:
                    pil_image = bitmap.to_pil()
                finally:
                    bitmap.close()
                return extract_text_from_pil(pil_image)
            finally:
                page.close()

        with concurrent.futures.ThreadPoolExecutor() as executor:
            page_texts = list(executor.map(_ocr_page, range(page_count)))

    finally:
        pdf_doc.close()

    return "\n\n".join(t for t in page_texts if t).strip()