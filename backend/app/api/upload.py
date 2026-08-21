from fastapi import APIRouter, UploadFile, File

from app.services.ingest import ingest_document
from app.services.structural import StructuralAnalyzer

router = APIRouter()


@router.post("/upload")
async def upload_file(file: UploadFile = File(...)):

    text = ingest_document(file.file, file.filename)

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