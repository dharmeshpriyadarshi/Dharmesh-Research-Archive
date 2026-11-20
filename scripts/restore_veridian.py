import os
from getpass import getpass

from sqlalchemy import create_engine, text
from sqlalchemy.engine import URL
from sqlalchemy.orm import Session


def main():
    username = input(
        "Local PostgreSQL username (default: postgres): "
    ).strip() or "postgres"

    password = getpass("Local PostgreSQL password: ")

    url = URL.create(
        drivername="postgresql",
        username=username,
        password=password,
        host="localhost",
        port=5433,
        database="dharmesh_archive",
    )

    os.environ["DATABASE_URL"] = url.render_as_string(
        hide_password=False
    )

    from scripts.seed_portfolio import restore_veridian

    engine = create_engine(url, pool_pre_ping=True)

    try:
        with Session(engine) as db:
            with db.begin():
                database = db.scalar(
                    text("SELECT current_database()")
                )

                if database != "dharmesh_archive":
                    raise RuntimeError("Unsafe database target.")

                revisions = db.execute(
                    text("SELECT version_num FROM alembic_version")
                ).scalars().all()

                if revisions != ["2ad9595a382a"]:
                    raise RuntimeError("Unexpected migration revision.")

                project, created = restore_veridian(db)
                project_id = str(project.id)

                component_count = len(project.components)
                metric_count = len(project.metrics)

        print("Database: dharmesh_archive")
        print("Project: Veridian")
        print("Project ID:", project_id)
        print("Components:", component_count)
        print("Metrics:", metric_count)

        if created:
            print("Veridian restored successfully.")
        else:
            print("Veridian already exists. No changes made.")

    finally:
        engine.dispose()


if __name__ == "__main__":
    main()
