from decimal import Decimal
from uuid import uuid4

from app.database.base import Base
from app.database.session import SessionLocal, engine
from app.models.customer import Customer
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.product import Product


def seed_database() -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        if db.query(Product).count() > 0:
            return
        products = [
            Product(name="Wireless Mouse", sku="WM-001", price=Decimal("25.00"), quantity_in_stock=100),
            Product(name="USB Keyboard", sku="KB-001", price=Decimal("45.00"), quantity_in_stock=75),
            Product(name="Monitor 24 inch", sku="MN-024", price=Decimal("180.00"), quantity_in_stock=20),
            Product(name="Laptop Stand", sku="LS-010", price=Decimal("35.00"), quantity_in_stock=12),
        ]
        customers = [
            Customer(full_name="Alice Johnson", email="alice@example.com", phone="+1-555-0101"),
            Customer(full_name="Bob Smith", email="bob@example.com", phone="+1-555-0102"),
        ]
        db.add_all(products + customers)
        db.commit()

        order = Order(customer_id=customers[0].id, total_amount=Decimal("95.00"), status=OrderStatus.CONFIRMED.value)
        db.add(order)
        db.flush()
        db.add_all(
            [
                OrderItem(order_id=order.id, product_id=products[0].id, quantity=2, unit_price=Decimal("25.00"), subtotal=Decimal("50.00")),
                OrderItem(order_id=order.id, product_id=products[1].id, quantity=1, unit_price=Decimal("45.00"), subtotal=Decimal("45.00")),
            ]
        )
        products[0].quantity_in_stock -= 2
        products[1].quantity_in_stock -= 1
        db.commit()
    finally:
        db.close()


if __name__ == "__main__":
    seed_database()
