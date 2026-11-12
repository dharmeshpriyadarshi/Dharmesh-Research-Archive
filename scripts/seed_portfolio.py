
import sys
import os

sys.path.append(
    os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
)

from sqlalchemy.orm import Session
from api.deps import SessionLocal
from db.models import Project, TechComponent, ProjectMetric


def seed_database(db: Session):
    # Remove only the projects managed by this seed script.
    # ORM delete operations also apply the configured relationship cascades.
    seed_slugs = ["dialect-align", "on-top-of-spotify"]

    existing_projects = (
        db.query(Project)
        .filter(Project.slug.in_(seed_slugs))
        .all()
    )

    for project in existing_projects:
        db.delete(project)

    # Execute pending deletions before inserting replacement projects.
    db.flush()

    print("Seeding DialectAlign...")


    dialect_align = Project(
        title="DialectAlign: Low-Resource Civic NLP",
        slug="dialect-align",
        abstract=(
            "A cross-lingual NLP civic grievance triage system for "
            "Bhojpuri and Maithili dialects. Features PII redaction "
            "protocols, Devanagari text normalization, and lexical standardizers."
        ),
        content=r"""
## Methodology

DialectAlign investigates cross-lingual civic grievance classification
for low-resource Bhojpuri and Maithili language varieties.

The preprocessing pipeline focuses on deterministic text normalization,
including Devanagari punctuation handling, lexical standardization, and
PII redaction protocols.

### Mathematical Foundation

Term Frequencyâ€“Inverse Document Frequency (TF-IDF) provides a numerical
representation of textual features by weighting terms according to
their frequency within a document and their distribution across the corpus.

The standard formulation is:

$$
\text{TF-IDF}(t,d) =
\text{TF}(t,d) \times
\log\left(\frac{N}{\text{DF}(t)}\right)
$$

Where:

- \(t\) represents a term.
- \(d\) represents a document.
- \(N\) represents the total number of documents.
- \(\text{DF}(t)\) represents the number of documents containing term \(t\).

### Data Analysis and Evaluation

Exploratory data analysis examines the distribution of civic grievance
categories, including infrastructure, utilities, and sanitation.

The evaluation protocol uses an 80/20 training and testing partition
to separate model development from evaluation.

The implementation also includes unit tests for validating core
preprocessing and utility functions.
""",
        repository_url="https://github.com/dharmeshpriyadarshi/DialectAlign",
        status="In Progress"
    )


    dialect_align.components = [
        TechComponent(category="Language", name="Python", version="3.11.9"),
        TechComponent(category="Framework", name="Scikit-Learn", version="latest"),
        TechComponent(category="Framework", name="Pandas", version="latest")
    ]

    dialect_align.metrics = [
        ProjectMetric(
            metric_type="EDA_Distribution",
            metric_data={
                "Infrastructure": 42.857,
                "Utility": 42.857,
                "Sanitation": 14.286,
                "95th_percentile_length_words": 3.7
            }
        ),
        ProjectMetric(
            metric_type="Unit_Testing",
            metric_data={"passed": 8, "failed": 0, "coverage": "100%"}
        )
    ]

    print("Seeding OnTopOfSpotify...")

    spotify_cms = Project(
        title="OnTopOfSpotify: RBAC Digital Rooms",
        slug="on-top-of-spotify",
        abstract=(
            "A FastAPI and PostgreSQL web application extending Spotify "
            "functionality by constructing interactive personalized digital "
            "rooms utilizing OAuth 2.0 authorization code flows."
        ),
        repository_url="https://github.com/dharmeshpriyadarshi/ontopofspotify",
        status="In Progress"
    )

    spotify_cms.components = [
        TechComponent(category="Framework", name="FastAPI", version="latest"),
        TechComponent(category="Database", name="PostgreSQL", version="18.6"),
        TechComponent(category="Infrastructure", name="Alembic", version="latest")
    ]

    spotify_cms.metrics = [
        ProjectMetric(
            metric_type="Security",
            metric_data={
                "auth_flow": "OAuth 2.0",
                "csrf_protection": "HttpOnly State Cookies"
            }
        )
    ]

    db.add_all([dialect_align, spotify_cms])
    db.commit()

    print("Database seeding completed successfully.")


if __name__ == "__main__":
    db = SessionLocal()

    try:
        seed_database(db)
    except Exception:
        db.rollback()
        raise
    finally:
        db.close()
