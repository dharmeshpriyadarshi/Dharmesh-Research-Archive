from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, defer

from api.deps import get_db
from db.models import ResearchPaper
from schemas.publication_detail import PublicationDetail, PublicationSummary

router = APIRouter()


@router.get("/", response_model=list[PublicationSummary])
def get_research_papers(db: Session = Depends(get_db)):
    """Retrieve publication summaries without loading detailed research content."""
    return (
        db.query(ResearchPaper)
        .options(defer(ResearchPaper.content))
        .order_by(ResearchPaper.publication_date.desc().nullslast(), ResearchPaper.slug)
        .all()
    )


@router.get("/{slug}", response_model=PublicationDetail)
def get_research_paper_by_slug(slug: str, db: Session = Depends(get_db)):
    """Retrieve the detailed academic record for a publication."""
    paper = db.query(ResearchPaper).filter(ResearchPaper.slug == slug).first()
    if paper is None:
        raise HTTPException(status_code=404, detail="Publication not found")
    return paper
