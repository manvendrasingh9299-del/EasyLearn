# services/image_service.py

from PIL import Image
import pytesseract


def extract_text_from_image(file_path: str) -> str:
    """
    Extract text from an image file using OCR (Tesseract).

    Args:
        file_path: Path to the image file (JPG, PNG, etc.)

    Returns:
        Extracted text, stripped of leading/trailing whitespace.

    Raises:
        FileNotFoundError: if the file does not exist.
        pytesseract.TesseractNotFoundError: if Tesseract is not installed.
    """
    image = Image.open(file_path)

    # Convert to RGB if needed (e.g. RGBA PNGs)
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")

    text = pytesseract.image_to_string(image)
    return text.strip()