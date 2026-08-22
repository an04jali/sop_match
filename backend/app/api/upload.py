from fastapi import APIRouter, UploadFile, File, HTTPException

from app.services.ingest import ingest_document
from app.services.structural import StructuralAnalyzer


router = APIRouter()

ALLOWED_EXTENSIONS = {".pdf", ".docx"}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    # 1. Check filename
    if not file.filename:
        raise HTTPException(
            status_code=400,
            detail="Please select a file."
        )

    filename = file.filename.lower()

    # 2. Check extension
    if not any(filename.endswith(ext) for ext in ALLOWED_EXTENSIONS):
        raise HTTPException(
            status_code=400,
            detail="Only PDF and DOCX files are supported."
        )

    # 3. Read file
    file_content = await file.read()

    # 4. Check file size
    if len(file_content) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=413,
            detail="File size must be less than 10 MB."
        )

    # 5. Check empty file
    if len(file_content) == 0:
        raise HTTPException(
            status_code=400,
            detail="The uploaded file is empty."
        )

    # Reset file pointer so ingest_document can read it
    await file.seek(0)

    try:
        # 6. Extract text
        text = ingest_document(
            file.file,
            file.filename
        )

    except Exception:
        raise HTTPException(
            status_code=400,
            detail="Could not read this file. Please upload a valid PDF or DOCX."
        )

    # 7. Check extracted text
    if not text or not text.strip():
        raise HTTPException(
            status_code=400,
            detail="No readable text was found in the uploaded file."
        )

    # 8. Structural analysis
    try:
        analysis = StructuralAnalyzer(text)

        return {
            "filename": file.filename,

            "characters": analysis.character_count(),

            "words": analysis.word_count(),

            "paragraphs": analysis.paragraph_count(),

            "sentences": analysis.sentence_count(),

            "reading_time": analysis.reading_time(),

            "average_sentence_length": analysis.average_sentence_length(),

            "analysis": {
                "opening_strength": analysis.opening_strength(),
                "closing_strength": analysis.closing_strength(),
                "paragraph_balance": analysis.paragraph_balance(),
                "cliches": analysis.detect_cliches()
            },

            "text": text
        }

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="The file was uploaded, but structural analysis failed."
        )