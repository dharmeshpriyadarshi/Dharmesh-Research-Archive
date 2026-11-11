# db/models.py
import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Enum
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
    repository_url = Column(String(255), nullable=True)
    status = Column(Enum("In Progress", "Completed", "Deployed", name="project_status"), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    components = relationship("TechComponent", back_populates="project", cascade="all, delete-orphan")
    metrics = relationship("ProjectMetric", back_populates="project", cascade="all, delete-orphan")

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