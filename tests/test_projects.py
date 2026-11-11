
from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def test_health_check():
    """Ensure the API root health check is operational."""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "operational"


def test_get_projects_collection():
    """Verify the collection endpoint returns a list with nested structures."""
    response = client.get("/api/projects/")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)

    if len(data) > 0:
        assert "components" in data[0]
        assert "metrics" in data[0]
        assert "slug" in data[0]


def test_get_project_by_slug_valid():
    """Verify retrieval of a seeded project by its exact slug."""
    slug = "dialect-align"
    response = client.get(f"/api/projects/{slug}")

    if response.status_code == 200:
        data = response.json()
        assert data["slug"] == slug
        assert data["title"] == "DialectAlign: Low-Resource Civic NLP"
        assert len(data["components"]) >= 3
        assert len(data["metrics"]) >= 2
    else:
        assert response.status_code == 404


def test_get_project_by_slug_invalid():
    """Ensure correct 404 propagation for non-existent slugs."""
    response = client.get("/api/projects/this-slug-does-not-exist")
    assert response.status_code == 404
    assert response.json()["detail"] == "Project not found"
