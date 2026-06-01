from decimal import Decimal
from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, Field, condecimal, conint, constr

from app.schemas.common import ORMModel, PaginationMeta


class ProductBase(BaseModel):
    name: constr(min_length=1, max_length=255)
    sku: constr(min_length=1, max_length=100)
    price: condecimal(gt=0, max_digits=12, decimal_places=2)
    quantity_in_stock: conint(ge=0)


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: constr(min_length=1, max_length=255) | None = None
    sku: constr(min_length=1, max_length=100) | None = None
    price: condecimal(gt=0, max_digits=12, decimal_places=2) | None = None
    quantity_in_stock: conint(ge=0) | None = None


class ProductRead(ORMModel):
    id: UUID
    name: str
    sku: str
    price: Decimal
    quantity_in_stock: int
    created_at: datetime
    updated_at: datetime


class ProductListResponse(BaseModel):
    items: list[ProductRead]
    meta: PaginationMeta
