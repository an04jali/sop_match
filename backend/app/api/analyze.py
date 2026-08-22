import json

from fastapi import APIRouter, UploadFile, File, Form, Depends
from sqlalchemy.orm import Session

from app.services.ingest import ingest_document
from app.services.structural import StructuralAnalyzer
from app.services.dimensions import DimensionScorer
from app.services.weakest import WeakestParagraphFinder

from app.db import get_db
from app.models_db import Analysis, User
from app.dependencies import get_current_user


router = APIRouter()


@router.post("/analyze")
async def analyze_sop(
    file: UploadFile = File(...),
    university: str | None = Form(default=None),
    program: str | None = Form(default=None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    # 1. Extract text
    text = ingest_document(
        file.file,
        file.filename
    )

    # 2. Structural analysis
    structural = StructuralAnalyzer(text)

    structural_result = {
        "characters": structural.character_count(),
        "words": structural.word_count(),
        "paragraphs": structural.paragraph_count(),
        "sentences": structural.sentence_count(),
        "reading_time": structural.reading_time(),
        "average_sentence_length": structural.average_sentence_length(),
        "opening_strength": structural.opening_strength(),
        "closing_strength": structural.closing_strength(),
        "paragraph_balance": structural.paragraph_balance(),
        "cliches": structural.detect_cliches()
    }

    # 3. AI dimension scoring
    scorer = DimensionScorer(text)
    dimension_results = scorer.score_all()

    # 4. Overall score
    overall_score = scorer.overall_score(
        dimension_results
    )

    # 5. Weakest dimension
    weakest_dimension = scorer.weakest_dimension(
        dimension_results
    )

    # 6. Get evidence from weakest dimension
    weakest_result = dimension_results.get(
        weakest_dimension,
        {}
    )

    evidence = weakest_result.get(
        "evidence",
        []
    )

    # 7. Find weakest paragraph
    paragraph_finder = WeakestParagraphFinder(text)

    weakest_paragraph = paragraph_finder.find(
        evidence
    )

    response_data = {
        "filename": file.filename,
        "essay": text,
        "structural": structural_result,
        "dimensions": dimension_results,
        "overall_score": overall_score,
        "weakest_dimension": weakest_dimension,
        "weakest_paragraph": weakest_paragraph
    }

    # 8. Save analysis to history
    #    Linked to the currently logged-in user
    record = Analysis(
        user_id=current_user.id,
        filename=file.filename,
        university=university,
        program=program,
        overall_score=overall_score,
        weakest_dimension=weakest_dimension,
        word_count=structural_result.get("words"),
        analysis_json=json.dumps(response_data)
    )

    db.add(record)
    db.commit()
    db.refresh(record)

    # 9. Return database ID
    response_data["id"] = record.id

    return response_data