from datetime import datetime
from decimal import Decimal
from uuid import UUID

from pydantic import BaseModel, conint

from app.schemas.common import ORMModel, PaginationMeta


class OrderItemCreate(BaseModel):
    product_id: UUID
    quantity: conint(gt=0)


class OrderCreate(BaseModel):
    customer_id: UUID
    items: list[OrderItemCreate]


class OrderItemRead(ORMModel):
    id: int
    product_id: UUID
    product_name: str
    quantity: int
    unit_price: Decimal
    subtotal: Decimal


class OrderCustomerRead(ORMModel):
    id: UUID
    full_name: str
    email: str
    phone: str


class OrderRead(ORMModel):
    id: UUID
    customer_id: UUID
    customer: OrderCustomerRead
    total_amount: Decimal
    status: str
    created_at: datetime
    items: list[OrderItemRead]


class OrderListResponse(BaseModel):
    items: list[OrderRead]
    meta: PaginationMeta
