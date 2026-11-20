from sqlalchemy import func, select

from db.models import ResearchPaper
from scripts.seed_research_papers import (
    PublicationRecord,
    ECOSIMULATE_SLUG,
    seed_ecosimulate_paper,
)


def make_record(title="Test Research Manuscript"):
    return PublicationRecord(
        title=title,
        abstract="Synthetic metadata for integration testing.",
    )


def test_seed_research_paper(db_session):
    paper_id = seed_ecosimulate_paper(
        db_session,
        make_record(),
    )

    paper = db_session.get(ResearchPaper, paper_id)

    assert paper is not None
    assert paper.slug == ECOSIMULATE_SLUG
    assert paper.title == "Test Research Manuscript"
    assert paper.doi is None


def test_seed_is_idempotent(db_session):
    first_id = seed_ecosimulate_paper(
        db_session,
        make_record(),
    )

    second_id = seed_ecosimulate_paper(
        db_session,
        make_record(),
    )

    count = db_session.scalar(
        select(func.count())
        .select_from(ResearchPaper)
        .where(ResearchPaper.slug == ECOSIMULATE_SLUG)
    )

    assert first_id == second_id
    assert count == 1


def test_seed_updates_existing_publication(db_session):
    first_id = seed_ecosimulate_paper(
        db_session,
        make_record("Original Title"),
    )

    second_id = seed_ecosimulate_paper(
        db_session,
        make_record("Revised Title"),
    )

    paper = db_session.get(ResearchPaper, second_id)

    assert first_id == second_id
    assert paper.title == "Revised Title"
