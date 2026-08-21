from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.model_db import Analysis

router = APIRouter()


@router.get("/history")
def list_history(db: Session = Depends(get_db)):
    records = (
        db.query(Analysis)
        .order_by(Analysis.created_at.desc())
        .all()
    )
    return [r.to_summary() for r in records]


@router.get("/history/{analysis_id}")
def get_history_item(analysis_id: int, db: Session = Depends(get_db)):
    record = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found."
        )

    return record.to_full()


@router.delete("/history/{analysis_id}")
def delete_history_item(analysis_id: int, db: Session = Depends(get_db)):
    record = (
        db.query(Analysis)
        .filter(Analysis.id == analysis_id)
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found."
        )

    db.delete(record)
    db.commit()

    return {"deleted": True}