
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session, selectinload
from typing import List

from schemas.project import ProjectResponse
from db.models import Project
from api.deps import get_db

router = APIRouter()


@router.get("/", response_model=List[ProjectResponse])
def get_projects(db: Session = Depends(get_db)):
    """Retrieve all portfolio projects with optimized eager loading."""
    projects = (
        db.query(Project)
        .options(
            selectinload(Project.components),
            selectinload(Project.metrics)
        )
        .all()
    )
    return projects


@router.get("/{slug}", response_model=ProjectResponse)
def get_project_by_slug(slug: str, db: Session = Depends(get_db)):
    """Retrieve a specific project by its routing slug with eager loading."""
    project = (
        db.query(Project)
        .options(
            selectinload(Project.components),
            selectinload(Project.metrics)
        )
        .filter(Project.slug == slug)
        .first()
    )

    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    return project
