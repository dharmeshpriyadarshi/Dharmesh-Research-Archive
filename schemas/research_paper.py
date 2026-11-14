from pydantic import BaseModel, ConfigDict
from uuid import UUID
from datetime import datetime
from typing import Optional


class ResearchPaperResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    abstract: str
    journal_or_conference: Optional[str] = None
    publication_date: Optional[datetime] = None
    pdf_url: Optional[str] = None
    doi: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)
