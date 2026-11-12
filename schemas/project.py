
from pydantic import BaseModel, ConfigDict, Field
from typing import List, Optional, Any
from uuid import UUID
from datetime import datetime


class TechComponentResponse(BaseModel):
    id: int
    category: str
    name: str
    version: Optional[str] = None

    model_config = ConfigDict(from_attributes=True)


class ProjectMetricResponse(BaseModel):
    id: int
    metric_type: str
    metric_data: dict[str, Any]

    model_config = ConfigDict(from_attributes=True)


class ProjectResponse(BaseModel):
    id: UUID
    title: str
    slug: str
    abstract: str
    content: str
    repository_url: Optional[str] = None
    status: str
    created_at: datetime
    updated_at: datetime
    components: List[TechComponentResponse] = Field(default_factory=list)
    metrics: List[ProjectMetricResponse] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)
