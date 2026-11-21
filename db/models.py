# db/models.py
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum, CheckConstraint
from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import DeclarativeBase, relationship

class Base(DeclarativeBase):
    pass

class Project(Base):
    __tablename__ = "projects"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    abstract = Column(Text, nullable=False)
    content = Column(
        Text,
        nullable=False,
        server_default="Detailed methodology pending."
    )
    repository_url = Column(String(255), nullable=True)
    status = Column(Enum("In Progress", "Completed", "Deployed", "Planned", name="project_status"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    components = relationship("TechComponent", back_populates="project", cascade="all, delete-orphan")
    metrics = relationship("ProjectMetric", back_populates="project", cascade="all, delete-orphan")

class ResearchPaper(Base):
    __tablename__ = "research_papers"
    __table_args__ = (
        CheckConstraint(
            "publication_status IN ('Published', 'Publication in progress', 'Unspecified')",
            name="ck_research_papers_publication_status",
        ),
    )

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4, index=True)
    title = Column(String(255), nullable=False)
    slug = Column(String(255), unique=True, index=True, nullable=False)
    abstract = Column(Text, nullable=False)
    journal_or_conference = Column(String(255), nullable=True)
    publication_date = Column(DateTime(timezone=True), nullable=True)
    pdf_url = Column(Text, nullable=True)
    doi = Column(String(100), nullable=True)
    authors = Column(JSONB, nullable=False, default=list, server_default="[]")
    content = Column(Text, nullable=True)
    publication_status = Column(String(32), nullable=False, server_default="Unspecified")

class TechComponent(Base):
    __tablename__ = "tech_components"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    category = Column(Enum("Language", "Framework", "Database", "Infrastructure", name="tech_category"), nullable=False)
    name = Column(String(100), nullable=False)
    version = Column(String(50), nullable=True)

    project = relationship("Project", back_populates="components")

class ProjectMetric(Base):
    __tablename__ = "project_metrics"

    id = Column(Integer, primary_key=True, index=True)
    project_id = Column(UUID(as_uuid=True), ForeignKey("projects.id", ondelete="CASCADE"), nullable=False)
    metric_type = Column(String(100), nullable=False)
    metric_data = Column(JSONB, nullable=False)

    project = relationship("Project", back_populates="metrics")
