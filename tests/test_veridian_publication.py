"""Task 16F: unpublished Veridian manuscript remains independent and identifiable."""
from pathlib import Path

from db.models import ResearchPaper
from scripts.seed_research_papers import (
    PublicationRecord, seed_publication, ECOSIMULATE_SLUG,
)

VERIDIAN_SLUG = "veridian-aqi-research-manuscript"
METADATA = Path(__file__).resolve().parents[1] / "scripts/data/veridian_manuscript.json"


def manuscript_record() -> PublicationRecord:
    return PublicationRecord.model_validate_json(METADATA.read_text(encoding="utf-8"))


def test_veridian_manuscript_metadata_is_academically_conservative():
    record = manuscript_record()
    assert record.publication_status == "Publication in progress"
    assert record.journal_or_conference is None
    assert record.doi is None
    assert record.publication_date is None
    assert record.pdf_url is None
    assert record.authors == []  # Author byline not verified for this draft.
    assert "28.10" in record.content and "42.53" in record.content


def test_veridian_seed_preserves_separate_identity(db_session):
    published_id = seed_publication(db_session, ECOSIMULATE_SLUG, PublicationRecord(
        title="Published fixture", abstract="Test only", publication_status="Published",
    ))
    veridian_id = seed_publication(db_session, VERIDIAN_SLUG, manuscript_record())
    second_id = seed_publication(db_session, VERIDIAN_SLUG, manuscript_record())
    assert second_id == veridian_id != published_id
    row = db_session.get(ResearchPaper, veridian_id)
    assert row.slug == VERIDIAN_SLUG
    assert row.publication_status == "Publication in progress"
    assert row.doi is None


def test_veridian_manuscript_api_is_linkable_without_publisher_claim(client, db_session):
    paper_id = seed_publication(db_session, VERIDIAN_SLUG, manuscript_record())
    db_session.commit()
    summary = client.get("/api/research-papers/")
    assert summary.status_code == 200
    row = next(p for p in summary.json() if p["slug"] == VERIDIAN_SLUG)
    assert row["id"] == str(paper_id)
    assert row["publication_status"] == "Publication in progress"
    assert row["doi"] is None and row["pdf_url"] is None
    assert row["journal_or_conference"] is None and row["publication_date"] is None
    assert "content" not in row
    detail = client.get("/api/research-papers/" + VERIDIAN_SLUG)
    assert detail.status_code == 200
    assert "## Held-out forecasting performance" in detail.json()["content"]
