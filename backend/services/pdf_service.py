# services/pdf_service.py

import pdfplumber


def extract_text_from_pdf(file_path: str) -> str:
    """
    Extract all text from a PDF file.

    Args:
        file_path: Absolute or relative path to the PDF.

    Returns:
        Concatenated text from every page, stripped of leading/trailing whitespace.

    Raises:
        FileNotFoundError: if *file_path* does not exist.
        pdfplumber.exceptions.PDFSyntaxError: if the file is not a valid PDF.
    """
    text_parts: list[str] = []

    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text_parts.append(page_text)

    return "\n\n".join(text_parts).strip()