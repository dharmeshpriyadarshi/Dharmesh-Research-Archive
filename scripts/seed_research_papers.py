
import argparse
from datetime import datetime
from getpass import getpass
from pathlib import Path
from uuid import UUID, uuid4

from pydantic import (
    BaseModel,
    ConfigDict,
    Field,
    HttpUrl,
    field_validator,
)
from sqlalchemy import create_engine
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.engine import make_url
from sqlalchemy.orm import Session

from db.models import ResearchPaper


ECOSIMULATE_SLUG = "ecosimulate-research-paper"


class PublicationRecord(BaseModel):
    model_config = ConfigDict(
        extra="forbid",
        str_strip_whitespace=True,
    )

    title: str = Field(min_length=1, max_length=255)
    abstract: str = Field(min_length=1)
    journal_or_conference: str | None = Field(
        default=None, max_length=255
    )
    publication_date: datetime | None = None
    pdf_url: HttpUrl | None = None
    doi: str | None = Field(default=None, max_length=100)

    @field_validator("publication_date")
    @classmethod
    def validate_timezone(cls, value):
        if value is not None and value.utcoffset() is None:
            raise ValueError(
                "Publication date must include a timezone."
            )
        return value


def seed_ecosimulate_paper(
    db: Session,
    record: PublicationRecord,
) -> UUID:
    """Insert or update the publication without changing its identity."""

    values = record.model_dump(mode="json")

    # Preserve the datetime object for PostgreSQL.
    values["publication_date"] = record.publication_date

    statement = insert(ResearchPaper).values(
        id=uuid4(),
        slug=ECOSIMULATE_SLUG,
        **values,
    )

    statement = statement.on_conflict_do_update(
        index_elements=[ResearchPaper.slug],
        set_={
            field: getattr(statement.excluded, field)
            for field in values
        },
    ).returning(ResearchPaper.id)

    return db.execute(statement).scalar_one()


def resolve_database_url(target: str):
    if target == "local":
        from core.config import settings

        url = make_url(settings.DATABASE_URL)

        if (
            url.host not in {"localhost", "127.0.0.1", "::1"}
            or url.port != 5433
            or url.database != "dharmesh_archive"
        ):
            raise RuntimeError(
                "Local seeding requires dharmesh_archive "
                "on localhost port 5433."
            )

        return url

    url = make_url(
        getpass("Neon production database URL: ").strip()
    )

    if (
        not url.host
        or not url.host.endswith(".neon.tech")
        or not url.database
        or "test" in url.database.lower()
    ):
        raise RuntimeError("Invalid production database target.")

    target_name = f"{url.host}/{url.database}"

    if input(f"Confirm target [{target_name}]: ") != target_name:
        raise RuntimeError("Target confirmation failed.")

    return url.update_query_dict({"sslmode": "require"})


def main():
    parser = argparse.ArgumentParser(
        description="Seed the ECOSIMULATE research publication."
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

    record = PublicationRecord.model_validate_json(
        args.metadata.read_text(encoding="utf-8-sig")
    )

    database_url = resolve_database_url(args.target)

    engine = create_engine(
        database_url,
        pool_pre_ping=True,
    )

    try:
        with Session(engine) as db:
            with db.begin():
                paper_id = seed_ecosimulate_paper(db, record)

        print("Publication seeded successfully.")
        print(f"Publication ID: {paper_id}")
        print(f"Slug: {ECOSIMULATE_SLUG}")
        print(f"Target: {args.target}")

    finally:
        engine.dispose()


if __name__ == "__main__":
    main()

