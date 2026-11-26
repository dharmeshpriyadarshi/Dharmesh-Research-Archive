"""Safely seed Brackets and DigitalTwin into local PostgreSQL."""

import json
import os
from datetime import datetime, timezone
from pathlib import Path

from sqlalchemy import create_engine, select, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session, selectinload

from db.models import Project, ProjectMetric, TechComponent


METADATA = Path("scripts/data/personal_projects.json")
EXPECTED_DATABASE = "dharmesh_archive"
EXPECTED_REVISION = "e6a91c2d4f70"
EXPECTED_SLUGS = {"brackets", "digital-twin"}

FIELDS = (
    "title",
    "slug",
    "abstract",
    "content",
    "repository_url",
    "status",
)


def load_metadata():
    records = json.loads(
        METADATA.read_text(encoding="utf-8-sig")
    )

    if not isinstance(records, list) or len(records) != 2:
        raise RuntimeError("Expected exactly two project records.")

    slugs = {record["slug"] for record in records}

    if slugs != EXPECTED_SLUGS:
        raise RuntimeError("Unexpected project slugs.")

    if records[0]["slug"] != "brackets":
        raise RuntimeError("Brackets must be the first record.")

    for record in records:
        for field in FIELDS:
            if field not in record:
                raise RuntimeError(
                    f"Missing field {field}: {record['slug']}"
                )

        if not isinstance(record["components"], list):
            raise RuntimeError("Invalid technical components.")

        if not isinstance(record["metrics"], list):
            raise RuntimeError("Invalid metrics.")

    brackets = records[0]
    digital_twin = records[1]

    if brackets["status"] != "In Progress":
        raise RuntimeError("Unexpected Brackets status.")

    if digital_twin["status"] != "Planned":
        raise RuntimeError("Unexpected DigitalTwin status.")

    if (
        digital_twin["components"]
        or digital_twin["metrics"]
        or digital_twin["repository_url"] is not None
    ):
        raise RuntimeError(
            "Planned DigitalTwin must not claim implementations."
        )

    valid_categories = {
        "Language",
        "Framework",
        "Infrastructure",
        "Database",
    }

    for record in records:
        for component in record["components"]:
            if component["category"] not in valid_categories:
                raise RuntimeError(
                    f"Unexpected component category: {component}"
                )

    return records


def verify_existing(project, record):
    for field in FIELDS:
        actual = getattr(project, field)
        expected = record[field]

        if actual != expected:
            raise RuntimeError(
                f"Existing {record['slug']} differs at {field}. "
                "No changes made."
            )

    actual_components = sorted(
        (item.name, item.category)
        for item in project.components
    )

    expected_components = sorted(
        (item["name"], item["category"])
        for item in record["components"]
    )

    if actual_components != expected_components:
        raise RuntimeError(
            f"Component mismatch: {record['slug']}"
        )

    actual_metrics = sorted(
        (
            item.metric_type,
            json.dumps(item.metric_data, sort_keys=True),
        )
        for item in project.metrics
    )

    expected_metrics = sorted(
        (
            item["metric_type"],
            json.dumps(item["metric_data"], sort_keys=True),
        )
        for item in record["metrics"]
    )

    if actual_metrics != expected_metrics:
        raise RuntimeError(
            f"Metric mismatch: {record['slug']}"
        )

    if project.created_at is None or project.updated_at is None:
        raise RuntimeError(
            f"Missing timestamps: {record['slug']}"
        )


def seed():
    database_url = os.environ.get("DATABASE_URL")

    if not database_url:
        raise RuntimeError("DATABASE_URL is required.")

    url = make_url(database_url)

    if (
        url.host not in ("localhost", "127.0.0.1")
        or url.port != 5433
        or url.database != EXPECTED_DATABASE
    ):
        raise RuntimeError(
            "Only localhost:5433/dharmesh_archive is permitted."
        )

    records = load_metadata()

    engine = create_engine(database_url)

    try:
        with engine.connect() as connection:
            database_name = connection.scalar(
                text("SELECT current_database()")
            )

            revisions = connection.execute(
                text("SELECT version_num FROM alembic_version")
            ).scalars().all()

            if database_name != EXPECTED_DATABASE:
                raise RuntimeError("Unexpected database name.")

            if revisions != [EXPECTED_REVISION]:
                raise RuntimeError(
                    f"Unexpected Alembic revision: {revisions}"
                )

        with Session(engine) as session:
            existing = session.execute(
                select(Project)
                .options(
                    selectinload(Project.components),
                    selectinload(Project.metrics),
                )
                .where(Project.slug.in_(EXPECTED_SLUGS))
            ).scalars().all()

            by_slug = {
                project.slug: project for project in existing
            }

            # Validate existing records before inserting either one.
            for record in records:
                project = by_slug.get(record["slug"])

                if project is not None:
                    verify_existing(project, record)

            inserted = []

            for record in records:
                if record["slug"] in by_slug:
                    continue

                fields = {
                    field: record[field] for field in FIELDS
                }

                project = Project(**fields)

                # Explicit timestamps prevent response validation errors.
                now = datetime.now(timezone.utc)
                project.created_at = now
                project.updated_at = now

                project.components = [
                    TechComponent(
                        name=item["name"],
                        category=item["category"],
                    )
                    for item in record["components"]
                ]

                project.metrics = [
                    ProjectMetric(
                        metric_type=item["metric_type"],
                        metric_data=item["metric_data"],
                    )
                    for item in record["metrics"]
                ]

                session.add(project)
                inserted.append(record["slug"])

            # Both new projects are committed together.
            session.commit()

            print("Inserted:", inserted if inserted else "none")

            for record in records:
                project = session.execute(
                    select(Project).where(
                        Project.slug == record["slug"]
                    )
                ).scalar_one()

                print(
                    f"{project.slug}: "
                    f"{project.status} | ID: {project.id}"
                )

            print("Seeder verification successful.")
            print("Other projects and publications unchanged.")
    finally:
        engine.dispose()


if __name__ == "__main__":
    seed()
