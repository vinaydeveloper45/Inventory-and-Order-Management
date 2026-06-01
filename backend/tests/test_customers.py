def test_create_customer(client):
    response = client.post(
        "/api/customers",
        json={"full_name": "Jane Doe", "email": "jane@example.com", "phone": "+1-555-1234"},
    )
    assert response.status_code == 201
    body = response.json()
    assert body["email"] == "jane@example.com"


def test_duplicate_email(client):
    client.post(
        "/api/customers",
        json={"full_name": "Jane Doe", "email": "jane@example.com", "phone": "+1-555-1234"},
    )
    response = client.post(
        "/api/customers",
        json={"full_name": "Jane Smith", "email": "jane@example.com", "phone": "+1-555-9999"},
    )
    assert response.status_code == 409
    assert response.json()["message"] == "Email already exists"
