from pathlib import Path
import fitz


def extract_text(pdf_path):

    pdf_path = Path(pdf_path)

    if not pdf_path.exists():
        raise FileNotFoundError(pdf_path)

    text = ""

    with fitz.open(pdf_path) as doc:
        for page in doc:
            text += page.get_text()

    return text