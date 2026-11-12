
from db.models import Project, TechComponent, ProjectMetric


def test_health_check(client):
    """Ensure the API root health check is operational."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "operational"


def test_get_projects_collection_empty(client):
    """Verify the collection endpoint handles an empty database correctly."""
    response = client.get("/api/projects/")
    assert response.status_code == 200
    assert response.json() == []


def test_get_project_by_slug_valid(client, db_session):
    """Verify retrieval of a dynamically seeded project by its exact slug."""

    # Arrange: Seed deterministic test data.
    test_project = Project(
        title="Test Academic Artifact",
        slug="test-artifact",
        abstract="A rigorous test.",
        status="In Progress"
    )

    test_project.components = [
        TechComponent(category="Language", name="Python")
    ]

    test_project.metrics = [
        ProjectMetric(
            metric_type="Test",
            metric_data={"passed": True}
        )
    ]

    db_session.add(test_project)
    db_session.commit()

    # Act: Execute the API request.
    response = client.get("/api/projects/test-artifact")

    # Assert: Validate the complete response.
    assert response.status_code == 200

    data = response.json()
    assert data["slug"] == "test-artifact"
    assert data["title"] == "Test Academic Artifact"

    assert len(data["components"]) == 1
    assert data["components"][0]["name"] == "Python"

    assert len(data["metrics"]) == 1
    assert data["metrics"][0]["metric_data"]["passed"] is True


def test_get_project_by_slug_invalid(client):
    """Ensure correct 404 propagation for non-existent slugs."""
    response = client.get("/api/projects/this-slug-does-not-exist")
    assert response.status_code == 404
    assert response.json()["detail"] == "Project not found"
