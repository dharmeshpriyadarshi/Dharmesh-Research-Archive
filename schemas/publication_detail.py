"""Summary and detail contracts for academic publication records."""
from typing import Literal

from pydantic import ConfigDict
from schemas.research_paper import ResearchPaperResponse


class PublicationSummary(ResearchPaperResponse):
    model_config = ConfigDict(from_attributes=True)

    authors: list[str]
    publication_status: Literal["Published", "Publication in progress", "Unspecified"]


class PublicationDetail(PublicationSummary):
    content: str | None
