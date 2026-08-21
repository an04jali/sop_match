from app.utils.parser import extract_pdf_text, extract_docx_text


def ingest_document(file, filename):

    filename = filename.lower()

    if filename.endswith(".pdf"):
        return extract_pdf_text(file)

    elif filename.endswith(".docx"):
        return extract_docx_text(file)

    else:
        raise ValueError("Unsupported file format")