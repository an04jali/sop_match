import json
from datetime import datetime, timezone

from sqlalchemy import Column, Integer, String, Float, Text, DateTime

from app.db import Base


class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)

    filename = Column(String, nullable=True)
    university = Column(String, nullable=True)
    program = Column(String, nullable=True)

    overall_score = Column(Float, nullable=True)
    weakest_dimension = Column(String, nullable=True)
    word_count = Column(Integer, nullable=True)

    created_at = Column(
        DateTime,
        default=lambda: datetime.now(timezone.utc)
    )

    # Full JSON blobs
    analysis_json = Column(Text, nullable=True)
    improve_json = Column(Text, nullable=True)
    full_improve_json = Column(Text, nullable=True)

    def to_summary(self):
        return {
            "id": self.id,
            "filename": self.filename,
            "university": self.university,
            "program": self.program,
            "overall_score": self.overall_score,
            "weakest_dimension": self.weakest_dimension,
            "word_count": self.word_count,
            "created_at": (
                self.created_at.isoformat()
                if self.created_at else None
            ),
        }

    def to_full(self):
        data = self.to_summary()
        data["analysis"] = (
            json.loads(self.analysis_json)
            if self.analysis_json else None
        )
        data["improvement"] = (
            json.loads(self.improve_json)
            if self.improve_json else None
        )
        data["full_improvement"] = (
            json.loads(self.full_improve_json)
            if self.full_improve_json else None
        )
        return data