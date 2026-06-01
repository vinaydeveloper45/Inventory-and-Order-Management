def test_create_product(client):
    response = client.post(
        "/api/products",
        json={"name": "Laptop", "sku": "LP-001", "price": "999.99", "quantity_in_stock": 10},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["sku"] == "LP-001"
    assert body["quantity_in_stock"] == 10


def test_duplicate_sku(client):
    client.post(
        "/api/products",
        json={"name": "Monitor", "sku": "MN-001", "price": "199.99", "quantity_in_stock": 5},
    )
    response = client.post(
        "/api/products",
        json={"name": "Monitor 2", "sku": "MN-001", "price": "299.99", "quantity_in_stock": 2},
    )
    assert response.status_code == 409
    assert response.json()["message"] == "SKU already exists"
