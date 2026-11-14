from typing import List

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from api.deps import get_db
from db.models import ResearchPaper
from schemas.research_paper import ResearchPaperResponse


router = APIRouter()


@router.get("/", response_model=List[ResearchPaperResponse])
def get_research_papers(db: Session = Depends(get_db)):
    """Retrieve all academic publications ordered by publication date."""
    papers = (
        db.query(ResearchPaper)
        .order_by(ResearchPaper.publication_date.desc().nullslast())
        .all()
    )
    return papers
