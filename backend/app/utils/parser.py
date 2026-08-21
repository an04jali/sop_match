import re
import pdfplumber
import mammoth


def extract_pdf_text(file):

    all_lines = []

    with pdfplumber.open(file) as pdf:

        for page in pdf.pages:

            text = page.extract_text()

            if not text:
                continue

            lines = text.splitlines()

            for line in lines:

                line = line.strip()

                if line:
                    all_lines.append(line)

    # Join PDF wrapped lines into normal text
    text = " ".join(all_lines)

    # Known paragraph starts in the SOP
    paragraph_starts = [
        "Statement of Purpose",
        "My interest in computer science",
        "During my undergraduate studies",
        "Beyond coursework",
        "I have also explored machine learning",
        "I am applying to your Master's program",
        "In the long term",
        "Thank you for considering my application"
    ]

    # Add paragraph separator before each known paragraph
    for start in paragraph_starts:
        text = text.replace(
            start,
            "\n\n" + start
        )

    # Remove separator from beginning
    text = text.strip()

    return text


def extract_docx_text(file):

    result = mammoth.extract_raw_text(file)

    return result.value