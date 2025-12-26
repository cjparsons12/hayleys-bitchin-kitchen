import os

# Override DATABASE_URL for tests
os.environ["DATABASE_URL"] = "sqlite:///./test.db"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import models
from database import Base, get_db
from main import app

# Test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base.metadata.create_all(bind=engine)

def override_get_db():
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()

app.dependency_overrides[get_db] = override_get_db

client = TestClient(app)

@pytest.fixture(scope="module", autouse=True)
def setup_database():
    # Create tables
    Base.metadata.create_all(bind=engine)
    yield
    # Drop tables
    Base.metadata.drop_all(bind=engine)

def test_create_recipe():
    response = client.post("/recipes", json={"title": "Test Recipe", "description": "Test description"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "Test Recipe"
    assert data["description"] == "Test description"
    assert "id" in data

def test_get_recipes():
    # Create a recipe first
    client.post("/recipes", json={"link": "http://example.com"})
    response = client.get("/recipes")
    assert response.status_code == 200
    data = response.json()
    assert len(data) >= 1

def test_get_recipe():
    # Create a recipe
    create_response = client.post("/recipes", json={"title": "Another Recipe"})
    recipe_id = create_response.json()["id"]
    response = client.get(f"/recipes/{recipe_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == recipe_id

def test_get_recipe_not_found():
    response = client.get("/recipes/999")
    assert response.status_code == 404

def test_update_recipe():
    # Create a recipe
    create_response = client.post("/recipes", json={"title": "Old Title"})
    recipe_id = create_response.json()["id"]
    response = client.put(f"/recipes/{recipe_id}", json={"title": "New Title"})
    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New Title"

def test_delete_recipe():
    # Create a recipe
    create_response = client.post("/recipes", json={"title": "To Delete"})
    recipe_id = create_response.json()["id"]
    response = client.delete(f"/recipes/{recipe_id}")
    assert response.status_code == 200
    # Check it's gone
    get_response = client.get(f"/recipes/{recipe_id}")
    assert get_response.status_code == 404