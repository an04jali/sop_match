import json

from fastapi import APIRouter, Depends
from pydantic import BaseModel
from sqlalchemy.orm import Session

from app.services.improvement import ImprovementService
from app.db import get_db
from app.models_db import Analysis

router = APIRouter()


class ImprovementRequest(BaseModel):
    essay: str
    weakest_dimension: str
    weakest_paragraph: str
    evidence: list[str]
    reason: str
    university: str | None = None
    program: str | None = None
    analysis_id: int | None = None


class FullImprovementRequest(BaseModel):
    essay: str
    university: str | None = None
    program: str | None = None
    analysis_id: int | None = None


@router.post("/improve")
async def improve_sop(
    request: ImprovementRequest,
    db: Session = Depends(get_db)
):
    service = ImprovementService(
        essay=request.essay,
        weakest_dimension=request.weakest_dimension,
        weakest_paragraph=request.weakest_paragraph,
        evidence=request.evidence,
        reason=request.reason,
        university=request.university,
        program=request.program
    )
    result = service.generate_improvement()

    if request.analysis_id:
        record = (
            db.query(Analysis)
            .filter(Analysis.id == request.analysis_id)
            .first()
        )
        if record:
            record.improve_json = json.dumps(result)
            db.commit()

    return result


@router.post("/improve-full")
async def improve_full_sop(
    request: FullImprovementRequest,
    db: Session = Depends(get_db)
):
    service = ImprovementService(
        essay=request.essay,
        weakest_dimension="",
        weakest_paragraph="",
        evidence=[],
        reason="",
        university=request.university,
        program=request.program
    )
    result = service.generate_full_improvement()

    if request.analysis_id:
        record = (
            db.query(Analysis)
            .filter(Analysis.id == request.analysis_id)
            .first()
        )
        if record:
            record.full_improve_json = json.dumps(result)
            db.commit()

    return result