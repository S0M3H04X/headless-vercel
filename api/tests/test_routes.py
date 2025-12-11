import pytest
from fastapi.testclient import TestClient
from api.index import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "environment": "python-headless"}

def test_inventory_check_available():
    payload = {"sku": "test-sku-123"}
    response = client.post("/api/inventory/check", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert data["available"] is True
    assert data["quantity"] > 0

def test_inventory_check_unavailable():
    payload = {"sku": "out-of-stock-item"}
    response = client.post("/api/inventory/check", json=payload)
    assert response.status_code == 200
    assert response.json()["available"] is False