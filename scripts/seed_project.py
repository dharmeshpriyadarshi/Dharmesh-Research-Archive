import argparse
from getpass import getpass
from pathlib import Path
from typing import Literal

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    model_validator,
)
from sqlalchemy import create_engine, select, text
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from db.models import Project, TechComponent


class ComponentRecord(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    name: str = Field(min_length=1, max_length=100)

    category: Literal[
        "Language",
        "Framework",
        "Database",
        "Infrastructure",
    ]

    version: str | None = Field(
        default=None,
        max_length=50,
    )


class ProjectRecord(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    title: str = Field(min_length=1, max_length=255)

    slug: str = Field(
        min_length=1,
        max_length=255,
        pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$",
    )

    abstract: str = Field(min_length=1)
    content: str = Field(min_length=1)

    status: Literal["Planned", "In Progress"]

    repository_url: HttpUrl | None = None

    components: list[ComponentRecord] = Field(
        default_factory=list
    )

    @model_validator(mode="after")
    def validate_components(self):
        if self.status == "Planned" and self.components:
            raise ValueError(
                "Planned projects cannot claim implemented technologies."
            )

        names = [
            item.name.casefold()
            for item in self.components
        ]

        if len(names) != len(set(names)):
            raise ValueError("Duplicate technical components.")

        return self


def insert_project(db: Session, record: ProjectRecord):
    statement = (
        insert(Project)
        .values(
            title=record.title,
            slug=record.slug,
            abstract=record.abstract,
            content=record.content,
            status=record.status,
            repository_url=(
                str(record.repository_url)
                if record.repository_url
                else None
            ),
        )
        .on_conflict_do_nothing(
            index_elements=[Project.slug]
        )
        .returning(Project.id)
    )

    project_id = db.execute(
        statement
    ).scalar_one_or_none()

    if project_id is None:
        existing = db.execute(
            select(Project).where(
                Project.slug == record.slug
            )
        ).scalar_one()

        return existing.id, False

    for item in record.components:
        db.add(
            TechComponent(
                project_id=project_id,
                **item.model_dump(),
            )
        )

    db.flush()

    return project_id, True


def get_database_url(target):
    if target == "local":
        from core.config import settings

        url = make_url(settings.DATABASE_URL)

        if (
            url.host not in {"localhost", "127.0.0.1", "::1"}
            or url.port != 5433
            or url.database != "dharmesh_archive"
        ):
            raise RuntimeError("Unsafe local database target.")

        return url

    url = make_url(
        getpass("Neon production database URL: ").strip()
    )

    if (
        not url.host
        or not url.host.endswith(".neon.tech")
        or url.database != "neondb"
    ):
        raise RuntimeError("Unexpected production target.")

    expected = f"{url.host}/{url.database}"

    if input(f"Confirm target [{expected}]: ") != expected:
        raise RuntimeError("Target confirmation failed.")

    return url.update_query_dict({"sslmode": "require"})


def main():
    parser = argparse.ArgumentParser(
        description="Safely insert a portfolio project."
    )

    parser.add_argument(
        "--target",
        choices=["local", "production"],
        required=True,
    )

    parser.add_argument(
        "--metadata",
        type=Path,
        required=True,
    )

    args = parser.parse_args()

    record = ProjectRecord.model_validate_json(
        args.metadata.read_text(encoding="utf-8-sig")
    )

    url = get_database_url(args.target)
    engine = create_engine(url, pool_pre_ping=True)

    try:
        with Session(engine) as db:
            with db.begin():
                database = db.scalar(
                    text("SELECT current_database()")
                )

                if database != url.database:
                    raise RuntimeError("Unexpected database.")

                project_id, created = insert_project(
                    db,
                    record,
                )

        print("Database:", database)
        print("Project:", record.slug)
        print("Project ID:", project_id)
        print("Status:", record.status)

        if created:
            print("Project inserted successfully.")
        else:
            print("Project already exists. No changes made.")

    finally:
        engine.dispose()


if __name__ == "__main__":
    main()
