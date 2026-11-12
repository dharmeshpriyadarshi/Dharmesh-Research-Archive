
# tests/conftest.py
import os

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.engine import make_url
from sqlalchemy.orm import sessionmaker

from main import app
from api.deps import get_db


# Prefer the explicit local test URL; GitHub Actions supplies DATABASE_URL.
database_url = (
    os.getenv("TEST_DATABASE_URL")
    or os.getenv("DATABASE_URL")
)

if not database_url:
    raise RuntimeError("A test database URL must be configured.")

# Prevent accidentally running tests against the development database.
database_name = make_url(database_url).database or ""
if "test" not in database_name.lower():
    raise RuntimeError(
        f"Refusing to run tests against non-test database: {database_name}"
    )

engine = create_engine(database_url, pool_pre_ping=True)

TestingSessionLocal = sessionmaker(
    bind=engine,
    autocommit=False,
    autoflush=False,
    join_transaction_mode="create_savepoint",
)


@pytest.fixture(scope="function")
def db_session():
    """Provide a session isolated by an outer transaction."""
    connection = engine.connect()
    transaction = connection.begin()

    db = TestingSessionLocal(bind=connection)

    try:
        yield db
    finally:
        db.close()
        transaction.rollback()
        connection.close()


@pytest.fixture(scope="function")
def client(db_session):
    """Override the API database dependency with the test session."""

    def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    try:
        with TestClient(app) as test_client:
            yield test_client
    finally:
        app.dependency_overrides.pop(get_db, None)
