from db.models import Project, ResearchPaper
from scripts.seed_research_papers import (
    ECOSIMULATE_SLUG, PublicationRecord, seed_ecosimulate_paper, seed_publication,
)


def test_publication_summary_and_detail(client, db_session):
    paper_id = seed_ecosimulate_paper(db_session, PublicationRecord(
        title="Test publication", abstract="Test abstract", authors=["Test Author"],
        publication_status="Published", content="## Methodology\n\nTest content.",
    ))
    db_session.commit()
    summary = client.get("/api/research-papers/")
    assert summary.status_code == 200
    row = next(p for p in summary.json() if p["slug"] == ECOSIMULATE_SLUG)
    assert row["id"] == str(paper_id)
    assert row["authors"] == ["Test Author"]
    assert row["publication_status"] == "Published"
    assert "content" not in row
    detail = client.get(f"/api/research-papers/{ECOSIMULATE_SLUG}")
    assert detail.status_code == 200
    assert detail.json()["content"] == "## Methodology\n\nTest content."


def test_unknown_publication_returns_404(client):
    response = client.get("/api/research-papers/missing-publication")
    assert response.status_code == 404
    assert response.json()["detail"] == "Publication not found"


def test_legacy_seed_preserves_added_publication_fields(db_session):
    first_id = seed_ecosimulate_paper(db_session, PublicationRecord(
        title="Original", abstract="Test abstract", authors=["Test Author"],
        publication_status="Published", content="Research detail",
    ))
    second_id = seed_ecosimulate_paper(db_session, PublicationRecord(
        title="Updated", abstract="Updated abstract",
    ))
    paper = db_session.get(ResearchPaper, second_id)
    assert first_id == second_id
    assert paper.title == "Updated"
    assert paper.authors == ["Test Author"]
    assert paper.content == "Research detail"
    assert paper.publication_status == "Published"


def test_pending_publication_is_separate(client, db_session):
    published_id = seed_ecosimulate_paper(db_session, PublicationRecord(
        title="Published record", abstract="Test abstract", publication_status="Published",
    ))
    pending_id = seed_publication(db_session, "test-pending-publication", PublicationRecord(
        title="Pending record", abstract="Test abstract", publication_status="Publication in progress",
        content="Manuscript summary",
    ))
    db_session.commit()
    assert published_id != pending_id
    response = client.get("/api/research-papers/test-pending-publication")
    assert response.status_code == 200
    row = response.json()
    assert row["publication_status"] == "Publication in progress"
    assert row["doi"] is None
    assert row["publication_date"] is None
    assert row["pdf_url"] is None


def test_planned_project_http_serialization(client, db_session):
    db_session.add(Project(title="Planned project", slug="api-planned-test",
                           abstract="Test only", status="Planned"))
    db_session.commit()
    response = client.get("/api/projects/")
    assert response.status_code == 200
    assert any(p["slug"] == "api-planned-test" and p["status"] == "Planned" for p in response.json())
    detail = client.get("/api/projects/api-planned-test")
    assert detail.status_code == 200
    assert detail.json()["status"] == "Planned"
