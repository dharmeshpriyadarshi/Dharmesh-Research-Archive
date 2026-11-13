
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
    seed_slugs = ["dialect-align", "on-top-of-spotify", "veridian-aqi"]

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
        content="""
## Experimental Methodology

DialectAlign is a low-resource NLP workflow prototype for classifying short civic grievances in Bhojpuri and Maithili. The current dataset is a seven-record synthetic sample used to validate the preprocessing and classification workflow. It is not a representative CPGRAMS dataset.

### Exploratory Data Analysis

The verified sample contains seven records across three grievance categories:

| Category | Records | Share |
|---|---:|---:|
| Infrastructure | 3 | 42.857% |
| Utility | 3 | 42.857% |
| Sanitation | 1 | 14.286% |
| **Total** | **7** | **100%** |

The 95th-percentile grievance length in the recorded pilot metrics is 3.7 words. Given the small synthetic sample, this should be interpreted as a descriptive pilot statistic rather than a population-level estimate.

### Preprocessing and Label Encoding

The `TextNormalizer` was applied to both training and test text. The dataset was split into five training records and two test records.

The `LabelEncoder` was fitted only on the training labels, preventing the test labels from influencing label mapping. The resulting class mapping was:

- Infrastructure → 0
- Sanitation → 1
- Utility → 2

The encoded test labels were `[0, 2]`.

### Class Imbalance and Evaluation Considerations

The sample is imbalanced, with Sanitation represented by only one record. This is too small a dataset for meaningful claims about model generalization or for drawing conclusions about real-world class prevalence.

Macro F1-score and per-class precision and recall are appropriate evaluation measures to consider as the dataset grows. Class weighting or resampling may be evaluated using training data only.

### Current Experimental Scope

The verified work establishes a preprocessing, splitting, and label-encoding workflow. TF-IDF feature extraction, model performance, and mitigation of class imbalance should be documented only after their implementation and results have been independently verified.
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
        content="""
## Backend Architecture

OnTopOfSpotify is a backend-focused project for aggregating Spotify data and managing application-owned playlist information.

### Authentication: OAuth 2.0

The authentication design uses Spotify's OAuth 2.0 Authorization Code flow.

1. The application initiates the authorization process.
2. A state value is used to protect the authorization flow against cross-site request forgery.
3. The state value is maintained using an HttpOnly cookie.
4. The authorization callback validates the returned state before proceeding with the token exchange.

### Security Considerations

The state-cookie mechanism protects the authorization callback from accepting an unsolicited or mismatched OAuth response. Access and refresh token handling must remain server-side; credentials must not be exposed to frontend code or committed to version control.

### Current Scope

The documented implementation covers the OAuth authorization-code flow and state-cookie CSRF protection. Further Spotify API integration, persistent token management, playlist synchronization, and database-backed user workflows should be documented as they are implemented and verified.
        """,
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


    print("Seeding Veridian...")

    veridian = Project(
        title="Veridian: Heterogeneous Stacking for AQI Forecasting",
        slug="veridian-aqi",
        abstract=(
            "A leakage-safe machine learning framework for city-level "
            "Air Quality Index forecasting across six Indian cities, "
            "comparing Bi-LSTM, Bi-GRU, and TCN ensembles against "
            "tree-based baselines."
        ),
        content="""
## Experimental Methodology

This study evaluates two heterogeneous stacked ensembles across six Indian cities: Delhi, Gurugram, Bengaluru, Chennai, Hyderabad, and Patna.

### Pipeline Architecture and Leakage Prevention

The forecasting pipeline integrates autoregressive, lag-based, and meteorological features into a 65-dimensional tabular representation, alongside a 14-step historical sequence tensor.

Chronological separation was enforced between training (N=5,203), validation (N=870), and held-out test (N=1,770) partitions. Out-of-fold predictions were generated temporally to train the Extra Trees meta-learner.

### Heterogeneous Stacking

Two architectures were evaluated:

1. SE-1: XGBoost + Bi-LSTM + TCN → Extra Trees
2. SE-2: XGBoost + Bi-GRU + TCN → Extra Trees

### Performance Analysis

The standalone XGBoost model outperformed both heterogeneous stacking architectures. This demonstrates that combining multiple model families does not automatically improve predictive performance.

RMSE penalizes larger prediction errors more heavily than MAE, making it useful for evaluating the impact of substantial AQI prediction errors.
        """,
        repository_url="https://github.com/dharmeshpriyadarshi/veridian-and-direction",
        status="Completed"
    )

    veridian.components = [
        TechComponent(category="Framework", name="PyTorch", version="latest"),
        TechComponent(category="Framework", name="XGBoost", version="latest"),
        TechComponent(category="Framework", name="Scikit-Learn", version="latest")
    ]

    veridian.metrics = [
        ProjectMetric(
            metric_type="Standalone_Benchmark",
            metric_data={"model": "XGBoost", "RMSE": 28.10, "R2": 0.9225, "MAE": 18.51}
        ),
        ProjectMetric(
            metric_type="SE1_Performance",
            metric_data={"model": "Bi-LSTM Stack", "RMSE": 30.81, "R2": 0.9068, "MAE": 21.79}
        ),
        ProjectMetric(
            metric_type="SE2_Performance",
            metric_data={"model": "Bi-GRU Stack", "RMSE": 42.53, "R2": 0.8224, "MAE": 34.60}
        )
    ]


    db.add_all([dialect_align, spotify_cms, veridian])
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
