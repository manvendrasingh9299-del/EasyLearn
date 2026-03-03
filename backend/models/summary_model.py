# models/summary_model.py

from pydantic import BaseModel
from typing import List

class SummaryResponse(BaseModel):
    topic: str
    important_points: List[str]
    key_concepts: List[str]
    simple_explanation: str
    exam_summary: str