# services/image_service.py

from PIL import Image, ImageOps
import pytesseract

# Tesseract tuned for study notes / documents:
#   --psm 6  : assume a single uniform block of text (works well for pages/notes)
#   --oem 3  : default OCR engine (LSTM neural net)
_TESSERACT_CONFIG = "--psm 6 --oem 3"

# Upscale small images so the short edge is at least this many pixels.
# Phone photos of notes are often too low-res for Tesseract to read reliably.
_MIN_SHORT_EDGE = 1400

# Binarization threshold (0-255). Pixels below this become black; above -> white.
_BINARIZE_THRESHOLD = 150


def _preprocess(image: Image.Image) -> Image.Image:
    """Clean up an image so Tesseract produces far more accurate text.

    Steps:
      1. Normalise colour mode (drop alpha / palette modes).
      2. Upscale small images (helps with phone snaps of handwritten notes).
      3. Convert to grayscale.
      4. Auto-contrast to stretch the tonal range.
      5. Binarise (black/white) to drop paper texture / background noise.
    """
    # 1. Normalise mode
    if image.mode not in ("RGB", "L"):
        image = image.convert("RGB")

    # 2. Upscale if the short edge is small
    width, height = image.size
    short_edge = min(width, height)
    if short_edge < _MIN_SHORT_EDGE:
        scale = _MIN_SHORT_EDGE / short_edge
        image = image.resize(
            (int(width * scale), int(height * scale)), Image.LANCZOS
        )

    # 3. Grayscale + 4. auto-contrast
    image = ImageOps.autocontrast(ImageOps.grayscale(image), cutoff=1)

    # 5. Binarise — drops coffee-stain / paper-texture noise
    image = image.point(lambda px: 0 if px < _BINARIZE_THRESHOLD else 255)

    return image


def extract_text_from_pil(image: Image.Image) -> str:
    """OCR a PIL image directly (used for scanned-PDF pages)."""
    image = _preprocess(image)
    text = pytesseract.image_to_string(image, config=_TESSERACT_CONFIG)
    return text.strip()


def extract_text_from_image(file_path: str) -> str:
    """
    Extract text from an image file using OCR (Tesseract).

    Applies lightweight preprocessing (upscale, grayscale, autocontrast,
    binarization) so phone photos of notes produce much better results than
    raw pixels.

    Args:
        file_path: Path to the image file (JPG, PNG, etc.)

    Returns:
        Extracted text, stripped of leading/trailing whitespace.

    Raises:
        FileNotFoundError: if the file does not exist.
        pytesseract.TesseractNotFoundError: if Tesseract is not installed.
    """
    image = Image.open(file_path)
    return extract_text_from_pil(image)