
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.routes import projects
from core.config import settings


app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Academic Portfolio API for Data Science and Backend Architecture",
    version="1.0.0"
)

# Explicitly permitted frontend origins
origins = list(dict.fromkeys([
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    settings.FRONTEND_ORIGIN.rstrip("/")
]))

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
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
