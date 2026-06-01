def test_create_order_and_reduce_stock(client):
    customer = client.post(
        "/api/customers",
        json={"full_name": "Order Customer", "email": "order@example.com", "phone": "+1-555-0001"},
    ).json()
    product = client.post(
        "/api/products",
        json={"name": "Keyboard", "sku": "KB-100", "price": "50.00", "quantity_in_stock": 3},
    ).json()

    response = client.post(
        "/api/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 2}]},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["total_amount"] == "100.00"

    product_after = client.get(f"/api/products/{product['id']}").json()
    assert product_after["quantity_in_stock"] == 1


def test_insufficient_stock(client):
    customer = client.post(
        "/api/customers",
        json={"full_name": "Short Stock", "email": "stock@example.com", "phone": "+1-555-0002"},
    ).json()
    product = client.post(
        "/api/products",
        json={"name": "Mouse", "sku": "MS-100", "price": "25.00", "quantity_in_stock": 1},
    ).json()

    response = client.post(
        "/api/orders",
        json={"customer_id": customer["id"], "items": [{"product_id": product["id"], "quantity": 2}]},
    )
    assert response.status_code == 400
    assert response.json()["message"] == "Insufficient inventory"
