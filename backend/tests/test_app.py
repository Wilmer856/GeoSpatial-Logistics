from app.main import app
from fastapi.testclient import TestClient

client = TestClient(app=app)

def test_main_app():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"hello": "World"}