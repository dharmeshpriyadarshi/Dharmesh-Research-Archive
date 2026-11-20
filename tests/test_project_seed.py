import pytest

from pydantic import ValidationError

from db.models import Project
from scripts.seed_project import (
    ComponentRecord,
    ProjectRecord,
    insert_project,
)


def make_record(**overrides):
    values = {
        "title": "Planned Regression Test",
        "slug": "planned-regression-test",
        "abstract": "Synthetic integration test metadata.",
        "content": "## Test methodology",
        "status": "Planned",
    }

    values.update(overrides)

    return ProjectRecord(**values)


def test_insert_planned_project(db_session):
    project_id, created = insert_project(
        db_session,
        make_record(),
    )

    project = db_session.get(Project, project_id)

    assert created is True
    assert project.status == "Planned"
    assert project.components == []
    assert project.metrics == []


def test_project_seed_preserves_existing_record(db_session):
    first_id, first_created = insert_project(
        db_session,
        make_record(),
    )

    second_id, second_created = insert_project(
        db_session,
        make_record(title="Replacement Title"),
    )

    project = db_session.get(Project, second_id)

    assert first_created is True
    assert second_created is False
    assert first_id == second_id
    assert project.title == "Planned Regression Test"


def test_planned_project_rejects_implemented_components():
    with pytest.raises(ValidationError):
        make_record(
            components=[
                ComponentRecord(
                    name="Python",
                    category="Language",
                )
            ]
        )


def test_in_progress_project_accepts_components(db_session):
    record = make_record(
        slug="active-regression-test",
        status="In Progress",
        components=[
            ComponentRecord(
                name="Python",
                category="Language",
            )
        ],
    )

    project_id, created = insert_project(
        db_session,
        record,
    )

    project = db_session.get(Project, project_id)

    assert created is True
    assert project.status == "In Progress"
    assert len(project.components) == 1
    assert project.components[0].name == "Python"
