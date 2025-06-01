from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app=app)

sample_jobs = [
    {
        "id": "job1",
        "latitude": 40.7128,
        "longitude": -74.0060,
        "priority": "high",
        "estimated_time": 15
    },
    {
        "id": "job2",
        "latitude": 40.7306,
        "longitude": -73.9352,
        "priority": "medium",
        "estimated_time": 10
    }
]

def test_optimize():
    response = client.post("/optimize", json=sample_jobs)
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    assert len(data) == len(sample_jobs)