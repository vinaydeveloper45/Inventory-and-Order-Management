from uuid import UUID

from fastapi import APIRouter, Depends, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.schemas.common import MessageResponse
from app.schemas.order import OrderCreate, OrderListResponse, OrderRead
from app.services.order_service import OrderService

router = APIRouter(prefix="/orders", tags=["Orders"])


@router.post("", response_model=OrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: OrderCreate, db: Session = Depends(get_db)):
    return OrderService.create_order(db, payload)


@router.get("", response_model=OrderListResponse)
def list_orders(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
):
    return OrderService.list_orders(db, page=page, page_size=page_size)


@router.get("/{order_id}", response_model=OrderRead)
def get_order(order_id: UUID, db: Session = Depends(get_db)):
    return OrderService.get_order(db, order_id)


@router.delete("/{order_id}", response_model=MessageResponse)
def delete_order(order_id: UUID, db: Session = Depends(get_db)):
    OrderService.delete_order(db, order_id)
    return MessageResponse(message="Order deleted successfully")
