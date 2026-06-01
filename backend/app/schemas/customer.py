from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field, constr

from app.schemas.common import ORMModel, PaginationMeta


class CustomerBase(BaseModel):
    full_name: constr(min_length=1, max_length=255)
    email: EmailStr
    phone: constr(min_length=1, max_length=50)


class CustomerCreate(CustomerBase):
    pass


class CustomerRead(ORMModel):
    id: UUID
    full_name: str
    email: str
    phone: str
    created_at: datetime


class CustomerListResponse(BaseModel):
    items: list[CustomerRead]
    meta: PaginationMeta
