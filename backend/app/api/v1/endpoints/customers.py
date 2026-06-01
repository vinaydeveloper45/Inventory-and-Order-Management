from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.common import MessageResponse
from app.schemas.customer import CustomerCreate, CustomerListResponse, CustomerRead
from app.services.customer_service import CustomerService

router = APIRouter(prefix="/customers", tags=["Customers"])


@router.post("", response_model=CustomerRead, status_code=status.HTTP_201_CREATED)
def create_customer(payload: CustomerCreate, db: Session = Depends(get_db)):
    return CustomerService.create_customer(db, payload)


@router.get("", response_model=CustomerListResponse)
def list_customers(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    search: str | None = None,
):
    return CustomerService.list_customers(db, page=page, page_size=page_size, search=search)


@router.get("/{customer_id}", response_model=CustomerRead)
def get_customer(customer_id: UUID, db: Session = Depends(get_db)):
    return CustomerService.get_customer(db, customer_id)


@router.delete("/{customer_id}", response_model=MessageResponse)
def delete_customer(customer_id: UUID, db: Session = Depends(get_db)):
    CustomerService.delete_customer(db, customer_id)
    return MessageResponse(message="Customer deleted successfully")
