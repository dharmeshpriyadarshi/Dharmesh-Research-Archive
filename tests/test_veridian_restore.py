from db.models import Project
from scripts.seed_portfolio import (
    build_veridian_project,
    restore_veridian,
)


def test_restore_missing_veridian(db_session):
    project, created = restore_veridian(db_session)

    assert created is True
    assert project.slug == "veridian-aqi"
    assert project.content
    assert len(project.components) == 3
    assert len(project.metrics) == 3


def test_restore_veridian_is_idempotent(db_session):
    first, first_created = restore_veridian(db_session)
    first_id = first.id

    second, second_created = restore_veridian(db_session)

    count = (
        db_session.query(Project)
        .filter(Project.slug == "veridian-aqi")
        .count()
    )

    assert first_created is True
    assert second_created is False
    assert first_id == second.id
    assert count == 1


def test_restore_preserves_other_projects(db_session):
    unrelated = build_veridian_project()

    unrelated.slug = "restore-veridian-control"
    unrelated.title = "Restoration Control Project"

    db_session.add(unrelated)
    db_session.flush()

    original_id = unrelated.id

    restore_veridian(db_session)

    preserved = db_session.get(Project, original_id)

    assert preserved is not None
    assert preserved.slug == "restore-veridian-control"
    assert len(preserved.components) == 3
    assert len(preserved.metrics) == 3
