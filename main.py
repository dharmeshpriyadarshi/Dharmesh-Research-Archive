
from fastapi import FastAPI

from api.routes import projects
from core.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Academic Portfolio API for Data Science and Backend Architecture",
    version="1.0.0"
)

app.include_router(
    projects.router,
    prefix="/api/projects",
    tags=["Projects"]
)


@app.get("/health")
def health_check():
    return {
        "status": "operational",
        "system": settings.PROJECT_NAME
    }

