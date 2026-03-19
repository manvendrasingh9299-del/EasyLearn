# models/summary_model.py

from datetime import datetime, timezone
from typing import List, Optional

from pydantic import BaseModel, Field


class SummaryResponse(BaseModel):
    """Structured AI-generated summary returned to the client."""

    topic: str = Field(..., description="The main topic of the uploaded content.")
    important_points: List[str] = Field(
        ..., description="Key bullet points from the content."
    )
    key_concepts: List[str] = Field(
        ..., description="Important terms or concepts to remember."
    )
    simple_explanation: str = Field(
        ..., description="Plain-language explanation suitable for any student."
    )
    exam_summary: str = Field(
        ..., description="Concise exam-ready summary of the whole content."
    )


class SummaryDocument(BaseModel):
    """Document stored in MongoDB."""

    filename: str
    summary: str
    structured: Optional[SummaryResponse] = None
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    