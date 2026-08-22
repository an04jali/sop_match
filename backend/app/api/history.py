from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.models_db import Analysis, User
from app.dependencies import get_current_user

router = APIRouter()


@router.get("/history")
def list_history(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    records = (
        db.query(Analysis)
        .filter(Analysis.user_id == current_user.id)
        .order_by(Analysis.created_at.desc())
        .all()
    )

    return [r.to_summary() for r in records]


@router.get("/history/{analysis_id}")
def get_history_item(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = (
        db.query(Analysis)
        .filter(
            Analysis.id == analysis_id,
            Analysis.user_id == current_user.id
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found."
        )

    return record.to_full()


@router.delete("/history/{analysis_id}")
def delete_history_item(
    analysis_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    record = (
        db.query(Analysis)
        .filter(
            Analysis.id == analysis_id,
            Analysis.user_id == current_user.id
        )
        .first()
    )

    if not record:
        raise HTTPException(
            status_code=404,
            detail="Analysis not found."
        )

    db.delete(record)
    db.commit()

    return {
        "deleted": True,
        "analysis_id": analysis_id
    }