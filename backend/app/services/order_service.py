from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from app.core.exceptions import InsufficientInventoryError, NotFoundError
from app.models.customer import Customer
from app.models.order import Order, OrderStatus
from app.models.order_item import OrderItem
from app.models.product import Product
from app.schemas.common import PaginationMeta
from app.schemas.order import OrderCreate, OrderCustomerRead, OrderItemRead, OrderListResponse, OrderRead


class OrderService:
    @staticmethod
    def create_order(db: Session, payload: OrderCreate) -> OrderRead:
        customer = db.get(Customer, payload.customer_id)
        if not customer:
            raise NotFoundError("Customer not found")

        if not payload.items:
            raise InsufficientInventoryError()

        order_items_payload: list[tuple[Product, int, Decimal, Decimal]] = []
        total_amount = Decimal("0.00")

        try:
            for item in payload.items:
                product = db.execute(
                    select(Product).where(Product.id == item.product_id).with_for_update()
                ).scalar_one_or_none()
                if not product:
                    raise NotFoundError("Product not found")
                if product.quantity_in_stock < item.quantity:
                    raise InsufficientInventoryError()

                unit_price = Decimal(str(product.price))
                subtotal = unit_price * item.quantity
                product.quantity_in_stock -= item.quantity
                total_amount += subtotal
                order_items_payload.append((product, item.quantity, unit_price, subtotal))

            order = Order(customer_id=customer.id, total_amount=total_amount, status=OrderStatus.CONFIRMED.value)
            db.add(order)
            db.flush()

            for product, quantity, unit_price, subtotal in order_items_payload:
                db.add(
                    OrderItem(
                        order_id=order.id,
                        product_id=product.id,
                        quantity=quantity,
                        unit_price=unit_price,
                        subtotal=subtotal,
                    )
                )

            db.commit()
            db.refresh(order)
            return OrderService.get_order(db, order.id)
        except Exception:
            db.rollback()
            raise

    @staticmethod
    def list_orders(db: Session, page: int = 1, page_size: int = 20) -> OrderListResponse:
        count_query = select(func.count()).select_from(Order)
        total = db.scalar(count_query) or 0
        orders = (
            db.execute(
                select(Order)
                .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
                .order_by(Order.created_at.desc())
                .offset((page - 1) * page_size)
                .limit(page_size)
            )
            .unique()
            .scalars()
            .all()
        )
        return OrderListResponse(items=[OrderService._to_schema(order) for order in orders], meta=PaginationMeta(page=page, page_size=page_size, total=total))

    @staticmethod
    def get_order(db: Session, order_id) -> OrderRead:
        order = (
            db.execute(
                select(Order)
                .options(joinedload(Order.customer), joinedload(Order.items).joinedload(OrderItem.product))
                .where(Order.id == order_id)
            )
            .unique()
            .scalar_one_or_none()
        )
        if not order:
            raise NotFoundError("Order not found")
        return OrderService._to_schema(order)

    @staticmethod
    def delete_order(db: Session, order_id) -> None:
        order = (
            db.execute(
                select(Order)
                .options(joinedload(Order.items).joinedload(OrderItem.product))
                .where(Order.id == order_id)
            )
            .unique()
            .scalar_one_or_none()
        )
        if not order:
            raise NotFoundError("Order not found")

        try:
            for item in order.items:
                item.product.quantity_in_stock += item.quantity
            db.delete(order)
            db.commit()
        except Exception:
            db.rollback()
            raise

    @staticmethod
    def _to_schema(order: Order) -> OrderRead:
        return OrderRead(
            id=order.id,
            customer_id=order.customer_id,
            customer=OrderCustomerRead(
                id=order.customer.id,
                full_name=order.customer.full_name,
                email=order.customer.email,
                phone=order.customer.phone,
            ),
            total_amount=order.total_amount,
            status=order.status,
            created_at=order.created_at,
            items=[
                OrderItemRead(
                    id=item.id,
                    product_id=item.product_id,
                    product_name=item.product.name,
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    subtotal=item.subtotal,
                )
                for item in order.items
            ],
        )
