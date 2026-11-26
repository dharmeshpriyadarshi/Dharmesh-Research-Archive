"""Seed the completed ECOSIMULATE project into LOCAL PostgreSQL only."""

import json
import os
from pathlib import Path

from sqlalchemy import create_engine, select, text
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from db.models import Project, ProjectMetric, TechComponent


METADATA = Path("scripts/data/ecosimulate_project.json")
EXPECTED_DATABASE = "dharmesh_archive"
EXPECTED_REVISION = "e6a91c2d4f70"


def seed() -> None:
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
            "Unsafe database target. Only local dharmesh_archive "
            "on port 5433 is permitted."
        )

    record = json.loads(METADATA.read_text(encoding="utf-8-sig"))
    engine = create_engine(database_url)

    try:
        with engine.connect() as conn:
            name = conn.scalar(text("SELECT current_database()"))
            revisions = conn.execute(
                text("SELECT version_num FROM alembic_version")
            ).scalars().all()

            if name != EXPECTED_DATABASE:
                raise RuntimeError("Unexpected PostgreSQL database.")

            if revisions != [EXPECTED_REVISION]:
                raise RuntimeError(
                    f"Unexpected Alembic revision: {revisions}"
                )

        with Session(engine) as session:
            existing = session.execute(
                select(Project).where(Project.slug == record["slug"])
            ).scalar_one_or_none()

            fields = (
                "title",
                "slug",
                "abstract",
                "content",
                "repository_url",
                "status",
            )

            if existing is not None:
                for field in fields:
                    if getattr(existing, field) != record[field]:
                        raise RuntimeError(
                            f"Existing ECOSIMULATE record differs: {field}. "
                            "No changes made."
                        )

                actual_components = sorted(
                    (c.name, c.category) for c in existing.components
                )
                desired_components = sorted(
                    (c["name"], c["category"])
                    for c in record["components"]
                )

                if actual_components != desired_components:
                    raise RuntimeError(
                        "Existing technical components differ."
                    )

                actual_metrics = sorted(
                    (
                        m.metric_type,
                        json.dumps(m.metric_data, sort_keys=True),
                    )
                    for m in existing.metrics
                )
                desired_metrics = sorted(
                    (
                        m["metric_type"],
                        json.dumps(m["metric_data"], sort_keys=True),
                    )
                    for m in record["metrics"]
                )

                if actual_metrics != desired_metrics:
                    raise RuntimeError(
                        "Existing project metrics differ."
                    )

                print(
                    "ECOSIMULATE already exists and matches metadata."
                )
                print(f"Project ID: {existing.id}")
                return

            project = Project(
                **{field: record[field] for field in fields}
            )

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
            session.commit()

            print("ECOSIMULATE project inserted successfully.")
            print(f"Project ID: {project.id}")
            print(f"Slug: {project.slug}")
            print(f"Status: {project.status}")
            print("No other projects or publications modified.")
    finally:
        engine.dispose()


if __name__ == "__main__":
    seed()
